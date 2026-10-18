"""Stingers: stage clear fanfare, gentle fail phrase, evolve transformation fanfare."""
import os

import numpy as np

from common import BUILD_DIR, OUT_DIR, SR, db2lin, encode_mp3, ffmpeg_ebur128, fade, lufs_integrated, remove_dc, \
    true_peak_db, write_wav
from music_lib import Mix, Song, limiter


def _finish(song, settings, mixp, length_s, fade_s, target=-16.0):
    stems = song.render_stems()
    y = Mix(song, stems, settings, master_lufs=target, comp=False, auto_eq=False,
            ceiling_db=-2.0, **mixp).run()
    n = int(length_s * SR)
    y = y[:n]
    fo = int(fade_s * SR)
    y[-fo:] *= (np.cos(np.linspace(0, np.pi / 2, fo)) ** 2)[:, None]
    # trim leading silence
    a = np.max(np.abs(y), axis=1)
    first = int(np.argmax(a > db2lin(-50) * a.max()))
    y = y[max(0, first - int(0.002 * SR)):]
    y = remove_dc(y)
    y = fade(y, 2.0, 5.0)
    y *= db2lin(target - lufs_integrated(y))
    if true_peak_db(y) > -2.0:
        y = limiter(y, ceiling_db=-2.3, release_ms=50)
        y *= db2lin(min(0.0, target - lufs_integrated(y)))
    return y


def stinger_clear():
    """C major fanfare: triplet pickup -> IV -> V -> big tonic with harp, glock sparkle, timpani."""
    s = Song("stinger_clear", 132, bars=2, loop=False, tail_s=3.0)
    tp = s.track("trumpet", 56, pan=0.05, humanize_ms=3, vel_jitter=3)
    tp.seq(0, "g4t c5t e5t g5q a5e b5e c6h.", v=92, gate=0.92)
    br = s.track("brass", 61, pan=-0.2, humanize_ms=3, vel_jitter=3)
    br.chord(1.0, 0.9, ["e4", "g4", "c5"], 84)
    br.chord(2.0, 0.45, ["f4", "a4", "c5"], 80)
    br.chord(2.5, 0.45, ["g4", "b4", "d5"], 84)
    br.chord(3.0, 3.0, ["e4", "g4", "c5", "e5"], 96)
    st = s.track("strings", 48, pan=0.25, humanize_ms=2)
    st.chord(1.0, 1.0, ["c4", "e4", "g4"], 70)
    st.chord(2.0, 0.5, ["c4", "f4", "a4"], 70)
    st.chord(2.5, 0.5, ["d4", "g4", "b4"], 74)
    st.chord(3.0, 3.2, ["c4", "g4", "c5", "e5", "g5"], 90)
    bs = s.track("bass", 32, humanize_ms=2)
    for t, p, d in ((1.0, "c3", 1.0), (2.0, "f2", 0.5), (2.5, "g2", 0.5), (3.0, "c3", 2.5)):
        bs.note(t, d, p, 90)
    hp = s.track("harp", 46, pan=0.3, humanize_ms=1)
    scale = ["c4", "d4", "e4", "g4", "a4", "c5", "d5", "e5", "g5", "a5", "c6", "d6", "e6", "g6"]
    for i, p in enumerate(scale):
        hp.note(2.0 + i * (1.0 / len(scale)), 2.0, p, 60 + i * 2)
    gl = s.track("glock", 9, pan=0.4, humanize_ms=1)
    for i, p in enumerate(["c6", "e6", "g6", "c7", "g6", "c7"]):
        gl.note(3.0 + i * 0.25, 1.5, p, 70 - i * 3)
    mb = s.track("marimba", 12, pan=-0.35, humanize_ms=2)
    mb.seq(0, "g4t c5t e5t g5q a5e b5e c6q", v=80, gate=0.9)
    dr = s.track("drums", 48, drum=True, humanize_ms=2)  # orchestra kit
    for i in range(6):
        dr.note(2.0 + i * (1 / 6), 0.1, 41, 50 + i * 8)  # timpani-ish roll (low tom in orch kit)
    dr.note(3.0, 2.0, 49, 84)
    dr.note(3.0, 1.0, 36, 100)
    tm = s.track("timpani", 47, humanize_ms=1)
    tm.note(1.0, 0.5, "c2", 80)
    for i in range(8):
        tm.note(2.0 + i * 0.125, 0.12, "g2", 54 + i * 6)
    tm.note(3.0, 1.5, "c2", 112)
    settings = {
        "trumpet": dict(level=0.0, hpf=250, rev=0.3, high_shelf=(5500, -3.0)),
        "brass": dict(level=-3.0, hpf=150, rev=0.3, high_shelf=(5000, -3.0)),
        "strings": dict(level=-5.0, hpf=150, rev=0.35),
        "bass": dict(level=-12.0, hpf=50, lpf=2000, rev=0.05),
        "harp": dict(level=-6.0, hpf=200, rev=0.4),
        "glock": dict(level=-9.0, hpf=700, rev=0.4, high_shelf=(8000, -3.0)),
        "marimba": dict(level=-7.0, hpf=200, rev=0.3),
        "drums": dict(level=-9.0, hpf=50, rev=0.25, high_shelf=(8000, -3.0)),
        "timpani": dict(level=-9.0, hpf=50, rev=0.3),
    }
    return _finish(s, settings, dict(rev_rt60=1.6, rev_level_db=-4.0), 3.6, 0.9)


def stinger_fail():
    """Cute 'aww': g-f#-f-e over C - D7/C - Fm/C - C, clarinet sigh, then a hopeful glock ding."""
    s = Song("stinger_fail", 100, bars=2, loop=False, tail_s=3.0)
    cl = s.track("clarinet", 71, pan=0.0, humanize_ms=3, vel_jitter=3)
    cl.seq(0, "g5e f#5e f5e e5q.", v=80, gate=0.96)
    # little sigh: bend the last note down a touch, then back
    cl.bend(0.0, 0.0)
    cl.bend_ramp(2.0, 2.9, 0.0, -0.45, steps=10)
    cl.bend(3.2, 0.0)
    mb = s.track("marimba", 12, pan=0.3, humanize_ms=3)
    mb.seq(0, "g5e f#5e f5e e5q", v=70, gate=0.9)
    pz = s.track("pizz", 45, pan=-0.3, humanize_ms=3)
    pz.chord(0.0, 0.4, ["c4", "e4", "g4"], 70)
    pz.chord(0.5, 0.4, ["c4", "d4", "f#4", "a4"], 66)
    pz.chord(1.0, 0.4, ["c4", "f4", "ab4"], 64)
    pz.chord(1.5, 0.8, ["c4", "e4", "g4"], 70)
    st = s.track("strings", 49, pan=0.2, humanize_ms=0)
    st.chord(0.0, 1.0, ["c3", "g3", "e4"], 54)
    st.chord(1.0, 0.5, ["c3", "f3", "ab3"], 54)
    st.chord(1.5, 2.2, ["c3", "g3", "e4"], 56)
    bs = s.track("bass", 32)
    bs.note(0.0, 1.0, "c2", 80)
    bs.note(1.5, 2.0, "c2", 76)
    gl = s.track("glock", 9, pan=0.35)
    gl.note(2.6, 1.5, "g5", 56)
    gl.note(2.85, 1.5, "c6", 64)
    settings = {
        "clarinet": dict(level=0.0, hpf=180, rev=0.35),
        "marimba": dict(level=-6.0, hpf=200, rev=0.3),
        "pizz": dict(level=-7.0, hpf=150, rev=0.3),
        "strings": dict(level=-10.0, hpf=120, lpf=6000, rev=0.4),
        "bass": dict(level=-10.0, hpf=35, lpf=1500, rev=0.05),
        "glock": dict(level=-7.0, hpf=600, rev=0.45, high_shelf=(8000, -3.0)),
    }
    return _finish(s, settings, dict(rev_rt60=1.5, rev_level_db=-4.0), 2.6, 0.6)


def stinger_evolve():
    """Ab - Bb - C! : harp & celesta rise over a string/cymbal swell, then a big bright C chord with sparkles."""
    s = Song("stinger_evolve", 120, bars=2, loop=False, tail_s=3.0)
    hp = s.track("harp", 46, pan=-0.25, humanize_ms=1)
    gl_notes = ["c4", "d4", "eb4", "f4", "g4", "ab4", "bb4", "c5", "d5", "eb5", "f5", "g5", "ab5", "bb5", "c6",
                "d6", "eb6", "f6", "g6", "bb6"]
    for i, p in enumerate(gl_notes):
        hp.note(i * (2.0 / len(gl_notes)), 2.5, p, 54 + i)
    ce = s.track("celesta", 8, pan=0.3, humanize_ms=1)
    for i, p in enumerate(["ab5", "c6", "eb6", "ab6", "bb5", "d6", "f6", "bb6"]):
        ce.note(i * 0.25, 0.6, p, 60 + i * 2)
    st = s.track("strings", 44, pan=0.0, humanize_ms=0)  # tremolo strings swell
    st.chord(0.0, 1.0, ["ab3", "c4", "eb4", "ab4"], 90)
    st.chord(1.0, 1.0, ["bb3", "d4", "f4", "bb4"], 90)
    st.cc_ramp(0.0, 2.0, 11, 40, 127, steps=20)
    st2 = s.track("strings2", 48, pan=0.1, humanize_ms=0)
    st2.chord(2.0, 3.5, ["c4", "g4", "c5", "e5", "g5"], 96)
    br = s.track("brass", 61, pan=-0.15, humanize_ms=2)
    br.chord(1.5, 0.4, ["bb3", "d4", "f4"], 70)
    br.chord(2.0, 3.0, ["c4", "e4", "g4", "c5"], 100)
    tp = s.track("trumpet", 56, pan=0.1, humanize_ms=2)
    tp.seq(1.5, "g5e g5e c6h.", v=90, gate=0.95)
    rc = s.track("revcym", 119, pan=0.0, humanize_ms=0)
    rc.note(0.0, 2.0, "c4", 70)
    bs = s.track("bass", 32)
    bs.note(0.0, 1.0, "ab2", 84)
    bs.note(1.0, 1.0, "bb2", 86)
    bs.note(2.0, 2.5, "c3", 92)
    gl = s.track("glock", 9, pan=0.4, humanize_ms=1)
    for i, p in enumerate(["c6", "e6", "g6", "c7", "e7", "c7", "g6", "c7"]):
        gl.note(2.0 + i * 0.125, 1.2, p, 72 - i * 3)
    cr = s.track("crystal", 98, pan=-0.35, humanize_ms=0)
    cr.chord(2.0, 2.5, ["c6", "g6"], 70)
    dr = s.track("drums", 48, drum=True)
    dr.note(2.0, 2.0, 49, 96)
    dr.note(2.0, 1.0, 57, 70)
    dr.note(2.0, 1.0, 36, 110)
    tm = s.track("timpani", 47)
    for i in range(16):
        tm.note(1.0 + i * 0.0625, 0.07, "g2", 40 + i * 4)
    tm.note(2.0, 1.5, "c2", 116)
    settings = {
        "harp": dict(level=-3.0, hpf=200, rev=0.4),
        "celesta": dict(level=-6.0, hpf=400, rev=0.45),
        "strings": dict(level=-4.0, hpf=150, rev=0.35),
        "strings2": dict(level=-4.0, hpf=150, rev=0.4),
        "brass": dict(level=-2.0, hpf=150, rev=0.3, high_shelf=(5000, -3.0)),
        "trumpet": dict(level=-1.0, hpf=250, rev=0.3, high_shelf=(5500, -3.0)),
        "revcym": dict(level=-12.0, hpf=500, lpf=9000, rev=0.2),
        "bass": dict(level=-12.0, hpf=50, lpf=2000, rev=0.05),
        "glock": dict(level=-8.0, hpf=700, rev=0.45, high_shelf=(8000, -3.0)),
        "crystal": dict(level=-12.0, hpf=600, rev=0.5, high_shelf=(7000, -3.0)),
        "drums": dict(level=-10.0, hpf=50, rev=0.3, high_shelf=(8000, -4.0)),
        "timpani": dict(level=-9.0, hpf=50, rev=0.3),
    }
    return _finish(s, settings, dict(rev_rt60=1.8, rev_level_db=-3.5), 3.2, 0.9)


STINGERS = {"stinger_clear": stinger_clear, "stinger_fail": stinger_fail, "stinger_evolve": stinger_evolve}


def build(names=None, target=-16.0):
    info = {}
    for name, fn in STINGERS.items():
        if names and name not in names:
            continue
        y = fn()
        path = os.path.join(OUT_DIR, name + ".mp3")
        for i in range(3):
            encode_mp3(y, path)
            m = ffmpeg_ebur128(path)
            g = min(target - m["I"], -1.7 - m["TP"])
            if abs(g) < 0.15 or i == 2:
                break
            y = y * db2lin(g)
        write_wav(os.path.join(BUILD_DIR, name + ".wav"), y)
        info[name] = {"duration": y.shape[0] / SR}
    return info


if __name__ == "__main__":
    import sys
    print(build(sys.argv[1:] or None))
