import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';
import {
  EDUCATION,
  LANGUAGES,
  PORTRAIT,
  ROLES,
  SKILL_GROUPS,
  CV_PROJECT_SLUGS,
  currentRole,
  educationHeading,
  formatPeriod,
  periodParts,
  roleKindLabel,
  selectCvProjects,
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

/** Newest start first; a tie puts the later end (ongoing last of all) first. */
function newerFirst(a: Period, b: Period): number {
  const end = (p: Period) => p.end ?? '9999-12';
  return b.start.localeCompare(a.start) || end(b).localeCompare(end(a));
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

  it('lists the documented roles and credentials, newest start first', () => {
    expect(ROLES.map((r) => r.id)).toEqual(['kps', 'gprhme', 'n01zet', 'dsmc', 'jscom', 'leconsultant']);
    expect(EDUCATION.map((e) => e.id)).toEqual(['mindluster', 'asin', 'ecole229', 'injeps']);
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
    expect(formatPeriod({ start: '2025-07', end: null }, 'fr')).toBe('juil. 2025 – aujourd’hui');
    expect(formatPeriod({ start: '2025-07', end: null }, 'en')).toBe('Jul 2025 – present');
    expect(formatPeriod({ start: '2024-09', end: '2025-07' }, 'fr')).toBe('sept. 2024 – juil. 2025');
    expect(formatPeriod({ start: '2023-12', end: '2023-12' }, 'en')).toBe('Dec 2023');
    expect(formatPeriod({ start: '2019-10', end: '2022-08' }, 'fr')).toBe('oct. 2019 – août 2022');
  });

  it('splits periods into <time> bounds, "aujourd’hui" staying plain text', () => {
    expect(periodParts({ start: '2025-07', end: null }, 'fr')).toEqual([{ label: 'juil. 2025', dateTime: '2025-07' }, { label: 'aujourd’hui' }]);
    expect(periodParts({ start: '2024-09', end: '2025-07' }, 'en')).toEqual([
      { label: 'Sep 2024', dateTime: '2024-09' },
      { label: 'Jul 2025', dateTime: '2025-07' },
    ]);
    expect(periodParts({ start: '2023-12', end: '2023-12' }, 'fr')).toEqual([{ label: 'déc. 2023', dateTime: '2023-12' }]);
  });

  it('shows a role kind only when the title does not already say it', () => {
    const byId = (id: string) => ROLES.find((r) => r.id === id)!;
    expect(roleKindLabel(byId('kps'), 'fr')).toBeNull();
    expect(roleKindLabel(byId('n01zet'), 'fr')).toBe('Mission freelance');
    expect(roleKindLabel(byId('n01zet'), 'en')).toBe('Freelance mission');
    expect(roleKindLabel(byId('jscom'), 'fr')).toBeNull(); // "Stage professionnel" already says "Stage"
    expect(roleKindLabel(byId('jscom'), 'en')).toBeNull(); // "Professional internship"
    expect(roleKindLabel({ ...byId('jscom'), title: { fr: 'Développeur', en: 'Developer' } }, 'fr')).toBe('Stage');
  });

  it('gives every credential a distinct heading: credential and institution', () => {
    for (const locale of routing.locales) {
      const headings = EDUCATION.map((e) => educationHeading(e, locale));
      expect(new Set(headings).size, locale).toBe(headings.length);
    }
    expect(EDUCATION.map((e) => educationHeading(e, 'fr'))).toEqual([
      'Certificat · Mindluster',
      'Attestation · ASIN',
      'Certification · École 229',
      'Licence professionnelle · INJEPS',
    ]);
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

  it('serves the portrait as true 4:5 crops of the 654 px source, never upscaled', async () => {
    expect(PORTRAIT.sources.map((s) => [s.width, s.height])).toEqual([
      [400, 500],
      [523, 654],
    ]);
    expect(PORTRAIT.src).toBe(PORTRAIT.sources.at(-1)!.src);
    expect([PORTRAIT.width, PORTRAIT.height]).toEqual([523, 654]);
    for (const s of PORTRAIT.sources) {
      const meta = await sharp(path.join(process.cwd(), 'public', s.src)).metadata();
      expect([meta.format, meta.width, meta.height], s.src).toEqual(['webp', s.width, s.height]);
      expect(meta.height! / meta.width!, s.src).toBeCloseTo(5 / 4, 2);
      expect(meta.height, s.src).toBeLessThanOrEqual(654); // the source is 654 px tall
    }
    for (const locale of routing.locales) expect(PORTRAIT.alt[locale]).toContain('Rostel Panoumassi');
  });

  it('selects four flagship projects for the CV, with owner-confirmed figures only', () => {
    const proof = (text: string, source: string) => ({ text, source });
    const projects = [
      { slug: 'ccns', proofs: [proof('+240 %', 'confirmé par Rostel (spec)'), proof('SEO 100', 'confirmé par Rostel (spec)')] },
      { slug: 'ubbfy', proofs: [proof('20 applications', 'compté dans le dépôt ubbfy')] },
      { slug: 'zenlife', proofs: [proof('1 200+', 'confirmé par Rostel le 2026-09-28')] },
      { slug: 'tadagberhplus', proofs: [] },
      { slug: 'other', proofs: [proof('x', 'confirmé par Rostel')] },
    ];
    const selected = selectCvProjects(projects);
    expect(CV_PROJECT_SLUGS).toEqual(['ubbfy', 'tadagberhplus', 'zenlife', 'ccns']);
    expect(selected.map((p) => [p.slug, p.metrics])).toEqual([
      ['ubbfy', []],
      ['tadagberhplus', []],
      ['zenlife', ['1 200+']],
      ['ccns', ['+240 %', 'SEO 100']],
    ]);
    expect(() => selectCvProjects(projects.slice(1))).toThrow(/ccns/);
  });
});
