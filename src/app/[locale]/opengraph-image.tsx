import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { OG_SIZE, ogCard } from '@/lib/og/card';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Default share image for every page without its own: the hero statement beside the DNA helix still. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'hero' });
  return ogCard({
    eyebrow: t('eyebrow'),
    title: [{ text: t('title'), accent: true }],
    titleSize: 52,
    footer: 'Rostel Panoumassi',
    still: '/dna/helix-desktop.webp',
  });
}
