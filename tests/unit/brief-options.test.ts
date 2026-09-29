import { describe, expect, it } from 'vitest';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';
import { briefSchema } from '@/lib/forms/brief-schema';
import { BRIEF_CHOICES, BRIEF_RESOURCES } from '@/lib/forms/brief-options';

const valid = {
  projectType: 'new',
  pitch: 'A payment platform for merchants.',
  currentState: 'idea',
  teamSize: 'solo',
  deadline: 'flexible',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  locale: 'fr',
};

type Dict = Record<string, Record<string, string>>;

describe('brief choices', () => {
  it('offer exactly the enum values of the schema', () => {
    for (const field of ['projectType', 'currentState', 'teamSize', 'deadline'] as const) {
      const values = BRIEF_CHOICES[field].map(([value]) => value);
      expect(values, field).toEqual(briefSchema.shape[field].options);
    }
  });

  it('every budget value parses, and "undefined" means no budget', () => {
    for (const [value] of BRIEF_CHOICES.budget) {
      const r = briefSchema.safeParse({ ...valid, budget: value });
      expect(r.success, value).toBe(true);
      if (r.success) expect(r.data.budget).toBe(value === 'undefined' ? undefined : value);
    }
  });

  it('resource checkboxes are schema fields', () => {
    for (const name of BRIEF_RESOURCES) expect(Object.keys(briefSchema.shape)).toContain(name);
  });

  it('every choice has a label in both languages', () => {
    for (const messages of [fr, en]) {
      const brief = messages.brief as unknown as Dict;
      for (const [field, pairs] of Object.entries(BRIEF_CHOICES)) {
        expect(brief[field]?.label, field).toBeTruthy();
        for (const [, key] of pairs) expect(brief[field]?.[key], `${field}.${key}`).toBeTruthy();
      }
      for (const name of BRIEF_RESOURCES) expect(brief.resources?.[name], name).toBeTruthy();
    }
  });
});
