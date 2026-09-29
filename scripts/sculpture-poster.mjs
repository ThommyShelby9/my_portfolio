// Renders the live sculpture once, frozen, and saves transparent WebP posters used when
// 3D is not shown (reduced motion, no WebGL, before idle). Needs a running server:
//   pnpm build && PORT=3100 HOSTNAME=0.0.0.0 node .next/standalone/server.js   (in another terminal)
//   pnpm sculpture:poster
// Optional env: POSTER_BASE_URL, POSTER_CHANNEL (e.g. msedge), POSTER_ARGS (space-separated Chromium flags).
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const BASE = process.env.POSTER_BASE_URL ?? 'http://127.0.0.1:3100';
const targets = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
];

mkdirSync('public/sculpture', { recursive: true });
const browser = await chromium.launch({
  channel: process.env.POSTER_CHANNEL || undefined,
  args: process.env.POSTER_ARGS ? process.env.POSTER_ARGS.split(' ') : [],
});
try {
  for (const t of targets) {
    const page = await browser.newPage({ viewport: t.viewport, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/?sculpture=poster`, { waitUntil: 'load' });
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
