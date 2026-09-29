import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from '@/lib/content/schema';
import { renderMarkdown } from '@/lib/content/markdown';
import { getProjects, getAllSlugs } from '@/lib/content/load';
import { findUnsourcedMetrics } from '@/lib/content/metrics';

const FIX = path.resolve(__dirname, '../fixtures/content');
const demo = () =>
  matter(readFileSync(path.join(FIX, 'realisations/fr/demo.md'), 'utf8')).data as Record<string, unknown>;

describe('schema', () => {
  it('accepts the demo fixture', () => {
    expect(parseFrontmatter('realisation', demo()).success).toBe(true);
  });
  it('rejects live without liveUrl', () => {
    const { liveUrl: _u, ...d } = demo();
    expect(parseFrontmatter('realisation', d).success).toBe(false);
  });
  it('rejects an exploration with featured 1', () => {
    const d = { ...demo(), status: 'concept', featured: 1 };
    expect(parseFrontmatter('exploration', d).success).toBe(false);
  });
  it('rejects a proof without source', () => {
    const d = { ...demo(), proofs: [{ text: '+10 %' }] };
    expect(parseFrontmatter('realisation', d).success).toBe(false);
  });
  it('rejects an image src outside /work/<slug>/NN.webp', () => {
    const d = { ...demo(), images: [{ src: '/x.png', alt: 'a', kind: 'public' }] };
    expect(parseFrontmatter('realisation', d).success).toBe(false);
  });
});

describe('renderMarkdown', () => {
  it('gives ids to h2', () => {
    const r = renderMarkdown('## Mon titre é\n\ntexte');
    expect(r.html).toContain('<h2 id="mon-titre-e">');
    expect(r.headings).toEqual([{ id: 'mon-titre-e', text: 'Mon titre é' }]);
  });
  it('escapes raw html', () => {
    const r = renderMarkdown('hello <script>alert(1)</script>\n\n<div>x</div>');
    expect(r.html).not.toContain('<script>');
    expect(r.html).not.toContain('<div>');
    expect(r.html).toContain('&lt;script&gt;');
  });
  it('adds rel noopener to external links only', () => {
    const r = renderMarkdown('[a](https://example.com) [b](/local)');
    expect(r.html).toContain('href="https://example.com"');
    expect(r.html).toMatch(/<a href="https:\/\/example.com"[^>]*rel="noopener"/);
    expect(r.html).not.toMatch(/href="\/local"[^>]*rel=/);
  });
});

describe('loader', () => {
  it('loads the demo in both locales', async () => {
    const fr = await getProjects('realisation', 'fr', { root: FIX });
    const en = await getProjects('realisation', 'en', { root: FIX });
    expect(fr.map((p) => p.slug)).toEqual(['demo']);
    expect(en[0].title).toBe('Demo');
    expect(fr[0].headings[0].id).toBe('contexte');
  });
  it('throws when the EN twin is missing', async () => {
    await expect(getProjects('exploration', 'fr', { root: FIX })).rejects.toThrow(/orphan/);
  });
  it('lists slugs', () => {
    expect(getAllSlugs('realisation', { root: FIX })).toEqual(['demo']);
  });
});

// Global guard over the real content/ folder.
const REAL = path.resolve(__dirname, '../../content');
function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.md') ? [path.join(dir, e.name)] : [],
  );
}
const stripTags = (h: string) => h.replace(/<[^>]*>/g, ' ');

describe('content guard (real content/)', () => {
  it('has no unsourced metrics, no em dash, no ASCII apostrophe in FR', async () => {
    for (const kind of ['realisation', 'exploration'] as const) {
      for (const locale of ['fr', 'en'] as const) {
        for (const p of await getProjects(kind, locale)) {
          const text = `${p.summary} ${stripTags(p.bodyHtml)}`;
          expect(findUnsourcedMetrics(text, p.proofs), `${kind}/${locale}/${p.slug}`).toEqual([]);
        }
      }
    }
    for (const f of walk(REAL)) {
      const raw = readFileSync(f, 'utf8');
      expect(raw, f).not.toContain('—');
      if (f.split(path.sep).includes('fr')) expect(raw, f).not.toContain("'");
    }
  });
});
