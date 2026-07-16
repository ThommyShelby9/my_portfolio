/**
 * Composable: query all case studies for the active locale, sorted by order asc.
 * Use this on /work index.
 */
export async function useAllWork() {
  const { locale } = useI18n()
  const { data } = await useAsyncData(
    `all-work-${locale.value}`,
    async () => {
      const items = await queryCollection('work')
        .where('path', 'LIKE', `/${locale.value}/work/%`)
        .all()
      // The collection sorts `order` lexicographically ("10" before "2"), so
      // the list came out as 1, 10, 11, 12, 2, 3… Sort numerically here.
      return sortByOrder(items as unknown as { order: number }[]) as typeof items
    },
    { watch: [locale] },
  )
  return data
}
