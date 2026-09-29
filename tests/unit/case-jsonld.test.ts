import { afterEach, describe, expect, it, vi } from 'vitest';
import { getProject } from '@/lib/content/load';
import { caseJsonLd } from '@/lib/seo/case-study';
import { homeJsonLd } from '@/lib/seo/home-jsonld';
import { PERSON_ID, SITE_URL } from '@/lib/site';

const ROSTEL = { '@type': 'Person', '@id': PERSON_ID, name: 'Rostel Panoumassi' };

describe('caseJsonLd', () => {
  it('always authors the write-up as the full Person node', async () => {
    const p = (await getProject('realisation', 'fr', 'freelanceclub'))!;
    const ld = caseJsonLd(p, 'Freelance Club, étude de cas · Rostel Panoumassi');
    expect(ld.name).toBe('Freelance Club, étude de cas · Rostel Panoumassi');
    expect(ld.author).toEqual(ROSTEL);
    expect(ld.contributor).toBeUndefined();
    expect(ld.dateCreated).toBeUndefined();
  });

  it('a lead or solo build makes Rostel the creator of the product, with its year', async () => {
    const p = (await getProject('realisation', 'en', 'ubbfy'))!;
    const about = caseJsonLd(p, 't').about as Record<string, unknown>;
    expect(about).toMatchObject({ '@type': 'CreativeWork', name: p.title, dateCreated: String(p.year) });
    expect(about.creator).toEqual([ROSTEL]);
    expect(about.contributor).toBeUndefined();
  });

  it('an engineering contribution makes Rostel a contributor to the product', async () => {
    for (const locale of ['fr', 'en'] as const) {
      const p = (await getProject('realisation', locale, 'freelanceclub'))!;
      const about = caseJsonLd(p, 't').about as Record<string, unknown>;
      expect(about.contributor).toEqual([ROSTEL]);
      expect(about.creator).toBeUndefined();
    }
  });

  it('co-authors sit next to Rostel on the product, not on the case study', async () => {
    const p = (await getProject('realisation', 'en', 'contractiq'))!;
    const ld = caseJsonLd(p, 't');
    expect((ld.about as Record<string, unknown>).creator).toEqual([ROSTEL, { '@type': 'Person', name: 'Jérémie Zitti' }]);
    expect(ld.contributor).toBeUndefined();
    expect(ld.author).toEqual(ROSTEL);
  });

  it('an exploration is about the brand with no Rostel role, and is authored by Rostel', async () => {
    const p = (await getProject('exploration', 'en', 'procom'))!;
    const ld = caseJsonLd(p, 'Procom, redesign proposal · Rostel Panoumassi');
    expect(ld.about).toEqual({ '@type': 'CreativeWork', name: p.title, dateCreated: String(p.year) });
    expect(ld.author).toEqual(ROSTEL);
  });
});

describe('homeJsonLd', () => {
  it('uses the single Person id on both locales, with the owner facts in the page locale', () => {
    for (const locale of ['fr', 'en'] as const) {
      const graph = (homeJsonLd(locale)['@graph'] as Record<string, unknown>[]);
      const person = graph.find((n) => n['@type'] === 'Person')!;
      expect(person['@id']).toBe(`${SITE_URL}/#person`);
      expect(String(person.description)).toContain('6');
      expect(String(person.description)).toContain('3');
    }
    const fr = (homeJsonLd('fr')['@graph'] as Record<string, unknown>[])[0].description as string;
    const en = (homeJsonLd('en')['@graph'] as Record<string, unknown>[])[0].description as string;
    expect(fr).toMatch(/ans d’expérience/);
    expect(en).toMatch(/years of experience/);
  });
});

describe('SITE_URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });
  it('drops trailing slashes once', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.test//');
    vi.resetModules();
    const site = await import('@/lib/site');
    expect(site.SITE_URL).toBe('https://example.test');
    expect(site.PERSON_ID).toBe('https://example.test/#person');
  });
});
