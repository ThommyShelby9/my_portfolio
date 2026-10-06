import type { StaticImageData } from 'next/image';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import { WorkCase } from '@/components/work/WorkCase';
import { Link } from '@/i18n/navigation';
import contractiq from '@/assets/work/contractiq.png';
import ubbfy from '@/assets/work/ubbfy.png';
import zenlife from '@/assets/work/zenlife.png';

type Case = { slug: 'ubbfy' | 'contractiq' | 'zenlife'; name: string; image: StaticImageData; stack: string[]; coauthors: string[] };

const CASES: Case[] = [
  { slug: 'ubbfy', name: 'Ubbfy', image: ubbfy, stack: ['Django 5', 'DRF', 'PostgreSQL', 'Redis', 'Vue 3', 'Flutter'], coauthors: [] },
  { slug: 'contractiq', name: 'ContractIQ', image: contractiq, stack: ['Next.js', 'MongoDB', 'Gemini', 'OpenAI', 'FedaPay'], coauthors: ['Jérémie Zitti'] },
  { slug: 'zenlife', name: 'ZenLife', image: zenlife, stack: ['Spring Boot', 'PostgreSQL', 'Redis', 'WebSocket', 'Vue 3', 'Capacitor'], coauthors: [] },
];

export function SelectedWork() {
  const t = useTranslations('work');
  return (
    <section id="realisations-accueil" className="mx-auto max-w-[1280px] px-5 pb-[10vh] pt-[6vh] md:px-10">
      <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-signal">{t('kicker')}</p>
          <h2 data-reveal className="mt-3.5 max-w-[20ch] font-display text-[clamp(34px,4vw,56px)] font-medium leading-[1.05]">{t('title')}</h2>
        </div>
        <div data-reveal>
          <Link href="/realisations" className="border-b border-edge pb-1 text-sm no-underline hover:border-signal hover:text-signal">{t('all')}</Link>
        </div>
      </Reveal>
      <ol>
        {CASES.map((c, i) => (
          <li key={c.slug}>
            <WorkCase
              index={i}
              item={{
                slug: c.slug,
                name: c.name,
                what: t(`${c.slug}.what`),
                role: t(`${c.slug}.role`),
                roleDetail: t(`${c.slug}.roleDetail`),
                challenge: t(`${c.slug}.challenge`),
                coauthors: c.coauthors,
                stack: c.stack,
                image: { src: c.image, alt: t(`${c.slug}.alt`) },
              }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
