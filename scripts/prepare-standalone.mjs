// next build (output: 'standalone') does not copy public/ and .next/static/ into the
// standalone folder; the server needs both to serve assets.
import { cpSync, existsSync } from 'node:fs';

if (!existsSync('.next/standalone/server.js')) {
  console.error('prepare-standalone: .next/standalone/server.js not found, did next build run with output: "standalone"?');
  process.exit(1);
}
cpSync('public', '.next/standalone/public', { recursive: true });
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
console.log('prepare-standalone: public/ and .next/static/ copied');
