// Developer panel — only bundled into the dev build (dev.html). Grants coins,
// jumps/clears stages, moves the calendar, fills gifts, gives animals, sets
// upgrades, loads save presets and shows FPS + the analytics log.
import { SPECIES, STAGE_COUNT, UPGRADES } from '../config/balance';
import { quality } from '../engine/quality';
import { earn, refreshDay } from '../meta/progress';
import { flush, markDirty, newSave, replaceSave, save } from '../meta/save';
import { debugBuffer } from '../services/analytics';
import type { App } from '../app';

export function presetSave(name: string) {
  const s = newSave();
  const clear = (n: number) => { for (let i = 1; i <= n; i++) s.cleared[`s${i}`] = { best: 90, clears: 1, stars: 2 }; };
  if (name === 'day1') { clear(3); s.coins = 260; s.stats.runs = 5; s.rescued = { puppy: 3, bunny: 2, squirrel: 2 }; s.upgrades = { power: 3, range: 1, health: 2, pressure: 0, splash: 0 }; }
  if (name === 'mid') { clear(8); s.coins = 1400; s.stats.runs = 16; s.rescued = { puppy: 6, bunny: 4, squirrel: 3, fox: 3, hedgehog: 1, fawn: 1 }; s.upgrades = { power: 8, range: 4, health: 6, pressure: 2, splash: 2 }; s.decor = ['ball', 'cushion']; }
  if (name === 'late') { clear(22); s.coins = 6000; s.stats.runs = 60; for (const sp of SPECIES) s.rescued[sp.id] = sp.region === 'lake' ? 2 : 8; delete s.rescued.frog; s.upgrades = { power: 20, range: 10, health: 15, pressure: 8, splash: 8 }; s.decor = ['ball', 'cushion', 'bowl', 'flowers', 'pond', 'treehouse']; }
  if (name === 'max') { clear(30); s.coins = 99999; s.stats.runs = 120; for (const sp of SPECIES) s.rescued[sp.id] = 15; for (const u of UPGRADES) s.upgrades[u.id] = u.max; s.decor = ['ball', 'cushion', 'bowl', 'flowers', 'pond', 'treehouse', 'slide', 'fountain']; }
  for (const k of ['upgrades', 'shelter', 'missions', 'daily', 'decor']) if (name !== 'fresh') s.flags[`unlock_${k}`] = true;
  s.giftsAt = Date.now() - 3 * 3600000;
  return s;
}

// Applied before the save is loaded so the whole session starts from the preset.
export function applyPresetFromUrl() {
  const preset = new URLSearchParams(location.search).get('preset');
  if (preset && !sessionStorage.getItem('preset-applied-' + preset)) {
    sessionStorage.setItem('preset-applied-' + preset, '1');
    try { localStorage.setItem('splash-rescue-save', JSON.stringify(presetSave(preset))); } catch { /* ignore */ }
  }
}

export function initDebug(app: App) {
  const btn = document.createElement('button');
  btn.textContent = 'DEV';
  btn.className = 'dbg-toggle';
  const panel = document.createElement('div');
  panel.className = 'dbg-panel';
  panel.style.display = 'none';
  const fps = document.createElement('div'); fps.className = 'dbg-fps';
  document.body.append(btn, panel, fps);
  btn.onclick = () => { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; render(); };
  let acc = 0, frames = 0;
  app.debug.onFrame = (dt) => { acc += dt; frames++; if (acc > 0.5) { fps.textContent = `${Math.round(frames / acc)} fps · ${quality().dprCap}x`; acc = 0; frames = 0; } };
  const act = (label: string, fn: () => void) => { const b = document.createElement('button'); b.textContent = label; b.onclick = () => { fn(); markDirty(); flush(); render(); }; return b; };
  const row = (title: string, ...items: HTMLElement[]) => { const d = document.createElement('div'); d.className = 'dbg-row'; const h = document.createElement('b'); h.textContent = title; d.append(h, ...items); return d; };
  const stageInput = document.createElement('input'); stageInput.type = 'number'; stageInput.min = '1'; stageInput.max = String(STAGE_COUNT); stageInput.value = String(Math.min(STAGE_COUNT, Object.keys(save().cleared).length + 1));
  const render = () => {
    if (panel.style.display === 'none') return;
    const s = save();
    const log = document.createElement('pre'); log.className = 'dbg-log';
    log.textContent = debugBuffer.events.slice(-25).reverse().map((e) => `${new Date(e.t).toLocaleTimeString()} ${e.name} ${JSON.stringify(e.params)}`).join('\n');
    panel.replaceChildren(
      row(`Coins ${s.coins}`, act('+100', () => earn(100, 'debug')), act('+1k', () => earn(1000, 'debug')), act('+10k', () => earn(10000, 'debug'))),
      row('Stage', stageInput, act('Play', () => app.playStage(Number(stageInput.value))), act('Clear ≤N', () => { for (let i = 1; i <= Number(stageInput.value); i++) s.cleared[`s${i}`] ||= { best: 99, clears: 1, stars: 1 }; app.goHome('map'); }), act('Unclear all', () => { s.cleared = {}; app.goHome('map'); })),
      row(`Day +${s.dayOffset} (streak ${s.streak.day})`, act('Next day', () => { s.dayOffset += 1; refreshDay(); app.goHome('map'); }), act('Gifts full', () => { s.giftsAt = Date.now() + s.dayOffset * 86400000 - 9 * 3600000; })),
      row('Animals', act('All x1', () => { for (const sp of SPECIES) s.rescued[sp.id] = Math.max(1, s.rescued[sp.id] || 0); }), act('All bond max', () => { for (const sp of SPECIES) s.rescued[sp.id] = 15; }), act('None', () => { s.rescued = {}; })),
      row('Upgrades', act('+5 all', () => { for (const u of UPGRADES) s.upgrades[u.id] = Math.min(u.max, (s.upgrades[u.id] || 0) + 5); }), act('Max', () => { for (const u of UPGRADES) s.upgrades[u.id] = u.max; }), act('Reset', () => { for (const u of UPGRADES) s.upgrades[u.id] = 0; })),
      row('Preset', ...['fresh', 'day1', 'mid', 'late', 'max'].map((n) => act(n, () => { replaceSave(presetSave(n)); app.goHome('map'); }))),
      row('Go', act('Title', () => app.showTitle()), act('Map', () => app.goHome('map')), act('Shelter', () => app.goHome('shelter')), act('Upgrades', () => app.goHome('upgrade')), act('Daily', () => app.playDaily())),
      log,
    );
  };
}
