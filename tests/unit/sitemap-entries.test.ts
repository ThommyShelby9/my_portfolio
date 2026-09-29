import { describe, expect, it } from 'vitest';
import { buildSitemapEntries } from '@/lib/seo/sitemap-entries';

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
