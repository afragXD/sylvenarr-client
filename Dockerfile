# syntax=docker/dockerfile:1

FROM oven/bun:1.3-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.3-alpine AS build
WORKDIR /app

# Проброс из Dokploy Build-time Arguments / Environment (.env)
# Vite вшивает VITE_* в бандл на `bun run build` — передавайте как Build Arguments в Dokploy.
# Runtime Environment (после старта контейнера) на них не влияет.
# `.env` в .dockerignore и в образ не копируется.
ARG VITE_SITE_URL
ARG VITE_API_BASE_URL
ARG VITE_STATIC_BASE_URL
ARG VITE_CONTACT_EMAIL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN if [ -z "$VITE_SITE_URL" ] || [ -z "$VITE_API_BASE_URL" ] || [ -z "$VITE_STATIC_BASE_URL" ]; then \
      echo "Missing VITE_SITE_URL / VITE_API_BASE_URL / VITE_STATIC_BASE_URL (Docker build args)" >&2; \
      exit 1; \
    fi; \
    if [ -z "$VITE_CONTACT_EMAIL" ]; then \
      echo "WARN: VITE_CONTACT_EMAIL empty at build — Privacy page will use fallback" >&2; \
    else \
      echo "VITE_CONTACT_EMAIL is set for build" >&2; \
    fi; \
    bun run build

FROM oven/bun:1.3-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /app/.output ./.output

USER bun
EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
