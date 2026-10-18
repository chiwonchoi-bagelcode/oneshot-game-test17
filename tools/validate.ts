// Validates every stage: structure + reachability, then bot playthroughs at the
// expected power for that stage (from tools/progression.ts) and at zero power
// for the first stages. Exits non-zero on any error.
// Usage: node tools/run-ts.mjs tools/validate.ts [--fast] [stage...]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { validateLevel } from '../src/sim/validate';
import { simulateStage, ZERO_META } from '../src/sim/playthrough';
import { BOT_EXPERT, BOT_NOVICE, BOT_PLAYER } from '../src/sim/bot';
import { STAGE_COUNT } from '../src/config/balance';
import type { LevelDef, MetaPower } from '../src/sim/types';

const args = process.argv.slice(2);
const fast = args.includes('--fast');
const only = args.filter((a) => /^\d+$/.test(a)).map(Number);
const files = readdirSync('data/levels').filter((f) => /^stage-\d+\.json$/.test(f)).sort();
const levels: LevelDef[] = files.map((f) => JSON.parse(readFileSync(`data/levels/${f}`, 'utf8')));
let profile: Record<string, MetaPower> = {}; let clears: Record<string, MetaPower> = {};
try { const p = JSON.parse(readFileSync('data/balance/profile.json', 'utf8')); profile = p.stages; clears = p.clears ?? {}; } catch { /* none yet */ }

let errors = 0;
const report: string[] = [];
const stages = new Set(levels.map((l) => l.stage));
for (let s = 1; s <= STAGE_COUNT; s++) if (!stages.has(s)) { console.log(`ERROR stage ${s} is missing`); errors++; }
const ids = new Set<string>();
for (const lv of levels) {
  if (only.length && !only.includes(lv.stage)) continue;
  if (ids.has(lv.id)) { console.log(`ERROR duplicate id ${lv.id}`); errors++; }
  ids.add(lv.id);
  const issues = validateLevel(lv);
  for (const i of issues) {
    const line = `${i.level.toUpperCase()} stage ${lv.stage} room ${i.room + 1}: ${i.msg}`;
    if (i.level === 'error') { errors++; console.log(line); } else if (!fast) console.log(line);
  }
  if (issues.some((i) => i.level === 'error')) continue;
  // playthroughs
  const meta = profile[lv.stage] ?? ZERO_META;
  const seeds = fast ? 2 : 5;
  const res: string[] = [];
  // first attempt (power when players usually reach the stage): informs the difficulty curve
  for (const bot of [BOT_EXPERT, BOT_PLAYER, BOT_NOVICE]) {
    let wins = 0, t = 0, hp = 0;
    for (let k = 1; k <= seeds; k++) { const r = simulateStage(lv, meta, bot, k * 101 + lv.stage); if (r.cleared) wins++; t += r.time; hp += r.hpLeft; }
    res.push(`${bot.name} ${wins}/${seeds} ${Math.round(t / seeds)}s hp${Math.round((hp / seeds) * 100)}%`);
  }
  // proof of clearability: the expert bot must clear it at the power players have when they clear it
  const proofMeta = clears[lv.stage] ?? meta;
  let proof = 0; for (let k = 1; k <= seeds; k++) if (simulateStage(lv, proofMeta, BOT_EXPERT, k * 57 + lv.stage).cleared) proof++;
  res.push(`proof ${proof}/${seeds}`);
  if (proof === 0) { errors++; console.log(`ERROR stage ${lv.stage}: the expert bot could not clear it even at clear-time power`); }
  if (lv.stage <= 3) {
    let wins = 0; for (let k = 1; k <= seeds; k++) if (simulateStage(lv, ZERO_META, BOT_NOVICE, k * 7).cleared) wins++;
    res.push(`novice@zero ${wins}/${seeds}`);
    if (wins < seeds) { errors++; console.log(`ERROR stage ${lv.stage}: a first-time player (novice bot, no upgrades) should always clear it`); }
  }
  const line = `stage ${String(lv.stage).padStart(2)} ${lv.id.padEnd(11)} rooms ${lv.rooms.length}  ${res.join(' | ')}`;
  report.push(line); console.log(line);
}
writeFileSync('.cache/validate-report.txt', report.join('\n'));
console.log(errors ? `\n${errors} error(s)` : '\nall stages valid');
process.exit(errors ? 1 : 0);
