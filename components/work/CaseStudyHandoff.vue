<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

defineProps<{
  nextSlug?: string
}>()
</script>

<template>
  <section class="cs-handoff">
    <p class="cs-handoff__line">{{ t('case_study.have_similar') }}</p>
    <div class="cs-handoff__actions">
      <NuxtLink :to="localePath('/brief')" class="cs-handoff__primary">
        → {{ t('case_study.start_brief') }}
      </NuxtLink>
      <NuxtLink
        v-if="nextSlug"
        :to="localePath(`/work/${nextSlug}`)"
        class="cs-handoff__secondary"
      >
        → {{ t('case_study.next_study') }}
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.cs-handoff {
  padding: 5rem 0;
  margin-top: 4rem;
  border-top: 1px solid var(--border);
}

.cs-handoff__line {
  font-family: theme('fontFamily.display');
  font-size: 1.75rem;
  line-height: 1.3;
  color: var(--text);
  font-weight: 400;
  margin: 0;
  max-width: 30ch;
}

.cs-handoff__actions {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.cs-handoff__primary,
.cs-handoff__secondary {
  font-family: theme('fontFamily.mono');
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 2px;
  transition: color 150ms;
}

.cs-handoff__primary {
  color: var(--text);
}

.cs-handoff__primary:hover {
  color: var(--accent);
}

.cs-handoff__secondary {
  color: var(--text-mute);
}

.cs-handoff__secondary:hover {
  color: var(--text);
}
</style>
