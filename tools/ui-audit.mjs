// UI audit: opens every screen and popup in two phone sizes and both
// languages, then checks the DOM for text overflow/clipping, overlapping
// controls, small tap targets, content under the notch/home-indicator, and
// buttons that are too wide-and-thin. Saves a screenshot per screen.
// Usage: node tools/ui-audit.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const out = process.argv[2] || '.cache/audit';
mkdirSync(out, { recursive: true });
const SIZES = [
  { name: 'small', w: 360, h: 640, safeTop: 24, safeBottom: 0 }, // compact Android
  { name: 'large', w: 430, h: 932, safeTop: 59, safeBottom: 34 }, // tall phone with dynamic island
];
const LANGS = ['ko-KR', 'en-US'];
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null; // e.g. ONLY=shelter
const SCREENS = [
  ['title', 'preset=fresh', []],
  ['map', 'preset=mid&home=map', ['close']],
  ['upgrades', 'preset=mid&home=upgrade', ['close']],
  ['upgrades-scrolled', 'preset=mid&home=upgrade', ['close', 'scroll:.page-scroll']],
  ['shelter', 'preset=mid&home=shelter', ['close']],
  ['shelter-late', 'preset=late&home=shelter', ['close']],
  ['stage-info', 'preset=mid&home=map', ['close', 'eval:window.__APP__.home.openStage(9)']],
  ['settings', 'preset=mid&home=map', ['close', 'click:.topbar .btn-icon']],
  ['settings-scrolled', 'preset=mid&home=map', ['close', 'click:.topbar .btn-icon', 'scroll:.modal-body']],
  ['streak', 'preset=mid&home=map', []],
  ['missions', 'preset=mid&home=map', ['close', 'click:.side-btn:nth-child(2)']],
  ['daily', 'preset=mid&home=map', ['close', 'click:.side-btn:nth-child(3)']],
  ['album', 'preset=late&home=shelter', ['close', 'eval:window.__APP__.home.openAlbum()']],
  ['species', 'preset=late&home=shelter', ['close', 'eval:window.__APP__.home.openSpecies("fox")']],
  ['species-unknown', 'preset=mid&home=shelter', ['close', 'eval:window.__APP__.home.openSpecies("panda")']],
  ['decor', 'preset=late&home=shelter', ['close', 'eval:window.__APP__.home.openDecor()']],
  ['play', 'preset=mid&stage=9&bot=player&seed=4', ['wait:5000']],
  ['pause', 'preset=mid&stage=9&seed=4', ['wait:2500', 'click:.hud-pause']],
  ['levelup', 'preset=mid&stage=4&bot=expert&seed=4', ['waitfor:.modal-levelup', 'wait:300']],
  ['result', 'preset=day1&stage=2&bot=expert&seed=3', ['waitfor:.result', 'wait:400', 'tap', 'wait:900']],
  ['result-upgrades', 'preset=day1&stage=2&bot=expert&seed=3', ['waitfor:.result', 'wait:400', 'tap', 'wait:900', 'scroll:.res-body']],
];

const browser = await chromium.launch();
const findings = [];
for (const size of SIZES) for (const lang of LANGS) {
  for (const [name, query, steps] of SCREENS) {
    if (ONLY && !ONLY.test(name)) continue;
    const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: lang });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    // emulate the notch / home indicator with CSS env() overrides
    await page.addInitScript(({ t, b }) => { window.__SAFE__ = { t, b }; }, { t: size.safeTop, b: size.safeBottom });
    await page.goto(`http://localhost:8123/dev.html?${query}&audit=1`);
    await page.waitForTimeout(1600);
    for (const s of steps) {
      const [k, v] = s.split(/:(.*)/s);
      try {
        if (k === 'close') { const c = page.locator('.modal-back .btn-close'); if (await c.count()) { await c.first().click({ force: true }); await page.waitForTimeout(500); } }
        if (k === 'click') { await page.locator(v).first().click({ force: true, timeout: 5000 }); await page.waitForTimeout(700); }
        if (k === 'eval') { await page.evaluate(v); await page.waitForTimeout(700); }
        if (k === 'scroll') { await page.evaluate((sel) => { const e = document.querySelector(sel); if (e) e.scrollTop = 99999; }, v); await page.waitForTimeout(300); }
        if (k === 'wait') await page.waitForTimeout(Number(v));
        if (k === 'waitfor') await page.locator(v).first().waitFor({ state: 'visible', timeout: 120000 });
        if (k === 'tap') await page.mouse.click(size.w / 2, size.h * 0.35);
      } catch (e) { errs.push(`step ${s}: ${e.message.split('\n')[0]}`); }
    }
    await page.evaluate(() => { for (const s of ['.dbg-toggle', '.dbg-fps']) { const e = document.querySelector(s); if (e) e.style.display = 'none'; } });
    const res = await page.evaluate(({ safeTop, safeBottom }) => {
      const issues = [];
      const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05; };
      const label = (el) => (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : el.tagName) + ` "${(el.textContent || '').trim().slice(0, 24)}"`;
      const W = innerWidth, H = innerHeight;
      // the top modal (if any) is what the user sees; only audit its subtree + always-on HUD/nav
      const roots = [...document.querySelectorAll('.modal-back')].slice(-1);
      const scope = roots.length ? roots : [document.getElementById('ui')];
      // hide elements that are scrolled out of view inside a scroll container
      const clipped = (el) => { const sc = el.closest('.modal-body, .page-scroll, .res-body'); if (!sc) return false; const a = el.getBoundingClientRect(), b = sc.getBoundingClientRect(); return a.bottom <= b.top + 2 || a.top >= b.bottom - 2 || (a.top < b.top - 2 || a.bottom > b.bottom + 2); };
      const els = scope.flatMap((r) => [...r.querySelectorAll('*')]).filter((e) => vis(e) && !clipped(e));
      for (const el of els) {
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        // text overflow / clipping
        if (hasText && (el.scrollWidth > el.clientWidth + 2) && cs.overflow !== 'visible' && cs.textOverflow !== 'ellipsis') issues.push(`text clipped: ${label(el)} (${el.scrollWidth}>${el.clientWidth})`);
        if (hasText && el.scrollWidth > el.clientWidth + 2 && cs.overflowX === 'visible' && el.clientWidth > 0 && cs.whiteSpace === 'nowrap') issues.push(`text overflows box: ${label(el)}`);
        // off-screen horizontally
        if ((r.right > W + 1 || r.left < -1) && !el.closest('.modal-body, .page-scroll, .res-body')) issues.push(`off-screen: ${label(el)} (${Math.round(r.left)}..${Math.round(r.right)})`);
        // tap targets
        if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'switch') {
          if (r.width < 44 || r.height < 44) issues.push(`small tap target ${Math.round(r.width)}x${Math.round(r.height)}: ${label(el)}`);
          if (r.width / r.height > 5.5 && r.height < 56) issues.push(`thin wide button ${Math.round(r.width)}x${Math.round(r.height)}: ${label(el)}`);
          // inside the notch or home-indicator zone (fixed UI only)
          if (!el.closest('.modal-body, .page-scroll, .res-body') && (r.top < safeTop - 1 || r.bottom > H - safeBottom + 1)) issues.push(`button in unsafe area: ${label(el)} (${Math.round(r.top)}-${Math.round(r.bottom)})`);
        }
        // a text line wrapping inside a small button
        if (el.tagName === 'BUTTON' && hasText) { const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2; if (el.querySelector('span') === null && r.height > lh * 2.6 + 16 && r.width < 140) issues.push(`button text wraps: ${label(el)}`); }
      }
      // overlapping buttons (siblings in fixed UI)
      const btns = els.filter((e) => e.tagName === 'BUTTON');
      for (let i = 0; i < btns.length; i++) for (let j = i + 1; j < btns.length; j++) {
        const a = btns[i].getBoundingClientRect(), b = btns[j].getBoundingClientRect();
        if (btns[i].contains(btns[j]) || btns[j].contains(btns[i])) continue;
        const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ix > 6 && iy > 6) issues.push(`buttons overlap: ${label(btns[i])} / ${label(btns[j])}`);
      }
      // text wider than its line box (spans in flex rows)
      for (const el of els) { if (el.tagName === 'SPAN' && el.children.length === 0 && !el.classList.contains('badge') && !el.closest('.title-art')) { const r = el.getBoundingClientRect(); const p = el.parentElement.getBoundingClientRect(); if (r.right > p.right + 2 || r.left < p.left - 2) issues.push(`text spills out of parent: ${label(el)}`); } }
      return [...new Set(issues)];
    }, { safeTop: size.safeTop, safeBottom: size.safeBottom });
    const file = `${out}/${size.name}-${lang.slice(0, 2)}-${name}.png`;
    await page.screenshot({ path: file });
    for (const r of res) findings.push(`${size.name}/${lang.slice(0, 2)}/${name}: ${r}`);
    for (const e of errs) findings.push(`${size.name}/${lang.slice(0, 2)}/${name}: ERROR ${e}`);
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${out}/findings.txt`, findings.join('\n'));
console.log(findings.length ? findings.join('\n') : 'no findings');
console.log(`\n${findings.length} finding(s) over ${SIZES.length * LANGS.length * SCREENS.length} screens`);
