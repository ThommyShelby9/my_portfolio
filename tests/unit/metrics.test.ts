import { describe, expect, it } from 'vitest';
import { extractNumbers, findUnsourcedMetrics } from '../../src/content/metrics';

const metrics = (text: string) => extractNumbers(text).filter((n) => n.isMetric).map((n) => n.raw);

describe('extractNumbers', () => {
  it('does not treat versions, small counts or years as metrics', () => {
    expect(metrics('Built on Laravel 12, PHP 8.2 and Node 22 since 2023, with 3 modules.')).toEqual([]);
  });

  it('treats percentages, signed values, plus-suffixed and large values as metrics', () => {
    expect(metrics('+240% organic traffic')).toEqual(['+240%']);
    expect(metrics('−85% manual entry')).toEqual(['−85%']);
    expect(metrics('cut by 85% in six months')).toEqual(['85%']);
    expect(metrics('1,200+ active users')).toEqual(['1,200+']);
    expect(metrics('1 200+ utilisateurs actifs')).toEqual(['1 200+']);
    expect(metrics('23,625 TypeScript lines')).toEqual(['23,625']);
    expect(metrics('Lighthouse SEO score of 100')).toEqual(['100']);
  });

  it('normalises equivalent spellings to the same key', () => {
    const keys = (s: string) => extractNumbers(s).map((n) => n.key);
    expect(keys('1,200+')).toEqual(keys('1 200+'));
    expect(keys('+240%')).toEqual(keys('240%'));
    expect(keys('−85%')).toEqual(keys('-85%'));
  });
});

describe('findUnsourcedMetrics', () => {
  const proofs = [
    { text: '+240% organic traffic in 6 months' },
    { text: '1,200+ active users' },
  ];

  it('accepts metrics that appear in a proof, whatever the spelling', () => {
    expect(findUnsourcedMetrics('Traffic grew 240% and we reached 1 200+ users.', proofs)).toEqual([]);
  });

  it('reports metrics that no proof backs', () => {
    expect(findUnsourcedMetrics('We cut costs by 40% for 5,000 users.', proofs)).toEqual(['40%', '5,000']);
  });

  it('reports each unsourced metric once', () => {
    expect(findUnsourcedMetrics('40% here, 40% there', [])).toEqual(['40%']);
  });
});
