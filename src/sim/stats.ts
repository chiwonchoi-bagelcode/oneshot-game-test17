// Turns permanent progress (upgrades, gun tier, animal bonds) and in-run skills
// into the numbers the room simulation uses.
import {
  PLAYER, UPGRADES, GUN_TIERS, gunTierFor, SPECIES, SKILL_VALUES, RESCUE, ASSIST,
  type BonusKind, type UpgradeId,
} from '../config/balance';
import type { MetaPower, PlayerStats, SkillStacks } from './types';

export function upgradeTotal(up: Record<UpgradeId, number>): number {
  let t = 0; for (const d of UPGRADES) t += up[d.id] || 0; return t;
}

export function bondBonus(meta: MetaPower, kind: BonusKind): number {
  let v = 0;
  for (const s of SPECIES) {
    const lv = meta.bonds[s.id] || 0;
    if (!lv) continue;
    if (s.bonus === kind) v += s.per * lv;
    if (s.bonus === 'all' && (kind === 'damage' || kind === 'maxHp' || kind === 'coins')) v += s.per * lv;
  }
  return v;
}

function per(id: UpgradeId): number { return UPGRADES.find((u) => u.id === id)!.per; }

export function computeStats(meta: MetaPower, skills: SkillStacks, cheer: number): PlayerStats {
  const up = meta.upgrades;
  const tier = gunTierFor(upgradeTotal(up));
  const T = GUN_TIERS[tier];
  const sk = (id: keyof SkillStacks) => skills[id] || 0;

  const dmgMul = (1 + per('power') * (up.power || 0)) * T.dmg * (1 + bondBonus(meta, 'damage'))
    * (1 + SKILL_VALUES.thickDmg * sk('thick')) * (1 + ASSIST.helpDamage * (meta.assist || 0));
  const cheerMul = 1 + RESCUE.cheerDamagePerAnimal * Math.min(cheer, RESCUE.cheerMaxAnimals);
  const hpMul = (1 + per('health') * (up.health || 0)) * (1 + bondBonus(meta, 'maxHp'))
    * (1 + SKILL_VALUES.vitalityHp * sk('vitality')) * (1 + ASSIST.helpHp * (meta.assist || 0));
  const rangeMul = (1 + per('range') * (up.range || 0)) * (1 + bondBonus(meta, 'range')) * (1 + SKILL_VALUES.rangeAdd * sk('range'));
  const splashMul = (1 + per('splash') * (up.splash || 0)) * T.splash * (1 + bondBonus(meta, 'splash'));
  const shield = sk('shield');

  return {
    maxHp: Math.round(PLAYER.maxHp * hpMul),
    moveSpeed: PLAYER.moveSpeed * (1 + bondBonus(meta, 'move')) * (1 + SKILL_VALUES.speedAdd * sk('speed')),
    gooSlow: Math.min(0.95, PLAYER.gooSlow + SKILL_VALUES.speedGoo * sk('speed') + bondBonus(meta, 'gooWalk')),
    dps: PLAYER.dps * dmgMul * cheerMul,
    range: (PLAYER.range + T.range) * rangeMul,
    width: PLAYER.streamWidth * T.width * (1 + 0.05 * (up.power || 0)) * (1 + SKILL_VALUES.thickWidth * sk('thick')),
    pressureCharge: PLAYER.pressureCharge / ((1 + per('pressure') * (up.pressure || 0)) * (1 + bondBonus(meta, 'charge')) * (1 + SKILL_VALUES.turboCharge * sk('turbo'))),
    pressureMax: (PLAYER.pressureMax + per('pressure') * (up.pressure || 0) + SKILL_VALUES.turboMax * sk('turbo')) * (1 + bondBonus(meta, 'pressureMax')),
    pressureDrain: PLAYER.pressureDrainMove * Math.pow(1 - SKILL_VALUES.keepDrain, sk('keep')),
    invuln: PLAYER.invuln,
    pickupRadius: PLAYER.pickupRadius * (1 + bondBonus(meta, 'pickup')) * (1 + SKILL_VALUES.magnetRadius * sk('magnet')),
    burstRadius: PLAYER.burstRadius * Math.sqrt(splashMul) * (1 + SKILL_VALUES.splashRadius * sk('splash')),
    burstDmg: PLAYER.burstDamage * splashMul * (1 + SKILL_VALUES.splashDmg * sk('splash')),
    burstClean: PLAYER.burstClean * Math.sqrt(splashMul) * (1 + SKILL_VALUES.splashRadius * sk('splash')),
    armor: Math.max(0.5, 1 - bondBonus(meta, 'armor')),
    xpMult: (1 + bondBonus(meta, 'xp')) * (1 + SKILL_VALUES.magnetXp * sk('magnet')),
    coinMult: 1 + bondBonus(meta, 'coins'),
    multi: sk('multi'),
    pierce: sk('pierce'),
    chain: sk('chain'),
    shieldRegen: shield ? SKILL_VALUES.shieldRegen[Math.min(shield, 3) - 1] : 0,
    trail: sk('trail'),
    rescueHeal: RESCUE.healOnRescue * (1 + bondBonus(meta, 'rescueHeal')),
    reviveHp: Math.min(1, PLAYER.reviveHp + bondBonus(meta, 'revive')),
    gunTier: tier,
    cheerPer: RESCUE.cheerDamagePerAnimal,
  };
}
