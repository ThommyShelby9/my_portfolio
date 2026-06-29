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
])
</script>

<template>
  <section class="cs-meta">
    <dl class="cs-meta__list">
      <div v-for="row in rows" :key="row.label" class="cs-meta__row">
        <dt class="cs-meta__label">{{ row.label }}</dt>
        <dd class="cs-meta__value">{{ row.value }}</dd>
      </div>
    </dl>
    <div class="cs-meta__stack">
      <dt class="cs-meta__label">{{ t('case_study.labels.stack') }}</dt>
      <dd class="cs-meta__stack-pills">
        <span v-for="s in stack" :key="s" class="cs-meta__pill">{{ s }}</span>
      </dd>
    </div>
  </section>
</template>

<style scoped>
.cs-meta {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 2.5rem 0;
  margin: 3rem 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

@media (max-width: 720px) {
  .cs-meta {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.cs-meta__list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.cs-meta__row {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 1.25rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  align-items: baseline;
}

.cs-meta__label {
  font-family: theme('fontFamily.body');
  font-style: normal;
  font-weight: 500;
  color: var(--text-mute);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
}

.cs-meta__value {
  color: var(--text);
  margin: 0;
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem;
}

@media (max-width: 600px) {
  .cs-meta__row {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }
}

.cs-meta__stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.cs-meta__stack-pills {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.cs-meta__pill {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  padding: 0.4rem 0.75rem;
  background: var(--bg-overlay);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text);
  transition: border-color 200ms, background 200ms;
}
.cs-meta__pill:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
</style>
