import type { CSSProperties } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import type { LegalDoc } from '@/lib/content/legal';

type Props = { locale: Locale; title: string; doc: LegalDoc };

const hero = (i: number) => ({ '--hero-i': i }) as CSSProperties;

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Privacy policy and terms: hero, a numbered table of contents from the h2 headings, then the prose. */
export async function LegalPage({ locale, title, doc }: Props) {
  const t = await getTranslations({ locale, namespace: 'legal' });
  // The paragraph before the first h2 introduces the page and sits in the hero.
  const at = doc.html.indexOf('<h2 ');
  const intro = at > 0 ? doc.html.slice(0, at).trim() : '';
  const body = at > 0 ? doc.html.slice(at) : doc.html;

  return (
    <>
      <header className="mx-auto max-w-[1280px] px-5 pt-[9vh] md:px-10 lg:pt-[14vh]">
        <p data-hero style={hero(0)} className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">
          {t('kicker')}
        </p>
        <h1 data-hero style={hero(1)} className="mt-5 max-w-[17ch] font-serif text-[clamp(40px,5.4vw,80px)] font-medium leading-[1.04] tracking-[-0.015em]">
          {title}
        </h1>
        <div data-hero style={hero(2)} className="mt-9 flex flex-col gap-6 border-b border-line pb-10 md:flex-row md:items-end md:justify-between md:gap-16">
          {intro && <div className="max-w-[58ch] text-[16.5px] leading-[1.7] text-muted" dangerouslySetInnerHTML={{ __html: intro }} />}
          <p className="shrink-0 font-mono text-xs text-faint">
            {t.rich('updated', {
              date: formatDate(doc.updated, locale),
              time: (chunks) => <time dateTime={doc.updated}>{chunks}</time>,
            })}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-x-14 gap-y-12 px-5 pb-[14vh] pt-[8vh] md:px-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <nav aria-label={t('toc')} className="lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start">
          <p aria-hidden="true" className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{t('toc')}</p>
          <ol className="mt-5 border-t border-line">
            {doc.headings.map((h, i) => (
              <li key={h.id} className="border-b border-line">
                <a href={`#${h.id}`} className="flex gap-4 py-3 text-[14.5px] leading-[1.45] text-muted no-underline transition-colors hover:text-ivory">
                  <span aria-hidden="true" className="w-5 shrink-0 pt-[3px] font-mono text-[11px] text-champagne">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="case-prose legal-prose min-w-0" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
    </>
  );
}
