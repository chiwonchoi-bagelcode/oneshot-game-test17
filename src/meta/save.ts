// Persistent player data (localStorage) with versioned migration. The cloud
// save placeholder (services/cloudSave.ts) receives the same snapshot.
import type { SpeciesId, UpgradeId } from '../config/balance';
import type { QualityLevel } from '../engine/quality';
import type { Lang } from '../i18n';

export interface SaveData {
  v: number;
  installId: string;
  createdAt: number;
  coins: number;
  coinsEarned: number;
  upgrades: Record<UpgradeId, number>;
  rescued: Partial<Record<SpeciesId, number>>; // total rescues per species
  seen: SpeciesId[]; // species already shown as "new" in the shelter
  cleared: Record<string, { best: number; clears: number; stars: number }>; // by stage id
  attempts: Record<string, { tries: number; failsInRow: number }>;
  decor: string[];
  giftsAt: number; // when gifts were last collected (ms)
  streak: { day: number; lastDate: string; claimedToday: boolean; consecutive: number };
  missions: { date: string; ids: string[]; progress: number[]; claimed: boolean[]; allClaimed: boolean };
  daily: { date: string; cleared: boolean; streak: number; lastClearDate: string };
  stats: { runs: number; wins: number; washed: number; rooms: number; playSeconds: number; sessions: number; lastSession: number };
  flags: Record<string, boolean>; // tutorial + unlock announcements
  settings: { music: number; sfx: number; vibration: boolean; lang: Lang | 'auto'; quality: QualityLevel | 'auto'; contrast: boolean };
  dayOffset: number; // debug: shifts "today" for testing day changes
  lastStage: number;
}

const KEY = 'splash-rescue-save';
export const SAVE_VERSION = 1;

export function newSave(): SaveData {
  return {
    v: SAVE_VERSION,
    installId: Math.random().toString(36).slice(2) + Date.now().toString(36),
    createdAt: Date.now(),
    coins: 0, coinsEarned: 0,
    upgrades: { power: 0, range: 0, health: 0, pressure: 0, splash: 0 },
    rescued: {}, seen: [], cleared: {}, attempts: {}, decor: [],
    giftsAt: Date.now(),
    streak: { day: 0, lastDate: '', claimedToday: false, consecutive: 0 },
    missions: { date: '', ids: [], progress: [], claimed: [], allClaimed: false },
    daily: { date: '', cleared: false, streak: 0, lastClearDate: '' },
    stats: { runs: 0, wins: 0, washed: 0, rooms: 0, playSeconds: 0, sessions: 0, lastSession: 0 },
    flags: {},
    settings: { music: 0.7, sfx: 0.9, vibration: true, lang: 'auto', quality: 'auto', contrast: false },
    dayOffset: 0,
    lastStage: 1,
  };
}

let data: SaveData = newSave();
let dirty = false;
let timer = 0;
const listeners: ((d: SaveData) => void)[] = [];

export function save(): SaveData { return data; }

export function loadSave(): { data: SaveData; fresh: boolean } {
  let fresh = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      data = migrate(parsed);
      fresh = false;
    }
  } catch { data = newSave(); }
  return { data, fresh };
}

function migrate(p: Partial<SaveData>): SaveData {
  const base = newSave();
  const out = { ...base, ...p } as SaveData;
  out.upgrades = { ...base.upgrades, ...(p.upgrades || {}) };
  out.settings = { ...base.settings, ...(p.settings || {}) };
  out.stats = { ...base.stats, ...(p.stats || {}) };
  out.streak = { ...base.streak, ...(p.streak || {}) };
  out.daily = { ...base.daily, ...(p.daily || {}) };
  out.missions = { ...base.missions, ...(p.missions || {}) };
  out.flags = { ...(p.flags || {}) };
  out.v = SAVE_VERSION;
  return out;
}

export function markDirty() {
  dirty = true;
  if (!timer) timer = window.setTimeout(flush, 400);
}

export function flush() {
  timer = 0;
  if (!dirty) return;
  dirty = false;
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage full or blocked: keep playing */ }
  for (const f of listeners) f(data);
}

export function onSaved(f: (d: SaveData) => void) { listeners.push(f); }

export function resetSave() {
  const keepSettings = data.settings;
  data = newSave(); data.settings = keepSettings;
  dirty = true; flush();
}

export function replaceSave(d: SaveData) { data = migrate(d); dirty = true; flush(); }

// "Today" as a local date string; debug day offset lets testers move time forward.
export function today(offsetDays = data.dayOffset): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function nowMs(): number { return Date.now() + data.dayOffset * 86400000; }

export function daysBetween(a: string, b: string): number {
  if (!a || !b) return 999;
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  const da = Date.UTC(pa[0], pa[1] - 1, pa[2]), db = Date.UTC(pb[0], pb[1] - 1, pb[2]);
  return Math.round((db - da) / 86400000);
}
