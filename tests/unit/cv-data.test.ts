import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';
import {
  EDUCATION,
  LANGUAGES,
  PORTRAIT,
  ROLES,
  SKILL_GROUPS,
  currentRole,
  formatPeriod,
  term,
  type Period,
} from '@/lib/profile/cv-data';

/** Every string reachable from a value, with its path. */
function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}

/** Localized leaves ({ fr, en }) anywhere in a value. */
function localized(value: unknown, path = ''): [string, Record<string, unknown>][] {
  if (Array.isArray(value)) return value.flatMap((v, i) => localized(v, `${path}[${i}]`));
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  if ('fr' in obj || 'en' in obj) return [[path, obj]];
  return Object.entries(obj).flatMap(([k, v]) => localized(v, path ? `${path}.${k}` : k));
}

const DATA = { ROLES, EDUCATION, SKILL_GROUPS, LANGUAGES, PORTRAIT };

/** Most recent first: ongoing first, then later end, then later start. */
function newerFirst(a: Period, b: Period): number {
  const end = (p: Period) => p.end ?? '9999-12';
  return end(b).localeCompare(end(a)) || b.start.localeCompare(a.start);
}

describe('cv-data', () => {
  it('translates every localized value in both languages, never empty', () => {
    const leaves = localized(DATA);
    expect(leaves.length).toBeGreaterThan(20);
    for (const [path, leaf] of leaves) {
      expect(Object.keys(leaf).sort(), path).toEqual([...routing.locales].sort());
      for (const locale of routing.locales) expect(String(leaf[locale]).trim(), `${path}.${locale}`).not.toBe('');
    }
  });

  it('has unique ids and the same entries for both languages', () => {
    for (const list of [ROLES, EDUCATION, SKILL_GROUPS]) {
      const ids = list.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    for (const group of SKILL_GROUPS) {
      for (const locale of routing.locales) {
        const names = group.items.map((t) => term(t, locale));
        expect(new Set(names).size, `${group.id} ${locale}`).toBe(names.length);
      }
    }
  });

  it('lists the documented roles and credentials, most recent first', () => {
    expect(ROLES.map((r) => r.id)).toEqual(['kps', 'gprhme', 'leconsultant', 'n01zet', 'dsmc', 'jscom']);
    expect(EDUCATION.map((e) => e.id)).toEqual(['mindluster', 'ecole229', 'asin', 'injeps']);
    for (const list of [ROLES, EDUCATION]) {
      const periods = list.map((e) => e.period);
      expect([...periods].sort(newerFirst)).toEqual(periods);
    }
  });

  it('keeps every period valid: a real month, start before end, one ongoing role', () => {
    for (const { id, period } of [...ROLES, ...EDUCATION]) {
      expect(period.start, id).toMatch(/^20\d\d-(0[1-9]|1[0-2])$/);
      if (period.end !== null) {
        expect(period.end, id).toMatch(/^20\d\d-(0[1-9]|1[0-2])$/);
        expect(period.end >= period.start, id).toBe(true);
      }
    }
    expect(ROLES.filter((r) => r.period.end === null).map((r) => r.id)).toEqual(['kps']);
    expect(currentRole().organisation).toBe('KPS Groupe');
    expect(EDUCATION.every((e) => e.period.end !== null)).toBe(true);
  });

  it('formats periods with an en dash, in each language', () => {
    expect(formatPeriod({ start: '2025-07', end: null }, 'fr')).toBe('Juil. 2025 – aujourd’hui');
    expect(formatPeriod({ start: '2025-07', end: null }, 'en')).toBe('Jul 2025 – present');
    expect(formatPeriod({ start: '2024-09', end: '2025-07' }, 'fr')).toBe('Sept. 2024 – Juil. 2025');
    expect(formatPeriod({ start: '2023-12', end: '2023-12' }, 'en')).toBe('Dec 2023');
  });

  it('follows the owner writing rules: no em dash, typographic apostrophe in French', () => {
    for (const [path, value] of strings(DATA)) expect(value.includes('—'), path).toBe(false);
    for (const [path, leaf] of localized(DATA)) expect(String(leaf.fr).includes("'"), path).toBe(false);
  });

  it('states the andragogy degree the method section relies on', () => {
    const injeps = EDUCATION.find((e) => e.id === 'injeps')!;
    expect(injeps.kind).toBe('degree');
    expect(injeps.field.fr).toContain('andragogie');
  });

  it('serves the portrait at its native size or below, never upscaled', () => {
    for (const s of PORTRAIT.sources) expect(s.width).toBeLessThanOrEqual(654);
    expect(PORTRAIT.width).toBe(654);
    for (const locale of routing.locales) expect(PORTRAIT.alt[locale]).toContain('Rostel Panoumassi');
  });
});
