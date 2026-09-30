// Writes src/lib/server/known-slugs.json, the case-study and exploration slugs, at build time.
// The visit counter builds its allow-list of pages from it, so the server never reads content/
// at request time. tests/unit/known-paths.test.ts fails when the file drifts from content/.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = 'src/lib/server/known-slugs.json';

function slugs(folder) {
  const all = new Set();
  for (const locale of ['fr', 'en']) {
    const dir = `content/${folder}/${locale}`;
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) if (f.endsWith('.md')) all.add(f.slice(0, -3));
  }
  return [...all].sort();
}

const next = `${JSON.stringify({ realisations: slugs('realisations'), explorations: slugs('explorations') }, null, 2)}\n`;
const current = existsSync(OUT) ? readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
if (current !== next) {
  writeFileSync(OUT, next);
  console.log(`known-slugs: ${OUT} updated`);
}
