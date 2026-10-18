// Small live scene used on the upgrade and result screens: the rescuer sprays
// a goo blob with the current stream. Width, reach and gun follow the real
// stats, so every upgrade is visible right away.
import { visualWidth } from './streamLook';
import { draw, point } from '../engine/atlas';
import { Particles } from './particles';

export class StreamPreview {
  canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fx = new Particles();
  private t = 0;
  width = 12; range = 250; tier = 0;
  private shownW = 12; private shownR = 250; private pulse = 0;
  private blobHp = 1; private blobPop = 0;
  private dpr = Math.min(2, window.devicePixelRatio || 1);
  private raf = 0; private last = 0; private alive = true;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'preview';
    this.ctx = this.canvas.getContext('2d')!;
    const loop = (ts: number) => {
      if (!this.alive) return;
      this.raf = requestAnimationFrame(loop);
      if (!this.canvas.isConnected) return;
      const dt = this.last ? Math.min(0.05, (ts - this.last) / 1000) : 0.016; this.last = ts;
      this.frame(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  set(width: number, range: number, tier: number, celebrate = false) {
    this.width = width; this.range = range; this.tier = tier;
    if (celebrate) { this.pulse = 1; for (let i = 0; i < 10; i++) this.fx.spawn(['p_sparkle_0', 'p_sparkle_1', 'p_sparkle_2'], 70 + Math.random() * 220, 40 + Math.random() * 60, { fps: 10, max: 0.6, scale: 1.2 }); }
  }

  private frame(dt: number) {
    const cw = this.canvas.clientWidth, ch = this.canvas.clientHeight;
    if (!cw || !ch) return;
    if (this.canvas.width !== Math.round(cw * this.dpr)) { this.canvas.width = Math.round(cw * this.dpr); this.canvas.height = Math.round(ch * this.dpr); }
    this.t += dt; this.fx.update(dt);
    this.shownW += (this.width - this.shownW) * Math.min(1, dt * 5);
    this.shownR += (this.range - this.shownR) * Math.min(1, dt * 5);
    this.pulse = Math.max(0, this.pulse - dt * 1.5);
    const g = this.ctx;
    const W = 400, H = 150; const k = Math.min(cw / W, ch / H);
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const grd = g.createLinearGradient(0, 0, 0, ch); grd.addColorStop(0, '#bfeaff'); grd.addColorStop(0.55, '#e6f7ff'); grd.addColorStop(0.56, '#9bd86a'); grd.addColorStop(1, '#6fb64a');
    g.fillStyle = grd; g.fillRect(0, 0, cw, ch);
    g.setTransform(this.dpr * k, 0, 0, this.dpr * k, this.dpr * (cw - W * k) / 2, this.dpr * (ch - H * k) / 2);
    const kx = 62, ky = 128;
    const reach = Math.min(300, 60 + this.shownR * 0.75);
    // range marker
    g.save(); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; g.setLineDash([8, 8]); g.beginPath(); g.moveTo(kx + 10, ky + 8); g.lineTo(kx + reach + 20, ky + 8); g.stroke(); g.restore();
    // blob target
    const bx = kx + reach + 18, by = ky - 6;
    this.blobHp -= dt * (0.25 + this.shownW * 0.025);
    if (this.blobHp <= 0) {
      this.blobHp = 1; this.blobPop = 0.4;
      for (let i = 0; i < 12; i++) this.fx.spawn('p_goo_violet', bx, by - 20, { z: 10, vz: 150 + Math.random() * 200, vx: (Math.random() - 0.5) * 300, g: 800, max: 0.6 });
      for (let i = 0; i < 8; i++) this.fx.spawn('p_water', bx, by - 20, { z: 10, vz: 200 + Math.random() * 200, vx: (Math.random() - 0.5) * 260, g: 900, max: 0.6 });
    }
    this.blobPop = Math.max(0, this.blobPop - dt);
    const sc = this.blobPop > 0 ? 0 : 0.5 + 0.5 * this.blobHp;
    const wob = Math.sin(this.t * 30) * 0.06;
    if (sc > 0) draw(g, 'm_blob_hit', bx, by + 20, 0.75 * sc + 0.15, true, 0, 1, 1 + wob, 1 - wob);
    else draw(g, `fx_splash_${Math.min(5, Math.floor((0.4 - this.blobPop) * 15))}`, bx, by + 10, 1.4);
    // kid + gun
    const S = 0.95;
    draw(g, `pack_${this.tier >= 5 ? 2 : this.tier >= 3 ? 1 : 0}`, kx - 12 * S, ky - 30 * S, S);
    draw(g, `kid_shoot_${Math.floor(this.t * 10) % 2}`, kx, ky + 6, S);
    const gun = `gun_${this.tier}`; const hx = kx + 6 * S, hy = ky - 22 * S; const aim = -0.06;
    draw(g, gun, hx, hy, S * (1 + 0.04 * this.tier), false, aim);
    const [mx, my] = point(gun, 'muzzle'); const kk = S * (1 + 0.04 * this.tier) / 2;
    const x0 = hx + Math.cos(aim) * mx * kk - Math.sin(aim) * my * kk, y0 = hy + Math.sin(aim) * mx * kk + Math.cos(aim) * my * kk;
    const x1 = bx - 10, y1 = by - 18;
    const w = visualWidth(this.shownW * (1 + this.pulse * 0.6));
    const path = () => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 8 + Math.sin(this.t * 8) * 3, x1, y1); };
    g.lineCap = 'round';
    path(); g.strokeStyle = 'rgba(140,220,255,0.35)'; g.lineWidth = w * 2; g.stroke();
    path(); g.strokeStyle = 'rgba(28,98,170,0.9)'; g.lineWidth = w + 3; g.stroke();
    path(); g.strokeStyle = '#55c2f5'; g.lineWidth = w; g.stroke();
    path(); g.strokeStyle = 'rgba(210,245,255,0.95)'; g.lineWidth = w * 0.5; g.stroke();
    path(); g.setLineDash([w * 1.4, w * 1.6]); g.lineDashOffset = -this.t * 700; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = Math.max(2, w * 0.22); g.stroke(); g.setLineDash([]);
    if (Math.random() < 0.6) this.fx.spawn('p_water_s', x1, y1, { z: 4, vz: 80 + Math.random() * 120, vx: -60 - Math.random() * 120, vy: (Math.random() - 0.5) * 60, g: 700, max: 0.4, scale: Math.min(2, w / 12) });
    this.fx.draw(g, false);
  }

  destroy() { this.alive = false; cancelAnimationFrame(this.raf); }
}
