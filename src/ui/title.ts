// Title: the forest map gently drifting behind the logo, one big button.
import { screen } from '../engine/screen';
import { t } from '../i18n';
import { MapView } from '../render/mapView';
import { h, icon, once } from './dom';

export class TitleScreen {
  private map = new MapView();
  private el: HTMLElement;
  private time = 0;

  constructor(ui: HTMLElement, onStart: () => void) {
    this.map.cleared = () => false;
    this.map.regionLabel = (k) => t(`region.${k}`);
    this.map.current = 1;
    const go = once(() => onStart(), 1000);
    this.el = h('div', { class: 'title' },
      h('div', { class: 'title-logo' },
        h('div', { class: 'logo-main' }, t('app.title')),
        t('app.title') !== 'Splash Rescue' ? h('div', { class: 'logo-sub' }, 'Splash Rescue') : null),
      h('div', { class: 'title-art' }, icon('a_puppy_happy_1', 92, 'ta-pup'), icon('kid_win_2', 150, 'ta-kid'), icon('m_blob_hit', 84, 'ta-blob')),
      h('button', { class: 'btn btn-primary big title-go', onclick: go }, icon('ic_play', 34), h('span', {}, t('title.play'))),
    );
    ui.appendChild(this.el);
  }

  layout() {
    this.map.layout(screen.w, screen.h, 0, 0);
    this.map.focus(1);
  }

  frame(dt: number) {
    this.time += dt;
    this.map.update(dt);
    this.map.scroll -= dt * 6; this.map.clampScroll();
    this.map.render(screen.ctx, screen.dpr);
  }

  destroy() { this.el.remove(); }
}
