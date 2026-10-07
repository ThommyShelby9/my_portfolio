import type { Metadata } from 'next';
import { DnaScene } from '@/components/dna/DnaScene';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Conversion } from '@/components/home/Conversion';
import { Reveal } from '@/components/motion/Reveal';
import { WorkCase } from '@/components/work/WorkCase';
import { IndexHeader, WorkGrid } from '@/components/work/WorkIndex';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getProjects } from '@/lib/content/load';
import { pageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/realisations'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'workIndex' });
  return pageMetadata({ locale: locale as Locale, href: '/realisations', title: t('metaTitle'), description: t('metaDescription') });
}

export default async function WorkIndexPage({ params }: PageProps<'/[locale]/realisations'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [projects, t, c] = await Promise.all([
    getProjects('realisation', locale),
    getTranslations({ locale, namespace: 'workIndex' }),
    getTranslations({ locale, namespace: 'caseStudy' }),
  ]);
  const featured = projects.filter((p) => p.featured !== null);
  const others = projects.filter((p) => p.featured === null);
  const years = projects.map((p) => p.year);
  return (
    <>
      {/* The helix, pulses running: everything shipped comes from it. */}
      <DnaScene mode="page" state={1} />
      <IndexHeader
        kicker={t('kicker')}
        title={t('title')}
        lede={t('lede')}
        meta={t('count', { count: projects.length, from: String(Math.min(...years)), to: String(Math.max(...years)) })}
      />
      <section className="mx-auto max-w-[1280px] px-5 md:px-10">
        <ol>
          {featured.map((p, i) => (
            <li key={p.slug}>
              <WorkCase
                index={i}
                headingLevel={2}
                item={{
                  slug: p.slug,
                  name: p.title,
                  what: p.sector ?? '',
                  role: p.role,
                  roleDetail: String(p.year),
                  challenge: p.summary,
                  coauthors: p.coauthors,
                  stack: p.stack.slice(0, 6),
                  image: p.images[0],
                  genes: p.genes,
                }}
              />
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="autres-realisations" className="mx-auto max-w-[1280px] px-5 pb-[14vh] pt-[14vh] md:px-10">
        <Reveal>
          <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">{t('othersKicker')}</p>
          <h2 id="autres-realisations" data-reveal className="mt-3.5 max-w-[22ch] font-display text-[clamp(34px,4vw,56px)] font-extrabold uppercase tracking-[-0.02em] leading-[0.96]">
            {t('othersTitle')}
          </h2>
        </Reveal>
        <WorkGrid projects={others} offset={featured.length} />
        <Reveal className="mt-[14vh] flex flex-col gap-4 border-t border-line pt-10 md:flex-row md:items-baseline md:justify-between">
          <p data-reveal className="max-w-[52ch] font-sans text-[19px] font-normal leading-[1.55] text-muted">{t('explorationsText')}</p>
          <div data-reveal>
            <Link href="/explorations" className="border-b border-edge pb-1 text-sm no-underline hover:border-signal hover:text-signal">
              {t('explorationsLink')}
            </Link>
          </div>
        </Reveal>
      </section>
      <Conversion kicker={c('conversionKicker')} />
    </>
  );
}
