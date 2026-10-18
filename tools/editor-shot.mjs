// Screenshot of the level editor (evidence for the report): list, canvas and
// properties on one screen, after running the bot validation on one area.
// Usage: node tools/editor-shot.mjs <out.png> [stage]
import { chromium } from 'playwright';
const out = process.argv[2] || '.cache/editor.png';
const stage = Number(process.argv[3] || 7);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.error('editor error:', e.message));
await page.goto('http://localhost:8123/editor.html');
await page.waitForTimeout(1500);
// pick the area in the list, then run validation
const item = page.locator(`text=/^\\s*${stage}\\b/`).first();
if (await item.count()) await item.click().catch(() => {});
await page.waitForTimeout(600);
const v = page.getByRole('button', { name: /validate|검증/i }).first();
if (await v.count()) { await v.click().catch(() => {}); await page.waitForTimeout(6000); }
await page.screenshot({ path: out });
await browser.close();
console.log('editor screenshot', out);
