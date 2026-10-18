// Grid flow field toward the player so monsters walk around obstacles.
import { ROOM } from '../config/balance';
import type { StaticWorld } from './world';

export const NAV_CELL = 24;
export const NAV_COLS = ROOM.width / NAV_CELL;
export const NAV_ROWS = ROOM.height / NAV_CELL;

export class FlowField {
  blocked = new Uint8Array(NAV_COLS * NAV_ROWS);
  dist = new Int32Array(NAV_COLS * NAV_ROWS);
  private queue = new Int32Array(NAV_COLS * NAV_ROWS);

  constructor(world: StaticWorld, inflate = 16) {
    for (let r = 0; r < NAV_ROWS; r++) for (let c = 0; c < NAV_COLS; c++) {
      const x = c * NAV_CELL + NAV_CELL / 2, y = r * NAV_CELL + NAV_CELL / 2;
      this.blocked[r * NAV_COLS + c] = world.overlapsSolid(x, y, inflate, true) ? 1 : 0;
    }
  }

  build(tx: number, ty: number) {
    const d = this.dist; d.fill(-1);
    let c = clampi(Math.floor(tx / NAV_CELL), 0, NAV_COLS - 1), r = clampi(Math.floor(ty / NAV_CELL), 0, NAV_ROWS - 1);
    let head = 0, tail = 0;
    const start = r * NAV_COLS + c;
    d[start] = 0; this.queue[tail++] = start;
    while (head < tail) {
      const i = this.queue[head++];
      const ci = i % NAV_COLS, ri = (i - ci) / NAV_COLS;
      const nd = d[i] + 1;
      if (ci > 0) this.visit(i - 1, nd, tail) && tail++;
      if (ci < NAV_COLS - 1) this.visit(i + 1, nd, tail) && tail++;
      if (ri > 0) this.visit(i - NAV_COLS, nd, tail) && tail++;
      if (ri < NAV_ROWS - 1) this.visit(i + NAV_COLS, nd, tail) && tail++;
    }
  }

  private visit(i: number, nd: number, tail: number): boolean {
    if (this.dist[i] !== -1 || this.blocked[i]) return false;
    this.dist[i] = nd; this.queue[tail] = i; return true;
  }

  // Direction (unit) to move from (x,y) toward the target along the field. Returns null if no path.
  dir(x: number, y: number, out: { x: number; y: number }): boolean {
    const c = clampi(Math.floor(x / NAV_CELL), 0, NAV_COLS - 1), r = clampi(Math.floor(y / NAV_CELL), 0, NAV_ROWS - 1);
    const i = r * NAV_COLS + c;
    let best = this.dist[i] < 0 ? 1e9 : this.dist[i], bx = 0, by = 0, found = false;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const cc = c + dc, rr = r + dr;
      if (cc < 0 || rr < 0 || cc >= NAV_COLS || rr >= NAV_ROWS) continue;
      const j = rr * NAV_COLS + cc; const v = this.dist[j];
      if (v < 0) continue;
      // avoid cutting corners diagonally past blocked cells
      if (dr && dc && (this.blocked[r * NAV_COLS + cc] || this.blocked[rr * NAV_COLS + c])) continue;
      const cost = v + (dr && dc ? 0.41 : 0);
      if (cost < best) { best = cost; bx = cc * NAV_CELL + NAV_CELL / 2 - x; by = rr * NAV_CELL + NAV_CELL / 2 - y; found = true; }
    }
    if (!found) return false;
    const l = Math.hypot(bx, by) || 1; out.x = bx / l; out.y = by / l; return true;
  }

  reachable(x: number, y: number): boolean {
    const c = clampi(Math.floor(x / NAV_CELL), 0, NAV_COLS - 1), r = clampi(Math.floor(y / NAV_CELL), 0, NAV_ROWS - 1);
    return this.dist[r * NAV_COLS + c] >= 0;
  }
}

function clampi(v: number, a: number, b: number) { return v < a ? a : v > b ? b : v; }
