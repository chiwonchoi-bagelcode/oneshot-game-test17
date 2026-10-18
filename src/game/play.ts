// One run from first room to the result: drives the simulation at a fixed
// step, turns its events into effects/sound/vibration, and owns the in-run UI
// (HUD, level-up cards, pause, revive, tutorial hints).
import { RESCUE, ROOM, SKILL_VALUES, SKILLS, xpToNext, type MonsterKind, type SkillId, type SpeciesId } from '../config/balance';
import { audio } from '../engine/audio';
import { buzz } from '../engine/haptics';
import { getInput, type InputController } from '../engine/input';
import { screen } from '../engine/screen';
import { draw } from '../engine/atlas';
import { t, num, pct } from '../i18n';
import { RoomView } from '../render/roomView';
import { Bot, type BotProfile } from '../sim/bot';
import { RoomSim } from '../sim/room';
import { applySkill, createRun, refreshStats, rollSkillChoices, xpProgress, type RunMods, type RunState } from '../sim/run';
import type { LevelDef, MetaPower, SimEvent } from '../sim/types';
import { track } from '../services/analytics';
import { h, icon, once } from '../ui/dom';
import { closeModal, openModal } from '../ui/modal';

export interface PlayOptions {
  level: LevelDef; meta: MetaPower; known: SpeciesId[]; seed: number; attempt: number;
  tutorial: boolean; firstRuns: number; daily?: { mod: string; mods: RunMods };
  bot?: BotProfile; newMonster?: MonsterKind | null; revives: number;
  // capture only: show the bot's input as a thumb on a floating joystick, with the first-run hints
  ghostThumb?: boolean;
  onSettings: () => void;
}

export interface PlayOutcome { run: RunState; result: 'clear' | 'fail' | 'quit'; seconds: number; deathSource: string | null; revivesUsed: number; roomsCleared: number }

const DT = 1 / 60;

export class PlayScreen {
  o: PlayOptions;
  run: RunState;
  sim!: RoomSim;
  view!: RoomView;
  input: InputController;
  bot: Bot | null;
  private acc = 0;
  private paused: 'none' | 'cards' | 'pause' | 'revive' | 'transition' | 'end' = 'none';
  private ui: HTMLElement;
  private hud: Record<string, HTMLElement> = {};
  private hint: HTMLElement;
  private banner: HTMLElement;
  private fade: HTMLElement;
  private ribbon: HTMLElement;
  private ribbonQ: { title: string; sub: string; cls: string }[] = [];
  private ribbonBusy = false;
  private onDone: (r: PlayOutcome) => void;
  private revivesUsed = 0;
  private lastHp = -1; private lastCoins = -1; private lastXp = -1; private lastFriends = -1; private lastLv = -1;
  private hintState = { moved: false, fired: false, pressureShown: false, rescueShown: false, gateShown: false, idleTime: 0, rangeShown: 0, rescueTime: 0 };
  private roomStart = 0;
  private coinStreak = 0; private coinStreakT = 0;
  private finished = false;
  private stageBanner = 0;
  private introShown = false;

  constructor(o: PlayOptions, uiRoot: HTMLElement, onDone: (r: PlayOutcome) => void) {
    this.o = o; this.onDone = onDone;
    this.run = createRun(o.level, o.meta, { known: o.known, seed: o.seed, mods: o.daily?.mods, revives: o.revives, daily: !!o.daily });
    this.input = getInput(); this.input.release(); this.input.joy.everMoved = false;
    this.input.enabled = !o.bot;
    this.bot = o.bot ? new Bot(o.bot, o.seed) : null;
    this.ui = h('div', { class: 'play-ui' });
    uiRoot.appendChild(this.ui);
    this.buildHud();
    this.hint = h('div', { class: 'hint' });
    this.banner = h('div', { class: 'banner' });
    this.fade = h('div', { class: 'fade' });
    this.ribbon = h('div', { class: 'ribbon' });
    this.ui.append(this.hint, this.banner, this.ribbon, this.fade);
    this.enterRoom(0);
    track('run_start', { stage: o.level.stage, attempt: o.attempt, daily: !!o.daily, assist: o.meta.assist, gunTier: this.run.stats.gunTier });
  }

  // ---------------------------------------------------------------- HUD
  private buildHud() {
    const pauseBtn = h('button', { class: 'btn-icon hud-pause', 'aria-label': t('pause.title'), onclick: once(() => this.openPause()) }, icon('ic_pause', 30));
    const hpFill = h('div', { class: 'bar-fill hp' });
    const hpText = h('div', { class: 'bar-text' });
    const hp = h('div', { class: 'hud-hp' }, icon('ic_heart', 30, 'hud-hp-ic'), h('div', { class: 'bar' }, hpFill, hpText));
    const coinText = h('span', { class: 'num' }, '0');
    const coins = h('div', { class: 'hud-coins pill' }, icon('p_coin_0', 26), coinText);
    const xpFill = h('div', { class: 'bar-fill xp' });
    const lv = h('div', { class: 'hud-lv' }, 'Lv 1');
    const xp = h('div', { class: 'hud-xp' }, lv, h('div', { class: 'bar thin' }, xpFill));
    const rooms = h('div', { class: 'hud-rooms' });
    const friends = h('div', { class: 'hud-friends' });
    const top = h('div', { class: 'hud-top' }, pauseBtn, hp, coins);
    const hud = h('div', { class: 'hud' }, top, h('div', { class: 'hud-row2' }, xp, rooms), friends);
    this.ui.appendChild(hud);
    Object.assign(this.hud, { hpFill, hpText, coinText, xpFill, lv, rooms, friends, coins, hp, root: hud });
    this.joyEl = h('div', { class: 'joy' }, h('div', { class: 'joy-knob' }));
    this.ui.appendChild(this.joyEl);
  }
  private joyEl!: HTMLElement;

  hudHeight(): number {
    const r = this.hud.root?.getBoundingClientRect();
    return r ? r.bottom + 4 : 90;
  }

  private updateHud() {
    const p = this.sim.player; const st = this.run.stats;
    const hp = Math.ceil(p.hp);
    if (hp !== this.lastHp) {
      if (this.lastHp >= 0 && hp < this.lastHp) { this.hud.hp.classList.remove('shake'); void this.hud.hp.offsetWidth; this.hud.hp.classList.add('shake'); }
      this.lastHp = hp;
      this.hud.hpFill.style.width = `${Math.max(0, Math.min(100, (p.hp / st.maxHp) * 100))}%`;
      this.hud.hpText.textContent = `${num(hp)} / ${num(st.maxHp)}`;
      this.hud.hpFill.classList.toggle('low', p.hp / st.maxHp < 0.3);
    }
    if (this.run.coins !== this.lastCoins) {
      if (this.lastCoins >= 0) { this.hud.coins.classList.remove('pop'); void this.hud.coins.offsetWidth; this.hud.coins.classList.add('pop'); }
      this.lastCoins = this.run.coins; this.hud.coinText.textContent = num(this.run.coins);
    }
    const xp = Math.round(xpProgress(this.run) * 100);
    const lvShown = this.run.xpLevel + this.run.pendingLevelUps;
    if (xp !== this.lastXp || lvShown !== this.lastLv) {
      this.lastXp = xp; this.lastLv = lvShown;
      this.hud.xpFill.style.width = `${xp}%`;
      this.hud.lv.textContent = t('hud.lv', { n: lvShown });
    }
    if (this.run.rescued.length !== this.lastFriends) {
      this.lastFriends = this.run.rescued.length;
      this.hud.friends.replaceChildren(...this.run.rescued.map((s) => icon(`p_${s}`, 34, 'friend')));
    }
  }

  private updateRoomDots() {
    const n = this.run.level.rooms.length;
    this.hud.rooms.replaceChildren(...Array.from({ length: n }, (_, i) => h('span', { class: 'dot' + (i < this.run.roomIndex ? ' done' : i === this.run.roomIndex ? ' cur' : '') + (i === n - 1 && this.run.level.boss ? ' boss' : '') })));
  }

  // ---------------------------------------------------------------- rooms
  private enterRoom(i: number) {
    this.run.roomIndex = i;
    this.sim = new RoomSim(this.run, i, this.o.seed * 131 + i * 17);
    this.view = new RoomView(this.sim, this.run.level.region, `${this.run.level.id}:${i}`);
    this.layout();
    this.roomStart = this.run.time;
    this.lastHp = -1;
    this.updateRoomDots();
    audio.playMusic(this.run.level.boss && i === this.run.level.rooms.length - 1 ? 'bgm_boss' : `bgm_${this.run.level.region}`);
    // announce a goo type that appears for the first time
    if (this.o.newMonster && !this.o.tutorial && !this.introShown && this.sim.def.monsters.some((m) => m.t === this.o.newMonster)) {
      this.introShown = true;
      const k = this.o.newMonster;
      setTimeout(() => this.showBanner(t('toast.newMonster'), t(`monster.${k}`), t(`monster.${k}.desc`), `m_${k === 'boss' ? 'boss_' + this.run.level.region : k === 'flyer' ? 'flyer' : k}_normal${k === 'flyer' ? '_0' : ''}`), 500);
    }
    if (i === 0 && !this.o.tutorial) {
      setTimeout(() => this.showBanner(t(`region.${this.run.level.region}`), this.o.daily ? t('daily.title') : t('stage.short', { n: ((this.run.level.stage - 1) % 10) + 1 }), '', null), 150);
    }
  }

  layout() {
    if (!this.view) return;
    const top = this.hudHeight();
    this.view.layout({ viewW: screen.w, viewH: screen.h, top, bottom: Math.max(6, screen.safe.bottom * 0.6) });
  }

  private nextRoom() {
    this.paused = 'transition';
    audio.loop('spray_loop', false);
    audio.play('whoosh', { vol: 0.7 });
    this.fade.classList.add('on');
    this.run.hp = this.sim.player.hp; this.run.shield = this.sim.player.shield;
    setTimeout(() => {
      this.enterRoom(this.run.roomIndex + 1);
      this.fade.classList.remove('on');
      this.paused = 'none';
    }, 380);
  }

  // ---------------------------------------------------------------- loop
  frame(dtReal: number) {
    if (this.finished) return;
    const v = this.view;
    let scale = 1;
    if (v.slowmo > 0) scale = 0.35;
    if (this.paused === 'none') {
      this.acc += Math.min(0.1, dtReal) * scale;
      let steps = 0;
      while (this.acc >= DT && steps < 6) {
        this.acc -= DT; steps++;
        const input = this.bot ? this.bot.decide(this.sim, DT) : { mx: this.input.joy.mx, my: this.input.joy.my };
        if (this.bot) this.botInput = input;
        this.sim.step(DT, input);
        for (const e of this.sim.drain()) this.onEvent(e);
        if (this.paused !== 'none') break;
      }
      this.afterStep();
    }
    v.update(Math.min(0.05, dtReal) * (this.paused === 'none' ? scale : this.paused === 'cards' || this.paused === 'pause' ? 0 : 1));
    v.render(screen.ctx, screen.dpr, screen.w, screen.h);
    this.drawJoystick();
    this.updateHud();
    this.updateHints(dtReal);
    // spray sound follows the stream
    const p = this.sim.player;
    if (p.firing && this.paused === 'none') audio.loop('spray_loop', true, 0.32 + p.pressure * 0.25, 0.9 + p.pressure * 0.25);
    else audio.loop('spray_loop', false);
    this.coinStreakT -= dtReal; if (this.coinStreakT <= 0) this.coinStreak = 0;
  }

  private botInput = { mx: 0, my: 0 };
  private ghostBase: [number, number] | null = null;

  private drawJoystick() {
    const j = this.input.joy;
    if (this.o.ghostThumb && this.bot) {
      // the bot's stick as a real thumb would show it: appears where the thumb lands, gone when lifted
      const { mx, my } = this.botInput; const on = Math.hypot(mx, my) > 0.15 && this.paused === 'none';
      if (on && !this.ghostBase) { this.ghostBase = [screen.w * 0.6, screen.h * 0.8]; j.everMoved = true; }
      if (!on) this.ghostBase = null;
      if (this.ghostBase) {
        this.joyEl.style.display = 'block'; this.joyEl.classList.add('ghost');
        this.joyEl.style.transform = `translate(${this.ghostBase[0]}px, ${this.ghostBase[1]}px)`;
        (this.joyEl.firstChild as HTMLElement).style.transform = `translate(${mx * 40}px, ${my * 40}px)`;
      } else this.joyEl.style.display = 'none';
      return;
    }
    if (j.active && !this.bot) {
      this.joyEl.style.display = 'block';
      this.joyEl.style.transform = `translate(${j.ox}px, ${j.oy}px)`;
      const knob = this.joyEl.firstChild as HTMLElement;
      const dx = Math.max(-46, Math.min(46, j.x - j.ox)), dy = Math.max(-46, Math.min(46, j.y - j.oy));
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    } else this.joyEl.style.display = 'none';
    void draw;
  }

  private afterStep() {
    const sim = this.sim;
    // level-up cards once the room is clear and drops are collected
    if (sim.state === 'clear' && this.run.pendingLevelUps > 0 && (sim.pickupsLeft() === 0 || sim.stateTime > 1.6) && this.paused === 'none' && !(sim.isLast && sim.state === 'clear' && false)) {
      if (!sim.isLast) this.showCards();
      else this.run.pendingLevelUps = 0;
    }
    if (sim.state === 'dead' && this.paused === 'none' && sim.stateTime > 0.9) this.onDeath();
  }

  // ---------------------------------------------------------------- events
  private onEvent(e: SimEvent) {
    this.view.onEvent(e);
    const run = this.run;
    switch (e.t) {
      case 'hit': audio.play('goo_hit', { vol: 0.45, rate: e.kind === 'chunky' || e.kind === 'boss' ? 0.75 : e.kind === 'mini' ? 1.3 : 1 }); break;
      case 'burst': {
        const big = e.r > 40;
        audio.play(big ? 'goo_burst_big' : 'goo_burst', { vol: 0.9, rate: 1 + Math.min(8, e.combo - 1) * 0.045, vary: 0.04 });
        buzz(big ? 'medium' : 'light');
        if (e.boss) { audio.stinger('stinger_clear'); buzz('heavy'); }
        break;
      }
      case 'fireStart': audio.play('spray_start', { vol: 0.6 }); if (!this.hintState.fired) { this.hintState.fired = true; track('tutorial_step', { step: 'first_spray', t: Math.round(run.time) }); } break;
      case 'pressureFull': audio.play('pressure_full', { vol: 0.7 }); buzz('tick'); if (this.o.tutorial && !this.hintState.pressureShown) { this.hintState.pressureShown = true; this.announce(t('toast.pressure'), t('hint.pressure'), 'small'); } break;
      case 'cocoonHit': audio.play('cocoon_hit', { vol: 0.6 }); break;
      case 'rescue': {
        audio.play('rescue', { vol: 1, vary: 0 }); audio.duckMusic(0.45, 1.6);
        setTimeout(() => audio.play(`chirp_${1 + (run.rescued.length % 3)}`, { vol: 0.9 }), 350);
        buzz('success');
        const name = t(`species.${e.species}`);
        const cheer = run.rescued.length <= RESCUE.cheerMaxAnimals ? t('toast.cheer', { p: pct(RESCUE.cheerDamagePerAnimal) }) : '';
        this.announce(t('toast.rescued', { name }), [e.brave ? t('toast.brave') : '', cheer].filter(Boolean).join(' · '), 'rescue');
        track('animal_rescue', { species: e.species, stage: run.stage, first: e.first, brave: e.brave });
        if (run.rescued.length === 1 && this.o.tutorial) track('tutorial_step', { step: 'first_rescue', t: Math.round(run.time) });
        break;
      }
      case 'playerHit': audio.play('player_hit', { vol: 0.9 }); buzz('heavy'); break;
      case 'shieldPop': audio.play('shield_pop', { vol: 0.9 }); buzz('light'); break;
      case 'spit': audio.play('enemy_spit', { vol: e.kind === 'boss' || e.kind === 'chunky' ? 0.8 : 0.5 }); break;
      case 'telegraph': if (e.kind === 'chunky' || e.kind === 'boss' || e.kind === 'jumper' || e.kind === 'dasher') audio.play('enemy_charge', { vol: 0.5 }); break;
      case 'dash': audio.play('enemy_dash', { vol: 0.6 }); break;
      case 'land': audio.play('enemy_land', { vol: 0.8 }); buzz('light'); break;
      case 'split': audio.play('goo_split', { vol: 0.6 }); break;
      case 'pickup': {
        if (e.kind === 'coin') { this.coinStreak++; this.coinStreakT = 0.4; audio.play('pickup_coin', { vol: 0.45, rate: 1 + Math.min(10, this.coinStreak) * 0.03, vary: 0.02 }); }
        else if (e.kind === 'xp') audio.play('pickup_xp', { vol: 0.35, rate: 1 + Math.min(12, this.coinStreak) * 0.02 });
        else audio.play('heal', { vol: 0.8 });
        break;
      }
      case 'roomClear': {
        audio.play('room_clear', { vol: 0.9 }); buzz('success');
        this.announce(t('toast.clean'), '', 'clean');
        if (!this.sim.hitThisRoom) run.noHitRooms++;
        track('room_clear', { stage: run.stage, room: run.roomIndex, seconds: Math.round(run.time - this.roomStart), hit: this.sim.hitThisRoom });
        if (run.stage === 1 && run.roomIndex === 0 && this.o.tutorial) track('tutorial_step', { step: 'first_room', t: Math.round(run.time) });
        break;
      }
      case 'gateOpen': audio.play('gate_open', { vol: 0.8 }); break;
      case 'exit': {
        if (this.sim.isLast) this.finish('clear');
        else this.nextRoom();
        break;
      }
      case 'bossPhase': audio.play('boss_roar', { vol: 0.9 }); this.announce(t('toast.bossPhase'), '', 'warn'); buzz('medium'); break;
      case 'spawnMark': break;
      case 'trailPop': audio.play('shield_pop', { vol: 0.35, rate: 1.4 }); break;
      case 'dead': audio.loop('spray_loop', false); audio.play('player_hit', { vol: 1, rate: 0.8 }); buzz('fail'); break;
      default: break;
    }
  }

  // ---------------------------------------------------------------- tutorial hints
  private updateHints(dt: number) {
    const hs = this.hintState; const sim = this.sim; const p = sim.player;
    if (this.input.joy.everMoved && !hs.moved) { hs.moved = true; track('tutorial_step', { step: 'move', t: Math.round(this.run.time) }); }
    let text = ''; let wx = p.x, wy = p.y - 120; let showHand = false;
    const human = !this.bot || !!this.o.ghostThumb;
    const tut = this.o.tutorial && human;
    if (tut && !hs.moved && this.paused === 'none') { text = t('hint.drag'); showHand = true; wy = p.y + 30; }
    else if (tut && hs.moved && !hs.fired && p.moving && sim.state === 'fight' && this.run.time > 1.5) { text = t('hint.stop'); }
    else if (tut && sim.state === 'fight' && this.run.roomIndex === 0) {
      const c = sim.cocoons.find((cc) => !cc.freed);
      // point at the cocoon until the player starts washing it (or for 6 s), then get out of the way
      if (c && c.hp < c.maxHp) hs.rescueShown = true;
      if (c && Math.hypot(c.x - p.x, c.y - p.y) < 380 && !hs.rescueShown && hs.fired) { text = t('hint.rescue'); wx = c.x; wy = c.y - 110; hs.rescueTime += dt; if (hs.rescueTime > 6) hs.rescueShown = true; }
    }
    if (!text && sim.state === 'fight' && !p.moving && !p.firing && p.stillTime > 1.2 && this.o.firstRuns < 4 && human) { text = t('hint.range'); hs.rangeShown += dt; }
    if (!text && sim.gateOpen && sim.state === 'clear' && this.o.firstRuns < 3 && human) {
      hs.idleTime += p.moving ? 0 : dt;
      if (hs.idleTime > 2.2 && sim.cocoonsLeft() === 0) { text = t('hint.gate'); wx = ROOM.width / 2; wy = ROOM.wall + 150; }
    }
    if (text) {
      const [sx, sy] = this.view.worldToScreen(wx, wy);
      if (this.hint.dataset.text !== text) { this.hint.dataset.text = text; this.hint.replaceChildren(...(showHand ? [icon('mk_hand', 54, 'hint-hand')] : []), h('span', {}, text)); }
      this.hint.style.transform = `translate(${Math.round(Math.max(90, Math.min(screen.w - 90, sx)))}px, ${Math.round(Math.max(this.hudHeight() + 30, Math.min(screen.h - 60, sy)))}px) translate(-50%, -50%)`;
      this.hint.classList.add('show');
      this.hint.classList.toggle('with-hand', showHand);
    } else { this.hint.classList.remove('show'); this.hint.dataset.text = ''; }
  }

  // One big message at a time, in the upper middle of the screen.
  // One ribbon at a time. A rescue or a warning never waits behind a tip: it cuts
  // the tip short (the tip comes back afterwards) and goes ahead of other news.
  announce(title: string, sub = '', cls = '') {
    const item = { title, sub, cls };
    const urgent = cls === 'rescue' || cls === 'warn';
    if (urgent && this.ribbonBusy && this.ribbonCur?.cls === 'small') {
      for (const id of this.ribbonTimers) clearTimeout(id);
      this.ribbonQ.push(this.ribbonCur);
      this.ribbonQ.unshift(item);
      this.nextRibbon();
      return;
    }
    if (this.ribbonQ.length >= 2) this.ribbonQ.shift();
    if (urgent) { const i = this.ribbonQ.findIndex((q) => q.cls !== 'rescue' && q.cls !== 'warn'); if (i >= 0) this.ribbonQ.splice(i, 0, item); else this.ribbonQ.push(item); }
    else this.ribbonQ.push(item);
    if (!this.ribbonBusy) this.nextRibbon();
  }

  private ribbonCur: { title: string; sub: string; cls: string } | null = null;
  private ribbonTimers: number[] = [];

  private nextRibbon() {
    const it = this.ribbonQ.shift();
    this.ribbonCur = it ?? null;
    if (!it) { this.ribbonBusy = false; return; }
    this.ribbonBusy = true;
    this.ribbon.className = 'ribbon ' + it.cls;
    this.ribbon.replaceChildren(h('div', { class: 'ribbon-title' }, it.title), it.sub ? h('div', { class: 'ribbon-sub' }, it.sub) : '');
    void this.ribbon.offsetWidth; this.ribbon.classList.add('show');
    this.ribbonTimers = [window.setTimeout(() => this.ribbon.classList.remove('show'), 1150), window.setTimeout(() => this.nextRibbon(), 1400)];
  }

  private showBanner(title: string, sub: string, desc: string, sprite: string | null) {
    this.banner.replaceChildren(
      ...(sprite ? [icon(sprite, 64, 'banner-ic')] : []),
      h('div', { class: 'banner-txt' }, h('div', { class: 'banner-title' }, title), sub ? h('div', { class: 'banner-sub' }, sub) : null, desc ? h('div', { class: 'banner-desc' }, desc) : null),
    );
    this.banner.classList.remove('show'); void this.banner.offsetWidth; this.banner.classList.add('show');
    clearTimeout(this.stageBanner);
    this.stageBanner = window.setTimeout(() => this.banner.classList.remove('show'), 2600);
  }

  // ---------------------------------------------------------------- level-up cards
  private showCards() {
    const choices = rollSkillChoices(this.run);
    if (!choices.length) { this.run.pendingLevelUps = 0; return; }
    this.paused = 'cards';
    this.input.release();
    audio.loop('spray_loop', false);
    audio.play('level_up', { vol: 0.9 }); buzz('medium');
    const lvl = this.run.xpLevel + 1;
    const pick = (id: SkillId) => {
      if (!ready) return;
      ready = false;
      audio.play('card_pick', { vol: 0.9 });
      this.run.hp = this.sim.player.hp;
      applySkill(this.run, id);
      this.sim.player.hp = this.run.hp;
      if (id === 'shield') { this.sim.player.shield = true; }
      track('skill_pick', { skill: id, options: choices.join(','), level: lvl });
      if (this.o.tutorial && lvl === 2) track('tutorial_step', { step: 'first_skill', t: Math.round(this.run.time) });
      const card = body.querySelector(`[data-skill="${id}"]`); card?.classList.add('picked');
      setTimeout(() => { closeModal('levelup', true); this.paused = 'none'; this.lastHp = -1; }, 380);
    };
    let ready = false;
    setTimeout(() => (ready = true), 350);
    const cards = choices.map((id) => {
      const stacks = this.run.skills[id] || 0; const max = SKILLS.find((s) => s.id === id)!.max;
      const desc = t(`skill.${id}.desc`, id === 'shield' ? { s: SKILL_VALUES.shieldRegen[Math.min(2, stacks)] } : undefined);
      return h('button', { class: 'skill-card', 'data-skill': id, onclick: () => pick(id) },
        icon(`ic_skill_${id}`, 64, 'skill-ic'),
        h('div', { class: 'skill-txt' },
          h('div', { class: 'skill-name' }, t(`skill.${id}.name`)),
          h('div', { class: 'skill-desc' }, desc),
          id !== 'heal' ? h('div', { class: 'skill-dots' }, ...Array.from({ length: max }, (_, k) => h('span', { class: 'sdot' + (k < stacks ? ' on' : k === stacks ? ' next' : '') }))) : null,
        ));
    });
    const body = h('div', { class: 'levelup' }, h('div', { class: 'levelup-sub' }, t('levelup.pick')), ...cards);
    openModal(body, { id: 'levelup', title: t('levelup.title'), titleIcon: 'p_star', closable: false, cls: 'modal-levelup' });
    if (this.bot) setTimeout(() => { ready = true; pick(this.bot!.chooseSkill(choices, this.sim.player.hp / this.run.stats.maxHp)); }, 900);
    void xpToNext;
  }

  // ---------------------------------------------------------------- pause / revive / end
  openPause() {
    if (this.paused !== 'none' || this.finished) return;
    this.paused = 'pause'; this.input.release(); audio.loop('spray_loop', false);
    const body = h('div', { class: 'pause' },
      h('button', { class: 'btn btn-primary big', onclick: once(() => { closeModal('pause'); }) }, icon('ic_play', 30), t('pause.resume')),
      h('button', { class: 'btn btn-plain', onclick: once(() => this.o.onSettings()) }, icon('ic_gear', 28), t('pause.settings')),
      h('div', { class: 'pause-note' }, t('pause.quitNote')),
      h('button', { class: 'btn btn-warn', onclick: once(() => { closeModal('pause', true); this.finish('quit'); }) }, icon('ic_exit', 28), t('pause.quit')),
    );
    openModal(body, { id: 'pause', title: t('pause.title'), onClose: () => { if (this.paused === 'pause') this.paused = 'none'; } });
  }

  // pause when the app goes to the background
  autoPause() { if (this.paused === 'none' && !this.finished && !this.bot) this.openPause(); }

  private onDeath() {
    if (this.run.revives > 0 && !this.bot) {
      this.paused = 'revive';
      const body = h('div', { class: 'revive' },
        h('div', { class: 'revive-art' }, icon('kid_sad_0', 120)),
        h('div', { class: 'revive-desc' }, t('revive.desc')),
        h('button', { class: 'btn btn-primary big', onclick: once(() => { closeModal('revive', true); this.doRevive(); }) }, icon('ic_heart', 30), t('revive.yes')),
        h('button', { class: 'btn btn-plain', onclick: once(() => { closeModal('revive', true); this.finish('fail'); }) }, t('revive.no')),
      );
      openModal(body, { id: 'revive', title: t('revive.title'), closable: false });
    } else if (this.run.revives > 0 && this.bot) { this.doRevive(); }
    else this.finish('fail');
  }

  private doRevive() {
    this.run.revives--; this.revivesUsed++;
    this.sim.revive(this.run.stats.reviveHp);
    audio.play('revive', { vol: 1 }); buzz('success');
    this.view.fx.spawn('fx_ring', this.sim.player.x, this.sim.player.y - 20, { max: 0.6, scale: 0.5, scale1: 3, alpha: 0.9 });
    this.paused = 'none';
    track('revive', { stage: this.run.stage, room: this.run.roomIndex });
  }

  private finish(result: 'clear' | 'fail' | 'quit') {
    if (this.finished) return;
    this.finished = true; this.paused = 'end';
    audio.loop('spray_loop', false);
    this.input.enabled = false; this.input.release();
    this.run.hp = this.sim.player.hp;
    refreshStats(this.run);
    const src = Object.entries(this.run.dmgBy).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const out: PlayOutcome = { run: this.run, result, seconds: Math.round(this.run.time), deathSource: src, revivesUsed: this.revivesUsed, roomsCleared: this.run.roomsCleared };
    track('run_end', { stage: this.run.stage, result, rooms: this.run.roomsCleared, seconds: out.seconds, rescued: this.run.rescued.length, coins: this.run.coins, washed: this.run.washed, hits: this.run.hits, deathSource: src, revivesUsed: this.revivesUsed, level: this.run.xpLevel, daily: this.run.daily });
    this.onDone(out);
  }

  // keep rendering the last frame under the result screen
  renderIdle(dt: number) {
    this.view.update(dt * 0.5);
    this.view.render(screen.ctx, screen.dpr, screen.w, screen.h);
  }

  destroy() {
    this.input.enabled = false;
    this.ui.remove();
    audio.loop('spray_loop', false);
  }
}
