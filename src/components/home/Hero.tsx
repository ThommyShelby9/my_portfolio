import type { CSSProperties, ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/site/ButtonLink';
import type { Locale } from '@/i18n/routing';
import { CV_PDF } from '@/lib/profile/cv-data';

export function Hero({ sculpture }: { sculpture?: ReactNode }) {
  const t = useTranslations('hero');
  const locale = useLocale() as Locale;
  return (
    <section className="mx-auto grid min-h-[92svh] max-w-[1280px] items-center gap-10 px-5 pt-[6vh] md:px-10 lg:grid-cols-[1.25fr_1fr] lg:pt-[10vh]">
      <div data-sculpture-slot className="order-first lg:order-last">{sculpture}</div>
      <div className="relative z-10">
        <p data-hero style={{ '--hero-i': 0 } as CSSProperties} className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">
          {t('eyebrow')}
        </p>
        <h1 data-hero style={{ '--hero-i': 1 } as CSSProperties} className="mt-5 font-display text-[clamp(38px,4.3vw,62px)] font-medium leading-[1.04] tracking-[-0.015em]">
          {t('titleBefore')}
          <em className="italic text-signal">{t('titleEm')}</em>
          {t('titleAfter')}
        </h1>
        <p data-hero style={{ '--hero-i': 2 } as CSSProperties} className="mb-8 mt-6 max-w-[52ch] text-[16.5px] leading-[1.7] text-muted">
          <strong className="font-medium text-ivory">{t('ledeName')}</strong>
          {t('ledeRest')}
        </p>
        <div data-hero style={{ '--hero-i': 3 } as CSSProperties} className="flex flex-wrap items-center gap-3.5">
          <ButtonLink href="/realisations" variant="primary" arrow>{t('ctaWork')}</ButtonLink>
          <ButtonLink href="/brief" variant="ghost">{t('ctaProject')}</ButtonLink>
          {/* A static file in the page language: a plain <a>, not the localized Link. */}
          <a
            href={CV_PDF[locale]}
            download
            type="application/pdf"
            data-cv-link
            className="ml-1.5 border-b border-edge pb-0.5 text-[13.5px] font-semibold text-ivory no-underline transition-colors hover:border-signal hover:text-signal"
          >
            {t('ctaCv')}
          </a>
        </div>
        <p data-hero style={{ '--hero-i': 4 } as CSSProperties} className="mt-[10vh] flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
          <span aria-hidden="true" className="block h-[38px] w-px bg-linear-to-b from-signal to-transparent" />
          {t('scroll')}
        </p>
      </div>
    </section>
  );
}
