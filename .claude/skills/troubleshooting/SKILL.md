---
name: troubleshooting
description: Known traps of this repo — Docker, env/.env, migrations CLI, builds (nest build, Vite 8/rolldown), shadcn CLI, CI Node versions, case-sensitive imports, stale watch mode, ports, pgAdmin. Use whenever something fails unexpectedly or behaves oddly (empty dist/, stale code in a container, "Invalid environment variables", a test dropped from the route tree, CI-only failures), or before touching docker-compose.yml, the Makefile, the .env, CI, or running the shadcn CLI, and before renaming or moving files or folders (case-sensitive imports in CI, stale nest watch).
---
# Troubleshooting and known traps

Moved verbatim from CLAUDE.md. Scan the headings, read what matches the symptom.

## Environment variables

**One `.env`, at the root.** Read by compose, by the Makefile (`-include .env` + `export`) and by
Vite (`envDir`). Do not create per-project `.env` files.

**The backend never reads it.** `ConfigModule` runs with `ignoreEnvFile: true` and `data-source.ts`
has no dotenv: the only source is `process.env`, and something else always fills it — compose in a
container, the Makefile on the host. One path, two injectors, no branch in the code.

The cost is that **host commands go through `make`**. `make dev-back`, `make migrate` and
`make verify` export the `.env` first; a bare `cd backend && pnpm migration:run` now dies with
`Invalid environment variables: DATABASE_URL`. That failure is the point — it used to silently read
a file the container never had.

Unit tests are unaffected (`validateEnv` takes literals) and so is `test:int`, where
`test/support/global-setup.ts` writes `DATABASE_URL` itself from the Testcontainers instance.

Secrets and public variables live side by side in there: anything prefixed `VITE_` ends up in the
bundle where anyone can read it. Never put `VITE_` on something you would not publish.

Two names that stay as they are:

- **`DATABASE_URL`** points at `localhost:5433`, which suits the backend running on the host.
  Inside the containers `docker-compose.yml` overrides it against the `db` service, because
  `localhost` there would be the container itself.
- **`BACKEND_PORT` and `FRONTEND_PORT`**, never a generic `PORT`: with a shared `.env` both Nest
  and Vite would read it and fight over the same port.

**Changing the `.env` does not reach a running container.** The environment block is fixed when the
container is created, so the `src` mount does nothing for it: run `make up` and compose recreates
whichever services the change affects.


## Docker

All three repo services mount their `src`, so they run the code on disk: there is hot reload and
`make up` never applies a stale migration. **The limit:** whatever sits inside `src/` is reflected
on its own; everything else needs `make rebuild` — `package.json`, `Dockerfile`, `vite.config.ts`,
`tsconfig.json` and, the one that catches people out, `frontend/index.html`, which sits next to
`src/` but outside it.

The `migrations` mount stays: without it, `up` runs the migrations frozen into the image, reports
"No migrations are pending" and leaves the schema behind **while reporting success**.

The database is ephemeral (no persistence volumes): `down` takes the data with it and the
`migrations` service rebuilds the schema on the next `up`.

## Known traps

- **Compose interpolates `${VAR}` as `""`** when the variable is missing from the `.env`, and to
  Zod `""` is invalid rather than absent. `validateEnv` drops empty keys before validating; in the
  compose file the optional variables are written `${VAR:-}` and the required ones `${VAR:?...}`.
  The second form matters where the value is *composed*: a bare `${POSTGRES_USER}` builds
  `postgres://:@db:5432/`, which passes the backend's URL check and fails only at connect time.
  With `:?`, `up` stops naming the variable.
- **The migration CLI disables `statement_timeout`** and the idle-in-transaction cap. A legitimate
  migration takes longer than the ceiling that suits an HTTP request. Do not unify it with the
  app's — `config/database/migration.options.ts` is where those two zeros live, and
  `config/database/tests/data-source.unit-spec.ts` fails if someone removes them. The builder sits apart from
  `config/database/data-source.ts` because that module validates the environment and constructs the
  `DataSource` at import time, and this runner has no dynamic import to defer that with.
- **The migration CLI also forces `logging: ["query","error","schema"]`**, so `migration:run`
  prints every query however `DATABASE_LOGGING` is set. TypeORM does it on purpose, in
  `MigrationRunCommand`, so you see the SQL being applied. It is not the `.env` being ignored.
- **`pino-pretty` is a devDependency.** The prod image installs with `--prod` and does not have it,
  which is why `LOG_PRETTY` defaults to on only in `development`. Forcing it in production kills
  the boot.
- **`pnpm verify` does not compile.** If you are about to run `pnpm start:prod`, run `pnpm build`
  first or you will execute a stale `dist/`.
- **`deleteOutDir` and `incremental` do not compose on their own.** `nest build` wipes `dist/`,
  and if the `.tsbuildinfo` sits outside it, tsc reads it, believes the output is up to date and
  **exits 0 having emitted nothing**. `tsconfig.build.json` puts it at
  `./dist/tsconfig.build.tsbuildinfo` so the wipe takes it too. A `nest build` that prints nothing
  and leaves no `dist/` is this, not a silent compile error.
- **Vite 8 bundles with rolldown**, which rejects Rollup's object form of `manualChunks`. Code
  splitting goes in `build.rolldownOptions.output.codeSplitting`.
- **`frontend/src/components/ui/**` is outside the lint** (shadcn generates it), accessibility
  rules included.
- **The shadcn CLI writes `ui/<registry-name>.tsx` flat; those components live in
  `ui/<Component>/index.tsx`, split like any other.** `components.json` has no setting for the
  layout, so `shadcn add <name>` lands a flat file that has to be taken apart by hand: renamed
  after what it exports (`sonner.tsx` becomes `ui/Toaster/`), its sub-components moved to
  `components/<Name>/index.tsx` and its shared class strings to `constants/`. Leave the flat file
  where it lands and it wins the resolution over the folder: two versions of the component, the
  added one shadowing the one in use, with nothing reporting it. A re-add is a manual merge, not
  an overwrite — budget for it before running the CLI on a component already in use.
- **In the CI workflow, `node-version-file` is relative to the repo root**, not to the job's
  `working-directory`. Each job points at its own project's `.nvmrc` (`backend/.nvmrc`,
  `frontend/.nvmrc`); pointed at the other's, a job verifies with a Node version its project never
  pinned, and nothing reports it while the two files happen to agree.
- **macOS resolves imports case-insensitively, Linux CI does not.** After renaming a folder, a
  missed import still works locally and fails only in CI. Compare the specifiers against the
  listing on disk, not against `test -d`, which lies on macOS too.
- **`nest start --watch` does not survive a rename.** Its incremental compile keeps the old file
  list and reports `error TS6053: File '.../<old-name>.ts' not found` forever, serving the previous
  `dist/` while it does. A container looks healthy and answers with stale code — verifying against
  it proves nothing. After renaming or moving files, `docker compose restart backend` (or restart
  `make dev-back`), then check the log says `Found 0 errors`.
- **Everything under `frontend/src/routes/` is scanned as a route file.** A test in there warns
  `does not export a Route` and is dropped from the tree; `routeFileIgnorePattern` in
  `vite.config.ts` already excludes `*.unit-test.tsx`.
- **`VITE_ENABLE_DEVTOOLS` is on in the repo `.env`**, so it is on inside the tests too. A test
  that needs the production path has to mock `@/shared/config/env`, not trust the ambient value.
- **Integration tests run on the host, not through `docker compose exec`**: Testcontainers needs to
  talk to the Docker daemon, and inside a container that would require docker-in-docker.
- **Default ports**: backend 3000, frontend 5173, Postgres 5433 on the host, pgAdmin 8080. If one
  is taken, change it in the root `.env`, not by editing the compose file.
- **`PGADMIN_DEFAULT_EMAIL` needs a real domain**: pgAdmin rejects reserved TLDs and ends up in a
  restart loop with `admin@something.local`.
