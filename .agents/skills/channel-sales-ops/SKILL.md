---
name: channel-sales-ops
description: Use when designing or changing channel-sales tools for a city manager who manages agents, school-entry acquisition, parent/student leads, trials, paid conversion, follow-ups, and weekly operating reviews.
---

# channel-sales-ops

Use this skill for channel business features serving an Onion Academy city manager.

## Core Model

- One operating record should answer: which agent, which school, current stage, lead volume, trial volume, paid volume, next follow-up, and next action.
- Default funnel stages: `to_contact`, `entered_school`, `leads_collected`, `trialing`, `converted`, `paused`.
- Conversion rate is derived from `paidCount / leadCount`; do not ask users to maintain it manually.
- Keep MVP data entry lightweight. Prefer a single school-progress record before splitting agents, schools, leads, and orders into separate modules.

## Acceptance Checklist

- City manager can create and update school progress tied to an agent.
- Dashboard shows schools, active schools, leads, trials, paid users, conversion rate, and due follow-ups.
- Records can be sorted by follow-up urgency.
- Fields stay aligned across backend zod schema, database row, frontend type, and API client.
- Verify with `bash .agents/skills/vibecoding-verify/scripts/verify.sh`.

## Expansion Paths

- Agent performance ranking by conversion and active schools.
- Weekly report export for city-level review.
- Feishu Sheet sync for agent-submitted school progress.
- Separate lead/order modules only after the single-record workflow is proven too coarse.
