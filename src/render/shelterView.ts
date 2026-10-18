// The animal shelter yard: rescued friends wander, nap and play with the
// decorations; empty baskets show silhouettes of friends still out there.
import { SPECIES, type SpeciesId } from '../config/balance';
import { draw, drawFrame, frame } from '../engine/atlas';
import { Rng } from '../sim/rng';
import { Particles } from './particles';

export const SH_W = 400;
const T = 48;

interface Pet { sp: SpeciesId; x: number; y: number; tx: number; ty: number; state: 'walk' | 'idle' | 'sleep' | 'happy' | 'play'; t: number; facing: number; gift: boolean; id: number; target: string | null }

// decoration spots as fractions of the play yard (x, y)
const DECOR_POS: Record<string, [number, number]> = {
  ball: [0.32, 0.35], cushion: [0.18, 0.08], bowl: [0.82, 0.08], flowers: [0.16, 0.86], pond: [0.78, 0.5], treehouse: [0.1, 0.42], slide: [0.84, 0.88], fountain: [0.5, 0.62],
};

export class ShelterView {
  W = SH_W; H = 900;
  scale = 1; top = 0; bottom = 0; viewW = 0; viewH = 0;
  pets: Pet[] = [];
  missing: SpeciesId[] = [];
  decor: string[] = [];
  fx = new Particles();
  time = 0;
  private rng = new Rng(99);
  private bg: HTMLCanvasElement | null = null;
  private baskets: { sp: SpeciesId; x: number; y: number }[] = [];
  giftsReady = 0;

  layout(viewW: number, viewH: number, top: number, bottom: number) {
    this.viewW = viewW; this.viewH = viewH; this.top = top; this.bottom = bottom;
    const availH = viewH - top - bottom;
    this.scale = viewW / SH_W;
    this.H = Math.max(520, Math.round(availH / this.scale));
    this.bg = null;
    this.placeBaskets();
    for (const p of this.pets) { p.y = Math.min(p.y, this.yardBottom()); }
  }

  houseY() { return 112; }
  basketRows() { return Math.ceil(this.missing.length / 6); }
  yardTop() { return this.houseY() + 30 + this.basketRows() * 50; }
  yardBottom() { return this.H - 26; }

  setData(counts: Partial<Record<SpeciesId, number>>, bondOf: (s: SpeciesId) => number, decor: string[]) {
    this.decor = decor.slice();
    const want: SpeciesId[] = [];
    for (const s of SPECIES) { const n = counts[s.id] || 0; if (n > 0) { const k = Math.min(3, Math.max(1, bondOf(s.id))); for (let i = 0; i < k; i++) want.push(s.id); } }
    // keep existing pets, add new ones at the house door so they "arrive"
    const next: Pet[] = [];
    const pool = this.pets.slice();
    let id = 1;
    for (const sp of want.slice(0, 26)) {
      const i = pool.findIndex((p) => p.sp === sp);
      if (i >= 0) { next.push(pool[i]); pool.splice(i, 1); continue; }
      const x = this.rng.range(50, SH_W - 50), y = this.rng.range(this.yardTop() + 20, this.yardBottom());
      next.push({ sp, x, y, tx: x, ty: y, state: 'idle', t: this.rng.range(0.5, 3), facing: this.rng.chance(0.5) ? 1 : -1, gift: false, id: id++, target: null });
    }
    next.forEach((p, i) => (p.id = i + 1));
    this.pets = next;
    this.missing = SPECIES.filter((s) => !(counts[s.id] || 0)).map((s) => s.id);
    this.placeBaskets();
    this.bg = null;
  }

  arrive(sp: SpeciesId) {
    const p = this.pets.find((q) => q.sp === sp);
    if (!p) return;
    p.x = SH_W / 2; p.y = this.houseY() + 14; p.state = 'happy'; p.t = 1.6; p.tx = SH_W / 2 + this.rng.range(-80, 80); p.ty = this.yardTop() + 60;
    for (let i = 0; i < 10; i++) this.fx.spawn('p_heart', p.x, p.y - 30, { z: 10, vz: this.rng.range(120, 260), vx: this.rng.range(-120, 120), vy: this.rng.range(-40, 40), g: 250, max: 1.3, drag: 1 });
  }

  private placeBaskets() {
    this.baskets = [];
    const n = this.missing.length; if (!n) return;
    const perRow = 6; const gap = 58;
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / perRow), col = i % perRow; const inRow = Math.min(perRow, n - row * perRow);
      const x0 = SH_W / 2 - ((inRow - 1) * gap) / 2;
      this.baskets.push({ sp: this.missing[i], x: x0 + col * gap, y: this.houseY() + 62 + row * 50 });
    }
  }

  setGifts(n: number) {
    this.giftsReady = n;
    const k = n <= 0 ? 0 : Math.min(Math.ceil(this.pets.length / 3), 5, Math.max(1, Math.floor(n / 15)));
    this.pets.forEach((p, i) => (p.gift = i < k));
  }

  screenToWorld(sx: number, sy: number): [number, number] { return [sx / this.scale, (sy - this.top) / this.scale]; }

  hitPet(sx: number, sy: number): Pet | null {
    const [x, y] = this.screenToWorld(sx, sy); let best: Pet | null = null, bd = 44;
    for (const p of this.pets) { const d = Math.hypot(p.x - x, p.y - 22 - y); if (d < bd) { bd = d; best = p; } }
    return best;
  }
  hitBasket(sx: number, sy: number): SpeciesId | null {
    const [x, y] = this.screenToWorld(sx, sy);
    for (const b of this.baskets) if (Math.hypot(b.x - x, b.y - 16 - y) < 34) return b.sp;
    return null;
  }

  poke(p: Pet) { p.state = 'happy'; p.t = 1.0; for (let i = 0; i < 4; i++) this.fx.spawn('p_heart', p.x, p.y - 40, { vy: -90, vx: this.rng.range(-50, 50), max: 0.8, scale: 0.7 }); }

  private decorSpot(id: string): [number, number] { const d = DECOR_POS[id]; return [30 + d[0] * (SH_W - 60), this.yardTop() + (this.yardBottom() - this.yardTop()) * d[1]]; }

  update(dt: number) {
    this.time += dt; this.fx.update(dt);
    const r = this.rng;
    for (const p of this.pets) {
      p.t -= dt;
      if (p.state === 'walk') {
        const dx = p.tx - p.x, dy = p.ty - p.y; const d = Math.hypot(dx, dy);
        if (d < 4) { p.state = p.target === 'cushion' || p.target === 'treehouse' ? 'sleep' : p.target === 'ball' || p.target === 'slide' ? 'play' : 'idle'; p.t = r.range(2, 6); }
        else { const sp = 40; p.x += (dx / d) * sp * dt; p.y += (dy / d) * sp * dt; if (Math.abs(dx) > 2) p.facing = dx > 0 ? 1 : -1; }
      } else if (p.t <= 0) {
        // pick something to do
        const roll = r.next();
        const owned = this.decor.filter((d) => DECOR_POS[d]);
        if (owned.length && roll < 0.35) {
          const d = r.pick(owned); const [x, y] = this.decorSpot(d);
          p.tx = x + r.range(-40, 40); p.ty = y + r.range(4, 30); p.target = d; p.state = 'walk';
        } else if (roll < 0.75) {
          p.tx = r.range(40, SH_W - 40); p.ty = r.range(this.yardTop() + 20, this.yardBottom()); p.target = null; p.state = 'walk';
        } else if (roll < 0.88) { p.state = 'sleep'; p.t = r.range(3, 7); }
        else { p.state = 'idle'; p.t = r.range(1.5, 4); }
      }
    }
  }

  private buildBg(): HTMLCanvasElement {
    const sc = Math.min(2, this.scale * 2);
    const c = document.createElement('canvas'); c.width = Math.round(SH_W * sc); c.height = Math.round(this.H * sc);
    const g = c.getContext('2d')!; g.scale(sc, sc);
    for (let y = 0; y < this.H; y += T) for (let x = 0; x < SH_W; x += T) {
      const h = ((x * 73856093) ^ (y * 19349663)) >>> 0; const v = h % 10; const f = frame(`g_${v < 4 ? 0 : v < 7 ? 1 : v < 9 ? 2 : 3}`);
      if (f) g.drawImage(f.img, f.x, f.y, f.w, f.h, x, y, T + 0.5, T + 0.5);
    }
    // path from the house
    g.lineCap = 'round';
    g.strokeStyle = '#b47b47'; g.lineWidth = 46; g.beginPath(); g.moveTo(SH_W / 2, this.houseY()); g.quadraticCurveTo(SH_W / 2 - 40, this.H * 0.6, SH_W / 2, this.H + 40); g.stroke();
    g.strokeStyle = '#d9a46a'; g.lineWidth = 38; g.stroke();
    const rr = new Rng(5);
    for (let i = 0; i < 34; i++) { const f = frame(rr.pick(['d_flower_0', 'd_flower_1', 'd_flower_2', 'd_flower_3', 'd_tuft', 'd_clover', 'd_tuft'])); if (f) drawFrame(g, f, rr.range(16, SH_W - 16), rr.range(this.houseY() + 20, this.H - 10), 1); }
    // soft vignette
    const vg = g.createRadialGradient(SH_W / 2, this.H * 0.55, this.H * 0.3, SH_W / 2, this.H * 0.55, this.H * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,50,10,0.25)'); g.fillStyle = vg; g.fillRect(0, 0, SH_W, this.H);
    return c;
  }

  render(ctx: CanvasRenderingContext2D, dpr: number) {
    if (!this.bg) this.bg = this.buildBg();
    const s = this.scale;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#3f7a2a'; ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, dpr * this.top);
    ctx.drawImage(this.bg, 0, 0, SH_W, this.H);
    const items: { y: number; f: () => void }[] = [];
    // back trees and the house
    for (const [x, y, n] of [[30, 96, 'ob_tree'], [372, 92, 'ob_tree2'], [86, 70, 'ob_pine'], [318, 66, 'ob_pine']] as [number, number, string][]) items.push({ y, f: () => draw(ctx, n, x, y, 0.75) });
    items.push({ y: this.houseY(), f: () => draw(ctx, 'sh_house', SH_W / 2, this.houseY(), 0.55) });
    // fences on the sides
    for (let y = this.houseY() + 40; y < this.H + 100; y += 140) { items.push({ y: y + 140, f: () => { draw(ctx, 'ob_fencev', 8, y + 140, 0.7); draw(ctx, 'ob_fencev', SH_W - 8, y + 140, 0.7); } }); }
    for (const d of this.decor) {
      if (!DECOR_POS[d]) continue; const [x, y] = this.decorSpot(d);
      items.push({ y: y + (d === 'pond' ? -40 : 0), f: () => draw(ctx, `dc_${d}`, x, y, d === 'treehouse' ? 0.6 : d === 'pond' || d === 'fountain' || d === 'slide' ? 0.65 : 0.75) });
    }
    for (const b of this.baskets) items.push({ y: b.y, f: () => { draw(ctx, 'sh_basket', b.x, b.y, 0.62); draw(ctx, `sil_${b.sp}`, b.x, b.y - 26, 0.46, false, 0, 0.9); drawText(ctx, '?', b.x + 16, b.y - 40, 16); } });
    for (const p of this.pets) items.push({ y: p.y, f: () => this.drawPet(ctx, p) });
    items.sort((a, b) => a.y - b.y);
    const sh = frame('shadow');
    if (sh) for (const p of this.pets) drawFrame(ctx, sh, p.x, p.y + 2, 0.55, false, 0, 0.7);
    for (const it of items) it.f();
    this.fx.draw(ctx, false);
  }

  private drawPet(ctx: CanvasRenderingContext2D, p: Pet) {
    const t = this.time + p.id * 0.37;
    let name: string; let lift = 0;
    if (p.state === 'walk') name = `a_${p.sp}_walk_${Math.floor(t * 8) % 4}`;
    else if (p.state === 'sleep') name = `a_${p.sp}_sleep_${Math.floor(t * 1.2) % 2}`;
    else if (p.state === 'happy') { name = `a_${p.sp}_happy_${Math.floor(t * 10) % 3}`; lift = Math.abs(Math.sin(t * 9)) * 10; }
    else if (p.state === 'play') { name = `a_${p.sp}_happy_${Math.floor(t * 6) % 3}`; lift = Math.abs(Math.sin(t * 6)) * 8; }
    else name = `a_${p.sp}_idle_${Math.sin(t * 0.8) > 0.97 ? 1 : 0}`;
    draw(ctx, name, p.x, p.y - lift, 0.9, p.facing < 0);
    if (p.state === 'sleep') draw(ctx, 'mk_zzz', p.x + 18, p.y - 46 - Math.sin(t * 2) * 3, 0.7, false, 0, 0.9);
    if (p.gift) draw(ctx, 'mk_excl', p.x, p.y - 62 + Math.sin(t * 4) * 4, 0.75);
  }
}

function drawText(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number) {
  ctx.save(); ctx.font = `${size}px "Fredoka","Jua",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 4; ctx.strokeStyle = '#3a2416'; ctx.fillStyle = '#fff'; ctx.strokeText(s, x, y); ctx.fillText(s, x, y); ctx.restore();
}
