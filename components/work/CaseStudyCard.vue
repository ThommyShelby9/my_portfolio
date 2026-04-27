<script setup lang="ts">
type CaseStudyMeta = {
  slug: string
  title: string
  kicker: string
  excerpt: string
  stack: string[]
  results: Array<{ value: string; label: string }>
}

const props = defineProps<{
  study: CaseStudyMeta
  variant?: 'large' | 'compact'
}>()

const localePath = useLocalePath()
const { t } = useI18n()
const href = computed(() => localePath(`/work/${props.study.slug}`))

const primaryResult = computed(() => props.study.results[0])
</script>

<template>
  <NuxtLink :to="href" :class="['cs-card', `cs-card--${props.variant ?? 'large'}`]">
    <p class="cs-card__kicker">{{ study.kicker }}</p>

    <h3 class="cs-card__title">{{ study.title }}</h3>

    <p class="cs-card__excerpt">{{ study.excerpt }}</p>

    <div class="cs-card__row">
      <p v-if="primaryResult" class="cs-card__result">
        <span class="cs-card__result-value">{{ primaryResult.value }}</span>
        <span class="cs-card__result-label">{{ primaryResult.label }}</span>
      </p>
      <p class="cs-card__stack">
        {{ study.stack.slice(0, 4).join(' · ') }}
      </p>
    </div>

    <span class="cs-card__cta">{{ t('case_study.read') }}</span>
  </NuxtLink>
</template>

<style scoped>
.cs-card {
  display: block;
  padding: 3rem 2rem 2.5rem;
  border-top: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
  transition: background-color 200ms;
}

.cs-card:last-child {
  border-bottom: 1px solid var(--border);
}

.cs-card:hover {
  background: var(--bg-raised);
}

.cs-card__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.cs-card__title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(1.75rem, 3vw + 0.5rem, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.015em;
  max-width: 24ch;
  margin: 1rem 0 0;
  color: var(--text);
}

.cs-card__excerpt {
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-mute);
  max-width: 36rem;
  margin: 1rem 0 0;
}

.cs-card__row {
  display: flex;
  align-items: baseline;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.cs-card__result {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
}

.cs-card__result-value {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem;
  color: var(--accent);
  font-weight: 500;
}

.cs-card__result-label {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: lowercase;
}

.cs-card__stack {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  color: var(--text-mute);
  margin: 0;
}

.cs-card__cta {
  display: inline-block;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--text);
  margin-top: 1.5rem;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
}

.cs-card--compact {
  padding: 2rem 0;
}
.cs-card--compact .cs-card__title {
  font-size: 1.375rem;
}
</style>
