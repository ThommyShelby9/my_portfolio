import { defineConfig, devices } from '@playwright/test';
import { EMULATOR_HOST, EMULATOR_PROJECT } from './tests/e2e/helpers/emulator';

const PORT = Number(process.env.PW_PORT ?? 3000);

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // Headless Chromium renders WebGL in software; more workers starve the main thread and make timings flaky.
  workers: 2,
  // The home renders a 40 000-particle helix with bloom in software here: give each test room.
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Software WebGL (SwiftShader) so the live DNA helix renders and is tested in headless runs.
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  webServer: [
    {
      // Forms and the visit counter write here: never to the real Firebase project.
      command: `firebase emulators:start --only firestore --project ${EMULATOR_PROJECT}`,
      url: `http://${EMULATOR_HOST}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'pnpm build && node .next/standalone/server.js',
      url: `http://127.0.0.1:${PORT}/api/health`,
      // Opt-in only: a stale dev server on port 3000 must never be reused silently.
      reuseExistingServer: process.env.PW_REUSE === '1',
      timeout: 240_000,
      env: {
        // 0.0.0.0: binding to 127.0.0.1 makes the standalone server redirect to itself in a loop.
        PORT: String(PORT),
        HOSTNAME: '0.0.0.0',
        // The standalone server does not read .env.local; these explicit values also win over any shell env.
        // With FIRESTORE_EMULATOR_HOST set, firebase-admin talks to the emulator and ignores credentials.
        FIRESTORE_EMULATOR_HOST: EMULATOR_HOST,
        FIREBASE_PROJECT_ID: EMULATOR_PROJECT,
        FIREBASE_SERVICE_ACCOUNT: '',
        // Without credentials the Google auth library probes the GCE metadata server; skip that lookup.
        METADATA_SERVER_DETECTION: 'none',
        // No SMTP: email counts as skipped, nothing is ever sent from a test run.
        SMTP_HOST: '',
        SMTP_USER: '',
        SMTP_PASS: '',
      },
    },
  ],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
