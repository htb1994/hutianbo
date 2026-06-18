---
name: vibecoding-backend-module
description: Creates or modifies a closed-loop Fastify module with zod API contracts, db repository layer, and sqlite/pg migrations. Use when designing backend modules, REST endpoints, database tables, editing todo.schema/repository patterns, or adding backend CRUD features.
---

# vibecoding-backend-module

Closed-loop backend module workflow for vibeCoding.

## Phase A — Module split

- [ ] Confirm module name `<name>` (lowercase, matches URL `/api/<name>`)
- [ ] **New module**: `node .agents/skills/vibecoding-backend-module/scripts/scaffold.mjs <name>`
- [ ] Register plugin in [backend/src/routes.ts](../../../backend/src/routes.ts)

## Phase B — Database design

- [ ] Read [references/database-design.md](references/database-design.md)
- [ ] Ensure `migrations/sqlite/` and `migrations/pg/` have paired `NNNN_create_<name>.sql`
- [ ] Table uses `id TEXT PRIMARY KEY`; bool/time columns follow dialect rules
- [ ] Implement `<name>.repository.ts` with `db` interface and `toDomain()` normalisation

## Phase C — API design

- [ ] Read [references/api-design.md](references/api-design.md) and [references/layer-flow.md](references/layer-flow.md)
- [ ] Define Create/Update/Response schemas in `<name>.schema.ts` (only contract source)
- [ ] Controller: `.parse()` + `success()`; service: business rules; routes: REST verbs
- [ ] Prefix `/api/<name>` in `index.ts`

## Phase D — Verify (non-negotiable)

```bash
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

Fix all `[ARCH]` errors until exit 0. Do not claim done without `verify: ALL PASSED`.

## DO

```ts
// repository — ? placeholders, db interface
await db.execute('INSERT INTO note (id, title) VALUES (?, ?)', [id, title])

// controller — zod + envelope
const input = NoteCreateSchema.parse(req.body)
return reply.send(success(await noteService.create(input)))
```

## DON'T

```ts
import Database from 'better-sqlite3'  // forbidden in modules/
const rows = await db.query('SELECT * FROM note WHERE id = $1', [id])  // use ?
```
