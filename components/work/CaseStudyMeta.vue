<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{
  client: string
  sector: string
  role: string
  team: string
  duration: string
  stack: string[]
}>()

const rows = computed(() => [
  { label: t('case_study.labels.client'), value: props.client },
  { label: t('case_study.labels.sector'), value: props.sector },
  { label: t('case_study.labels.role'), value: props.role },
  { label: t('case_study.labels.team'), value: props.team },
  { label: t('case_study.labels.duration'), value: props.duration },
  { label: t('case_study.labels.stack'), value: props.stack.join(' · ') },
])
</script>

<template>
  <dl class="cs-meta">
    <div v-for="row in rows" :key="row.label" class="cs-meta__row">
      <dt class="cs-meta__label">{{ row.label }}</dt>
      <dd class="cs-meta__value">{{ row.value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.cs-meta {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 2rem 0;
  margin: 3rem 0;
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
}

.cs-meta__row {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.cs-meta__label {
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.6875rem;
}

.cs-meta__value {
  color: var(--text-mute);
  margin: 0;
}

@media (max-width: 600px) {
  .cs-meta__row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
