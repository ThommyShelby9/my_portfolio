<script setup lang="ts">
</script>

<template>
  <TresCanvas clear-color="#0a1525" :alpha="false" window-size>
    <TresPerspectiveCamera :args="[35, 1, 0.1, 100]" :position="[4, 3, 6]" :look-at="[0, 0.5, 0]" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :intensity="0.6" :position="[5, 8, 4]" />
    <TresGridHelper :args="[10, 20, '#7ec8ff', '#7ec8ff']" :position="[0, 0, 0]" />
    <ProjectTypePiece />
  </TresCanvas>
</template>

<style scoped>
:deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
