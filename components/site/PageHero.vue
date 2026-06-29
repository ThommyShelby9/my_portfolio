<script setup lang="ts">
withDefaults(defineProps<{
  num: string
  kicker: string
  title: string
  emphasis?: string
  sub?: string
}>(), {})
</script>

<template>
  <header class="page-hero">
    <div class="page-hero__inner container-narrow">
      <div class="page-hero__strip">
        <span class="page-hero__num">/ {{ num }}</span>
        <span class="page-hero__line" aria-hidden="true" />
        <span class="page-hero__kicker">{{ kicker }}</span>
      </div>
      <h1 class="page-hero__title">
        <SplitText :text="title" tag="span" :stagger="0.06" />
        <em v-if="emphasis" class="page-hero__em">
          <SplitText :text="emphasis" tag="span" :delay="0.2" :stagger="0.05" />
        </em>
      </h1>
      <RevealOnView v-if="sub" :delay="0.3" class="page-hero__sub-wrap">
        <p class="page-hero__sub">{{ sub }}</p>
      </RevealOnView>
    </div>
  </header>
</template>

<style scoped>
.page-hero {
  padding: 7rem 0 4rem;
  border-bottom: 1px solid var(--border);
}

.page-hero__strip {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-soft);
}
.page-hero__num { color: var(--accent); }
.page-hero__line {
  width: 60px;
  height: 1px;
  background: var(--border-strong);
}

.page-hero__title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(2.5rem, 6vw, 6rem);
  line-height: 0.98;
  letter-spacing: -0.025em;
  color: var(--text);
  margin: 0;
}
.page-hero__em {
  display: block;
  font-family: theme('fontFamily.editorial');
  font-style: normal;
  color: var(--accent);
  letter-spacing: -0.02em;
  margin-top: 0.1em;
}

.page-hero__sub-wrap {
  margin-top: 2rem;
  max-width: 56ch;
}
.page-hero__sub {
  font-family: theme('fontFamily.body');
  font-size: 1.125rem;
  line-height: 1.55;
  color: var(--text-mute);
  margin: 0;
}
</style>
