import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Conversion } from '@/components/home/Conversion';
import { JsonLd } from '@/components/seo/JsonLd';
import type { Locale } from '@/i18n/routing';
import { getNeighbours, getProject, type ProjectKind } from '@/lib/content/load';
import { caseJsonLd } from '@/lib/seo/case-study';
import { CaseBody } from './CaseBody';
import { CaseHeader } from './CaseHeader';
import { CaseNav } from './CaseNav';

type Props = { kind: ProjectKind; locale: Locale; slug: string };

/** A full case study page, shared by /realisations/[slug] and /explorations/[slug]. */
export async function CasePage({ kind, locale, slug }: Props) {
  const project = await getProject(kind, locale, slug);
  if (!project) notFound();
  const [{ prev, next }, t, tx] = await Promise.all([
    getNeighbours(kind, locale, slug),
    getTranslations({ locale, namespace: 'caseStudy' }),
    getTranslations({ locale, namespace: 'explorations' }),
  ]);
  // Same title as the page metadata.
  const metaTitle = kind === 'exploration' ? tx('caseMetaTitle', { title: project.title }) : t('metaTitle', { title: project.title });
  const cover = project.images[0];
  return (
    <>
      <JsonLd data={caseJsonLd(project, metaTitle)} />
      <article data-case={project.slug}>
        <CaseHeader project={project} />
        {cover && (
          <figure className="mx-auto mt-[8vh] max-w-[1280px] px-5 md:px-10">
            <div className="overflow-hidden border border-line bg-obsidian-2">
              <Image
                src={cover.src}
                alt={cover.alt}
                width={cover.width}
                height={cover.height}
                sizes="(min-width: 1280px) 1200px, 94vw"
                loading="eager"
                fetchPriority="high"
                className="block h-auto w-full"
              />
            </div>
          </figure>
        )}
        <div className="mt-[10vh] lg:mt-[14vh]">
          <CaseBody project={project} />
        </div>
      </article>
      <CaseNav kind={kind} prev={prev} next={next} />
      <Conversion kicker={t('conversionKicker')} />
    </>
  );
}
