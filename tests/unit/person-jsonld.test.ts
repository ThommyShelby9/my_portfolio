import { describe, expect, it } from 'vitest';
import { homeJsonLd } from '@/lib/seo/home-jsonld';
import { aboutJsonLd, personNode } from '@/lib/seo/person';
import { PERSON_ID, SITE_URL } from '@/lib/site';

type Node = Record<string, unknown>;
const graph = (ld: Node) => ld['@graph'] as Node[];

describe('personNode', () => {
  it('is enriched from cv-data in the page language', () => {
    const fr = personNode('fr');
    expect(fr['@id']).toBe(PERSON_ID);
    expect(fr.jobTitle).toBe('Head of Engineering & Innovation');
    expect(fr.worksFor).toEqual({ '@type': 'Organization', name: 'KPS Groupe' });
    expect((fr.alumniOf as Node[]).map((o) => o.name)).toEqual(['École 229', 'INJEPS']);
    expect(fr.knowsAbout).toEqual(expect.arrayContaining(['Django', 'Laravel', 'Spring Boot', 'Flutter', 'PostgreSQL', 'Tests automatisés']));
    expect(personNode('en').knowsAbout).toEqual(expect.arrayContaining(['Automated testing']));
    expect(fr.sameAs).toEqual(['https://www.linkedin.com/in/rostelpanoumassi-6b6608335', 'https://github.com/ThommyShelby9']);
    expect((fr.hasCredential as Node[]).length).toBe(4);
    expect(fr.image).toBe(`${SITE_URL}/about/portrait-4x5-523.webp`);
    expect(fr.knowsLanguage).toEqual(['fr']);
  });

  it('describes a product engineer, like the About h1', () => {
    expect(personNode('fr').description).toBe('Ingénieur produit\u00a0: 6 ans d’expérience, dont 3 ans comme tech lead.');
    expect(personNode('en').description).toBe('Product engineer with 6 years of experience, 3 of them as tech lead.');
  });

  it('lists atomic topics: no "a / b" pairs, no "(certifications)"', () => {
    for (const locale of ['fr', 'en'] as const) {
      const topics = personNode(locale).knowsAbout as string[];
      for (const topic of topics) expect(topic, topic).not.toMatch(/\s\/\s|\(certifications\)/);
      expect(topics).toEqual(expect.arrayContaining(['Node.js', 'NestJS', 'Next.js', 'React', 'Selenium', 'Java']));
    }
  });

  it('is the very node the home page emits (one builder)', () => {
    for (const locale of ['fr', 'en'] as const) {
      const person = graph(homeJsonLd(locale)).find((n) => n['@type'] === 'Person');
      expect(person).toEqual(personNode(locale));
    }
  });
});

describe('aboutJsonLd', () => {
  for (const [locale, path] of [
    ['fr', '/a-propos'],
    ['en', '/en/about'],
  ] as const) {
    it(`is a ProfilePage about the shared Person (${locale})`, () => {
      const ld = aboutJsonLd(locale, 'About');
      expect(ld['@context']).toBe('https://schema.org');
      const [page, person] = graph(ld);
      expect(page['@type']).toBe('ProfilePage');
      expect(page.url).toBe(`${SITE_URL}${path}`);
      expect(page.inLanguage).toBe(locale);
      expect(page.mainEntity).toEqual({ '@id': PERSON_ID });
      expect(person).toEqual(personNode(locale));
    });
  }

  it('never contains an em dash', () => {
    for (const locale of ['fr', 'en'] as const) expect(JSON.stringify(aboutJsonLd(locale, 'x'))).not.toContain('—');
  });
});
