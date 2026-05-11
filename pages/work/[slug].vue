<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
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

// Composables resolved at setup; passed to closures below.
const config = useRuntimeConfig()
const buildLocalePath = useLocalePath()
const siteUrl = computed(() => (config.public.siteUrl as string).replace(/\/$/, ''))

useSeoMeta({
  title: () => `${(study.value as any)?.seoTitle ?? (study.value as any)?.title} — ${t('site.name')}`,
  description: () => (study.value as any)?.seoDescription ?? (study.value as any)?.excerpt,
  ogTitle: () => (study.value as any)?.title,
  ogDescription: () => (study.value as any)?.excerpt,
  ogType: 'article',
  ogImage: () => {
    const cover = (study.value as any)?.cover
    return cover ? `${siteUrl.value}${cover}` : undefined
  },
  articleSection: () => (study.value as any)?.sector,
  articleTag: () => (study.value as any)?.stack ?? [],
  articlePublishedTime: () => {
    const y = (study.value as any)?.year
    return y ? `${y}-01-01T00:00:00Z` : undefined
  },
})

// Structured data — CreativeWork helps Google show case studies as rich
// results, with the publisher, image, and tags surfaced in SERPs.
const studySchema = computed(() => {
  const s = study.value as any
  if (!s) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': s.title,
    'headline': s.title,
    'description': s.excerpt,
    'inLanguage': locale.value === 'en' ? 'en-US' : 'fr-FR',
    'datePublished': s.year ? `${s.year}-01-01` : undefined,
    'url': `${siteUrl.value}${buildLocalePath(`/work/${s.slug}`)}`,
    'image': s.cover ? `${siteUrl.value}${s.cover}` : undefined,
    'about': s.sector,
    'keywords': (s.stack ?? []).join(', '),
    'author': {
      '@type': 'Person',
      'name': 'Rostel Panoumassi',
      'url': siteUrl.value,
    },
    'publisher': {
      '@type': 'Person',
      'name': 'Rostel Panoumassi',
    },
  }
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => studySchema.value ? JSON.stringify(studySchema.value) : '',
    },
  ],
})
</script>

<template>
  <article v-if="study" class="cs-page">
    <div class="cs-page__inner container-narrow">
      <NuxtLink :to="localePath('/work')" class="cs-page__back">
        <span class="cs-page__back-arrow">←</span>
        <span>{{ t('case_study.back_to_work') }}</span>
      </NuxtLink>

      <CaseStudyHero
        :kicker="(study as any).kicker"
        :title="(study as any).title"
        :excerpt="(study as any).excerpt"
        :cover="(study as any).cover"
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
  padding: 4rem 0 4rem;
}

.cs-page__inner {
  max-width: 880px;
  margin: 0 auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.cs-page__back {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-mute);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 200ms, gap 250ms;
  margin-bottom: 3rem;
}
.cs-page__back:hover {
  color: var(--accent);
  gap: 0.75rem;
}
.cs-page__back-arrow {
  transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
}
.cs-page__back:hover .cs-page__back-arrow {
  transform: translateX(-4px);
}

.cs-page__body :deep(h2) {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(1.5rem, 3vw, 2.125rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin: 3.5rem 0 1.25rem;
  color: var(--text);
}

.cs-page__body :deep(h3) {
  font-family: theme('fontFamily.display');
  font-weight: 500;
  font-size: 1.25rem;
  letter-spacing: -0.015em;
  margin: 2.5rem 0 1rem;
  color: var(--text);
}

.cs-page__body :deep(p) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-mute);
  margin: 0 0 1.25rem;
  max-width: 64ch;
}

.cs-page__body :deep(ul),
.cs-page__body :deep(ol) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-mute);
  margin: 0 0 1.25rem;
  padding-left: 0;
  list-style: none;
}
.cs-page__body :deep(ul li) {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}
.cs-page__body :deep(ul li)::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--accent);
}
.cs-page__body :deep(ol) {
  counter-reset: items;
  padding-left: 0;
}
.cs-page__body :deep(ol li) {
  counter-increment: items;
  position: relative;
  padding-left: 2rem;
  margin-bottom: 0.5rem;
}
.cs-page__body :deep(ol li)::before {
  content: counter(items, decimal-leading-zero);
  position: absolute;
  left: 0;
  font-family: theme('fontFamily.mono');
  color: var(--accent);
  font-size: 0.875rem;
}

.cs-page__body :deep(blockquote) {
  border-left: 2px solid var(--accent);
  padding: 0.5rem 0 0.5rem 1.5rem;
  margin: 2rem 0;
  color: var(--text);
  font-family: theme('fontFamily.editorial');
  font-style: italic;
  font-size: 1.25rem;
  line-height: 1.5;
  max-width: 56ch;
}
.cs-page__body :deep(blockquote em) {
  font-style: normal;
  color: var(--text-soft);
}

.cs-page__body :deep(code) {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  background: var(--bg-overlay);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  color: var(--accent);
}

.cs-page__body :deep(pre) {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  background: var(--bg-overlay);
  padding: 1.5rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1.75rem 0;
  border: 1px solid var(--border);
  line-height: 1.5;
}

.cs-page__body :deep(pre code) {
  background: transparent;
  padding: 0;
  color: var(--text);
}

.cs-page__body :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.cs-page__body :deep(em) {
  font-family: theme('fontFamily.editorial');
  font-style: italic;
  color: var(--text);
}
</style>
