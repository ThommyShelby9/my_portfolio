<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => `${t('brief.title')} — ${t('site.name')}`,
  description: () => t('brief.sub'),
})
</script>

<template>
  <article class="brief">
    <header class="brief__header">
      <BriefStepIndicator :current="1" :total="4" />
      <h1 class="brief__title">{{ t('brief.title') }}</h1>
      <p class="brief__sub">{{ t('brief.sub') }}</p>
    </header>

    <div class="brief__placeholder">
      <p class="brief__placeholder-line">
        Plan 3 — formulaire complet (4 étapes, MongoDB, SMTP, Turnstile, Telegram).
        Cette page deviendra l'étape 1 du brief.
      </p>
    </div>
  </article>
</template>

<style scoped>
.brief {
  padding: 6rem 1.5rem;
  max-width: theme('maxWidth.reading');
  margin: 0 auto;
}

.brief__header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.brief__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  font-weight: 400;
  margin: 0;
}

.brief__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--text-mute);
  margin: 0;
}

.brief__placeholder {
  border: 1px dashed var(--border-strong);
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 4px;
}

.brief__placeholder-line {
  font-family: theme('fontFamily.mono');
  font-size: 0.875rem;
  color: var(--text-soft);
  margin: 0;
}
</style>
