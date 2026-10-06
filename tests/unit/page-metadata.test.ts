import { describe, expect, it } from 'vitest';
import { pageMetadata } from '@/lib/seo/page-metadata';

describe('pageMetadata', () => {
  it('builds canonical and x-default from SITE_URL', () => {
    const m = pageMetadata({
      locale: 'en',
      href: '/realisations/[slug]',
      params: { slug: 'ubbfy' },
      title: 't',
      description: 'd',
    });
    expect(m.alternates?.canonical).toBe('https://rostelmissimawu.com/en/work/ubbfy');
    expect(m.alternates?.languages).toMatchObject({
      'x-default': 'https://rostelmissimawu.com/realisations/ubbfy',
    });
  });
});
