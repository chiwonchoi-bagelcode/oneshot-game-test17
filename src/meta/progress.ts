// Permanent progression: rewards after a run, upgrades, animal bonds, feature
// unlocks, daily tasks, the daily challenge, login stamps and shelter gifts.
import {
  ASSIST, BOND_THRESHOLDS, assistLevel, DAILY, DECOR, GIFTS, MISSIONS, MISSIONS_PER_DAY, MISSION_ALL_BONUS, REWARDS, SPECIES, STAGE_COUNT,
  STREAK_AFTER_WEEK, STREAK_REWARDS, UNLOCKS, UPGRADES, bondLevel, gunTierFor, upgradeCost, type SpeciesId, type UpgradeId,
} from '../config/balance';
import { Rng, hashString } from '../sim/rng';
import { upgradeTotal } from '../sim/stats';
import type { LevelDef, MetaPower } from '../sim/types';
import type { RunState } from '../sim/run';
import { track } from '../services/analytics';
import { daysBetween, markDirty, nowMs, save, today } from './save';

// ---------------------------------------------------------------- power
export function bonds(): Partial<Record<SpeciesId, number>> {
  const out: Partial<Record<SpeciesId, number>> = {};
  for (const s of SPECIES) { const lv = bondLevel(save().rescued[s.id] || 0); if (lv) out[s.id] = lv; }
  return out;
}

export function metaPower(assist = 0): MetaPower {
  return { upgrades: { ...save().upgrades }, bonds: bonds(), assist };
}

export function knownSpecies(): SpeciesId[] { return SPECIES.filter((s) => (save().rescued[s.id] || 0) > 0).map((s) => s.id); }

export function gunTier(): number { return gunTierFor(upgradeTotal(save().upgrades)); }

// ---------------------------------------------------------------- stages
export function isCleared(stage: number): boolean { return !!save().cleared[`s${stage}`]; }
export function highestCleared(): number { let h = 0; for (let s = 1; s <= STAGE_COUNT; s++) if (isCleared(s)) h = s; return h; }
export function stageUnlocked(stage: number): boolean { return stage === 1 || isCleared(stage - 1) || isCleared(stage); }
export function nextStage(): number { return Math.min(STAGE_COUNT, highestCleared() + 1); }
export function clearedCount(): number { let n = 0; for (let s = 1; s <= STAGE_COUNT; s++) if (isCleared(s)) n++; return n; }

export function assistFor(stage: number): number {
  const a = save().attempts[`s${stage}`];
  if (!a || isCleared(stage)) return 0;
  return assistLevel(a.failsInRow);
}
export function assistOffered(stage: number): boolean { return assistFor(stage) > 0; }
void ASSIST;

// ---------------------------------------------------------------- unlocks
export type Feature = 'upgrades' | 'shelter' | 'missions' | 'daily' | 'decor';

export function featureOpen(f: Feature): boolean {
  const s = save();
  switch (f) {
    case 'upgrades': return s.stats.runs >= 1;
    case 'shelter': return knownSpecies().length > 0 && s.stats.runs >= 1;
    case 'missions': return highestCleared() >= UNLOCKS.missions;
    case 'daily': return highestCleared() >= UNLOCKS.daily;
    case 'decor': return knownSpecies().length >= UNLOCKS.decor;
  }
}

// Features that became available and haven't been announced yet.
export function pendingUnlocks(): Feature[] {
  const s = save(); const out: Feature[] = [];
  for (const f of ['upgrades', 'shelter', 'missions', 'daily', 'decor'] as Feature[]) {
    if (featureOpen(f) && !s.flags[`unlock_${f}`]) out.push(f);
  }
  return out;
}
export function markAnnounced(f: Feature) { save().flags[`unlock_${f}`] = true; markDirty(); track('feature_unlock', { feature: f }); }

// ---------------------------------------------------------------- coins
export function earn(amount: number, source: string) {
  if (amount <= 0) return;
  const s = save(); s.coins += amount; s.coinsEarned += amount; markDirty();
  track('currency_earn', { source, amount, balance: s.coins });
}
export function spend(amount: number, sink: string, item: string): boolean {
  const s = save(); if (s.coins < amount) return false;
  s.coins -= amount; markDirty();
  track('currency_spend', { sink, item, amount, balance: s.coins });
  return true;
}

export function upgradeInfo(id: UpgradeId) {
  const def = UPGRADES.find((u) => u.id === id)!;
  const lv = save().upgrades[id] || 0;
  return { def, lv, maxed: lv >= def.max, cost: lv >= def.max ? 0 : upgradeCost(def, lv) };
}

export function buyUpgrade(id: UpgradeId): { ok: boolean; tierBefore: number; tierAfter: number } {
  const info = upgradeInfo(id);
  const tierBefore = gunTier();
  if (info.maxed || !spend(info.cost, 'upgrade', id)) return { ok: false, tierBefore, tierAfter: tierBefore };
  save().upgrades[id] = info.lv + 1; markDirty();
  track('upgrade_buy', { id, level: info.lv + 1, cost: info.cost });
  const tierAfter = gunTier();
  if (tierAfter > tierBefore) track('gun_evolve', { tier: tierAfter });
  return { ok: true, tierBefore, tierAfter };
}

export function cheapestUpgradeCost(): number {
  let c = Infinity; for (const u of UPGRADES) { const i = upgradeInfo(u.id); if (!i.maxed && featureUpgradeOpen(u.id)) c = Math.min(c, i.cost); } return c;
}

// Upgrades open gradually so the first screens stay simple.
export function featureUpgradeOpen(id: UpgradeId): boolean {
  const h = highestCleared(); const runs = save().stats.runs;
  switch (id) {
    case 'power': return runs >= 1;
    case 'health': return runs >= 1;
    case 'range': return h >= 1 || runs >= 3;
    case 'pressure': return h >= 2;
    case 'splash': return h >= 3;
  }
}
export function upgradeUnlockStage(id: UpgradeId): number { return id === 'range' ? 1 : id === 'pressure' ? 2 : id === 'splash' ? 3 : 0; }

// ---------------------------------------------------------------- run results
export interface BondUp { species: SpeciesId; from: number; to: number; count: number }
export interface RunSummary {
  result: 'clear' | 'fail' | 'quit';
  stage: number;
  coinsRun: number; bonus: number; bonusKind: 'first' | 'replay' | 'daily' | null; total: number;
  rescued: SpeciesId[]; newSpecies: SpeciesId[]; bondUps: BondUp[];
  washed: number; rooms: number; totalRooms: number; seconds: number;
  firstClear: boolean; tierBefore: number;
  missionsDone: string[];
  deathSource: string | null;
}

export function applyRun(run: RunState, result: 'clear' | 'fail' | 'quit', seconds: number, deathSource: string | null, daily: boolean): RunSummary {
  const s = save();
  const stage = run.stage; const key = `s${stage}`;
  const before = { ...s.rescued };
  const firstClear = result === 'clear' && !daily && !isCleared(stage);
  let bonus = 0; let bonusKind: RunSummary['bonusKind'] = null;
  if (result === 'clear') {
    if (daily) {
      const first = !s.daily.cleared; bonus = first ? DAILY.firstClearCoins : DAILY.replayCoins; bonusKind = 'daily';
      if (first) {
        s.daily.cleared = true;
        s.daily.streak = daysBetween(s.daily.lastClearDate, today()) === 1 ? s.daily.streak + 1 : 1;
        s.daily.lastClearDate = today();
      }
    } else if (firstClear) { bonus = REWARDS.stageFirstClear(stage); bonusKind = 'first'; }
    else { bonus = REWARDS.stageReplayClear(stage); bonusKind = 'replay'; }
  }
  const coinsRun = run.coins;
  earn(coinsRun, daily ? 'daily_run' : 'run');
  if (bonus) earn(bonus, daily ? 'daily' : 'clear_bonus');
  // animals
  const newSpecies: SpeciesId[] = []; const bondUps: BondUp[] = [];
  for (const sp of run.rescued) {
    if (!(s.rescued[sp] || 0) && !newSpecies.includes(sp)) newSpecies.push(sp);
    s.rescued[sp] = (s.rescued[sp] || 0) + 1;
  }
  for (const sp of new Set(run.rescued)) {
    const a = bondLevel(before[sp] || 0), b = bondLevel(s.rescued[sp] || 0);
    if (b > a) bondUps.push({ species: sp, from: a, to: b, count: s.rescued[sp] || 0 });
  }
  // stage records
  if (!daily) {
    const at = s.attempts[key] ?? { tries: 0, failsInRow: 0 };
    at.tries++;
    at.failsInRow = result === 'clear' ? 0 : at.failsInRow + (result === 'fail' ? 1 : 0);
    s.attempts[key] = at;
    if (result === 'clear') {
      const c = s.cleared[key] ?? { best: 0, clears: 0, stars: 0 };
      c.clears++; c.best = c.best ? Math.min(c.best, seconds) : seconds;
      const allAnimals = run.level.rooms.reduce((n, r) => n + r.animals.length, 0);
      const stars = 1 + (run.rescued.length >= allAnimals ? 1 : 0) + (run.hits === 0 ? 1 : 0);
      c.stars = Math.max(c.stars, stars);
      s.cleared[key] = c;
      if (firstClear) { track('stage_first_clear', { stage, attempts: at.tries }); track('level_reached', { stage: stage + 1 }); }
      if (firstClear && stage === 1) track('tutorial_complete', { seconds: Math.round((Date.now() - s.createdAt) / 1000) });
      s.lastStage = Math.min(STAGE_COUNT, stage + 1);
    } else s.lastStage = stage;
  }
  s.stats.runs++; if (result === 'clear') s.stats.wins++;
  s.stats.washed += run.washed; s.stats.rooms += run.roomsCleared;
  // daily tasks
  const done: string[] = [];
  const bump = (id: string, n: number) => { const d = bumpMission(id, n); if (d) done.push(d); };
  bump('wash', run.washed); bump('rescue', run.rescued.length); bump('rooms', run.roomsCleared);
  bump('pressure', run.pressureFulls); bump('nohit', run.noHitRooms); if (result === 'clear') bump('clear', 1);
  markDirty();
  return {
    result, stage, coinsRun, bonus, bonusKind, total: coinsRun + bonus, rescued: run.rescued.slice(), newSpecies, bondUps,
    washed: run.washed, rooms: run.roomsCleared, totalRooms: run.level.rooms.length, seconds, firstClear,
    tierBefore: gunTier(), missionsDone: done, deathSource,
  };
}

export function noHitRooms(n: number) { bumpMission('nohit', n); }

export function bondProgress(sp: SpeciesId) {
  const n = save().rescued[sp] || 0; const lv = bondLevel(n);
  const next = BOND_THRESHOLDS[lv];
  return { count: n, lv, next: next ?? null, toNext: next ? next - n : 0, maxed: lv >= BOND_THRESHOLDS.length };
}

// ---------------------------------------------------------------- daily refresh
export function refreshDay(): { newDay: boolean } {
  const s = save(); const d = today();
  let newDay = false;
  if (s.missions.date !== d) {
    const r = new Rng(hashString(d + s.installId));
    const pool = MISSIONS.map((m) => m.id).filter((id) => id !== 'gifts' || featureOpen('shelter'));
    const ids: string[] = [];
    while (ids.length < MISSIONS_PER_DAY && pool.length) { const i = Math.floor(r.next() * pool.length); ids.push(pool.splice(i, 1)[0]); }
    s.missions = { date: d, ids, progress: ids.map(() => 0), claimed: ids.map(() => false), allClaimed: false };
    newDay = true;
  }
  if (s.daily.date !== d) { s.daily.date = d; s.daily.cleared = false; }
  if (s.streak.lastDate !== d) {
    const gap = daysBetween(s.streak.lastDate, d);
    s.streak.consecutive = gap === 1 ? s.streak.consecutive + 1 : 1;
    s.streak.day += 1; s.streak.lastDate = d; s.streak.claimedToday = false;
    newDay = true;
  }
  markDirty();
  return { newDay };
}

export function missionDef(id: string) { return MISSIONS.find((m) => m.id === id)!; }

function bumpMission(id: string, n: number): string | null {
  const s = save(); const i = s.missions.ids.indexOf(id);
  if (i < 0 || n <= 0) return null;
  const def = missionDef(id); const before = s.missions.progress[i];
  s.missions.progress[i] = Math.min(def.target, before + n);
  markDirty();
  if (before < def.target && s.missions.progress[i] >= def.target) { track('mission_complete', { id }); return id; }
  return null;
}

export function claimMission(i: number): number {
  const s = save(); const id = s.missions.ids[i]; if (!id || s.missions.claimed[i]) return 0;
  const def = missionDef(id); if (s.missions.progress[i] < def.target) return 0;
  s.missions.claimed[i] = true; earn(def.coins, 'mission'); markDirty();
  return def.coins;
}

export function claimAllMissionsBonus(): number {
  const s = save(); if (s.missions.allClaimed || !s.missions.claimed.every(Boolean) || !s.missions.claimed.length) return 0;
  s.missions.allClaimed = true; earn(MISSION_ALL_BONUS, 'mission_all'); markDirty();
  return MISSION_ALL_BONUS;
}

export function missionsClaimable(): number {
  const s = save(); let n = 0;
  s.missions.ids.forEach((id, i) => { if (!s.missions.claimed[i] && s.missions.progress[i] >= missionDef(id).target) n++; });
  if (!s.missions.allClaimed && s.missions.claimed.length && s.missions.claimed.every(Boolean)) n++;
  return n;
}

// ---------------------------------------------------------------- login stamps
export function streakReward(day: number): { coins?: number; species?: SpeciesId } {
  if (day <= STREAK_REWARDS.length) return STREAK_REWARDS[day - 1];
  return { coins: STREAK_AFTER_WEEK };
}

export function claimStreak(): { coins?: number; species?: SpeciesId } | null {
  const s = save(); if (s.streak.claimedToday || s.streak.day < 1) return null;
  const r = streakReward(s.streak.day);
  s.streak.claimedToday = true;
  if (r.coins) earn(r.coins, 'streak');
  if (r.species) { s.rescued[r.species] = (s.rescued[r.species] || 0) + 1; }
  markDirty();
  track('streak_claim', { day: s.streak.day, reward: r.species ?? r.coins });
  return r;
}

// ---------------------------------------------------------------- shelter gifts
export function giftRate(): number {
  const s = save(); let rate = 0;
  for (const sp of SPECIES) {
    const lv = bondLevel(s.rescued[sp.id] || 0); if (!lv) continue;
    rate += GIFTS.perSpeciesPerHour * (1 + GIFTS.bondBonus * (lv - 1));
  }
  const decorMul = 1 + s.decor.reduce((a, id) => a + (DECOR.find((d) => d.id === id)?.giftBonus ?? 0), 0);
  let pigBonus = 0; for (const sp of SPECIES) if (sp.bonus === 'gifts') pigBonus += sp.per * bondLevel(s.rescued[sp.id] || 0);
  return rate * decorMul * (1 + pigBonus);
}

export function giftsPending(): number {
  const s = save(); const hours = Math.min(GIFTS.capHours, Math.max(0, (nowMs() - s.giftsAt) / 3600000));
  return Math.floor(hours * giftRate());
}

export function collectGifts(): number {
  const s = save(); const n = giftsPending();
  if (n < GIFTS.minCollect) return 0;
  s.giftsAt = nowMs(); earn(n, 'gift'); markDirty();
  bumpMission('gifts', 1);
  track('gift_collect', { amount: n });
  return n;
}

export function buyDecor(id: string): boolean {
  const d = DECOR.find((x) => x.id === id); const s = save();
  if (!d || s.decor.includes(id)) return false;
  // gifts accumulated so far are kept at the old rate
  const pending = giftsPending();
  if (!spend(d.cost, 'decor', id)) return false;
  s.decor.push(id);
  const rate = giftRate(); if (rate > 0) s.giftsAt = nowMs() - (pending / rate) * 3600000;
  markDirty(); track('decor_buy', { id });
  return true;
}

// ---------------------------------------------------------------- daily challenge
export interface DailyInfo { mod: string; level: LevelDef; mods: { monsterHp: number; monsterSpeed: number; monsterDmg: number; bulletSpeed: number; playerDps: number; bigMonsters: boolean; coinMul: number } }

const MODS: Record<string, DailyInfo['mods']> = {
  big: { monsterHp: 1, monsterSpeed: 1, monsterDmg: 1, bulletSpeed: 1, playerDps: 1, bigMonsters: true, coinMul: 2 },
  fast: { monsterHp: 1, monsterSpeed: 1.3, monsterDmg: 1, bulletSpeed: 1.15, playerDps: 1.3, bigMonsters: false, coinMul: 1.3 },
  swarm: { monsterHp: 0.75, monsterSpeed: 1, monsterDmg: 0.9, bulletSpeed: 1, playerDps: 1, bigMonsters: false, coinMul: 1.5 },
  rain: { monsterHp: 1, monsterSpeed: 1, monsterDmg: 1, bulletSpeed: 1.35, playerDps: 1, bigMonsters: false, coinMul: 1.5 },
};

export function dailyChallenge(levels: LevelDef[]): DailyInfo {
  const d = today(); const r = new Rng(hashString('daily:' + d));
  const keys = Object.keys(MODS); const mod = keys[Math.floor(r.next() * keys.length)];
  const top = Math.max(DAILY.minStage, highestCleared());
  const pool = levels.filter((l) => l.stage <= top);
  const rooms = [];
  for (let i = 0; i < DAILY.rooms; i++) {
    const lv = pool[Math.floor(r.next() * pool.length)];
    const room = lv.rooms[Math.floor(r.next() * lv.rooms.length)];
    const copy = JSON.parse(JSON.stringify(room));
    if (mod === 'swarm') copy.monsters = copy.monsters.concat(copy.monsters.filter((m: { t: string }) => m.t === 'blob' || m.t === 'mini').map((m: { x: number; y: number; w?: number }) => ({ ...m, t: 'blob', x: Math.min(500, m.x + 40), y: m.y + 30 })));
    rooms.push(copy);
  }
  const region = pool[Math.floor(r.next() * pool.length)].region;
  const level: LevelDef = { id: `daily-${d}`, stage: Math.min(STAGE_COUNT, top), tier: Math.min(STAGE_COUNT, top), region, rooms };
  return { mod, level, mods: MODS[mod] };
}

export function dailyRemainingMs(): number {
  const n = new Date(nowMs()); const end = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).getTime();
  return end - n.getTime();
}

export { upgradeTotal };
