<script setup lang="ts">
const { t, locale } = useI18n()
const { state, submitting, submitError, submit, back } = useBriefForm()

// Lookup tables — match the labels used in the corresponding step components
const projectTypeLabels = computed<Record<string, string>>(() => locale.value === 'en'
  ? {
      new: 'Build a product from scratch',
      revamp: 'Improve / revamp an existing product',
      audit: 'Technical audit / second opinion',
      spot: 'Spot mission (integration, migration, perf)',
      unsure: 'Not sure yet — discuss',
    }
  : {
      new: 'Construire un produit depuis zéro',
      revamp: 'Améliorer / refondre un produit existant',
      audit: 'Audit technique / second avis architecture',
      spot: 'Mission ponctuelle (intégration, migration, perf)',
      unsure: 'Je ne sais pas encore — discuter',
    },
)

const currentStateLabels = computed<Record<string, string>>(() => locale.value === 'en'
  ? {
      idea: 'Idea / paper spec',
      design: 'Mockup / design',
      inProgressBlocked: 'Code in progress, blocked',
      mvpInProd: 'MVP in prod, to scale',
      existingRevamp: 'Existing to revamp',
      auditOnly: 'No product, audit only',
    }
  : {
      idea: 'Idée / spec papier',
      design: 'Maquette / design',
      inProgressBlocked: 'Code en cours mais bloqué',
      mvpInProd: 'MVP en prod, à scaler',
      existingRevamp: 'Existant à refondre',
      auditOnly: 'Pas de produit, audit pur',
    },
)

const teamSizeLabels: Record<string, string> = {
  'solo': 'Solo', '2-5': '2 — 5', '6-15': '6 — 15', '15+': '15+',
}

const deadlineLabels = computed<Record<string, string>>(() => locale.value === 'en'
  ? { '<1m': 'Under 1 month', '1-3m': '1 — 3 months', '3-6m': '3 — 6 months', 'flexible': 'Flexible' }
  : { '<1m': '< 1 mois', '1-3m': '1 — 3 mois', '3-6m': '3 — 6 mois', 'flexible': 'Flexible' },
)

const budgetLabels = computed<Record<string, string>>(() => locale.value === 'en'
  ? {
      '<5k': '< 5k EUR', '5-15k': '5 — 15k EUR', '15-40k': '15 — 40k EUR',
      '40-100k': '40 — 100k EUR', '100k+': '100k+ EUR', 'undefined': 'Not yet defined',
    }
  : {
      '<5k': '< 5k EUR', '5-15k': '5 — 15k EUR', '15-40k': '15 — 40k EUR',
      '40-100k': '40 — 100k EUR', '100k+': '100k+ EUR', 'undefined': 'Pas encore défini',
    },
)

const recapLabels = computed(() => locale.value === 'en'
  ? {
      type: 'Type', pitch: 'Pitch', stateRow: 'State', team: 'Team',
      deadline: 'Deadline', budget: 'Budget', identity: 'Contact',
    }
  : {
      type: 'Type', pitch: 'Pitch', stateRow: 'État', team: 'Équipe',
      deadline: 'Deadline', budget: 'Budget', identity: 'Contact',
    },
)

const recap = computed(() => [
  { label: recapLabels.value.type, value: projectTypeLabels.value[state.value.projectType] ?? state.value.projectType },
  { label: recapLabels.value.pitch, value: state.value.pitch },
  { label: recapLabels.value.stateRow, value: currentStateLabels.value[state.value.currentState] ?? state.value.currentState },
  { label: recapLabels.value.team, value: teamSizeLabels[state.value.teamSize] ?? state.value.teamSize },
  { label: recapLabels.value.deadline, value: deadlineLabels.value[state.value.deadline] ?? state.value.deadline },
  { label: recapLabels.value.budget, value: budgetLabels.value[state.value.budget] ?? state.value.budget },
  { label: recapLabels.value.identity, value: `${state.value.firstName} ${state.value.lastName} <${state.value.email}>`.trim() },
])
</script>

<template>
  <section class="step5">
    <h2 class="step5__title">{{ t('brief.step5.title') }}</h2>
    <p class="step5__sub">{{ t('brief.step5.sub') }}</p>

    <dl class="step5__list">
      <div v-for="row in recap" :key="row.label" class="step5__row">
        <dt class="step5__dt">{{ row.label }}</dt>
        <dd class="step5__dd">{{ row.value || '—' }}</dd>
      </div>
    </dl>

    <p v-if="submitError" class="step5__error" role="alert">{{ submitError }}</p>

    <div class="step5__actions">
      <button type="button" class="step5__back" :disabled="submitting" @click="back">
        {{ t('brief.back') }}
      </button>
      <button type="button" class="step5__submit" :disabled="submitting" @click="submit">
        {{ submitting ? '…' : t('brief.submit') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.step5 { display: flex; flex-direction: column; gap: 1.5rem; }
.step5__title {
  font-family: theme('fontFamily.display');
  font-size: 1.5rem; line-height: 1.2; font-weight: 400; margin: 0;
}
.step5__sub {
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem; color: var(--text-mute); margin: 0;
}
.step5__list { display: flex; flex-direction: column; gap: 0.75rem; margin: 0; }
.step5__row {
  display: grid; grid-template-columns: 8rem 1fr; gap: 1rem;
  padding: 0.625rem 0; border-bottom: 1px solid var(--border);
}
.step5__dt {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-soft);
}
.step5__dd {
  font-family: theme('fontFamily.body');
  font-size: 0.9375rem; color: var(--text); margin: 0;
  word-break: break-word;
}
.step5__error {
  font-family: theme('fontFamily.body'); font-size: 0.9375rem;
  line-height: 1.5; color: var(--error);
  background: color-mix(in oklab, var(--error) 12%, transparent);
  border: 1px solid color-mix(in oklab, var(--error) 30%, transparent);
  border-left: 3px solid var(--error);
  padding: 1rem 1.25rem; margin: 0;
  border-radius: 4px;
}
.step5__actions {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1rem;
}
.step5__back {
  font-family: theme('fontFamily.mono'); font-size: 0.75rem; letter-spacing: 0.04em;
  background: transparent; color: var(--text-mute); border: 0;
  padding: 0.625rem 1rem; cursor: pointer;
}
.step5__back:hover { color: var(--text); }
.step5__submit {
  font-family: theme('fontFamily.mono'); font-size: 0.8125rem;
  letter-spacing: 0.06em; text-transform: uppercase;
  background: var(--text); color: var(--bg); border: 0;
  padding: 0.875rem 1.5rem; cursor: pointer; transition: opacity 150ms;
}
.step5__submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
