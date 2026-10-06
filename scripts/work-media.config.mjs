// Ordered image sources per slug. The first entry is the cover.
// from: 'git:<ref>:<path>' | 'file:<path>' | 'gh:<owner/repo>:<path>' | 'url:<https://...>'
// crop: px removed from each side. kind: 'public' (live/public visual) | 'interior' (internal or mock data).
// redact: rectangles {left,top,width,height} in pixels of the cropped source, erased and filled from their
//   surroundings (removes client marketing figures we must not republish). Write them with `at()`.
// url sources also accept: height (viewport, default 900), optional, waitMs, scrollY, prepare(page).
const v5 = (f) => `git:v5-manifesto:public/images/${f}`
const cq = (f) => `file:.superpowers/assets/contractiq/${f}`
const zl = (f) => `file:.superpowers/assets/zenlife/${f}`
const mc = (f) => `gh:ThommyShelby9/moncarnet:public/decouvrir/${f}`

// Rectangles read on the 1600 px wide output, converted to source pixels: at(scale, [left, top, width, height], ...).
const at = (scale, ...rects) =>
  rects.map(([left, top, width, height]) => ({ left: Math.round(left * scale), top: Math.round(top * scale), width: Math.round(width * scale), height: Math.round(height * scale) }))
const V5 = 1860 / 1600 // v5 captures are ~1864 px wide, ~1860 after the 4 px right crop

const site = (url, file, fr, en, redact, liveRedact, liveCrop) => [
  { from: v5(file), crop: { right: 4 }, redact, kind: 'public', alt: { fr, en } },
  { from: `url:${url}`, crop: liveCrop, redact: liveRedact, optional: true, kind: 'public', alt: { fr: 'Page d’accueil en ligne', en: 'Live home page' } },
]

// The login page shows a stale "session expired" notice on a fresh visit: hide it.
const hideSessionNotice = (page) =>
  page.evaluate(() => {
    for (const el of document.querySelectorAll('div')) {
      if (el.children.length < 4 && /session a expiré/.test(el.textContent ?? '') && (el.textContent ?? '').length < 200) el.style.display = 'none'
    }
  })

// Bénin Bouge map: hide the sticky header so it does not cut the heading, then highlight Borgou.
const hoverBorgou = async (page) => {
  await page.addStyleTag({ content: 'header, nav { visibility: hidden !important }' })
  await page.locator('svg path[aria-label="Borgou"]').hover({ force: true, timeout: 8000 })
  await page.waitForTimeout(1200)
}

export const sources = {
  ubbfy: [
    { from: v5('ubbfy.png'), crop: { right: 4 }, kind: 'interior', alt: { fr: 'Tableau de bord de la plateforme Ubbfy', en: 'Ubbfy platform dashboard' } },
    { from: 'url:https://app.ubbfy.com', prepare: hideSessionNotice, optional: true, kind: 'public', alt: { fr: 'Page de connexion d’Ubbfy', en: 'Ubbfy sign-in page' } },
  ],
  contractiq: [
    { from: cq('02b-contract-detail-risks.png'), kind: 'interior', alt: { fr: 'Fiche contrat avec les risques détectés par l’IA', en: 'Contract detail with AI-detected risks' } },
    { from: cq('01-command-center.png'), kind: 'interior', alt: { fr: 'Centre de commande des contrats', en: 'Contract command center' } },
    { from: cq('02-contract-detail-ai.png'), kind: 'interior', alt: { fr: 'Analyse IA d’un contrat', en: 'AI analysis of a contract' } },
    { from: cq('03-health-score.png'), kind: 'interior', alt: { fr: 'Score de santé du portefeuille de contrats', en: 'Contract portfolio health score' } },
    { from: cq('04b-at-risk-list.png'), kind: 'interior', alt: { fr: 'Liste des contrats à risque', en: 'List of at-risk contracts' } },
    { from: cq('05-invoice-extracted-fields.png'), kind: 'interior', alt: { fr: 'Champs extraits automatiquement d’une facture', en: 'Fields automatically extracted from an invoice' } },
    { from: cq('06-ghost-subscriptions.png'), kind: 'interior', alt: { fr: 'Détection des abonnements fantômes', en: 'Ghost subscription detection' } },
    { from: cq('07-public-signature-page.png'), kind: 'public', alt: { fr: 'Page publique de signature', en: 'Public signature page' } },
  ],
  zenlife: [
    { from: zl('desktop-dash.png'), kind: 'interior', alt: { fr: 'Résumé financier de ZenLife sur ordinateur', en: 'ZenLife finance summary on desktop' } },
    { from: zl('tableau-de-bord-dark.png'), crop: { bottom: 598 }, kind: 'interior', alt: { fr: 'Tableau de bord ZenLife en thème sombre', en: 'ZenLife dashboard, dark theme' } },
    { from: zl('finances-resume-dark.png'), kind: 'interior', alt: { fr: 'Résumé des finances dans ZenLife, thème sombre', en: 'ZenLife finance summary, dark theme' } },
    { from: zl('planificateur-jour-dark.png'), kind: 'interior', alt: { fr: 'Planificateur de la journée dans ZenLife', en: 'ZenLife daily planner' } },
    { from: zl('pensees-positives-dark.png'), kind: 'interior', alt: { fr: 'Pensées positives dans ZenLife', en: 'Positive thoughts in ZenLife' } },
    { from: zl('mobile-dash.png'), kind: 'interior', alt: { fr: 'Suivi d’hydratation de ZenLife sur mobile', en: 'ZenLife hydration tracking on mobile' } },
  ],
  tadagberhplus: site('https://tadagberhplus.com', 'tadagberhplus.png', 'Site vitrine d’un cabinet de conseil RH, Bénin', 'Showcase site of an HR consulting firm, Benin'),
  ccns: [
    { from: v5('ccns.png'), crop: { top: 120, right: 20 }, kind: 'public', alt: { fr: 'Site de la CCNS', en: 'CCNS website' } },
    { from: 'url:https://ccnsbenin.vercel.app', optional: true, kind: 'public', alt: { fr: 'Page d’accueil en ligne', en: 'Live home page' } },
  ],
  leconsultant: [
    { from: v5('leconsultant.png'), crop: { right: 4 }, redact: at(V5, [255, 483, 400, 58]), kind: 'public', alt: { fr: 'Site Le Consultant', en: 'Le Consultant website' } },
  ], // live capture dropped: invalid TLS certificate
  easytowork: [
    {
      from: v5('easytowork.png'),
      crop: { right: 4, bottom: 519 }, // stop above the 100+ / 150+ / 500+ / 98% band (keeps the top 420 output px)
      kind: 'public',
      alt: { fr: 'Site Easy To Work', en: 'Easy To Work website' },
    },
    // The live page repeats the figures below the fold: keep only the top 828 px of the 1000 px capture.
    { from: 'url:https://easytowork.fr', crop: { bottom: 310 }, optional: true, kind: 'public', alt: { fr: 'Page d’accueil en ligne', en: 'Live home page' } },
  ],
  planus: [
    { from: v5('planus.png'), crop: { right: 4 }, kind: 'public', alt: { fr: 'Site Planus Analytics', en: 'Planus Analytics website' } },
  ], // live capture dropped: cookie banner covers content
  whatspay: site('https://whatspay.africa', 'whatspay.png', 'Site WhatsPay', 'WhatsPay website', at(V5, [268, 156, 280, 44], [1097, 241, 135, 20], [1110, 430, 46, 11], [1182, 430, 40, 11], [1199, 503, 28, 12]), at(1.8, [596, 498, 428, 50])), // "+1 000 diffuseurs actifs" pill; phone mock: name, gains, completion rate, mission amount; live: "12 000 personnes" in the advertiser card
  // "+10 pays d’intervention" badge over the hero photo; live: same badge, and the empty lower part of the page is cropped (1800 px capture, keep the top 690 of 1000 output px).
  upgrade: site('https://upgrade-afrique.com', 'upgrade.png', 'Site Upgrade Afrique', 'Upgrade Afrique website', at(1, [592, 526, 148, 86]), at(1.8, [800, 532, 172, 96]), { bottom: 558 }),
  freelanceclub: [
    {
      from: v5('freelanceclub.png'),
      crop: { right: 4 },
      redact: at(V5, [156, 227, 188, 42], [154, 626, 634, 96]), // "+1000 freelances actifs" pill and the 1000+ / 500+ / 98% cards
      kind: 'public', alt: { fr: 'Site Freelance Club', en: 'Freelance Club website' } },
  ], // live capture dropped: broken hero wrapping at 1440
  bilalsekou: [
    { from: v5('bilal_portfolio.png'), crop: { right: 4 }, kind: 'public', alt: { fr: 'Portfolio de Bilal Sékou', en: 'Bilal Sékou’s portfolio' } },
  ],
  mariette: [
    { from: v5('portfolio_mariette.png'), crop: { right: 4 }, kind: 'public', alt: { fr: 'Portfolio de Mariette', en: 'Mariette’s portfolio' } },
  ],
  moncarnet: [
    { from: 'url:https://moncarnet.kheios.com', kind: 'public', alt: { fr: 'Page d’accueil de MonCarnet', en: 'MonCarnet home page' } },
    { from: mc('adjoa-alerte.webp'), kind: 'interior', alt: { fr: 'Tableau de bord soignant avec alerte, données fictives', en: 'Caregiver dashboard with an alert, fictional data' } },
    { from: mc('awa-accueil.webp'), kind: 'interior', alt: { fr: 'Accueil mobile d’une femme enceinte, données fictives', en: 'Mobile home of an expecting mother, fictional data' } },
    { from: mc('codjo-carnet.webp'), kind: 'interior', alt: { fr: 'Carnet de vaccination et tension sur mobile, données fictives', en: 'Vaccination and blood pressure record on mobile, fictional data' } },
    { from: mc('pilotage-ministere.webp'), kind: 'interior', alt: { fr: 'Vue de pilotage nationale, données fictives', en: 'National oversight view, fictional data' } },
  ],
  // No clean public visuals: typographic case studies, no images.
  kaba: [],
  orinsu: [],
  'it-opportunities-tracker': [],
  // Explorations (unsolicited redesign proposals)
  lecentre: [
    { from: 'url:https://lecentre.kheios.com', kind: 'public', alt: { fr: 'Page d’accueil de la proposition Le Centre', en: 'Le Centre proposal home page' } },
    { from: 'url:https://lecentre.kheios.com/#/collection', waitMs: 4000, optional: true, kind: 'public', alt: { fr: 'Page collection de la proposition Le Centre', en: 'Collection page of the Le Centre proposal' } },
  ],
  // procom.agency is a parked GoDaddy page: captured from the local project (port 5303).
  // Stat-heavy sections and the Bénin Bouge section are skipped (no metrics reused).
  procom: [
    { from: 'url:http://localhost:5303/', waitMs: 8000, kind: 'public', alt: { fr: 'Accueil de la proposition Procom, le flux d’influence', en: 'Procom proposal home, the influence flow' } },
    { from: 'url:http://localhost:5303/', waitMs: 8000, scrollY: 2700, kind: 'public', alt: { fr: 'Section « Sept forces, un seul flux »', en: 'Section “Seven forces, one flow”' } },
    { from: 'url:http://localhost:5303/', waitMs: 8000, scrollY: 6100, kind: 'public', alt: { fr: 'Section méthode : stratégie, narration, propagation, mesure', en: 'Method section: strategy, narrative, propagation, measurement' } },
  ],
  // Local dev servers (ports 5301 / 5302). The Bénin Bouge home hero and the
  // stock map are never captured: scroll past them.
  beninbouge: [
    { from: 'url:http://localhost:5301/article/2', waitMs: 12000, kind: 'public', alt: { fr: 'Page d’article de la proposition Bénin Bouge', en: 'Article page of the Bénin Bouge proposal' } },
    { from: 'url:http://localhost:5301/', waitMs: 12000, scrollY: 1900, kind: 'public', alt: { fr: 'Grille d’actualités de la page d’accueil', en: 'News grid on the home page' } },
    { from: 'url:http://localhost:5301/', waitMs: 12000, scrollY: 3580, height: 1300, crop: { bottom: 260 }, prepare: hoverBorgou, kind: 'public', alt: { fr: 'Carte interactive des départements du Bénin, Borgou en surbrillance', en: 'Interactive map of Benin departments, Borgou highlighted' } },
  ],
  najaexperts: [
    // crop.top 70 (35 CSS px at 2x) removes the demo banner, which carries an em dash.
    { from: 'url:http://localhost:5302/a', waitMs: 4000, crop: { top: 70 }, kind: 'public', alt: { fr: 'Proposition A, page d’accueil', en: 'Proposal A, home page' } },
    { from: 'url:http://localhost:5302/b', waitMs: 4000, crop: { top: 70 }, kind: 'public', alt: { fr: 'Proposition B, page d’accueil', en: 'Proposal B, home page' } },
    { from: 'url:http://localhost:5302/c', waitMs: 4000, crop: { top: 70 }, kind: 'public', alt: { fr: 'Proposition C, page d’accueil', en: 'Proposal C, home page' } },
  ],
}
