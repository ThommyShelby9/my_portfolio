// Prints the CV page to A4 PDFs, one per language, committed under public/cv/:
//   /cv    -> public/cv/rostel-panoumassi-cv.pdf
//   /en/cv -> public/cv/rostel-panoumassi-cv-en.pdf
// Builds the site, starts the standalone server on a free port (3140 and up, never 3000 or 3111),
// prints both pages with Playwright's Chromium, then stops the server.
//   pnpm cv:pdf                 (build, then print)
//   pnpm cv:pdf --skip-build    (reuse the current .next/standalone build)
// Run `pnpm build` again afterwards if the standalone folder must serve the new PDFs.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import net from 'node:net';
import { chromium } from '@playwright/test';
import { countPdfPages } from './pdf-pages.mjs';

const TARGETS = [
  { path: '/cv', file: 'public/cv/rostel-panoumassi-cv.pdf' },
  { path: '/en/cv', file: 'public/cv/rostel-panoumassi-cv-en.pdf' },
];
const RESERVED = new Set([3000, 3111]);

function portIsFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.once('listening', () => probe.close(() => resolve(true)));
    probe.listen(port, '0.0.0.0');
  });
}

async function freePort(from = 3140) {
  for (let port = from; port < from + 50; port++) {
    if (!RESERVED.has(port) && (await portIsFree(port))) return port;
  }
  throw new Error('cv-pdf: no free port between 3140 and 3189');
}

async function waitForHealth(base, server) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`cv-pdf: the server exited with code ${server.exitCode}`);
    try {
      if ((await fetch(`${base}/api/health`)).ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('cv-pdf: the server did not answer /api/health within 60 s');
}

if (!process.argv.includes('--skip-build')) {
  const build = spawnSync('pnpm', ['build'], { stdio: 'inherit', shell: true });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const port = await freePort();
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['.next/standalone/server.js'], {
  stdio: ['ignore', 'inherit', 'inherit'],
  env: {
    ...process.env,
    PORT: String(port),
    // 0.0.0.0: binding to 127.0.0.1 makes the standalone server redirect to itself in a loop.
    HOSTNAME: '0.0.0.0',
    // Never reach the real Firebase project: no credentials, and an emulator address nothing listens on.
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:1',
    FIREBASE_PROJECT_ID: 'cv-pdf-offline',
    FIREBASE_SERVICE_ACCOUNT: '',
    METADATA_SERVER_DETECTION: 'none',
    SMTP_HOST: '',
  },
});

let failed = false;
try {
  await waitForHealth(base, server);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    // Printing is not a visit: drop the page counter beacon.
    await page.route('**/api/hit', (route) => route.abort());
    mkdirSync('public/cv', { recursive: true });
    for (const { path, file } of TARGETS) {
      await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({ path: file, format: 'A4', printBackground: true });
      const pages = countPdfPages(readFileSync(file));
      console.log(`cv-pdf: ${file} (${pages} page${pages > 1 ? 's' : ''})`);
      if (pages > 2) {
        console.error(`cv-pdf: ${file} has ${pages} pages, the CV must fit on two at most`);
        failed = true;
      }
    }
  } finally {
    await browser.close();
  }
} finally {
  server.kill();
}
if (failed) process.exit(1);
