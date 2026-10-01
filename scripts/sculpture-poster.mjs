// Renders the live sculpture once, frozen, and saves transparent WebP posters used when
// 3D is not shown (reduced motion, no WebGL, before idle).
// Poster mode (`/?sculpture=poster`) only exists in a build made with NEXT_PUBLIC_SCULPTURE_POSTER=1;
// in any other build the query string is ignored. So this script:
//   1. builds the site with NEXT_PUBLIC_SCULPTURE_POSTER=1,
//   2. starts the standalone server on a free port (3160 and up, never 3000 or 3111),
//   3. screenshots the frozen sculpture at desktop and mobile sizes, then stops the server.
//   pnpm sculpture:poster                 (poster build, then render)
//   pnpm sculpture:poster --skip-build    (reuse .next/standalone, which must be a poster build)
// Afterwards, run `pnpm build` again: the poster build must not be the one you test or ship.
// Optional env: POSTER_BASE_URL (use an already running poster build instead of starting one),
// POSTER_CHANNEL (e.g. msedge), POSTER_ARGS (space-separated Chromium flags).
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { startStandalone } from './standalone.mjs';

const targets = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
];

let base = process.env.POSTER_BASE_URL;
let stop = () => {};
if (!base) {
  if (!process.argv.includes('--skip-build')) {
    const build = spawnSync('pnpm', ['build'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NEXT_PUBLIC_SCULPTURE_POSTER: '1' },
    });
    if (build.status !== 0) process.exit(build.status ?? 1);
  }
  ({ base, stop } = await startStandalone({ from: 3160, name: 'sculpture-poster' }));
}

mkdirSync('public/sculpture', { recursive: true });
try {
  const browser = await chromium.launch({
    channel: process.env.POSTER_CHANNEL || undefined,
    args: process.env.POSTER_ARGS ? process.env.POSTER_ARGS.split(' ') : [],
  });
  try {
    for (const t of targets) {
      const page = await browser.newPage({ viewport: t.viewport, deviceScaleFactor: 2 });
      // Rendering a poster is not a visit: drop the page counter beacon.
      await page.route('**/api/hit', (route) => route.abort());
      await page.goto(`${base}/?sculpture=poster`, { waitUntil: 'load' });
      const poster = await page
        .waitForFunction(() => document.documentElement.dataset.poster === '1', null, { timeout: 10000 })
        .then(() => true, () => false);
      if (!poster) throw new Error('sculpture-poster: poster mode is off; the build must be made with NEXT_PUBLIC_SCULPTURE_POSTER=1');
      const stage = page.locator('[data-sculpture-stage] canvas');
      await stage.waitFor({ state: 'visible', timeout: 15000 });
      await page.waitForTimeout(1500); // let PMREM + first frames settle
      const png = await stage.screenshot({ omitBackground: true });
      await sharp(png).webp({ quality: 82, alphaQuality: 90 }).toFile(`public/sculpture/mobius-${t.name}.webp`);
      console.log(`poster written: public/sculpture/mobius-${t.name}.webp`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
} finally {
  stop();
}
if (!process.env.POSTER_BASE_URL) console.log('sculpture-poster: done. Run `pnpm build` again before testing or deploying.');
