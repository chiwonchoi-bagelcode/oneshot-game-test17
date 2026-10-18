// Deterministic capture of real game footage for the trailer and store
// screenshots. The game runs in capture mode (?capture): game time only moves
// when we advance it, page timers run on Playwright's fake clock, and CSS
// animations are slowed so each frame shows one consistent instant. Every sound
// the game asks for is logged with its time so the audio can be mixed offline.
//
// Usage: node tools/trailer/capture.mjs <takeName> [--probe]
// Takes are defined in tools/trailer/takes.mjs. Needs `node tools/serve.mjs out 8123`.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { TAKES } from './takes.mjs';

const name = process.argv[2];
const probe = process.argv.includes('--probe');
const take = TAKES[name];
if (!take) { console.error('unknown take', name, Object.keys(TAKES)); process.exit(1); }
const FPS = 30, DT = 1 / FPS;
const RATE = 0.1; // CSS animation speed while capturing
const CADENCE = (1000 / FPS) / RATE; // real ms per captured frame so CSS keeps pace
const W = take.w ?? 360, H = take.h ?? 640, DPR = take.dpr ?? 3;
const dir = `.cache/takes/${name}`;
if (!probe) { rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true }); }

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: probe ? 1 : DPR, isMobile: true, hasTouch: true, locale: take.lang ?? 'ko-KR' });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.addInitScript(({ t, b }) => { window.__SAFE__ = { t, b }; }, { t: take.safeTop ?? 0, b: take.safeBottom ?? 0 });
await page.clock.install({ time: new Date(take.date ?? '2026-10-14T10:00:00') }); // a Wednesday: no weekend festival
const cdp = await ctx.newCDPSession(page);
await cdp.send('Animation.enable');
await cdp.send('Animation.setPlaybackRate', { playbackRate: RATE });
await page.goto(`http://localhost:8123/dev.html?capture=1&${take.query}`);
// after install() the fake clock still follows real time; pause it so page timers move only with runFor
await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);
// boot: let timers run until the capture hook exists
for (let i = 0; i < 400; i++) {
  if (await page.evaluate(() => typeof window.__advance === 'function')) break;
  await page.clock.runFor(50); await page.waitForTimeout(20);
}
await page.addStyleTag({ content: '.dbg-toggle, .dbg-fps { display: none !important; }' });

const total = Math.round(take.seconds * FPS);
const ranges = probe ? [] : (take.record ?? [[0, take.seconds]]).map(([a, b]) => [Math.round(a * FPS), Math.round(b * FPS)]);
const recording = (f) => ranges.some(([a, b]) => f >= a && f < b);
const preroll = (f) => ranges.some(([a]) => f >= a - 30 && f < a);
const actions = new Map((take.actions ?? []).map((a) => [Math.round(a.at * FPS), a]));
const timeline = [];
let last = Date.now(), shots = 0;
for (let f = 0; f < total; f++) {
  const act = actions.get(f);
  if (act) {
    try {
      if (act.click) { const box = await page.locator(act.click).first().boundingBox(); if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); else errs.push('no element ' + act.click); }
      if (act.tap) await page.mouse.click(act.tap[0] * W, act.tap[1] * H);
      if (act.eval) await page.evaluate(act.eval);
    } catch (e) { errs.push(`action at ${act.at}: ${e.message.split('\n')[0]}`); }
  }
  await page.evaluate((dt) => window.__advance(1, dt), DT);
  await page.clock.runFor(1000 / FPS);
  if (probe || f % 3 === 0) {
    const st = await page.evaluate(() => {
      const p = window.__APP__?.playing; const s = p?.sim; if (!s) return null;
      const [sx, sy] = p.view.worldToScreen(s.player.x, s.player.y); return { sx: Math.round(sx), sy: Math.round(sy), sc: +p.view.scale.toFixed(3), st: s.state, mv: s.player.moving, fi: s.player.firing, hp: Math.round(s.player.hp), room: p.run?.roomIndex, mon: s.monsters.filter((m) => m.alive).length, coc: s.cocoons.filter((c) => !c.freed).length, b: s.bullets.filter((b) => b.alive).length, x: Math.round(s.player.x), y: Math.round(s.player.y) };
    });
    timeline.push({ t: +(f * DT).toFixed(2), ...st });
  }
  if (recording(f) || preroll(f)) {
    const wait = CADENCE - (Date.now() - last);
    if (wait > 0) await page.waitForTimeout(wait);
    last = Date.now();
    if (recording(f)) { await page.screenshot({ path: `${dir}/${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 }); shots++; }
  }
}
const log = await page.evaluate(() => window.__AUDIO_LOG__ ?? []);
mkdirSync('.cache/takes', { recursive: true });
writeFileSync(`.cache/takes/${name}.json`, JSON.stringify({ name, fps: FPS, w: W * DPR, h: H * DPR, frames: total, ranges, audio: log, timeline }, null, 0));
await browser.close();
if (errs.length) console.log('errors:\n' + [...new Set(errs)].slice(0, 20).join('\n'));
console.log(`${name}: ${total} frames, ${shots} shots, ${log.length} sound events`);
