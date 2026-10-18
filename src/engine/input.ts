// One-thumb floating joystick: touch anywhere, drag to move, lift (or hold
// still) to stop. Works with touch, mouse and pen through Pointer Events.
export interface Joystick {
  active: boolean; ox: number; oy: number; x: number; y: number;
  mx: number; my: number; // output vector (length 0..1)
  everMoved: boolean;
}

const DEAD = 9; // css px before a drag counts as movement
const FULL = 46; // css px for full speed

export class InputController {
  joy: Joystick = { active: false, ox: 0, oy: 0, x: 0, y: 0, mx: 0, my: 0, everMoved: false };
  enabled = false;
  private pid = -1;
  private el: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
    el.addEventListener('pointerdown', this.down, { passive: false });
    window.addEventListener('pointermove', this.move, { passive: false });
    window.addEventListener('pointerup', this.up);
    window.addEventListener('pointercancel', this.up);
    window.addEventListener('blur', () => this.release());
  }

  private down = (e: PointerEvent) => {
    if (!this.enabled) return;
    if (this.pid !== -1 && e.pointerType === 'touch') return; // first finger wins
    e.preventDefault();
    this.pid = e.pointerId;
    const j = this.joy; j.active = true; j.ox = j.x = e.clientX; j.oy = j.y = e.clientY; j.mx = j.my = 0;
    try { this.el.setPointerCapture(e.pointerId); } catch { /* not supported */ }
  };

  private move = (e: PointerEvent) => {
    if (e.pointerId !== this.pid || !this.joy.active) return;
    e.preventDefault();
    const j = this.joy; j.x = e.clientX; j.y = e.clientY;
    let dx = j.x - j.ox, dy = j.y - j.oy; let d = Math.hypot(dx, dy);
    // the base follows the finger when dragged far so direction changes stay quick
    const maxR = FULL * 1.5;
    if (d > maxR) { j.ox += (dx / d) * (d - maxR); j.oy += (dy / d) * (d - maxR); dx = j.x - j.ox; dy = j.y - j.oy; d = maxR; }
    if (d < DEAD) { j.mx = 0; j.my = 0; return; }
    const k = Math.min(1, 0.45 + (0.55 * (d - DEAD)) / (FULL - DEAD));
    j.mx = (dx / d) * k; j.my = (dy / d) * k;
    j.everMoved = true;
  };

  private up = (e: PointerEvent) => { if (e.pointerId === this.pid) this.release(); };

  release() { this.pid = -1; const j = this.joy; j.active = false; j.mx = 0; j.my = 0; }
}

let shared: InputController | null = null;
export function initInput(el: HTMLElement): InputController { shared = new InputController(el); return shared; }
export function getInput(): InputController { return shared!; }
