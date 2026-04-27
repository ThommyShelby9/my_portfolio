<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const studies = await useFeaturedWork(3)
</script>

<template>
  <section class="featured" aria-labelledby="featured-heading">
    <div class="featured__inner">
      <FadeUp>
        <p class="featured__kicker">{{ t('featured.kicker') }}</p>
        <h2 id="featured-heading" class="sr-only">{{ t('featured.kicker') }}</h2>
      </FadeUp>

      <div class="featured__list">
        <FadeUp v-for="study in studies ?? []" :key="study.slug" :delay="0.05">
          <CaseStudyCard :study="(study as any)" variant="large" />
        </FadeUp>
      </div>

      <FadeUp class="featured__see-all-wrap">
        <NuxtLink :to="localePath('/work')" class="featured__see-all">
          → {{ t('featured.see_all') }}
        </NuxtLink>
      </FadeUp>
    </div>
  </section>
</template>

<style scoped>
.featured {
  padding: 6rem 1.5rem;
}

.featured__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.featured__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0 0 2rem;
}

.featured__see-all-wrap {
  margin-top: 3rem;
  text-align: right;
}

.featured__see-all {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--text-mute);
  text-decoration: none;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
  transition: color 150ms;
}

.featured__see-all:hover {
  color: var(--text);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
