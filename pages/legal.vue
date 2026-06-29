<script setup lang="ts">
const { t, locale } = useI18n()
const _ = t

useSeoMeta({
  title: () => locale.value === 'en' ? 'Legal notice — Rostel Panoumassi' : 'Mentions légales — Rostel Panoumassi',
  robots: 'index, follow',
})

const heroProps = computed(() => locale.value === 'en'
  ? { num: '06', kicker: 'Legal · Editorial responsibility', title: 'Legal', emphasis: 'notice.' }
  : { num: '06', kicker: 'Mentions · Responsabilité éditoriale', title: 'Mentions', emphasis: 'légales.' },
)
</script>

<template>
  <article class="legal">
    <PageHero v-bind="heroProps" />

    <section class="legal__body container-narrow">
      <div v-if="locale === 'en'" class="legal__content">
        <h2>Publisher</h2>
        <p>
          <strong>Rostel Panoumassi</strong>, Lead Engineering, individual professional.<br>
          Address: Cotonou, Littoral, Republic of Benin.<br>
          Email: <a href="mailto:rmissimawu@gmail.com">rmissimawu@gmail.com</a>.<br>
          Publication director: Rostel Panoumassi.
        </p>

        <h2>Hosting</h2>
        <p>
          This site is hosted by <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, USA — <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>.<br>
          Email infrastructure provided by Gmail SMTP (Google LLC).
        </p>

        <h2>Intellectual property</h2>
        <p>
          All content on this site (case studies, text, code, illustrations, photographs, and overall design) is the exclusive property of Rostel Panoumassi, except where third-party clients are credited.<br>
          Reproduction, in whole or in part, is forbidden without prior written consent.
        </p>

        <h2>Project anonymity</h2>
        <p>
          Where a case study is marked <em>NDA</em> or <em>anonymised</em>, the client's identity, brand and any commercially sensitive metric have been changed or removed. Technical descriptions remain faithful to the actual delivery.
        </p>

        <h2>Liability</h2>
        <p>
          Information published on this site is provided for informational purposes only. While reasonable effort is made to keep it accurate and up to date, no warranty is given as to its exhaustiveness or fitness for any specific purpose.
        </p>

        <h2>Applicable law</h2>
        <p>
          This site is governed by the laws of the Republic of Benin. Any dispute relating to it falls under the jurisdiction of the courts of Cotonou.
        </p>

        <h2>Contact</h2>
        <p>
          For any question regarding this notice, write to <a href="mailto:rmissimawu@gmail.com">rmissimawu@gmail.com</a>.
        </p>
      </div>

      <div v-else class="legal__content">
        <h2>Éditeur</h2>
        <p>
          <strong>Rostel Panoumassi</strong>, Lead Engineering, en tant que professionnel indépendant.<br>
          Adresse : Cotonou, Littoral, République du Bénin.<br>
          Email : <a href="mailto:rmissimawu@gmail.com">rmissimawu@gmail.com</a>.<br>
          Directeur de publication : Rostel Panoumassi.
        </p>

        <h2>Hébergement</h2>
        <p>
          Ce site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>.<br>
          Infrastructure email assurée par Gmail SMTP (Google LLC).
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus du site (études de cas, textes, code, illustrations, photographies et design global) est la propriété exclusive de Rostel Panoumassi, sauf mention contraire identifiant un client tiers.<br>
          Toute reproduction, totale ou partielle, est interdite sans accord écrit préalable.
        </p>

        <h2>Anonymisation des projets</h2>
        <p>
          Lorsqu'une étude de cas est indiquée <em>NDA</em> ou <em>anonymisée</em>, l'identité du client, sa marque et toute donnée commerciale sensible ont été modifiées ou retirées. Les descriptions techniques restent fidèles à la livraison réelle.
        </p>

        <h2>Responsabilité</h2>
        <p>
          Les informations publiées sur ce site le sont à titre indicatif. Bien qu'un effort raisonnable soit fait pour les maintenir exactes et à jour, aucune garantie n'est apportée quant à leur exhaustivité ou leur adéquation à un usage spécifique.
        </p>

        <h2>Droit applicable</h2>
        <p>
          Le présent site est soumis au droit de la République du Bénin. Tout litige y afférent relève des tribunaux de Cotonou.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question relative aux présentes mentions, écrire à <a href="mailto:rmissimawu@gmail.com">rmissimawu@gmail.com</a>.
        </p>
      </div>
    </section>
  </article>
</template>

<style scoped>
.legal__body {
  padding: 5rem 1.5rem 8rem;
}
.legal__content {
  max-width: 64ch;
}
.legal__content :deep(h2),
.legal__content h2 {
  font-family: theme('fontFamily.display');
  font-weight: 600;
  font-size: clamp(1.375rem, 2.5vw, 1.75rem);
  letter-spacing: -0.02em;
  margin: 3rem 0 1rem;
  color: var(--text);
}
.legal__content h2:first-child { margin-top: 0; }
.legal__content p {
  font-family: theme('fontFamily.body');
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--text-mute);
  margin: 0 0 1.25rem;
}
.legal__content em {
  font-family: theme('fontFamily.editorial');
  font-style: normal;
  color: var(--accent);
}
.legal__content strong {
  color: var(--text);
  font-weight: 600;
}
.legal__content a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.legal__content a:hover {
  color: var(--text);
}
</style>
