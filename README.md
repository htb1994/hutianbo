# vibeCoding

A Codex-friendly fullstack template designed for AI-driven development.

- `frontend/` Vue 3 + TypeScript + Less + Vite + Pinia + Vue Router
- `backend/` Node.js + Fastify + TypeScript + zod, with a pluggable
  database layer (SQLite for demo, PostgreSQL for production).

The two sub-projects are independent (each has its own `package.json`).
They are organized around the **closed-loop module** principle: every
business feature lives in `src/modules/<name>/` and exposes a single
`index.ts`. See [`AGENTS.md`](./AGENTS.md) for the agent contract.

## Superpowers + Skills

This repo bundles [Superpowers](https://github.com/obra/superpowers) (general agent
workflow) and project-specific [Codex Skills](https://developers.openai.com/codex/skills)
under [`.agents/skills/`](.agents/skills/) for **module split**, **database design**,
and **API contracts**.

### First-time setup

```bash
bash scripts/install-superpowers.sh
```

This clones Superpowers into `vendor/superpowers/` and links
`.agents/skills/superpowers/` for Codex. For Cursor, import this repo as a
Team Marketplace (Dashboard → Settings → Plugins) or run `/add-plugin superpowers`
in Agent chat.

Launch Codex from the repository root:

```bash
cd /path/to/vibeCoding
codex
```

Recommended prompt for a new feature:

```text
$vibecoding-codex-workflow
$vibecoding-architecture-design
$vibecoding-fullstack-module
Add a "note" module with title + content, full CRUD.
First design from the current code structure, then implement and run verify.sh.
```

### Skills

| Skill | Purpose |
|-------|---------|
| `$vibecoding-codex-workflow` | Default Codex entrypoint and skill router |
| `$vibecoding-architecture-design` | Required design gate before coding |
| Superpowers (`brainstorming`, `writing-plans`, …) | Design, TDD, debugging, planning |
| `$vibecoding-backend-module` | Backend module + migrations + zod API |
| `$vibecoding-frontend-module` | Frontend module + api client + routes |
| `$vibecoding-fullstack-module` | Both sides with contract alignment |
| `$vibecoding-verify` | Architecture gate (must pass before done) |

### Verify script

```bash
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

Checks (in order):

1. **Module split** — required files, import boundaries, route registration
2. **Migrations** — sqlite/pg pairs, global `NNNN_` numbering
3. **Database DDL** — TEXT id, no AUTOINCREMENT/SERIAL, dialect bool/time types
4. **API contract** — zod schema, `/api/<name>` prefix, frontend path alignment
5. **type-check + lint** — both frontend and backend

Success output: `verify: ALL PASSED`. Errors are prefixed with `[ARCH]` and a rule ID
(e.g. `MIG-PAIR`, `MOD-FE-FETCH`, `API-ALIGN`).

## Quickstart

### Backend

```bash
cd backend
npm install
cp .env.example .env   # default uses sqlite, no extra setup
npm run dev            # http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

The frontend dev server proxies `/api` to `http://localhost:3000`.

## Switching to PostgreSQL

In `backend/.env`:

```env
DB_DIALECT=postgres
DATABASE_URL=postgres://user:pass@host:5432/dbname
```

Then run migrations and start the server:

```bash
cd backend
npm run db:migrate
npm run start
```

## Project layout

```
.
├── AGENTS.md                # Agent contract + Skill router (read me first)
├── .cursor-plugin/          # Cursor Team Marketplace (Superpowers)
├── .agents/skills/          # Superpowers + vibecoding Codex Skills
├── scripts/install-superpowers.sh
├── vendor/superpowers/      # Cloned by install script (gitignored)
├── frontend/                # Vue 3 + Vite
│   └── src/
│       ├── components/      # Base UI components (no business)
│       ├── composables/     # Generic hooks
│       ├── utils/           # Generic utils (request, storage, format, ...)
│       ├── styles/          # Less tokens & resets
│       ├── layouts/
│       ├── router/, store/
│       └── modules/         # Closed-loop business modules
│           └── todo/        # Sample feature module
└── backend/                 # Fastify + TS
    └── src/
        ├── plugins/         # Fastify plugins (cors, logger, error-handler)
        ├── utils/           # http-error, response, id, logger
        ├── middleware/      # Generic preHandlers (auth skeleton)
        ├── db/              # Database abstraction (sqlite/pg adapters)
        ├── modules/         # Closed-loop business modules
        │   └── todo/
        ├── config/
        ├── app.ts, server.ts, routes.ts
```
