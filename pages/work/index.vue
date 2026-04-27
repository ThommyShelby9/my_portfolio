<script setup lang="ts">
const { t } = useI18n()
const studies = await useAllWork()

useSeoMeta({
  title: () => `${t('work_index.title')} — ${t('site.name')}`,
  description: () => t('work_index.sub'),
})

const sectors = computed(() => {
  const set = new Set<string>()
  ;(studies.value ?? []).forEach((s: any) => set.add(s.sector))
  return ['all', ...Array.from(set).sort()]
})

const activeSector = ref<string>('all')

const filtered = computed(() => {
  if (activeSector.value === 'all') return studies.value ?? []
  return (studies.value ?? []).filter((s: any) => s.sector === activeSector.value)
})
</script>

<template>
  <div class="work-index">
    <header class="work-index__header">
      <p class="work-index__kicker">/ {{ t('work_index.title') }}</p>
      <h1 class="work-index__title">{{ t('work_index.title') }}</h1>
      <p class="work-index__sub">{{ t('work_index.sub') }}</p>
    </header>

    <div class="work-index__filter">
      <span class="work-index__filter-label">{{ t('work_index.filter_label') }} :</span>
      <button
        v-for="sector in sectors"
        :key="sector"
        type="button"
        :class="['work-index__chip', { 'work-index__chip--active': activeSector === sector }]"
        @click="activeSector = sector"
      >
        {{ sector === 'all' ? t('work_index.filter_all') : sector }}
      </button>
    </div>

    <div class="work-index__list">
      <CaseStudyCard
        v-for="study in filtered"
        :key="study.slug"
        :study="(study as any)"
        variant="large"
      />
    </div>
  </div>
</template>

<style scoped>
.work-index {
  padding: 6rem 1.5rem;
  max-width: theme('maxWidth.container');
  margin: 0 auto;
}

.work-index__kicker {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
}

.work-index__title {
  font-family: theme('fontFamily.display');
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  font-weight: 400;
  margin: 1rem 0 0;
}

.work-index__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-mute);
  max-width: 36rem;
  margin: 1rem 0 0;
}

.work-index__filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 4rem 0 0;
  flex-wrap: wrap;
}

.work-index__filter-label {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-right: 0.5rem;
}

.work-index__chip {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  background: transparent;
  color: var(--text-mute);
  border: 1px solid var(--border);
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  transition: color 150ms, border-color 150ms;
}

.work-index__chip:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.work-index__chip--active {
  color: var(--bg);
  background: var(--text);
  border-color: var(--text);
}

.work-index__list {
  margin-top: 3rem;
}
</style>
