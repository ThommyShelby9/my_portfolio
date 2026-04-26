<script setup lang="ts">
// Hardcoded availability copy for now. Plan 2 will move this into i18n strings.
const availabilityLabel = 'dispo Q3 2026'
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink to="/" class="site-header__brand">
        Rostel <em>Panoumassi</em>
      </NuxtLink>

      <nav class="site-header__nav" aria-label="Primary">
        <NuxtLink to="/work" class="site-header__link">Travaux</NuxtLink>
        <NuxtLink to="/about" class="site-header__link">Approche</NuxtLink>
        <span class="site-header__avail">
          <span class="site-header__dot" aria-hidden="true" />
          {{ availabilityLabel }}
        </span>
      </nav>

      <div class="site-header__actions">
        <LangToggle />
        <ThemeToggle />
        <NuxtLink to="/brief" class="site-header__cta">
          Démarrer un brief →
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in oklab, var(--bg) 92%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.site-header__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.site-header__brand {
  font-family: theme('fontFamily.display');
  font-size: 1rem;
  color: var(--text);
  text-decoration: none;
  white-space: nowrap;
}

.site-header__brand em {
  font-style: italic;
  color: var(--text-mute);
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex: 1;
}

.site-header__link {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-mute);
  text-decoration: none;
  transition: color 150ms;
}

.site-header__link:hover {
  color: var(--text);
}

.site-header__link.router-link-active {
  color: var(--text);
}

.site-header__avail {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--text-soft);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}

.site-header__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--available);
  display: inline-block;
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.site-header__cta {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--text);
  color: var(--bg);
  padding: 0.625rem 1rem;
  text-decoration: none;
  transition: opacity 150ms;
}

.site-header__cta:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .site-header__inner {
    flex-wrap: wrap;
    gap: 1rem;
  }
  .site-header__nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  .site-header__avail {
    margin-left: 0;
  }
}
</style>
