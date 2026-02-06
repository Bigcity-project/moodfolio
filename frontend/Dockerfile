# Stage 1: deps — install dependencies with layer caching
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

COPY --link package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: build — compile Next.js with standalone output
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --link . .

ARG API_URL=http://backend:5000
ENV API_URL=${API_URL}

RUN mkdir -p public && pnpm build

# Stage 3: runner — minimal production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy standalone server and static assets
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["node", "server.js"]
