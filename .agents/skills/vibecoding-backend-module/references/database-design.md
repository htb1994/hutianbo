# Database design (backend modules)

Full rules: [vibecoding-verify/references/database-design.md](../../vibecoding-verify/references/database-design.md)

Quick checklist when authoring migrations:

- [ ] Files in `migrations/sqlite/` and `migrations/pg/` with **same filename**
- [ ] Next global `NNNN_` prefix (scaffold computes this)
- [ ] `id TEXT PRIMARY KEY` — app generates via `nanoid()`
- [ ] sqlite: booleans as `INTEGER DEFAULT 0`, timestamps as `TEXT`
- [ ] pg: booleans as `BOOLEAN`, timestamps as `TIMESTAMPTZ`
- [ ] No AUTOINCREMENT / SERIAL for business IDs
- [ ] Repository uses `?` placeholders only
