# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BMI tracker monorepo (spec in `weight-measuring-feature.md`). Everything runs in Docker through `make`; there is no root `package.json`.

- `backend/` — NestJS 12 on Bun, TypeORM, Postgres 17, Zod (`nestjs-zod`), CQRS (`@nestjs/cqrs`), OpenAPI at `/docs`.
- `frontend/` — React 19, Vite 8, TanStack Query, react-hook-form + Zod, Tailwind 4 + shadcn/ui, Vitest.
- `infrastructure/` — Terraform for AWS, laid out as `bootstrap/` (the S3 state bucket; its own state moves into that bucket after the first apply), `modules/*` and `environments/prod/` (see `infrastructure/README.md`). There are no deploy scripts: every deploy step is written inline in `.github/workflows/deploy.yml`.

Each project has its own `package.json` and `bun.lock`. Install inside `backend/` or `frontend/`, never at the root.

## Commands

Run `make help` for the full list. Targets run inside containers (`docker compose run`).

```bash
make up                  # db + migrate + backend + frontend, detached (make dev = foreground)
make down                # stop, keep data; `make clean` also deletes the DB volume
make typecheck           # backend + frontend `tsc --noEmit`
make lint                # backend ESLint, zero warnings allowed
make test                # backend unit + int, frontend unit
make backend-test-unit   # no database
make backend-test-int    # uses database `bmi_test`, created on demand
make format-check        # Prettier, frontend only (CI runs it); `make format` writes
make infra-validate      # terraform fmt -check + validate of both roots, no AWS needed
make infra-apply         # creates all of prod in one go: state bucket, ECR, first image, the rest
make gh-vars             # GitHub Actions variables for the deploy, read from the Terraform outputs
```

CI (`.github/workflows/ci.yml`) runs three jobs side by side: `backend` (typecheck, lint, test, prod image build), `frontend` (format-check, typecheck, test, production build) and `infra` (`infra-validate`). The `deploy` job needs all three and only runs for a push to `main`; it calls `deploy.yml`, which can also be started by hand (`workflow_dispatch`) to redeploy without a new commit and without the checks. Terraform is never applied by CI.

Single test file (container paths, run from repo root):

```bash
docker compose run --rm --no-deps backend bun test ./src/use-cases/participants/create-participant/tests/measurements.calculator.unit-spec.ts
docker compose run --rm backend sh -c 'DB_NAME=bmi_test bun test --preload ./test/support/setup.ts ./test/routers/participants.int-spec.ts'
docker compose run --rm --no-deps frontend bun --bun vitest run src/components/ParticipantsPage/tests/ParticipantsPage.unit-test.tsx
```

Bun filters test files by name unless the path starts with `./`; without it the file is "not matched". Only the backend has ESLint; the frontend has typecheck and Prettier.

### Migrations

`synchronize` is `false`; the schema changes only through a migration. After editing `backend/src/persistency/models/*.entity.ts`:

```bash
make migrate                              # bring the DB to the current head first (starts the DB)
make migration-generate name=AddFoo       # diffs entities against the live DB -> backend/src/migrations/
make migrate                              # apply
```

Read the generated file: TypeORM emits a rename as drop + create (data loss). `make migration-create name=X` makes an empty one; `make migration-revert` / `migration-show` exist.

## Architecture

### Backend (`backend/src`)

Layers, imports point one way: `routers → use-cases → persistency`; `config/` imports no layer. Crossing a layer uses the tsconfig aliases `#config/*`, `#routers/*`, `#use-cases/*`, `#persistency/*`, `#shared/*`; inside a layer use relative paths. Code loaded by tooling without alias support (`test/support/setup.ts`, the TypeORM CLI via `data-source.ts`) must use relative imports.

Request path: `HTTP → router → CommandBus/QueryBus → handler → unit of work / repository port → TypeORM adapter → Postgres`.

- **Routers** (`routers/*.router.ts`) only turn HTTP into a command/query and return the result. Use `@ZodResponse` on every route, health included (validates the response and documents it in OpenAPI; `test/routers/openapi.int-spec.ts` fails if a success response has no schema); `createZodDto` classes live in the router file. `ZodValidationPipe`, `ZodSerializerInterceptor` and `DomainErrorFilter` are global in `app.module.ts`. OpenAPI is built in `config/openapi/openapi.document.ts` and mounted at `/docs` by `openapi.ui.ts`, so tests can build it alone.
- **Domain errors**: handlers throw `NotFoundError` (404), `ConflictError` (409) or `BusinessRuleError` (422) from `shared/domain/domain-error.ts`, never HTTP exceptions. `routers/http/domain-error.filter.ts` maps them; an unmapped `DomainError` is a logged 500. A uniqueness rule also needs a unique index, the handler pre-check is only the friendly path. The validation pipe's 400 body (`errors[].message`) is what the frontend's `request.ts` reads; keep that shape.
- **Use cases** (`use-cases/<group>/<use-case>/`): `*.contract.ts` (Zod input), `*.command.ts` / `*.query.ts` (extend `Command<TResult>` / `Query<TResult>` so `bus.execute` is typed, never `any`), `*.handler.ts`, plus pure calculators with their `constants/`. A schema lives at the narrowest level that uses it: only what several use cases share goes in `<group>/<name>.contract.ts` (e.g. `participant.contract.ts`).
- **Persistency**: abstract classes are the ports (`participant.repository.ts`, `transactions/app/app.unit-of-work.ts`); `*.adapter.ts` files are the adapters (`participant.repository.adapter.ts`, class `ParticipantRepositoryAdapter`), so the driver's name stays out of file and class names. `persistency.module.ts` is the only place that binds a port to its adapter. Use cases import ports, never `*.adapter`.
- **Unit of work**: one `AppUnitOfWork` for the whole app; a new repository is added to `AppRepositories` (`transactions/app/types/`) and to `AppUnitOfWorkAdapter`. `execute(work)` opens a transaction, a nested call joins the outer one. `TransactionContext` carries the open transaction; `BaseRepository` uses it if present, else the plain connection. Repositories never commit. Writes go through the unit of work, reads (`ListParticipantsHandler`) may use the repository directly.
- **Config**: `EnvSchema` (Zod) is the single source for env vars. `buildDataSourceOptions` is shared by the Nest app and the TypeORM CLI and finds entities/migrations by glob, so it imports nothing from persistency. The backend never reads `.env` (`ignoreEnvFile: true`); `process.env` is filled by compose or `make`. `CORS_ORIGINS` (comma separated) is empty in development, where Vite proxies `/api`; in production it holds the frontend's CloudFront origin and `main.ts` turns CORS on only when it is set.
- **Domain quirks**: the API takes `age` and derives `birthday` (`birthday.calculator.ts`); `lastName` is validated but not stored (no column). Entered unit system is kept as given, the other is derived and rounded to 2 decimals. Entity fields `weightInLibs` / `heigntInMeters` copy the spec's spelling (`weight-measuring-feature.md`); do not "fix" them without a migration.

Tests: unit specs `*.unit-spec.ts` in a `tests/` folder beside the code (no DB); integration specs `*.int-spec.ts` in `backend/test/` boot the real `AppModule` against Postgres. `test/support/setup.ts` refuses any `DB_NAME` not ending in `_test`; `testApp.reset()` truncates every table except `migrations`. Response bodies are `unknown`: validate them with `bodyOf(response, Schema)` (`test/support/http.ts`), and use `rejectionOf(promise)` instead of `await expect().rejects` (Bun types it as `void`, which ESLint flags). Persistency has its own specs: `participant.repository.int-spec.ts` (search, filters, ordering) and `app.unit-of-work.int-spec.ts` (rollback).

Lint (`eslint.config.mjs`, type-aware, `--max-warnings 0`) enforces `no-explicit-any`, `no-unsafe-type-assertion` and `ban-ts-comment`. `noInlineConfig` is on, so `eslint-disable` comments do nothing: an exception goes in `eslint.config.mjs`, scoped to a path. `tsconfig.json` also sets `noUncheckedIndexedAccess` and `noImplicitOverride`. `package.json` aliases `typescript` to TS 6 (`@typescript/typescript6`) because typescript-eslint does not support TS 7; `tsc` still runs TS 7 through `@typescript/native`. Do not "fix" that alias until typescript-eslint supports TS 7.

### Frontend (`frontend/src`)

Single page: `main.tsx` renders `ParticipantsPage` directly (no router). Folder per component, recursively: `index.tsx` (JSX only), `hooks/` (state, effects, handlers, React Query keys/queries/mutations), `apis/` (`*.contract.ts` Zod schemas + `*.api.ts` calls), `constants/`, `components/<Child>/`, `tests/`.

- `shared/api/request.ts` is the transport: it knows no domain, the caller passes the Zod schema the response must match. `apis/` never imports React Query; keys and hooks live in `hooks/`.
- Errors: `request.ts` throws `ApiError` for everything. A 400 shows the backend's per-field messages; any 5xx shows `SERVER_ERROR_MESSAGE` whatever the body says (Nest's "Internal server error" or a proxy's HTML page help nobody); a response that fails the schema becomes `UNEXPECTED_ANSWER_MESSAGE` with the Zod error as `cause`; no connection or a 15 s timeout is `UNREACHABLE_MESSAGE`. The query client toasts failed mutations, and failed queries only when they already had data; a first load fails inline with a Retry button. `ErrorBoundary` wraps the app in `main.tsx` and is a class because React has no hook for render errors.
- Dev: Vite proxies `/api` to the backend (prefix stripped; `API_PROXY_TARGET`). Prod: there is no web server image. The Dockerfile's `dist` stage exports the static build, which the deploy workflow syncs to S3 behind CloudFront. The API address is baked in at build time from `VITE_API_BASE_URL` (default `/api`), so the browser calls the API's own CloudFront domain and the backend needs `CORS_ORIGINS`.
- `components/ui/` holds shadcn primitives, reshaped to one folder per component (`ui/Toaster/`, not flat `sonner.tsx`). `shadcn add` writes flat files; split them by hand and do not leave the flat file next to the folder.
- Tests: Vitest + Testing Library, `*.unit-test.{ts,tsx}` in `tests/`. Helpers live in `src/test/`.
- Import alias `@/` → `src/`. Prettier: single quotes, semicolons, trailing commas, width 100.

### Contracts are mirrored by hand

Backend contracts under `backend/src/use-cases/participants/**/*.contract.ts` and the frontend copy `frontend/src/components/ParticipantsPage/apis/participant.contract.ts` are separate files and nothing syncs them. Change both together. The frontend needs only the schemas; `createZodDto` classes stay in the backend. The limits in `measurement-limits.ts` and `unit-conversion.ts` are also duplicated on both sides.

### Runtime / deploy topology

Local: compose services `database`, `migrate` (runs `migration:run`, exits), `backend`, `frontend`; backend and migrate share image `bmi-backend:dev`. `backend/src` and `frontend/src` are bind-mounted, so source edits hot-reload; changes to `package.json`, `Dockerfile`, `tsconfig.json`, `eslint.config.mjs`, `vite.config.ts` or `frontend/index.html` need `make build`/`make up` (rebuild). Editing `.env` needs `make up` to recreate containers. The prod backend image runs the TypeScript directly with Bun, no build step, and drops every `tests/` folder (the `prod-src` stage).

AWS (`infrastructure/`): the frontend is an S3 bucket behind CloudFront. The backend is a Fargate service behind an ALB whose security group only accepts CloudFront's addresses; a second CloudFront distribution gives the API HTTPS without a domain. RDS is in private subnets with `DB_SSL=true`, credentials from its own Secrets Manager secret. Migrations are a separate one-shot ECS task (`<project>-migrations`, the backend image with `bun run migration:run`), not a sidecar.

Deploys are the steps of `.github/workflows/deploy.yml`, all inline: build and push the backend image (skipped if the tag already exists, tags are immutable) → register a task definition revision with the new image for the migrations task and the backend → run the migrations to completion → move the service, wait for it and check ECS did not roll back → call `/health` → build the frontend, sync it to S3 and invalidate CloudFront. CI owns the running image: the task definitions use `lifecycle { ignore_changes = [container_definitions] }` and the service ignores `task_definition`, so to change variables, secrets, cpu or memory in Terraform, drop that block, apply with `IMAGE_TAG` set to the running tag, and put it back. Migrations run while the old tasks still serve, so they must be backward compatible. CI authenticates with OIDC; the deploy role only trusts `main` and the deploy job must not declare a GitHub `environment` (that changes the token subject).

## Conventions

- No `any`, no `@ts-ignore` / `@ts-expect-error`; validate untyped data with Zod instead of casting. Enforced by ESLint in the backend only.
- No namespace objects: export plain functions (`listParticipants()`, not `participantApi.list()`).
- Comments in English, short, say *why*.
- `frontend/src/routeTree.gen.ts` must never be edited (denied in settings; it does not exist yet).
- Claude's settings deny reading or editing `.env` and editing `.claude/settings*.json` and `.claude/hooks/**`. Change `.env.example` and tell the user to update `.env`.

## `.claude` hooks and skills

The hooks run in Docker through `make`, like everything else here, so they need Docker running. They and `settings.json` are edited by hand by the user (the settings deny Claude's edits):

- `guard_commit.py` runs before `git commit`. For each project with pending changes it runs `make backend-typecheck backend-lint backend-test-unit` (backend), `make format-check frontend-typecheck frontend-test` (frontend) or `make infra-validate` (infrastructure). The integration tests stay out; CI and `make test` run them.
- `related_tests.py` runs after every TS edit: it runs the unit test beside the file (`tests/<name>.unit-spec.ts`, or `<name>.unit-test.ts[x]` in the frontend) and does nothing when there is none.
- `guard_install.py` blocks `bun|pnpm|npm|yarn install|add` at the repo root, `migration_reminder.py` reminds about `make migration-generate` after an entity edit, and `protect_config.py` keeps Bash away from `.claude/settings*.json` and `.claude/hooks/`.

Some skills and docs were written for another stack (pnpm, Jest, ESLint, Testcontainers, `make verify` / `make db` / `make migration`): `.claude/skills/troubleshooting`, `.claude/skills/auto-migrate`, and `.claude/docs/hard-rules.md` (which also mentions a frontend ESLint config, `routeTree.gen.ts` and `todos` examples that do not exist). Treat them as conventions to read, not as commands to run; only the rules above are verified against this code.
- `.claude/skills/project-structure` names adapters `*.adapter.ts` and keeps one app-wide unit of work, as the code does; it calls the health folder `checks/` where the code has `probes/`. The user-level skill at `~/.claude/skills/project-structure` uses `<driver>-foo.repository.ts` and one unit of work per group; the code does not follow that.
