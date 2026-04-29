<script setup lang="ts">
import type { PieceSpec } from '~/composables/useMaquetteState'

defineProps<{ pieces: PieceSpec[] }>()

const angle = ref(0)
const reduceMotion = import.meta.client
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

if (import.meta.client && !reduceMotion) {
  let raf = 0
  const tick = () => {
    angle.value += 0.003
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  onUnmounted(() => cancelAnimationFrame(raf))
}

const cameraPos = computed<[number, number, number]>(() => {
  const r = 6
  return [Math.cos(angle.value) * r, 3, Math.sin(angle.value) * r]
})
</script>

<template>
  <TresCanvas clear-color="#0a1525" :alpha="false">
    <TresPerspectiveCamera :args="[35, 1, 0.1, 100]" :position="cameraPos" :look-at="[0, 0.5, 0]" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :intensity="0.6" :position="[5, 8, 4]" />
    <TresGridHelper :args="[10, 20, '#7ec8ff', '#7ec8ff']" />
    <Piece
      v-for="p in pieces"
      :key="p.id"
      :position="p.position"
      :kind="p.kind"
      :dimensions="p.dimensions"
      :revealed="p.revealed"
    />
  </TresCanvas>
</template>

<style scoped>
:deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
