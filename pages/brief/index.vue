<script setup lang="ts">
const { t, locale } = useI18n()

useSeoMeta({
  title: () => `${t('brief.title')} — ${t('site.name')}`,
  description: () => t('brief.sub'),
})
</script>

<template>
  <article class="brief">
    <header class="brief__header">
      <p class="brief__kicker mono-tag">/ 05 — {{ locale === 'en' ? 'PROJECT BRIEF' : 'BRIEF PROJET' }}</p>
      <h1 class="brief__title">
        <SplitText :text="t('brief.title')" tag="span" :stagger="0.06" />
      </h1>
      <RevealOnView :delay="0.2">
        <p class="brief__sub">{{ t('brief.sub') }}</p>
      </RevealOnView>
    </header>

    <div class="brief__split">
      <div class="brief__form-col">
        <BriefForm />
      </div>
      <div class="brief__maquette-col">
        <ClientOnly>
          <BriefMaquette3D mode="form" />
        </ClientOnly>
      </div>
    </div>
  </article>
</template>

<style scoped>
.brief {
  padding: 6rem 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
}

.brief__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 4rem;
}

.brief__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-mute);
  margin: 0;
}

.brief__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 0.98;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0;
}

.brief__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--text-mute);
  margin: 0;
}

.brief__split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.brief__form-col {
  min-width: 0;
}

.brief__maquette-col {
  display: none;
}

@media (min-width: 768px) {
  .brief__split {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 3rem;
    align-items: start;
  }
  .brief__maquette-col {
    display: block;
    position: sticky;
    top: 6rem;
    height: calc(100vh - 12rem);
    min-height: 480px;
  }
}
</style>
