---
slug: ubbfy
title: A full ERP suite with geolocated time clock
kicker: Issue 02 · ERP · Web + Mobile · 2025–2026
excerpt: Inventory, projects, HR, CRM, helpdesk, documents — plus a Flutter geolocated time-clock app. A multi-app rebuild on top of a legacy monolith.
year: 2026
order: 2
featured: true
client: Ubbfy
sector: ERP · HRIS · Multi-tenant
role: Lead Engineering · Architecture · Rebuild
team: 4 devs · 1 mobile (Flutter) · 1 ops
duration: 8 months (rebuild in progress)
stack:
  - Django 5
  - DRF
  - PostgreSQL
  - Redis
  - Vue 3
  - PrimeVue
  - Flutter
  - Channels
results:
  - value: "20"
    label: Django business apps
  - value: "16"
    label: Frontend modules
  - value: "Web + PWA + Flutter"
    label: Three clients, one API
cover: /images/ubbfy.png
seoDescription: Ubbfy rebuild — full ERP suite Django 5 + DRF + Vue 3 + PrimeVue + Flutter (geolocated time clock). Channels, Celery, S3, WeasyPrint, FCM.
---

## The context

Ubbfy was a fading Odoo equivalent — a five-year-old Django monolith, server templates, few tests, and accumulated debt that prevented adding any module without breaking three others. Time clock, stock, HR, projects, helpdesk — all in one codebase.

The mandate: rebuild while keeping the existing system in production, migrate module by module, and ship a **Flutter geolocated time-clock app** in parallel for remote sites.

## The approach

One rule: **the Django API is the single source of truth.** Web, PWA, Expo mobile, Flutter mobile — four clients consume the same DRF API. No business logic in the client.

Three layers:

1. **Backend Django 5 + DRF + Channels** — REST for reads, WebSocket for real-time notifications, Celery (Redis broker) for long tasks (WeasyPrint PDFs, Excel exports, imports).
2. **Frontend Vue 3 + PrimeVue 4.5 + Tailwind 4** — 16 business modules (analytics, attendance, billing, campaigns, companies, contacts, dashboard, documents, employees, hardware, payroll, recruitment, settings, statistics, support, teams). Tanstack Table for heavy lists, Leaflet for maps, ApexCharts for charts.
3. **Flutter (Dart 3.9)** — `ubbfypresence` time-clock app: geolocation with configurable radius around the site, optional photo capture, FCM notifications, offline mode with deferred sync.

## Notable technical decisions

- **PostgreSQL via psycopg 3.** Migration from SQLite, leveraging JSONB for custom workflows and company settings.
- **Channels 4 + Daphne + channels-redis** for web push and real-time presence screen.
- **drf-spectacular** for OpenAPI — versioned API contract, Vue and Flutter consume generated schemas.
- **django-storages + boto3** to MinIO/S3 — documents, presence photos, Excel exports.
- **WeasyPrint 62** for payslips and contracts.
- **pywebpush** (Web Push) on web, **firebase-admin (FCM)** on Flutter, **Twilio** as SMS fallback.
- **django-redis** for cache, **django-celery-beat** for periodic jobs.
- **Sentry SDK** on backend and mobile — correlated by `user_id`.

## The Flutter app

The challenge: a factory worker cannot afford a 3-second wait when clocking in at 6 AM.

- **Native geolocation + GPS cache.** App remembers yesterday's validated site coordinates for instant start.
- **Offline validation.** No network? Store in `flutter_secure_storage`, sync on `connectivity_plus` return.
- **device_info_plus** to bind an account to a device — no cross-clocking between colleagues.
- **flutter_local_notifications** for break reminders, end-of-shift.
- **Provider** for state, **Dio + pretty_dio_logger** for API calls, **flutter_svg** for illustrations.

## What worked, what didn't

**Worked.** The strangler pattern: each rebuilt module unplugs the corresponding legacy module via a per-company feature flag. No big-bang migration, we switch company by company, with one-click rollback.

**Didn't.** The first Flutter version called the REST API with a home-grown cache layer. At 50 concurrent users on one site, we saturated. I had to ship a dedicated `/api/attendance/checkin-batch/` endpoint with server-side deduplication and deferred acceptance.

## Take-away

An ERP rebuild succeeds or fails in one place: the **readability of the back-office**. If the client's admins (HR, accountants, ops) can't do their job with the new interface in the first two weeks, the project is politically dead — no matter how good the tech below.

I spent a month co-designing admin screens with the client's HR lead. Probably the most profitable month of the project.
