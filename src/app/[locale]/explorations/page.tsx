import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Conversion } from '@/components/home/Conversion';
import { Reveal } from '@/components/motion/Reveal';
import { IndexHeader, WorkGrid } from '@/components/work/WorkIndex';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getProjects } from '@/lib/content/load';
import { pageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/explorations'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'explorations' });
  return pageMetadata({ locale: locale as Locale, href: '/explorations', title: t('metaTitle'), description: t('metaDescription') });
}

export default async function ExplorationsPage({ params }: PageProps<'/[locale]/explorations'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [projects, t, c] = await Promise.all([
    getProjects('exploration', locale),
    getTranslations({ locale, namespace: 'explorations' }),
    getTranslations({ locale, namespace: 'caseStudy' }),
  ]);
  const years = [...new Set(projects.map((p) => p.year))].sort();
  return (
    <>
      <IndexHeader
        kicker={t('kicker')}
        title={t('title')}
        lede={t('lede')}
        meta={t('count', { count: projects.length, year: years.join(', ') })}
      />
      <section className="mx-auto max-w-[1280px] px-5 pb-[14vh] pt-[8vh] md:px-10">
        <WorkGrid projects={projects} headingLevel={2} />
        <Reveal className="mt-[14vh] flex flex-col gap-4 border-t border-line pt-10 md:flex-row md:items-baseline md:justify-between">
          <p data-reveal className="max-w-[52ch] font-serif text-[24px] font-medium leading-[1.3] text-muted">{t('workText')}</p>
          <div data-reveal>
            <Link href="/realisations" className="border-b border-graphite pb-1 text-sm no-underline hover:border-champagne hover:text-champagne">
              {t('workLink')}
            </Link>
          </div>
        </Reveal>
      </section>
      <Conversion kicker={c('conversionKicker')} />
    </>
  );
}
