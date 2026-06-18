# Frontend module anatomy

Required structure under `frontend/src/modules/<name>/`:

```
api/index.ts          ← only HTTP layer (http.get/post/...)
types/index.ts        ← mirrors backend schema fields
store/index.ts        ← pinia setup store
composables/          ← module-private hooks
components/           ← module-private UI
views/*.vue           ← routed pages
routes.ts             ← RouteRecordRaw[] export
index.ts              ← public re-exports only
```

Machine-readable checklist: [module-anatomy.json](../../vibecoding-verify/references/module-anatomy.json)
