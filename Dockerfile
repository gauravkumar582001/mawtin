# syntax=docker/dockerfile:1.7
# Mawtin web — Next.js 16 standalone output on Node 22 (Alpine)

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS build
COPY . .
# Values baked into the client bundle at build time
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_DEMO_MODE=false
ARG NEXT_PUBLIC_MEDIA_HOST=localhost
ARG API_URL=http://api:4000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE NEXT_PUBLIC_MEDIA_HOST=$NEXT_PUBLIC_MEDIA_HOST API_URL=$API_URL
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/robots.txt >/dev/null || exit 1
CMD ["node", "server.js"]
