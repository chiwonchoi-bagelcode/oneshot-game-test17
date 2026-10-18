// A simple player bot. Used by the level validator (can every stage be cleared?),
// the balance simulator, and the attract/trailer capture. It plays like a person:
// it moves only to dodge or to get in range, and stops to spray otherwise.
import { ROOM, type SkillId } from '../config/balance';
import { FlowField } from './nav';
import { Rng } from './rng';
import type { RoomSim } from './room';
import type { RoomInput } from './types';

export interface BotProfile {
  name: string;
  reaction: number; // seconds between decisions
  margin: number; // extra dodge distance
  horizon: number; // how far ahead it predicts droplets
  greed: number; // chance to keep spraying through a threat at high pressure
  mistakes: number; // chance per decision to make a sloppy move
  rescue: boolean; // goes for cocoons during fights
}

export const BOT_EXPERT: BotProfile = { name: 'expert', reaction: 0.06, margin: 16, horizon: 0.7, greed: 0.0, mistakes: 0, rescue: true };
export const BOT_PLAYER: BotProfile = { name: 'player', reaction: 0.16, margin: 8, horizon: 0.5, greed: 0.25, mistakes: 0.06, rescue: true };
export const BOT_NOVICE: BotProfile = { name: 'novice', reaction: 0.26, margin: 2, horizon: 0.38, greed: 0.45, mistakes: 0.14, rescue: false };

const SKILL_PRIORITY: SkillId[] = ['thick', 'multi', 'splash', 'pierce', 'chain', 'turbo', 'vitality', 'shield', 'keep', 'range', 'speed', 'trail', 'magnet', 'heal'];

export class Bot {
  profile: BotProfile;
  rng: Rng;
  private timer = 0;
  private cur: RoomInput = { mx: 0, my: 0 };
  private nav: FlowField | null = null;
  private navSim: RoomSim | null = null;
  private navTimer = 0;
  private navTarget = { x: 0, y: 0 };
  private dodgeHold = 0;

  constructor(profile: BotProfile, seed: number) { this.profile = profile; this.rng = new Rng(seed); }

  chooseSkill(options: SkillId[], hpRatio: number): SkillId {
    if (hpRatio < 0.45 && options.includes('heal')) return 'heal';
    let best = options[0], bi = 99;
    for (const o of options) { const i = SKILL_PRIORITY.indexOf(o); if (i >= 0 && i < bi) { bi = i; best = o; } }
    return best;
  }

  decide(sim: RoomSim, dt: number): RoomInput {
    this.timer -= dt; this.dodgeHold -= dt;
    if (this.timer > 0) return this.cur;
    this.timer = this.profile.reaction * (0.8 + this.rng.next() * 0.4);
    this.cur = this.think(sim);
    return this.cur;
  }

  private threatAt(sim: RoomSim, x: number, y: number, t0: number): number {
    // returns a danger score at a hypothetical position over the next horizon
    const pr = sim.player.r; const H = this.profile.horizon; const M = this.profile.margin;
    let danger = 0;
    for (const b of sim.bullets) {
      if (!b.alive) continue;
      const rx = b.x - x, ry = b.y - (y - 6), vx = b.vx, vy = b.vy;
      const vv = vx * vx + vy * vy;
      let t = vv > 0 ? -(rx * vx + ry * vy) / vv : 0; t = Math.max(t0, Math.min(H, t));
      const cx = rx + vx * t, cy = ry + vy * t; const d = Math.hypot(cx, cy);
      const lim = b.r + pr + M;
      if (d < lim) danger += (lim - d) / lim * 2 + (1 - t / H);
    }
    for (const m of sim.monsters) {
      if (!m.alive || m.rise > 0.3) continue;
      const d = Math.hypot(m.x - x, m.y - y) - m.r * sim.scaleOf(m) - pr;
      const lim = (m.kind === 'dasher' && m.state === 2 ? 60 : 34) + M;
      if (d < lim) danger += (lim - d) / lim * 1.6;
    }
    for (const k of sim.marks) {
      if (k.kind === 'land') { const d = Math.hypot(k.x - x, k.y - y); if (d < k.r + pr + M) danger += 2.5; }
      else if (k.kind === 'dash' && k.x2 !== undefined) {
        const d = segDist(x, y, k.x, k.y, k.x2, k.y2!);
        if (d < k.r + pr + M + 6) danger += 2.2;
      }
    }
    return danger;
  }

  private think(sim: RoomSim): RoomInput {
    const p = sim.player; const P = this.profile;
    if (sim.state === 'dead' || sim.state === 'done') return { mx: 0, my: 0 };
    const danger = this.threatAt(sim, p.x, p.y, 0);
    const greedy = p.pressure > 0.7 && this.rng.next() < P.greed;
    if ((danger > 0.35 && !greedy) || this.dodgeHold > 0) {
      if (this.dodgeHold > 0 && danger <= 0.35) return this.cur;
      return this.dodge(sim);
    }
    if (this.rng.next() < P.mistakes) {
      const a = this.rng.next() * Math.PI * 2; return { mx: Math.cos(a) * 0.8, my: Math.sin(a) * 0.8 };
    }
    const range = sim.run.stats.range;
    if (sim.state === 'clear') {
      const c = sim.cocoons.find((cc) => !cc.freed);
      if (c) return this.approach(sim, c.x, c.y, range * 0.7);
      if (sim.pickupsLeft() > 0 && sim.stateTime < 1.4) return { mx: 0, my: 0 };
      if (sim.gateOpen) return this.moveTo(sim, ROOM.width / 2, ROOM.wall - 20);
      return { mx: 0, my: 0 };
    }
    // fight: is anything in range with line of sight?
    const nx = p.x, ny = p.y - 14;
    let inRange = false; let nearest: { x: number; y: number; d: number } | null = null;
    for (const m of sim.monsters) {
      if (!m.alive || m.rise > 0) continue;
      const d = Math.hypot(m.x - nx, m.y - ny) - m.r;
      if (!nearest || d < nearest.d) nearest = { x: m.x, y: m.y, d };
      if (d <= range && sim.world.lineOfSight(nx, ny, m.x, m.y)) inRange = true;
    }
    if (P.rescue) {
      const few = sim.aliveCount() <= 2;
      for (const c of sim.cocoons) {
        if (c.freed) continue;
        const d = Math.hypot(c.x - nx, c.y - ny);
        if (few && d > range * 0.8 && this.threatAt(sim, c.x, c.y + 60, 0) < 0.5) return this.approach(sim, c.x, c.y, range * 0.7);
      }
    }
    if (inRange) return { mx: 0, my: 0 };
    if (nearest) return this.approach(sim, nearest.x, nearest.y, range * 0.8);
    return { mx: 0, my: 0 };
  }

  private dodge(sim: RoomSim): RoomInput {
    const p = sim.player; const speed = sim.run.stats.moveSpeed;
    let best = { mx: 0, my: 0 }, bestScore = -1e9;
    const N = 16;
    for (let i = 0; i <= N; i++) {
      let mx = 0, my = 0;
      if (i < N) { const a = (i / N) * Math.PI * 2; mx = Math.cos(a); my = Math.sin(a); }
      const step = i < N ? 0.28 : 0;
      const x = p.x + mx * speed * step, y = p.y + my * speed * step;
      if (i < N && sim.world.overlapsSolid(x, y, p.r, true)) continue;
      let score = -this.threatAt(sim, x, y, step * 0.6) * 10;
      // prefer staying near the middle and away from walls
      score -= Math.abs(x - ROOM.width / 2) * 0.004 + Math.abs(y - ROOM.height * 0.6) * 0.002;
      if (sim.goo.at(x, y)) score -= 0.6;
      if (i === N) score += 0.5; // standing still is good if it's safe
      if (score > bestScore) { bestScore = score; best = { mx, my }; }
    }
    this.dodgeHold = 0.12;
    return best;
  }

  private approach(sim: RoomSim, tx: number, ty: number, stopDist: number): RoomInput {
    const p = sim.player;
    const d = Math.hypot(tx - p.x, ty - p.y);
    if (d < stopDist && sim.world.lineOfSight(p.x, p.y - 14, tx, ty)) return { mx: 0, my: 0 };
    return this.moveTo(sim, tx, ty);
  }

  private moveTo(sim: RoomSim, tx: number, ty: number): RoomInput {
    const p = sim.player;
    if (sim.world.lineOfSight(p.x, p.y, tx, ty) && !this.blockedLine(sim, p.x, p.y, tx, ty)) {
      const dx = tx - p.x, dy = ty - p.y; const d = Math.hypot(dx, dy) || 1;
      return { mx: dx / d, my: dy / d };
    }
    if (!this.nav || this.navSim !== sim) { this.nav = new FlowField(sim.world, p.r + 2); this.navSim = sim; this.navTimer = 0; }
    this.navTimer -= this.profile.reaction;
    if (this.navTimer <= 0 || Math.hypot(this.navTarget.x - tx, this.navTarget.y - ty) > 40) {
      this.nav.build(tx, Math.max(ROOM.wall + 24, ty)); this.navTarget = { x: tx, y: ty }; this.navTimer = 0.5;
    }
    const o = { x: 0, y: 0 };
    if (this.nav.dir(p.x, p.y, o)) return { mx: o.x, my: o.y };
    const dx = tx - p.x, dy = ty - p.y; const d = Math.hypot(dx, dy) || 1;
    return { mx: dx / d, my: dy / d };
  }

  private blockedLine(sim: RoomSim, x0: number, y0: number, x1: number, y1: number): boolean {
    const d = Math.hypot(x1 - x0, y1 - y0); const n = Math.ceil(d / 20);
    for (let i = 1; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
      if (y < ROOM.wall + sim.player.r) break;
      if (sim.world.overlapsSolid(x, y, sim.player.r - 2, true)) return true;
    }
    return false;
  }
}

function segDist(px: number, py: number, x0: number, y0: number, x1: number, y1: number): number {
  const dx = x1 - x0, dy = y1 - y0; const l2 = dx * dx + dy * dy;
  let t = l2 > 0 ? ((px - x0) * dx + (py - y0) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
}
