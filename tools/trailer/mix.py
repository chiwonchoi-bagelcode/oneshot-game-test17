"""Offline mix of the trailer soundtrack from the game's own sound files.

Reads the event list written by tools/trailer/make.mjs (sounds the game asked
for during the takes, already moved to trailer time) and mixes it the way the
in-game audio engine plays it: same files, variants, per-sound limits, pitch
variation, spray loop fades and the music duck on rescues.

Usage: python3 tools/trailer/mix.py <events.json> <out.wav>
"""
import json, subprocess, sys, wave, os
import numpy as np

SR = 48000
SRC = 'audio/out'
LIMITS = {'goo_hit': (3, .05), 'cocoon_hit': (2, .08), 'pickup_xp': (4, .03), 'pickup_coin': (4, .035),
          'coin_tick': (2, .03), 'goo_burst': (4, .03), 'enemy_spit': (3, .06), 'ui_tap': (2, .04)}
SFX_VOL, MUSIC_VOL = 0.9, 0.7  # the game's default settings
_cache = {}


def load(name):
    if name not in _cache:
        path = f'{SRC}/{name}.mp3'
        if not os.path.exists(path):
            _cache[name] = None
        else:
            raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
            _cache[name] = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
    return _cache[name]


def variants(name):
    b = load(name)
    if b is not None:
        return [b]
    return [v for v in (load(f'{name}_{i}') for i in (1, 2, 3)) if v is not None]


def resample(buf, rate):
    if abs(rate - 1) < 1e-3:
        return buf
    n = int(len(buf) / rate)
    x = np.arange(n) * rate
    return np.stack([np.interp(x, np.arange(len(buf)), buf[:, c]) for c in range(2)], axis=1).astype(np.float32)


def main(src, dst):
    ev = json.load(open(src))
    total = int(ev['duration'] * SR) + SR
    out = np.zeros((total, 2), np.float32)
    rng = np.random.default_rng(7)
    # one-shot sounds with the engine's limits (max at once, minimum gap)
    state = {}
    for e in sorted(ev['sfx'], key=lambda e: e['t']):
        name = e['n']
        vs = variants(name)
        if not vs:
            continue
        mx, gap = LIMITS.get(name, (6, .015))
        st = state.setdefault(name, {'ends': [], 'last': -1})
        st['ends'] = [x for x in st['ends'] if x > e['t']]
        if len(st['ends']) >= mx or e['t'] - st['last'] < gap:
            continue
        vary = 0 if name.startswith('stinger') or name == 'rescue' else 0.06
        buf = resample(vs[rng.integers(len(vs))], e.get('r', 1) * (1 + rng.uniform(-vary, vary)))
        st['last'] = e['t']; st['ends'].append(e['t'] + len(buf) / SR)
        i = int(e['t'] * SR); j = min(total, i + len(buf))
        out[i:j] += buf[:j - i] * e.get('v', 1) * SFX_VOL
    # loops (spray): gain follows on/off/volume changes with the engine's short fades
    for name, changes in ev['loops'].items():
        buf = load(name)
        if buf is None:
            continue
        sig = np.tile(buf, (total // len(buf) + 1, 1))[:total]
        target = np.zeros(total, np.float32)
        changes = sorted(changes, key=lambda c: c['t'])
        for k, c in enumerate(changes):
            i = int(c['t'] * SR); j = int(changes[k + 1]['t'] * SR) if k + 1 < len(changes) else total
            target[i:j] = c['v'] if c['on'] else 0
        # one-pole smoothing (~35 ms), like setTargetAtTime
        a = 1 - np.exp(-1 / (0.035 * SR))
        g = np.zeros(total, np.float32); acc = 0.0
        step = 64  # smooth in blocks for speed
        for i in range(0, total, step):
            acc += (target[i] - acc) * (1 - (1 - a) ** step)
            g[i:i + step] = acc
        out += sig * g[:, None] * SFX_VOL
    # music bed with fades and the rescue duck
    m = ev.get('music')
    if m:
        buf = load(m['name'])
        bed = np.tile(buf, (total // len(buf) + 1, 1))[:total] * m['vol'] * MUSIC_VOL
        env = np.ones(total, np.float32)
        fi = int(m['fadeIn'] * SR); env[:fi] = np.linspace(0, 1, fi)
        end = int(m['end'] * SR); fo = int(m['fadeOut'] * SR)
        env[max(0, end - fo):end] *= np.linspace(1, 0, min(fo, end))
        env[end:] = 0
        for d in ev.get('ducks', []):
            i = int(d['t'] * SR); j = min(total, i + int(d['dur'] * SR))
            env[i:j] *= d['level']
        k = int(0.08 * SR)  # soften duck edges
        env = np.convolve(env, np.ones(k) / k, mode='same').astype(np.float32)
        out += bed * env[:, None]
    out = out[:int(ev['duration'] * SR)]
    peak = float(np.abs(out).max()) or 1
    if peak > 0.89:
        out *= 0.89 / peak
    pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
    with wave.open(dst, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(f'mixed {len(ev["sfx"])} sounds, {sum(len(v) for v in ev["loops"].values())} loop changes, peak {peak:.2f} -> {dst}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
