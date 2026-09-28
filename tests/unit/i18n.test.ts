import { describe, expect, it } from 'vitest';
import {
  dictionaries, isLocale, localizePath, otherLocale, stripLocale, t, toLocale,
} from '../../src/i18n';

describe('dictionaries', () => {
  it('have exactly the same keys in EN and FR', () => {
    expect(Object.keys(dictionaries.fr).sort()).toEqual(Object.keys(dictionaries.en).sort());
  });

  it('have no empty value', () => {
    for (const dict of Object.values(dictionaries)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim(), key).not.toBe('');
      }
    }
  });

  it('never contain an em dash (owner rule)', () => {
    for (const dict of Object.values(dictionaries)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.includes('—'), key).toBe(false);
      }
    }
  });
});

describe('t', () => {
  it('returns the localized string', () => {
    expect(t('en', 'nav.collection')).toBe('Collection');
    expect(t('fr', 'nav.collection')).toBe('Collection');
    expect(t('fr', 'nav.curator')).toBe('Conservateur');
  });

  it('fills placeholders and leaves unknown ones intact', () => {
    expect(t('en', 'label.experienceValue', { years: 6, lead: 3 })).toBe('6 years, 3 as tech lead');
    expect(t('en', 'label.experienceValue', { years: 6 })).toBe('6 years, {lead} as tech lead');
  });
});

describe('locale helpers', () => {
  it('recognises locales', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(toLocale('de')).toBe('en');
    expect(toLocale(undefined)).toBe('en');
    expect(otherLocale('en')).toBe('fr');
    expect(otherLocale('fr')).toBe('en');
  });

  it.each([
    ['/', '/'],
    ['/fr', '/'],
    ['/fr/', '/'],
    ['/fr/work', '/work'],
    ['/fr/work/ubbfy/', '/work/ubbfy/'],
    ['/fr/work/ubbfy/?view=catalogue', '/work/ubbfy/'],
    ['/work#top', '/work'],
    ['/en/about', '/about'],
    ['/french-fries', '/french-fries'],
  ])('stripLocale(%s) = %s', (input, expected) => {
    expect(stripLocale(input)).toBe(expected);
  });

  it.each([
    ['/', 'fr', '/fr'],
    ['/', 'en', '/'],
    ['/work', 'fr', '/fr/work'],
    ['/fr/work/ubbfy/?view=catalogue', 'en', '/work/ubbfy/'],
    ['/work/ubbfy/', 'fr', '/fr/work/ubbfy/'],
    ['/fr/about', 'fr', '/fr/about'],
  ] as const)('localizePath(%s, %s) = %s', (path, locale, expected) => {
    expect(localizePath(path, locale)).toBe(expected);
  });
});
