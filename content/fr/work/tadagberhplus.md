---
slug: tadagberhplus
title: Un SIRH multi-entreprises pour 100+ structures
kicker: Issue 03 · SaaS · Ressources humaines · 2024–2025
excerpt: Centraliser la gestion RH multi-tenants d'un cabinet de conseil — paie, congés, CNSS, documents — sur un monolithe Django assumé.
year: 2025
order: 3
featured: true
client: Cabinet GPRHME (Bénin)
sector: SaaS · Ressources humaines
role: Backend Lead · Architecture · Livraison
team: 3 devs · 1 PO
duration: 11 mois (sept. 2024 — juil. 2025)
stack:
  - Django 4.2
  - MySQL
  - Redis
  - RabbitMQ
  - Celery
  - Vue 3
cover: /images/tadagberhplus.png
results:
  - value: "100+"
    label: Entreprises gérées
  - value: "770+"
    label: Employés tracés
  - value: "85 %"
    label: Réduction des saisies manuelles
seoDescription: TadagbeRhPlus — SIRH multi-tenants Django 4 + MySQL + Celery, paie + CNSS + congés + documents pour 100+ entreprises au Bénin.
---

## Le contexte

Le cabinet GPRHME suit la paie et les RH d'une centaine de clients PME au Bénin. Avant TadagbeRhPlus : un fichier Excel par client, des calculs CNSS faits à la main, des PDF de bulletins de paie envoyés par mail, et un consultant par dossier qui devenait le **single point of failure** du portefeuille.

La direction voulait un outil unique pour reprendre la main : un consultant pouvant gérer 30 dossiers en parallèle, des templates de paie standardisés, et une signature électronique pour les contrats.

## Ce qu'on m'a demandé

Reprendre une plateforme Django 2.2 (Python 3.6) qui ne tournait plus que par miracle, la moderniser sans interrompre la production, et industrialiser cinq modules critiques : **employés, contrats, congés, paie, CNSS**.

## L'approche

1. **Audit avant code.** Les deux premières semaines : lecture du code, schéma MySQL, et entretiens avec les consultants RH. J'ai écrit un document `AUDIT_COMPLET.md` qui listait 47 risques par criticité — c'est ce document qui a structuré la roadmap.
2. **Migration progressive du runtime.** Python 3.6 → 3.11 en quatre semaines, Django 2.2 → 4.2 par sauts (2.2 → 3.2 → 4.2) avec tests de non-régression sur chaque saut.
3. **Multi-tenant par URL.** Chaque entreprise vit sur `<companyname>/employer/` — un middleware résout le tenant à l'entrée, isole les querysets en aval. Pas de schémas séparés, juste un `company_id` discriminant et des managers Django qui filtrent par défaut.

## Décisions techniques notables

- **Django 4.2 LTS + MySQL via PyMySQL.** MySQL imposé par l'existant (10 ans de données métier) — la migration vers Postgres aurait coûté deux mois pour zéro gain métier visible.
- **Celery 5.5 + RabbitMQ + Redis** pour les jobs lourds : génération PDF de paie (`pdfkit` + wkhtmltopdf), envoi des bulletins par email (`django-celery-email`), recalcul CNSS mensuel.
- **django-celery-beat** pour la planification mensuelle de la paie. Les consultants déclenchent manuellement, mais un fallback cron passe le 28 si personne n'a touché.
- **pyHanko** pour la signature électronique des contrats côté serveur — signature visible + crypto + horodatage, conforme aux exigences locales.
- **django-auditlog** sur toutes les entités sensibles (employés, contrats, paies) — chaque modification est tracée avec utilisateur + diff JSON.
- **whitenoise + django-compressor** pour servir les statiques sans Nginx en mode reverse-proxy, plus simple en monolithique.
- **Worker JS de déconnexion synchronisée** (`easy_worker.js`) — quand un consultant se déconnecte d'un onglet, tous les autres se déconnectent immédiatement via SharedWorker. Évite les vols de session en cas de PC partagé.
- **Sentry SDK** sur tout, **handlers d'erreurs 400/403/404/500 personnalisés** qui parlent au consultant ("L'entreprise X n'existe plus" plutôt que stack trace).
- **Sitemaps Django** pour le référencement des pages publiques (présentation, recrutement).

## Le module CNSS — le plus subtil

La Caisse Nationale de Sécurité Sociale du Bénin a des règles de calcul qui changent par décret presque chaque année. J'ai isolé le calcul dans une couche `formulas` (`schedula`) avec des paramètres par année — quand un décret tombe, on ajoute une ligne, pas une fonction. Trois mises à jour réglementaires en 11 mois, zéro régression.

## Ce qui a marché, ce qui n'a pas marché

**Marché.** Le monolithe assumé. Django 4 + MySQL + Celery sur un seul VPS, supervisord pour la résilience. À 770 employés actifs, pas de besoin de microservices — et la simplicité opérationnelle vaut son pesant d'or quand l'ops, c'est aussi un des trois devs.

**Pas marché.** wkhtmltopdf a fini par exploser sur certains bulletins (caractères spéciaux dans les noms à rallonge). J'ai migré progressivement vers WeasyPrint mais l'effort de réécriture des templates était lourd — on en a fait 70 % avant la fin de mission.

## Le take-away

Sur un monolithe Django mature, l'instinct est de "moderniser" — passer en microservices, à Postgres, à GraphQL. Dans 80 % des cas c'est du temps perdu : le vrai gain vient de **lire le code existant en profondeur**, identifier les trois ou quatre modules réellement bloquants, et les refondre chirurgicalement.

Sur Tadagbe, j'ai touché à 12 % du code et gagné 85 % de productivité utilisateur. Le reste, on l'a laissé tourner.
