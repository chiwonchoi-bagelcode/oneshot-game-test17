// App shell: owns the main loop and moves between title, hub, play and results.
import levelsData from 'virtual:levels';
import type { SpeciesId } from './config/balance';
import { audio } from './engine/audio';
import { quality } from './engine/quality';
import { screen, onResize } from './engine/screen';
import { onLangChange, t } from './i18n';
import { PlayScreen, type PlayOutcome } from './game/play';
import {
  applyRun, assistFor, dailyChallenge, featureOpen, knownSpecies, markAnnounced, metaPower, nextStage, pendingUnlocks, refreshDay, type RunSummary,
} from './meta/progress';
import { flush, markDirty, save, today } from './meta/save';
import { BOT_EXPERT, BOT_NOVICE, BOT_PLAYER } from './sim/bot';
import type { LevelDef } from './sim/types';
import { track } from './services/analytics';
import { HomeScreen, type Tab } from './ui/home';
import { closeAll, isOpen } from './ui/modal';
import { openDaily, openEvolve, openMissions, openSettings, openStreak, openUnlock } from './ui/popups';
import { ResultScreen } from './ui/result';
import { TitleScreen } from './ui/title';
import { h } from './ui/dom';

export const LEVELS: LevelDef[] = (levelsData as LevelDef[]).slice().sort((a, b) => a.stage - b.stage);

export interface Scene { frame(dt: number): void; layout?(): void; destroy(): void; autoPause?(): void }

export class App {
  scene: Scene | null = null;
  home: HomeScreen | null = null;
  ui = document.getElementById('ui')!;
  fresh: boolean;
  params = new URLSearchParams(location.search);
  private last = 0;
  private acc = 0;
  capture = this.params.has('capture');
  private result: ResultScreen | null = null;
  fpsSamples: number[] = [];
  debug: { onFrame?: (dt: number) => void } = {};

  constructor(fresh: boolean) {
    this.fresh = fresh;
    onResize(() => this.scene?.layout?.());
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.scene?.autoPause?.(); flush(); } else { refreshDay(); } });
    onLangChange(() => { if (this.home && this.scene === this.homeScene) this.rebuildHome(this.home.tab); });
  }

  start() {
    refreshDay();
    const stage = this.params.get('stage');
    if (__DEV__ && this.params.has('editor')) {
      // test play from the level editor (dev build only)
      try { const d = JSON.parse(localStorage.getItem('splash-editor-test') || 'null'); if (d) { const lv = d.level as LevelDef; if (d.room) lv.rooms = lv.rooms.slice(d.room).concat(lv.rooms.slice(0, d.room)); this.startRun(lv, null); } } catch { this.goHome('map'); }
    } else if (stage) this.playStage(Number(stage));
    else if (this.params.has('home')) this.goHome((this.params.get('home') || 'map') as Tab);
    else this.showTitle();
    if (this.capture) {
      (window as unknown as { __advance: (n: number, dt?: number) => void }).__advance = (n: number, dt = 1 / 30) => { for (let i = 0; i < n; i++) this.tick(dt); };
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
      this.tick(step);
    };
    requestAnimationFrame(loop);
    // a light performance sample for analytics (frame pacing on real devices)
    setInterval(() => this.reportPerf(), 60000);
  }

  private tick(dt: number) {
    if (dt > 0) { this.fpsSamples.push(1 / dt); if (this.fpsSamples.length > 600) this.fpsSamples.shift(); }
    this.scene?.frame(dt);
    this.debug.onFrame?.(dt);
  }

  private reportPerf() {
    if (this.fpsSamples.length < 60) return;
    const a = this.fpsSamples.slice().sort((x, y) => x - y);
    track('perf_sample', { fpsMedian: Math.round(a[Math.floor(a.length / 2)]), fpsP10: Math.round(a[Math.floor(a.length * 0.1)]), quality: quality().dprCap });
  }

  private setScene(s: Scene | null) { this.scene?.destroy(); this.scene = s; s?.layout?.(); }

  // ---------------------------------------------------------------- title
  showTitle() {
    closeAll();
    audio.playMusic('bgm_home');
    const title = new TitleScreen(this.ui, () => {
      if (save().stats.runs === 0) this.playStage(1);
      else this.goHome('map');
    });
    this.home = null;
    this.setScene(title);
  }

  // ---------------------------------------------------------------- hub
  private homeScene: Scene | null = null;

  goHome(tab: Tab = 'map', opts: { wash?: number; arrive?: SpeciesId[] } = {}) {
    closeAll();
    this.result?.destroy(); this.result = null;
    refreshDay();
    audio.playMusic(tab === 'shelter' ? 'bgm_shelter' : 'bgm_home');
    const home = new HomeScreen({
      levels: LEVELS,
      play: (s) => this.playStage(s),
      playDaily: () => this.playDaily(),
      openSettings: () => openSettings(() => this.home?.refreshCoins()),
      openStreak: () => openStreak(() => { this.home?.refreshCoins(); this.home?.refreshMapState(); this.home?.syncShelter(); }),
      openMissions: () => openMissions(() => { this.home?.refreshCoins(); this.home?.refreshMapState(); }),
      openDaily: () => openDaily(dailyChallenge(LEVELS).mod, () => this.playDaily()),
      evolve: (tier) => openEvolve(tier),
    }, this.ui, tab);
    this.home = home;
    const scene: Scene = { frame: (dt) => home.frame(dt), layout: () => home.layout(), destroy: () => home.destroy() };
    this.homeScene = scene;
    this.setScene(scene);
    const origSetTab = home.setTab.bind(home);
    home.setTab = (t2: Tab, initial = false) => { origSetTab(t2, initial); audio.playMusic(t2 === 'shelter' ? 'bgm_shelter' : 'bgm_home'); };
    if (tab === 'shelter' && opts.arrive?.length) home.syncShelter(opts.arrive);
    if (tab === 'shelter' && featureOpen('shelter') && !save().flags.unlock_shelter) markAnnounced('shelter');
    if (opts.wash) home.washMap(opts.wash);
    // queued announcements, one after another, never during play
    setTimeout(() => this.announceQueue(), opts.wash ? 1500 : 400);
  }

  private rebuildHome(tab: Tab) { this.goHome(tab); }

  private announceQueue() {
    if (!this.home || this.scene !== this.homeScene) return;
    const list = pendingUnlocks().filter((f) => !(f === 'shelter' && this.home?.tab === 'shelter'));
    const hadUnlocks = list.length > 0;
    const next = () => {
      const f = list.shift();
      if (!f) {
        // first stamp of the day, shown once when arriving at the hub (and not on top of other news)
        const s = save();
        const d = today();
        if (!hadUnlocks && !s.streak.claimedToday && s.stats.runs > 0 && !isOpen() && s.flags[`streakShown_${d}`] !== true) {
          s.flags[`streakShown_${d}`] = true; markDirty();
          openStreak(() => { this.home?.refreshCoins(); this.home?.refreshMapState(); });
        }
        return;
      }
      markAnnounced(f);
      openUnlock(f, () => { this.home?.refreshMapState(); setTimeout(next, 250); });
    };
    next();
  }

  // ---------------------------------------------------------------- play
  playStage(stage: number) {
    const level = LEVELS.find((l) => l.stage === stage) ?? LEVELS[0];
    this.startRun(level, null);
  }

  playDaily() {
    const d = dailyChallenge(LEVELS);
    track('daily_start', { mod: d.mod });
    this.startRun(d.level, { mod: d.mod, mods: d.mods });
  }

  private startRun(level: LevelDef, daily: { mod: string; mods: ReturnType<typeof dailyChallenge>['mods'] } | null) {
    closeAll();
    this.result?.destroy(); this.result = null;
    this.home = null;
    const botName = this.params.get('bot');
    const bot = botName === 'expert' ? BOT_EXPERT : botName === 'novice' ? BOT_NOVICE : botName ? BOT_PLAYER : undefined;
    const seed = Number(this.params.get('seed') || Math.floor(Math.random() * 1e6));
    const s = save();
    const assist = daily ? 0 : assistFor(level.stage);
    if (assist) track('assist_offer', { stage: level.stage, fails: s.attempts[`s${level.stage}`]?.failsInRow ?? 0, level: assist });
    const attempt = (s.attempts[`s${level.stage}`]?.tries ?? 0) + 1;
    const play = new PlayScreen({
      level, meta: metaPower(assist), known: knownSpecies(), seed, attempt, tutorial: level.stage === 1 && s.stats.runs === 0 && !daily,
      firstRuns: s.stats.runs, bot, newMonster: !daily && !s.cleared[`s${level.stage}`] ? level.intro ?? null : null, revives: 1, daily: daily ?? undefined,
      onSettings: () => openSettings(() => {}),
    }, this.ui, (r) => this.onPlayDone(play, r, !!daily, daily?.mod));
    this.setScene({ frame: (dt) => play.frame(dt), layout: () => play.layout(), destroy: () => play.destroy(), autoPause: () => play.autoPause() });
    if (assist) setTimeout(() => play.announce(t('stage.helpTitle'), t('stage.helpOffer', { hp: Math.round(assist * 30), dmg: Math.round(assist * 20) }), 'small'), 1200);
  }

  private onPlayDone(play: PlayScreen, r: PlayOutcome, daily: boolean, mod?: string) {
    const sum = applyRun(r.run, r.result, r.seconds, r.deathSource, daily);
    if (daily) track('daily_end', { mod, result: r.result });
    flush();
    // keep the last frame of the run under the result screen
    this.scene = { frame: (dt) => play.renderIdle(dt), layout: () => play.layout(), destroy: () => play.destroy() };
    if (this.params.has('bot') && this.params.has('loop')) { setTimeout(() => this.playStage(nextStage()), 1500); return; }
    this.showResult(sum, daily);
  }

  private showResult(sum: RunSummary, daily: boolean) {
    const win = sum.result === 'clear';
    const next = nextStage();
    const goShelter = sum.newSpecies.length > 0 && featureOpen('shelter');
    const playLabel = win ? (daily ? t('result.map') : t('result.next')) : t('result.retry');
    const playFn = () => { if (daily && win) this.goHome('map'); else if (daily) this.playDaily(); else this.playStage(win ? next : sum.stage); };
    const primary = goShelter
      ? { label: t('result.home'), icon: 'ic_shelter', fn: () => this.goHome('shelter', { arrive: sum.newSpecies }) }
      : { label: playLabel, icon: win ? 'ic_play' : 'ic_reset', fn: playFn };
    const secondary = goShelter
      ? { label: playLabel, icon: win ? 'ic_play' : 'ic_reset', fn: playFn }
      : { label: t('result.map'), icon: 'ic_map', fn: () => this.goHome('map', { wash: sum.firstClear ? sum.stage : undefined }) };
    audio.playMusic(null);
    if (featureOpen('upgrades') && !save().flags.unlock_upgrades) markAnnounced('upgrades');
    this.result = new ResultScreen(this.ui, sum, { primary, secondary, showUpgrades: featureOpen('upgrades'), onEvolve: (tier) => openEvolve(tier), daily });
  }
}

void h;
