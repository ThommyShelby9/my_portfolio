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
  const files = ROOTS.flatMap((root) =>
    walk(root)
      .filter((p) => /\.(html|css)$/.test(p))
      .map((p) => ({ path: relative('.', p), content: readFileSync(p, 'utf8') })),
  );
  const pages = files.filter((f) => f.path.endsWith('.html'));
  expect(pages.length).toBeGreaterThan(0);
  // Next's own error shells (_not-found, _global-error) are framework output, not site copy.
  const siteFiles = files.filter((f) => !/[\\/]_(not-found|global-error)/.test(f.path));
  expect(checkOwnerRules(siteFiles)).toEqual([]);
});
