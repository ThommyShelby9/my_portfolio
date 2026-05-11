<script setup lang="ts">
// Word-by-word reveal — each word is wrapped in a clip mask and slides up.
// Triggers on IntersectionObserver. Respects reduced motion.
const props = withDefaults(defineProps<{
  text: string
  tag?: keyof HTMLElementTagNameMap
  delay?: number
  stagger?: number
  once?: boolean
}>(), {
  tag: 'span',
  delay: 0,
  stagger: 0.08,
  once: true,
})

const root = ref<HTMLElement | null>(null)
const words = computed(() => props.text.split(/(\s+)/))

onMounted(() => {
  if (!root.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    root.value.querySelectorAll('.split-word').forEach(w => w.classList.add('is-visible'))
    return
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        if (!props.once) {
          entry.target.querySelectorAll('.split-word').forEach(w => w.classList.remove('is-visible'))
        }
        return
      }
      const els = entry.target.querySelectorAll<HTMLElement>('.split-word')
      els.forEach((el, i) => {
        const total = props.delay + i * props.stagger
        el.style.transitionDelay = `${total}s`
        ;(el.firstElementChild as HTMLElement | null)?.style.setProperty('transition-delay', `${total}s`)
        el.classList.add('is-visible')
      })
      if (props.once) io.unobserve(entry.target)
    })
  }, { threshold: 0.2 })
  io.observe(root.value)
})
</script>

<template>
  <component :is="props.tag" ref="root">
    <template v-for="(w, i) in words" :key="i">
      <span v-if="w.trim() === ''" v-html="w" />
      <span v-else class="split-word"><span>{{ w }}</span></span>
    </template>
  </component>
</template>
