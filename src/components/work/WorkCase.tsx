import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/site/ButtonLink';
import { ProjectSignature } from '@/components/dna/ProjectSignature';
import type { Gene } from '@/lib/dna/genes';
import { WorkVisual, type VisualImage } from './WorkVisual';

export type WorkCaseItem = {
  slug: string;
  name: string;
  /** What the product is, in a few words (mono, signal). */
  what: string;
  role: string;
  roleDetail?: string;
  /** The problem solved, in one sentence. */
  challenge: string;
  coauthors: readonly string[];
  stack: readonly string[];
  image?: VisualImage;
  /** The project's DNA, drawn as its signature next to the index. */
  genes?: readonly Gene[];
};

type Props = { item: WorkCaseItem; index: number; headingLevel?: 2 | 3 };

/** Large editorial row for a featured case study (home "Réalisations" and the top of /realisations). */
export function WorkCase({ item, index, headingLevel = 3 }: Props) {
  const t = useTranslations('work');
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const flipped = index % 2 === 1;
  return (
    <Reveal
      as="article"
      className={`group grid items-center gap-7 border-b border-line py-[9vh] lg:gap-14 ${flipped ? 'lg:[grid-template-columns:5fr_7fr]' : 'lg:[grid-template-columns:7fr_5fr]'}`}
    >
      <div data-reveal className={flipped ? 'lg:order-2' : ''}>
        <WorkVisual
          image={item.image}
          name={item.name}
          sector={item.what}
          sizes={flipped ? '(min-width: 1280px) 500px, (min-width: 1024px) 42vw, 100vw' : '(min-width: 1280px) 700px, (min-width: 1024px) 58vw, 100vw'}
        />
      </div>
      <div data-reveal>
        <span className="flex items-center gap-3 font-mono text-xs text-faint">
          {item.genes && <ProjectSignature genes={item.genes} size={40} className="text-ivory" />}
          {String(index + 1).padStart(2, '0')}
        </span>
        <Heading className="mb-1.5 mt-3 font-display text-[44px] font-extrabold uppercase tracking-[-0.02em] leading-none">{item.name}</Heading>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-signal">{item.what}</p>
        <p className="mt-5 text-[13px] text-faint">
          <strong className="font-medium text-ivory">{item.role}</strong>
          {item.roleDetail && <> · {item.roleDetail}</>}
        </p>
        <p className="mb-4 mt-3.5 max-w-[46ch] text-base leading-[1.7] text-muted">{item.challenge}</p>
        {item.coauthors.length > 0 && (
          <p className="mb-5 text-[13px] text-muted">
            {t('coBuilt')} <strong className="font-medium text-ivory">{item.coauthors.join(', ')}</strong>
          </p>
        )}
        <p className="mb-6 font-mono text-xs text-faint">{item.stack.join(' · ')}</p>
        <ButtonLink
          href={{ pathname: '/realisations/[slug]', params: { slug: item.slug } }}
          variant="ghost"
          arrow
          aria-label={t('ctaFor', { name: item.name })}
        >
          {t('cta')}
        </ButtonLink>
      </div>
    </Reveal>
  );
}
