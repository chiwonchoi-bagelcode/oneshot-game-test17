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
  for (const f of registry) {
    const c = document.createElement('canvas'); c.width = f.w; c.height = f.h;
    const ctx = c.getContext('2d')!;
    ctx.save(); f.draw(ctx); ctx.restore();
    (groups[f.group] ||= []).push({ name: f.name, canvas: c, ax: f.ax, ay: f.ay });
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
  window.__ART__ = { atlases: result, single, points };
}

main().catch((e) => { window.__ART__ = { error: String(e && (e as Error).stack || e) }; });
