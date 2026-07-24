# Feishu Summer SOP Generation Design

## Goal

Make the summer community SOP generator usable from Feishu Bitable by letting a row of Chinese field values produce copy that can be written back to the same row.

## Current Structure

- Backend module: `backend/src/modules/summersop/`
- Existing API prefix: `/api/summersop`
- Existing generation path: controller parses zod schema, service builds copy, repository persists generated SOP records.
- Existing copy material: `backend/src/modules/summersop/summersop.copy-library.ts`

## Target Architecture

Add a backend-only endpoint inside the existing `summersop` module:

`POST /api/summersop/feishu/generate`

The endpoint accepts Feishu-friendly Chinese field names and values, maps them to the existing internal enums, reuses the existing SOP generation logic, and returns fields that Feishu automation can write back to the same Bitable row.

## Change Boundary

Modify only:

- `backend/src/modules/summersop/summersop.schema.ts`
- `backend/src/modules/summersop/summersop.service.ts`
- `backend/src/modules/summersop/summersop.controller.ts`
- `backend/src/modules/summersop/summersop.routes.ts`

No database migration is needed. No Feishu app secret, user token, or Bitable record access is stored on Render.

## Contract

Input supports Chinese field names:

- `主题`
- `年级`
- `阶段`
- `目标`
- `语气`

Output returns Chinese field names:

- `群公告`
- `群内互动话术`
- `朋友圈文案`
- `私聊话术`
- `执行清单`
- `生成状态`

## Verification

- Add a small backend smoke script that calls the new endpoint and expects Chinese output fields.
- Run `bash .agents/skills/vibecoding-verify/scripts/verify.sh`.
- Run `NODE_ENV=production npm run deploy:build`.
- Start local production server and call `/api/summersop/feishu/generate`.
