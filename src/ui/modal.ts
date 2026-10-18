// Popups: fixed title bar and close button (they never scroll away), body
// scrolls on its own, one instance per id (double taps can't open twice),
// closing is debounced so a fast double tap doesn't close the next popup.
import { audio } from '../engine/audio';
import { t } from '../i18n';
import { h, icon } from './dom';

export interface ModalOpts {
  id: string; title?: string; titleIcon?: string; closable?: boolean; onClose?: () => void; cls?: string; noPad?: boolean;
}

interface Open { id: string; el: HTMLElement; opts: ModalOpts; openedAt: number }

const stack: Open[] = [];
let layer: HTMLElement;

export function initModals(root: HTMLElement) { layer = root; }

export function isOpen(id?: string) { return id ? stack.some((m) => m.id === id) : stack.length > 0; }

export function openModal(body: HTMLElement, o: ModalOpts): HTMLElement {
  const existing = stack.find((m) => m.id === o.id);
  if (existing) return existing.el;
  const closeBtn = o.closable !== false ? h('button', { class: 'btn-close', 'aria-label': t('common.close'), onclick: () => closeModal(o.id) }, icon('ic_close', 26)) : null;
  const head = o.title ? h('div', { class: 'modal-head' }, o.titleIcon ? icon(o.titleIcon, 34, 'modal-ticon') : null, h('div', { class: 'modal-title' }, o.title), closeBtn) : closeBtn ? h('div', { class: 'modal-head bare' }, closeBtn) : null;
  const scroller = h('div', { class: 'modal-body' + (o.noPad ? ' nopad' : '') }, body);
  const card = h('div', { class: 'modal-card ' + (o.cls ?? '') }, head, scroller);
  const back = h('div', { class: 'modal-back' }, card);
  back.addEventListener('pointerdown', (e) => { if (e.target === back && o.closable !== false) closeModal(o.id); });
  layer.appendChild(back);
  requestAnimationFrame(() => back.classList.add('show'));
  stack.push({ id: o.id, el: back, opts: o, openedAt: performance.now() });
  audio.play('ui_open', { vol: 0.6 });
  return back;
}

export function closeModal(id: string, silent = false) {
  const i = stack.findIndex((m) => m.id === id);
  if (i < 0) return;
  const m = stack[i];
  // ignore a close in the same instant the popup appeared (stray double tap)
  if (performance.now() - m.openedAt < 220) return;
  stack.splice(i, 1);
  m.el.classList.remove('show'); m.el.classList.add('hide');
  m.el.style.pointerEvents = 'none';
  setTimeout(() => m.el.remove(), 220);
  if (!silent) audio.play('ui_close', { vol: 0.5 });
  m.opts.onClose?.();
}

export function closeAll() { for (const m of [...stack]) { m.openedAt = 0; closeModal(m.id, true); } }

export function topModal(): string | null { return stack.length ? stack[stack.length - 1].id : null; }

// Small toast that never blocks input.
let toastEl: HTMLElement | null = null;
export function toast(text: string, iconName?: string, ms = 1800) {
  if (!toastEl) { toastEl = h('div', { class: 'toast' }); document.getElementById('ui')!.appendChild(toastEl); }
  toastEl.replaceChildren(...(iconName ? [icon(iconName, 28)] : []), h('span', {}, text));
  toastEl.classList.remove('show'); void toastEl.offsetWidth; toastEl.classList.add('show');
  const el = toastEl;
  clearTimeout((el as unknown as { _t: number })._t);
  (el as unknown as { _t: number })._t = window.setTimeout(() => el.classList.remove('show'), ms);
}
