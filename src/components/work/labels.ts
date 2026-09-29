import type { Project } from '@/lib/content/load';

export const STATUS_KEY = {
  live: 'statusLive',
  archived: 'statusArchived',
  private: 'statusPrivate',
  concept: 'statusConcept',
} as const satisfies Record<Project['status'], string>;

export function caseHref(p: Pick<Project, 'kind' | 'slug'>) {
  return p.kind === 'realisation'
    ? ({ pathname: '/realisations/[slug]', params: { slug: p.slug } } as const)
    : ({ pathname: '/explorations/[slug]', params: { slug: p.slug } } as const);
}

export function coverOf(p: Pick<Project, 'images'>) {
  return p.images[0];
}
