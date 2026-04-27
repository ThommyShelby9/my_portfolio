<script setup lang="ts">
const { locale } = useI18n()
const { state, errors, setField } = useBriefForm()

const deadlineOptions = computed(() => locale.value === 'en'
  ? [
      { value: '<1m', label: 'Under 1 month' },
      { value: '1-3m', label: '1 — 3 months' },
      { value: '3-6m', label: '3 — 6 months' },
      { value: 'flexible', label: 'Flexible' },
    ]
  : [
      { value: '<1m', label: '< 1 mois' },
      { value: '1-3m', label: '1 — 3 mois' },
      { value: '3-6m', label: '3 — 6 mois' },
      { value: 'flexible', label: 'Flexible' },
    ],
)

const budgetOptions = computed(() => locale.value === 'en'
  ? [
      { value: '<5k', label: '< 5k EUR', hint: 'Small spot mission' },
      { value: '5-15k', label: '5 — 15k EUR', hint: 'Module / short phase' },
      { value: '15-40k', label: '15 — 40k EUR', hint: 'Full project or revamp' },
      { value: '40-100k', label: '40 — 100k EUR', hint: 'Product or platform' },
      { value: '100k+', label: '100k+ EUR', hint: 'Long-term programme' },
      { value: 'undefined', label: 'Not yet defined', hint: 'Open to estimation' },
    ]
  : [
      { value: '<5k', label: '< 5k EUR', hint: 'petite mission ponctuelle' },
      { value: '5-15k', label: '5 — 15k EUR', hint: 'module / phase courte' },
      { value: '15-40k', label: '15 — 40k EUR', hint: 'projet complet ou refonte' },
      { value: '40-100k', label: '40 — 100k EUR', hint: 'produit ou plateforme' },
      { value: '100k+', label: '100k+ EUR', hint: 'programme long terme' },
      { value: 'undefined', label: 'Pas encore défini', hint: 'Ouvert à l\'estimation' },
    ],
)

const labels = computed(() => locale.value === 'en'
  ? {
      deadline: 'Wished delivery deadline',
      budget: 'Budget envisaged (EUR)',
      budgetHint: 'Indication, not a commitment. Used to check we are in the same reality.',
    }
  : {
      deadline: 'Échéance souhaitée pour livrer',
      budget: 'Budget envisagé (EUR)',
      budgetHint: 'Indication, pas un engagement. Sert à vérifier qu\'on est dans la même réalité.',
    })
</script>

<template>
  <section class="step">
    <BriefField :label="labels.deadline" required :error="errors.deadline">
      <BriefRadio
        :model-value="state.deadline"
        :options="(deadlineOptions as any)"
        name="deadline"
        @update:model-value="(v: any) => setField('deadline', v)"
      />
    </BriefField>

    <BriefField :label="labels.budget" required :error="errors.budget" :hint="labels.budgetHint">
      <BriefRadio
        :model-value="state.budget"
        :options="(budgetOptions as any)"
        name="budget"
        @update:model-value="(v: any) => setField('budget', v)"
      />
    </BriefField>
  </section>
</template>
