<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: study } = await useAsyncData(
  () => `work-${locale.value}-${slug.value}`,
  () => queryCollection('work')
    .where('path', '=', `/${locale.value}/work/${slug.value}`)
    .first(),
  { watch: [locale, slug] },
)

if (!study.value) {
  throw createError({ statusCode: 404, statusMessage: 'Case study not found', fatal: true })
}

const { data: nextStudy } = await useAsyncData(
  () => `work-next-${locale.value}-${slug.value}`,
  async () => {
    const all = await queryCollection('work')
      .where('path', 'LIKE', `/${locale.value}/work/%`)
      .order('order', 'ASC')
      .all()
    const idx = all.findIndex((s: any) => s.slug === slug.value)
    return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null
  },
  { watch: [locale, slug] },
)

useSeoMeta({
  title: () => `${(study.value as any)?.seoTitle ?? (study.value as any)?.title} — ${t('site.name')}`,
  description: () => (study.value as any)?.seoDescription ?? (study.value as any)?.excerpt,
  ogTitle: () => (study.value as any)?.title,
  ogDescription: () => (study.value as any)?.excerpt,
  ogType: 'article',
})
</script>

<template>
  <article v-if="study" class="cs-page">
    <div class="cs-page__inner">
      <NuxtLink :to="useLocalePath()('/work')" class="cs-page__back">
        {{ t('case_study.back_to_work') }}
      </NuxtLink>

      <CaseStudyHero
        :kicker="(study as any).kicker"
        :title="(study as any).title"
        :excerpt="(study as any).excerpt"
      />

      <CaseStudyMeta
        :client="(study as any).client"
        :sector="(study as any).sector"
        :role="(study as any).role"
        :team="(study as any).team"
        :duration="(study as any).duration"
        :stack="(study as any).stack"
      />

      <CaseStudyResults :results="(study as any).results" />

      <div class="cs-page__body">
        <ContentRenderer :value="study as any" />
      </div>

      <CaseStudyHandoff :next-slug="(nextStudy as any)?.slug" />
    </div>
  </article>
</template>

<style scoped>
.cs-page {
  padding: 4rem 1.5rem 6rem;
}

.cs-page__inner {
  max-width: theme('maxWidth.reading');
  margin: 0 auto;
}

.cs-page__back {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-mute);
  text-decoration: none;
  letter-spacing: 0.06em;
}

.cs-page__back:hover {
  color: var(--text);
}

.cs-page__body :deep(h2) {
  font-family: theme('fontFamily.display');
  font-size: 1.875rem;
  line-height: 1.2;
  font-weight: 400;
  margin: 3rem 0 1rem;
  color: var(--text);
}

.cs-page__body :deep(h3) {
  font-family: theme('fontFamily.display');
  font-size: 1.375rem;
  line-height: 1.3;
  font-weight: 400;
  margin: 2.5rem 0 1rem;
  color: var(--text);
}

.cs-page__body :deep(p) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-mute);
  margin: 0 0 1.25rem;
}

.cs-page__body :deep(ul),
.cs-page__body :deep(ol) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-mute);
  margin: 0 0 1.25rem;
  padding-left: 1.5rem;
}

.cs-page__body :deep(blockquote) {
  border-left: 2px solid var(--border-strong);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--text-soft);
  font-style: italic;
}

.cs-page__body :deep(code) {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  background: var(--bg-raised);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
}

.cs-page__body :deep(pre) {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  background: var(--bg-raised);
  padding: 1.25rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid var(--border);
}

.cs-page__body :deep(pre code) {
  background: transparent;
  padding: 0;
}

.cs-page__body :deep(strong) {
  color: var(--text);
}
</style>
