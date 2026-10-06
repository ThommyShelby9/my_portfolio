import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/motion/Reveal';
import type { Project } from '@/lib/content/load';
import { isResultSection, splitProof, splitSections } from '@/lib/content/present';
import { Gallery } from './Gallery';

type ShellProps = { n: number; id: string; heading: ReactNode; wide?: boolean; children: ReactNode };

/** One numbered chapter: display h2 with its signal number on the left, content on the right. */
function Chapter({ n, id, heading, wide = false, children }: ShellProps) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-[9vh] lg:py-[12vh]">
      <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
        <div data-reveal className={wide ? '' : 'lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:self-start'}>
          <span aria-hidden="true" className="flex items-center gap-3 font-mono text-xs text-signal">
            {String(n).padStart(2, '0')}
            <span className="inline-block h-px w-7 bg-signal" />
          </span>
          <h2 id={id} className="mt-5 max-w-[16ch] font-display text-[clamp(32px,3.2vw,46px)] font-medium leading-[1.06]">
            {heading}
          </h2>
        </div>
        {wide ? <div className="min-w-0 lg:col-span-2">{children}</div> : <div data-reveal className="min-w-0">{children}</div>}
      </Reveal>
    </section>
  );
}

function Prose({ html }: { html: string }) {
  return <div className="case-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Sourced proofs as large signal figures; a single proof sits beside its caption. */
function ProofBand({ proofs }: { proofs: Project['proofs'] }) {
  const single = proofs.length === 1;
  return (
    <ul data-proofs className={`mb-12 grid gap-px border border-line bg-line ${single ? '' : 'sm:grid-cols-2'}`}>
      {proofs.map((proof) => {
        const { figure, caption } = splitProof(proof.text);
        const whole = caption === proof.text.trim();
        return (
          <li key={proof.text} className={`bg-graphite px-6 pb-8 pt-7 md:px-8 ${single ? 'sm:flex sm:items-end sm:gap-8' : ''}`}>
            {figure && (
              <p aria-hidden={whole || undefined} className="whitespace-nowrap font-display text-[clamp(56px,6vw,88px)] font-medium leading-none tracking-[-0.02em] text-signal">
                {figure}
              </p>
            )}
            <p className={`mt-4 max-w-[34ch] text-[14.5px] leading-[1.6] text-muted ${single ? 'sm:mb-1.5 sm:mt-0' : ''}`}>{caption}</p>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The Markdown body laid out as numbered chapters. The gallery (every image after the cover)
 * becomes its own chapter just before the closing "Résultat" chapter, and sourced proofs open
 * that chapter as large figures.
 */
export function CaseBody({ project }: { project: Project }) {
  const t = useTranslations('caseStudy');
  const { intro, sections } = splitSections(project.bodyHtml);
  const gallery = project.images.slice(1);
  const resultAt = sections.findIndex((s) => isResultSection(s.id));
  const chapters: ReactNode[] = [];
  let n = 0;
  const galleryChapter = () => (
    <Chapter key="gallery" n={++n} id="galerie" heading={t('gallery')} wide>
      <Gallery images={gallery} />
    </Chapter>
  );
  sections.forEach((s, i) => {
    if (i === resultAt && gallery.length > 0) chapters.push(galleryChapter());
    const result = i === resultAt;
    chapters.push(
      <Chapter key={s.id} n={++n} id={s.id} heading={<span dangerouslySetInnerHTML={{ __html: s.headingHtml }} />}>
        {result && project.proofs.length > 0 && <ProofBand proofs={project.proofs} />}
        <Prose html={s.html} />
      </Chapter>,
    );
  });
  if (resultAt < 0) {
    if (gallery.length > 0) chapters.push(galleryChapter());
    if (project.proofs.length > 0) {
      chapters.push(
        <Chapter key="resultat" n={++n} id="resultat" heading={t('result')}>
          <ProofBand proofs={project.proofs} />
        </Chapter>,
      );
    }
  }
  return (
    <div className="mx-auto max-w-[1280px] px-5 md:px-10">
      {intro && (
        <div className="grid pb-[8vh] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
          <div className="case-prose case-prose-lede lg:col-start-2" dangerouslySetInnerHTML={{ __html: intro }} />
        </div>
      )}
      {chapters}
    </div>
  );
}
