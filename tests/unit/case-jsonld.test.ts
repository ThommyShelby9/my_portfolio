import { afterEach, describe, expect, it, vi } from 'vitest';
import { getProject } from '@/lib/content/load';
import { caseJsonLd } from '@/lib/seo/case-study';
import { homeJsonLd } from '@/lib/seo/home-jsonld';
import { PERSON_ID, SITE_URL } from '@/lib/site';

describe('caseJsonLd', () => {
  it('models a contribution project as the case study, about the product, not authored by the owner', async () => {
    const p = (await getProject('realisation', 'fr', 'freelanceclub'))!;
    const ld = caseJsonLd(p, 'Freelance Club, étude de cas · Rostel Panoumassi');
    expect(ld.name).toBe('Freelance Club, étude de cas · Rostel Panoumassi');
    expect(ld.about).toMatchObject({ '@type': 'CreativeWork', name: p.title });
    expect(ld.author).toEqual({ '@id': PERSON_ID });
    expect(JSON.stringify(ld.about)).not.toContain('Rostel');
  });

  it('keeps co-authors as contributors', async () => {
    const p = (await getProject('realisation', 'en', 'contractiq'))!;
    const ld = caseJsonLd(p, 't');
    expect(ld.contributor).toEqual([{ '@type': 'Person', name: 'Jérémie Zitti' }]);
    expect(ld.author).toEqual({ '@id': PERSON_ID });
  });

  it('an exploration has no product url in about and is authored by the single person id', async () => {
    const p = (await getProject('exploration', 'en', 'procom'))!;
    const ld = caseJsonLd(p, 'Procom, redesign proposal · Rostel Panoumassi');
    expect(ld.about).toEqual({ '@type': 'CreativeWork', name: p.title });
    expect(ld.author).toEqual({ '@id': PERSON_ID });
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
