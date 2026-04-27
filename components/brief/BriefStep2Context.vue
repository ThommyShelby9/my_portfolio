<script setup lang="ts">
const { locale } = useI18n()
const { state, errors, setField } = useBriefForm()

const stateOptions = computed(() => locale.value === 'en'
  ? [
      { value: 'idea', label: 'Idea / paper spec' },
      { value: 'design', label: 'Mockup / design' },
      { value: 'inProgressBlocked', label: 'Code in progress, blocked' },
      { value: 'mvpInProd', label: 'MVP in prod, to scale' },
      { value: 'existingRevamp', label: 'Existing to revamp' },
      { value: 'auditOnly', label: 'No product, audit only' },
    ]
  : [
      { value: 'idea', label: 'Idée / spec papier' },
      { value: 'design', label: 'Maquette / design' },
      { value: 'inProgressBlocked', label: 'Code en cours mais bloqué' },
      { value: 'mvpInProd', label: 'MVP en prod, à scaler' },
      { value: 'existingRevamp', label: 'Existant à refondre' },
      { value: 'auditOnly', label: 'Pas de produit, audit pur' },
    ],
)

const teamOptions = computed(() => [
  { value: 'solo', label: 'Solo' },
  { value: '2-5', label: '2 — 5' },
  { value: '6-15', label: '6 — 15' },
  { value: '15+', label: '15+' },
])

const labels = computed(() => locale.value === 'en'
  ? {
      state: 'Where is it today?',
      team: 'Who is on the client side?',
      resources: 'Available resources',
      techTeam: 'A tech team already exists',
      designer: 'Designer available',
      po: 'Product Owner available',
      notes: 'Anything important to know? (optional)',
      notesHint: 'NDA, launch deadline, the previous dev disappeared, etc.',
    }
  : {
      state: 'Où en est-il aujourd\'hui ?',
      team: 'Qui est dans l\'équipe côté client ?',
      resources: 'Ressources disponibles',
      techTeam: 'Une équipe tech existe déjà',
      designer: 'Designer dispo',
      po: 'Product Owner dispo',
      notes: 'Quelque chose d\'important à savoir ? (optionnel)',
      notesHint: 'NDA strict, lancement prévu en juin, le précédent dev a disparu, etc.',
    })
</script>

<template>
  <section class="step">
    <BriefField :label="labels.state" required :error="errors.currentState">
      <BriefRadio
        :model-value="state.currentState"
        :options="(stateOptions as any)"
        name="currentState"
        @update:model-value="(v: any) => setField('currentState', v)"
      />
    </BriefField>

    <BriefField :label="labels.team" required :error="errors.teamSize">
      <BriefRadio
        :model-value="state.teamSize"
        :options="(teamOptions as any)"
        name="teamSize"
        @update:model-value="(v: any) => setField('teamSize', v)"
      />
    </BriefField>

    <BriefField :label="labels.resources">
      <div class="step__checks">
        <BriefCheckbox
          :model-value="state.hasTechTeam"
          :label="labels.techTeam"
          @update:model-value="(v: boolean) => setField('hasTechTeam', v)"
        />
        <BriefCheckbox
          :model-value="state.hasDesigner"
          :label="labels.designer"
          @update:model-value="(v: boolean) => setField('hasDesigner', v)"
        />
        <BriefCheckbox
          :model-value="state.hasProductOwner"
          :label="labels.po"
          @update:model-value="(v: boolean) => setField('hasProductOwner', v)"
        />
      </div>
    </BriefField>

    <BriefField :label="labels.notes" :hint="labels.notesHint">
      <textarea
        :value="state.notes ?? ''"
        class="step__textarea"
        rows="3"
        @input="(e) => setField('notes', ((e.target as HTMLTextAreaElement).value || null))"
      />
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

.step__checks {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
