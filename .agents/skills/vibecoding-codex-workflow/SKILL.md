---
name: vibecoding-codex-workflow
description: Use when working in the vibeCoding repository on development, debugging, refactoring, review, verification, planning, or architecture analysis tasks.
---

# vibecoding-codex-workflow

Default coordination skill for Codex in this repository. Use it before choosing
any narrower project skill.

## First steps

1. Read `AGENTS.md` and the nearest nested `AGENTS.md` for the files involved.
2. Inspect the current repo state before changing files:
   - `git status --short`
   - targeted `rg`, `find`, `sed`, or `npm` commands for the task
3. Classify the task and load every matching workflow or module skill below.
4. Announce the skills being used and why.

## Skill router

| Task | Required skills |
|------|-----------------|
| Architecture design before coding | `vibecoding-architecture-design` |
| Plan or design before code | `vibecoding-architecture-design`, then `superpowers:brainstorming` and `superpowers:writing-plans` when a written implementation plan is needed |
| Implement a feature, bugfix, or refactor | `vibecoding-architecture-design`, then `superpowers:test-driven-development` plus the matching `vibecoding-*` module skill |
| Debug unexpected behavior or failing tests | `superpowers:systematic-debugging`, then the matching module skill after root cause is known |
| Backend module, API, repository, schema, migration | `vibecoding-backend-module` |
| Frontend module, API client, store, routes, views | `vibecoding-frontend-module` |
| Full-stack feature spanning backend and frontend | `vibecoding-fullstack-module` |
| Verify architecture, contracts, lint, or readiness | `vibecoding-verify` |
| Create or update skills | `skill-creator`; use `superpowers:writing-skills` when changing reusable skill behavior |

If multiple rows match, use all of them. Process skills decide how to work;
project skills define repository architecture.

## Non-negotiable repo rules

- Do not code, scaffold, patch, refactor, migrate, or write tests before
  completing `vibecoding-architecture-design` for coding tasks.
- Do not edit module code without loading the matching `vibecoding-*` skill.
- Do not bypass scaffold scripts for new modules unless the user explicitly asks.
- Do not hand-write backend DTOs outside zod schemas.
- Do not call `fetch` or `utils/request.ts` from frontend views, components, or stores.
- Do not import database drivers outside `backend/src/db/adapters/`.
- Do not import one module from another module directly.

## Standard workflow

1. **Discover:** read the existing module, route, schema, store, and migration
   patterns before deciding.
2. **Design gate:** complete `vibecoding-architecture-design` using current
   code paths and planned change boundaries before coding.
3. **Contract first:** for full-stack work, write the backend schema fields and
   frontend type mapping before implementing UI or persistence.
4. **Small closed-loop edits:** keep each change inside the owning module unless
   promoting shared code into `utils/` or `components/`.
5. **Verify:** run `bash .agents/skills/vibecoding-verify/scripts/verify.sh`
   after module, database, API, or frontend-backend contract changes.
6. **Finish only on green:** completion requires `verify: ALL PASSED`, or an
   explicit note explaining why verification could not be run.

## Example prompts

- `Add a note module with title and content, full CRUD.`
- `Add only a backend endpoint for archiving todos.`
- `Improve the todo list page UX without changing the backend contract.`
- `Debug why creating todos returns a 500.`
- `Review this branch for module-boundary or API-contract violations.`
- `Run the architecture verification gate and fix failures.`
