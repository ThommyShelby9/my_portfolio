import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion/Reveal';
import type { Locale } from '@/i18n/routing';
import { ROLES, ROLE_KIND_LABEL, formatPeriod } from '@/lib/profile/cv-data';
import { SectionHead } from './SectionHead';

/** Parcours: the documented roles, most recent first. */
export async function Career({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'about.career' });
  return (
    <section aria-labelledby="parcours" className="mx-auto max-w-[1280px] px-5 pt-[16vh] md:px-10">
      <Reveal>
        <SectionHead id="parcours" kicker={t('kicker')} title={t('title')} />
        <ol className="mt-14 border-b border-line">
          {ROLES.map((role) => {
            const current = role.period.end === null;
            // "Stage professionnel · Stage" would repeat itself: show the kind only when the title does not say it.
            const kind = role.kind === 'employment' ? null : ROLE_KIND_LABEL[role.kind][locale];
            const showKind = kind !== null && !role.title[locale].toLowerCase().includes(kind.toLowerCase());
            return (
              <li
                key={role.id}
                data-reveal
                className="grid gap-x-10 gap-y-3 border-t border-line py-8 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,5fr)_minmax(0,6fr)] lg:py-9"
              >
                <div className="md:pt-2">
                  <p className={`font-mono text-xs ${current ? 'text-champagne' : 'text-faint'}`}>{formatPeriod(role.period, locale)}</p>
                  {current && (
                    <p className="mt-2 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ivory">
                      <span aria-hidden="true" className="block size-[7px] bg-champagne" />
                      {t('current')}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-[clamp(26px,2.4vw,32px)] font-medium leading-[1.1] [font-variant-numeric:lining-nums]">{role.organisation}</h3>
                  <p className="mt-2 text-[14.5px] leading-[1.5] text-ivory">
                    {role.title[locale]}
                    {showKind && <span className="text-muted"> · {kind}</span>}
                  </p>
                  {role.location && <p className="mt-1.5 font-mono text-xs text-faint">{role.location[locale]}</p>}
                </div>
                <p className="max-w-[56ch] text-[15.5px] leading-[1.7] text-muted md:col-start-2 lg:col-start-auto lg:pt-1.5">{role.summary[locale]}</p>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </section>
  );
}
