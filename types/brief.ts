export type {
  BriefInput,
} from '~/server/utils/schemas/brief'

export type BriefStep = 1 | 2 | 3 | 4 | 5
export const TOTAL_BRIEF_STEPS = 5 as const

export const BRIEF_LOCALSTORAGE_KEY = 'rostel_portfolio_brief_draft_v1'
