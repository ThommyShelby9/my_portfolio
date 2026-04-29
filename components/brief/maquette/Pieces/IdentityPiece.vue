<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'identity')!)
const emit = defineEmits<{ hover: [id: string, pos: [number, number, number]]; leave: [] }>()

// Identity plate accents: 4 small dots in a square pattern + an underline.
const accents = computed(() => {
  const [w, h, d] = piece.value.dimensions
  const hx = w / 2, hy = h / 2, hz = d / 2
  const y = hy + 0.001
  const segs: Array<[[number, number, number], [number, number, number]]> = []
  const inset = 0.08
  const s = 0.03
  const dots: Array<[number, number]> = [
    [-hx + inset, -hz + inset], [hx - inset, -hz + inset],
    [hx - inset, hz - inset], [-hx + inset, hz - inset],
  ]
  for (const [px, pz] of dots) {
    segs.push([[px - s, y, pz], [px + s, y, pz]])
    segs.push([[px, y, pz - s], [px, y, pz + s]])
  }
  // Underline running across the centre
  const underInset = Math.min(0.1, w * 0.18)
  segs.push([[-hx + underInset, y, 0], [hx - underInset, y, 0]])
  return segs
})
</script>

<template>
  <TresGroup
    @pointer-enter="emit('hover', 'identity', piece.position)"
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
