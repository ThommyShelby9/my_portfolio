// Starts the built standalone server for a local script (CV PDFs, DNA posters): on a free
// port (never 3000 or 3111), bound to 0.0.0.0, and cut off from Firebase and SMTP.
import { spawn } from 'node:child_process';
import net from 'node:net';

const RESERVED = new Set([3000, 3111]);

function portIsFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.once('listening', () => probe.close(() => resolve(true)));
    probe.listen(port, '0.0.0.0');
  });
}

async function freePort(from) {
  for (let port = from; port < from + 50; port++) {
    if (!RESERVED.has(port) && (await portIsFree(port))) return port;
  }
  throw new Error(`standalone: no free port between ${from} and ${from + 49}`);
}

async function waitForHealth(base, server, name) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`${name}: the server exited with code ${server.exitCode}`);
    try {
      if ((await fetch(`${base}/api/health`)).ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`${name}: the server did not answer /api/health within 60 s`);
}

/** Starts .next/standalone/server.js and resolves once it is healthy: `{ base, stop }`. */
export async function startStandalone({ from, name }) {
  const port = await freePort(from);
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
      FIREBASE_PROJECT_ID: `${name}-offline`,
      FIREBASE_SERVICE_ACCOUNT: '',
      METADATA_SERVER_DETECTION: 'none',
      SMTP_HOST: '',
    },
  });
  const stop = () => server.kill();
  try {
    await waitForHealth(base, server, name);
  } catch (err) {
    stop();
    throw err;
  }
  return { base, stop };
}
