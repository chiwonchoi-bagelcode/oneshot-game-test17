"""bgm_lake - battle, Sparkle Lake.  E major, 116 BPM, 32 bars, breezy calypso-lite.

A: steel-drum theme over kalimba arpeggios, vibraphone off-beat skank, congas.
A': theme with a higher answer phrase, glockenspiel shimmer joins.
B: kalimba (+ glock an octave up) takes a sparkling bridge, steel drums comp.
C: steel drums with a new phrase over a lifted progression, everything shimmers, turnaround.
"""
from arrange import arp, bassline, comp_hits, pad, prog
from music_lib import Song

BPM = 116

CH_A = "Emaj7 | Amaj7 | C#m7 | Amaj7 | Emaj7 | G#m7 | Amaj7 | B7sus4 B7"
CH_A2 = "Emaj7 | Amaj7 | C#m7 | F#m7 | G#m7 | Amaj7 | F#m7 B7 | Emaj7"
CH_B = "Amaj7 | B | G#m7 | C#m7 | F#m7 | B7 | Amaj7 | Bsus4 B"
CH_C = "C#m7 | G#m7 | Amaj7 | Emaj7/G# | F#m7 | Amaj7 | B7sus4 | B7"

M1_3 = "b4e e5e g#5q. f#5e e5q | c#6q. b5e a5e g#5e e5q | e5e g#5e b5q. a5e g#5q"
MEL_A = M1_3 + (" | f#5q. e5e c#5h | b4e e5e g#5q. f#5e e5q | d#6q. c#6e b5e g#5e d#5q |"
                " c#6e b5e a5e g#5e a5q c#6q | e6h d#6q r q")
MEL_A2 = M1_3 + (" | a5q. g#5e f#5h | b5e d#6e f#6q. e6e d#6q | c#6q. b5e a5e b5e c#6q |"
                 " a5e g#5e f#5e a5e b5q. d#5e | e5h. r q")
MEL_B = ("e5e a5e c#6e e6e c#6q a5q | d#6e c#6e b5e f#5e b5h | d#5e g#5e b5e d#6e b5q g#5q | "
         "e6e d#6e c#6e g#5e c#6h | c#5e f#5e a5e c#6e a5q f#5q | a5e g#5e f#5e d#5e f#5h | "
         "e5e a5e c#6e e6e g#6q e6q | e6h d#6h")
MEL_C = ("g#5q. e5e g#5e b5e c#6q | b5q. f#5e g#5e b5e d#6q | e6q. c#6e b5e a5e g#5q | b5h. r q | "
         "a5q. f#5e a5e c#6e e6q | e6q. c#6e b5e a5e c#6q | e6e d#6e e6e f#6e e6q b5q | "
         "d#6q. c#6e b5e a5e f#5q")
# kalimba counter-melody for C
KAL_C = ("e5q g#5q c#6h | d#5q f#5q b5h | c#5q e5q a5h | g#5q b5q e6h | "
         "f#5q a5q c#6h | e5q a5q c#6h | e5q f#5q a5h | f#5q a5q d#6h")


def all_chords():
    return prog(CH_A, 0) + prog(CH_A2, 8) + prog(CH_B, 16) + prog(CH_C, 24)


def build():
    s = Song("bgm_lake", BPM, bars=32)
    A, A2, B, C = 0, 8, 16, 24
    chA, chA2, chB, chC = prog(CH_A, A), prog(CH_A2, A2), prog(CH_B, B), prog(CH_C, C)
    allc = chA + chA2 + chB + chC

    sd = s.track("steeldrum", 114, pan=0.05, humanize_ms=5, vel_jitter=5)
    sd.seq(s.bar(A), MEL_A, v=88, gate=0.9)
    sd.seq(s.bar(A2), MEL_A2, v=90, gate=0.9)
    sd.seq(s.bar(C), MEL_C, v=90, gate=0.9)

    sc = s.track("steelcomp", 114, pan=-0.3, humanize_ms=4, vel_jitter=6)
    comp_hits(sc, chB, [(0.5, 0.3), (1.5, 0.3), (2.0, 0.3), (3.0, 0.3), (3.5, 0.3)], low="g#4", high="g#5",
              n=3, vel=56)

    ka = s.track("kalimba", 108, pan=-0.2, humanize_ms=5, vel_jitter=6)
    arp(ka, chA, pattern=(0, 2, 1, 3, 2, 1, 3, 2), step=0.5, low="f#4", high="f#5", n=4, vel=58,
        vel_pattern=(8, -6, 2, -6, 6, -6, 2, -6), gate=1.5)
    arp(ka, chA2, pattern=(0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 1, 3, 2, 1, 3, 2), step=0.5, low="f#4", high="f#5",
        n=4, vel=60, vel_pattern=(8, -6, 2, -6, 6, -6, 2, -6), gate=1.5)
    ka.seq(s.bar(B), MEL_B, v=92, gate=1.0)
    ka.seq(s.bar(C), KAL_C, v=64, gate=1.0)

    gl = s.track("glock", 9, pan=0.4, humanize_ms=4, vel_jitter=5)
    gl.seq(s.bar(A2), "b5q r h. | r w | r w | r w | f#6q r h. | r w | r w | r w", v=52, gate=0.6)
    gl.seq(s.bar(B), MEL_B, v=46, gate=0.5, transpose=12)
    gl.seq(s.bar(C + 6), "e6e d#6e e6e f#6e e6q b5q | d#6q. c#6e b5e a5e f#5q", v=48, gate=0.5)

    vb = s.track("vibes", 11, pan=0.3, humanize_ms=4, vel_jitter=5)
    comp_hits(vb, chA, [(0.5, 0.4), (1.5, 0.4), (2.5, 0.4), (3.5, 0.4)], low="e4", high="f#5", n=3, vel=52)
    comp_hits(vb, chA2, [(0.5, 0.4), (1.5, 0.4), (2.5, 0.4), (3.5, 0.4)], low="e4", high="f#5", n=3, vel=56)
    comp_hits(vb, chC, [(0.0, 1.4), (1.5, 0.4), (3.0, 0.9)], low="e4", high="f#5", n=4, vel=56)

    pd = s.track("pad", 89, pan=0.0, humanize_ms=0, vel_jitter=2)
    pad(pd, allc, low="e3", high="c#5", n=4, vel=50)

    bs = s.track("bass", 33, pan=0.0, humanize_ms=4, vel_jitter=5)
    cal = [("R", 1.5), ("R", 0.5), ("5", 1.0), ("8", 0.5), ("5", 0.5)]
    cal_h = [("R", 1.5), ("5", 0.5)]
    bassline(bs, allc, lambda d: cal if d >= 4 else cal_h, key="E", low="e1", high="e3", prefer="b2",
             vel=88, gate=0.8)

    dr = s.track("drums", 0, drum=True, humanize_ms=4, vel_jitter=7, swing=0.06, swing_unit=0.25)
    K, RIM, SHK, CON_H, CON_M, CON_L, BON_H, BON_L, TRI, SPL, CAB, HH = 36, 37, 70, 63, 62, 64, 60, 61, 81, 55, 69, 42
    calypso = {K: "x.....x...x.....", RIM: "...x..x....x..x.", SHK: "xgogxgogxgogxgog",
               CON_M: "..o.......o.....", CON_H: "......o.o.....o.", CON_L: "o..........o...."}
    dr.drums(s.bar(A), 8, calypso)
    dr.drums(s.bar(A2), 8, {**calypso, HH: "..o...o...o...o."})
    dr.drums(s.bar(B), 8, {K: "x.......x.......", RIM: "....x.......x...", SHK: "xgogxgogxgogxgog",
                           BON_H: "..o...o...o.o.o.", BON_L: "o.......o......."})
    dr.drums(s.bar(C), 7, {**calypso, CAB: "..o...o...o...o.", HH: "..o...o...o...o."})
    dr.drums(s.bar(C + 7), 1, {K: "x.....x...x.....", SHK: "xgogxgogxgogxgog",
                               CON_H: "........x.o.x...", CON_M: "............x.o.", CON_L: "..............xx"})
    for b in (A + 7, A2 + 7, B + 7):
        dr.fill(s.bar(b) + 3.0, {CON_H: "x.o.", CON_M: "..x.", CON_L: "...x", SHK: "ogog"})
    for b in (A, B):
        dr.note(s.bar(b), 1.0, SPL, 52)
    for b in (A2, C):
        dr.note(s.bar(b), 1.0, TRI, 52)

    settings = {
        "steeldrum": dict(level=0.0, hpf=250, rev=0.3, delay=0.12, high_shelf=(6000, -2.5)),
        "steelcomp": dict(level=-8.0, hpf=300, rev=0.3, high_shelf=(6000, -3.0)),
        "kalimba": dict(level=-4.0, hpf=200, rev=0.3),
        "glock": dict(level=-12.5, hpf=800, rev=0.4, high_shelf=(8000, -3.0)),
        "vibes": dict(level=-9.0, hpf=250, rev=0.3),
        "pad": dict(level=-13.0, hpf=220, lpf=6000, rev=0.45),
        "bass": dict(level=-5.0, hpf=35, lpf=3000, rev=0.02, peaks=[(250, -2.0, 1.0)]),
        "drums": dict(level=-7.0, hpf=40, rev=0.15, high_shelf=(9000, -3.0)),
    }
    mixp = dict(rev_rt60=1.7, rev_level_db=-5.0, delay_s=0.75 * s.beat_s, delay_fb=0.3)
    return s, settings, mixp
