// Scripted first-session walkthrough with screenshots of every screen.
// Usage: node tools/flow.mjs <outDir> [w] [h] [lang] [extraQuery]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const out = process.argv[2] || '.cache/flow';
const w = Number(process.argv[3] || 390), hh = Number(process.argv[4] || 844);
const lang = process.argv[5] || 'ko-KR';
const extra = process.argv[6] || '';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: hh }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: lang });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
let n = 0;
const shot = async (name) => { await page.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png` }); };
const click = async (sel, wait = 600) => { await page.locator(sel).first().click({ timeout: 15000, force: true }); await page.waitForTimeout(wait); };
const waitFor = async (sel, timeout = 120000) => { await page.locator(sel).first().waitFor({ state: 'visible', timeout }); };

await page.goto(`http://localhost:8123/index.html?bot=player&seed=5${extra}`);
await page.waitForTimeout(1500);
await shot('title');
await click('.title-go', 1500);
await shot('play-start');
await page.waitForTimeout(6000);
await shot('play-mid');
await waitFor('.result');
await page.waitForTimeout(1000);
await shot('result-anim');
await page.mouse.click(w / 2, hh * 0.4);
await page.waitForTimeout(800);
await shot('result-final');
// scroll result body to show upgrades
await page.evaluate(() => { const b = document.querySelector('.res-body'); if (b) b.scrollTop = 9999; });
await page.waitForTimeout(400);
await shot('result-upgrades');
// buy first affordable upgrade
const buy = page.locator('.up-buy.ok').first();
if (await buy.count()) { await buy.click(); await page.waitForTimeout(700); await shot('result-bought'); }
// close evolve popup if any
if (await page.locator('.modal-evolve').count()) { await shot('evolve'); await click('.modal-evolve .btn-primary'); }
await click('.res-pri', 2500);
await shot('after-result');
// close any popups
for (let i = 0; i < 3; i++) { const m = page.locator('.modal-back .btn-primary'); if (await m.count()) { await shot('popup-' + i); await m.first().click(); await page.waitForTimeout(700); } }
await shot('hub');
if (await page.locator('.nav-btn[data-tab=map]').count()) { await click('.nav-btn[data-tab=map]', 1200); await shot('map'); }
if (await page.locator('.nav-btn[data-tab=upgrade]:not(.hidden)').count()) { await click('.nav-btn[data-tab=upgrade]', 1000); await shot('upgrades'); }
if (await page.locator('.nav-btn[data-tab=shelter]:not(.hidden)').count()) { await click('.nav-btn[data-tab=shelter]', 1500); await shot('shelter'); }
await click('.topbar .btn-icon', 800); await shot('settings');
await page.evaluate(() => { const b = document.querySelector('.modal-body'); if (b) b.scrollTop = 9999; });
await shot('settings-bottom');
await click('.btn-close', 500);
console.log(errors.length ? 'ERRORS:\n' + [...new Set(errors)].join('\n') : 'no errors');
await browser.close();
