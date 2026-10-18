// The rescuer kid, the water-gun tiers and the backpack tanks.
import { sprite, point } from './atlas';
import { PAL, OUT, OUTW, GOO, cel, ellipsePath, rrectPath, smoothPath, eye, mouth, blush, gloss, dropPath, type Ctx, type Mood } from './kit';

interface Pose {
  bob: number; lean: number; legF: number; legB: number; liftF: number; liftB: number;
  mood: Mood; mouth: Parameters<typeof mouth>[4]; squash: number; sit?: boolean; gooed?: boolean; blink?: boolean; jump?: number; arms?: boolean;
}

const BASE: Pose = { bob: 0, lean: 0, legF: 0, legB: 0, liftF: 0, liftB: 0, mood: 'normal', mouth: 'smile', squash: 1 };

function leg(ctx: Ctx, x: number, footX: number, lift: number, far: boolean) {
  const top = -34, bottom = -6 - lift;
  const c = far ? '#d48a1c' : PAL.coatDark;
  const p = new Path2D();
  p.moveTo(x - 6, top); p.lineTo(x + 6, top); p.lineTo(footX + 6, bottom); p.lineTo(footX - 6, bottom); p.closePath();
  cel(ctx, p, { x: x - 8, y: top, w: 16, h: bottom - top }, far ? '#2f5fae' : '#3a6fc4', '#25498a', null, { outline: OUTW * 0.8 });
  void c;
  // boot
  const b = new Path2D();
  b.moveTo(footX - 8, bottom - 6); b.quadraticCurveTo(footX - 9, bottom + 6, footX, bottom + 6);
  b.lineTo(footX + 12, bottom + 6); b.quadraticCurveTo(footX + 15, bottom + 1, footX + 9, bottom - 4); b.lineTo(footX + 7, bottom - 7); b.closePath();
  cel(ctx, b, { x: footX - 9, y: bottom - 7, w: 24, h: 14 }, far ? '#1f7fd6' : '#2a96f0', '#1a5fae', '#7fc8ff', { outline: OUTW * 0.8 });
}

export function drawKid(ctx: Ctx, pose: Partial<Pose>) {
  const P = { ...BASE, ...pose };
  ctx.save();
  if (P.sit) {
    drawKidSitting(ctx, P);
    ctx.restore(); return;
  }
  ctx.translate(0, -(P.jump ?? 0));
  // legs
  leg(ctx, -7, -7 + P.legB, P.liftB, true);
  leg(ctx, 6, 6 + P.legF, P.liftF, false);
  ctx.translate(0, P.bob);
  ctx.rotate(P.lean);
  ctx.scale(1 / Math.sqrt(P.squash), P.squash);
  // coat
  const coat = new Path2D();
  coat.moveTo(-17, -62); coat.quadraticCurveTo(-26, -40, -25, -27); coat.quadraticCurveTo(-24, -21, -16, -21);
  coat.lineTo(17, -21); coat.quadraticCurveTo(25, -21, 25, -27); coat.quadraticCurveTo(25, -42, 17, -62); coat.closePath();
  cel(ctx, coat, { x: -26, y: -64, w: 52, h: 44 }, PAL.coat, PAL.coatDark, PAL.coatLight, { texture: 0.5, seed: 4 });
  // coat details: placket, buttons, pocket
  ctx.save(); ctx.strokeStyle = 'rgba(160,90,10,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6, -58); ctx.lineTo(7, -23); ctx.stroke(); ctx.restore();
  for (const by of [-50, -38]) { ctx.save(); ctx.fillStyle = '#2a96f0'; ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(11, by, 2.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // reflective stripe
  ctx.save(); ctx.clip(coat); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(-30, -33, 60, 4); ctx.fillStyle = 'rgba(120,200,255,0.8)'; ctx.fillRect(-30, -29, 60, 2); ctx.restore();
  // head
  const hx = 3, hy = -86, hr = 29;
  const head = ellipsePath(hx, hy, hr, hr * 0.96);
  cel(ctx, head, { x: hx - hr, y: hy - hr, w: hr * 2, h: hr * 2 }, PAL.skin, PAL.skinDark, '#fff0dc', { so: [-5, -6] });
  // ear
  const ear = ellipsePath(hx - 15, hy + 2, 6, 7.5);
  cel(ctx, ear, { x: hx - 21, y: hy - 6, w: 12, h: 15 }, PAL.skin, PAL.skinDark, null, { outline: OUTW * 0.8 });
  // hair bangs under helmet
  const hair = new Path2D();
  hair.moveTo(hx - 27, hy - 4); hair.quadraticCurveTo(hx - 22, hy - 22, hx, hy - 24); hair.quadraticCurveTo(hx + 24, hy - 24, hx + 29, hy - 6);
  hair.quadraticCurveTo(hx + 22, hy - 12, hx + 18, hy - 8); hair.quadraticCurveTo(hx + 14, hy - 14, hx + 8, hy - 9); hair.quadraticCurveTo(hx + 2, hy - 15, hx - 6, hy - 9);
  hair.quadraticCurveTo(hx - 14, hy - 12, hx - 20, hy - 2); hair.closePath();
  cel(ctx, hair, { x: hx - 28, y: hy - 25, w: 58, h: 24 }, PAL.hair, '#55301a', '#a06a3e', { outline: OUTW * 0.8 });
  // helmet
  const hel = new Path2D();
  hel.moveTo(hx - 30, hy - 8); hel.bezierCurveTo(hx - 32, hy - 44, hx + 30, hy - 46, hx + 31, hy - 10);
  hel.quadraticCurveTo(hx + 44, hy - 8, hx + 46, hy - 3); hel.quadraticCurveTo(hx + 30, hy - 1, hx + 18, hy - 12);
  hel.quadraticCurveTo(hx, hy - 18, hx - 30, hy - 8); hel.closePath();
  cel(ctx, hel, { x: hx - 32, y: hy - 46, w: 78, h: 46 }, PAL.blue, PAL.blueDark, PAL.blueLight, { so: [-8, -7], gloss: true });
  // helmet emblem: water drop
  const em = dropPath(hx + 4, hy - 26, 6);
  ctx.save(); ctx.fillStyle = '#ffffff'; ctx.fill(em); ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.stroke(em); ctx.restore();
  // face
  const look = 0.5;
  const ey = hy + 2;
  if (P.blink && P.mood === 'normal') { eye(ctx, hx + 8, ey, 6, 'sleep'); eye(ctx, hx + 22, ey, 6, 'sleep'); }
  else { eye(ctx, hx + 7, ey, 6.2, P.mood, look, 0, 1); eye(ctx, hx + 22, ey, 6.2, P.mood, look, 0, 1); }
  blush(ctx, hx + 27, hy + 12, 5); blush(ctx, hx - 1, hy + 12, 5);
  mouth(ctx, hx + 16, hy + 15, 11, P.mouth);
  if (P.gooed) gooSplat(ctx, hx - 6, hy - 18);
  // arms up (victory), drawn in front so the cheer reads clearly
  if (P.arms) {
    for (const sd of [-1, 1]) {
      const a = new Path2D(); a.moveTo(sd * 12, -58); a.quadraticCurveTo(sd * 36, -70, sd * 40, -100); a.lineTo(sd * 31, -103); a.quadraticCurveTo(sd * 27, -76, sd * 6, -64); a.closePath();
      cel(ctx, a, { x: sd > 0 ? 6 : -40, y: -104, w: 34, h: 48 }, PAL.coat, PAL.coatDark, PAL.coatLight, { outline: OUTW * 0.9 });
      const hd = ellipsePath(sd * 36, -106, 7.5, 7.5);
      cel(ctx, hd, { x: sd * 36 - 8, y: -114, w: 16, h: 16 }, '#2a96f0', '#1a5fae', '#7fc8ff', { outline: OUTW * 0.8 });
    }
  }
  ctx.restore();
}

function gooSplat(ctx: Ctx, x: number, y: number) {
  const g = GOO.violet;
  const p = smoothPath([[x - 18, y], [x - 10, y - 12], [x + 4, y - 14], [x + 18, y - 6], [x + 20, y + 6], [x + 12, y + 10], [x + 10, y + 22], [x + 4, y + 12], [x - 6, y + 14], [x - 10, y + 26], [x - 14, y + 10]], true, 0.8);
  cel(ctx, p, { x: x - 20, y: y - 14, w: 40, h: 40 }, g[0], g[1], g[2], { gloss: true, outline: OUTW * 0.9 });
}

function drawKidSitting(ctx: Ctx, P: Pose) {
  // sitting on the ground covered in goo, sad but cute
  const g = GOO.violet;
  ctx.translate(0, P.bob);
  // legs forward
  for (const [x, far] of [[-2, true], [10, false]] as [number, boolean][]) {
    const b = new Path2D(); b.moveTo(x - 4, -16); b.lineTo(x + 16, -12); b.lineTo(x + 16, -2); b.lineTo(x - 4, -4); b.closePath();
    cel(ctx, b, { x: x - 4, y: -16, w: 20, h: 14 }, far ? '#2f5fae' : '#3a6fc4', '#25498a', null, { outline: OUTW * 0.8 });
    const boot = rrectPath(x + 12, -14, 12, 14, 5);
    cel(ctx, boot, { x: x + 12, y: -14, w: 12, h: 14 }, '#2a96f0', '#1a5fae', '#7fc8ff', { outline: OUTW * 0.8 });
  }
  const coat = new Path2D();
  coat.moveTo(-16, -50); coat.quadraticCurveTo(-26, -24, -22, -8); coat.lineTo(20, -8); coat.quadraticCurveTo(24, -28, 16, -50); coat.closePath();
  cel(ctx, coat, { x: -26, y: -52, w: 50, h: 44 }, PAL.coat, PAL.coatDark, PAL.coatLight, { texture: 0.5, seed: 4 });
  const hx = 2, hy = -74, hr = 28;
  const head = ellipsePath(hx, hy, hr, hr * 0.96);
  cel(ctx, head, { x: hx - hr, y: hy - hr, w: hr * 2, h: hr * 2 }, PAL.skin, PAL.skinDark, '#fff0dc', { so: [-5, -6] });
  const hel = new Path2D();
  hel.moveTo(hx - 29, hy - 8); hel.bezierCurveTo(hx - 31, hy - 43, hx + 29, hy - 45, hx + 30, hy - 10);
  hel.quadraticCurveTo(hx + 42, hy - 8, hx + 44, hy - 3); hel.quadraticCurveTo(hx + 28, hy - 1, hx + 17, hy - 12);
  hel.quadraticCurveTo(hx, hy - 18, hx - 29, hy - 8); hel.closePath();
  cel(ctx, hel, { x: hx - 31, y: hy - 45, w: 76, h: 45 }, PAL.blue, PAL.blueDark, PAL.blueLight, { so: [-8, -7], gloss: true });
  eye(ctx, hx + 6, hy + 3, 6, 'sad'); eye(ctx, hx + 21, hy + 3, 6, 'sad');
  mouth(ctx, hx + 14, hy + 16, 10, 'wavy');
  // a goo blob dripping from the helmet and a puddle around: messy but cute
  const blob = smoothPath([[-4, -104], [6, -114], [20, -112], [30, -100], [28, -90], [24, -84], [22, -72], [17, -82], [10, -84], [6, -74], [2, -86], [-6, -94]], true, 0.7);
  cel(ctx, blob, { x: -8, y: -116, w: 40, h: 44 }, g[0], g[1], g[2], { gloss: true, outline: OUTW * 0.9 });
  ctx.save(); ctx.globalAlpha = 0.85;
  const pud = smoothPath([[-40, -4], [-30, -14], [-6, -12], [16, -16], [40, -8], [44, 2], [20, 8], [-10, 6], [-36, 6]], true, 0.8);
  cel(ctx, pud, { x: -44, y: -16, w: 88, h: 24 }, g[0], g[1], g[2], { gloss: true, outline: OUTW * 0.8 });
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- guns
// Each gun points right; the frame anchor is the hand. 'muzzle' point is the nozzle tip.
type GunDraw = (ctx: Ctx) => [number, number];

function hand(ctx: Ctx, x: number, y: number) {
  const h = ellipsePath(x, y, 7.5, 7);
  cel(ctx, h, { x: x - 8, y: y - 7, w: 16, h: 14 }, '#2a96f0', '#1a5fae', '#7fc8ff', { outline: OUTW * 0.8 });
}

const GUNS: GunDraw[] = [
  // 0 tiny squirt pistol
  (ctx) => {
    const body = rrectPath(-4, -9, 34, 14, 6);
    cel(ctx, body, { x: -4, y: -9, w: 34, h: 14 }, '#ff8a3d', '#d45f1f', '#ffc38f');
    const tank = ellipsePath(10, -14, 9, 7);
    cel(ctx, tank, { x: 1, y: -21, w: 18, h: 14 }, '#6fd6ff', '#2a9fd8', '#c8f2ff', { gloss: true });
    const noz = rrectPath(28, -6, 10, 8, 3); cel(ctx, noz, { x: 28, y: -6, w: 10, h: 8 }, '#ffd34d', '#d9a020', null, { outline: OUTW * 0.8 });
    const grip = rrectPath(-2, 0, 10, 14, 4); cel(ctx, grip, { x: -2, y: 0, w: 10, h: 14 }, '#ff8a3d', '#d45f1f', null);
    hand(ctx, 2, 4);
    return [39, -2];
  },
  // 1 pump blaster
  (ctx) => {
    const body = rrectPath(-6, -11, 50, 16, 7);
    cel(ctx, body, { x: -6, y: -11, w: 50, h: 16 }, '#3cc2a4', '#22867a', '#a5ecd9');
    const pump = rrectPath(16, 3, 20, 9, 4); cel(ctx, pump, { x: 16, y: 3, w: 20, h: 9 }, '#ffcf3d', '#d9951f', null);
    const tank = ellipsePath(14, -17, 13, 8);
    cel(ctx, tank, { x: 1, y: -25, w: 26, h: 16 }, '#6fd6ff', '#2a9fd8', '#c8f2ff', { gloss: true });
    const noz = rrectPath(42, -8, 12, 10, 3); cel(ctx, noz, { x: 42, y: -8, w: 12, h: 10 }, '#ff8a3d', '#d45f1f', null, { outline: OUTW * 0.8 });
    const grip = rrectPath(-3, 0, 11, 15, 4); cel(ctx, grip, { x: -3, y: 0, w: 11, h: 15 }, '#22867a', '#145a52', null);
    hand(ctx, 2, 5);
    return [55, -3];
  },
  // 2 twin blaster
  (ctx) => {
    for (const oy of [-12, 0]) {
      const br = rrectPath(18, oy - 5, 38, 10, 4); cel(ctx, br, { x: 18, y: oy - 5, w: 38, h: 10 }, '#ffcf3d', '#d9951f', '#fff09a', { outline: OUTW * 0.85 });
    }
    const body = rrectPath(-6, -16, 32, 24, 8);
    cel(ctx, body, { x: -6, y: -16, w: 32, h: 24 }, '#ff6f61', '#c94a40', '#ffb3aa');
    const tank = ellipsePath(10, -22, 14, 9);
    cel(ctx, tank, { x: -4, y: -31, w: 28, h: 18 }, '#6fd6ff', '#2a9fd8', '#c8f2ff', { gloss: true });
    hand(ctx, 2, 6);
    return [57, -6];
  },
  // 3 tank blaster (hose to the backpack)
  (ctx) => {
    ctx.save(); ctx.strokeStyle = OUT; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-2, 8); ctx.quadraticCurveTo(-18, 18, -30, 4); ctx.stroke();
    ctx.strokeStyle = '#3a6fc4'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
    const body = rrectPath(-8, -14, 60, 22, 9);
    cel(ctx, body, { x: -8, y: -14, w: 60, h: 22 }, '#4a8df0', '#2d5fb8', '#a8ccff');
    const band = rrectPath(30, -16, 7, 26, 2); cel(ctx, band, { x: 30, y: -16, w: 7, h: 26 }, '#ffcf3d', '#d9951f', null, { outline: OUTW * 0.7 });
    const noz = ellipsePath(58, -3, 9, 10); cel(ctx, noz, { x: 49, y: -13, w: 18, h: 20 }, '#ffcf3d', '#d9951f', '#fff09a');
    const glass = rrectPath(4, -10, 20, 9, 4); cel(ctx, glass, { x: 4, y: -10, w: 20, h: 9 }, '#8fe4ff', '#3ab0e0', '#e0f8ff', { outline: OUTW * 0.7, gloss: true });
    hand(ctx, 2, 6);
    return [66, -3];
  },
  // 4 fire hose nozzle
  (ctx) => {
    ctx.save(); ctx.strokeStyle = OUT; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 6); ctx.quadraticCurveTo(-20, 22, -36, 2); ctx.stroke();
    ctx.strokeStyle = '#e8463c'; ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
    const hose = rrectPath(-6, -10, 36, 18, 8); cel(ctx, hose, { x: -6, y: -10, w: 36, h: 18 }, '#e8463c', '#b02e28', '#ff9a90');
    const noz = new Path2D(); noz.moveTo(26, -12); noz.lineTo(66, -8); noz.lineTo(70, -12); noz.lineTo(74, -12); noz.lineTo(74, 8); noz.lineTo(70, 8); noz.lineTo(66, 4); noz.lineTo(26, 8); noz.closePath();
    cel(ctx, noz, { x: 26, y: -12, w: 48, h: 20 }, '#ffcf3d', '#c9861a', '#fff09a', { gloss: true });
    const lever = rrectPath(34, -20, 16, 8, 3); cel(ctx, lever, { x: 34, y: -20, w: 16, h: 8 }, '#7d8a96', '#4f5a66', null, { outline: OUTW * 0.7 });
    hand(ctx, 4, 4);
    return [75, -2];
  },
  // 5 water cannon
  (ctx) => {
    const body = rrectPath(-14, -20, 80, 32, 13);
    cel(ctx, body, { x: -14, y: -20, w: 80, h: 32 }, '#3d7fe0', '#2554a8', '#9cc4ff', { texture: 0.4, seed: 9 });
    for (const bx of [8, 40]) { const band = rrectPath(bx, -22, 8, 36, 3); cel(ctx, band, { x: bx, y: -22, w: 8, h: 36 }, '#ffcf3d', '#d9951f', '#fff09a', { outline: OUTW * 0.75 }); }
    const mouthP = ellipsePath(68, -4, 12, 18); cel(ctx, mouthP, { x: 56, y: -22, w: 24, h: 36 }, '#ffcf3d', '#d9951f', '#fff09a');
    const core = ellipsePath(70, -4, 6, 11); ctx.save(); ctx.fillStyle = '#bff0ff'; ctx.fill(core); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke(core); ctx.restore();
    const glass = rrectPath(16, -15, 20, 10, 4); cel(ctx, glass, { x: 16, y: -15, w: 20, h: 10 }, '#8fe4ff', '#3ab0e0', '#e0f8ff', { outline: OUTW * 0.7, gloss: true });
    hand(ctx, 0, 8);
    return [80, -4];
  },
  // 6 mega cannon
  (ctx) => {
    const body = rrectPath(-22, -28, 110, 44, 18);
    cel(ctx, body, { x: -22, y: -28, w: 110, h: 44 }, '#2f6fd8', '#1c4796', '#8fbcff', { texture: 0.5, seed: 11 });
    for (const bx of [0, 30, 60]) { const band = rrectPath(bx, -31, 9, 50, 3); cel(ctx, band, { x: bx, y: -31, w: 9, h: 50 }, '#ffcf3d', '#d9951f', '#fff09a', { outline: OUTW * 0.75 }); }
    const mouthP = ellipsePath(92, -6, 16, 26); cel(ctx, mouthP, { x: 76, y: -32, w: 32, h: 52 }, '#ffcf3d', '#d9951f', '#fff09a');
    const core = ellipsePath(95, -6, 9, 17); ctx.save(); ctx.fillStyle = '#c8f6ff'; ctx.fill(core); ctx.strokeStyle = OUT; ctx.lineWidth = 2.2; ctx.stroke(core); ctx.restore();
    const glass = rrectPath(-6, -22, 64, 12, 6); cel(ctx, glass, { x: -6, y: -22, w: 64, h: 12 }, '#8fe4ff', '#3ab0e0', '#e0f8ff', { outline: OUTW * 0.7, gloss: true });
    // little water drop emblem
    const em = dropPath(20, 2, 6); ctx.save(); ctx.fillStyle = '#fff'; ctx.fill(em); ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.stroke(em); ctx.restore();
    hand(ctx, -4, 10);
    return [106, -6];
  },
];

const PACKS: ((ctx: Ctx) => void)[] = [
  // small canteen
  (ctx) => { const p = rrectPath(-11, -14, 20, 26, 8); cel(ctx, p, { x: -11, y: -14, w: 20, h: 26 }, '#3cc2a4', '#22867a', '#a5ecd9', { gloss: true }); },
  // tank
  (ctx) => { const p = rrectPath(-15, -22, 26, 40, 11); cel(ctx, p, { x: -15, y: -22, w: 26, h: 40 }, '#6fd6ff', '#2a9fd8', '#c8f2ff', { gloss: true });
    const cap = rrectPath(-8, -28, 12, 8, 3); cel(ctx, cap, { x: -8, y: -28, w: 12, h: 8 }, '#ffcf3d', '#d9951f', null, { outline: OUTW * 0.7 }); },
  // double tank
  (ctx) => { for (const ox of [-20, -6]) { const p = rrectPath(ox, -26, 18, 46, 9); cel(ctx, p, { x: ox, y: -26, w: 18, h: 46 }, '#6fd6ff', '#2a9fd8', '#c8f2ff', { gloss: true }); }
    const band = rrectPath(-22, -2, 38, 7, 3); cel(ctx, band, { x: -22, y: -2, w: 38, h: 7 }, '#ffcf3d', '#d9951f', null, { outline: OUTW * 0.7 }); },
];

export function registerChars() {
  const W = 156, H = 194, AX = 75, AY = 172;
  const at = (fn: (c: Ctx) => void) => (ctx: Ctx) => { ctx.translate(AX, AY); fn(ctx); };
  // idle
  for (let i = 0; i < 4; i++) {
    const bob = [0, -1, -2, -1][i];
    sprite(`kid_idle_${i}`, W, H, AX, AY, at((c) => drawKid(c, { bob, squash: 1 + [0, 0.01, 0.02, 0.01][i], blink: i === 3 })));
  }
  // run: 6 frames
  for (let i = 0; i < 6; i++) {
    const ph = (i / 6) * Math.PI * 2;
    const s = Math.sin(ph);
    sprite(`kid_run_${i}`, W, H, AX, AY, at((c) => drawKid(c, {
      bob: -Math.abs(Math.cos(ph)) * 4, lean: 0.08, legF: s * 9, legB: -s * 9,
      liftF: Math.max(0, Math.cos(ph)) * 5, liftB: Math.max(0, -Math.cos(ph)) * 5, mouth: 'smile',
    })));
  }
  // shoot: planted, determined
  for (let i = 0; i < 2; i++) sprite(`kid_shoot_${i}`, W, H, AX, AY, at((c) => drawKid(c, { bob: i ? 1 : 0, legF: 5, legB: -6, mood: 'determined', mouth: i ? 'grin' : 'open', squash: i ? 0.98 : 1 })));
  sprite('kid_hurt_0', W, H, AX, AY, at((c) => drawKid(c, { bob: 2, lean: -0.12, legF: -3, legB: 4, mood: 'hurt', mouth: 'wavy', gooed: true, squash: 0.94 })));
  for (let i = 0; i < 4; i++) {
    const j = [0, 10, 16, 8][i];
    sprite(`kid_win_${i}`, W, H, AX, AY, at((c) => drawKid(c, { jump: j, mood: 'happy', mouth: 'grin', arms: true, legF: i ? 4 : 0, legB: i ? -4 : 0, liftF: i ? 4 : 0, liftB: i ? 4 : 0, squash: i === 0 ? 0.93 : 1.03 })));
  }
  for (let i = 0; i < 2; i++) sprite(`kid_sad_${i}`, W, H, AX, AY, at((c) => drawKid(c, { sit: true, bob: i ? 1 : 0 })));

  // guns: anchor at the hand
  GUNS.forEach((g, i) => {
    const w = [74, 94, 100, 140, 156, 140, 176][i], h = [60, 68, 74, 78, 82, 92, 112][i];
    const ax = [28, 30, 32, 58, 66, 40, 50][i], ay = h / 2 + 2;
    let muzzle: [number, number] = [0, 0];
    sprite(`gun_${i}`, w, h, ax, ay, (ctx) => { ctx.translate(ax, ay); muzzle = g(ctx); point(`gun_${i}`, 'muzzle', muzzle[0], muzzle[1]); });
  });
  PACKS.forEach((p, i) => sprite(`pack_${i}`, 60, 70, 30, 40, (ctx) => { ctx.translate(30, 40); p(ctx); }));
}

export { gloss };
