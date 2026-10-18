// Home hub: world map (Adventure), Upgrades and Shelter tabs, with the daily
// features on the side of the map. Rendering of map/shelter goes to the canvas.
import { DECOR, FESTIVAL, GIFTS, SPECIES, UPGRADES, type SpeciesId } from '../config/balance';
import { audio } from '../engine/audio';
import { buzz } from '../engine/haptics';
import { screen } from '../engine/screen';
import { t, num, pct } from '../i18n';
import {
  bondProgress, buyDecor, collectGifts, featureOpen, featureUpgradeOpen, giftRate, giftsPending, highestCleared, isCleared,
  festivalActive, missionsClaimable, nextStage, stageUnlocked, upgradeInfo, assistFor, bonds,
} from '../meta/progress';
import { save } from '../meta/save';
import { MapView, regionOf } from '../render/mapView';
import { ShelterView } from '../render/shelterView';
import { bondBonus } from '../sim/stats';
import type { LevelDef } from '../sim/types';
import { track } from '../services/analytics';
import { h, icon, once } from './dom';
import { closeModal, isOpen, openModal, toast } from './modal';
import { UpgradePanel } from './upgrades';
import { openFestival } from './popups';

export type Tab = 'map' | 'upgrade' | 'shelter';

export interface HomeApi {
  levels: LevelDef[];
  play(stage: number): void;
  playDaily(): void;
  openSettings(): void;
  openStreak(): void;
  openMissions(): void;
  openDaily(): void;
  evolve(tier: number): void;
}

export function stageName(stage: number) { return t('stage.label', { r: t(`region.${regionOf(stage)}`), n: ((stage - 1) % 10) + 1 }); }

export function speciesWhere(sp: SpeciesId, levels: LevelDef[]): string {
  if (sp === 'penguin') return t('shelter.whereStreak', { n: 2 });
  if (sp === 'panda') return t('shelter.whereStreak', { n: 5 });
  const lv = levels.find((l) => l.rooms.some((r) => r.animals.some((a) => a.s === sp)));
  return lv ? t('shelter.where', { place: stageName(lv.stage) }) : '';
}

export class HomeScreen {
  tab: Tab = 'map';
  api: HomeApi;
  map = new MapView();
  shelter = new ShelterView();
  root: HTMLElement;
  private coinEl!: HTMLElement;
  private navBtns: Record<Tab, HTMLElement> = {} as Record<Tab, HTMLElement>;
  private pages: Record<Tab, HTMLElement> = {} as Record<Tab, HTMLElement>;
  private upPanel: UpgradePanel | null = null;
  private side!: HTMLElement;
  private cta!: HTMLElement;
  private giftBtn!: HTMLElement;
  private shelterHead!: HTMLElement;
  private festPill!: HTMLElement;
  private drag = { on: false, id: -1, y0: 0, y: 0, x0: 0, moved: 0, t: 0, vy: 0, lastY: 0, lastT: 0 };
  private badgeTimer = 0;

  constructor(api: HomeApi, ui: HTMLElement, tab: Tab = 'map') {
    this.api = api;
    this.map.regionLabel = (k) => t(`region.${k}`);
    this.map.cleared = (s) => isCleared(s);
    this.root = h('div', { class: 'home' });
    ui.appendChild(this.root);
    this.build();
    this.layout();
    this.refreshMapState();
    this.map.focus(this.map.current);
    this.setTab(tab, true);
    screen.canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    screen.canvas.addEventListener('wheel', this.onWheel, { passive: true });
  }

  // ---------------------------------------------------------------- DOM
  private build() {
    this.coinEl = h('span', { class: 'num' }, num(save().coins));
    this.shelterHead = h('div', { class: 'sh-head' });
    const settings = h('button', { class: 'btn-icon', 'aria-label': t('settings.title'), onclick: once(() => this.api.openSettings()) }, icon('ic_gear', 32));
    // weekend festival pill (map tab only), opens the festival details
    this.festPill = h('button', { class: 'fest-pill', onclick: once(() => openFestival()) }, icon('ic_festival', 34), h('span', {}, t('festival.pill', { x: FESTIVAL.coinMul })));
    const top = h('div', { class: 'topbar' }, h('div', { class: 'pill coin-pill' }, icon('p_coin_0', 28), this.coinEl), h('div', { class: 'grow' }, this.shelterHead, this.festPill), settings);
    // side buttons on the map
    this.side = h('div', { class: 'side' });
    this.cta = h('button', { class: 'btn btn-primary big cta', onclick: once(() => this.api.play(this.map.current)) });
    this.pages.map = h('div', { class: 'page page-map' }, this.side, this.cta);
    // upgrades page
    this.pages.upgrade = h('div', { class: 'page page-up' });
    // shelter overlay
    this.giftBtn = h('button', { class: 'btn btn-green gift-btn', onclick: once(() => this.collect()) });
    const shBtns = h('div', { class: 'sh-btns' },
      h('button', { class: 'btn btn-plain sq', onclick: once(() => this.openAlbum()) }, icon('ic_paw', 32), h('span', {}, t('shelter.list'))),
      h('button', { class: 'btn btn-plain sq decor-btn', onclick: once(() => this.openDecor()) }, icon('dc_flowers', 34), h('span', {}, t('shelter.decor'))),
    );
    const shCta = h('button', { class: 'btn btn-primary big cta', onclick: once(() => this.api.play(nextStage())) });
    this.pages.shelter = h('div', { class: 'page page-shelter' }, h('div', { class: 'sh-row' }, this.giftBtn, shBtns), shCta);
    (this.pages.shelter as HTMLElement & { cta: HTMLElement }).cta = shCta;
    const nav = h('div', { class: 'nav' });
    for (const [k, ic, label] of [['upgrade', 'ic_upgrade', 'nav.upgrade'], ['map', 'ic_map', 'nav.map'], ['shelter', 'ic_shelter', 'nav.shelter']] as [Tab, string, string][]) {
      const b = h('button', { class: 'nav-btn', 'data-tab': k, onclick: () => this.setTab(k) }, icon(ic, 40), h('span', {}, t(label)));
      this.navBtns[k] = b; nav.appendChild(b);
    }
    this.root.append(this.pages.map, this.pages.upgrade, this.pages.shelter, top, nav);
  }

  refreshCoins() { this.coinEl.textContent = num(save().coins); this.coinEl.parentElement?.classList.remove('pop'); void this.coinEl.offsetWidth; this.coinEl.parentElement?.classList.add('pop'); this.refreshBadges(); }

  refreshMapState() {
    this.map.current = nextStage();
    const known = new Set(SPECIES.filter((s) => (save().rescued[s.id] || 0) > 0).map((s) => s.id));
    this.map.newFriendAt = new Set(this.api.levels.filter((l) => l.rooms.some((r) => r.animals.some((a) => !known.has(a.s)))).map((l) => l.stage));
    const st = this.map.current;
    this.cta.replaceChildren(icon('ic_play', 32), h('span', { class: 'cta-txt' }, h('span', { class: 'cta-small' }, t('stage.play')), h('span', {}, stageName(st))));
    const sc = (this.pages.shelter as HTMLElement & { cta: HTMLElement }).cta;
    sc.replaceChildren(icon('ic_play', 32), h('span', { class: 'cta-txt' }, h('span', { class: 'cta-small' }, t('stage.play')), h('span', {}, stageName(st))));
    this.buildSide();
    this.refreshBadges();
  }

  private buildSide() {
    const s = save(); const items: HTMLElement[] = [];
    const mk = (ic: string, label: string, badge: boolean, fn: () => void) => h('button', { class: 'side-btn', onclick: once(fn) }, icon(ic, 40), h('span', {}, label), badge ? h('span', { class: 'badge' }, '!') : null);
    items.push(mk('ic_streak', t('streak.title'), !s.streak.claimedToday, () => this.api.openStreak()));
    if (featureOpen('missions')) items.push(mk('ic_missions', t('missions.title'), missionsClaimable() > 0, () => this.api.openMissions()));
    if (featureOpen('daily')) items.push(mk('ic_daily', t('daily.title'), !s.daily.cleared, () => this.api.openDaily()));
    this.side.replaceChildren(...items);
  }

  private refreshBadges() {
    const coins = save().coins;
    const canBuy = UPGRADES.some((u) => { const i = upgradeInfo(u.id); return featureUpgradeOpen(u.id) && !i.maxed && i.cost <= coins; });
    setBadge(this.navBtns.upgrade, canBuy && featureOpen('upgrades'));
    setBadge(this.navBtns.shelter, featureOpen('shelter') && giftsPending() >= 10);
    this.navBtns.upgrade.classList.toggle('hidden', !featureOpen('upgrades'));
    this.navBtns.shelter.classList.toggle('hidden', !featureOpen('shelter'));
  }

  setTab(tab: Tab, initial = false) {
    if (tab === this.tab && !initial) return;
    if (!initial) audio.play('ui_tap', { vol: 0.6 });
    this.tab = tab;
    for (const k of Object.keys(this.pages) as Tab[]) { this.pages[k].classList.toggle('on', k === tab); this.navBtns[k].classList.toggle('on', k === tab); }
    this.shelterHead.classList.toggle('on', tab === 'shelter');
    this.festPill.classList.toggle('on', tab === 'map' && festivalActive());
    if (tab === 'upgrade') {
      if (!this.upPanel) {
        this.upPanel = new UpgradePanel({ onCoins: () => this.refreshCoins(), onEvolve: (tier) => this.api.evolve(tier) });
        const cta = h('button', { class: 'btn btn-primary big cta-inline', onclick: once(() => this.api.play(nextStage())) }, icon('ic_play', 32), h('span', {}, t('stage.play')));
        const bonusBox = h('div', { class: 'bonus-box' });
        this.pages.upgrade.replaceChildren(h('div', { class: 'page-title' }, icon('ic_upgrade', 40), h('span', {}, t('upgrade.title'))), h('div', { class: 'page-scroll' }, this.upPanel.el, bonusBox, h('div', { class: 'dream' }, icon('gun_6', 64), h('span', {}, t('upgrade.dream'))), cta));
        (this.pages.upgrade as HTMLElement & { bonus: HTMLElement }).bonus = bonusBox;
      } else this.upPanel.refresh();
      this.renderBonuses((this.pages.upgrade as HTMLElement & { bonus: HTMLElement }).bonus);
    }
    if (tab === 'shelter') { this.syncShelter(); track('shelter_open', { animals: this.shelter.pets.length }); if (!save().flags.unlock_shelter && featureOpen('shelter')) { save().flags.unlock_shelter = true; } }
    if (tab === 'map') { this.refreshMapState(); }
    this.layout();
  }

  private renderBonuses(box: HTMLElement) {
    const meta = { upgrades: save().upgrades, bonds: bonds(), assist: false };
    const rows = SPECIES.filter((s) => meta.bonds[s.id]).map((s) => h('div', { class: 'bonus-row' }, icon(`p_${s.id}`, 36), h('span', {}, t(`bonus.${s.bonus}`, { v: pct(s.per * (meta.bonds[s.id] || 0)) }))));
    box.replaceChildren(h('div', { class: 'bonus-title' }, icon('ic_paw', 28), t('shelter.totalBonus')), ...(rows.length ? rows : [h('div', { class: 'bonus-empty' }, t('shelter.giftNone'))]));
    void bondBonus;
  }

  syncShelter(arrivals: SpeciesId[] = []) {
    const s = save();
    this.shelter.setData(s.rescued, (sp) => bondProgress(sp).lv, s.decor);
    this.shelter.layout(screen.w, screen.h, screen.safe.top + 136, screen.safe.bottom + 172);
    for (const a of arrivals) this.shelter.arrive(a);
    const n = giftsPending(); this.shelter.setGifts(n);
    const total = SPECIES.length; const have = SPECIES.filter((x) => (s.rescued[x.id] || 0) > 0).length;
    this.shelterHead.replaceChildren(h('div', { class: 'sh-title' }, icon('ic_shelter', 32), h('span', {}, t('shelter.title'))), h('div', { class: 'sh-count' }, t('shelter.count', { a: have, b: total })));
    this.giftBtn.replaceChildren(icon('ic_gift', 34), h('span', { class: 'gift-txt' }, h('span', {}, n > 0 ? t('shelter.giftReady', { n: num(n) }) : t('shelter.giftNone')), h('span', { class: 'gift-rate' }, t('shelter.giftRate', { n: num(giftRate()), h: GIFTS.capHours }))));
    this.giftBtn.classList.toggle('off', n <= 0);
    this.pages.shelter.querySelector('.decor-btn')?.classList.toggle('hidden', !featureOpen('decor'));
  }

  private collect() {
    const n = collectGifts();
    if (n <= 0) { audio.play('ui_locked', { vol: 0.6 }); toast(t('shelter.giftNone'), 'ic_gift'); return; }
    audio.play('gift_collect', { vol: 1 }); audio.play('coin_burst', { vol: 0.8 }); buzz('success');
    for (const p of this.shelter.pets) if (p.gift) { this.shelter.poke(p); for (let i = 0; i < 4; i++) this.shelter.fx.spawn(['p_coin_0', 'p_coin_1', 'p_coin_2', 'p_coin_3'], p.x, p.y - 50, { fps: 12, z: 10, vz: 260 + Math.random() * 120, vx: (Math.random() - 0.5) * 140, g: 700, max: 0.9 }); }
    toast(`+${num(n)}`, 'p_coin_0');
    this.refreshCoins(); this.syncShelter();
  }

  // ---------------------------------------------------------------- popups owned by home
  openStage(stage: number) {
    if (isOpen('stage')) return;
    const lv = this.api.levels.find((l) => l.stage === stage); if (!lv) return;
    const unlocked = stageUnlocked(stage);
    const species = [...new Set(lv.rooms.flatMap((r) => r.animals.map((a) => a.s)))];
    const animals = h('div', { class: 'st-animals' }, ...species.map((sp) => {
      const known = (save().rescued[sp] || 0) > 0;
      return h('div', { class: 'st-animal' }, icon(known ? `p_${sp}` : `sil_${sp}`, 64), h('span', {}, known ? t(`species.${sp}`) : '?'), !known ? h('span', { class: 'tag-new' }, t('common.new')) : null);
    }));
    const c = save().cleared[`s${stage}`];
    const stars = h('div', { class: 'st-stars' }, ...[0, 1, 2].map((i) => icon(c && c.stars > i ? 'ic_star' : 'ic_star_empty', 34)));
    const body = h('div', { class: 'stage-info' },
      h('div', { class: 'st-sub' }, t('stage.animals')), animals,
      lv.intro && lv.intro !== 'blob' ? h('div', { class: 'st-goo' }, icon(lv.intro === 'boss' ? `m_boss_${lv.region}_normal` : lv.intro === 'flyer' ? 'm_flyer_normal_0' : `m_${lv.intro}_normal`, 52), h('div', {}, h('div', { class: 'st-goo-t' }, lv.intro === 'boss' ? t('stage.boss') : t('stage.newGoo')), h('div', { class: 'st-goo-n' }, t(`monster.${lv.intro}`)))) : null,
      c ? h('div', { class: 'st-best' }, stars, h('span', {}, `${t('stage.cleared')} · ${t('stage.best')} ${Math.floor(c.best / 60)}:${String(c.best % 60).padStart(2, '0')}`)) : null,
      assistFor(stage) ? h('div', { class: 'st-assist' }, icon('ic_heart', 30), h('span', {}, t('stage.helpOffer', { hp: assistFor(stage) * 30, dmg: assistFor(stage) * 20 }))) : null,
      unlocked
        ? h('button', { class: 'btn btn-primary big', onclick: once(() => { closeModal('stage', true); this.api.play(stage); }) }, icon('ic_play', 32), t('stage.play'))
        : h('div', { class: 'st-locked' }, icon('ic_lock', 30), t('stage.locked')),
    );
    openModal(body, { id: 'stage', title: stageName(stage) });
  }

  openAlbum() {
    const s = save();
    const grid = h('div', { class: 'album' }, ...SPECIES.map((sp) => {
      const known = (s.rescued[sp.id] || 0) > 0;
      return h('button', { class: 'album-cell' + (known ? '' : ' unknown'), onclick: () => this.openSpecies(sp.id) }, icon(known ? `p_${sp.id}` : `sil_${sp.id}`, 72), h('span', {}, known ? t(`species.${sp.id}`) : '?'));
    }));
    openModal(grid, { id: 'album', title: t('shelter.list'), titleIcon: 'ic_paw' });
  }

  openSpecies(sp: SpeciesId) {
    if (isOpen('species')) return;
    const def = SPECIES.find((x) => x.id === sp)!; const bp = bondProgress(sp);
    const known = bp.count > 0;
    const body = h('div', { class: 'species' },
      icon(known ? `p_${sp}` : `sil_${sp}`, 120, 'species-art'),
      h('div', { class: 'species-name' }, known ? t(`species.${sp}`) : '?'),
      known ? h('div', { class: 'species-bond' }, ...[1, 2, 3, 4, 5].map((i) => icon(i <= bp.lv ? 'p_heart' : 'ic_star_empty', 26, i <= bp.lv ? '' : 'dim')), h('span', {}, t('shelter.bond', { n: bp.lv }))) : null,
      h('div', { class: 'species-bonus' }, h('b', {}, t('shelter.bonusTitle')), h('span', {}, t(`bonus.${def.bonus}`, { v: pct(def.per * Math.max(1, bp.lv)) }))),
      known ? h('div', { class: 'species-note' }, bp.maxed ? t('shelter.bondMax') : t('shelter.bondNext', { n: bp.toNext })) : h('div', { class: 'species-note' }, speciesWhere(sp, this.api.levels)),
      known ? h('div', { class: 'species-count' }, t('shelter.rescued', { n: bp.count })) : null,
    );
    openModal(body, { id: 'species', title: known ? t(`species.${sp}`) : t('shelter.empty') });
  }

  openDecor() {
    const s = save();
    const list = h('div', { class: 'decor-list' });
    const render = () => list.replaceChildren(...DECOR.map((d) => {
      const owned = s.decor.includes(d.id);
      const btn = owned ? h('div', { class: 'decor-owned' }, icon('ic_check', 28), t('shelter.decorOwned'))
        : h('button', { class: 'btn up-buy ' + (s.coins >= d.cost ? 'ok' : 'off'), onclick: () => {
          if (!buyDecor(d.id)) { audio.play('ui_locked', { vol: 0.7 }); toast(t('upgrade.notEnough'), 'p_coin_0'); return; }
          audio.play('upgrade_buy', { vol: 0.9 }); buzz('medium'); this.refreshCoins(); this.syncShelter(); render();
        } }, h('span', { class: 'up-cost' }, icon('p_coin_0', 24), h('span', {}, num(d.cost))));
      return h('div', { class: 'decor-row' + (owned ? ' owned' : '') }, icon(`dc_${d.id}`, 64), h('div', { class: 'up-txt' }, h('div', { class: 'up-name' }, t(`decor.${d.id}`)), h('div', { class: 'up-desc' }, t('shelter.decorDesc'))), btn);
    }));
    render();
    openModal(list, { id: 'decor', title: t('shelter.decor'), titleIcon: 'dc_ball' });
  }

  // ---------------------------------------------------------------- input on the canvas
  private onDown = (e: PointerEvent) => {
    if (isOpen()) return;
    const d = this.drag; d.on = true; d.id = e.pointerId; d.y0 = d.y = d.lastY = e.clientY; d.x0 = e.clientX; d.moved = 0; d.t = d.lastT = performance.now(); d.vy = 0;
    this.map.vel = 0;
  };
  private onMove = (e: PointerEvent) => {
    const d = this.drag; if (!d.on || e.pointerId !== d.id) return;
    const dy = e.clientY - d.y; d.y = e.clientY; d.moved += Math.abs(dy);
    const now = performance.now(); const dt = Math.max(1, now - d.lastT);
    d.vy = d.vy * 0.6 + ((e.clientY - d.lastY) / dt) * 1000 * 0.4; d.lastY = e.clientY; d.lastT = now;
    if (this.tab === 'map') this.map.drag(dy);
  };
  private onUp = (e: PointerEvent) => {
    const d = this.drag; if (!d.on || e.pointerId !== d.id) return;
    d.on = false;
    if (d.moved < 10 && Math.abs(e.clientX - d.x0) < 10) this.tap(e.clientX, e.clientY);
    else if (this.tab === 'map' && performance.now() - d.lastT < 80) this.map.fling(d.vy);
  };
  private onWheel = (e: WheelEvent) => { if (this.tab === 'map' && !isOpen()) this.map.drag(-e.deltaY); };

  private tap(x: number, y: number) {
    if (this.tab === 'map') {
      const n = this.map.hitNode(x, y);
      if (n) { audio.play('ui_tap', { vol: 0.7 }); this.openStage(n.stage); }
    } else if (this.tab === 'shelter') {
      const p = this.shelter.hitPet(x, y);
      if (p) {
        if (p.gift) { this.collect(); return; }
        audio.play(`chirp_${1 + (p.id % 3)}`, { vol: 0.8 }); this.shelter.poke(p); buzz('tick');
        setTimeout(() => this.openSpecies(p.sp), 260);
        return;
      }
      const b = this.shelter.hitBasket(x, y);
      if (b) { audio.play('ui_tap', { vol: 0.7 }); this.openSpecies(b); }
    }
  }

  // ---------------------------------------------------------------- frame
  topInset() { return screen.safe.top + 70; }
  bottomInset() { return screen.safe.bottom + 92; }

  layout() {
    this.map.layout(screen.w, screen.h, screen.safe.top + 64, screen.safe.bottom + 176);
    this.shelter.layout(screen.w, screen.h, screen.safe.top + 136, screen.safe.bottom + 172);
  }

  frame(dt: number) {
    this.badgeTimer -= dt;
    if (this.badgeTimer <= 0) { this.badgeTimer = 5; if (this.tab === 'shelter') { this.shelter.setGifts(giftsPending()); } this.refreshBadges(); }
    if (this.tab === 'map') { this.map.update(dt); this.map.render(screen.ctx, screen.dpr); }
    else if (this.tab === 'shelter') { this.shelter.update(dt); this.shelter.render(screen.ctx, screen.dpr); }
    else { const c = screen.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#9bd86a'; c.fillRect(0, 0, screen.canvas.width, screen.canvas.height); }
  }

  washMap(stage: number) { this.map.focus(stage); this.map.washing = { stage, t: 0 }; setTimeout(() => audio.play('room_clear', { vol: 0.7 }), 200); }

  destroy() {
    screen.canvas.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    screen.canvas.removeEventListener('wheel', this.onWheel);
    this.upPanel?.destroy();
    this.root.remove();
  }

  highest() { return highestCleared(); }
}

function setBadge(el: HTMLElement, on: boolean) {
  let b = el.querySelector('.badge');
  if (on && !b) { b = h('span', { class: 'badge' }, '!'); el.appendChild(b); }
  if (!on && b) b.remove();
}
