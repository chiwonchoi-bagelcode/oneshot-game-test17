"""Tiny composition DSL + FluidSynth stem renderer + loop-aware mixer.

Design notes
------------
* A Song is a set of Tracks (one GM instrument each).  Every track is
  rendered to its own stereo stem with FluidSynth (its internal reverb and
  chorus switched off) so it can be EQ'd / levelled / sent to reverb in
  Python.
* Seamless loops: all note onsets are wrapped modulo the loop length, the
  stem is rendered once with a few seconds of tail and the tail is folded
  (added) back onto the beginning.  Because synthesis + reverb are linear,
  the folded signal is exactly the steady-state periodic signal, so the loop
  seam is continuous by construction.  Reverb is applied as a *circular*
  convolution and every IIR/compressor stage is run with a pre-roll taken
  from the end of the loop, so they are periodic too.
* All randomness (humanisation) is seeded from crc32 of names -> deterministic.
"""
import os
import re
import subprocess
import zlib

import mido
import numpy as np
import scipy.fft as sfft
import scipy.signal as sps
from pedalboard import Compressor, HighpassFilter, HighShelfFilter, LowpassFilter, LowShelfFilter, PeakFilter, Pedalboard

from common import BUILD_DIR, SF2, SR, as2d, db2lin, lufs_integrated, read_wav

TPB = 960  # ticks per beat

# ----------------------------------------------------------------------------
# pitch / chord helpers
# ----------------------------------------------------------------------------
_PC = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}
_NOTE_RE = re.compile(r"^([a-g])(#|b)?(-?\d)$")


def P(name):
    """'c4' -> 60, 'f#5' -> 78, 'bb3' -> 58.  Integers pass through."""
    if isinstance(name, (int, np.integer)):
        return int(name)
    m = _NOTE_RE.match(name.strip().lower())
    if not m:
        raise ValueError("bad note %r" % name)
    pc = _PC[m.group(1)] + {"#": 1, "b": -1, None: 0}[m.group(2)]
    return 12 * (int(m.group(3)) + 1) + pc


_ROOT_RE = re.compile(r"^([A-G])(#|b)?(.*?)(?:/([A-G])(#|b)?)?$")
_QUAL = {
    "": [0, 4, 7], "maj": [0, 4, 7], "m": [0, 3, 7], "min": [0, 3, 7],
    "7": [0, 4, 7, 10], "maj7": [0, 4, 7, 11], "m7": [0, 3, 7, 10],
    "6": [0, 4, 7, 9], "m6": [0, 3, 7, 9], "9": [0, 4, 7, 10, 14],
    "maj9": [0, 4, 7, 11, 14], "m9": [0, 3, 7, 10, 14], "add9": [0, 4, 7, 14],
    "madd9": [0, 3, 7, 14], "sus4": [0, 5, 7], "sus2": [0, 2, 7],
    "7sus4": [0, 5, 7, 10], "dim": [0, 3, 6], "dim7": [0, 3, 6, 9],
    "m7b5": [0, 3, 6, 10], "aug": [0, 4, 8], "69": [0, 4, 7, 9, 14],
    "5": [0, 7], "mmaj7": [0, 3, 7, 11], "7b9": [0, 4, 7, 10, 13],
}


def chord(sym):
    """'Am7' -> (root_pc, [intervals], bass_pc)."""
    m = _ROOT_RE.match(sym)
    if not m:
        raise ValueError(sym)
    root = (_PC[m.group(1).lower()] + {"#": 1, "b": -1, None: 0}[m.group(2)]) % 12
    q = m.group(3)
    if q not in _QUAL:
        raise ValueError("unknown chord quality %r in %r" % (q, sym))
    bass = root
    if m.group(4):
        bass = (_PC[m.group(4).lower()] + {"#": 1, "b": -1, None: 0}[m.group(5)]) % 12
    return root, _QUAL[q], bass


def chord_pcs(sym):
    r, iv, _ = chord(sym)
    return sorted(set((r + i) % 12 for i in iv))


def bass_note(sym, low=P("e1"), high=P("d3"), prefer=P("a2")):
    """Lowest sensible bass pitch for the chord's bass pc, near `prefer`."""
    _, _, b = chord(sym)
    cands = [p for p in range(low, high + 1) if p % 12 == b]
    return min(cands, key=lambda p: abs(p - prefer))


def chord_tone(sym, degree, near):
    """degree: 1=root,3=third,5=fifth,7=seventh (falls back to root). Pitch nearest `near`."""
    r, iv, _ = chord(sym)
    want = {1: 0, 3: None, 5: None, 7: None}
    if degree == 1:
        pc = r
    else:
        idx = {3: 1, 5: 2, 7: 3}[degree]
        pc = (r + iv[idx]) % 12 if idx < len(iv) else r
    del want
    cands = [p for p in range(near - 7, near + 7) if p % 12 == pc]
    return min(cands, key=lambda p: abs(p - near))


def voicing(sym, low, high, n=None, prev=None, center=None):
    """Close voicing of the chord within [low, high] with smooth voice leading."""
    pcs = chord_pcs(sym)
    if n is None:
        n = len(pcs)
    allp = [p for p in range(low, high + 1) if p % 12 in pcs]
    best, best_cost = None, 1e9
    for i in range(len(allp)):
        cand = []
        used = set()
        for p in allp[i:]:
            if len(cand) == n:
                break
            if p % 12 in used and len(used) < len(pcs):
                continue
            cand.append(p)
            used.add(p % 12)
        if len(cand) < n:
            continue
        if len(set(c % 12 for c in cand)) < min(n, len(pcs)):
            continue
        if prev:
            cost = sum(min(abs(c - q) for q in prev) for c in cand) + 0.3 * abs(np.mean(cand) - np.mean(prev))
        else:
            c0 = center if center is not None else (low + high) / 2
            cost = abs(np.mean(cand) - c0)
        if cost < best_cost:
            best, best_cost = cand, cost
    if best is None:
        raise ValueError("cannot voice %s in %d..%d" % (sym, low, high))
    return best


# ----------------------------------------------------------------------------
# rhythm notation
# ----------------------------------------------------------------------------
DUR = {"w": 4.0, "h": 2.0, "q": 1.0, "e": 0.5, "s": 0.25, "t": 1 / 3.0, "x": 1 / 6.0, "Q": 2 / 3.0}
_TOK_RE = re.compile(r"^(\[[^\]]+\]|r|[a-g][#b]?-?\d)((?:[whqestxQ]\.?)(?:\+[whqestxQ]\.?)*)([>'_~^]*)$")


def _dur(spec):
    total = 0.0
    for part in spec.split("+"):
        d = DUR[part[0]]
        if part.endswith("."):
            d *= 1.5
        total += d
    return total


def parse_seq(text, bar_beats=4.0):
    """Parse 'c5e d5e e5q. | [c5,e5]h r h' into [(t, dur, [pitches]|None, art)].

    Bar lines '|' are checked: each must fall on a multiple of bar_beats.
    """
    out = []
    t = 0.0
    text = re.sub(r"(^|\s)r\s+([whqestxQ])", r"\1r\2", text)
    for tok in text.split():
        if tok == "|":
            if abs((t / bar_beats) - round(t / bar_beats)) > 1e-6:
                raise ValueError("bar line at beat %.3f is not on a bar boundary in: %s" % (t, text[:60]))
            continue
        m = _TOK_RE.match(tok)
        if not m:
            raise ValueError("bad token %r" % tok)
        head, d, art = m.group(1), _dur(m.group(2)), m.group(3)
        if head == "r":
            pitches = None
        elif head.startswith("["):
            pitches = [P(p) for p in head[1:-1].split(",")]
        else:
            pitches = [P(head)]
        out.append((t, d, pitches, art))
        t += d
    return out, t


# ----------------------------------------------------------------------------
# Song / Track
# ----------------------------------------------------------------------------
class Note:
    __slots__ = ("t", "d", "p", "v")

    def __init__(self, t, d, p, v):
        self.t, self.d, self.p, self.v = float(t), float(d), int(p), float(v)


class Track:
    def __init__(self, song, name, program, bank=0, drum=False, pan=0.0,
                 humanize_ms=6.0, vel_jitter=6.0, swing=0.0, swing_unit=0.5, gate=0.92):
        self.song = song
        self.name = name
        self.program = program
        self.bank = bank
        self.drum = drum
        self.pan = pan  # -1..1
        self.humanize_ms = humanize_ms
        self.vel_jitter = vel_jitter
        self.swing = swing  # 0 = straight, 0.33 ~ triplet swing (fraction of unit)
        self.swing_unit = swing_unit
        self.gate = gate
        self.notes = []
        self.ccs = []  # (t, num, val)
        self.bends = []  # (t, value)

    # -- primitives ----------------------------------------------------
    def note(self, t, d, p, v=80):
        self.notes.append(Note(t, d, P(p), v))

    def chord(self, t, d, pitches, v=70, strum=0.0, up=False, vel_slope=0.0):
        """strum: seconds between strings."""
        ps = list(pitches)
        if up:
            ps = ps[::-1]
        sbeats = strum * self.song.bpm / 60.0
        for i, p in enumerate(ps):
            self.notes.append(Note(t + i * sbeats, d - i * sbeats, P(p), v + vel_slope * i))

    def cc(self, t, num, val):
        self.ccs.append((t, num, int(np.clip(val, 0, 127))))

    def cc_ramp(self, t0, t1, num, v0, v1, steps=16):
        for i in range(steps + 1):
            a = i / steps
            self.cc(t0 + (t1 - t0) * a, num, v0 + (v1 - v0) * a)

    def bend(self, t, semis, rng=2.0):
        v = int(np.clip(semis / rng * 8192, -8192, 8191))
        self.bends.append((t, v))

    def bend_ramp(self, t0, t1, s0, s1, steps=12):
        for i in range(steps + 1):
            a = i / steps
            self.bend(t0 + (t1 - t0) * a, s0 + (s1 - s0) * a)

    # -- notation ----------------------------------------------------
    def seq(self, t0, text, v=80, gate=None, transpose=0, accent_beats=True, vel_curve=None):
        gate = self.gate if gate is None else gate
        evs, length = parse_seq(text, self.song.bar_beats)
        for (t, d, ps, art) in evs:
            if ps is None:
                continue
            vel = v
            g = gate
            if "'" in art:
                g = min(g, 0.45)
            if "_" in art:
                g = 1.0
            if "~" in art:
                g = 1.25
            if ">" in art:
                vel += 14
            if "^" in art:
                vel -= 14
            if accent_beats:
                pos = (t0 + t) % self.song.bar_beats
                if abs(pos) < 1e-6:
                    vel += 6
                elif abs(pos - round(pos)) > 1e-6:
                    vel -= 4
            if vel_curve is not None:
                vel += vel_curve((t0 + t))
            for p in ps:
                self.notes.append(Note(t0 + t, d * g, p + transpose, vel))
        return t0 + length

    def clear(self, t0, t1, pitches=None):
        """Remove notes starting in [t0, t1) (optionally only these pitches)."""
        self.notes = [n for n in self.notes
                      if not (t0 - 1e-9 <= n.t < t1 - 1e-9 and (pitches is None or n.p in pitches))]

    def fill(self, t0, pattern, step=0.25, keep=(36,)):
        """Replace everything except `keep` pitches from t0 for len(pattern) steps with `pattern`
        ({note: "x.o.."}).  Used for phrase-end drum fills."""
        n_steps = max(len(p.replace(" ", "")) for p in pattern.values())
        self.notes = [n for n in self.notes if not (t0 - 1e-9 <= n.t < t0 + n_steps * step - 1e-9
                                                    and n.p not in keep)]
        vmap = {"X": 112, "x": 90, "o": 64, "g": 42}
        for note_id, pat in pattern.items():
            for i, ch in enumerate(pat.replace(" ", "")):
                if ch != ".":
                    self.notes.append(Note(t0 + i * step, step * 0.9, note_id, vmap[ch]))

    def drums(self, t0, bars, patterns, step=0.25, vel=None):
        """patterns: {gm_note: "x.o.X..." } one char per step, repeated each bar.

        X = accent (110), x = normal (88), o = soft (62), g = ghost (40), . = rest.
        A pattern longer than one bar spans several bars.
        """
        vmap = {"X": 112, "x": 90, "o": 64, "g": 42}
        if vel:
            vmap.update(vel)
        steps_per_bar = int(round(self.song.bar_beats / step))
        for note_id, pat in patterns.items():
            pat = pat.replace(" ", "").replace("|", "")
            n_bars_pat = max(1, len(pat) // steps_per_bar)
            for b in range(0, bars, n_bars_pat):
                for i, ch in enumerate(pat):
                    if ch == ".":
                        continue
                    bar_off = (i // steps_per_bar)
                    if b + bar_off >= bars:
                        break
                    t = t0 + b * self.song.bar_beats + i * step
                    self.notes.append(Note(t, step * 0.9, P(note_id) if isinstance(note_id, str) else note_id, vmap[ch]))


class Song:
    def __init__(self, name, bpm, bars, bar_beats=4, tail_s=5.0, loop=True):
        self.name = name
        self.bpm = bpm
        self.tempo_us = int(round(60e6 / bpm))
        self.bars = bars
        self.bar_beats = bar_beats
        self.tail_s = tail_s
        self.loop = loop
        self.tracks = []

    @property
    def total_beats(self):
        return self.bars * self.bar_beats

    @property
    def beat_s(self):
        return self.tempo_us / 1e6

    @property
    def length_samples(self):
        return int(round(self.total_beats * self.beat_s * SR))

    def bar(self, i):
        """Beat position of bar index i (0-based)."""
        return i * self.bar_beats

    def track(self, name, program, **kw):
        tr = Track(self, name, program, **kw)
        self.tracks.append(tr)
        return tr

    # -- MIDI ------------------------------------------------------------
    def _rng(self, tr):
        return np.random.default_rng(zlib.crc32((self.name + "/" + tr.name).encode()))

    def _swing(self, t, tr):
        if tr.swing <= 0:
            return t
        u = tr.swing_unit
        pos = (t / u)
        k = np.floor(pos + 1e-9)
        frac = pos - k
        if int(k) % 2 == 1 and frac < 1e-6:
            return t + tr.swing * u
        return t

    def write_midi(self, tr, path):
        rng = self._rng(tr)
        L = self.total_beats
        beats_per_s = 1e6 / self.tempo_us
        ch = 9 if tr.drum else 0
        evs = []  # (tick, order, msg)
        # header events
        msgs0 = []
        if not tr.drum:
            msgs0.append(mido.Message("control_change", channel=ch, control=0, value=tr.bank))
            msgs0.append(mido.Message("control_change", channel=ch, control=32, value=0))
        msgs0.append(mido.Message("program_change", channel=ch, program=tr.program))
        msgs0.append(mido.Message("control_change", channel=ch, control=7, value=100))
        msgs0.append(mido.Message("control_change", channel=ch, control=10, value=int(np.clip(64 + tr.pan * 63, 0, 127))))
        msgs0.append(mido.Message("control_change", channel=ch, control=91, value=0))
        msgs0.append(mido.Message("control_change", channel=ch, control=93, value=0))
        has_expr = any(c[1] == 11 for c in tr.ccs)
        if not has_expr:
            msgs0.append(mido.Message("control_change", channel=ch, control=11, value=127))
        for i, m in enumerate(msgs0):
            evs.append((0, -100 + i, m))
        # notes
        notes = sorted(tr.notes, key=lambda n: (n.t, n.p))
        placed = []
        for n in notes:
            t = self._swing(n.t, tr)
            jit = np.clip(rng.normal(0, tr.humanize_ms), -2.5 * tr.humanize_ms, 2.5 * tr.humanize_ms) / 1000.0 * beats_per_s
            if tr.humanize_ms > 0:
                t = t + jit
            if self.loop:
                t = t % L
            else:
                t = max(0.0, t)
            v = n.v + rng.normal(0, tr.vel_jitter)
            v = int(np.clip(round(v), 1, 127))
            d = max(n.d, 0.02)
            placed.append([t, d, n.p, v])
        # avoid same-pitch overlaps (note-off of the earlier note would cut the later)
        placed.sort(key=lambda x: (x[2], x[0]))
        for i in range(len(placed) - 1):
            a, b = placed[i], placed[i + 1]
            if a[2] == b[2] and a[0] + a[1] > b[0] - 0.01 and b[0] >= a[0]:
                a[1] = max(0.01, b[0] - a[0] - 0.01)
        for t, d, p, v in placed:
            on = int(round(t * TPB))
            off = int(round((t + d) * TPB))
            if off <= on:
                off = on + 1
            evs.append((on, 1, mido.Message("note_on", channel=ch, note=p, velocity=v)))
            evs.append((off, 0, mido.Message("note_off", channel=ch, note=p, velocity=0)))
        for (t, num, val) in tr.ccs:
            tt = (t % L) if self.loop else t
            evs.append((int(round(tt * TPB)), -1, mido.Message("control_change", channel=ch, control=num, value=val)))
        for (t, val) in tr.bends:
            tt = (t % L) if self.loop else t
            evs.append((int(round(tt * TPB)), -1, mido.Message("pitchwheel", channel=ch, pitch=val)))
        evs.sort(key=lambda e: (e[0], e[1]))
        mid = mido.MidiFile(ticks_per_beat=TPB)
        trk = mido.MidiTrack()
        mid.tracks.append(trk)
        trk.append(mido.MetaMessage("set_tempo", tempo=self.tempo_us, time=0))
        last = 0
        for tick, _, m in evs:
            trk.append(m.copy(time=tick - last))
            last = tick
        end_tick = int(round((L + self.tail_s * beats_per_s) * TPB))
        trk.append(mido.MetaMessage("end_of_track", time=max(0, end_tick - last)))
        mid.save(path)

    # -- rendering ----------------------------------------------------------
    def render_stems(self, workdir=None):
        workdir = workdir or os.path.join(BUILD_DIR, self.name)
        os.makedirs(workdir, exist_ok=True)
        L = self.length_samples
        T = int(self.tail_s * SR)
        stems = {}
        for tr in self.tracks:
            if not tr.notes:
                continue
            mid = os.path.join(workdir, tr.name + ".mid")
            wav = os.path.join(workdir, tr.name + ".wav")
            self.write_midi(tr, mid)
            subprocess.run(
                ["fluidsynth", "-ni", "-q", "-R", "0", "-C", "0", "-g", "0.5", "-r", str(SR),
                 "-O", "float", "-T", "wav", "-F", wav, SF2, mid],
                check=True, capture_output=True)
            x = read_wav(wav)
            os.remove(wav)  # stems are big; the .mid stays for inspection
            if x.shape[1] == 1:
                x = np.repeat(x, 2, axis=1)
            need = L + T
            if x.shape[0] < need:
                x = np.vstack([x, np.zeros((need - x.shape[0], 2))])
            if self.loop:
                y = x[:L].copy()
                rest = x[L:]
                k = 0
                while k < rest.shape[0]:  # fold tail(s) back onto the start
                    seg = rest[k:k + L]
                    y[:seg.shape[0]] += seg
                    k += L
            else:
                y = x[:need]
            stems[tr.name] = y
        return stems


# ----------------------------------------------------------------------------
# periodic-safe processing helpers
# ----------------------------------------------------------------------------
def periodic(fn, x, preroll_s=2.0, loop=True):
    """Run a stateful processor so that the output is steady-state periodic.

    The last `preroll_s` seconds of the loop are prepended (so filter /
    compressor state at sample 0 equals the state at the loop end), processed,
    and discarded.
    """
    x = as2d(x)
    if not loop:
        return fn(x)
    n = min(int(preroll_s * SR), x.shape[0])
    ext = np.vstack([x[-n:], x])
    y = fn(ext)
    return y[n:]


def pb(board, x):
    x = as2d(x).astype(np.float32)
    y = board(x.T.copy(), SR)
    return y.T.astype(np.float64)


def eq_chain(hpf=None, lpf=None, peaks=(), low_shelf=None, high_shelf=None):
    plugins = []
    if hpf:
        plugins.append(HighpassFilter(cutoff_frequency_hz=hpf))
    if lpf:
        plugins.append(LowpassFilter(cutoff_frequency_hz=lpf))
    if low_shelf:
        f, g = low_shelf
        plugins.append(LowShelfFilter(cutoff_frequency_hz=f, gain_db=g, q=0.7))
    if high_shelf:
        f, g = high_shelf
        plugins.append(HighShelfFilter(cutoff_frequency_hz=f, gain_db=g, q=0.7))
    for (f, g, q) in peaks:
        plugins.append(PeakFilter(cutoff_frequency_hz=f, gain_db=g, q=q))
    return Pedalboard(plugins)


def make_ir(seconds=2.2, rt60=1.5, predelay_ms=18.0, seed=1, bright=1.0):
    """Synthetic stereo hall IR: early reflections + band-wise decaying noise."""
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    bands = [(0, 300, rt60 * 1.05), (300, 1500, rt60), (1500, 4000, rt60 * 0.75),
             (4000, 8000, rt60 * 0.45 * bright), (8000, 22050, rt60 * 0.25 * bright)]
    out = np.zeros((n, 2))
    pre = int(predelay_ms * SR / 1000)
    for c in range(2):
        noise = rng.standard_normal(n)
        spec = sfft.rfft(noise)
        freqs = sfft.rfftfreq(n, 1 / SR)
        acc = np.zeros(n)
        for lo, hi, rt in bands:
            m = (freqs >= lo) & (freqs < hi)
            b = sfft.irfft(spec * m, n)
            acc += b * 10 ** (-3 * t / rt)
        # soft onset of the diffuse tail
        onset = np.clip(t / 0.03, 0, 1) ** 1.5
        acc *= onset
        er = np.zeros(n)
        for _ in range(10):
            d = int(rng.uniform(0.004, 0.045) * SR)
            er[d] += rng.uniform(-1, 1) * 0.5 * (1 - d / (0.05 * SR))
        acc = acc / np.sqrt(np.sum(acc ** 2)) + er * 0.15
        out[:, c] = np.concatenate([np.zeros(pre), acc[: n - pre]])
    out /= np.sqrt(np.sum(out ** 2) / 2)
    return out


def circular_convolve(x, ir):
    """Circular convolution per channel (x: (L,2), ir: (m,2), m <= L)."""
    L = x.shape[0]
    y = np.zeros_like(x)
    for c in range(2):
        h = np.zeros(L)
        h[: ir.shape[0]] = ir[:, c]
        y[:, c] = sfft.irfft(sfft.rfft(x[:, c]) * sfft.rfft(h), L)
    return y


def linear_convolve(x, ir):
    y = np.zeros((x.shape[0] + ir.shape[0] - 1, 2))
    for c in range(2):
        y[:, c] = sps.fftconvolve(x[:, c], ir[:, c])
    return y


def pingpong(x, delay_s, feedback=0.35, taps=6, loop=True, hpf=500, lpf=5000):
    """Ping-pong echo of the mono sum of x."""
    mono = as2d(x).mean(axis=1)
    mono = sps.sosfilt(sps.butter(2, [hpf, lpf], btype="bandpass", fs=SR, output="sos"), mono)
    D = int(round(delay_s * SR))
    n = mono.shape[0]
    out = np.zeros((n + (0 if loop else D * taps), 2))
    for k in range(1, taps + 1):
        g = feedback ** (k - 1)
        c = (k - 1) % 2
        if loop:
            out[:, c] += np.roll(mono, k * D) * g
        else:
            out[k * D:k * D + n, c] += mono * g
    return out


def limiter(x, ceiling_db=-2.0, lookahead_ms=3.0, release_ms=80.0):
    """Simple look-ahead peak limiter (sample peak)."""
    x = as2d(x)
    ceil = db2lin(ceiling_db)
    peak = np.max(np.abs(x), axis=1)
    la = max(1, int(lookahead_ms * SR / 1000))
    # running max over look-ahead window
    from scipy.ndimage import maximum_filter1d
    pk = maximum_filter1d(peak, size=2 * la + 1)
    g_target = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    # smooth: instant attack (already looked-ahead), exponential release
    rel = np.exp(-1.0 / (release_ms * SR / 1000))
    g = np.empty_like(g_target)
    cur = 1.0
    gt = g_target
    for i in range(len(gt)):  # python loop is fine (only hit on a few seconds of audio)
        v = gt[i]
        cur = v if v < cur else v + (cur - v) * rel
        g[i] = cur
    return x * g[:, None]


def fast_limiter(x, ceiling_db=-2.0, release_ms=80.0):
    """Vectorised-enough limiter: only processes when needed."""
    x = as2d(x)
    if np.max(np.abs(x)) <= db2lin(ceiling_db):
        return x
    return limiter(x, ceiling_db=ceiling_db, release_ms=release_ms)


OCT_CENTERS = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
# reference octave-band balance (dB, relative): warm lows, clear mids, soft highs
OCT_REF = np.array([-5.0, -1.5, -1.0, -1.5, -3.0, -6.0, -9.5, -14.0, -22.0])


def octave_bands(x):
    m = as2d(x).mean(axis=1)
    f, Pw = sps.welch(m, fs=SR, nperseg=16384)
    out = []
    for c in OCT_CENTERS:
        sel = (f >= c / np.sqrt(2)) & (f < c * np.sqrt(2))
        out.append(10 * np.log10(np.sum(Pw[sel]) + 1e-20))
    return np.array(out)


def tilt_correction(x, amount=0.5):
    """Per-octave correction (dB) toward OCT_REF, aligned on the 250 Hz-2 kHz bands."""
    b = octave_bands(x)
    idx = [2, 3, 4, 5]
    diff = OCT_REF - b
    diff -= np.mean(diff[idx])
    out = []
    for i, c in enumerate(OCT_CENTERS):
        if c < 125 or c > 8000:
            continue
        hi = 1.0 if c <= 250 else (1.5 if c >= 4000 else 2.0)
        out.append((c, float(np.clip(diff[i] * amount, -3.0, hi))))
    return out


# ----------------------------------------------------------------------------
# mixer
# ----------------------------------------------------------------------------
class Mix:
    """settings per stem: dict(level=LU relative to ref, hpf, lpf, peaks, low_shelf,
    high_shelf, rev=send(0..1), delay=send, width=1.0)"""

    def __init__(self, song, stems, settings, ref_lufs=-20.0, rev_rt60=1.6, rev_level_db=-6.0,
                 rev_bright=1.0, delay_s=None, delay_fb=0.35, master_lufs=-18.0,
                 master_high_shelf=(9000, -1.5), comp=True, ceiling_db=-2.0, rev_seed=7,
                 auto_eq=True, eq_amount=0.5, master_peaks=()):
        self.song = song
        self.stems = stems
        self.settings = settings
        self.ref = ref_lufs
        self.rev_rt60 = rev_rt60
        self.rev_level_db = rev_level_db
        self.rev_bright = rev_bright
        self.delay_s = delay_s
        self.delay_fb = delay_fb
        self.master_lufs = master_lufs
        self.master_high_shelf = master_high_shelf
        self.comp = comp
        self.ceiling_db = ceiling_db
        self.rev_seed = rev_seed
        self.auto_eq = auto_eq
        self.eq_amount = eq_amount
        self.master_peaks = list(master_peaks)
        self.report = {}

    def run(self):
        loop = self.song.loop
        n = next(iter(self.stems.values())).shape[0]
        dry = np.zeros((n, 2))
        rev_in = np.zeros((n, 2))
        dly_in = np.zeros((n, 2))
        for name, x in self.stems.items():
            s = self.settings.get(name, {})
            board = eq_chain(s.get("hpf"), s.get("lpf"), s.get("peaks", ()), s.get("low_shelf"), s.get("high_shelf"))
            y = periodic(lambda z: pb(board, z), x, 1.0, loop) if len(board) else x
            w = s.get("width", 1.0)
            if w != 1.0:
                mid = y.mean(axis=1, keepdims=True)
                side = (y[:, :1] - y[:, 1:]) / 2
                y = np.hstack([mid + side * w, mid - side * w])
            lu = lufs_integrated(y)
            target = self.ref + s.get("level", 0.0)
            g = db2lin(target - lu) if np.isfinite(lu) and lu > -69 else 0.0
            y = y * g
            self.report[name] = {"stem_lufs_raw": round(lu, 1), "gain_db": round(20 * np.log10(max(g, 1e-9)), 1)}
            dry += y
            rev_in += y * s.get("rev", 0.2)
            dly_in += y * s.get("delay", 0.0)
        ir = make_ir(seconds=min(2.6, self.rev_rt60 * 1.6), rt60=self.rev_rt60, seed=self.rev_seed, bright=self.rev_bright)
        wet = circular_convolve(rev_in, ir) if loop else linear_convolve(rev_in, ir)[:n]
        wet_board = eq_chain(hpf=280, lpf=7500)
        wet = periodic(lambda z: pb(wet_board, z), wet, 1.0, loop)
        mix = dry + wet * db2lin(self.rev_level_db)
        if self.delay_s and np.any(dly_in):
            d = pingpong(dly_in, self.delay_s, self.delay_fb, loop=loop)[:n]
            mix += d
        # master: gentle tilt-matching EQ toward a bright-but-soft acoustic reference
        peaks = list(self.master_peaks)
        if self.auto_eq:
            corr = tilt_correction(mix, self.eq_amount)
            self.report["_auto_eq"] = {str(k): round(v, 2) for k, v in corr}
            peaks += [(f, g, 1.1) for f, g in corr if abs(g) > 0.25]
        mboard = eq_chain(hpf=28, high_shelf=self.master_high_shelf, peaks=peaks)
        mix = periodic(lambda z: pb(mboard, z), mix, 1.0, loop)
        if self.comp:
            lu = lufs_integrated(mix)
            mix *= db2lin(-20.0 - lu)
            comp = Pedalboard([Compressor(threshold_db=-21.0, ratio=1.8, attack_ms=25.0, release_ms=250.0)])
            mix = periodic(lambda z: pb(comp, z), mix, 3.0, loop)
        lu = lufs_integrated(mix)
        mix *= db2lin(self.master_lufs - lu)
        mix = periodic(lambda z: fast_limiter(z, self.ceiling_db), mix, 1.0, loop)
        return mix
