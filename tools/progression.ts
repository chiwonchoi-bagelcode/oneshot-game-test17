// Progression simulator: a bot "player" starts from a fresh save and plays the
// real game rules (same sim, rewards, upgrade costs, bonds, daily income) until
// it has cleaned all 30 areas. Prints the curve and writes the expected power
// per stage to data/balance/profile.json (used by tools/validate.ts).
// Usage: node tools/run-ts.mjs tools/progression.ts [runsPerDay=14] [profile=player]
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { simulateStage } from '../src/sim/playthrough';
import { BOT_PLAYER, BOT_NOVICE, BOT_EXPERT } from '../src/sim/bot';
import { FESTIVAL, REWARDS, UPGRADES, upgradeCost, bondLevel, SPECIES, GIFTS, STREAK_REWARDS, STAGE_COUNT, assistLevel, gunTierFor, type UpgradeId, type SpeciesId } from '../src/config/balance';
import { upgradeTotal, computeStats } from '../src/sim/stats';
import type { LevelDef, MetaPower } from '../src/sim/types';

const runsPerDay = Number(process.argv[2] || 14);
const prof = process.argv[3] === 'novice' ? BOT_NOVICE : process.argv[3] === 'expert' ? BOT_EXPERT : BOT_PLAYER;
const levels: LevelDef[] = readdirSync('data/levels').filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(`data/levels/${f}`, 'utf8')));

const upgrades: Record<UpgradeId, number> = { power: 0, range: 0, health: 0, pressure: 0, splash: 0 };
const rescued: Partial<Record<SpeciesId, number>> = {};
const cleared = new Set<number>();
let coins = 0, totalCoins = 0, time = 0, day = 1;
const fails: Record<number, number> = {}; const tries: Record<number, number> = {};
const firstTry: Record<number, number> = {}; const clearedAt: Record<number, number> = {};
const profile: Record<number, MetaPower & { coinsSpent: number }> = {};
const clearProfile: Record<number, MetaPower> = {};
let failsInRow = 0; let spent = 0;

function bonds() { const b: Partial<Record<SpeciesId, number>> = {}; for (const s of SPECIES) { const lv = bondLevel(rescued[s.id] || 0); if (lv) b[s.id] = lv; } return b; }
function highest() { let h = 0; for (let s = 1; s <= STAGE_COUNT; s++) if (cleared.has(s)) h = s; return h; }
function open(id: UpgradeId) { const h = highest(); return id === 'power' || id === 'health' || (id === 'range' && h >= 1) || (id === 'pressure' && h >= 2) || (id === 'splash' && h >= 3); }
function shop() {
  // a sensible player: always buy the cheapest open upgrade, Stream Power favoured
  for (;;) {
    let best: UpgradeId | null = null, bc = Infinity;
    for (const u of UPGRADES) {
      if (!open(u.id) || upgrades[u.id] >= u.max) continue;
      const c = upgradeCost(u, upgrades[u.id]) * (u.id === 'power' ? 0.8 : u.id === 'health' ? 0.95 : 1);
      if (c < bc) { bc = c; best = u.id; }
    }
    if (!best) return;
    const real = upgradeCost(UPGRADES.find((u) => u.id === best)!, upgrades[best]);
    if (real > coins) return;
    coins -= real; spent += real; upgrades[best]++;
  }
}
function giftRate() { let r = 0; for (const s of SPECIES) { const lv = bondLevel(rescued[s.id] || 0); if (lv) r += GIFTS.perSpeciesPerHour * (1 + GIFTS.bondBonus * (lv - 1)); } return r; }

const log: string[] = [];
let run = 0;
while (highest() < STAGE_COUNT && run < 600) {
  run++;
  if (run > 1 && (run - 1) % runsPerDay === 0) {
    day++;
    const gift = Math.floor(giftRate() * GIFTS.capHours * 0.8); coins += gift; totalCoins += gift;
    const sr = STREAK_REWARDS[(day - 1) % 7]; if (sr.coins) { coins += sr.coins; totalCoins += sr.coins; } if (sr.species) rescued[sr.species] = (rescued[sr.species] || 0) + 1;
    const missions = 260; coins += missions; totalCoins += missions;
    shop();
  }
  const stage = highest() + 1;
  const level = levels.find((l) => l.stage === stage)!;
  const meta: MetaPower = { upgrades: { ...upgrades }, bonds: bonds(), assist: assistLevel(failsInRow) };
  if (!(stage in firstTry)) { firstTry[stage] = run; profile[stage] = { ...meta, upgrades: { ...upgrades }, coinsSpent: spent }; }
  tries[stage] = (tries[stage] || 0) + 1;
  const r = simulateStage(level, meta, prof, run * 31 + stage);
  time += r.time + 20; // + menus
  // weekend festival: install weekday from START_DOW (default Monday = 1, the slowest case for the first week)
  const dow = (Number(process.env.START_DOW ?? 1) + day - 1) % 7;
  let gain = r.coins + (FESTIVAL.days.includes(dow) ? Math.round(r.coins * (FESTIVAL.coinMul - 1)) : 0);
  if (r.cleared) { gain += REWARDS.stageFirstClear(stage); cleared.add(stage); clearedAt[stage] = run; failsInRow = 0; clearProfile[stage] = { ...meta, upgrades: { ...meta.upgrades } }; }
  else { fails[stage] = (fails[stage] || 0) + 1; failsInRow++; }
  for (const sp of r.run.rescued) rescued[sp] = (rescued[sp] || 0) + 1;
  coins += gain; totalCoins += gain;
  shop();
  const st = computeStats(meta, {}, 0);
  log.push(`run ${String(run).padStart(3)} d${day} s${String(stage).padStart(2)} ${r.cleared ? 'CLEAR' : 'fail '} rooms ${r.roomsCleared}/${level.rooms.length} t=${Math.round(r.time)}s hp=${Math.round(r.hpLeft * 100)}% rev=${r.revivesUsed} +${gain} up=${upgradeTotal(upgrades)} tier=${gunTierFor(upgradeTotal(upgrades))} dps=${Math.round(st.dps)} hp=${st.maxHp}${meta.assist ? ' ASSIST' + meta.assist : ''}`);
}

console.log(log.join('\n'));
console.log('\nstage  firstRun  clearRun  tries  fails');
for (let s = 1; s <= STAGE_COUNT; s++) console.log(`${String(s).padStart(5)}  ${String(firstTry[s] ?? '-').padStart(8)}  ${String(clearedAt[s] ?? '-').padStart(8)}  ${String(tries[s] ?? 0).padStart(5)}  ${String(fails[s] ?? 0).padStart(5)}`);
console.log(`\ntotal runs ${run}, days ${day}, play time ${(time / 3600).toFixed(1)}h, coins earned ${totalCoins}`);
const day1 = Math.max(...Object.entries(clearedAt).filter(([, r]) => r <= runsPerDay).map(([s]) => Number(s)), 0);
console.log(`day 1 (${runsPerDay} runs): cleared up to stage ${day1}`);
mkdirSync('data/balance', { recursive: true });
writeFileSync('data/balance/profile.json', JSON.stringify({ generated: 'tools/progression.ts', bot: prof.name, runsPerDay, stages: profile, clears: clearProfile }, null, 1));
