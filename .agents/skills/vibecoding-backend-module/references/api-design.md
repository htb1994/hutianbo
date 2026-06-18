# API design (backend modules)

Full rules: [vibecoding-verify/references/api-contract.md](../../vibecoding-verify/references/api-contract.md)

Quick checklist:

- [ ] All request/response shapes in `<name>.schema.ts`
- [ ] Controller calls `.parse()` on every input
- [ ] Controller returns `success(data)` only
- [ ] Module prefix `/api/<name>` in `index.ts`
- [ ] Plugin registered in `backend/src/routes.ts`

Example prefix registration:

```ts
await app.register(noteRoutes, { prefix: '/api/note' })
```
