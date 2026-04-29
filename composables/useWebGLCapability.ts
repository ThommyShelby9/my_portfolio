import { ref } from 'vue'

let cached: { supported: boolean, lowPerf: boolean } | null = null

function detect(): { supported: boolean, lowPerf: boolean } {
  if (cached) return cached
  if (typeof window === 'undefined') {
    cached = { supported: false, lowPerf: true }
    return cached
  }

  let supported = false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    supported = gl !== null
  }
  catch {
    supported = false
  }

  const cores = (navigator as any).hardwareConcurrency
  const memory = (navigator as any).deviceMemory
  const lowPerf
    = (typeof cores === 'number' && cores < 4)
      || (typeof memory === 'number' && memory < 4)

  cached = { supported, lowPerf }
  return cached
}

export function useWebGLCapability() {
  const result = detect()
  return {
    supported: ref(result.supported),
    lowPerf: ref(result.lowPerf),
  }
}
