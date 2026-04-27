<script setup lang="ts">
const { locale } = useI18n()
const { state, errors, setField, turnstileToken } = useBriefForm()

const labels = computed(() => locale.value === 'en'
  ? {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      company: 'Company (optional)',
      website: 'Website (optional)',
      source: 'How did you find this site? (optional)',
      prefersCall: 'I prefer a call first (Calendly opens after submit)',
      sourceOptions: ['', 'Google', 'LinkedIn', 'Referral', 'Other'],
    }
  : {
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      company: 'Entreprise (optionnel)',
      website: 'Site web (optionnel)',
      source: 'Comment as-tu trouvé ce site ? (optionnel)',
      prefersCall: 'Je préfère un appel d\'abord (Calendly s\'ouvre après envoi)',
      sourceOptions: ['', 'Google', 'LinkedIn', 'Recommandation', 'Autre'],
    })

function onTurnstileToken(token: string) {
  turnstileToken.value = token
}
</script>

<template>
  <section class="step">
    <div class="step__row">
      <BriefField :label="labels.firstName" for="firstName" required :error="errors.firstName">
        <input
          id="firstName"
          type="text"
          autocomplete="given-name"
          class="step__input"
          :value="state.firstName"
          @input="(e) => setField('firstName', (e.target as HTMLInputElement).value)"
        >
      </BriefField>

      <BriefField :label="labels.lastName" for="lastName" required :error="errors.lastName">
        <input
          id="lastName"
          type="text"
          autocomplete="family-name"
          class="step__input"
          :value="state.lastName"
          @input="(e) => setField('lastName', (e.target as HTMLInputElement).value)"
        >
      </BriefField>
    </div>

    <BriefField :label="labels.email" for="email" required :error="errors.email">
      <input
        id="email"
        type="email"
        autocomplete="email"
        class="step__input"
        :value="state.email"
        @input="(e) => setField('email', (e.target as HTMLInputElement).value)"
      >
    </BriefField>

    <div class="step__row">
      <BriefField :label="labels.company" for="company">
        <input
          id="company"
          type="text"
          autocomplete="organization"
          class="step__input"
          :value="state.company ?? ''"
          @input="(e) => setField('company', ((e.target as HTMLInputElement).value || null))"
        >
      </BriefField>

      <BriefField :label="labels.website" for="website" :error="errors.website">
        <input
          id="website"
          type="url"
          autocomplete="url"
          class="step__input"
          placeholder="https://"
          :value="state.website ?? ''"
          @input="(e) => setField('website', ((e.target as HTMLInputElement).value || null))"
        >
      </BriefField>
    </div>

    <BriefField :label="labels.source" for="source">
      <select
        id="source"
        class="step__input"
        :value="state.source ?? ''"
        @change="(e) => setField('source', ((e.target as HTMLSelectElement).value || null))"
      >
        <option v-for="o in labels.sourceOptions" :key="o" :value="o">
          {{ o }}
        </option>
      </select>
    </BriefField>

    <BriefField label="">
      <BriefCheckbox
        :model-value="state.prefersCall"
        :label="labels.prefersCall"
        @update:model-value="(v: boolean) => setField('prefersCall', v)"
      />
    </BriefField>

    <BriefTurnstile @token="onTurnstileToken" />
  </section>
</template>

<style scoped>
.step__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .step__row { grid-template-columns: 1fr; }
}

.step__input {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-overlay);
  color: var(--text);
  padding: 0.75rem 1rem;
  font-family: theme('fontFamily.body');
  font-size: 1rem;
  line-height: 1.4;
  border-radius: 4px;
  transition: border-color 150ms;
}

.step__input:focus {
  outline: none;
  border-color: var(--accent);
}
</style>
