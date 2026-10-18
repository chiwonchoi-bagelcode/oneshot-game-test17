// Goo monsters (soft, glossy, cute), their droplets, cocoons and ground goo.
import { sprite } from './atlas';
import { GOO, OUT, OUTW, ARng, cel, ellipsePath, smoothPath, eye, mouth, blush, gloss, star, type Ctx, type Mood, rgba, lighten } from './kit';

type Expr = 'normal' | 'hit' | 'charge';

interface Look { col: [string, string, string]; eyes: number; eyeR: number; eyeY: number; mouthY: number }

function domePts(R: number, w: number, h: number, seed: number, lumps = 0): [number, number][] {
  // jelly dome with a wide soft bottom; origin at bottom center
  const pts: [number, number][] = [];
  const n = 18; const rng = new ARng(seed);
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / n) * Math.PI * 2; // start at left
    const ca = Math.cos(a), sa = Math.sin(a);
    let rx = R * w, ry = R * h;
    let y = sa < 0 ? sa * ry : sa * R * 0.16; // flat-ish bottom
    let x = ca * rx * (sa > 0 ? 1.04 : 1);
    if (lumps && sa < -0.3) { y *= 1 + Math.sin(a * lumps) * 0.06; }
    x *= 1 + rng.r(-0.015, 0.015);
    pts.push([x, y - R * 0.16]);
  }
  return pts;
}

function bubbles(ctx: Ctx, path: Path2D, R: number, col: string, seed: number, n = 5) {
  const r = new ARng(seed);
  ctx.save(); ctx.clip(path);
  for (let i = 0; i < n; i++) {
    const x = r.r(-R * 0.55, R * 0.55), y = r.r(-R * 1.2, -R * 0.35), rr = r.r(R * 0.04, R * 0.1);
    ctx.fillStyle = rgba(lighten(col, 0.6), 0.55); ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(x - rr * 0.35, y - rr * 0.35, rr * 0.35, 0, Math.PI * 2); ctx.fill();
  }
  // translucent inner glow
  const g = ctx.createRadialGradient(-R * 0.15, -R * 0.75, R * 0.1, 0, -R * 0.5, R * 1.1);
  g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.6, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-R * 2, -R * 2.5, R * 4, R * 3);
  ctx.restore();
}

function drips(ctx: Ctx, R: number, col: [string, string, string], seed: number) {
  const r = new ARng(seed);
  for (let i = 0; i < 3; i++) {
    const x = r.r(-R * 0.7, R * 0.7); const h = r.r(R * 0.12, R * 0.22);
    const p = new Path2D(); p.ellipse(x, -R * 0.02 + h * 0.3, R * 0.09, h, 0, 0, Math.PI * 2);
    cel(ctx, p, { x: x - R * 0.1, y: -h, w: R * 0.2, h: h * 2 }, col[0], col[1], null, { outline: OUTW * 0.75 });
  }
}

function face(ctx: Ctx, R: number, L: Look, expr: Expr, kindMood?: Mood) {
  const mood: Mood = expr === 'hit' ? 'hurt' : expr === 'charge' ? 'angry' : kindMood ?? 'normal';
  const ex = R * 0.3;
  if (L.eyes === 1) eye(ctx, 0, -R * L.eyeY, R * L.eyeR * 1.3, mood, 0.2, 0.2);
  else { eye(ctx, -ex, -R * L.eyeY, R * L.eyeR, mood, 0.25, 0.2, -1); eye(ctx, ex, -R * L.eyeY, R * L.eyeR, mood, 0.25, 0.2, 1); }
  blush(ctx, -R * 0.52, -R * (L.eyeY - 0.22), R * 0.1, 0.5); blush(ctx, R * 0.52, -R * (L.eyeY - 0.22), R * 0.1, 0.5);
  const mk = expr === 'hit' ? 'wavy' : expr === 'charge' ? 'o' : 'smile';
  mouth(ctx, 0, -R * L.mouthY, R * 0.26, mk as Parameters<typeof mouth>[4]);
}

function body(ctx: Ctx, R: number, col: [string, string, string], pts: [number, number][], seed: number) {
  const p = smoothPath(pts, true, 0.9);
  const b = { x: -R * 1.15, y: -R * 1.45, w: R * 2.3, h: R * 1.5 };
  cel(ctx, p, b, col[0], col[1], col[2], { so: [-R * 0.16, -R * 0.2], lo: [R * 0.08, R * 0.1] });
  bubbles(ctx, p, R, col[0], seed);
  gloss(ctx, p, b, 1);
  return p;
}

export const GOO_LOOK: Record<string, string> = {
  blob: 'violet', mini: 'amber', spitter: 'pink', splitter: 'amber', dasher: 'indigo', chunky: 'plum', nest: 'berry', jumper: 'teal', flyer: 'berry', boss: 'royal',
};

const DRAW: Record<string, (ctx: Ctx, expr: Expr, frame: number) => void> = {
  blob: (ctx, e) => {
    const R = 52; const col = GOO.violet;
    drips(ctx, R, col, 3);
    body(ctx, R, col, domePts(R, 1.0, 1.15, 1), 11);
    // tiny top curl
    const c = smoothPath([[-4, -R * 1.28], [4, -R * 1.5], [12, -R * 1.42], [6, -R * 1.28]], true, 0.8);
    cel(ctx, c, { x: -6, y: -R * 1.52, w: 20, h: 16 }, col[0], col[1], col[2], { outline: OUTW * 0.8 });
    face(ctx, R, { col, eyes: 2, eyeR: 0.2, eyeY: 0.72, mouthY: 0.4 }, e);
  },
  mini: (ctx, e) => {
    const R = 34; const col = GOO.amber;
    body(ctx, R, col, domePts(R, 1.0, 1.1, 2), 12);
    face(ctx, R, { col, eyes: 2, eyeR: 0.22, eyeY: 0.7, mouthY: 0.38 }, e);
  },
  spitter: (ctx, e) => {
    const R = 52; const col = GOO.pink;
    drips(ctx, R, col, 4);
    body(ctx, R, col, domePts(R, 0.95, 1.2, 3), 13);
    // spout on top
    const sp = ellipsePath(0, -R * 1.36, R * 0.24, R * 0.16);
    cel(ctx, sp, { x: -R * 0.25, y: -R * 1.52, w: R * 0.5, h: R * 0.32 }, col[0], col[1], col[2], { outline: OUTW * 0.9 });
    ctx.save(); ctx.fillStyle = '#6b2134'; ctx.beginPath(); ctx.ellipse(0, -R * 1.39, R * 0.12, R * 0.07, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    face(ctx, R, { col, eyes: 2, eyeR: 0.2, eyeY: 0.72, mouthY: 0.38 }, e);
  },
  splitter: (ctx, e) => {
    const R = 60; const col = GOO.amber;
    drips(ctx, R, col, 5);
    const pts = domePts(R, 1.05, 1.05, 4).map(([x, y]) => [x, y + (Math.abs(x) < R * 0.18 && y < -R * 0.9 ? R * 0.14 : 0)] as [number, number]);
    const p = body(ctx, R, col, pts, 14);
    // seam
    ctx.save(); ctx.clip(p); ctx.strokeStyle = rgba(col[1], 0.8); ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(0, -R * 1.2); ctx.lineTo(0, -R * 0.1); ctx.stroke(); ctx.restore();
    face(ctx, R, { col, eyes: 2, eyeR: 0.17, eyeY: 0.7, mouthY: 0.38 }, e);
  },
  dasher: (ctx, e) => {
    const R = 52; const col = GOO.indigo;
    drips(ctx, R, col, 6);
    const pts = domePts(R, 1.1, 1.0, 5).map(([x, y]) => [x * (y < -R * 0.6 && x < 0 ? 1.15 : 1), y] as [number, number]);
    body(ctx, R, col, pts, 15);
    // swept tuft
    const t = smoothPath([[-R * 0.1, -R * 1.18], [-R * 0.6, -R * 1.5], [-R * 0.9, -R * 1.45], [-R * 0.5, -R * 1.25], [-R * 0.85, -R * 1.2], [-R * 0.35, -R * 1.05]], true, 0.7);
    cel(ctx, t, { x: -R * 0.95, y: -R * 1.52, w: R * 0.9, h: R * 0.5 }, col[0], col[1], col[2], { outline: OUTW * 0.85 });
    face(ctx, R, { col, eyes: 2, eyeR: 0.19, eyeY: 0.66, mouthY: 0.36 }, e, 'determined');
  },
  chunky: (ctx, e) => {
    const R = 88; const col = GOO.plum;
    drips(ctx, R, col, 7);
    body(ctx, R, col, domePts(R, 1.08, 1.0, 6, 3), 16);
    face(ctx, R, { col, eyes: 2, eyeR: 0.14, eyeY: 0.66, mouthY: 0.36 }, e);
    if (e !== 'hit') { // little tooth
      ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.rect(-5, -R * 0.38, 10, 8); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  },
  nest: (ctx, e) => {
    const R = 80; const col = GOO.berry;
    const pts: [number, number][] = [[-R * 1.1, 0], [-R * 0.95, -R * 0.5], [-R * 0.5, -R * 0.95], [-R * 0.25, -R * 1.05], [0, -R * 0.92], [R * 0.25, -R * 1.05], [R * 0.5, -R * 0.95], [R * 0.95, -R * 0.5], [R * 1.1, 0], [0, R * 0.12]];
    const p = smoothPath(pts, true, 0.8);
    const b = { x: -R * 1.1, y: -R * 1.05, w: R * 2.2, h: R * 1.2 };
    cel(ctx, p, b, col[0], col[1], col[2], { so: [-R * 0.16, -R * 0.2], lo: [R * 0.08, R * 0.1], texture: 0.6, seed: 2 });
    // crater
    const cr = ellipsePath(0, -R * 0.9, R * 0.32, R * 0.12);
    ctx.save(); ctx.fillStyle = '#5a1f5a'; ctx.fill(cr); ctx.strokeStyle = OUT; ctx.lineWidth = 2.4; ctx.stroke(cr); ctx.restore();
    if (e === 'charge') { const bb = ellipsePath(0, -R * 1.02, R * 0.2, R * 0.16); cel(ctx, bb, { x: -R * 0.2, y: -R * 1.18, w: R * 0.4, h: R * 0.32 }, GOO.violet[0], GOO.violet[1], GOO.violet[2], { gloss: true }); }
    bubbles(ctx, p, R * 0.8, col[0], 9, 7);
    gloss(ctx, p, b, 0.8);
    face(ctx, R, { col, eyes: 2, eyeR: 0.13, eyeY: 0.48, mouthY: 0.25 }, e, 'sleep');
  },
  jumper: (ctx, e) => {
    const R = 56; const col = GOO.teal;
    drips(ctx, R, col, 8);
    // two goo ears
    for (const s of [-1, 1]) {
      const ear = smoothPath([[s * R * 0.25, -R * 1.1], [s * R * 0.42, -R * 1.62], [s * R * 0.62, -R * 1.6], [s * R * 0.6, -R * 1.0]], true, 0.85);
      cel(ctx, ear, { x: s > 0 ? R * 0.2 : -R * 0.65, y: -R * 1.66, w: R * 0.45, h: R * 0.7 }, col[0], col[1], col[2], { outline: OUTW * 0.9 });
    }
    body(ctx, R, col, domePts(R, 0.95, 1.12, 7), 17);
    face(ctx, R, { col, eyes: 2, eyeR: 0.21, eyeY: 0.72, mouthY: 0.4 }, e);
  },
  flyer: (ctx, e, f) => {
    const R = 44; const col = GOO.berry;
    const flap = f ? -0.35 : 0.25;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(s * R * 0.75, -R * 0.85); ctx.rotate(s * flap);
      const w = smoothPath([[0, 0], [s * R * 0.7, -R * 0.6], [s * R * 1.0, -R * 0.15], [s * R * 0.75, -R * 0.05], [s * R * 0.6, R * 0.2], [s * R * 0.3, R * 0.05]], true, 0.7);
      cel(ctx, w, { x: s > 0 ? 0 : -R, y: -R * 0.62, w: R, h: R * 0.85 }, lighten(col[0], 0.15), col[1], col[2], { outline: OUTW * 0.85 });
      ctx.restore();
    }
    const p = smoothPath(Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [Math.cos(a) * R, -R * 0.85 + Math.sin(a) * R * 0.92] as [number, number]; }), true, 0.9);
    const b = { x: -R, y: -R * 1.77, w: R * 2, h: R * 1.84 };
    cel(ctx, p, b, col[0], col[1], col[2], { so: [-R * 0.16, -R * 0.2], lo: [R * 0.08, R * 0.1] });
    bubbles(ctx, p, R, col[0], 21, 4); gloss(ctx, p, b);
    ctx.save(); ctx.translate(0, -R * 0.15);
    face(ctx, R, { col, eyes: 2, eyeR: 0.21, eyeY: 0.85, mouthY: 0.5 }, e);
    ctx.restore();
  },
};

function bossDraw(colKey: string, hat: 'crown' | 'tophat' | 'shell') {
  return (ctx: Ctx, e: Expr) => {
    const R = 150; const col = GOO[colKey];
    drips(ctx, R, col, 9);
    body(ctx, R, col, domePts(R, 1.05, 1.02, 8, 4), 18);
    face(ctx, R, { col, eyes: 2, eyeR: 0.14, eyeY: 0.62, mouthY: 0.33 }, e);
    ctx.save(); ctx.translate(0, -R * 1.3);
    if (hat === 'crown') {
      const c = new Path2D(); c.moveTo(-R * 0.36, 0); c.lineTo(-R * 0.42, -R * 0.34); c.lineTo(-R * 0.2, -R * 0.16); c.lineTo(0, -R * 0.42); c.lineTo(R * 0.2, -R * 0.16); c.lineTo(R * 0.42, -R * 0.34); c.lineTo(R * 0.36, 0); c.closePath();
      cel(ctx, c, { x: -R * 0.42, y: -R * 0.42, w: R * 0.84, h: R * 0.42 }, '#ffcf3d', '#d9951f', '#fff09a', { gloss: true });
      for (const gx of [-0.2, 0, 0.2]) { ctx.fillStyle = gx ? '#4cc0ee' : '#ef5a4f'; ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx * R, -R * 0.08, R * 0.045, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    } else if (hat === 'tophat') {
      const brim = ellipsePath(0, 0, R * 0.44, R * 0.09); cel(ctx, brim, { x: -R * 0.44, y: -R * 0.09, w: R * 0.88, h: R * 0.18 }, '#4a3a5a', '#2c2238', null);
      const top = new Path2D(); top.rect(-R * 0.27, -R * 0.5, R * 0.54, R * 0.5); cel(ctx, top, { x: -R * 0.27, y: -R * 0.5, w: R * 0.54, h: R * 0.5 }, '#4a3a5a', '#2c2238', '#7a6a8a', { gloss: true });
      const band = new Path2D(); band.rect(-R * 0.27, -R * 0.16, R * 0.54, R * 0.1); cel(ctx, band, { x: -R * 0.27, y: -R * 0.16, w: R * 0.54, h: R * 0.1 }, '#ef5a4f', '#b93a35', null, { outline: OUTW * 0.8 });
    } else {
      const sh = new Path2D(); sh.moveTo(-R * 0.38, 0); sh.quadraticCurveTo(-R * 0.36, -R * 0.42, 0, -R * 0.44); sh.quadraticCurveTo(R * 0.36, -R * 0.42, R * 0.38, 0); sh.closePath();
      cel(ctx, sh, { x: -R * 0.38, y: -R * 0.44, w: R * 0.76, h: R * 0.44 }, '#ffc3d6', '#e08aa8', '#fff0f5', { gloss: true });
      ctx.save(); ctx.strokeStyle = 'rgba(180,80,120,0.8)'; ctx.lineWidth = 3;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, -R * 0.02); ctx.lineTo(i * R * 0.14, -R * 0.38); ctx.stroke(); }
      ctx.restore();
      const pearl = ellipsePath(0, -R * 0.05, R * 0.06, R * 0.06); cel(ctx, pearl, { x: -R * 0.06, y: -R * 0.11, w: R * 0.12, h: R * 0.12 }, '#f8f4ff', '#c8c0e0', null, { gloss: true, outline: OUTW * 0.8 });
    }
    ctx.restore();
  };
}

export function register() {
  const kinds: [string, number, number, number][] = [
    // name, frame w, frame h, anchor y (bottom of body)
    ['blob', 140, 150, 130], ['mini', 96, 96, 84], ['spitter', 140, 160, 140], ['splitter', 160, 160, 140], ['dasher', 160, 160, 140],
    ['chunky', 220, 210, 190], ['nest', 210, 170, 148], ['jumper', 150, 180, 160],
  ];
  for (const [k, w, h, ay] of kinds) for (const e of ['normal', 'hit', 'charge'] as Expr[]) {
    sprite(`m_${k}_${e}`, w, h, w / 2, ay, (ctx) => { ctx.translate(w / 2, ay); DRAW[k](ctx, e, 0); });
  }
  for (const e of ['normal', 'hit', 'charge'] as Expr[]) for (let f = 0; f < 2; f++) {
    sprite(`m_flyer_${e}_${f}`, 180, 140, 90, 120, (ctx) => { ctx.translate(90, 120); DRAW.flyer(ctx, e, f); });
  }
  const bosses: [string, string, 'crown' | 'tophat' | 'shell'][] = [['forest', 'royal', 'crown'], ['village', 'amber', 'tophat'], ['lake', 'teal', 'shell']];
  for (const [n, c, hat] of bosses) for (const e of ['normal', 'hit', 'charge'] as Expr[]) {
    const d = bossDraw(c, hat);
    sprite(`m_boss_${n}_${e}`, 360, 360, 180, 330, (ctx) => { ctx.translate(180, 330); d(ctx, e); });
  }
  // enemy droplet: purple with a white rim and a tiny face so it never reads as water
  for (let f = 0; f < 2; f++) sprite(`goo_drop_${f}`, 48, 48, 24, 24, (ctx) => {
    ctx.translate(24, 24);
    const sx = f ? 1.08 : 0.94, sy = f ? 0.92 : 1.06;
    ctx.scale(sx, sy);
    const p = ellipsePath(0, 0, 15, 15);
    ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 9; ctx.stroke(p); ctx.restore();
    cel(ctx, p, { x: -15, y: -15, w: 30, h: 30 }, '#a24bd6', '#6d2aa0', '#d79bff', { gloss: true, outline: 2.4 });
    ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(-4.5, 1, 2, 0, Math.PI * 2); ctx.arc(4.5, 1, 2, 0, Math.PI * 2); ctx.fill();
  });
  // cocoon shell (drawn over a trapped animal)
  for (let f = 0; f < 3; f++) sprite(`cocoon_${f}`, 150, 150, 75, 130, (ctx) => {
    ctx.translate(75, 130);
    const R = 60; const col = GOO.violet;
    const pts = domePts(R, 1.0, 1.18, 30 + f);
    const p = smoothPath(pts, true, 0.9);
    ctx.save(); ctx.globalAlpha = 0.85;
    cel(ctx, p, { x: -R * 1.1, y: -R * 1.5, w: R * 2.2, h: R * 1.5 }, rgba(col[0], 0.75), rgba(col[1], 0.85), rgba(col[2], 0.8));
    ctx.restore();
    bubbles(ctx, p, R, col[0], 40 + f, 6);
    gloss(ctx, p, { x: -R * 1.1, y: -R * 1.5, w: R * 2.2, h: R * 1.5 });
    if (f >= 1) {
      ctx.save(); ctx.clip(p); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5;
      const r = new ARng(50 + f);
      for (let i = 0; i < f * 3; i++) { let x = r.r(-R * 0.6, R * 0.6), y = r.r(-R * 1.2, -R * 0.3); ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 3; k++) { x += r.r(-12, 12); y += r.r(6, 14); ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.restore();
    }
  });
  // ground goo stamps (scaled at runtime): glossy irregular splats
  for (let i = 0; i < 4; i++) sprite(`goostamp_${i}`, 260, 260, 130, 130, (ctx) => {
    ctx.translate(130, 130);
    const r = new ARng(70 + i);
    const pts: [number, number][] = [];
    const n = 22;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2; const lobe = k % 2 ? r.r(0.82, 0.95) : r.r(0.95, 1.08);
      pts.push([Math.cos(a) * 112 * lobe, Math.sin(a) * 112 * lobe]);
    }
    const p = smoothPath(pts, true, 0.9);
    const col = GOO.violet;
    ctx.save();
    ctx.strokeStyle = rgba('#5a2a8a', 0.85); ctx.lineWidth = 6; ctx.stroke(p);
    ctx.fillStyle = '#9c5fd6'; ctx.fill(p);
    ctx.clip(p);
    // thickness shading
    const g = ctx.createRadialGradient(-30, -40, 10, 0, 0, 125);
    g.addColorStop(0, rgba(col[2], 0.55)); g.addColorStop(0.55, rgba(col[0], 0.2)); g.addColorStop(1, rgba(col[1], 0.6));
    ctx.fillStyle = g; ctx.fillRect(-130, -130, 260, 260);
    for (let k = 0; k < 9; k++) {
      const x = r.r(-80, 80), y = r.r(-80, 80), rr = r.r(4, 12);
      ctx.fillStyle = rgba(col[2], 0.5); ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.beginPath(); ctx.arc(x - rr * 0.35, y - rr * 0.35, rr * 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(r.r(-60, 20), r.r(-70, 0), r.r(14, 26), r.r(5, 9), -0.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  });
  // soft erase brush (white radial) for washing goo off the ground layer
  sprite('brush', 128, 128, 64, 64, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.62, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  });
  // goo barrier stretched across the exit gate
  sprite('gate_goo', 160, 90, 80, 80, (ctx) => {
    ctx.translate(80, 80);
    const col = GOO.violet;
    const p = smoothPath([[-66, 0], [-66, -46], [-40, -64], [0, -70], [40, -64], [66, -46], [66, 0], [40, 6], [20, -4], [0, 8], [-24, -2], [-44, 8]], true, 0.8);
    cel(ctx, p, { x: -66, y: -70, w: 132, h: 78 }, col[0], col[1], col[2], { gloss: true });
    bubbles(ctx, p, 60, col[0], 61, 6);
    eye(ctx, -16, -36, 7, 'sleep'); eye(ctx, 16, -36, 7, 'sleep');
  });
  void star;
}
