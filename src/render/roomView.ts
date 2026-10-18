// Draws a RoomSim: ground, goo layer (washed away by events), y-sorted
// sprites, the water stream, effects and droplets. Visual only.
import { GUN_TIERS, MONSTER_RULES, ROOM } from '../config/balance';
import { draw, drawFrame, frame, point, type Frame } from '../engine/atlas';
import { quality } from '../engine/quality';
import { Rng } from '../sim/rng';
import type { RoomSim } from '../sim/room';
import type { Monster, Region, SimEvent } from '../sim/types';
import { buildBackground, buildStatics, REGION_LOOK, type StaticSprite } from './background';
import { save } from '../meta/save';
import { Particles } from './particles';

const GOO_COLOR: Record<string, string> = {
  blob: 'violet', mini: 'amber', spitter: 'pink', splitter: 'amber', dasher: 'indigo', chunky: 'plum', nest: 'berry', jumper: 'teal', flyer: 'berry', boss: 'royal',
};
const BOSS_COLOR: Record<Region, string> = { forest: 'royal', village: 'amber', lake: 'teal' };

interface MVis { sx: number; sy: number; vx: number; vy: number; rise0: number; seen: boolean }

export interface ViewLayout { viewW: number; viewH: number; top: number; bottom: number }

export class RoomView {
  sim: RoomSim;
  region: Region;
  bg: HTMLCanvasElement;
  bgScale: number;
  goo: HTMLCanvasElement;
  gooCtx: CanvasRenderingContext2D;
  gooScale = 0.75;
  statics: StaticSprite[];
  fx = new Particles();
  time = 0;
  scale = 1; offX = 0; offY = 0;
  shake = 0; shakeX = 0; shakeY = 0;
  hurtFlash = 0;
  private vis = new Map<number, MVis>();
  private rng = new Rng(77);
  private cleanWave: { x: number; y: number; r: number } | null = null;
  private gateFade = 1;
  private blooms = 0;
  private runDist = 0;
  private lastPX = 0; private lastPY = 0;
  private brush: Frame | null;
  private stamps: (Frame | null)[];
  private sortBuf: { y: number; k: number; o: unknown }[] = [];
  private font = '"Fredoka","Jua",sans-serif';
  showRange = 0;
  winTimer = 0;
  slowmo = 0;

  constructor(sim: RoomSim, region: Region, seedKey: string) {
    this.sim = sim; this.region = region;
    this.bgScale = quality().bgScale;
    this.bg = buildBackground(sim.def, region, seedKey, this.bgScale);
    this.statics = buildStatics(sim.def, region, seedKey);
    this.statics.push({ name: 'gate_posts', x: ROOM.width / 2, y: ROOM.wall + 6, flip: false, scale: 1, sortY: ROOM.wall });
    this.brush = frame('brush') ?? null;
    this.stamps = [0, 1, 2, 3].map((i) => frame(`goostamp_${i}`) ?? null);
    this.goo = document.createElement('canvas');
    this.goo.width = Math.round(ROOM.width * this.gooScale); this.goo.height = Math.round(ROOM.height * this.gooScale);
    this.gooCtx = this.goo.getContext('2d')!;
    this.paintGoo();
    this.lastPX = sim.player.x; this.lastPY = sim.player.y;
  }

  // Goo layer: union of organic splats, given thickness (dark lower rim, light
  // upper rim), gloss and bubbles. Washing erases straight through it.
  private paintGoo() {
    const g = this.gooCtx; const s = this.gooScale; const r = new Rng(this.sim.def.goo.length * 31 + 5);
    const W = this.goo.width, H = this.goo.height;
    const mask = document.createElement('canvas'); mask.width = W; mask.height = H;
    const m = mask.getContext('2d')!;
    m.scale(s, s); m.fillStyle = '#fff';
    const blob = (x: number, y: number, rad: number) => {
      const n = 40; const ph = r.range(0, 6.28), ph2 = r.range(0, 6.28);
      m.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const k = 1 + 0.1 * Math.sin(a * 3 + ph) + 0.06 * Math.sin(a * 5 + ph2);
        const px = x + Math.cos(a) * rad * k, py = y + Math.sin(a) * rad * k * 0.92;
        if (i === 0) m.moveTo(px, py); else m.lineTo(px, py);
      }
      m.closePath(); m.fill();
    };
    for (const b of this.sim.def.goo) {
      blob(b.x, b.y, b.r);
      const n = Math.max(2, Math.round(b.r / 34));
      for (let i = 0; i < n; i++) { const a = r.range(0, 6.28), d = b.r * r.range(0.7, 0.95); blob(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, b.r * r.range(0.22, 0.38)); }
    }
    const tint = (col: string) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d')!;
      x.drawImage(mask, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, W, H); return c;
    };
    g.clearRect(0, 0, W, H);
    g.drawImage(tint('#e9d8ff'), 0, -3 * s);
    g.drawImage(tint('#6e3fae'), 0, 5 * s);
    g.drawImage(tint('#b385ea'), 0, 0);
    // inner sheen + bubbles, only on the goo
    g.save(); g.globalCompositeOperation = 'source-atop'; g.scale(s, s);
    for (const b of this.sim.def.goo) {
      const gr = g.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.05, b.x, b.y, b.r * 1.1);
      gr.addColorStop(0, 'rgba(255,255,255,0.32)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.06)'); gr.addColorStop(1, 'rgba(90,40,150,0.18)');
      g.fillStyle = gr; g.beginPath(); g.arc(b.x, b.y, b.r * 1.3, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < Math.round(b.r / 14); i++) {
        const a = r.range(0, 6.28), d = r.range(0, b.r * 0.8), x = b.x + Math.cos(a) * d, y = b.y + Math.sin(a) * d, rr = r.range(2.5, 6.5);
        g.fillStyle = 'rgba(235,215,255,0.55)'; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.arc(x - rr * 0.35, y - rr * 0.35, rr * 0.35, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = 'rgba(255,255,255,0.4)';
      g.beginPath(); g.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.42, b.r * 0.28, b.r * 0.09, -0.5, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  private erase(x: number, y: number, r: number) {
    const g = this.gooCtx; const s = this.gooScale; const b = this.brush;
    if (!b) return;
    g.globalCompositeOperation = 'destination-out';
    const k = (r * 2 * s) / b.w * 1.25;
    g.drawImage(b.img, b.x, b.y, b.w, b.h, x * s - (b.w * k) / 2, y * s - (b.h * k) / 2, b.w * k, b.h * k);
    g.globalCompositeOperation = 'source-over';
  }

  layout(l: ViewLayout) {
    const availH = l.viewH - l.top - l.bottom;
    this.scale = Math.min(l.viewW / ROOM.width, availH / ROOM.height);
    this.offX = (l.viewW - ROOM.width * this.scale) / 2;
    this.offY = l.top + Math.max(0, (availH - ROOM.height * this.scale) * 0.4);
  }

  worldToScreen(x: number, y: number): [number, number] { return [this.offX + x * this.scale, this.offY + y * this.scale]; }

  // ------------------------------------------------------------------ events → effects
  onEvent(e: SimEvent) {
    const fx = this.fx; const r = this.rng;
    switch (e.t) {
      case 'hit': {
        const v = this.vis.get(e.id); if (v) { v.vy -= 2.4; v.vx += 2.0; }
        const m = this.sim.monsters.find((q) => q.id === e.id);
        const col = GOO_COLOR[e.kind];
        for (let i = 0; i < 2; i++) fx.spawn(`p_goo_${col}`, e.x + r.range(-16, 16), e.y + r.range(-10, 10), { z: 18, vz: r.range(80, 200), vx: r.range(-90, 90), vy: r.range(-30, 40), g: 600, max: 0.7, scale: r.range(0.7, 1.1) });
        if (m) fx.spawn('p_water_s', e.x, e.y, { z: 10, vz: 140, vx: r.range(-120, 120), g: 700, max: 0.5 });
        break;
      }
      case 'burst': {
        const col = e.boss ? BOSS_COLOR[this.region] : GOO_COLOR[e.kind];
        const big = e.r > 40;
        const n = big ? 22 : 12;
        fx.spawn(['fx_splash_0', 'fx_splash_1', 'fx_splash_2', 'fx_splash_3', 'fx_splash_4', 'fx_splash_5'], e.x, e.y + e.r * 0.4, { fps: 16, max: 0.4, scale: e.r / 24, ground: false });
        fx.spawn('fx_softring', e.x, e.y + e.r * 0.3, { max: 0.45, scale: e.r / 30, scale1: e.r / 10, ground: true, alpha: 0.8 });
        for (let i = 0; i < n; i++) {
          const a = r.range(0, 6.28), sp = r.range(120, 320) * (big ? 1.4 : 1);
          fx.spawn(`p_goo_${col}`, e.x, e.y, { z: 20, vz: r.range(150, 380), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, g: 900, max: r.range(0.5, 0.9), scale: r.range(0.8, 1.5), drag: 1.5 });
        }
        for (let i = 0; i < n; i++) {
          const a = r.range(0, 6.28), sp = r.range(90, 260);
          fx.spawn('p_water', e.x, e.y, { z: 16, vz: r.range(200, 420), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, g: 1000, max: r.range(0.45, 0.8), scale: r.range(0.6, 1.1) });
        }
        for (let i = 0; i < (big ? 8 : 4); i++) fx.spawn(['p_sparkle_0', 'p_sparkle_1', 'p_sparkle_2'], e.x + r.range(-e.r, e.r), e.y + r.range(-e.r, e.r * 0.5), { fps: 8, max: 0.45, scale: r.range(0.8, 1.3), vy: -40 });
        for (let i = 0; i < 3; i++) fx.spawn('p_bubble', e.x + r.range(-20, 20), e.y + r.range(-10, 10), { vy: r.range(-70, -30), vx: r.range(-30, 30), max: r.range(0.8, 1.3), scale: r.range(0.6, 1.0) });
        this.shake = Math.max(this.shake, e.boss ? 14 : big ? 6 : 2.5);
        if (e.combo >= 3) fx.text(`x${e.combo}`, e.x, e.y - e.r - 14, e.combo >= 6 ? '#ffe066' : '#ffffff', 22 + Math.min(14, e.combo * 1.5), 0.8);
        if (e.boss) { this.slowmo = 0.6; for (let i = 0; i < 30; i++) fx.spawn(['p_conf_0', 'p_conf_1', 'p_conf_2', 'p_conf_3', 'p_conf_4'][i % 5], e.x, e.y, { z: 40, vz: r.range(300, 600), vx: r.range(-300, 300), vy: r.range(-200, 100), g: 600, vr: r.range(-8, 8), max: 1.6, drag: 1 }); }
        this.vis.delete(-1);
        break;
      }
      case 'clean': {
        this.erase(e.x, e.y, e.r);
        if (this.blooms < 70 && r.chance(0.1)) {
          this.blooms++;
          const a = r.range(0, 6.28), d = r.range(0, e.r * 0.7);
          this.addBloom(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d);
        }
        break;
      }
      case 'cleanWave': this.cleanWave = { x: e.x, y: e.y, r: 0 }; break;
      case 'cocoonHit': {
        for (let i = 0; i < 2; i++) fx.spawn('p_goo_violet', e.x + r.range(-20, 20), e.y, { z: 30, vz: r.range(80, 180), vx: r.range(-80, 80), g: 600, max: 0.6 });
        break;
      }
      case 'rescue': {
        fx.spawn('fx_rays', e.x, e.y - 20, { max: 1.1, scale: 0.5, scale1: 1.1, alpha: 0.9, vr: 0.6, additive: quality().glow });
        fx.spawn(['fx_splash_0', 'fx_splash_1', 'fx_splash_2', 'fx_splash_3', 'fx_splash_4', 'fx_splash_5'], e.x, e.y + 10, { fps: 14, max: 0.45, scale: 1.6 });
        for (let i = 0; i < 10; i++) fx.spawn('p_heart', e.x, e.y - 20, { z: 10, vz: r.range(120, 280), vx: r.range(-140, 140), vy: r.range(-60, 30), g: 260, max: r.range(0.9, 1.4), scale: r.range(0.7, 1.2), drag: 1 });
        for (let i = 0; i < 12; i++) fx.spawn('p_goo_violet', e.x, e.y - 10, { z: 20, vz: r.range(150, 350), vx: r.range(-220, 220), vy: r.range(-120, 120), g: 900, max: 0.8, drag: 1.2 });
        for (let i = 0; i < 6; i++) fx.spawn(['p_sparkle_0', 'p_sparkle_1', 'p_sparkle_2'], e.x + r.range(-40, 40), e.y + r.range(-60, 10), { fps: 8, max: 0.6, scale: r.range(1, 1.6) });
        this.slowmo = 0.45;
        this.shake = Math.max(this.shake, 4);
        break;
      }
      case 'playerHit': {
        this.hurtFlash = 1; this.shake = Math.max(this.shake, 7);
        for (let i = 0; i < 8; i++) fx.spawn('p_goo_violet', e.x, e.y - 30, { z: 20, vz: r.range(100, 240), vx: r.range(-150, 150), vy: r.range(-60, 60), g: 800, max: 0.7 });
        fx.text(`-${e.dmg}`, e.x, e.y - 70, '#ffd0e8', 24, 0.8, '#6d2aa0');
        break;
      }
      case 'shieldPop': {
        fx.spawn('fx_ring', e.x, e.y - 24, { max: 0.35, scale: 0.6, scale1: 1.4, alpha: 0.9 });
        for (let i = 0; i < 8; i++) fx.spawn('p_bubble', e.x + r.range(-30, 30), e.y - 24 + r.range(-30, 30), { vx: r.range(-80, 80), vy: r.range(-80, 40), max: 0.6, scale: r.range(0.5, 0.9) });
        break;
      }
      case 'pressureFull': {
        fx.spawn('fx_ring', e.x, e.y + 4, { max: 0.4, scale: 0.4, scale1: 1.2, alpha: 0.85, ground: true });
        for (let i = 0; i < 6; i++) fx.spawn(['p_sparkle_0', 'p_sparkle_1', 'p_sparkle_2'], e.x + r.range(-30, 30), e.y - r.range(10, 60), { fps: 8, max: 0.5, vy: -60 });
        break;
      }
      case 'spit': {
        fx.spawn('p_goo_pink', e.x, e.y - 20, { z: 10, vz: 120, vx: r.range(-40, 40), g: 500, max: 0.4, scale: 0.7 });
        break;
      }
      case 'land': {
        fx.spawn('fx_softring', e.x, e.y, { max: 0.45, scale: e.r / 50, scale1: e.r / 26, ground: true, alpha: 0.9 });
        for (let i = 0; i < 10; i++) { const a = r.range(0, 6.28); fx.spawn('p_dust', e.x + Math.cos(a) * e.r * 0.6, e.y + Math.sin(a) * e.r * 0.3, { vx: Math.cos(a) * 80, vy: Math.sin(a) * 40, max: 0.5, scale: r.range(0.8, 1.3) }); }
        this.shake = Math.max(this.shake, 6);
        break;
      }
      case 'split': fx.spawn('fx_softring', e.x, e.y, { max: 0.3, scale: 0.6, scale1: 1.4, ground: true }); break;
      case 'pickup': {
        if (e.kind === 'coin') fx.spawn(['p_sparkle_0', 'p_sparkle_1', 'p_sparkle_2'], this.sim.player.x + r.range(-10, 10), this.sim.player.y - 40, { fps: 10, max: 0.3, scale: 0.6 });
        if (e.kind === 'heal') { fx.text('+HP', this.sim.player.x, this.sim.player.y - 70, '#ffb3c6', 20, 0.8); for (let i = 0; i < 4; i++) fx.spawn('p_heart', this.sim.player.x + r.range(-20, 20), this.sim.player.y - 30, { vy: -80, max: 0.7, scale: 0.6 }); }
        break;
      }
      case 'roomClear': this.winTimer = 1.3; break;
      case 'gateOpen': {
        for (let i = 0; i < 16; i++) fx.spawn('p_goo_violet', ROOM.width / 2 + r.range(-60, 60), ROOM.wall, { z: 30, vz: r.range(150, 300), vx: r.range(-200, 200), vy: r.range(-40, 120), g: 800, max: 0.8 });
        fx.spawn(['fx_splash_0', 'fx_splash_1', 'fx_splash_2', 'fx_splash_3', 'fx_splash_4', 'fx_splash_5'], ROOM.width / 2, ROOM.wall + 10, { fps: 14, max: 0.45, scale: 2 });
        break;
      }
      case 'trailPop': {
        fx.spawn('fx_ring', e.x, e.y, { max: 0.25, scale: 0.3, scale1: 0.7, alpha: 0.8, ground: true });
        for (let i = 0; i < 4; i++) fx.spawn('p_water_s', e.x, e.y, { z: 6, vz: 140, vx: r.range(-100, 100), vy: r.range(-60, 60), g: 600, max: 0.4 });
        break;
      }
      default: break;
    }
  }

  private addBloom(x: number, y: number) {
    if (x < ROOM.wall + 8 || x > ROOM.width - ROOM.wall - 8 || y < ROOM.wall + 8 || y > ROOM.height - ROOM.wall - 8) return;
    if (this.sim.world.isWaterAt(x, y)) return;
    const names = ['d_flower_0', 'd_flower_1', 'd_flower_2', 'd_flower_3', 'd_flower_4', 'd_clover'];
    const f = frame(names[this.rng.int(0, names.length - 1)]);
    if (!f) return;
    const g = this.bg.getContext('2d')!;
    g.save(); g.setTransform(this.bgScale, 0, 0, this.bgScale, 0, 0);
    drawFrame(g, f, x, y, this.rng.range(0.85, 1.2), this.rng.chance(0.5));
    g.restore();
    this.fx.spawn(['p_sparkle_0', 'p_sparkle_1', 'p_sparkle_2'], x, y - 8, { fps: 10, max: 0.3, scale: 0.6 });
  }

  // ------------------------------------------------------------------ update
  update(dt: number) {
    this.time += dt;
    this.fx.update(dt);
    const sim = this.sim; const p = sim.player;
    // monster springs
    for (const m of sim.monsters) {
      let v = this.vis.get(m.id);
      if (!m.alive) { if (v) this.vis.delete(m.id); continue; }
      if (!v) { v = { sx: 1, sy: 1, vx: 0, vy: 0, rise0: Math.max(m.rise, 0.01), seen: true }; this.vis.set(m.id, v); }
      const k = 170, c = 9;
      v.vx += (-(v.sx - 1) * k - v.vx * c) * dt; v.vy += (-(v.sy - 1) * k - v.vy * c) * dt;
      v.sx += v.vx * dt; v.sy += v.vy * dt;
      if (m.hitTime < 0.1) { v.vx += (this.rng.next() - 0.5) * 40 * dt * 10; v.vy += (this.rng.next() - 0.5) * 40 * dt * 10; }
    }
    // clean wave sweeps the remaining goo away
    if (this.cleanWave) {
      const w = this.cleanWave; w.r += dt * 1300;
      const g = this.gooCtx; g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(w.x * this.gooScale, w.y * this.gooScale, w.r * this.gooScale, 0, Math.PI * 2); g.fill(); g.restore();
      for (let i = 0; i < 3; i++) {
        const a = this.rng.range(0, 6.28); const x = w.x + Math.cos(a) * w.r, y = w.y + Math.sin(a) * w.r;
        if (x > ROOM.wall && x < ROOM.width - ROOM.wall && y > ROOM.wall && y < ROOM.height - ROOM.wall) this.fx.spawn(['p_sparkle_0', 'p_sparkle_1', 'p_sparkle_2'], x, y, { fps: 10, max: 0.35, scale: 0.9 });
      }
      if (w.r > 1500) { this.cleanWave = null; this.gooCtx.clearRect(0, 0, this.goo.width, this.goo.height); }
    }
    if (sim.gateOpen) this.gateFade = Math.max(0, this.gateFade - dt * 2.5);
    const d = Math.hypot(p.x - this.lastPX, p.y - this.lastPY); this.runDist += d; this.lastPX = p.x; this.lastPY = p.y;
    if (p.moving && d > 0 && this.rng.chance(0.12)) this.fx.spawn('p_dust', p.x - p.vx * 0.03, p.y + 4, { max: 0.35, scale: 0.6, vy: -10, ground: true });
    // impact spray at the stream ends
    for (const s of sim.segs) {
      if (s.kind === 2 || !s.hit) continue;
      if (this.rng.chance(quality().streamFx ? 0.7 : 0.35)) {
        const back = Math.atan2(s.y0 - s.y1, s.x0 - s.x1);
        const a = back + this.rng.range(-1.1, 1.1);
        this.fx.spawn('p_water_s', s.x1, s.y1, { z: 8, vz: this.rng.range(60, 200), vx: Math.cos(a) * this.rng.range(80, 220), vy: Math.sin(a) * this.rng.range(40, 140), g: 800, max: 0.4, scale: this.rng.range(0.8, 1.4) * Math.min(2, s.w / 14) });
      }
      if (this.rng.chance(0.25)) this.fx.spawn('p_mist', s.x1, s.y1, { max: 0.5, scale: 0.4 * Math.min(2.2, s.w / 12), scale1: 0.9 * Math.min(2.2, s.w / 12), alpha: 0.6, vy: -20 });
    }
    if (p.pressure >= 1 && sim.segs.length && this.rng.chance(0.3)) {
      const s = sim.segs[0]; const t = this.rng.next();
      this.fx.spawn(['p_sparkle_0', 'p_sparkle_1', 'p_sparkle_2'], s.x0 + (s.x1 - s.x0) * t, s.y0 + (s.y1 - s.y0) * t, { fps: 12, max: 0.25, scale: 0.6 });
    }
    // shake
    if (this.shake > 0 && quality().shake) {
      this.shake = Math.max(0, this.shake - dt * 40);
      this.shakeX = (this.rng.next() - 0.5) * this.shake; this.shakeY = (this.rng.next() - 0.5) * this.shake;
    } else { this.shakeX = this.shakeY = 0; this.shake = 0; }
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 2.4);
    this.winTimer = Math.max(0, this.winTimer - dt);
    this.slowmo = Math.max(0, this.slowmo - dt);
    if (!p.firing && !p.moving && (sim.state === 'fight') && p.stillTime > 0.25) this.showRange = Math.min(1, this.showRange + dt * 3);
    else this.showRange = Math.max(0, this.showRange - dt * 4);
  }

  // ------------------------------------------------------------------ render
  render(ctx: CanvasRenderingContext2D, dpr: number, viewW: number, viewH: number) {
    const sim = this.sim; const s = this.scale;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = REGION_LOOK[this.region].fill; ctx.fillRect(0, 0, viewW, viewH);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (this.offX + this.shakeX), dpr * (this.offY + this.shakeY));
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.bg, 0, 0, ROOM.width, ROOM.height);
    ctx.globalAlpha = 0.93; ctx.drawImage(this.goo, 0, 0, ROOM.width, ROOM.height); ctx.globalAlpha = 1;
    this.fx.draw(ctx, true);
    this.drawMarks(ctx);
    this.drawRangeAndPressure(ctx);
    // shadows
    const sh = frame('shadow');
    if (sh) {
      for (const m of sim.monsters) if (m.alive) {
        const k = m.rise > 0 ? 1 - m.rise / MONSTER_RULES.spawnRise : 1;
        let sx = m.x, sy = m.y + m.r * 0.55;
        if (m.kind === 'jumper' && m.state === 2) { const mm = m as Monster & { sx: number; sy: number }; void mm; }
        drawFrame(ctx, sh, sx, sy, (m.r * 2.3 * this.sim.scaleOf(m) * Math.max(0, Math.min(1, k))) / 60, false, 0, 0.9);
      }
      drawFrame(ctx, sh, sim.player.x, sim.player.y + 5, 0.85);
      for (const f of sim.followers) drawFrame(ctx, sh, f.x, f.y + 2, 0.55, false, 0, 0.8);
      for (const c of sim.cocoons) if (!c.freed) drawFrame(ctx, sh, c.x, c.y + 24, 1.1, false, 0, 0.8);
    }
    this.drawPickups(ctx);
    this.drawSorted(ctx);
    this.drawStreams(ctx);
    this.fx.draw(ctx, false);
    this.drawBullets(ctx);
    this.fx.drawTexts(ctx, this.font);
    // screen-space overlays
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const p = sim.player;
    const low = p.hp / sim.run.stats.maxHp < 0.3 && sim.state === 'fight';
    const a = Math.max(this.hurtFlash * 0.55, low ? 0.18 + Math.sin(this.time * 5) * 0.08 : 0);
    if (a > 0.01) {
      const g = ctx.createRadialGradient(viewW / 2, viewH / 2, Math.min(viewW, viewH) * 0.35, viewW / 2, viewH / 2, Math.max(viewW, viewH) * 0.7);
      g.addColorStop(0, 'rgba(170,70,220,0)'); g.addColorStop(1, `rgba(150,50,200,${a})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  private drawMarks(ctx: CanvasRenderingContext2D) {
    for (const k of this.sim.marks) {
      if (k.kind === 'land') {
        const prog = Math.max(0, Math.min(1, 1 - k.t / 0.8));
        ctx.save();
        ctx.fillStyle = `rgba(170,80,230,${0.18 + prog * 0.2})`; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(k.x, k.y, k.r, k.r * 0.62, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = `rgba(140,50,200,${0.35 + prog * 0.25})`;
        ctx.beginPath(); ctx.ellipse(k.x, k.y, k.r * prog, k.r * 0.62 * prog, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (k.kind === 'dash' && k.x2 !== undefined) {
        const pulse = 0.55 + Math.sin(this.time * 18) * 0.25;
        ctx.save(); ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(120,110,240,${0.35 * pulse + 0.15})`; ctx.lineWidth = k.r * 1.5;
        ctx.beginPath(); ctx.moveTo(k.x, k.y + 10); ctx.lineTo(k.x2, k.y2! + 10); ctx.stroke();
        ctx.setLineDash([14, 12]); ctx.lineDashOffset = -this.time * 80;
        ctx.strokeStyle = `rgba(255,255,255,${0.8 * pulse})`; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(k.x, k.y + 10); ctx.lineTo(k.x2, k.y2! + 10); ctx.stroke();
        ctx.restore();
      } else if (k.kind === 'spawn') {
        const st = this.stamps[0];
        const prog = 1 - Math.max(0, k.t - MONSTER_RULES.spawnRise) / 1.1;
        if (st) drawFrame(ctx, st, k.x, k.y + k.r * 0.5, (k.r * 1.6 * Math.max(0.2, prog)) / 112, false, this.time, 0.85);
      }
    }
  }

  private drawRangeAndPressure(ctx: CanvasRenderingContext2D) {
    const p = this.sim.player; const st = this.sim.run.stats;
    if (this.showRange > 0.01) {
      ctx.save(); ctx.globalAlpha = this.showRange * 0.55;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.setLineDash([10, 12]); ctx.lineDashOffset = -this.time * 20;
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 14, st.range, st.range, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    if (p.pressure > 0.02) {
      const full = p.pressure >= 1;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(30,60,110,0.35)'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, 30, 15, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = full ? `rgba(255,255,255,${0.85 + Math.sin(this.time * 20) * 0.15})` : '#6fd6ff';
      ctx.lineWidth = full ? 6 : 5;
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, 30, 15, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.pressure); ctx.stroke();
      if (full && quality().glow) {
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 + Math.sin(this.time * 12) * 0.1;
        draw(ctx, 'fx_glow', p.x, p.y + 2, 0.9, false, 0, 1, 1, 0.5);
      }
      ctx.restore();
    }
  }

  private drawPickups(ctx: CanvasRenderingContext2D) {
    const t = this.time;
    for (const k of this.sim.pickups) {
      if (!k.alive) continue;
      const bob = 5 + Math.sin(t * 6 + k.x) * 3;
      if (k.kind === 'coin') draw(ctx, `p_coin_${Math.floor(t * 10 + k.x) % 4}`, k.x, k.y - bob, 0.9);
      else if (k.kind === 'xp') draw(ctx, 'p_xp', k.x, k.y - bob, 0.8);
      else draw(ctx, 'p_heal', k.x, k.y - bob, 1.0);
    }
    for (const b of this.sim.bubbles) if (b.alive) draw(ctx, 'p_bubble', b.x, b.y - 8 + Math.sin(t * 4 + b.x) * 2, 0.9, false, 0, Math.min(1, b.life * 2));
  }

  private drawSorted(ctx: CanvasRenderingContext2D) {
    const sim = this.sim; const buf = this.sortBuf; buf.length = 0;
    for (const s of this.statics) buf.push({ y: s.sortY, k: 0, o: s });
    for (const m of sim.monsters) if (m.alive) buf.push({ y: m.y + m.r * 0.5, k: 1, o: m });
    for (const c of sim.cocoons) if (!c.freed) buf.push({ y: c.y + 20, k: 2, o: c });
    for (const f of sim.followers) buf.push({ y: f.y, k: 3, o: f });
    buf.push({ y: sim.player.y, k: 4, o: sim.player });
    buf.sort((a, b) => a.y - b.y);
    for (const it of buf) {
      if (it.k === 0) {
        const s = it.o as StaticSprite;
        draw(ctx, s.name, s.x, s.y, s.scale, s.flip);
        if (s.name === 'gate_posts') this.drawGate(ctx);
      } else if (it.k === 1) this.drawMonster(ctx, it.o as Monster);
      else if (it.k === 2) this.drawCocoon(ctx, it.o as RoomSim['cocoons'][number]);
      else if (it.k === 3) this.drawFollower(ctx, it.o as RoomSim['followers'][number]);
      else this.drawPlayer(ctx);
    }
  }

  private drawGate(ctx: CanvasRenderingContext2D) {
    const x = ROOM.width / 2, y = ROOM.wall + 2;
    if (this.gateFade > 0) {
      const k = this.gateFade;
      draw(ctx, 'gate_goo', x, y, 1.0 + (1 - k) * 0.2, false, 0, k, 1 + Math.sin(this.time * 3) * 0.02, k);
    } else if (this.sim.gateOpen && this.sim.state !== 'done') {
      const bob = Math.sin(this.time * 6) * 8;
      draw(ctx, 'mk_arrow', x, y + 70 + bob, 0.9, false, 0, 0.95);
    }
  }

  private drawMonster(ctx: CanvasRenderingContext2D, m: Monster) {
    const v = this.vis.get(m.id);
    let rise = 1;
    if (m.rise > 0) rise = 1 - m.rise / Math.max(MONSTER_RULES.spawnRise, v?.rise0 ?? 0.6);
    if (rise <= 0) {
      // waiting to rise: a bubbling puddle
      const st = this.stamps[1];
      if (st) drawFrame(ctx, st, m.x, m.y + m.r * 0.5, (m.r * 1.5) / 112, false, this.time * 0.5, 0.9);
      return;
    }
    rise = Math.min(1, Math.max(0, rise));
    const telegraph = m.state === 1 && (m.kind === 'spitter' || m.kind === 'dasher' || m.kind === 'chunky' || m.kind === 'nest' || m.kind === 'jumper' || m.kind === 'boss');
    const expr = m.hitTime < 0.16 ? 'hit' : telegraph ? 'charge' : 'normal';
    let name: string;
    if (m.boss) name = `m_boss_${this.region}_${expr}`;
    else if (m.kind === 'flyer') name = `m_flyer_${expr}_${Math.floor(this.time * 8 + m.id) % 2}`;
    else name = `m_${m.kind}_${expr}`;
    const sc = this.sim.scaleOf(m) * (m.r / baseR(m.kind));
    let sx = v ? v.sx : 1, sy = v ? v.sy : 1; let lift = 0;
    // squash/stretch per behaviour
    if ((m.kind === 'blob' || m.kind === 'mini') && m.state === 1) { const ph = Math.sin(Math.min(1, 1 - m.timer / MONSTER_RULES.hopMove) * Math.PI); lift = ph * 12; sy *= 1 + ph * 0.12; sx *= 1 - ph * 0.08; }
    else if (telegraph) { const k = 1 + Math.sin(this.time * 30) * 0.04; sx *= k * (m.kind === 'spitter' ? 1.12 : 1.05); sy *= (m.kind === 'jumper' ? 0.85 : 1.08) / k; }
    else { const br = Math.sin(this.time * 4 + m.id) * 0.03; sx *= 1 + br; sy *= 1 - br; }
    if (m.kind === 'jumper' && m.state === 2) { const k = 1 - Math.max(0, m.timer) / MONSTER_RULES.jumpTime; lift = Math.sin(k * Math.PI) * 120; sy *= 1.1; sx *= 0.92; }
    if (m.boss && m.state === 3) { const k = 1 - Math.max(0, m.timer) / 0.85; lift = Math.sin(k * Math.PI) * 220; }
    if (m.kind === 'flyer') lift = 34 + Math.sin(this.time * 3 + m.id) * 6;
    if (m.kind === 'dasher' && m.state === 2) { sx *= 1.18; sy *= 0.86; }
    const flip = this.sim.player.x < m.x;
    this.lift.set(m.id, lift + m.r * 0.15 * sc);
    const by = m.y + m.r * 0.6 - lift;
    const s2 = sc * (0.3 + 0.7 * rise);
    draw(ctx, name, m.x, by + (1 - rise) * 10, s2, flip, 0, rise < 1 ? 0.5 + rise * 0.5 : 1, sx, sy * (0.4 + 0.6 * rise));
    if (m.hitTime < 0.07 && quality().glow) {
      ctx.globalCompositeOperation = 'lighter';
      draw(ctx, name, m.x, by, s2, flip, 0, 0.32, sx, sy);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (m.boss) this.drawBossBar(ctx, m);
  }

  private drawBossBar(ctx: CanvasRenderingContext2D, m: Monster) {
    const w = 180, x = m.x - w / 2, y = m.y - m.r * 2.1;
    ctx.save();
    ctx.fillStyle = 'rgba(58,36,22,0.8)'; roundRect(ctx, x - 3, y - 3, w + 6, 16, 8); ctx.fill();
    ctx.fillStyle = '#e2c2ff'; roundRect(ctx, x, y, w * Math.max(0, m.hp / m.maxHp), 10, 5); ctx.fill();
    ctx.restore();
  }

  private drawCocoon(ctx: CanvasRenderingContext2D, c: RoomSim['cocoons'][number]) {
    const k = Math.max(0, c.hp / c.maxHp);
    const wob = c.hitTime < 0.15 ? Math.sin(this.time * 50) * 0.05 : 0;
    const f = Math.floor(this.time * 3 + c.id) % 2;
    const pulse = 0.5 + Math.sin(this.time * 4 + c.id) * 0.5;
    ctx.save();
    ctx.strokeStyle = `rgba(255,244,170,${0.55 + pulse * 0.4})`; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(c.x, c.y + 26, 40 + pulse * 5, 15 + pulse * 2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    if (quality().glow) { ctx.globalCompositeOperation = 'lighter'; draw(ctx, 'fx_glow', c.x, c.y + 4, 1.0 + pulse * 0.15, false, 0, 0.22 + pulse * 0.12); ctx.globalCompositeOperation = 'source-over'; }
    draw(ctx, `a_${c.species}_trapped_${f}`, c.x, c.y + 28, 1.08);
    const idx = k > 0.66 ? 0 : k > 0.33 ? 1 : 2;
    draw(ctx, `cocoon_${idx}`, c.x, c.y + 32, 0.95 + k * 0.15, false, 0, 0.4 + k * 0.5, 1 + wob, 1 - wob);
    const bob = Math.sin(this.time * 3 + c.id) * 4;
    draw(ctx, 'mk_help', c.x + 28, c.y - 52 + bob, 1.0);
  }

  private drawFollower(ctx: CanvasRenderingContext2D, f: RoomSim['followers'][number]) {
    let name: string; let lift = 0;
    const id = f.idx * 1.7;
    if (f.joy > 0 || this.winTimer > 0) { name = `a_${f.species}_happy_${Math.floor(this.time * 10 + id) % 3}`; }
    else if (f.moving) name = `a_${f.species}_walk_${Math.floor(this.time * 10 + id) % 4}`;
    else if (f.cheer > 0.4 && Math.sin(this.time * 4 + id) > 0.6) { name = `a_${f.species}_happy_${Math.floor(this.time * 10) % 3}`; }
    else name = `a_${f.species}_idle_${(Math.sin(this.time * 0.9 + id) > 0.96) ? 1 : 0}`;
    if (f.joy > 0) lift = Math.abs(Math.sin(f.joy * 9)) * 12;
    draw(ctx, name, f.x, f.y + 4 - lift, 0.88, f.facing < 0);
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const sim = this.sim; const p = sim.player; const t = this.time;
    const tier = sim.run.stats.gunTier;
    let name: string;
    const speed = Math.hypot(p.vx, p.vy);
    if (sim.state === 'dead') name = `kid_sad_${Math.floor(t * 2) % 2}`;
    else if (p.hurtTime < 0.32) name = 'kid_hurt_0';
    else if (speed > 30) name = `kid_run_${Math.floor(this.runDist / 22) % 6}`;
    else if (p.firing) name = `kid_shoot_${Math.floor(t * 10) % 2}`;
    else if (this.winTimer > 0) name = `kid_win_${Math.floor((1.3 - this.winTimer) * 8) % 4}`;
    else name = `kid_idle_${Math.floor(t * 4) % 4}`;
    const flip = p.facing < 0;
    const blink = p.invuln > 0 && p.hurtTime < 1.2 && Math.floor(t * 16) % 2 === 0;
    const alpha = blink ? 0.45 : 1;
    const S = 0.9; // sprite scale for the kid
    const dead = sim.state === 'dead';
    // backpack tank grows with the gun tier
    const pack = tier >= 5 ? 2 : tier >= 3 ? 1 : 0;
    if (!dead) draw(ctx, `pack_${pack}`, p.x - p.facing * 13 * S, p.y - 30 * S, S * (tier >= 5 ? 1.05 : 0.95), flip, 0, alpha);
    let aim = p.firing ? p.aim : (p.facing > 0 ? 0.35 : Math.PI - 0.35);
    if (!p.firing && speed > 30) aim = p.facing > 0 ? 0.15 : Math.PI - 0.15;
    if (this.winTimer > 0 && !p.firing && speed < 30) aim = p.facing > 0 ? -0.9 : Math.PI + 0.9;
    const hx = p.x + p.facing * 6 * S, hy = p.y - 22 * S;
    const left = Math.cos(aim) < 0;
    const behind = Math.sin(aim) < -0.55;
    const gunName = `gun_${tier}`;
    const gs = S * (1 + 0.04 * tier);
    if (!dead && behind) draw(ctx, gunName, hx, hy, gs, false, aim, alpha, 1, left ? -1 : 1);
    draw(ctx, name, p.x, p.y + 6, S, flip, 0, alpha);
    if (!dead && !behind) draw(ctx, gunName, hx, hy, gs, false, aim, alpha, 1, left ? -1 : 1);
    if (p.shield) draw(ctx, 'mk_shield', p.x, p.y - 26, 0.62 + Math.sin(t * 4) * 0.02, false, 0, 0.9);
    // remember the muzzle for the stream
    const [mx, my] = point(gunName, 'muzzle');
    const k = gs / 2; const myy = left ? -my : my;
    this.muzzleX = hx + (Math.cos(aim) * mx - Math.sin(aim) * myy) * k;
    this.muzzleY = hy + (Math.sin(aim) * mx + Math.cos(aim) * myy) * k;
    void GUN_TIERS;
  }

  muzzleX = 0; muzzleY = 0;
  private lift = new Map<number, number>();

  private drawStreams(ctx: CanvasRenderingContext2D) {
    const sim = this.sim; const t = this.time; const q = quality();
    const pr = sim.player.pressure;
    for (const s of sim.segs) {
      const x0 = s.kind === 2 ? s.x0 : this.muzzleX, y0 = s.kind === 2 ? s.y0 : this.muzzleY;
      let x1 = s.x1, y1 = s.y1;
      if (s.hitId >= 0) { const l = this.lift.get(s.hitId); if (l) y1 -= l * 0.8; }
      const len = Math.hypot(x1 - x0, y1 - y0); if (len < 2) continue;
      const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
      const wob = Math.sin(t * 9 + s.kind) * Math.min(6, len * 0.02);
      const cx = (x0 + x1) / 2 + nx * wob, cy = (y0 + y1) / 2 + ny * wob + len * 0.05;
      const w = s.w;
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const path = () => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); };
      if (q.glow) { path(); ctx.strokeStyle = `rgba(140,220,255,${0.22 + pr * 0.18})`; ctx.lineWidth = w * 2.1; ctx.stroke(); }
      path(); ctx.strokeStyle = 'rgba(28,98,170,0.9)'; ctx.lineWidth = w + 3; ctx.stroke();
      path(); ctx.strokeStyle = pr >= 1 ? '#8fe2ff' : '#55c2f5'; ctx.lineWidth = w; ctx.stroke();
      path(); ctx.strokeStyle = 'rgba(210,245,255,0.95)'; ctx.lineWidth = w * 0.5; ctx.stroke();
      if (q.streamFx) {
        path(); ctx.setLineDash([w * 1.4, w * 1.6]); ctx.lineDashOffset = -t * (700 + pr * 500);
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = Math.max(2, w * 0.22); ctx.stroke();
        ctx.setLineDash([]);
      }
      // nozzle puff
      if (s.kind !== 2) { ctx.fillStyle = 'rgba(235,250,255,0.9)'; ctx.beginPath(); ctx.arc(x0, y0, w * 0.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      if (s.hit) {
        const f = Math.floor(t * 20 + s.kind) % 4;
        draw(ctx, `fx_impact_${f}`, x1, y1 + 6, 0.6 + w / 22, false, Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2);
      }
    }
  }

  private drawBullets(ctx: CanvasRenderingContext2D) {
    const t = this.time;
    const sh = frame('shadow');
    const contrast = save().settings.contrast;
    for (const b of this.sim.bullets) {
      if (!b.alive) continue;
      if (sh) drawFrame(ctx, sh, b.x, b.y + 16, b.r / 30, false, 0, 0.7);
      if (contrast) {
        // high-visibility mode: a thick yellow ring with a dark edge, readable for any color vision
        ctx.lineWidth = 6; ctx.strokeStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 1.25, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 3.5; ctx.strokeStyle = '#ffe600'; ctx.stroke();
      }
      draw(ctx, `goo_drop_${Math.floor(t * 8 + b.x * 0.1) % 2}`, b.x, b.y, (b.r / 7.5) * 1.0);
    }
  }
}

function baseR(kind: string): number {
  const R: Record<string, number> = { blob: 26, mini: 17, spitter: 26, splitter: 30, dasher: 26, chunky: 44, nest: 40, jumper: 28, flyer: 22, boss: 75 };
  return R[kind] ?? 26;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
