import { describe, expect, it } from 'vitest';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';
import { STATUSES } from '@/lib/content/schema';
import { NO_IMAGE_KEY } from '@/components/work/labels';

describe('NO_IMAGE_KEY', () => {
  it('maps every status to a note that exists in both locales', () => {
    expect(Object.keys(NO_IMAGE_KEY).sort()).toEqual([...STATUSES].sort());
    for (const messages of [fr, en]) {
      const ns = (messages as unknown as Record<string, Record<string, string>>).caseStudy;
      for (const key of Object.values(NO_IMAGE_KEY)) expect(ns[key]).toBeTruthy();
    }
  });
  it('tells private and archived apart from the generic case', () => {
    expect(NO_IMAGE_KEY.private).not.toBe(NO_IMAGE_KEY.archived);
    expect(NO_IMAGE_KEY.live).toBe(NO_IMAGE_KEY.concept);
  });
});
