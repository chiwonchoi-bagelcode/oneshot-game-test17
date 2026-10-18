// Runs inside headless Chromium. Draws every registered sprite, packs atlases,
// and exposes the result to the Node build script.
import { registry, pack, points } from './atlas';
import { registerChars } from './chars';

declare global { interface Window { __ART__: unknown; __ART_ONLY__?: string[] } }

async function main() {
  registerChars();
  const mods = await Promise.all([
    import('./goo').catch(() => null),
    import('./animals').catch(() => null),
    import('./env').catch(() => null),
    import('./fx').catch(() => null),
    import('./icons').catch(() => null),
  ]);
  for (const m of mods) if (m && typeof (m as { register?: () => void }).register === 'function') (m as { register: () => void }).register();

  const groups: Record<string, { name: string; canvas: HTMLCanvasElement; ax: number; ay: number }[]> = {};
  const trim: Record<string, { ox: number; oy: number; ow: number; oh: number }> = {};
  for (const f of registry) {
    const c = document.createElement('canvas'); c.width = f.w; c.height = f.h;
    const ctx = c.getContext('2d')!;
    ctx.save(); f.draw(ctx); ctx.restore();
    let out = c; let ax = f.ax, ay = f.ay;
    if (f.group === 'sprites') {
      // trim transparent margins to save texture memory; anchors move with the crop
      const d = ctx.getImageData(0, 0, f.w, f.h).data;
      let x0 = f.w, y0 = f.h, x1 = -1, y1 = -1;
      for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (d[(y * f.w + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 >= 0) {
        x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); x1 = Math.min(f.w - 1, x1 + 1); y1 = Math.min(f.h - 1, y1 + 1);
        const w = x1 - x0 + 1, h = y1 - y0 + 1;
        const t = document.createElement('canvas'); t.width = w; t.height = h; t.getContext('2d')!.drawImage(c, -x0, -y0);
        out = t; ax = f.ax - x0; ay = f.ay - y0;
        trim[f.name] = { ox: x0, oy: y0, ow: f.w, oh: f.h };
      }
    }
    (groups[f.group] ||= []).push({ name: f.name, canvas: out, ax, ay });
  }
  const result: Record<string, { pages: string[]; frames: unknown }> = {};
  const single: Record<string, string> = {};
  for (const [g, frames] of Object.entries(groups)) {
    if (g === 'icons' || g === 'single') {
      for (const f of frames) single[f.name] = f.canvas.toDataURL('image/png');
      continue;
    }
    const p = pack(frames, 2048, 3);
    result[g] = { pages: p.pages.map((c) => c.toDataURL('image/png')), frames: p.frames };
  }
  window.__ART__ = { atlases: result, single, points, trim };
}

main().catch((e) => { window.__ART__ = { error: String(e && (e as Error).stack || e) }; });
