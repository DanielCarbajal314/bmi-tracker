---
name: auto-migrate
description: When editing or adding any TypeORM entity under `backend/src/persistency/models/` (new entity, new field, type change, constraint change, rename, deletion), immediately follow up with `make migration name="<descriptive-msg>"` so the schema and the migration history stay in sync. Use this skill any time you touch files in `persistency/models/`.
---
# Auto-migrate on entity changes

Any change to a file under `backend/src/persistency/models/` (`*.entity.ts`) — adding an entity,
adding/removing a column, changing a type, changing a constraint (nullable, unique, default), changing
a primary/foreign key, or renaming — **must** be followed by a TypeORM migration. The entity file
alone changes the TypeScript mapping; the database schema only changes when a migration runs.
`synchronize` is `false` on purpose (see CLAUDE.md) — nothing else applies the change.

## What to do, every time

1. Finish the entity edit.
2. Make sure a **live** database is up and at the previous head — `migration:generate` diffs against
   the real database, not against the previous entity state:
   ```
   make db          # Postgres only, waits until healthy
   make migrate      # apply whatever is already pending, first
   ```
3. Generate the migration through `make` (it exports `.env` for you — a bare `pnpm migration:generate`
   on the host fails with `Invalid environment variables: DATABASE_URL`):
   ```
   make migration name="<DescriptiveName>"
   ```
   Examples: `name="AddFooDueDate"`, `name="FooStatusEnum"`, `name="TitleUniqueIndex"`.
4. **Read the generated file** in `backend/src/migrations/`. TypeORM's diff is honest about the schema
   but not about intent — verify:
   - **A rename comes out as drop + create**, which loses data. If this was a rename, rewrite the
     migration to `ALTER TABLE ... RENAME COLUMN` (or the entity/table equivalent) by hand.
   - Column types and constraints (nullable, default, unique) match what you intended.
   - A new unique constraint that should back a handler's pre-check (see `ConflictError` /
     `unique-violation.ts` in `backend-structure/reference/architecture.md`) is actually present as an index, not just a check in code.
   - Enum columns list the exact values your TS enum has.
   - Index creates/drops are intentional, not incidental churn from column reordering.
5. Apply it:
   ```
   make migrate
   ```
   In Docker, the `migrations` service reruns this on `make up` — but only if its own compose mount
   for `migrations` is intact; see the `troubleshooting` skill (Docker section) about a stale image reporting success.

## What runs under the hood

`make migration name=...` / `make migrate` export the root `.env` and then run, from `backend/`:
```
pnpm migration:generate src/migrations/<DescriptiveName>   # needs DATABASE_URL, a live DB
pnpm migration:run
```
The CLI's `data-source.ts` calls `validateEnv(process.env)` (the same Zod `EnvSchema` the app uses) and
builds the `DataSource` from `DATABASE_URL` inside it — no dotenv in the backend itself, which is why
this only works through `make` (`-include .env` + `export` at the top of the Makefile) or an exported
`.env`.

Two things the migration CLI does differently from the running app, both in
`config/database/migration.options.ts`:
- **`statement_timeout` and the idle-in-transaction cap are disabled.** A legitimate migration can
  run longer than an HTTP-request ceiling. Don't unify these with the app's timeouts.
- **Logging is forced to `["query","error","schema"]`** regardless of `DATABASE_LOGGING`, so you see
  the SQL being applied. Not a bug, not the `.env` being ignored.

## Preconditions

- A database must be reachable (`make db`) and at the previous migration head — generating against a
  stale head produces a diff against the wrong baseline.
- `DATABASE_URL` must resolve — through `make`, or by exporting the root `.env` yourself first.

## Common gotchas

- **Empty migration generated** → the entity change didn't actually change the mapped columns (e.g. a
  TS-only type narrowing), or the DB wasn't at the head you think it was. Confirm with `make migrate`
  first, then regenerate.
- **Migration drops a column/table you didn't touch** → some other entity changed unmapped from what's
  in the DB; check for an entity edited without regenerating earlier, or a manual DB change.
- **Rename generated as drop + create** → always. TypeORM's diff has no rename detection. Rewrite by
  hand before running it — this is the one you must never apply as generated on data you care about.
- **Enum value rename doesn't diff cleanly** → Postgres native enums often need an explicit
  `ALTER TYPE ... RENAME VALUE ...` written by hand into the generated file.

## When NOT to skip

You can skip the migration step **only** for:
- Adding/changing comments, JSDoc, or non-mapped TS helpers on the entity class.
- Pure type-hint tightening that doesn't change the TypeORM column definition (e.g. narrowing a
  already-`@Column({ nullable: false })` field's TS type from `string | undefined` to `string`).
- Anything not decorated with `@Column`/`@PrimaryColumn`/`@OneToMany` etc. — i.e. it isn't mapped.

If unsure whether a change is schema-affecting, run `make migration name="..."` anyway — an empty
migration is harmless and tells you the diff saw nothing; delete it or keep it as a no-op marker.

After any schema-affecting edit under `backend/src/persistency/models/` (new entity, new/removed
column, type or constraint change, rename), proactively run `make migration name="<DescriptiveName>"`,
then read the generated file in `backend/src/migrations/` before stopping — especially checking for a
rename disguised as drop + create.

**Why:** Editing the entity changes only the TypeScript mapping; the DB schema only changes when a
migration runs, and `synchronize: false` means nothing else will do it silently. A generated rename
that goes unreviewed drops the column's data.

**How to apply:** Triggers on any edit/add under `backend/src/persistency/models/`. Skip only for
non-schema changes (comments, TS-only narrowing on an already-correct column, non-`@Column` helpers).
When in doubt, still run it. The `auto-migrate` skill at `.claude/skills/auto-migrate/SKILL.md`
documents the full workflow.
