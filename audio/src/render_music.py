"""Render one music piece: stems -> mix -> wav (build/) -> mp3 (out/)."""
import importlib
import json
import os
import sys
import time

import numpy as np

from common import BUILD_DIR, OUT_DIR, SR, db2lin, encode_mp3, ffmpeg_ebur128, lufs_integrated, true_peak_db, write_wav
from music_lib import Mix

SONGS = {
    "bgm_home": "song_home",
    "bgm_forest": "song_forest",
    "bgm_village": "song_village",
    "bgm_lake": "song_lake",
    "bgm_boss": "song_boss",
    "bgm_shelter": "song_shelter",
}


def encode_to_target(y, mp3, target_lufs, tp_max=-1.5, tries=3):
    """Encode, measure the *decoded* MP3 with ffmpeg ebur128, nudge gain, repeat."""
    for i in range(tries):
        encode_mp3(y, mp3)
        m = ffmpeg_ebur128(mp3)
        err = target_lufs - m["I"]
        tp_room = tp_max - 0.2 - m["TP"]
        g = min(err, tp_room)
        if abs(g) < 0.15 or i == tries - 1:
            break
        y = y * db2lin(g)
    return y


def render(name, target_lufs=-18.0):
    t0 = time.time()
    mod = importlib.import_module(SONGS[name])
    song, settings, mixp = mod.build()
    stems = song.render_stems()
    mix = Mix(song, stems, settings, master_lufs=target_lufs, **mixp)
    y = mix.run()
    # true-peak safety (MP3 adds a little overshoot): keep <= -2.0 dBTP pre-encode
    tp = true_peak_db(y)
    if tp > -2.2:
        from music_lib import limiter, periodic
        y = periodic(lambda z: limiter(z, ceiling_db=-2.6, release_ms=60.0), y, 1.0, song.loop)
        y *= db2lin(target_lufs - lufs_integrated(y))
    mp3 = os.path.join(OUT_DIR, name + ".mp3")
    y = encode_to_target(y, mp3, target_lufs)
    wav = os.path.join(BUILD_DIR, name + ".wav")
    write_wav(wav, y)
    info = {
        "name": name, "bpm": song.bpm, "bars": song.bars, "samples": int(y.shape[0]),
        "duration": y.shape[0] / SR, "lufs_wav": round(lufs_integrated(y), 2),
        "tp_wav": round(true_peak_db(y), 2), "stems": mix.report, "secs": round(time.time() - t0, 1),
    }
    with open(os.path.join(BUILD_DIR, name + ".json"), "w") as f:
        json.dump(info, f, indent=1)
    return info


if __name__ == "__main__":
    for n in sys.argv[1:]:
        print(json.dumps(render(n), indent=1))
