import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// proxy.ts cannot be imported under Vitest (next-intl/middleware needs Next's runtime) and Next
// requires the matcher to be a static literal, so read the literal from the source and evaluate it.
const source = readFileSync('src/proxy.ts', 'utf8');
const literal = /matcher:\s*('(?:[^'\\]|\\.)*')/.exec(source)?.[1];
if (!literal) throw new Error('matcher literal not found in src/proxy.ts');
const matcher = new RegExp('^' + (JSON.parse(JSON.stringify(new Function(`return ${literal}`)())) as string) + '$');

describe('proxy matcher', () => {
  it('runs for page routes', () => {
    for (const path of ['/', '/en', '/en/work', '/realisations', '/fr']) {
      expect(matcher.test(path), path).toBe(true);
    }
  });

  it('skips api, internals and files with an extension', () => {
    for (const path of [
      '/favicon.ico',
      '/api/health',
      '/_next/static/x.js',
      '/dna/helix-desktop.webp',
      '/fr/opengraph-image',
      '/en/realisations/contractiq/opengraph-image',
    ]) {
      expect(matcher.test(path), path).toBe(false);
    }
  });
});
