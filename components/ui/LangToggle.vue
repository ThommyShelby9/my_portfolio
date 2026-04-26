<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const otherLocale = computed(() => {
  return (locales.value as Array<{ code: string; name: string }>).find(l => l.code !== locale.value)
})
</script>

<template>
  <button
    v-if="otherLocale"
    type="button"
    class="lang-toggle"
    :aria-label="`Switch to ${otherLocale.name}`"
    @click="setLocale(otherLocale.code as 'fr' | 'en')"
  >
    <span :class="['lang-toggle__opt', { active: locale === 'fr' }]">FR</span>
    <span class="lang-toggle__sep">|</span>
    <span :class="['lang-toggle__opt', { active: locale === 'en' }]">EN</span>
  </button>
</template>

<style scoped>
.lang-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  background: transparent;
  color: var(--text-soft);
  transition: border-color 150ms, color 150ms;
}

.lang-toggle:hover {
  border-color: var(--border-strong);
}

.lang-toggle__opt.active {
  color: var(--text);
}

.lang-toggle__sep {
  color: var(--border-strong);
}
</style>
