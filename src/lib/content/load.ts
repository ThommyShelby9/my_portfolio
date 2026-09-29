import 'server-only';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';
import type { Locale } from '@/i18n/routing';
import { renderMarkdown, type Heading } from './markdown';
import { parseFrontmatter, type Frontmatter, type ProjectKind } from './schema';

export type { ProjectKind } from './schema';

export type ProjectImage = {
  src: string;
  alt: string;
  kind: 'public' | 'interior';
  width: number;
  height: number;
};

export type Project = Omit<Frontmatter, 'images'> & {
  kind: ProjectKind;
  slug: string;
  locale: Locale;
  images: ProjectImage[];
  bodyHtml: string;
  headings: Heading[];
};

export type LoadOptions = { root?: string; publicRoot?: string };

const FOLDER: Record<ProjectKind, string> = { realisation: 'realisations', exploration: 'explorations' };
const LOCALES: Locale[] = ['fr', 'en'];

const defaultRoot = () => path.join(process.cwd(), 'content');
const defaultPublic = () => path.join(process.cwd(), 'public');

function slugsIn(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3))
    .sort();
}

export function getAllSlugs(kind: ProjectKind, opts: LoadOptions = {}): string[] {
  const dir = path.join(opts.root ?? defaultRoot(), FOLDER[kind]);
  const perLocale = LOCALES.map((l) => ({ l, slugs: slugsIn(path.join(dir, l)) }));
  const all = [...new Set(perLocale.flatMap((x) => x.slugs))].sort();
  for (const slug of all) {
    for (const { l, slugs } of perLocale) {
      if (!slugs.includes(slug)) throw new Error(`content: missing ${l} twin for ${kind} "${slug}"`);
    }
  }
  return all;
}

async function loadOne(kind: ProjectKind, locale: Locale, slug: string, opts: LoadOptions): Promise<Project> {
  const root = opts.root ?? defaultRoot();
  const file = path.join(root, FOLDER[kind], locale, `${slug}.md`);
  if (!existsSync(file)) throw new Error(`content: missing ${locale} file for ${kind} "${slug}" (${file})`);
  const { data, content } = matter(readFileSync(file, 'utf8'));
  const parsed = parseFrontmatter(kind, data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`content: invalid frontmatter in ${file}: ${issues}`);
  }
  const pub = opts.publicRoot ?? defaultPublic();
  const images: ProjectImage[] = [];
  for (const img of parsed.data.images) {
    const abs = path.join(pub, img.src);
    if (!existsSync(abs)) throw new Error(`content: image ${img.src} not found in public/ (${file})`);
    const meta = await sharp(abs).metadata();
    if (!meta.width || !meta.height) throw new Error(`content: cannot read dimensions of ${img.src}`);
    images.push({ ...img, width: meta.width, height: meta.height });
  }
  const { html, headings } = renderMarkdown(content);
  return { ...parsed.data, images, kind, slug, locale, bodyHtml: html, headings };
}

const featuredRank = (p: Project) => p.featured ?? Number.POSITIVE_INFINITY;

export async function getProjects(kind: ProjectKind, locale: Locale, opts: LoadOptions = {}): Promise<Project[]> {
  const projects = await Promise.all(getAllSlugs(kind, opts).map((s) => loadOne(kind, locale, s, opts)));
  return projects.sort((a, b) => featuredRank(a) - featuredRank(b) || b.year - a.year || a.order - b.order);
}

export async function getProject(
  kind: ProjectKind,
  locale: Locale,
  slug: string,
  opts: LoadOptions = {},
): Promise<Project | null> {
  if (!getAllSlugs(kind, opts).includes(slug)) return null;
  return loadOne(kind, locale, slug, opts);
}

export async function getNeighbours(
  kind: ProjectKind,
  locale: Locale,
  slug: string,
  opts: LoadOptions = {},
): Promise<{ prev: Project | null; next: Project | null }> {
  const all = await getProjects(kind, locale, opts);
  const i = all.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return { prev: all[i - 1] ?? null, next: all[i + 1] ?? null };
}
