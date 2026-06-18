# Frontend Agents Guide

Vue 3 + TypeScript + Less + Vite + Pinia + Vue Router.

## Layout

```
src/
  main.ts                # entry
  App.vue                # <RouterView />
  router/index.ts        # aggregates module routes
  store/index.ts         # global pinia stores ONLY (rare)
  layouts/               # shell layouts wrapping <RouterView />
  styles/                # less tokens (variables.less is auto-injected)
  utils/                 # generic, zero-business helpers
  components/            # BaseXxx — generic UI primitives
  composables/           # generic hooks (useRequest, usePagination, ...)
  modules/<name>/        # closed-loop business modules
  views/                 # only top-level non-module pages (e.g. NotFound)
```

## Closed-loop module rules (MUST)

A module is a folder under `src/modules/`. It is the **only** place business
code lives. Each module owns its own:

```
modules/<name>/
  api/                   # uses utils/request, defines api functions
  components/            # private components used only inside this module
  composables/           # private hooks used only inside this module
  store/                 # module-scoped pinia store (`use<Name>Store`)
  types/                 # module-local types (mirroring backend DTOs)
  views/                 # routed pages
  routes.ts              # exports a RouteRecordRaw[]
  index.ts               # the only re-export surface
```

**Hard rules**:

- Module code may import from: sibling files, `@/utils`, `@/components`,
  `@/composables`, `@/styles`, `@/layouts`. Nothing else.
- A module never imports from another module, except via that module's
  `index.ts` public surface — and even that is discouraged.
- `views`, `components`, and `composables` of a module never call `fetch`
  directly. They go through `<module>/api/*`, which uses `@/utils/request`.
- Each module is registered exactly **once**: import its `routes` in
  `src/router/index.ts`. No global side-effect imports.

## Conventions

- File naming: PascalCase Vue components (`TodoItem.vue`), camelCase
  composables (`useTodoList.ts`), kebab-case for everything else.
- Pinia setup-store style (factory function), not options syntax.
- Less tokens (`variables.less`) and mixins (`mixins.less`) are auto-injected
  into every Less file via `styles/_inject.less` (see `vite.config.ts`); do
  not re-import them. Anything with CSS side effects (resets, base styles)
  goes in `styles/index.less` and is loaded once from `main.ts`.
- No third-party UI library — use the BaseXxx primitives. Promote new generic
  primitives into `components/` when reused by 2+ modules.
- All HTTP responses follow `{ code, data, message }`. `request()` already
  unwraps `data` and throws `ApiError` for non-zero `code`.

## Adding a module

1. `cp -r src/modules/todo src/modules/<name>` and rename internals.
2. Add `import { <name>Routes } from '@/modules/<name>'` and spread it inside
   the layout's `children` in `src/router/index.ts`.
3. If the module needs new generic helpers, add them under `utils/` or
   `composables/` (NOT inside the module).
