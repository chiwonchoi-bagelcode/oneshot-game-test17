// Sprite atlas runtime: frame lookup and drawing in world units.
import atlasMeta from '../../assets/art/atlas.json';

export const ART_SCALE = 2; // atlas px per world unit

export interface Frame { img: HTMLImageElement; x: number; y: number; w: number; h: number; ax: number; ay: number }

interface Meta { atlases: Record<string, { pages: string[]; frames: Record<string, { page: number; x: number; y: number; w: number; h: number; ax: number; ay: number }> }>; points: Record<string, Record<string, [number, number]>> }

const META = atlasMeta as unknown as Meta;
const frames = new Map<string, Frame>();
const pages: HTMLImageElement[] = [];

export function atlasPageUrls(): string[] {
  const out: string[] = [];
  for (const a of Object.values(META.atlases)) for (const p of a.pages) out.push('assets/art/' + p);
  return out;
}

export async function loadAtlases(onProgress: (k: number) => void): Promise<void> {
  const list: { atlas: string; idx: number; url: string }[] = [];
  for (const [name, a] of Object.entries(META.atlases)) a.pages.forEach((p, idx) => list.push({ atlas: name, idx, url: 'assets/art/' + p }));
  let done = 0;
  const imgs: Record<string, HTMLImageElement[]> = {};
  await Promise.all(list.map(async (it) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = it.url;
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('image ' + it.url)); });
    try { await img.decode(); } catch { /* already decoded */ }
    (imgs[it.atlas] ||= [])[it.idx] = img;
    pages.push(img);
    onProgress(++done / list.length);
  }));
  for (const [name, a] of Object.entries(META.atlases)) {
    for (const [fname, f] of Object.entries(a.frames)) frames.set(fname, { img: imgs[name][f.page], x: f.x, y: f.y, w: f.w, h: f.h, ax: f.ax, ay: f.ay });
  }
}

export function frame(name: string): Frame | undefined { return frames.get(name); }

export function point(sprite: string, key: string): [number, number] { return META.points[sprite]?.[key] ?? [0, 0]; }

const missing = new Set<string>();

// Draw a frame with its anchor at (x, y) in the current transform (world units).
export function draw(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, scale = 1, flipX = false, rot = 0, alpha = 1, sx = 1, sy = 1): void {
  const f = frames.get(name);
  if (!f) { if (!missing.has(name)) { missing.add(name); console.warn('missing sprite', name); } return; }
  drawFrame(ctx, f, x, y, scale, flipX, rot, alpha, sx, sy);
}

export function drawFrame(ctx: CanvasRenderingContext2D, f: Frame, x: number, y: number, scale = 1, flipX = false, rot = 0, alpha = 1, sx = 1, sy = 1): void {
  const k = scale / ART_SCALE;
  if (alpha <= 0.003) return;
  const prevA = ctx.globalAlpha;
  if (alpha !== 1) ctx.globalAlpha = prevA * alpha;
  if (!rot && !flipX && sx === 1 && sy === 1) {
    ctx.drawImage(f.img, f.x, f.y, f.w, f.h, x - f.ax * k, y - f.ay * k, f.w * k, f.h * k);
  } else {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale((flipX ? -1 : 1) * sx, sy);
    ctx.drawImage(f.img, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
    ctx.restore();
  }
  if (alpha !== 1) ctx.globalAlpha = prevA;
}
