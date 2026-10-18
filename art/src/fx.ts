// Effect sprites: splashes, sprays, droplets, sparkles, coins, pickups and
// small in-world UI marks. Same outline + palette as the rest of the game.
import { sprite } from './atlas';
import { PAL, OUT, OUTW, GOO, ARng, cel, ellipsePath, star, dropPath, heartPath, rrectPath, smoothPath, rgba, lighten, type Ctx } from './kit';

function waterDrop(ctx: Ctx, x: number, y: number, r: number, rot = 0, outline = true) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const p = dropPath(0, 0, r);
  if (outline) { ctx.strokeStyle = rgba('#1f6fae', 0.9); ctx.lineWidth = Math.max(1.4, r * 0.28); ctx.stroke(p); }
  ctx.fillStyle = '#7fd6ff'; ctx.fill(p);
  ctx.save(); ctx.clip(p);
  ctx.fillStyle = '#c9f1ff'; ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.3, r * 0.55, r * 0.75, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.18, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore(); ctx.restore();
}

function splash(ctx: Ctx, f: number) {
  // f = 0..5 : crown of water expanding then breaking into droplets
  const k = f / 5;
  const R = 26 + k * 46; const alpha = f < 4 ? 1 : 1 - (f - 3) * 0.4;
  ctx.save(); ctx.globalAlpha = Math.max(0, alpha);
  // ground ring
  ctx.strokeStyle = rgba('#e8fbff', 0.9 - k * 0.6); ctx.lineWidth = 10 - k * 7;
  ctx.beginPath(); ctx.ellipse(0, 0, R * 1.05, R * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = rgba('#6fd0ff', 0.8 - k * 0.5); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(0, 0, R * 0.9, R * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
  if (f <= 3) {
    // crown spikes
    const n = 9;
    const crownH = [26, 44, 40, 26][f];
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i / (n - 1)) * Math.PI;
      const x = Math.cos(a) * R * 0.7, y = Math.sin(a) * R * 0.25;
      const h = crownH * (0.7 + 0.3 * Math.sin(i * 2.3));
      const p = new Path2D(); p.moveTo(x - 6, y); p.quadraticCurveTo(x - 2, y - h * 0.6, x + Math.cos(a) * 6, y - h); p.quadraticCurveTo(x + 2, y - h * 0.6, x + 6, y); p.closePath();
      ctx.fillStyle = '#9fe2ff'; ctx.fill(p); ctx.strokeStyle = rgba('#2b86c8', 0.85); ctx.lineWidth = 2; ctx.stroke(p);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.ellipse(x - 1.5, y - h * 0.55, 1.6, h * 0.22, 0, 0, Math.PI * 2); ctx.fill();
      if (f >= 1) waterDrop(ctx, x * 1.3 + Math.cos(a) * 10 * f, y - h - 8 - f * 6, 4 + (i % 3), Math.cos(a) * 0.6);
    }
  } else {
    const r = new ARng(f);
    for (let i = 0; i < 12; i++) { const a = r.r(0, Math.PI * 2); waterDrop(ctx, Math.cos(a) * R * r.r(0.6, 1.1), Math.sin(a) * R * 0.45 - r.r(0, 20), r.r(3, 6), a); }
  }
  // white foam blob in the middle
  if (f <= 2) {
    const p = smoothPath(Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; const rr = (18 + f * 6) * (i % 2 ? 0.8 : 1.05); return [Math.cos(a) * rr, Math.sin(a) * rr * 0.6 - 6] as [number, number]; }), true, 0.9);
    ctx.fillStyle = '#ffffff'; ctx.fill(p); ctx.strokeStyle = rgba('#5ab8f0', 0.8); ctx.lineWidth = 2; ctx.stroke(p);
  }
  ctx.restore();
}

function impact(ctx: Ctx, f: number) {
  const r = new ARng(10 + f);
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + r.r(-1.3, 1.3); const d = 8 + f * 5 + r.r(0, 8);
    waterDrop(ctx, Math.cos(a) * d, Math.sin(a) * d, r.r(2.5, 4.5), a + Math.PI / 2);
  }
  const p = ellipsePath(0, 0, 12 + f * 2, 8 + f);
  ctx.globalAlpha = 0.85 - f * 0.18; ctx.fillStyle = '#ffffff'; ctx.fill(p);
  ctx.strokeStyle = rgba('#6fd0ff', 0.9); ctx.lineWidth = 2; ctx.stroke(p);
  ctx.restore();
}

function coin(ctx: Ctx, f: number) {
  const sx = [1, 0.7, 0.2, 0.7][f];
  ctx.save(); ctx.scale(sx, 1);
  const p = ellipsePath(0, 0, 13, 13);
  cel(ctx, p, { x: -13, y: -13, w: 26, h: 26 }, PAL.gold, PAL.goldDark, PAL.goldLight, { outline: 2.2 / Math.max(sx, 0.4) });
  if (sx > 0.5) {
    const s = star(0, 0.5, 6.5, 3, 5); ctx.fillStyle = PAL.goldLight; ctx.fill(s); ctx.strokeStyle = PAL.goldDark; ctx.lineWidth = 1.4; ctx.stroke(s);
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(-5 * sx, -6, 2.4, 0, 7); ctx.fill();
}

function sparkle(ctx: Ctx, f: number, col = '#ffffff') {
  const s = [0.6, 1, 0.75][f];
  const p = star(0, 0, 14 * s, 3.2 * s, 4, 0);
  ctx.fillStyle = col; ctx.fill(p);
  ctx.strokeStyle = rgba('#ffcf3d', 0.9); ctx.lineWidth = 1.5; ctx.stroke(p);
}

export function register() {
  for (let f = 0; f < 6; f++) sprite(`fx_splash_${f}`, 180, 150, 90, 100, (ctx) => { ctx.translate(90, 100); splash(ctx, f); });
  for (let f = 0; f < 4; f++) sprite(`fx_impact_${f}`, 90, 90, 45, 55, (ctx) => { ctx.translate(45, 55); impact(ctx, f); });
  sprite('fx_ring', 128, 128, 64, 64, (ctx) => { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(64, 64, 56, 0, Math.PI * 2); ctx.stroke(); });
  sprite('fx_softring', 128, 128, 64, 64, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 30, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.75, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  });
  sprite('fx_glow', 128, 128, 64, 64, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.4, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  });
  sprite('fx_rays', 300, 300, 150, 150, (ctx) => {
    ctx.translate(150, 150);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2; const g = ctx.createLinearGradient(0, 0, Math.cos(a) * 150, Math.sin(a) * 150);
      g.addColorStop(0, 'rgba(255,250,210,0.9)'); g.addColorStop(1, 'rgba(255,250,210,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 150, a - 0.09, a + 0.09); ctx.closePath(); ctx.fill();
    }
  });
  sprite('p_water', 24, 28, 12, 16, (ctx) => waterDrop(ctx, 12, 18, 7));
  sprite('p_water_s', 14, 16, 7, 9, (ctx) => waterDrop(ctx, 7, 10, 4, 0, false));
  sprite('p_mist', 64, 64, 32, 32, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(240,252,255,0.85)'); g.addColorStop(0.6, 'rgba(220,245,255,0.4)'); g.addColorStop(1, 'rgba(220,245,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  });
  sprite('p_bubble', 40, 40, 20, 20, (ctx) => {
    const p = ellipsePath(20, 20, 15, 15);
    ctx.fillStyle = 'rgba(200,240,255,0.35)'; ctx.fill(p);
    ctx.strokeStyle = 'rgba(80,170,230,0.9)'; ctx.lineWidth = 2.2; ctx.stroke(p);
    const g = ctx.createLinearGradient(5, 5, 35, 35); g.addColorStop(0, 'rgba(255,180,230,0.6)'); g.addColorStop(0.5, 'rgba(180,255,240,0.4)'); g.addColorStop(1, 'rgba(180,200,255,0.5)');
    ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(20, 20, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.ellipse(14, 13, 4.5, 2.6, -0.7, 0, Math.PI * 2); ctx.fill();
  });
  for (let f = 0; f < 3; f++) sprite(`p_sparkle_${f}`, 40, 40, 20, 20, (ctx) => { ctx.translate(20, 20); sparkle(ctx, f); });
  sprite('p_star', 40, 40, 20, 20, (ctx) => { const p = star(20, 21, 15, 7, 5); cel(ctx, p, { x: 5, y: 6, w: 30, h: 30 }, PAL.gold, PAL.goldDark, PAL.goldLight, { outline: 2 }); });
  sprite('p_heart', 36, 34, 18, 17, (ctx) => { const p = heartPath(18, 17, 12); cel(ctx, p, { x: 4, y: 4, w: 28, h: 26 }, '#ff6f91', '#d94a70', '#ffb3c6', { outline: 2.2, gloss: true }); });
  for (let f = 0; f < 4; f++) sprite(`p_coin_${f}`, 40, 40, 20, 20, (ctx) => { ctx.translate(20, 20); coin(ctx, f); });
  sprite('p_xp', 38, 42, 19, 23, (ctx) => {
    const g = ctx.createRadialGradient(19, 23, 0, 19, 23, 17); g.addColorStop(0, 'rgba(160,240,255,0.7)'); g.addColorStop(1, 'rgba(160,240,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 38, 42);
    const p = dropPath(19, 25, 8); cel(ctx, p, { x: 11, y: 12, w: 16, h: 22 }, '#4fc3f7', '#1f8fd0', '#bdf0ff', { outline: 2, gloss: true });
  });
  sprite('p_heal', 36, 40, 18, 22, (ctx) => {
    const p = dropPath(18, 25, 10); cel(ctx, p, { x: 8, y: 9, w: 20, h: 27 }, '#ff7fa3', '#d9507a', '#ffc2d4', { outline: 2.2, gloss: true });
    const h = heartPath(18, 26, 5); ctx.fillStyle = '#fff'; ctx.fill(h);
  });
  for (const [k, c] of Object.entries(GOO)) sprite(`p_goo_${k}`, 22, 22, 11, 11, (ctx) => {
    const p = ellipsePath(11, 11, 7, 7); cel(ctx, p, { x: 4, y: 4, w: 14, h: 14 }, c[0], c[1], c[2], { outline: 1.6, gloss: true });
  });
  sprite('p_dust', 40, 30, 20, 15, (ctx) => {
    for (const [x, y, r] of [[12, 17, 8], [22, 13, 10], [30, 18, 7]]) { ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  });
  const conf = ['#ff6f91', '#ffcf3d', '#4fc3f7', '#7ed957', '#b57ae8'];
  conf.forEach((c, i) => sprite(`p_conf_${i}`, 16, 12, 8, 6, (ctx) => { const p = rrectPath(2, 2, 12, 8, 2); ctx.fillStyle = c; ctx.fill(p); ctx.strokeStyle = rgba(OUT, 0.6); ctx.lineWidth = 1; ctx.stroke(p); }));
  sprite('p_petal', 18, 14, 9, 7, (ctx) => { const p = ellipsePath(9, 7, 6, 4, 0.5); ctx.fillStyle = '#ffd1e3'; ctx.fill(p); ctx.strokeStyle = rgba('#d97a9e', 0.9); ctx.lineWidth = 1.2; ctx.stroke(p); });
  // in-world marks
  sprite('mk_help', 64, 60, 32, 56, (ctx) => {
    const b = new Path2D(); b.moveTo(10, 6); b.lineTo(54, 6); b.quadraticCurveTo(60, 6, 60, 12); b.lineTo(60, 36); b.quadraticCurveTo(60, 42, 54, 42); b.lineTo(38, 42); b.lineTo(32, 54); b.lineTo(26, 42); b.lineTo(10, 42); b.quadraticCurveTo(4, 42, 4, 36); b.lineTo(4, 12); b.quadraticCurveTo(4, 6, 10, 6); b.closePath();
    cel(ctx, b, { x: 4, y: 6, w: 56, h: 48 }, '#ffffff', '#e3eef5', null, { outline: 2.4 });
    const h = heartPath(32, 24, 10); cel(ctx, h, { x: 20, y: 13, w: 24, h: 22 }, '#ff6f91', '#d94a70', '#ffb3c6', { outline: 1.8 });
  });
  sprite('mk_excl', 48, 56, 24, 52, (ctx) => {
    const b = ellipsePath(24, 24, 20, 20); cel(ctx, b, { x: 4, y: 4, w: 40, h: 40 }, PAL.gold, PAL.goldDark, PAL.goldLight, { outline: 2.4 });
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.moveTo(24, 46); ctx.lineTo(18, 40); ctx.lineTo(30, 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a4a10'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 24, 25);
  });
  sprite('mk_zzz', 56, 60, 26, 56, (ctx) => { ctx.translate(4, 16);
    ctx.font = 'bold 18px sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = OUT; ctx.fillStyle = '#ffffff';
    for (const [t, x, y, s] of [['z', 8, 34, 14], ['z', 20, 22, 18], ['Z', 30, 10, 22]] as [string, number, number, number][]) { ctx.font = `bold ${s}px sans-serif`; ctx.strokeText(t, x, y); ctx.fillText(t, x, y); }
  });
  sprite('mk_arrow', 70, 70, 35, 35, (ctx) => {
    const p = new Path2D(); p.moveTo(35, 6); p.lineTo(64, 36); p.lineTo(46, 36); p.lineTo(46, 64); p.lineTo(24, 64); p.lineTo(24, 36); p.lineTo(6, 36); p.closePath();
    cel(ctx, p, { x: 6, y: 6, w: 58, h: 58 }, '#ffffff', '#cfe9ff', null, { outline: 3 });
  });
  sprite('mk_hand', 90, 110, 30, 12, (ctx) => {
    // tutorial thumb (mitten-like, friendly)
    ctx.translate(30, 12);
    const p = smoothPath([[-10, 0], [8, -2], [12, 20], [30, 24], [44, 34], [46, 60], [36, 88], [6, 92], [-12, 70], [-14, 36], [-12, 10]], true, 0.6);
    cel(ctx, p, { x: -14, y: -2, w: 60, h: 94 }, '#fff3e6', '#e6c7a8', '#ffffff', { outline: 3 });
    ctx.strokeStyle = 'rgba(160,110,80,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, 40); ctx.lineTo(34, 44); ctx.moveTo(12, 56); ctx.lineTo(36, 60); ctx.stroke();
  });
  sprite('mk_joybase', 160, 160, 80, 80, (ctx) => {
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(80, 80, 74, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = 'rgba(58,36,22,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(80, 80, 77, 0, 7); ctx.stroke();
  });
  sprite('mk_joyknob', 80, 80, 40, 40, (ctx) => {
    const p = ellipsePath(40, 40, 30, 30); cel(ctx, p, { x: 10, y: 10, w: 60, h: 60 }, 'rgba(255,255,255,0.92)', 'rgba(200,225,240,0.95)', null, { outline: 3, gloss: true });
  });
  sprite('mk_shield', 120, 120, 60, 60, (ctx) => {
    const p = ellipsePath(60, 60, 54, 54);
    const g = ctx.createRadialGradient(60, 60, 30, 60, 60, 56); g.addColorStop(0, 'rgba(180,240,255,0.05)'); g.addColorStop(0.85, 'rgba(160,230,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0.7)');
    ctx.fillStyle = g; ctx.fill(p); ctx.strokeStyle = 'rgba(120,200,255,0.9)'; ctx.lineWidth = 3; ctx.stroke(p);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.ellipse(40, 32, 12, 6, -0.6, 0, 7); ctx.fill();
  });
  void OUTW; void lighten;
}
