# Project Agents Guide

This is a Codex-friendly fullstack template. Two independent sub-projects:
`frontend/` (Vue 3 + TypeScript + Less + Vite) and `backend/`
(Node.js + Fastify + TypeScript + zod + SQLite/Postgres).

## Superpowers (project install)

This repo vendors [Superpowers](https://github.com/obra/superpowers) for agent workflows.
After clone, run once:

```bash
bash scripts/install-superpowers.sh
```

That clones `vendor/superpowers/` and links Codex skills to
`.agents/skills/superpowers/`. Cursor picks up the plugin via
[`.cursor-plugin/marketplace.json`](.cursor-plugin/marketplace.json) (Team Marketplace)
or `/add-plugin superpowers` from the Cursor marketplace panel.

**Skill priority:** instructions in this file override Superpowers defaults.
Start with `$vibecoding-codex-workflow` for project work, then load the
matching Superpowers and module skills it routes to. Superpowers handles
general workflow (brainstorming, TDD, debugging, planning). Repo-specific
architecture rules live in `$vibecoding-*` skills below.

| User intent | Skill to invoke |
|-------------|-----------------|
| Any project development / analysis / verification task | `$vibecoding-codex-workflow` first |
| Architecture design before coding | `$vibecoding-architecture-design` |
| Plan / design before coding | Superpowers `brainstorming`, `writing-plans` |
| Implement with TDD | Superpowers `test-driven-development` |
| Debug unexpected failures | Superpowers `systematic-debugging` |
| New or edit backend module (DB, API, repository) | `$vibecoding-backend-module` |
| New or edit frontend module (api client, pages) | `$vibecoding-frontend-module` |
| New full-stack feature module (both sides) | `$vibecoding-fullstack-module` |
| Verify module split / DB / API / code quality | `$vibecoding-verify` |

## Skill-based workflows (MANDATORY for Codex)

All project work MUST start by loading a project skill under
[`.agents/skills/`](.agents/skills/). Use `$vibecoding-codex-workflow` as the
default entrypoint, then load the narrower skill it requires. Do NOT write or
edit module code without loading the matching module skill first.

Rules:

1. Read `.agents/skills/vibecoding-codex-workflow/SKILL.md`, then every routed
   skill's `SKILL.md`, before editing files.
2. Before any coding, scaffolding, refactoring, migration, or test edit, complete
   `.agents/skills/vibecoding-architecture-design/SKILL.md` using current code
   structure as evidence.
3. Follow skill checklists in order; do not skip steps.
4. For feature or bugfix work, use Superpowers TDD/debugging flow plus the
   matching project module skill.
5. Run `bash .agents/skills/vibecoding-verify/scripts/verify.sh`; exit code
   must be `0` before completion.
6. If verify fails, fix `[ARCH]` errors and re-run until `verify: ALL PASSED`.

Architecture rules are enforced by `.agents/skills/vibecoding-verify/scripts/check-*.mjs`
(module anatomy, migrations, DDL design, API contract — not just lint).

Codex discovers skills from `.agents/skills/` when launched inside this repository.

## Stack

- **Frontend**: Vue 3 + TypeScript + Less + Vite + Pinia + Vue Router
- **Backend**: Node.js + Fastify + TypeScript + zod
- **Database**: `better-sqlite3` (demo) and `pg` (production), abstracted via
  a `Database` interface; switched by the `DB_DIALECT` env var.
- No monorepo tooling. `frontend/` and `backend/` are independent.

## Architecture invariants (MUST follow)

1. **Modules are closed loops.** Code under `src/modules/<name>/` may only
   import from:
   - sibling files within the same module
   - `src/utils` and `src/components` (frontend)
   - `src/utils`, `src/plugins`, `src/middleware`, `src/db` (backend)
2. **Modules never import each other directly.** If reuse is needed, promote
   the shared code into `utils/` or `components/`.
3. **The only public surface of a module is `modules/<name>/index.ts`.**
4. **Backend request/response shapes are zod schemas** in
   `<name>.schema.ts`; types are inferred via `z.infer`. Do not hand-write
   API DTOs outside the schema.
5. **Frontend talks to backend only via `modules/<name>/api/*`.** The api
   layer is the only place allowed to call `utils/request.ts`. Do not call
   `fetch` directly from views, components, or stores.
6. **Backend repositories use the `db` interface.** Never import a driver
   (`better-sqlite3`, `pg`) outside `backend/src/db/adapters/`.

## Naming

- Backend files: kebab-case, dotted role suffix (`todo.service.ts`,
  `todo.repository.ts`, `todo.routes.ts`).
- Vue components: PascalCase (`TodoItem.vue`, `BaseButton/index.vue`).
- Composables: camelCase, prefixed with `use` (`useTodoList.ts`).
- HTTP routes: `/api/<module>/...`.
- Backend response shape: `{ code: number, data: T, message: string }`.

## Adding a new module

Use Codex skills (do not hand-copy folders):

```bash
# Backend only
node .agents/skills/vibecoding-backend-module/scripts/scaffold.mjs <name>

# Frontend only
node .agents/skills/vibecoding-frontend-module/scripts/scaffold.mjs <name>

# Full-stack: run both, then verify
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

Manual reference: copy from `frontend/src/modules/todo/` or `backend/src/modules/todo/` if needed.

## Database switch

- `DB_DIALECT=sqlite` (default for local/demo): `npm run dev` auto-creates
  tables on boot.
- `DB_DIALECT=postgres` (production): set `DATABASE_URL` and run
  `npm run db:migrate` before `npm run start`.

## Quickstart

```bash
# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend (in another terminal)
cd frontend && npm install && npm run dev
```
