import 'server-only';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import type { Locale } from '@/i18n/routing';
import { renderMarkdown, type Heading } from './markdown';

/**
 * Service pages, from `content/services/<locale>/<slug>.md`: what Rostel sells, written around the
 * keywords clients search for, each backed by real case studies (`related`, realisation slugs).
 */
const frontmatter = z
  .object({
    title: z.string().min(1),
    metaTitle: z.string().min(1).max(110),
    seoDescription: z.string().min(1).max(170),
    summary: z.string().min(1).max(260),
    order: z.number().int(),
    related: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
    faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).default([]),
  })
  .strict();

export type Service = z.infer<typeof frontmatter> & { slug: string; locale: Locale; bodyHtml: string; headings: Heading[] };

export type ServiceOptions = { root?: string };

const LOCALES: Locale[] = ['fr', 'en'];

// Read at build time only (every service page is prerendered): the standalone output does not ship content/.
const dirOf = (opts: ServiceOptions) => path.join(/*turbopackIgnore: true*/ opts.root ?? path.join(process.cwd(), 'content'), 'services');

export function getServiceSlugs(opts: ServiceOptions = {}): string[] {
  const dir = dirOf(opts);
  const perLocale = LOCALES.map((l) => {
    const d = path.join(/*turbopackIgnore: true*/ dir, l);
    return { l, slugs: existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [] };
  });
  const all = [...new Set(perLocale.flatMap((x) => x.slugs))].sort();
  for (const slug of all) {
    for (const { l, slugs } of perLocale) {
      if (!slugs.includes(slug)) throw new Error(`content: missing ${l} twin for service "${slug}"`);
    }
  }
  return all;
}

export function getService(locale: Locale, slug: string, opts: ServiceOptions = {}): Service | null {
  if (!getServiceSlugs(opts).includes(slug)) return null;
  const file = path.join(/*turbopackIgnore: true*/ dirOf(opts), locale, `${slug}.md`);
  const { data, content } = matter(readFileSync(file, 'utf8'));
  const parsed = frontmatter.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`content: invalid frontmatter in ${file}: ${issues}`);
  }
  const { html, headings } = renderMarkdown(content);
  return { ...parsed.data, slug, locale, bodyHtml: html, headings };
}

export function getServices(locale: Locale, opts: ServiceOptions = {}): Service[] {
  return getServiceSlugs(opts)
    .map((slug) => getService(locale, slug, opts) as Service)
    .sort((a, b) => a.order - b.order);
}
