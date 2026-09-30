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

describe('form-level messages', () => {
  it('take the direct address as an {email} argument instead of hardcoding it', () => {
    for (const [locale, messages] of [['fr', fr], ['en', en]] as const) {
      for (const key of ['rateLimited', 'failed'] as const) {
        const text = (messages.forms as Record<string, string>)[key];
        expect(text, `${locale} ${key}`).toContain('<mail>{email}</mail>');
        expect(text, `${locale} ${key}`).not.toMatch(/@/);
      }
    }
  });

  it('write the French thousands with a no-break space', () => {
    const texts = [fr.errors.pitchTooLong, fr.errors.messageTooLong, fr.brief.pitch.hint, fr.contact.message.hint,
      ...Object.values(fr.brief.budget)];
    for (const text of texts) expect(text, text).not.toMatch(/\d{4}|\d \d{3}|\d{3} €/);
    expect(fr.errors.pitchTooLong).toContain('1 000');
    expect(fr.brief.budget.k5to15).toBe('5 000 à 15 000 €');
  });
});
