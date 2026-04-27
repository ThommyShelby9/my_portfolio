<script setup lang="ts">
import { fadeUp } from '~/assets/animations/scroll'

const props = withDefaults(
  defineProps<{
    delay?: number
    y?: number
    as?: keyof HTMLElementTagNameMap
  }>(),
  { delay: 0, y: 16, as: 'div' },
)

const target = ref<HTMLElement | null>(null)
const { reduce } = useReducedMotion()

onMounted(() => {
  if (!target.value || reduce.value) return
  fadeUp(target.value, { delay: props.delay, y: props.y })
})
</script>

<template>
  <component :is="props.as" ref="target">
    <slot />
  </component>
</template>
