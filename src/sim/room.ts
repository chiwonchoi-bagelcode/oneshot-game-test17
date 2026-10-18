// One room of a run: player, goo monsters, droplets, cocoons, pickups.
// Pure logic: no DOM, deterministic with a seeded RNG, steps at a fixed dt.
import { MONSTERS, MONSTER_RULES, PLAYER, RESCUE, REWARDS, ROOM, SKILL_VALUES, type MonsterKind } from '../config/balance';
import { Rng } from './rng';
import { GooGrid } from './goo';
import { FlowField } from './nav';
import { StaticWorld, clamp, rayCircle } from './world';
import { addXp, refreshStats, runScale, type RunState } from './run';
import type {
  Bullet, Cocoon, Follower, LevelRoom, Monster, Pickup, Player, RoomInput, SimEvent, StreamSeg, TrailBubble,
} from './types';

export type RoomState = 'fight' | 'clear' | 'done' | 'dead';

const TAU = Math.PI * 2;
const GATE_X = ROOM.width / 2;

interface Target { kind: 'm' | 'c'; m?: Monster; c?: Cocoon; x: number; y: number; r: number }

export class RoomSim {
  run: RunState;
  def: LevelRoom;
  world: StaticWorld;
  goo: GooGrid;
  nav: FlowField;
  rng: Rng;
  isLast: boolean;
  player: Player;
  monsters: Monster[] = [];
  bullets: Bullet[] = [];
  cocoons: Cocoon[] = [];
  followers: Follower[] = [];
  pickups: Pickup[] = [];
  bubbles: TrailBubble[] = [];
  segs: StreamSeg[] = [];
  events: SimEvent[] = [];
  marks: { x: number; y: number; t: number; r: number; kind: 'spawn' | 'land' | 'dash'; x2?: number; y2?: number }[] = [];
  state: RoomState = 'fight';
  time = 0;
  stateTime = 0;
  gateOpen = false;
  wave = 0;
  maxWave = 0;
  waveTimer = -1;
  private nextId = 1;
  private navTimer = 0;
  private targetTimer = 0;
  private target: Target | null = null;
  private multiAim: number[] = [];
  private cleanTimer = 0;
  private trailPts: number[] = [];
  private comboTimer = 0;
  combo = 0;
  private killQueue: Monster[] = [];
  private tmp = { x: 0, y: 0 };
  hitThisRoom = false;
  cleanedCells = 0;

  constructor(run: RunState, roomIndex: number, seed: number) {
    this.run = run;
    this.def = run.level.rooms[roomIndex];
    this.isLast = roomIndex === run.level.rooms.length - 1;
    this.rng = new Rng(seed);
    this.world = new StaticWorld(this.def);
    this.goo = new GooGrid(this.def.goo);
    this.nav = new FlowField(this.world, 18);
    const st = this.def.start ?? { x: GATE_X, y: ROOM.height - ROOM.wall - 70 };
    this.player = {
      x: st.x, y: st.y, vx: 0, vy: 0, r: PLAYER.radius, hp: run.hp, invuln: 1.0,
      moving: false, stillTime: 0, firing: false, aim: -Math.PI / 2, pressure: 0, pressureFullSent: false,
      streamLen: 0, facing: 1, shield: run.shield, shieldTimer: 0, trailTimer: 0, onGoo: false, hurtTime: 99,
    };
    for (const mp of this.def.monsters) {
      const w = mp.w ?? 0;
      this.maxWave = Math.max(this.maxWave, w);
      if (w === 0) this.spawnMonster(mp.t, mp.x, mp.y, MONSTER_RULES.roomStartDelay + MONSTER_RULES.spawnRise + this.rng.range(0, 0.25), 0, 0, mp.v ?? 0);
    }
    for (const a of this.def.animals) {
      const hp = RESCUE.cocoonHp * Math.sqrt(runScale(run).hp);
      this.cocoons.push({ id: this.nextId++, species: a.s, x: a.x, y: a.y, r: RESCUE.cocoonRadius, hp, maxHp: hp, freed: false, hitTime: 99 });
    }
    // animals rescued earlier in this run walk in behind the player
    run.rescued.forEach((s, i) => {
      this.followers.push({ species: s, x: st.x + (i % 2 ? 16 : -16), y: st.y + 34 + i * 30, vx: 0, joy: 0, idx: i, moving: false, cheer: 0, facing: 1 });
    });
    for (let i = 0; i < 60; i++) this.trailPts.push(st.x, st.y + 300 - i * 5);
    this.nav.build(this.player.x, this.player.y);
  }

  // ---------------------------------------------------------------- spawning
  spawnMonster(kind: MonsterKind, x: number, y: number, rise: number, wave: number, parent = 0, variant = 0): Monster {
    const base = MONSTERS[kind];
    const sc = runScale(this.run); const mods = this.run.mods;
    const big = mods.bigMonsters && kind !== 'boss' ? 1.35 : 1;
    const hp = base.hp * sc.hp * mods.monsterHp * (big > 1 ? 1.6 : 1);
    const m: Monster = {
      id: this.nextId++, kind, x, y, vx: 0, vy: 0, r: base.r * big, hp, maxHp: hp,
      speed: base.speed * sc.speed * mods.monsterSpeed * (big > 1 ? 0.8 : 1), contact: base.contact * sc.dmg * mods.monsterDmg,
      state: 0, timer: this.rng.range(0, 0.4), cd: (base.cooldown ?? 2) * this.rng.range(0.5, 1.0) / sc.tempo,
      rise, tx: x, ty: y, alive: true, boss: kind === 'boss', parent, hitTime: 99, phase: 0, pattern: 0,
      airborne: kind === 'flyer', wave, variant,
    };
    this.monsters.push(m);
    return m;
  }

  private spawnWave(w: number) {
    for (const mp of this.def.monsters) if ((mp.w ?? 0) === w) {
      this.spawnMonster(mp.t, mp.x, mp.y, MONSTER_RULES.spawnRise, w, 0, mp.v ?? 0);
    }
  }

  private emit(e: SimEvent) { this.events.push(e); }

  drain(): SimEvent[] { const e = this.events; this.events = []; return e; }

  aliveCount(): number { let n = 0; for (const m of this.monsters) if (m.alive) n++; return n; }

  // ---------------------------------------------------------------- main step
  step(dt: number, input: RoomInput) {
    this.time += dt; this.stateTime += dt;
    if (this.state === 'dead') { this.updatePickups(dt); return; }
    this.updatePlayer(dt, input);
    this.navTimer -= dt;
    if (this.navTimer <= 0) { this.nav.build(this.player.x, this.player.y); this.navTimer = 0.2; }
    this.updateMonsters(dt);
    this.updateBullets(dt);
    this.updateStream(dt);
    this.processKills();
    this.updateTrail(dt);
    this.updatePickups(dt);
    this.updateFollowers(dt);
    this.updateMarks(dt);
    this.updateFlow(dt);
    this.comboTimer -= dt;
    if (this.comboTimer <= 0) this.combo = 0;
    this.run.time += dt;
  }

  // ---------------------------------------------------------------- player
  private updatePlayer(dt: number, input: RoomInput) {
    const p = this.player; const s = this.run.stats;
    const mag = Math.hypot(input.mx, input.my);
    const wasMoving = p.moving;
    p.moving = mag > 0.05;
    p.onGoo = this.goo.at(p.x, p.y + 8);
    const speed = s.moveSpeed * (p.onGoo ? s.gooSlow : 1) * Math.min(1, mag);
    const tvx = p.moving ? (input.mx / mag) * speed : 0, tvy = p.moving ? (input.my / mag) * speed : 0;
    const dvx = tvx - p.vx, dvy = tvy - p.vy; const dl = Math.hypot(dvx, dvy);
    const maxDv = PLAYER.accel * dt;
    if (dl <= maxDv) { p.vx = tvx; p.vy = tvy; } else { p.vx += (dvx / dl) * maxDv; p.vy += (dvy / dl) * maxDv; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    // the open gate lets the player walk out through the top wall
    if (this.gateOpen && Math.abs(p.x - GATE_X) < ROOM.gateWidth / 2 && p.y < ROOM.wall + p.r + 4) {
      this.state = 'done'; this.emit({ t: 'exit' });
    }
    this.world.resolve(p, p.r, true);
    if (Math.abs(p.vx) > 12) p.facing = p.vx > 0 ? 1 : -1;
    p.invuln = Math.max(0, p.invuln - dt);
    p.hurtTime += dt;
    if (p.moving) {
      p.stillTime = 0;
      p.pressure = Math.max(0, p.pressure - s.pressureDrain * dt);
      if (p.pressure < 0.95) p.pressureFullSent = false;
      if (p.firing) { p.firing = false; p.streamLen = 0; this.emit({ t: 'fireStop' }); }
      // trail of rescued friends
      const lx = this.trailPts[this.trailPts.length - 2], ly = this.trailPts[this.trailPts.length - 1];
      if (Math.hypot(p.x - lx, p.y - ly) > 6) {
        this.trailPts.push(p.x, p.y);
        if (this.trailPts.length > 800) this.trailPts.splice(0, 2);
      }
    } else {
      p.stillTime += dt;
    }
    void wasMoving;
    if (s.shieldRegen > 0 && !p.shield) {
      p.shieldTimer += dt;
      if (p.shieldTimer >= s.shieldRegen) { p.shield = true; p.shieldTimer = 0; this.emit({ t: 'shieldUp' }); }
    }
    if (s.trail > 0 && p.moving && this.state === 'fight') {
      p.trailTimer -= dt;
      if (p.trailTimer <= 0) { p.trailTimer = SKILL_VALUES.trailEvery; this.bubbles.push({ x: p.x, y: p.y + 6, life: 2.2, alive: true }); }
    }
  }

  hurtPlayer(dmg: number, src: MonsterKind, fx: number, fy: number) {
    const p = this.player;
    if (p.invuln > 0 || this.state === 'dead' || this.state === 'done') return;
    if (p.shield) {
      p.shield = false; p.shieldTimer = 0; p.invuln = 0.6;
      this.emit({ t: 'shieldPop', x: p.x, y: p.y });
      return;
    }
    const d = Math.max(1, Math.round(dmg * this.run.stats.armor));
    p.hp -= d; p.invuln = this.run.stats.invuln; p.hurtTime = 0;
    p.pressure *= PLAYER.pressureKeepOnHit; p.pressureFullSent = false;
    this.run.hits++; this.hitThisRoom = true;
    this.run.dmgBy[src] = (this.run.dmgBy[src] || 0) + d;
    // small knockback away from the source so the hit reads clearly
    const dx = p.x - fx, dy = p.y - fy; const l = Math.hypot(dx, dy) || 1;
    p.vx += (dx / l) * 160; p.vy += (dy / l) * 160;
    this.emit({ t: 'playerHit', dmg: d, src, x: p.x, y: p.y });
    if (p.hp <= 0) {
      p.hp = 0; this.state = 'dead'; this.stateTime = 0;
      p.firing = false; p.streamLen = 0; this.segs.length = 0;
      this.emit({ t: 'dead' });
    }
  }

  revive(frac: number) {
    const p = this.player;
    p.hp = Math.max(1, Math.round(this.run.stats.maxHp * frac)); p.invuln = 2.2;
    this.state = this.aliveCount() > 0 || this.waveTimer >= 0 || this.wave < this.maxWave ? 'fight' : 'clear';
    this.stateTime = 0;
    for (const b of this.bullets) b.alive = false;
    for (const m of this.monsters) {
      if (!m.alive) continue;
      const dx = m.x - p.x, dy = m.y - p.y; const d = Math.hypot(dx, dy) || 1;
      if (d < 220) { m.x += (dx / d) * (220 - d); m.y += (dy / d) * (220 - d); this.world.resolve(m, m.r, !m.airborne, m.airborne); }
      if (m.state !== 0 && m.kind !== 'boss') { m.state = 0; m.cd = 1.5; }
    }
  }

  // ---------------------------------------------------------------- targeting + stream
  private candidates(): Target[] {
    const out: Target[] = [];
    for (const m of this.monsters) {
      if (!m.alive || m.rise > 0 || (m.kind === 'jumper' && m.state === 2) || (m.boss && m.state === 3)) continue;
      out.push({ kind: 'm', m, x: m.x, y: m.y, r: m.r * this.scaleOf(m) });
    }
    for (const c of this.cocoons) if (!c.freed) out.push({ kind: 'c', c, x: c.x, y: c.y, r: c.r });
    return out;
  }

  scaleOf(m: Monster): number { return MONSTER_RULES.minScale + (1 - MONSTER_RULES.minScale) * (m.hp / m.maxHp); }

  private pickTargets(): Target[] {
    const p = this.player; const range = this.run.stats.range;
    const nx = p.x, ny = p.y - 14;
    const list = this.candidates()
      .map((t) => ({ t, d: Math.hypot(t.x - nx, t.y - ny) - t.r }))
      .filter((o) => o.d <= range)
      .map((o) => ({ ...o, los: this.world.lineOfSight(nx, ny, o.t.x, o.t.y) }));
    list.sort((a, b) => (a.los === b.los ? a.d - b.d : a.los ? -1 : 1));
    // sticky main target to avoid flicker
    if (this.target && list.length) {
      const cur = list.find((o) => (o.t.m && o.t.m === this.target!.m) || (o.t.c && o.t.c === this.target!.c));
      if (cur && cur.los === list[0].los && cur.d < list[0].d * 1.25 + 20) { list.splice(list.indexOf(cur), 1); list.unshift(cur); }
    }
    return list.map((o) => o.t);
  }

  private updateStream(dt: number) {
    const p = this.player; const s = this.run.stats;
    this.segs.length = 0;
    const canFire = !p.moving && p.stillTime >= PLAYER.fireDelay && (this.state === 'fight' || this.state === 'clear');
    if (!canFire) { if (p.firing) { p.firing = false; this.emit({ t: 'fireStop' }); } p.streamLen = 0; return; }
    this.targetTimer -= dt;
    let targets: Target[] | null = null;
    if (this.targetTimer <= 0 || !this.targetValid()) {
      targets = this.pickTargets(); this.targetTimer = 0.12;
      this.target = targets[0] ?? null;
    }
    if (!this.target) {
      if (p.firing) { p.firing = false; this.emit({ t: 'fireStop' }); }
      p.streamLen = 0; p.pressure = Math.max(0, p.pressure - dt * 0.6);
      return;
    }
    const nx = p.x, ny = p.y - 14;
    const tgt = this.target;
    const want = Math.atan2(tgt.y - ny, tgt.x - nx);
    if (!p.firing) { p.firing = true; p.aim = want; p.streamLen = 0; this.emit({ t: 'fireStart' }); }
    p.aim = turnToward(p.aim, want, PLAYER.aimTurnRate * dt);
    p.facing = Math.cos(p.aim) >= 0 ? 1 : -1;
    p.streamLen = Math.min(s.range + 40, p.streamLen + PLAYER.streamSpeed * dt);
    // pressure builds while standing and spraying
    p.pressure = Math.min(1, p.pressure + dt / s.pressureCharge);
    if (p.pressure >= 1 && !p.pressureFullSent) {
      p.pressureFullSent = true; this.run.pressureFulls++;
      this.emit({ t: 'pressureFull', x: p.x, y: p.y });
    }
    const pressMul = 1 + (s.pressureMax - 1) * Math.pow(p.pressure, 1.4);
    const dps = s.dps * pressMul;
    const width = s.width * (1 + PLAYER.pressureWidth * p.pressure);
    const ox = nx + Math.cos(p.aim) * 26, oy = ny + Math.sin(p.aim) * 26;
    const main = this.castStream(ox, oy, p.aim, Math.min(p.streamLen, s.range + 30), dps * dt, width, 0, s.pierce);
    // chain jumps from the first monster hit
    if (s.chain > 0 && main) {
      let from = main; const hitSet = new Set<Monster>([main]);
      for (let k = 0; k < s.chain; k++) {
        let best: Monster | null = null, bd = SKILL_VALUES.chainRange;
        for (const m of this.monsters) {
          if (!m.alive || m.rise > 0 || hitSet.has(m)) continue;
          const d = Math.hypot(m.x - from.x, m.y - from.y);
          if (d < bd) { bd = d; best = m; }
        }
        if (!best) break;
        hitSet.add(best);
        this.damageMonster(best, dps * dt * SKILL_VALUES.chainDmg);
        this.segs.push({ x0: from.x, y0: from.y, x1: best.x, y1: best.y, w: width * 0.55, kind: 2, hit: true, hitId: best.id });
        from = best;
      }
    }
    // extra streams toward other targets
    if (s.multi > 0) {
      if (!targets) targets = this.pickTargets();
      const others = targets.filter((t) => !(t.m && t.m === tgt.m) && !(t.c && t.c === tgt.c));
      for (let k = 0; k < s.multi; k++) {
        const t = others[k];
        if (!t) { this.multiAim[k] = p.aim; continue; }
        const w2 = Math.atan2(t.y - ny, t.x - nx);
        this.multiAim[k] = turnToward(this.multiAim[k] ?? p.aim, w2, PLAYER.aimTurnRate * dt);
        this.castStream(ox, oy, this.multiAim[k], Math.min(p.streamLen, s.range + 30), dps * dt * SKILL_VALUES.multiDmg, width * 0.7, 1, 0);
      }
    }
    // cleaning the ground along the stream
    this.cleanTimer -= dt;
    if (this.cleanTimer <= 0) {
      this.cleanTimer = 0.05;
      for (const seg of this.segs) {
        if (seg.kind === 2) continue;
        const len = Math.hypot(seg.x1 - seg.x0, seg.y1 - seg.y0);
        const rr = Math.max(10, seg.w * PLAYER.streamClean);
        for (let d = 30; d < len; d += 26) {
          const x = seg.x0 + ((seg.x1 - seg.x0) * d) / len, y = seg.y0 + ((seg.y1 - seg.y0) * d) / len;
          const n = this.goo.clean(x, y, rr);
          if (n > 0) { this.cleanedCells += n; this.emit({ t: 'clean', x, y, r: rr * 1.15 }); }
        }
        const ir = PLAYER.impactClean + seg.w * 1.2;
        this.cleanedCells += this.goo.clean(seg.x1, seg.y1, ir);
        this.emit({ t: 'clean', x: seg.x1, y: seg.y1, r: ir * 1.1 });
      }
    }
  }

  private targetValid(): boolean {
    const t = this.target; if (!t) return false;
    if (t.m) return t.m.alive && t.m.rise <= 0;
    if (t.c) return !t.c.freed;
    return false;
  }

  // Ray-casts one stream, applies damage, appends render segments. Returns first monster hit.
  private castStream(ox: number, oy: number, ang: number, len: number, dmg: number, width: number, kind: 0 | 1, pierce: number): Monster | null {
    const dx = Math.cos(ang), dy = Math.sin(ang);
    const block = this.world.rayBlock(ox, oy, dx, dy, len);
    const hits: { d: number; m?: Monster; c?: Cocoon; r: number }[] = [];
    for (const m of this.monsters) {
      if (!m.alive || m.rise > 0 || (m.kind === 'jumper' && m.state === 2) || (m.boss && m.state === 3)) continue;
      const r = m.r * this.scaleOf(m) + width * 0.3;
      const d = rayCircle(ox, oy, dx, dy, m.x, m.y, r);
      if (d >= 0 && d <= block) hits.push({ d, m, r });
    }
    for (const c of this.cocoons) {
      if (c.freed) continue;
      const d = rayCircle(ox, oy, dx, dy, c.x, c.y, c.r + width * 0.3);
      if (d >= 0 && d <= block) hits.push({ d, c, r: c.r });
    }
    hits.sort((a, b) => a.d - b.d);
    let first: Monster | null = null;
    let endD = block; let hitAny = false; let lastId = -1;
    const maxHits = 1 + pierce;
    for (let i = 0; i < hits.length && i < maxHits; i++) {
      const h = hits[i];
      const mul = i === 0 ? 1 : SKILL_VALUES.pierceDmg;
      if (h.m) { this.damageMonster(h.m, dmg * mul); if (!first) first = h.m; }
      if (h.c) this.damageCocoon(h.c, dmg * mul);
      hitAny = true; lastId = h.m ? h.m.id : -1;
      endD = h.d + h.r * 0.6;
      if (i === maxHits - 1 || i === hits.length - 1) {
        if (pierce > 0 && i < maxHits - 1) endD = block; // pierced everything in reach: keep flowing
      }
    }
    if (pierce > 0 && hitAny && hits.length < maxHits) endD = block;
    this.segs.push({ x0: ox, y0: oy, x1: ox + dx * endD, y1: oy + dy * endD, w: width, kind, hit: hitAny || endD < len - 2, hitId: pierce > 0 && endD >= block ? -1 : lastId });
    return first;
  }

  damageMonster(m: Monster, dmg: number) {
    if (!m.alive) return;
    m.hp -= dmg;
    if (m.hitTime > 0.09) this.emit({ t: 'hit', id: m.id, x: m.x, y: m.y, kind: m.kind });
    m.hitTime = 0;
    if (m.boss && m.phase === 0 && m.hp < m.maxHp * 0.5) { m.phase = 1; this.emit({ t: 'bossPhase', phase: 1 }); }
    if (m.hp <= 0) { m.alive = false; this.killQueue.push(m); }
  }

  private damageCocoon(c: Cocoon, dmg: number) {
    if (c.freed) return;
    c.hp -= dmg;
    if (c.hitTime > 0.12) this.emit({ t: 'cocoonHit', id: c.id, x: c.x, y: c.y });
    c.hitTime = 0;
    if (c.hp <= 0) this.freeCocoon(c);
  }

  private freeCocoon(c: Cocoon) {
    c.freed = true;
    const run = this.run;
    const brave = this.aliveCount() > 0;
    const first = !run.known.includes(c.species) && !run.rescued.includes(c.species);
    run.rescued.push(c.species);
    const idx = this.followers.length;
    this.followers.push({ species: c.species, x: c.x, y: c.y, vx: 0, joy: 1.1, idx, moving: false, cheer: 0, facing: 1 });
    const healed = refreshStats(run).rescueHeal;
    this.player.hp = Math.min(run.stats.maxHp, this.player.hp + run.stats.maxHp * healed);
    const sc = runScale(run);
    this.dropCoins(c.x, c.y, Math.round((RESCUE.rescueCoins + (brave ? RESCUE.braveRescueCoins : 0)) * sc.coin * run.stats.coinMult * run.mods.coinMul));
    this.dropXp(c.x, c.y, RESCUE.rescueXp);
    this.goo.clean(c.x, c.y, 70);
    this.emit({ t: 'clean', x: c.x, y: c.y, r: 80 });
    this.emit({ t: 'rescue', species: c.species, x: c.x, y: c.y, brave, first });
  }

  private processKills() {
    let guard = 0;
    while (this.killQueue.length && guard++ < 200) {
      const m = this.killQueue.shift()!;
      this.onKilled(m);
    }
  }

  private onKilled(m: Monster) {
    const run = this.run; const s = run.stats; const sc = runScale(run);
    run.washed++;
    this.combo = this.comboTimer > 0 ? this.combo + 1 : 1;
    this.comboTimer = 2.2;
    run.bestCombo = Math.max(run.bestCombo, this.combo);
    const r = m.r;
    this.emit({ t: 'burst', x: m.x, y: m.y, r, kind: m.kind, boss: m.boss, combo: this.combo });
    // splash damage around the washed monster can wash its friends too
    const br = s.burstRadius * (m.r > 40 ? 1.3 : 1);
    for (const o of this.monsters) {
      if (!o.alive || o === m || o.rise > 0) continue;
      const d = Math.hypot(o.x - m.x, o.y - m.y) - o.r;
      if (d < br) this.damageMonster(o, s.dps * s.burstDmg);
    }
    const cr = s.burstClean * (m.r > 40 ? 1.5 : 1) * (m.boss ? 2 : 1);
    this.cleanedCells += this.goo.clean(m.x, m.y, cr);
    this.emit({ t: 'clean', x: m.x, y: m.y, r: cr * 1.1 });
    const base = MONSTERS[m.kind];
    const coinBonus = this.combo >= 3 ? 1 : 0;
    this.dropCoins(m.x, m.y, Math.max(1, Math.round((base.coins + coinBonus) * sc.coin * s.coinMult * run.mods.coinMul)));
    this.dropXp(m.x, m.y, base.xp);
    if (this.rng.chance(REWARDS.healDropChance) && !m.parent) this.pickups.push(this.makePickup('heal', m.x, m.y, REWARDS.healDropAmount));
    if (m.kind === 'splitter') {
      this.emit({ t: 'split', x: m.x, y: m.y });
      for (const sgn of [-1, 1]) {
        const c = this.spawnMonster('mini', m.x + sgn * 20, m.y, 0.18, m.wave, m.id);
        c.vx = sgn * 220; c.vy = -60;
      }
    }
  }

  private makePickup(kind: Pickup['kind'], x: number, y: number, value: number): Pickup {
    const a = this.rng.range(0, TAU), sp = this.rng.range(90, 220);
    return { kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, value, magnet: false, age: 0, alive: true };
  }

  private dropCoins(x: number, y: number, total: number) {
    const n = Math.min(6, Math.max(1, Math.ceil(total / 3)));
    let left = total;
    for (let i = 0; i < n; i++) {
      const v = i === n - 1 ? left : Math.floor(total / n); left -= v;
      if (v > 0) this.pickups.push(this.makePickup('coin', x, y, v));
    }
  }

  private dropXp(x: number, y: number, total: number) {
    const n = Math.min(5, Math.max(1, Math.round(total)));
    for (let i = 0; i < n; i++) this.pickups.push(this.makePickup('xp', x, y, total / n));
  }

  // ---------------------------------------------------------------- monsters
  private updateMonsters(dt: number) {
    const p = this.player;
    for (const m of this.monsters) {
      if (!m.alive) continue;
      m.hitTime += dt;
      if (m.rise > 0) { m.rise -= dt; continue; }
      switch (m.kind) {
        case 'blob': case 'mini': this.hopChase(m, dt); break;
        case 'splitter': this.walkChase(m, dt, 1); break;
        case 'spitter': this.spitter(m, dt); break;
        case 'dasher': this.dasher(m, dt); break;
        case 'chunky': this.chunky(m, dt); break;
        case 'nest': this.nest(m, dt); break;
        case 'jumper': this.jumper(m, dt); break;
        case 'flyer': this.flyer(m, dt); break;
        case 'boss': this.boss(m, dt); break;
      }
      // being washed slows monsters down a little: it reads as "pushed back"
      const slow = m.hitTime < 0.1 && !m.boss ? 0.55 : 1;
      m.x += m.vx * dt * slow; m.y += m.vy * dt * slow;
      if (!(m.kind === 'jumper' && m.state === 2) && !(m.boss && m.state === 3)) this.world.resolve(m, m.r * 0.9, !m.airborne, m.airborne);
      // contact damage
      if (this.state === 'fight' && !(m.kind === 'jumper' && m.state === 2) && !(m.boss && m.state === 3)) {
        const rr = m.r * this.scaleOf(m) * 0.85 + p.r;
        const dx = p.x - m.x, dy = p.y - m.y;
        if (dx * dx + dy * dy < rr * rr) this.hurtPlayer(m.contact, m.kind, m.x, m.y);
      }
    }
    // keep monsters from stacking on one spot
    const ms = this.monsters;
    for (let i = 0; i < ms.length; i++) {
      const a = ms[i]; if (!a.alive || a.rise > 0) continue;
      const fa = a.boss || a.kind === 'nest';
      for (let j = i + 1; j < ms.length; j++) {
        const b = ms[j]; if (!b.alive || b.rise > 0) continue;
        const fb = b.boss || b.kind === 'nest';
        if (fa && fb) continue;
        const dx = b.x - a.x, dy = b.y - a.y; const rr = (a.r + b.r) * 0.8;
        const d2 = dx * dx + dy * dy;
        if (d2 < rr * rr && d2 > 0.01) {
          const d = Math.sqrt(d2); const push = rr - d;
          const ka = fa ? 0 : fb ? 1 : 0.5, kb = 1 - ka;
          a.x -= (dx / d) * push * ka; a.y -= (dy / d) * push * ka;
          b.x += (dx / d) * push * kb; b.y += (dy / d) * push * kb;
        }
      }
    }
  }

  private seekDir(m: Monster): { x: number; y: number } {
    const p = this.player; const o = this.tmp;
    const dx = p.x - m.x, dy = p.y - m.y; const d = Math.hypot(dx, dy) || 1;
    if (d < 140 || m.airborne || this.world.lineOfSight(m.x, m.y, p.x, p.y)) { o.x = dx / d; o.y = dy / d; return o; }
    if (!this.nav.dir(m.x, m.y, o)) { o.x = dx / d; o.y = dy / d; }
    return o;
  }

  private hopChase(m: Monster, dt: number) {
    m.timer -= dt;
    if (m.state === 0) {
      m.vx *= 0.8; m.vy *= 0.8;
      if (m.timer <= 0) { m.state = 1; m.timer = MONSTER_RULES.hopMove; }
    } else {
      const dir = this.seekDir(m);
      const sp = m.speed * 1.75;
      m.vx = dir.x * sp; m.vy = dir.y * sp;
      if (m.timer <= 0) { m.state = 0; m.timer = MONSTER_RULES.hopRest * this.rng.range(0.8, 1.3); }
    }
  }

  private walkChase(m: Monster, dt: number, mul: number) {
    const dir = this.seekDir(m);
    m.vx += (dir.x * m.speed * mul - m.vx) * Math.min(1, dt * 4);
    m.vy += (dir.y * m.speed * mul - m.vy) * Math.min(1, dt * 4);
  }

  private fireBullet(m: Monster, ang: number, speedMul = 1) {
    const base = MONSTERS[m.kind]; const sc = runScale(this.run);
    const sp = (base.bulletSpeed ?? 200) * speedMul * this.run.mods.bulletSpeed * sc.bullet;
    const r = base.bulletR ?? 13;
    this.bullets.push({
      x: m.x + Math.cos(ang) * (m.r * 0.8), y: m.y + Math.sin(ang) * (m.r * 0.8) - 6,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r, dmg: (base.bulletDmg ?? 12) * sc.dmg * this.run.mods.monsterDmg,
      life: 6, src: m.kind, alive: true,
    });
  }

  private aimAt(m: Monster): number { return Math.atan2(this.player.y - m.y, this.player.x - m.x); }

  private spitter(m: Monster, dt: number) {
    const p = this.player; const base = MONSTERS.spitter;
    const d = Math.hypot(p.x - m.x, p.y - m.y);
    if (m.state === 0) {
      // keep a comfortable distance
      let want = 0; if (d < 210) want = -1; else if (d > 400) want = 1;
      const dir = want === 1 ? this.seekDir(m) : { x: (p.x - m.x) / (d || 1), y: (p.y - m.y) / (d || 1) };
      m.vx += (dir.x * m.speed * want - m.vx) * Math.min(1, dt * 3);
      m.vy += (dir.y * m.speed * want - m.vy) * Math.min(1, dt * 3);
      m.cd -= dt;
      if (m.cd <= 0 && d < 560 && this.world.lineOfSight(m.x, m.y, p.x, p.y) && this.state === 'fight') {
        m.state = 1; m.timer = base.telegraph!; m.vx = 0; m.vy = 0;
        this.emit({ t: 'telegraph', id: m.id, kind: m.kind });
      }
    } else if (m.state === 1) {
      m.vx = 0; m.vy = 0; m.timer -= dt;
      if (m.timer <= 0) {
        const a = this.aimAt(m);
        if (m.variant === 1) { this.fireBullet(m, a - 0.26); this.fireBullet(m, a); this.fireBullet(m, a + 0.26); }
        else this.fireBullet(m, a);
        this.emit({ t: 'spit', x: m.x, y: m.y, kind: m.kind });
        m.state = 0; m.cd = (base.cooldown! * this.rng.range(0.85, 1.15)) / runScale(this.run).tempo;
      }
    }
  }

  private dasher(m: Monster, dt: number) {
    const p = this.player; const base = MONSTERS.dasher;
    const d = Math.hypot(p.x - m.x, p.y - m.y);
    if (m.state === 0) {
      this.walkChase(m, dt, 1);
      m.cd -= dt;
      if (m.cd <= 0 && d < 380 && this.world.lineOfSight(m.x, m.y, p.x, p.y) && this.state === 'fight') {
        m.state = 1; m.timer = base.telegraph!;
        const a = this.aimAt(m); m.tx = Math.cos(a); m.ty = Math.sin(a);
        this.marks.push({ kind: 'dash', x: m.x, y: m.y, x2: m.x + m.tx * MONSTER_RULES.dashSpeed * MONSTER_RULES.dashTime, y2: m.y + m.ty * MONSTER_RULES.dashSpeed * MONSTER_RULES.dashTime, t: base.telegraph!, r: m.r });
        this.emit({ t: 'telegraph', id: m.id, kind: m.kind });
      }
    } else if (m.state === 1) {
      m.vx *= 0.7; m.vy *= 0.7; m.timer -= dt;
      if (m.timer <= 0) { m.state = 2; m.timer = MONSTER_RULES.dashTime; this.emit({ t: 'dash', id: m.id }); }
    } else if (m.state === 2) {
      m.vx = m.tx * MONSTER_RULES.dashSpeed * this.run.mods.monsterSpeed; m.vy = m.ty * MONSTER_RULES.dashSpeed * this.run.mods.monsterSpeed;
      m.timer -= dt;
      const nx = m.x + m.vx * dt, ny = m.y + m.vy * dt;
      if (m.timer <= 0 || this.world.overlapsSolid(nx, ny, m.r * 0.9, true)) { m.state = 3; m.timer = base.cooldown!; m.vx *= 0.2; m.vy *= 0.2; }
    } else {
      m.vx *= 0.85; m.vy *= 0.85; m.timer -= dt;
      if (m.timer <= 0) { m.state = 0; m.cd = 0.6 + this.rng.range(0, 0.6); }
    }
  }

  private chunky(m: Monster, dt: number) {
    const base = MONSTERS.chunky;
    if (m.state === 0) {
      this.walkChase(m, dt, 1);
      m.cd -= dt;
      if (m.cd <= 0 && this.state === 'fight') { m.state = 1; m.timer = base.telegraph!; this.emit({ t: 'telegraph', id: m.id, kind: m.kind }); }
    } else {
      m.vx *= 0.8; m.vy *= 0.8; m.timer -= dt;
      if (m.timer <= 0) {
        const n = m.variant === 1 ? 12 : MONSTER_RULES.chunkyRing;
        const off = this.rng.range(0, TAU);
        for (let i = 0; i < n; i++) this.fireBullet(m, off + (i / n) * TAU, 0.9);
        this.emit({ t: 'spit', x: m.x, y: m.y, kind: m.kind });
        m.state = 0; m.cd = (base.cooldown! * this.rng.range(0.9, 1.1)) / runScale(this.run).tempo;
      }
    }
  }

  private nest(m: Monster, dt: number) {
    const base = MONSTERS.nest;
    m.vx = 0; m.vy = 0;
    const children = this.monsters.filter((o) => o.alive && o.parent === m.id).length;
    if (m.state === 0) {
      m.cd -= dt;
      if (m.cd <= 0 && children < MONSTER_RULES.nestMaxChildren && this.state === 'fight') { m.state = 1; m.timer = base.telegraph!; this.emit({ t: 'telegraph', id: m.id, kind: m.kind }); }
    } else {
      m.timer -= dt;
      if (m.timer <= 0) {
        const a = this.rng.range(0, TAU);
        const x = clamp(m.x + Math.cos(a) * (m.r + 30), 80, ROOM.width - 80), y = clamp(m.y + Math.sin(a) * (m.r + 30), 80, ROOM.height - 80);
        this.spawnMonster('blob', x, y, 0.35, m.wave, m.id);
        this.emit({ t: 'spawn', id: m.id, kind: 'blob' });
        m.state = 0; m.cd = base.cooldown!;
      }
    }
  }

  private jumper(m: Monster, dt: number) {
    const p = this.player; const base = MONSTERS.jumper;
    if (m.state === 0) {
      this.walkChase(m, dt, 1);
      m.cd -= dt;
      const d = Math.hypot(p.x - m.x, p.y - m.y);
      if (m.cd <= 0 && d < 460 && this.state === 'fight') {
        m.state = 1; m.timer = base.telegraph!;
        m.tx = p.x; m.ty = p.y;
        this.emit({ t: 'telegraph', id: m.id, kind: m.kind });
      }
    } else if (m.state === 1) {
      // crouch, landing spot locks at the end of the crouch
      m.vx = 0; m.vy = 0; m.timer -= dt;
      if (m.timer <= 0) {
        m.tx = clamp(p.x, ROOM.wall + m.r, ROOM.width - ROOM.wall - m.r); m.ty = clamp(p.y, ROOM.wall + m.r, ROOM.height - ROOM.wall - m.r);
        m.state = 2; m.timer = MONSTER_RULES.jumpTime;
        (m as Monster & { sx?: number; sy?: number }).sx = m.x; (m as Monster & { sy?: number }).sy = m.y;
        this.marks.push({ kind: 'land', x: m.tx, y: m.ty, t: MONSTER_RULES.jumpTime, r: MONSTER_RULES.jumpShock });
      }
    } else if (m.state === 2) {
      m.timer -= dt;
      const mm = m as Monster & { sx: number; sy: number };
      const k = 1 - Math.max(0, m.timer) / MONSTER_RULES.jumpTime;
      m.vx = 0; m.vy = 0;
      m.x = mm.sx + (m.tx - mm.sx) * k; m.y = mm.sy + (m.ty - mm.sy) * k;
      if (m.timer <= 0) {
        m.state = 3; m.timer = 0.5;
        this.world.resolve(m, m.r * 0.9, true);
        this.emit({ t: 'land', x: m.x, y: m.y, r: MONSTER_RULES.jumpShock });
        const d = Math.hypot(p.x - m.x, p.y - m.y);
        if (d < MONSTER_RULES.jumpShock + p.r && this.state === 'fight') this.hurtPlayer(base.bulletDmg! * runScale(this.run).dmg * this.run.mods.monsterDmg, 'jumper', m.x, m.y);
      }
    } else {
      m.timer -= dt; m.vx = 0; m.vy = 0;
      if (m.timer <= 0) { m.state = 0; m.cd = (base.cooldown! * this.rng.range(0.85, 1.2)) / runScale(this.run).tempo; }
    }
  }

  private flyer(m: Monster, dt: number) {
    const p = this.player; const base = MONSTERS.flyer;
    m.timer += dt;
    const dx = p.x - m.x, dy = p.y - m.y; const d = Math.hypot(dx, dy) || 1;
    const want = d > 170 ? 1 : -0.4;
    const perpX = -dy / d, perpY = dx / d; const wob = Math.sin(m.timer * 2.6 + m.id) * 0.9;
    m.vx += ((dx / d) * want * m.speed + perpX * wob * m.speed - m.vx) * Math.min(1, dt * 2.5);
    m.vy += ((dy / d) * want * m.speed + perpY * wob * m.speed - m.vy) * Math.min(1, dt * 2.5);
    m.cd -= dt;
    if (m.cd <= 0 && this.state === 'fight' && d < 480) {
      this.fireBullet(m, this.aimAt(m), 1);
      this.emit({ t: 'spit', x: m.x, y: m.y, kind: m.kind });
      m.cd = (base.cooldown! * this.rng.range(0.8, 1.2)) / runScale(this.run).tempo;
    }
  }

  private boss(m: Monster, dt: number) {
    const p = this.player; const base = MONSTERS.boss;
    const fast = m.phase === 1 ? 0.7 : 1;
    if (m.state === 0) {
      this.walkChase(m, dt, 0.8);
      m.cd -= dt;
      if (m.cd <= 0 && this.state === 'fight') {
        m.state = 1; m.timer = base.telegraph! * fast; m.pattern = (m.pattern + 1) % 4;
        m.tx = p.x; m.ty = p.y;
        this.emit({ t: 'telegraph', id: m.id, kind: m.kind });
      }
    } else if (m.state === 1) {
      m.vx *= 0.8; m.vy *= 0.8; m.timer -= dt;
      if (m.timer <= 0) {
        const pat = m.pattern;
        if (pat === 0) { m.state = 2; m.timer = 0.9; (m as Monster & { k?: number }).k = 0; }
        else if (pat === 1) {
          const minions = this.monsters.filter((o) => o.alive && o.parent === m.id).length;
          const n = Math.min(3, 6 - minions);
          for (let i = 0; i < n; i++) {
            const a = (i / 3) * TAU + this.rng.range(0, 1);
            this.spawnMonster(m.phase ? 'splitter' : 'blob', clamp(m.x + Math.cos(a) * 110, 90, ROOM.width - 90), clamp(m.y + Math.sin(a) * 110, 90, ROOM.height - 90), 0.4, m.wave, m.id);
          }
          this.emit({ t: 'spawn', id: m.id, kind: 'blob' });
          m.state = 0; m.cd = base.cooldown! * fast;
        } else if (pat === 2) {
          m.state = 3; m.timer = 0.85;
          m.tx = clamp(p.x, 130, ROOM.width - 130); m.ty = clamp(p.y, 130, ROOM.height - 130);
          (m as Monster & { sx?: number }).sx = m.x; (m as Monster & { sy?: number }).sy = m.y;
          this.marks.push({ kind: 'land', x: m.tx, y: m.ty, t: 0.85, r: 120 });
        } else {
          m.state = 4; m.timer = 0; (m as Monster & { k?: number }).k = 0;
        }
      }
    } else if (m.state === 2) {
      // three rotating rings
      const mm = m as Monster & { k: number };
      m.timer -= dt; m.vx = 0; m.vy = 0;
      const shotsDone = mm.k; const due = Math.floor((0.9 - m.timer) / 0.3) + 1;
      if (shotsDone < Math.min(3, due)) {
        const n = m.phase ? 14 : 11; const off = shotsDone * 0.22;
        for (let i = 0; i < n; i++) this.fireBullet(m, off + (i / n) * TAU, 0.85);
        mm.k++; this.emit({ t: 'spit', x: m.x, y: m.y, kind: m.kind });
      }
      if (m.timer <= 0) { m.state = 0; m.cd = base.cooldown! * fast; }
    } else if (m.state === 3) {
      const mm = m as Monster & { sx: number; sy: number };
      m.timer -= dt; const k = 1 - Math.max(0, m.timer) / 0.85;
      m.x = mm.sx + (m.tx - mm.sx) * k; m.y = mm.sy + (m.ty - mm.sy) * k; m.vx = 0; m.vy = 0;
      if (m.timer <= 0) {
        this.world.resolve(m, m.r * 0.9, true);
        this.emit({ t: 'land', x: m.x, y: m.y, r: 120 });
        if (Math.hypot(p.x - m.x, p.y - m.y) < 120 + p.r && this.state === 'fight') this.hurtPlayer(base.contact * runScale(this.run).dmg * this.run.mods.monsterDmg, 'boss', m.x, m.y);
        const n = m.phase ? 12 : 8;
        for (let i = 0; i < n; i++) this.fireBullet(m, (i / n) * TAU + 0.2, 0.75);
        m.state = 0; m.cd = base.cooldown! * fast;
      }
    } else if (m.state === 4) {
      const mm = m as Monster & { k: number };
      m.vx = 0; m.vy = 0; m.timer -= dt;
      if (m.timer <= 0) {
        const a = this.aimAt(m);
        this.fireBullet(m, a - 0.22, 1.1); this.fireBullet(m, a, 1.1); this.fireBullet(m, a + 0.22, 1.1);
        this.emit({ t: 'spit', x: m.x, y: m.y, kind: m.kind });
        mm.k++; m.timer = 0.55;
        if (mm.k >= (m.phase ? 4 : 3)) { m.state = 0; m.cd = base.cooldown! * fast; }
      }
    }
  }

  // ---------------------------------------------------------------- bullets
  private updateBullets(dt: number) {
    const p = this.player;
    for (const b of this.bullets) {
      if (!b.alive) continue;
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0) { b.alive = false; continue; }
      if (b.x < ROOM.wall - 10 || b.x > ROOM.width - ROOM.wall + 10 || b.y < ROOM.wall - 10 || b.y > ROOM.height - ROOM.wall + 10) { b.alive = false; continue; }
      for (const c of this.world.colliders) {
        if (!c.blocksShots) continue;
        if (c.kind === 'circle') {
          const dx = b.x - c.x, dy = b.y - c.y; if (dx * dx + dy * dy < (c.r * 0.8) * (c.r * 0.8)) { b.alive = false; break; }
        } else if (Math.abs(b.x - c.x) < c.w / 2 && Math.abs(b.y - c.y) < c.h / 2) { b.alive = false; break; }
      }
      if (!b.alive) continue;
      const rr = b.r * 0.8 + p.r * 0.85;
      const dx = b.x - p.x, dy = b.y - (p.y - 6);
      if (dx * dx + dy * dy < rr * rr && this.state === 'fight') {
        if (p.invuln <= 0) { b.alive = false; this.hurtPlayer(b.dmg, b.src, b.x - b.vx * 0.05, b.y - b.vy * 0.05); }
      }
    }
    if (this.bullets.length > 64) this.bullets = this.bullets.filter((b) => b.alive);
  }

  // ---------------------------------------------------------------- trail bubbles
  private updateTrail(dt: number) {
    if (!this.bubbles.length) return;
    const s = this.run.stats;
    for (const b of this.bubbles) {
      if (!b.alive) continue;
      b.life -= dt;
      if (b.life <= 0) { b.alive = false; continue; }
      for (const m of this.monsters) {
        if (!m.alive || m.rise > 0 || m.airborne) continue;
        if (Math.hypot(m.x - b.x, m.y - b.y) < m.r + 12) {
          b.alive = false;
          for (const o of this.monsters) {
            if (o.alive && o.rise <= 0 && Math.hypot(o.x - b.x, o.y - b.y) < SKILL_VALUES.trailRadius + o.r)
              this.damageMonster(o, s.dps * SKILL_VALUES.trailDmg * s.trail);
          }
          this.goo.clean(b.x, b.y, 40);
          this.emit({ t: 'trailPop', x: b.x, y: b.y });
          this.emit({ t: 'clean', x: b.x, y: b.y, r: 44 });
          break;
        }
      }
    }
    this.processKills();
    if (this.bubbles.length > 40) this.bubbles = this.bubbles.filter((b) => b.alive);
  }

  // ---------------------------------------------------------------- pickups
  private updatePickups(dt: number) {
    const p = this.player; const s = this.run.stats;
    const allMagnet = this.state === 'clear' || this.state === 'done';
    for (const k of this.pickups) {
      if (!k.alive) continue;
      k.age += dt;
      const dx = p.x - k.x, dy = p.y - 8 - k.y; const d = Math.hypot(dx, dy) || 1;
      if (!k.magnet && k.age > 0.45 && (d < s.pickupRadius || (allMagnet && k.age > 0.5))) k.magnet = true;
      if (k.magnet && this.state !== 'dead') {
        const sp = Math.min(1100, 260 + k.age * 900);
        k.vx = (dx / d) * sp; k.vy = (dy / d) * sp;
        if (d < p.r + 12) { this.collect(k); continue; }
      } else {
        const f = Math.max(0, 1 - dt * 4.5); k.vx *= f; k.vy *= f;
      }
      k.x += k.vx * dt; k.y += k.vy * dt;
      if (!k.magnet) {
        k.x = clamp(k.x, ROOM.wall + 10, ROOM.width - ROOM.wall - 10);
        k.y = clamp(k.y, ROOM.wall + 10, ROOM.height - ROOM.wall - 10);
      }
    }
    if (this.pickups.length > 80) this.pickups = this.pickups.filter((k) => k.alive);
  }

  private collect(k: Pickup) {
    k.alive = false;
    const run = this.run;
    if (k.kind === 'coin') run.coins += k.value;
    else if (k.kind === 'xp') addXp(run, k.value);
    else if (k.kind === 'heal') this.player.hp = Math.min(run.stats.maxHp, this.player.hp + run.stats.maxHp * k.value);
    this.emit({ t: 'pickup', kind: k.kind, value: k.value, x: k.x, y: k.y });
  }

  pickupsLeft(): number { let n = 0; for (const k of this.pickups) if (k.alive) n++; return n; }

  // ---------------------------------------------------------------- followers
  private updateFollowers(dt: number) {
    const p = this.player; const pts = this.trailPts; const n = pts.length / 2;
    for (const f of this.followers) {
      if (f.joy > 0) { f.joy -= dt; continue; }
      const back = Math.min(n - 1, (f.idx + 1) * 7);
      let tx = pts[(n - 1 - back) * 2], ty = pts[(n - 1 - back) * 2 + 1];
      if (!p.moving) {
        // gather around the player while they spray
        const a = Math.PI / 2 + (f.idx % 2 ? 1 : -1) * (0.9 + Math.floor(f.idx / 2) * 0.45);
        const rr = 46 + Math.floor(f.idx / 2) * 14;
        const gx = p.x + Math.cos(a) * rr, gy = p.y + Math.sin(a) * rr * 0.8;
        const mix = Math.min(1, p.stillTime * 1.5);
        tx = tx + (gx - tx) * mix; ty = ty + (gy - ty) * mix;
      }
      const dx = tx - f.x, dy = ty - f.y; const d = Math.hypot(dx, dy);
      const sp = Math.min(d * 7, 480);
      if (d > 2) { f.x += (dx / d) * sp * dt; f.y += (dy / d) * sp * dt; }
      f.moving = sp > 30;
      if (Math.abs(dx) > 3) f.facing = dx > 0 ? 1 : -1;
      if (p.firing && !f.moving) f.cheer += dt; else f.cheer = 0;
    }
  }

  // ---------------------------------------------------------------- telegraph marks
  private updateMarks(dt: number) {
    for (const k of this.marks) k.t -= dt;
    if (this.marks.length) this.marks = this.marks.filter((k) => k.t > 0);
  }

  // ---------------------------------------------------------------- room flow
  private updateFlow(dt: number) {
    if (this.state === 'fight') {
      if (this.aliveCount() === 0) {
        if (this.wave < this.maxWave) {
          if (this.waveTimer < 0) {
            this.waveTimer = MONSTER_RULES.waveDelay;
            for (const mp of this.def.monsters) if ((mp.w ?? 0) === this.wave + 1) {
              this.marks.push({ kind: 'spawn', x: mp.x, y: mp.y, t: MONSTER_RULES.waveDelay + MONSTER_RULES.spawnRise, r: MONSTERS[mp.t].r });
              this.emit({ t: 'spawnMark', x: mp.x, y: mp.y, delay: MONSTER_RULES.waveDelay });
            }
          }
          this.waveTimer -= dt;
          if (this.waveTimer <= 0) { this.wave++; this.waveTimer = -1; this.spawnWave(this.wave); }
        } else {
          this.state = 'clear'; this.stateTime = 0;
          this.run.roomsCleared++;
          for (const b of this.bullets) b.alive = false;
          this.emit({ t: 'roomClear' });
          this.emit({ t: 'cleanWave', x: this.player.x, y: this.player.y });
          this.goo.clearAll();
          this.run.cleanSum += 1;
          // trapped animals loosen up once the room is safe: a short spray frees them
          for (const c of this.cocoons) if (!c.freed) c.hp = Math.min(c.hp, c.maxHp * 0.3);
        }
      }
    } else if (this.state === 'clear') {
      if (!this.gateOpen && this.stateTime > 0.7) { this.gateOpen = true; this.emit({ t: 'gateOpen' }); }
    }
  }

  cocoonsLeft(): number { return this.cocoons.filter((c) => !c.freed).length; }
}

function turnToward(a: number, b: number, max: number): number {
  let d = b - a;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  if (Math.abs(d) <= max) return b;
  return a + Math.sign(d) * max;
}

export function distToSeg(px: number, py: number, x0: number, y0: number, x1: number, y1: number): number {
  const dx = x1 - x0, dy = y1 - y0; const l2 = dx * dx + dy * dy;
  let t = l2 > 0 ? ((px - x0) * dx + (py - y0) * dy) / l2 : 0; t = clamp(t, 0, 1);
  return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
}
