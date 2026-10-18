// Pre-renders a room's ground from the tileset (grass + dual-grid terrain
// overlays + small decor) and lists the static sprites (obstacles, border).
import { ROOM } from '../config/balance';
import { OBSTACLES } from '../data/obstacles';
import { drawFrame, frame } from '../engine/atlas';
import { Rng, hashString } from '../sim/rng';
import type { LevelRoom, Region } from '../sim/types';

export interface StaticSprite { name: string; x: number; y: number; flip: boolean; scale: number; sortY: number }

const COLS = ROOM.width / ROOM.tile, ROWS = ROOM.height / ROOM.tile;
const T = ROOM.tile;

export const REGION_LOOK: Record<Region, { base: string; edge: string; borderA: string; borderB: string; borderLow: string; fill: string; path: string }> = {
  forest: { base: '.', edge: '#3f7a2a', borderA: 'border_tree', borderB: 'border_pine', borderLow: 'border_bush', fill: '#3f7a2a', path: '#' },
  village: { base: '.', edge: '#4a7f32', borderA: 'border_tree', borderB: 'border_bush', borderLow: 'border_bush', fill: '#4a7f32', path: 'c' },
  lake: { base: '.', edge: '#3d7d4a', borderA: 'border_tree', borderB: 'ob_reeds', borderLow: 'ob_reeds', fill: '#3d7d4a', path: 's' },
};

function cellAt(room: LevelRoom, c: number, r: number): string {
  c = Math.max(0, Math.min(COLS - 1, c)); r = Math.max(0, Math.min(ROWS - 1, r));
  return room.terrain?.[r]?.[c] ?? '.';
}

export function buildBackground(room: LevelRoom, region: Region, seedKey: string, scale: number): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = Math.round(ROOM.width * scale); cv.height = Math.round(ROOM.height * scale);
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.scale(scale, scale);
  const seed = hashString(seedKey);
  // grass base
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const h = (seed ^ Math.imul(c + 1, 73856093) ^ Math.imul(r + 1, 19349663)) >>> 0;
    const v = h % 10; const f = frame(`g_${v < 4 ? 0 : v < 7 ? 1 : v < 9 ? 2 : 3}`);
    if (f) ctx.drawImage(f.img, f.x, f.y, f.w, f.h, c * T, r * T, T + 0.5, T + 0.5);
  }
  // dual-grid terrain overlays
  const kinds: [string, string][] = [['s', 'sand'], ['#', 'path'], ['c', 'cobble'], ['w', 'water']];
  for (const [ch, name] of kinds) {
    for (let j = 0; j <= ROWS; j++) for (let i = 0; i <= COLS; i++) {
      let m = 0;
      if (cellAt(room, i - 1, j - 1) === ch) m |= 1;
      if (cellAt(room, i, j - 1) === ch) m |= 2;
      if (cellAt(room, i - 1, j) === ch) m |= 4;
      if (cellAt(room, i, j) === ch) m |= 8;
      if (!m) continue;
      const f = frame(`t_${name}_${m}`);
      if (f) ctx.drawImage(f.img, f.x, f.y, f.w, f.h, (i - 0.5) * T, (j - 0.5) * T, T + 0.5, T + 0.5);
    }
  }
  // scattered decor on grass
  const rng = new Rng(seed ^ 0x9e3779b9);
  const decor = region === 'lake' ? ['d_shell', 'd_tuft', 'd_pebble_0', 'd_flower_3', 'd_clover', 'd_tuft']
    : region === 'village' ? ['d_flower_0', 'd_flower_1', 'd_tuft', 'd_pebble_1', 'd_clover', 'd_flower_4', 'd_leaf']
      : ['d_flower_0', 'd_flower_2', 'd_tuft', 'd_mushroom', 'd_pebble_0', 'd_clover', 'd_flower_1', 'd_tuft', 'd_leaf'];
  const n = 46;
  for (let i = 0; i < n; i++) {
    const x = rng.range(ROOM.wall + 10, ROOM.width - ROOM.wall - 10), y = rng.range(ROOM.wall + 10, ROOM.height - ROOM.wall - 10);
    const ch = cellAt(room, Math.floor(x / T), Math.floor(y / T));
    if (ch !== '.') continue;
    const f = frame(rng.pick(decor));
    if (f) drawFrame(ctx, f, x, y, rng.range(0.85, 1.15), rng.chance(0.5));
  }
  for (const d of room.decor ?? []) { const f = frame(d.t); if (f) drawFrame(ctx, f, d.x, d.y); }
  // soft inner shadow along the borders so the room reads as a clearing
  const g1 = ctx.createLinearGradient(0, 0, ROOM.wall * 1.6, 0);
  g1.addColorStop(0, 'rgba(20,50,10,0.45)'); g1.addColorStop(1, 'rgba(20,50,10,0)');
  ctx.fillStyle = g1; ctx.fillRect(0, 0, ROOM.wall * 1.6, ROOM.height);
  const g2 = ctx.createLinearGradient(ROOM.width, 0, ROOM.width - ROOM.wall * 1.6, 0);
  g2.addColorStop(0, 'rgba(20,50,10,0.45)'); g2.addColorStop(1, 'rgba(20,50,10,0)');
  ctx.fillStyle = g2; ctx.fillRect(ROOM.width - ROOM.wall * 1.6, 0, ROOM.wall * 1.6, ROOM.height);
  const g3 = ctx.createLinearGradient(0, 0, 0, ROOM.wall * 1.6);
  g3.addColorStop(0, 'rgba(20,50,10,0.4)'); g3.addColorStop(1, 'rgba(20,50,10,0)');
  ctx.fillStyle = g3; ctx.fillRect(0, 0, ROOM.width, ROOM.wall * 1.6);
  const g4 = ctx.createLinearGradient(0, ROOM.height, 0, ROOM.height - ROOM.wall * 1.6);
  g4.addColorStop(0, 'rgba(20,50,10,0.4)'); g4.addColorStop(1, 'rgba(20,50,10,0)');
  ctx.fillStyle = g4; ctx.fillRect(0, ROOM.height - ROOM.wall * 1.6, ROOM.width, ROOM.wall * 1.6);
  return cv;
}

export function buildStatics(room: LevelRoom, region: Region, seedKey: string): StaticSprite[] {
  const out: StaticSprite[] = [];
  const rng = new Rng(hashString(seedKey) ^ 0x51ed27);
  const look = REGION_LOOK[region];
  for (const o of room.obstacles) {
    const def = OBSTACLES[o.t]; if (!def) continue;
    let name = def.sprite;
    if (o.t === 'tree' && (Math.round(o.x + o.y) % 2)) name = 'ob_tree2';
    if (o.t === 'house' && (Math.round(o.x) % 2)) name = 'ob_house2';
    out.push({ name, x: o.x, y: o.y + def.foot, flip: o.t !== 'house' && o.t !== 'gate' && rng.chance(0.5), scale: 1, sortY: o.y + def.foot * 0.5 });
  }
  // border: tall trees on the sides and top, low plants at the bottom
  const side = (x: number) => {
    for (let y = 30; y < ROOM.height + 40; y += rng.range(58, 74)) {
      const nm = rng.chance(0.55) ? look.borderA : look.borderB;
      out.push({ name: nm, x: x + rng.range(-10, 10), y, flip: rng.chance(0.5), scale: rng.range(0.85, 1.05), sortY: y });
    }
  };
  side(16); side(ROOM.width - 16);
  for (let x = 70; x < ROOM.width - 50; x += rng.range(58, 70)) {
    if (Math.abs(x - ROOM.width / 2) < 140) continue;
    out.push({ name: rng.chance(0.6) ? look.borderA : look.borderB, x, y: 34 + rng.range(-6, 6), flip: rng.chance(0.5), scale: rng.range(0.85, 1.05), sortY: 34 });
  }
  for (let x = 60; x < ROOM.width - 40; x += rng.range(50, 64)) {
    if (Math.abs(x - ROOM.width / 2) < 70) continue;
    out.push({ name: look.borderLow, x, y: ROOM.height - 8, flip: rng.chance(0.5), scale: rng.range(0.9, 1.1), sortY: ROOM.height + 100 });
  }
  return out;
}
