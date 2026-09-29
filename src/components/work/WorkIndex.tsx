import type { CSSProperties } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import type { Project } from '@/lib/content/load';
import { WorkCard } from './WorkCard';

type HeaderProps = { kicker: string; title: string; lede: string; meta: string };

/** Opening of an index page. Above the fold, so it enters with the CSS-only hero animation. */
export function IndexHeader({ kicker, title, lede, meta }: HeaderProps) {
  return (
    <header className="mx-auto max-w-[1280px] px-5 pt-[9vh] md:px-10 lg:pt-[14vh]">
      <p data-hero style={{ '--hero-i': 0 } as CSSProperties} className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-champagne">
        {kicker}
      </p>
      <h1 data-hero style={{ '--hero-i': 1 } as CSSProperties} className="mt-5 max-w-[17ch] font-serif text-[clamp(42px,6vw,88px)] font-medium leading-[1.02] tracking-[-0.015em]">
        {title}
      </h1>
      <div data-hero style={{ '--hero-i': 2 } as CSSProperties} className="mt-9 flex flex-col gap-6 border-b border-line pb-10 md:flex-row md:items-end md:justify-between md:gap-16">
        <p className="max-w-[54ch] text-[16.5px] leading-[1.7] text-muted">{lede}</p>
        <p className="shrink-0 font-mono text-xs text-faint">{meta}</p>
      </div>
    </header>
  );
}

type GridProps = { projects: Project[]; offset?: number; headingLevel?: 2 | 3 };

/** Two-column grid of project cards; `offset` continues the numbering after the featured rows. */
export function WorkGrid({ projects, offset = 0, headingLevel = 3 }: GridProps) {
  return (
    <Reveal as="ul" className="mt-14 grid gap-x-10 gap-y-[11vh] md:grid-cols-2 lg:gap-x-14">
      {projects.map((p, i) => (
        <li key={p.slug} className="flex">
          <WorkCard project={p} index={offset + i} headingLevel={headingLevel} />
        </li>
      ))}
    </Reveal>
  );
}
