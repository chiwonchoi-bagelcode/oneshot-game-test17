// One-thumb floating joystick: touch anywhere, drag to move, lift (or hold
// still) to stop. Works with touch, mouse and pen through Pointer Events.
// Presses are taken from the whole window (the HUD layer covers the canvas),
// except on buttons and popups. On a keyboard, arrow keys / WASD move too.
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
    window.addEventListener('pointerdown', this.down, { passive: false });
    window.addEventListener('pointermove', this.move, { passive: false });
    window.addEventListener('pointerup', this.up);
    window.addEventListener('pointercancel', this.up);
    window.addEventListener('blur', () => { this.release(); this.keys.clear(); this.applyKeys(); });
    window.addEventListener('keydown', (e) => this.key(e, true));
    window.addEventListener('keyup', (e) => this.key(e, false));
  }

  private down = (e: PointerEvent) => {
    if (!this.enabled) return;
    const t = e.target as Element | null;
    if (t?.closest?.('button, a, input, select, textarea, .modal-back, .result')) return; // controls keep their taps
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

  // keyboard: held direction keys move, letting go of all of them stops (and fires)
  private keys = new Set<string>();
  private key(e: KeyboardEvent, on: boolean) {
    const k = KEYS[e.code]; if (!k) return;
    if (on && !this.enabled) return;
    if (on) this.keys.add(e.code); else this.keys.delete(e.code);
    if (this.enabled) e.preventDefault();
    this.applyKeys();
  }
  private applyKeys() {
    if (this.pid !== -1) return; // a finger or mouse drag is in charge
    let x = 0, y = 0; for (const c of this.keys) { x += KEYS[c][0]; y += KEYS[c][1]; }
    const d = Math.hypot(x, y); const j = this.joy;
    j.mx = d ? x / d : 0; j.my = d ? y / d : 0;
    if (d) j.everMoved = true;
  }
}

const KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
  KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1],
};

let shared: InputController | null = null;
export function initInput(el: HTMLElement): InputController { shared = new InputController(el); return shared; }
export function getInput(): InputController { return shared!; }
