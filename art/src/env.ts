// Ground tileset (seamless grass + dual-grid terrain transitions), obstacles,
// decorations, room border pieces and the exit gate.
import { sprite, group } from './atlas';
import { PAL, OUT, OUTW, ARng, cel, ellipsePath, rrectPath, smoothPath, blobPath, gloss, hex, darken, lighten, rgba, type Ctx } from './kit';

export const T = 96; // tile size in atlas px (48 world units)

// periodic noise with period T so tiles join seamlessly
function makeNoise(seed: number, terms = 7, maxF = 6) {
  const r = new ARng(seed);
  const ws: [number, number, number, number][] = [];
  for (let i = 0; i < terms; i++) ws.push([r.r(0, 1) < 0.5 ? r.r(1, 3) | 0 : r.r(2, maxF) | 0, (r.r(-maxF + 2, maxF - 1) | 0), r.r(0, 6.28), 1 / (i + 1.4)]);
  return (x: number, y: number) => {
    let v = 0, a = 0;
    for (const [kx, ky, ph, w] of ws) { v += Math.sin((2 * Math.PI * (kx * x + ky * y)) / T + ph) * w; a += w; }
    return v / a;
  };
}

function wrapDraw(ctx: Ctx, fn: (ox: number, oy: number) => void) {
  for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) fn(ox, oy);
}

function grassTile(ctx: Ctx, seed: number, extras: boolean) {
  const n1 = makeNoise(seed), n2 = makeNoise(seed + 11, 9);
  const img = ctx.createImageData(T, T);
  const [r0, g0, b0] = hex(PAL.grass), [r1, g1, b1] = hex(PAL.grassDark), [r2, g2, b2] = hex(PAL.grassLight);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const v = n1(x, y) * 0.65 + n2(x * 2, y * 2) * 0.35;
    let r = r0, g = g0, b = b0;
    if (v < 0) { const t = Math.min(1, -v * 1.6); r += (r1 - r0) * t * 0.55; g += (g1 - g0) * t * 0.55; b += (b1 - b0) * t * 0.55; }
    else { const t = Math.min(1, v * 1.6); r += (r2 - r0) * t * 0.4; g += (g2 - g0) * t * 0.4; b += (b2 - b0) * t * 0.4; }
    const i = (y * T + x) * 4; img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const rng = new ARng(seed * 3 + 1);
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const x = rng.r(0, T), y = rng.r(0, T), h = rng.r(5, 10), lean = rng.r(-3, 3);
    const dark = rng.n() < 0.55;
    wrapDraw(ctx, (ox, oy) => {
      ctx.strokeStyle = dark ? rgba(PAL.grassDeep, 0.55) : rgba(PAL.grassLight, 0.75); ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(x + ox, y + oy); ctx.quadraticCurveTo(x + ox + lean * 0.3, y + oy - h * 0.6, x + ox + lean, y + oy - h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + ox + 2.5, y + oy); ctx.quadraticCurveTo(x + ox + 2.5 + lean * 0.2, y + oy - h * 0.4, x + ox + 3 + lean * 0.6, y + oy - h * 0.7); ctx.stroke();
    });
  }
  if (extras) {
    for (let i = 0; i < 3; i++) {
      const x = rng.r(10, T - 10), y = rng.r(10, T - 10);
      const c = ['#ffffff', '#ffe066', '#ff9ec4'][i % 3];
      for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2, 1.9, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#ffb02e'; ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

type TerrainKind = 'path' | 'water' | 'sand' | 'cobble';

function smin(a: number, b: number, k: number) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }

function terrainTile(ctx: Ctx, kind: TerrainKind, mask: number) {
  const corners: [number, number][] = [];
  if (mask & 1) corners.push([0, 0]); if (mask & 2) corners.push([T, 0]); if (mask & 4) corners.push([0, T]); if (mask & 8) corners.push([T, T]);
  if (!corners.length) return;
  const nz = makeNoise(kind === 'water' ? 91 : kind === 'sand' ? 77 : kind === 'cobble' ? 55 : 33, 5, 3);
  const tex = makeNoise(kind === 'water' ? 13 : 17, 10);
  const R = T * 0.72;
  const img = ctx.createImageData(T, T);
  const C = kind === 'path' ? [PAL.dirt, PAL.dirtDark, PAL.dirtLight] : kind === 'sand' ? [PAL.sand, PAL.sandDark, PAL.sandLight] : kind === 'cobble' ? [PAL.cobble, PAL.cobbleDark, PAL.cobbleLight] : [PAL.water, PAL.waterDeep, PAL.waterLight];
  const base = hex(C[0]), dark = hex(C[1]), light = hex(C[2]);
  const foam = hex(PAL.foam); const outl = hex(OUT);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    let d = 1e9;
    for (const [cx, cy] of corners) d = smin(d, Math.hypot(x - cx, y - cy), 18);
    const F = d - R + nz(x, y) * 6;
    const i = (y * T + x) * 4;
    let r = 0, g = 0, b = 0, a = 0;
    if (F < 0) {
      const depth = Math.min(1, -F / 30);
      const t = tex(x * 2, y * 2);
      if (kind === 'water') {
        r = light[0] + (dark[0] - light[0]) * depth; g = light[1] + (dark[1] - light[1]) * depth; b = light[2] + (dark[2] - light[2]) * depth;
        r = r * 0.6 + base[0] * 0.4; g = g * 0.6 + base[1] * 0.4; b = b * 0.6 + base[2] * 0.4;
        if (t > 0.55) { r += 30; g += 30; b += 25; }
      } else {
        r = base[0]; g = base[1]; b = base[2];
        if (t > 0.35) { r = r * 0.75 + light[0] * 0.25; g = g * 0.75 + light[1] * 0.25; b = b * 0.75 + light[2] * 0.25; }
        if (t < -0.45) { r = r * 0.8 + dark[0] * 0.2; g = g * 0.8 + dark[1] * 0.2; b = b * 0.8 + dark[2] * 0.2; }
      }
      a = 255;
      if (F > -3.2) { // rim
        const k = kind === 'water' ? 0.9 : 0.7;
        r = r * (1 - k) + (kind === 'water' ? outl[0] * 0.5 + dark[0] * 0.5 : dark[0]) * k; g = g * (1 - k) + (kind === 'water' ? outl[1] * 0.5 + dark[1] * 0.5 : dark[1]) * k; b = b * (1 - k) + (kind === 'water' ? outl[2] * 0.5 + dark[2] * 0.5 : dark[2]) * k;
      } else if (F > -6.5 && kind !== 'water') { r = r * 0.6 + light[0] * 0.4; g = g * 0.6 + light[1] * 0.4; b = b * 0.6 + light[2] * 0.4; }
      else if (F > -8 && kind === 'water') { r = r * 0.5 + foam[0] * 0.5; g = g * 0.5 + foam[1] * 0.5; b = b * 0.5 + foam[2] * 0.5; }
    } else if (F < 3.5) {
      // soft shadow on the grass just outside the edge
      r = 30; g = 50; b = 15; a = Math.round(70 * (1 - F / 3.5));
    }
    img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  // little details
  const rng = new ARng(mask * 7 + kind.length);
  ctx.save();
  const inside = (x: number, y: number) => { let d = 1e9; for (const [cx, cy] of corners) d = smin(d, Math.hypot(x - cx, y - cy), 18); return d - R + nz(x, y) * 6 < -9; };
  if (kind === 'path' || kind === 'sand') {
    for (let k = 0; k < 7; k++) {
      const x = rng.r(4, T - 4), y = rng.r(4, T - 4);
      if (!inside(x, y)) continue;
      const pr = rng.r(1.8, 3.6);
      ctx.fillStyle = kind === 'sand' ? (rng.n() < 0.5 ? '#ffffff' : PAL.sandDark) : PAL.dirtDark; ctx.strokeStyle = rgba(OUT, 0.5); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, y, pr, pr * 0.7, 0, 0, Math.PI * 2); ctx.fill(); if (kind === 'path') ctx.stroke();
    }
  } else if (kind === 'cobble') {
    // stones on a periodic grid so tiles join
    for (let gy = 0; gy < 4; gy++) for (let gx = 0; gx < 4; gx++) {
      const x = gx * 24 + 12 + (gy % 2 ? 12 : 0), y = gy * 24 + 12;
      const xx = ((x % T) + T) % T;
      if (!inside(xx, y)) continue;
      const p = rrectPath(xx - 10, y - 9, 20, 17, 6);
      ctx.fillStyle = (gx + gy) % 3 ? PAL.cobbleLight : lighten(PAL.cobble, 0.15); ctx.fill(p);
      ctx.strokeStyle = rgba(PAL.cobbleDark, 0.9); ctx.lineWidth = 1.6; ctx.stroke(p);
    }
  } else if (kind === 'water') {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++) {
      const x = rng.r(8, T - 20), y = rng.r(8, T - 8);
      if (!inside(x, y) || !inside(x + 14, y)) continue;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 7, y - 4, x + 14, y); ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- obstacles
function tree(ctx: Ctx, seed: number, dark = false) {
  const r = new ARng(seed);
  // trunk
  const tr = new Path2D(); tr.moveTo(-12, 0); tr.quadraticCurveTo(-9, -24, -10, -46); tr.lineTo(10, -46); tr.quadraticCurveTo(9, -24, 13, 0); tr.quadraticCurveTo(0, 5, -12, 0); tr.closePath();
  cel(ctx, tr, { x: -13, y: -46, w: 26, h: 50 }, PAL.wood, PAL.woodDark, PAL.woodLight, { outline: OUTW, texture: 0.6, seed });
  const L = dark ? [darken(PAL.leaf, 0.18), darken(PAL.leafDark, 0.2), PAL.leaf] : [PAL.leaf, PAL.leafDark, PAL.leafLight];
  const blobs: [number, number, number][] = [[-34, -74, 30], [30, -76, 30], [0, -86, 36], [-18, -110, 30], [20, -112, 28], [0, -126, 22]];
  // back-to-front: draw lower-shaded ones first
  for (const [x, y, rr] of blobs) {
    const p = blobPath(x + r.r(-3, 3), y + r.r(-3, 3), rr, rr * 0.92, seed + x, 0.07);
    cel(ctx, p, { x: x - rr, y: y - rr, w: rr * 2, h: rr * 2 }, L[0], L[1], L[2], { so: [-rr * 0.22, -rr * 0.28], lo: [rr * 0.12, rr * 0.14], texture: 0.7, seed: seed + y });
  }
  // a few leaf highlights and fruits
  for (let i = 0; i < 6; i++) { ctx.fillStyle = rgba(lighten(L[2], 0.3), 0.7); ctx.beginPath(); ctx.ellipse(r.r(-36, 30), r.r(-130, -80), r.r(3, 6), r.r(2, 3), -0.6, 0, Math.PI * 2); ctx.fill(); }
  if (!dark && seed % 3 === 0) for (let i = 0; i < 3; i++) { const x = r.r(-30, 30), y = r.r(-115, -75); ctx.fillStyle = '#ef5a4f'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
}

function pine(ctx: Ctx, seed: number) {
  const tr = rrectPath(-8, -30, 16, 32, 4); cel(ctx, tr, { x: -8, y: -30, w: 16, h: 32 }, PAL.wood, PAL.woodDark, null);
  const tiers: [number, number, number][] = [[-30, 50, 40], [-62, 42, 36], [-92, 32, 32], [-118, 22, 26]];
  for (const [y, w, h] of tiers) {
    const p = smoothPath([[-w, y + 4], [-w * 0.5, y - h * 0.45], [0, y - h], [w * 0.5, y - h * 0.45], [w, y + 4], [w * 0.4, y + 9], [0, y + 6], [-w * 0.4, y + 9]], true, 0.35);
    cel(ctx, p, { x: -w, y: y - h, w: w * 2, h: h + 10 }, PAL.pine, PAL.pineDark, PAL.pineLight, { so: [-w * 0.25, -h * 0.2], texture: 0.6, seed: seed + y });
  }
}

function rockShape(ctx: Ctx, w: number, h: number, seed: number) {
  const r = new ARng(seed);
  const pts: [number, number][] = [[-w, -h * 0.15], [-w * 0.8, -h * 0.7], [-w * 0.3, -h], [w * 0.35, -h * 0.95], [w * 0.85, -h * 0.6], [w, -h * 0.1], [w * 0.6, h * 0.12], [-w * 0.6, h * 0.12]].map(([x, y]) => [x + r.r(-3, 3), y + r.r(-3, 3)] as [number, number]);
  const p = smoothPath(pts, true, 0.55);
  cel(ctx, p, { x: -w, y: -h, w: w * 2, h: h * 1.15 }, PAL.stone, PAL.stoneDark, PAL.stoneLight, { so: [-w * 0.25, -h * 0.3], texture: 0.8, seed });
  // crack + moss
  ctx.save(); ctx.clip(p);
  ctx.strokeStyle = rgba(PAL.stoneDark, 0.9); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * 0.1, -h * 0.9); ctx.lineTo(w * 0.05, -h * 0.55); ctx.lineTo(-w * 0.05, -h * 0.3); ctx.stroke();
  ctx.fillStyle = rgba(PAL.leaf, 0.85); ctx.beginPath(); ctx.ellipse(-w * 0.45, -h * 0.85, w * 0.35, h * 0.16, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function bush(ctx: Ctx, seed: number) {
  const r = new ARng(seed);
  for (const [x, y, rr] of [[-26, -18, 20], [24, -18, 20], [0, -30, 24], [-10, -14, 18], [12, -12, 18]] as [number, number, number][]) {
    const p = blobPath(x, y, rr, rr * 0.88, seed + x, 0.08);
    cel(ctx, p, { x: x - rr, y: y - rr, w: rr * 2, h: rr * 2 }, PAL.leaf, PAL.leafDark, PAL.leafLight, { so: [-rr * 0.2, -rr * 0.3], texture: 0.6, seed: seed + y });
  }
  for (let i = 0; i < 5; i++) { const x = r.r(-30, 30), y = r.r(-44, -12); ctx.fillStyle = i % 2 ? '#ff9ec4' : '#ffffff'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
}

function stump(ctx: Ctx) {
  const side = new Path2D(); side.moveTo(-26, -24); side.lineTo(-24, 2); side.quadraticCurveTo(0, 10, 24, 2); side.lineTo(26, -24); side.closePath();
  cel(ctx, side, { x: -26, y: -24, w: 52, h: 32 }, PAL.wood, PAL.woodDark, PAL.woodLight, { texture: 0.7, seed: 5 });
  const top = ellipsePath(0, -24, 26, 11); cel(ctx, top, { x: -26, y: -35, w: 52, h: 22 }, '#e6c08a', '#c99a5e', null);
  ctx.save(); ctx.strokeStyle = rgba(PAL.woodDark, 0.8); ctx.lineWidth = 1.6; for (const k of [0.65, 0.35]) { ctx.beginPath(); ctx.ellipse(0, -24, 26 * k, 11 * k, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.restore();
}

function log(ctx: Ctx) {
  const body = rrectPath(-108, -40, 216, 46, 22); cel(ctx, body, { x: -108, y: -40, w: 216, h: 46 }, PAL.wood, PAL.woodDark, PAL.woodLight, { texture: 0.8, seed: 8 });
  ctx.save(); ctx.clip(body); ctx.strokeStyle = rgba(PAL.woodDark, 0.6); ctx.lineWidth = 2; for (const y of [-28, -16]) { ctx.beginPath(); ctx.moveTo(-90, y); ctx.lineTo(80, y + 2); ctx.stroke(); } ctx.restore();
  const end = ellipsePath(96, -17, 14, 22); cel(ctx, end, { x: 82, y: -39, w: 28, h: 44 }, '#e6c08a', '#c99a5e', null);
  ctx.save(); ctx.strokeStyle = rgba(PAL.woodDark, 0.8); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(96, -17, 7, 12, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.fillStyle = rgba(PAL.leaf, 0.9); ctx.beginPath(); ctx.ellipse(-40, -38, 26, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.stroke();
  const mush = (x: number) => { const c = ellipsePath(x, -46, 9, 6); cel(ctx, c, { x: x - 9, y: -52, w: 18, h: 12 }, '#ef5a4f', '#b93a35', null, { outline: OUTW * 0.7 }); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 3, -48, 1.8, 0, 7); ctx.arc(x + 3, -46, 1.4, 0, 7); ctx.fill(); };
  mush(20); mush(34);
}

function fenceH(ctx: Ctx, len: number) {
  const n = Math.round(len / 48);
  for (const y of [-30, -14]) { const rail = rrectPath(-len / 2, y - 5, len, 10, 4); cel(ctx, rail, { x: -len / 2, y: y - 5, w: len, h: 10 }, PAL.woodLight, PAL.wood, null, { outline: OUTW * 0.85 }); }
  for (let i = 0; i <= n; i++) {
    const x = -len / 2 + (i * len) / n;
    const post = new Path2D(); post.moveTo(x - 6, 4); post.lineTo(x - 6, -38); post.lineTo(x, -45); post.lineTo(x + 6, -38); post.lineTo(x + 6, 4); post.closePath();
    cel(ctx, post, { x: x - 6, y: -45, w: 12, h: 49 }, PAL.wood, PAL.woodDark, PAL.woodLight, { outline: OUTW * 0.85 });
  }
}

function fenceV(ctx: Ctx, len: number) {
  const n = Math.round(len / 48);
  for (let i = n; i >= 0; i--) {
    const y = -len + (i * len) / n;
    if (i < n) { const rail = rrectPath(-5, y - 30, 10, len / n + 6, 4); cel(ctx, rail, { x: -5, y: y - 30, w: 10, h: len / n + 6 }, PAL.woodLight, PAL.wood, null, { outline: OUTW * 0.85 }); }
    const post = new Path2D(); post.moveTo(-6, y + 4); post.lineTo(-6, y - 38); post.lineTo(0, y - 45); post.lineTo(6, y - 38); post.lineTo(6, y + 4); post.closePath();
    cel(ctx, post, { x: -6, y: y - 45, w: 12, h: 49 }, PAL.wood, PAL.woodDark, PAL.woodLight, { outline: OUTW * 0.85 });
  }
}

function house(ctx: Ctx, seed: number) {
  const roofCol = seed % 2 ? ['#ef6a4f', '#b9433a', '#ff9c84'] : ['#5aa0e6', '#3a6fb8', '#9ccaff'];
  const wall = rrectPath(-140, -150, 280, 150, 8);
  cel(ctx, wall, { x: -140, y: -150, w: 280, h: 150 }, '#fff1d6', '#e3c79c', '#fffaf0', { texture: 0.5, seed });
  // timber frame
  ctx.save(); ctx.clip(wall); ctx.fillStyle = PAL.wood; for (const x of [-140, -50, 50, 134]) ctx.fillRect(x, -150, 8, 150); ctx.fillRect(-140, -84, 280, 7); ctx.restore();
  const door = rrectPath(-22, -78, 44, 78, 18); cel(ctx, door, { x: -22, y: -78, w: 44, h: 78 }, PAL.wood, PAL.woodDark, PAL.woodLight);
  ctx.fillStyle = '#ffcf3d'; ctx.beginPath(); ctx.arc(12, -38, 3.5, 0, 7); ctx.fill();
  for (const x of [-100, 76]) { const w = rrectPath(x, -128, 30, 30, 5); cel(ctx, w, { x, y: -128, w: 30, h: 30 }, '#8fe4ff', '#3ab0e0', '#e0f8ff', { gloss: true }); ctx.fillStyle = OUT; ctx.fillRect(x + 14, -128, 2.5, 30); ctx.fillRect(x, -114, 30, 2.5); }
  const roof = new Path2D(); roof.moveTo(-162, -138); roof.lineTo(-112, -236); roof.lineTo(112, -236); roof.lineTo(162, -138); roof.closePath();
  cel(ctx, roof, { x: -162, y: -236, w: 324, h: 98 }, roofCol[0], roofCol[1], roofCol[2], { so: [-30, -20], texture: 0.6, seed });
  ctx.save(); ctx.clip(roof); ctx.strokeStyle = rgba(roofCol[1], 0.7); ctx.lineWidth = 2.5; for (let y = -220; y < -138; y += 16) { ctx.beginPath(); ctx.moveTo(-170, y); ctx.lineTo(170, y); ctx.stroke(); } ctx.restore();
  const ch = rrectPath(70, -262, 26, 40, 4); cel(ctx, ch, { x: 70, y: -262, w: 26, h: 40 }, PAL.stone, PAL.stoneDark, PAL.stoneLight);
}

function barrel(ctx: Ctx) {
  const b = new Path2D(); b.moveTo(-22, -64); b.quadraticCurveTo(-30, -32, -22, 0); b.lineTo(22, 0); b.quadraticCurveTo(30, -32, 22, -64); b.closePath();
  cel(ctx, b, { x: -30, y: -64, w: 60, h: 64 }, PAL.wood, PAL.woodDark, PAL.woodLight, { texture: 0.6, seed: 4 });
  ctx.save(); ctx.clip(b); ctx.fillStyle = '#7d8a96'; for (const y of [-54, -14]) ctx.fillRect(-32, y, 64, 6); ctx.restore();
  const top = ellipsePath(0, -64, 22, 8); cel(ctx, top, { x: -22, y: -72, w: 44, h: 16 }, '#c98a52', '#a06a3a', null, { outline: OUTW * 0.8 });
  ctx.fillStyle = 'rgba(120,210,255,0.85)'; ctx.beginPath(); ctx.ellipse(0, -64, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
}

function crate(ctx: Ctx) {
  const front = rrectPath(-46, -60, 92, 60, 4); cel(ctx, front, { x: -46, y: -60, w: 92, h: 60 }, PAL.woodLight, PAL.wood, '#f0c08a', { texture: 0.5, seed: 6 });
  const top = new Path2D(); top.moveTo(-46, -60); top.lineTo(-34, -80); top.lineTo(50, -80); top.lineTo(46, -60); top.closePath();
  cel(ctx, top, { x: -46, y: -80, w: 96, h: 20 }, '#f0c08a', PAL.woodLight, null, { outline: OUTW * 0.85 });
  ctx.save(); ctx.strokeStyle = PAL.woodDark; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-42, -56); ctx.lineTo(42, -4); ctx.moveTo(42, -56); ctx.lineTo(-42, -4); ctx.stroke(); ctx.restore();
}

function hay(ctx: Ctx) {
  const b = ellipsePath(0, -34, 58, 36); cel(ctx, b, { x: -58, y: -70, w: 116, h: 72 }, '#f2cf62', '#c9a035', '#fff0a0', { texture: 1, seed: 12 });
  ctx.save(); ctx.clip(b); ctx.strokeStyle = 'rgba(160,120,30,0.7)'; ctx.lineWidth = 1.5;
  const r = new ARng(4); for (let i = 0; i < 30; i++) { const x = r.r(-56, 56), y = r.r(-68, 0); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r.r(-6, 6), y + r.r(4, 10)); ctx.stroke(); }
  ctx.fillStyle = '#ef5a4f'; ctx.fillRect(-60, -40, 120, 7); ctx.restore();
}

function well(ctx: Ctx) {
  const base = new Path2D(); base.moveTo(-58, -40); base.lineTo(-56, 0); base.quadraticCurveTo(0, 12, 56, 0); base.lineTo(58, -40); base.closePath();
  cel(ctx, base, { x: -58, y: -40, w: 116, h: 52 }, PAL.stone, PAL.stoneDark, PAL.stoneLight, { texture: 0.8, seed: 3 });
  const top = ellipsePath(0, -40, 58, 20); cel(ctx, top, { x: -58, y: -60, w: 116, h: 40 }, PAL.stoneLight, PAL.stone, null);
  ctx.fillStyle = '#3aa6e0'; ctx.beginPath(); ctx.ellipse(0, -40, 44, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke();
  for (const x of [-50, 46]) { const post = rrectPath(x, -130, 8, 92, 3); cel(ctx, post, { x, y: -130, w: 8, h: 92 }, PAL.wood, PAL.woodDark, null, { outline: OUTW * 0.85 }); }
  const roof = new Path2D(); roof.moveTo(-70, -118); roof.lineTo(0, -160); roof.lineTo(70, -118); roof.closePath(); cel(ctx, roof, { x: -70, y: -160, w: 140, h: 42 }, '#ef6a4f', '#b9433a', '#ff9c84');
}

function cart(ctx: Ctx) {
  const bed = rrectPath(-100, -86, 200, 50, 8); cel(ctx, bed, { x: -100, y: -86, w: 200, h: 50 }, PAL.wood, PAL.woodDark, PAL.woodLight, { texture: 0.6, seed: 2 });
  for (let i = 0; i < 5; i++) { const a = ellipsePath(-60 + i * 30, -94, 16, 14); cel(ctx, a, { x: -76 + i * 30, y: -108, w: 32, h: 28 }, i % 2 ? '#ef5a4f' : '#ffcf3d', i % 2 ? '#b93a35' : '#d9951f', null, { gloss: true, outline: OUTW * 0.8 }); }
  for (const x of [-62, 62]) { const w = ellipsePath(x, -26, 26, 26); cel(ctx, w, { x: x - 26, y: -52, w: 52, h: 52 }, PAL.woodDark, '#5a361c', PAL.wood); ctx.fillStyle = '#7d8a96'; ctx.beginPath(); ctx.arc(x, -26, 7, 0, 7); ctx.fill(); }
}

function reeds(ctx: Ctx) {
  const r = new ARng(9);
  for (let i = 0; i < 9; i++) {
    const x = r.r(-24, 24), h = r.r(50, 80), lean = r.r(-8, 8);
    ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + lean * 0.4, -h * 0.6, x + lean, -h); ctx.stroke();
    ctx.strokeStyle = i % 2 ? PAL.leaf : PAL.leafDark; ctx.lineWidth = 3; ctx.stroke();
    if (i % 3 === 0) { const c = ellipsePath(x + lean, -h - 4, 4, 10); cel(ctx, c, { x: x + lean - 4, y: -h - 14, w: 8, h: 20 }, '#8a5a32', '#5a361c', null, { outline: OUTW * 0.7 }); }
  }
}

function shellRock(ctx: Ctx) {
  rockShape(ctx, 58, 50, 21);
  const sh = new Path2D(); sh.moveTo(-18, -40); sh.quadraticCurveTo(-16, -62, 0, -64); sh.quadraticCurveTo(16, -62, 18, -40); sh.closePath();
  cel(ctx, sh, { x: -18, y: -64, w: 36, h: 24 }, '#ffc3d6', '#e08aa8', '#fff0f5', { outline: OUTW * 0.8 });
}

function driftwood(ctx: Ctx) {
  const b = smoothPath([[-108, -20], [-80, -38], [0, -34], [70, -40], [108, -26], [100, -6], [20, -10], [-60, -4], [-104, -6]], true, 0.6);
  cel(ctx, b, { x: -108, y: -40, w: 216, h: 36 }, '#d8c3a5', '#a89070', '#f2e6d0', { texture: 0.8, seed: 7 });
}

// ---------------------------------------------------------------- decor
function flower(ctx: Ctx, c: string) {
  ctx.strokeStyle = PAL.leafDark; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10); ctx.stroke();
  for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; const p = ellipsePath(Math.cos(a) * 5, -14 + Math.sin(a) * 5, 4, 4); ctx.fillStyle = c; ctx.fill(p); ctx.strokeStyle = rgba(OUT, 0.8); ctx.lineWidth = 1.2; ctx.stroke(p); }
  ctx.fillStyle = '#ffcf3d'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, -14, 3, 0, 7); ctx.fill(); ctx.stroke();
}

function tuft(ctx: Ctx) {
  ctx.lineCap = 'round';
  for (const [x, h, l] of [[-6, 14, -4], [0, 18, 1], [6, 13, 5], [-2, 11, -6], [3, 12, 7]] as [number, number, number][]) {
    ctx.strokeStyle = rgba(OUT, 0.7); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + l * 0.3, -h * 0.6, x + l, -h); ctx.stroke();
    ctx.strokeStyle = PAL.leafLight; ctx.lineWidth = 2; ctx.stroke();
  }
}

function mushroom(ctx: Ctx) {
  const st = rrectPath(-4, -12, 8, 12, 3); cel(ctx, st, { x: -4, y: -12, w: 8, h: 12 }, '#fff6e2', '#e0cfa8', null, { outline: OUTW * 0.7 });
  const cap = new Path2D(); cap.moveTo(-12, -10); cap.quadraticCurveTo(-11, -24, 0, -25); cap.quadraticCurveTo(11, -24, 12, -10); cap.closePath();
  cel(ctx, cap, { x: -12, y: -25, w: 24, h: 15 }, '#ef5a4f', '#b93a35', '#ff9a90', { outline: OUTW * 0.75 });
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-5, -17, 2.2, 0, 7); ctx.arc(4, -19, 2.6, 0, 7); ctx.arc(1, -12.5, 1.6, 0, 7); ctx.fill();
}

function pebble(ctx: Ctx, seed: number) { const p = blobPath(0, -5, 9, 6, seed, 0.12); cel(ctx, p, { x: -9, y: -11, w: 18, h: 12 }, PAL.stone, PAL.stoneDark, PAL.stoneLight, { outline: OUTW * 0.7 }); }

function clover(ctx: Ctx) {
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2 - Math.PI / 2; const p = ellipsePath(Math.cos(a) * 5, -6 + Math.sin(a) * 5, 5, 5); ctx.fillStyle = PAL.leaf; ctx.fill(p); ctx.strokeStyle = PAL.leafDark; ctx.lineWidth = 1.4; ctx.stroke(p); }
}

function shell(ctx: Ctx) {
  const sh = new Path2D(); sh.moveTo(-10, 0); sh.quadraticCurveTo(-10, -16, 0, -17); sh.quadraticCurveTo(10, -16, 10, 0); sh.closePath();
  cel(ctx, sh, { x: -10, y: -17, w: 20, h: 17 }, '#ffd6e2', '#e8a0b6', '#fff3f7', { outline: OUTW * 0.7 });
}

function leaf(ctx: Ctx) {
  const p = smoothPath([[-10, 0], [0, -8], [10, -2], [0, 4]], true, 0.8);
  cel(ctx, p, { x: -10, y: -8, w: 20, h: 12 }, '#f2a33a', '#c97a1f', null, { outline: OUTW * 0.6 });
}

// ---------------------------------------------------------------- gate
function gatePosts(ctx: Ctx) {
  for (const x of [-100, 100]) {
    const post = rrectPath(x - 12, -130, 24, 132, 6); cel(ctx, post, { x: x - 12, y: -130, w: 24, h: 132 }, PAL.wood, PAL.woodDark, PAL.woodLight, { texture: 0.6, seed: x + 200 });
    const cap = ellipsePath(x, -132, 16, 10); cel(ctx, cap, { x: x - 16, y: -142, w: 32, h: 20 }, PAL.leaf, PAL.leafDark, PAL.leafLight, { outline: OUTW * 0.85 });
  }
  const beam = new Path2D(); beam.moveTo(-118, -126); beam.quadraticCurveTo(0, -158, 118, -126); beam.lineTo(118, -108); beam.quadraticCurveTo(0, -140, -118, -108); beam.closePath();
  cel(ctx, beam, { x: -118, y: -158, w: 236, h: 50 }, PAL.woodLight, PAL.wood, '#f0c08a', { texture: 0.5, seed: 31 });
  const sign = rrectPath(-34, -166, 68, 34, 8); cel(ctx, sign, { x: -34, y: -166, w: 68, h: 34 }, '#fff1d6', '#e3c79c', '#fffaf0');
  const d = new Path2D(); d.moveTo(0, -162); d.bezierCurveTo(6, -154, 12, -148, 12, -143); d.arc(0, -143, 12, 0, Math.PI); d.bezierCurveTo(-12, -148, -6, -154, 0, -162); d.closePath();
  ctx.fillStyle = PAL.water; ctx.fill(d); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke(d);
  // vines
  ctx.strokeStyle = PAL.leafDark; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-100, -120); ctx.quadraticCurveTo(-60, -110, -40, -128); ctx.moveTo(100, -120); ctx.quadraticCurveTo(60, -110, 44, -126); ctx.stroke();
  for (const [x, y] of [[-70, -114], [-48, -124], [70, -114], [52, -122]]) { const lf = ellipsePath(x, y, 6, 4, 0.4); ctx.fillStyle = PAL.leaf; ctx.fill(lf); ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.stroke(lf); }
}

export function register() {
  group('tiles');
  for (let i = 0; i < 4; i++) sprite(`g_${i}`, T, T, 0, 0, (ctx) => grassTile(ctx, 100 + i * 17, i === 3));
  for (const k of ['path', 'water', 'sand', 'cobble'] as TerrainKind[]) for (let m = 1; m < 16; m++) sprite(`t_${k}_${m}`, T, T, 0, 0, (ctx) => terrainTile(ctx, k, m));
  group('sprites');
  const ob = (name: string, w: number, h: number, ay: number, fn: (c: Ctx) => void) => sprite(name, w, h, w / 2, ay, (ctx) => { ctx.translate(w / 2, ay); fn(ctx); });
  ob('ob_tree', 170, 200, 186, (c) => tree(c, 3));
  ob('ob_tree2', 170, 200, 186, (c) => tree(c, 7));
  ob('ob_pine', 130, 190, 178, (c) => pine(c, 2));
  ob('ob_bush', 120, 90, 78, (c) => bush(c, 4));
  ob('ob_rock', 130, 110, 96, (c) => rockShape(c, 56, 52, 5));
  ob('ob_boulder', 190, 160, 140, (c) => rockShape(c, 86, 80, 9));
  ob('ob_stump', 80, 70, 56, stump);
  ob('ob_log', 250, 90, 74, log);
  ob('ob_fence', 320, 70, 56, (c) => fenceH(c, 288));
  ob('ob_fencev', 50, 360, 330, (c) => fenceV(c, 288));
  ob('ob_house', 360, 300, 270, (c) => house(c, 1));
  ob('ob_house2', 360, 300, 270, (c) => house(c, 2));
  ob('ob_barrel', 76, 90, 78, barrel);
  ob('ob_crate', 120, 100, 86, crate);
  ob('ob_hay', 140, 100, 86, hay);
  ob('ob_well', 150, 180, 160, well);
  ob('ob_cart', 230, 140, 120, cart);
  ob('ob_reeds', 90, 110, 100, reeds);
  ob('ob_shellrock', 140, 120, 104, shellRock);
  ob('ob_driftwood', 240, 70, 56, driftwood);
  ob('border_tree', 170, 200, 186, (c) => tree(c, 11, true));
  ob('border_pine', 130, 190, 178, (c) => pine(c, 5));
  ob('border_bush', 120, 90, 78, (c) => bush(c, 9));
  ob('gate_posts', 280, 200, 180, gatePosts);
  const fl = ['#ffffff', '#ffe066', '#ff9ec4', '#a8d8ff', '#ffb36b'];
  fl.forEach((c, i) => ob(`d_flower_${i}`, 40, 40, 34, (cx) => flower(cx, c)));
  ob('d_tuft', 40, 40, 34, tuft);
  ob('d_mushroom', 40, 40, 34, mushroom);
  for (let i = 0; i < 2; i++) ob(`d_pebble_${i}`, 30, 26, 20, (c) => pebble(c, 40 + i));
  ob('d_clover', 30, 30, 24, clover);
  ob('d_shell', 30, 26, 22, shell);
  ob('d_leaf', 30, 22, 16, leaf);
  // soft round shadow under everything that stands on the ground
  sprite('shadow', 120, 48, 60, 24, (ctx) => {
    ctx.save(); ctx.scale(1, 0.4);
    const g = ctx.createRadialGradient(60, 60, 0, 60, 60, 60);
    g.addColorStop(0, 'rgba(25,40,10,0.42)'); g.addColorStop(0.6, 'rgba(25,40,10,0.3)'); g.addColorStop(1, 'rgba(25,40,10,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(60, 60, 60, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
  void gloss;
}
