import { describe, expect, it } from 'vitest';
import { routing, type Locale } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18n/localized-path';
import { NOINDEX_OR_LATER, STATIC_HREFS, buildSitemapEntries } from '@/lib/seo/sitemap-entries';
import { SITE_URL } from '@/lib/site';

describe('buildSitemapEntries', () => {
  const entries = buildSitemapEntries({ realisations: ['ubbfy'], explorations: ['procom'] });
  const urls = entries.map((e) => e.url);

  it('lists fr and en for static, case and exploration pages', () => {
    expect(urls).toEqual([
      'https://rostelmissimawu.com',
      'https://rostelmissimawu.com/en',
      'https://rostelmissimawu.com/realisations',
      'https://rostelmissimawu.com/en/work',
      'https://rostelmissimawu.com/explorations',
      'https://rostelmissimawu.com/en/explorations',
      'https://rostelmissimawu.com/realisations/ubbfy',
      'https://rostelmissimawu.com/en/work/ubbfy',
      'https://rostelmissimawu.com/explorations/procom',
      'https://rostelmissimawu.com/en/explorations/procom',
    ]);
  });

  it('gives every entry both language alternates and no duplicates', () => {
    expect(new Set(urls).size).toBe(urls.length);
    for (const e of entries) expect(Object.keys(e.alternates?.languages ?? {}).sort()).toEqual(['en', 'fr']);
  });
});

describe('sitemap coverage guard', () => {
  it('every routing pathname is in the sitemap or explicitly listed as noindex or later', () => {
    const entries = buildSitemapEntries({ realisations: ['ubbfy'], explorations: ['procom'] });
    const urls = new Set(entries.map((e) => e.url));
    const later = new Set(NOINDEX_OR_LATER);
    const abs = (href: keyof typeof routing.pathnames, locale: Locale) => {
      const slug = href.startsWith('/realisations') ? 'ubbfy' : 'procom';
      const path = localizedPath(href, locale, { slug });
      return new URL(path, SITE_URL).toString().replace(/\/$/, '');
    };
    for (const href of Object.keys(routing.pathnames) as (keyof typeof routing.pathnames)[]) {
      if (later.has(href)) continue;
      for (const locale of routing.locales) expect(urls.has(abs(href, locale)), `${href} (${locale}) is neither in the sitemap nor in NOINDEX_OR_LATER`).toBe(true);
    }
  });

  it('does not list a route that is already indexed', () => {
    for (const href of STATIC_HREFS) expect(NOINDEX_OR_LATER).not.toContain(href);
  });
});
