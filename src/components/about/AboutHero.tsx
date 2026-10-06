import type { CSSProperties } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { LINKS, PORTRAIT } from '@/lib/profile/cv-data';

const hero = (i: number) => ({ '--hero-i': i }) as CSSProperties;
const link = 'border-b border-edge pb-0.5 text-ivory no-underline transition-colors hover:border-signal hover:text-signal';

/** Opening of the About page: title, lede, two facts and the real portrait. Above the fold: CSS-only entrance. */
export async function AboutHero({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'about' });
  // One role per line on wide screens ("Ingénieur produit, / tech lead, / formateur."); the text stays one sentence.
  const roles = t('title').split(', ');
  return (
    <header className="mx-auto grid max-w-[1280px] gap-x-20 gap-y-14 px-5 pt-[9vh] md:px-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:pt-[12vh]">
      <div>
        <p data-hero style={hero(0)} className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">{t('kicker')}</p>
        <h1 data-hero style={hero(1)} className="mt-5 font-display text-[clamp(44px,6vw,84px)] font-medium leading-[1.02] tracking-[-0.015em]">
          {roles.map((role, i) => (
            <span key={role}>
              {i > 0 && ' '}
              <span className="lg:block">{i < roles.length - 1 ? `${role},` : role}</span>
            </span>
          ))}
        </h1>
        <p data-hero style={hero(2)} className="mt-8 max-w-[52ch] text-[17px] leading-[1.7] text-muted">{t('lede')}</p>
        <div data-hero style={hero(3)}>
          <h2 className="sr-only">{t('facts.label')}</h2>
          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-7">
            <div>
              <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{t('facts.based')}</dt>
              <dd className="mt-2.5 text-[15px] text-ivory">{t('facts.basedValue')}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{t('facts.elsewhere')}</dt>
              <dd className="mt-2.5 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
                <a href={LINKS.linkedin} rel="me noopener" className={link}>LinkedIn</a>
                <a href={LINKS.github} rel="me noopener" className={link}>GitHub</a>
                <Link href="/cv" className={link}>{t('facts.cv')}</Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <figure data-hero style={hero(2)} className="m-0 w-full max-w-[400px] lg:max-w-[440px] lg:justify-self-end">
        <div className="border border-line bg-graphite-2 p-2.5">
          {/* Two 4:5 exports of the 654 px source, shown at their own ratio. `sizes` is the rendered width (frame minus its 10 px mat and 1 px border), so each candidate is only ever scaled down at 1x. */}
          <img
            data-portrait
            src={PORTRAIT.src}
            srcSet={PORTRAIT.sources.map((s) => `${s.src} ${s.width}w`).join(', ')}
            sizes="(min-width: 1024px) 418px, (min-width: 440px) 378px, calc(100vw - 62px)"
            width={PORTRAIT.width}
            height={PORTRAIT.height}
            alt={PORTRAIT.alt[locale]}
            fetchPriority="high"
            decoding="async"
            className="block h-auto w-full [filter:grayscale(0.1)]"
          />
        </div>
      </figure>
    </header>
  );
}
