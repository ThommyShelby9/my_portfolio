<script setup lang="ts">
const { t, locale } = useI18n()
const _ = t

// "The Lab" — current stack + craft. Each pill is a tool I actually use.
const stack = computed(() => locale.value === 'en'
  ? {
      head: 'In the lab',
      sub: 'Tools currently on the bench',
      groups: [
        { label: 'Backend', items: ['Java · Spring Boot', 'Django · DRF', 'Node · NestJS', 'PostgreSQL', 'MongoDB', 'Redis', 'RabbitMQ'] },
        { label: 'Frontend', items: ['Vue 3', 'Nuxt', 'TypeScript', 'Tailwind', 'Three.js', 'GSAP'] },
        { label: 'Platform', items: ['Linux', 'Docker', 'Kubernetes', 'GitHub Actions', 'Cloudflare', 'OVH'] },
        { label: 'Discipline', items: ['Security audits', 'DevOps cadence', 'Selenium QA', 'Architecture review'] },
      ],
      currently: [
        { label: 'reading', value: 'A Philosophy of Software Design, J. Ousterhout' },
        { label: 'building', value: 'INTER-NAT · HIPEJUS — RH platforms (KPS Groupe)' },
        { label: 'studying', value: 'Distributed systems patterns · Rust ergonomics' },
        { label: 'available', value: 'Two missions Q3 2026 — early signal, please' },
      ],
    }
  : {
      head: 'À l\'atelier',
      sub: 'Ce qui est sur l\'établi en ce moment',
      groups: [
        { label: 'Backend', items: ['Java · Spring Boot', 'Django · DRF', 'Node · NestJS', 'PostgreSQL', 'MongoDB', 'Redis', 'RabbitMQ'] },
        { label: 'Frontend', items: ['Vue 3', 'Nuxt', 'TypeScript', 'Tailwind', 'Three.js', 'GSAP'] },
        { label: 'Plateforme', items: ['Linux', 'Docker', 'Kubernetes', 'GitHub Actions', 'Cloudflare', 'OVH'] },
        { label: 'Discipline', items: ['Audits sécurité', 'Cadence DevOps', 'QA Selenium', 'Revue d\'architecture'] },
      ],
      currently: [
        { label: 'lit', value: 'A Philosophy of Software Design, J. Ousterhout' },
        { label: 'construit', value: 'INTER-NAT · HIPEJUS — RH platforms (KPS Groupe)' },
        { label: 'étudie', value: 'Patterns distribués · Ergonomie Rust' },
        { label: 'dispo', value: 'Deux missions Q3 2026 — préviens-moi tôt' },
      ],
    },
)
</script>

<template>
  <section class="lab" aria-labelledby="lab-heading">
    <div class="lab__inner container-narrow">
      <RevealOnView class="lab__head">
        <p class="mono-tag">/ 04 — {{ locale === 'en' ? 'WORKSHOP' : 'ATELIER' }}</p>
        <h2 id="lab-heading" class="lab__title">
          {{ stack.head }}
          <em class="editorial">— {{ stack.sub }}</em>
        </h2>
      </RevealOnView>

      <div class="lab__grid">
        <div class="lab__stack">
          <RevealOnView
            v-for="(group, i) in stack.groups"
            :key="group.label"
            class="lab__group"
            :delay="i * 0.06"
          >
            <h3 class="lab__group-label">
              <span class="lab__group-num">0{{ i + 1 }}</span>
              <span>{{ group.label }}</span>
            </h3>
            <ul class="lab__pills">
              <li v-for="item in group.items" :key="item" class="lab__pill">
                <span>{{ item }}</span>
              </li>
            </ul>
          </RevealOnView>
        </div>

        <RevealOnView class="lab__currently" :delay="0.2">
          <h3 class="lab__currently-head">
            <span class="lab__currently-dot" />
            <span>{{ locale === 'en' ? 'Currently' : 'En ce moment' }}</span>
          </h3>
          <dl class="lab__currently-list">
            <template v-for="row in stack.currently" :key="row.label">
              <dt>{{ row.label }}</dt>
              <dd>{{ row.value }}</dd>
            </template>
          </dl>
        </RevealOnView>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lab {
  padding: 8rem 0;
  border-top: 1px solid var(--border);
  background:
    linear-gradient(180deg, var(--bg) 0%, var(--bg-paper) 100%);
  position: relative;
}

.lab__head {
  margin-bottom: 4rem;
}
.lab__title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: clamp(2.25rem, 4.5vw, 4rem);
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0.75rem 0 0;
}
.lab__title em {
  display: block;
  font-family: theme('fontFamily.editorial');
  font-style: italic;
  color: var(--text-mute);
  font-size: 0.62em;
  margin-top: 0.15em;
}

.lab__grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 4rem;
  align-items: start;
}
@media (max-width: 980px) {
  .lab__grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

.lab__stack {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.lab__group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lab__group-label {
  display: inline-flex;
  align-items: baseline;
  gap: 0.75rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0;
  font-weight: 500;
}
.lab__group-num {
  font-family: theme('fontFamily.editorial');
  font-style: italic;
  font-size: 1.5rem;
  color: var(--accent);
  letter-spacing: 0;
  text-transform: none;
}

.lab__pills {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.5rem;
}
.lab__pill {
  font-family: theme('fontFamily.mono');
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: var(--text);
  background: var(--bg-overlay);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  transition: border-color 200ms, background 200ms, transform 200ms;
}
.lab__pill:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  transform: translateY(-2px);
}

/* Currently column */
.lab__currently {
  border: 1px solid var(--border);
  background: var(--bg-overlay);
  padding: 1.75rem 1.5rem;
  border-radius: 4px;
  position: sticky;
  top: 90px;
}
.lab__currently-head {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text);
  margin: 0 0 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--border);
  width: 100%;
}
.lab__currently-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--accent);
  animation: lab-pulse 1.6s ease-in-out infinite;
}
@keyframes lab-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.lab__currently-list {
  margin: 0;
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 0.85rem 1rem;
}
.lab__currently-list dt {
  font-family: theme('fontFamily.mono');
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-soft);
  align-self: center;
}
.lab__currently-list dd {
  font-family: theme('fontFamily.body');
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--text);
  margin: 0;
}
</style>
