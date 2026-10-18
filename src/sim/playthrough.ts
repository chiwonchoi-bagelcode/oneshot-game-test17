// Headless playthrough of a whole stage with a bot. Used by tools (validation,
// balance) and by the attract-mode capture. Same code path as the real game.
import { PLAYER } from '../config/balance';
import { Bot, type BotProfile } from './bot';
import { RoomSim } from './room';
import { applySkill, createRun, rollSkillChoices, type RunMods, type RunState } from './run';
import type { LevelDef, MetaPower } from './types';

export interface PlayResult {
  cleared: boolean;
  roomsCleared: number;
  time: number;
  hpLeft: number;
  revivesUsed: number;
  rescued: number;
  coins: number;
  washed: number;
  hits: number;
  deathRoom: number;
  levelUps: number;
  run: RunState;
}

export function simulateStage(level: LevelDef, meta: MetaPower, profile: BotProfile, seed: number, opts: { revives?: number; mods?: RunMods; maxTime?: number } = {}): PlayResult {
  const run = createRun(level, meta, { known: [], seed, mods: opts.mods, revives: opts.revives ?? PLAYER.revivesPerRun });
  const bot = new Bot(profile, seed * 7 + 3);
  const dt = 1 / 60;
  const maxTime = opts.maxTime ?? 600;
  let revivesUsed = 0, deathRoom = -1, levelUps = 0;
  let cleared = false;
  for (let ri = 0; ri < level.rooms.length; ri++) {
    run.roomIndex = ri;
    const sim = new RoomSim(run, ri, seed * 131 + ri * 17);
    let t = 0; let roomTimeout = false;
    while (true) {
      const input = bot.decide(sim, dt);
      sim.step(dt, input);
      sim.drain();
      t += dt;
      if (sim.state === 'clear' && run.pendingLevelUps > 0 && sim.pickupsLeft() === 0) {
        while (run.pendingLevelUps > 0) {
          const ch = rollSkillChoices(run);
          if (!ch.length) { run.pendingLevelUps = 0; break; }
          run.hp = sim.player.hp;
          applySkill(run, bot.chooseSkill(ch, run.hp / run.stats.maxHp));
          sim.player.hp = run.hp;
          levelUps++;
        }
      }
      if (sim.state === 'dead') {
        if (run.revives > 0) { run.revives--; revivesUsed++; sim.revive(run.stats.reviveHp); continue; }
        deathRoom = ri; break;
      }
      if (sim.state === 'done') break;
      if (t > 240 || run.time > maxTime) { roomTimeout = true; break; }
    }
    run.hp = sim.player.hp; run.shield = sim.player.shield;
    if (sim.state === 'dead' || roomTimeout) { deathRoom = ri; break; }
    if (ri === level.rooms.length - 1) cleared = true;
  }
  return {
    cleared, roomsCleared: run.roomsCleared, time: run.time, hpLeft: run.hp / run.stats.maxHp, revivesUsed,
    rescued: run.rescued.length, coins: run.coins, washed: run.washed, hits: run.hits, deathRoom, levelUps, run,
  };
}

export const ZERO_META: MetaPower = { upgrades: { power: 0, range: 0, health: 0, pressure: 0, splash: 0 }, bonds: {}, assist: false };
