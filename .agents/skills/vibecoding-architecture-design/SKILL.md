---
name: vibecoding-architecture-design
description: Use when work in the vibeCoding repository could lead to coding, scaffolding, refactoring, migrations, tests, API changes, UI changes, or module changes.
---

# vibecoding-architecture-design

Architecture design is the coding gate for this repository. Complete it before
any implementation action.

## When to use

Use this before:

- Creating or editing frontend, backend, or full-stack modules
- Changing API contracts, zod schemas, database migrations, repositories, routes,
  stores, views, shared components, or utils
- Fixing bugs when the fix will change code
- Refactoring, moving code, adding tests, or running scaffold scripts

Pure analysis, review, and verification do not need an implementation design,
but they still must reference the current code structure.

## Hard gate

Do not scaffold, patch, rewrite, migrate, implement tests, or refactor until the
architecture design is complete. If implementation reveals the design is wrong
or the change boundary expands, stop and update the design before continuing.

## Required discovery

Base the design on actual repository facts. Inspect the relevant current files
before designing:

- Backend: `routes.ts`, module `index.ts`, `*.schema.ts`, `*.repository.ts`,
  `*.service.ts`, `*.controller.ts`, `*.routes.ts`, migrations, and `src/db`
  patterns
- Frontend: `router/index.ts`, module `index.ts`, `routes.ts`, `api/index.ts`,
  `store`, `views`, `components`, `types`, `utils/request.ts`, and shared
  components
- Full-stack: backend response schema fields, frontend type fields, frontend API
  paths, and `/api/<module>` route prefixes

Use targeted `rg`, `find`, `sed`, `git status --short`, and package scripts.
Do not rely on generic framework knowledge when local patterns exist.

## Design output

Before coding, produce a concise architecture design with these sections:

```markdown
**Current structure**
- Existing files and patterns inspected, with paths.

**Target architecture**
- How the change fits the current module boundaries and layer flow.

**Change boundary**
- Files or modules expected to change, and important areas that will not change.

**Contracts**
- API, zod schema, DB, frontend type, route, store, or UI state changes.

**Execution order**
- The safe order for tests, scaffold, backend, frontend, docs, and verification.

**Verification**
- Exact checks to run, including `bash .agents/skills/vibecoding-verify/scripts/verify.sh`
  when module, API, DB, or frontend-backend contract code changes.
```

The design may be short for small fixes, but it must cite real current
structure. A design that only says "follow existing patterns" is incomplete.

## Skill handoff

After the design is complete, continue with every matching implementation skill:

- Backend work: `vibecoding-backend-module`
- Frontend work: `vibecoding-frontend-module`
- Full-stack work: `vibecoding-fullstack-module`
- Feature or bugfix implementation: `superpowers:test-driven-development`
- Unexpected failures: `superpowers:systematic-debugging`
- Completion gate: `vibecoding-verify`
