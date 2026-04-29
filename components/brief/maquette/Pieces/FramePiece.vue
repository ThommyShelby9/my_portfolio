<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'frame')!)
const emit = defineEmits<{ hover: [id: string, pos: [number, number, number]]; leave: [] }>()

// Frame accents: 2 diagonal cross-braces on top face + 4 corner reinforcement squares.
const accents = computed(() => {
  const [w, h, d] = piece.value.dimensions
  const hx = w / 2, hy = h / 2, hz = d / 2
  const segs: Array<[[number, number, number], [number, number, number]]> = []
  const y = hy + 0.001
  // diagonals
  segs.push([[-hx, y, -hz], [hx, y, hz]])
  segs.push([[-hx, y, hz], [hx, y, -hz]])
  // corner reinforcement plates (small squares, each = 4 segments)
  const inset = Math.min(0.18, w * 0.12, d * 0.12)
  const corners: Array<[number, number]> = [
    [-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz],
  ]
  for (const [cx, cz] of corners) {
    const sx = cx < 0 ? inset : -inset
    const sz = cz < 0 ? inset : -inset
    const x0 = cx, x1 = cx + sx
    const z0 = cz, z1 = cz + sz
    segs.push([[x0, y, z0], [x1, y, z0]])
    segs.push([[x1, y, z0], [x1, y, z1]])
    segs.push([[x1, y, z1], [x0, y, z1]])
    segs.push([[x0, y, z1], [x0, y, z0]])
  }
  return segs
})
</script>

<template>
  <TresGroup
    @pointer-enter="emit('hover', 'frame', piece.position)"
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
