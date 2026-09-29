import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { expect, it } from 'vitest';

const BUDGET = 160 * 1024;

function initialScripts(page: string): string[] {
  const html = readFileSync(join('.next/server/app', page), 'utf8');
  return [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>/g)]
    .filter((m) => !/\bnoModule\b/i.test(m[0]))
    .map((m) => join('.next', m[1].replace(/^\/_next/, '')));
}

for (const page of ['fr.html', 'en.html']) {
  it(`${page}: initial JS stays within ${BUDGET / 1024} KB gzip and ships no GSAP`, () => {
    const files = initialScripts(page);
    expect(files.length).toBeGreaterThan(0);
    const sources = files.map((f) => readFileSync(f));
    const total = sources.reduce((sum, buf) => sum + gzipSync(buf).length, 0);
    console.log(`${page}: ${(total / 1024).toFixed(1)} KB gzip over ${files.length} scripts`);
    expect(total, `gzip total ${Math.round(total / 1024)} KB`).toBeLessThanOrEqual(BUDGET);
    for (const [i, buf] of sources.entries()) {
      expect(buf.toString('utf8').includes('ScrollTrigger'), files[i]).toBe(false);
    }
  });
}
