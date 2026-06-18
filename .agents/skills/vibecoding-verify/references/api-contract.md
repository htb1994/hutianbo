# API contract rules (vibeCoding)

## Backend HTTP

- Module URL prefix: `/api/<moduleName>` (must match the folder name under `modules/`).
- Register the module plugin in `backend/src/routes.ts`.
- REST handlers live in `<name>.routes.ts`; business logic in service; SQL in repository.

## Request / response shapes

- **Single source of truth**: `<name>.schema.ts` (zod). Types via `z.infer`.
- Controllers: `Schema.parse(req.body|req.params)` then `reply.send(success(data))`.
- Never hand-write DTO interfaces that duplicate schema fields outside `.schema.ts`.

## Response envelope

```json
{ "code": 0, "data": { ... }, "message": "OK" }
```

Use `success()` from `@/utils/response`. Errors are thrown as `AppError` or zod failures (global handler normalises).

## Frontend HTTP client

- Only `modules/<name>/api/index.ts` may call `@/utils/request` / `http.*`.
- Path strings omit the `/api` prefix (baseURL is `/api`): e.g. `http.get('/todo')` → `/api/todo`.
- Views, components, stores, composables must not call `fetch()` directly.

## Frontend ↔ backend alignment

When both sides exist for module `<name>`:

- `frontend/src/modules/<name>/types/index.ts` response interface fields must cover backend `<Name>Schema` (camelCase keys).
- API paths in frontend `api/index.ts` must start with `/<moduleName>`.
