---
slug: easytowork
title: Une plateforme RH multi-marques pour le groupe KPS
kicker: Issue 08 · Multi-marques · 2025
excerpt: Trois sites vitrines (KPS Groupe, KPS Analytics, EasyToWork) sur un backend Laravel d'envoi d'emails — formations, postulations, simulateur de salaire.
year: 2025
order: 8
featured: false
client: KPS Groupe (interne)
sector: RH · Formation · Vitrine
role: Lead Engineering · Architecture
team: 2 devs · 1 designer
duration: 3 mois
stack:
  - Laravel 12
  - Vue 3
  - TypeScript
  - Vite
  - TailwindCSS
  - jsPDF
cover: /images/easytowork.png
results:
  - value: "3"
    label: Marques sur un seul backend
  - value: "PDF"
    label: Génération de simulation salariale côté client
  - value: "CORS"
    label: Gérée au niveau Nginx, zéro middleware
seoDescription: EasyToWork — plateforme multi-marques KPS Groupe. Laravel 12 (API emails) + Vue 3 + Vite + Tailwind. Simulateur de salaire, formations, postulations.
---

## Le contexte

Le groupe KPS portait trois marques distinctes : **KPS Groupe** (le holding), **KPS Analytics** (conseil data) et **EasyToWork** (formation et recrutement). Trois sites WordPress séparés, trois formulaires de contact qui n'envoyaient leurs emails à personne, trois équipes éditoriales qui se marchaient dessus.

L'objectif : **un seul backend** d'envoi d'emails consommable par les trois sites, et **un seul frontend** Vue 3 modulaire qui sert les trois marques selon la route.

## L'approche

- **Backend Laravel 12 minimal.** Pas de DB lourde — juste deux modèles (`Contact`, `Newsletter`) en SQLite, et une dizaine de routes API `POST /send-email-*` qui prennent un payload, le valident, le formattent et l'envoient via Nodemailer/SMTP.
- **Frontend Vue 3 + Vite + TailwindCSS** unique, avec un système de thème par marque (palette, logo, typo) qui bascule selon le sous-domaine ou le path.
- **Génération PDF côté client** (`jsPDF`) pour le simulateur de salaire — pas de round-trip serveur pour une simulation que l'utilisateur veut emporter avec lui.

## Décisions techniques notables

- **CORS au niveau Nginx**, pas en middleware Laravel. Un seul `add_header Access-Control-Allow-*` par bloc `location`, plus de risque de header dupliqué côté Laravel.
- **Routes API typées par destination** :
  - `POST /send-email-kpsgroupe`
  - `POST /send-email-kpsanalytics`
  - `POST /send-email-ewt`
  - `POST /send-email-postulation` (CV en pièce jointe)
  - `POST /simulateur` (sauvegarde optionnelle)
  - `POST /contact`
  - `POST /newsletter/subscribe` + `unsubscribe`
- **Pinia 3** pour le state global, **axios** pour les appels API.
- **lucide-vue-next** pour les icônes — pas de Heroicons (trop générique).
- **Pas de SSR.** Vite build statique, hébergement Nginx + Cloudflare. SEO assuré par prerendering manuel des pages stratégiques.

## Le simulateur de salaire

C'est le seul module métier réel — convertir un salaire brut en net selon le barème CNSS Bénin + IRPP, avec téléchargement PDF.

Logique 100 % côté client :
1. Saisie utilisateur (salaire brut, statut, charges familiales)
2. Calcul `formula(brut, params)` — paramètres versionnés par année dans un JSON statique
3. Affichage du détail (cotisations, impôts, net à payer)
4. `jsPDF.save()` — l'utilisateur emporte sa simulation

Si on veut sauvegarder pour relance commerciale, un opt-in déclenche un `POST /simulateur` qui stocke le contexte.

## Ce qui a marché, ce qui n'a pas marché

**Marché.** Le backend ultra-minimal. 200 lignes de code utiles, deux semaines de mission, déployé sur un petit VPS partagé avec d'autres apps KPS. Maintenance quasi nulle depuis.

**Pas marché.** Le système de thèmes par marque est resté plus rigide qu'on aurait voulu — pour ajouter une 4e marque, il faut toucher 4 endroits dans le code. C'est OK pour 3 marques stables, ce ne serait pas OK pour un produit white-label.

## Le take-away

Pour un site vitrine, **la première question** n'est pas "quel framework" mais "que doit faire le backend". Si la réponse est "envoyer des emails et compter trois choses", un Laravel minimal vaut largement mieux qu'un Nuxt full-stack ou un Next.js avec API routes. Moins de code, moins de bugs, moins de maintenance.
