<script setup lang="ts">
const pieces = useMaquetteState()
const piece = computed(() => pieces.value.find(p => p.id === 'project-type')!)
const emit = defineEmits<{ hover: [id: string, pos: [number, number, number]]; leave: [] }>()

// Accent geometry depending on kind. All local to the piece origin.
const accents = computed(() => {
  const [w, h, d] = piece.value.dimensions
  const k = piece.value.kind
  const segs: Array<[[number, number, number], [number, number, number]]> = []

  if (k === 'box') {
    const hx = w / 2, hy = h / 2, hz = d / 2
    // Inner cross-brace on top face
    segs.push([[-hx, hy, -hz], [hx, hy, hz]])
    segs.push([[-hx, hy, hz], [hx, hy, -hz]])
    // 4 small stud cubes at top corners (each rendered as a tiny X marker)
    const s = 0.08
    for (const cx of [-hx, hx]) {
      for (const cz of [-hz, hz]) {
        segs.push([[cx - s, hy + s, cz], [cx + s, hy + s, cz]])
        segs.push([[cx, hy + s, cz - s], [cx, hy + s, cz + s]])
        segs.push([[cx, hy, cz], [cx, hy + s * 1.5, cz]])
      }
    }
  }
  else if (k === 'sphere') {
    // 3 perpendicular meridian rings
    const r = w / 2
    const N = 32
    const ringXY: Array<[number, number, number]> = []
    const ringYZ: Array<[number, number, number]> = []
    const ringXZ: Array<[number, number, number]> = []
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2
      ringXY.push([Math.cos(a) * r, Math.sin(a) * r, 0])
      ringYZ.push([0, Math.cos(a) * r, Math.sin(a) * r])
      ringXZ.push([Math.cos(a) * r, 0, Math.sin(a) * r])
    }
    for (const ring of [ringXY, ringYZ, ringXZ]) {
      for (let i = 0; i < ring.length - 1; i++) segs.push([ring[i], ring[i + 1]])
    }
  }
  else if (k === 'plate') {
    // bolt-circle of 4 small dots (each as tiny crosses on top face)
    const hx = w / 2, hy = h / 2, hz = d / 2
    const inset = 0.12
    const s = 0.05
    const pts: Array<[number, number]> = [
      [-hx + inset, -hz + inset], [hx - inset, -hz + inset],
      [hx - inset, hz - inset], [-hx + inset, hz - inset],
    ]
    for (const [px, pz] of pts) {
      segs.push([[px - s, hy + 0.01, pz], [px + s, hy + 0.01, pz]])
      segs.push([[px, hy + 0.01, pz - s], [px, hy + 0.01, pz + s]])
    }
  }
  return segs
})
</script>

<template>
  <TresGroup
    @pointer-enter="emit('hover', 'project-type', piece.position)"
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
