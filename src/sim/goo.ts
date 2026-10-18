// Coarse goo coverage grid. The renderer keeps a matching high-res goo layer
// and erases it through 'clean' events; this grid drives gameplay (slowdown) and stats.
import { ROOM } from '../config/balance';
import type { GooBlob } from './types';

export const GOO_CELL = 16;
export const GOO_COLS = ROOM.width / GOO_CELL;
export const GOO_ROWS = ROOM.height / GOO_CELL;

export class GooGrid {
  cells = new Uint8Array(GOO_COLS * GOO_ROWS);
  initial = 0;
  remaining = 0;

  constructor(blobs: GooBlob[]) {
    for (const b of blobs) this.stamp(b.x, b.y, b.r);
    this.initial = this.count();
    this.remaining = this.initial;
  }

  private stamp(x: number, y: number, r: number) {
    const c0 = Math.max(0, Math.floor((x - r) / GOO_CELL)), c1 = Math.min(GOO_COLS - 1, Math.floor((x + r) / GOO_CELL));
    const r0 = Math.max(0, Math.floor((y - r) / GOO_CELL)), r1 = Math.min(GOO_ROWS - 1, Math.floor((y + r) / GOO_CELL));
    const rr = (r * 0.92) * (r * 0.92);
    for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
      const cx = col * GOO_CELL + GOO_CELL / 2, cy = row * GOO_CELL + GOO_CELL / 2;
      const dx = cx - x, dy = cy - y;
      if (dx * dx + dy * dy <= rr) this.cells[row * GOO_COLS + col] = 1;
    }
  }

  count(): number { let n = 0; for (let i = 0; i < this.cells.length; i++) n += this.cells[i]; return n; }

  at(x: number, y: number): boolean {
    const c = Math.floor(x / GOO_CELL), r = Math.floor(y / GOO_CELL);
    if (c < 0 || r < 0 || c >= GOO_COLS || r >= GOO_ROWS) return false;
    return this.cells[r * GOO_COLS + c] === 1;
  }

  // Returns number of cells cleaned.
  clean(x: number, y: number, r: number): number {
    const c0 = Math.max(0, Math.floor((x - r) / GOO_CELL)), c1 = Math.min(GOO_COLS - 1, Math.floor((x + r) / GOO_CELL));
    const r0 = Math.max(0, Math.floor((y - r) / GOO_CELL)), r1 = Math.min(GOO_ROWS - 1, Math.floor((y + r) / GOO_CELL));
    const rr = r * r; let n = 0;
    for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
      const i = row * GOO_COLS + col;
      if (!this.cells[i]) continue;
      const cx = col * GOO_CELL + GOO_CELL / 2, cy = row * GOO_CELL + GOO_CELL / 2;
      const dx = cx - x, dy = cy - y;
      if (dx * dx + dy * dy <= rr) { this.cells[i] = 0; n++; }
    }
    this.remaining -= n;
    return n;
  }

  clearAll() { this.cells.fill(0); this.remaining = 0; }

  cleanRatio(): number { return this.initial === 0 ? 1 : 1 - this.remaining / this.initial; }
}
