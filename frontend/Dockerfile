# syntax=docker/dockerfile:1
FROM oven/bun:1.4.0-debian AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /usr/local/bin/bun /usr/local/bin/bun
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public values are compiled into the browser bundle. Auth credentials are runtime-only.
ARG NEXT_PUBLIC_API_BASE_URL=https://vey.dorriss.com
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_TELEMETRY_DISABLED=1
# Next.js imports auth during build without connecting to the database.
# Generate a disposable secret for this process; never copy production secrets into layers.
RUN BETTER_AUTH_DATABASE_URL=postgresql://localhost:5432/vey_build \
    BETTER_AUTH_URL=http://localhost:3000 \
    BETTER_AUTH_SECRET="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')" \
    bun run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
