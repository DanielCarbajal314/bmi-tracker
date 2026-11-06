# Hard rules — full text

Moved verbatim from CLAUDE.md, which keeps a one-line summary of each.

## Hard rules

**No `any`, and no casts that launder it.** Both projects lint with type-aware rules, and on top of
`no-explicit-any` there is `no-unsafe-type-assertion`. When data genuinely arrives untyped there
are two ways out, and neither is asserting a type:

- validate at runtime with Zod (see `bodyOf` in `backend/test/support/http.ts`);
- depend on a narrow port that the test double can genuinely satisfy (`DatabaseCheck`,
  `TransactionRunner`).

**And the rule cannot be switched off from the code it governs.** `linterOptions.noInlineConfig` is
on in both `eslint.config.mjs`, so `// eslint-disable-next-line` and `/* eslint-disable */` do
nothing — ESLint reports them as having no effect and the original error still fails the build. The
neighbouring escapes are shut with it:

- **`@ts-expect-error` and `@ts-ignore` are both errors** (`ban-ts-comment`). Silencing the compiler
  is the same escape as `any`, one line lower. `// @ts-check` stays allowed.
- **`--max-warnings 0` in both `lint` scripts.** A rule dropped to `warn` is not a way out either.
- **`no-explicit-any` is spelled out in both configs**, not inherited, so a preset bump cannot
  downgrade it quietly.

An exception goes in `eslint.config.mjs`, scoped to a path, where a reviewer sees it. That is the
only door. The one `any` left in the repo is `frontend/src/routeTree.gen.ts`, which the router
plugin writes and lint ignores; it does not propagate, because what the file exports is typed
through `_addFileTypes`.

**`synchronize` stays `false`.** The schema only changes through a migration, not even
temporarily.

**HTTP responses use `@ZodResponse`**, not a bare `@ZodSerializerDto`. The former applies both,
puts the schema in the OpenAPI document and makes the compiler fail if the method returns anything
else. With `@ZodSerializerDto` alone the endpoint is documented **with no response schema**, and
`test/routers/openapi.int-spec.ts` is what fails when that happens — no other test would.

**The OpenAPI document is built apart from the UI.** `config/openapi/openapi.document.ts` returns it,
`config/openapi/openapi.ui.ts` mounts it and Scalar. Scalar ships ESM only and cannot be required from Jest,
so with one file the document could not be tested at all. `createDocument` runs with
`ignoreGlobalPrefix: true`: the prefix is declared once as the server, and with it on the paths
too a generated client resolves `/api/api/todos`.

**A schema lives at the narrowest level that uses it.** `<group>/<group>.contract.ts` holds only
what more than one use case reads — the resource and the id every route addressing one takes.
Everything else goes in the use case's own folder, `<use-case>/<use-case>.contract.ts`:
`CreateTodoSchema` is read by create-todo and by the route that feeds it, and by nothing else.
A group with ten use cases would otherwise have one file with twenty-five schemas that every
handler imports whole.

**Contracts are mirrored by hand.** The backend contracts and their copy at
`frontend/src/components/<Feature>/apis/<feature>.contract.ts` are separate files and nothing keeps
them in sync. Touch one, touch the other. **The split is backend-only**: the frontend has
components, not use cases, so one `<feature>.contract.ts` there mirrors the group's contract plus
whatever the use-case folders hold. The `createZodDto` classes stay on the backend: they are
nestjs-zod, and the frontend only needs the schemas, which is what `apiClient` validates responses
against.

**No namespace objects.** Export plain functions, never a `const` grouping methods — that shape is
a class of statics wearing a different hat, and it blocks tree-shaking of the members nobody calls.
`listTodos()`, not `todoApi.list()`; `apiGet()`, not `apiClient.get()`. When the flat name would be
too generic or is a reserved word, prefix it (`apiDelete`) rather than wrapping it back up.

**Comments in English, short.** They say *why*, not *what* — the what is already on the line below.
Two or three lines is enough; a ten-line block gets skipped.

**`frontend/src/routeTree.gen.ts` is generated.** The Vite plugin rewrites it on every start. Do
not edit it.

