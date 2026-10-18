"""Draft generator for stages 2-30 (stage 1 is handcrafted in stage01.py).

Writes data/levels/stage-XX.json. The output is meant as a starting point:
levels are then checked by tools/validate.ts (structure + bot playthroughs)
and can be hand-edited in the level editor (out/editor.html).

Design rules encoded here:
- one new goo type per few stages, introduced in a gentle room first
- "breather" stages (6, 14, 24) are swarms of easy goo with many animals
- "think" stages use cover / lanes so positioning matters
- budget grows slowly; monster HP/damage scaling lives in balance.ts
"""
import json, math, random, sys

W, H, T = 576, 960, 48
COLS, ROWS = W // T, H // T
WALL = 48

COST = {'blob': 1.0, 'mini': 0.5, 'spitter': 1.6, 'splitter': 1.7, 'dasher': 1.8, 'chunky': 3.6, 'nest': 3.4, 'jumper': 2.1, 'flyer': 1.7, 'boss': 0}
R = {'blob': 26, 'mini': 17, 'spitter': 26, 'splitter': 31, 'dasher': 26, 'chunky': 44, 'nest': 40, 'jumper': 28, 'flyer': 22, 'boss': 78}
OBR = {'tree': 30, 'pine': 26, 'bush': 24, 'rock': 26, 'boulder': 40, 'stump': 20, 'log': 60, 'fence': 74, 'fencev': 74, 'house': 80, 'barrel': 20, 'crate': 26, 'hay': 30, 'well': 32, 'cart': 55, 'reeds': 22, 'lilyrock': 30, 'driftwood': 58}

INTRO = {3: 'splitter', 5: 'dasher', 7: 'chunky', 9: 'nest', 10: 'boss', 11: 'jumper', 13: 'flyer', 20: 'boss', 30: 'boss'}
BREATHER = {6, 14, 24}
THINK = {4, 8, 12, 16, 18, 23, 26, 28}

ANIMALS = {
 2: ['puppy', 'bunny'], 3: ['squirrel', 'puppy'], 4: ['fox', 'bunny'], 5: ['fox', 'squirrel'], 6: ['puppy', 'bunny', 'squirrel', 'fox'],
 7: ['hedgehog', 'puppy'], 8: ['hedgehog', 'fox'], 9: ['fawn', 'squirrel'], 10: ['fawn', 'hedgehog'],
 11: ['kitten', 'puppy'], 12: ['duckling', 'kitten'], 13: ['piglet', 'duckling'], 14: ['kitten', 'duckling', 'piglet'], 15: ['lamb', 'piglet'],
 16: ['lamb', 'kitten'], 17: ['chick', 'duckling'], 18: ['chick', 'lamb'], 19: ['piglet', 'chick', 'kitten'], 20: ['lamb', 'chick'],
 21: ['otter', 'duckling'], 22: ['turtle', 'otter'], 23: ['otter', 'turtle'], 24: ['frog', 'turtle', 'otter'], 25: ['frog', 'otter'],
 26: ['turtle', 'frog'], 27: ['otter', 'frog', 'turtle'], 28: ['frog', 'turtle'], 29: ['otter', 'turtle', 'frog'], 30: ['frog', 'otter'],
}

def region(stage):
    return 'forest' if stage <= 10 else 'village' if stage <= 20 else 'lake'

def pool(stage):
    p = ['blob', 'spitter']
    for s, k in sorted(INTRO.items()):
        if s <= stage and k != 'boss': p.append(k)
    return p

def rooms_for(stage):
    if stage <= 3: return 3
    if stage in BREATHER: return 3
    if stage <= 10: return 4
    if stage <= 20: return 4 if stage < 19 else 5
    return 5 if stage != 24 else 4

def budget(stage, ri, nrooms):
    base = 4.4 + 0.5 * stage
    ramp = 0.8 + 0.4 * (ri / max(1, nrooms - 1))
    if stage in BREATHER: base *= 1.35
    return base * ramp

class Room:
    def __init__(self, rng, reg):
        self.rng = rng; self.reg = reg
        self.obs = []; self.mon = []; self.ani = []; self.goo = []; self.terrain = [['.'] * COLS for _ in range(ROWS)]

    def blocked(self, x, y, r, extra=12):
        if x < WALL + r or x > W - WALL - r or y < WALL + r + 40 or y > H - WALL - r: return True
        for o in self.obs:
            if math.hypot(o['x'] - x, o['y'] - y) < OBR[o['t']] * (1.0 if o['t'] not in ('log', 'fence', 'fencev', 'house', 'cart', 'driftwood') else 0.9) + r + extra: return True
        c, rr = int(x // T), int(y // T)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                cc, r2 = c + dx, rr + dy
                if 0 <= cc < COLS and 0 <= r2 < ROWS and self.terrain[r2][cc] == 'w' and abs(cc * T + T / 2 - x) < T / 2 + r and abs(r2 * T + T / 2 - y) < T / 2 + r: return True
        return False

    def free_spot(self, r, y0, y1, x0=WALL + 30, x1=W - WALL - 30, avoid=(), mind=60):
        for _ in range(400):
            x, y = self.rng.uniform(x0, x1), self.rng.uniform(y0, y1)
            if self.blocked(x, y, r): continue
            if any(math.hypot(a[0] - x, a[1] - y) < mind for a in avoid): continue
            return x, y
        return None

    def path(self, ch, seq):
        for r in range(ROWS):
            c = seq[r]
            for k in (c, c + 1):
                if 0 <= k < COLS and self.terrain[r][k] == '.': self.terrain[r][k] = ch

def winding(rng):
    seq = []; c = 5
    for r in range(ROWS):
        if r % 3 == 0 and 2 < r < ROWS - 3: c = max(3, min(7, c + rng.choice([-1, 0, 1])))
        seq.append(c)
    seq[0] = seq[1] = 5; seq[-1] = seq[-2] = 5
    return seq

OB_SETS = {
 'forest': {'tall': ['tree', 'pine', 'tree'], 'cover': ['rock', 'stump', 'boulder', 'log'], 'low': ['bush', 'bush', 'fence']},
 'village': {'tall': ['tree', 'house', 'well'], 'cover': ['barrel', 'crate', 'hay', 'cart'], 'low': ['fence', 'bush', 'fencev']},
 'lake': {'tall': ['tree', 'lilyrock', 'pine'], 'cover': ['lilyrock', 'driftwood', 'rock'], 'low': ['reeds', 'reeds', 'bush']},
}

def layout(room, stage, kind):
    rng = room.rng; reg = room.reg; S = OB_SETS[reg]
    ch = {'forest': '#', 'village': 'c', 'lake': 's'}[reg]
    room.path(ch, winding(rng))
    if reg == 'lake' and kind != 'boss':
        # a pond on one side (water blocks walking, not shots)
        side = rng.choice([0, 1]); r0 = rng.randint(6, 11)
        for r in range(r0, r0 + rng.randint(3, 5)):
            for c in (range(1, 4) if side == 0 else range(8, 11)):
                if room.terrain[r][c] == '.': room.terrain[r][c] = 'w'
    def put(t, x, y):
        if not room.blocked(x, y, OBR[t] * 0.6, 4): room.obs.append({'t': t, 'x': round(x), 'y': round(y)})
    if kind == 'boss':
        for (x, y) in ((140, 300), (436, 300), (140, 640), (436, 640)): put(rng.choice(S['cover']), x, y)
        return
    if kind == 'think':
        pattern = rng.choice(['lanes', 'cover', 'zigzag'])
        if pattern == 'lanes':
            for y in (300, 560):
                put('fence' if reg != 'lake' else 'driftwood', 150 if rng.random() < 0.5 else 426, y)
        elif pattern == 'zigzag':
            put(S['cover'][3 % len(S['cover'])] if reg != 'village' else 'cart', 170, 360); put(S['cover'][3 % len(S['cover'])] if reg != 'village' else 'cart', 406, 600)
        for _ in range(4):
            s = room.free_spot(30, 220, 760, mind=0)
            if s: put(rng.choice(S['cover']), *s)
    # scenery along the sides
    for _ in range(rng.randint(3, 5)):
        x = rng.choice([rng.uniform(80, 150), rng.uniform(426, 496)])
        y = rng.uniform(140, 820)
        put(rng.choice(S['tall'] if reg != 'village' or rng.random() < 0.7 else ['tree']), x, y)
    for _ in range(rng.randint(1, 3)):
        s = room.free_spot(24, 200, 780, mind=0)
        if s: put(rng.choice(S['low'] + S['cover'][:2]), *s)

def monsters(room, stage, ri, nrooms, intro):
    rng = room.rng
    if stage in BREATHER:
        kinds = ['blob'] * 6 + ['mini'] * 2 + (['splitter'] if stage > 3 else [])
    else:
        kinds = pool(stage)
    b = budget(stage, ri, nrooms)
    picks = []
    # the newest goo appears alone-ish in the first room so it can be learned
    if intro and intro != 'boss':
        if ri == 0: picks = [intro] + ['blob'] * 2; b = 0
        else: picks.append(intro); b -= COST[intro]
    weights = {k: (3 if k == 'blob' else 2 if k in ('spitter',) else 1.4) for k in kinds}
    if stage >= 12: weights['blob'] = 1.6
    while b > 0.8:
        k = rng.choices(list(weights), weights=list(weights.values()))[0]
        if COST[k] > b + 0.5: continue
        picks.append(k); b -= COST[k]
        if len(picks) > 14: break
    # waves
    total = len(picks)
    nwaves = 1 if total <= 4 else 2 if total <= 8 else 3
    rng.shuffle(picks)
    placed = []
    for i, k in enumerate(picks):
        w = min(nwaves - 1, int(i * nwaves / max(1, total)))
        y0, y1 = (120, 560) if k in ('spitter', 'nest', 'chunky') else (120, 620 if w == 0 else 720)
        s = room.free_spot(R[k], y0, y1, avoid=placed + [(288, 860)], mind=R[k] * 2 + 20)
        if not s: continue
        placed.append(s)
        m = {'t': k, 'x': round(s[0]), 'y': round(s[1])}
        if w: m['w'] = w
        if k == 'spitter' and stage >= 15 and rng.random() < 0.5: m['v'] = 1
        if k == 'chunky' and stage >= 17 and rng.random() < 0.6: m['v'] = 1
        room.mon.append(m)
    return placed

def goo(room, placed):
    rng = room.rng
    for (x, y) in placed[:6]:
        room.goo.append({'x': round(x + rng.uniform(-30, 30)), 'y': round(y + rng.uniform(-20, 30)), 'r': round(rng.uniform(55, 90))})
    for _ in range(rng.randint(2, 4)):
        s = room.free_spot(10, 160, 820, mind=0)
        if s: room.goo.append({'x': round(s[0]), 'y': round(s[1]), 'r': round(rng.uniform(45, 75))})

RECT = {'log': (112, 34), 'fence': (144, 18), 'fencev': (18, 144), 'house': (150, 96), 'crate': (46, 40), 'cart': (104, 52), 'driftwood': (110, 30)}
CIRC = {'tree': 30, 'pine': 26, 'bush': 24, 'rock': 26, 'boulder': 40, 'stump': 20, 'barrel': 20, 'hay': 30, 'well': 32, 'reeds': 22, 'lilyrock': 30}

def solid(room, x, y, r):
    if x < WALL + r or x > W - WALL - r or y < WALL + r or y > H - WALL - r: return True
    for o in room['obstacles']:
        if o['t'] in RECT:
            w, h = RECT[o['t']]; cx = min(max(x, o['x'] - w / 2), o['x'] + w / 2); cy = min(max(y, o['y'] - h / 2), o['y'] + h / 2)
            if math.hypot(x - cx, y - cy) < r: return True
        elif math.hypot(x - o['x'], y - o['y']) < CIRC[o['t']] + r: return True
    for rr in range(int((y - r) // T), int((y + r) // T) + 1):
        for cc in range(int((x - r) // T), int((x + r) // T) + 1):
            if 0 <= rr < ROWS and 0 <= cc < COLS and room['terrain'][rr][cc] == 'w':
                cx = min(max(x, cc * T), cc * T + T); cy = min(max(y, rr * T), rr * T + T)
                if math.hypot(x - cx, y - cy) < r: return True
    return False

def room_ok(room):
    # walkable BFS on a 24-unit grid from the start, then everything must be near a walkable cell
    N = 24; cols, rows = W // N, H // N
    seen = set(); st = room['start']; q = [(int(st['x'] // N), int(st['y'] // N))]
    while q:
        c, r = q.pop()
        if (c, r) in seen or not (0 <= c < cols and 0 <= r < rows): continue
        if solid(room, c * N + N / 2, r * N + N / 2, 20): continue
        seen.add((c, r)); q += [(c + 1, r), (c - 1, r), (c, r + 1), (c, r - 1)]
    cells = [(c * N + N / 2, r * N + N / 2) for (c, r) in seen]
    if not any(abs(x - W / 2) < 50 and y < WALL + 50 for (x, y) in cells): return False
    for e in room['monsters'] + room['animals']:
        if not any(math.hypot(e['x'] - x, e['y'] - y) < 180 for (x, y) in cells): return False
    return True

def build_stage(stage):
    rng = random.Random(stage * 7919)
    reg = region(stage); n = rooms_for(stage)
    intro = INTRO.get(stage)
    boss = stage % 10 == 0
    species = ANIMALS[stage]
    # spread animals across rooms (last room of a boss stage has none)
    animal_rooms = {}
    slots = list(range(n - 1 if boss else n))
    for i, sp in enumerate(species):
        ri = slots[(i * len(slots)) // len(species)] if len(species) <= len(slots) else slots[i % len(slots)]
        animal_rooms.setdefault(ri, []).append(sp)
    rooms = []
    for ri in range(n):
        room = Room(rng, reg)
        is_boss_room = boss and ri == n - 1
        kind = 'boss' if is_boss_room else 'think' if stage in THINK and ri % 2 == 1 else 'open'
        layout(room, stage, kind)
        if is_boss_room:
            room.mon.append({'t': 'boss', 'x': 288, 'y': 330})
            adds = ['blob', 'blob'] if stage == 10 else ['spitter', 'blob'] if stage == 20 else ['jumper', 'spitter']
            for k, (x, y) in zip(adds, ((150, 460), (426, 460))): room.mon.append({'t': k, 'x': x, 'y': y})
            placed = [(288, 330), (150, 460), (426, 460)]
        else:
            placed = monsters(room, stage, ri, n, intro if ri <= 1 else None)
        for sp in animal_rooms.get(ri, []):
            # animals sit a little behind the goo so reaching them is a choice
            s = room.free_spot(34, 170, 520, avoid=placed, mind=70)
            if not s: s = room.free_spot(34, 150, 700, avoid=placed, mind=50)
            if s: room.ani.append({'s': sp, 'x': round(s[0]), 'y': round(s[1])})
        goo(room, placed)
        out = {'terrain': [''.join(r) for r in room.terrain], 'obstacles': room.obs, 'goo': room.goo, 'monsters': room.mon, 'animals': room.ani, 'start': {'x': 288, 'y': 860}}
        # drop obstacles one by one until the room is fully reachable
        tries = 0
        while not room_ok(out) and out['obstacles'] and tries < 30:
            out['obstacles'].pop(rng.randrange(len(out['obstacles']))); tries += 1
        if not room_ok(out):
            # open the water too, as a last resort
            out['terrain'] = [r.replace('w', '.') for r in out['terrain']]
        rooms.append(out)
    lv = {'id': f'{reg}-{((stage - 1) % 10) + 1:02d}', 'stage': stage, 'region': reg, 'rooms': rooms}
    if intro: lv['intro'] = intro
    if boss: lv['boss'] = True
    if stage in BREATHER: lv['tier'] = stage - 2
    return lv

if __name__ == '__main__':
    only = [int(a) for a in sys.argv[1:]] or list(range(2, 31))
    for s in only:
        lv = build_stage(s)
        json.dump(lv, open(f'data/levels/stage-{s:02d}.json', 'w'), indent=1)
    print('generated', only)
