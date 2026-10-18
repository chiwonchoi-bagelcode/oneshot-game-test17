// Frame-rate check under CPU throttling (a stand-in for low-end Android; real
// devices still need testing). Plays heavy scenes with the bot in real time and
// reports frame pacing per quality preset, plus first-load timing.
// Usage: node tools/perf.mjs [throttle=4]   (needs `node tools/serve.mjs out 8123`)
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const THROTTLE = Number(process.argv[2] || 4);
// [name, query, level to start in its given room via the editor test hook (dev build), seconds]
const SCENES = [
  ['boss room (area 20, late power)', 'preset=late&editor=1&bot=expert&seed=3', { stage: 20, room: 4 }, 25],
  ['busy room (area 28)', 'preset=late&editor=1&bot=expert&seed=2', { stage: 28, room: 2 }, 25],
  ['first room (area 1)', 'preset=fresh&stage=1&bot=player&seed=5', null, 20],
];
const levelOf = (n) => JSON.parse(readFileSync(`data/levels/stage-${String(n).padStart(2, '0')}.json`, 'utf8'));
const browser = await chromium.launch();
const rows = [];
const QUALITIES = (process.env.QUALITIES || 'low,medium,high').split(','); // 'auto' = the game picks and may step down
for (const q of QUALITIES) for (const [name, query, start, secs] of SCENES) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 760 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (start) await page.addInitScript((d) => localStorage.setItem('splash-editor-test', d), JSON.stringify({ level: levelOf(start.stage), room: start.room }));
  // apply the preset, then set the quality while the game page is closed (it writes its save on hide) and come back
  await page.goto(`http://localhost:8123/dev.html?${query}`); await page.waitForTimeout(1500);
  await page.goto('http://localhost:8123/profile.json');
  await page.evaluate((qq) => { const k = 'splash-rescue-save'; const s = JSON.parse(localStorage.getItem(k)); s.settings.quality = qq; localStorage.setItem(k, JSON.stringify(s)); }, q);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  await page.goto(`http://localhost:8123/dev.html?${query}`);
  await page.waitForFunction(() => window.__APP__?.playing, null, { timeout: 60000 });
  const loadMs = await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.duration ?? 0);
  await page.waitForTimeout(q === 'auto' ? 15000 : 1500); // auto: give the step-down time to act
  // frame pacing (rAF) and the game's own main-thread cost per frame (sim + draw calls)
  const { dts: res, js } = await page.evaluate((secs) => new Promise((done) => {
    const app = window.__APP__; const sc = app.scene; const orig = sc.frame; const js = [];
    sc.frame = (dt) => { const t0 = performance.now(); orig(dt); js.push(performance.now() - t0); };
    const dts = []; let last = 0; const end = performance.now() + secs * 1000;
    const f = (t) => { if (last) dts.push(t - last); last = t; if (t < end) requestAnimationFrame(f); else { sc.frame = orig; done({ dts, js }); } };
    requestAnimationFrame(f);
  }), secs);
  const jsSorted = [...js].sort((a, b) => a - b); const jp = (p) => +jsSorted[Math.min(jsSorted.length - 1, Math.floor(jsSorted.length * p))].toFixed(1);
  const app = await page.evaluate(() => ({ q: JSON.parse(localStorage.getItem('splash-rescue-save')).settings.quality + ' dpr ' + (document.getElementById('game').width / innerWidth).toFixed(2), room: window.__APP__?.playing?.run?.roomIndex }));
  const sorted = [...res].sort((a, b) => a - b);
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const cap = q === 'low' ? 30 : 60;
  rows.push({ quality: app.q, scene: name, room: app.room, throttle: `${THROTTLE}x`, rafMedianFps: Math.round(1000 / pct(0.5)), rafP10Fps: Math.round(1000 / pct(0.9)), jsMsP50: jp(0.5), jsMsP90: jp(0.9), jsMsMax: jp(0.999), samples: res.length, gameCap: cap, navMs: Math.round(loadMs) });
  await ctx.close();
}
await browser.close();
console.table(rows);
