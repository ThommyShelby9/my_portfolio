<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

useSeoMeta({
  title: () => locale.value === 'en' ? 'Terminal — Rostel Panoumassi' : 'Terminal — Rostel Panoumassi',
  robots: 'noindex, nofollow',
})

// Disable the custom cursor + grain on this page so it actually feels like a terminal.
useHead({
  htmlAttrs: { 'data-terminal': 'true' },
})

type Line = { kind: 'in' | 'out' | 'sys'; text: string }

const banner = computed(() => locale.value === 'en'
  ? [
      'rostel@cotonou:~$ welcome',
      '',
      ' ____           _       _',
      '|  _ \\ ___  ___| |_ ___| |',
      '| |_) / _ \\/ __| __/ _ \\ |',
      '|  _ <  __/\\__ \\ ||  __/ |',
      '|_| \\_\\___||___/\\__\\___|_|',
      '',
      'You found the easter egg. Type "help" to see what I can do.',
      'Press Esc or type "exit" to leave the terminal.',
      '',
    ]
  : [
      'rostel@cotonou:~$ bienvenue',
      '',
      ' ____           _       _',
      '|  _ \\ ___  ___| |_ ___| |',
      '| |_) / _ \\/ __| __/ _ \\ |',
      '|  _ <  __/\\__ \\ ||  __/ |',
      '|_| \\_\\___||___/\\__\\___|_|',
      '',
      'Tu as trouvé l\'easter egg. Tape "help" pour voir ce que je peux faire.',
      'Touche Échap ou tape "exit" pour quitter.',
      '',
    ],
)

const helpLines = computed(() => locale.value === 'en'
  ? [
      'Available commands:',
      '  help          — show this list',
      '  whoami        — short bio',
      '  work          — list case studies',
      '  contact       — how to reach me',
      '  stack         — what I work with',
      '  available     — current availability',
      '  open <name>   — open a page (work, about, contact, brief)',
      '  date          — current Cotonou time',
      '  clear         — clear the screen',
      '  exit          — leave the terminal',
      '',
    ]
  : [
      'Commandes disponibles :',
      '  help          — afficher cette liste',
      '  whoami        — bio courte',
      '  work          — lister les case studies',
      '  contact       — comment me joindre',
      '  stack         — ce avec quoi je travaille',
      '  available     — disponibilité actuelle',
      '  open <name>   — ouvrir une page (work, about, contact, brief)',
      '  date          — heure actuelle à Cotonou',
      '  clear         — vider l\'écran',
      '  exit          — quitter le terminal',
      '',
    ],
)

const lines = ref<Line[]>([])
const input = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const screen = ref<HTMLElement | null>(null)
const history: string[] = []
let historyIdx = -1

function push(kind: Line['kind'], text: string | string[]) {
  const arr = Array.isArray(text) ? text : [text]
  for (const t of arr) lines.value.push({ kind, text: t })
}

function clear() {
  lines.value = []
}

function bootBanner() {
  push('sys', banner.value)
}

function scrollBottom() {
  nextTick(() => {
    if (screen.value) screen.value.scrollTop = screen.value.scrollHeight
  })
}

function exec(raw: string) {
  const trimmed = raw.trim()
  push('in', `rostel@cotonou:~$ ${trimmed}`)
  if (!trimmed) { scrollBottom(); return }
  history.push(trimmed)
  historyIdx = history.length

  const [cmd, ...args] = trimmed.split(/\s+/)
  const out = (text: string | string[]) => push('out', text)

  switch (cmd.toLowerCase()) {
    case 'help':
      out(helpLines.value)
      break

    case 'whoami':
      out(locale.value === 'en'
        ? [
            'Rostel Panoumassi — Head of Engineering & Innovation at KPS Groupe.',
            'Based in Cotonou, Benin. Works mostly on critical systems for',
            'fintech, HR, B2B and healthcare. 11 case studies shipped since 2021.',
            '',
          ]
        : [
            'Rostel Panoumassi — Lead Engineering & Innovation chez KPS Groupe.',
            'Basé à Cotonou, Bénin. Spécialiste des systèmes critiques pour la',
            'fintech, les RH, le B2B et la santé. 11 case studies livrés depuis 2021.',
            '',
          ])
      break

    case 'work':
      out([
        '01  freelanceclub      — SaaS portage salarial · Node + Mongo + Stripe',
        '02  ubbfy              — ERP suite + Flutter pointage · Django + Vue',
        '03  tadagberhplus      — SIRH 100+ entreprises · Django + MySQL',
        '04  ccns               — Site institutionnel santé · Vue + Strapi',
        '05  whatspay           — Marketing WhatsApp · Laravel + RabbitMQ',
        '06  leconsultant       — Appels d\'offres B2B · Laravel + Livewire',
        '07  bilalsekou         — Portfolio + e-book · Nuxt + Kkiapay',
        '08  easytowork         — Multi-marques KPS · Laravel + Vue',
        '09  zenlife            — Side project bien-être · Laravel + Vue',
        '10  planus             — Cabinet IT corporate · Vue + Bootstrap',
        '11  mariette           — Blog + portfolio · Next.js + Tiptap',
        '',
        locale.value === 'en' ? 'Type "open work" to browse them all.' : 'Tape "open work" pour les explorer.',
        '',
      ])
      break

    case 'contact':
      out([
        '  email     rmissimawu@gmail.com',
        '  linkedin  linkedin.com/in/rostelpanoumassi-6b6608335',
        '  github    github.com/ThommyShelby9',
        '  location  Cotonou, Benin · UTC+1',
        '',
      ])
      break

    case 'stack':
      out([
        '  backend     Django · Spring Boot · Laravel · Node/Express',
        '  frontend    Vue 3 · Nuxt · React (when needed)',
        '  mobile      Flutter · PWA',
        '  data        PostgreSQL · MySQL · MongoDB · Redis',
        '  infra       Docker · Kubernetes · Coolify · Cloudflare',
        '  async       RabbitMQ · Celery · Bull',
        '  tooling     pytest · Pest · Vitest · Playwright · Sentry',
        '',
      ])
      break

    case 'available':
      out(locale.value === 'en'
        ? ['● AVAILABLE Q3 2026 — 2 engagements / quarter max.', 'Free scoping. First delivery under 14 days.', '']
        : ['● DISPO Q3 2026 — 2 missions / trimestre max.', 'Cadrage gratuit. Premier livrable sous 14 jours.', ''])
      break

    case 'date':
      out([new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Africa/Porto-Novo', hour12: false,
      }).format(new Date()) + ' (Cotonou · UTC+1)', ''])
      break

    case 'open': {
      const target = (args[0] || '').toLowerCase()
      const map: Record<string, string> = {
        work: '/work', about: '/about', contact: '/contact', brief: '/brief', home: '/',
      }
      if (map[target]) {
        out(locale.value === 'en' ? `→ opening ${target}...` : `→ ouverture de ${target}...`)
        setTimeout(() => router.push(localePath(map[target])), 320)
      }
      else {
        out(locale.value === 'en' ? `unknown page: "${target}". Try: work, about, contact, brief.` : `page inconnue : "${target}". Essaie : work, about, contact, brief.`)
        out('')
      }
      break
    }

    case 'clear':
    case 'cls':
      clear()
      break

    case 'exit':
    case 'quit':
      out(locale.value === 'en' ? 'bye —' : 'à plus —')
      setTimeout(() => router.push(localePath('/')), 280)
      break

    case 'sudo':
      out([locale.value === 'en' ? 'nice try.' : 'bien tenté.', ''])
      break

    case 'ls':
      out(['about.md  contact.md  work/  brief/  cv.pdf', ''])
      break

    case 'cat':
      if (args[0] === 'cv.pdf') {
        out(locale.value === 'en' ? '→ /cv.pdf is a binary file, opening...' : '→ /cv.pdf est un fichier binaire, ouverture...')
        setTimeout(() => { window.open('/cv.pdf', '_blank'); push('out', '') }, 200)
      }
      else {
        out(locale.value === 'en' ? `cat: ${args[0] || 'missing'}: no such file` : `cat: ${args[0] || 'manquant'}: fichier introuvable`)
        out('')
      }
      break

    default:
      out(locale.value === 'en'
        ? [`command not found: ${cmd}. Type "help".`, '']
        : [`commande inconnue : ${cmd}. Tape "help".`, ''])
  }
  scrollBottom()
}

function onSubmit() {
  exec(input.value)
  input.value = ''
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') { exec('exit'); e.preventDefault(); return }
  if (e.key === 'ArrowUp') {
    if (history.length === 0) return
    historyIdx = Math.max(0, historyIdx - 1)
    input.value = history[historyIdx] || ''
    e.preventDefault()
  }
  else if (e.key === 'ArrowDown') {
    if (history.length === 0) return
    historyIdx = Math.min(history.length, historyIdx + 1)
    input.value = history[historyIdx] || ''
    e.preventDefault()
  }
  else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
    clear()
    e.preventDefault()
  }
}

function focusInput() {
  inputEl.value?.focus()
}

onMounted(() => {
  bootBanner()
  scrollBottom()
  setTimeout(focusInput, 60)
})
</script>

<template>
  <div class="term" @click="focusInput">
    <div class="term__bar" aria-hidden="true">
      <span class="term__dot term__dot--red" />
      <span class="term__dot term__dot--yellow" />
      <span class="term__dot term__dot--green" />
      <span class="term__bar-title">rostel@cotonou — bash — 80×24</span>
    </div>

    <div ref="screen" class="term__screen">
      <pre v-for="(l, i) in lines" :key="i" :class="['term__line', `term__line--${l.kind}`]">{{ l.text }}</pre>

      <form class="term__prompt" @submit.prevent="onSubmit">
        <span class="term__user">rostel@cotonou</span><span class="term__colon">:</span><span class="term__path">~</span><span class="term__dollar">$&nbsp;</span>
        <input
          ref="inputEl"
          v-model="input"
          class="term__input"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :placeholder="locale === 'en' ? 'type a command — try help' : 'tape une commande — essaie help'"
          @keydown="onKeyDown"
        >
        <span class="term__caret" aria-hidden="true" />
      </form>
    </div>
  </div>
</template>

<style scoped>
.term {
  position: relative;
  background: #0a0a0c;
  color: #d8d6cc;
  min-height: calc(100dvh - 64px);
  margin: 1.5rem auto 3rem;
  max-width: 960px;
  border: 1px solid #2a2a2e;
  border-radius: 8px;
  overflow: hidden;
  font-family: theme('fontFamily.mono');
  box-shadow:
    0 30px 80px -30px rgba(0, 0, 0, 0.6),
    0 1px 0 rgba(255, 255, 255, 0.04) inset;
}

.term__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 28px;
  padding: 0 0.9rem;
  background: #1b1815;
  border-bottom: 1px solid #2a2a2e;
}
.term__dot {
  width: 11px; height: 11px; border-radius: 50%;
  display: inline-block;
}
.term__dot--red { background: #ff5f57; }
.term__dot--yellow { background: #febc2e; }
.term__dot--green { background: #28c840; }
.term__bar-title {
  flex: 1;
  text-align: center;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: #6f6a5e;
}

.term__screen {
  padding: 1.25rem 1.4rem 1.4rem;
  min-height: calc(100dvh - 64px - 28px - 4rem);
  max-height: calc(100dvh - 64px - 28px);
  overflow-y: auto;
  font-size: 0.875rem;
  line-height: 1.55;
}

.term__line {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}
.term__line--in { color: #ede4d3; }
.term__line--out { color: #b4a98f; }
.term__line--sys { color: #6ba8b8; }

.term__prompt {
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 0.25rem;
}
.term__user { color: #7bb872; }
.term__colon { color: #6f6a5e; padding: 0 1px; }
.term__path { color: #6ba8b8; }
.term__dollar { color: #6f6a5e; }
.term__input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: #ede4d3;
  font-family: inherit;
  font-size: inherit;
  caret-color: #ff5728;
  padding: 0;
}
.term__input::placeholder { color: #4a4738; }
.term__caret {
  display: inline-block;
  width: 8px;
  height: 1em;
  margin-left: 2px;
  background: #ff5728;
  animation: term-blink 1s steps(1) infinite;
}
@keyframes term-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Scrollbar */
.term__screen::-webkit-scrollbar { width: 8px; }
.term__screen::-webkit-scrollbar-thumb { background: #2a2a2e; border-radius: 4px; }
.term__screen::-webkit-scrollbar-thumb:hover { background: #3a3a3e; }
.term__screen::-webkit-scrollbar-track { background: transparent; }

/* Hide global custom cursor on this page */
html[data-terminal='true'] body { cursor: text; }
</style>
