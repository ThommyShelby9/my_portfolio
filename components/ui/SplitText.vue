<script setup lang="ts">
// Word-by-word reveal — each word is wrapped in a clip mask and slides up.
// Triggers on IntersectionObserver, with a safety fallback so the text can
// NEVER stay permanently hidden (page transitions / hydration edge cases
// used to leave off-home hero titles clipped out of view). Respects reduced motion.
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
// Keep whitespace tokens so inter-word spacing survives; render them as plain
// text spans (no v-html) to keep server/client markup identical.
const tokens = computed(() => props.text.split(/(\s+)/).filter(t => t.length > 0))
const isSpace = (t: string) => /^\s+$/.test(t)

let io: IntersectionObserver | null = null
let fallback: ReturnType<typeof setTimeout> | null = null
let revealed = false

function revealAll(withStagger = false) {
  revealed = true
  const els = root.value?.querySelectorAll<HTMLElement>('.split-word')
  els?.forEach((el, i) => {
    if (withStagger) {
      const total = props.delay + i * props.stagger
      el.style.transitionDelay = `${total}s`
      ;(el.firstElementChild as HTMLElement | null)?.style.setProperty('transition-delay', `${total}s`)
    }
    el.classList.add('is-visible')
  })
}

onMounted(() => {
  if (!root.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealAll(false)
    return
  }
  // Guarantee the words appear even if the observer never reports intersection.
  fallback = setTimeout(() => { if (!revealed) revealAll(false) }, 1200)

  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        if (!props.once && revealed) {
          revealed = false
          entry.target.querySelectorAll('.split-word').forEach(w => w.classList.remove('is-visible'))
        }
        continue
      }
      if (fallback) { clearTimeout(fallback); fallback = null }
      revealAll(true)
      if (props.once) io?.unobserve(entry.target)
    }
  }, { threshold: 0.15 })
  io.observe(root.value)
})

onBeforeUnmount(() => {
  if (fallback) clearTimeout(fallback)
  io?.disconnect()
})
</script>

<template>
  <component :is="props.tag" ref="root">
    <template v-for="(t, i) in tokens" :key="i">
      <span v-if="isSpace(t)" class="split-space">{{ t }}</span>
      <span v-else class="split-word"><span>{{ t }}</span></span>
    </template>
  </component>
</template>
