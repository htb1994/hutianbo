# Database design rules (vibeCoding)

## Ownership

- DDL lives under `backend/src/modules/<name>/migrations/{sqlite,pg}/`.
- No central migrations directory outside modules.

## Primary keys

- Business IDs: `id TEXT PRIMARY KEY`, generated in application code via `nanoid()`.
- Never use `AUTOINCREMENT`, `SERIAL`, or `BIGSERIAL` for business entity IDs.

## Cross-dialect column types

| Concern | sqlite | postgres |
|---------|--------|----------|
| Boolean | `INTEGER NOT NULL DEFAULT 0` (0/1) | `BOOLEAN NOT NULL DEFAULT FALSE` |
| Timestamp | `TEXT NOT NULL` (ISO string) | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` |
| JSON | `TEXT` + app-layer parse/stringify | `TEXT` + app-layer parse/stringify |

## Repository layer

- All SQL goes in `<name>.repository.ts` only.
- Use `?` placeholders; never `$1` (pg adapter rewrites `?` → `$N`).
- Normalise bool/timestamp in `toDomain()` before returning to service layer.

## Migration numbering

- Filename: `NNNN_<snake_description>.sql` (four-digit prefix).
- Prefix `NNNN` is **globally unique** across all modules.
- Every sqlite migration must have a matching pg file with the same filename.
