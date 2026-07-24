# Feishu Summer SOP Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Feishu Bitable automation endpoint for generating summer community SOP copy from row conditions.

**Architecture:** Keep the feature inside the existing `summersop` backend module. Add zod schemas for Feishu row input/output, map Chinese labels to existing internal enums, reuse the existing generator, and return Chinese field names for Feishu write-back.

**Tech Stack:** Fastify, TypeScript, zod, existing `summersop` module.

## Global Constraints

- Do not add a database migration.
- Do not store Feishu secrets or OAuth tokens in the app.
- Keep all code inside the closed-loop `summersop` backend module.
- Run `bash .agents/skills/vibecoding-verify/scripts/verify.sh` before completion.

---

### Task 1: Contract Script

**Files:**
- Create: `backend/scripts/smoke-feishu-summersop.mjs`

**Interfaces:**
- Consumes: `POST /api/summersop/feishu/generate`
- Produces: a script that exits 0 only when Chinese output fields exist.

- [ ] Create a smoke script that posts Chinese fields to the local server.
- [ ] Run it before implementation and confirm it fails with 404.

### Task 2: Backend Endpoint

**Files:**
- Modify: `backend/src/modules/summersop/summersop.schema.ts`
- Modify: `backend/src/modules/summersop/summersop.service.ts`
- Modify: `backend/src/modules/summersop/summersop.controller.ts`
- Modify: `backend/src/modules/summersop/summersop.routes.ts`

**Interfaces:**
- Consumes: Chinese Feishu row fields.
- Produces: `generateForFeishu(input)` and `POST /feishu/generate`.

- [ ] Add `SummerSopFeishuGenerateSchema`.
- [ ] Add mapping from Chinese labels to internal enum values.
- [ ] Add service method returning Chinese output fields.
- [ ] Add controller and route.

### Task 3: Verification And Release

**Files:**
- No additional source files.

**Interfaces:**
- Consumes: completed backend endpoint.
- Produces: pushed GitHub commit for Render auto-deploy.

- [ ] Run the smoke script against local production server.
- [ ] Run `bash .agents/skills/vibecoding-verify/scripts/verify.sh`.
- [ ] Run `NODE_ENV=production npm run deploy:build`.
- [ ] Commit and push.
