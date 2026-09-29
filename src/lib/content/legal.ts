import 'server-only';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Locale } from '@/i18n/routing';
import { renderMarkdown, type Heading } from './markdown';

export type LegalSlug = 'confidentialite' | 'cgu';

export type LegalDoc = { updated: string; html: string; headings: Heading[] };

// Read at build time only (both pages are prerendered): the standalone output does not ship content/.
const defaultRoot = () => path.join(process.cwd(), 'content');

/** A legal page from `content/legal/<locale>/<slug>.md`; frontmatter `updated: 'YYYY-MM-DD'`. */
export function getLegal(slug: LegalSlug, locale: Locale, opts: { root?: string } = {}): LegalDoc {
  const file = path.join(/*turbopackIgnore: true*/ opts.root ?? defaultRoot(), 'legal', locale, `${slug}.md`);
  if (!existsSync(file)) throw new Error(`content: missing legal page ${locale}/${slug} (${file})`);
  const { data, content } = matter(readFileSync(file, 'utf8'));
  const updated = String(data.updated ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updated)) throw new Error(`content: ${file} needs updated: 'YYYY-MM-DD' in its frontmatter`);
  const { html, headings } = renderMarkdown(content);
  return { updated, html, headings };
}
