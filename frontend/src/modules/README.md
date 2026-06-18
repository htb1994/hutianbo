# Frontend modules

Each subfolder is a **closed-loop business module**. See
[`../../AGENTS.md`](../../AGENTS.md) for the contract.

## Anatomy of a module

```
<name>/
  api/index.ts                     # http calls (uses @/utils/request)
  components/                      # private to this module
  composables/                     # private to this module
  store/index.ts                   # pinia store: use<Name>Store
  types/index.ts                   # DTO/VO mirrors of backend types
  views/<Name>ListView.vue
  views/<Name>DetailView.vue
  routes.ts                        # exports `<name>Routes: RouteRecordRaw[]`
  index.ts                         # PUBLIC — only file other code may import
```

## Checklist when adding a module

- [ ] Folder created with the structure above.
- [ ] `types/index.ts` mirrors backend response shapes.
- [ ] `api/index.ts` exposes one function per backend endpoint, all going
      through `http` from `@/utils/request`.
- [ ] `store/index.ts` uses `defineStore('<name>', () => { ... })` (setup
      style).
- [ ] `routes.ts` exports lazy-imported views.
- [ ] `index.ts` re-exports `routes`, the store hook, and public types.
- [ ] Routes are registered in `src/router/index.ts`.

## Reference

The `todo/` module is the canonical reference implementation. Copy it as a
starting point.
