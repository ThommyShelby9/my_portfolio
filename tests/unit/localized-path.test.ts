import { describe, expect, it } from 'vitest';
import { localizedPath } from '../../src/lib/i18n/localized-path';

describe('localizedPath', () => {
  it.each([
    ['/', 'fr', undefined, '/'],
    ['/', 'en', undefined, '/en'],
    ['/realisations', 'fr', undefined, '/realisations'],
    ['/realisations', 'en', undefined, '/en/work'],
    ['/realisations/[slug]', 'fr', { slug: 'ubbfy' }, '/realisations/ubbfy'],
    ['/realisations/[slug]', 'en', { slug: 'ubbfy' }, '/en/work/ubbfy'],
    ['/a-propos', 'en', undefined, '/en/about'],
    ['/confidentialite', 'en', undefined, '/en/privacy'],
    ['/brief', 'en', undefined, '/en/brief'],
  ] as const)('%s in %s → %s', (href, locale, params, expected) => {
    expect(localizedPath(href, locale, params)).toBe(expected);
  });

  it('throws when a dynamic segment has no value', () => {
    expect(() => localizedPath('/realisations/[slug]', 'fr')).toThrow(/slug/);
  });
});
