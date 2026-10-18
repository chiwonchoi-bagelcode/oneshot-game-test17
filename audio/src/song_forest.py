"""bgm_forest - battle, Sunny Forest.  D major (with a mixolydian bVII), 124 BPM, 32 bars.

A (theme) -> A' (theme, higher ending, marimba counterline) -> B (soaring
legato theme over 16th marimba) -> C (breakdown with marimba hook, then a
rising build with a snare roll back into the theme).
Flute lead doubled by a soft whistle, pizzicato ostinato, bouncy bass, kit.
"""
from arrange import arp, bassline, comp_hits, pad, prog, strum
from music_lib import Song

BPM = 124

CH_A = "D | C | G | D | Bm | G | Em7 A7 | D"
CH_A2 = "D | C | G | D | Bm | G | Em7 A7 | D"
CH_B = "G | A | F#m | Bm | Em | A | D/F# G | A7sus4 A7"
CH_C = "Bm | G | D | A | Bm | Gmaj7 | Em7 | A7"

MEL_A_1_4 = ("f#5e a5e d6q' c#6e b5e a5q' | g5e a5e g5e e5e c5q' e5q' | "
             "d5e g5e b5q' a5e g5e e5q' | f#5e e5e d5e e5e f#5h")
MEL_A_5_8 = ("f#5e a5e d6q' c#6e b5e f#5q' | g5e b5e d6q' e6e d6e b5q' | "
             "g5e f#5e e5e g5e a5q. e5e | d5h r e a4e d5e e5e")
MEL_A2_5_8 = ("f#5e a5e d6q' c#6e b5e f#5q' | g5e b5e d6q' e6e f#6e g6q' | "
              "f#6e e6e d6e b5e c#6q. a5e | d6q a5e f#5e d5q r q")
MEL_B = ("d6h. b5q | c#6q. b5e a5h | a5h. c#6q | b5q. a5e f#5h | "
         "g5h. b5q | a5q. g5e e5h | f#5q a5q b5q d6q | e6h c#6h")
MEL_C_MAR = ("f#5e b5e' r e f#5e d5e b4e' r q | g5e b5e' r e g5e d5e b4e' r q | "
             "f#5e a5e' r e f#5e d5e a4e' r q | e5e a5e c#6e e6e c#6e a5e e5e c#5e")
MEL_C_FL = ("r w | r w | r w | r w | b5e c#6e d6q b5e c#6e d6q | d6e e6e f#6q d6e e6e f#6q | "
            "g6q f#6q e6q d6q | c#6q. b5e a5e g5e f#5e e5e")
# marimba counterline for A'
MAR_A2 = ("d5q a4q d5e e5e f#5q | e5q c5q e5e d5e c5q | b4q d5q g5e f#5e e5q | "
          "a4q d5q f#5e e5e d5q | f#5q d5q b4e c#5e d5q | b4q d5q g5e a5e b5q | "
          "g5q e5q c#5q e5q | f#5q a5q d6q r q")


def all_chords():
    return prog(CH_A, 0) + prog(CH_A2, 8) + prog(CH_B, 16) + prog(CH_C, 24)


def build():
    s = Song("bgm_forest", BPM, bars=32)
    A, A2, B, C = 0, 8, 16, 24
    chA, chA2, chB, chC = prog(CH_A, A), prog(CH_A2, A2), prog(CH_B, B), prog(CH_C, C)
    ch = chA + chA2 + chB + chC

    fl = s.track("flute", 73, pan=0.0, humanize_ms=5, vel_jitter=5)
    fl.seq(s.bar(A), MEL_A_1_4 + " | " + MEL_A_5_8, v=88, gate=0.85)
    fl.seq(s.bar(A2), MEL_A_1_4 + " | " + MEL_A2_5_8, v=92, gate=0.85)
    fl.seq(s.bar(B), MEL_B, v=86, gate=0.97)
    fl.seq(s.bar(C), MEL_C_FL, v=88, gate=0.85)

    wh = s.track("whistle", 78, pan=0.12, humanize_ms=5, vel_jitter=4)
    wh.seq(s.bar(A2), MEL_A_1_4 + " | " + MEL_A2_5_8, v=70, gate=0.8)
    wh.seq(s.bar(C), MEL_C_FL, v=70, gate=0.8)

    # pizzicato ostinato
    pz = s.track("pizz", 45, pan=-0.35, humanize_ms=5, vel_jitter=6)
    arp(pz, chA, pattern=(0, 2, 1, 2, 0, 2, 1, 3), step=0.5, low="a3", high="a5", n=3, vel=68, gate=0.6,
        vel_pattern=(10, -6, 0, -6, 6, -6, 0, -4))
    arp(pz, chA2, pattern=(0, 2, 1, 2, 0, 2, 1, 3), step=0.5, low="a3", high="a5", n=3, vel=74, gate=0.6,
        vel_pattern=(10, -6, 0, -6, 6, -6, 0, -4))
    comp_hits(pz, chB, [(0.5, 0.3), (1.5, 0.3), (2.5, 0.3), (3.5, 0.3)], low="f#3", high="f#4", n=3, vel=70)
    pz.seq(s.bar(C), MEL_C_MAR, v=70, gate=0.5, transpose=-12)
    arp(pz, chC[4:], pattern=(0, 1, 2, 1), step=0.5, low="d3", high="d5", n=3, vel=78, gate=0.5)

    # marimba
    mb = s.track("marimba", 12, pan=0.3, humanize_ms=5, vel_jitter=6)
    mb.seq(s.bar(A2), MAR_A2, v=72, gate=0.9)
    arp(mb, chB, pattern=(0, 1, 2, 3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 3, 2, 1), step=0.25, low="d4", high="d6", n=3,
        vel=60, vel_pattern=(12, -8, 0, -8, 6, -8, 0, -8), gate=1.2)
    mb.seq(s.bar(C), MEL_C_MAR, v=84, gate=0.9)
    arp(mb, chC[4:], pattern=(0, 1, 2, 3, 4, 3, 2, 1), step=0.5, low="d4", high="d6", n=3, vel=66, gate=1.2)

    # glockenspiel accents on A' hooks and the build
    gl = s.track("glock", 9, pan=0.4, humanize_ms=4)
    for b in range(A2, A2 + 8, 2):
        gl.note(s.bar(b), 1.0, "d6" if b % 4 == 0 else "a5", 62)
    gl.seq(s.bar(C + 4), "r w | r w | g6q f#6q e6q d6q | c#6q. b5e a5e g5e f#5e e5e", v=50, gate=0.6)

    # steel-string guitar drive in A' and B
    gt = s.track("guitar", 25, pan=-0.15, humanize_ms=5, vel_jitter=6)
    strum(gt, chA2, "D.DUxUDU", low="g3", high="g5", n=4, vel=62, strum_s=0.010)
    strum(gt, chB, "D.DU.UDU", low="g3", high="g5", n=4, vel=60, strum_s=0.010)

    # strings pad: B + build
    st = s.track("strings", 48, pan=0.0, humanize_ms=0, vel_jitter=2)
    pad(st, chB, low="f#3", high="d5", n=4, vel=62)
    pad(st, chC[4:], low="f#3", high="d5", n=4, vel=56)
    st.cc_ramp(s.bar(C + 4), s.bar(C + 8) - 0.25, 11, 70, 124, steps=24)
    st.cc(s.bar(B), 11, 110)

    # bass
    bs = s.track("bass", 33, pan=0.0, humanize_ms=4, vel_jitter=5)
    full = [("R", 0.5), ("r", 0.5), ("8", 0.5), ("R", 0.5), ("5", 0.5), ("r", 0.5), ("R", 0.5), ("A", 0.5)]
    half = [("R", 0.5), ("r", 0.5), ("8", 0.5), ("5", 0.5)]
    bassline(bs, chA + chA2 + chB, lambda d: full if d >= 4 else half, key="D", scale="mixo",
             low="e1", high="d3", prefer="a2", vel=92, gate=0.7)
    # breakdown: long roots, then the build in driving eighths
    for (t, d, sym) in chC[:4]:
        bassline(bs, [(t, d, sym)], [("R", 1.5), ("R", 0.5), ("r", 2.0)], key="D", low="e1", high="d3",
                 prefer="a2", vel=90, gate=0.8)
    bassline(bs, chC[4:], [("R", 0.5), ("8", 0.5)], key="D", low="e1", high="d3", prefer="a2", vel=86, gate=0.6)

    # drums
    dr = s.track("drums", 0, drum=True, humanize_ms=3, vel_jitter=6)
    K, SN, CL, HH, OH, TAM, CR, TL, TM, TH, SHK = 36, 38, 39, 42, 46, 54, 49, 45, 47, 50, 70
    dr.drums(s.bar(A), 8, {K: "x.....x.x.......", SN: "....x.......x...", HH: "x.o.x.o.x.o.x.o."})
    dr.drums(s.bar(A2), 8, {K: "x.....x.x.....o.", SN: "....x.......x..g", HH: "x.o.x.o.x.o.x.o.",
                            TAM: "....o.......o..."})
    dr.drums(s.bar(B), 8, {K: "x...x...x...x...", SN: "....x.......x...", CL: "....o.......o...",
                           HH: "x.oxx.oxx.oxx.ox", OH: "..............o."})
    dr.drums(s.bar(C), 4, {K: "x.......x.......", CL: "....x.......x...", SHK: "ogogogogogogogog"})
    dr.drums(s.bar(C + 4), 2, {K: "x.......x.......", SN: "o.o.o.o.o.o.o.o.", HH: "x.x.x.x.x.x.x.x."})
    dr.drums(s.bar(C + 6), 1, {K: "x...x...x...x...", SN: "oooooooooooooooo"},
             vel={"o": 60})
    dr.drums(s.bar(C + 7), 1, {K: "x...x...x...x...", SN: "xxxxxxxx........", TH: "........x.x.....",
                               TM: "............x.x.", TL: "..............xx"})
    # phrase-end fills
    dr.fill(s.bar(A + 7) + 3.0, {SN: "x.o.", TH: "..x.", TM: "...x"})
    dr.fill(s.bar(A2 + 7) + 2.0, {SN: "x...x.o.", TH: "..x.....", TM: "......x.", TL: ".......x"})
    dr.fill(s.bar(B + 7) + 3.0, {SN: "xoxo"})
    dr.note(s.bar(C), 1.0, CR, 64)
    # crash marks
    for b in (A, A2, B):
        dr.note(s.bar(b), 1.0, CR, 72)
    # snare crescendo velocities in the build
    for n in dr.notes:
        if s.bar(C + 6) <= n.t < s.bar(C + 7) and n.p == SN:
            n.v = 44 + (n.t - s.bar(C + 6)) / 4 * 50

    settings = {
        "flute": dict(level=0.0, hpf=300, rev=0.25, delay=0.10, high_shelf=(7000, -2.0)),
        "whistle": dict(level=-10.0, hpf=500, lpf=6000, rev=0.25),
        "pizz": dict(level=-7.5, hpf=160, rev=0.2, peaks=[(300, -2.0, 1.0)]),
        "marimba": dict(level=-7.0, hpf=180, rev=0.2),
        "glock": dict(level=-12.0, hpf=700, rev=0.35, high_shelf=(8000, -3.0)),
        "guitar": dict(level=-11.5, hpf=260, rev=0.15, peaks=[(3000, -2.0, 1.0)], high_shelf=(8000, -3.0)),
        "strings": dict(level=-12.5, hpf=200, lpf=7000, rev=0.35),
        "bass": dict(level=-7.0, hpf=35, lpf=3000, rev=0.02, peaks=[(250, -2.0, 1.0)]),
        "drums": dict(level=-7.5, hpf=35, rev=0.1, high_shelf=(9000, -3.0)),
    }
    mixp = dict(rev_rt60=1.3, rev_level_db=-6.0, delay_s=0.75 * s.beat_s, delay_fb=0.28)
    return s, settings, mixp
