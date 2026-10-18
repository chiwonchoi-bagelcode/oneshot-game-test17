// Generates all sprite atlases and icons by running the art code in Chromium.
// Output: assets/art/*.png + assets/art/atlas.json (+ icons as individual PNGs)
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const OUT = 'assets/art';
mkdirSync('.cache', { recursive: true });
const res = await build({ entryPoints: ['art/src/build.ts'], bundle: true, format: 'iife', write: false, logLevel: 'error' });
const js = res.outputFiles[0].text;
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.error('[art]', m.text()); });
page.on('pageerror', (e) => console.error('[art] pageerror', e.message));
await page.setContent('<html><body></body></html>');
await page.addScriptTag({ content: js });
await page.waitForFunction(() => window.__ART__, null, { timeout: 300000 });
const art = await page.evaluate(() => window.__ART__);
await browser.close();
if (art.error) { console.error(art.error); process.exit(1); }

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(path.join(OUT, 'icons'), { recursive: true });
const meta = { atlases: {}, points: art.points };
for (const [name, a] of Object.entries(art.atlases)) {
  const files = a.pages.map((d, i) => {
    const f = `${name}-${i}.png`;
    writeFileSync(path.join(OUT, f), Buffer.from(d.split(',')[1], 'base64'));
    return f;
  });
  meta.atlases[name] = { pages: files, frames: a.frames };
}
for (const [name, d] of Object.entries(art.single)) writeFileSync(path.join(OUT, 'icons', `${name}.png`), Buffer.from(d.split(',')[1], 'base64'));
writeFileSync(path.join(OUT, 'atlas.json'), JSON.stringify(meta));
// lossless-safe palette compression keeps edges clean; skip if pngquant missing
try {
  const pngs = Object.values(meta.atlases).flatMap((a) => a.pages.map((f) => path.join(OUT, f)));
  execFileSync('pngquant', ['--force', '--ext', '.png', '--quality', '80-98', '--speed', '3', ...pngs]);
} catch (e) { console.warn('pngquant skipped:', e.message); }
console.log('art:', Object.entries(meta.atlases).map(([k, a]) => `${k}=${a.pages.length}p/${Object.keys(a.frames).length}f`).join(' '), 'icons=', Object.keys(art.single).length);
