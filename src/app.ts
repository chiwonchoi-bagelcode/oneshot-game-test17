// App shell: owns the main loop and switches between screens.
import levelsData from 'virtual:levels';
import { quality } from './engine/quality';
import { screen, onResize } from './engine/screen';
import { PlayScreen, type PlayOutcome } from './game/play';
import { BOT_EXPERT, BOT_PLAYER, BOT_NOVICE } from './sim/bot';
import type { LevelDef, MetaPower } from './sim/types';
import { save } from './meta/save';
import { h } from './ui/dom';

export const LEVELS: LevelDef[] = (levelsData as LevelDef[]).slice().sort((a, b) => a.stage - b.stage);

export interface Scene { frame(dt: number): void; layout?(): void; destroy(): void; autoPause?(): void }

export class App {
  scene: Scene | null = null;
  ui = document.getElementById('ui')!;
  fresh: boolean;
  params = new URLSearchParams(location.search);
  private last = 0;
  private acc = 0;
  capture = this.params.has('capture');

  constructor(fresh: boolean) {
    this.fresh = fresh;
    onResize(() => this.scene?.layout?.());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.scene?.autoPause?.(); });
  }

  start() {
    const stage = Number(this.params.get('stage') || 1);
    this.playStage(stage);
    if (this.capture) {
      (window as unknown as { __advance: (n: number, dt?: number) => void }).__advance = (n: number, dt = 1 / 30) => { for (let i = 0; i < n; i++) this.scene?.frame(dt); };
      return;
    }
    const loop = (ts: number) => {
      requestAnimationFrame(loop);
      const dt = this.last ? Math.min(0.1, (ts - this.last) / 1000) : 1 / 60;
      this.last = ts;
      const cap = quality().fpsCap;
      this.acc += dt;
      if (cap < 60 && this.acc < 1 / cap - 0.002) return;
      const step = this.acc; this.acc = 0;
      this.scene?.frame(step);
    };
    requestAnimationFrame(loop);
  }

  metaPower(): MetaPower {
    const s = save();
    return { upgrades: { ...s.upgrades }, bonds: {}, assist: false };
  }

  playStage(stage: number) {
    const level = LEVELS.find((l) => l.stage === stage) ?? LEVELS[0];
    this.scene?.destroy();
    const botName = this.params.get('bot');
    const bot = botName === 'expert' ? BOT_EXPERT : botName === 'novice' ? BOT_NOVICE : botName ? BOT_PLAYER : undefined;
    const seed = Number(this.params.get('seed') || Math.floor(Math.random() * 1e6));
    const play = new PlayScreen({
      level, meta: this.metaPower(), known: [], seed, attempt: 1, tutorial: stage === 1, firstRuns: 0, bot, newMonster: level.intro ?? null, revives: 1,
      onSettings: () => {},
    }, this.ui, (r) => this.onPlayDone(play, r));
    this.scene = { frame: (dt) => play.frame(dt), layout: () => play.layout(), destroy: () => play.destroy(), autoPause: () => play.autoPause() };
    play.layout();
  }

  private onPlayDone(play: PlayScreen, r: PlayOutcome) {
    const box = h('div', { style: 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff6e2;border:4px solid #3a2416;border-radius:20px;padding:20px;font-size:22px;text-align:center' },
      `${r.result} · ${r.run.coins} coins · ${r.run.rescued.length} animals`, h('br'), h('button', { class: 'btn btn-primary', onclick: () => { box.remove(); this.playStage(r.run.stage); } }, 'Again'));
    this.ui.appendChild(box);
    this.scene = { frame: (dt) => play.renderIdle(dt), destroy: () => play.destroy() };
    void screen;
  }
}
