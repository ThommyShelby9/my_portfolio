<script setup lang="ts">
const { locale } = useI18n()
const skipLabel = computed(() => locale.value === 'en' ? 'Skip to content' : 'Aller au contenu')
</script>

<template>
  <div class="layout">
    <a href="#main-content" class="skip-link">{{ skipLabel }}</a>

    <AmbientBackground />
    <CursorAura />

    <SiteHeader />
    <main id="main-content" class="layout__main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

.layout__main {
  flex: 1;
  position: relative;
  z-index: 2;
}
</style>
