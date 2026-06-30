export interface CaseStudyLike {
  slug: string
  title?: string
  sector: string
  duration: string
  stack: string[]
  featured?: boolean
  results?: { value: string, label: string }[]
}

export interface BodyParams {
  slug: string
  seed: number
  color: string
  hue: string
  size: number
  orbitRadius: number
  orbitSpeed: number
  orbitPhase: number
  ringCount: number
  glow: number
}

const FLUX = {
  emerald: '#19c98c',
  indigo: '#7a5cf0',
  magenta: '#ff5aaa',
  amber: '#ffae3b',
  violet: '#9b86ff',
}

/** Deterministic 32-bit string hash → unsigned int. */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Keyword → flux hex. Case-insensitive; violet fallback. */
export function sectorColor(sector: string): string {
  const s = sector.toLowerCase()
  if (/fintech|finance|bank|pay|paie|wallet/.test(s)) return FLUX.emerald
  if (/data|\bai\b|\bml\b|analytic|ia\b/.test(s)) return FLUX.indigo
  if (/well|health|care|life|sant|bien/.test(s)) return FLUX.magenta
  if (/commerce|ecom|e-com|retail|shop|boutique|vente/.test(s)) return FLUX.amber
  return FLUX.violet
}

/** First integer found in a duration string ("3 mois (…)" → 3). 0 if none. */
function durationMonths(duration: string): number {
  const m = duration.match(/\d+/)
  return m ? parseInt(m[0], 10) : 0
}

function ringsFromMonths(months: number): number {
  if (months <= 1) return 0
  if (months <= 5) return 1
  if (months <= 9) return 2
  return 3
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

export function caseStudyToBody(study: CaseStudyLike, index: number): BodyParams {
  const seed = hash(study.slug)
  const resultsCount = study.results?.length ?? 1
  const size = clamp(0.8 + (study.featured ? 0.4 : 0) + (resultsCount - 1) * 0.1, 0.7, 1.5)
  const ringCount = ringsFromMonths(durationMonths(study.duration))
  const glow = clamp((study.stack?.length ?? 1) / 6, 0.2, 1)
  const orbitRadius = 2.6 + index * 0.62
  const orbitSpeed = 0.12 / Math.sqrt(orbitRadius) // outer orbits slower
  const orbitPhase = (seed % 360) * (Math.PI / 180)
  return {
    slug: study.slug,
    seed,
    color: sectorColor(study.sector),
    hue: study.sector,
    size,
    orbitRadius,
    orbitSpeed,
    orbitPhase,
    ringCount,
    glow,
  }
}

export function buildBodies(studies: CaseStudyLike[]): BodyParams[] {
  return studies.map((s, i) => caseStudyToBody(s, i))
}
