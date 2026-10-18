"""Static harmony check: flag sustained / strong-beat melody notes that clash
with the chord underneath (helps catch sour notes without listening)."""
import sys
import importlib

from arrange import chord_at
from music_lib import chord, chord_pcs

NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]


def allowed_tensions(sym):
    r, iv, b = chord(sym)
    pcs = set((r + i) % 12 for i in iv)
    minor = 3 in iv
    tens = {(r + 2) % 12}  # 9th always ok
    if not minor:
        tens.add((r + 9) % 12)  # 13th/6th on major
    else:
        tens.add((r + 5) % 12)  # 11th on minor
        tens.add((r + 10) % 12)  # 7th on minor triad
    return pcs, tens


def check(song, chords, track_names, min_dur=0.74):
    issues = []
    for tr in song.tracks:
        if tr.name not in track_names:
            continue
        for n in tr.notes:
            on_beat = abs(n.t - round(n.t)) < 1e-6
            strong = on_beat and (round(n.t) % 2 == 0)
            if n.d < min_dur and not strong:
                continue
            if n.d < 0.3:
                continue
            sym = chord_at(chords, n.t)
            pcs, tens = allowed_tensions(sym)
            pc = n.p % 12
            if pc in pcs:
                continue
            level = "tension" if pc in tens else "CLASH"
            if level == "CLASH" or n.d >= 1.5:
                bar = int(n.t // song.bar_beats) + 1
                beat = n.t % song.bar_beats + 1
                issues.append("%-9s bar %2d beat %.2f  %-3s over %-7s dur %.2f %s" % (
                    tr.name, bar, beat, NAMES[pc], sym, n.d, level))
    return issues


if __name__ == "__main__":
    mod = importlib.import_module(sys.argv[1])
    song, _, _ = mod.build()
    chords = mod.all_chords() if hasattr(mod, "all_chords") else None
    names = sys.argv[2].split(",")
    for line in check(song, chords, names):
        print(line)
