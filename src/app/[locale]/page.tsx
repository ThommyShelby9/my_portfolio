import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { Construction } from '@/components/home/Construction';
import { Conversion } from '@/components/home/Conversion';
import { Expression } from '@/components/home/Expression';
import { Hero } from '@/components/home/Hero';
import { Lab } from '@/components/home/Lab';
import { Sequencing } from '@/components/home/Sequencing';
import type { Locale } from '@/i18n/routing';
import { getProjects } from '@/lib/content/load';
import { homeJsonLd } from '@/lib/seo/home-jsonld';
import { pageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'meta' });
  return pageMetadata({ locale: locale as Locale, href: '/', title: t('title'), description: t('description') });
}

/** The home as the six-scene DNA journey (spec §4.1); the helix behind it follows each scene. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [realisations, explorations] = await Promise.all([getProjects('realisation', locale), getProjects('exploration', locale)]);
  const featured = realisations.filter((p) => p.featured !== null).sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));
  return (
    <>
      <JsonLd data={homeJsonLd(locale)} />
      <Hero signatures={featured.map((p) => p.genes)} />
      <Sequencing />
      <Construction />
      <Expression projects={featured} />
      <Lab projects={explorations} />
      <Conversion />
    </>
  );
}
