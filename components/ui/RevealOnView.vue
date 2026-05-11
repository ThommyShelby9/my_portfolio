<script setup lang="ts">
// Wraps slot in a div with [data-reveal]; toggles .is-visible on IO.
const props = withDefaults(defineProps<{
  delay?: number
  threshold?: number
  once?: boolean
  as?: keyof HTMLElementTagNameMap
}>(), {
  delay: 0,
  threshold: 0.15,
  once: true,
  as: 'div',
})

const root = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!root.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    root.value.classList.add('is-visible')
    return
  }
  if (props.delay) root.value.style.transitionDelay = `${props.delay}s`
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        if (props.once) io.unobserve(entry.target)
      }
      else if (!props.once) {
        entry.target.classList.remove('is-visible')
      }
    })
  }, { threshold: props.threshold })
  io.observe(root.value)
})
</script>

<template>
  <component :is="props.as" ref="root" data-reveal>
    <slot />
  </component>
</template>
