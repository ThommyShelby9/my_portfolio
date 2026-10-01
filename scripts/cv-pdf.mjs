// Prints the CV page to A4 PDFs, one per language, committed under public/cv/:
//   /cv    -> public/cv/rostel-panoumassi-cv.pdf
//   /en/cv -> public/cv/rostel-panoumassi-cv-en.pdf
// Builds the site, starts the standalone server on a free port (3140 and up, never 3000 or 3111),
// prints both pages with Playwright's Chromium, then stops the server.
//   pnpm cv:pdf                 (build, then print)
//   pnpm cv:pdf --skip-build    (reuse the current .next/standalone build)
// Run `pnpm build` again afterwards if the standalone folder must serve the new PDFs.
// It also writes public/cv/cv-inputs.sha256: the hash of the CV inputs each PDF was printed from
// (stamped by the page as data-cv-inputs). tests/unit/cv-pdf.test.ts recomputes it, so a CV data or
// copy change without a new print fails the unit tests.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { countPdfPages } from './pdf-pages.mjs';
import { startStandalone } from './standalone.mjs';

const TARGETS = [
  { path: '/cv', file: 'public/cv/rostel-panoumassi-cv.pdf' },
  { path: '/en/cv', file: 'public/cv/rostel-panoumassi-cv-en.pdf' },
];
const HASH_FILE = 'public/cv/cv-inputs.sha256';

if (!process.argv.includes('--skip-build')) {
  const build = spawnSync('pnpm', ['build'], { stdio: 'inherit', shell: true });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const { base, stop } = await startStandalone({ from: 3140, name: 'cv-pdf' });

let failed = false;
try {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    // Printing is not a visit: drop the page counter beacon.
    await page.route('**/api/hit', (route) => route.abort());
    mkdirSync('public/cv', { recursive: true });
    const hashes = [];
    for (const { path: route, file } of TARGETS) {
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      const hash = await page.getAttribute('[data-cv]', 'data-cv-inputs');
      if (!hash || !/^[0-9a-f]{64}$/.test(hash)) throw new Error(`cv-pdf: ${route} carries no data-cv-inputs hash`);
      hashes.push(`${hash}  ${path.basename(file)}`);
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({ path: file, format: 'A4', printBackground: true });
      const pages = countPdfPages(readFileSync(file));
      console.log(`cv-pdf: ${file} (${pages} page${pages > 1 ? 's' : ''})`);
      if (pages > 2) {
        console.error(`cv-pdf: ${file} has ${pages} pages, the CV must fit on two at most`);
        failed = true;
      }
    }
    writeFileSync(HASH_FILE, `${hashes.join('\n')}\n`);
    console.log(`cv-pdf: ${HASH_FILE}`);
  } finally {
    await browser.close();
  }
} finally {
  stop();
}
if (failed) process.exit(1);
