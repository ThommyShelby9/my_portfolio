import type { CSSProperties } from 'react';
import { getTranslations } from 'next-intl/server';
import { DnaScene } from '@/components/dna/DnaScene';
import { Conversion } from '@/components/home/Conversion';
import { Reveal } from '@/components/motion/Reveal';
import { JsonLd } from '@/components/seo/JsonLd';
import { ButtonLink } from '@/components/site/ButtonLink';
import { WorkGrid } from '@/components/work/WorkIndex';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getProjects } from '@/lib/content/load';
import type { Service } from '@/lib/content/services';
import { serviceJsonLd } from '@/lib/seo/service';

const hero = (i: number) => ({ '--hero-i': i }) as CSSProperties;

/**
 * A service page: what is sold, in the words clients search for, then the proof (the related case
 * studies, as on /realisations) and the questions clients ask, answered (also emitted as FAQPage).
 */
export async function ServicePage({ service: s, locale }: { service: Service; locale: Locale }) {
  const [t, realisations] = await Promise.all([getTranslations({ locale, namespace: 'services' }), getProjects('realisation', locale)]);
  // Kept in the order the service page lists them; a slug that no longer exists is skipped.
  const related = s.related.flatMap((slug) => realisations.filter((p) => p.slug === slug));
  return (
    <>
      <DnaScene mode="page" state={3} />
      <JsonLd data={serviceJsonLd(s)} />
      <article data-service={s.slug}>
        <header className="mx-auto max-w-[1280px] px-5 pt-[6vh] md:px-10 lg:pt-[8vh]">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2.5 font-mono text-xs text-faint no-underline transition-colors hover:text-signal"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M12 7H2M6 3 2 7l4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            {t('back')}
          </Link>
          <p data-hero style={hero(0)} className="mt-[7vh] font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal lg:mt-[9vh]">
            {t('kicker')}
          </p>
          <h1 data-hero style={hero(1)} className="mt-5 max-w-[18ch] font-display text-[clamp(40px,5.4vw,80px)] font-extrabold uppercase leading-[0.96] tracking-[-0.025em]">
            {s.title}
          </h1>
          <div data-hero style={hero(2)} className="mt-9 flex flex-col gap-8 border-b border-line pb-10 md:flex-row md:items-end md:justify-between md:gap-16">
            <p className="max-w-[58ch] text-[16.5px] leading-[1.7] text-muted">{s.summary}</p>
            <div className="flex shrink-0 flex-wrap gap-3.5">
              <ButtonLink href="/brief" variant="primary" arrow>{t('cta')}</ButtonLink>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1280px] gap-x-14 gap-y-12 px-5 pt-[8vh] md:px-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <nav aria-label={t('onThisPage')} className="lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
            <p aria-hidden="true" className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{t('onThisPage')}</p>
            <ol className="mt-5 border-t border-line">
              {[...s.headings, ...(related.length ? [{ id: 'realisations', text: t('related') }] : []), ...(s.faq.length ? [{ id: 'faq', text: t('faq') }] : [])].map((h, i) => (
                <li key={h.id} className="border-b border-line">
                  <a href={`#${h.id}`} className="flex gap-4 py-3 text-[14.5px] leading-[1.45] text-muted no-underline transition-colors hover:text-ivory">
                    <span aria-hidden="true" className="w-5 shrink-0 pt-[3px] font-mono text-[11px] text-signal">{String(i + 1).padStart(2, '0')}</span>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="case-prose legal-prose min-w-0" dangerouslySetInnerHTML={{ __html: s.bodyHtml }} />
        </div>

        {related.length > 0 && (
          <section id="realisations" aria-labelledby="realisations-title" className="mx-auto max-w-[1280px] scroll-mt-[calc(var(--header-h)+24px)] px-5 pt-[14vh] md:px-10">
            <h2 id="realisations-title" className="max-w-[20ch] font-display text-[clamp(32px,3.6vw,52px)] font-extrabold uppercase leading-[0.96] tracking-[-0.02em]">
              {t('related')}
            </h2>
            <p className="mt-5 max-w-[54ch] text-[16px] leading-[1.7] text-muted">{t('relatedLede')}</p>
            <WorkGrid projects={related} headingLevel={3} />
          </section>
        )}

        {s.faq.length > 0 && (
          <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-[1280px] scroll-mt-[calc(var(--header-h)+24px)] px-5 pb-[6vh] pt-[14vh] md:px-10">
            <h2 id="faq-title" className="font-display text-[clamp(32px,3.6vw,52px)] font-extrabold uppercase leading-[0.96] tracking-[-0.02em]">
              {t('faq')}
            </h2>
            <Reveal as="div" className="mt-10 max-w-[860px] border-t border-line">
              {s.faq.map(({ q, a }) => (
                <details key={q} data-reveal className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-[17px] font-semibold leading-[1.45] text-ivory transition-colors hover:text-signal [&::-webkit-details-marker]:hidden">
                    {q}
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="mt-1 shrink-0 text-signal transition-transform duration-300 group-open:rotate-45">
                      <path d="M8 2v12M2 8h12" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </summary>
                  <p className="max-w-[68ch] pb-6 text-[15.5px] leading-[1.75] text-muted">{a}</p>
                </details>
              ))}
            </Reveal>
          </section>
        )}
      </article>
      <Conversion kicker={t('conversionKicker')} />
    </>
  );
}
