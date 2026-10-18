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
for (const q of ['low', 'medium', 'high']) for (const [name, query, start, secs] of SCENES) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 760 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (start) await page.addInitScript((d) => localStorage.setItem('splash-editor-test', d), JSON.stringify({ level: levelOf(start.stage), room: start.room }));
  // apply the preset, then reload so the chosen quality is read at boot
  await page.goto(`http://localhost:8123/dev.html?${query}`); await page.waitForTimeout(1500);
  await page.evaluate((qq) => { const k = 'splash-rescue-save'; const s = JSON.parse(localStorage.getItem(k)); s.settings.quality = qq; localStorage.setItem(k, JSON.stringify(s)); }, q);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  await page.reload();
  await page.waitForFunction(() => window.__APP__?.playing, null, { timeout: 60000 });
  const loadMs = await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.duration ?? 0);
  await page.waitForTimeout(1500);
  const res = await page.evaluate((secs) => new Promise((done) => {
    const dts = []; let last = 0; const end = performance.now() + secs * 1000;
    const f = (t) => { if (last) dts.push(t - last); last = t; if (t < end) requestAnimationFrame(f); else done(dts); };
    requestAnimationFrame(f);
  }), secs);
  const app = await page.evaluate(() => ({ q: JSON.parse(localStorage.getItem('splash-rescue-save')).settings.quality, room: window.__APP__?.playing?.run?.roomIndex }));
  const sorted = [...res].sort((a, b) => a - b);
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const cap = q === 'low' ? 30 : 60;
  rows.push({ quality: app.q, scene: name, room: app.room, throttle: `${THROTTLE}x`, rafMedianFps: Math.round(1000 / pct(0.5)), rafP10Fps: Math.round(1000 / pct(0.9)), longFrames: res.filter((d) => d > 50).length, samples: res.length, gameCap: cap, navMs: Math.round(loadMs) });
  await ctx.close();
}
await browser.close();
console.table(rows);
