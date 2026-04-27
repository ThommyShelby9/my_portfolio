<script setup lang="ts">
const { locale } = useI18n()
const { state, errors, setField } = useBriefForm()

const projectOptions = computed(() => locale.value === 'en'
  ? [
      { value: 'new', label: 'Build a product from scratch' },
      { value: 'revamp', label: 'Improve / revamp an existing product' },
      { value: 'audit', label: 'Technical audit / second opinion' },
      { value: 'spot', label: 'Spot mission (integration, migration, perf)' },
      { value: 'unsure', label: 'Not sure yet — I want to discuss' },
    ]
  : [
      { value: 'new', label: 'Construire un produit depuis zéro' },
      { value: 'revamp', label: 'Améliorer / refondre un produit existant' },
      { value: 'audit', label: 'Audit technique / second avis architecture' },
      { value: 'spot', label: 'Mission ponctuelle (intégration, migration, perf)' },
      { value: 'unsure', label: 'Je ne sais pas encore — je veux discuter' },
    ],
)

const labels = computed(() => locale.value === 'en'
  ? {
      needsTitle: 'What does your project need?',
      pitchTitle: 'In one sentence, what is it?',
      pitchPlaceholder: 'A B2B payment platform for African SMEs',
    }
  : {
      needsTitle: 'De quoi a besoin ton projet ?',
      pitchTitle: 'En une phrase, c\'est quoi ?',
      pitchPlaceholder: 'Une plateforme de paiement B2B pour des PME africaines',
    })
</script>

<template>
  <section class="step">
    <BriefField :label="labels.needsTitle" required :error="errors.projectType">
      <BriefRadio
        :model-value="state.projectType"
        :options="(projectOptions as any)"
        name="projectType"
        @update:model-value="(v: any) => setField('projectType', v)"
      />
    </BriefField>

    <BriefField :label="labels.pitchTitle" required :error="errors.pitch">
      <textarea
        :value="state.pitch"
        :placeholder="labels.pitchPlaceholder"
        class="step__textarea"
        rows="3"
        maxlength="500"
        @input="(e) => setField('pitch', (e.target as HTMLTextAreaElement).value)"
      />
      <p class="step__counter">{{ state.pitch.length }} / 500</p>
    </BriefField>
  </section>
</template>

<style scoped>
.step__textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-overlay);
  color: var(--text);
  padding: 0.875rem 1rem;
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  border-radius: 4px;
  transition: border-color 150ms;
}

.step__textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.step__counter {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  margin: 0.5rem 0 0;
  text-align: right;
  letter-spacing: 0.04em;
}
</style>
