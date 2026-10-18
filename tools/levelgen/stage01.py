# Handcrafted first stage (FTUE). Writes data/levels/stage-01.json
import json, sys
COLS, ROWS = 12, 20
def path_terrain(cols_by_row, extra=None):
    rows = []
    for r in range(ROWS):
        line = ['.'] * COLS
        c = cols_by_row[r]
        for k in (c, c + 1):
            if 0 <= k < COLS: line[k] = '#'
        if extra:
            for (rr, cc, ch) in extra:
                if rr == r: line[cc] = ch
        rows.append(''.join(line))
    return rows
r1 = path_terrain([5,5,5,5,5,5,4,4,4,5,5,5,6,6,6,5,5,5,5,5])
r2 = path_terrain([5,5,6,6,6,7,7,6,6,5,5,4,4,4,5,5,5,5,5,5])
r3 = path_terrain([5,5,5,5,4,4,4,5,5,6,6,6,5,5,5,5,5,5,5,5])
stage = {
 "id": "forest-01", "stage": 1, "region": "forest", "intro": "blob",
 "rooms": [
  {"terrain": r1,
   "obstacles": [{"t":"tree","x":100,"y":210},{"t":"tree","x":482,"y":380},{"t":"pine","x":86,"y":610},{"t":"bush","x":478,"y":690},{"t":"rock","x":168,"y":430},{"t":"stump","x":440,"y":170}],
   "goo": [{"x":190,"y":560,"r":80},{"x":390,"y":520,"r":72},{"x":288,"y":330,"r":84},{"x":140,"y":300,"r":56},{"x":430,"y":740,"r":52},{"x":290,"y":640,"r":50}],
   "monsters": [{"t":"blob","x":205,"y":545},{"t":"blob","x":375,"y":560},{"t":"spitter","x":288,"y":300}],
   "animals": [{"s":"puppy","x":288,"y":445}],
   "start": {"x":288,"y":850}},
  {"terrain": r2,
   "obstacles": [{"t":"tree","x":110,"y":360},{"t":"tree","x":470,"y":230},{"t":"log","x":380,"y":520},{"t":"bush","x":130,"y":660},{"t":"rock","x":450,"y":720},{"t":"pine","x":90,"y":160}],
   "goo": [{"x":180,"y":250,"r":90},{"x":400,"y":350,"r":82},{"x":250,"y":520,"r":76},{"x":450,"y":620,"r":56},{"x":300,"y":190,"r":64},{"x":180,"y":760,"r":48}],
   "monsters": [{"t":"blob","x":210,"y":430},{"t":"blob","x":340,"y":400},{"t":"blob","x":420,"y":300},{"t":"spitter","x":190,"y":240},{"t":"blob","x":290,"y":280,"w":1},{"t":"blob","x":170,"y":500,"w":1}],
   "animals": [{"s":"bunny","x":150,"y":175}],
   "start": {"x":288,"y":860}},
  {"terrain": r3,
   "obstacles": [{"t":"tree","x":96,"y":470},{"t":"tree","x":480,"y":470},{"t":"rock","x":200,"y":280},{"t":"rock","x":376,"y":280},{"t":"bush","x":288,"y":670},{"t":"pine","x":480,"y":150},{"t":"pine","x":92,"y":160}],
   "goo": [{"x":288,"y":340,"r":110},{"x":130,"y":620,"r":72},{"x":450,"y":630,"r":72},{"x":288,"y":170,"r":72}],
   "monsters": [{"t":"blob","x":240,"y":390},{"t":"blob","x":336,"y":390},{"t":"spitter","x":288,"y":210},{"t":"blob","x":140,"y":580,"w":1},{"t":"blob","x":440,"y":580,"w":1},{"t":"spitter","x":288,"y":380,"w":1}],
   "animals": [{"s":"squirrel","x":288,"y":290}],
   "start": {"x":288,"y":860}}
 ]}
json.dump(stage, open('data/levels/stage-01.json', 'w'), indent=1)
print('stage 1 written')
