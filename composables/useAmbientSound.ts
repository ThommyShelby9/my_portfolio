/**
 * Procedural cinematic ambient soundtrack — synthesized entirely with the
 * Web Audio API. No audio files, no external requests: everything below is
 * oscillators, filters and gain envelopes. Evokes a Zimmer-ish Interstellar
 * mood — a low detuned drone, a slow organ swell, and a steady "time" tick.
 *
 * Off by default. NEVER autoplays: the AudioContext and its graph are only
 * ever constructed inside a real user gesture (see `enable()` below, and
 * the one-shot gesture arm used to honour a saved "on" preference without
 * violating the browser's autoplay policy).
 *
 * All state is module-scope (not inside the composable function) so the
 * graph is a true singleton: it survives route changes and is never
 * rebuilt if the mounting component happens to remount.
 */
import { ref } from 'vue'

const STORAGE_KEY = 'ambient-sound'

const enabled = ref(false)
const supported = ref(true)

let ctx: AudioContext | null = null
let master: GainNode | null = null
let graphBuilt = false
let hydrated = false

let tickTimerId: ReturnType<typeof setInterval> | null = null
let nextTickTime = 0

// Master chain
const MASTER_PEAK = 0.16
const FADE_IN_SEC = 1.5
const FADE_OUT_SEC = 0.8
const LOWPASS_HZ = 1400

// The "time" tick (Interstellar motif) — a lookahead scheduler: setInterval
// only ever checks the clock, all actual sound timing is scheduled against
// ctx.currentTime so JS-timer jitter never reaches the audio.
const TICK_PERIOD_SEC = 1.25
const SCHEDULE_AHEAD_SEC = 0.25
const SCHEDULER_POLL_MS = 200
const TICK_FREQ_HZ = 1200
const TICK_PEAK = 0.06
const TICK_ATTACK_SEC = 0.005
const TICK_DECAY_SEC = 0.06

function readPersisted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  }
  catch {
    return false
  }
}

function persist(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
  }
  catch {
    /* private mode or quota — non-fatal */
  }
}

function ensureContext(): AudioContext | null {
  if (ctx) return ctx
  if (typeof window === 'undefined') return null

  try {
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextCtor) {
      supported.value = false
      return null
    }
    ctx = new AudioContextCtor()
    return ctx
  }
  catch {
    supported.value = false
    return null
  }
}

/** Two detuned low oscillators (~55 / 55.35 Hz) breathing via a slow LFO,
 * plus a very quiet octave-up voice for a little air. */
function buildDrone(audioCtx: AudioContext, destination: AudioNode) {
  const droneGain = audioCtx.createGain()
  droneGain.gain.value = 0.5
  droneGain.connect(destination)

  const osc1 = audioCtx.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.value = 55
  osc1.connect(droneGain)

  const osc2 = audioCtx.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.value = 55.35
  osc2.connect(droneGain)

  // Breathing LFO — modulates the drone's gain around its 0.5 base (~0.35–0.65).
  const breathLfo = audioCtx.createOscillator()
  breathLfo.type = 'sine'
  breathLfo.frequency.value = 0.06
  const breathDepth = audioCtx.createGain()
  breathDepth.gain.value = 0.15
  breathLfo.connect(breathDepth)
  breathDepth.connect(droneGain.gain)

  // Octave-up voice, very quiet.
  const octaveGain = audioCtx.createGain()
  octaveGain.gain.value = 0.05
  octaveGain.connect(destination)
  const osc3 = audioCtx.createOscillator()
  osc3.type = 'sine'
  osc3.frequency.value = 110
  osc3.connect(octaveGain)

  osc1.start()
  osc2.start()
  osc3.start()
  breathLfo.start()
}

/** A quiet 3-voice harmonic stack (110/165/220 Hz) that swells up and down
 * very slowly — the "nappe d'orgue". Kept to a ~0.05 peak. */
function buildOrgan(audioCtx: AudioContext, destination: AudioNode) {
  const organGain = audioCtx.createGain()
  organGain.gain.value = 0.025 // swell center; combined with the LFO below ranges 0..0.05
  organGain.connect(destination)

  for (const freq of [110, 165, 220]) {
    const osc = audioCtx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(organGain)
    osc.start()
  }

  const swellLfo = audioCtx.createOscillator()
  swellLfo.type = 'sine'
  swellLfo.frequency.value = 0.04 // within the 0.03–0.05 Hz range
  const swellDepth = audioCtx.createGain()
  swellDepth.gain.value = 0.025
  swellLfo.connect(swellDepth)
  swellDepth.connect(organGain.gain)
  swellLfo.start()
}

function buildGraph(audioCtx: AudioContext) {
  if (graphBuilt) return

  try {
    const masterGain = audioCtx.createGain()
    masterGain.gain.value = 0

    const lowpass = audioCtx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = LOWPASS_HZ

    const compressor = audioCtx.createDynamicsCompressor()
    compressor.threshold.value = -18
    compressor.ratio.value = 4

    masterGain.connect(lowpass)
    lowpass.connect(compressor)
    compressor.connect(audioCtx.destination)

    buildDrone(audioCtx, masterGain)
    buildOrgan(audioCtx, masterGain)

    // Only publish to the module-level singleton once fully wired.
    master = masterGain
    graphBuilt = true
  }
  catch {
    supported.value = false
    enabled.value = false
    master = null
  }
}

function rampMasterTo(target: number, durationSec: number) {
  if (!ctx || !master) return
  const now = ctx.currentTime
  const gain = master.gain
  gain.cancelScheduledValues(now)
  gain.setValueAtTime(gain.value, now)
  gain.linearRampToValueAtTime(target, now + durationSec)
}

/** One short enveloped click (5ms attack / 60ms decay) through a highpass —
 * reads as a subtle clock tick, not a beep. */
function scheduleTick(audioCtx: AudioContext, time: number) {
  if (!master) return

  const osc = audioCtx.createOscillator()
  osc.type = 'square'
  osc.frequency.value = TICK_FREQ_HZ

  const tickFilter = audioCtx.createBiquadFilter()
  tickFilter.type = 'highpass'
  tickFilter.frequency.value = 800

  const tickGain = audioCtx.createGain()
  tickGain.gain.setValueAtTime(0, time)
  tickGain.gain.linearRampToValueAtTime(TICK_PEAK, time + TICK_ATTACK_SEC)
  tickGain.gain.linearRampToValueAtTime(0, time + TICK_ATTACK_SEC + TICK_DECAY_SEC)

  osc.connect(tickFilter)
  tickFilter.connect(tickGain)
  tickGain.connect(master)

  const stopAt = time + TICK_ATTACK_SEC + TICK_DECAY_SEC + 0.02
  osc.start(time)
  osc.stop(stopAt)
}

function startTickScheduler() {
  const audioCtx = ctx
  if (!audioCtx || tickTimerId !== null) return

  nextTickTime = audioCtx.currentTime + 0.1

  tickTimerId = setInterval(() => {
    if (!ctx) return
    while (nextTickTime < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      scheduleTick(ctx, nextTickTime)
      nextTickTime += TICK_PERIOD_SEC
    }
  }, SCHEDULER_POLL_MS)
}

function stopTickScheduler() {
  if (tickTimerId !== null) {
    clearInterval(tickTimerId)
    tickTimerId = null
  }
}

function enable() {
  if (!import.meta.client) return

  const audioCtx = ensureContext()
  if (!audioCtx) return

  try {
    audioCtx.resume().catch(() => {})
  }
  catch {
    /* ignore */
  }

  buildGraph(audioCtx)
  if (!master) return // construction failed — supported already flipped false

  rampMasterTo(MASTER_PEAK, FADE_IN_SEC)
  startTickScheduler()

  enabled.value = true
  persist(true)
}

function disable() {
  enabled.value = false
  persist(false)

  stopTickScheduler()
  rampMasterTo(0, FADE_OUT_SEC)

  const audioCtx = ctx
  if (!audioCtx) return

  // Suspend (not close) after the fade-out to save CPU while keeping the
  // graph alive — but only if nothing re-enabled sound in the meantime.
  setTimeout(() => {
    if (!enabled.value && ctx === audioCtx) {
      try {
        audioCtx.suspend().catch(() => {})
      }
      catch {
        /* ignore */
      }
    }
  }, FADE_OUT_SEC * 1000 + 100)
}

function toggle() {
  if (enabled.value) disable()
  else enable()
}

/** Arms a one-shot pointerdown/keydown listener that starts audio on the
 * first user gesture — used only to honour a saved "on" preference without
 * autoplaying. Either event removes both listeners. */
function armAutoEnableOnGesture() {
  if (typeof window === 'undefined') return

  const onGesture = () => {
    window.removeEventListener('pointerdown', onGesture)
    window.removeEventListener('keydown', onGesture)
    enable()
  }
  window.addEventListener('pointerdown', onGesture, { once: true, passive: true })
  window.addEventListener('keydown', onGesture, { once: true })
}

function ensureHydrated() {
  if (hydrated) return
  hydrated = true

  const persisted = readPersisted()
  enabled.value = persisted // reflect the saved pref in the UI — never autoplay

  if (persisted) {
    armAutoEnableOnGesture()
  }
}

export function useAmbientSound() {
  if (import.meta.client) {
    ensureHydrated()
  }

  return { enabled, supported, toggle, enable, disable }
}
