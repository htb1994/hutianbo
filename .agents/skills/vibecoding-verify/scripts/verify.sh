#!/usr/bin/env bash
set -euo pipefail

SCRIPTS="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPTS/../../../.." && pwd)"

echo "== [ARCH] module structure & boundaries =="
node "$SCRIPTS/check-modules.mjs" "$ROOT"

echo "== [ARCH] migrations =="
node "$SCRIPTS/check-migrations.mjs" "$ROOT"

echo "== [ARCH] database DDL rules =="
node "$SCRIPTS/check-db-design.mjs" "$ROOT"

echo "== [ARCH] API contract =="
node "$SCRIPTS/check-api.mjs" "$ROOT"

echo "== [CODE] type-check & lint =="
(cd "$ROOT/backend" && npm run type-check && npm run lint)
(cd "$ROOT/frontend" && npm run type-check && npm run lint)

echo "verify: ALL PASSED"
