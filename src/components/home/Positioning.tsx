import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';

const PILLARS = ['vision', 'architecture', 'execution'] as const;

export function Positioning() {
  const t = useTranslations('positioning');
  return (
    <section id="expertise" className="mx-auto max-w-[1280px] px-5 pb-[12vh] pt-[18vh] md:px-10">
      <Reveal>
        <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">{t('kicker')}</p>
        <h2 data-reveal className="mt-3.5 max-w-[20ch] font-serif text-[clamp(34px,4vw,56px)] font-medium leading-[1.05]">{t('title')}</h2>
        <ol className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
          {PILLARS.map((key, i) => (
            <li key={key} data-reveal className="bg-obsidian px-7 pb-10 pt-8">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mb-2.5 mt-4 font-serif text-[32px] font-medium">{t(key)}</h3>
              <p className="text-[14.5px] leading-[1.65] text-muted">{t(`${key}Text`)}</p>
            </li>
          ))}
        </ol>
        <p data-reveal className="mt-[12vh] font-serif text-[clamp(30px,3.6vw,50px)] font-medium leading-[1.15]">
          {t('signatureA')} <em className="italic text-champagne">{t('signatureB')}</em>
        </p>
      </Reveal>
    </section>
  );
}
