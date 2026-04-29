import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { BriefInput, BriefStep } from '~/types/brief'

type FormState = Omit<BriefInput, 'turnstileToken' | 'locale'>

export type PieceKind = 'box' | 'cylinder' | 'frame' | 'plate' | 'sphere'

export type PieceSpec = {
  id: 'project-type' | 'context' | 'frame' | 'identity'
  kind: PieceKind
  dimensions: [number, number, number]
  position: [number, number, number]
  label: string
  revealed: boolean
}

const PROJECT_TYPE_KIND: Record<FormState['projectType'], PieceKind> = {
  new: 'box',
  revamp: 'box',
  audit: 'sphere',
  spot: 'plate',
  unsure: 'box',
}

const TEAM_SIZE_HEIGHT: Record<FormState['teamSize'], number> = {
  'solo': 0.4,
  '2-5': 0.7,
  '6-15': 1.0,
  '15+': 1.3,
}

const BUDGET_WIDTH: Record<FormState['budget'], number> = {
  'undefined': 2.0,
  '<5k': 1.6,
  '5-15k': 1.9,
  '15-40k': 2.3,
  '40-100k': 2.7,
  '100k+': 3.1,
}

const DEADLINE_DEPTH: Record<FormState['deadline'], number> = {
  'flexible': 2.0,
  '<1m': 1.4,
  '1-3m': 1.7,
  '3-6m': 2.4,
}

export function computeMaquetteState(state: FormState, step: BriefStep): PieceSpec[] {
  const pitchFilled = state.pitch.trim().length > 0
  const teamH = TEAM_SIZE_HEIGHT[state.teamSize] ?? 0.4

  return [
    {
      id: 'project-type',
      kind: PROJECT_TYPE_KIND[state.projectType] ?? 'box',
      dimensions: [1.4, 0.9, 1.4],
      position: [0, 0.45, 0],
      label: `N1 — ${state.projectType.toUpperCase()}`,
      revealed: step >= 1 && pitchFilled,
    },
    {
      id: 'context',
      kind: 'cylinder',
      dimensions: [0.45, teamH, 0.45],
      position: [-1.2, teamH / 2, 0.6],
      label: `N2 — TEAM ${state.teamSize.toUpperCase()}`,
      revealed: step >= 2 && pitchFilled,
    },
    {
      id: 'frame',
      kind: 'frame',
      dimensions: [
        BUDGET_WIDTH[state.budget] ?? 2.0,
        0.05,
        DEADLINE_DEPTH[state.deadline] ?? 2.0,
      ],
      position: [0, 0.025, 0],
      label: `N3 — SCOPE ${state.deadline.toUpperCase()}`,
      revealed: step >= 3,
    },
    {
      id: 'identity',
      kind: 'plate',
      dimensions: [0.6, 0.05, 0.3],
      position: [0.9, 0.025, 0.7],
      label: `N4 — ${state.firstName.charAt(0)}${state.lastName.charAt(0)}`.toUpperCase(),
      revealed: step >= 4 && state.firstName.length > 0 && state.lastName.length > 0,
    },
  ]
}

export function useMaquetteState(): ComputedRef<PieceSpec[]> {
  const { state, step } = useBriefForm()
  return computed(() => computeMaquetteState(state.value, step.value))
}
