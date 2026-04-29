<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'context')!)
const emit = defineEmits<{ hover: [id: string, pos: [number, number, number]]; leave: [] }>()

// Cylinder accents: 4 horizontal rings stacked + 1 vertical seam.
const accents = computed(() => {
  const [r, h] = piece.value.dimensions
  const segs: Array<[[number, number, number], [number, number, number]]> = []
  const N = 28
  const ringYs = [-h / 2 + h * 0.2, -h / 2 + h * 0.5, -h / 2 + h * 0.8]
  for (const y of ringYs) {
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2
      const a1 = ((i + 1) / N) * Math.PI * 2
      segs.push([
        [Math.cos(a0) * r, y, Math.sin(a0) * r],
        [Math.cos(a1) * r, y, Math.sin(a1) * r],
      ])
    }
  }
  // Vertical seam on +X side
  segs.push([[r, -h / 2, 0], [r, h / 2, 0]])
  return segs
})
</script>

<template>
  <TresGroup
    @pointer-enter="emit('hover', 'context', piece.position)"
    @pointer-leave="emit('leave')"
  >
    <Piece
      :position="piece.position"
      :kind="piece.kind"
      :dimensions="piece.dimensions"
      :revealed="piece.revealed"
    />
    <Wire
      :position="piece.position"
      :segments="accents"
      :revealed="piece.revealed"
      :line-width="1.8"
    />
  </TresGroup>
</template>
