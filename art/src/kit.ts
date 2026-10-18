// Shared style kit for every sprite: one palette, one outline color and width
// rule, one light direction. Everything in the game is drawn through these.

export const S = 2; // atlas pixels per world unit

export const OUT = '#3a2416'; // warm dark brown outline used everywhere
export const OUTW = 2.6; // outline width in atlas px at S=2 (thick, Kingdom Rush style)

export const PAL = {
  grass: '#86c64a', grassDark: '#5f9e34', grassLight: '#a9dc63', grassDeep: '#4b8a2c',
  dirt: '#d9a46a', dirtDark: '#b47b47', dirtLight: '#ebc28d',
  cobble: '#c9b9a0', cobbleDark: '#9c8a72', cobbleLight: '#e4d8c2',
  sand: '#f1d999', sandDark: '#d6b46a', sandLight: '#fbecc2',
  water: '#4cc0ee', waterDeep: '#2a8fd0', waterLight: '#a8e8ff', foam: '#effcff',
  wood: '#b0743f', woodDark: '#80502b', woodLight: '#d39a5d',
  stone: '#a5adb4', stoneDark: '#77808a', stoneLight: '#d2d8dc',
  leaf: '#6dbb3f', leafDark: '#3f8a2a', leafLight: '#a6e05a',
  pine: '#4f9e4a', pineDark: '#2f7038', pineLight: '#7cc56a',
  skin: '#ffd6b0', skinDark: '#e9a982', hair: '#7a4a2a',
  coat: '#ffc93c', coatDark: '#e89a1e', coatLight: '#ffe58a',
  blue: '#3d8ee8', blueDark: '#2a62b8', blueLight: '#8cc6ff',
  red: '#ef5a4f', redDark: '#b93a35',
  white: '#ffffff', cream: '#fff6e2',
  gold: '#ffcf3d', goldDark: '#d9951f', goldLight: '#fff09a',
  pink: '#ff8fb8', pinkDark: '#d9608f',
};

// goo colors per monster family [base, dark, light]
export const GOO: Record<string, [string, string, string]> = {
  violet: ['#b57ae8', '#7d49c2', '#e3c6ff'],
  pink: ['#f47cba', '#c2478a', '#ffd0e8'],
  amber: ['#ffa94d', '#d9732a', '#ffe1b0'],
  indigo: ['#7f86f0', '#4f55c4', '#c9ccff'],
  plum: ['#9a59c9', '#66308f', '#d6aef0'],
  teal: ['#3fc7b8', '#22897f', '#b5f3eb'],
  berry: ['#d05ad0', '#91308f', '#f5bdf5'],
  royal: ['#a35be0', '#6a2fae', '#e2c2ff'],
};

export function mix(a: string, b: string, t: number): string {
  const pa = hex(a), pb = hex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t), g = Math.round(pa[1] + (pb[1] - pa[1]) * t), bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
export function hex(c: string): [number, number, number] {
  if (c.startsWith('rgb')) { const m = c.match(/\d+/g)!; return [+m[0], +m[1], +m[2]]; }
  const h = c.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function rgba(c: string, a: number): string { const p = hex(c); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; }
export function darken(c: string, t: number) { return mix(c, '#1a0f1f', t); }
export function lighten(c: string, t: number) { return mix(c, '#ffffff', t); }

// Deterministic random for art (so builds are reproducible)
export class ARng {
  s: number;
  constructor(seed: number) { this.s = seed >>> 0 || 7; }
  n(): number { let t = (this.s += 0x6d2b79f5); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  r(a: number, b: number) { return a + (b - a) * this.n(); }
}

export type Ctx = CanvasRenderingContext2D;

export interface Bounds { x: number; y: number; w: number; h: number }

export function ellipsePath(cx: number, cy: number, rx: number, ry: number, rot = 0): Path2D {
  const p = new Path2D(); p.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); return p;
}

export function rrectPath(x: number, y: number, w: number, h: number, r: number): Path2D {
  const p = new Path2D(); const rr = Math.min(r, w / 2, h / 2);
  p.moveTo(x + rr, y); p.arcTo(x + w, y, x + w, y + h, rr); p.arcTo(x + w, y + h, x, y + h, rr);
  p.arcTo(x, y + h, x, y, rr); p.arcTo(x, y, x + w, y, rr); p.closePath(); return p;
}

// Smooth closed curve through points (Catmull-Rom converted to Bezier)
export function smoothPath(pts: [number, number][], closed = true, tension = 0.5): Path2D {
  const p = new Path2D(); const n = pts.length;
  if (n < 2) return p;
  p.moveTo(pts[0][0], pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const q0 = !closed && i === 0 ? p1 : p0; const q3 = !closed && i === n - 2 ? p2 : p3;
    const c1x = p1[0] + ((p2[0] - q0[0]) * tension) / 3, c1y = p1[1] + ((p2[1] - q0[1]) * tension) / 3;
    const c2x = p2[0] - ((q3[0] - p1[0]) * tension) / 3, c2y = p2[1] - ((q3[1] - p1[1]) * tension) / 3;
    p.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
  }
  if (closed) p.closePath();
  return p;
}

// Organic blob: radius modulated by a few sines
export function blobPath(cx: number, cy: number, rx: number, ry: number, seed: number, amp = 0.08, n = 14): Path2D {
  const r = new ARng(seed); const pts: [number, number][] = [];
  const ph1 = r.r(0, 6), ph2 = r.r(0, 6), ph3 = r.r(0, 6);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + amp * (Math.sin(a * 2 + ph1) * 0.5 + Math.sin(a * 3 + ph2) * 0.35 + Math.sin(a * 5 + ph3) * 0.25);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smoothPath(pts, true, 0.9);
}

// The house style: thick warm outline, base fill, soft light rim on the upper
// left, cel shadow crescent on the lower right, optional painterly dabs + gloss.
export function cel(ctx: Ctx, path: Path2D, b: Bounds, base: string, shade: string, light: string | null, o: { outline?: number; so?: [number, number]; lo?: [number, number]; texture?: number; seed?: number; gloss?: boolean } = {}) {
  const ow = o.outline ?? OUTW;
  if (ow > 0) {
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = OUT; ctx.lineWidth = ow * 2; ctx.stroke(path); ctx.restore();
  }
  const lo = o.lo ?? [b.w * 0.06, b.h * 0.07];
  const so = o.so ?? [-b.w * 0.1, -b.h * 0.13];
  const pad = 24;
  const W = Math.ceil(b.w + pad * 2), H = Math.ceil(b.h + pad * 2);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.translate(-b.x + pad, -b.y + pad);
  g.fillStyle = light ?? base; g.fill(path);
  if (light) { g.save(); g.clip(path); g.translate(lo[0], lo[1]); g.fillStyle = base; g.fill(path); g.restore(); }
  const sc = document.createElement('canvas'); sc.width = W; sc.height = H;
  const sg = sc.getContext('2d')!;
  sg.translate(-b.x + pad, -b.y + pad);
  sg.fillStyle = shade; sg.fill(path);
  sg.globalCompositeOperation = 'destination-out';
  sg.translate(so[0], so[1]); sg.fill(path);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(sc, 0, 0); g.restore();
  if (o.texture) { g.save(); g.clip(path); dabs(g, b, base, o.texture, o.seed ?? 3); g.restore(); }
  ctx.drawImage(c, b.x - pad, b.y - pad);
  if (o.gloss) gloss(ctx, path, b);
}

export function gloss(ctx: Ctx, path: Path2D, b: Bounds, k = 1) {
  ctx.save(); ctx.clip(path);
  ctx.fillStyle = `rgba(255,255,255,${0.72 * k})`;
  ctx.beginPath(); ctx.ellipse(b.x + b.w * 0.32, b.y + b.h * 0.22, b.w * 0.15, b.h * 0.085, -0.45, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${0.92 * k})`;
  ctx.beginPath(); ctx.arc(b.x + b.w * 0.18, b.y + b.h * 0.36, Math.max(1.4, b.w * 0.04), 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function dabs(ctx: Ctx, b: Bounds, base: string, amount: number, seed: number) {
  const r = new ARng(seed);
  const n = Math.round((b.w * b.h) / 90 * amount);
  for (let i = 0; i < n; i++) {
    const x = b.x + r.r(0, b.w), y = b.y + r.r(0, b.h);
    const lt = r.n() < 0.5;
    ctx.fillStyle = lt ? rgba(lighten(base, 0.35), 0.18) : rgba(darken(base, 0.3), 0.14);
    ctx.beginPath(); ctx.ellipse(x, y, r.r(1, 3.2), r.r(0.8, 2), r.r(0, 3), 0, Math.PI * 2); ctx.fill();
  }
}

export function stroke(ctx: Ctx, path: Path2D, w = OUTW, color = OUT) {
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke(path); ctx.restore();
}

export function fill(ctx: Ctx, path: Path2D, color: string) { ctx.save(); ctx.fillStyle = color; ctx.fill(path); ctx.restore(); }

export function shadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, a = 0.28) {
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  g.addColorStop(0, `rgba(28,40,12,${a})`); g.addColorStop(0.7, `rgba(28,40,12,${a * 0.75})`); g.addColorStop(1, 'rgba(28,40,12,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Cute eye: white sclera, dark pupil, sparkle. mood changes the shape.
export type Mood = 'normal' | 'happy' | 'hurt' | 'sad' | 'angry' | 'sleep' | 'worried' | 'determined' | 'surprised';

export function eye(ctx: Ctx, x: number, y: number, r: number, mood: Mood, lookX = 0, lookY = 0, side = 1) {
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (mood === 'happy') {
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2, r * 0.42);
    ctx.beginPath(); ctx.arc(x, y + r * 0.35, r * 0.75, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
  } else if (mood === 'hurt') {
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2, r * 0.4);
    ctx.beginPath(); ctx.moveTo(x - r * 0.65 * side, y - r * 0.6); ctx.lineTo(x + r * 0.55 * side, y); ctx.lineTo(x - r * 0.65 * side, y + r * 0.6); ctx.stroke();
  } else if (mood === 'sleep') {
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2, r * 0.38);
    ctx.beginPath(); ctx.arc(x, y - r * 0.1, r * 0.7, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  } else {
    const ry = mood === 'surprised' ? r * 1.15 : r;
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.6, r * 0.22);
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.86, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const pr = r * (mood === 'surprised' ? 0.42 : 0.58);
    const px = x + lookX * r * 0.28, py = y + lookY * r * 0.25 + r * 0.08;
    ctx.fillStyle = '#2b1a24'; ctx.beginPath(); ctx.ellipse(px, py, pr * 0.92, pr, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.38, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + pr * 0.35, py + pr * 0.35, pr * 0.16, 0, Math.PI * 2); ctx.fill();
    if (mood === 'sad' || mood === 'worried') {
      ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.6, r * 0.25);
      ctx.beginPath(); ctx.moveTo(x - r * 0.8 * side, y - r * 1.25); ctx.lineTo(x + r * 0.6 * side, y - r * 1.5); ctx.stroke();
    }
    if (mood === 'angry' || mood === 'determined') {
      ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.8, r * 0.3);
      ctx.beginPath(); ctx.moveTo(x - r * 0.85 * side, y - r * 1.45); ctx.lineTo(x + r * 0.7 * side, y - r * 1.05); ctx.stroke();
    }
    if (mood === 'sad') {
      ctx.fillStyle = 'rgba(120,200,255,0.95)'; ctx.strokeStyle = 'rgba(40,110,190,0.9)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x + r * 0.2, y + r * 0.9); ctx.quadraticCurveTo(x + r * 0.75, y + r * 1.7, x + r * 0.2, y + r * 1.9);
      ctx.quadraticCurveTo(x - r * 0.35, y + r * 1.7, x + r * 0.2, y + r * 0.9); ctx.fill(); ctx.stroke();
    }
  }
  ctx.restore();
}

export function blush(ctx: Ctx, x: number, y: number, r: number, a = 0.45) {
  ctx.save(); ctx.fillStyle = `rgba(255,110,140,${a})`;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.62, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

export function mouth(ctx: Ctx, x: number, y: number, w: number, kind: 'smile' | 'open' | 'o' | 'frown' | 'grin' | 'wavy' | 'flat' | 'pout', tongue = true) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.8, w * 0.16);
  if (kind === 'smile') { ctx.beginPath(); ctx.arc(x, y - w * 0.25, w * 0.5, Math.PI * 0.18, Math.PI * 0.82); ctx.stroke(); }
  else if (kind === 'frown') { ctx.beginPath(); ctx.arc(x, y + w * 0.45, w * 0.45, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
  else if (kind === 'flat') { ctx.beginPath(); ctx.moveTo(x - w * 0.3, y); ctx.lineTo(x + w * 0.3, y); ctx.stroke(); }
  else if (kind === 'wavy') { ctx.beginPath(); ctx.moveTo(x - w * 0.45, y); ctx.quadraticCurveTo(x - w * 0.22, y - w * 0.2, x, y); ctx.quadraticCurveTo(x + w * 0.22, y + w * 0.2, x + w * 0.45, y); ctx.stroke(); }
  else if (kind === 'pout') { ctx.fillStyle = '#7a2a3a'; ctx.beginPath(); ctx.ellipse(x, y, w * 0.2, w * 0.24, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  else if (kind === 'o') { ctx.fillStyle = '#5a1f2c'; ctx.beginPath(); ctx.ellipse(x, y, w * 0.24, w * 0.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  else {
    // open happy mouth (D shape)
    const p = new Path2D();
    const ww = kind === 'grin' ? w * 0.6 : w * 0.5;
    p.moveTo(x - ww, y - w * 0.12); p.quadraticCurveTo(x, y - w * 0.02, x + ww, y - w * 0.12);
    p.quadraticCurveTo(x + ww * 0.9, y + w * 0.6, x, y + w * 0.62); p.quadraticCurveTo(x - ww * 0.9, y + w * 0.6, x - ww, y - w * 0.12); p.closePath();
    ctx.fillStyle = '#6b2134'; ctx.fill(p);
    if (tongue) { ctx.save(); ctx.clip(p); ctx.fillStyle = '#ff7f8f'; ctx.beginPath(); ctx.ellipse(x, y + w * 0.55, ww * 0.6, w * 0.28, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.stroke(p);
  }
  ctx.restore();
}

export function star(cx: number, cy: number, r1: number, r2: number, n = 5, rot = -Math.PI / 2): Path2D {
  const p = new Path2D();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1; const a = rot + (i / (n * 2)) * Math.PI * 2;
    if (i === 0) p.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); else p.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  p.closePath(); return p;
}

export function dropPath(cx: number, cy: number, r: number): Path2D {
  // water drop pointing up
  const p = new Path2D();
  p.moveTo(cx, cy - r * 1.55);
  p.bezierCurveTo(cx + r * 0.35, cy - r * 0.9, cx + r, cy - r * 0.35, cx + r, cy + r * 0.15);
  p.arc(cx, cy + r * 0.15, r, 0, Math.PI, false);
  p.bezierCurveTo(cx - r, cy - r * 0.35, cx - r * 0.35, cy - r * 0.9, cx, cy - r * 1.55);
  p.closePath(); return p;
}

export function heartPath(cx: number, cy: number, r: number): Path2D {
  const p = new Path2D();
  p.moveTo(cx, cy + r * 0.95);
  p.bezierCurveTo(cx - r * 1.4, cy + r * 0.1, cx - r * 1.05, cy - r * 1.05, cx, cy - r * 0.45);
  p.bezierCurveTo(cx + r * 1.05, cy - r * 1.05, cx + r * 1.4, cy + r * 0.1, cx, cy + r * 0.95);
  p.closePath(); return p;
}
