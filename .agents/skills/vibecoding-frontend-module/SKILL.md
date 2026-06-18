---
name: vibecoding-frontend-module
description: Creates or modifies a closed-loop Vue module with api client, pinia store, module routes, and types aligned to backend schemas. Use when adding frontend pages, API clients, module routes, or editing TodoListView/useTodoList patterns.
---

# vibecoding-frontend-module

Closed-loop frontend module workflow for vibeCoding.

## Phase A — Module split

- [ ] Confirm module name `<name>` (matches backend `/api/<name>` when full-stack)
- [ ] **New module**: `node .agents/skills/vibecoding-frontend-module/scripts/scaffold.mjs <name>`
- [ ] Register `${name}Routes` in [frontend/src/router/index.ts](../../../frontend/src/router/index.ts)

## Phase B — API client & types

- [ ] Read [references/api-client-design.md](references/api-client-design.md)
- [ ] `api/index.ts`: all HTTP via `http.*`; paths start with `/<name>`
- [ ] `types/index.ts`: fields cover backend `<Name>Schema` (id, … camelCase)
- [ ] Views/composables use `api/` or store — never `fetch()` or `@/utils/request`

## Phase C — Verify (non-negotiable)

```bash
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

## DO

```ts
// api/index.ts
export const noteApi = {
  list: () => http.get<Note[]>('/note'),
}
```

## DON'T

```vue
<script setup>
// TodoListView.vue — forbidden
const r = await fetch('/api/note')
</script>
```
