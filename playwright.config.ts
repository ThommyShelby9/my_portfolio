import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PW_PORT ?? 3000);

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // Headless Chromium renders WebGL in software; more workers starve the main thread and make timings flaky.
  workers: 2,
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: {
    command: 'pnpm build && node .next/standalone/server.js',
    url: `http://127.0.0.1:${PORT}/api/health`,
    // Opt-in only: a stale dev server on port 3000 must never be reused silently.
    reuseExistingServer: process.env.PW_REUSE === '1',
    timeout: 240_000,
    // 0.0.0.0: binding to 127.0.0.1 makes the standalone server redirect to itself in a loop.
    env: { PORT: String(PORT), HOSTNAME: '0.0.0.0' },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
