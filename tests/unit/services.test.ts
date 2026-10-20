import { describe, expect, it } from 'vitest';
import { getAllSlugs } from '@/lib/content/load';
import { getService, getServiceSlugs, getServices } from '@/lib/content/services';
import { serviceJsonLd, serviceUrl } from '@/lib/seo/service';

const slugs = getServiceSlugs();

describe('service pages', () => {
  it('exist in both locales, in the same order', () => {
    expect(slugs.length).toBeGreaterThan(0);
    const fr = getServices('fr').map((s) => s.slug);
    expect(getServices('en').map((s) => s.slug)).toEqual(fr);
  });

  it('only point to case studies that exist, and keep the same ones in both locales', () => {
    const realisations = getAllSlugs('realisation');
    for (const slug of slugs) {
      const [fr, en] = [getService('fr', slug)!, getService('en', slug)!];
      expect(en.related, slug).toEqual(fr.related);
      for (const r of fr.related) expect(realisations, `${slug} → ${r}`).toContain(r);
      expect(en.faq.length, slug).toBe(fr.faq.length);
    }
  });

  it('never contain an em dash (owner rule)', () => {
    for (const slug of slugs) {
      for (const locale of ['fr', 'en'] as const) {
        const s = getService(locale, slug)!;
        const visible = [s.title, s.metaTitle, s.summary, s.bodyHtml, ...s.faq.flatMap((f) => [f.q, f.a])].join(' ');
        expect(visible.includes('—'), `${locale}/${slug}`).toBe(false);
      }
    }
  });

  it('use the typographic apostrophe in French', () => {
    for (const slug of slugs) {
      const s = getService('fr', slug)!;
      const visible = [s.title, s.metaTitle, s.seoDescription, s.summary, s.bodyHtml.replace(/<[^>]+>/g, ''), ...s.faq.flatMap((f) => [f.q, f.a])].join(' ');
      expect(visible.includes("'"), slug).toBe(false);
    }
  });

  it('emit the FAQ word for word as FAQPage, with a breadcrumb back to /services', () => {
    const s = getService('en', slugs[0])!;
    const graph = serviceJsonLd(s)['@graph'] as Record<string, unknown>[];
    expect(graph.map((n) => n['@type'])).toEqual(['Service', 'FAQPage', 'BreadcrumbList']);
    const faq = graph[1].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(faq.map((q) => q.name)).toEqual(s.faq.map((f) => f.q));
    expect(serviceUrl(s)).toBe(`https://rostelmissimawu.com/en/services/${s.slug}`);
  });
});
