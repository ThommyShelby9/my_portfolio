<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="cta" aria-labelledby="cta-heading">
    <div class="cta__inner">
      <FadeUp>
        <h2 id="cta-heading" class="cta__title">{{ t('cta_block.title') }}</h2>
        <p class="cta__sub">{{ t('cta_block.sub') }}</p>
        <NuxtLink :to="localePath('/brief')" class="cta__cta">
          {{ t('cta_block.cta') }} →
        </NuxtLink>
        <p class="cta__fallback">
          {{ t('cta_block.fallback_email') }}
        </p>
      </FadeUp>
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding: 10rem 1.5rem;
  border-top: 1px solid var(--border);
}

.cta__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
  text-align: center;
}

.cta__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  font-weight: 400;
  margin: 0;
  color: var(--text);
}

.cta__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-mute);
  max-width: 32rem;
  margin: 1.5rem auto 0;
}

.cta__cta {
  display: inline-block;
  margin-top: 2.5rem;
  background: var(--text);
  color: var(--bg);
  padding: 1rem 2rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  transition: opacity 150ms;
}

.cta__cta:hover {
  opacity: 0.9;
}

.cta__fallback {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-soft);
  margin: 1.5rem 0 0;
}
</style>
