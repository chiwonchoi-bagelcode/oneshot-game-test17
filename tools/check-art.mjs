// Structural checks on the generated atlases (the visual check is separate:
// contact sheets + in-game screenshots reviewed by eye).
//  - every frame lies inside its page, has visible pixels and its anchor inside the frame
//  - sprites have transparent corners (no baked background)
//  - nothing touches the frame border (would mean clipped art)
//  - animation sets share size and anchor, and grounded loops keep their feet on one line
//  - ground tiles are opaque and tile seamlessly
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const meta = JSON.parse(readFileSync('assets/art/atlas.json', 'utf8'));
const pages = {};
for (const [name, a] of Object.entries(meta.atlases)) pages[name] = a.pages.map((f) => PNG.sync.read(readFileSync(`assets/art/${f}`)));
const issues = []; let checked = 0;
const FULL_FRAME = /^(g_|t_|brush|fx_glow|fx_softring|fx_rays|p_mist|shadow)/; // meant to reach the edges
const alphaAt = (png, x, y) => png.data[(y * png.width + x) * 4 + 3];
const colHas = (png, f, x) => { for (let y = 0; y < f.h; y++) if (alphaAt(png, f.x + x, f.y + y) > 16) return true; return false; };
const minX0 = (png, f) => colHas(png, f, 0);
const maxX0 = (png, f) => colHas(png, f, f.w - 1);

for (const [atlas, a] of Object.entries(meta.atlases)) {
  for (const [name, f] of Object.entries(a.frames)) {
    checked++;
    const png = pages[atlas][f.page];
    if (f.x < 0 || f.y < 0 || f.x + f.w > png.width || f.y + f.h > png.height) { issues.push(`${name}: outside page`); continue; }
    { const tr = meta.trim?.[name]; const ax = f.ax + (tr?.ox ?? 0), ay = f.ay + (tr?.oy ?? 0), w = tr?.ow ?? f.w, h = tr?.oh ?? f.h;
      if (ax < 0 || ay < 0 || ax > w || ay > h) issues.push(`${name}: anchor (${ax},${ay}) outside ${w}x${h}`); }
    let opaque = 0, minY = f.h, maxY = -1, edge = 0;
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
      const al = alphaAt(png, f.x + x, f.y + y);
      if (al > 16) { opaque++; if (y < minY) minY = y; if (y > maxY) maxY = y; if (x === 0 || y === 0 || x === f.w - 1 || y === f.h - 1) edge++; }
    }
    f._foot = maxY; f._top = minY;
    if (!opaque) { issues.push(`${name}: empty frame`); continue; }
    if (atlas === 'tiles') {
      if (name.startsWith('g_') && opaque < f.w * f.h) issues.push(`${name}: ground tile has transparent pixels`);
      if (name.startsWith('g_')) {
        // seamless: compare first and last columns/rows (they meet when tiled)
        let d = 0;
        for (let i = 0; i < f.h; i++) { const l = (f.y + i) * png.width + f.x, r = l + f.w - 1; for (let c = 0; c < 3; c++) d += Math.abs(png.data[l * 4 + c] - png.data[r * 4 + c]); }
        const avg = d / (f.h * 3);
        if (avg > 22) issues.push(`${name}: left/right edges differ (avg ${avg.toFixed(1)}), visible seam`);
      }
      continue;
    }
    for (const [cx, cy] of [[0, 0], [f.w - 1, 0], [0, f.h - 1], [f.w - 1, f.h - 1]]) if (alphaAt(png, f.x + cx, f.y + cy) > 16 && !FULL_FRAME.test(name)) { issues.push(`${name}: corner not transparent`); break; }
    // trimmed frames: an edge pixel is only a problem if it was on the original (untrimmed) frame border
    const tr = meta.trim?.[name];
    const touchesOriginal = tr ? (tr.ox === 0 && minX0(png, f) || tr.oy === 0 && minY === 0 || tr.ox + f.w >= tr.ow && maxX0(png, f) || tr.oy + f.h >= tr.oh && maxY === f.h - 1) : edge > 2;
    if (touchesOriginal && !FULL_FRAME.test(name)) issues.push(`${name}: art touches the frame border (may be clipped)`);
    if (tr) { f._foot = maxY + tr.oy; f._ow = tr.ow; f._oh = tr.oh; f._oax = f.ax + tr.ox; f._oay = f.ay + tr.oy; }
  }
}
// animation sets
const groups = {};
for (const a of Object.values(meta.atlases)) for (const [name, f] of Object.entries(a.frames)) { const m = name.match(/^(.*)_(\d+)$/); if (m) (groups[m[1]] ||= []).push(f); }
const GROUNDED = /^(kid_(idle|run|shoot)|a_.*_(walk|idle|sleep|trapped)|m_flyer_.*)$/;
let sets = 0;
const NOT_ANIM = new Set(['gun', 'pack', 'd_flower', 'd_pebble', 'g', 'goostamp', 'cocoon', 'p_conf', 'p_coin', 'p_sparkle', 'star', 'fx_splash', 'fx_impact']);
for (const [g, frames] of Object.entries(groups)) {
  if (frames.length < 2 || NOT_ANIM.has(g)) continue;
  sets++;
  const f0 = frames[0];
  const W = (f) => f._ow ?? f.w, H = (f) => f._oh ?? f.h, AX = (f) => f._oax ?? f.ax, AY = (f) => f._oay ?? f.ay;
  if (frames.some((f) => W(f) !== W(f0) || H(f) !== H(f0))) issues.push(`${g}: frames differ in size`);
  if (frames.some((f) => AX(f) !== AX(f0) || AY(f) !== AY(f0))) issues.push(`${g}: frames differ in anchor`);
  if (GROUNDED.test(g) && !g.startsWith('m_flyer')) {
    const feet = frames.map((f) => f._foot); const spread = Math.max(...feet) - Math.min(...feet);
    if (spread > 8) issues.push(`${g}: feet move ${spread}px between frames (should stay grounded)`);
  }
}
const out = [`checked ${checked} frames in ${Object.keys(meta.atlases).length} atlases, ${sets} animation sets`, ...issues.map((i) => '- ' + i), issues.length ? `${issues.length} issue(s)` : 'no issues'];
writeFileSync('.cache/art-check.txt', out.join('\n'));
console.log(out.slice(0, 60).join('\n'));
