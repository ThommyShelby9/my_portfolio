type WorkLike = {
  slug: string
  featured: boolean
  order: number
  [k: string]: unknown
}

export function sortByOrder<T extends { order: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}

export function selectFeatured<T extends WorkLike>(items: readonly T[], limit = 3): T[] {
  return sortByOrder(items.filter(i => i.featured)).slice(0, limit)
}

export async function useFeaturedWork(limit = 3) {
  const { locale } = useI18n()
  const { data } = await useAsyncData(
    `featured-work-${locale.value}`,
    () => queryCollection('work')
      .where('featured', '=', true)
      .where('path', 'LIKE', `/${locale.value}/work/%`)
      .order('order', 'ASC')
      .limit(limit)
      .all(),
    { watch: [locale] },
  )
  return data
}
