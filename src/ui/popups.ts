// Popups reachable from the hub: settings, login stamps, daily tasks, daily
// challenge, feature unlocks and the water-gun evolution celebration.
import { DAILY, FESTIVAL, GUN_TIERS, MISSION_ALL_BONUS, PLAYER, STREAK_REWARDS } from '../config/balance';
import { audio } from '../engine/audio';
import { buzz, hapticsSupported, setHaptics } from '../engine/haptics';
import { setQuality, defaultQuality, qualityLevel, type QualityLevel } from '../engine/quality';
import { deviceLang, getLang, setLang, t, num, type Lang } from '../i18n';
import {
  metaPower, claimAllMissionsBonus, claimMission, claimStreak, dailyRemainingMs, festivalActive, festivalOpen, festivalRemainingMs, missionDef, streakReward, type Feature,
} from '../meta/progress';
import { markDirty, resetSave, save, flush } from '../meta/save';
import { track } from '../services/analytics';
import { computeStats } from '../sim/stats';
import { h, icon, once } from './dom';
import { closeModal, isOpen, openModal, toast } from './modal';

// ---------------------------------------------------------------- settings
export function openSettings(onChange: () => void) {
  if (isOpen('settings')) return;
  const s = save().settings;
  const body = h('div', { class: 'settings' });
  const render = () => {
    const slider = (key: 'music' | 'sfx', ic: string) => {
      const input = h('input', { type: 'range', min: 0, max: 100, step: 5, value: Math.round(s[key] * 100), class: 'slider', 'aria-label': t(`settings.${key}`) }) as HTMLInputElement;
      const val = h('span', { class: 'set-val' }, `${Math.round(s[key] * 100)}`);
      input.addEventListener('input', () => { s[key] = Number(input.value) / 100; val.textContent = input.value; audio.setVolumes(s.music, s.sfx); markDirty(); });
      input.addEventListener('change', () => { audio.play('ui_tap'); track('settings_change', { key, value: s[key] }); });
      return h('div', { class: 'set-row' }, icon(ic, 40), h('span', { class: 'set-label' }, t(`settings.${key}`)), input, val);
    };
    const toggle = (label: string, ic: string, on: boolean, fn: (v: boolean) => void, note?: string) => h('div', { class: 'set-row' + (note ? ' with-note' : '') }, icon(ic, 40),
      h('span', { class: 'set-label' }, label, note ? h('small', {}, note) : null),
      h('button', { class: 'toggle' + (on ? ' on' : ''), role: 'switch', 'aria-checked': on ? 'true' : 'false', 'aria-label': label, onclick: () => { fn(!on); audio.play('ui_tap'); render(); } }, h('span', { class: 'knob' }), h('span', { class: 'tg-txt' }, on ? t('settings.on') : t('settings.off'))));
    const seg = <T extends string>(label: string, ic: string, cur: T, opts: [T, string][], fn: (v: T) => void, note?: string) => h('div', { class: 'set-block' },
      h('div', { class: 'set-row bare' }, icon(ic, 40), h('span', { class: 'set-label' }, label, note ? h('small', {}, note) : null)),
      h('div', { class: 'seg' }, ...opts.map(([v, l]) => h('button', { class: 'seg-btn' + (v === cur ? ' on' : ''), onclick: () => { if (v !== cur) { fn(v); audio.play('ui_tap'); render(); } } }, l))));
    body.replaceChildren(
      slider('music', 'ic_music'),
      slider('sfx', 'ic_sfx'),
      toggle(t('settings.vibration'), 'ic_vibe', s.vibration, (v) => { s.vibration = v; setHaptics(v); if (v) buzz('medium'); markDirty(); track('settings_change', { key: 'vibration', value: v }); }),
      toggle(t('settings.contrast'), 'ic_eye', s.contrast, (v) => { s.contrast = v; markDirty(); onChange(); track('settings_change', { key: 'contrast', value: v }); }, t('settings.contrastNote')),
      seg<Lang | 'auto'>(t('settings.language'), 'ic_lang', s.lang, [['auto', t('settings.lang.auto')], ['ko', t('settings.lang.ko')], ['en', t('settings.lang.en')]], (v) => {
        s.lang = v; setLang(v === 'auto' ? deviceLang() : v); markDirty(); track('settings_change', { key: 'lang', value: v }); onChange(); relabel();
      }),
      seg<QualityLevel | 'auto'>(t('settings.graphics'), 'ic_gfx', s.quality === 'auto' ? qualityLevel() : s.quality, [['low', t('settings.gfx.low')], ['medium', t('settings.gfx.medium')], ['high', t('settings.gfx.high')]], (v) => {
        s.quality = v; setQuality(v === 'auto' ? defaultQuality() : v); markDirty(); track('settings_change', { key: 'quality', value: v });
      }, t('settings.gfxNote')),
      h('div', { class: 'set-links' },
        h('button', { class: 'btn btn-plain', onclick: once(() => openCredits()) }, icon('ic_info', 28), t('settings.credits')),
        h('button', { class: 'btn btn-warn', onclick: once(() => confirmReset()) }, icon('ic_reset', 28), t('settings.reset'))),
      h('div', { class: 'set-ver' }, t('settings.version', { v: '1.0.0' })),
    );
  };
  const relabel = () => { const el = document.querySelector('.modal-title'); if (el) el.textContent = t('settings.title'); };
  render();
  openModal(body, { id: 'settings', title: t('settings.title'), titleIcon: 'ic_gear', onClose: () => { flush(); onChange(); } });
}

function openCredits() {
  openModal(h('div', { class: 'credits' }, ...t('settings.creditsText').split('\n').map((l) => h('p', {}, l))), { id: 'credits', title: t('settings.credits') });
}

function confirmReset() {
  const body = h('div', { class: 'confirm' }, h('p', {}, t('settings.resetConfirm')),
    h('div', { class: 'confirm-btns' },
      h('button', { class: 'btn btn-plain', onclick: once(() => closeModal('reset')) }, t('common.cancel')),
      h('button', { class: 'btn btn-warn', onclick: once(() => { resetSave(); location.reload(); }) }, t('settings.resetYes'))));
  openModal(body, { id: 'reset', title: t('settings.reset') });
}

// ---------------------------------------------------------------- login stamps
export function openStreak(onDone: () => void) {
  if (isOpen('streak')) return;
  const s = save();
  const day = Math.max(1, s.streak.day);
  const week = Math.floor((day - 1) / 7);
  const body = h('div', { class: 'streak' });
  const render = () => {
    const cells = Array.from({ length: 7 }, (_, i) => {
      const d = week * 7 + i + 1; const r = streakReward(d);
      const got = d < day || (d === day && s.streak.claimedToday); const today = d === day;
      return h('div', { class: 'stamp' + (got ? ' got' : '') + (today ? ' today' : '') },
        h('div', { class: 'stamp-day' }, t('streak.day', { n: d })),
        r.species ? icon(got ? `p_${r.species}` : `sil_${r.species}`, 50) : icon('p_coin_0', 40),
        h('div', { class: 'stamp-val' }, r.species ? t(`species.${r.species}`) : num(r.coins!)),
        got ? icon('ic_check', 30, 'stamp-check') : null);
    });
    const tomorrow = streakReward(day + 1);
    const giftName = tomorrow.species ? t('streak.visitor', { name: t(`species.${tomorrow.species}`) }) : t('streak.coins', { n: num(tomorrow.coins!) });
    body.replaceChildren(
      h('div', { class: 'stamps' }, ...cells),
      s.streak.claimedToday
        ? h('div', { class: 'streak-next' }, icon(tomorrow.species ? `sil_${tomorrow.species}` : 'ic_gift', 44), h('span', {}, t('streak.tomorrowHint', { gift: giftName })))
        : h('button', { class: 'btn btn-primary big', onclick: once(() => {
          const r = claimStreak(); if (!r) return;
          audio.play(r.species ? 'rescue' : 'coin_burst', { vol: 1 }); buzz('success');
          toast(r.species ? t('streak.visitor', { name: t(`species.${r.species}`) }) : `+${num(r.coins!)}`, r.species ? `p_${r.species}` : 'p_coin_0', 2400);
          render(); onDone();
        }) }, icon('ic_gift', 32), t('common.claim')),
    );
  };
  render();
  openModal(body, { id: 'streak', title: t('streak.title'), titleIcon: 'ic_streak' });
  void STREAK_REWARDS;
}

// ---------------------------------------------------------------- daily tasks
export function openMissions(onDone: () => void) {
  if (isOpen('missions')) return;
  const s = save();
  const body = h('div', { class: 'missions' });
  const render = () => {
    const rows = s.missions.ids.map((id, i) => {
      const def = missionDef(id); const p = s.missions.progress[i]; const done = p >= def.target; const claimed = s.missions.claimed[i];
      return h('div', { class: 'mission' + (claimed ? ' claimed' : '') },
        h('div', { class: 'mission-txt' }, h('div', { class: 'mission-name' }, t(`mission.${id}`, { n: def.target })),
          h('div', { class: 'bar thin mbar' }, h('div', { class: 'bar-fill xp', style: `width:${Math.round((p / def.target) * 100)}%` })),
          h('div', { class: 'mission-prog' }, `${num(p)} / ${num(def.target)}`)),
        claimed ? icon('ic_check', 40) : h('button', { class: 'btn up-buy ' + (done ? 'ok' : 'off'), onclick: () => {
          if (!done) { audio.play('ui_locked', { vol: 0.6 }); return; }
          const c = claimMission(i); if (c) { audio.play('coin_burst', { vol: 0.9 }); buzz('success'); toast(`+${num(c)}`, 'p_coin_0'); render(); onDone(); }
        } }, h('span', { class: 'up-cost' }, icon('p_coin_0', 24), h('span', {}, num(def.coins)))));
    });
    const allDone = s.missions.claimed.length > 0 && s.missions.claimed.every(Boolean);
    const ms = dailyRemainingMs(); const hh = Math.floor(ms / 3600000), mm = Math.floor((ms % 3600000) / 60000);
    body.replaceChildren(...rows,
      h('div', { class: 'mission all' + (s.missions.allClaimed ? ' claimed' : '') }, icon('ic_gift', 48), h('div', { class: 'mission-txt' }, h('div', { class: 'mission-name' }, t('missions.all'))),
        s.missions.allClaimed ? icon('ic_check', 40) : h('button', { class: 'btn up-buy ' + (allDone ? 'ok' : 'off'), onclick: () => { const c = claimAllMissionsBonus(); if (c) { audio.play('coin_burst'); buzz('success'); toast(`+${num(c)}`, 'p_coin_0'); render(); onDone(); } else audio.play('ui_locked', { vol: 0.6 }); } }, h('span', { class: 'up-cost' }, icon('p_coin_0', 24), h('span', {}, num(MISSION_ALL_BONUS))))),
      h('div', { class: 'mission-reset' }, t('missions.resetIn', { h: hh, m: mm })));
  };
  render();
  openModal(body, { id: 'missions', title: t('missions.title'), titleIcon: 'ic_missions' });
}

// ---------------------------------------------------------------- daily challenge
export function openDaily(mod: string, onPlay: () => void) {
  if (isOpen('daily')) return;
  const s = save();
  const body = h('div', { class: 'daily' },
    h('div', { class: 'daily-card' }, icon(mod === 'big' ? 'm_chunky_normal' : mod === 'fast' ? 'm_dasher_normal' : mod === 'swarm' ? 'm_blob_normal' : 'goo_drop_0', 80),
      h('div', {}, h('div', { class: 'daily-mod' }, t(`daily.mod.${mod}`)), h('div', { class: 'daily-desc' }, t(`daily.mod.${mod}.desc`)))),
    h('div', { class: 'daily-reward' }, icon('p_coin_0', 32), h('span', {}, s.daily.cleared ? t('daily.done', { n: DAILY.replayCoins }) : t('daily.reward', { n: DAILY.firstClearCoins }))),
    s.daily.streak > 0 ? h('div', { class: 'daily-streak' }, icon('ic_streak', 30), t('daily.streak', { n: s.daily.streak })) : null,
    festivalOpen() && !festivalActive() ? h('div', { class: 'daily-streak' }, icon('ic_festival', 30), h('span', {}, t('festival.next', { x: FESTIVAL.coinMul }))) : null,
    h('button', { class: 'btn btn-primary big', onclick: once(() => { closeModal('daily', true); onPlay(); }) }, icon('ic_play', 32), t('daily.play')));
  openModal(body, { id: 'daily', title: t('daily.title'), titleIcon: 'ic_daily' });
}

// ---------------------------------------------------------------- weekend festival
export function openFestival(onClose?: () => void) {
  if (isOpen('festival')) return;
  const ms = festivalRemainingMs(); const d = Math.floor(ms / 86400000), hh = Math.floor((ms % 86400000) / 3600000), mm = Math.floor((ms % 3600000) / 60000);
  const left = d > 0 ? t('time.dh', { d, h: hh }) : hh > 0 ? t('time.hm', { h: hh, m: mm }) : t('time.m', { m: Math.max(1, mm) });
  const body = h('div', { class: 'unlock festival' }, icon('ic_festival', 110, 'unlock-ic'),
    h('div', { class: 'unlock-title' }, t('festival.desc', { x: FESTIVAL.coinMul })),
    h('div', { class: 'fest-left' }, t('festival.left', { t: left })),
    h('button', { class: 'btn btn-primary big', onclick: once(() => closeModal('festival')) }, t('common.ok')));
  openModal(body, { id: 'festival', title: t('festival.title'), titleIcon: 'ic_festival', onClose });
  track('festival_view', { remainingH: Math.round(ms / 3600000) });
}

// ---------------------------------------------------------------- unlock + evolve
const UNLOCK_ICON: Record<Feature, string> = { upgrades: 'ic_upgrade', shelter: 'ic_shelter', missions: 'ic_missions', daily: 'ic_daily', decor: 'dc_cushion' };

export function openUnlock(f: Feature, onClose: () => void) {
  audio.play('unlock', { vol: 0.9 }); buzz('success');
  const body = h('div', { class: 'unlock' }, icon(UNLOCK_ICON[f], 110, 'unlock-ic'), h('div', { class: 'unlock-title' }, t(`unlock.${f}`)),
    h('button', { class: 'btn btn-primary big', onclick: once(() => closeModal(`unlock-${f}`)) }, t('common.ok')));
  openModal(body, { id: `unlock-${f}`, cls: 'modal-unlock', onClose });
}

// the exact jump this evolution gives, from the gun tier table
function evolveGains(a: number, b: number): string[] {
  const A = GUN_TIERS[a], B = GUN_TIERS[b]; const pc = (x: number, y: number) => Math.round((y / x - 1) * 100);
  // range adds a flat amount that upgrades and friends then scale, so show the scaled number seen in game
  const rangeMul = computeStats(metaPower(), {}, 0).range / (PLAYER.range + B.range);
  return [t('evolve.dmg', { v: pc(A.dmg, B.dmg) }), t('evolve.width', { v: pc(A.width, B.width) }), t('evolve.splash', { v: pc(A.splash, B.splash) }), t('evolve.range', { v: Math.round((B.range - A.range) * rangeMul) })];
}

export function openEvolve(tier: number) {
  audio.stinger('stinger_evolve'); buzz('heavy');
  const prev = Math.max(0, tier - 1);
  const body = h('div', { class: 'evolve' },
    h('div', { class: 'evolve-row' }, icon(`gun_${prev}`, 70, 'evolve-old'), icon('ic_arrow', 44), h('span', { class: 'evolve-glow' }, icon(`gun_${tier}`, 120, 'evolve-new'))),
    h('div', { class: 'evolve-name' }, t(`gun.${tier}`)),
    h('div', { class: 'evolve-stats' }, ...evolveGains(prev, tier).map((g) => h('span', { class: 'evolve-stat' }, g))),
    tier < GUN_TIERS.length - 1 ? h('div', { class: 'evolve-next' }, icon('gun_6', 54, 'locked'), h('span', {}, t('upgrade.dream'))) : null,
    h('button', { class: 'btn btn-primary big', onclick: once(() => closeModal('evolve')) }, t('common.ok')));
  openModal(body, { id: 'evolve', title: t('gun.evolved'), cls: 'modal-evolve' });
}

void getLang; void hapticsSupported;
