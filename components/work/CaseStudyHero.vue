<script setup lang="ts">
defineProps<{
  kicker?: string
  title: string
  excerpt?: string | null
  cover?: string | null
}>()
</script>

<template>
  <header class="cs-hero">
    <div class="cs-hero__top">
      <div class="cs-hero__text">
        <div class="cs-hero__strip">
          <p v-if="kicker" class="cs-hero__kicker">{{ kicker }}</p>
          <span class="cs-hero__line" aria-hidden="true" />
        </div>
        <h1 class="cs-hero__title">
          <SplitText :text="title" tag="span" :stagger="0.05" />
        </h1>
        <span class="cs-hero__horizon" aria-hidden="true" />
        <RevealOnView v-if="excerpt" :delay="0.25">
          <p class="cs-hero__excerpt">{{ excerpt }}</p>
        </RevealOnView>
      </div>
    </div>
  </header>
</template>

<style scoped>
.cs-hero {
  padding: 2rem 0 3rem;
}

/* Top row: text left, planet accent right */
.cs-hero__top {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
}

.cs-hero__text {
  flex: 1 1 0;
  min-width: 0;
}

.cs-hero__strip {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
}
.cs-hero__kicker {
  font-family: theme('fontFamily.body');
  font-style: normal;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0;
}
.cs-hero__line {
  width: 60px;
  height: 1px;
  background: var(--border-strong);
}

.cs-hero__title {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(2.5rem, 5.5vw, 4.75rem);
  line-height: 0.98;
  letter-spacing: -0.035em;
  max-width: 22ch;
  margin: 1.5rem 0 0;
  color: var(--text);
}

.cs-hero__excerpt {
  font-family: theme('fontFamily.body');
  font-size: 1.1875rem;
  line-height: 1.55;
  color: var(--text-mute);
  max-width: 56ch;
  margin: 1.5rem 0 0;
}

/* Ghost horizon — replaces the cover screenshot. A near-invisible amber-to-
   cool gradient rule under the title, like a distant planetary terminator
   line. Depth without imagery; DA calls for typography carrying the page. */
.cs-hero__horizon {
  display: block;
  width: 100%;
  height: 1px;
  margin: 2.75rem 0 0;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent-cool) 60%, transparent 100%);
  opacity: 0.07;
}
</style>
