// UI icons + shelter decorations, drawn with the same kit so UI and world match.
import { sprite } from './atlas';
import { PAL, OUT, GOO, cel, ellipsePath, rrectPath, smoothPath, star, dropPath, heartPath, eye, mouth, blush, rgba, type Ctx } from './kit';

const S = 96; // icon frame size
type Fn = (c: Ctx) => void;
const ic = (name: string, fn: Fn) => sprite(name, S, S, S / 2, S / 2, (ctx) => { ctx.translate(S / 2, S / 2); fn(ctx); });
const B = (x: number, y: number, w: number, h: number) => ({ x, y, w, h });
const W = 2.6;

function stream(c: Ctx, pts: [number, number][], w: number) {
  const draw = (lw: number, col: string) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.lineWidth = lw; c.strokeStyle = col; c.stroke(); };
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  draw(w + 6, OUT); draw(w, '#55c2f5'); draw(w * 0.45, '#e2f8ff');
  c.restore();
}
function blobMini(c: Ctx, x: number, y: number, r: number, col = GOO.violet) {
  const p = new Path2D(); p.moveTo(x - r, y + r * 0.6); p.bezierCurveTo(x - r * 1.05, y - r * 1.1, x + r * 1.05, y - r * 1.1, x + r, y + r * 0.6); p.closePath();
  cel(c, p, B(x - r, y - r, r * 2, r * 1.6), col[0], col[1], col[2], { outline: W, gloss: true });
  c.fillStyle = OUT; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.05, r * 0.12, 0, 7); c.arc(x + r * 0.3, y - r * 0.05, r * 0.12, 0, 7); c.fill();
}
function gauge(c: Ctx, k: number) {
  const p = ellipsePath(0, 4, 32, 32); cel(c, p, B(-32, -28, 64, 64), '#fff6e2', '#e3c79c', null, { outline: W });
  c.save(); c.lineCap = 'round'; c.strokeStyle = '#d8e6ee'; c.lineWidth = 9; c.beginPath(); c.arc(0, 6, 22, Math.PI * 0.8, Math.PI * 2.2); c.stroke();
  c.strokeStyle = '#4fc3f7'; c.beginPath(); c.arc(0, 6, 22, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * k)); c.stroke();
  const a = Math.PI * (0.8 + 1.4 * k); c.strokeStyle = OUT; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 6); c.lineTo(Math.cos(a) * 18, 6 + Math.sin(a) * 18); c.stroke();
  c.fillStyle = OUT; c.beginPath(); c.arc(0, 6, 5, 0, 7); c.fill(); c.restore();
}
function heart(c: Ctx, x: number, y: number, r: number, col: [string, string, string] = ['#ff6f91', '#d94a70', '#ffb3c6']) {
  const p = heartPath(x, y, r); cel(c, p, B(x - r * 1.3, y - r * 1.05, r * 2.6, r * 2), col[0], col[1], col[2], { outline: W, gloss: true });
}
function plus(c: Ctx, x: number, y: number, r: number) {
  const p = new Path2D(); const t = r * 0.38;
  p.moveTo(x - t, y - r); p.lineTo(x + t, y - r); p.lineTo(x + t, y - t); p.lineTo(x + r, y - t); p.lineTo(x + r, y + t); p.lineTo(x + t, y + t); p.lineTo(x + t, y + r); p.lineTo(x - t, y + r); p.lineTo(x - t, y + t); p.lineTo(x - r, y + t); p.lineTo(x - r, y - t); p.lineTo(x - t, y - t); p.closePath();
  cel(c, p, B(x - r, y - r, r * 2, r * 2), '#7ed957', '#4fae3a', '#c4f5a0', { outline: W });
}
function splashIcon(c: Ctx, k = 1) {
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI; const x = Math.cos(a) * 22 * k, y = 14 + Math.sin(a) * 8;
    const h = (24 + (i % 2) * 10) * k;
    const p = new Path2D(); p.moveTo(x - 6, y); p.quadraticCurveTo(x - 2, y - h * 0.6, x + Math.cos(a) * 6, y - h); p.quadraticCurveTo(x + 2, y - h * 0.6, x + 6, y); p.closePath();
    cel(c, p, B(x - 7, y - h, 14, h), '#7fd6ff', '#2a9fd8', '#d8f6ff', { outline: 2.2 });
  }
  const pool = ellipsePath(0, 18, 34 * k, 10 * k); cel(c, pool, B(-34, 8, 68, 20), '#55c2f5', '#2a8fd0', '#bdf0ff', { outline: W });
}

export function register() {
  // ----- basic UI
  ic('ic_pause', (c) => { for (const x of [-12, 12]) { const p = rrectPath(x - 8, -24, 16, 48, 6); cel(c, p, B(x - 8, -24, 16, 48), '#5aa0e6', '#3a6fb8', '#9ccaff', { outline: W }); } });
  ic('ic_play', (c) => { const p = new Path2D(); p.moveTo(-16, -26); p.lineTo(28, 0); p.lineTo(-16, 26); p.closePath(); cel(c, p, B(-16, -26, 44, 52), '#7ed957', '#4fae3a', '#c4f5a0', { outline: W }); });
  ic('ic_close', (c) => { c.save(); c.lineCap = 'round'; c.strokeStyle = OUT; c.lineWidth = 15; c.beginPath(); c.moveTo(-18, -18); c.lineTo(18, 18); c.moveTo(18, -18); c.lineTo(-18, 18); c.stroke(); c.strokeStyle = '#ef5a4f'; c.lineWidth = 8; c.stroke(); c.restore(); });
  ic('ic_back', (c) => { const p = new Path2D(); p.moveTo(-28, 0); p.lineTo(0, -26); p.lineTo(0, -12); p.lineTo(26, -12); p.lineTo(26, 12); p.lineTo(0, 12); p.lineTo(0, 26); p.closePath(); cel(c, p, B(-28, -26, 54, 52), '#5aa0e6', '#3a6fb8', '#9ccaff', { outline: W }); });
  ic('ic_arrow', (c) => { const p = new Path2D(); p.moveTo(28, 0); p.lineTo(0, -26); p.lineTo(0, -12); p.lineTo(-26, -12); p.lineTo(-26, 12); p.lineTo(0, 12); p.lineTo(0, 26); p.closePath(); cel(c, p, B(-26, -26, 54, 52), '#ffcf3d', '#d9951f', '#fff09a', { outline: W }); });
  ic('ic_gear', (c) => {
    const p = new Path2D(); const n = 8;
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2; const r = i % 2 ? 24 : 32; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) p.lineTo(x, y); else p.moveTo(x, y); }
    p.closePath(); cel(c, p, B(-32, -32, 64, 64), '#b9c4cf', '#7d8a96', '#e8eef3', { outline: W });
    const h = ellipsePath(0, 0, 11, 11); c.fillStyle = '#fff6e2'; c.fill(h); c.strokeStyle = OUT; c.lineWidth = W; c.stroke(h);
  });
  ic('ic_heart', (c) => heart(c, 0, 0, 26));
  ic('ic_exit', (c) => {
    const d = rrectPath(-26, -30, 34, 60, 6); cel(c, d, B(-26, -30, 34, 60), PAL.wood, PAL.woodDark, PAL.woodLight, { outline: W });
    c.fillStyle = '#ffcf3d'; c.beginPath(); c.arc(1, 2, 3.5, 0, 7); c.fill();
    const a = new Path2D(); a.moveTo(30, 0); a.lineTo(14, -14); a.lineTo(14, -6); a.lineTo(0, -6); a.lineTo(0, 6); a.lineTo(14, 6); a.lineTo(14, 14); a.closePath(); cel(c, a, B(0, -14, 30, 28), '#ffcf3d', '#d9951f', null, { outline: 2.2 });
  });
  ic('ic_home', (c) => { const r = new Path2D(); r.moveTo(-32, -2); r.lineTo(0, -30); r.lineTo(32, -2); r.closePath(); const w = rrectPath(-24, -6, 48, 36, 4); cel(c, w, B(-24, -6, 48, 36), '#fff1d6', '#e3c79c', null, { outline: W }); cel(c, r, B(-32, -30, 64, 28), '#ef6a4f', '#b9433a', '#ff9c84', { outline: W }); const d = rrectPath(-7, 10, 14, 20, 5); cel(c, d, B(-7, 10, 14, 20), PAL.wood, PAL.woodDark, null, { outline: 2 }); });
  ic('ic_map', (c) => {
    const p = new Path2D(); p.moveTo(-32, -22); p.lineTo(-12, -28); p.lineTo(10, -22); p.lineTo(32, -28); p.lineTo(32, 22); p.lineTo(10, 28); p.lineTo(-12, 22); p.lineTo(-32, 28); p.closePath();
    cel(c, p, B(-32, -28, 64, 56), '#fff1d6', '#e3c79c', '#fffaf0', { outline: W });
    c.save(); c.clip(p); c.fillStyle = '#9bd86a'; c.beginPath(); c.ellipse(-14, 4, 14, 18, 0.3, 0, 7); c.fill(); c.fillStyle = '#7fd6ff'; c.beginPath(); c.ellipse(18, -6, 12, 9, 0, 0, 7); c.fill(); c.restore();
    c.strokeStyle = '#ef5a4f'; c.lineWidth = 3; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(-22, 16); c.quadraticCurveTo(0, 0, 18, -6); c.stroke(); c.setLineDash([]);
    c.strokeStyle = OUT; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -28); c.lineTo(-12, 22); c.moveTo(10, -22); c.lineTo(10, 28); c.stroke();
  });
  ic('ic_shelter', (c) => {
    const w = rrectPath(-28, -8, 56, 38, 6); cel(c, w, B(-28, -8, 56, 38), '#ffe0a8', '#e0b878', '#fff2d6', { outline: W });
    const r = new Path2D(); r.moveTo(-36, -4); r.lineTo(0, -34); r.lineTo(36, -4); r.closePath(); cel(c, r, B(-36, -34, 72, 30), '#7ed957', '#4fae3a', '#c4f5a0', { outline: W });
    // paw
    c.fillStyle = '#c9783f'; c.strokeStyle = OUT; c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, 16, 9, 7.5, 0, 0, 7); c.fill(); c.stroke();
    for (const [x, y] of [[-10, 5], [-3, 1], [4, 1], [11, 5]]) { c.beginPath(); c.ellipse(x, y, 3.6, 4.2, 0, 0, 7); c.fill(); c.stroke(); }
  });
  ic('ic_upgrade', (c) => {
    const p = new Path2D(); p.moveTo(0, -32); p.lineTo(28, -2); p.lineTo(12, -2); p.lineTo(12, 30); p.lineTo(-12, 30); p.lineTo(-12, -2); p.lineTo(-28, -2); p.closePath();
    cel(c, p, B(-28, -32, 56, 62), '#7ed957', '#4fae3a', '#c4f5a0', { outline: W });
    const d = dropPath(0, 14, 7); c.fillStyle = '#bff0ff'; c.fill(d); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(d);
  });
  ic('ic_missions', (c) => {
    const b = rrectPath(-26, -30, 52, 62, 8); cel(c, b, B(-26, -30, 52, 62), '#fff6e2', '#e3c79c', '#ffffff', { outline: W });
    const clip = rrectPath(-12, -36, 24, 12, 4); cel(c, clip, B(-12, -36, 24, 12), '#b9c4cf', '#7d8a96', null, { outline: 2.2 });
    for (let i = 0; i < 3; i++) {
      const y = -14 + i * 16;
      const cb = rrectPath(-18, y - 6, 12, 12, 3); c.fillStyle = i < 2 ? '#7ed957' : '#fff'; c.fill(cb); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(cb);
      c.fillStyle = '#c9b49a'; c.fillRect(-1, y - 2.5, 20, 5);
    }
  });
  ic('ic_daily', (c) => {
    const b = rrectPath(-30, -24, 60, 54, 8); cel(c, b, B(-30, -24, 60, 54), '#fff6e2', '#e3c79c', '#ffffff', { outline: W });
    const top = rrectPath(-30, -24, 60, 16, 6); cel(c, top, B(-30, -24, 60, 16), '#ef5a4f', '#b93a35', null, { outline: W });
    for (const x of [-16, 16]) { const r = rrectPath(x - 3, -32, 6, 14, 3); cel(c, r, B(x - 3, -32, 6, 14), '#7d8a96', '#4f5a66', null, { outline: 2 }); }
    const s = star(0, 8, 15, 7, 5); cel(c, s, B(-15, -7, 30, 30), PAL.gold, PAL.goldDark, PAL.goldLight, { outline: 2.2 });
  });
  ic('ic_streak', (c) => {
    const b = ellipsePath(0, 0, 30, 30); cel(c, b, B(-30, -30, 60, 60), '#ff8fb8', '#d9608f', '#ffd0e2', { outline: W });
    c.strokeStyle = '#fff'; c.lineWidth = 3.5; c.setLineDash([4, 4]); c.beginPath(); c.arc(0, 0, 22, 0, 7); c.stroke(); c.setLineDash([]);
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = OUT; c.lineWidth = 10; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-3, 10); c.lineTo(14, -10); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 5; c.stroke(); c.restore();
  });
  ic('ic_gift', (c) => {
    const b = rrectPath(-26, -6, 52, 36, 5); cel(c, b, B(-26, -6, 52, 36), '#ff8fb8', '#d9608f', '#ffd0e2', { outline: W });
    const l = rrectPath(-30, -18, 60, 14, 4); cel(c, l, B(-30, -18, 60, 14), '#ff6f91', '#d94a70', '#ffb3c6', { outline: W });
    c.fillStyle = '#ffcf3d'; c.fillRect(-6, -18, 12, 48); c.strokeStyle = OUT; c.lineWidth = 2; c.strokeRect(-6, -18, 12, 48);
    for (const s of [-1, 1]) { const bw = ellipsePath(s * 11, -24, 11, 7, s * 0.4); cel(c, bw, B(s * 11 - 11, -31, 22, 14), '#ffcf3d', '#d9951f', null, { outline: 2.2 }); }
  });
  ic('ic_music', (c) => {
    c.save(); c.strokeStyle = OUT; c.lineWidth = 6; c.beginPath(); c.moveTo(-6, 18); c.lineTo(-6, -24); c.lineTo(22, -30); c.lineTo(22, 12); c.stroke(); c.strokeStyle = '#5aa0e6'; c.lineWidth = 2.5; c.stroke(); c.restore();
    for (const [x, y] of [[-14, 20], [14, 14]]) { const n = ellipsePath(x, y, 10, 8, -0.3); cel(c, n, B(x - 10, y - 8, 20, 16), '#5aa0e6', '#3a6fb8', '#9ccaff', { outline: W }); }
  });
  ic('ic_sfx', (c) => {
    const p = new Path2D(); p.moveTo(-28, -10); p.lineTo(-14, -10); p.lineTo(4, -26); p.lineTo(4, 26); p.lineTo(-14, 10); p.lineTo(-28, 10); p.closePath();
    cel(c, p, B(-28, -26, 32, 52), '#ffcf3d', '#d9951f', '#fff09a', { outline: W });
    c.save(); c.lineCap = 'round'; c.strokeStyle = OUT; c.lineWidth = 5; for (const r of [14, 26]) { c.beginPath(); c.arc(6, 0, r, -0.8, 0.8); c.stroke(); } c.restore();
  });
  ic('ic_vibe', (c) => {
    const p = rrectPath(-14, -28, 28, 56, 7); cel(c, p, B(-14, -28, 28, 56), '#5aa0e6', '#3a6fb8', '#9ccaff', { outline: W });
    c.fillStyle = '#dff4ff'; c.fillRect(-8, -20, 16, 34);
    c.save(); c.lineCap = 'round'; c.strokeStyle = OUT; c.lineWidth = 4;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 22, -14); c.lineTo(s * 28, -6); c.lineTo(s * 22, 2); c.lineTo(s * 28, 10); c.stroke(); }
    c.restore();
  });
  ic('ic_lang', (c) => {
    const p = ellipsePath(0, 0, 30, 30); cel(c, p, B(-30, -30, 60, 60), '#7fd6ff', '#2a9fd8', '#d8f6ff', { outline: W });
    c.save(); c.clip(p); c.fillStyle = '#7ed957'; c.beginPath(); c.ellipse(-10, -6, 14, 10, 0.5, 0, 7); c.fill(); c.beginPath(); c.ellipse(14, 14, 12, 9, -0.4, 0, 7); c.fill(); c.restore();
    c.strokeStyle = rgba(OUT, 0.6); c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 12, 30, 0, 0, 7); c.moveTo(-30, 0); c.lineTo(30, 0); c.stroke();
  });
  ic('ic_gfx', (c) => {
    const s1 = star(-6, -2, 26, 9, 4, 0); cel(c, s1, B(-32, -28, 52, 52), '#ffcf3d', '#d9951f', '#fff09a', { outline: W });
    const s2 = star(20, 18, 12, 4, 4, 0); cel(c, s2, B(8, 6, 24, 24), '#7fd6ff', '#2a9fd8', null, { outline: 2.2 });
  });
  ic('ic_eye', (c) => {
    const p = new Path2D(); p.moveTo(-32, 0); p.quadraticCurveTo(0, -30, 32, 0); p.quadraticCurveTo(0, 30, -32, 0); p.closePath();
    cel(c, p, B(-32, -16, 64, 32), '#ffffff', '#dfe8ee', null, { outline: W });
    const i = ellipsePath(0, 0, 12, 12); cel(c, i, B(-12, -12, 24, 24), '#ffcf3d', '#d9951f', null, { outline: 2.4 });
    c.fillStyle = OUT; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(-3, -3, 2.2, 0, 7); c.fill();
  });
  ic('ic_lock', (c) => {
    c.save(); c.strokeStyle = OUT; c.lineWidth = 12; c.beginPath(); c.arc(0, -8, 14, Math.PI, 0); c.stroke(); c.strokeStyle = '#b9c4cf'; c.lineWidth = 6; c.stroke(); c.restore();
    const b = rrectPath(-22, -8, 44, 36, 8); cel(c, b, B(-22, -8, 44, 36), '#ffcf3d', '#d9951f', '#fff09a', { outline: W });
    c.fillStyle = OUT; c.beginPath(); c.arc(0, 6, 5, 0, 7); c.fill(); c.fillRect(-2.5, 6, 5, 11);
  });
  ic('ic_check', (c) => { c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = OUT; c.lineWidth = 18; c.beginPath(); c.moveTo(-22, 0); c.lineTo(-6, 16); c.lineTo(24, -16); c.stroke(); c.strokeStyle = '#7ed957'; c.lineWidth = 10; c.stroke(); c.restore(); });
  ic('ic_star', (c) => { const s = star(0, 2, 32, 15, 5); cel(c, s, B(-32, -30, 64, 62), PAL.gold, PAL.goldDark, PAL.goldLight, { outline: W, gloss: true }); });
  ic('ic_star_empty', (c) => { const s = star(0, 2, 32, 15, 5); cel(c, s, B(-32, -30, 64, 62), '#d8cbb8', '#b8a890', null, { outline: W }); });
  ic('ic_info', (c) => { const p = ellipsePath(0, 0, 28, 28); cel(c, p, B(-28, -28, 56, 56), '#5aa0e6', '#3a6fb8', '#9ccaff', { outline: W }); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -13, 5, 0, 7); c.fill(); c.fillRect(-4.5, -4, 9, 22); });
  ic('ic_reset', (c) => { c.save(); c.lineCap = 'round'; c.strokeStyle = OUT; c.lineWidth = 12; c.beginPath(); c.arc(0, 2, 22, -2.6, 2.2); c.stroke(); c.strokeStyle = '#ef5a4f'; c.lineWidth = 6; c.stroke(); c.restore(); const p = new Path2D(); p.moveTo(-28, -24); p.lineTo(-6, -24); p.lineTo(-24, -4); p.closePath(); cel(c, p, B(-28, -24, 22, 20), '#ef5a4f', '#b93a35', null, { outline: 2.2 }); });
  ic('ic_paw', (c) => { c.fillStyle = '#c9783f'; c.strokeStyle = OUT; c.lineWidth = W; c.beginPath(); c.ellipse(0, 10, 18, 15, 0, 0, 7); c.fill(); c.stroke(); for (const [x, y] of [[-20, -10], [-7, -20], [7, -20], [20, -10]]) { c.beginPath(); c.ellipse(x, y, 7, 8.5, 0, 0, 7); c.fill(); c.stroke(); } });
  ic('ic_crown', (c) => { const p = new Path2D(); p.moveTo(-28, 18); p.lineTo(-32, -16); p.lineTo(-14, -2); p.lineTo(0, -24); p.lineTo(14, -2); p.lineTo(32, -16); p.lineTo(28, 18); p.closePath(); cel(c, p, B(-32, -24, 64, 42), PAL.gold, PAL.goldDark, PAL.goldLight, { outline: W, gloss: true }); });
  ic('ic_goo', (c) => blobMini(c, 0, 8, 26));
  ic('ic_coin', (c) => { const p = ellipsePath(0, 0, 28, 28); cel(c, p, B(-28, -28, 56, 56), PAL.gold, PAL.goldDark, PAL.goldLight, { outline: W }); const s = star(0, 1, 14, 6.5, 5); c.fillStyle = PAL.goldLight; c.fill(s); c.strokeStyle = PAL.goldDark; c.lineWidth = 2.2; c.stroke(s); });

  // ----- upgrades
  ic('ic_up_power', (c) => { stream(c, [[-30, 22], [30, -18]], 16); const n = rrectPath(-36, 14, 18, 18, 5); cel(c, n, B(-36, 14, 18, 18), '#ff8a3d', '#d45f1f', null, { outline: W }); });
  ic('ic_up_range', (c) => {
    const t = ellipsePath(18, -12, 16, 16); cel(c, t, B(2, -28, 32, 32), '#ffffff', '#e0e8ee', null, { outline: W });
    c.strokeStyle = '#ef5a4f'; c.lineWidth = 4; c.beginPath(); c.arc(18, -12, 9, 0, 7); c.stroke(); c.fillStyle = '#ef5a4f'; c.beginPath(); c.arc(18, -12, 3.5, 0, 7); c.fill();
    stream(c, [[-30, 28], [8, -4]], 8);
  });
  ic('ic_up_health', (c) => { heart(c, -4, 2, 24); plus(c, 20, 18, 12); });
  ic('ic_up_pressure', (c) => gauge(c, 0.8));
  ic('ic_up_splash', (c) => splashIcon(c));

  // ----- skills
  ic('ic_skill_thick', (c) => stream(c, [[-30, 26], [30, -24]], 22));
  ic('ic_skill_range', (c) => { stream(c, [[-32, 26], [26, -22]], 7); const p = new Path2D(); p.moveTo(34, -30); p.lineTo(16, -26); p.lineTo(30, -12); p.closePath(); cel(c, p, B(16, -30, 18, 18), '#ffcf3d', '#d9951f', null, { outline: 2.2 }); });
  ic('ic_skill_multi', (c) => { stream(c, [[-26, 28], [-4, 4], [26, -26]], 9); stream(c, [[-4, 4], [30, 12]], 9); });
  ic('ic_skill_pierce', (c) => { stream(c, [[-34, 18], [34, -14]], 9); blobMini(c, 2, 4, 15); stream(c, [[10, -2], [34, -14]], 9); });
  ic('ic_skill_chain', (c) => { blobMini(c, -20, 18, 13); blobMini(c, 22, -10, 13); stream(c, [[-34, -26], [-20, 8]], 7); stream(c, [[-14, 10], [0, -6], [6, 8], [18, -12]], 5); });
  ic('ic_skill_splash', (c) => splashIcon(c, 1.1));
  ic('ic_skill_turbo', (c) => { gauge(c, 1); const b = new Path2D(); b.moveTo(10, -36); b.lineTo(-6, -8); b.lineTo(4, -8); b.lineTo(-4, 14); b.lineTo(16, -14); b.lineTo(6, -14); b.closePath(); cel(c, b, B(-6, -36, 22, 50), '#ffcf3d', '#d9951f', '#fff09a', { outline: 2.2 }); });
  ic('ic_skill_keep', (c) => { gauge(c, 0.6); const h = new Path2D(); h.moveTo(12, -34); h.lineTo(34, -34); h.lineTo(24, -20); h.lineTo(34, -6); h.lineTo(12, -6); h.lineTo(22, -20); h.closePath(); cel(c, h, B(12, -34, 22, 28), '#ffe0a8', '#e0b878', null, { outline: 2.2 }); });
  ic('ic_skill_speed', (c) => {
    const boot = new Path2D(); boot.moveTo(-14, -26); boot.lineTo(6, -26); boot.lineTo(6, 8); boot.lineTo(26, 12); boot.quadraticCurveTo(30, 24, 22, 26); boot.lineTo(-16, 26); boot.closePath();
    cel(c, boot, B(-16, -26, 46, 52), '#2a96f0', '#1a5fae', '#7fc8ff', { outline: W });
    const wing = smoothPath([[-14, -18], [-34, -26], [-30, -14], [-36, -6], [-14, -6]], true, 0.6); cel(c, wing, B(-36, -26, 22, 20), '#ffffff', '#dfe8ee', null, { outline: 2.2 });
  });
  ic('ic_skill_shield', (c) => { const p = ellipsePath(0, 0, 30, 30); c.fillStyle = 'rgba(190,235,255,0.55)'; c.fill(p); c.strokeStyle = '#2a9fd8'; c.lineWidth = 4; c.stroke(p); c.strokeStyle = OUT; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 32, 0, 7); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-11, -13, 9, 5, -0.6, 0, 7); c.fill(); });
  ic('ic_skill_trail', (c) => { for (const [x, y, r] of [[-22, 18, 9], [-2, 4, 12], [20, -14, 15]]) { const p = ellipsePath(x, y, r, r); c.fillStyle = 'rgba(190,235,255,0.6)'; c.fill(p); c.strokeStyle = '#2a9fd8'; c.lineWidth = 3; c.stroke(p); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.4, r * 0.3, r * 0.18, -0.6, 0, 7); c.fill(); } });
  ic('ic_skill_magnet', (c) => {
    c.save(); c.lineCap = 'butt'; c.strokeStyle = OUT; c.lineWidth = 20; c.beginPath(); c.arc(0, -4, 20, Math.PI, 0); c.lineTo(20, 22); c.moveTo(-20, -4); c.lineTo(-20, 22); c.stroke();
    c.strokeStyle = '#ef5a4f'; c.lineWidth = 13; c.stroke(); c.restore();
    c.fillStyle = '#e8eef3'; c.fillRect(-26.5, 14, 13, 9); c.fillRect(13.5, 14, 13, 9);
    const d = dropPath(0, 26, 6); c.fillStyle = '#7fd6ff'; c.fill(d); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(d);
  });
  ic('ic_skill_vitality', (c) => { heart(c, -2, 2, 26); plus(c, 20, 18, 12); });
  ic('ic_skill_heal', (c) => { const p = dropPath(0, 10, 22); cel(c, p, B(-22, -24, 44, 56), '#ff7fa3', '#d9507a', '#ffc2d4', { outline: W, gloss: true }); const h = heartPath(0, 12, 10); c.fillStyle = '#fff'; c.fill(h); });

  // ----- shelter decorations (also used as icons)
  const dc = (name: string, w: number, h: number, ay: number, fn: Fn) => sprite(name, w, h, w / 2, ay, (ctx) => { ctx.translate(w / 2, ay); fn(ctx); });
  dc('dc_ball', 80, 80, 70, (c) => { const p = ellipsePath(0, -26, 26, 26); cel(c, p, B(-26, -52, 52, 52), '#ef5a4f', '#b93a35', '#ff9a90', { outline: W, gloss: true }); c.save(); c.clip(p); c.fillStyle = '#ffffff'; c.fillRect(-30, -32, 60, 10); c.restore(); c.strokeStyle = OUT; c.lineWidth = W; c.stroke(p); });
  dc('dc_cushion', 130, 80, 66, (c) => { const p = smoothPath([[-56, -6], [-50, -34], [0, -40], [50, -34], [56, -6], [40, 4], [-40, 4]], true, 0.8); cel(c, p, B(-56, -40, 112, 44), '#b57ae8', '#7d49c2', '#e3c6ff', { outline: W, texture: 0.4, seed: 3 }); c.fillStyle = '#ffcf3d'; for (const x of [-30, 0, 30]) { c.beginPath(); c.arc(x, -20, 4, 0, 7); c.fill(); } });
  dc('dc_bowl', 90, 64, 54, (c) => { const p = new Path2D(); p.moveTo(-36, -22); p.lineTo(36, -22); p.lineTo(26, 2); p.lineTo(-26, 2); p.closePath(); cel(c, p, B(-36, -22, 72, 24), '#5aa0e6', '#3a6fb8', '#9ccaff', { outline: W }); c.fillStyle = '#c9783f'; for (const [x, y] of [[-16, -26], [-4, -29], [9, -27], [20, -25], [3, -24]]) { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.6; c.stroke(); } const pw = ellipsePath(0, -10, 6, 5); c.fillStyle = '#fff'; c.fill(pw); });
  dc('dc_flowers', 150, 90, 74, (c) => { const p = ellipsePath(0, -12, 64, 22); cel(c, p, B(-64, -34, 128, 44), '#8a5a32', '#5a361c', '#b07a4a', { outline: W }); const cols = ['#ff9ec4', '#ffe066', '#ffffff', '#a8d8ff', '#ff8a3d', '#ff9ec4', '#ffe066']; cols.forEach((col, i) => { const x = -48 + i * 16, y = -22 - (i % 2) * 10; c.strokeStyle = PAL.leafDark; c.lineWidth = 3; c.beginPath(); c.moveTo(x, -10); c.lineTo(x, y); c.stroke(); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; c.fillStyle = col; c.beginPath(); c.arc(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5, 0, 7); c.fill(); c.strokeStyle = rgba(OUT, 0.7); c.lineWidth = 1.2; c.stroke(); } c.fillStyle = '#ffb02e'; c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fill(); }); });
  dc('dc_pond', 200, 110, 82, (c) => { const p = smoothPath([[-90, -20], [-60, -48], [0, -52], [70, -44], [92, -18], [60, 4], [0, 8], [-64, 2]], true, 0.8); cel(c, p, B(-92, -52, 184, 60), '#55c2f5', '#2a8fd0', '#bdf0ff', { outline: W }); c.save(); c.clip(p); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3; for (const [x, y] of [[-40, -30], [20, -18], [40, -36]]) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10, y - 5, x + 20, y); c.stroke(); } c.restore(); const lily = ellipsePath(-30, -14, 14, 8); cel(c, lily, B(-44, -22, 28, 16), '#7ed957', '#4fae3a', null, { outline: 2 }); c.fillStyle = '#ff9ec4'; c.beginPath(); c.arc(-28, -18, 5, 0, 7); c.fill(); });
  dc('dc_treehouse', 180, 210, 196, (c) => { const tr = rrectPath(-14, -120, 28, 120, 6); cel(c, tr, B(-14, -120, 28, 120), PAL.wood, PAL.woodDark, PAL.woodLight, { outline: W, texture: 0.6, seed: 2 }); const h = rrectPath(-50, -170, 100, 60, 6); cel(c, h, B(-50, -170, 100, 60), '#d39a5d', '#a06a3a', '#f0c08a', { outline: W, texture: 0.5, seed: 5 }); const r = new Path2D(); r.moveTo(-62, -164); r.lineTo(0, -200); r.lineTo(62, -164); r.closePath(); cel(c, r, B(-62, -200, 124, 36), '#ef6a4f', '#b9433a', '#ff9c84', { outline: W }); const d = rrectPath(-12, -150, 24, 40, 10); c.fillStyle = '#5a361c'; c.fill(d); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(d); c.strokeStyle = PAL.woodDark; c.lineWidth = 4; for (let y = -100; y < -10; y += 16) { c.beginPath(); c.moveTo(18, y); c.lineTo(34, y); c.stroke(); } c.beginPath(); c.moveTo(18, -110); c.lineTo(18, 0); c.moveTo(34, -110); c.lineTo(34, 0); c.stroke(); });
  dc('dc_slide', 190, 160, 146, (c) => { const lad = new Path2D(); lad.rect(-70, -120, 10, 120); lad.rect(-40, -120, 10, 120); c.fillStyle = '#ffcf3d'; c.fill(lad); c.strokeStyle = OUT; c.lineWidth = 2.4; c.stroke(lad); for (let y = -110; y < 0; y += 22) { c.fillStyle = '#ffcf3d'; c.fillRect(-60, y, 20, 6); c.strokeRect(-60, y, 20, 6); } const sl = new Path2D(); sl.moveTo(-36, -124); sl.lineTo(-20, -124); sl.quadraticCurveTo(30, -60, 84, -8); sl.lineTo(84, 6); sl.lineTo(68, 6); sl.quadraticCurveTo(16, -50, -36, -106); sl.closePath(); cel(c, sl, B(-36, -124, 120, 130), '#5aa0e6', '#3a6fb8', '#9ccaff', { outline: W, gloss: true }); const top = rrectPath(-76, -132, 60, 12, 4); cel(c, top, B(-76, -132, 60, 12), '#ef5a4f', '#b93a35', null, { outline: 2.2 }); });
  dc('dc_fountain', 180, 180, 160, (c) => { const base = ellipsePath(0, -20, 76, 26); cel(c, base, B(-76, -46, 152, 52), PAL.stone, PAL.stoneDark, PAL.stoneLight, { outline: W, texture: 0.6, seed: 4 }); const water = ellipsePath(0, -24, 62, 18); cel(c, water, B(-62, -42, 124, 36), '#7fd6ff', '#2a9fd8', '#d8f6ff', { outline: 2.2 }); const col = rrectPath(-10, -90, 20, 66, 6); cel(c, col, B(-10, -90, 20, 66), PAL.stoneLight, PAL.stone, null, { outline: W }); const bowl = ellipsePath(0, -92, 34, 12); cel(c, bowl, B(-34, -104, 68, 24), PAL.stone, PAL.stoneDark, PAL.stoneLight, { outline: W }); for (const s of [-1, 1]) { c.save(); c.lineCap = 'round'; c.strokeStyle = OUT; c.lineWidth = 9; c.beginPath(); c.moveTo(0, -110); c.quadraticCurveTo(s * 40, -150, s * 52, -30); c.stroke(); c.strokeStyle = '#9fe2ff'; c.lineWidth = 5; c.stroke(); c.restore(); } const top = dropPath(0, -112, 8); c.fillStyle = '#bff0ff'; c.fill(top); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(top); });
  // small home-sign for the shelter
  dc('sh_sign', 140, 120, 110, (c) => { for (const x of [-40, 40]) { const p = rrectPath(x - 5, -70, 10, 70, 3); cel(c, p, B(x - 5, -70, 10, 70), PAL.wood, PAL.woodDark, null, { outline: 2.2 }); } const b = rrectPath(-62, -106, 124, 46, 10); cel(c, b, B(-62, -106, 124, 46), '#fff1d6', '#e3c79c', '#fffaf0', { outline: W }); c.fillStyle = '#c9783f'; c.strokeStyle = OUT; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -78, 9, 7.5, 0, 0, 7); c.fill(); c.stroke(); for (const [x, y] of [[-10, -90], [-3, -95], [4, -95], [11, -90]]) { c.beginPath(); c.ellipse(x, y, 3.5, 4.2, 0, 0, 7); c.fill(); c.stroke(); } });
  void eye; void mouth; void blush;
}
