// Detailed bot runs for one stage at the expected power from data/balance/profile.json.
// Usage: node tools/run-ts.mjs tools/stagetest.ts <stage> [bot=player] [seeds=6] [powerStage=stage]
import { readFileSync } from 'node:fs';
import { simulateStage, ZERO_META } from '../src/sim/playthrough';
import { BOT_EXPERT, BOT_NOVICE, BOT_PLAYER } from '../src/sim/bot';
import { computeStats } from '../src/sim/stats';
import type { LevelDef, MetaPower } from '../src/sim/types';

const stage = Number(process.argv[2] || 1);
const prof = process.argv[3] === 'novice' ? BOT_NOVICE : process.argv[3] === 'expert' ? BOT_EXPERT : BOT_PLAYER;
const seeds = Number(process.argv[4] || 6);
const ps = Number(process.argv[5] || stage);
const level = JSON.parse(readFileSync(`data/levels/stage-${String(stage).padStart(2, '0')}.json`, 'utf8')) as LevelDef;
let meta: MetaPower = ZERO_META;
try { const p = JSON.parse(readFileSync('data/balance/profile.json', 'utf8')); if (p.stages[ps]) meta = p.stages[ps]; } catch { /* zero */ }
const st = computeStats(meta, {}, 0);
console.log(`stage ${stage} bot=${prof.name} power@${ps}: dps ${Math.round(st.dps)} hp ${st.maxHp} range ${Math.round(st.range)} tier ${st.gunTier}`);
let wins = 0;
for (let s = 1; s <= seeds; s++) {
  const r = simulateStage(level, meta, prof, s * 977);
  if (r.cleared) wins++;
  const dmg = Object.entries(r.run.dmgBy).map(([k, v]) => `${k}:${Math.round(v)}`).join(' ');
  console.log(`  ${r.cleared ? 'W' : 'L'} t=${Math.round(r.time)}s rooms=${r.roomsCleared}/${level.rooms.length} hits=${r.hits} rev=${r.revivesUsed} hpEnd=${Math.round(r.hpLeft * 100)}% lv=${r.levelUps} skills=${r.run.skillOrder.join(',')} dmg[${dmg}]`);
}
console.log(`  clear ${wins}/${seeds}`);
