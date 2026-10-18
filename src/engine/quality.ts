// Graphics quality presets. Changing the preset applies immediately (the
// canvas resizes and effect budgets change on the next frame).
export type QualityLevel = 'low' | 'medium' | 'high';

export interface QualityPreset {
  dprCap: number; particles: number; streamFx: boolean; bgScale: number; fpsCap: number; shake: boolean; glow: boolean;
}

export const PRESETS: Record<QualityLevel, QualityPreset> = {
  low: { dprCap: 1, particles: 140, streamFx: false, bgScale: 1, fpsCap: 30, shake: true, glow: false },
  medium: { dprCap: 1.75, particles: 320, streamFx: true, bgScale: 1.5, fpsCap: 60, shake: true, glow: true },
  high: { dprCap: 2.5, particles: 600, streamFx: true, bgScale: 2, fpsCap: 60, shake: true, glow: true },
};

let level: QualityLevel = 'medium';
const listeners: (() => void)[] = [];

export function quality(): QualityPreset { return PRESETS[level]; }
export function qualityLevel(): QualityLevel { return level; }
export function setQuality(l: QualityLevel) { if (l === level) return; level = l; for (const f of listeners) f(); }
export function onQualityChange(f: () => void) { listeners.push(f); }

export function defaultQuality(): QualityLevel {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (mem <= 2 || cores <= 2) return 'low';
  if (mem >= 6 && cores >= 6 && !/Android|iPhone|iPad/i.test(navigator.userAgent)) return 'high';
  return 'medium';
}
