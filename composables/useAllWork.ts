/**
 * Composable: query all case studies for the active locale, sorted by order asc.
 * Use this on /work index.
 */
export async function useAllWork() {
  const { locale } = useI18n()
  const { data } = await useAsyncData(
    `all-work-${locale.value}`,
    () => queryCollection('work')
      .where('path', 'LIKE', `/${locale.value}/work/%`)
      .order('order', 'ASC')
      .all(),
    { watch: [locale] }
  )
  return data
}
