// Boot: load assets behind a loading screen, restore the save, then hand over
// to the app (screens + main loop).
import { loadAtlases } from './engine/atlas';
import { audio, type AudioManifest } from './engine/audio';
import { initInput } from './engine/input';
import { defaultQuality, setQuality, quality } from './engine/quality';
import { initScreen } from './engine/screen';
import { setHaptics } from './engine/haptics';
import { deviceLang, setLang, t } from './i18n';
import { loadSave, save, markDirty, flush } from './meta/save';
import { initAnalytics, track } from './services/analytics';
import { auth } from './services/platform';
import { initModals } from './ui/modal';
import { App } from './app';

declare global { interface Window { __APP__?: App; __CAPTURE__?: boolean } }

async function boot() {
  const t0 = performance.now();
  const { data, fresh } = loadSave();
  setLang(data.settings.lang === 'auto' ? deviceLang() : data.settings.lang);
  setQuality(data.settings.quality === 'auto' ? defaultQuality() : data.settings.quality);
  setHaptics(data.settings.vibration);
  const loading = document.getElementById('loading')!;
  const fill = loading.querySelector('.load-fill') as HTMLElement;
  const text = loading.querySelector('.load-text') as HTMLElement;
  text.textContent = t('loading.text');
  const sub = loading.querySelector('.load-sub') as HTMLElement | null;
  if (sub) sub.textContent = t('app.title') === 'Splash Rescue' ? '' : 'Splash Rescue';
  (loading.querySelector('.load-logo') as HTMLElement).textContent = t('app.title');

  const canvas = document.getElementById('game') as HTMLCanvasElement;
  initScreen(canvas);
  initInput(canvas);
  initModals(document.getElementById('modals')!);

  await Promise.all([
    loadAtlases((k) => { fill.style.width = `${Math.round(10 + k * 85)}%`; }),
    document.fonts ? Promise.race([Promise.all([document.fonts.load('20px Fredoka'), document.fonts.load('20px Jua', '가')]), new Promise((r) => setTimeout(r, 2500))]) : Promise.resolve(),
  ]);
  fill.style.width = '100%';
  audio.init(window.__AUDIO_MANIFEST__ ?? null);
  audio.setVolumes(data.settings.music, data.settings.sfx);

  data.stats.sessions++;
  const gapH = data.stats.lastSession ? (Date.now() - data.stats.lastSession) / 3600000 : 0;
  data.stats.lastSession = Date.now();
  markDirty();
  initAnalytics(data.installId, data.stats.sessions, '1.0.0');
  if (fresh) track('install', { lang: document.documentElement.lang, quality: quality().dprCap });
  track('session_start', { session: data.stats.sessions, daysSinceInstall: Math.floor((Date.now() - data.createdAt) / 86400000), gapHours: Math.round(gapH) });
  track('load_complete', { ms: Math.round(performance.now() - t0) });
  void auth.signInSilently();

  const app = new App(fresh);
  window.__APP__ = app;
  loading.classList.add('done');
  setTimeout(() => loading.remove(), 500);
  app.start();
  const sessionStart = Date.now();
  window.addEventListener('pagehide', () => { save().stats.playSeconds += Math.round((Date.now() - sessionStart) / 1000); markDirty(); flush(); track('session_end', { seconds: Math.round((Date.now() - sessionStart) / 1000) }); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
}

boot().catch((e) => {
  console.error(e);
  const el = document.querySelector('#loading .load-text');
  if (el) el.textContent = 'Error: ' + (e && e.message ? e.message : e);
  track('error', { message: String(e && e.message) });
});
