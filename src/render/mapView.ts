// World map: one tall scrollable scene, built from the same tiles and props as
// the rooms. Uncleaned areas are covered in goo; cleaning a stage washes its
// patch on the map (animated the first time you come back).
import { STAGE_COUNT } from '../config/balance';
import { draw, drawFrame, frame } from '../engine/atlas';
import { quality } from '../engine/quality';
import { Rng } from '../sim/rng';
import type { Region } from '../sim/types';
import { Particles } from './particles';

export const MAP_W = 576;
const STEP = 124;
const TOP = 260, BOTTOM = 220;
export const MAP_H = TOP + BOTTOM + (STAGE_COUNT - 1) * STEP + 3 * 140;
const T = 48;
const CHUNK = 480;

export interface MapNode { stage: number; x: number; y: number; region: Region; boss: boolean }

export function regionOf(stage: number): Region { return stage <= 10 ? 'forest' : stage <= 20 ? 'village' : 'lake'; }

export function buildNodes(): MapNode[] {
  const out: MapNode[] = [];
  for (let i = 0; i < STAGE_COUNT; i++) {
    const s = i + 1; const reg = Math.floor(i / 10);
    const y = MAP_H - BOTTOM - i * STEP - reg * 140;
    const x = MAP_W / 2 + Math.sin(i * 0.95 + 0.4) * 150 + Math.sin(i * 2.1) * 18;
    out.push({ stage: s, x, y, region: regionOf(s), boss: s % 10 === 0 });
  }
  return out;
}

interface Prop { name: string; x: number; y: number; s: number; flip: boolean }

export class MapView {
  nodes = buildNodes();
  scroll = 0; // world y at the top of the view
  vel = 0;
  scale = 1; viewW = 0; viewH = 0; top = 0; bottom = 0;
  time = 0;
  fx = new Particles();
  private chunks = new Map<number, HTMLCanvasElement>();
  private props: Prop[] = [];
  private rng = new Rng(4242);
  cleared: (stage: number) => boolean = () => false;
  current = 1;
  newFriendAt = new Set<number>();
  washing: { stage: number; t: number } | null = null;
  private gooCache = new Map<number, [number, number, number, number][]>();

  constructor() { this.buildProps(); }

  private regionBand(y: number): Region { const i = this.nodes.findIndex((n) => n.y < y + STEP / 2); const n = this.nodes[Math.max(0, i)]; return y > MAP_H - BOTTOM - 9.5 * STEP ? 'forest' : y > MAP_H - BOTTOM - 19.5 * STEP - 140 ? (n?.region ?? 'village') : 'lake'; }

  private bandAt(y: number): Region {
    const fEnd = this.nodes[9].y - 70, vEnd = this.nodes[19].y - 70;
    return y > fEnd ? 'forest' : y > vEnd ? 'village' : 'lake';
  }

  private buildProps() {
    const r = this.rng;
    // trees and scenery along the trail, never on it
    const nearPath = (x: number, y: number) => {
      for (let i = 0; i < this.nodes.length - 1; i++) {
        const a = this.nodes[i], b = this.nodes[i + 1];
        for (let k = 0; k <= 8; k++) { const px = a.x + (b.x - a.x) * k / 8, py = a.y + (b.y - a.y) * k / 8; if (Math.hypot(px - x, py - y) < 70) return true; }
      }
      return false;
    };
    for (let i = 0; i < 260; i++) {
      const x = r.range(-20, MAP_W + 20), y = r.range(40, MAP_H - 20);
      if (nearPath(x, y)) continue;
      const band = this.bandAt(y);
      let name = band === 'forest' ? r.pick(['ob_tree', 'ob_tree2', 'ob_pine', 'ob_bush', 'ob_tree', 'ob_pine']) : band === 'village' ? r.pick(['ob_tree', 'ob_bush', 'ob_hay', 'ob_barrel', 'ob_tree2', 'ob_bush']) : r.pick(['ob_reeds', 'ob_tree', 'ob_shellrock', 'ob_bush', 'ob_reeds']);
      if (band === 'lake' && this.isLakeWater(x, y)) { if (r.chance(0.7)) continue; name = 'ob_reeds'; }
      this.props.push({ name, x, y, s: r.range(0.75, 1.0), flip: r.chance(0.5) });
    }
    // landmarks
    const v = this.nodes[14];
    this.props.push({ name: 'ob_windmill', x: v.x > MAP_W / 2 ? 110 : MAP_W - 110, y: v.y + 40, s: 0.9, flip: false });
    for (const k of [11, 16, 18]) { const n = this.nodes[k]; this.props.push({ name: k % 2 ? 'ob_house' : 'ob_house2', x: n.x > MAP_W / 2 ? 96 : MAP_W - 96, y: n.y + 30, s: 0.55, flip: false }); }
    this.props.sort((a, b) => a.y - b.y);
  }

  private isLakeWater(x: number, y: number): boolean {
    const top = this.nodes[29].y - 120, bot = this.nodes[20].y + 60;
    if (y < top || y > bot) return false;
    // two lakes either side of the trail
    const cy = (top + bot) / 2;
    return Math.hypot((x - (MAP_W * 0.5)) / 1.1, (y - cy) / 2.6) < 120 && !this.onTrail(x, y);
  }
  private onTrail(x: number, y: number) {
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const a = this.nodes[i], b = this.nodes[i + 1];
      for (let k = 0; k <= 10; k++) { const px = a.x + (b.x - a.x) * k / 10, py = a.y + (b.y - a.y) * k / 10; if (Math.hypot(px - x, py - y) < 60) return true; }
    }
    return false;
  }

  layout(viewW: number, viewH: number, top: number, bottom: number) {
    this.viewW = viewW; this.viewH = viewH; this.top = top; this.bottom = bottom;
    this.scale = Math.min(viewW / MAP_W, 1.6);
    this.clampScroll();
  }

  visibleH() { return (this.viewH - this.top - this.bottom) / this.scale; }
  clampScroll() { const max = MAP_H - this.visibleH(); this.scroll = Math.max(0, Math.min(max, this.scroll)); }

  focus(stage: number) {
    const n = this.nodes[Math.max(0, Math.min(this.nodes.length - 1, stage - 1))];
    this.scroll = n.y - this.visibleH() * 0.58; this.vel = 0; this.clampScroll();
  }

  screenToWorld(sx: number, sy: number): [number, number] {
    const ox = (this.viewW - MAP_W * this.scale) / 2;
    return [(sx - ox) / this.scale, (sy - this.top) / this.scale + this.scroll];
  }
  worldToScreen(x: number, y: number): [number, number] {
    const ox = (this.viewW - MAP_W * this.scale) / 2;
    return [ox + x * this.scale, this.top + (y - this.scroll) * this.scale];
  }

  hitNode(sx: number, sy: number): MapNode | null {
    const [x, y] = this.screenToWorld(sx, sy);
    let best: MapNode | null = null, bd = 56;
    for (const n of this.nodes) { const d = Math.hypot(n.x - x, n.y - 10 - y); if (d < bd) { bd = d; best = n; } }
    return best;
  }

  // ---------------------------------------------------------------- chunks (static ground + trail)
  private chunk(i: number): HTMLCanvasElement {
    let c = this.chunks.get(i);
    if (c) return c;
    const sc = quality().bgScale;
    c = document.createElement('canvas'); c.width = Math.round(MAP_W * sc); c.height = Math.round(CHUNK * sc);
    const g = c.getContext('2d')!;
    g.scale(sc, sc); g.translate(0, -i * CHUNK);
    const y0 = i * CHUNK, y1 = y0 + CHUNK;
    for (let ty = Math.floor(y0 / T) * T; ty < y1; ty += T) for (let tx = 0; tx < MAP_W; tx += T) {
      const hsh = ((tx * 73856093) ^ (ty * 19349663)) >>> 0; const v = hsh % 10;
      const f = frame(`g_${v < 4 ? 0 : v < 7 ? 1 : v < 9 ? 2 : 3}`);
      if (f) g.drawImage(f.img, f.x, f.y, f.w, f.h, tx, ty, T + 0.5, T + 0.5);
    }
    // lake water + sand as dual-grid terrain
    const cell = (cx: number, cy: number) => this.isLakeWater(cx * T + T / 2, cy * T + T / 2) ? 'w' : '.';
    for (let j = Math.floor(y0 / T); j <= Math.ceil(y1 / T); j++) for (let k = 0; k <= MAP_W / T; k++) {
      let m = 0;
      if (cell(k - 1, j - 1) === 'w') m |= 1; if (cell(k, j - 1) === 'w') m |= 2; if (cell(k - 1, j) === 'w') m |= 4; if (cell(k, j) === 'w') m |= 8;
      if (!m) continue;
      const f = frame(`t_water_${m}`); if (f) g.drawImage(f.img, f.x, f.y, f.w, f.h, (k - 0.5) * T, (j - 0.5) * T, T + 0.5, T + 0.5);
    }
    // trail
    g.lineCap = 'round'; g.lineJoin = 'round';
    const trail = () => { g.beginPath(); this.nodes.forEach((n, k) => { if (k === 0) g.moveTo(n.x, n.y + 120); const prev = this.nodes[k - 1]; if (prev) { const mx = (prev.x + n.x) / 2, my = (prev.y + n.y) / 2; g.quadraticCurveTo(prev.x + (mx - prev.x) * 0.2, my + 20, n.x, n.y); } else g.lineTo(n.x, n.y); }); };
    trail(); g.strokeStyle = '#b47b47'; g.lineWidth = 44; g.stroke();
    trail(); g.strokeStyle = '#d9a46a'; g.lineWidth = 36; g.stroke();
    trail(); g.setLineDash([2, 22]); g.strokeStyle = 'rgba(255,240,210,0.9)'; g.lineWidth = 7; g.stroke(); g.setLineDash([]);
    const rr = new Rng(i * 7 + 3);
    for (let k = 0; k < 18; k++) {
      const x = rr.range(0, MAP_W), y = rr.range(y0, y1);
      const f = frame(rr.pick(['d_flower_0', 'd_flower_1', 'd_flower_2', 'd_tuft', 'd_clover', 'd_pebble_0', 'd_tuft']));
      if (f && !this.isLakeWater(x, y)) drawFrame(g, f, x, y, 0.9);
    }
    this.chunks.set(i, c);
    if (this.chunks.size > 7) { const first = this.chunks.keys().next().value as number; if (first !== i) this.chunks.delete(first); }
    return c;
  }

  invalidate() { this.chunks.clear(); }

  private gooFor(stage: number): [number, number, number, number][] {
    let g = this.gooCache.get(stage);
    if (!g) {
      const n = this.nodes[stage - 1]; const r = new Rng(stage * 977);
      g = [];
      for (let k = 0; k < 5; k++) { const a = r.range(0, 6.28), d = r.range(14, 60); g.push([n.x + Math.cos(a) * d, n.y + Math.sin(a) * d * 0.7 + 6, r.range(36, 58), r.int(0, 3)]); }
      this.gooCache.set(stage, g);
    }
    return g;
  }

  // ---------------------------------------------------------------- frame
  update(dt: number) {
    this.time += dt; this.fx.update(dt);
    if (Math.abs(this.vel) > 1) { this.scroll += this.vel * dt; this.vel *= Math.pow(0.04, dt); this.clampScroll(); } else this.vel = 0;
    if (this.washing) {
      this.washing.t += dt;
      const n = this.nodes[this.washing.stage - 1];
      if (this.washing.t < 1.2 && this.fx.count() < 120) {
        const a = this.rng.range(0, 6.28), d = this.rng.range(0, 70);
        this.fx.spawn(['p_sparkle_0', 'p_sparkle_1', 'p_sparkle_2'], n.x + Math.cos(a) * d, n.y + Math.sin(a) * d * 0.7, { fps: 10, max: 0.5, scale: 1.2 });
        this.fx.spawn('p_water', n.x + this.rng.range(-50, 50), n.y, { z: 10, vz: this.rng.range(150, 300), vx: this.rng.range(-120, 120), g: 700, max: 0.7 });
      }
      if (this.washing.t > 1.6) this.washing = null;
    }
  }

  render(ctx: CanvasRenderingContext2D, dpr: number) {
    const s = this.scale; const ox = (this.viewW - MAP_W * s) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#3f7a2a'; ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * (this.top - this.scroll * s));
    const y0 = this.scroll - 60, y1 = this.scroll + this.visibleH() + (this.bottom + 60) / s;
    for (let i = Math.max(0, Math.floor(y0 / CHUNK)); i <= Math.floor(y1 / CHUNK); i++) {
      if (i * CHUNK > MAP_H) break;
      ctx.drawImage(this.chunk(i), 0, i * CHUNK, MAP_W, CHUNK);
    }
    // goo over areas that still need cleaning
    for (const n of this.nodes) {
      if (n.y < y0 - 100 || n.y > y1 + 100) continue;
      const done = this.cleared(n.stage);
      let k = done ? 0 : 1;
      if (this.washing && this.washing.stage === n.stage) k = Math.max(0, 1 - this.washing.t / 1.0);
      if (k <= 0) continue;
      for (const [x, y, r, st] of this.gooFor(n.stage)) { const f = frame(`goostamp_${st}`); if (f) drawFrame(ctx, f, x, y, (r * 2 * k) / 112 * 1.1, false, n.stage, 0.92); }
    }
    // props and nodes, sorted by y
    const items: { y: number; f: () => void }[] = [];
    for (const p of this.props) if (p.y > y0 - 40 && p.y < y1 + 220) items.push({ y: p.y, f: () => draw(ctx, p.name, p.x, p.y, p.s, p.flip) });
    for (const n of this.nodes) if (n.y > y0 - 60 && n.y < y1 + 120) items.push({ y: n.y, f: () => this.drawNode(ctx, n) });
    items.sort((a, b) => a.y - b.y);
    for (const it of items) it.f();
    // region signs
    for (const [stage, key] of [[1, 'forest'], [11, 'village'], [21, 'lake']] as [number, string][]) {
      const n = this.nodes[stage - 1]; const sy = n.y + 96;
      if (sy < y0 - 80 || sy > y1 + 160) continue;
      const sx = n.x > MAP_W / 2 ? n.x - 150 : n.x + 150;
      draw(ctx, 'mp_sign', sx, sy, 0.62);
      ctx.save(); ctx.font = `22px "Fredoka","Jua",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 4; ctx.strokeStyle = '#6b4a32'; ctx.fillStyle = '#fff6e2';
      const label = this.regionLabel(key);
      ctx.strokeText(label, sx, sy - 57); ctx.fillText(label, sx, sy - 57); ctx.restore();
    }
    this.fx.draw(ctx, false);
  }

  regionLabel: (key: string) => string = (k) => k;

  private drawNode(ctx: CanvasRenderingContext2D, n: MapNode) {
    const done = this.cleared(n.stage); const cur = n.stage === this.current; const locked = n.stage > this.current && !done;
    const bob = cur ? Math.sin(this.time * 4) * 3 : 0;
    if (cur) { ctx.save(); ctx.globalAlpha = 0.45 + Math.sin(this.time * 4) * 0.2; ctx.fillStyle = '#fff6a0'; ctx.beginPath(); ctx.ellipse(n.x, n.y + 4, 50, 28, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    draw(ctx, n.boss ? 'mp_node_boss' : 'mp_node', n.x, n.y + 8, 0.9, false, 0, locked ? 0.75 : 1);
    ctx.save(); ctx.font = `${n.boss ? 26 : 23}px "Fredoka","Jua",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 5; ctx.strokeStyle = '#3a2416'; ctx.fillStyle = locked ? '#cfd6dc' : '#ffffff';
    const label = String(((n.stage - 1) % 10) + 1);
    ctx.strokeText(label, n.x, n.y - 4); ctx.fillText(label, n.x, n.y - 4); ctx.restore();
    if (n.boss) draw(ctx, 'ic_crown', n.x, n.y - 38, 0.45);
    if (done) draw(ctx, 'mp_flag', n.x + 26, n.y - 2, 0.7);
    if (locked && n.stage === this.current + 1) draw(ctx, 'ic_lock', n.x + 24, n.y - 20, 0.32);
    if (this.newFriendAt.has(n.stage) && !locked) {
      const fy = n.y - 64 + Math.sin(this.time * 3 + n.stage) * 3;
      draw(ctx, 'mk_help', n.x - 30, fy, 0.75);
    }
    if (cur) draw(ctx, 'mk_arrow', n.x, n.y - 70 + bob * 2, 0.6, false, Math.PI);
  }

  // drag scrolling
  drag(dy: number) { this.scroll -= dy / this.scale; this.clampScroll(); }
  fling(vy: number) { this.vel = -vy / this.scale; }
  ensureVisible(stage: number) { const n = this.nodes[stage - 1]; if (n.y < this.scroll + 80 || n.y > this.scroll + this.visibleH() - 80) this.focus(stage); }

  regionAt(stage: number) { return regionOf(stage); }
  void_() { void this.regionBand; }
}
