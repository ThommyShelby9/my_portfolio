---
title: Planus Analytics
summary: "The website of a pan-African IT consulting firm and its built-in back office: articles, job offers, applications, resources and accounts behind two-factor authentication."
year: 2025
duration: "6 weeks"
role: "Full-stack, front-end lead"
team: "2 developers"
coauthors: []
client: "Planus Analytics"
sector: "IT consulting, company website"
stack: [Vue 3, TypeScript, Vite, Pinia, Bootstrap 5, Tailwind CSS, Chart.js]
genes: [engineering, product]
status: live
liveUrl: https://planus-analytics.com
featured: null
order: 14
images:
  - { src: /work/planus/01.webp, alt: "Planus Analytics website", kind: public }
proofs: []
seoDescription: "Planus Analytics: company website and back office in Vue 3, Bootstrap 5 and Tailwind CSS. Recruitment, blog, resources, partners, two-factor login."
---

## The challenge

Planus Analytics is a firm working on IT consulting, systems integration and digital transformation in Africa. Before the rebuild, it had a WordPress site that no longer matched the firm’s maturity, and job applications tracked on a shared Trello board.

The brief: a company website that sets the tone, and a built-in back office so the team can run its content and hiring without outside tools.

## Key features

- **The public site**: services, blog, job offers, downloadable resources, partners, and a map of Africa showing where the firm works.
- **A dashboard**: applications per month, traffic, interactive map.
- **Application tracking**, with each candidate’s file and the history of exchanges.
- **Publishing**: articles with a rich-text editor, job offers, resources, partner logos and links.
- **Admin accounts** behind mandatory TOTP two-factor authentication, with profile and password settings.

## Constraints and decisions

- **One app for the site and the admin area.** A single Vue 3 SPA holds the public pages and the protected space; data comes from the API of an existing Laravel back end. No new server to maintain for a need that did not call for one.
- **Bootstrap and Tailwind, each in its place.** Bootstrap 5 for the dense admin screens (tables, modals, forms) that need to ship fast; Tailwind for the public side, where the visual identity matters. Odd on paper, complementary in practice.
- **One skeleton for every admin view.** Eleven business views follow the same pattern: a table, a create and edit modal, soft deletion. Learn one screen and you know them all.
- **Two-factor authentication, no exceptions.** No admin account signs in without a second factor: the back office holds job applications, which means personal data.

## Outcome

The site is live at planus-analytics.com. One deployment lesson: relying on a preview server in production broke the first builds on the hosting platform. The site is now served as a static build behind Nginx, which is simpler and steadier. For a consulting firm, the back office is what changes daily work, and that is where most of the development time went.
