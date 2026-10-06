import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/content/load';
import { buildSitemapEntries } from '@/lib/seo/sitemap-entries';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries({
    realisations: getAllSlugs('realisation'),
    explorations: getAllSlugs('exploration'),
    lastModified: new Date(),
  });
}
