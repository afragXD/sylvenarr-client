# syntax=docker/dockerfile:1

FROM oven/bun:1.3-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.3-alpine AS build
WORKDIR /app

# Проброс из Dokploy Build-time Arguments / Environment (.env)
ARG VITE_SITE_URL
ARG VITE_API_BASE_URL
ARG VITE_STATIC_BASE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_STATIC_BASE_URL=$VITE_STATIC_BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args (ARG/ENV) или .env из Dokploy «Create Environment File»
RUN set -a; \
    if [ -f .env ]; then . ./.env; fi; \
    set +a; \
    if [ -z "$VITE_SITE_URL" ] || [ -z "$VITE_API_BASE_URL" ] || [ -z "$VITE_STATIC_BASE_URL" ]; then \
      echo "Missing VITE_SITE_URL / VITE_API_BASE_URL / VITE_STATIC_BASE_URL (build args or .env)" >&2; \
      exit 1; \
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
