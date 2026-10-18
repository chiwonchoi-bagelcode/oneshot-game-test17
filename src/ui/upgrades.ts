// Upgrade panel (used on the result screen and the Upgrades tab). Rows update
// in place after a purchase, so the list never jumps.
import { GUN_TIERS, UPGRADES, type UpgradeId } from '../config/balance';
import { audio } from '../engine/audio';
import { buzz } from '../engine/haptics';
import { t, num } from '../i18n';
import { buyUpgrade, featureUpgradeOpen, gunTier, metaPower, upgradeInfo, upgradeTotal, upgradeUnlockStage } from '../meta/progress';
import { save } from '../meta/save';
import { StreamPreview } from '../render/preview';
import { computeStats } from '../sim/stats';
import type { PlayerStats } from '../sim/types';
import { h, icon } from './dom';
import { toast } from './modal';

function fmt(n: number, d = 0) { const v = Math.round(n * 10 ** d) / 10 ** d; return Number.isInteger(v) ? String(v) : v.toFixed(d); }

function statPair(id: UpgradeId, a: PlayerStats, b: PlayerStats): [string, string] {
  switch (id) {
    case 'power': return [num(a.dps), num(b.dps)];
    case 'range': return [num(a.range), num(b.range)];
    case 'health': return [num(a.maxHp), num(b.maxHp)];
    case 'pressure': return [`${fmt(a.pressureMax, 2)}x`, `${fmt(b.pressureMax, 2)}x`];
    case 'splash': return [num(a.dps * a.burstDmg), num(b.dps * b.burstDmg)];
  }
}

export class UpgradePanel {
  el: HTMLElement;
  preview: StreamPreview;
  private rows = new Map<UpgradeId, HTMLElement>();
  private track: HTMLElement;
  private onCoins: () => void;
  private onEvolve: (tier: number) => void;

  constructor(opts: { onCoins: () => void; onEvolve: (tier: number) => void; compact?: boolean }) {
    this.onCoins = opts.onCoins; this.onEvolve = opts.onEvolve;
    this.preview = new StreamPreview();
    this.track = h('div', { class: 'gun-track' });
    const list = h('div', { class: 'up-list' });
    for (const def of UPGRADES) {
      const row = h('div', { class: 'up-row', 'data-id': def.id });
      this.rows.set(def.id, row); list.appendChild(row);
    }
    this.el = h('div', { class: 'up-panel' + (opts.compact ? ' compact' : '') }, h('div', { class: 'preview-wrap' }, this.preview.canvas), this.track, list);
    this.refresh();
  }

  refresh(celebrate = false) {
    const st = computeStats(metaPower(), {}, 0);
    this.preview.set(st.width, st.range, st.gunTier, celebrate);
    // gun track
    const tier = gunTier(); const total = upgradeTotal(save().upgrades);
    const next = GUN_TIERS[tier + 1];
    this.track.replaceChildren(
      h('div', { class: 'gun-icons' }, ...GUN_TIERS.map((_, i) => h('div', { class: 'gun-slot' + (i < tier ? ' done' : i === tier ? ' cur' : '') + (i === GUN_TIERS.length - 1 ? ' final' : '') }, icon(`gun_${i}`, i === tier ? 46 : 34, i > tier ? 'locked' : '')))),
      h('div', { class: 'gun-label' }, h('b', {}, t(`gun.${tier}`)), h('span', {}, next ? t('upgrade.gunNext', { n: next.at - total }) : t('upgrade.gunFinal'))),
    );
    for (const def of UPGRADES) this.renderRow(def.id, st);
  }

  private renderRow(id: UpgradeId, st: PlayerStats) {
    const row = this.rows.get(id)!;
    const info = upgradeInfo(id);
    const open = featureUpgradeOpen(id);
    row.classList.toggle('locked', !open);
    if (!open) {
      row.replaceChildren(icon('ic_lock', 44, 'up-ic'), h('div', { class: 'up-txt' }, h('div', { class: 'up-name' }, t(`upgrade.${id}.name`)), h('div', { class: 'up-desc' }, t('stage.locked') + ` · ${t('stage.short', { n: upgradeUnlockStage(id) })}`)));
      return;
    }
    const meta = metaPower(); const after = { ...meta, upgrades: { ...meta.upgrades, [id]: info.lv + 1 } };
    const st2 = computeStats(after, {}, 0);
    const [a, b] = statPair(id, st, st2);
    const afford = save().coins >= info.cost;
    const btn = h('button', { class: 'btn up-buy' + (info.maxed ? ' maxed' : afford ? ' ok' : ' off'), 'aria-label': t(`upgrade.${id}.name`), onclick: () => this.buy(id, btn) },
      info.maxed ? h('span', {}, t('common.max')) : h('span', { class: 'up-cost' }, icon('p_coin_0', 24), h('span', {}, num(info.cost))));
    row.replaceChildren(
      icon(`ic_up_${id}`, 52, 'up-ic'),
      h('div', { class: 'up-txt' },
        h('div', { class: 'up-name' }, t(`upgrade.${id}.name`), h('span', { class: 'up-lv' }, t('upgrade.lv', { n: info.lv }))),
        h('div', { class: 'up-stat' }, info.maxed ? t('upgrade.maxed') : t(`upgrade.stat.${id}`, { a, b })),
        h('div', { class: 'up-desc' }, t(`upgrade.${id}.desc`))),
      btn);
  }

  private buy(id: UpgradeId, btn: HTMLElement) {
    const info = upgradeInfo(id);
    if (info.maxed) return;
    if (save().coins < info.cost) {
      audio.play('ui_locked', { vol: 0.7 }); buzz('light');
      btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
      toast(t('upgrade.notEnough'), 'p_coin_0');
      return;
    }
    const r = buyUpgrade(id);
    if (!r.ok) return;
    audio.play('upgrade_buy', { vol: 0.9 }); buzz('medium');
    const row = this.rows.get(id)!; row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash');
    this.refresh(true);
    this.onCoins();
    if (r.tierAfter > r.tierBefore) this.onEvolve(r.tierAfter);
  }

  destroy() { this.preview.destroy(); }
}
