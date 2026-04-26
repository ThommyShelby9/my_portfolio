<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__col">
        <h3 class="site-footer__heading">Navigation</h3>
        <ul>
          <li><NuxtLink to="/">Accueil</NuxtLink></li>
          <li><NuxtLink to="/work">Travaux</NuxtLink></li>
          <li><NuxtLink to="/about">Approche</NuxtLink></li>
          <li><NuxtLink to="/brief">Démarrer un brief</NuxtLink></li>
        </ul>
      </div>

      <div class="site-footer__col">
        <h3 class="site-footer__heading">Contact</h3>
        <ul>
          <li><a href="mailto:rmissimawu@gmail.com">rmissimawu@gmail.com</a></li>
          <li><NuxtLink to="/contact">Page contact</NuxtLink></li>
          <li><a href="/cv.pdf" download>Télécharger CV</a></li>
        </ul>
      </div>

      <div class="site-footer__col">
        <h3 class="site-footer__heading">Ailleurs</h3>
        <ul>
          <li><a href="https://www.linkedin.com/in/rostelpanoumassi-6b6608335" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href="https://github.com/ThommyShelby9" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
      </div>

      <div class="site-footer__col site-footer__col--legal">
        <h3 class="site-footer__heading">Légal</h3>
        <ul>
          <li><NuxtLink to="/legal">Mentions</NuxtLink></li>
          <li><NuxtLink to="/privacy">Confidentialité</NuxtLink></li>
        </ul>
      </div>
    </div>

    <div class="site-footer__bottom">
      <p class="site-footer__credit">
        Made in Cotonou · {{ year }}
      </p>
      <NuxtLink to="/terminal" class="site-footer__easter">
        $ ./terminal
      </NuxtLink>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  background: var(--bg);
  padding: 5rem 1.5rem 2.5rem;
  margin-top: 8rem;
}

.site-footer__inner {
  max-width: theme('maxWidth.container');
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
}

@media (max-width: 768px) {
  .site-footer__inner {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

.site-footer__heading {
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-soft);
  margin: 0 0 1rem;
  font-weight: 500;
}

.site-footer__col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.site-footer__col a {
  color: var(--text-mute);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 150ms;
}

.site-footer__col a:hover {
  color: var(--text);
}

.site-footer__bottom {
  max-width: theme('maxWidth.container');
  margin: 4rem auto 0;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: theme('fontFamily.mono');
  font-size: 0.6875rem;
  color: var(--text-soft);
  letter-spacing: 0.06em;
}

.site-footer__easter {
  color: var(--text-soft);
  text-decoration: none;
  transition: color 150ms;
}

.site-footer__easter:hover {
  color: var(--accent);
}
</style>
