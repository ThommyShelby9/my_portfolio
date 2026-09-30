import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion/Reveal';
import type { Locale } from '@/i18n/routing';
import { EDUCATION, formatPeriod } from '@/lib/profile/cv-data';
import { SectionHead } from './SectionHead';

/** Formation: degree and certifications, most recent first. */
export async function Education({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'about.education' });
  return (
    <section aria-labelledby="formation" className="mx-auto max-w-[1280px] px-5 pb-[12vh] pt-[16vh] md:px-10">
      <Reveal>
        <SectionHead id="formation" kicker={t('kicker')} title={t('title')} />
        <ol className="mt-14 grid border-b border-line md:grid-cols-2 md:gap-x-14">
          {EDUCATION.map((e) => (
            <li key={e.id} data-reveal className="grid content-start gap-y-3 border-t border-line py-8">
              <p className="font-mono text-xs text-faint">{formatPeriod(e.period, locale)}</p>
              <h3 className="max-w-[30ch] font-serif text-[clamp(24px,2.2vw,29px)] font-medium leading-[1.15]">{e.field[locale]}</h3>
              <p className="text-[14.5px] leading-[1.5] text-muted">
                <span className="text-ivory">{e.credential[locale]}</span> · {e.institution}
              </p>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
