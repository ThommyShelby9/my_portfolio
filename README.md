# rostelmissimawu.com

The portfolio of Rostel Panoumassi, product engineer and Head of Engineering & Innovation at KPS Groupe (Cotonou, UTC+1). It is written for clients: what he builds, how he works, the projects he shipped, and two ways to start a conversation (a project brief and a contact form). French is the default language (`/`), English lives under `/en`.

The art direction is « Digital DNA » (spec: `docs/superpowers/specs/2026-10-06-portfolio-v7-digital-dna-design.md`): a real-time particle helix whose genes stand for how he designs products. On the home it follows six scenes as you scroll (formation, sequencing, construction, expression, lab, stabilisation); every project carries a DNA signature drawn from its genes. Palette « Instrument »: graphite, ivory and one signal orange; type in Archivo and IBM Plex Mono.

## Stack

- Next.js 16 (App Router, `output: 'standalone'`), React 19, TypeScript
- next-intl 4 for the two locales and the localized paths (`src/i18n/routing.ts`)
- Tailwind CSS 4; design tokens in `src/styles/globals.css`
- React Three Fiber and three.js for the home DNA helix, GSAP for scroll motion (neither ships in the home page's initial JS)
- Case studies and explorations as Markdown in `content/`, legal pages in `content/legal/`
- Firebase Admin (Firestore) for form submissions and the anonymous visit counter, Nodemailer for the email copy
- Vitest (unit and build checks) and Playwright (end to end, with the Firestore emulator)

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Writes the known slugs, builds, then copies `public/` and `.next/static/` into `.next/standalone` |
| `pnpm start` | Runs the standalone server (`node .next/standalone/server.js`) |
| `pnpm test` | Unit tests (`tests/unit`) |
| `pnpm lint:rules` | Checks the last build (`tests/dist`): owner rules on every page and stylesheet, required pages, initial JS budget of `/` (160 KB gzip) |
| `PW_PORT=3111 pnpm test:e2e` | Builds, starts the Firestore emulator (port 8085) and the standalone server, runs Playwright (desktop and mobile) |
| `pnpm cv:pdf` | Builds, then prints `/cv` and `/en/cv` to `public/cv/*.pdf` |
| `pnpm dna:poster` | Makes a poster build, then renders the DNA helix posters in `public/dna/` |
| `pnpm favicons` | Regenerates the favicon set from `src/assets/brand/favicon.svg` |

Node 22.12 or later, pnpm 10.

### CV PDFs

The CV (`/cv`, `/en/cv`) reads `src/lib/profile/cv-data.ts`, four case studies and the `cv` and `about` messages. After changing any of them, run `pnpm cv:pdf`: it prints both PDFs (one A4 page each, two at most) and writes `public/cv/cv-inputs.sha256`, the hash of the inputs they were printed from. `pnpm test` recomputes that hash and fails with "run pnpm cv:pdf" when the PDFs are stale. The new PDFs reach `.next/standalone` on the next `pnpm build`.

### DNA helix posters

The posters (`public/dna/helix-{desktop,mobile}.webp`) are shown when 3D is not (reduced motion, no WebGL, before the browser is idle). `pnpm dna:poster` builds the site with `NEXT_PUBLIC_DNA_POSTER=1`, which enables `/?dna=poster` (the page hidden around a frozen helix), screenshots it at 1440 and 390 px, and stops. In any other build that query string does nothing. Run `pnpm build` afterwards: never test or ship the poster build.

## Environment variables

Copy `.env.example` to `.env.local` for local work. In production, set them in Coolify.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, the sitemap and JSON-LD. Defaults to `https://rostelmissimawu.com`. Build time. |
| `FIREBASE_PROJECT_ID` | `rostel-portfolio-v6` |
| `FIREBASE_SERVICE_ACCOUNT` | The service-account JSON key, base64 encoded (`base64 -w0 key.json`). Server only. Without it, nothing is stored and forms fall back to email. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP delivery of the email copy. Port 465 uses TLS, anything else STARTTLS (default 587). Without host, user and password, email is skipped. |
| `MAIL_FROM` | Sender address (alias: `SMTP_FROM`). Defaults to `SMTP_USER`; required when the SMTP login is not an address (API-key providers such as Brevo or SendGrid). |
| `MAIL_TO` | Recipient of submissions (alias: `NOTIFICATION_EMAIL`). Defaults to `rmissimawu@gmail.com`. |
| `TRUST_CF_CONNECTING_IP` | Cloudflare is in front, so `cf-connecting-ip` (rate limits) and `cf-ipcountry` (visit counter) are trusted by default. Set to `0` only when the site is served without Cloudflare. |
| `NEXT_PUBLIC_DNA_POSTER` | Build time, `1` only for the poster build (the poster script sets it). Leave unset everywhere else. |

A submission goes to Firestore first, then by email. If Firestore fails, the email is still sent; if both fail, the visitor is invited to write to the address directly.

## Firebase (owner steps)

The project is `rostel-portfolio-v6`, Firestore `(default)`, with deny-all client rules: only the server writes, with the service account.

```sh
# Rules and index overrides (firestore.rules, firestore.indexes.json)
firebase deploy --only firestore:rules,firestore:indexes --project rostel-portfolio-v6

# Delete submissions automatically 24 months after receipt (TTL on expireAt)
gcloud firestore fields ttls update expireAt --collection-group=submissions --enable-ttl --project=rostel-portfolio-v6
```

Collections: `submissions` (brief and contact answers, locale, `createdAt`, `expireAt`; no IP, no user agent) and `stats_daily/{YYYY-MM-DD}` (page views per known path, referrer hosts, countries). Tests never touch this project: Playwright runs against the emulator (`demo-rostel-portfolio`), and the PDF and poster scripts run the server with no credentials.

## Deployment (Coolify)

Coolify builds the `Dockerfile`: a pnpm install, `pnpm build`, then a small runtime image that only contains `.next/standalone` (with `public/` and `.next/static/` copied in) and runs `node server.js` on port 3000 as the `node` user. The image has a health check on `/api/health`. Set the environment variables above in Coolify (`NEXT_PUBLIC_SITE_URL` is a build argument).

Every response carries security headers (`next.config.ts`): `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` and HSTS. There is no Content-Security-Policy yet (follow-up: the inline early script in the locale layout needs a nonce or a hash first).

### Cloudflare

The domain is proxied by Cloudflare, then Coolify's Traefik forwards to the app.

- Restrict the origin to Cloudflare's IP ranges (firewall or Traefik allow-list). Anyone who can reach the origin directly can forge `cf-connecting-ip` and dodge the rate limits.
- Keep Bot Fight Mode and challenges off, or update the privacy policy: they set a Cloudflare cookie (`__cf_bm`), and the policy states that the site sets none.
- The privacy policy names Cloudflare, Inc. (United States) as the network provider that sees visitors' IP addresses in transit and gives the country.

## Owner rules

The site must not look generated. These rules are checked in code (`tools/owner-rules.ts`, run on the build by `pnpm lint:rules`) and in review:

- No em dash in any text the site shows. French text uses the typographic apostrophe (’) and a no-break space before `: ; ? !`.
- No purple gradient, no pill shapes (controls keep a 2 px radius at most), no emoji used as icons, no custom cursor, no "made with AI" tag.
- Signal orange (`#ff5a1f`) is the only saturated colour (rule `single-accent`); hairline and edge greys are never used for text. No fake status or loading screen (rule `fake-status`).
- Every page has a favicon; the privacy policy and the terms exist in both languages.
- Honesty: only metrics the owner confirmed, credited co-authors, no private repositories, explorations always labelled as proposals (unsolicited, or presented to the client).
- Accessibility: WCAG 2.2 AA, visible focus, labelled forms.
- Performance: the home page's initial JS stays within 160 KB gzip.
