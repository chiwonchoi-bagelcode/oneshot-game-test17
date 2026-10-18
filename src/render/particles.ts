// Pooled visual-only particles and floating texts (never affect the simulation).
import { drawFrame, frame, type Frame } from '../engine/atlas';
import { quality } from '../engine/quality';

export interface Particle {
  f: Frame | null; frames: Frame[] | null; fps: number;
  x: number; y: number; z: number; vx: number; vy: number; vz: number; g: number; drag: number;
  life: number; max: number; scale: number; scale1: number; rot: number; vr: number;
  alpha: number; fadeIn: number; additive: boolean; ground: boolean; alive: boolean; flip: boolean;
}

export interface FloatText { text: string; x: number; y: number; vy: number; life: number; max: number; color: string; size: number; alive: boolean; stroke: string }

export class Particles {
  list: Particle[] = [];
  texts: FloatText[] = [];
  private cache = new Map<string, Frame | null>();

  fr(name: string): Frame | null {
    let f = this.cache.get(name);
    if (f === undefined) { f = frame(name) ?? null; this.cache.set(name, f); }
    return f;
  }

  spawn(name: string | string[], x: number, y: number, o: Partial<Particle> = {}): Particle | null {
    const cap = quality().particles;
    let p: Particle | undefined;
    for (const q of this.list) if (!q.alive) { p = q; break; }
    if (!p) {
      if (this.list.length >= cap) return null;
      p = {} as Particle; this.list.push(p);
    }
    const frames = Array.isArray(name) ? name.map((n) => this.fr(n)).filter(Boolean) as Frame[] : null;
    Object.assign(p, {
      f: Array.isArray(name) ? frames![0] ?? null : this.fr(name), frames, fps: 12,
      x, y, z: 0, vx: 0, vy: 0, vz: 0, g: 0, drag: 0, life: 0, max: 0.6, scale: 1, scale1: 1, rot: 0, vr: 0,
      alpha: 1, fadeIn: 0, additive: false, ground: false, alive: true, flip: false,
    }, o);
    return p;
  }

  text(text: string, x: number, y: number, color = '#ffffff', size = 22, life = 0.9, stroke = '#3a2416') {
    let t = this.texts.find((q) => !q.alive);
    if (!t) { if (this.texts.length > 40) return; t = {} as FloatText; this.texts.push(t); }
    Object.assign(t, { text, x, y, vy: -60, life: 0, max: life, color, size, alive: true, stroke });
  }

  update(dt: number) {
    for (const p of this.list) {
      if (!p.alive) continue;
      p.life += dt;
      if (p.life >= p.max) { p.alive = false; continue; }
      if (p.drag) { const k = Math.max(0, 1 - p.drag * dt); p.vx *= k; p.vy *= k; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.g) { p.vz -= p.g * dt; p.z += p.vz * dt; if (p.z < 0) { p.z = 0; p.vz = -p.vz * 0.35; p.vx *= 0.6; p.vy *= 0.6; } }
      p.rot += p.vr * dt;
      if (p.frames && p.frames.length) p.f = p.frames[Math.min(p.frames.length - 1, Math.floor(p.life * p.fps))];
    }
    for (const t of this.texts) {
      if (!t.alive) continue;
      t.life += dt; t.y += t.vy * dt; t.vy *= 1 - dt * 2.5;
      if (t.life >= t.max) t.alive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D, ground: boolean) {
    for (const p of this.list) {
      if (!p.alive || p.ground !== ground || !p.f) continue;
      const k = p.life / p.max;
      let a = p.alpha * (k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1);
      if (p.fadeIn && p.life < p.fadeIn) a *= p.life / p.fadeIn;
      const s = p.scale + (p.scale1 - p.scale) * k;
      if (p.additive) { ctx.globalCompositeOperation = 'lighter'; }
      drawFrame(ctx, p.f, p.x, p.y - p.z, s, p.flip, p.rot, a);
      if (p.additive) ctx.globalCompositeOperation = 'source-over';
    }
  }

  drawTexts(ctx: CanvasRenderingContext2D, font: string) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    for (const t of this.texts) {
      if (!t.alive) continue;
      const k = t.life / t.max;
      const pop = k < 0.15 ? 0.6 + (k / 0.15) * 0.5 : k < 0.25 ? 1.1 - ((k - 0.15) / 0.1) * 0.1 : 1;
      ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      ctx.font = `${Math.round(t.size * pop)}px ${font}`;
      ctx.lineWidth = Math.max(3, t.size * 0.22); ctx.strokeStyle = t.stroke; ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  clear() { for (const p of this.list) p.alive = false; for (const t of this.texts) t.alive = false; }
  count() { let n = 0; for (const p of this.list) if (p.alive) n++; return n; }
}
