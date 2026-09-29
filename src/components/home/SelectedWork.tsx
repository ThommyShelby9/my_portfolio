import Image, { type StaticImageData } from 'next/image';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/site/ButtonLink';
import { Link } from '@/i18n/navigation';
import contractiq from '@/assets/work/contractiq.png';
import ubbfy from '@/assets/work/ubbfy.png';
import zenlife from '@/assets/work/zenlife.png';

type Case = { slug: 'ubbfy' | 'contractiq' | 'zenlife'; name: string; image: StaticImageData; stack: string; coBuilt?: string };

const CASES: Case[] = [
  { slug: 'ubbfy', name: 'Ubbfy', image: ubbfy, stack: 'Django 5 · DRF · PostgreSQL · Redis · Vue 3 · Flutter' },
  { slug: 'contractiq', name: 'ContractIQ', image: contractiq, stack: 'Next.js · MongoDB · Gemini · OpenAI · FedaPay', coBuilt: 'Jérémie Zitti' },
  { slug: 'zenlife', name: 'ZenLife', image: zenlife, stack: 'Spring Boot · PostgreSQL · Redis · WebSocket · Vue 3 · Capacitor' },
];

export function SelectedWork() {
  const t = useTranslations('work');
  return (
    <section id="realisations-accueil" data-sculpture-fade-out className="mx-auto max-w-[1280px] px-5 pb-[10vh] pt-[6vh] md:px-10">
      <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p data-reveal className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">{t('kicker')}</p>
          <h2 data-reveal className="mt-3.5 max-w-[20ch] font-serif text-[clamp(34px,4vw,56px)] font-medium leading-[1.05]">{t('title')}</h2>
        </div>
        <div data-reveal>
          <Link href="/realisations" className="border-b border-graphite pb-1 text-sm no-underline hover:border-champagne hover:text-champagne">{t('all')}</Link>
        </div>
      </Reveal>
      <ol>
        {CASES.map((c, i) => {
          const flipped = i % 2 === 1;
          return (
            <li key={c.slug}>
              <Reveal
                as="article"
                className={`group grid items-center gap-7 border-b border-line py-[9vh] lg:gap-14 ${flipped ? 'lg:[grid-template-columns:5fr_7fr]' : 'lg:[grid-template-columns:7fr_5fr]'}`}
              >
                <div data-reveal className={`relative aspect-[16/10] overflow-hidden border border-line bg-obsidian-2 ${flipped ? 'lg:order-2' : ''}`}>
                  <Image
                    src={c.image}
                    alt={t(`${c.slug}.alt`)}
                    fill
                    sizes={flipped ? '(min-width: 1024px) 42vw, 100vw' : '(min-width: 1024px) 58vw, 100vw'}
                    className="object-cover object-top transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.035] motion-reduce:transition-none"
                  />
                </div>
                <div data-reveal>
                  <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mb-1.5 mt-3 font-serif text-[44px] font-medium leading-none">{c.name}</h3>
                  <p className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-champagne">{t(`${c.slug}.what`)}</p>
                  <p className="mt-5 text-[13px] text-faint"><strong className="font-medium text-ivory">{t(`${c.slug}.role`)}</strong> · {t(`${c.slug}.roleDetail`)}</p>
                  <p className="mb-4 mt-3.5 max-w-[46ch] text-base leading-[1.7] text-muted">{t(`${c.slug}.challenge`)}</p>
                  {c.coBuilt && <p className="mb-5 text-[13px] text-muted">{t('coBuilt')} <strong className="font-medium text-ivory">{c.coBuilt}</strong></p>}
                  <p className="mb-6 font-mono text-xs text-faint">{c.stack}</p>
                  <ButtonLink href={{ pathname: '/realisations/[slug]', params: { slug: c.slug } }} variant="ghost" arrow aria-label={t('ctaFor', { name: c.name })}>{t('cta')}</ButtonLink>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
