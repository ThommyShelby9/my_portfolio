---
slug: mariette
title: Un blog + portfolio modulaire pour une professionnelle indépendante
kicker: Issue 12 · Blog · Portfolio · 2025
excerpt: Next.js 15 + MongoDB + NextAuth — un éditeur Tiptap maison, des médias UploadThing, un admin protégé par OAuth Google/GitHub.
year: 2025
order: 12
featured: false
client: Mariette H. NOBRE
sector: Portfolio · Blog
role: Full-stack · Architecture
team: Solo
duration: 5 semaines
stack:
  - Next.js 15
  - React 19
  - TypeScript
  - MongoDB
  - NextAuth v5
  - Tiptap 3
cover: /images/portfolio_mariette.png
results:
  - value: "Tiptap"
    label: Éditeur riche maison, slash commands
  - value: "OAuth"
    label: Google + GitHub + credentials
  - value: "Markdown"
    label: Rendu d'articles + SEO complet
seoDescription: Portfolio + blog Mariette Nobre — Next.js 15, App Router, MongoDB, NextAuth v5, éditeur Tiptap personnalisé, UploadThing. Live sur mariettehuguette.com.
---

## Le contexte

Mariette est une professionnelle indépendante qui voulait **un blog dont elle a le contrôle complet** — pas Medium, pas Substack — couplé à un portfolio que ses prospects peuvent consulter sans friction. La contrainte : qu'elle puisse écrire un article comme elle écrit dans Notion, sans apprendre un nouvel outil.

## L'approche

Next.js 15 App Router pour le SSR et le SEO, MongoDB pour la donnée, NextAuth v5 pour l'admin. Un **éditeur Tiptap personnalisé** côté admin, qui est le seul vrai morceau de code maison du projet.

## Décisions techniques notables

- **Next.js 15 + React 19 + TypeScript 5.7** sur App Router strict — pas de Pages Router résiduel.
- **MongoDB + Mongoose 8** — domaine simple (Article, Tag, Comment, User), pas besoin de Postgres.
- **NextAuth v5 (beta) + `@auth/mongodb-adapter`** — trois providers actifs : Google OAuth, GitHub OAuth, credentials (avec `bcryptjs` côté serveur).
- **Tiptap 3** comme éditeur — extensions intégrées : image (avec drag&drop UploadThing), link, table, text-align, highlight, color, underline, bubble menu, slash commands custom (`/heading`, `/image`, `/quote`).
- **UploadThing 7** pour les médias — uploads typés côté serveur, plus simple que de gérer S3 + signed URLs soi-même.
- **react-hook-form + Zod + `@hookform/resolvers`** sur les forms d'admin.
- **TanStack Query 5** côté client pour les listes d'articles et la pagination admin.
- **Framer Motion 12** pour les transitions entre articles et le scroll-reveal.
- **Nodemailer 7** pour le formulaire de contact (envoi vers Gmail SMTP).
- **next-themes** pour le mode clair/sombre auto.
- **react-easy-crop + UploadThing** pour le crop d'image de profil et de cover d'article.
- **Sitemap + robots + manifest** générés par `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`.
- **Scripts admin** en `tsx` : `seed:admin`, `check:admin`, `test:password`, `diagnose:auth` pour debug en prod.
- **Docker + DEPLOYMENT.md** prêts pour migration future.

## L'éditeur — le morceau qu'on a écrit deux fois

La première version utilisait `@tiptap/react` avec les extensions par défaut. Mariette a buté sur les images : drag&drop ne fonctionnait pas dans tous les cas, le redimensionnement n'existait pas.

Réécriture : extension custom `ImageNode` qui :
1. Accepte drag&drop ET paste depuis clipboard ET upload bouton
2. Upload vers UploadThing en background, affiche un skeleton pendant
3. Permet le redimensionnement par poignées
4. Sauvegarde la position en tant qu'attribut HTML

Deux semaines pour bien faire ça. Mais c'est ça qui rend l'admin utilisable.

## Ce qui a marché, ce qui n'a pas marché

**Marché.** App Router. Une fois passé l'apprentissage, le mix server components / client components avec `'use client'` ciblé donne des perfs de production qu'aucun framework SPA n'atteint sans effort équivalent.

**Pas marché.** NextAuth v5 en beta — chaque mise à jour mineure cassait un truc. J'ai épinglé une version stable et arrêté de chercher les updates.

## Le take-away

Pour un blog + portfolio personnel, **l'éditeur est 80 % de l'effort dev** — paradoxal, parce que c'est le composant le moins visible publiquement. Mais c'est ce qui fait que la propriétaire écrit un article par semaine au lieu d'un par trimestre.

Investir le temps là est toujours payant.
