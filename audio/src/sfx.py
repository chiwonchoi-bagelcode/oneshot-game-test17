"""All SFX definitions.  Each function returns an unnormalised mono signal;
SFX[name] = (function, peak cap dBFS, max-100ms loudness target, nominal duration s).
Deterministic: every sound draws from its own crc32-seeded RNG."""
import os
import zlib

import numpy as np

from common import BUILD_DIR, OUT_DIR, SR, db2lin, decode_audio, encode_mp3, write_wav
from music_lib import P
from sfx_lib import (Canvas, N, T, add_room, lv, bell, blob, bp, bubble, bubble_cloud, clink, env_ar, env_points,
                     env_swell, finalize, formant, fs_notes, glide, hp, hz, lp, osc, pent, pink, plop, sparkle,
                     splash, squelch, svf, voice, white, whoosh, GLASS, BELL)


def R(name):
    return np.random.default_rng(zlib.crc32(name.encode()))


# ============================================================================
# UI
# ============================================================================
def ui_tap():
    r = R("ui_tap")
    c = Canvas(0.07)
    c.add(bubble(1350, 1.0, xi=0.35, dur=0.05), 0.0)
    c.add(lp(white(N(0.004), r), 3000) * env_ar(0.004, 0.0005, 0.0012), 0.0, 0.25)
    c.add(osc(glide(900, 1300, 0.03), harmonics=((1, 1.0),)) * env_ar(0.03, 0.001, 0.01), 0.0, 0.3)
    return c.x


def ui_open():
    r = R("ui_open")
    c = Canvas(0.27)
    c.add(whoosh(0.22, 500, 2600, r, peak=0.7, q=1.6), 0.0, 0.5)
    c.add(osc(glide(520, 1040, 0.16), harmonics=((1, 1.0), (2, 0.15))) * env_swell(0.16, 0.12, 1.5, 0.03), 0.0, 0.22)
    c.add(bubble(1100, 1.0, xi=0.45), 0.15, 0.6)
    c.add(bubble(1500, 0.6, xi=0.4), 0.19, 0.5)
    return add_room(c.x, 0.12, 0.25)


def ui_close():
    r = R("ui_close")
    c = Canvas(0.22)
    c.add(whoosh(0.18, 2400, 500, r, peak=0.35, q=1.6), 0.0, 0.5)
    c.add(osc(glide(900, 450, 0.14), harmonics=((1, 1.0), (2, 0.12))) * env_ar(0.14, 0.005, 0.05), 0.0, 0.25)
    c.add(bubble(620, 0.8, xi=0.05), 0.09, 0.6)
    return add_room(c.x, 0.1, 0.22)


def ui_confirm():
    c = Canvas(0.40)
    c.add(lv(fs_notes([(0.0, 0.25, P("d6"), 74), (0.075, 0.35, P("a6"), 84)], 8, name="confirm"), -14), 0.0)
    c.add(lv(bell(hz("d6"), 0.35, 0.12, attack=0.003), -19), 0.0)
    c.add(lv(bell(hz("a6"), 0.32, 0.14, attack=0.003), -18), 0.075)
    return add_room(c.x, 0.15, 0.3)


def ui_locked():
    r = R("ui_locked")
    c = Canvas(0.26)
    f = glide(250, 175, 0.2, tau=0.02)
    c.add(osc(f, harmonics=((1, 1.0), (2.7, 0.08))) * env_ar(0.2, 0.002, 0.06), 0.0)
    c.add(lp(white(N(0.02), r), 900) * env_ar(0.02, 0.001, 0.005), 0.0, 0.3)
    c.add(osc(glide(205, 150, 0.12, tau=0.02)) * env_ar(0.12, 0.002, 0.04), 0.085, 0.45)
    return lp(c.x, 2200)


# ============================================================================
# spray
# ============================================================================
def _stream_spectrum(n, rng, seed_shift=0):
    """Periodic (circular) water-stream hiss of length n samples."""
    X = (rng.standard_normal(n // 2 + 1) + 1j * rng.standard_normal(n // 2 + 1))
    f = np.fft.rfftfreq(n, 1 / SR)
    # rising from 300 Hz, broad hump 1.5-4.5 kHz, soft roll-off above 6 kHz
    g = (1 / (1 + (350 / np.maximum(f, 1)) ** 2)) * (1 / (1 + (f / 4500) ** 3.0))
    g *= 1 + 0.9 * np.exp(-0.5 * ((np.log(np.maximum(f, 1)) - np.log(2300)) / 0.6) ** 2)
    g[0] = 0
    y = np.fft.irfft(X * g, n)
    return y / np.std(y)


def _periodic_lfnoise(n, rng, max_hz):
    X = (rng.standard_normal(n // 2 + 1) + 1j * rng.standard_normal(n // 2 + 1))
    f = np.fft.rfftfreq(n, 1 / SR)
    X[f > max_hz] = 0
    X[0] = 0
    y = np.fft.irfft(X, n)
    return y / (np.std(y) + 1e-12)


def spray_loop():
    """Exactly 2.000 s, sample-periodic: every layer is built circularly."""
    r = R("spray_loop")
    n = N(2.0)
    hiss = _stream_spectrum(n, r)
    t = np.arange(n) / SR
    am = 1 + 0.10 * np.sin(2 * np.pi * 3 * t / 2.0) + 0.07 * np.sin(2 * np.pi * 7 * t / 2.0 + 1.0) \
        + 0.10 * _periodic_lfnoise(n, r, 18.0)
    y = hiss * am * 0.55
    # gurgle layer (low, periodic)
    gur = _periodic_lfnoise(n, r, 600.0)
    Xg = np.fft.rfft(gur)
    f = np.fft.rfftfreq(n, 1 / SR)
    Xg *= np.clip((f - 110) / 160, 0, 1) ** 2  # smooth low edge (no brick wall)
    gur = np.fft.irfft(Xg, n)
    gur /= np.std(gur)
    y += 0.07 * gur * (1 + 0.4 * _periodic_lfnoise(n, r, 6.0))
    # bubbles wrapped circularly
    for i in range(95):
        at = int(r.uniform(0, n))
        f0 = np.exp(r.uniform(np.log(500), np.log(2800)))
        b = bubble(f0, r.uniform(0.2, 0.6), xi=r.uniform(0.08, 0.35))
        idx = (at + np.arange(len(b))) % n
        np.add.at(y, idx, b * 1.5)
    return y


def spray_start():
    r = R("spray_start")
    c = Canvas(0.21)
    n = N(0.21)
    src = white(n, r)
    fc = glide(7000, 2600, 0.21, tau=0.04)
    burst = svf(src, fc, 0.8, "bp") * env_points(0.21, [(0, 0), (0.003, 1.0), (0.04, 0.75), (0.21, 0.42)])
    c.add(burst, 0.0, 1.0)
    c.add(hp(pink(n, r), 1500) * env_points(0.21, [(0, 0), (0.01, 0.25), (0.21, 0.3)]), 0.0, 0.5)
    c.add(osc(glide(140, 70, 0.05)) * env_ar(0.05, 0.001, 0.015), 0.0, 0.5)
    c.add(bubble_cloud(0.18, 10, 600, 2600, r, tscale=0.06), 0.01, 0.35)
    return lp(c.x, 9000)


def pressure_full():
    r = R("pressure_full")
    c = Canvas(0.65)
    d = 0.42
    c.add(osc(glide(85, 240, d), harmonics=((1, 1.0), (2, 0.25), (3, 0.08))) * env_swell(d, 0.3, 1.6, 0.06), 0.0, 0.9)
    c.add(whoosh(d, 350, 3200, r, peak=0.8, q=2.2), 0.0, 0.6)
    for i, nt in enumerate(["g6", "c7", "e7", "g7"]):
        c.add(bell(hz(nt), 0.3, 0.07, GLASS), 0.30 + i * 0.045, 0.32)
    c.add(bubble_cloud(0.2, 8, 900, 3000, r, tscale=0.05), 0.3, 0.3)
    return add_room(c.x, 0.15, 0.35)


# ============================================================================
# goo
# ============================================================================
def goo_hit(k):
    r = R("goo_hit_%d" % k)
    dur = [0.09, 0.10, 0.11][k - 1]
    c = Canvas(dur + 0.02)
    f0, f1 = [(430, 240), (380, 210), (480, 270)][k - 1]
    c.add(blob(f0, f1, dur, wob_hz=30, wob_depth=0.05, tau=0.022), 0.0, 1.0)
    c.add(squelch(dur, r, 2600, 700, q=1.0, tau=0.012), 0.0, 0.35)
    c.add(bubble([1500, 1250, 1750][k - 1], 0.35, xi=0.3), 0.012, 1.0)
    return c.x


def goo_burst(k):
    """Jelly 'plop' + bright water splash + bubbles + a two-note sparkle."""
    r = R("goo_burst_%d" % k)
    dur = [0.42, 0.46, 0.38][k - 1]
    c = Canvas(dur + 0.1)
    hi, lo = [(820, 150), (700, 130), (900, 170)][k - 1]
    c.add(plop(hi, lo, 0.12, tau_f=0.011, tau_a=0.036), 0.0, [1.0, 0.72, 0.82][k - 1])
    c.add(blob(lo * 1.25, lo * 0.95, 0.14, wob_hz=14, wob_depth=0.09, tau=0.04), 0.012, 0.25)
    c.add(splash(dur * 0.8, r, f_start=5200, f_end=1400, q=0.85, tau=0.075, hp_fc=700), 0.004, 0.8)
    c.add(splash(0.08, r, f_start=2200, f_end=900, q=1.2, tau=0.02, hp_fc=300), 0.0, 0.35)
    c.add(bubble_cloud(dur * 0.7, 16, 700, 3200, r, amp=(0.2, 0.7), tscale=0.08), 0.015, 0.55)
    notes = [("e7", "a7"), ("d7", "g7"), ("g7", "c8")][k - 1]
    c.add(bell(hz(notes[0]) * 0.75, 0.25, 0.05, GLASS), 0.045, 0.16)
    c.add(bell(hz(notes[1]) * 0.75, 0.25, 0.06, GLASS), 0.085, 0.14)
    return add_room(c.x, 0.12, 0.3)


def goo_burst_big():
    r = R("goo_burst_big")
    c = Canvas(1.0)
    c.add(plop(560, 85, 0.3, tau_f=0.02, tau_a=0.09), 0.0, 1.0)
    c.add(osc(glide(110, 45, 0.3)) * env_ar(0.3, 0.003, 0.09), 0.0, 0.6)
    c.add(blob(130, 100, 0.4, wob_hz=9, wob_depth=0.12, tau=0.12), 0.02, 0.35)
    c.add(splash(0.8, r, f_start=4800, f_end=900, q=0.75, tau=0.17, hp_fc=500), 0.006, 0.7)
    c.add(splash(0.15, r, f_start=1800, f_end=600, q=1.1, tau=0.04, hp_fc=200), 0.0, 0.45)
    c.add(bubble_cloud(0.7, 45, 400, 3000, r, amp=(0.2, 0.8), tscale=0.18), 0.02, 0.6)
    c.add(sparkle(0.7, 7, 2000, 4200, r, rising=False, tau=0.08, notes=pent("c7", "c8"), start=0.08), 0.0, 0.18)
    return add_room(c.x, 0.15, 0.45)


def goo_split():
    r = R("goo_split")
    c = Canvas(0.32)
    c.add(squelch(0.18, r, 1800, 400, q=1.6, tau=0.05, wob_hz=18), 0.0, 0.6)
    c.add(blob(300, 440, 0.22, wob_hz=13, wob_depth=0.08, tau=0.07), 0.03, 0.75)
    c.add(blob(300, 190, 0.24, wob_hz=11, wob_depth=0.08, tau=0.075), 0.05, 0.75)
    c.add(bubble(900, 0.5, xi=0.3), 0.06)
    c.add(bubble(700, 0.4, xi=0.3), 0.11)
    return c.x


# ============================================================================
# enemies
# ============================================================================
def enemy_spit():
    r = R("enemy_spit")
    c = Canvas(0.22)
    c.add(lp(white(N(0.012), r), 1800) * env_ar(0.012, 0.0008, 0.004), 0.0, 0.6)
    c.add(osc(glide(170, 90, 0.04)) * env_ar(0.04, 0.001, 0.012), 0.0, 0.5)
    f = glide(560, 380, 0.13)
    c.add(voice(f, env_ar(0.13, 0.008, 0.045), formants=((420, 3, 1.0), (1000, 4, 0.4)), harmonics=6, mix_dry=0.5),
          0.012, 0.8)
    c.add(bubble(1300, 0.4, xi=0.3), 0.1)
    return lp(c.x, 4500)


def enemy_charge():
    r = R("enemy_charge")
    d = 0.5
    t = T(d)
    f = glide(90, 230, d)
    src = osc(f, harmonics=tuple((k, 1.0 / k) for k in range(1, 12)), rand_phase=4)
    trem = 1 - 0.55 * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(glide(24, 38, d)) / SR))
    y = svf(src, glide(500, 1600, d), 1.5, "lp") * trem
    e = env_points(d, [(0, 0), (0.05, 0.45), (0.44, 1.0), (0.5, 0.0)])
    nz = svf(white(N(d), r), glide(300, 1500, d), 2.0, "bp") * 0.25
    return lp((y + nz) * e, 2500)


def enemy_dash():
    r = R("enemy_dash")
    c = Canvas(0.32)
    c.add(whoosh(0.3, 350, 700, r, peak=0.35, q=1.2, f_mid=1900), 0.0, 1.0)
    c.add(osc(glide(220, 140, 0.2)) * env_swell(0.2, 0.07, 2, 0.05), 0.0, 0.12)
    return c.x


def enemy_land():
    r = R("enemy_land")
    c = Canvas(0.36)
    c.add(osc(glide(115, 48, 0.3, tau=0.06), harmonics=((1, 1.0), (2, 0.2))) * env_ar(0.3, 0.002, 0.08), 0.0, 1.0)
    t = T(0.3)
    jig = osc(165, 0.3) * (0.5 + 0.5 * np.sin(2 * np.pi * 12 * t)) * env_ar(0.3, 0.01, 0.1)
    c.add(jig, 0.02, 0.28)
    c.add(squelch(0.15, r, 1400, 300, q=1.2, tau=0.04), 0.0, 0.5)
    c.add(bubble_cloud(0.2, 6, 250, 700, r, tscale=0.06), 0.02, 0.4)
    return lp(c.x, 3000)


def boss_roar():
    r = R("boss_roar")
    d = 1.2
    t = T(d)
    f0 = np.interp(t, [0, 0.3, 0.8, 1.2], [72, 96, 82, 60]) * (1 + 0.02 * np.sin(2 * np.pi * 5.5 * t))
    src = osc(f0, harmonics=tuple((k, 1.0 / k ** 1.1) for k in range(1, 40)), rand_phase=5)
    F1 = np.interp(t, [0, 0.4, 1.2], [520, 700, 480])
    F2 = np.interp(t, [0, 0.4, 1.2], [950, 1150, 850])
    y = svf(src, F1, 4.0, "bp") + 0.6 * svf(src, F2, 5.0, "bp") + 0.15 * lp(src, 400)
    gargle = 1 - 0.45 * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, 1.2], [20, 26])) / SR))
    y *= gargle
    y += 0.3 * osc(f0, harmonics=((1, 1.0),))
    e = env_points(d, [(0, 0), (0.08, 0.85), (0.35, 1.0), (0.85, 0.8), (1.2, 0.0)])
    y = y * e
    c = Canvas(d + 0.1)
    c.add(y, 0.0, 1.0)
    c.add(bubble_cloud(1.1, 70, 180, 900, r, amp=(0.2, 0.8), xi=(0.1, 0.3), times="uniform", decay_amp=False),
          0.05, 0.55)
    c.add(bubble(420, 0.8, xi=0.6), 1.05, 0.6)  # cute "blub" at the end
    return lp(c.x, 3500)


# ============================================================================
# player
# ============================================================================
def player_hit():
    r = R("player_hit")
    c = Canvas(0.32)
    c.add(lp(white(N(0.25), r), 2600) * env_ar(0.25, 0.001, 0.045), 0.0, 0.7)
    c.add(bp(white(N(0.06), r), 700, 2200) * env_ar(0.06, 0.0008, 0.015), 0.0, 0.6)
    c.add(osc(glide(210, 105, 0.16), harmonics=((1, 1.0), (2, 0.2))) * env_ar(0.16, 0.002, 0.05), 0.0, 0.9)
    f = glide(290, 190, 0.14)
    c.add(voice(f, env_ar(0.14, 0.01, 0.045), formants=((620, 3, 1.0), (1150, 4, 0.5)), harmonics=8, mix_dry=0.3),
          0.02, 0.6)
    c.add(bubble_cloud(0.22, 9, 500, 1800, r, tscale=0.06), 0.01, 0.4)
    return lp(c.x, 5000)


def shield_pop():
    r = R("shield_pop")
    c = Canvas(0.26)
    c.add(bp(white(N(0.01), r), 2500, 7000) * env_ar(0.01, 0.0004, 0.0018), 0.0, 0.7)
    c.add(bubble(2100, 1.0, xi=0.7, dur=0.05), 0.001, 0.6)
    c.add(bp(white(N(0.12), r), 3500, 8000) * env_ar(0.12, 0.002, 0.03), 0.004, 0.18)
    c.add(bell(hz("e7"), 0.2, 0.05, GLASS), 0.03, 0.22)
    c.add(bell(hz("b7") / 1.0, 0.2, 0.04, GLASS), 0.06, 0.15)
    return add_room(c.x, 0.12, 0.25)


def pickup_xp():
    c = Canvas(0.13)
    c.add(bubble(820, 1.0, xi=0.9, dur=0.09), 0.0, 0.8)
    f = glide(1050, 1580, 0.11, tau=0.012)
    c.add(osc(f, harmonics=((1, 1.0), (2, 0.08))) * env_ar(0.11, 0.002, 0.035), 0.0, 0.55)
    return lp(c.x, 7000)


def pickup_coin():
    c = Canvas(0.17)
    c.add(clink(hz("b6"), 0.1, 0.03), 0.0, 0.7)
    c.add(clink(hz("e7"), 0.15, 0.06), 0.045, 0.9)
    return lp(c.x, 9000)


def heal():
    r = R("heal")
    c = Canvas(0.55)
    for i, nt in enumerate(["c6", "e6", "g6", "c7", "e7"]):
        c.add(bell(hz(nt), 0.35, 0.12, BELL), i * 0.055, 0.45 - i * 0.03)
    sw = sum(osc(hz(nt), 0.5) for nt in ("c5", "e5", "g5")) * env_swell(0.5, 0.18, 1.5, 0.12)
    c.add(sw, 0.0, 0.12)
    c.add(whoosh(0.45, 1800, 6000, r, peak=0.5, q=1.5), 0.0, 0.12)
    c.add(sparkle(0.45, 5, 2500, 5000, r, rising=True, tau=0.05, notes=pent("c7", "c8"), start=0.15), 0.0, 0.15)
    return add_room(c.x, 0.2, 0.4)


def cocoon_hit():
    r = R("cocoon_hit")
    c = Canvas(0.13)
    c.add(squelch(0.12, r, 1300, 380, q=1.3, tau=0.03, wob_hz=22), 0.0, 0.7)
    c.add(blob(270, 170, 0.11, wob_hz=20, wob_depth=0.06, tau=0.03), 0.0, 0.8)
    c.add(bubble(800, 0.3, xi=0.2), 0.02)
    return lp(c.x, 3500)


def chirp(k):
    """Wordless 'pyu!' animal chirps: high / mid / low."""
    base = [1250.0, 920.0, 680.0][k - 1]
    dur = [0.2, 0.26, 0.24][k - 1]
    t = T(dur)
    if k == 1:   # pyu!
        f = np.interp(t, [0, 0.03, 0.09, dur], [0.85, 1.28, 1.0, 0.86]) * base
    elif k == 2:  # pyu-i
        f = np.interp(t, [0, 0.03, 0.09, 0.12, 0.16, dur], [0.85, 1.25, 0.95, 0.95, 1.3, 1.15]) * base
    else:        # pwo~
        f = np.interp(t, [0, 0.04, 0.12, dur], [0.9, 1.22, 1.05, 0.8]) * base
    f *= 1 + 0.025 * np.sin(2 * np.pi * 28 * t) * np.clip((t - 0.08) / 0.05, 0, 1)
    if k == 2:
        e = env_points(dur, [(0, 0), (0.008, 1.0), (0.1, 0.55), (0.12, 0.25), (0.135, 0.9), (dur, 0.0)])
    else:
        e = env_points(dur, [(0, 0), (0.008, 1.0), (0.06, 0.85), (dur, 0.0)]) ** 1.3
    y = voice(f, e, formants=((base * 1.5, 2.5, 0.6), (base * 3.0, 3.0, 0.25)), harmonics=5, tilt=1.8,
              mix_dry=0.9)
    return add_room(y, 0.1, 0.2)


def room_clear():
    """Sparkle wave rising across ~0.55 s + a warm C-major chord chime (vibes + celesta)."""
    r = R("room_clear")
    c = Canvas(1.35)
    notes = pent("c6", "c8")
    for i in range(14):
        f = notes[min(len(notes) - 1, int(i * len(notes) / 14))]
        c.add(lv(bell(f, 0.4, 0.09, GLASS), -21 + 3 * np.sin(np.pi * i / 13)), i * 0.04)
    chord = [(0.12, 1.1, P(nt), 78) for nt in ("c5", "e5", "g5", "c6")]
    c.add(lv(fs_notes(chord, 11, name="rc_vibes"), -14), 0.0)
    c.add(lv(fs_notes([(0.12, 1.0, P(nt), 70) for nt in ("e6", "g6", "c7")], 8, name="rc_cel"), -17), 0.0)
    sw = sum(osc(hz(nt), 1.2) for nt in ("c4", "g4", "e5")) * env_swell(1.2, 0.3, 1.5, 0.35)
    c.add(lv(sw, -24), 0.05)
    c.add(lv(whoosh(0.6, 1500, 6000, r, peak=0.6, q=1.2), -25), 0.0)
    return add_room(c.x, 0.22, 0.6)


def gate_open():
    """Magical whoosh + light wooden creak (stick-slip pulses into wood resonances) + chime."""
    r = R("gate_open")
    c = Canvas(0.72)
    c.add(lv(whoosh(0.62, 300, 3200, r, peak=0.65, q=1.3), -15), 0.0)
    n = N(0.42)
    pulses = np.zeros(n)
    tpos = 0.04
    while tpos < 0.4:
        rate = np.interp(tpos, [0.04, 0.4], [28, 75]) * r.uniform(0.85, 1.15)
        pulses[int(tpos * SR)] = r.uniform(0.6, 1.0)
        tpos += 1.0 / rate
    wood = bp(pulses, 300, 480) * 3 + bp(pulses, 1000, 1350) * 2 + bp(pulses, 2000, 2500)
    wood *= env_points(0.42, [(0, 0), (0.08, 1.0), (0.32, 0.8), (0.42, 0)])
    c.add(lv(lp(wood, 3500), -21), 0.02)
    c.add(lv(fs_notes([(0.0, 0.6, P("g6"), 70), (0.06, 0.6, P("c7"), 64)], 8, name="gate_cel"), -16), 0.42)
    c.add(lv(sparkle(0.25, 4, 2500, 4500, r, rising=True, tau=0.05, notes=pent("c7", "c8"), start=0.0), -22), 0.44)
    return add_room(c.x, 0.2, 0.45)


def level_up():
    """Ascending C-major arpeggio (celesta + marimba), glockenspiel cap, shimmer."""
    r = R("level_up")
    c = Canvas(1.05)
    arp_notes = ["c5", "e5", "g5", "c6", "e6", "g6", "c7"]
    c.add(lv(fs_notes([(i * 0.07, 0.8, P(nt), 72 + i * 3) for i, nt in enumerate(arp_notes)], 8, name="lu_cel"),
             -13), 0.0)
    c.add(lv(fs_notes([(i * 0.07, 0.5, P(nt), 70) for i, nt in enumerate(arp_notes[:5])], 12, name="lu_mar"), -18),
          0.0)
    c.add(lv(fs_notes([(0.49, 0.8, P("c7"), 76), (0.49, 0.8, P("g6"), 64)], 9, name="lu_gl"), -18), 0.0)
    c.add(lv(sparkle(0.5, 7, 2500, 5000, r, tau=0.06, notes=pent("c7", "c8"), start=0.45), -22), 0.0)
    c.add(lv(whoosh(0.55, 800, 5000, r, peak=0.85, q=1.3), -26), 0.0)
    return add_room(c.x, 0.2, 0.5)


def card_pick():
    r = R("card_pick")
    c = Canvas(0.42)
    c.add(lv(whoosh(0.15, 800, 3200, r, peak=0.75, q=1.4), -16), 0.0)
    c.add(lv(fs_notes([(0.0, 0.4, P("a6"), 84)], 9, name="card_gl"), -14), 0.1)
    c.add(lv(bell(hz("a6"), 0.3, 0.09), -19), 0.1)
    return add_room(c.x, 0.15, 0.3)


def revive():
    """Rising refill swell (noise + chord + upward bubbles) ending in a bright celesta ding."""
    r = R("revive")
    c = Canvas(1.05)
    t2 = T(1.0)
    sw = 0
    for nt in ("c4", "g4", "c5", "e5"):
        sw = sw + osc(hz(nt) * (1 + 0.003 * np.sin(2 * np.pi * 5 * t2)), harmonics=((1, 1.0), (2, 0.2)))
    c.add(lv(sw * env_swell(1.0, 0.75, 2.2, 0.07), -17), 0.0)
    c.add(lv(whoosh(0.8, 300, 4200, r, peak=0.92, q=1.6, attack_pow=2.5), -15), 0.0)
    c.add(lv(bubble_cloud(0.7, 22, 500, 2600, r, times="uniform", decay_amp=False, amp=(0.1, 0.4), xi=(0.3, 0.6)),
             -22), 0.05)
    c.add(lv(fs_notes([(0.0, 0.8, P("c7"), 80), (0.0, 0.8, P("e6"), 70), (0.0, 0.8, P("g6"), 70)], 8,
                      name="rev_cel"), -13), 0.74)
    c.add(lv(sparkle(0.3, 5, 2500, 5000, r, tau=0.06, notes=pent("c7", "c8")), -21), 0.76)
    return add_room(c.x, 0.2, 0.5)


def coin_tick():
    c = Canvas(0.06)
    c.add(clink(hz("g7") * 0.75, 0.05, 0.012), 0.0, 1.0)
    return lp(c.x, 8000)


def coin_burst():
    r = R("coin_burst")
    c = Canvas(0.75)
    c.add(plop(500, 160, 0.1, tau_f=0.01, tau_a=0.03), 0.0, 0.45)
    t = 0.01
    i = 0
    freqs = [hz("e7"), hz("b6"), hz("g#7") / 1.0, hz("c#7")]
    while t < 0.58:
        f = freqs[r.integers(0, len(freqs))] * r.uniform(0.985, 1.015) * 0.75
        c.add(clink(f, 0.18, r.uniform(0.04, 0.07)), t, 0.5 * (1 - 0.6 * t / 0.6) * r.uniform(0.6, 1.0))
        t += r.exponential(0.038) + 0.012
        i += 1
    return add_room(c.x, 0.15, 0.3)


def upgrade_buy():
    r = R("upgrade_buy")
    c = Canvas(0.72)
    c.add(bp(white(N(0.05), r), 3000, 8000) * env_ar(0.05, 0.001, 0.012), 0.0, 0.35)  # "cha"
    c.add(clink(hz("g6"), 0.15, 0.04), 0.0, 0.45)
    c.add(bell(hz("g6"), 0.6, 0.22, BELL), 0.09, 0.45)  # "ching"
    c.add(bell(hz("d7"), 0.6, 0.2, BELL), 0.09, 0.35)
    c.add(clink(hz("b6"), 0.3, 0.1), 0.09, 0.3)
    c.add(whoosh(0.55, 500, 900, r, peak=0.4, q=1.1, f_mid=2600), 0.05, 0.45)
    c.add(bubble_cloud(0.45, 14, 600, 2600, r, tscale=0.15), 0.08, 0.35)
    return add_room(c.x, 0.18, 0.4)


def gift_collect():
    r = R("gift_collect")
    c = Canvas(0.47)
    c.add(plop(950, 300, 0.07, tau_f=0.008, tau_a=0.02), 0.0, 0.8)
    c.add(bp(white(N(0.01), r), 1500, 5000) * env_ar(0.01, 0.0005, 0.002), 0.0, 0.3)
    for i, nt in enumerate(["e7", "b6", "g#7", "e7"]):
        c.add(clink(hz(nt) * 0.75, 0.18, 0.05), 0.07 + i * 0.06, 0.45 - 0.05 * i)
    c.add(sparkle(0.3, 4, 3000, 5000, r, tau=0.04, notes=pent("c7", "c8")), 0.1, 0.1)
    return add_room(c.x, 0.15, 0.3)


def star(k):
    """Star ding, rising per star (E6, G6, C7); the third star adds a celesta third + more sparkle."""
    r = R("star_%d" % k)
    nt = ["e6", "g6", "c7"][k - 1]
    c = Canvas(0.42)
    c.add(lv(fs_notes([(0.0, 0.35, P(nt), 88)], 9, name="star_gl%d" % k), -14), 0.0)
    c.add(lv(bell(hz(nt), 0.4, 0.12, BELL), -18), 0.0)
    if k == 3:
        c.add(lv(fs_notes([(0.0, 0.35, P("e6"), 70), (0.0, 0.35, P("g6"), 70)], 8, name="star_cel3"), -17), 0.0)
    c.add(lv(sparkle(0.3, 2 + k, 3000, 5500, r, tau=0.04, notes=pent("c7", "c8"), start=0.03), -22), 0.0)
    return add_room(c.x, 0.15, 0.35)


def whoosh_sfx():
    r = R("whoosh")
    return whoosh(0.35, 400, 700, r, peak=0.42, q=1.1, f_mid=1700)


def unlock():
    """'New feature unlocked': celesta arpeggio G-C-E-G, glockenspiel C7, warm lift, shimmer."""
    r = R("unlock")
    c = Canvas(0.95)
    arp_notes = ["g5", "c6", "e6", "g6"]
    c.add(lv(fs_notes([(i * 0.09, 0.8, P(nt), 76) for i, nt in enumerate(arp_notes)], 8, name="unl_cel"), -13), 0.0)
    c.add(lv(fs_notes([(0.36, 0.8, P("c7"), 84)], 9, name="unl_gl"), -16), 0.0)
    c.add(lv(osc(glide(110, 220, 0.3), harmonics=((1, 1.0), (2, 0.2))) * env_swell(0.3, 0.2, 1.5, 0.08), -25), 0.0)
    c.add(lv(whoosh(0.4, 600, 4000, r, peak=0.85, q=1.4), -22), 0.0)
    c.add(lv(sparkle(0.5, 8, 2500, 5000, r, tau=0.06, notes=pent("c7", "c8"), start=0.36), -21), 0.0)
    return add_room(c.x, 0.2, 0.55)


def rescue():
    """Biggest reward: harp glissando up -> bell chord (celesta + glock + bell) -> sparkle shower
    -> happy little animal chirps, over a faint warm pad."""
    r = R("rescue")
    c = Canvas(1.65)
    gl = pent("c5", "c7")
    harp = [(i * (0.42 / len(gl)), 1.2, int(round(69 + 12 * np.log2(f / 440))), 66 + i) for i, f in enumerate(gl)]
    c.add(lv(fs_notes(harp, 46, name="resc_harp"), -13), 0.0)
    c.add(lv(fs_notes([(0.0, 1.2, P(nt), 84) for nt in ("c6", "e6", "g6")], 8, name="resc_cel"), -14), 0.44)
    c.add(lv(fs_notes([(0.0, 1.0, P("c7"), 86), (0.12, 1.0, P("g7"), 64)], 9, name="resc_gl"), -19), 0.44)
    c.add(lv(bell(hz("c6"), 1.0, 0.35, BELL), -19), 0.44)
    sw = sum(osc(hz(nt), 1.15) for nt in ("c4", "g4", "c5", "e5")) * env_swell(1.15, 0.25, 1.4, 0.4)
    c.add(lv(sw, -27), 0.42)
    c.add(lv(sparkle(0.95, 14, 2200, 5200, r, tau=0.07, notes=pent("c7", "c8")), -19), 0.46)
    c.add(lv(chirp(1), -17), 0.82)
    c.add(lv(chirp(2), -20), 1.02)
    return add_room(c.x, 0.2, 0.6)


# name: (generator, peak cap dBFS, target max-100ms loudness (LUFS-like), nominal duration s)
# The final gain is min(peak cap, loudness target): frequent sounds sit low, rewards highest.
SFX = {
    "ui_tap": (ui_tap, -8.0, -20.0, 0.06), "ui_open": (ui_open, -4.0, -15.0, 0.25),
    "ui_close": (ui_close, -4.5, -16.0, 0.2), "ui_confirm": (ui_confirm, -3.0, -13.5, 0.35),
    "ui_locked": (ui_locked, -4.0, -15.0, 0.25),
    "spray_start": (spray_start, -4.0, -15.0, 0.2), "spray_loop": (spray_loop, -7.5, None, 2.0),
    "pressure_full": (pressure_full, -3.0, -13.5, 0.6),
    "goo_hit_1": (lambda: goo_hit(1), -8.0, -19.0, 0.1), "goo_hit_2": (lambda: goo_hit(2), -8.0, -19.0, 0.1),
    "goo_hit_3": (lambda: goo_hit(3), -8.0, -19.0, 0.11),
    "goo_burst_1": (lambda: goo_burst(1), -3.0, -13.0, 0.42), "goo_burst_2": (lambda: goo_burst(2), -3.0, -13.0, 0.46),
    "goo_burst_3": (lambda: goo_burst(3), -3.0, -13.0, 0.38), "goo_burst_big": (goo_burst_big, -3.0, -12.0, 0.9),
    "goo_split": (goo_split, -3.5, -13.5, 0.3), "enemy_spit": (enemy_spit, -4.0, -14.0, 0.2),
    "enemy_charge": (enemy_charge, -3.5, -14.5, 0.5), "enemy_dash": (enemy_dash, -4.5, -15.5, 0.3),
    "enemy_land": (enemy_land, -3.0, -13.5, 0.35), "boss_roar": (boss_roar, -3.0, -12.5, 1.2),
    "player_hit": (player_hit, -3.0, -12.5, 0.3), "shield_pop": (shield_pop, -3.5, -14.5, 0.25),
    "pickup_xp": (pickup_xp, -8.0, -19.0, 0.12), "pickup_coin": (pickup_coin, -4.5, -14.5, 0.15),
    "heal": (heal, -3.0, -13.0, 0.5), "cocoon_hit": (cocoon_hit, -7.0, -18.0, 0.12),
    "rescue": (rescue, -3.0, -11.5, 1.6),
    "chirp_1": (lambda: chirp(1), -3.5, -13.5, 0.25), "chirp_2": (lambda: chirp(2), -3.5, -13.5, 0.25),
    "chirp_3": (lambda: chirp(3), -3.5, -13.5, 0.25),
    "room_clear": (room_clear, -3.0, -12.0, 1.3), "gate_open": (gate_open, -3.0, -13.5, 0.7),
    "level_up": (level_up, -3.0, -12.0, 1.0), "card_pick": (card_pick, -3.0, -13.5, 0.4),
    "revive": (revive, -3.0, -12.0, 1.0), "coin_tick": (coin_tick, -9.0, -21.0, 0.05),
    "coin_burst": (coin_burst, -3.0, -12.5, 0.7), "upgrade_buy": (upgrade_buy, -3.0, -12.0, 0.7),
    "gift_collect": (gift_collect, -3.0, -13.0, 0.45),
    "star_1": (lambda: star(1), -3.0, -13.0, 0.4), "star_2": (lambda: star(2), -3.0, -12.5, 0.4),
    "star_3": (lambda: star(3), -3.0, -12.0, 0.4),
    "whoosh": (whoosh_sfx, -4.5, -16.0, 0.35), "unlock": (unlock, -3.0, -12.0, 0.9),
}
LOOPS = {"spray_loop"}
# gentle compression (threshold dB below peak, ratio) for low, peaky sounds so they read at a sane peak level
DENSIFY = {"boss_roar": (-14.0, 3.0), "player_hit": (-12.0, 2.5), "enemy_charge": (-10.0, 2.0),
           "goo_burst_big": (-12.0, 2.0), "goo_burst_1": (-10.0, 2.0), "goo_burst_2": (-10.0, 2.0),
           "goo_burst_3": (-10.0, 2.0)}


def densify(x, thr_rel_db, ratio):
    from pedalboard import Compressor, Pedalboard
    pk = 20 * np.log10(np.max(np.abs(x)) + 1e-12)
    board = Pedalboard([Compressor(threshold_db=pk + thr_rel_db, ratio=ratio, attack_ms=4.0, release_ms=90.0)])
    pre = np.zeros(N(0.01))
    y = board(np.concatenate([pre, x])[None, :].astype(np.float32), SR)[0].astype(np.float64)
    return y[len(pre):]


def render_one(name):
    fn, peak, loud, dur = SFX[name]
    x = fn()
    if name in LOOPS:
        # loopable: no trimming/fades (it is sample-periodic), just DC removal + level
        x = x - np.mean(x)
        x *= db2lin(peak) / np.max(np.abs(x))
    else:
        if name in DENSIFY:
            x = densify(x, *DENSIFY[name])
        x = finalize(x, peak, max_dur=dur * 1.25 + 0.03, m100_target=loud)
    path = os.path.join(OUT_DIR, name + ".mp3")
    # MP3 overshoot guard: decoded peak must stay within +0.3 dB of the target
    for i in range(3):
        encode_mp3(x[:, None], path)
        y = decode_audio(path)[:, 0]
        over = 20 * np.log10(np.max(np.abs(y)) + 1e-12) - (peak + 0.3)
        if over <= 0 or i == 2:
            break
        x = x * db2lin(-over - 0.05)
    write_wav(os.path.join(BUILD_DIR, "sfx_" + name + ".wav"), x)
    return x


def build(names=None):
    out = {}
    for name in SFX:
        if names and name not in names:
            continue
        out[name] = render_one(name)
    return out


if __name__ == "__main__":
    import sys
    import time
    t0 = time.time()
    res = build(sys.argv[1:] or None)
    for k, v in res.items():
        print("%-14s %.3f s  peak %.1f dB" % (k, len(v) / SR, 20 * np.log10(np.max(np.abs(v)))))
    print("took %.1f s" % (time.time() - t0))
