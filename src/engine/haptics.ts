// Vibration with a few strengths. Safe where vibration is unsupported (iOS
// Safari, desktop): calls simply do nothing.
export type Haptic = 'tick' | 'light' | 'medium' | 'heavy' | 'success' | 'fail';

const PATTERNS: Record<Haptic, number | number[]> = {
  tick: 6, light: 12, medium: 24, heavy: [38, 30, 38], success: [18, 50, 28], fail: [60, 40, 90],
};

let enabled = true;
let last = 0;
const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export function setHaptics(on: boolean) { enabled = on; }
export function hapticsSupported() { return canVibrate; }

export function buzz(kind: Haptic) {
  if (!enabled || !canVibrate) return;
  const now = performance.now();
  // never queue buzzes faster than the motor can render them
  if (kind === 'tick' && now - last < 70) return;
  if (now - last < 30) return;
  last = now;
  try { navigator.vibrate(PATTERNS[kind]); } catch { /* ignored */ }
}
