"""Synthesis primitives for Splash Rescue SFX (mono, 44.1 kHz, float64).

Water: filtered noise (spray/hiss), van den Doel bubbles (exponentially
damped sinusoids with rising pitch), band-pass-swept noise splashes.
Jelly: pitch-gliding low sines with wobble + low-passed squelch noise.
Sweeteners: bell/ping partials, sparkles, FluidSynth-rendered celesta/harp/glock.
"""
import numpy as np
import scipy.signal as sps

from common import SR, db2lin
from music_lib import Song


def N(d):
    return max(1, int(round(d * SR)))


def T(d):
    return np.arange(N(d)) / SR


def taper(sig, frac=0.2, min_ms=5.0, max_ms=40.0):
    """Raised-cosine fade over the last part of a layer so no layer ever ends abruptly."""
    sig = np.array(sig, dtype=np.float64)
    n = len(sig)
    k = int(np.clip(frac * n, N(min_ms / 1000.0), N(max_ms / 1000.0)))
    k = min(k, n)
    if k > 1:
        sig[n - k:] *= np.cos(np.linspace(0, np.pi / 2, k)) ** 2
    return sig


class Canvas:
    """Mixing buffer that grows as layers are added; every layer gets an end taper."""

    def __init__(self, dur):
        self.x = np.zeros(N(dur))

    def add(self, sig, at=0.0, gain=1.0):
        i = int(round(at * SR))
        sig = taper(sig)
        end = i + len(sig)
        if end > len(self.x):
            self.x = np.concatenate([self.x, np.zeros(end - len(self.x))])
        self.x[i:end] += sig * gain


# ----------------------------------------------------------------------------
# envelopes
# ----------------------------------------------------------------------------
def env_ar(dur, attack=0.002, tau=0.1, hold=0.0):
    t = T(dur)
    a = np.clip(t / max(attack, 1e-5), 0, 1)
    a = np.sin(a * np.pi / 2) ** 2
    d = np.where(t < attack + hold, 1.0, np.exp(-(t - attack - hold) / tau))
    return a * d


def env_swell(dur, peak_at, attack_pow=2.0, release_tau=0.08, floor=0.0):
    t = T(dur)
    up = floor + (1 - floor) * np.clip(t / peak_at, 0, 1) ** attack_pow
    down = np.where(t > peak_at, np.exp(-(t - peak_at) / release_tau), 1.0)
    return up * down


def env_points(dur, pts):
    """pts: [(time_s, level_lin), ...] piecewise linear."""
    t = T(dur)
    ts = [p[0] for p in pts]
    vs = [p[1] for p in pts]
    return np.interp(t, ts, vs)


# ----------------------------------------------------------------------------
# oscillators
# ----------------------------------------------------------------------------
def osc(freq, dur=None, phase=0.0, harmonics=((1, 1.0),), rand_phase=None):
    """freq: scalar or per-sample array (Hz).  rand_phase=seed scatters harmonic phases
    (same timbre, much lower crest factor)."""
    if np.isscalar(freq):
        freq = np.full(N(dur), float(freq))
    ph = 2 * np.pi * np.cumsum(freq) / SR + phase
    out = np.zeros_like(freq)
    rp = np.random.default_rng(rand_phase).uniform(0, 2 * np.pi, len(harmonics)) if rand_phase is not None \
        else np.zeros(len(harmonics))
    for (h, a), p0 in zip(harmonics, rp):
        mask = (freq * h) < SR * 0.45
        out += a * np.sin(ph * h + (p0 if h > 1 else 0.0)) * mask
    return out


def glide(f0, f1, dur, curve="exp", tau=None):
    t = T(dur)
    if curve == "exp":
        if tau is None:
            return f0 * (f1 / f0) ** (t / dur)
        return f1 + (f0 - f1) * np.exp(-t / tau)
    return f0 + (f1 - f0) * t / dur


def pink(n, rng):
    w = rng.standard_normal(n)
    X = np.fft.rfft(w)
    f = np.fft.rfftfreq(n, 1 / SR)
    X /= np.sqrt(np.maximum(f, 20.0))
    y = np.fft.irfft(X, n)
    return y / (np.std(y) + 1e-12)


def white(n, rng):
    return rng.standard_normal(n)


# ----------------------------------------------------------------------------
# filters
# ----------------------------------------------------------------------------
def bp(x, lo, hi, order=2):
    sos = sps.butter(order, [lo, min(hi, SR * 0.45)], btype="bandpass", fs=SR, output="sos")
    return sps.sosfilt(sos, x)


def lp(x, fc, order=2):
    sos = sps.butter(order, min(fc, SR * 0.45), btype="lowpass", fs=SR, output="sos")
    return sps.sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = sps.butter(order, fc, btype="highpass", fs=SR, output="sos")
    return sps.sosfilt(sos, x)


def svf(x, fc, q=0.7, mode="bp"):
    """Time-varying TPT state-variable filter.  fc: scalar or array."""
    n = len(x)
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), (n,))
    g = np.tan(np.pi * np.clip(fc, 10, SR * 0.45) / SR)
    k = 1.0 / q
    a1 = 1.0 / (1.0 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    ic1 = ic2 = 0.0
    out = np.empty(n)
    xl = x.tolist()
    a1l, a2l, a3l = a1.tolist(), a2.tolist(), a3.tolist()
    m = {"lp": 0, "bp": 1, "hp": 2}[mode]
    for i in range(n):
        v0 = xl[i]
        v3 = v0 - ic2
        v1 = a1l[i] * ic1 + a2l[i] * v3
        v2 = ic2 + a2l[i] * ic1 + a3l[i] * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        if m == 0:
            out[i] = v2
        elif m == 1:
            out[i] = v1
        else:
            out[i] = v0 - k * v1 - v2
    return out


# ----------------------------------------------------------------------------
# water
# ----------------------------------------------------------------------------
def bubble(f0, amp=1.0, xi=0.12, dur=None, ramp_ms=0.6):
    """van den Doel bubble: damped sinusoid whose pitch rises as it decays.

    d = 0.043 f0 + 0.0014 f0^1.5 (damping, 1/s);  f(t) = f0 (1 + xi * d * t).
    """
    d = 0.043 * f0 + 0.0014 * f0 ** 1.5
    if dur is None:
        dur = min(0.4, 7.0 / d)
    t = T(dur)
    f = f0 * (1 + xi * d * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    e = np.exp(-d * t)
    r = N(ramp_ms / 1000.0)
    e[:r] *= np.linspace(0, 1, r)
    return amp * np.sin(ph) * e


def bubble_cloud(dur, count, fmin, fmax, rng, amp=(0.2, 1.0), xi=(0.05, 0.25), times="exp",
                 tscale=0.1, decay_amp=True):
    c = Canvas(dur + 0.4)
    for i in range(count):
        if times == "exp":
            at = min(dur, rng.exponential(tscale))
        else:
            at = rng.uniform(0, dur)
        f0 = np.exp(rng.uniform(np.log(fmin), np.log(fmax)))
        a = rng.uniform(*amp)
        if decay_amp:
            a *= np.exp(-at / max(dur, 1e-3))
        c.add(bubble(f0, a, rng.uniform(*xi)), at)
    return c.x


def soft_peaks(x, k=3.0):
    """Tame the random crest of a noise layer: tanh soft-clip at k x RMS (inaudible on noise)."""
    r = np.sqrt(np.mean(x ** 2)) + 1e-12
    return np.tanh(x / (k * r)) * (k * r)


def splash(dur, rng, f_start=5000, f_end=1200, q=0.9, tau=0.09, attack=0.003, hp_fc=500):
    n = N(dur)
    src = soft_peaks(white(n, rng), 2.5)
    fc = glide(f_start, f_end, dur, tau=dur * 0.35)
    y = svf(src, fc, q, "bp")
    y = hp(y, hp_fc)
    return y * env_ar(dur, attack, tau)


def plop(f_hi, f_lo, dur=0.12, tau_f=0.012, tau_a=0.04, h2=0.25):
    """Cartoon 'pop/plop': fast downward pitch sweep, round and clean."""
    f = glide(f_hi, f_lo, dur, tau=tau_f)
    return osc(f, harmonics=((1, 1.0), (2, h2))) * env_ar(dur, 0.0015, tau_a)


# ----------------------------------------------------------------------------
# jelly
# ----------------------------------------------------------------------------
def blob(f0, f1, dur, wob_hz=12.0, wob_depth=0.06, tau=None, h=((1, 1.0), (2, 0.18), (3, 0.05)),
         attack=0.004):
    t = T(dur)
    base = glide(f0, f1, dur)
    f = base * (1 + wob_depth * np.sin(2 * np.pi * wob_hz * t) * np.exp(-t / (dur * 0.6)))
    tau = tau or dur * 0.3
    return osc(f, harmonics=h) * env_ar(dur, attack, tau)


def squelch(dur, rng, fc0=2200, fc1=500, q=1.2, tau=0.05, wob_hz=0.0):
    n = N(dur)
    src = white(n, rng)
    fc = glide(fc0, fc1, dur)
    if wob_hz:
        fc = fc * (1 + 0.35 * np.sin(2 * np.pi * wob_hz * T(dur)))
    y = svf(src, fc, q, "lp")
    return y * env_ar(dur, 0.002, tau)


# ----------------------------------------------------------------------------
# bells / sparkles / coins
# ----------------------------------------------------------------------------
BELL = ((1.0, 1.0, 1.0), (2.0, 0.28, 0.55), (3.0, 0.08, 0.35), (4.17, 0.05, 0.25))
GLASS = ((1.0, 1.0, 1.0), (2.76, 0.18, 0.45), (5.40, 0.06, 0.25))
COIN = ((1.0, 1.0, 1.0), (1.49, 0.35, 0.6), (2.76, 0.4, 0.45), (4.07, 0.15, 0.3), (5.40, 0.1, 0.2))


def bell(f, dur=0.6, tau=0.25, partials=BELL, attack=0.0015):
    dur = max(dur, 6.9 * tau)  # always ring down to -60 dB
    t = T(dur)
    y = np.zeros_like(t)
    for ratio, a, tscale in partials:
        if f * ratio < SR * 0.45:
            y += a * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / (tau * tscale))
    r = N(attack)
    y[:r] *= np.linspace(0, 1, r)
    return y


def sparkle(dur, count, fmin, fmax, rng, rising=False, tau=0.07, amp=1.0, notes=None, start=0.0):
    c = Canvas(dur + 0.5)
    for i in range(count):
        if rising:
            at = start + (dur - start) * (i / max(1, count - 1)) * 0.8 + rng.uniform(0, 0.01)
            f = fmin * (fmax / fmin) ** (i / max(1, count - 1))
        else:
            at = start + rng.uniform(0, dur - start) ** 1.0
            f = np.exp(rng.uniform(np.log(fmin), np.log(fmax)))
        if notes is not None:
            f = min(notes, key=lambda nf: abs(np.log(nf / f)))
        a = amp * rng.uniform(0.5, 1.0)
        c.add(bell(f, 0.35, tau * rng.uniform(0.8, 1.2), GLASS), at, a)
    return c.x


def clink(f, dur=0.25, tau=0.08):
    return bell(f, dur, tau, COIN, attack=0.0008)


def hz(note):
    from music_lib import P
    return 440.0 * 2 ** ((P(note) - 69) / 12.0)


def pent(lo="c6", hi="c8", root="c"):
    """C-major pentatonic frequencies in range (for sparkles that never clash)."""
    from music_lib import P
    out = []
    for m in range(P(lo), P(hi) + 1):
        if (m - P(root + "4")) % 12 in (0, 2, 4, 7, 9):
            out.append(440.0 * 2 ** ((m - 69) / 12.0))
    return out


# ----------------------------------------------------------------------------
# voices
# ----------------------------------------------------------------------------
def formant(x, formants):
    """formants: [(fc, q, gain)] parallel resonators."""
    y = np.zeros_like(x)
    for fc, q, g in formants:
        bw = fc / q
        y += g * bp(x, max(30, fc - bw / 2), fc + bw / 2, order=2)
    return y


def voice(f, env, formants=((800, 2.0, 1.0), (1800, 3.0, 0.5)), harmonics=8, tilt=1.4, mix_dry=0.4):
    h = tuple((k, 1.0 / k ** tilt) for k in range(1, harmonics + 1))
    src = osc(f, harmonics=h, rand_phase=11)
    y = formant(src, formants) + mix_dry * src
    return y * env


# ----------------------------------------------------------------------------
# whoosh
# ----------------------------------------------------------------------------
def whoosh(dur, f0, f1, rng, peak=0.5, q=1.4, f_mid=None, attack_pow=2.0, release_tau=None, floor=0.12):
    n = N(dur)
    src = pink(n, rng)
    t = T(dur)
    if f_mid is None:
        fc = glide(f0, f1, dur)
    else:
        pk = peak * dur
        fc = np.where(t < pk, f0 * (f_mid / f0) ** (t / pk), f_mid * (f1 / f_mid) ** ((t - pk) / (dur - pk)))
    y = hp(svf(src, fc, q, "bp"), 160.0)  # SVF skirts are gentle; keep pink-noise rumble out
    e = env_swell(dur, peak * dur, attack_pow, release_tau or dur * 0.25, floor=floor)
    return y * e


# ----------------------------------------------------------------------------
# FluidSynth note layers (soundfont instruments as sweeteners)
# ----------------------------------------------------------------------------
_fs_cache = {}


def fs_notes(notes, program, bank=0, drum=False, tail=2.5, name="fs"):
    """notes: [(t_s, dur_s, pitch, vel)] -> mono float array (rendered at 60 BPM)."""
    key = (tuple(notes), program, bank, drum)
    if key in _fs_cache:
        return _fs_cache[key].copy()
    end = max(t + d for t, d, _, _ in notes)
    s = Song("sfx_" + name, 60, bars=int(np.ceil(end / 4.0)) + 1, loop=False, tail_s=tail)
    tr = s.track(name, program, bank=bank, drum=drum, humanize_ms=0, vel_jitter=0)
    for t, d, p, v in notes:
        tr.note(t, d, p, v)
    st = s.render_stems()[name]
    y = st.mean(axis=1)
    _fs_cache[key] = y
    return y.copy()


# ----------------------------------------------------------------------------
# room + finishing
# ----------------------------------------------------------------------------
def room_ir(rt=0.4, seed=3, predelay=0.006, bright=0.5):
    rng = np.random.default_rng(seed)
    dur = rt * 1.3
    t = T(dur)
    nz = rng.standard_normal(len(t))
    lo = lp(nz, 2500 + 4000 * bright)
    ir = lo * 10 ** (-3 * t / rt) * np.clip(t / 0.004, 0, 1)
    ir = np.concatenate([np.zeros(N(predelay)), ir])
    return ir / np.sqrt(np.sum(ir ** 2))


def add_room(x, wet=0.18, rt=0.4, seed=3, hp_fc=300):
    ir = room_ir(rt, seed)
    w = sps.fftconvolve(x, ir)[: len(x) + len(ir)]
    w = hp(w, hp_fc)
    y = np.concatenate([x, np.zeros(len(w) - len(x))])
    return y + wet * w


def finalize(x, peak_db=-3.0, fade_in_ms=3.0, fade_out_ms=10.0, tail_db=-60.0, max_dur=None,
             lowpass=None, m100_target=None):
    """DC/rumble removal, leading-silence trim (<2 ms), tail trim, fades, peak normalisation."""
    x = np.asarray(x, dtype=np.float64)
    x = hp(x, 25.0, order=2)
    if lowpass:
        x = lp(x, lowpass, order=2)
    a = np.abs(x)
    pk = a.max() + 1e-12
    first = int(np.argmax(a > pk * db2lin(-40)))
    x = x[max(0, first - N(0.001)):]
    a = np.abs(x)
    # tail: last sample above tail_db (smoothed)
    env = np.convolve(a, np.ones(64) / 64, mode="same")
    above = np.nonzero(env > pk * db2lin(tail_db))[0]
    last = int(above[-1]) if len(above) else len(x) - 1
    x = x[: min(len(x), last + N(0.005))]
    x = taper(x, frac=0.08, min_ms=fade_out_ms, max_ms=40.0)
    if max_dur and len(x) > N(max_dur):
        x = x[: N(max_dur)]
        k = int(min(0.3 * len(x), N(0.15)))
        x[len(x) - k:] *= np.cos(np.linspace(0, np.pi / 2, k)) ** 2
    fi = N(fade_in_ms / 1000.0)
    fo = min(N(fade_out_ms / 1000.0), len(x) // 3)
    x[:fi] *= np.sin(np.linspace(0, np.pi / 2, fi)) ** 2
    x[len(x) - fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
    x -= np.mean(x)
    x[:fi] *= np.linspace(0, 1, fi)  # keep the very first sample at ~0 after DC shift
    x[len(x) - fo:] *= np.linspace(1, 0, fo)
    g = db2lin(peak_db) / (np.max(np.abs(x)) + 1e-12)
    if m100_target is not None:
        g_loud = db2lin(m100_target - m100(x))
        if g_loud > g * 1.12:
            # peak-limited: allow up to 3 dB of transparent look-ahead limiting on the transient
            from music_lib import limiter
            push = min(g_loud / g, db2lin(3.0))
            x = limiter((x * g * push)[:, None], ceiling_db=peak_db, lookahead_ms=1.5, release_ms=40.0)[:, 0]
            g = 1.0
        else:
            g = min(g, g_loud)
    return x * g


def lv(x, target):
    """Scale a layer so its max-100 ms loudness equals `target` (LUFS-like).  Used to balance
    synthesized layers against (much quieter) FluidSynth note layers by intent, not by guesswork."""
    x = np.asarray(x, dtype=np.float64)
    if np.max(np.abs(x)) == 0:
        return x
    return x * db2lin(target - m100(x))


def m100(x):
    """Max K-weighted loudness over 100 ms windows (LUFS-like) - our SFX loudness measure."""
    from common import k_weight
    y = k_weight(x)[:, 0]
    w = N(0.1)
    if len(y) < w:
        return float(-0.691 + 10 * np.log10(np.sum(y ** 2) / w + 1e-20))
    c = np.convolve(y ** 2, np.ones(w) / w, mode="valid")
    return float(-0.691 + 10 * np.log10(np.max(c) + 1e-20))
