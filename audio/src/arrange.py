"""Arranging helpers: chord progressions, strums, arpeggios, bass lines, pads."""
import numpy as np

from music_lib import P, bass_note, chord, chord_pcs, voicing

SCALES = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "harm": [0, 2, 3, 5, 7, 8, 11],
    "mixo": [0, 2, 4, 5, 7, 9, 10],
}


def prog(text, start_bar=0, bar_beats=4):
    """'F | C/E | Gm7 C7' -> [(t, dur, sym)].  Chords inside a bar split it evenly.
    A chord written as 'Sym:2' takes 2 beats explicitly (rest of bar split evenly)."""
    out = []
    bars = [b.strip() for b in text.split("|")]
    for i, b in enumerate(bars):
        syms = b.split()
        t0 = (start_bar + i) * bar_beats
        fixed = 0.0
        parsed = []
        for s in syms:
            if ":" in s:
                n, d = s.split(":")
                parsed.append((n, float(d)))
                fixed += float(d)
            else:
                parsed.append((s, None))
        free = [p for p in parsed if p[1] is None]
        each = (bar_beats - fixed) / len(free) if free else 0
        t = t0
        for n, d in parsed:
            d = d if d is not None else each
            out.append((t, d, n))
            t += d
    return out


def chords_in(chords, t0, t1):
    return [c for c in chords if c[0] >= t0 - 1e-9 and c[0] < t1 - 1e-9]


def chord_at(chords, t):
    for (ct, d, s) in chords:
        if ct - 1e-9 <= t < ct + d - 1e-9:
            return s
    return chords[-1][2]


# ----------------------------------------------------------------------------
def strum(track, chords, pattern="D.DU.UDU", low="c4", high="a5", n=4, vel=72, strum_s=0.014,
          step=0.5, ring=1.0, up_vel=-12, accent_first=8, mute_char="x"):
    """Strum pattern per bar (one char per `step`): D down, U up, x muted chuck, . rest."""
    low, high = P(low), P(high)
    prev = None
    song = track.song
    bar = song.bar_beats
    steps = int(round(bar / step))
    for (t, d, sym) in chords:
        v = voicing(sym, low, high, n=n, prev=prev)
        prev = v
        # strum strokes falling within this chord's span
        b0 = np.floor(t / bar) * bar
        for k in range(steps * int(np.ceil((t + d - b0) / bar))):
            tt = b0 + k * step
            if tt < t - 1e-9 or tt >= t + d - 1e-9:
                continue
            ch = pattern[k % len(pattern)]
            if ch == ".":
                continue
            # duration: until next stroke
            nxt = step
            j = k + 1
            while pattern[j % len(pattern)] == "." and nxt < 4:
                nxt += step
                j += 1
            dur = min(nxt, t + d - tt) * ring
            if ch == "D":
                track.chord(tt, dur, v, vel + (accent_first if abs(tt - b0 - round((tt - b0))) < 1e-6 and (tt - b0) % 2 == 0 else 0), strum=strum_s)
            elif ch == "U":
                track.chord(tt, dur, v[1:] if len(v) > 3 else v, vel + up_vel, strum=strum_s * 0.8, up=True)
            elif ch == mute_char:
                track.chord(tt, 0.08, v, vel - 20, strum=strum_s * 0.5)


def arp(track, chords, pattern=(0, 1, 2, 3, 2, 1, 0, 1), step=0.5, low="c4", high="c6", n=4, vel=70,
        gate=1.6, vel_pattern=None, offset=0.0):
    """Arpeggiate the voiced chord with index pattern (indices wrap with octave)."""
    low, high = P(low), P(high)
    prev = None
    for (t, d, sym) in chords:
        v = voicing(sym, low, high, n=n, prev=prev)
        prev = v
        k = 0
        tt = t + offset
        while tt < t + d - 1e-9:
            idx = pattern[k % len(pattern)]
            if idx is not None:
                octv, i = divmod(idx, len(v))
                p = v[i] + 12 * octv
                vv = vel + (vel_pattern[k % len(vel_pattern)] if vel_pattern else 0)
                track.note(tt, step * gate, p, vv)
            k += 1
            tt += step


def comp_hits(track, chords, rhythm, low="e4", high="e5", n=3, vel=66, gate=0.5):
    """rhythm: list of (beat_offset_in_bar, dur) hits each bar."""
    low, high = P(low), P(high)
    prev = None
    bar = track.song.bar_beats
    for (t, d, sym) in chords:
        v = voicing(sym, low, high, n=n, prev=prev)
        prev = v
        b0 = np.floor(t / bar + 1e-9) * bar
        for (off, dur) in rhythm:
            tt = b0 + off
            if t - 1e-9 <= tt < t + d - 1e-9:
                track.chord(tt, dur * gate, v, vel, strum=0.004)


def pad(track, chords, low="f3", high="c5", n=4, vel=60, gate=1.02):
    low, high = P(low), P(high)
    prev = None
    for (t, d, sym) in chords:
        v = voicing(sym, low, high, n=n, prev=prev)
        prev = v
        track.chord(t, d * gate, v, vel, strum=0.0)


def _approach(cur, target, key_pcs):
    """Scale step adjacent to target, approached from cur's side."""
    if target == cur:
        return target + (2 if (target + 2) % 12 in key_pcs else 1)
    direction = -1 if target > cur else 1
    for k in (1, 2):
        c = target + direction * k
        if c % 12 in key_pcs:
            return c
    return target + direction


def bassline(track, chords, template, key="F", scale="major", low="e1", high="d3", prefer="a2", vel=88,
             gate=0.85):
    """template: list of (degree, dur) per chord span, degrees:
    'R' root(bass), '5' fifth, '8' octave up, '3' third, 'A' approach to next chord, 'r' rest,
    'b' fifth below.  The template is repeated/cut to fill each chord's duration."""
    key_pc = P(key.lower() + "4") % 12
    key_pcs = [(key_pc + s) % 12 for s in SCALES[scale]]
    low, high, prefer = P(low), P(high), P(prefer)
    roots = [bass_note(s, low, high, prefer) for (_, _, s) in chords]
    for i, (t, d, sym) in enumerate(chords):
        r = roots[i]
        nxt = roots[(i + 1) % len(roots)]
        rt, iv, _ = chord(sym)
        third = r + ((rt + iv[1] - (r % 12)) % 12) if len(iv) > 1 else r + 4
        fifth = r + 7 if (r + 7) % 12 in [(rt + x) % 12 for x in iv] else r + ((rt + iv[-1] - r) % 12)
        tpl = template(d) if callable(template) else template
        tt = t
        k = 0
        while tt < t + d - 1e-9:
            deg, dur = tpl[k % len(tpl)]
            dur = min(dur, t + d - tt)
            p = None
            if deg == "R":
                p = r
            elif deg == "5":
                p = fifth if fifth <= high + 5 else fifth - 12
            elif deg == "b":
                p = fifth - 12 if fifth - 12 >= low else fifth
            elif deg == "8":
                p = r + 12
            elif deg == "3":
                p = third
            elif deg == "A":
                p = _approach(r, nxt, key_pcs)
            if p is not None:
                track.note(tt, dur * gate, p, vel + (6 if k == 0 else 0))
            tt += dur
            k += 1
