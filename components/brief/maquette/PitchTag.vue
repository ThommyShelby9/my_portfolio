<script setup lang="ts">
import { Html } from '@tresjs/cientos'
const { state } = useBriefForm()

const truncated = computed(() => {
  const p = state.value.pitch.trim()
  if (!p) return ''
  return p.length > 120 ? p.slice(0, 120) + '…' : p
})

const visible = computed(() => truncated.value.length > 0)
</script>

<template>
  <Html v-if="visible" :position="[0, 2.4, 0]" center>
    <div class="pitch-tag">{{ truncated }}</div>
  </Html>
</template>

<style scoped>
.pitch-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #7ec8ff;
  background: rgba(10, 21, 37, 0.85);
  border: 1px solid rgba(126, 200, 255, 0.3);
  padding: 6px 10px;
  max-width: 280px;
  text-align: center;
  white-space: pre-wrap;
  pointer-events: none;
  user-select: none;
}
</style>
