// First-timer journey on the release build: fresh install → title → runs for a
// set time (the player bot plays, menus are tapped like a person: buy what the
// result screen offers, close popups, go to the next area), then settings and a
// language switch, a reload (does progress survive?), and the next day (save's
// day offset +1, as the debug panel does) to check the day-2 return.
// Usage: node tools/qa-journey.mjs <name> <w> <h> <lang> <minutes> [safeTop] [safeBottom]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const [name = 'small-ko', W = '360', H = '640', LANG = 'ko-KR', MIN = '10', ST = '24', SB = '0'] = process.argv.slice(2);
const out = `.cache/qa/${name}`; mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: LANG });
const page = await ctx.newPage();
await page.addInitScript(({ t, b }) => { window.__SAFE__ = { t, b }; }, { t: +ST, b: +SB });
const log = []; const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/vibrate/.test(m.text())) errors.push(m.text()); });
const t0 = Date.now();
const note = (k, v = {}) => { const e = { t: Math.round((Date.now() - t0) / 1000), k, ...v }; log.push(e); console.log(name, JSON.stringify(e)); };
let shots = 0;
const shot = async (label) => page.screenshot({ path: `${out}/${String(++shots).padStart(3, '0')}-${label}.png` });
const save = () => page.evaluate(() => { const s = JSON.parse(localStorage.getItem('splash-rescue-save') || 'null'); return s && { coins: s.coins, runs: s.stats.runs, cleared: Object.keys(s.cleared).length, rescued: Object.values(s.rescued).reduce((a, b) => a + b, 0), species: Object.keys(s.rescued).length, upgrades: Object.values(s.upgrades).reduce((a, b) => a + b, 0), streak: s.streak.day, lang: s.settings.lang, day: s.dayOffset }; });
const vis = (sel) => page.locator(sel).first().isVisible().catch(() => false);
const tap = async (sel) => { const b = await page.locator(sel).first().boundingBox().catch(() => null); if (!b) return false; await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); return true; };

await page.goto('http://localhost:8123/index.html?bot=player&seed=11');
await page.waitForTimeout(2500);
await shot('title'); note('title', { button: await page.locator('.title-go').innerText() });
await tap('.title-go');
let stallKey = '', stallSince = Date.now();
let lastState = '', popups = 0, runs = 0, buys = 0, hubVisits = 0, runStart = 0;
const budget = +MIN * 60000;
while (Date.now() - t0 < budget) {
  await page.waitForTimeout(700);
  const result = await vis('.result');
  const playing = !result && (await vis('.hud-pause')); // the run's HUD stays under the result screen
  const modal = await vis('.modal-back');
  const hub = await vis('.nav');
  const state = playing ? 'play' : result ? 'result' : modal ? 'popup' : hub ? 'hub' : 'other';
  if (state !== lastState) {
    if (state === 'play') { runStart = Date.now(); note('run_start', { stage: await page.evaluate(() => window.__APP__?.playing?.run?.level.stage ?? null) }); }
    lastState = state;
  }
  if (playing) {
    // the bot plays; level-up cards are picked by the bot. Watch for a stall.
    const st = await page.evaluate(() => { const p = window.__APP__?.playing; return p ? { t: Math.round(p.run.time), room: p.run.roomIndex, paused: p.paused, state: p.sim.state, modal: document.querySelector('.modal-back')?.textContent.slice(0, 40) ?? null } : null; });
    const key = JSON.stringify(st);
    if (key !== stallKey) { stallKey = key; stallSince = Date.now(); }
    else if (Date.now() - stallSince > 30000) { note('stall', st); await shot('stall'); stallSince = Date.now(); if (st?.modal) { await tap('.modal-back .btn-primary') || await tap('.modal-back .btn-close'); } }
    continue;
  }
  if (result) {
    await page.waitForTimeout(3500); // let the rows play out (a person reads them)
    const title = await page.locator('.res-title').innerText().catch(() => '');
    runs++; note('result', { title, seconds: Math.round((Date.now() - runStart) / 1000), save: await save() });
    if (runs <= 2 || runs % 4 === 0) await shot(`result-${runs}`);
    for (let i = 0; i < 4; i++) { if (!(await tap('.res-up .btn.up-buy.ok'))) break; buys++; await page.waitForTimeout(700); if (await vis('.modal-evolve')) { await shot('evolve'); note('evolve'); await tap('.modal-evolve .btn-primary'); await page.waitForTimeout(600); } }
    await tap('.res-pri'); await page.waitForTimeout(1500);
    continue;
  }
  if (modal) {
    const title = await page.locator('.modal-back .modal-title, .modal-back .unlock-title').first().innerText().catch(() => '');
    popups++; note('popup', { title: title.slice(0, 40) }); if (popups <= 8) await shot(`popup-${popups}`);
    // claim if there is a claim/ok button, else close
    if (!(await tap('.modal-back .btn-primary'))) await tap('.modal-back .btn-close');
    await page.waitForTimeout(900);
    if (await vis('.modal-back')) { await tap('.modal-back .btn-close'); await page.waitForTimeout(700); }
    continue;
  }
  if (hub) {
    hubVisits++; if (hubVisits <= 3) await shot(`hub-${hubVisits}`);
    // go play the next area from wherever we are
    if (!(await vis('.page-map .cta')) && !(await vis('.page-shelter .cta'))) await tap('.nav-btn[data-tab="map"]');
    await page.waitForTimeout(500);
    if (await vis('.page-shelter .cta')) await tap('.page-shelter .cta'); else await tap('.page-map .cta');
    await page.waitForTimeout(1500);
    // stage info card (map) has its own play button
    if (await vis('.modal-back .btn-primary')) await tap('.modal-back .btn-primary');
    continue;
  }
}
// wait for a run in progress to end, then land on the hub
for (let i = 0; i < 240 && (await vis('.hud-pause')); i++) await page.waitForTimeout(1000);
if (await vis('.result')) { await page.waitForTimeout(3000); await tap('.res-sec'); await page.waitForTimeout(1500); }
for (let i = 0; i < 4 && (await vis('.modal-back')); i++) { await tap('.modal-back .btn-close'); await page.waitForTimeout(700); }
const before = await save(); note('session_end', { runs, buys, popups, save: before });
await shot('hub-end');

// settings: language switch applies at once
await tap('.topbar .btn-icon'); await page.waitForTimeout(800); await shot('settings');
const navBefore = await page.locator('.nav-btn').first().innerText();
const other = LANG.startsWith('ko') ? 'en' : 'ko';
const segs = page.locator('.modal-back .seg-btn');
for (let i = 0; i < (await segs.count()); i++) { const txt = await segs.nth(i).innerText(); if ((other === 'en' && /English/.test(txt)) || (other === 'ko' && /한국어/.test(txt))) { const b = await segs.nth(i).boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); break; } }
await page.waitForTimeout(900); await shot('settings-lang');
await tap('.modal-back .btn-close'); await page.waitForTimeout(800);
const navAfter = await page.locator('.nav-btn').first().innerText();
note('language', { before: navBefore, after: navAfter, changed: navBefore !== navAfter });
await shot('hub-other-lang');

// reload: progress kept?
await page.reload(); await page.waitForTimeout(2500);
const afterReload = await save();
note('reload', { same: JSON.stringify({ ...before, lang: 0 }) === JSON.stringify({ ...afterReload, lang: 0 }), afterReload, screen: (await vis('.title-go')) ? 'title' : (await vis('.nav')) ? 'hub' : 'other' });
await shot('after-reload');

// next day: move the save's day offset like the debug panel, come back
await page.evaluate(() => { const k = 'splash-rescue-save'; const s = JSON.parse(localStorage.getItem(k)); s.dayOffset = (s.dayOffset || 0) + 1; localStorage.setItem(k, JSON.stringify(s)); });
await page.reload(); await page.waitForTimeout(2500);
if (await vis('.title-go')) { await tap('.title-go'); await page.waitForTimeout(2500); }
await page.waitForTimeout(1000);
const day2Popup = (await vis('.modal-back')) ? await page.locator('.modal-back .modal-title').first().innerText().catch(() => '?') : null;
await shot('day2-arrive');
note('day2', { popup: day2Popup, save: await save() });
if (day2Popup) { await tap('.modal-back .btn-primary'); await page.waitForTimeout(1200); await shot('day2-claimed'); }
note('done', { errors: [...new Set(errors)].slice(0, 10) });
writeFileSync(`${out}/log.json`, JSON.stringify({ name, W, H, LANG, log, errors: [...new Set(errors)] }, null, 1));
await browser.close();
