import { readdirSync, readFileSync } from 'node:fs';
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

// The terminal (src/components/terminal) loads on demand on /terminal: no page ships it up front.
it('keeps the terminal shell out of every page’s initial JS', () => {
  for (const page of ['fr.html', 'en.html', 'fr/a-propos.html', 'en/a-propos.html', 'fr/terminal.html', 'en/terminal.html']) {
    for (const file of initialScripts(page)) {
      expect(readFileSync(file, 'utf8').includes('rostel@cotonou:~$'), `${page}: ${file}`).toBe(false);
    }
  }
});

for (const page of ['fr.html', 'en.html']) {
  it(`${page}: initial JS stays within ${BUDGET / 1024} KB gzip and ships no GSAP`, () => {
    const files = initialScripts(page);
    expect(files.length).toBeGreaterThan(0);
    const sources = files.map((f) => readFileSync(f));
    const total = sources.reduce((sum, buf) => sum + gzipSync(buf).length, 0);
    console.log(`${page}: ${(total / 1024).toFixed(1)} KB gzip over ${files.length} scripts`);
    expect(total, `gzip total ${Math.round(total / 1024)} KB`).toBeLessThanOrEqual(BUDGET);
    for (const [i, buf] of sources.entries()) {
      const code = buf.toString('utf8');
      for (const needle of ['ScrollTrigger', '_gsap', 'GreenSock']) {
        expect(code.includes(needle), files[i] + ' contains ' + needle).toBe(false);
      }
    }
  });
}

// /?sculpture=poster hides the page: it must only exist in the poster build (pnpm sculpture:poster).
it('ships no sculpture poster mode (not a poster build)', () => {
  const chunks = readdirSync('.next/static/chunks', { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.js'));
  expect(chunks.length).toBeGreaterThan(0);
  for (const f of chunks) {
    const code = readFileSync(join('.next/static/chunks', f), 'utf8');
    expect(code.includes('dataset.poster'), `${f}: run pnpm build (this is a poster build)`).toBe(false);
  }
});
