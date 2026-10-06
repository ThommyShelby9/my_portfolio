import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion/Reveal';
import type { Locale } from '@/i18n/routing';
import { SectionHead } from './SectionHead';

// The home method (discover, design, build, evolve) seen from inside a team.
const STEPS = ['frame', 'decide', 'deliver', 'coach'] as const;

export async function HowIWork({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'about.method' });
  return (
    <section aria-labelledby="methode" className="mx-auto max-w-[1280px] px-5 pt-[16vh] md:px-10">
      <Reveal>
        <SectionHead id="methode" kicker={t('kicker')} title={t('title')} />
        <ol className="mt-14 grid gap-y-4 border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((key, i) => (
            <li key={key} data-reveal className="relative pb-5 pr-6 pt-7 before:absolute before:-top-1 before:left-0 before:size-[7px] before:bg-signal">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mb-2.5 mt-3.5 font-display text-[26px] font-medium">{t(key)}</h3>
              <p className="max-w-[32ch] text-[14.5px] leading-[1.65] text-muted">{t(`${key}Text`)}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
