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
        <span>{{ t('case_study.start_brief') }}</span>
        <span class="cs-handoff__arrow">→</span>
      </NuxtLink>
      <NuxtLink
        v-if="nextSlug"
        :to="localePath(`/work/${nextSlug}`)"
        class="cs-handoff__secondary"
      >
        <span>{{ t('case_study.next_study') }}</span>
        <span class="cs-handoff__arrow">↗</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.cs-handoff {
  padding: 5rem 0 3rem;
  margin-top: 4rem;
  border-top: 1px solid var(--border);
}

.cs-handoff__line {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--text);
  margin: 0;
  max-width: 30ch;
}

.cs-handoff__actions {
  display: flex;
  gap: 1.5rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
}

.cs-handoff__primary,
.cs-handoff__secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 1rem 1.5rem;
  border-radius: 999px;
  transition: color 250ms, background 250ms, border-color 250ms;
}

.cs-handoff__primary {
  background: var(--text);
  color: var(--bg);
  position: relative;
  overflow: hidden;
}
.cs-handoff__primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: translateY(100%);
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.cs-handoff__primary > * { position: relative; z-index: 1; }
.cs-handoff__primary:hover { color: var(--accent-ink); }
.cs-handoff__primary:hover::before { transform: translateY(0); }

.cs-handoff__secondary {
  color: var(--text);
  border: 1px solid var(--border-strong);
}
.cs-handoff__secondary:hover {
  background: var(--bg-raised);
  border-color: var(--text-soft);
  color: var(--accent);
}

.cs-handoff__arrow {
  transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
}
.cs-handoff__primary:hover .cs-handoff__arrow,
.cs-handoff__secondary:hover .cs-handoff__arrow {
  transform: translateX(4px);
}
</style>
