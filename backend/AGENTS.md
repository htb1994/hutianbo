# Backend Agents Guide

Node.js + Fastify + TypeScript + zod + a pluggable database layer
(`better-sqlite3` for demo, `pg` for production). Switched via `DB_DIALECT`.

## Layout

```
src/
  server.ts                # process entry: initDb -> buildApp -> listen
  app.ts                   # builds the Fastify instance
  routes.ts                # aggregates module plugins
  config/env.ts            # zod-validated environment
  plugins/                 # cors, logger, error-handler
  middleware/              # generic preHandlers (auth, ...)
  utils/                   # http-error, response, id, logger
  db/                      # Database interface + adapters + migrator
    types.ts
    adapters/sqlite.adapter.ts
    adapters/pg.adapter.ts
    index.ts               # initDb / closeDb / db singleton
    migrator.ts            # discovery & application of module migrations
  modules/<name>/          # closed-loop feature module (see below)
```

## Closed-loop module rules (MUST)

Every business feature lives under `src/modules/<name>/` with **exactly**
this skeleton:

```
modules/<name>/
  migrations/
    sqlite/NNNN_xxx.sql
    pg/NNNN_xxx.sql
  <name>.schema.ts         # zod schemas (request/response/path)
  <name>.types.ts          # types inferred from schemas + DB row types
  <name>.repository.ts     # SQL via the `db` interface
  <name>.service.ts        # business rules, throws AppError on failure
  <name>.controller.ts     # parses req with zod, calls service, returns success()
  <name>.routes.ts         # registers HTTP verbs against controller methods
  index.ts                 # default export: a fastify-plugin function
```

**Hard rules**:

- Module files only import from siblings, `@/db`, `@/utils`, `@/plugins`,
  `@/middleware`, `@/config/env`. Never from another module's internals.
- The module's only public surface is `index.ts`.
- All HTTP responses MUST go through `success()` / be thrown as `AppError`;
  the global error handler emits `{ code, data, message }` automatically.
- Validation lives in `<name>.schema.ts` only. Controllers `parse()` with
  the schema; services accept the inferred input type.
- Repositories are the only place SQL appears. Services and controllers must
  not call the driver or assemble SQL.

## Database conventions (cross-dialect compatibility)

The `db` interface is dialect-agnostic. To stay portable across sqlite/pg:

- Always use `?` placeholders. The pg adapter rewrites them to `$N`.
- Booleans: insert as `0/1`. The repository normalises rows back into
  `boolean` (sqlite returns `number`, pg returns `boolean`). Do this in
  the repository's `toDomain` helper.
- Timestamps: store as ISO string in sqlite (`TEXT`), as `TIMESTAMPTZ` in
  pg. Repositories should always return ISO strings to the service layer.
- JSON: store as `TEXT`; serialize with `JSON.stringify` / parse with
  `JSON.parse` in the repository. Don't use pg's `JSONB` type.
- IDs: never use auto-increment. Generate with `nanoid()` from `@/utils/id`
  for consistent behaviour and length across dialects.

## Migrations

- Each module owns its migrations under `modules/<name>/migrations/{sqlite,pg}/`.
- Filenames are globally sorted: `NNNN_<descriptive-snake>.sql`. Use
  contiguous `NNNN` numbering across **all** modules; the migrator picks them
  up in lexical order.
- For sqlite, `initDb()` runs pending migrations on every boot
  (idempotent, fast).
- For postgres, run `npm run db:migrate` explicitly before deploying.
  `initDb()` does NOT auto-migrate against postgres.

## Adding a new module

```bash
cp -r src/modules/todo src/modules/<name>
# rename `todo` -> `<name>` inside files
```

Then:

1. Update the URL prefix in `<name>/index.ts`.
2. Register the plugin in `src/routes.ts`.
3. Author migrations under `modules/<name>/migrations/{sqlite,pg}/` with the
   next `NNNN` numbers.
4. (Optional) add `preHandler: requireAuth` to protected routes.

## Quickstart

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:3000  (sqlite, auto-migrates)

# Switch to postgres:
#   set DB_DIALECT=postgres and DATABASE_URL in .env
npm run db:migrate
npm run start
```
