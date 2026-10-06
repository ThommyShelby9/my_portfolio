import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, it } from 'vitest';
import { checkOwnerRules } from '../../tools/owner-rules';

// Prerendered pages and the CSS shipped to browsers.
const ROOTS = ['.next/server/app', '.next/static'];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

it('the built site complies with the owner rules', () => {
  for (const root of ROOTS) expect(existsSync(root), `run \`pnpm build\` first (${root})`).toBe(true);
  const built = ROOTS.flatMap((root) => walk(root).map((p) => relative('.', p)));
  const files = built.filter((p) => /\.(html|css)$/.test(p)).map((p) => ({ path: p, content: readFileSync(p, 'utf8') }));
  const pages = files.filter((f) => f.path.endsWith('.html'));
  expect(pages.length).toBeGreaterThan(0);
  // Next's own error shell (_global-error) is framework output, not site copy. _not-found is the
  // site's global 404 (src/app/global-not-found.tsx) and is checked like any page.
  const siteFiles = files.filter((f) => !/[\\/]_global-error/.test(f.path));
  expect(files.some((f) => /[\\/]_not-found\.html$/.test(f.path) && f.content.includes('data-global-not-found'))).toBe(true);
  // The build paths also let the rules check the required pages (privacy policy, terms, FR and EN).
  expect(checkOwnerRules(siteFiles, built)).toEqual([]);
});
