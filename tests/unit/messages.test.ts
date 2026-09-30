import { describe, expect, it } from 'vitest';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') acc[path] = value;
    else Object.assign(acc, flatten(value, path));
    return acc;
  }, {});
}

const flatFr = flatten(fr as Tree);
const flatEn = flatten(en as Tree);

describe('messages', () => {
  it('have the same keys in FR and EN', () => {
    expect(Object.keys(flatFr).sort()).toEqual(Object.keys(flatEn).sort());
  });

  it('have no empty value', () => {
    for (const [key, value] of Object.entries({ ...flatFr, ...flatEn })) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it('never contain an em dash (owner rule)', () => {
    for (const [key, value] of [...Object.entries(flatFr), ...Object.entries(flatEn)]) {
      expect(value.includes('—'), key).toBe(false);
    }
  });

  it('use the typographic apostrophe in French', () => {
    for (const [key, value] of Object.entries(flatFr)) {
      expect(value.includes("'"), key).toBe(false);
    }
  });

  it('put a no-break space, never a regular one, before : ; ? ! in French', () => {
    for (const [key, value] of Object.entries(flatFr)) {
      expect(/ [:;?!]/.test(value), key).toBe(false);
    }
  });

  it('state the owner facts in the hero', () => {
    expect(flatFr['hero.ledeRest']).toContain('Six ans d’expérience, dont trois comme tech lead');
    expect(flatEn['hero.ledeRest']).toContain('Six years of experience, three as tech lead');
  });
});
