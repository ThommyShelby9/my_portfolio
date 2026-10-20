import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ServicePage } from '@/components/services/ServicePage';
import type { Locale } from '@/i18n/routing';
import { getService, getServiceSlugs } from '@/lib/content/services';
import { serviceMetadata } from '@/lib/seo/service';

// Every service page is prerendered; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = getService(locale as Locale, slug);
  if (!service) notFound();
  return serviceMetadata(service);
}

export default async function ServiceRoute({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const service = getService(locale as Locale, slug);
  if (!service) notFound();
  return <ServicePage service={service} locale={locale as Locale} />;
}
