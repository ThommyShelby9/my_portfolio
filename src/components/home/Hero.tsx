import type { CSSProperties } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DnaStage } from '@/components/dna/DnaStage';
import { ButtonLink } from '@/components/site/ButtonLink';
import type { Locale } from '@/i18n/routing';
import { CV_PDF } from '@/lib/profile/cv-data';

/** Scene 00 « Formation »: the helix condenses behind a concrete statement (spec §4.1). */
export function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale() as Locale;
  return (
    <section
      data-dna-scene="formation"
      className="relative isolate overflow-hidden"
    >
      <DnaStage />
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-var(--header-h))] max-w-[1280px] flex-col justify-center px-5 py-16 md:px-10">
        <p data-hero style={{ '--hero-i': 0 } as CSSProperties} className="font-mono text-[11.5px] font-medium uppercase tracking-[0.16em] text-signal">
          {t('eyebrow')}
        </p>
        <h1
          data-hero
          style={{ '--hero-i': 1 } as CSSProperties}
          className="mt-6 max-w-[11ch] font-display text-[clamp(44px,7.2vw,112px)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em]"
        >
          {t('title')}
        </h1>
        <p data-hero style={{ '--hero-i': 2 } as CSSProperties} className="mt-8 max-w-[56ch] text-[17px] leading-[1.65] text-muted">
          {t('lede')}
        </p>
        <div data-hero style={{ '--hero-i': 3 } as CSSProperties} className="mt-10 flex flex-wrap items-center gap-3.5">
          <ButtonLink href="/brief" variant="primary" arrow>{t('ctaProject')}</ButtonLink>
          <ButtonLink href="/realisations" variant="ghost">{t('ctaWork')}</ButtonLink>
          {/* A static file in the page language: a plain <a>, not the localized Link. */}
          <a
            href={CV_PDF[locale]}
            download
            type="application/pdf"
            data-cv-link
            className="ml-1.5 border-b border-edge pb-0.5 font-mono text-[12px] uppercase tracking-[0.12em] text-ivory no-underline transition-colors hover:border-signal hover:text-signal"
          >
            {t('ctaCv')}
          </a>
        </div>
        <p data-hero style={{ '--hero-i': 4 } as CSSProperties} className="mt-[9vh] flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
          <span aria-hidden="true" className="block h-px w-10 bg-signal" />
          {t('scroll')}
        </p>
      </div>
    </section>
  );
}
