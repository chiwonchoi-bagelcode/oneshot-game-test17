// Tiny DOM helpers + sprite icons for the HTML UI layer.
import { frame } from '../engine/atlas';

type Attrs = Record<string, string | number | boolean | ((e: Event) => void) | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...kids: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'class') el.className = String(v);
    else if (k === 'style') el.setAttribute('style', String(v));
    else if (k === 'html') el.innerHTML = String(v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const c of kids) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : document.createTextNode(c));
  return el;
}

const pageSize = new Map<string, [number, number]>();

// A sprite from the atlas shown as a DOM element (crisp, no extra files).
export function icon(name: string, size: number, cls = ''): HTMLElement {
  const el = document.createElement('span');
  el.className = 'ico ' + cls;
  setIcon(el, name, size);
  return el;
}

export function setIcon(el: HTMLElement, name: string, size: number) {
  const f = frame(name);
  el.style.width = el.style.height = size + 'px';
  if (!f) { el.style.backgroundImage = 'none'; return; }
  const src = f.img.src;
  let ps = pageSize.get(src);
  if (!ps) { ps = [f.img.naturalWidth, f.img.naturalHeight]; pageSize.set(src, ps); }
  const k = size / Math.max(f.w, f.h);
  const ox = (size - f.w * k) / 2, oy = (size - f.h * k) / 2;
  // pad non-square frames instead of offsetting, so neighbouring atlas sprites never show in the gap
  el.style.boxSizing = 'border-box';
  el.style.padding = `${oy}px ${ox}px`;
  el.style.backgroundOrigin = el.style.backgroundClip = 'content-box';
  el.style.backgroundImage = `url("${src}")`;
  el.style.backgroundSize = `${ps[0] * k}px ${ps[1] * k}px`;
  el.style.backgroundPosition = `${-f.x * k}px ${-f.y * k}px`;
  el.style.backgroundRepeat = 'no-repeat';
}

// Guard against double taps re-triggering an action while it animates.
export function once(fn: () => void, ms = 450): () => void {
  let busy = false;
  return () => { if (busy) return; busy = true; fn(); setTimeout(() => (busy = false), ms); };
}

export function clear(el: HTMLElement) { while (el.firstChild) el.removeChild(el.firstChild); }
