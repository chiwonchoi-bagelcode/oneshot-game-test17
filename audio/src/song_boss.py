"""bgm_boss - boss fights.  C minor (harmonic minor colour), 140 BPM, 36 bars.

H (4 bars): staccato string ostinato, brass stabs, timpani - the "here it comes" hook.
A (8): cartoon-chase trumpet theme doubled by xylophone.
A' (8): theme again, brass stabs in the gaps, string counter-runs, stronger ending.
B (8): playful major-side bridge (Ab-Bb-Gm-Cm): xylophone + pizzicato, horn counterline.
C (8): climax - trumpet & strings in octaves, brass harmony, chromatic climb back to H.
"""
from arrange import arp, bassline, comp_hits, pad, prog
from music_lib import Song, chord_pcs

BPM = 140

CH_H = "Cm | Ab | Fm | G7"
CH_A = "Cm | Ab | Fm | G7 | Cm | Ab | Fm G7 | Cm"
CH_A2 = "Cm | Ab | Fm | G7 | Cm | Ab | Fm G7 | Cm"
CH_B = "Ab | Bb | Gm | Cm | Ab | Bb | G | G7"
CH_C = "Cm | Ab | Bb | G | Cm | Ab | Fm | G7"

M4_9 = ("g4e' c5e' eb5e' g5e' r e f5e eb5e d5e | c5e' eb5e' ab5e' c6e' r e bb5e ab5e g5e | "
        "f5q' ab5e' f5e' c5q' f5q' | g5e f5e eb5e d5e b4q' g4q' | "
        "g4e' c5e' eb5e' g5e' r e f5e eb5e d5e | c5e' eb5e' ab5e' c6e' r e bb5e ab5e g5e")
MEL_A = M4_9 + " | f5e' g5e' ab5e' f5e' g5q' b4q' | c5q' g4e' g4e' c5q' r q"
MEL_A2 = M4_9 + " | ab5e g5e f5e ab5e g5q. d5e | c6q' g5q' c5q' r q"
MEL_B = ("eb5e' ab5e' c6e' ab5e' eb5e' ab5e' c6q' | d5e' f5e' bb5e' f5e' d5e' f5e' bb5q' | "
         "d5e' g5e' bb5e' g5e' d6q' bb5q' | c6e' bb5e' g5e' eb5e' c5h | "
         "c6e' eb6e' c6e' ab5e' eb5e' ab5e' c6q' | d6e' f6e' d6e' bb5e' f5e' bb5e' d6q' | "
         "g5e' b5e' d6q' c6e b5e a5e g5e | f5e' g5e' ab5e' a5e' b5e' c6e' d6e' f6e'")
HORN_B = "c5h eb5h | d5h f5h | d5h bb4h | c5h g4h | ab4h c5h | bb4h d5h | b4h d5h | f5w"
MEL_C = ("g4q' c5e' eb5e' g5q' eb5e' g5e' | ab5q' eb5e' ab5e' c6q' ab5e' eb5e' | "
         "f5q' bb4e' d5e' f5q' bb5e' f5e' | g5q' d5q' b4q' d5q' | "
         "eb5q' c5e' g4e' c5q' eb5e' g5e' | c6q' ab5e' eb5e' c5q' eb5e' ab5e' | "
         "ab5q' f5e' ab5e' c6q' ab5q' | g5e f#5e g5e ab5e a5e bb5e b5e d6e")
# string counter-runs for A' (answers in the melody's rests)
STR_A2 = ("r h g5e ab5e g5e f5e | r h eb6e d6e c6e bb5e | r w | r h. g5e b5e | "
          "r h g5e ab5e g5e f5e | r h eb6e d6e c6e bb5e | r w | r h g5e f5e eb5e d5e")


def all_chords():
    return prog(CH_H, 0) + prog(CH_A, 4) + prog(CH_A2, 12) + prog(CH_B, 20) + prog(CH_C, 28)


def harmony_below(track_src_notes, chords, t0, t1, min_gap=3):
    """Chord-tone harmony a third-ish below each melody note in [t0, t1)."""
    from arrange import chord_at
    out = []
    for n in track_src_notes:
        if not (t0 <= n.t < t1):
            continue
        pcs = chord_pcs(chord_at(chords, n.t))
        cand = [p for p in range(n.p - 9, n.p - min_gap + 1) if p % 12 in pcs]
        if cand:
            out.append((n.t, n.d, max(cand), n.v))
    return out


def build():
    s = Song("bgm_boss", BPM, bars=36)
    H, A, A2, B, C = 0, 4, 12, 20, 28
    chH, chA, chA2, chB, chC = prog(CH_H, H), prog(CH_A, A), prog(CH_A2, A2), prog(CH_B, B), prog(CH_C, C)
    allc = chH + chA + chA2 + chB + chC

    tp = s.track("trumpet", 56, pan=0.05, humanize_ms=4, vel_jitter=5)
    tp.seq(s.bar(A), MEL_A, v=84, gate=0.8)
    tp.seq(s.bar(A2), MEL_A2, v=88, gate=0.8)
    tp.seq(s.bar(C), MEL_C, v=90, gate=0.8)

    xy = s.track("xylophone", 13, pan=0.3, humanize_ms=4, vel_jitter=6)
    xy.seq(s.bar(A), MEL_A, v=70, gate=0.6)
    xy.seq(s.bar(C + 7), "g5e f#5e g5e ab5e a5e bb5e b5e d6e", v=70, gate=0.6)
    xl = s.track("xylo_lead", 13, pan=0.1, humanize_ms=4, vel_jitter=6)
    xl.seq(s.bar(B), MEL_B, v=86, gate=0.6)
    # a soft flute doubles the bridge an octave down so the tune carries on small speakers
    fb = s.track("flute", 73, pan=-0.1, humanize_ms=4, vel_jitter=4)
    fb.seq(s.bar(B), MEL_B, v=78, gate=0.55, transpose=-12)

    br = s.track("brass", 61, pan=-0.2, humanize_ms=4, vel_jitter=5)
    comp_hits(br, chH, [(0.0, 0.5), (1.5, 0.4), (3.0, 0.4), (3.5, 0.3)], low="g3", high="g4", n=3, vel=84)
    comp_hits(br, chA, [(0.0, 0.6)], low="g3", high="g4", n=3, vel=70)
    comp_hits(br, chA2, [(0.0, 0.5), (2.0, 0.4)], low="g3", high="g4", n=3, vel=80)
    comp_hits(br, chB, [(1.5, 0.35), (3.5, 0.35)], low="ab3", high="ab4", n=3, vel=66)
    # C: harmony under the trumpet
    tmp = Song("tmp", BPM, bars=36)
    tt = tmp.track("t", 0)
    tt.seq(s.bar(C), MEL_C, v=80, gate=0.8)
    for (t, d, p, v) in harmony_below(tt.notes, allc, s.bar(C), s.bar(C + 7)):
        br.note(t, d, p, v - 6)
    br.chord(s.bar(C + 7), 0.4, [55, 59, 62, 65], 84, strum=0.0)  # G7 hit then the climb
    br.chord(0.0, 0.6, [55, 60, 63, 67], 92, strum=0.0)  # big stab landing on the loop start

    st = s.track("strings", 48, pan=-0.35, humanize_ms=3, vel_jitter=5)
    ost = (0, 0, 2, 0, 3, 2, 1, 2)
    arp(st, chH, pattern=ost, step=0.5, low="c4", high="c5", n=3, vel=80, gate=0.45,
        vel_pattern=(12, -8, 0, -8, 8, -8, 0, -8))
    arp(st, chA, pattern=ost, step=0.5, low="c4", high="c5", n=3, vel=68, gate=0.45,
        vel_pattern=(12, -8, 0, -8, 8, -8, 0, -8))
    arp(st, chA2, pattern=ost, step=0.5, low="c4", high="c5", n=3, vel=72, gate=0.45,
        vel_pattern=(12, -8, 0, -8, 8, -8, 0, -8))
    st.seq(s.bar(A2), STR_A2, v=80, gate=0.8)
    pad(st, chB, low="eb4", high="eb5", n=3, vel=52)
    st.seq(s.bar(C), MEL_C, v=80, gate=0.8, transpose=-12)

    pz = s.track("pizz", 45, pan=0.35, humanize_ms=4, vel_jitter=6)
    arp(pz, chB, pattern=(0, 2, 1, 2), step=0.5, low="c3", high="c5", n=3, vel=82, gate=0.5,
        vel_pattern=(10, -6, 4, -6))
    arp(pz, chC, pattern=(0, 1, 2, 1), step=0.5, low="c3", high="c4", n=3, vel=70, gate=0.4)

    hn = s.track("horns", 60, pan=0.15, humanize_ms=6, vel_jitter=4)
    hn.seq(s.bar(B), HORN_B, v=70, gate=0.97, accent_beats=False, expr=True)
    pad(hn, chC, low="g3", high="eb4", n=2, vel=58)

    tm = s.track("timpani", 47, pan=0.0, humanize_ms=3, vel_jitter=5)
    for (t, d, sym) in chH + chC:
        tm.note(t, 0.9, "c2" if sym.startswith("C") else ("g2" if sym.startswith("G") else
                                                         ("f2" if sym.startswith("F") else "ab2" if sym.startswith("Ab") else "bb2")), 92)
    for i in range(8):  # rolls into A and back into the hook
        tm.note(s.bar(H + 3) + 3.0 + i * 0.125, 0.12, "g2", 52 + i * 6)
        tm.note(s.bar(C + 7) + 3.0 + i * 0.125, 0.12, "g2", 52 + i * 7)

    bs = s.track("bass", 33, pan=0.0, humanize_ms=3, vel_jitter=4)
    drive = [("R", 0.5), ("R", 0.5), ("8", 0.5), ("R", 0.5)]
    bassline(bs, chH + chA + chA2, drive, key="C", scale="harm", low="e1", high="d3", prefer="g2", vel=90,
             gate=0.55)
    bassline(bs, chB, [("R", 0.5), ("r", 0.5), ("5", 0.5), ("r", 0.5), ("8", 0.5), ("r", 0.5), ("5", 0.5), ("A", 0.5)],
             key="C", scale="minor", low="e1", high="d3", prefer="g2", vel=88, gate=0.6)
    bassline(bs, chC, drive, key="C", scale="harm", low="e1", high="d3", prefer="g2", vel=92, gate=0.55)

    dr = s.track("drums", 0, drum=True, humanize_ms=3, vel_jitter=6)
    K, SN, HH, OH, CR, TL, TM, TH, TAM, CL, RD = 36, 38, 42, 46, 49, 45, 47, 50, 54, 39, 51
    dr.drums(s.bar(H), 3, {K: "x.....x.x.......", SN: "....x.......x...", HH: "x.x.x.x.x.x.x.x."})
    dr.drums(s.bar(H + 3), 1, {K: "x.....x.x.......", SN: "....x...x.x.xxxx", HH: "x.x.x.x........."})
    dr.drums(s.bar(A), 8, {K: "x.....x.x.......", SN: "....x..g....x..g", HH: "x.o.x.o.x.o.x.o."})
    dr.drums(s.bar(A2), 8, {K: "x.....x.x.....x.", SN: "....x..g....x..g", HH: "x.o.x.o.x.o.x.o.",
                            TAM: "....o.......o..."})
    dr.drums(s.bar(B), 8, {K: "x..x..x...x..x..", SN: "....x.......x...", HH: "x.x.x.x.x.x.x.x.",
                           CL: "....o.......o..."})
    dr.drums(s.bar(C), 7, {K: "x...x...x...x...", SN: "....x.......x..g", OH: "..o...o...o...o.",
                           HH: "x...x...x...x..."})
    dr.drums(s.bar(C + 7), 1, {K: "x...x...x...x...", SN: "x.x.x.x.xxxxxxxx", TH: "........o.......",
                               TM: "..........o.....", TL: "............o.o."})
    dr.fill(s.bar(A + 7) + 3.0, {SN: "xoxx", TH: "....", TL: "...."})
    dr.fill(s.bar(A2 + 7) + 2.0, {SN: "x.x.....", TH: "....x.x.", TM: "......x.", TL: ".......x"})
    dr.fill(s.bar(B + 7) + 2.0, {SN: "x.x.xxxx", TL: "........"})
    for b in (H, A, B, C):
        dr.note(s.bar(b), 1.0, CR, 80)

    settings = {
        "trumpet": dict(level=0.0, hpf=250, rev=0.25, high_shelf=(5500, -3.5), peaks=[(2600, -2.0, 1.0)]),
        "xylophone": dict(level=-6.0, hpf=400, rev=0.25, high_shelf=(6000, -4.0)),
        "xylo_lead": dict(level=-1.0, hpf=400, rev=0.25, high_shelf=(6000, -4.0)),
        "flute": dict(level=-5.0, hpf=300, rev=0.25, high_shelf=(6500, -2.0)),
        "brass": dict(level=-6.0, hpf=150, rev=0.22, high_shelf=(5000, -3.0)),
        "strings": dict(level=-6.0, hpf=180, rev=0.25, high_shelf=(7000, -2.0)),
        "pizz": dict(level=-8.0, hpf=120, rev=0.2),
        "horns": dict(level=-9.0, hpf=150, rev=0.3),
        "timpani": dict(level=-8.5, hpf=40, rev=0.25),
        "bass": dict(level=-6.5, hpf=35, lpf=3000, rev=0.02, peaks=[(250, -2.0, 1.0)]),
        "drums": dict(level=-6.0, hpf=35, rev=0.12, high_shelf=(8000, -3.5)),
    }
    mixp = dict(rev_rt60=1.5, rev_level_db=-6.5)
    return s, settings, mixp
