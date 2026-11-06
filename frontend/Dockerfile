FROM oven/bun:1.4.4-alpine AS base
WORKDIR /app
COPY package.json bun.lock ./

# Development: Vite dev server, source bind-mounted by docker-compose.
FROM base AS dev
RUN bun install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["bun", "run", "dev"]

# The API address is baked into the bundle, so the build takes it as an argument.
FROM base AS build
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Production: only the static files. The deploy workflow exports this stage
# (docker build --output) and uploads it to S3; there is no web server image.
FROM scratch AS dist
COPY --from=build /app/dist /
