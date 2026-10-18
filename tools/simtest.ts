// Quick headless check: run bots through a stage and print outcomes.
// Usage: node tools/run-ts.mjs tools/simtest.ts [stage]
import { readFileSync } from 'node:fs';
import { simulateStage, ZERO_META } from '../src/sim/playthrough';
import { BOT_EXPERT, BOT_NOVICE, BOT_PLAYER } from '../src/sim/bot';
import type { LevelDef } from '../src/sim/types';

const stage = Number(process.argv[2] || 1);
const level = JSON.parse(readFileSync(`data/levels/stage-${String(stage).padStart(2, '0')}.json`, 'utf8')) as LevelDef;
for (const prof of [BOT_EXPERT, BOT_PLAYER, BOT_NOVICE]) {
  const rows: string[] = [];
  let wins = 0;
  for (let seed = 1; seed <= 8; seed++) {
    const r = simulateStage(level, ZERO_META, prof, seed);
    if (r.cleared) wins++;
    rows.push(`${r.cleared ? 'W' : 'L'} t=${r.time.toFixed(0)}s hp=${(r.hpLeft * 100).toFixed(0)}% rev=${r.revivesUsed} rooms=${r.roomsCleared} res=${r.rescued} coins=${r.coins} hits=${r.hits} lv=${r.levelUps}`);
  }
  console.log(`== ${prof.name}: ${wins}/8`);
  for (const r of rows) console.log('  ' + r);
}
