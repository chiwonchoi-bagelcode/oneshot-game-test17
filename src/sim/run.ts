// State of one run (a stage = several rooms). Survives across rooms; the
// results screen reads it at the end.
import { xpToNext, stageScale, SKILLS, skillWeight, type SkillId, type SpeciesId } from '../config/balance';
import { computeStats } from './stats';
import { Rng } from './rng';
import type { LevelDef, MetaPower, PlayerStats, SkillStacks } from './types';

export interface RunMods {
  monsterHp: number; monsterSpeed: number; monsterDmg: number; bulletSpeed: number;
  playerDps: number; bigMonsters: boolean; coinMul: number;
}

export const NO_MODS: RunMods = { monsterHp: 1, monsterSpeed: 1, monsterDmg: 1, bulletSpeed: 1, playerDps: 1, bigMonsters: false, coinMul: 1 };

export interface RunState {
  level: LevelDef;
  stage: number;
  scaleStage: number;
  roomIndex: number;
  xpLevel: number;
  xp: number;
  pendingLevelUps: number;
  skills: SkillStacks;
  skillOrder: SkillId[];
  coins: number;
  rescued: SpeciesId[];
  washed: number;
  roomsCleared: number;
  hp: number;
  revives: number;
  shield: boolean;
  hits: number;
  dmgBy: Record<string, number>;
  pressureFulls: number;
  meta: MetaPower;
  stats: PlayerStats;
  time: number;
  mods: RunMods;
  known: SpeciesId[];
  seed: number;
  rng: Rng;
  bestCombo: number;
  daily: boolean;
  cleanSum: number;
  noHitRooms: number;
}

export function createRun(level: LevelDef, meta: MetaPower, opts: { known: SpeciesId[]; seed: number; mods?: RunMods; revives: number; daily?: boolean }): RunState {
  const stats = computeStats(meta, {}, 0);
  return {
    level, stage: level.stage, scaleStage: level.tier ?? level.stage, roomIndex: 0,
    xpLevel: 1, xp: 0, pendingLevelUps: 0, skills: {}, skillOrder: [],
    coins: 0, rescued: [], washed: 0, roomsCleared: 0,
    hp: stats.maxHp, revives: opts.revives, shield: false, hits: 0, dmgBy: {}, pressureFulls: 0,
    meta, stats, time: 0, mods: opts.mods ?? NO_MODS, known: opts.known.slice(), seed: opts.seed,
    rng: new Rng(opts.seed ^ 0x5bd1e995), bestCombo: 0, daily: !!opts.daily, cleanSum: 0, noHitRooms: 0,
  };
}

export function runScale(run: RunState) { return stageScale(run.scaleStage); }

export function refreshStats(run: RunState): PlayerStats {
  const old = run.stats;
  const s = computeStats(run.meta, run.skills, run.rescued.length);
  s.dps *= run.mods.playerDps;
  if (s.maxHp > old.maxHp) run.hp += s.maxHp - old.maxHp;
  run.hp = Math.min(run.hp, s.maxHp);
  run.stats = s;
  return s;
}

export function addXp(run: RunState, amount: number) {
  run.xp += amount * run.stats.xpMult;
  while (run.xp >= xpToNext(run.xpLevel + run.pendingLevelUps)) {
    run.xp -= xpToNext(run.xpLevel + run.pendingLevelUps);
    run.pendingLevelUps++;
  }
}

export function xpProgress(run: RunState): number {
  return Math.min(1, run.xp / xpToNext(run.xpLevel + run.pendingLevelUps));
}

// Three distinct skill choices, weighted. Deterministic per run.
export function rollSkillChoices(run: RunState, count = 3): SkillId[] {
  const hpRatio = run.hp / run.stats.maxHp;
  const pool = SKILLS.map((d) => ({ id: d.id, w: skillWeight(d, run.skills[d.id] || 0, hpRatio) })).filter((p) => p.w > 0);
  const out: SkillId[] = [];
  while (out.length < count && pool.length) {
    const total = pool.reduce((a, p) => a + p.w, 0);
    let r = run.rng.next() * total; let i = 0;
    for (; i < pool.length - 1; i++) { r -= pool[i].w; if (r <= 0) break; }
    out.push(pool[i].id); pool.splice(i, 1);
  }
  return out;
}

export function applySkill(run: RunState, id: SkillId) {
  if (id === 'heal') {
    run.hp = Math.min(run.stats.maxHp, run.hp + run.stats.maxHp * 0.4);
  } else {
    run.skills[id] = (run.skills[id] || 0) + 1;
    run.skillOrder.push(id);
    if (id === 'shield') run.shield = true;
  }
  const before = run.stats.maxHp;
  refreshStats(run);
  if (id === 'vitality') run.hp = Math.min(run.stats.maxHp, run.hp + run.stats.maxHp * 0.2);
  void before;
  run.pendingLevelUps = Math.max(0, run.pendingLevelUps - 1);
  run.xpLevel++;
}
