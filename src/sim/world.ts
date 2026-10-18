// Static room geometry: walls, obstacles, water. Collision push-out, line of
// sight and ray casts used by both the simulation and the level validator.
import { ROOM } from '../config/balance';
import { OBSTACLES } from '../data/obstacles';
import type { LevelRoom } from './types';

export interface Collider {
  kind: 'circle' | 'rect';
  x: number; y: number; r: number; w: number; h: number;
  blocksShots: boolean;
  type: string;
}

export const COLS = ROOM.width / ROOM.tile; // 15
export const ROWS = ROOM.height / ROOM.tile; // 24

export class StaticWorld {
  colliders: Collider[] = [];
  water: Uint8Array = new Uint8Array(COLS * ROWS);
  minX = ROOM.wall; maxX = ROOM.width - ROOM.wall;
  minY = ROOM.wall; maxY = ROOM.height - ROOM.wall;

  constructor(room: LevelRoom) {
    for (const o of room.obstacles) {
      const def = OBSTACLES[o.t];
      if (!def) continue;
      this.colliders.push({
        kind: def.shape, x: o.x, y: o.y, r: def.r ?? 0, w: def.w ?? 0, h: def.h ?? 0,
        blocksShots: def.blocksShots, type: o.t,
      });
    }
    if (room.terrain) {
      for (let row = 0; row < ROWS; row++) {
        const line = room.terrain[row] || '';
        for (let col = 0; col < COLS; col++) if (line[col] === 'w') this.water[row * COLS + col] = 1;
      }
    }
  }

  isWaterAt(x: number, y: number): boolean {
    const c = Math.floor(x / ROOM.tile), r = Math.floor(y / ROOM.tile);
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return false;
    return this.water[r * COLS + c] === 1;
  }

  // Push a circle out of walls, obstacles and (optionally) water. Returns true if it collided.
  resolve(p: { x: number; y: number }, r: number, solidWater: boolean, ignoreObstacles = false): boolean {
    let hit = false;
    if (p.x < this.minX + r) { p.x = this.minX + r; hit = true; }
    if (p.x > this.maxX - r) { p.x = this.maxX - r; hit = true; }
    if (p.y < this.minY + r) { p.y = this.minY + r; hit = true; }
    if (p.y > this.maxY - r) { p.y = this.maxY - r; hit = true; }
    if (!ignoreObstacles) {
      for (const c of this.colliders) {
        if (c.kind === 'circle') {
          const dx = p.x - c.x, dy = p.y - c.y; const rr = r + c.r;
          const d2 = dx * dx + dy * dy;
          if (d2 < rr * rr) {
            const d = Math.sqrt(d2) || 0.001;
            p.x = c.x + (dx / d) * rr; p.y = c.y + (dy / d) * rr; hit = true;
          }
        } else if (pushOutRect(p, r, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h)) hit = true;
      }
    }
    if (solidWater) {
      const t = ROOM.tile;
      const c0 = Math.floor((p.x - r) / t), c1 = Math.floor((p.x + r) / t);
      const r0 = Math.floor((p.y - r) / t), r1 = Math.floor((p.y + r) / t);
      for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
        if (col < 0 || row < 0 || col >= COLS || row >= ROWS) continue;
        if (this.water[row * COLS + col]) {
          if (pushOutRect(p, r, col * t, row * t, t, t)) hit = true;
        }
      }
    }
    return hit;
  }

  overlapsSolid(x: number, y: number, r: number, solidWater = true): boolean {
    if (x < this.minX + r || x > this.maxX - r || y < this.minY + r || y > this.maxY - r) return true;
    for (const c of this.colliders) {
      if (c.kind === 'circle') {
        const dx = x - c.x, dy = y - c.y, rr = r + c.r;
        if (dx * dx + dy * dy < rr * rr) return true;
      } else {
        const cx = clamp(x, c.x - c.w / 2, c.x + c.w / 2), cy = clamp(y, c.y - c.h / 2, c.y + c.h / 2);
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy < r * r) return true;
      }
    }
    if (solidWater) {
      const t = ROOM.tile;
      for (let row = Math.floor((y - r) / t); row <= Math.floor((y + r) / t); row++)
        for (let col = Math.floor((x - r) / t); col <= Math.floor((x + r) / t); col++) {
          if (col < 0 || row < 0 || col >= COLS || row >= ROWS) continue;
          if (this.water[row * COLS + col]) {
            const cx = clamp(x, col * t, col * t + t), cy = clamp(y, row * t, row * t + t);
            const dx = x - cx, dy = y - cy;
            if (dx * dx + dy * dy < r * r) return true;
          }
        }
    }
    return false;
  }

  // Distance along a ray until it hits a shot-blocking obstacle or wall. Returns maxDist if clear.
  rayBlock(x: number, y: number, dx: number, dy: number, maxDist: number): number {
    let best = maxDist;
    // walls
    if (dx > 0) best = Math.min(best, (this.maxX - x) / dx);
    if (dx < 0) best = Math.min(best, (this.minX - x) / dx);
    if (dy > 0) best = Math.min(best, (this.maxY - y) / dy);
    if (dy < 0) best = Math.min(best, (this.minY - y) / dy);
    for (const c of this.colliders) {
      if (!c.blocksShots) continue;
      const d = c.kind === 'circle'
        ? rayCircle(x, y, dx, dy, c.x, c.y, c.r * 0.85)
        : rayRect(x, y, dx, dy, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
      if (d >= 0 && d < best) best = d;
    }
    return Math.max(0, best);
  }

  lineOfSight(x0: number, y0: number, x1: number, y1: number): boolean {
    const dx = x1 - x0, dy = y1 - y0; const len = Math.hypot(dx, dy);
    if (len < 1) return true;
    return this.rayBlock(x0, y0, dx / len, dy / len, len) >= len - 1;
  }
}

export function clamp(v: number, a: number, b: number): number { return v < a ? a : v > b ? b : v; }

function pushOutRect(p: { x: number; y: number }, r: number, rx: number, ry: number, rw: number, rh: number): boolean {
  const cx = clamp(p.x, rx, rx + rw), cy = clamp(p.y, ry, ry + rh);
  const dx = p.x - cx, dy = p.y - cy; const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return false;
  if (d2 > 0.0001) {
    const d = Math.sqrt(d2); p.x = cx + (dx / d) * r; p.y = cy + (dy / d) * r;
  } else {
    // center inside: push out along the shallowest axis
    const left = p.x - rx, right = rx + rw - p.x, top = p.y - ry, bottom = ry + rh - p.y;
    const m = Math.min(left, right, top, bottom);
    if (m === left) p.x = rx - r; else if (m === right) p.x = rx + rw + r;
    else if (m === top) p.y = ry - r; else p.y = ry + rh + r;
  }
  return true;
}

export function rayCircle(ox: number, oy: number, dx: number, dy: number, cx: number, cy: number, r: number): number {
  const fx = ox - cx, fy = oy - cy;
  const b = fx * dx + fy * dy; const c = fx * fx + fy * fy - r * r;
  if (c < 0) return 0;
  const disc = b * b - c; if (disc < 0) return -1;
  const t = -b - Math.sqrt(disc);
  return t >= 0 ? t : -1;
}

function rayRect(ox: number, oy: number, dx: number, dy: number, rx: number, ry: number, rw: number, rh: number): number {
  let tmin = -Infinity, tmax = Infinity;
  if (Math.abs(dx) < 1e-9) { if (ox < rx || ox > rx + rw) return -1; }
  else { let t1 = (rx - ox) / dx, t2 = (rx + rw - ox) / dx; if (t1 > t2) [t1, t2] = [t2, t1]; tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); }
  if (Math.abs(dy) < 1e-9) { if (oy < ry || oy > ry + rh) return -1; }
  else { let t1 = (ry - oy) / dy, t2 = (ry + rh - oy) / dy; if (t1 > t2) [t1, t2] = [t2, t1]; tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); }
  if (tmax < 0 || tmin > tmax) return -1;
  return tmin < 0 ? 0 : tmin;
}
