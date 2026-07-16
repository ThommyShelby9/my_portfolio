---
slug: zenlife
title: A personal wellness app
kicker: Issue 10 · Side project · 2024
excerpt: Track mood, finance and habits in one place — on a Laravel + Vue + MySQL stack maintained by a single person.
year: 2024
order: 10
featured: false
client: Personal product
sector: Wellness · SaaS
role: Solo · Design · Development
team: Solo
duration: 3 months (Aug — Oct 2024)
stack:
  - Laravel 10
  - Vue 3
  - MySQL
  - TailwindCSS
cover: /images/zenlife.png
results:
  - value: "1,200+"
    label: Active users in 6 months
  - value: "3"
    label: Modules shipped (mood, finance, habits)
  - value: "€0"
    label: Infra cost over 6 months (shared VPS)
seoDescription: ZenLife — personal wellness web app. Laravel + Vue + MySQL, 3 modules (mood, finance, habits), maintained solo.
---

## The context

I wanted a tool that watched **three things together**: my mood, my finances, my habits. Not a Notion, not an Excel, not three separate mobile apps — one place to understand correlations (do I sleep worse the week after a big expense? does my productivity drop when I miss morning routines?).

No product did that well in 2024. I wrote my own.

## The approach

Side project — therefore strict rules:

1. **Stack I know by heart.** Laravel + Vue + MySQL. Zero chance to learn anything outside the business domain.
2. **Free or near-free hosting.** Shared VPS with other projects, domain via Coolify, Cloudflare free as CDN.
3. **No users until it's for me.** I used ZenLife alone for two months before opening signups.

## Notable technical decisions

- **Laravel 10 + Sanctum** for auth — email magic link, no passwords to remember.
- **Vue 3 + Vue Router + Pinia.** Simple SPA, no SSR.
- **TailwindCSS** with a 30-line design system. No third-party components — every card, every chart written by hand.
- **Chart.js** for trend graphs (mood/finance/habits over time).
- **MySQL** with three main tables (`mood_entries`, `transactions`, `habit_logs`) and a computed view `daily_summary` for the dashboard.
- **Laravel migrations** versioned — I broke prod twice, learned twice.
- **Nightly backup**: mysqldump + rclone sync to personal Google Drive. Worst case I lose 24h.

## The three modules

**Mood.** A 1–10 score, an optional keyword (energy, anxiety, calm…), a free comment. Monthly heatmap + 90-day chart.

**Finance.** Quick transaction entry (amount, category, note). Customisable categories. Per-category spending chart + monthly cash-flow.

**Habits.** Configurable list (meditate, sport, write, read). Daily check. Streak counter. GitHub-style 365-day heatmap.

The home dashboard crosses the three — the only interesting screen.

## What worked, what didn't

**Worked.** Minimal scope. Three modules, three months, shipped. I resisted every temptation (PDF export, social share, mobile app, Apple Health integration) that would have added 6 months for zero real value to my use.

**Didn't.** Opening to 1,200 users surfaced bugs I never saw alone — locale date formats, timezones, Unicode characters in notes. I patched in emergency for two weeks after opening.

## Take-away

For a side project, **constraints are the feature**. No budget = no AWS, no paid Stripe, no paid Sentry. That forces you to write 200 useful lines instead of 2000 glue lines with ten dependencies.

Six months later, I still use ZenLife daily. Probably the only app I wrote where I'm the first user.
