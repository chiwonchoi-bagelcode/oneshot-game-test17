// Main canvas sizing (device pixel ratio capped by the quality preset) and
// safe-area insets (notch, dynamic island, home indicator).
import { quality, onQualityChange } from './quality';

export const screen = {
  canvas: null as unknown as HTMLCanvasElement,
  ctx: null as unknown as CanvasRenderingContext2D,
  w: 0, h: 0, dpr: 1,
  safe: { top: 0, right: 0, bottom: 0, left: 0 },
};

const listeners: (() => void)[] = [];
export function onResize(f: () => void) { listeners.push(f); }

let probe: HTMLDivElement | null = null;

function readSafe() {
  if (!probe) {
    probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(probe);
  }
  const cs = getComputedStyle(probe);
  screen.safe.top = parseFloat(cs.paddingTop) || 0;
  screen.safe.right = parseFloat(cs.paddingRight) || 0;
  screen.safe.bottom = parseFloat(cs.paddingBottom) || 0;
  screen.safe.left = parseFloat(cs.paddingLeft) || 0;
}

export function initScreen(canvas: HTMLCanvasElement) {
  screen.canvas = canvas;
  screen.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true }) as CanvasRenderingContext2D;
  const resize = () => {
    readSafe();
    screen.w = window.innerWidth; screen.h = window.innerHeight;
    screen.dpr = Math.min(window.devicePixelRatio || 1, quality().dprCap);
    canvas.width = Math.round(screen.w * screen.dpr); canvas.height = Math.round(screen.h * screen.dpr);
    canvas.style.width = screen.w + 'px'; canvas.style.height = screen.h + 'px';
    for (const f of listeners) f();
  };
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));
  onQualityChange(resize);
  resize();
}
