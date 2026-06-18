---
name: vibecoding-fullstack-module
description: Creates a complete full-stack feature module on both backend and frontend with aligned API contracts, database migrations, and module boundaries. Use when adding a new business feature end-to-end, full CRUD modules, or when the user asks for both API and UI for the same domain.
---

# vibecoding-fullstack-module

Use this skill when the user wants a **complete feature** (not just backend or frontend alone).

## Workflow

### 1. Plan the contract

- [ ] Choose module name `<name>` (lowercase, same on both sides)
- [ ] Read [references/contract-alignment.md](references/contract-alignment.md)
- [ ] Draft field mapping table (backend schema ↔ frontend types)

### 2. Backend (invoke `$vibecoding-backend-module`)

```bash
node .agents/skills/vibecoding-backend-module/scripts/scaffold.mjs <name>
```

- [ ] Customize `<name>.schema.ts` (Create / Update / Response)
- [ ] Customize migrations (sqlite + pg, same filename)
- [ ] Implement repository / service / controller
- [ ] Register in `backend/src/routes.ts`

### 3. Frontend (invoke `$vibecoding-frontend-module`)

```bash
node .agents/skills/vibecoding-frontend-module/scripts/scaffold.mjs <name>
```

- [ ] Copy response fields from backend `<Name>Schema` into `types/index.ts`
- [ ] Align `api/index.ts` paths with `/api/<name>` backend prefix
- [ ] Register `${name}Routes` in `frontend/src/router/index.ts`

### 4. Verify (mandatory)

```bash
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

Both sides must exist; `check-api.mjs` validates field alignment. Fix until `verify: ALL PASSED`.

## Related skills

- Backend only: `$vibecoding-backend-module`
- Frontend only: `$vibecoding-frontend-module`
- Architecture gate: `$vibecoding-verify`
