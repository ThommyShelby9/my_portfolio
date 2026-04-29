<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'project-type')!)
const emit = defineEmits<{ hover: [id: string, pos: [number, number, number]]; leave: [] }>()
</script>

<template>
  <Piece
    :position="piece.position"
    :kind="piece.kind"
    :dimensions="piece.dimensions"
    :revealed="piece.revealed"
    @hover="emit('hover', 'project-type', piece.position)"
    @leave="emit('leave')"
  />
</template>
