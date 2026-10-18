"""Regenerate every Splash Rescue audio asset deterministically.

    python3 audio/src/build_all.py            # everything
    python3 audio/src/build_all.py --music    # only music / --stingers / --sfx / --analyze
    python3 audio/src/build_all.py --keep-wav # keep intermediate wavs in audio/build/

Outputs: audio/out/*.mp3, audio/out/manifest.json, audio/review/*.png,
audio/review/measurements.json + measurements.md (tables used in REPORT.md).
"""
import json
import os
import shutil
import sys
import time
from multiprocessing import Pool

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np  # noqa: E402

from common import (BUILD_DIR, OUT_DIR, REVIEW_DIR, SR, decode_audio, ffmpeg_ebur128, k_weight,  # noqa: E402
                    lufs_ungated, sample_peak_db, true_peak_db)

MUSIC = ["bgm_home", "bgm_forest", "bgm_village", "bgm_lake", "bgm_boss", "bgm_shelter"]
STINGERS = ["stinger_clear", "stinger_fail", "stinger_evolve"]


def _render_music(name):
    import render_music
    return render_music.render(name)


def build_music():
    with Pool(3) as pool:
        infos = pool.map(_render_music, MUSIC)
    return {i["name"]: i for i in infos}


def build_stingers():
    import stingers
    return stingers.build()


def build_sfx():
    import sfx
    return sfx.build()


def m100(x):
    from sfx_lib import m100 as _m
    return _m(x)


def analyze():
    import importlib
    from analyze import seam_metrics, spectrogram_log_png, contact_sheet, pianoroll_png
    import render_music
    import sfx

    meas = {"music": {}, "stingers": {}, "sfx": {}}
    manifest = {"music": {}, "sfx": {}}
    # ---- music --------------------------------------------------------------
    for name in MUSIC:
        mp3 = os.path.join(OUT_DIR, name + ".mp3")
        y = decode_audio(mp3)
        mod = importlib.import_module(render_music.SONGS[name])
        song, _, _ = mod.build()
        e = ffmpeg_ebur128(mp3)
        sm = seam_metrics(y)
        meas["music"][name] = {
            "duration_s": round(y.shape[0] / SR, 3), "samples": int(y.shape[0]),
            "expected_samples": song.length_samples, "bpm": song.bpm, "bars": song.bars,
            "lufs_I": e["I"], "true_peak_dBTP": e["TP"], "sample_peak_dBFS": round(sample_peak_db(y), 2),
            "seam_jump_ratio": round(sm["jump_ratio"], 3), "seam_hf_percentile": round(sm["seam_hf_percentile"], 1),
            "size_kB": round(os.path.getsize(mp3) / 1024, 1),
        }
        manifest["music"][name] = {"file": name + ".mp3", "duration": round(y.shape[0] / SR, 4),
                                   "bpm": song.bpm, "loop": True}
        pianoroll_png(song, os.path.join(REVIEW_DIR, name + "_arrangement.png"))
    for name in STINGERS:
        mp3 = os.path.join(OUT_DIR, name + ".mp3")
        y = decode_audio(mp3)
        e = ffmpeg_ebur128(mp3)
        meas["stingers"][name] = {
            "duration_s": round(y.shape[0] / SR, 3), "lufs_I": e["I"], "true_peak_dBTP": e["TP"],
            "sample_peak_dBFS": round(sample_peak_db(y), 2), "size_kB": round(os.path.getsize(mp3) / 1024, 1)}
        bpm = {"stinger_clear": 132, "stinger_fail": 100, "stinger_evolve": 120}[name]
        manifest["music"][name] = {"file": name + ".mp3", "duration": round(y.shape[0] / SR, 4), "bpm": bpm,
                                   "loop": False}
    # ---- sfx ----------------------------------------------------------------
    sheet = []
    for name in sfx.SFX:
        mp3 = os.path.join(OUT_DIR, name + ".mp3")
        y = decode_audio(mp3)[:, 0]
        a = np.abs(y)
        lead = int(np.argmax(a > a.max() * 10 ** (-40 / 20)))
        rec = {
            "duration_s": round(len(y) / SR, 3), "sample_peak_dBFS": round(sample_peak_db(y), 2),
            "true_peak_dBTP": round(true_peak_db(y), 2), "m100_LUFS": round(m100(y), 1),
            "lufs_ungated": round(lufs_ungated(y), 1), "lead_silence_ms": round(lead / SR * 1000, 2),
            "dc": float(np.mean(y)), "first_abs": round(float(a[0]), 4), "last_abs": round(float(a[-1]), 5),
            "size_kB": round(os.path.getsize(mp3) / 1024, 1),
        }
        if name in sfx.LOOPS:
            sm = seam_metrics(y)
            rec["seam_jump_ratio"] = round(sm["jump_ratio"], 3)
            rec["seam_hf_percentile"] = round(sm["seam_hf_percentile"], 1)
        meas["sfx"][name] = rec
        manifest["sfx"][name] = {"file": name + ".mp3", "duration": round(len(y) / SR, 4)}
        if name in sfx.LOOPS:
            manifest["sfx"][name]["loop"] = True
        sheet.append((name, y))
    with open(os.path.join(OUT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    total = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR))
    meas["total_size_bytes"] = total
    with open(os.path.join(REVIEW_DIR, "measurements.json"), "w") as f:
        json.dump(meas, f, indent=1)
    # ---- review images --------------------------------------------------------
    for name, title in (("bgm_forest", "bgm_forest (decoded mp3)"),):
        spectrogram_log_png(decode_audio(os.path.join(OUT_DIR, name + ".mp3")),
                            os.path.join(REVIEW_DIR, name + "_spectrogram.png"), title)
    for name in ("goo_burst_1", "rescue", "spray_loop"):
        y = decode_audio(os.path.join(OUT_DIR, name + ".mp3"))
        spectrogram_log_png(y, os.path.join(REVIEW_DIR, name + "_spectrogram.png"), name + " (decoded mp3)",
                            width=900)
    # spray_loop played twice in a row: the seam sits in the middle of the picture
    y = decode_audio(os.path.join(OUT_DIR, "spray_loop.mp3"))
    spectrogram_log_png(np.vstack([y, y]), os.path.join(REVIEW_DIR, "spray_loop_x2_seam.png"),
                        "spray_loop looped twice (seam at 2.0 s)", width=900)
    contact_sheet(sheet[:24], os.path.join(REVIEW_DIR, "sfx_sheet_1.png"))
    contact_sheet(sheet[24:], os.path.join(REVIEW_DIR, "sfx_sheet_2.png"))
    for name in MUSIC[:1] + MUSIC[2:]:
        spectrogram_log_png(decode_audio(os.path.join(OUT_DIR, name + ".mp3")),
                            os.path.join(REVIEW_DIR, name + "_spectrogram.png"), name + " (decoded mp3)")
    for name in STINGERS:
        spectrogram_log_png(decode_audio(os.path.join(OUT_DIR, name + ".mp3")),
                            os.path.join(REVIEW_DIR, name + "_spectrogram.png"), name + " (decoded mp3)", width=800)
    write_tables(meas)
    return meas


def write_tables(meas):
    L = []
    L.append("| file | dur (s) | BPM | LUFS-I | true peak (dBTP) | loop seam jump ratio | seam HF pct | size (kB) |")
    L.append("|---|---|---|---|---|---|---|---|")
    for n, m in meas["music"].items():
        L.append("| %s.mp3 | %.2f | %d | %.1f | %.1f | %.3f | %.0f | %.0f |" % (
            n, m["duration_s"], m["bpm"], m["lufs_I"], m["true_peak_dBTP"], m["seam_jump_ratio"],
            m["seam_hf_percentile"], m["size_kB"]))
    for n, m in meas["stingers"].items():
        L.append("| %s.mp3 | %.2f | - | %.1f | %.1f | (no loop) | - | %.0f |" % (
            n, m["duration_s"], m["lufs_I"], m["true_peak_dBTP"], m["size_kB"]))
    L.append("")
    L.append("| sfx | dur (s) | sample peak (dBFS) | true peak (dBTP) | max 100 ms loudness (LUFS) | "
             "ungated LUFS | lead silence (ms) | size (kB) |")
    L.append("|---|---|---|---|---|---|---|---|")
    for n, m in meas["sfx"].items():
        L.append("| %s | %.3f | %.1f | %.1f | %.1f | %.1f | %.2f | %.1f |" % (
            n, m["duration_s"], m["sample_peak_dBFS"], m["true_peak_dBTP"], m["m100_LUFS"], m["lufs_ungated"],
            m["lead_silence_ms"], m["size_kB"]))
    L.append("")
    L.append("Total size of audio/out: %.2f MB (%d bytes)" % (meas["total_size_bytes"] / 1e6, meas["total_size_bytes"]))
    with open(os.path.join(REVIEW_DIR, "measurements.md"), "w") as f:
        f.write("\n".join(L) + "\n")


def main(argv):
    t0 = time.time()
    flags = set(a for a in argv if a.startswith("--"))
    every = not (flags - {"--keep-wav"})
    if every or "--music" in flags:
        print("music ...", flush=True)
        for n, i in build_music().items():
            print("  %-12s %.2f s  (%.0f s to build)" % (n, i["duration"], i["secs"]), flush=True)
    if every or "--stingers" in flags:
        print("stingers ...", flush=True)
        build_stingers()
    if every or "--sfx" in flags:
        print("sfx ...", flush=True)
        build_sfx()
    if every or "--analyze" in flags:
        print("analysis ...", flush=True)
        meas = analyze()
        print(open(os.path.join(REVIEW_DIR, "measurements.md")).read())
    if "--keep-wav" not in flags:
        shutil.rmtree(BUILD_DIR, ignore_errors=True)
    print("done in %.0f s" % (time.time() - t0))


if __name__ == "__main__":
    main(sys.argv[1:])
