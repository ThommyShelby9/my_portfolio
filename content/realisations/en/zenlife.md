---
title: ZenLife
summary: "An everyday app that brings together planning, budget, messaging with friends and reminders, on the web and on mobile. Designed and built solo."
year: 2025
role: "Solo design and engineering"
team: "Solo"
coauthors: []
client: "Personal product"
sector: "Wellbeing, personal organisation"
stack: [Vue 3, TypeScript, Pinia, Tailwind CSS, Capacitor, Spring Boot, Java 17, PostgreSQL, Flyway, Redis, WebSocket, Firebase]
status: archived
featured: 3
order: 3
images:
  - { src: /work/zenlife/01.webp, alt: "ZenLife desktop dashboard", kind: interior }
  - { src: /work/zenlife/02.webp, alt: "ZenLife dashboard, dark theme", kind: interior }
  - { src: /work/zenlife/03.webp, alt: "ZenLife finance summary, dark theme", kind: interior }
  - { src: /work/zenlife/04.webp, alt: "ZenLife daily planner", kind: interior }
  - { src: /work/zenlife/05.webp, alt: "Positive thoughts in ZenLife", kind: interior }
  - { src: /work/zenlife/06.webp, alt: "ZenLife dashboard on mobile", kind: interior }
proofs:
  - { text: "1,200+ active users in six months", source: "confirmé par Rostel le 2026-09-28" }
seoDescription: "ZenLife: planning, budget, messaging and reminders in one app. Vue 3 and Capacitor, a Spring Boot API, PostgreSQL, Redis, WebSocket."
---

## The challenge

Planning the day, tracking spending, keeping in touch with friends, remembering to drink water: that usually takes four apps that never talk to each other. ZenLife puts them in one place, on desktop and phone, in a light or dark theme.

The idea behind it is to bring that data together so people can see what their own days show. For example, how many tasks get done on days with enough water, or how mood tracks with a day that went to plan. No comparison with anyone else, and no claim to explain anything.

It is my own product: I designed, built and deployed it alone, API included.

## Key features

- **The daily planner**: tasks with a time and a priority, the day’s progress, and a short evening note with the mood of the day.
- **Finances**: monthly budget, spending by category, monthly summary.
- **Messaging between friends**, with voice notes and attachments, friendships and profile visibility settings.
- **Positive thoughts and water tracking**, with reminders sent as notifications (Web Push on the web, FCM on mobile).
- **Google sign-in, data export and account deletion**, all available from inside the app.
- **Android and iOS apps** built from the same Vue codebase with Capacitor.

## Constraints and decisions

- **A separate, documented API.** I split the Vue client from the Spring Boot API, described with OpenAPI. The PostgreSQL schema only changes through Flyway migrations, never by hand. One contract serves the web and the mobile apps, so there is no second back end to maintain.
- **Real time only where it pays.** Messaging runs over WebSocket (STOMP) and Redis; everything else stays REST, which is easier to test and to cache.
- **Configuration that refuses to start without its secrets.** Rather than running on an unsafe default, the API stops at boot if a key is missing. A deployment mistake shows up immediately, not in front of a user.
- **Both themes tested as a feature.** End-to-end and visual regression tests in Playwright capture every view in light and dark, and colours go through documented design tokens. A dark theme breaks easily and quietly; the screenshots make the breakage visible.

## Outcome

ZenLife reached more than 1,200 active users within six months. The app is no longer online; it is shown through its screenshots.
