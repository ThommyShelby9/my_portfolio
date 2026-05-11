/**
 * Dynamic sitemap source — exposes case-study URLs to @nuxtjs/sitemap.
 *
 * NOTE: @nuxt/content v3's `queryCollection` requires a full h3 event with
 * request headers, which the sitemap module's internal fetcher does not
 * provide. Instead of going through @nuxt/content, we read the markdown files
 * directly from disk at request time. The list is small (≤ 25 files) and the
 * sitemap is regenerated infrequently, so the I/O cost is negligible.
 */
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

export default defineSitemapEventHandler(async () => {
  // Resolve content dir from project root. Works both in dev (cwd = project root)
  // and in production (Nitro bundle reads from the deployed working directory).
  const contentDir = resolve(process.cwd(), 'content')

  async function slugsFor(locale: 'fr' | 'en'): Promise<string[]> {
    try {
      const files = await readdir(resolve(contentDir, locale, 'work'))
      return files
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace(/\.md$/, ''))
    }
    catch {
      return []
    }
  }

  const [frSlugs, enSlugs] = await Promise.all([slugsFor('fr'), slugsFor('en')])
  const allSlugs = Array.from(new Set([...frSlugs, ...enSlugs]))

  const now = new Date().toISOString()
  const out: Array<{
    loc: string
    lastmod: string
    alternatives?: Array<{ hreflang: string; href: string }>
  }> = []

  for (const slug of allSlugs) {
    const alternatives: Array<{ hreflang: string; href: string }> = []
    if (frSlugs.includes(slug)) alternatives.push({ hreflang: 'fr', href: `/work/${slug}` })
    if (enSlugs.includes(slug)) alternatives.push({ hreflang: 'en', href: `/en/work/${slug}` })
    alternatives.push({ hreflang: 'x-default', href: `/work/${slug}` })

    if (frSlugs.includes(slug)) {
      out.push({ loc: `/work/${slug}`, lastmod: now, alternatives })
    }
    if (enSlugs.includes(slug)) {
      out.push({ loc: `/en/work/${slug}`, lastmod: now, alternatives })
    }
  }

  return out
})
