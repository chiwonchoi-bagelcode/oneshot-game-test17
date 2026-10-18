"""bgm_shelter - the cozy animal shelter.  C major, 80 BPM, 24 bars (A B A').

Music box lullaby over finger-picked nylon guitar, warm pad and a soft bass.
B: celesta takes the tune, slow strings bloom, a whisper of shaker.
A': music box + celesta together, harp ripples at phrase ends.
Low dynamics, slow harmonic rhythm, nothing sharp - made for long listening.
"""
from arrange import arp, bassline, pad, prog
from music_lib import P, Song, bass_note, voicing

BPM = 80

CH_A = "Cmaj7 | Em7 | Fmaj7 | C/E | Dm7 | Em7 | Fmaj7 | G7sus4 G"
CH_B = "Fmaj7 | G/F | Em7 | Am7 | Dm7 | G | Cmaj7/E | F/G"
CH_A2 = "Cmaj7 | Em7 | Fmaj7 | C/E | Dm7 | G/B | Am7 Dm7 | F/G"

MEL_A = ("e5q. g5e c6q b5q | b5h g5h | a5q. c6e e6q d6q | c6h g5q r q | "
         "f5q. a5e d6q c6q | b5h g5h | a5q. g5e f5q e5q | d5h b4h")
MEL_B = ("c6q. a5e e6h | d6q. b5e g5h | b5q. g5e d6q b5q | c6h. r q | "
         "a5q. f5e c6q a5q | b5q. g5e d6h | e6q. d6e c6q b5q | a5h. g5q")
MEL_A2 = ("e5q. g5e c6q b5q | b5h g5h | a5q. c6e e6q d6q | c6h g5q r q | "
          "f5q. a5e d6q c6q | b5h d6h | c6q. b5e a5q f5q | g5h. r q")
# celesta counter-melody for A' (gentle answers)
CEL_A2 = ("r h g5q a5q | d5h e5h | r h c5q e5q | e5h. r q | "
          "r h a4q c5q | d5h b4h | e5h c5h | d5h. r q")


def all_chords():
    return prog(CH_A, 0) + prog(CH_B, 8) + prog(CH_A2, 16)


def fingerpick(track, chords, vel=54):
    """Bass on beats 1 and 3, 8th-note arpeggio above (p-i-m-a style)."""
    prev = None
    for (t, d, sym) in chords:
        bn = bass_note(sym, P("c2"), P("b2"), P("g2")) + 12
        five = bn + 7 if bn + 7 <= P("a3") else bn - 5
        v = voicing(sym, P("g3"), P("e5"), n=3, prev=prev)
        prev = v
        fig = ["B", 0, 1, 2, "F", 1, 2, 1] if d >= 4 else ["B", 0, 1, 2]
        for k in range(int(round(d / 0.5))):
            tt = t + k * 0.5
            idx = fig[k % len(fig)]
            if idx == "B":
                track.note(tt, 1.9, bn, vel + 4)
            elif idx == "F":
                track.note(tt, 1.9, five, vel)
            else:
                track.note(tt, 1.4, v[idx], vel - 6 + (3 if k % 2 == 0 else 0))


def build():
    s = Song("bgm_shelter", BPM, bars=24, tail_s=6.0)
    A, B, A2 = 0, 8, 16
    chA, chB, chA2 = prog(CH_A, A), prog(CH_B, B), prog(CH_A2, A2)
    allc = chA + chB + chA2

    mb = s.track("musicbox", 10, pan=0.1, humanize_ms=6, vel_jitter=5)
    mb.seq(s.bar(A), MEL_A, v=74, gate=1.2, accent_beats=False)
    mb.seq(s.bar(A2), MEL_A2, v=72, gate=1.2, accent_beats=False)

    ce = s.track("celesta", 8, pan=-0.15, humanize_ms=6, vel_jitter=5)
    ce.seq(s.bar(B), MEL_B, v=76, gate=1.1, accent_beats=False)
    ce.seq(s.bar(A2), CEL_A2, v=60, gate=1.1, accent_beats=False)

    gt = s.track("guitar", 24, pan=-0.25, humanize_ms=7, vel_jitter=5)
    fingerpick(gt, allc, vel=56)

    pd = s.track("pad", 89, pan=0.0, humanize_ms=0, vel_jitter=1)
    pad(pd, allc, low="e3", high="c5", n=4, vel=46)

    ss = s.track("strings", 49, pan=0.2, humanize_ms=0, vel_jitter=1)
    pad(ss, chB, low="g3", high="e5", n=4, vel=48)
    ss.cc(s.bar(B), 11, 90)
    ss.cc_ramp(s.bar(B), s.bar(B + 2), 11, 60, 100, steps=12)
    ss.cc_ramp(s.bar(B + 6), s.bar(B + 8), 11, 100, 70, steps=12)

    hp = s.track("harp", 46, pan=0.3, humanize_ms=2, vel_jitter=4)
    for bar_i, sym in ((7, "G"), (15, "F/G"), (23, "F/G")):
        notes = voicing(sym, P("c4"), P("c6"), n=4)
        run = []
        base = sorted(notes)
        for o in (0, 12):
            run += [p + o for p in base]
        t0 = s.bar(bar_i) + 2.0
        for i, p in enumerate(run[:8]):
            hp.note(t0 + i * 0.125, 2.0, p, 50 + i * 2)

    bs = s.track("bass", 32, pan=0.0, humanize_ms=5, vel_jitter=3)
    bassline(bs, allc, lambda d: [("R", 2.0), ("5", 1.5), ("A", 0.5)] if d >= 4 else [("R", 2.0)],
             key="C", low="e1", high="c3", prefer="g2", vel=70, gate=0.9)

    sh = s.track("shaker", 0, drum=True, humanize_ms=6, vel_jitter=6, swing=0.1, swing_unit=0.25)
    sh.drums(s.bar(B), 8, {70: "o.g.o.g.o.g.o.g."})
    sh.drums(s.bar(A2), 8, {70: "g...g...g...g..."})
    sh.note(s.bar(B), 2.0, 81, 40)  # triangle shimmer at the B entrance

    settings = {
        "musicbox": dict(level=0.0, hpf=350, rev=0.4, delay=0.12, high_shelf=(6000, -4.0)),
        "celesta": dict(level=-1.0, hpf=300, rev=0.4, delay=0.1, high_shelf=(6500, -3.0)),
        "guitar": dict(level=-4.5, hpf=110, rev=0.3, peaks=[(300, -1.5, 1.0)]),
        "pad": dict(level=-11.0, hpf=180, lpf=5000, rev=0.4),
        "strings": dict(level=-9.0, hpf=200, lpf=6000, rev=0.45),
        "harp": dict(level=-7.0, hpf=200, rev=0.45),
        "bass": dict(level=-6.0, hpf=35, lpf=1500, rev=0.05),
        "shaker": dict(level=-17.0, hpf=800, lpf=9000, rev=0.2),
    }
    mixp = dict(rev_rt60=2.2, rev_level_db=-4.5, delay_s=1.5 * s.beat_s, delay_fb=0.3,
                master_high_shelf=(7000, -2.5), auto_eq=False)
    return s, settings, mixp
