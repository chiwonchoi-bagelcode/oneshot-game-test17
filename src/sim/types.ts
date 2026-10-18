import type { MonsterKind, SpeciesId, SkillId, UpgradeId } from '../config/balance';

export type Region = 'forest' | 'village' | 'lake';

export interface Vec { x: number; y: number }

export interface ObstaclePlacement { t: string; x: number; y: number }
export interface GooBlob { x: number; y: number; r: number }
export interface MonsterPlacement { t: MonsterKind; x: number; y: number; w?: number; v?: number }
export interface AnimalPlacement { s: SpeciesId; x: number; y: number }

export interface LevelRoom {
  terrain?: string[]; // ROOM rows of cell chars: '.' grass, '#' path, 'w' water, 's' sand, 'c' cobble
  obstacles: ObstaclePlacement[];
  decor?: ObstaclePlacement[];
  goo: GooBlob[];
  monsters: MonsterPlacement[];
  animals: AnimalPlacement[];
  start?: Vec;
}

export interface LevelDef {
  id: string;
  stage: number; // 1-based global order
  region: Region;
  rooms: LevelRoom[];
  boss?: boolean;
  // optional difficulty override (stage number used for monster scaling)
  tier?: number;
  intro?: MonsterKind; // monster type introduced in this stage
}

export interface PlayerStats {
  maxHp: number;
  moveSpeed: number;
  gooSlow: number;
  dps: number;
  range: number;
  width: number;
  pressureCharge: number;
  pressureMax: number;
  pressureDrain: number;
  invuln: number;
  pickupRadius: number;
  burstRadius: number;
  burstDmg: number; // fraction of dps
  burstClean: number;
  armor: number; // damage taken multiplier
  xpMult: number;
  coinMult: number;
  multi: number;
  pierce: number;
  chain: number;
  shieldRegen: number; // 0 = no shield
  trail: number;
  rescueHeal: number;
  reviveHp: number;
  gunTier: number;
  cheerPer: number;
}

export interface MetaPower {
  upgrades: Record<UpgradeId, number>;
  bonds: Partial<Record<SpeciesId, number>>; // bond levels
  assist: number; // 0 = none, 1..3 helper boost level after repeated fails
}

export type SkillStacks = Partial<Record<SkillId, number>>;

export interface Player {
  x: number; y: number; vx: number; vy: number; r: number;
  hp: number; invuln: number;
  moving: boolean; stillTime: number; firing: boolean;
  aim: number; pressure: number; pressureFullSent: boolean;
  streamLen: number;
  facing: number; // -1 left, 1 right
  shield: boolean; shieldTimer: number;
  trailTimer: number;
  onGoo: boolean;
  hurtTime: number; // time since last hit (for expressions)
}

export interface Monster {
  id: number; kind: MonsterKind; x: number; y: number; vx: number; vy: number;
  r: number; hp: number; maxHp: number; speed: number; contact: number;
  state: number; timer: number; cd: number;
  rise: number; // >0 while spawning
  tx: number; ty: number; // attack target
  alive: boolean; boss: boolean; parent: number;
  hitTime: number; // seconds since last damage
  phase: number; pattern: number;
  airborne: boolean;
  wave: number;
  variant: number;
}

export interface Bullet { x: number; y: number; vx: number; vy: number; r: number; dmg: number; life: number; src: MonsterKind; alive: boolean }

export interface Cocoon { id: number; species: SpeciesId; x: number; y: number; r: number; hp: number; maxHp: number; freed: boolean; hitTime: number }

export interface Follower { species: SpeciesId; x: number; y: number; vx: number; joy: number; idx: number; moving: boolean; cheer: number; facing: number }

export type PickupKind = 'xp' | 'coin' | 'heal';
export interface Pickup { kind: PickupKind; x: number; y: number; vx: number; vy: number; value: number; magnet: boolean; age: number; alive: boolean }

export interface TrailBubble { x: number; y: number; life: number; alive: boolean }

export interface StreamSeg { x0: number; y0: number; x1: number; y1: number; w: number; kind: 0 | 1 | 2 | 3; hit: boolean; hitId: number }

export type SimEvent =
  | { t: 'hit'; id: number; x: number; y: number; kind: MonsterKind }
  | { t: 'burst'; x: number; y: number; r: number; kind: MonsterKind; boss: boolean; combo: number }
  | { t: 'cocoonHit'; id: number; x: number; y: number }
  | { t: 'rescue'; species: SpeciesId; x: number; y: number; brave: boolean; first: boolean }
  | { t: 'playerHit'; dmg: number; src: MonsterKind; x: number; y: number }
  | { t: 'shieldPop'; x: number; y: number }
  | { t: 'shieldUp' }
  | { t: 'fireStart' }
  | { t: 'fireStop' }
  | { t: 'pressureFull'; x: number; y: number }
  | { t: 'spit'; x: number; y: number; kind: MonsterKind }
  | { t: 'telegraph'; id: number; kind: MonsterKind }
  | { t: 'dash'; id: number }
  | { t: 'land'; x: number; y: number; r: number }
  | { t: 'split'; x: number; y: number }
  | { t: 'spawnMark'; x: number; y: number; delay: number }
  | { t: 'spawn'; id: number; kind: MonsterKind }
  | { t: 'pickup'; kind: PickupKind; value: number; x: number; y: number }
  | { t: 'clean'; x: number; y: number; r: number }
  | { t: 'cleanWave'; x: number; y: number }
  | { t: 'roomClear' }
  | { t: 'gateOpen' }
  | { t: 'exit' }
  | { t: 'stageClear' }
  | { t: 'dead' }
  | { t: 'bossPhase'; phase: number }
  | { t: 'trailPop'; x: number; y: number };

export interface RoomInput { mx: number; my: number } // joystick vector, length 0..1
