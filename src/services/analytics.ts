// Analytics events. Gameplay code calls track(); providers decide where events
// go. Swap RemotePlaceholder for a real SDK (e.g. Firebase/GA4, Amplitude)
// without touching gameplay code. Event names and params are the contract.
export type EventName =
  | 'install' // first launch ever {lang, quality}
  | 'session_start' // {session, daysSinceInstall, gapHours}
  | 'session_end' // {seconds}
  | 'load_complete' // {ms}
  | 'tutorial_step' // {step: move|first_spray|first_wash|first_rescue|first_room|first_skill|first_result|first_upgrade|first_shelter, t}
  | 'tutorial_complete' // first stage cleared {seconds}
  | 'run_start' // {stage, attempt, daily, assist, power, gunTier}
  | 'run_end' // {stage, result: clear|fail|quit, rooms, seconds, rescued, coins, washed, hits, deathSource, revivesUsed, level}
  | 'room_clear' // {stage, room, seconds, hit}
  | 'level_reached' // {stage} highest stage reached (first time)
  | 'stage_first_clear' // {stage, attempts}
  | 'currency_earn' // {source: run|clear_bonus|festival|gift|mission|daily|streak|debug, amount, balance}
  | 'currency_spend' // {sink: upgrade|decor, item, amount, balance}
  | 'upgrade_buy' // {id, level, cost}
  | 'gun_evolve' // {tier}
  | 'animal_rescue' // {species, stage, first, brave}
  | 'skill_pick' // {skill, options, level}
  | 'revive' // {stage, room}
  | 'shelter_open' // {animals}
  | 'gift_collect' // {amount}
  | 'decor_buy' // {id}
  | 'mission_complete' // {id}
  | 'daily_start' // {mod}
  | 'daily_end' // {mod, result}
  | 'streak_claim' // {day, reward}
  | 'festival_view' // weekend festival popup seen {remainingH}
  | 'feature_unlock' // {feature}
  | 'settings_change' // {key, value}
  | 'assist_offer' // {stage, fails}
  | 'perf_sample' // {fpsMedian, fpsP10, quality, particles}
  | 'error'; // {message}

export interface AnalyticsProvider { name: string; track(name: EventName, params: Record<string, unknown>, ctx: EventContext): void }
export interface EventContext { installId: string; session: number; t: number; build: string }

class DebugBuffer implements AnalyticsProvider {
  name = 'debug';
  events: { name: EventName; params: Record<string, unknown>; t: number }[] = [];
  track(name: EventName, params: Record<string, unknown>, ctx: EventContext) {
    this.events.push({ name, params, t: ctx.t });
    if (this.events.length > 300) this.events.shift();
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.debug('[analytics]', name, params);
  }
}

// Placeholder for the production analytics SDK. Events are queued here so the
// integration only needs to drain `queue` and forward them.
class RemotePlaceholder implements AnalyticsProvider {
  name = 'remote';
  queue: { name: EventName; params: Record<string, unknown>; ctx: EventContext }[] = [];
  track(name: EventName, params: Record<string, unknown>, ctx: EventContext) {
    this.queue.push({ name, params, ctx });
    if (this.queue.length > 500) this.queue.shift();
  }
}

export const debugBuffer = new DebugBuffer();
export const remote = new RemotePlaceholder();
const providers: AnalyticsProvider[] = [debugBuffer, remote];
const ctx: EventContext = { installId: '', session: 0, t: 0, build: '1.0.0' };

export function initAnalytics(installId: string, session: number, build: string) {
  ctx.installId = installId; ctx.session = session; ctx.build = build;
}

export function track(name: EventName, params: Record<string, unknown> = {}) {
  ctx.t = Date.now();
  for (const p of providers) { try { p.track(name, params, ctx); } catch { /* never break gameplay */ } }
}

export function addProvider(p: AnalyticsProvider) { providers.push(p); }
