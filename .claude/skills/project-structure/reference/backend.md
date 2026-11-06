# Backend structure — the reasoning

Read the section you need, not the whole file. `Foo` / `foos` stand for any resource.

## Layers and who imports whom

`routers → use-cases → persistency → shared`. The folder tells you the layer, not the feature, so a
new feature adds files to every layer instead of opening a `foos/` silo. The cost is that one feature
spans three folders; the payoff is that a layer can be read, tested and replaced on its own, and a
listing of `routers/` is a listing of the API.

A layer folder only exists once something lives in it. There is no `integrations/` until an outbound
adapter that is not the database needs one.

## The request path

```
HTTP → router → command/query bus → handler → unit of work → repository (port) → adapter → DB
```

- **The router holds no logic.** It translates HTTP into a command or a query and returns what the
  bus produces. Rules live in handlers, which are tested without booting a server.
- **Commands write and open a transaction; queries only read.**
- **The message is its own file.** A command is a class, so it exists at runtime. If it shares a file
  with its handler, importing the message drags the handler, the unit of work and the ORM into the
  router. Router imports `.command`/`.query`; only the group module imports `.handler`.
- **A health or liveness probe may skip the bus.** It has no rule and no transaction, and an
  orchestrator polls it every few seconds. Make it the single, documented exception, and do not let a
  real use case claim it.

## Unit of work and repositories

- A command handler injects the app's unit of work (`AppUnitOfWork`) **alone**, never the
  repositories, and writes inside `execute(async ({ foos }) => { ... })`.
- `execute` opens the transaction and publishes its handle in a request-scoped context
  (`AsyncLocalStorage` in Node); the repositories read it from there, so one rollback covers
  everything written. A nested `execute` joins the outer transaction.
- **One unit of work for the whole app.** `AppUnitOfWork` exposes every repository, so a handler that
  writes to several of them commits or rolls back as a whole, and a new repository is one more
  property on it. A handler destructures only what it uses. The cost: a test double of the unit of
  work supplies every repository it exposes.
- **Never commit inside a repository.** That is what turns a two-repository handler into two
  transactions.
- The base repository (`base.repository.ts` port, `base.repository.adapter.ts` adapter) holds what
  every repository shares: `findAll`, `findById` and `save`. Its adapter exposes a `repository`
  getter that picks the transaction's manager when there is one, the plain connection otherwise.
  What depends on an entity's fields stays in that aggregate's own repository: `create`, lookups by
  a field, and the `order` that `findAll` uses.

## Ports and adapters

- Ports are **abstract classes**, not interfaces: an interface does not exist at runtime and cannot
  be an injection token.
- `<name>.ts` is the port and `<name>.adapter.ts` the adapter (class `<Name>Adapter`), in every
  subfolder. The driver stays out of the name, so swapping it renames no file, and the
  framework's decorators and the ORM stay out of what a use case imports.
- `persistency.module.ts` is the only file that knows both sides. It is global, so group modules
  import nothing for persistence.
- Each subfolder splits again by whatever it is indexed by (aggregate, dependency), with what all of
  them share kept above:

| Folder | One folder per | Shared, above them |
|---|---|---|
| `repositories/` | aggregate | base repository (port and adapter), error-translation helpers |
| `transactions/` | nothing: the app has one unit of work, in `app/` | the mechanism files, written once |
| `checks/` | dependency | nothing yet |

- **A uniqueness rule lives in the schema.** The handler's pre-check is only the friendly path: two
  concurrent requests both read "not taken". The unique index decides, and the adapter translates the
  driver's duplicate-key error into a domain conflict. Keep both.
- **Domain errors know nothing about HTTP.** Handlers throw not-found, conflict, business-rule; a
  filter at the edge maps them to 404, 409, 422. An unmapped one is a 500, on purpose.

## Contracts

- `<group>/foo.contract.ts` holds only what more than one use case reads: the resource and its id.
  Everything else sits in `<use-case>/<use-case>.contract.ts`. Otherwise a group of ten use cases
  becomes one file of twenty-five schemas that every handler imports whole.
- The mapper (`foo.mapper.ts`) is the only place an entity becomes the public contract.
- Response shapes are declared on the route with the schema, so the API document carries them and the
  compiler fails if a method returns something else.

## One file, one thing

Types go in `types/<name>.types.ts` and constants in `constants/<what-it-holds>.ts`, beside the
module that needs them; the file that remains holds behaviour. Two things stay put: a type inferred
from a value in the same file (`z.infer<typeof FooSchema>`), and a private helper with one consumer.

## Modules and bootstrap

- One module per layer, the only three in `app.module.ts`: persistency, use cases, routers. Inside
  use cases, one module per group; the layer module only imports them. A new use case is one line in
  its group's module, so the diff names the group.
- A global pipe, interceptor or filter is registered through the framework's global-provider
  mechanism (the `APP_*` tokens in NestJS) in a module, never in `main.ts`. `main.ts` does not run
  in tests, so a global declared there would not exist in the integration suite: you would be
  testing a different app.

## Tests

```
src/<anything>/tests/<name>.unit-spec.ts      pure things: contracts, mappers, helpers
test/routers/<resource>.int-spec.ts           every route and status, through HTTP, real database
test/persistency/<aggregate>.repository.int-spec.ts   adapter with no handler in front (translations)
test/persistency/app.unit-of-work.int-spec.ts         proves execute wraps the work in ONE transaction
test/support/                                 containers, test app, HTTP helpers — no test in here
```

- Business rules go in the integration suite: a rule proved against a `Map` is proved against
  something with no unique index and no `NOT NULL`.
- A double extends the port and reimplements no query. The moment it filters in JavaScript it is a
  second copy of the SQL and the two drift silently.
- Doubles and factories live with the specs that use them: inside the file when one spec needs them,
  in the nearest shared `tests/` folder when several do. There is no top-level `test-doubles/`.
- Exclude every `**/tests/**` from the production build, not just `*spec.ts`, or a factory beside a
  spec compiles into `dist/`.
- Integration tests bring their own database (a container) and run the migrations; they must work in
  a clean checkout with no build step.

## Tooling that loads your code

The migration CLI, a test runner's global setup and one-off scripts do not always share your resolver
configuration. Entities, and everything they import, use relative paths; a global setup imports from
`src/` relatively. An alias there either fails or resolves to a stale build and runs old migrations.
