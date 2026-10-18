// Production build: bundles the game (release + dev), subsets fonts, copies
// atlases and audio, writes out/index.html (release) and out/dev.html (with
// the debug panel). Usage: node tools/build.mjs [--skip-fonts]
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const OUT = 'out';
const args = new Set(process.argv.slice(2));
rmSync(`${OUT}/assets/art`, { recursive: true, force: true });
mkdirSync(`${OUT}/assets/art`, { recursive: true });
mkdirSync(`${OUT}/assets/fonts`, { recursive: true });
rmSync(`${OUT}/assets/audio`, { recursive: true, force: true });
mkdirSync(`${OUT}/assets/audio`, { recursive: true });
mkdirSync(`${OUT}/release`, { recursive: true });

const levelsPlugin = {
  name: 'levels',
  setup(b) {
    b.onResolve({ filter: /^virtual:levels$/ }, () => ({ path: 'levels', namespace: 'virtual' }));
    b.onLoad({ filter: /.*/, namespace: 'virtual' }, () => {
      const dir = 'data/levels';
      const files = readdirSync(dir).filter((f) => /^stage-\d+\.json$/.test(f)).sort();
      const levels = files.map((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')));
      return { contents: JSON.stringify(levels), loader: 'json', watchFiles: files.map((f) => path.join(dir, f)) };
    });
  },
};

async function bundle(dev) {
  await build({
    entryPoints: ['src/main.ts'], bundle: true, format: 'iife', target: ['es2020', 'safari14'],
    outfile: `${OUT}/assets/${dev ? 'game-dev' : 'game'}.js`, minify: !dev, sourcemap: false,
    define: { __DEV__: dev ? 'true' : 'false' }, plugins: [levelsPlugin], logLevel: 'warning', legalComments: 'none',
  });
}
await Promise.all([bundle(false), bundle(true), build({
  entryPoints: ['editor/main.ts'], bundle: true, format: 'iife', target: ['es2020'], outfile: `${OUT}/assets/editor.js`, minify: true,
  define: { __DEV__: 'true' }, plugins: [levelsPlugin], logLevel: 'warning', legalComments: 'none',
})]);
copyFileSync('editor/editor.html', `${OUT}/editor.html`);
if (existsSync('data/balance/profile.json')) copyFileSync('data/balance/profile.json', `${OUT}/profile.json`);

// app icons (rendered by tools/release-art.mjs) + web app manifest
if (existsSync('assets/app')) for (const f of readdirSync('assets/app')) copyFileSync(`assets/app/${f}`, `${OUT}/assets/${f}`);
writeFileSync(`${OUT}/manifest.webmanifest`, JSON.stringify({
  name: '물총 구조대 · Splash Rescue', short_name: '물총 구조대', start_url: './index.html', display: 'standalone', orientation: 'portrait',
  background_color: '#3f7a2a', theme_color: '#3f7a2a',
  icons: [{ src: 'assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png' }],
}));

// atlases
for (const f of readdirSync('assets/art')) if (f.endsWith('.png')) copyFileSync(`assets/art/${f}`, `${OUT}/assets/art/${f}`);

// fonts: keep only the glyphs the game uses
if (!args.has('--skip-fonts') || !existsSync(`${OUT}/assets/fonts/jua.woff2`)) {
  const chars = new Set(' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~·…→←↑↓×—–’“”•★☆♥');
  for (const f of ['data/i18n/ko.json', 'data/i18n/en.json']) for (const ch of readFileSync(f, 'utf8')) chars.add(ch);
  writeFileSync('.cache/chars.txt', [...chars].join(''));
  execFileSync('pyftsubset', ['art/fonts/Jua-Regular.ttf', '--text-file=.cache/chars.txt', '--flavor=woff2', `--output-file=${OUT}/assets/fonts/jua.woff2`, '--layout-features=*']);
  execFileSync('pyftsubset', ['art/fonts/Fredoka-SemiBold.ttf', '--text-file=.cache/chars.txt', '--flavor=woff2', `--output-file=${OUT}/assets/fonts/fredoka.woff2`, '--layout-features=*']);
}

// audio: music streams from files, effects are embedded so they work offline and from file://
let audioScript = 'window.__AUDIO_MANIFEST__=null;';
if (existsSync('audio/out/manifest.json')) {
  const man = JSON.parse(readFileSync('audio/out/manifest.json', 'utf8'));
  const sfx = {};
  for (const [name, d] of Object.entries(man.sfx || {})) {
    const p = `audio/out/${d.file}`; if (existsSync(p)) sfx[name] = readFileSync(p).toString('base64');
  }
  // looping tracks stream from files; one-shot stingers are embedded with the effects
  for (const [name, d] of Object.entries(man.music || {})) {
    const p = `audio/out/${d.file}`; if (!existsSync(p)) continue;
    if (d.loop === false) { sfx[name] = readFileSync(p).toString('base64'); man.sfx[name] = d; delete man.music[name]; }
    else copyFileSync(p, `${OUT}/assets/audio/${d.file}`);
  }
  audioScript = `window.__AUDIO_MANIFEST__=${JSON.stringify(man)};window.__SFX__=${JSON.stringify(sfx)};`;
}
writeFileSync(`${OUT}/assets/sfx.js`, audioScript);

// html
const css = readFileSync('src/ui/style.css', 'utf8').replace(/\n\s*/g, ' ');
const html = (script, title) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#3f7a2a">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="description" content="엄지 하나로 끈적이를 씻어 내고 동물을 구하는 물총 액션 · One-thumb water-gun rescue action">
<title>${title}</title>
<link rel="icon" type="image/png" href="assets/favicon-64.png">
<link rel="apple-touch-icon" href="assets/icon-180.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preload" href="assets/fonts/jua.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/fredoka.woff2" as="font" type="font/woff2" crossorigin>
<style>${css}</style>
</head>
<body>
<canvas id="game"></canvas>
<div id="ui"></div>
<div id="modals"></div>
<div id="loading"><div class="load-logo">물총 구조대</div><div class="load-sub">Splash Rescue</div><div class="load-bar"><div class="load-fill"></div></div><div class="load-text"></div></div>
<script src="assets/sfx.js"></script>
<script src="assets/${script}"></script>
</body>
</html>
`;
writeFileSync(`${OUT}/index.html`, html('game.js', '물총 구조대 · Splash Rescue'));
writeFileSync(`${OUT}/dev.html`, html('game-dev.js', '[DEV] 물총 구조대'));
if (existsSync('assets/icon-192.png')) copyFileSync('assets/icon-192.png', `${OUT}/assets/icon-192.png`);

// docs
for (const [src, dst] of [['docs/plan.md', 'release/plan.md'], ['docs/report.md', 'release/report.md']]) if (existsSync(src)) copyFileSync(src, `${OUT}/${dst}`);

const size = (p) => statSync(p).size;
const total = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((a, e) => a + (e.isDirectory() ? total(path.join(dir, e.name)) : size(path.join(dir, e.name))), 0);
console.log(`built: game.js ${(size(`${OUT}/assets/game.js`) / 1024).toFixed(0)}KB, sfx.js ${(size(`${OUT}/assets/sfx.js`) / 1024).toFixed(0)}KB, assets ${(total(`${OUT}/assets`) / 1048576).toFixed(2)}MB`);
