# syntax=docker/dockerfile:1

FROM oven/bun:1.3-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.3-alpine AS build
WORKDIR /app

ARG VITE_SITE_URL=http://localhost:3000
ARG VITE_API_BASE_URL=http://localhost:4000
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1.3-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /app/.output ./.output

USER bun
EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
