"""bgm_village - battle, Windmill Village.  Bb major, 120 BPM, 32 bars, polka/musette bounce.

A: musette accordion theme over oom-pah (tuba + pizz "pah").
A': clarinet takes the theme an octave lower, accordion switches to off-beat chords.
B: harmonica sings a lyrical bridge over mandolin tremolo and a walking bass.
C: full band - accordion + clarinet in octaves, glockenspiel, claps, turnaround.
"""
from arrange import arp, bassline, comp_hits, pad, prog
from music_lib import Song

BPM = 120

CH_A = "Bb | Eb | F7 | Bb | Gm | Cm7 | F7 | Bb"
CH_A2 = "Bb | Eb | F7 | Dm7 | Gm | C7 | Cm7 F7 | Bb"
CH_B = "Eb | F | Dm7 | Gm | Cm7 | F7 | Bb/D Eb | F7sus4 F7"
CH_C = "Bb | Eb | F7 | Dm7 | Gm | C7 | Cm7 F7 | Bb F7"

M1_3 = "f5e' d5e' f5e' bb5e' a5e bb5e c6q' | g5e' bb5e' eb6q' d6e c6e bb5q' | a5e' c6e' f5e' a5e' eb6q' c6q'"
MEL_A = M1_3 + (" | d6e c6e bb5q' f5q' r q | g5e' bb5e' d6q' c6e bb5e a5e g5e | eb5e' g5e' c6q' bb5e a5e g5q' |"
                " f5e g5e a5e bb5e c6e a5e f5e eb5e | d5q' bb4q' r h")
MEL_A2 = M1_3 + (" | d6e c6e a5q' f5q' r q | g5e' bb5e' d6q' c6e bb5e a5e g5e | e5e' g5e' c6q' bb5e a5e g5q' |"
                 " eb6e d6e c6e bb5e a5e c6e f6e eb6e | d6q bb5q f5q' r q")
MEL_C = M1_3 + (" | d6e c6e a5q' f5q' r q | g5e' bb5e' d6q' c6e bb5e a5e g5e | e5e' g5e' c6q' bb5e a5e g5q' |"
                " eb6e d6e c6e bb5e a5e c6e f6e eb6e | d6q bb5q a5e c6e eb6e c6e")
MEL_B = ("g5q. f5e eb5q bb4q | c5q. d5e c5h | f5q. e5e d5q a4q | bb4q. c5e d5h | "
         "eb5q. d5e c5q g4q | a4q. bb4e c5q eb5q | d5q f5q eb5q g5q | f5h. r q")
# accordion answers in the harmonica's gaps
ACC_B_FILL = ("r w | r h f5e g5e a5e c6e | r w | r h d5e f5e g5e bb5e | r w | r h c5e eb5e f5e a5e | "
              "r w | r h. c6e a5e")


def all_chords():
    return prog(CH_A, 0) + prog(CH_A2, 8) + prog(CH_B, 16) + prog(CH_C, 24)


def build():
    s = Song("bgm_village", BPM, bars=32)
    A, A2, B, C = 0, 8, 16, 24
    chA, chA2, chB, chC = prog(CH_A, A), prog(CH_A2, A2), prog(CH_B, B), prog(CH_C, C)

    acc = s.track("accordion", 21, bank=8, pan=0.1, humanize_ms=5, vel_jitter=5)
    acc.seq(s.bar(A), MEL_A, v=86, gate=0.82)
    comp_hits(acc, chA2, [(1.0, 0.45), (3.0, 0.45), (3.5, 0.3)], low="f4", high="f5", n=3, vel=64)
    pad(acc, chB, low="f4", high="eb5", n=3, vel=44)
    acc.seq(s.bar(B), ACC_B_FILL, v=70, gate=0.8)
    acc.seq(s.bar(C), MEL_C, v=88, gate=0.82)

    cl = s.track("clarinet", 71, pan=-0.25, humanize_ms=6, vel_jitter=5)
    cl.seq(s.bar(A2), MEL_A2, v=90, gate=0.85, transpose=-12)
    cl.seq(s.bar(C), MEL_C, v=76, gate=0.85, transpose=-12)

    hm = s.track("harmonica", 22, pan=-0.05, humanize_ms=8, vel_jitter=4)
    hm.seq(s.bar(B), MEL_B, v=84, gate=0.95)

    # "pah" off-beats: pizzicato in A and C, mandolin tremolo in B
    pz = s.track("pizz", 45, pan=-0.35, humanize_ms=4, vel_jitter=6)
    comp_hits(pz, chA, [(1.0, 0.4), (3.0, 0.4)], low="d4", high="d5", n=3, vel=74)
    comp_hits(pz, chA2, [(1.0, 0.4), (2.0, 0.3), (3.0, 0.4)], low="d4", high="d5", n=3, vel=66)
    comp_hits(pz, chC, [(1.0, 0.4), (3.0, 0.4)], low="d4", high="d5", n=3, vel=78)

    md = s.track("mandolin", 25, bank=16, pan=0.35, humanize_ms=3, vel_jitter=8)
    arp(md, chB, pattern=(1, 2) * 8, step=0.25, low="bb3", high="bb4", n=3, vel=50,
        vel_pattern=(10, -4, 4, -4), gate=0.9)

    gl = s.track("glock", 9, pan=0.4, humanize_ms=4)
    gl.seq(s.bar(C), M1_3 + " | d6q r h. | r w | r w | r w | r w", v=56, gate=0.5)
    gl.seq(s.bar(A2 + 7), "d6q bb5q f5q r q", v=50, gate=0.5)

    # bass: tuba oom-pah + acoustic bass for definition
    tb = s.track("tuba", 58, pan=0.0, humanize_ms=4, vel_jitter=4)
    oom = [("R", 1.0), ("r", 1.0), ("b", 1.0), ("r", 1.0)]
    oom_h = [("R", 1.0), ("r", 1.0)]
    walk = [("R", 1.0), ("5", 1.0), ("8", 1.0), ("A", 1.0)]
    walk_h = [("R", 1.0), ("A", 1.0)]
    allc = chA + chA2 + chB + chC
    bassline(tb, allc, lambda d: oom if d >= 4 else oom_h, key="Bb", low="f1", high="eb3", prefer="bb2",
             vel=86, gate=0.7)
    ab = s.track("bass", 32, pan=0.0, humanize_ms=4, vel_jitter=4)
    bassline(ab, chA + chA2, lambda d: oom if d >= 4 else oom_h, key="Bb", low="f1", high="eb3",
             prefer="bb2", vel=82, gate=0.6)
    bassline(ab, chB, lambda d: walk if d >= 4 else walk_h, key="Bb", low="f1", high="eb3", prefer="bb2",
             vel=88, gate=0.8)
    bassline(ab, chC, lambda d: [("R", 1.0), ("r", 0.5), ("R", 0.5), ("b", 1.0), ("A", 1.0)] if d >= 4
             else [("R", 1.0), ("A", 1.0)], key="Bb", low="f1", high="eb3", prefer="bb2", vel=86, gate=0.65)

    dr = s.track("drums", 0, drum=True, humanize_ms=3, vel_jitter=6)
    K, SN, RIM, CL, HH, TAM, WBH, WBL, TRI, CR = 36, 38, 37, 39, 42, 54, 76, 77, 81, 49
    dr.drums(s.bar(A), 8, {K: "x.......x.......", SN: "....o.......o...", TAM: "....x.......x..."})
    dr.drums(s.bar(A2), 8, {K: "x.......x.......", RIM: "....x.......x...", TAM: "....x.......x...",
                            HH: "..o...o...o...o."})
    dr.drums(s.bar(B), 8, {K: "x.......x.......", RIM: "....o.......o...", WBH: "x...o...x...o.o.",
                           WBL: "..o.......o....."})
    dr.drums(s.bar(C), 7, {K: "x.......x.....o.", SN: "....x.......x...", CL: "....o.......o...",
                           HH: "x.o.x.o.x.o.x.o.", TAM: "..o...o...o...o."})
    dr.drums(s.bar(C + 7), 1, {K: "x.......x.......", SN: "....x...o.o.x.xx", HH: "x.o.x.o........."})
    dr.fill(s.bar(A + 7) + 3.0, {SN: "x.xx"})
    dr.fill(s.bar(A2 + 7) + 2.0, {SN: "x...x.x.", WBH: "..x.....", WBL: "......x."})
    dr.fill(s.bar(B + 7) + 3.0, {SN: "xoxx", TAM: "x..."})
    for b in (A, B):
        dr.note(s.bar(b), 1.0, CR, 64)
    for b in (A2, C):
        dr.note(s.bar(b), 1.0, TRI, 60)

    settings = {
        "accordion": dict(level=-0.5, hpf=220, rev=0.22, peaks=[(1800, -1.5, 1.0)], high_shelf=(6500, -3.0)),
        "clarinet": dict(level=-1.0, hpf=150, rev=0.25),
        "harmonica": dict(level=0.0, hpf=250, rev=0.3, delay=0.1, high_shelf=(6000, -3.0),
                          peaks=[(2500, -2.0, 1.0)]),
        "pizz": dict(level=-6.5, hpf=180, rev=0.2),
        "mandolin": dict(level=-9.0, hpf=250, rev=0.25, high_shelf=(7000, -3.0)),
        "glock": dict(level=-12.0, hpf=700, rev=0.35, high_shelf=(8000, -3.0)),
        "tuba": dict(level=-5.0, hpf=35, lpf=2000, rev=0.05, peaks=[(200, -2.0, 1.0)]),
        "bass": dict(level=-7.0, hpf=40, lpf=3000, rev=0.02),
        "drums": dict(level=-7.0, hpf=35, rev=0.12, high_shelf=(9000, -3.0)),
    }
    mixp = dict(rev_rt60=1.4, rev_level_db=-6.0, delay_s=0.75 * s.beat_s, delay_fb=0.25)
    return s, settings, mixp
