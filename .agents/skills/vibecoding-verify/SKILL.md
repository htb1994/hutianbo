---
name: vibecoding-verify
description: Validates module structure, migration pairs, database DDL rules, API contracts, and frontend-backend field alignment, then runs type-check and lint. Use before claiming any coding task done, after module/database/API changes, or when the user asks to verify architecture compliance.
---

# vibecoding-verify

Architecture completion gate for vibeCoding. **Lint green alone is not enough.**

## When to use

- Before telling the user a task is complete
- After adding or editing any module, migration, API route, or schema
- When the user asks to verify, check, or validate the project

## Mandatory workflow

1. Run from repository root:

```bash
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

2. If exit code is not `0`, read `[ARCH]` error codes and fix violations.
3. Re-run until you see `verify: ALL PASSED`.
4. Only then report completion.

## What gets checked

| Phase | Script | Rules |
|-------|--------|-------|
| Module split | `check-modules.mjs` | Required files, cross-module imports, fetch/request boundaries, route registration |
| Migrations | `check-migrations.mjs` | sqlite/pg pairs, global `NNNN_` numbering |
| Database DDL | `check-db-design.mjs` | TEXT id, no AUTOINCREMENT/SERIAL, dialect bool/time types |
| API contract | `check-api.mjs` | zod schema, success envelope, prefix `/api/<name>`, frontend api paths, field alignment |
| Code quality | `npm run type-check && npm run lint` | Both frontend and backend |

## Error code reference

- `MOD-*` — module anatomy or import boundary violation
- `MIG-*` — migration file pairing or numbering
- `DB-*` — SQL DDL design rule
- `API-*` — HTTP contract or frontend/backend alignment

## References (read when fixing failures)

- [module-anatomy.json](references/module-anatomy.json)
- [database-design.md](references/database-design.md)
- [api-contract.md](references/api-contract.md)
