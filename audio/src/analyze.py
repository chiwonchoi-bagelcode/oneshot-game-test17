"""Analysis helpers: loop-seam checks, band energies, spectrograms."""
import numpy as np
import scipy.signal as sps

from common import SR, as2d, decode_audio, lin2db


def seam_metrics(x):
    """Quantify the discontinuity when x loops (last sample -> first sample).

    jump_ratio: |x[0]-x[-1]| / 99.9th percentile of |x[n+1]-x[n]| (<= ~1 is seamless)
    hf_ratio_db: energy above 6 kHz in a 6 ms window centred on the seam vs the
                 median of the same measure at 400 positions elsewhere (a click
                 would show as a large positive dB value).
    """
    x = as2d(x)
    d = np.abs(np.diff(x, axis=0))
    typical = np.percentile(d, 99.9)
    jump = np.max(np.abs(x[0] - x[-1]))
    n = x.shape[0]
    r = np.roll(x, n // 2, axis=0)  # seam now in the middle
    sos = sps.butter(4, 6000, btype="highpass", fs=SR, output="sos")
    hf = sps.sosfiltfilt(sos, r, axis=0)
    e = np.sum(hf ** 2, axis=1)
    w = int(0.006 * SR)
    c = n // 2
    seam_e = np.mean(e[c - w // 2:c + w // 2])
    rng = np.random.default_rng(0)
    pos = rng.integers(w + SR // 10, n - w - SR // 10, 400)
    pos = pos[np.abs(pos - c) > SR // 10]
    others = np.array([np.mean(e[p - w // 2:p + w // 2]) for p in pos])
    hf_ratio = 10 * np.log10((seam_e + 1e-15) / (np.median(others) + 1e-15))
    hf_pct = float(np.mean(others < seam_e) * 100)
    return {"jump": float(jump), "typical_step_p999": float(typical), "jump_ratio": float(jump / (typical + 1e-12)),
            "seam_hf_vs_median_db": float(hf_ratio), "seam_hf_percentile": hf_pct}


def bar_rms(x, bpm, bar_beats=4):
    x = as2d(x)
    bl = int(round(bar_beats * 60 / bpm * SR))
    out = []
    for i in range(0, x.shape[0] - bl + 1, bl):
        out.append(round(float(lin2db(np.sqrt(np.mean(x[i:i + bl] ** 2)))), 1))
    return out


def band_energy(x, edges=(0, 60, 150, 300, 600, 1200, 2500, 5000, 8000, 12000, 22050)):
    x = as2d(x).mean(axis=1)
    f, P = sps.welch(x, fs=SR, nperseg=8192)
    out = {}
    tot = np.sum(P)
    for lo, hi in zip(edges[:-1], edges[1:]):
        m = (f >= lo) & (f < hi)
        out["%d-%d" % (lo, hi)] = round(float(10 * np.log10(np.sum(P[m]) / tot + 1e-15)), 1)
    return out


def mp3_check(path, expect_samples):
    y = decode_audio(path)
    return y, {"decoded_samples": int(y.shape[0]), "expected": int(expect_samples),
               "length_ok": int(y.shape[0]) == int(expect_samples)}


def _colormap(v):
    """v in [0,1] -> RGB uint8 (dark blue -> purple -> orange -> pale yellow)."""
    stops = np.array([[0.0, 4, 4, 16], [0.25, 50, 16, 100], [0.5, 150, 40, 120],
                      [0.75, 245, 120, 40], [1.0, 255, 250, 200]])
    out = np.zeros(v.shape + (3,))
    for c in range(3):
        out[..., c] = np.interp(v, stops[:, 0], stops[:, c + 1])
    return out.astype(np.uint8)


def spectrogram_log_png(x, path, title, fmin=40.0, fmax=18000.0, height=420, px_per_s=None,
                        width=None, db_range=80.0):
    """Log-frequency spectrogram with labelled axes (Pillow only)."""
    from PIL import Image, ImageDraw
    x = as2d(x).mean(axis=1)
    dur = len(x) / SR
    if width is None:
        width = int(min(1400, max(500, (px_per_s or 18) * dur)))
    nfft = 4096 if dur > 3 else (2048 if dur > 1.2 else 1024)
    hop = max(64, int(len(x) / width))
    f, t, Z = sps.stft(x, fs=SR, nperseg=nfft, noverlap=nfft - hop if nfft > hop else nfft // 2,
                       boundary=None, padded=False)
    mag = 20 * np.log10(np.abs(Z) + 1e-9)
    ref = np.max(mag)
    logf = np.geomspace(fmin, fmax, height)
    rows = np.array([np.interp(logf, f, mag[:, j]) for j in range(mag.shape[1])]).T  # (height, frames)
    rows = rows[::-1]
    v = np.clip((rows - (ref - db_range)) / db_range, 0, 1)
    img = _colormap(v)
    im = Image.fromarray(img).resize((width, height))
    L, T, R, B = 60, 24, 10, 26
    canvas = Image.new("RGB", (width + L + R, height + T + B), (16, 16, 24))
    canvas.paste(im, (L, T))
    d = ImageDraw.Draw(canvas)
    d.text((L, 5), "%s   (log freq, %d dB range, 0 dB = loudest bin)" % (title, db_range), fill=(230, 230, 230))
    for fr in (50, 100, 200, 500, 1000, 2000, 5000, 10000, 16000):
        if fmin <= fr <= fmax:
            yy = T + int((1 - np.log(fr / fmin) / np.log(fmax / fmin)) * (height - 1))
            d.line([(L - 5, yy), (L, yy)], fill=(200, 200, 200))
            d.text((4, yy - 6), ("%dk" % (fr // 1000)) if fr >= 1000 else str(fr), fill=(200, 200, 200))
    step = 1 if dur <= 4 else (5 if dur <= 40 else 10)
    if dur <= 1.5:
        step = 0.1 if dur <= 0.6 else 0.25
    tt = 0.0
    while tt <= dur + 1e-9:
        xx = L + int(tt / dur * (width - 1))
        d.line([(xx, T + height), (xx, T + height + 4)], fill=(200, 200, 200))
        d.text((xx - 8, T + height + 7), ("%.2gs" % tt) if step < 1 else "%ds" % tt, fill=(200, 200, 200))
        tt += step
    canvas.save(path)


def pianoroll_png(song, path, height=520):
    """Arrangement overview: one colour per track, pitch vs. bar (drums in a bottom strip)."""
    from PIL import Image, ImageDraw
    pal = [(255, 200, 80), (120, 200, 255), (255, 120, 160), (140, 230, 140), (200, 150, 255),
           (255, 160, 90), (90, 220, 210), (230, 230, 120), (180, 180, 180), (250, 130, 240), (130, 160, 255)]
    L, T, R, B = 90, 20, 10, 20
    W = int(song.bars * 36)
    lo, hi = 28, 100
    drum_h = 60
    img = Image.new("RGB", (W + L + R, height + T + B + drum_h), (14, 14, 22))
    d = ImageDraw.Draw(img)
    beats = song.total_beats
    for b in range(song.bars + 1):
        x = L + int(b / song.bars * W)
        d.line([(x, T), (x, T + height + drum_h)], fill=(40, 40, 60) if b % 4 else (80, 80, 110))
        if b % 4 == 0 and b < song.bars:
            d.text((x + 2, T + height + drum_h + 4), str(b + 1), fill=(200, 200, 200))
    ti = 0
    for tr in song.tracks:
        if not tr.notes:
            continue
        col = pal[ti % len(pal)]
        if tr.drum:
            for n in tr.notes:
                x = L + int((n.t % beats) / beats * W)
                y = T + height + 4 + (n.p % 12) * 4
                d.rectangle([x, y, x + 1, y + 2], fill=col)
        else:
            for n in tr.notes:
                x0 = L + int((n.t % beats) / beats * W)
                x1 = L + int(min(beats, (n.t % beats) + n.d) / beats * W)
                y = T + int((1 - (n.p - lo) / (hi - lo)) * height)
                d.rectangle([x0, y - 1, max(x0 + 1, x1), y + 1], fill=col)
        d.text((4, T + 14 * ti), tr.name, fill=col)
        ti += 1
    img.save(path)


def sfx_stats(x):
    x = as2d(x).mean(axis=1)
    from common import lufs_ungated, lufs_short_max
    pk = np.max(np.abs(x))
    f, P = sps.welch(x, fs=SR, nperseg=min(2048, len(x)))
    tot = np.sum(P) + 1e-20
    cen = float(np.sum(f * P) / tot)
    lead = int(np.argmax(np.abs(x) > pk * 10 ** (-40 / 20)))
    return {
        "dur": round(len(x) / SR, 3), "peak_db": round(float(lin2db(pk)), 2),
        "lufs": round(lufs_ungated(x), 1), "lufs_st_max": round(lufs_short_max(x), 1),
        "centroid_hz": int(cen), "hf6k_db": round(float(10 * np.log10(np.sum(P[f > 6000]) / tot + 1e-12)), 1),
        "lf100_db": round(float(10 * np.log10(np.sum(P[f < 100]) / tot + 1e-12)), 1),
        "dc": float(np.mean(x)), "first": float(abs(x[0])), "last": float(abs(x[-1])),
        "lead_ms": round(lead / SR * 1000, 2),
    }


def contact_sheet(items, path, cols=4, cell=(330, 170)):
    """items: [(title, mono_array)] -> grid of small log spectrograms + waveform strip."""
    from PIL import Image, ImageDraw
    import tempfile, os
    rows = int(np.ceil(len(items) / cols))
    W, H = cell
    sheet = Image.new("RGB", (cols * W, rows * H), (10, 10, 16))
    for i, (title, x) in enumerate(items):
        with tempfile.TemporaryDirectory() as td:
            p = os.path.join(td, "s.png")
            spectrogram_log_png(x, p, title, width=W - 70, height=H - 70, fmin=50, fmax=16000)
            im = Image.open(p).convert("RGB")
        # waveform strip
        d = ImageDraw.Draw(im)
        xs = as2d(x).mean(axis=1)
        n = len(xs)
        w = im.width - 70
        top = im.height - 22
        for k in range(w):
            seg = xs[int(k * n / w):int((k + 1) * n / w) + 1]
            a = float(np.max(np.abs(seg))) if len(seg) else 0
            h = int(a * 14)
        sheet.paste(im.resize((W, H)), ((i % cols) * W, (i // cols) * H))
    sheet.save(path)


def seam_vs_downbeats(y, bars):
    """Loop the file twice and compare the >6 kHz energy in a 6 ms window at the seam with the
    same measure at every other bar downbeat (a click would rank at ~100th percentile)."""
    y = as2d(y)
    L = y.shape[0]
    yy = np.vstack([y, y])
    sos = sps.butter(4, 6000, btype="highpass", fs=SR, output="sos")
    e = np.sum(sps.sosfiltfilt(sos, yy, axis=0) ** 2, axis=1)
    w = int(0.006 * SR)

    def win(c):
        return np.mean(e[c - w // 2:c + w // 2])

    seam = win(L)
    others = np.array([win(int(round(L + k * L / bars))) for k in range(1, bars)])
    return float(np.mean(others < seam) * 100), float(10 * np.log10(seam / np.median(others)))
