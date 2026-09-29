import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';

const files = ['fields.ts', 'brief-schema.ts', 'contact-schema.ts'].map((f) =>
  readFileSync(new URL(`../../src/lib/forms/${f}`, import.meta.url), 'utf8'),
);
const keys = new Set(files.flatMap((s) => [...s.matchAll(/'errors\.(\w+)'/g)].map((m) => m[1])));

describe('form error messages', () => {
  it('finds the keys the schemas emit', () => {
    expect([...keys].sort()).toEqual(
      ['invalidEmail', 'invalidUrl', 'messageTooLong', 'messageTooShort', 'pitchTooLong', 'pitchTooShort', 'required', 'tooLong'].sort(),
    );
  });
  it('exist in both message files', () => {
    for (const key of keys) {
      expect((fr.errors as Record<string, string>)[key], `fr ${key}`).toBeTruthy();
      expect((en.errors as Record<string, string>)[key], `en ${key}`).toBeTruthy();
    }
  });
});
