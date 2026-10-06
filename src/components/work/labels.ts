import type { Project } from '@/lib/content/load';

export const STATUS_KEY = {
  live: 'statusLive',
  archived: 'statusArchived',
  private: 'statusPrivate',
  concept: 'statusConcept',
} as const satisfies Record<Project['status'], string>;

/** Note shown on a card without a cover, keyed by project status. */
export const NO_IMAGE_KEY = {
  private: 'noImagesPrivate',
  archived: 'noImagesArchived',
  live: 'noImagesOther',
  concept: 'noImagesOther',
} as const satisfies Record<Project['status'], string>;

export function caseHref(p: Pick<Project, 'kind' | 'slug'>) {
  return p.kind === 'realisation'
    ? ({ pathname: '/realisations/[slug]', params: { slug: p.slug } } as const)
    : ({ pathname: '/explorations/[slug]', params: { slug: p.slug } } as const);
}

export function coverOf(p: Pick<Project, 'images'>) {
  return p.images[0];
}
