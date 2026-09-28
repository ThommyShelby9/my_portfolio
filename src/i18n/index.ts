import { en, type Dict } from './en';
import { fr } from './fr';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export type Key = keyof typeof en;

export const dictionaries: Record<Locale, Dict> = { en, fr };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function toLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function t(locale: Locale, key: Key, vars?: Record<string, string | number>): string {
  const template = dictionaries[locale][key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function stripLocale(path: string): string {
  const clean = path.split(/[?#]/)[0] || '/';
  const prefix = clean.match(/^\/(?:en|fr)(?=\/|$)/);
  const rest = prefix ? clean.slice(prefix[0].length) : clean;
  return rest === '' ? '/' : rest;
}

export function localizePath(path: string, locale: Locale): string {
  const base = stripLocale(path);
  if (locale === defaultLocale) return base;
  return base === '/' ? `/${locale}` : `/${locale}${base}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'fr' : 'en';
}
