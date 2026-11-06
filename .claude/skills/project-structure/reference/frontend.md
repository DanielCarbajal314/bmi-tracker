# Frontend structure — the reasoning

Read the section you need, not the whole file. `Foo` / `foos` stand for any feature.

## One folder per component

```
src/components/<Component>/
  index.tsx                 the component: JSX and composition
  apis/                     contract (schemas) + the calls that use it
  hooks/                    state, effects, handlers, cache keys
  constants/                values more than one file below shares
  components/<Child>/       the same shape, recursively
  tests/<Component>.unit-test.tsx
```

The **folder**, not a suffix, groups a component with everything only it uses. A folder named after
the component beats `Foo.tsx`, `Foo.hooks.ts`, `Foo.test.tsx` scattered in one directory.

- **The component holds no logic.** State, effects, derived values and handlers live in its
  `hooks/`; `index.tsx` reads one hook and returns JSX. It is the same split as a backend router: a
  thin edge over the part that holds the rules.
- **A hook used by one component lives inside it** and climbs to the parent's `hooks/` the day a
  second component needs it. A feature-level `use-foo-mutations.ts` sits at the feature root because
  a form and a list item both reach it.
- A folder only exists once it has something in it: no empty `constants/`, no `hooks/` that only
  re-exports a hook that already exists.

## `apis/` versus `shared/api/`

- `apis/<feature>.contract.ts` holds the schemas (Zod, or whichever library the project uses)
  mirrored from the backend; `apis/<feature>.api.ts` holds the calls (`listFoos`, `createFoo`).
  Plain exported functions, never an object grouping methods.
- `shared/api/` is transport: the fetch wrapper, the timeout, the error shape, the query client. It
  knows no domain and validates responses against the schema the caller hands it.
- **Cache keys are a hooks concern.** They live in `hooks/foo.keys.ts`, so `apis/` never imports the
  data-fetching library and stays testable with a plain `fetch` stub.
- **Contracts are mirrored by hand** unless the project generates them. Backend and frontend schemas
  change in the same commit; the split differs (backend by use case, frontend one file per feature).
  Only the schemas cross over, not the backend's DTO classes.

## Errors and toasts

- Failed mutations are reported once, centrally, by the query client. A failed query is reported only
  when it already had data; on a first load the component renders the error inline, and a toast
  would say the same thing twice.
- Success is never automatic: the mutation hook's own `onSuccess` decides, and it returns the
  `invalidateQueries` promise so the mutation waits for the refetch.
- No component calls the toast function directly.

## Routes

`routes/` declares routing and nothing else: which component answers which path, loaders, search
params. A route file that grows logic is a component in the wrong folder. Generated route trees are
never edited by hand.

## `components/ui/`

Design-system primitives follow the same shape as everything else, not the flat files a CLI writes:
one folder per primitive, named after what it exports, with `constants/` for variant definitions and
`components/<Part>/` for compound parts. A compound re-exports its parts from `index.tsx` and that
is the one barrel in the codebase, because the compound is one component. Re-adding a primitive with
the CLI is a manual merge, not an overwrite. Check what you move: casts hide in unlinted vendor code.

## Tests

- `tests/` folder beside what it tests, named after it: `tests/Foo.unit-test.tsx`, never
  `index.unit-test.tsx`. Four tabs called `index.unit-test.tsx` are indistinguishable.
- `src/test/` holds harnesses, not tests: a throwaway query client per test (never the app
  singleton, its cache outlives the test), a router wrapper, an app wrapper over a memory history,
  browser-API stubs the test DOM lacks. Router harnesses are async: without awaiting the router's
  load the first paint is the pending state.
- A mocked list response must match the contract the client validates, or the test passes through a
  path production never takes. Update fixtures when the contract changes.

## Classes that must stay classes

An error boundary stays a class: React exposes no hook for the catch lifecycle. Keep the state in the
boundary and the fallback UI as a component of its own.
