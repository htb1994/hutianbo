# Backend modules

Each subfolder is a **closed-loop business module**. See
[`../../AGENTS.md`](../../AGENTS.md) for the full contract.

## Anatomy of a module

```
<name>/
  migrations/
    sqlite/NNNN_<desc>.sql           # demo dialect DDL (auto-applied)
    pg/NNNN_<desc>.sql               # production dialect DDL (npm run db:migrate)
  <name>.schema.ts                   # zod request/response schemas
  <name>.types.ts                    # types inferred from schemas + DB row
  <name>.repository.ts               # SQL only; uses `db` from `@/db`
  <name>.service.ts                  # business rules, throws AppError
  <name>.controller.ts               # zod parse -> service -> success()
  <name>.routes.ts                   # registers Fastify routes
  index.ts                           # PUBLIC — fastify-plugin default export
```

## Checklist when adding a module

- [ ] Folder created with the structure above.
- [ ] `<name>.schema.ts` defines the wire contract; nothing else hand-rolls
      DTO types.
- [ ] Migrations exist for **both** dialects under `migrations/{sqlite,pg}/`,
      using the next globally-unique `NNNN` prefix.
- [ ] Repository uses `?` placeholders and normalises booleans/timestamps in
      `toDomain`.
- [ ] Service throws `AppError`/`NotFoundError`/etc. — never returns
      undefined for "not found".
- [ ] Controller methods always return `reply.send(success(data))`.
- [ ] `index.ts` is a `fastify-plugin` default export with a unique URL prefix.
- [ ] Plugin registered in `src/routes.ts`.

## Reference

The `todo/` module is the canonical reference implementation. Copy it as a
starting point.
