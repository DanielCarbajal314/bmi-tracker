FROM oven/bun:1.4.4-alpine AS base
WORKDIR /app
COPY package.json bun.lock ./

# Development: all dependencies, source bind-mounted by docker-compose.
FROM base AS dev
RUN bun install --frozen-lockfile
COPY tsconfig.json eslint.config.mjs ./
COPY src ./src
CMD ["bun", "run", "start:dev"]

FROM base AS prod-deps
RUN bun install --frozen-lockfile --production

# The specs do not ship: every tests/ folder is dropped before the files reach the final image.
FROM base AS prod-src
COPY src ./src
RUN find src -type d -name tests -prune -exec rm -rf {} +

# Production: Bun runs the TypeScript sources directly, no build step.
FROM prod-deps AS prod
ENV NODE_ENV=production
COPY tsconfig.json ./
COPY --from=prod-src /app/src ./src
USER bun
CMD ["bun", "run", "start"]
