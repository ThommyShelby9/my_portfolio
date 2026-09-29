import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// No query-string Disallow (e.g. /?sculpture=): support is inconsistent across crawlers,
// and those URLs already canonicalise to their clean path.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
