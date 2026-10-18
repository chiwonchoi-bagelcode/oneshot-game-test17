// All on-screen text comes from data/i18n/<lang>.json. The device language is
// used when supported (Korean), otherwise English. Settings can override.
import ko from '../../data/i18n/ko.json';
import en from '../../data/i18n/en.json';

export type Lang = 'ko' | 'en';
const TABLES: Record<Lang, Record<string, string>> = { ko: ko as Record<string, string>, en: en as Record<string, string> };

let lang: Lang = 'en';
const listeners: (() => void)[] = [];

export function deviceLang(): Lang {
  const list = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']);
  for (const l of list) { const k = l.toLowerCase().slice(0, 2); if (k === 'ko') return 'ko'; if (k === 'en') return 'en'; }
  return 'en';
}

export function setLang(l: Lang) {
  lang = l;
  document.documentElement.lang = l;
  for (const f of listeners) f();
}
export function getLang(): Lang { return lang; }
export function onLangChange(f: () => void) { listeners.push(f); }

export function t(key: string, params?: Record<string, string | number>): string {
  let s = TABLES[lang][key] ?? TABLES.en[key];
  if (s === undefined) { if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('missing string', key); return key; }
  if (params) s = s.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{${k}}`));
  return s;
}

export function has(key: string): boolean { return key in TABLES[lang] || key in TABLES.en; }

// Number formatting without decimals noise: 1234 -> 1,234 ; 0.12 -> 12%
export function num(n: number): string { return Math.round(n).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US'); }
export function pct(f: number): string {
  const v = Math.round(f * 1000) / 10;
  return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}%`;
}

declare global { const __DEV__: boolean }
