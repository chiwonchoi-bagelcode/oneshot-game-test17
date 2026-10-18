// Store art composed from the game's own atlas (same sprites, same stream and
// goo look as in play), rendered in headless Chromium by tools/release-art.mjs.
import { loadAtlases, draw, point } from '../../src/engine/atlas';

type C = CanvasRenderingContext2D;

function canvas(w: number, h: number): [HTMLCanvasElement, C] {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d')!; x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  return [c, x];
}

let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const range = (a: number, b: number) => a + (b - a) * rnd();

// grass + a dirt path band, tiled like a room (48 world units per tile)
function ground(ctx: C, w: number, h: number, pathRow?: (c: number) => number) {
  const T = 48; const cols = Math.ceil(w / T) + 1, rows = Math.ceil(h / T) + 1;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = Math.floor(rnd() * 10);
    drawTile(ctx, `g_${v < 4 ? 0 : v < 7 ? 1 : v < 9 ? 2 : 3}`, c * T, r * T, T);
  }
  if (!pathRow) return;
  const isPath = (c: number, r: number) => { const pr = pathRow(c); return r === pr || r === pr + 1; };
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
    let m = 0;
    if (isPath(i - 1, j - 1)) m |= 1; if (isPath(i, j - 1)) m |= 2; if (isPath(i - 1, j)) m |= 4; if (isPath(i, j)) m |= 8;
    if (m) drawTile(ctx, `t_path_${m}`, (i - 0.5) * T, (j - 0.5) * T, T);
  }
}
function drawTile(ctx: C, name: string, x: number, y: number, T: number) {
  // tiles are drawn edge-to-edge, not by anchor
  ctx.save(); ctx.translate(x, y); ctx.scale(T / 96 * 2, T / 96 * 2); draw(ctx, name, 0, 0, 1); ctx.restore();
}

// goo puddles with the in-game rim + gloss treatment
function goo(ctx: C, blobs: [number, number, number][], w: number, h: number) {
  const [mc, m] = canvas(w, h); m.fillStyle = '#fff';
  for (const [x, y, rad] of blobs) {
    const n = 40, ph = range(0, 6.3), ph2 = range(0, 6.3);
    m.beginPath();
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; const k = 1 + 0.1 * Math.sin(a * 3 + ph) + 0.06 * Math.sin(a * 5 + ph2); const px = x + Math.cos(a) * rad * k, py = y + Math.sin(a) * rad * k * 0.92; if (i) m.lineTo(px, py); else m.moveTo(px, py); }
    m.closePath(); m.fill();
  }
  const tint = (col: string) => { const [c, x] = canvas(w, h); x.drawImage(mc, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, w, h); return c; };
  const [gc, g] = canvas(w, h);
  g.drawImage(tint('#e9d8ff'), 0, -3); g.drawImage(tint('#6e3fae'), 0, 5); g.drawImage(tint('#b385ea'), 0, 0);
  g.globalCompositeOperation = 'source-atop';
  for (const [x, y, r] of blobs) {
    for (let i = 0; i < Math.round(r / 14); i++) { const a = range(0, 6.3), d = range(0, r * 0.8), bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d, rr = range(2.5, 6.5); g.fillStyle = 'rgba(235,215,255,0.55)'; g.beginPath(); g.arc(bx, by, rr, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.arc(bx - rr * 0.35, by - rr * 0.35, rr * 0.35, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.42, r * 0.28, r * 0.09, -0.5, 0, 7); g.fill();
  }
  ctx.drawImage(gc, 0, 0);
}

// the kid exactly as drawRoom draws the player (pack, gun under/over, muzzle)
function kid(ctx: C, x: number, y: number, pose: string, tier: number, aim: number, facing = 1, S = 0.9): [number, number] {
  const pack = tier >= 5 ? 2 : tier >= 3 ? 1 : 0;
  draw(ctx, `pack_${pack}`, x - facing * 13 * S, y - 30 * S, S * (tier >= 5 ? 1.05 : 0.95), facing < 0);
  const hx = x + facing * 6 * S, hy = y - 22 * S;
  const left = Math.cos(aim) < 0, behind = Math.sin(aim) < -0.55;
  const gun = `gun_${tier}`, gs = S * (1 + 0.04 * tier);
  if (behind) draw(ctx, gun, hx, hy, gs, false, aim, 1, 1, left ? -1 : 1);
  draw(ctx, pose, x, y + 6, S, facing < 0);
  if (!behind) draw(ctx, gun, hx, hy, gs, false, aim, 1, 1, left ? -1 : 1);
  const [mx, my] = point(gun, 'muzzle'); const k = gs / 2; const myy = left ? -my : my;
  return [hx + (Math.cos(aim) * mx - Math.sin(aim) * myy) * k, hy + (Math.sin(aim) * mx + Math.cos(aim) * myy) * k];
}

// water stream with the in-game layers (glow, dark edge, body, core, dashes)
function stream(ctx: C, x0: number, y0: number, x1: number, y1: number, w: number, bend = 0.05) {
  const len = Math.hypot(x1 - x0, y1 - y0); const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
  const cx = (x0 + x1) / 2 + nx * len * 0.04, cy = (y0 + y1) / 2 + ny * len * 0.04 + len * bend;
  const path = () => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path(); ctx.strokeStyle = 'rgba(140,220,255,0.35)'; ctx.lineWidth = w * 2.1; ctx.stroke();
  path(); ctx.strokeStyle = 'rgba(28,98,170,0.9)'; ctx.lineWidth = w + 3; ctx.stroke();
  path(); ctx.strokeStyle = '#55c2f5'; ctx.lineWidth = w; ctx.stroke();
  path(); ctx.strokeStyle = 'rgba(210,245,255,0.95)'; ctx.lineWidth = w * 0.5; ctx.stroke();
  path(); ctx.setLineDash([w * 1.4, w * 1.6]); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = Math.max(2, w * 0.22); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(235,250,255,0.9)'; ctx.beginPath(); ctx.arc(x0, y0, w * 0.6, 0, 7); ctx.fill();
}

function droplets(ctx: C, x: number, y: number, n: number, r: number) {
  for (let i = 0; i < n; i++) {
    const a = range(-Math.PI, 0.2), d = range(r * 0.4, r), s = range(3, 7);
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    ctx.fillStyle = '#2a62b8'; ctx.beginPath(); ctx.arc(px, py, s + 1.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#8fe2ff'; ctx.beginPath(); ctx.arc(px, py, s, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - s * 0.3, py - s * 0.3, s * 0.35, 0, 7); ctx.fill();
  }
}

function outlinedText(ctx: C, text: string, x: number, y: number, size: number, font: string, fill: string, edge: string, edgeW: number, drop: number) {
  ctx.save(); ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(30,40,80,0.35)'; ctx.strokeStyle = 'rgba(30,40,80,0.35)'; ctx.lineWidth = edgeW * 2;
  ctx.strokeText(text, x, y + drop); ctx.fillText(text, x, y + drop);
  ctx.strokeStyle = edge; ctx.lineWidth = edgeW * 2; ctx.strokeText(text, x, y);
  ctx.fillStyle = edge; ctx.fillText(text, x, y + edgeW * 0.6);
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
  ctx.restore();
}

// ------------------------------------------------------------------ icon
function icon(size: number): string {
  seed = 11;
  const [c, ctx] = canvas(size, size);
  const k = size / 512; ctx.scale(k, k);
  // sunny sky behind a rounded meadow hill
  const bg = ctx.createLinearGradient(0, 0, 0, 512);
  bg.addColorStop(0, '#5cc4ff'); bg.addColorStop(0.6, '#c8f0ff');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 512);
  ctx.save(); ctx.globalAlpha = 0.55; draw(ctx, 'fx_rays', 360, 170, 3.6); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.ellipse(256, 700, 520, 440, 0, 0, 7); ctx.clip();
  for (let y = 240; y < 512; y += 48) for (let x = -48; x < 560; x += 48) drawTile(ctx, `g_${Math.floor(rnd() * 3)}`, x, y, 48);
  ctx.restore();
  ctx.strokeStyle = 'rgba(40,90,30,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(256, 700, 520, 440, 0, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
  // the subjects sit a little high and large so they read at launcher size
  ctx.save(); ctx.translate(256, 300); ctx.scale(1.12, 1.12); ctx.translate(-256, -330);
  // goo puddle under the blob, being washed away
  goo(ctx, [[410, 470, 110], [496, 410, 56], [318, 506, 46]], 512, 512);
  draw(ctx, 'shadow', 414, 452, 3.0, false, 0, 0.45);
  draw(ctx, 'm_blob_hit', 414, 452, 3.1);
  // the kid fills the left half, spraying the blob
  draw(ctx, 'shadow', 140, 500, 3.0, false, 0, 0.45);
  const [mx, my] = kid(ctx, 140, 500, 'kid_shoot_0', 3, -0.14, 1, 3.5);
  stream(ctx, mx, my, 376, 336, 42, 0.02);
  draw(ctx, 'fx_splash_2', 384, 330, 2.6, false, 0.35);
  droplets(ctx, 388, 318, 11, 84);
  ctx.restore();
  return c.toDataURL('image/png');
}

// ------------------------------------------------------------------ feature graphic 1024x500
function feature(title: string, sub: string): string {
  seed = 23;
  const W = 1024, H = 500;
  const [c, ctx] = canvas(W, H);
  ground(ctx, W, H, (col) => 6 + Math.round(Math.sin(col * 0.45) * 1.2));
  // goo still covering the right half; the left half already washed clean
  goo(ctx, [[760, 330, 120], [900, 250, 110], [640, 420, 70], [980, 420, 90], [860, 470, 70], [700, 200, 60]], W, H);
  // soft vignette top for the logo
  const v = ctx.createLinearGradient(0, 0, 0, 230); v.addColorStop(0, 'rgba(255,255,255,0.55)'); v.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, 230);
  // props
  draw(ctx, 'ob_tree', 70, 190, 1.3); draw(ctx, 'ob_pine', 980, 150, 1.2); draw(ctx, 'ob_bush', 40, 470, 1.2);
  // rescued friends trailing the kid
  draw(ctx, 'shadow', 120, 445, 1.1, false, 0, 0.5); draw(ctx, 'a_bunny_happy_1', 120, 445, 1.6, true);
  draw(ctx, 'shadow', 225, 470, 1.1, false, 0, 0.5); draw(ctx, 'a_puppy_happy_0', 225, 470, 1.75, true);
  // a cocoon with a kitten still inside, waiting
  draw(ctx, 'a_kitten_trapped_0', 930, 400, 1.6); draw(ctx, 'cocoon_0', 930, 404, 1.6, false, 0, 0.6);
  // goo monsters getting washed
  draw(ctx, 'shadow', 690, 400, 1.6, false, 0, 0.5); draw(ctx, 'm_blob_hit', 690, 400, 1.7);
  draw(ctx, 'shadow', 830, 300, 1.2, false, 0, 0.5); draw(ctx, 'm_blob_normal', 830, 300, 1.3, true);
  // the kid
  draw(ctx, 'shadow', 380, 452, 1.6, false, 0, 0.55);
  const [mx, my] = kid(ctx, 372, 462, 'kid_shoot_0', 4, 0.0, 1, 2.2);
  stream(ctx, mx, my, 650, 352, 28, 0.03);
  draw(ctx, 'fx_splash_3', 660, 350, 1.6, false, 0.4);
  droplets(ctx, 664, 344, 10, 80);
  draw(ctx, 'p_coin_0', 600, 250, 1.4); draw(ctx, 'p_coin_1', 560, 290, 1.2); draw(ctx, 'p_sparkle_0', 520, 240, 1.4);
  // logo
  outlinedText(ctx, title, W / 2, 128, 104, "'Jua', 'Fredoka', sans-serif", '#ffffff', '#2a62b8', 9, 12);
  outlinedText(ctx, sub, W / 2, 190, 44, "'Fredoka', 'Jua', sans-serif", '#ffe27a', '#b05a10', 6, 6);
  return c.toDataURL('image/png');
}

// ------------------------------------------------------------------ trailer end card (1080x1920, time t in seconds)
function endCard(t: number): string {
  seed = 41;
  const [c, ctx] = canvas(1080, 1920); ctx.scale(3, 3); // 360x640 layout
  const bg = ctx.createLinearGradient(0, 0, 0, 640); bg.addColorStop(0, '#5cc4ff'); bg.addColorStop(0.55, '#d4f3ff');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 360, 640);
  ctx.save(); ctx.translate(180, 190); ctx.rotate(t * 0.25); ctx.globalAlpha = 0.6; draw(ctx, 'fx_rays', 0, 0, 2.6); ctx.restore();
  // meadow
  ctx.save(); ctx.beginPath(); ctx.ellipse(180, 900, 420, 420, 0, 0, 7); ctx.clip();
  for (let y = 470; y < 640; y += 48) for (let x = -48; x < 400; x += 48) drawTile(ctx, `g_${Math.floor(rnd() * 3)}`, x, y, 48);
  ctx.restore();
  // logo pops in
  const k = Math.min(1, t / 0.4); const pop = k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 7) : 1;
  ctx.save(); ctx.translate(180, 170); ctx.scale(pop, pop);
  outlinedText(ctx, '물총 구조대', 0, 0, 66, "'Jua', 'Fredoka', sans-serif", '#ffffff', '#2a62b8', 6, 8);
  outlinedText(ctx, 'Splash Rescue', 0, 48, 30, "'Fredoka', 'Jua', sans-serif", '#ffe27a', '#b05a10', 4, 4);
  ctx.restore();
  // the kid cheering with the friends hopping around
  const crew: [string, number, number, number][] = [['a_puppy_happy', 78, 548, 0], ['a_bunny_happy', 128, 590, 0.4], ['a_fox_happy', 236, 592, 0.8], ['a_kitten_happy', 288, 548, 1.2], ['a_otter_happy', 40, 610, 1.6], ['a_duckling_happy', 324, 612, 2.0]];
  for (const [n, x, y, ph] of crew) {
    const hop = Math.abs(Math.sin(t * 5 + ph)) * 14; const f = Math.floor(t * 8 + ph * 3) % 3;
    draw(ctx, 'shadow', x, y, 0.9, false, 0, 0.4); draw(ctx, `${n}_${f}`, x, y - hop, 1.25, x > 180);
  }
  draw(ctx, 'shadow', 180, 560, 1.5, false, 0, 0.45);
  draw(ctx, `kid_win_${Math.floor(t * 8) % 4}`, 180, 566, 1.9);
  // water drops and confetti falling
  for (let i = 0; i < 26; i++) {
    const x = (i * 97) % 360, sp = 60 + (i * 37) % 70, y = ((i * 53) % 640 + t * sp) % 700 - 40;
    draw(ctx, i % 3 === 0 ? 'p_water' : `p_conf_${i % 5}`, x, y, 1.2, false, t * 2 + i);
  }
  return c.toDataURL('image/jpeg', 0.92);
}
(window as unknown as { __endcard: (t: number) => string }).__endcard = endCard;

async function main() {
  await loadAtlases(() => {});
  await document.fonts.load("100px 'Jua'"); await document.fonts.load("44px 'Fredoka'");
  (window as unknown as { __RELEASE_ART__: unknown }).__RELEASE_ART__ = {
    icon512: icon(512), icon192: icon(192), icon180: icon(180), favicon: icon(64),
    feature: feature('물총 구조대', 'Splash Rescue'),
  };
}
main().catch((e) => { (window as unknown as { __RELEASE_ART__: unknown }).__RELEASE_ART__ = { error: String(e?.stack || e) }; });
