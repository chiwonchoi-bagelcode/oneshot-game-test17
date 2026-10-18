"""bgm_home - world map / title.  F major, 100 BPM, 32 bars (A A' B A'').

Ukulele island strum + marimba + flute melody + clarinet answers/counterline,
acoustic bass, light hand percussion; glockenspiel doubles the last chorus.
"""
from arrange import arp, bassline, comp_hits, pad, prog, strum
from music_lib import Song

BPM = 100

CH_A = "F | C/E | Dm7 | F/C | Bbmaj7 | F/A | Gm7 | C7sus4 C7"
CH_A2 = "F | C/E | Dm7 | F/C | Bbmaj7 | C/Bb | Gm7 C7 | F"
CH_B = "Bbmaj7 | C | Am7 | Dm7 | Gm7 | Am7 | Bbmaj7 | C7sus4 C7"
CH_A3 = "F | C/E | Dm7 | F/C | Bbmaj7 | C/Bb | Am7 D7 | Gm7 C7"

MEL_1_4 = ("c5e f5e a5e c6e a5q f5q | g5e f5e e5e f5e g5h | "
           "d5e f5e a5e c6e a5q f5e e5e | f5q. e5e d5q c5q")
MEL_A_5_8 = "d5e f5e bb5e a5e bb5q d6q | c6q. a5e f5q a5q | bb5e a5e g5e f5e g5q. d5e | f5h e5q r q"
MEL_A2_5_8 = "d5e f5e bb5e a5e bb5q d6q | c6q. bb5e a5q g5q | a5e g5e f5e g5e e5q. c5e | f5h. r q"
MEL_A3_1_4 = ("c5e f5e a5e c6e a5q f5q | g5e f5e e5e f5e g5q. a5e | "
              "d5e f5e a5e c6e a5q f5e e5e | f5q. e5e d5q c5q")
MEL_A3_5_8 = "d5e f5e bb5e a5e bb5q d6q | c6q. bb5e a5q g5q | a5e g5e e5e c5e f#5q a5q | g5e a5e bb5e g5e e5q r q"

CLAR_B = ("f4q. a4e c5q d5q | e5q. d5e c5h | e4q. g4e c5q e5q | f5q. e5e d5h | "
          "d5q. c5e bb4q d5q | c5q. bb4e a4q c5q | d5e c5e bb4e c5e d5q f5q | f5h e5h")
FLUTE_B = ("r w | r h c6e bb5e g5q | r w | r h a5e c6e d6q | r w | r h e5e g5e c6q | "
           "r w | r h g5e bb5e c6q")
CLAR_A3 = "a4w | g4w | f4h a4h | a4h g4h | f4h d4h | e4h g4h | e4h f#4h | f4h e4h"


def all_chords():
    return prog(CH_A, 0) + prog(CH_A2, 8) + prog(CH_B, 16) + prog(CH_A3, 24)


def build():
    s = Song("bgm_home", BPM, bars=32)
    A, A2, B, A3 = 0, 8, 16, 24
    ch = (prog(CH_A, A) + prog(CH_A2, A2) + prog(CH_B, B) + prog(CH_A3, A3))
    chA, chA2, chB, chA3 = (prog(CH_A, A), prog(CH_A2, A2), prog(CH_B, B), prog(CH_A3, A3))

    # --- lead flute -----------------------------------------------------
    fl = s.track("flute", 73, pan=0.05, humanize_ms=7, vel_jitter=5)
    fl.seq(s.bar(A), MEL_1_4 + " | " + MEL_A_5_8, v=86, gate=0.9)
    fl.seq(s.bar(A2), MEL_1_4 + " | " + MEL_A2_5_8, v=88, gate=0.9)
    fl.seq(s.bar(B), FLUTE_B, v=74, gate=0.85)
    fl.seq(s.bar(A3), MEL_A3_1_4 + " | " + MEL_A3_5_8, v=92, gate=0.9)

    # --- clarinet: B melody + A'' counterline ---------------------------
    cl = s.track("clarinet", 71, pan=-0.3, humanize_ms=8, vel_jitter=5)
    cl.seq(s.bar(B), CLAR_B, v=84, gate=0.93)
    cl.seq(s.bar(A3), CLAR_A3, v=62, gate=0.97, accent_beats=False)

    # --- glockenspiel doubles the final chorus (sparkle) -------------------
    gl = s.track("glock", 9, pan=0.35, humanize_ms=5, vel_jitter=6)
    gl.seq(s.bar(A3), MEL_A3_1_4 + " | " + MEL_A3_5_8, v=58, gate=0.6)
    # little sparkles in the B section answers
    gl.seq(s.bar(B), FLUTE_B, v=50, gate=0.5, transpose=12)

    # --- ukulele strums ----------------------------------------------------
    uk = s.track("ukulele", 24, bank=8, pan=-0.2, humanize_ms=5, vel_jitter=6)
    strum(uk, chA, "D.DU.UDU", low="c4", high="a5", vel=70)
    strum(uk, chA2, "D.DU.UDU", low="c4", high="a5", vel=72)
    strum(uk, chB, "D...D.DU", low="c4", high="a5", vel=64)
    strum(uk, chA3, "D.DU.UDU", low="c4", high="a5", vel=76)

    # --- marimba: offbeat comp (A), arpeggios (A', B), running (A'') --------
    mb = s.track("marimba", 12, pan=0.25, humanize_ms=6, vel_jitter=7)
    comp_hits(mb, chA, [(0.5, 0.4), (1.5, 0.4), (2.5, 0.4), (3.5, 0.4)], low="a3", high="a4", n=2, vel=60)
    arp(mb, chA2, pattern=(0, 2, 1, 3, 2, 1, 3, 1), step=0.5, low="f3", high="c5", n=4, vel=66,
        vel_pattern=(8, -6, 0, -6, 4, -6, 0, -6))
    arp(mb, chB, pattern=(0, 1, 2, 3, 4, 3, 2, 1), step=0.5, low="d3", high="d5", n=4, vel=60,
        vel_pattern=(8, -6, 0, -6, 4, -6, 0, -6))
    arp(mb, chA3, pattern=(0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 3, 2, 1), step=0.25, low="f3", high="f5",
        n=4, vel=58, vel_pattern=(10, -8, -2, -8, 4, -8, -2, -8))

    # --- strings pad in B and A'' --------------------------------------------
    st = s.track("strings", 49, pan=0.0, humanize_ms=0, vel_jitter=2)
    pad(st, chB, low="f3", high="d5", n=4, vel=58)
    pad(st, chA3, low="f3", high="d5", n=4, vel=50)

    # --- acoustic bass --------------------------------------------------------
    bs = s.track("bass", 32, pan=0.0, humanize_ms=5, vel_jitter=5)
    bounce = [("R", 1.5), ("R", 0.5), ("5", 1.0), ("A", 1.0)]
    half = [("R", 1.5), ("5", 0.5)]
    bassline(bs, ch, lambda d: bounce if d >= 4 else half, key="F", low="e1", high="d3", prefer="a2",
             vel=90, gate=0.85)

    # --- percussion -------------------------------------------------------------
    dr = s.track("drums", 0, drum=True, humanize_ms=4, vel_jitter=6, swing=0.08, swing_unit=0.25)
    sh = s.track("shaker", 0, drum=True, humanize_ms=3, vel_jitter=8, swing=0.1, swing_unit=0.25, pan=0.3)
    K, RIM, CLAP, SHK, TAMB, CON_H, CON_M, CON_L, SPL, TRI = 36, 37, 39, 70, 54, 63, 62, 64, 55, 81
    # A
    dr.drums(s.bar(A), 8, {K: "x.......o.......", RIM: "....o.......o..."})
    sh.drums(s.bar(A), 8, {SHK: "ogogogogogogogog"})
    # A'
    dr.drums(s.bar(A2), 8, {K: "x.......o.x.....", RIM: "....x.......x..."})
    sh.drums(s.bar(A2), 8, {SHK: "xgogxgogxgogxgog", TAMB: "..g...o...g...o."})
    # B: congas, softer
    dr.drums(s.bar(B), 8, {K: "x.........o.....", RIM: "....o.......o...",
                           CON_M: "..o.......o.....", CON_H: "......o.o.....o.", CON_L: "o..........o...."})
    sh.drums(s.bar(B), 8, {SHK: "ogogogogogogogog"})
    # A'': fuller
    dr.drums(s.bar(A3), 7, {K: "x.....o.x.o.....", CLAP: "....o.......o...", RIM: "....x.......x..."})
    sh.drums(s.bar(A3), 8, {SHK: "xgogxgogxgogxgog", TAMB: "o.g.o.g.o.g.o.g."})
    # turnaround fill (bar 32): conga roll down
    dr.drums(s.bar(31), 1, {K: "x.......x.......", CLAP: "....o...........",
                            CON_H: "........x.o.....", CON_M: "............x.o.", CON_L: "..............x."})
    # soft cymbal/triangle marks at section starts
    for b in (A, B, A3):
        dr.note(s.bar(b), 1.0, SPL, 50)
    for b in (A2,):
        dr.note(s.bar(b), 1.0, TRI, 50)

    settings = {
        "flute": dict(level=0.0, hpf=250, rev=0.32, delay=0.12, high_shelf=(7000, -2.0)),
        "clarinet": dict(level=-2.5, hpf=160, rev=0.3, peaks=[(2500, -1.5, 1.0)]),
        "glock": dict(level=-12.0, hpf=600, rev=0.35, high_shelf=(8000, -3.0)),
        "ukulele": dict(level=-6.5, hpf=180, rev=0.18, peaks=[(3500, -1.5, 1.2)]),
        "marimba": dict(level=-7.5, hpf=150, rev=0.22),
        "strings": dict(level=-12.5, hpf=200, lpf=7000, rev=0.4),
        "bass": dict(level=-7.0, hpf=35, lpf=3500, rev=0.03, peaks=[(250, -2.0, 1.0)]),
        "drums": dict(level=-9.5, hpf=40, rev=0.12),
        "shaker": dict(level=-14.5, hpf=500, rev=0.1, high_shelf=(9000, -3.0)),
    }
    mixp = dict(rev_rt60=1.5, rev_level_db=-5.0, delay_s=0.75 * s.beat_s, delay_fb=0.3)
    return s, settings, mixp


