# syntax=docker/dockerfile:1.7
# ============================================================
#  Rostel Portfolio v3 — Production image (Coolify-ready)
#  Strategy: 2-stage build (builder + runtime), both on Debian slim.
#  - Builder compiles native deps (better-sqlite3, sharp) from prebuilt binaries.
#  - Runtime ships only Node + .output/, runs as non-root under tini.
#  - @nuxt/content's content database is baked into .output at build time.
# ============================================================

ARG NODE_VERSION=22.11.0

# ----------------------------------------------------------
#  STAGE 1 — Builder
# ----------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS builder

# Build-time deps for any package that needs to compile (very rare with
# prebuilt binaries, but better-sqlite3 / sharp can fall back to gyp).
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 \
      make \
      g++ \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Activate pnpm via corepack (pnpm version pinned by package.json packageManager
# if set, otherwise stable). Disable signature check to avoid corepack network calls.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    PNPM_HOME=/root/.local/share/pnpm \
    PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Cache deps layer separately from source.
COPY package.json pnpm-lock.yaml ./

# Install everything (dev included — Nuxt needs them at build).
# Cache the pnpm store across builds via BuildKit cache mount.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy sources. .dockerignore strips junk.
COPY . .

# Force production env so Nuxt builds with tree-shaking and route rules.
ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1

# Generate types + build the Nitro server bundle.
RUN pnpm nuxt prepare
RUN pnpm nuxt build

# Trim node_modules — Nitro has copied everything it needs into .output.
RUN rm -rf node_modules


# ----------------------------------------------------------
#  STAGE 2 — Runtime
# ----------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS runtime

# tini = correct PID 1 (forwards signals, reaps zombies).
RUN apt-get update && apt-get install -y --no-install-recommends \
      tini \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Non-root user.
RUN groupadd -r app && useradd -r -g app -m -d /home/app -s /bin/false app

WORKDIR /app

# Copy the self-contained Nitro output (server + public + nodes_modules).
COPY --from=builder --chown=app:app /app/.output ./.output

# Coolify reads PORT from the env; Nitro listens on HOST:PORT.
# These can be overridden from the Coolify dashboard.
ENV HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000 \
    NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1

USER app
EXPOSE 3000

# Container-level health probe — Coolify uses this for blue/green swap.
# /api/health is provided by server/api/health.get.ts.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+process.env.PORT+'/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", ".output/server/index.mjs"]
