// Renders the app icon (512 for the store, 192/180/64 for the web app) and the
// 1024x500 feature graphic from the game atlas. Needs `node tools/serve.mjs out 8123`.
// Output: out/release/icon-512.png, out/release/feature-1024x500.png, out/assets/icon-*.png
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const res = await build({ entryPoints: ['tools/release/compose.ts'], bundle: true, format: 'iife', write: false, logLevel: 'error', loader: { '.json': 'json' } });
const js = res.outputFiles[0].text;
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[compose]', e.message));
page.on('console', (m) => { if (m.type() !== 'log') console.error('[compose]', m.text()); });
const fonts = "@font-face{font-family:'Jua';src:url(assets/fonts/jua.woff2)}@font-face{font-family:'Fredoka';src:url(assets/fonts/fredoka.woff2);font-weight:400 800}";
await page.route('http://localhost:8123/__compose.html', (r) => r.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}</style></head><body><script>${js}</script></body></html>` }));
await page.goto('http://localhost:8123/__compose.html');
await page.waitForFunction(() => window.__RELEASE_ART__, null, { timeout: 120000 });
const art = await page.evaluate(() => window.__RELEASE_ART__);
await browser.close();
if (art.error) { console.error(art.error); process.exit(1); }
const png = (d) => Buffer.from(d.split(',')[1], 'base64');
mkdirSync('out/release', { recursive: true });
mkdirSync('assets/app', { recursive: true });
writeFileSync('out/release/icon-512.png', png(art.icon512));
writeFileSync('out/release/feature-1024x500.png', png(art.feature));
// web app icons live in assets/app and are copied by the build
writeFileSync('assets/app/icon-512.png', png(art.icon512));
writeFileSync('assets/app/icon-192.png', png(art.icon192));
writeFileSync('assets/app/icon-180.png', png(art.icon180));
writeFileSync('assets/app/favicon-64.png', png(art.favicon));
for (const f of ['icon-192.png', 'icon-180.png', 'favicon-64.png', 'icon-512.png']) {
  try { execFileSync('pngquant', ['--force', '--ext', '.png', '--quality', '80-98', `assets/app/${f}`]); } catch { /* keep lossless */ }
  copyFileSync(`assets/app/${f}`, `out/assets/${f}`);
}
console.log('release art written');
