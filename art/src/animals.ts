// Parameterized chibi animal generator: 16 species from four body plans,
// same outline/shading/eye rules as everything else.
import { sprite } from './atlas';
import { OUT, OUTW, ARng, cel, ellipsePath, smoothPath, eye, mouth, blush, rrectPath, gloss, type Ctx, type Mood, darken, lighten } from './kit';

type Ear = 'floppy' | 'long' | 'pointy' | 'round' | 'tuft' | 'big' | 'pig' | 'none';
type Tail = 'stub' | 'puff' | 'bushy' | 'fox' | 'curly' | 'long' | 'thick' | 'short' | 'none';
type Plan = 'quad' | 'bird' | 'frog' | 'turtle';

interface Sp {
  plan: Plan; base: string; shade: string; light: string; belly?: string;
  ear: Ear; earCol?: string; earInner?: string; tail: Tail; tailCol?: string; tailTip?: string;
  muzzle?: string; nose: string; mark?: string; bodyW: number; bodyH: number; headR: number; leg?: string; legLen?: number;
  beak?: string; feet?: string;
}

export const SPECIES: Record<string, Sp> = {
  puppy: { plan: 'quad', base: '#f2c48d', shade: '#cf9358', light: '#ffe4c2', belly: '#fff3e2', ear: 'floppy', earCol: '#a8683a', tail: 'stub', muzzle: '#fff3e2', nose: '#3a2416', mark: 'patch', bodyW: 24, bodyH: 17, headR: 22 },
  bunny: { plan: 'quad', base: '#fbf3ee', shade: '#dcc8c0', light: '#ffffff', ear: 'long', earInner: '#ffb3c6', tail: 'puff', muzzle: '#ffffff', nose: '#ff8fa8', bodyW: 22, bodyH: 17, headR: 21 },
  squirrel: { plan: 'quad', base: '#d9844a', shade: '#a85f2f', light: '#f2ab72', belly: '#ffe7c4', ear: 'tuft', tail: 'bushy', tailCol: '#e0914f', tailTip: '#ffe0b0', muzzle: '#ffe7c4', nose: '#3a2416', bodyW: 20, bodyH: 16, headR: 20 },
  fox: { plan: 'quad', base: '#f28a3b', shade: '#c9621f', light: '#ffb070', belly: '#fff5e8', ear: 'pointy', earInner: '#3a2a26', tail: 'fox', tailTip: '#fff5e8', muzzle: '#fff5e8', nose: '#3a2416', leg: '#4a3430', bodyW: 24, bodyH: 16, headR: 21 },
  hedgehog: { plan: 'quad', base: '#f3d9b5', shade: '#d9b48a', light: '#fff0da', ear: 'round', tail: 'none', muzzle: '#fff0da', nose: '#3a2416', mark: 'spikes', bodyW: 24, bodyH: 18, headR: 19, legLen: 9 },
  fawn: { plan: 'quad', base: '#c98a52', shade: '#9c6534', light: '#e8b07a', belly: '#fff3e2', ear: 'big', earInner: '#ffd0c0', tail: 'short', tailCol: '#fff3e2', muzzle: '#fff3e2', nose: '#3a2416', mark: 'spots', bodyW: 22, bodyH: 15, headR: 20, legLen: 19 },
  kitten: { plan: 'quad', base: '#b9bccf', shade: '#8a8ea8', light: '#dfe2ef', belly: '#f5f5fb', ear: 'pointy', earInner: '#ffb3c6', tail: 'long', muzzle: '#f5f5fb', nose: '#ff8fa8', mark: 'stripes', bodyW: 21, bodyH: 15, headR: 21 },
  duckling: { plan: 'bird', base: '#ffd84a', shade: '#e3a91f', light: '#fff09a', ear: 'none', tail: 'none', nose: '#ff9a2e', beak: 'bill', feet: '#ff9a2e', bodyW: 23, bodyH: 22, headR: 17 },
  piglet: { plan: 'quad', base: '#ffb4c4', shade: '#e488a0', light: '#ffd6df', ear: 'pig', tail: 'curly', muzzle: '#ff9ab0', nose: '#d9607f', mark: 'snout', bodyW: 24, bodyH: 18, headR: 21, legLen: 10 },
  lamb: { plan: 'quad', base: '#fbf7f0', shade: '#dcd2c4', light: '#ffffff', ear: 'floppy', earCol: '#f3d9c9', tail: 'puff', muzzle: '#ffe9dc', nose: '#d98fa0', mark: 'wool', leg: '#e8d6c6', bodyW: 24, bodyH: 18, headR: 20 },
  chick: { plan: 'bird', base: '#ffc93c', shade: '#e8a01e', light: '#ffe58a', ear: 'none', tail: 'none', nose: '#ff8a3d', beak: 'tiny', feet: '#ff8a3d', mark: 'tuft', bodyW: 20, bodyH: 20, headR: 0 },
  otter: { plan: 'quad', base: '#9b6b46', shade: '#714a2d', light: '#c08b62', belly: '#f2d8b8', ear: 'round', tail: 'thick', muzzle: '#f2d8b8', nose: '#3a2416', bodyW: 27, bodyH: 15, headR: 19, legLen: 10 },
  turtle: { plan: 'turtle', base: '#b5df78', shade: '#86b84e', light: '#d8f2a6', ear: 'none', tail: 'none', nose: '#3a2416', bodyW: 28, bodyH: 20, headR: 13 },
  frog: { plan: 'frog', base: '#7ed957', shade: '#4fae3a', light: '#b3f08a', belly: '#f4f7c8', ear: 'none', tail: 'none', nose: '#3a2416', bodyW: 28, bodyH: 18, headR: 0 },
  penguin: { plan: 'bird', base: '#3e4c6e', shade: '#28324c', light: '#6676a0', belly: '#ffffff', ear: 'none', tail: 'none', nose: '#ff9a2e', beak: 'tiny', feet: '#ff9a2e', bodyW: 22, bodyH: 26, headR: 0 },
  panda: { plan: 'quad', base: '#ffffff', shade: '#dcdce4', light: '#ffffff', ear: 'round', earCol: '#2e2e38', tail: 'stub', tailCol: '#2e2e38', muzzle: '#ffffff', nose: '#2e2e38', mark: 'panda', leg: '#2e2e38', bodyW: 25, bodyH: 19, headR: 22, legLen: 10 },
};

interface Pose { swing: number; bob: number; jump: number; squash: number; mood: Mood; mouth: Parameters<typeof mouth>[4]; sleep?: boolean; sit?: boolean; earUp?: number; wag?: number; head?: number }
const P0: Pose = { swing: 0, bob: 0, jump: 0, squash: 1, mood: 'normal', mouth: 'smile' };

function legShape(ctx: Ctx, x: number, top: number, len: number, swing: number, col: string, shade: string, far: boolean) {
  const fx = x + swing; const lift = Math.max(0, -swing) * 0.25;
  const p = new Path2D();
  p.moveTo(x - 4.5, top); p.lineTo(x + 4.5, top); p.lineTo(fx + 4.5, top + len - lift); p.quadraticCurveTo(fx + 5.5, top + len + 4 - lift, fx, top + len + 4 - lift);
  p.quadraticCurveTo(fx - 5.5, top + len + 4 - lift, fx - 4.5, top + len - lift); p.closePath();
  cel(ctx, p, { x: Math.min(x, fx) - 6, y: top, w: 12 + Math.abs(swing), h: len + 4 }, far ? darken(col, 0.18) : col, far ? darken(shade, 0.2) : shade, null, { outline: OUTW * 0.8 });
}

function earDraw(ctx: Ctx, sp: Sp, hx: number, hy: number, r: number, side: number, far: boolean, up: number) {
  const col = sp.earCol ?? sp.base; const sh = sp.earCol ? darken(sp.earCol, 0.2) : sp.shade;
  const dc = far ? darken(col, 0.12) : col;
  ctx.save();
  const top = sp.ear === 'pointy' || sp.ear === 'tuft' || sp.ear === 'pig' || sp.ear === 'round';
  const ex = hx + side * r * (top ? 0.42 : 0.55) - (top ? r * 0.12 : 0), ey = hy - r * (top ? 0.72 : 0.6);
  switch (sp.ear) {
    case 'floppy': {
      const p = smoothPath([[ex - side * 2, ey - 2], [ex + side * r * 0.45, ey + 2], [ex + side * r * 0.55, ey + r * 0.7 - up * 6], [ex + side * r * 0.2, ey + r * 0.85 - up * 6], [ex - side * r * 0.1, ey + r * 0.3]], true, 0.8);
      cel(ctx, p, { x: ex - r * 0.6, y: ey - 3, w: r * 1.2, h: r }, dc, sh, null, { outline: OUTW * 0.85 });
      break;
    }
    case 'long': {
      ctx.translate(ex - side * 3, ey + 2); ctx.rotate(side * (0.18 - up * 0.08));
      const p = ellipsePath(0, -r * 0.75, r * 0.26, r * 0.78);
      cel(ctx, p, { x: -r * 0.27, y: -r * 1.55, w: r * 0.54, h: r * 1.56 }, dc, sh, sp.light, { outline: OUTW * 0.85 });
      ctx.fillStyle = sp.earInner ?? '#ffb3c6'; ctx.beginPath(); ctx.ellipse(0, -r * 0.72, r * 0.12, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'pointy': case 'tuft': {
      const p = new Path2D(); p.moveTo(ex - side * r * 0.32, ey + r * 0.2); p.lineTo(ex + side * r * 0.05, ey - r * 0.62 - up * 3); p.lineTo(ex + side * r * 0.42, ey + r * 0.16); p.closePath();
      cel(ctx, p, { x: ex - r * 0.45, y: ey - r * 0.65, w: r * 0.9, h: r * 0.85 }, dc, sh, null, { outline: OUTW * 0.85 });
      if (sp.earInner) { ctx.fillStyle = sp.earInner; const q = new Path2D(); q.moveTo(ex - side * r * 0.16, ey + r * 0.1); q.lineTo(ex + side * r * 0.05, ey - r * 0.38); q.lineTo(ex + side * r * 0.24, ey + r * 0.08); q.closePath(); ctx.fill(q); }
      if (sp.ear === 'tuft') { ctx.strokeStyle = OUT; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex + side * r * 0.05, ey - r * 0.6); ctx.lineTo(ex + side * r * 0.12, ey - r * 0.85); ctx.stroke(); }
      break;
    }
    case 'round': {
      const p = ellipsePath(ex, ey + 2, r * 0.28, r * 0.26);
      cel(ctx, p, { x: ex - r * 0.3, y: ey - r * 0.25, w: r * 0.6, h: r * 0.55 }, dc, sh, null, { outline: OUTW * 0.85 });
      break;
    }
    case 'big': {
      ctx.translate(ex, ey + r * 0.15); ctx.rotate(side * (1.0 - up * 0.2));
      const p = ellipsePath(0, -r * 0.35, r * 0.22, r * 0.42);
      cel(ctx, p, { x: -r * 0.23, y: -r * 0.78, w: r * 0.46, h: r * 0.84 }, dc, sh, null, { outline: OUTW * 0.85 });
      ctx.fillStyle = sp.earInner ?? '#ffd0c0'; ctx.beginPath(); ctx.ellipse(0, -r * 0.33, r * 0.1, r * 0.26, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'pig': {
      const p = new Path2D(); p.moveTo(ex - side * r * 0.3, ey + r * 0.15); p.lineTo(ex + side * r * 0.1, ey - r * 0.38 - up * 2); p.lineTo(ex + side * r * 0.45, ey + r * 0.25); p.closePath();
      cel(ctx, p, { x: ex - r * 0.45, y: ey - r * 0.4, w: r * 0.9, h: r * 0.65 }, dc, sh, null, { outline: OUTW * 0.85 });
      break;
    }
  }
  ctx.restore();
}

function tailDraw(ctx: Ctx, sp: Sp, x: number, y: number, wag: number) {
  const col = sp.tailCol ?? sp.base, sh = darken(col, 0.18);
  ctx.save(); ctx.translate(x, y); ctx.rotate(wag);
  switch (sp.tail) {
    case 'stub': { const p = ellipsePath(-4, -6, 5, 9, -0.6); cel(ctx, p, { x: -10, y: -16, w: 12, h: 18 }, col, sh, null, { outline: OUTW * 0.8 }); break; }
    case 'puff': { const p = ellipsePath(-3, -1, 8, 7.5); cel(ctx, p, { x: -11, y: -9, w: 16, h: 15 }, col, sh, '#ffffff', { outline: OUTW * 0.8 }); break; }
    case 'short': { const p = ellipsePath(-3, -4, 5, 7, -0.4); cel(ctx, p, { x: -8, y: -11, w: 10, h: 14 }, col, sh, null, { outline: OUTW * 0.8 }); break; }
    case 'bushy': {
      const p = smoothPath([[0, 2], [-14, -4], [-22, -22], [-16, -42], [-4, -50], [6, -44], [0, -32], [-8, -24], [-4, -8]], true, 0.85);
      cel(ctx, p, { x: -23, y: -51, w: 30, h: 54 }, col, sh, sp.tailTip ?? null, { outline: OUTW * 0.85, texture: 0.6, seed: 5 });
      break;
    }
    case 'fox': {
      const p = smoothPath([[2, 0], [-12, -2], [-28, -12], [-34, -24], [-22, -22], [-8, -12]], true, 0.85);
      cel(ctx, p, { x: -35, y: -25, w: 38, h: 27 }, col, sh, null, { outline: OUTW * 0.85 });
      ctx.save(); ctx.clip(p); ctx.fillStyle = sp.tailTip ?? '#fff'; ctx.beginPath(); ctx.ellipse(-31, -21, 9, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.save(); ctx.strokeStyle = OUT; ctx.lineWidth = OUTW * 0.85; ctx.stroke(p); ctx.restore();
      break;
    }
    case 'curly': {
      ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-10, -2, -12, -12, -6, -12); ctx.bezierCurveTo(-1, -12, -2, -5, -8, -5); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); break;
    }
    case 'long': {
      ctx.strokeStyle = OUT; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-14, 0, -20, -14, -14, -30); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke(); break;
    }
    case 'thick': {
      const p = smoothPath([[2, -6], [-16, -4], [-30, 2], [-30, 6], [-14, 6], [2, 4]], true, 0.8);
      cel(ctx, p, { x: -31, y: -7, w: 34, h: 14 }, col, sh, null, { outline: OUTW * 0.85 }); break;
    }
  }
  ctx.restore();
}

function drawQuad(ctx: Ctx, sp: Sp, P: Pose) {
  const bw = sp.bodyW, bh = sp.bodyH, hr = sp.headR; const legLen = sp.legLen ?? 13;
  const legCol = sp.leg ?? sp.base; const legSh = sp.leg ? darken(sp.leg, 0.2) : sp.shade;
  const groundY = -4;
  const bodyCy = groundY - legLen - bh * 0.55;
  if (P.sleep) {
    // curled up asleep
    const by = -bh * 0.9;
    tailDraw(ctx, sp, bw * 0.6, by + 6, -0.6);
    const body = ellipsePath(0, by, bw * 1.05, bh * 0.85);
    cel(ctx, body, { x: -bw * 1.05, y: by - bh * 0.85, w: bw * 2.1, h: bh * 1.7 }, sp.base, sp.shade, sp.light, { texture: sp.mark === 'wool' ? 0.9 : 0.3, seed: 2 });
    if (sp.mark === 'spikes') spikes(ctx, 0, by, bw * 1.05, bh * 0.85, 0.2);
    const hx = -bw * 0.45, hy = by + 2;
    earDraw(ctx, sp, hx, hy, hr * 0.9, -1, true, -0.5);
    const head = ellipsePath(hx, hy, hr * 0.9, hr * 0.82);
    cel(ctx, head, { x: hx - hr * 0.9, y: hy - hr * 0.82, w: hr * 1.8, h: hr * 1.64 }, sp.base, sp.shade, sp.light);
    earDraw(ctx, sp, hx, hy, hr * 0.9, 1, false, -0.5);
    marksHead(ctx, sp, hx, hy, hr * 0.9, true);
    eye(ctx, hx - hr * 0.3, hy, hr * 0.2, 'sleep'); eye(ctx, hx + hr * 0.25, hy, hr * 0.2, 'sleep');
    blush(ctx, hx + hr * 0.5, hy + hr * 0.3, hr * 0.16, 0.5);
    return;
  }
  ctx.translate(0, P.bob - P.jump);
  const sw = P.swing;
  const sitK = P.sit ? 1 : 0;
  // far legs
  if (!P.sit) {
    legShape(ctx, -bw * 0.55, bodyCy + bh * 0.3, legLen + bh * 0.25, -sw, legCol, legSh, true);
    legShape(ctx, bw * 0.45, bodyCy + bh * 0.3, legLen + bh * 0.25, sw, legCol, legSh, true);
  }
  tailDraw(ctx, sp, -bw * 0.85, bodyCy + (sp.tail === 'bushy' ? bh * 0.4 : 0) + sitK * 8, P.wag ?? 0);
  ctx.save();
  ctx.translate(0, bodyCy); ctx.scale(1 / Math.sqrt(P.squash), P.squash); ctx.translate(0, -bodyCy);
  const body = sp.mark === 'wool'
    ? woolPath(0, bodyCy + sitK * 6, bw, bh)
    : ellipsePath(0, bodyCy + sitK * 6, bw, bh, P.sit ? -0.15 : 0);
  cel(ctx, body, { x: -bw, y: bodyCy - bh + sitK * 6, w: bw * 2, h: bh * 2 }, sp.base, sp.shade, sp.light, { texture: sp.mark === 'wool' ? 0.8 : 0.35, seed: 7 });
  if (sp.belly) { ctx.save(); ctx.clip(body); ctx.fillStyle = sp.belly; ctx.beginPath(); ctx.ellipse(bw * 0.15, bodyCy + bh * 0.7 + sitK * 6, bw * 0.75, bh * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  if (sp.mark === 'spots') { ctx.save(); ctx.clip(body); ctx.fillStyle = 'rgba(255,248,235,0.95)'; for (const [x, y] of [[-10, -6], [-2, -10], [6, -5], [-14, 2], [2, 0]]) { ctx.beginPath(); ctx.ellipse(x, bodyCy + y, 2.6, 2.2, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
  if (sp.mark === 'stripes') { ctx.save(); ctx.clip(body); ctx.strokeStyle = darken(sp.base, 0.28); ctx.lineWidth = 3.2; ctx.lineCap = 'round'; for (const x of [-12, -4, 4]) { ctx.beginPath(); ctx.moveTo(x - 2, bodyCy - bh); ctx.lineTo(x + 2, bodyCy - bh * 0.25); ctx.stroke(); } ctx.restore(); }
  if (sp.mark === 'panda') { ctx.save(); ctx.clip(body); ctx.fillStyle = '#2e2e38'; ctx.fillRect(bw * 0.18, bodyCy - bh * 1.2, bw * 0.32, bh * 2.4); ctx.restore(); }
  if (sp.mark === 'spikes') spikes(ctx, 0, bodyCy, bw, bh, 0);
  ctx.restore();
  // near legs
  if (!P.sit) {
    legShape(ctx, -bw * 0.4, bodyCy + bh * 0.35, legLen + bh * 0.2, sw, legCol, legSh, false);
    legShape(ctx, bw * 0.6, bodyCy + bh * 0.35, legLen + bh * 0.2, -sw, legCol, legSh, false);
  } else {
    // front paws while sitting
    const fp = ellipsePath(bw * 0.55, groundY - 4, 6, 5); cel(ctx, fp, { x: bw * 0.55 - 6, y: groundY - 9, w: 12, h: 10 }, legCol, legSh, null, { outline: OUTW * 0.8 });
  }
  // head
  const hx = bw * 0.62, hy = bodyCy - bh * 0.75 - hr * 0.55 + (P.head ?? 0) + sitK * 4;
  const up = P.earUp ?? 0;
  earDraw(ctx, sp, hx, hy, hr, -1, true, up);
  const head = sp.mark === 'wool' ? woolHead(hx, hy, hr) : ellipsePath(hx, hy, hr, hr * 0.93);
  cel(ctx, head, { x: hx - hr, y: hy - hr, w: hr * 2, h: hr * 2 }, sp.mark === 'wool' ? '#ffe9dc' : sp.base, sp.mark === 'wool' ? '#e8c9b6' : sp.shade, sp.light, { so: [-hr * 0.18, -hr * 0.2] });
  if (sp.mark === 'wool') { const tuft = smoothPath([[hx - hr * 0.6, hy - hr * 0.55], [hx - hr * 0.3, hy - hr * 1.05], [hx + hr * 0.1, hy - hr * 1.1], [hx + hr * 0.5, hy - hr * 0.8], [hx + hr * 0.3, hy - hr * 0.5], [hx - hr * 0.1, hy - hr * 0.62]], true, 0.9); cel(ctx, tuft, { x: hx - hr * 0.6, y: hy - hr * 1.1, w: hr * 1.1, h: hr * 0.6 }, sp.base, sp.shade, '#fff', { outline: OUTW * 0.85 }); }
  earDraw(ctx, sp, hx, hy, hr, 1, false, up);
  marksHead(ctx, sp, hx, hy, hr, false);
  // muzzle and face (3/4 view: facing right)
  const mx = hx + hr * 0.45, my = hy + hr * 0.3;
  if (sp.muzzle && sp.mark !== 'snout') { ctx.save(); ctx.fillStyle = sp.muzzle; ctx.strokeStyle = 'rgba(58,36,22,0.25)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(mx, my, hr * 0.42, hr * 0.32, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  if (sp.mark === 'snout') { const sn = ellipsePath(mx + 2, my, hr * 0.32, hr * 0.25); cel(ctx, sn, { x: mx - hr * 0.3, y: my - hr * 0.25, w: hr * 0.64, h: hr * 0.5 }, sp.muzzle!, darken(sp.muzzle!, 0.2), null, { outline: OUTW * 0.8 }); ctx.fillStyle = sp.nose; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(mx + 2 + s * hr * 0.11, my, hr * 0.05, hr * 0.08, 0, 0, Math.PI * 2); ctx.fill(); } }
  else { ctx.fillStyle = sp.nose; ctx.strokeStyle = OUT; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(mx + hr * 0.12, my - hr * 0.12, hr * 0.12, hr * 0.09, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  const er = hr * 0.22;
  eye(ctx, hx - hr * 0.12, hy - hr * 0.05, er, P.mood, 0.45, 0.1, 1);
  eye(ctx, hx + hr * 0.4, hy - hr * 0.08, er * 0.95, P.mood, 0.45, 0.1, 1);
  blush(ctx, hx - hr * 0.3, hy + hr * 0.35, hr * 0.15, 0.55); blush(ctx, hx + hr * 0.78, hy + hr * 0.28, hr * 0.12, 0.5);
  mouth(ctx, mx + hr * 0.05, my + hr * 0.12, hr * 0.42, P.mouth);
}

function marksHead(ctx: Ctx, sp: Sp, hx: number, hy: number, hr: number, sleep: boolean) {
  if (sp.mark === 'patch' && !sleep) { ctx.save(); ctx.fillStyle = 'rgba(168,104,58,0.85)'; ctx.beginPath(); ctx.ellipse(hx - hr * 0.16, hy - hr * 0.12, hr * 0.3, hr * 0.32, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  if (sp.mark === 'panda') { ctx.save(); ctx.fillStyle = '#2e2e38'; for (const [x, a] of [[-0.13, 0.4], [0.42, -0.3]] as [number, number][]) { ctx.beginPath(); ctx.ellipse(hx + hr * x, hy - hr * 0.02, hr * 0.2, hr * 0.27, a, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
  if (sp.mark === 'stripes') { ctx.save(); ctx.strokeStyle = darken(sp.base, 0.28); ctx.lineWidth = 2.6; ctx.lineCap = 'round'; for (const x of [-0.2, 0.05, 0.3]) { ctx.beginPath(); ctx.moveTo(hx + hr * x, hy - hr * 0.92); ctx.lineTo(hx + hr * x + 1, hy - hr * 0.62); ctx.stroke(); } ctx.restore(); }
  if (sp.mark === 'spikes') { spikes(ctx, hx - hr * 0.7, hy - hr * 0.1, hr * 0.55, hr * 0.85, 0); }
}

function spikes(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, rot: number) {
  // hedgehog back: brown spiky shell over the upper body
  const pts: [number, number][] = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * (1.05 + (i / n) * 0.95) + rot;
    const rr = i % 2 ? 1.0 : 1.32;
    pts.push([cx + Math.cos(a) * rx * rr, cy + Math.sin(a) * ry * rr]);
  }
  pts.push([cx + rx * 0.9, cy + ry * 0.2]); pts.push([cx - rx * 0.95, cy + ry * 0.25]);
  const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) p.lineTo(q[0], q[1]); p.closePath();
  cel(ctx, p, { x: cx - rx * 1.35, y: cy - ry * 1.35, w: rx * 2.7, h: ry * 1.6 }, '#9a6a48', '#6e4a30', '#c08f68', { outline: OUTW * 0.85 });
}

function woolPath(cx: number, cy: number, rx: number, ry: number): Path2D {
  const p = new Path2D(); const n = 12;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2; const am = (a0 + a1) / 2;
    const x0 = cx + Math.cos(a0) * rx, y0 = cy + Math.sin(a0) * ry;
    if (i === 0) p.moveTo(x0, y0);
    p.quadraticCurveTo(cx + Math.cos(am) * rx * 1.28, cy + Math.sin(am) * ry * 1.28, cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry);
  }
  p.closePath(); return p;
}
function woolHead(cx: number, cy: number, r: number): Path2D { return ellipsePath(cx, cy, r * 0.9, r * 0.92); }

function drawBird(ctx: Ctx, sp: Sp, P: Pose, name: string) {
  const bw = sp.bodyW, bh = sp.bodyH;
  ctx.translate(0, P.bob - P.jump);
  const by = -bh - 6;
  const waddle = P.swing * 0.012;
  ctx.rotate(waddle);
  // feet
  if (!P.sleep) for (const [fx, s] of [[-7, -1], [7, 1]] as [number, number][]) {
    const lift = Math.max(0, s * P.swing) * 0.4;
    const f = new Path2D(); f.moveTo(fx - 7, -2 - lift); f.lineTo(fx + 8, -2 - lift); f.lineTo(fx + 4, -8 - lift); f.lineTo(fx - 3, -8 - lift); f.closePath();
    cel(ctx, f, { x: fx - 7, y: -8 - lift, w: 15, h: 6 }, sp.feet!, darken(sp.feet!, 0.2), null, { outline: OUTW * 0.75 });
  }
  ctx.save(); ctx.translate(0, by); ctx.scale(1 / Math.sqrt(P.squash), P.squash); ctx.translate(0, -by);
  const sleepK = P.sleep ? 0.85 : 1;
  const body = ellipsePath(0, by + (P.sleep ? 6 : 0), bw, bh * sleepK);
  cel(ctx, body, { x: -bw, y: by - bh, w: bw * 2, h: bh * 2 }, sp.base, sp.shade, sp.light, { texture: 0.4, seed: 3 });
  if (sp.belly) { ctx.save(); ctx.clip(body); ctx.fillStyle = sp.belly; ctx.beginPath(); ctx.ellipse(bw * 0.3, by + bh * 0.25, bw * 0.62, bh * 0.85, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  // wing
  const flap = P.mood === 'happy' ? -0.7 : P.mood === 'worried' ? -0.3 : 0;
  ctx.save(); ctx.translate(-bw * 0.25, by + bh * 0.05); ctx.rotate(flap);
  const wing = ellipsePath(-4, 4, bw * 0.38, bh * 0.45, 0.5);
  cel(ctx, wing, { x: -4 - bw * 0.4, y: 4 - bh * 0.45, w: bw * 0.8, h: bh * 0.9 }, sp.base, sp.shade, null, { outline: OUTW * 0.8 });
  ctx.restore();
  ctx.restore();
  // head for duckling
  let hx = bw * 0.35, hy = by - bh * 0.25, hr = bw * 0.72;
  if (sp.headR) {
    hx = bw * 0.45; hy = by - bh * 0.8; hr = sp.headR;
    const head = ellipsePath(hx, hy, hr, hr * 0.95);
    cel(ctx, head, { x: hx - hr, y: hy - hr, w: hr * 2, h: hr * 2 }, sp.base, sp.shade, sp.light);
    const tuft = smoothPath([[hx - 3, hy - hr + 2], [hx - 1, hy - hr - 9], [hx + 4, hy - hr - 6], [hx + 3, hy - hr + 2]], true, 0.8);
    cel(ctx, tuft, { x: hx - 4, y: hy - hr - 9, w: 9, h: 11 }, sp.base, sp.shade, null, { outline: OUTW * 0.75 });
  }
  if (sp.mark === 'tuft') for (const a of [-0.4, 0, 0.4]) {
    ctx.save(); ctx.translate(hx - 2, by - bh + 2); ctx.rotate(a);
    const f = ellipsePath(0, -6, 3, 7); cel(ctx, f, { x: -3, y: -13, w: 6, h: 14 }, sp.base, sp.shade, null, { outline: OUTW * 0.7 }); ctx.restore();
  }
  // beak
  const bx = hx + hr * 0.72, byk = hy + hr * 0.22;
  if (sp.beak === 'bill') {
    const b = smoothPath([[bx - 6, byk - 4], [bx + 9, byk - 3], [bx + 11, byk + 2], [bx - 4, byk + 5]], true, 0.6);
    cel(ctx, b, { x: bx - 6, y: byk - 4, w: 17, h: 9 }, sp.nose, darken(sp.nose, 0.2), null, { outline: OUTW * 0.8 });
  } else {
    const b = new Path2D(); b.moveTo(bx - 4, byk - 4); b.lineTo(bx + 7, byk); b.lineTo(bx - 4, byk + 4); b.closePath();
    cel(ctx, b, { x: bx - 4, y: byk - 4, w: 11, h: 8 }, sp.nose, darken(sp.nose, 0.2), null, { outline: OUTW * 0.75 });
  }
  const er = Math.max(4, hr * 0.24);
  if (P.sleep) { eye(ctx, hx - hr * 0.05, hy - hr * 0.05, er, 'sleep'); eye(ctx, hx + hr * 0.42, hy - hr * 0.08, er, 'sleep'); }
  else { eye(ctx, hx - hr * 0.05, hy - hr * 0.08, er, P.mood, 0.45, 0, 1); eye(ctx, hx + hr * 0.42, hy - hr * 0.1, er * 0.95, P.mood, 0.45, 0, 1); }
  blush(ctx, hx - hr * 0.2, hy + hr * 0.32, hr * 0.14, 0.55);
  if (P.mood === 'happy' && !P.sleep) mouth(ctx, bx + 1, byk + 6, 6, 'open', false);
  void name;
}

function drawFrog(ctx: Ctx, sp: Sp, P: Pose) {
  ctx.translate(0, P.bob - P.jump);
  const bw = sp.bodyW, bh = sp.bodyH; const by = -bh - 4;
  ctx.save(); ctx.translate(0, by); ctx.scale(1 / Math.sqrt(P.squash), P.squash); ctx.translate(0, -by);
  // back legs
  for (const s of [-1, 1]) { const l = ellipsePath(s * bw * 0.7, -8, 11, 8); cel(ctx, l, { x: s * bw * 0.7 - 11, y: -16, w: 22, h: 16 }, s < 0 ? darken(sp.base, 0.12) : sp.base, sp.shade, null, { outline: OUTW * 0.8 }); }
  const body = ellipsePath(0, by, bw, bh);
  cel(ctx, body, { x: -bw, y: by - bh, w: bw * 2, h: bh * 2 }, sp.base, sp.shade, sp.light, { texture: 0.3, seed: 8 });
  ctx.save(); ctx.clip(body); ctx.fillStyle = sp.belly!; ctx.beginPath(); ctx.ellipse(0, by + bh * 0.7, bw * 0.7, bh * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.restore();
  for (const [x, far] of [[-bw * 0.35, true], [bw * 0.35, false]] as [number, boolean][]) {
    const bump = ellipsePath(x, by - bh * 0.8, 11, 10);
    cel(ctx, bump, { x: x - 11, y: by - bh * 0.8 - 10, w: 22, h: 20 }, far ? darken(sp.base, 0.08) : sp.base, sp.shade, sp.light, { outline: OUTW * 0.85 });
    if (P.sleep) eye(ctx, x, by - bh * 0.8, 6.5, 'sleep'); else eye(ctx, x, by - bh * 0.82, 7, P.mood, 0.3, 0, 1);
  }
  blush(ctx, -bw * 0.6, by + 2, 5, 0.5); blush(ctx, bw * 0.6, by + 2, 5, 0.5);
  mouth(ctx, 0, by + 2, 16, P.mood === 'happy' ? 'open' : P.mood === 'worried' ? 'wavy' : 'smile');
  for (const s of [-1, 1]) { const f = ellipsePath(s * bw * 0.45, -4, 7, 4); cel(ctx, f, { x: s * bw * 0.45 - 7, y: -8, w: 14, h: 8 }, sp.base, sp.shade, null, { outline: OUTW * 0.75 }); }
}

function drawTurtle(ctx: Ctx, sp: Sp, P: Pose) {
  ctx.translate(0, P.bob - P.jump);
  const bw = sp.bodyW, bh = sp.bodyH; const by = -bh * 0.8 - 8;
  const sw = P.swing * 0.6;
  for (const [x, s, far] of [[-bw * 0.6, -1, true], [bw * 0.5, 1, true]] as [number, number, boolean][]) legShape(ctx, x, by + 6, 8, s * sw, sp.base, sp.shade, far);
  // head
  const hx = bw + 4, hy = by - 2 + (P.sleep ? 8 : 0);
  if (!P.sleep) {
    const head = ellipsePath(hx, hy, sp.headR, sp.headR * 0.9);
    cel(ctx, head, { x: hx - sp.headR, y: hy - sp.headR, w: sp.headR * 2, h: sp.headR * 2 }, sp.base, sp.shade, sp.light);
    eye(ctx, hx + 1, hy - 3, 4.6, P.mood, 0.5, 0, 1); eye(ctx, hx + 8, hy - 3.5, 4.2, P.mood, 0.5, 0, 1);
    blush(ctx, hx + 9, hy + 4, 3.5, 0.5);
    mouth(ctx, hx + 6, hy + 4, 7, P.mood === 'happy' ? 'open' : 'smile', false);
  }
  const shell = new Path2D(); shell.moveTo(-bw * 1.05, by + bh * 0.35); shell.bezierCurveTo(-bw * 1.05, by - bh * 1.25, bw * 1.05, by - bh * 1.25, bw * 1.05, by + bh * 0.35); shell.closePath();
  cel(ctx, shell, { x: -bw * 1.05, y: by - bh, w: bw * 2.1, h: bh * 1.35 }, '#5fae4a', '#3f8a34', '#8fd06a', { gloss: true });
  ctx.save(); ctx.clip(shell); ctx.strokeStyle = 'rgba(40,90,30,0.7)'; ctx.lineWidth = 2.4;
  for (const [x, y] of [[-bw * 0.45, by - bh * 0.35], [bw * 0.1, by - bh * 0.55], [bw * 0.55, by - bh * 0.2], [-bw * 0.1, by]]) { ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; const px = x + Math.cos(a) * 9, py = y + Math.sin(a) * 7; if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.closePath(); ctx.stroke(); }
  ctx.restore();
  const rim = rrectPath(-bw * 1.08, by + bh * 0.22, bw * 2.16, 7, 3.5); cel(ctx, rim, { x: -bw * 1.08, y: by + bh * 0.22, w: bw * 2.16, h: 7 }, '#e8d78a', '#c9b45e', null, { outline: OUTW * 0.75 });
  if (!P.sleep) for (const [x, s] of [[-bw * 0.45, 1], [bw * 0.65, -1]] as [number, number][]) legShape(ctx, x, by + bh * 0.4, 7, s * sw, sp.base, sp.shade, false);
}

export function drawAnimal(ctx: Ctx, name: string, pose: Partial<Pose>) {
  const sp = SPECIES[name]; const P = { ...P0, ...pose };
  ctx.save();
  if (sp.plan === 'quad') drawQuad(ctx, sp, P);
  else if (sp.plan === 'bird') drawBird(ctx, sp, P, name);
  else if (sp.plan === 'frog') drawFrog(ctx, sp, P);
  else drawTurtle(ctx, sp, P);
  ctx.restore();
}

export function register() {
  const W = 130, H = 130, AX = 62, AY = 118;
  for (const name of Object.keys(SPECIES)) {
    const at = (pose: Partial<Pose>) => (ctx: Ctx) => { ctx.translate(AX, AY); drawAnimal(ctx, name, pose); };
    for (let i = 0; i < 4; i++) {
      const ph = (i / 4) * Math.PI * 2;
      sprite(`a_${name}_walk_${i}`, W, H, AX, AY, at({ swing: Math.sin(ph) * 6, bob: -Math.abs(Math.cos(ph)) * 2.5, wag: Math.sin(ph) * 0.3, earUp: 0.2 }));
    }
    sprite(`a_${name}_idle_0`, W, H, AX, AY, at({}));
    sprite(`a_${name}_idle_1`, W, H, AX, AY, at({ squash: 1.02, mood: 'sleep', wag: 0.2 }));
    for (let i = 0; i < 3; i++) {
      sprite(`a_${name}_happy_${i}`, W, H, AX, AY, at({ jump: [0, 12, 18][i], squash: [0.9, 1.08, 1.0][i], mood: 'happy', mouth: 'open', earUp: 1, wag: [0.4, -0.4, 0.3][i], swing: [0, 3, -3][i] }));
    }
    for (let i = 0; i < 2; i++) sprite(`a_${name}_sleep_${i}`, W, H, AX, AY, at({ sleep: true, squash: i ? 1.03 : 1 }));
    for (let i = 0; i < 2; i++) sprite(`a_${name}_trapped_${i}`, W, H, AX, AY, at({ sit: true, mood: 'worried', mouth: 'o', head: i ? -2 : 0, swing: i ? 2 : -2, wag: i ? 0.2 : -0.2 }));
    // UI portrait (head and shoulders, happy)
    sprite(`p_${name}`, 120, 120, 60, 60, (ctx) => {
      ctx.translate(58, 112); ctx.scale(1.05, 1.05);
      drawAnimal(ctx, name, { mood: 'happy', mouth: 'smile', earUp: 0.5 });
    });
  }
  // silhouettes for friends not met yet (same pose as the portrait)
  for (const name of Object.keys(SPECIES)) {
    sprite(`sil_${name}`, 120, 120, 60, 60, (ctx) => {
      ctx.save(); ctx.translate(58, 112); ctx.scale(1.05, 1.05);
      drawAnimal(ctx, name, { mood: 'normal', mouth: 'smile' }); ctx.restore();
      ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = '#6b5a7e'; ctx.fillRect(0, 0, 120, 120);
      ctx.globalCompositeOperation = 'source-over';
    });
  }
  void ARng; void gloss; void lighten;
}
