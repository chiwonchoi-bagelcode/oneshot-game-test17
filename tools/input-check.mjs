// Real-input check on the release build: a fresh first run driven by a person's
// input path (no bot) - mouse drag, touch drag, arrow keys - plus the pause
// button, which must stay a button. The bot-driven tests skip this path, which
// is how a covered canvas once went unnoticed.
// Usage: node tools/input-check.mjs   (needs `node tools/serve.mjs out 8123`)
import { chromium } from 'playwright';

const b = await chromium.launch();
let failed = 0;
for (const mode of ['mouse', 'touch', 'keys', 'pause']) {
  const touch = mode === 'touch';
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: touch, hasTouch: touch, locale: 'ko-KR' });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://localhost:8123/index.html'); await page.waitForTimeout(2500);
  const bb = await page.locator('.title-go').boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.waitForTimeout(2500);
  const pos = () => page.evaluate(() => { const p = window.__APP__?.playing; return p ? { x: p.sim.player.x, y: p.sim.player.y, paused: p.paused } : null; });
  const before = await pos();
  if (mode === 'mouse') { await page.mouse.move(195, 600); await page.mouse.down(); for (let i = 1; i <= 20; i++) { await page.mouse.move(195, 600 - i * 4); await page.waitForTimeout(30); } await page.waitForTimeout(700); await page.mouse.up(); }
  if (mode === 'touch') {
    const cdp = await ctx.newCDPSession(page);
    const t = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    await t('touchStart', 195, 600); for (let i = 1; i <= 20; i++) { await t('touchMove', 195, 600 - i * 4); await page.waitForTimeout(30); }
    await page.waitForTimeout(700); await t('touchEnd');
  }
  if (mode === 'keys') { await page.keyboard.down('ArrowUp'); await page.waitForTimeout(700); await page.keyboard.up('ArrowUp'); }
  if (mode === 'pause') { const p = await page.locator('.hud-pause').boundingBox(); await page.mouse.click(p.x + p.width / 2, p.y + p.height / 2); await page.waitForTimeout(600); }
  const after = await pos();
  const moved = Math.round(Math.hypot(after.x - before.x, after.y - before.y));
  const ok = mode === 'pause' ? after.paused === 'pause' && moved < 5 : moved > 60;
  if (!ok || errs.length) failed++;
  console.log(`${ok && !errs.length ? 'OK  ' : 'FAIL'} ${mode.padEnd(5)} moved ${moved} world units${mode === 'pause' ? `, paused=${after.paused}` : ''}${errs.length ? ' errors: ' + errs.join(' | ') : ''}`);
  await ctx.close();
}
await b.close();
process.exit(failed ? 1 : 0);
