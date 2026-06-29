<script setup lang="ts">
const { t, locale } = useI18n()
const _ = t

useSeoMeta({
  title: () => locale.value === 'en' ? 'Privacy policy — Rostel Panoumassi' : 'Confidentialité — Rostel Panoumassi',
  robots: 'index, follow',
})

const heroProps = computed(() => locale.value === 'en'
  ? { num: '07', kicker: 'Privacy · Data · No surprises', title: 'Privacy', emphasis: 'policy.' }
  : { num: '07', kicker: 'Confidentialité · Données · Sans surprise', title: 'Politique', emphasis: 'de confidentialité.' },
)
</script>

<template>
  <article class="privacy">
    <PageHero v-bind="heroProps" />

    <section class="privacy__body container-narrow">
      <div v-if="locale === 'en'" class="privacy__content">
        <h2>Quick version</h2>
        <p>
          This site collects <strong>only what you send through the brief or the contact form</strong>, and nothing else. No third-party trackers, no ads, no cross-site identifiers. Analytics is privacy-friendly (Umami, self-hosted) and IP-anonymised.
        </p>

        <h2>What I collect</h2>
        <ul>
          <li><strong>Brief form</strong>: the fields you fill in (project type, scope, budget range, contact email). Stored locally in your browser as a draft until you submit.</li>
          <li><strong>Contact form</strong>: email address and message.</li>
          <li><strong>Analytics</strong>: anonymous page views, referrer, country (from IP, then IP discarded), device type. No cookies. No personal identifier.</li>
        </ul>

        <h2>Why</h2>
        <ul>
          <li>To reply to your message and prepare the engagement.</li>
          <li>To understand which case studies are read most and improve the content.</li>
        </ul>

        <h2>Where it lives</h2>
        <ul>
          <li>Form submissions: stored in a MongoDB instance hosted in Europe, plus a backup copy in Google Drive (encrypted at rest).</li>
          <li>Email notifications: sent through Gmail SMTP.</li>
          <li>Analytics: Umami self-hosted, retention 12 months.</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          The site uses one functional cookie (<code>i18n_redirected</code>) to remember your language preference. Nothing else. Theme preference is stored in <code>localStorage</code> on your device only.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask for access, rectification, deletion, or export of any data you sent, by emailing <a href="mailto:rmissimawu@gmail.com">rmissimawu@gmail.com</a>. Response within 30 days.
        </p>

        <h2>Changes</h2>
        <p>
          This policy may be updated. The date of the last meaningful change is mentioned in the git history of this page on GitHub.
        </p>
      </div>

      <div v-else class="privacy__content">
        <h2>Version courte</h2>
        <p>
          Ce site collecte <strong>uniquement ce que tu envoies via le brief ou le formulaire de contact</strong>, et rien d'autre. Pas de tracker tiers, pas de pub, pas d'identifiant inter-sites. Les analytics sont respectueuses de la vie privée (Umami, auto-hébergé) et l'IP est anonymisée.
        </p>

        <h2>Ce que je collecte</h2>
        <ul>
          <li><strong>Formulaire brief</strong> : les champs que tu remplis (type de projet, périmètre, budget, email). Stocké localement dans ton navigateur comme brouillon jusqu'à l'envoi.</li>
          <li><strong>Formulaire contact</strong> : adresse email et message.</li>
          <li><strong>Analytics</strong> : vues anonymes, referrer, pays (déduit de l'IP, puis IP jetée), type d'appareil. Pas de cookie. Pas d'identifiant personnel.</li>
        </ul>

        <h2>Pourquoi</h2>
        <ul>
          <li>Pour te répondre et préparer la mission.</li>
          <li>Pour comprendre quelles études de cas sont lues et améliorer les contenus.</li>
        </ul>

        <h2>Où ça vit</h2>
        <ul>
          <li>Soumissions de formulaire : MongoDB hébergée en Europe, plus une sauvegarde sur Google Drive (chiffrée au repos).</li>
          <li>Notifications email : Gmail SMTP.</li>
          <li>Analytics : Umami auto-hébergé, rétention 12 mois.</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          Le site utilise un seul cookie fonctionnel (<code>i18n_redirected</code>) pour mémoriser ta langue. Rien d'autre. La préférence de thème est stockée dans le <code>localStorage</code> de ton appareil uniquement.
        </p>

        <h2>Tes droits</h2>
        <p>
          Tu peux demander accès, rectification, suppression ou export de toute donnée que tu m'as envoyée, en écrivant à <a href="mailto:rmissimawu@gmail.com">rmissimawu@gmail.com</a>. Réponse sous 30 jours.
        </p>

        <h2>Changements</h2>
        <p>
          Cette politique peut être mise à jour. La date du dernier changement significatif est visible dans l'historique git de cette page sur GitHub.
        </p>
      </div>
    </section>
  </article>
</template>

<style scoped>
.privacy__body {
  padding: 5rem 1.5rem 8rem;
}
.privacy__content {
  max-width: 64ch;
}
.privacy__content h2 {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(1.375rem, 2.5vw, 1.75rem);
  letter-spacing: -0.02em;
  margin: 3rem 0 1rem;
  color: var(--text);
}
.privacy__content h2:first-child { margin-top: 0; }
.privacy__content p {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0 0 1.25rem;
}
.privacy__content ul {
  list-style: none;
  padding: 0;
  margin: 1.25rem 0 1.75rem;
}
.privacy__content li {
  position: relative;
  padding-left: 1.5rem;
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0 0 0.6rem;
}
.privacy__content li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--accent);
}
.privacy__content strong {
  color: var(--text);
  font-weight: 600;
}
.privacy__content em {
  font-family: theme('fontFamily.editorial');
  color: var(--accent);
}
.privacy__content code {
  font-family: theme('fontFamily.mono');
  font-size: 0.875em;
  background: var(--bg-overlay);
  padding: 0.1em 0.4em;
  border-radius: 3px;
  color: var(--accent);
  border: 1px solid var(--border);
}
.privacy__content a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.privacy__content a:hover {
  color: var(--text);
}
</style>
