// Playtest capture: opens the game in a phone-sized viewport, lets the bot (or
// a scripted input) play, and saves screenshots at given times.
// Usage: node tools/shot.mjs "<query>" <outPrefix> <t1,t2,...> [w] [h] [dpr]
import { chromium } from 'playwright';

const query = process.argv[2] || 'stage=1&bot=player&seed=3';
const prefix = process.argv[3] || '.cache/shot';
const times = (process.argv[4] || '2,5,9').split(',').map(Number);
const w = Number(process.argv[5] || 390), hgt = Number(process.argv[6] || 844), dpr = Number(process.argv[7] || 2);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: w, height: hgt }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
await page.goto(`http://localhost:8123/${query.startsWith('dev') ? '' : 'index.html'}?${query.replace(/^dev\??/, '')}`.replace('index.html?dev', 'dev.html?'));
const t0 = Date.now();
for (const t of times) {
  const wait = t * 1000 - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `${prefix}-${String(t).replace('.', '_')}.png` });
}
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].slice(0, 20).join('\n'));
await browser.close();
console.log('ok', times.length, 'shots');
