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
    <div class="cs-hero__strip">
      <p v-if="kicker" class="cs-hero__kicker">{{ kicker }}</p>
      <span class="cs-hero__line" aria-hidden="true" />
    </div>
    <h1 class="cs-hero__title">
      <SplitText :text="title" tag="span" :stagger="0.05" />
    </h1>
    <RevealOnView v-if="excerpt" :delay="0.25">
      <p class="cs-hero__excerpt">{{ excerpt }}</p>
    </RevealOnView>

    <RevealOnView v-if="cover" :delay="0.35" class="cs-hero__cover-wrap">
      <div class="cs-hero__cover">
        <div class="cs-hero__cover-mask img-reveal">
          <img :src="cover" :alt="title" loading="eager" class="cs-hero__cover-img" data-parallax="0.08">
        </div>
      </div>
    </RevealOnView>
  </header>
</template>

<style scoped>
.cs-hero {
  padding: 2rem 0 3rem;
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

.cs-hero__cover-wrap {
  margin-top: 3.5rem;
}
.cs-hero__cover {
  position: relative;
  border: 1px solid var(--border-strong);
  padding: 0.5rem;
  background: var(--bg-overlay);
}
.cs-hero__cover-mask {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/9;
}
.cs-hero__cover-img {
  display: block;
  width: 100%;
  height: 110%;
  object-fit: cover;
  filter: saturate(0.92) contrast(1.04);
}
</style>
