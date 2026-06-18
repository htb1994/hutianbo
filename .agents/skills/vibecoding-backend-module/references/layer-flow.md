# Backend module layer flow

Implement in this order. Do not skip layers or put logic in the wrong file.

```
<name>.schema.ts     ← zod: wire contract (single source of truth)
       ↓
<name>.types.ts      ← z.infer + DB row types (TodoRow pattern)
       ↓
<name>.repository.ts ← SQL via db interface, ? placeholders, toDomain()
       ↓
<name>.service.ts    ← business rules, throws AppError
       ↓
<name>.controller.ts ← schema.parse() + success()
       ↓
<name>.routes.ts     ← Fastify route table
       ↓
index.ts             ← fastify-plugin, prefix /api/<name>
```

## File responsibilities

| File | Allowed | Forbidden |
|------|---------|-----------|
| schema | zod objects | business logic |
| repository | SQL, db calls | HTTP, zod parse |
| service | domain rules | SQL, req/reply |
| controller | parse, delegate, success() | business logic, SQL |
| routes | HTTP verb registration | logic |

See also: [database-design.md](../../vibecoding-verify/references/database-design.md) and [api-contract.md](../../vibecoding-verify/references/api-contract.md).
