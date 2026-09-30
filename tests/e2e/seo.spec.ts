import { expect, test } from '@playwright/test';

const canonicals = (html: string) =>
  [...html.matchAll(/<link[^>]*rel="canonical"[^>]*>/g)].map((m) => /href="([^"]*)"/.exec(m[0])?.[1]);

function jsonLd(html: string): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
}

test.describe('seo', () => {
  test('every sitemap URL returns 200 with a single canonical equal to itself', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    // 7 static pages (home, work, explorations, brief, contact, privacy, terms), 17 cases, 4 explorations.
    expect(locs.length).toBeGreaterThanOrEqual(2 * (7 + 17 + 4));
    expect(new Set(locs).size).toBe(locs.length);
    const paths = locs.map((loc) => new URL(loc).pathname);
    expect(paths).toEqual(expect.arrayContaining([
      '/brief', '/en/brief', '/contact', '/en/contact', '/confidentialite', '/en/privacy', '/cgu', '/en/terms',
    ]));
    for (const noindex of ['/brief/merci', '/en/brief/thanks', '/contact/merci', '/en/contact/thanks']) {
      expect(paths).not.toContain(noindex);
    }
    for (const loc of locs) {
      const res = await request.get(new URL(loc).pathname);
      expect(res.status(), loc).toBe(200);
      const html = await res.text();
      expect(canonicals(html), loc).toEqual([loc]);
      for (const l of ['fr', 'en', 'x-default']) expect(html, `${loc} hreflang ${l}`).toMatch(new RegExp(`hreflang="${l}"`, 'i'));
    }
  });

  test('robots.txt allows all, blocks /api/ and points to the sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toMatch(/User-Agent: \*/i);
    expect(txt).toMatch(/Allow: \//);
    expect(txt).toMatch(/Disallow: \/api\//);
    expect(txt).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
  });

  for (const [path, locale] of [
    ['/', 'fr'],
    ['/en', 'en'],
  ] as const) {
    test(`home JSON-LD (${locale}) has Person and ProfessionalService`, async ({ request }) => {
      const blocks = jsonLd(await (await request.get(path)).text());
      const nodes = blocks.flatMap((b) => (b['@graph'] as Record<string, unknown>[] | undefined) ?? [b]);
      expect(nodes.map((n) => n['@type'])).toEqual(expect.arrayContaining(['Person', 'ProfessionalService']));
      for (const n of nodes) expect(String(n.url)).toMatch(/^https?:\/\//);
    });
  }

  test('a case page JSON-LD parses', async ({ request }) => {
    const blocks = jsonLd(await (await request.get('/realisations/ubbfy')).text());
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0]['@context']).toBe('https://schema.org');
  });
});
