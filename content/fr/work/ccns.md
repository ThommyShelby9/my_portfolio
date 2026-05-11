---
slug: ccns
title: Un site institutionnel pour un réseau de centres de santé
kicker: Issue 04 · Institutionnel · Santé · 2025
excerpt: Refonte complète du site CCNS — contenu, accessibilité, performance — pour la Conférence des Centres de Santé Catholiques au Bénin.
year: 2025
order: 4
featured: true
client: Conférence des Centres de Santé (CCNS)
sector: Santé · Institutionnel
role: Full-stack · Architecture · Contenu
team: 1 dev · 1 PO
duration: 8 semaines
stack:
  - Vue 3
  - Vite
  - TailwindCSS
  - Strapi
cover: /images/ccns.png
results:
  - value: "+ 240 %"
    label: Trafic organique en 6 mois
  - value: "8 / 8"
    label: Centres documentés
  - value: "100 %"
    label: Score SEO Lighthouse
seoDescription: Refonte CCNS Bénin — Vue 3 + Vite + Strapi, accessibilité prioritaire, SEO optimisé, 100/100 Lighthouse. Live sur ccnsbenin.vercel.app.
---

## Le contexte

La Conférence des Centres de Santé (CCNS) représente le réseau des huit centres de santé catholiques du Bénin. Leur site précédent était une page de garde de 2015 avec un PDF de présentation et trois adresses email — invisible sur Google, illisible sur mobile, sans aucun moyen pour un usager de trouver le centre le plus proche.

Le mandat : refondre, et faire en sorte qu'un patient cherchant "centre de santé Cotonou" tombe sur le bon centre en première position.

## L'approche

Trois priorités, dans cet ordre :

1. **Accessibilité avant esthétique.** WCAG 2 AA dès la première itération, contrastes vérifiés, navigation clavier complète, focus visibles partout.
2. **Performance comme proxy de SEO.** L'objectif Lighthouse 100/100 n'était pas une coquetterie — Google récompense la rapidité, et un patient sur 3G en zone rurale ne reviendra pas si la home met 8 secondes.
3. **Contenu écrit avec les soignants**, pas par moi. J'ai animé deux ateliers de rédaction avec les directeurs de centres — eux racontent leur centre mieux qu'aucun copywriter.

## Décisions techniques notables

- **Vue 3 + Vite** côté front. Pas de SSR (Nuxt aurait été overkill) — le contenu est rarement mis à jour, on génère statiquement via `vite build` et on déploie sur Vercel.
- **TailwindCSS** strict — pas de composant UI tiers, design system minimal écrit à la main pour garder le bundle minuscule.
- **Strapi headless** sur un petit VPS — le PO peut éditer les pages des huit centres, ajouter des actualités, gérer la médiathèque sans nous appeler.
- **Images optimisées au build** — chaque photo de centre passe par sharp en `.avif` + `.webp` + fallback `.jpg`, avec `srcset` complet. 70 % de réduction de poids par rapport à l'original.
- **Schema.org `MedicalOrganization`** sur chaque page centre — c'est ce qui a sorti CCNS dans le knowledge panel Google en moins de 3 mois.
- **Carte interactive Leaflet** avec marqueurs cliquables vers chaque centre — l'usage principal du site selon les analytics post-launch.
- **Sitemap dynamique + robots.txt** servis directement par Vite (`vite-plugin-sitemap`).

## Ce qui a marché, ce qui n'a pas marché

**Marché.** L'accessibilité d'abord a forcé une typographie lisible, des contrastes solides, une hiérarchie claire — qui a, paradoxalement, rendu le design **plus** soigné que si on avait commencé par la maquette. Bonus : le site est utilisable sur les vieux Android KaiOS de certains soignants en brousse.

**Pas marché.** Le premier déploiement Strapi sur le VPS du client a planté trois fois en 48 h — RAM insuffisante. On a fini par migrer Strapi sur un Railway managé (24 € / mois) et garder le VPS pour la médiathèque seule.

## Le take-away

Pour un site institutionnel à faible trafic mais à fort enjeu réputationnel, la **vitesse perçue** vaut plus que toute fonctionnalité. Un patient qui ouvre la page d'un centre depuis WhatsApp doit voir le numéro de téléphone et l'adresse en moins d'une seconde — peu importe le reste.

On a optimisé pour ce moment-là, et tout le reste a suivi.
