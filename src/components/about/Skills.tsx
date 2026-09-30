import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/motion/Reveal';
import type { Locale } from '@/i18n/routing';
import { SKILL_GROUPS, term } from '@/lib/profile/cv-data';
import { SectionHead } from './SectionHead';

/** Ce que je maîtrise: the skill groups of cv-data, one column each on wide screens. */
export async function Skills({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'about.skills' });
  return (
    <section aria-labelledby="competences" className="mx-auto max-w-[1280px] px-5 pt-[16vh] md:px-10">
      <Reveal>
        <SectionHead id="competences" kicker={t('kicker')} title={t('title')} />
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-8 lg:grid-cols-5">
          {SKILL_GROUPS.map((group, i) => (
            <div key={group.id} data-reveal className="border-t border-line pt-6">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-serif text-[25px] font-medium leading-[1.15]">{group.label[locale]}</h3>
              <ul className="mt-5 space-y-2.5 text-[15px] leading-[1.45] text-muted">
                {group.items.map((item) => {
                  const name = term(item, locale);
                  return <li key={name}>{name}</li>;
                })}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
