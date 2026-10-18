// Level validation shared by the CLI tool and the level editor.
// Structural checks: shapes, bounds, overlaps, reachability (walk + line of
// sight within range). Optional bot playthroughs prove each stage can be cleared.
import { MONSTERS, PLAYER, ROOM, SPECIES, type MonsterKind } from '../config/balance';
import { OBSTACLES } from '../data/obstacles';
import { FlowField, NAV_CELL, NAV_COLS, NAV_ROWS } from './nav';
import { StaticWorld } from './world';
import type { LevelDef, LevelRoom } from './types';

export interface Issue { level: 'error' | 'warn'; room: number; msg: string }

const COLS = ROOM.width / ROOM.tile, ROWS = ROOM.height / ROOM.tile;
const TERRAIN = new Set(['.', '#', 'w', 's', 'c']);
const SPECIES_IDS = new Set(SPECIES.map((s) => s.id));

export function reachableCells(room: LevelRoom, world: StaticWorld): FlowField {
  const st = room.start ?? { x: ROOM.width / 2, y: ROOM.height - ROOM.wall - 70 };
  const f = new FlowField(world, PLAYER.radius);
  f.build(st.x, st.y);
  return f;
}

// can the player stand somewhere reachable and hit (x, y) within `range`?
export function shootable(world: StaticWorld, f: FlowField, x: number, y: number, range: number): boolean {
  for (let r = 0; r < NAV_ROWS; r++) for (let c = 0; c < NAV_COLS; c++) {
    if (f.dist[r * NAV_COLS + c] < 0) continue;
    const px = c * NAV_CELL + NAV_CELL / 2, py = r * NAV_CELL + NAV_CELL / 2;
    const d = Math.hypot(px - x, py - 14 - y);
    if (d > range) continue;
    if (world.lineOfSight(px, py - 14, x, y)) return true;
  }
  return false;
}

export function validateRoom(room: LevelRoom, ri: number, opts: { range: number; boss: boolean }): Issue[] {
  const out: Issue[] = [];
  const err = (msg: string) => out.push({ level: 'error', room: ri, msg });
  const warn = (msg: string) => out.push({ level: 'warn', room: ri, msg });
  if (room.terrain) {
    if (room.terrain.length !== ROWS) err(`terrain has ${room.terrain.length} rows (need ${ROWS})`);
    room.terrain.forEach((row, i) => { if (row.length !== COLS) err(`terrain row ${i} has ${row.length} cols (need ${COLS})`); for (const ch of row) if (!TERRAIN.has(ch)) err(`terrain row ${i} has unknown '${ch}'`); });
  }
  for (const o of room.obstacles) {
    if (!OBSTACLES[o.t]) err(`unknown obstacle '${o.t}'`);
    if (o.x < 0 || o.x > ROOM.width || o.y < 0 || o.y > ROOM.height) err(`obstacle ${o.t} outside room`);
  }
  const world = new StaticWorld(room);
  const st = room.start ?? { x: ROOM.width / 2, y: ROOM.height - ROOM.wall - 70 };
  if (world.overlapsSolid(st.x, st.y, PLAYER.radius)) err('player start overlaps an obstacle or water');
  const f = reachableCells(room, world);
  if (!f.reachable(ROOM.width / 2, ROOM.wall + PLAYER.radius + 6)) err('exit gate cannot be reached from the start');
  if (!room.monsters.length) err('room has no goo monsters');
  let bossCount = 0;
  for (const m of room.monsters) {
    const def = MONSTERS[m.t as MonsterKind];
    if (!def) { err(`unknown monster '${m.t}'`); continue; }
    if (m.t === 'boss') bossCount++;
    if (m.x < ROOM.wall + def.r * 0.5 || m.x > ROOM.width - ROOM.wall - def.r * 0.5 || m.y < ROOM.wall + def.r * 0.5 || m.y > ROOM.height - ROOM.wall - def.r * 0.5) err(`${m.t} at (${m.x},${m.y}) outside the play area`);
    if (m.t !== 'flyer' && world.overlapsSolid(m.x, m.y, def.r * 0.7)) err(`${m.t} at (${m.x},${m.y}) spawns inside an obstacle or water`);
    if (!shootable(world, f, m.x, m.y, opts.range)) err(`${m.t} at (${m.x},${m.y}) can't be reached or sprayed`);
    if (Math.hypot(m.x - st.x, m.y - st.y) < 220 && !(m.w)) warn(`${m.t} spawns close to the player start`);
    if (m.w !== undefined && (m.w < 0 || !Number.isInteger(m.w))) err(`${m.t} has invalid wave ${m.w}`);
  }
  const waves = new Set(room.monsters.map((m) => m.w ?? 0));
  for (let w = 0; w < waves.size; w++) if (!waves.has(w)) err(`wave ${w} is empty but later waves exist`);
  if (opts.boss && bossCount === 0) warn('boss stage last room has no boss');
  for (const a of room.animals) {
    if (!SPECIES_IDS.has(a.s)) err(`unknown animal '${a.s}'`);
    if (world.overlapsSolid(a.x, a.y, 24)) err(`${a.s} cocoon at (${a.x},${a.y}) inside an obstacle or water`);
    if (!shootable(world, f, a.x, a.y, opts.range)) err(`${a.s} cocoon at (${a.x},${a.y}) can't be reached`);
  }
  for (const g of room.goo) if (g.r <= 0 || g.r > 260) err(`goo radius ${g.r} out of range`);
  return out;
}

export function validateLevel(lv: LevelDef, range = PLAYER.range * 0.95): Issue[] {
  const out: Issue[] = [];
  if (!lv.id) out.push({ level: 'error', room: -1, msg: 'missing id' });
  if (!lv.rooms?.length) out.push({ level: 'error', room: -1, msg: 'no rooms' });
  const animals = lv.rooms.reduce((n, r) => n + r.animals.length, 0);
  if (!animals) out.push({ level: 'warn', room: -1, msg: 'no animals to rescue in this stage' });
  lv.rooms.forEach((r, i) => out.push(...validateRoom(r, i, { range, boss: !!lv.boss && i === lv.rooms.length - 1 })));
  return out;
}
