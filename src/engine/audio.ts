// Audio: Web Audio for effects (decoded once, pitch/volume variation, voice
// limits), streamed <audio> elements for music with crossfades. Handles the
// mobile lifecycle: unlock on first touch, suspend when hidden, resume on return.
interface SfxDef { file: string; duration: number }
interface MusicDef { file: string; duration: number; loop: boolean }
export interface AudioManifest { music: Record<string, MusicDef>; sfx: Record<string, SfxDef> }

declare global { interface Window { __SFX__?: Record<string, string>; __AUDIO_MANIFEST__?: AudioManifest } }

const LIMITS: Record<string, { max: number; gap: number }> = {
  goo_hit: { max: 3, gap: 0.05 }, cocoon_hit: { max: 2, gap: 0.08 }, pickup_xp: { max: 4, gap: 0.03 }, pickup_coin: { max: 4, gap: 0.035 },
  coin_tick: { max: 2, gap: 0.03 }, goo_burst: { max: 4, gap: 0.03 }, enemy_spit: { max: 3, gap: 0.06 }, ui_tap: { max: 2, gap: 0.04 },
};

class AudioManager {
  ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private playing = new Map<string, { n: number; last: number }>();
  private loopNodes = new Map<string, { src: AudioBufferSourceNode; gain: GainNode }>();
  private manifest: AudioManifest | null = null;
  private music: { name: string; el: HTMLAudioElement; node?: MediaElementAudioSourceNode; gain?: GainNode } | null = null;
  private fading: HTMLAudioElement[] = [];
  musicVol = 0.7; sfxVol = 0.9;
  private wantMusic: string | null = null;
  private hidden = false;
  private duck = 1;
  private decoded = false;
  private routeMusic = location.protocol === 'http:' || location.protocol === 'https:';

  init(manifest: AudioManifest | null) {
    this.manifest = manifest;
    const unlock = () => this.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    document.addEventListener('visibilitychange', () => this.onVisibility());
    window.addEventListener('pagehide', () => this.onVisibility(true));
    window.addEventListener('pageshow', () => this.onVisibility(false));
    window.addEventListener('focus', () => { if (!document.hidden) this.resume(); });
  }

  private unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      try { this.ctx = new AC({ latencyHint: 'interactive' }); } catch { return; }
      this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = this.sfxVol; this.sfxGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = this.musicVol; this.musicGain.connect(this.ctx.destination);
      this.ctx.onstatechange = () => { if (this.ctx && this.ctx.state !== 'running' && !this.hidden) this.ctx.resume().catch(() => {}); };
      void this.decodeAll();
    }
    this.resume();
  }

  private async decodeAll() {
    if (this.decoded || !this.ctx) return;
    this.decoded = true;
    const embedded = window.__SFX__ || {};
    const names = Object.keys(this.manifest?.sfx ?? embedded);
    await Promise.all(names.map(async (name) => {
      try {
        let buf: ArrayBuffer;
        if (embedded[name]) {
          const bin = atob(embedded[name]); const u8 = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
          buf = u8.buffer;
        } else {
          const r = await fetch('assets/audio/' + this.manifest!.sfx[name].file); buf = await r.arrayBuffer();
        }
        const ab = await this.ctx!.decodeAudioData(buf);
        this.buffers.set(name, ab);
      } catch { /* missing sound is not fatal */ }
    }));
  }

  private resume() {
    if (this.hidden) return;
    if (this.ctx && this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    if (this.music && this.music.el.paused && this.wantMusic) this.music.el.play().catch(() => {});
  }

  private onVisibility(forceHidden?: boolean) {
    this.hidden = forceHidden ?? document.hidden;
    if (this.hidden) {
      if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {});
      if (this.music) this.music.el.pause();
      for (const el of this.fading) el.pause();
    } else this.resume();
  }

  setVolumes(music: number, sfx: number) {
    this.musicVol = music; this.sfxVol = sfx;
    if (this.sfxGain) this.sfxGain.gain.value = sfx;
    this.applyMusicVol();
  }

  private applyMusicVol() {
    const v = this.musicVol * this.duck;
    if (this.music) {
      if (this.music.gain && this.ctx) this.music.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.08);
      else this.music.el.volume = Math.max(0, Math.min(1, v));
    }
  }

  play(name: string, o: { vol?: number; rate?: number; pan?: number; vary?: number } = {}) {
    if (!this.ctx || !this.sfxGain || this.ctx.state !== 'running' || this.sfxVol <= 0) return;
    let buf = this.buffers.get(name);
    if (!buf) {
      // variants: name_1.._3
      const v = [1, 2, 3].map((i) => this.buffers.get(`${name}_${i}`)).filter(Boolean) as AudioBuffer[];
      if (!v.length) return;
      buf = v[Math.floor(Math.random() * v.length)];
    }
    const lim = LIMITS[name] ?? { max: 6, gap: 0.015 };
    const st = this.playing.get(name) ?? { n: 0, last: -1 };
    const now = this.ctx.currentTime;
    if (st.n >= lim.max || now - st.last < lim.gap) return;
    st.n++; st.last = now; this.playing.set(name, st);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const vary = o.vary ?? 0.06;
    src.playbackRate.value = (o.rate ?? 1) * (1 + (Math.random() * 2 - 1) * vary);
    const g = this.ctx.createGain(); g.gain.value = o.vol ?? 1;
    let node: AudioNode = g;
    if (o.pan && this.ctx.createStereoPanner) { const p = this.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); g.connect(p); node = p; }
    src.connect(g); node.connect(this.sfxGain);
    src.onended = () => { st.n = Math.max(0, st.n - 1); };
    src.start();
  }

  loop(name: string, on: boolean, vol = 1, rate = 1) {
    if (!this.ctx || !this.sfxGain) return;
    const cur = this.loopNodes.get(name);
    if (on) {
      if (!cur) {
        const buf = this.buffers.get(name); if (!buf) return;
        const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const g = this.ctx.createGain(); g.gain.value = 0;
        src.connect(g); g.connect(this.sfxGain); src.start();
        this.loopNodes.set(name, { src, gain: g });
        g.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.03);
      } else {
        cur.gain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
        cur.src.playbackRate.setTargetAtTime(rate, this.ctx.currentTime, 0.05);
      }
    } else if (cur) {
      cur.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
      const src = cur.src; this.loopNodes.delete(name);
      setTimeout(() => { try { src.stop(); } catch { /* already stopped */ } }, 300);
    }
  }

  stopLoops() { for (const k of [...this.loopNodes.keys()]) this.loop(k, false); }

  music_(name: string | null) { this.playMusic(name); }

  playMusic(name: string | null) {
    this.wantMusic = name;
    if (this.music && this.music.name === name) { if (this.music.el.paused && !this.hidden) this.music.el.play().catch(() => {}); return; }
    // fade out the old track
    if (this.music) {
      const old = this.music; this.music = null;
      this.fadeOut(old);
    }
    if (!name || !this.manifest?.music[name]) return;
    const el = new Audio('assets/audio/' + this.manifest.music[name].file);
    el.loop = true; el.preload = 'auto';
    const m: { name: string; el: HTMLAudioElement; node?: MediaElementAudioSourceNode; gain?: GainNode } = { name, el };
    if (this.routeMusic && this.ctx && this.musicGain) {
      try { m.node = this.ctx.createMediaElementSource(el); m.gain = this.ctx.createGain(); m.gain.gain.value = 0; m.node.connect(m.gain); m.gain.connect(this.musicGain); } catch { m.node = undefined; m.gain = undefined; }
    }
    if (!m.gain) el.volume = 0;
    this.music = m;
    if (!this.hidden) el.play().catch(() => {});
    // fade in
    if (m.gain && this.ctx) { m.gain.gain.setTargetAtTime(this.duck, this.ctx.currentTime, 0.4); }
    else {
      const start = performance.now();
      const step = () => { if (this.music !== m) return; const k = Math.min(1, (performance.now() - start) / 900); el.volume = Math.max(0, Math.min(1, this.musicVol * this.duck * k)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
  }

  private fadeOut(m: { el: HTMLAudioElement; gain?: GainNode }) {
    this.fading.push(m.el);
    const done = () => { m.el.pause(); m.el.src = ''; this.fading = this.fading.filter((e) => e !== m.el); };
    if (m.gain && this.ctx) { m.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25); setTimeout(done, 1200); return; }
    const v0 = m.el.volume; const start = performance.now();
    const step = () => { const k = Math.min(1, (performance.now() - start) / 700); m.el.volume = Math.max(0, v0 * (1 - k)); if (k < 1) requestAnimationFrame(step); else done(); };
    requestAnimationFrame(step);
  }

  duckMusic(level: number, seconds: number) {
    this.duck = level; this.applyMusicVol();
    setTimeout(() => { this.duck = 1; this.applyMusicVol(); }, seconds * 1000);
  }

  // the stinger plays on the sfx bus
  stinger(name: string) { this.play(name, { vary: 0 }); }
}

export const audio = new AudioManager();
