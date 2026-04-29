<script setup lang="ts">
import { Html } from '@tresjs/cientos'
const pieces = useMaquetteState()

const labels = computed(() => pieces.value.filter(p => p.revealed).map(p => ({
  id: p.id,
  text: p.label,
  position: [p.position[0], p.position[1] + p.dimensions[1] / 2 + 0.3, p.position[2]] as [number, number, number],
})))
</script>

<template>
  <Html
    v-for="label in labels"
    :key="label.id"
    :position="label.position"
    center
  >
    <span class="annotation">{{ label.text }}</span>
  </Html>
  <Html :position="[-2.2, -0.3, -2.2]">
    <span class="annotation annotation--scale">SCALE 1:50</span>
  </Html>
</template>

<style scoped>
.annotation {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #7ec8ff;
  opacity: 0.6;
  letter-spacing: 0.06em;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}
.annotation--scale {
  opacity: 0.4;
}
</style>
