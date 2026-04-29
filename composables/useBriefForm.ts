import type { BriefInput } from '~/types/brief'
import { BRIEF_LOCALSTORAGE_KEY, TOTAL_BRIEF_STEPS, type BriefStep } from '~/types/brief'

type FormState = Omit<BriefInput, 'turnstileToken' | 'locale'>

type FieldErrors = Record<string, string>

let hasHydrated = false

const defaultState: FormState = {
  projectType: 'new',
  pitch: '',
  currentState: 'idea',
  teamSize: 'solo',
  hasTechTeam: false,
  hasDesigner: false,
  hasProductOwner: false,
  notes: null,
  deadline: 'flexible',
  budget: 'undefined',
  firstName: '',
  lastName: '',
  email: '',
  company: null,
  website: null,
  source: null,
  prefersCall: false,
}

export function useBriefForm() {
  const state = useState<FormState>('brief-form-state', () => ({ ...defaultState }))
  const step = useState<BriefStep>('brief-form-step', () => 1)
  const errors = useState<FieldErrors>('brief-form-errors', () => ({}))
  const submitting = useState<boolean>('brief-form-submitting', () => false)
  const submitError = useState<string | null>('brief-form-submit-error', () => null)
  const turnstileToken = useState<string | null>('brief-form-turnstile', () => null)

  function hydrateFromLocalStorage() {
    if (!import.meta.client || hasHydrated) return
    hasHydrated = true
    const raw = localStorage.getItem(BRIEF_LOCALSTORAGE_KEY)
    if (!raw) return
    try {
      const draft = JSON.parse(raw)
      if (draft && typeof draft === 'object') {
        state.value = { ...defaultState, ...draft.state }
        step.value = (draft.step as BriefStep) ?? 1
      }
    }
    catch {
      // corrupted draft — ignore
    }
  }

  if (import.meta.client) {

    watch(
      [state, step],
      () => {
        try {
          localStorage.setItem(
            BRIEF_LOCALSTORAGE_KEY,
            JSON.stringify({ state: state.value, step: step.value }),
          )
        }
        catch {
          /* private mode or quota */
        }
      },
      { deep: true },
    )
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    state.value[key] = value
    if (errors.value[key as string]) {
      delete errors.value[key as string]
      errors.value = { ...errors.value }
    }
  }

  function next() {
    if (step.value < TOTAL_BRIEF_STEPS) {
      step.value = (step.value + 1) as BriefStep
      if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function back() {
    if (step.value > 1) {
      step.value = (step.value - 1) as BriefStep
      if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function clearDraft() {
    if (import.meta.client) {
      localStorage.removeItem(BRIEF_LOCALSTORAGE_KEY)
      hasHydrated = false
    }
  }

  async function submit() {
    if (!turnstileToken.value) {
      submitError.value = 'Captcha non vérifié — merci de patienter quelques secondes.'
      return false
    }

    const { locale } = useI18n()

    submitting.value = true
    submitError.value = null
    errors.value = {}

    try {
      const res = await $fetch<{ success: boolean; briefId: string }>('/api/brief', {
        method: 'POST',
        body: {
          ...state.value,
          turnstileToken: turnstileToken.value,
          locale: locale.value,
        },
      })

      const wantsCall = state.value.prefersCall

      if (import.meta.client) {
        try {
          sessionStorage.setItem(
            'brief-final-snapshot',
            JSON.stringify(state.value),
          )
        }
        catch {
          /* private mode or quota — non-fatal */
        }
      }

      clearDraft()
      state.value = { ...defaultState }
      step.value = 1

      const localePath = useLocalePath()
      const target = localePath('/brief/confirmation')
      const query = wantsCall ? '?call=1' : ''
      await navigateTo(`${target}${query}`)

      return res
    }
    catch (err: any) {
      const status = err?.statusCode ?? err?.status ?? 0
      const data = err?.data?.data ?? err?.data ?? {}

      if (status === 422 && Array.isArray(data.issues)) {
        const map: FieldErrors = {}
        for (const issue of data.issues) {
          const key = (issue.path?.[0] ?? '') as string
          if (key && !map[key]) map[key] = issue.message
        }
        errors.value = map
        submitError.value = 'Corrige les champs surlignés.'
      }
      else if (status === 429) {
        submitError.value = data.message ?? 'Trop de soumissions, réessayez dans une heure.'
      }
      else if (status === 403) {
        submitError.value = data.message ?? 'Captcha invalide. Recharge la page.'
      }
      else {
        submitError.value = 'Une erreur s\'est produite. Écris-moi à rmissimawu@gmail.com.'
      }
      return false
    }
    finally {
      submitting.value = false
    }
  }

  return {
    state,
    step,
    errors,
    submitting,
    submitError,
    turnstileToken,
    setField,
    next,
    back,
    submit,
    clearDraft,
    hydrateFromLocalStorage,
  }
}
