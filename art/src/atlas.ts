// Sprite registry + shelf packer. Each frame is drawn on its own canvas, then
// packed into atlas pages. Anchors (ax, ay) are in frame pixels.
export interface FrameSpec { name: string; w: number; h: number; ax: number; ay: number; draw: (ctx: CanvasRenderingContext2D) => void; group: string }
export interface PackedFrame { page: number; x: number; y: number; w: number; h: number; ax: number; ay: number }

export const registry: FrameSpec[] = [];
export const points: Record<string, Record<string, [number, number]>> = {};

let currentGroup = 'sprites';
export function group(g: string) { currentGroup = g; }

export function sprite(name: string, w: number, h: number, ax: number, ay: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  registry.push({ name, w: Math.ceil(w), h: Math.ceil(h), ax, ay, draw, group: currentGroup });
}

export function point(sprite: string, key: string, x: number, y: number) {
  (points[sprite] ||= {})[key] = [x, y];
}

export function pack(frames: { name: string; canvas: HTMLCanvasElement; ax: number; ay: number }[], pageSize = 2048, pad = 2) {
  const sorted = frames.slice().sort((a, b) => b.canvas.height - a.canvas.height || b.canvas.width - a.canvas.width);
  const pages: HTMLCanvasElement[] = [];
  const out: Record<string, PackedFrame> = {};
  let page: HTMLCanvasElement | null = null; let ctx: CanvasRenderingContext2D | null = null;
  let x = pad, y = pad, rowH = 0;
  const newPage = () => {
    page = document.createElement('canvas'); page.width = pageSize; page.height = pageSize;
    ctx = page.getContext('2d')!; pages.push(page); x = pad; y = pad; rowH = 0;
  };
  newPage();
  for (const f of sorted) {
    const w = f.canvas.width, h = f.canvas.height;
    if (x + w + pad > pageSize) { x = pad; y += rowH + pad; rowH = 0; }
    if (y + h + pad > pageSize) newPage();
    ctx!.drawImage(f.canvas, x, y);
    out[f.name] = { page: pages.length - 1, x, y, w, h, ax: f.ax, ay: f.ay };
    x += w + pad; rowH = Math.max(rowH, h);
  }
  // crop the last page height to what is used
  const last = pages[pages.length - 1];
  const usedH = Math.min(pageSize, nextPow2(y + rowH + pad));
  if (usedH < pageSize) {
    const c = document.createElement('canvas'); c.width = pageSize; c.height = usedH;
    c.getContext('2d')!.drawImage(last, 0, 0); pages[pages.length - 1] = c;
  }
  return { pages, frames: out };
}

function nextPow2(v: number) { let p = 64; while (p < v) p *= 2; return p; }
