// Screenshots of specific screens using the dev build + save presets.
// Usage: node tools/screens.mjs <outDir> <w> <h> <locale> "name:query" ["name:query" ...]
// query example: preset=mid&home=shelter   (optional "@click=.selector" suffix clicks before the shot)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [out, w, hh, locale, ...specs] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];
for (const spec of specs) {
  const [name, rest] = spec.split(/:(.*)/s);
  const [query, ...actions] = rest.split('@');
  const ctx = await browser.newContext({ viewport: { width: Number(w), height: Number(hh) }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  await page.goto(`http://localhost:8123/dev.html?${query}`);
  await page.waitForTimeout(1800);
  for (const a of actions) {
    const [k, v] = a.split(/=(.*)/s);
    if (k === 'click') { await page.locator(v).first().click({ force: true, timeout: 8000 }).catch((e) => errors.push(`${name}: click ${v} ${e.message.split('\n')[0]}`)); await page.waitForTimeout(900); }
    if (k === 'wait') await page.waitForTimeout(Number(v));
    if (k === 'eval') await page.evaluate(v);
    if (k === 'scroll') { await page.evaluate((sel) => { const el = document.querySelector(sel); if (el) el.scrollTop = 99999; }, v); await page.waitForTimeout(300); }
  }
  await page.locator('.dbg-toggle').evaluate((el) => (el.style.display = 'none')).catch(() => {});
  await page.locator('.dbg-fps').evaluate((el) => (el.style.display = 'none')).catch(() => {});
  await page.screenshot({ path: `${out}/${name}.png` });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'ok');
