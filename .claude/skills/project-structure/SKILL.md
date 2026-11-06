---
name: project-structure
description: Reusable structure conventions for TypeScript web projects — where each file goes, which layer may import which, and how files and tests are named. Covers a layered backend (routers, use cases, persistency; commands and queries; ports and adapters; unit of work) and a React frontend (folder per component, apis/ and hooks/ split, shared transport). Use when starting a project, adding a resource, use case or component, deciding where a file belongs, reviewing a layout, or porting this shape to another stack. Domain-free - swap the nouns, keep the shape.
---
# Project structure

Structure only: where things go, who may import whom, how things are named. No business rules and no
domain. `Foo` / `foos` stand for any resource of the project at hand: replace them, keep the shape.

Backend and frontend are separate projects, each with its own manifest and lockfile (a monorepo
workspace works too: the rules apply inside each project). If the repo already has a layout, keep it
and apply the rules below inside it.

Read the section you need in `reference/backend.md` or `reference/frontend.md` before a
non-trivial change. They hold the reasoning behind each rule.

## The rules that carry the shape

1. **Layers at the top, features inside them.** A folder name says which layer you are in, never
   which feature: `routers/`, `use-cases/`, `persistency/` — not `foos/` holding everything about foos.
2. **Dependencies point one way:** `routers → use-cases → persistency → shared`. A lower layer never
   imports a higher one. `shared/` and `config/` import no layer.
3. **Thin edges.** A router turns HTTP into a message and returns the answer, with no rules. A
   component returns JSX and reads one hook; state, effects and handlers live in `hooks/`.
4. **One file, one thing.** A port is not its adapter. A message is not its handler. Behaviour does
   not share a file with a hand-written type or an exported constant. Two exceptions: a type
   inferred from a value right beside it, and a private helper with a single consumer.
5. **Use cases import ports, never adapters.** Ports are what code depends on; one module binds each
   port to its adapter, and nothing else knows both.
6. **The narrowest scope wins.** A schema, hook, constant or test double starts inside its one
   consumer and climbs to the parent only when a second real consumer appears, not in anticipation.
7. **A name says what it is.** Suffix and folder tell the kind of file and the test suite on sight.
8. **A folder exists only once it holds something.** No empty `constants/`, no pass-through `hooks/`.
9. **One unit of work.** The app has a single unit of work that exposes every repository. A new
   repository is one more property on it, never a second unit of work.

## Backend

```
backend/src/
  main.ts                    bootstrap only: nothing a test needs may live here
  app.module.ts              the layer modules + global providers; changes almost never
  config/<concern>/          env/ database/ logging/ ... each with tests/, types/, constants/ as needed
  routers/                   one file per resource: foos.router.ts
    http/                    edge mechanism: validation pipe, error filter, param decorators
  use-cases/
    use-cases.module.ts      imports the group modules, declares no provider
    <group>/                 foos/
      foos.use-cases.module.ts   this group's handlers
      foo.contract.ts            only what several use cases share: the resource, its id
      foo.mapper.ts  foo.errors.ts  tests/
      <use-case>/            create-foo/
        create-foo.contract.ts   its input, read by nobody else
        create-foo.command.ts    the message (queries: list-foos.query.ts)
        create-foo.handler.ts    the handler alone
  persistency/
    models/                  foo.entity.ts
    repositories/            base.repository.ts + .adapter.ts, then one folder per aggregate:
      foo/                   foo.repository.ts (port) + foo.repository.adapter.ts (adapter)
    transactions/            the mechanism once, then the app's single unit of work:
      app/                   app.unit-of-work.ts (port) + app.unit-of-work.adapter.ts
    checks/<dependency>/     "does it answer?" port + adapter, read by the health router
    persistency.module.ts    the only file that knows a port and its adapter
  shared/domain/             domain errors; they know nothing about HTTP
  migrations/
backend/test/                integration only: runner config, support/, routers/, persistency/
```

Request path: `HTTP → router → command/query bus → handler → unit of work → repository port → adapter → DB`.

## Frontend

```
frontend/src/
  main.tsx                   router + providers wiring
  routes/                    routing only: which component answers which path
  components/<Component>/
    index.tsx                the component: JSX and composition
    apis/                    <feature>.contract.ts (schemas) + <feature>.api.ts (the calls)
    hooks/                   state, effects, handlers, cache keys (<feature>.keys.ts)
    constants/               values more than one file below shares
    components/<Child>/      the same shape, recursively
    tests/                   <Component>.unit-test.tsx
  components/ui/             design-system primitives, one folder each, same shape
  shared/                    api/ (transport) config/ router/ theme/ — cross-cutting only
  test/                      harnesses, not tests
```

`apis/` is domain; `shared/api/` is transport and knows no domain. Cache keys live in `hooks/`, so
`apis/` never imports the data-fetching library.

## Naming

| Thing | Name | Where |
|---|---|---|
| port / adapter | `foo.repository.ts` / `foo.repository.adapter.ts` | `persistency/repositories/foo/` |
| unit of work | `app.unit-of-work.ts` (one for the whole app) | `persistency/transactions/app/` |
| health check | `database.check.ts` / `database.check.adapter.ts` | `persistency/checks/database/` |
| command / query / handler | `create-foo.command.ts` · `list-foos.query.ts` · `create-foo.handler.ts` | `use-cases/foos/create-foo/` |
| contract | `create-foo.contract.ts` (use case) · `foo.contract.ts` (shared) | beside its users |
| router | `foos.router.ts` (plural, like the URL) | `routers/` |
| hand-written types | `<name>.types.ts` | `types/` beside the module |
| exported constants | `<what-it-holds>.ts` | `constants/` beside the module |
| backend unit test | `<name>.unit-spec.ts` | `tests/` beside the code |
| backend integration | `<resource>.int-spec.ts` | `backend/test/<layer>/` |
| frontend unit test | `<Component>.unit-test.tsx` | `tests/` beside the component |
| frontend hook | `use-foo-queries.ts` · `use-foo-mutations.ts` | `hooks/` |

The suffix names the suite, so a failing line in CI says whether it needs a database. Configure each
runner's pattern explicitly rather than relying on a default.

## Imports

- **Crossing a layer uses an alias** (`#persistency/...` on the backend, `@/...` on the frontend);
  **staying inside a layer is relative**. The rule is what matters, not the mechanism: Node subpath
  imports (`imports` in `package.json`) or TS `paths` plus an alias-rewrite step both work.
- **Anything loaded by tooling that does not share your resolver config uses relative paths**: the
  migration CLI loads entities, and a test runner's global setup loads its own imports. A `#` alias there
  fails, or worse, silently resolves to a stale `dist/`.

## Adding a feature

**Backend, for `Foo`:**
1. `persistency/models/foo.entity.ts`, then the migration.
2. `repositories/foo/` port + adapter, bound in `persistency.module.ts`; add `foos` to
   `AppUnitOfWork` and its adapter in `transactions/app/`.
3. `use-cases/foos/`: module, `foo.contract.ts`, `foo.mapper.ts`; per use case a folder with
   contract, message and handler.
4. `routers/foos.router.ts`, listed in the routers module; the group module listed in
   `use-cases.module.ts`.
5. Tests: contract and mapper unit specs, plus `test/routers/foos.int-spec.ts` for every route and
   status against a real database. Business rules are proved there, not against an in-memory fake.
6. Mirror the contract in the frontend.

**Frontend, for `Foo`:**
1. `routes/foos.tsx`: routing only.
2. `components/Foo/` with `index.tsx`, `apis/foo.contract.ts` + `foo.api.ts`, `hooks/foo.keys.ts` +
   query and mutation hooks, `tests/Foo.unit-test.tsx`.
3. Children as `components/Foo/components/<Child>/`, same shape.

`app.module.ts` does not change for a new feature. A use case added to an existing group touches only
that group's module.

## Review checklist

Answer each with yes or no; a no is a finding.

- Does every import point down the layer order, with no cross-layer relative path?
- Is each port abstract and bound in exactly one module?
- Is there exactly one unit of work, with every repository on it?
- Does the router/component hold no rules, state or effects?
- Is every message in its own file, apart from its handler?
- Does each schema live at the narrowest level that uses it?
- Is every hand-written type or exported constant outside the file that uses it (inferred types and
  private one-consumer helpers excepted)?
- Does each test file's suffix and folder match its suite?
- Are there empty folders, or hooks that only re-export another hook?
- Do backend and frontend contracts change together?

## Porting to another stack

Keep the rules, swap the mechanism: another web framework changes the router and module syntax, not
the layers; no command bus means plain use-case classes with one `execute`; a different ORM changes
adapters only; Vue or Svelte keep folder-per-component, `apis/` vs `shared/api/`, and logic out of
the template. If the project is a single process, drop the two-project split and keep the layer
folders.
