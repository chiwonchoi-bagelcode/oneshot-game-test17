// Result screen: what you got (counted up with sound), what it means (new
// friends, bonds), then upgrades right there and one tap into the next run.
// Tapping anywhere skips the count-up.
import { audio } from '../engine/audio';
import { buzz } from '../engine/haptics';
import { t, num } from '../i18n';
import type { RunSummary } from '../meta/progress';
import { save } from '../meta/save';
import { h, icon, once } from './dom';
import { UpgradePanel } from './upgrades';
import { stageName } from './home';

export interface ResultActions { primary: { label: string; icon: string; fn: () => void }; secondary: { label: string; icon: string; fn: () => void }; showUpgrades: boolean; onEvolve: (tier: number) => void; daily: boolean }

const TIPS: Record<string, string> = { spitter: 'result.tip.spitter', flyer: 'result.tip.spitter', blob: 'result.tip.contact', mini: 'result.tip.contact', splitter: 'result.tip.contact', dasher: 'result.tip.dasher', jumper: 'result.tip.jumper', chunky: 'result.tip.chunky', nest: 'result.tip.contact', boss: 'result.tip.boss' };

export class ResultScreen {
  el: HTMLElement;
  private steps: (() => void)[] = [];
  private timers: number[] = [];
  private skipped = false;
  private panel: UpgradePanel | null = null;
  private coinEl: HTMLElement;

  constructor(ui: HTMLElement, sum: RunSummary, act: ResultActions) {
    const win = sum.result === 'clear';
    const title = win ? t('result.clear') : sum.result === 'quit' ? t('result.quit') : t('result.fail');
    this.coinEl = h('span', { class: 'num' }, num(save().coins - sum.total));
    const head = h('div', { class: 'res-head ' + (win ? 'win' : 'lose') },
      icon(win ? 'kid_win_2' : 'kid_sad_0', 96, 'res-kid'),
      h('div', { class: 'res-titles' }, h('div', { class: 'res-stage' }, act.daily ? t('daily.title') : stageName(sum.stage)), h('div', { class: 'res-title' }, title)),
      h('div', { class: 'pill coin-pill res-coins' }, icon('p_coin_0', 26), this.coinEl));
    const body = h('div', { class: 'res-body' });
    const rows = h('div', { class: 'res-rows' });
    body.appendChild(rows);
    const foot = h('div', { class: 'res-foot' },
      h('button', { class: 'btn btn-plain res-sec', onclick: once(() => this.done(act.secondary.fn)) }, icon(act.secondary.icon, 30), h('span', {}, act.secondary.label)),
      h('button', { class: 'btn btn-primary big res-pri', onclick: once(() => this.done(act.primary.fn)) }, icon(act.primary.icon, 32), h('span', {}, act.primary.label)));
    const skip = h('div', { class: 'res-skip' }, t('result.tapSkip'));
    this.el = h('div', { class: 'result' }, head, body, foot, skip);
    ui.appendChild(this.el);
    this.el.addEventListener('pointerdown', (e) => { if (!(e.target as HTMLElement).closest('button')) this.skip(); });
    requestAnimationFrame(() => this.el.classList.add('show'));
    audio.stinger(win ? 'stinger_clear' : 'stinger_fail');
    buzz(win ? 'success' : 'light');

    // rows, revealed one by one
    const coinRow = h('div', { class: 'res-row' }, icon('p_coin_0', 40), h('span', { class: 'res-label' }, t('result.coins')), h('span', { class: 'res-val' }, '0'));
    const add = (el: HTMLElement) => { rows.appendChild(el); requestAnimationFrame(() => el.classList.add('in')); };
    this.step(250, () => { add(coinRow); this.countUp(coinRow.querySelector('.res-val')!, sum.coinsRun, 900); });
    if (sum.bonus) {
      const label = sum.bonusKind === 'first' ? t('result.firstClear') : sum.bonusKind === 'daily' ? t('daily.title') : t('result.clearBonus');
      this.step(1200, () => { add(h('div', { class: 'res-row bonus' }, icon('ic_star', 40), h('span', { class: 'res-label' }, label), h('span', { class: 'res-val' }, `+${num(sum.bonus)}`))); audio.play('coin_burst', { vol: 0.8 }); });
    }
    this.step(sum.bonus ? 1900 : 1300, () => {
      this.setCoins(save().coins);
      const animals = h('div', { class: 'res-animals' });
      const row = h('div', { class: 'res-row col' }, h('div', { class: 'res-sub' }, icon('ic_paw', 30), h('span', {}, t('result.animals')), h('span', { class: 'res-val' }, String(sum.rescued.length))), animals);
      add(row);
      sum.rescued.forEach((sp, i) => this.step(i * 260, () => {
        const isNew = sum.newSpecies.includes(sp) && sum.rescued.indexOf(sp) === i;
        const up = sum.bondUps.find((b) => b.species === sp);
        animals.appendChild(h('div', { class: 'res-animal in' }, icon(`p_${sp}`, 64), isNew ? h('span', { class: 'tag-new' }, t('common.new')) : up ? h('span', { class: 'tag-bond' }, t('result.bond', { n: up.to })) : null));
        audio.play(`chirp_${1 + (i % 3)}`, { vol: 0.8 });
      }, true));
      if (!sum.rescued.length) animals.appendChild(h('div', { class: 'res-none' }, '—'));
    });
    const after = (sum.bonus ? 1900 : 1300) + sum.rescued.length * 260 + 300;
    this.step(after, () => {
      add(h('div', { class: 'res-row small' }, icon('ic_goo', 34), h('span', { class: 'res-label' }, t('result.washed')), h('span', { class: 'res-val' }, num(sum.washed)), icon('ic_check', 26), h('span', { class: 'res-val' }, `${sum.rooms}/${sum.totalRooms}`)));
      if (sum.rescued.length || sum.result !== 'clear') add(h('div', { class: 'res-kept' }, t('result.kept')));
      if (!win && sum.result === 'fail') add(h('div', { class: 'res-tip' }, icon('ic_info', 30), h('span', {}, t(TIPS[sum.deathSource ?? ''] ?? 'result.tip.generic'))));
    });
    if (act.showUpgrades) this.step(after + 350, () => {
      this.panel = new UpgradePanel({ compact: true, onCoins: () => this.setCoins(save().coins), onEvolve: act.onEvolve });
      const box = h('div', { class: 'res-up' }, h('div', { class: 'res-up-title' }, icon('ic_upgrade', 30), h('span', {}, t('result.upgradeHint'))), this.panel.el);
      body.appendChild(box); requestAnimationFrame(() => box.classList.add('in'));
      skip.remove();
    });
    else this.step(after + 200, () => skip.remove());
  }

  private step(delay: number, fn: () => void, nested = false) {
    if (this.skipped) { fn(); return; }
    this.steps.push(fn);
    const id = window.setTimeout(() => { const i = this.steps.indexOf(fn); if (i >= 0) { this.steps.splice(i, 1); fn(); } }, delay);
    this.timers.push(id);
    void nested;
  }

  private skip() {
    if (this.skipped) return;
    this.skipped = true;
    for (const id of this.timers) clearTimeout(id);
    // run everything that is still pending, instantly
    while (this.steps.length) { const f = this.steps.shift()!; f(); }
    this.el.querySelectorAll('.res-val[data-target]').forEach((el) => { (el as HTMLElement).textContent = num(Number((el as HTMLElement).dataset.target)); });
    this.setCoins(save().coins);
  }

  private countUp(el: HTMLElement, to: number, ms: number) {
    el.dataset.target = String(to);
    const t0 = performance.now(); let lastTick = 0;
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      const v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = num(this.skipped ? to : v);
      if (performance.now() - lastTick > 60 && k < 1) { audio.play('coin_tick', { vol: 0.35 }); lastTick = performance.now(); }
      if (k < 1 && !this.skipped) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private setCoins(n: number) { this.coinEl.textContent = num(n); this.coinEl.parentElement!.classList.remove('pop'); void this.coinEl.offsetWidth; this.coinEl.parentElement!.classList.add('pop'); }

  private done(fn: () => void) { this.skip(); fn(); }

  destroy() { for (const id of this.timers) clearTimeout(id); this.panel?.destroy(); this.el.remove(); }
}
