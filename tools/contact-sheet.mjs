// Visual review: renders frames from the atlas (filtered by prefix) on a checker
// background with labels, so a human (or vision model) can inspect them.
// Usage: node tools/contact-sheet.mjs <prefix,prefix2> <out.png> [scale]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const prefixes = (process.argv[2] || '').split(',');
const out = process.argv[3] || '.cache/sheet.png';
const scale = Number(process.argv[4] || 1);
const meta = JSON.parse(readFileSync('assets/art/atlas.json', 'utf8'));
const items = [];
for (const [atlas, a] of Object.entries(meta.atlases)) {
  for (const [name, f] of Object.entries(a.frames)) {
    if (prefixes.some((p) => name.startsWith(p))) items.push({ name, f, src: path.resolve('assets/art', a.pages[f.page]) });
  }
}
items.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const imgs = {};
for (const it of items) imgs[it.src] = 'data:image/png;base64,' + readFileSync(it.src).toString('base64');
await page.setContent('<canvas id=c></canvas>');
const buf = await page.evaluate(async ({ items, imgs, scale }) => {
  const loaded = {};
  for (const [k, v] of Object.entries(imgs)) { const im = new Image(); im.src = v; await im.decode(); loaded[k] = im; }
  const cols = Math.max(1, Math.floor(1400 / (Math.max(...items.map((i) => i.f.w)) * scale + 16)));
  const cw = Math.max(...items.map((i) => i.f.w)) * scale + 16, ch = Math.max(...items.map((i) => i.f.h)) * scale + 30;
  const rows = Math.ceil(items.length / cols);
  const c = document.getElementById('c'); c.width = cols * cw; c.height = rows * ch;
  const g = c.getContext('2d');
  g.fillStyle = '#ddd'; g.fillRect(0, 0, c.width, c.height);
  items.forEach((it, i) => {
    const x = (i % cols) * cw + 8, y = Math.floor(i / cols) * ch + 4;
    for (let yy = 0; yy < it.f.h * scale; yy += 8) for (let xx = 0; xx < it.f.w * scale; xx += 8) {
      g.fillStyle = ((xx + yy) / 8) % 2 ? '#c8c8c8' : '#f0f0f0'; g.fillRect(x + xx, y + yy, 8, 8);
    }
    g.drawImage(loaded[it.src], it.f.x, it.f.y, it.f.w, it.f.h, x, y, it.f.w * scale, it.f.h * scale);
    g.strokeStyle = 'rgba(255,0,0,0.6)'; g.beginPath(); g.moveTo(x + it.f.ax * scale - 4, y + it.f.ay * scale); g.lineTo(x + it.f.ax * scale + 4, y + it.f.ay * scale); g.moveTo(x + it.f.ax * scale, y + it.f.ay * scale - 4); g.lineTo(x + it.f.ax * scale, y + it.f.ay * scale + 4); g.stroke();
    g.fillStyle = '#222'; g.font = '11px sans-serif'; g.fillText(it.name, x, y + it.f.h * scale + 14);
  });
  return c.toDataURL('image/png');
}, { items, imgs, scale });
const { writeFileSync } = await import('node:fs');
writeFileSync(out, Buffer.from(buf.split(',')[1], 'base64'));
await browser.close();
console.log('sheet:', out, items.length, 'frames');
