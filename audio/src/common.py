"""Shared helpers for the Splash Rescue audio build.

Everything here is deterministic: no randomness lives in this module.
"""
import os
import re
import subprocess
import tempfile
import warnings

import numpy as np
import scipy.io.wavfile as wavfile
import scipy.signal as sps

SR = 44100
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.dirname(SRC_DIR)
OUT_DIR = os.path.join(AUDIO_DIR, "out")
REVIEW_DIR = os.path.join(AUDIO_DIR, "review")
BUILD_DIR = os.path.join(AUDIO_DIR, "build")  # intermediate wavs (safe to delete)
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"

warnings.filterwarnings("ignore", category=wavfile.WavFileWarning)

for _d in (OUT_DIR, REVIEW_DIR, BUILD_DIR):
    os.makedirs(_d, exist_ok=True)


# ----------------------------------------------------------------------------
# basic conversions
# ----------------------------------------------------------------------------
def db2lin(db):
    return 10.0 ** (np.asarray(db, dtype=np.float64) / 20.0)


def lin2db(x):
    return 20.0 * np.log10(np.maximum(np.abs(x), 1e-12))


def as2d(x):
    """Return (n, ch) float64 array."""
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    return x


# ----------------------------------------------------------------------------
# wav / mp3 io
# ----------------------------------------------------------------------------
def read_wav(path):
    sr, x = wavfile.read(path)
    if x.dtype == np.int16:
        x = x.astype(np.float64) / 32768.0
    elif x.dtype == np.int32:
        x = x.astype(np.float64) / 2147483648.0
    else:
        x = x.astype(np.float64)
    if x.ndim == 1:
        x = x[:, None]
    assert sr == SR, (path, sr)
    return x


def write_wav(path, x):
    x = as2d(x).astype(np.float32)
    if x.shape[1] == 1:
        x = x[:, 0]
    wavfile.write(path, SR, x)


def encode_mp3(x, path, bitrate="96k"):
    """Encode float audio (n, ch) to MP3 with LAME (CBR, best algorithm quality).

    ffmpeg writes a Xing/LAME header that carries encoder delay + padding so
    gapless-aware decoders return exactly len(x) samples.
    """
    x = as2d(x)
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, "in.wav")
        write_wav(wav, x)
        cmd = [
            "ffmpeg", "-y", "-loglevel", "error", "-i", wav,
            "-map_metadata", "-1", "-c:a", "libmp3lame", "-b:a", bitrate,
            "-compression_level", "0", "-ar", str(SR), "-ac", str(x.shape[1]),
            path,
        ]
        subprocess.run(cmd, check=True)


def decode_audio(path, channels=None):
    cmd = ["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-acodec", "pcm_f32le"]
    if channels:
        cmd += ["-ac", str(channels)]
    cmd += ["-ar", str(SR), "-"]
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
         "stream=channels", "-of", "csv=p=0", path],
        check=True, capture_output=True, text=True)
    ch = channels or int(probe.stdout.strip().split(",")[0])
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return x.reshape(-1, ch)


# ----------------------------------------------------------------------------
# loudness (ITU-R BS.1770-4) and peaks
# ----------------------------------------------------------------------------
def _biquad_high_shelf(G, Q, fc, rate):
    A = 10 ** (G / 40.0)
    w0 = 2 * np.pi * fc / rate
    alpha = np.sin(w0) / (2 * Q)
    cw = np.cos(w0)
    b0 = A * ((A + 1) + (A - 1) * cw + 2 * np.sqrt(A) * alpha)
    b1 = -2 * A * ((A - 1) + (A + 1) * cw)
    b2 = A * ((A + 1) + (A - 1) * cw - 2 * np.sqrt(A) * alpha)
    a0 = (A + 1) - (A - 1) * cw + 2 * np.sqrt(A) * alpha
    a1 = 2 * ((A - 1) - (A + 1) * cw)
    a2 = (A + 1) - (A - 1) * cw - 2 * np.sqrt(A) * alpha
    return np.array([b0, b1, b2]) / a0, np.array([1, a1 / a0, a2 / a0])


def _biquad_high_pass(Q, fc, rate):
    w0 = 2 * np.pi * fc / rate
    alpha = np.sin(w0) / (2 * Q)
    cw = np.cos(w0)
    b = np.array([(1 + cw) / 2, -(1 + cw), (1 + cw) / 2])
    a = np.array([1 + alpha, -2 * cw, 1 - alpha])
    return b / a[0], a / a[0]


_KW = [_biquad_high_shelf(4.0, 1 / np.sqrt(2), 1500.0, SR), _biquad_high_pass(0.5, 38.0, SR)]


def k_weight(x):
    y = as2d(x)
    for b, a in _KW:
        y = sps.lfilter(b, a, y, axis=0)
    return y


def lufs_integrated(x):
    """Gated integrated loudness (BS.1770-4). Returns -inf-ish for silence."""
    y = k_weight(x)
    n = y.shape[0]
    blk = int(0.4 * SR)
    hop = int(0.1 * SR)
    if n < blk:
        return lufs_ungated(x)
    ms = []
    for s in range(0, n - blk + 1, hop):
        ms.append(np.mean(y[s:s + blk] ** 2, axis=0).sum())
    ms = np.array(ms)
    l = -0.691 + 10 * np.log10(np.maximum(ms, 1e-20))
    g1 = ms[l > -70]
    if len(g1) == 0:
        return -70.0
    rel = -0.691 + 10 * np.log10(np.mean(g1)) - 10
    g2 = ms[(l > -70) & (l > rel)]
    return float(-0.691 + 10 * np.log10(np.mean(g2)))


def lufs_ungated(x):
    y = k_weight(x)
    return float(-0.691 + 10 * np.log10(max(np.mean(y ** 2, axis=0).sum(), 1e-20)))


def lufs_short_max(x):
    """Max short-term-ish loudness over 400 ms windows (or whole file if shorter)."""
    y = k_weight(x)
    n = y.shape[0]
    blk = int(0.4 * SR)
    if n <= blk:
        return float(-0.691 + 10 * np.log10(max((np.sum(y ** 2, axis=0) / blk).sum(), 1e-20)))
    best = -200.0
    for s in range(0, n - blk + 1, int(0.05 * SR)):
        v = -0.691 + 10 * np.log10(max(np.mean(y[s:s + blk] ** 2, axis=0).sum(), 1e-20))
        best = max(best, v)
    return float(best)


def sample_peak_db(x):
    return float(lin2db(np.max(np.abs(x))))


def true_peak_db(x, os_factor=4):
    x = as2d(x)
    up = sps.resample_poly(x, os_factor, 1, axis=0)
    return float(lin2db(max(np.max(np.abs(up)), np.max(np.abs(x)))))


def ffmpeg_ebur128(path):
    """Return dict(I=..., TP=...) from ffmpeg's ebur128 filter."""
    r = subprocess.run(
        ["ffmpeg", "-nostats", "-hide_banner", "-i", path, "-filter_complex",
         "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True, text=True)
    txt = r.stderr
    summ = txt[txt.rfind("Summary:"):]
    I = re.search(r"I:\s+(-?[\d.]+|-inf)\s+LUFS", summ)
    TP = re.search(r"Peak:\s+(-?[\d.]+|-inf)\s+dBFS", summ)
    return {
        "I": float(I.group(1)) if I else float("nan"),
        "TP": float(TP.group(1)) if TP else float("nan"),
    }


# ----------------------------------------------------------------------------
# small dsp helpers
# ----------------------------------------------------------------------------
def fade(x, fin_ms=3.0, fout_ms=8.0):
    x = as2d(x).copy()
    n = x.shape[0]
    fi = min(int(fin_ms * SR / 1000), n // 2)
    fo = min(int(fout_ms * SR / 1000), n // 2)
    if fi > 0:
        x[:fi] *= (np.sin(np.linspace(0, np.pi / 2, fi)) ** 2)[:, None]
    if fo > 0:
        x[n - fo:] *= (np.cos(np.linspace(0, np.pi / 2, fo)) ** 2)[:, None]
    return x


def remove_dc(x):
    x = as2d(x)
    return x - np.mean(x, axis=0, keepdims=True)


def butter(x, kind, freq, order=2):
    """Zero-state Butterworth filter (lowpass/highpass/bandpass)."""
    sos = sps.butter(order, freq, btype=kind, fs=SR, output="sos")
    return sps.sosfilt(sos, as2d(x), axis=0)


def spectrogram_png(path_audio, path_png, title, seconds=None):
    """Render a spectrogram with sox (log-ish frequency, 0..22 kHz)."""
    cmd = ["sox", path_audio, "-n"]
    if seconds is not None:
        cmd += ["trim", "0", str(seconds)]
    cmd += ["remix", "-", "spectrogram", "-o", path_png, "-x", "1200", "-y", "513",
            "-z", "100", "-t", title]
    subprocess.run(cmd, check=True, capture_output=True)
