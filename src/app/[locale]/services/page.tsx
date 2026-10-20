import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DnaScene } from '@/components/dna/DnaScene';
import { Conversion } from '@/components/home/Conversion';
import { ServiceList } from '@/components/services/ServiceList';
import { IndexHeader } from '@/components/work/WorkIndex';
import type { Locale } from '@/i18n/routing';
import { getServices } from '@/lib/content/services';
import { pageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'services' });
  return pageMetadata({ locale: locale as Locale, href: '/services', title: t('metaTitle'), description: t('metaDescription') });
}

export default async function ServicesIndexPage({ params }: PageProps<'/[locale]/services'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'services' });
  const services = getServices(locale);
  return (
    <>
      <DnaScene mode="page" state={2} />
      <IndexHeader kicker={t('kicker')} title={t('title')} lede={t('lede')} meta={t('count', { count: services.length })} />
      <ServiceList services={services} more={t('more')} />
      <Conversion kicker={t('conversionKicker')} />
    </>
  );
}
