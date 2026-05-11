<script setup lang="ts">
const props = withDefaults(defineProps<{
  items: string[]
  separator?: string
  reverse?: boolean
  duration?: number
}>(), {
  separator: '/',
  reverse: false,
  duration: 40,
})

const trackStyle = computed(() => ({
  animationDuration: `${props.duration}s`,
}))
</script>

<template>
  <div class="marquee" role="presentation" aria-hidden="true">
    <div
      :class="['marquee__track', props.reverse && 'marquee__track--reverse']"
      :style="trackStyle"
    >
      <template v-for="n in 2" :key="n">
        <span v-for="(item, i) in items" :key="`${n}-${i}`" class="marquee__item">
          <span class="marquee__word">{{ item }}</span>
          <span class="marquee__sep" aria-hidden="true">{{ separator }}</span>
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.marquee__item {
  display: inline-flex;
  align-items: center;
  gap: 3rem;
  font-family: theme('fontFamily.editorial');
  font-size: clamp(2rem, 5vw, 4rem);
  font-style: italic;
  font-weight: 400;
  color: var(--text);
  letter-spacing: -0.01em;
}
.marquee__sep {
  color: var(--accent);
  font-family: theme('fontFamily.mono');
  font-style: normal;
  font-size: 0.7em;
  margin-top: -0.25em;
}
.marquee__word::selection {
  background: var(--accent);
}
</style>
