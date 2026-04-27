<script setup lang="ts">
const { t, locale } = useI18n()

const { data: page } = await useAsyncData(
  () => `about-${locale.value}`,
  () => queryCollection('pages')
    .where('path', '=', `/${locale.value}/about`)
    .first(),
  { watch: [locale] },
)

useSeoMeta({
  title: () => `${(page.value as any)?.title ?? t('about.title')} — ${t('site.name')}`,
  description: () => (page.value as any)?.description,
})
</script>

<template>
  <article class="about">
    <div class="about__layout">
      <div v-if="page" class="about__body">
        <ContentRenderer :value="(page as any)" />
      </div>

      <aside class="about__sidebar">
        <NuxtImg
          src="/images/profile.jpg"
          alt="Rostel Panoumassi portrait"
          width="340"
          height="340"
          format="webp"
          loading="lazy"
          class="about__photo"
        />
        <div class="about__links">
          <a href="/cv.pdf" download class="about__link">{{ t('about.cv_download') }}</a>
          <a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" target="_blank" rel="noopener noreferrer" class="about__link">{{ t('about.linkedin') }}</a>
        </div>
      </aside>
    </div>
  </article>
</template>

<style scoped>
.about {
  padding: 5rem 1.5rem 6rem;
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.about__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 4rem;
  align-items: start;
}

@media (max-width: 900px) {
  .about__layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.about__body {
  max-width: theme('maxWidth.reading');
}

.about__body :deep(h2) {
  font-family: theme('fontFamily.display');
  font-size: clamp(2rem, 3vw + 0.5rem, 2.5rem);
  line-height: 1.15;
  font-weight: 400;
  margin: 0 0 1.5rem;
  letter-spacing: -0.02em;
}

.about__body :deep(h3) {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem;
  line-height: 1.3;
  font-weight: 400;
  margin: 2.5rem 0 0.75rem;
}

.about__body :deep(p),
.about__body :deep(li) {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text-mute);
}

.about__body :deep(ul) {
  margin: 1rem 0 1.5rem;
}

.about__body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
}

.about__body :deep(th),
.about__body :deep(td) {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border);
  text-align: left;
  color: var(--text-mute);
}

.about__body :deep(th) {
  color: var(--text-soft);
  font-weight: 500;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.about__body :deep(strong) {
  color: var(--text);
}

.about__sidebar {
  position: sticky;
  top: 6rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about__photo {
  border-radius: 4px;
  object-fit: cover;
  width: 100%;
  height: auto;
  filter: saturate(0.95);
}

.about__links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.about__link {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-mute);
  text-decoration: none;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
  align-self: flex-start;
  letter-spacing: 0.04em;
}

.about__link:hover {
  color: var(--text);
}
</style>
