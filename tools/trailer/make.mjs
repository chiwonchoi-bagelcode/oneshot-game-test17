// Builds out/release/trailer.mp4 (+ subtitles) from the captured takes and the
// edit list: picks the frames, renders the end card, moves each take's sound
// events to trailer time and mixes them (mix.py), then encodes H.264 + AAC with
// Korean and English subtitle tracks.
// Usage: node tools/trailer/make.mjs   (after capture.mjs for every take in the EDL)
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { EDL } from './edl.mjs';

const FPS = EDL.fps;
const work = '.cache/trailer';
rmSync(work, { recursive: true, force: true });
mkdirSync(`${work}/frames`, { recursive: true });
const takes = {};
const take = (n) => (takes[n] ||= JSON.parse(readFileSync(`.cache/takes/${n}.json`, 'utf8')));

// end card frames, rendered by the same compose code as the store art
async function renderCard(dur) {
  const res = await build({ entryPoints: ['tools/release/compose.ts'], bundle: true, format: 'iife', write: false, logLevel: 'error' });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const fonts = "@font-face{font-family:'Jua';src:url(assets/fonts/jua.woff2)}@font-face{font-family:'Fredoka';src:url(assets/fonts/fredoka.woff2);font-weight:400 800}";
  await page.route('http://localhost:8123/__compose.html', (r) => r.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}</style></head><body><script>${res.outputFiles[0].text}</script></body></html>` }));
  await page.goto('http://localhost:8123/__compose.html');
  await page.waitForFunction(() => window.__RELEASE_ART__, null, { timeout: 120000 });
  const out = [];
  for (let i = 0; i < Math.round(dur * FPS); i++) out.push(await page.evaluate((t) => window.__endcard(t), i / FPS));
  await browser.close();
  return out;
}

// camera push-in on real footage: follow the kid (screen position logged by the
// capture), smoothed, keeping the crop inside the frame
function crops(tk, a, b, zoom, lift = 0.1) {
  const W = tk.w, H = tk.h, dpr = W / 360; const cw = W / zoom, ch = H / zoom;
  const pts = tk.timeline.filter((e) => e.sx !== undefined);
  const at = (f) => { const t = f / FPS; let i = pts.findIndex((e) => e.t >= t); if (i <= 0) i = Math.max(1, i < 0 ? pts.length - 1 : 1); const p = pts[i - 1], q = pts[i]; const k = Math.max(0, Math.min(1, (t - p.t) / ((q.t - p.t) || 1))); return [(p.sx + (q.sx - p.sx) * k) * dpr, (p.sy + (q.sy - p.sy) * k) * dpr]; };
  const raw = []; for (let f = a; f < b; f++) raw.push(at(f));
  return raw.map((_, i) => {
    let sx = 0, sy = 0, c = 0; for (let j = Math.max(0, i - 14); j <= Math.min(raw.length - 1, i + 14); j++) { sx += raw[j][0]; sy += raw[j][1]; c++; }
    const cx = sx / c, cy = sy / c - ch * lift;
    return [Math.max(0, Math.min(W - cw, cx - cw / 2)), Math.max(0, Math.min(H - ch, cy - ch / 2)), cw, ch];
  });
}

let n = 0, t0 = 0;
const sfx = [], loops = {}, ducks = [], cuts = [], plan = [];
for (const seg of EDL.segments) {
  const start = t0;
  if (seg.card) {
    const frames = await renderCard(seg.dur);
    for (const d of frames) writeFileSync(`${work}/frames/${String(n++).padStart(6, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
    for (const s of seg.sfx ?? []) sfx.push({ t: start + s.t, n: s.n, v: s.v ?? 1 });
    t0 += frames.length / FPS;
  } else {
    const tk = take(seg.take);
    const a = Math.round(seg.from * FPS), b = Math.round(seg.to * FPS);
    const cr = seg.zoom ? crops(tk, a, b, seg.zoom, seg.lift) : null;
    for (let f = a; f < b; f++) {
      const src = `.cache/takes/${seg.take}/${String(f).padStart(5, '0')}.jpg`;
      if (!existsSync(src)) throw new Error(`missing frame ${src} (record range?)`);
      plan.push({ src, dst: `${work}/frames/${String(n++).padStart(6, '0')}.jpg`, crop: cr ? cr[f - a] : null });
    }
    const from = a / FPS, to = b / FPS;
    for (const e of tk.audio) {
      if (e.k === 's' && e.t >= from && e.t < to) {
        sfx.push({ t: start + e.t - from, n: e.n, v: e.v, r: e.r });
        if (e.n === 'rescue') ducks.push({ t: start + e.t - from, dur: 1.6, level: 0.45 });
      }
    }
    // loop state carried into the cut, changes inside it, and silence at its end
    const byName = {};
    for (const e of tk.audio) if (e.k === 'l') (byName[e.n] ||= []).push(e);
    for (const [name, list] of Object.entries(byName)) {
      const before = list.filter((e) => e.t < from).pop();
      const arr = (loops[name] ||= []);
      arr.push({ t: start, on: !!before?.on, v: before?.v ?? 0 });
      for (const e of list) if (e.t >= from && e.t < to) arr.push({ t: start + e.t - from, on: e.on, v: e.v });
      arr.push({ t: start + (to - from), on: false, v: 0 });
    }
    t0 += (b - a) / FPS;
  }
  cuts.push({ at: +start.toFixed(2), what: seg.note });
}
writeFileSync(`${work}/plan.json`, JSON.stringify(plan));
execFileSync('python3', ['tools/trailer/frames.py', `${work}/plan.json`], { stdio: 'inherit' });
const duration = n / FPS;
const cardStart = cuts[cuts.length - 1].at;
writeFileSync(`${work}/events.json`, JSON.stringify({ duration, sfx, loops, ducks, music: { ...EDL.music, end: duration } }));
execFileSync('python3', ['tools/trailer/mix.py', `${work}/events.json`, `${work}/audio.wav`], { stdio: 'inherit' });

// subtitles
const sub = 'out/release/subtitles';
mkdirSync(sub, { recursive: true });
const ts = (s, sep) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60, r = ms % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}${sep}${String(r).padStart(3, '0')}`; };
for (const lang of ['ko', 'en']) {
  const segStart = (i) => cuts[i].at, segEnd = (i) => (i + 1 < cuts.length ? cuts[i + 1].at : duration);
  const items = EDL.subs.map((s) => ({ ...s, from: s.from ?? segStart(s.segs[0]), to: Math.min(s.to ?? segEnd(s.segs[1]), duration) }));
  writeFileSync(`${sub}/trailer.${lang}.vtt`, 'WEBVTT\n\n' + items.map((s, i) => `${i + 1}\n${ts(s.from, '.')} --> ${ts(s.to, '.')}\n${s[lang]}\n`).join('\n'));
  writeFileSync(`${sub}/trailer.${lang}.srt`, items.map((s, i) => `${i + 1}\n${ts(s.from, ',')} --> ${ts(s.to, ',')}\n${s[lang]}\n`).join('\n'));
}

// encode: H.264 high profile, yuv420p, faststart; soft subtitle tracks (ko, en)
const out = 'out/release/trailer.mp4';
execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', `${work}/frames/%06d.jpg`, '-i', `${work}/audio.wav`,
  '-i', `${sub}/trailer.ko.srt`, '-i', `${sub}/trailer.en.srt`,
  '-map', '0:v', '-map', '1:a', '-map', '2:s', '-map', '3:s',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '160k', '-c:s', 'mov_text',
  '-metadata:s:s:0', 'language=kor', '-metadata:s:s:0', 'title=한국어', '-metadata:s:s:1', 'language=eng', '-metadata:s:s:1', 'title=English',
  '-movflags', '+faststart', '-shortest', out], { stdio: 'inherit' });
writeFileSync(`${work}/cuts.json`, JSON.stringify({ duration, cardStart, cuts }, null, 1));
console.log(`trailer: ${duration.toFixed(2)} s, ${n} frames, ${(statSync(out).size / 1e6).toFixed(2)} MB`);
console.log(cuts.map((c) => `${c.at.toFixed(2)}s ${c.what}`).join('\n'));
