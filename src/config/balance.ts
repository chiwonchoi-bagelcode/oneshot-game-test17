// Every tunable number in the game lives here: player stats, monsters, scaling,
// rewards, costs, drop rates and probabilities. Designers tune this one file.

export const ROOM = {
  width: 576,
  height: 960,
  tile: 48,
  wall: 48, // border thickness that frames the play area
  gateWidth: 110,
};

export const PLAYER = {
  maxHp: 100,
  radius: 20,
  moveSpeed: 255,
  accel: 2600,
  gooSlow: 0.62, // speed multiplier while standing on goo
  invuln: 0.9,
  dps: 34,
  range: 250,
  streamWidth: 12,
  streamSpeed: 2600, // how fast a fresh stream reaches its target
  fireDelay: 0.05, // seconds after stopping before water comes out
  aimTurnRate: 16,
  pressureCharge: 1.1, // seconds standing still to reach full pressure
  pressureMax: 1.8, // damage multiplier at full pressure
  pressureWidth: 0.6, // extra width fraction at full pressure
  pressureDrainMove: 5, // per second while moving
  pressureKeepOnHit: 0.25,
  pickupRadius: 64,
  streamClean: 0.75, // goo cleaned along the stream = width * this
  impactClean: 24,
  burstClean: 66,
  burstDamage: 0.25, // fraction of dps dealt instantly around a washed monster
  burstRadius: 70,
  reviveHp: 0.6,
  revivesPerRun: 1,
};

// Followers cheer and make the stream stronger during the run.
export const RESCUE = {
  cheerDamagePerAnimal: 0.06,
  cheerMaxAnimals: 6,
  healOnRescue: 0.1, // of max hp
  braveRescueCoins: 8, // rescued while monsters are still around
  rescueCoins: 10,
  rescueXp: 3,
  cocoonHp: 55,
  cocoonRadius: 30,
};

// In-run level curve (xp needed to go from level n to n+1).
export function xpToNext(level: number): number {
  const n = level - 1;
  return Math.round(6 + 6 * n + 1.4 * n * n);
}

export type MonsterKind =
  | 'blob' | 'spitter' | 'splitter' | 'mini' | 'dasher' | 'chunky' | 'nest' | 'jumper' | 'flyer' | 'boss';

export interface MonsterStats {
  r: number; hp: number; speed: number; contact: number; xp: number; coins: number;
  // attack timing (seconds)
  cooldown?: number; telegraph?: number;
  bulletSpeed?: number; bulletDmg?: number; bulletR?: number;
}

export const MONSTERS: Record<MonsterKind, MonsterStats> = {
  blob: { r: 26, hp: 40, speed: 74, contact: 12, xp: 2, coins: 2 },
  spitter: { r: 26, hp: 52, speed: 34, contact: 10, xp: 3, coins: 3, cooldown: 2.6, telegraph: 0.65, bulletSpeed: 200, bulletDmg: 13, bulletR: 13 },
  splitter: { r: 31, hp: 58, speed: 60, contact: 12, xp: 3, coins: 3 },
  mini: { r: 17, hp: 18, speed: 108, contact: 8, xp: 1, coins: 1 },
  dasher: { r: 26, hp: 55, speed: 60, contact: 16, xp: 3, coins: 3, cooldown: 1.5, telegraph: 0.8 },
  chunky: { r: 44, hp: 210, speed: 42, contact: 18, xp: 8, coins: 8, cooldown: 3.6, telegraph: 0.85, bulletSpeed: 190, bulletDmg: 14, bulletR: 14 },
  nest: { r: 40, hp: 240, speed: 0, contact: 10, xp: 8, coins: 8, cooldown: 4.2, telegraph: 0.7 },
  jumper: { r: 28, hp: 70, speed: 50, contact: 14, xp: 4, coins: 4, cooldown: 2.9, telegraph: 0.75, bulletDmg: 18 },
  flyer: { r: 22, hp: 44, speed: 95, contact: 11, xp: 3, coins: 3, cooldown: 3.2, telegraph: 0.5, bulletSpeed: 170, bulletDmg: 11, bulletR: 12 },
  boss: { r: 78, hp: 1700, speed: 55, contact: 22, xp: 30, coins: 60, cooldown: 2.2, telegraph: 0.9, bulletSpeed: 200, bulletDmg: 15, bulletR: 15 },
};

export const MONSTER_RULES = {
  spawnRise: 0.6, // seconds rising from the ground, harmless
  roomStartDelay: 0.9, // grace time when entering a room
  waveDelay: 1.1,
  dashSpeed: 560,
  dashTime: 0.5,
  jumpTime: 0.7,
  jumpShock: 64,
  nestMaxChildren: 3,
  chunkyRing: 8,
  hopMove: 0.46,
  hopRest: 0.32,
  minScale: 0.55, // monsters shrink to this as they get washed
};

export const STAGE_COUNT = 30;

// Difficulty and reward scaling per stage (1-based). Tuned with tools/sim-balance.
export function stageScale(stage: number) {
  const s = Math.max(1, stage) - 1;
  const hp = 0.62 * Math.pow(1.092, s) * (1 + 0.015 * s);
  const dmg = 0.5 + 0.06 * s + 0.0012 * s * s;
  const coin = 1 + 0.12 * s;
  return { hp, dmg, coin };
}

export const REWARDS = {
  roomClearCoins: 6, // times coin scale
  stageFirstClear: (stage: number) => 60 + 25 * stage,
  stageReplayClear: (stage: number) => 20 + 6 * stage,
  starCoins: 30,
  coinDropSpread: 0.25,
  healDropChance: 0.06, // chance a washed monster drops a heart-shaped water drop
  healDropAmount: 0.12,
};

export type UpgradeId = 'power' | 'range' | 'health' | 'pressure' | 'splash';

export interface UpgradeDef {
  id: UpgradeId; max: number; base: number; growth: number; per: number;
}

// per = effect per level as a fraction (0.12 = +12%)
export const UPGRADES: UpgradeDef[] = [
  { id: 'power', max: 40, base: 40, growth: 1.2, per: 0.12 },
  { id: 'range', max: 20, base: 50, growth: 1.24, per: 0.05 },
  { id: 'health', max: 30, base: 40, growth: 1.2, per: 0.1 },
  { id: 'pressure', max: 15, base: 70, growth: 1.3, per: 0.05 },
  { id: 'splash', max: 20, base: 60, growth: 1.27, per: 0.1 },
];

export function niceRound(v: number): number {
  if (v < 100) return Math.round(v / 5) * 5;
  if (v < 1000) return Math.round(v / 10) * 10;
  if (v < 10000) return Math.round(v / 50) * 50;
  return Math.round(v / 100) * 100;
}

export function upgradeCost(def: UpgradeDef, level: number): number {
  return niceRound(def.base * Math.pow(def.growth, level));
}

// The water gun evolves as the total of all upgrade levels grows.
export const GUN_TIERS = [
  { at: 0, dmg: 1.0, width: 1.0, splash: 1.0, range: 0 },
  { at: 3, dmg: 1.12, width: 1.32, splash: 1.15, range: 10 },
  { at: 8, dmg: 1.25, width: 1.62, splash: 1.3, range: 20 },
  { at: 15, dmg: 1.42, width: 1.95, splash: 1.5, range: 35 },
  { at: 25, dmg: 1.62, width: 2.35, splash: 1.72, range: 50 },
  { at: 38, dmg: 1.85, width: 2.8, splash: 1.95, range: 70 },
  { at: 55, dmg: 2.15, width: 3.5, splash: 2.3, range: 100 },
];

export function gunTierFor(totalLevels: number): number {
  let t = 0;
  for (let i = 0; i < GUN_TIERS.length; i++) if (totalLevels >= GUN_TIERS[i].at) t = i;
  return t;
}

export type SkillId =
  | 'thick' | 'range' | 'multi' | 'pierce' | 'chain' | 'splash' | 'turbo'
  | 'speed' | 'shield' | 'trail' | 'magnet' | 'vitality' | 'heal' | 'keep';

export interface SkillDef { id: SkillId; max: number; weight: number }

export const SKILLS: SkillDef[] = [
  { id: 'thick', max: 5, weight: 10 },
  { id: 'range', max: 3, weight: 7 },
  { id: 'multi', max: 2, weight: 7 },
  { id: 'pierce', max: 2, weight: 6 },
  { id: 'chain', max: 2, weight: 6 },
  { id: 'splash', max: 3, weight: 7 },
  { id: 'turbo', max: 3, weight: 7 },
  { id: 'keep', max: 2, weight: 5 },
  { id: 'speed', max: 3, weight: 6 },
  { id: 'shield', max: 3, weight: 6 },
  { id: 'trail', max: 3, weight: 5 },
  { id: 'magnet', max: 2, weight: 4 },
  { id: 'vitality', max: 4, weight: 6 },
  { id: 'heal', max: 99, weight: 0 }, // offered when hurt, see skillWeight
];

export const SKILL_VALUES = {
  thickDmg: 0.22, thickWidth: 0.15,
  rangeAdd: 0.18,
  multiDmg: 0.55,
  pierceDmg: 0.7,
  chainDmg: 0.5, chainRange: 150,
  splashDmg: 0.6, splashRadius: 0.25,
  turboCharge: 0.45, turboMax: 0.2,
  keepDrain: 0.55,
  speedAdd: 0.12, speedGoo: 0.12,
  shieldRegen: [9, 7, 5.5],
  trailEvery: 0.28, trailDmg: 0.35, trailRadius: 34,
  magnetRadius: 0.8, magnetXp: 0.15,
  vitalityHp: 0.2, vitalityHeal: 0.2,
  heal: 0.4,
};

export function skillWeight(def: SkillDef, stacks: number, hpRatio: number): number {
  if (def.id === 'heal') return hpRatio < 0.8 ? 9 + (1 - hpRatio) * 12 : 0;
  if (stacks >= def.max) return 0;
  return def.weight;
}

export type SpeciesId =
  | 'puppy' | 'bunny' | 'squirrel' | 'fox' | 'hedgehog' | 'fawn'
  | 'kitten' | 'duckling' | 'piglet' | 'lamb' | 'chick'
  | 'otter' | 'turtle' | 'frog' | 'penguin' | 'panda';

export type BonusKind =
  | 'maxHp' | 'move' | 'coins' | 'damage' | 'armor' | 'range' | 'charge' | 'xp'
  | 'gifts' | 'rescueHeal' | 'splash' | 'pickup' | 'revive' | 'gooWalk' | 'pressureMax' | 'all';

export interface SpeciesDef { id: SpeciesId; bonus: BonusKind; per: number; region: 'forest' | 'village' | 'lake' | 'special' }

// per = bonus per bond level (bond 1..5). Fractions are percentages.
export const SPECIES: SpeciesDef[] = [
  { id: 'puppy', bonus: 'maxHp', per: 0.05, region: 'forest' },
  { id: 'bunny', bonus: 'move', per: 0.03, region: 'forest' },
  { id: 'squirrel', bonus: 'coins', per: 0.06, region: 'forest' },
  { id: 'fox', bonus: 'damage', per: 0.04, region: 'forest' },
  { id: 'hedgehog', bonus: 'armor', per: 0.03, region: 'forest' },
  { id: 'fawn', bonus: 'range', per: 0.03, region: 'forest' },
  { id: 'kitten', bonus: 'charge', per: 0.05, region: 'village' },
  { id: 'duckling', bonus: 'xp', per: 0.06, region: 'village' },
  { id: 'piglet', bonus: 'gifts', per: 0.1, region: 'village' },
  { id: 'lamb', bonus: 'rescueHeal', per: 0.15, region: 'village' },
  { id: 'chick', bonus: 'splash', per: 0.05, region: 'village' },
  { id: 'otter', bonus: 'pickup', per: 0.08, region: 'lake' },
  { id: 'turtle', bonus: 'revive', per: 0.08, region: 'lake' },
  { id: 'frog', bonus: 'gooWalk', per: 0.05, region: 'lake' },
  { id: 'penguin', bonus: 'pressureMax', per: 0.03, region: 'special' },
  { id: 'panda', bonus: 'all', per: 0.02, region: 'special' },
];

export const BOND_THRESHOLDS = [1, 3, 6, 10, 15]; // rescues needed for bond level 1..5

export function bondLevel(count: number): number {
  let lv = 0;
  for (let i = 0; i < BOND_THRESHOLDS.length; i++) if (count >= BOND_THRESHOLDS[i]) lv = i + 1;
  return lv;
}

export const GIFTS = {
  perSpeciesPerHour: 6,
  bondBonus: 0.15, // per bond level above 1
  capHours: 8,
  minCollect: 1,
};

export interface DecorDef { id: string; cost: number; giftBonus: number }

export const DECOR: DecorDef[] = [
  { id: 'ball', cost: 150, giftBonus: 0.1 },
  { id: 'cushion', cost: 300, giftBonus: 0.1 },
  { id: 'bowl', cost: 500, giftBonus: 0.1 },
  { id: 'flowers', cost: 800, giftBonus: 0.1 },
  { id: 'pond', cost: 1200, giftBonus: 0.1 },
  { id: 'treehouse', cost: 1800, giftBonus: 0.1 },
  { id: 'slide', cost: 2600, giftBonus: 0.1 },
  { id: 'fountain', cost: 3600, giftBonus: 0.1 },
];

export const UNLOCKS = {
  upgrades: 0, // after the first run ends
  shelter: 0, // after the first run that rescued an animal
  missions: 2, // stage number that must be cleared
  daily: 3,
  decor: 5, // species count
};

export const STREAK_REWARDS: Array<{ coins?: number; species?: SpeciesId }> = [
  { coins: 100 },
  { species: 'penguin' },
  { coins: 200 },
  { coins: 300 },
  { species: 'panda' },
  { coins: 400 },
  { coins: 600 },
];
export const STREAK_AFTER_WEEK = 250;

export interface MissionDef { id: string; target: number; coins: number }

export const MISSIONS: MissionDef[] = [
  { id: 'wash', target: 40, coins: 80 },
  { id: 'rescue', target: 3, coins: 90 },
  { id: 'rooms', target: 8, coins: 80 },
  { id: 'pressure', target: 15, coins: 70 },
  { id: 'clear', target: 2, coins: 100 },
  { id: 'gifts', target: 1, coins: 60 },
  { id: 'nohit', target: 3, coins: 90 },
];
export const MISSIONS_PER_DAY = 3;
export const MISSION_ALL_BONUS = 150;

export const DAILY = {
  rooms: 4,
  firstClearCoins: 400,
  replayCoins: 60,
  // stage difficulty used for the daily: highest cleared stage, at least this
  minStage: 3,
};

export const ASSIST = {
  // after this many failed attempts in a row on a stage, offer a helper boost
  failsBeforeHelp: 2,
  helpHp: 0.3,
  helpDamage: 0.2,
};
