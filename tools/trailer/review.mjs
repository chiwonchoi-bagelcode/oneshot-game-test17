// Trailer review by scene and time range: container/codec/size checks with
// ffprobe, black / frozen / silent stretch detection with ffmpeg filters, per-cut
// loudness, and a contact sheet of the start, middle and end frame of every cut
// (looked at by eye; no video-understanding model is available here).
// Usage: node tools/trailer/review.mjs   → .cache/trailer/review.md + review-*.jpg
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const V = 'out/release/trailer.mp4';
const cuts = JSON.parse(readFileSync('.cache/trailer/cuts.json', 'utf8'));
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', V]).toString());
const vs = probe.streams.find((s) => s.codec_type === 'video'), as = probe.streams.find((s) => s.codec_type === 'audio');
const subs = probe.streams.filter((s) => s.codec_type === 'subtitle').map((s) => s.tags?.language);
const dur = Number(probe.format.duration), size = statSync(V).size;
const checks = [
  ['video codec H.264', vs.codec_name === 'h264', `${vs.codec_name} ${vs.profile} ${vs.pix_fmt}`],
  ['duration 15–30 s', dur >= 15 && dur <= 30, `${dur.toFixed(2)} s`],
  ['size ≤ 20,000,000 bytes', size <= 20000000, `${size.toLocaleString('en')} bytes`],
  ['portrait 1080×1920', vs.width === 1080 && vs.height === 1920, `${vs.width}×${vs.height} @ ${vs.r_frame_rate}`],
  ['audio track', !!as, as ? `${as.codec_name} ${as.sample_rate} Hz ${as.channels} ch` : 'none'],
  ['subtitle tracks ko + en', subs.includes('kor') && subs.includes('eng'), subs.join(', ')],
];
const ff = (filter, a = []) => spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', V, ...a, '-vf', filter, '-an', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const black = [...ff('blackdetect=d=0.15:pix_th=0.08').matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => `${m[1]}–${m[2]}`);
const freeze = [...ff('freezedetect=n=0.002:d=0.6').matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_end: ([\d.]+)/g)].map((m) => `${(+m[1]).toFixed(2)}–${(+m[2]).toFixed(2)}`);
const silOut = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', V, '-af', 'silencedetect=n=-45dB:d=0.4', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const silence = [...silOut.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => `${(+m[1]).toFixed(2)}–${(+m[2]).toFixed(2)}`);
// loudness per cut
const rows = [];
for (let i = 0; i < cuts.cuts.length; i++) {
  const a = cuts.cuts[i].at, b = i + 1 < cuts.cuts.length ? cuts.cuts[i + 1].at : dur;
  const o = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-ss', String(a), '-t', String(b - a), '-i', V, '-af', 'volumedetect', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const mean = o.match(/mean_volume: ([-\d.]+)/)?.[1], max = o.match(/max_volume: ([-\d.]+)/)?.[1];
  const sheet = `.cache/trailer/review-${String(i + 1).padStart(2, '0')}.jpg`;
  const ts = [a + 0.05, (a + b) / 2, b - 0.07];
  const inputs = ts.flatMap((t) => ['-ss', t.toFixed(2), '-i', V]);
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', '[0:v]scale=270:480[a];[1:v]scale=270:480[b];[2:v]scale=270:480[c];[a][b][c]hstack=3', '-frames:v', '1', sheet]);
  rows.push(`| ${i + 1} | ${a.toFixed(2)}–${b.toFixed(2)} | ${cuts.cuts[i].what} | ${mean} / ${max} dB | ${sheet.split('/').pop()} |`);
}
const md = [
  '# Trailer review', '',
  '| check | ok | value |', '|---|---|---|', ...checks.map(([n, ok, v]) => `| ${n} | ${ok ? 'yes' : 'NO'} | ${v} |`), '',
  `black stretches (>0.15 s): ${black.length ? black.join(', ') : 'none'}`,
  `frozen stretches (>0.6 s): ${freeze.length ? freeze.join(', ') : 'none'}`,
  `silent stretches (< -45 dB, >0.4 s): ${silence.length ? silence.join(', ') : 'none'}`, '',
  '| # | time (s) | scene | mean / peak | frames (start, middle, end) |', '|---|---|---|---|---|', ...rows,
].join('\n');
writeFileSync('.cache/trailer/review.md', md);
console.log(md);
