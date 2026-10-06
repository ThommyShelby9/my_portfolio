import { routing } from '@/i18n/routing';
import { getAllSlugs } from '@/lib/content/load';
import { caseOgImage } from '@/lib/og/case-image';
import { OG_SIZE } from '@/lib/og/card';

export const size = OG_SIZE;
export const contentType = 'image/png';

// Generated at build time for every case, like the pages themselves.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getAllSlugs('exploration').map((slug) => ({ locale, slug })));
}

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  return caseOgImage('exploration', locale, slug);
}
