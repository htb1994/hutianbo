# 自我蒸馏 Skill 草稿：Codex 驱动的全栈模板改造工作流

## 1. 蒸馏对象

蒸馏对象来自我在 `vibeCodingTemplate-main` 这个真实 fullstack 模板中的开发/学习流程：用 Codex 协助理解、修改、验证一个前后端分离项目。

这个流程的真实业务深度不在于“会写 Vue 或 Fastify 的模板代码”，而在于把一次 AI 辅助开发约束成可复验的工程闭环：

- 先读项目协作契约，而不是直接改代码。
- 先识别变更类型，再加载对应 skill。
- 前后端模块必须保持闭环边界，不能跨模块直接依赖。
- 后端接口形状以 zod schema 为准，前端只能经模块 api 层请求后端。
- 完成后必须跑架构验证、类型检查和 lint，把“看起来能跑”升级成“有证据地可交付”。

我把这个流程蒸馏成一个个人 skill，是因为它反复出现在我的真实工作/学习中：拿到一个 AI-friendly template 或业务仓库后，需要让 Codex 既能提速，又不能越过架构边界和验证门槛。

## 2. Skill 草稿

下面内容可直接沉淀为个人 `SKILL.md`。

```markdown
---
name: codex-fullstack-change-gate
description: Use when working with Codex on a full-stack repository that has explicit architecture rules, module boundaries, API contracts, database migrations, or mandatory verification gates.
---

# Codex Fullstack Change Gate

## Core Rule

Treat Codex as an execution partner, not an unchecked code generator. Every change must move through: discover, classify, constrain, change, verify, explain.

## Trigger

Use this skill when the user asks Codex to analyze, modify, scaffold, debug, review, or verify a full-stack project with frontend/backend module rules.

Do not use it for one-off prose writing, throwaway experiments, or tasks outside the repository.

## Workflow

1. Read the local agent contract first: `AGENTS.md`, nested `AGENTS.md`, and any named project skills.
2. Inspect the repo state and the target files before proposing or editing.
3. Classify the task:
   - architecture/design only
   - backend module/API/database
   - frontend module/UI/api client
   - full-stack feature
   - debugging/review/verification
4. Load the narrow matching skill or project rule before editing.
5. Keep edits inside the owning module unless a shared utility/component is explicitly justified.
6. Preserve API contracts:
   - backend request/response types come from schema
   - frontend requests go through module api layer
   - response shape stays consistent with the project contract
7. Run the project verification gate.
8. If verification fails, classify the failure before fixing:
   - architecture violation
   - type/lint issue
   - missing dependency or environment setup
   - unrelated pre-existing risk
9. Re-run verification after correction.
10. Report only what is evidenced by commands, files, or screenshots.

## Done Criteria

The work is done only when:

- The changed scope matches the original task.
- Module boundaries and naming rules are preserved.
- API fields align between backend schema and frontend client/types.
- Database migrations are paired by dialect when database changes exist.
- Verification command exits with code 0, or the exact blocker is documented.
- The final report separates Codex-verifiable facts from human judgment.

## Human Judgment Boundary

Codex can handle:

- reading repository rules and file structure
- drafting implementation plans
- editing code and docs
- running type-check, lint, migration checks, and architecture scripts
- summarizing concrete command output

Human judgment is required for:

- whether the feature matches real business intent
- whether UX text and workflows fit actual users
- whether audit vulnerabilities should be fixed now or scheduled
- whether an architecture exception is acceptable
- whether the evidence is sufficient for submission or release

## Common Failure Modes

| Failure mode | Correction |
| --- | --- |
| Codex edits before reading project rules | Stop, read rules, restate constraints, then continue |
| Verification fails from missing dependencies | Install/bootstrap dependencies, then re-run verification |
| Verification fails from architecture rules | Fix the boundary or contract violation before cosmetic work |
| Tests pass but audit shows vulnerabilities | Do not auto-fix blindly; escalate to human risk decision |
| Final answer says "done" without command evidence | Re-run or quote the actual verification result |
```

## 3. 适用场景、触发方式和边界

适用场景：

- 我在一个带有明确工程约束的 fullstack 仓库里使用 Codex。
- 任务涉及模块改造、API 对齐、数据库迁移、前端页面、调试、代码审查或交付验证。
- 项目不是单纯 demo，而是需要沉淀为长期可维护的工作流。

触发方式：

- 用户说“帮我加一个模块/接口/页面/功能”。
- 用户说“检查这个仓库是否符合架构规则”。
- 用户说“跑一下验证并修复失败”。
- 用户给出类似 `AGENTS.md` 的项目协作契约。

边界：

- 不用于纯写作、纯问答、一次性草稿。
- 不替代真实产品判断。
- 不绕过人工审批处理安全修复、架构例外、线上数据变更。
- 不把“命令能跑通”等同于“业务正确”。

## 4. 我的做法与判断标准

我的做法：

1. 先读规则：本次读取了 `AGENTS.md`、`.agents/skills/vibecoding-codex-workflow/SKILL.md`、`skill-creator`、`superpowers:writing-skills`、`superpowers:test-driven-development`。
2. 再看仓库：用 `rg --files` 和 `find` 确认项目结构、前后端分离、模块位置、已有文档。
3. 先跑验证：用 `bash .agents/skills/vibecoding-verify/scripts/verify.sh` 获取基线。
4. 分类失败：首次失败不是业务代码问题，而是依赖未安装导致 `tsc: command not found`。
5. 纠偏：安装 backend 和 frontend 依赖。
6. 复验：再次运行 verify，直到 `verify: ALL PASSED`。
7. 产出：把流程写成可触发、可复用、可验证的 skill 草稿，而不是只写心得。

什么算做对了：

- 能说明蒸馏对象来自哪一个真实流程和真实项目。
- Skill 有明确触发条件，不靠人临场解释。
- Skill 有明确边界，不把人工判断外包给 Codex。
- 判断标准可验证：能通过命令、文件、运行结果对应。
- 失败被分类和纠偏，而不是被忽略。
- 复验通过后再宣称完成。

什么不算做对：

- 只写“先分析、再执行、最后总结”的空泛模板。
- 没有真实命令输出或材料证据。
- 把一次运行失败解释成“无关紧要”。
- 没有说明 Codex 与人工的责任边界。
- 没有复验。

## 5. 运行证据

### 初稿

初稿判断：把 skill 设计为“Codex fullstack change gate”，核心是发现规则、分类任务、约束修改、运行验证、证据化交付。

对应材料：

- `AGENTS.md` 明确要求项目工作必须先加载 `.agents/skills/` 下的项目 skill。
- `README.md` 明确项目为 Vue 3 + Fastify 的 AI-driven fullstack template。
- `.agents/skills/vibecoding-codex-workflow/SKILL.md` 明确将任务路由到架构、模块、验证等 skill。

### 第一次运行

命令：

```bash
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

结果摘要：

```text
== [ARCH] module structure & boundaries ==
[ARCH] OK: backend modules (1) anatomy + boundaries
[ARCH] OK: frontend modules (1) anatomy + boundaries
== [ARCH] migrations ==
[ARCH] OK: migrations (1 global prefix(es), all paired)
== [ARCH] database DDL rules ==
[ARCH] OK: database DDL rules (2 migration file(s) checked)
== [ARCH] API contract ==
[ARCH] OK: API contracts (backend 1, frontend 1)
== [CODE] type-check & lint ==
> backend@0.0.0 type-check
> tsc --noEmit
sh: tsc: command not found
```

判断：架构检查通过，失败发生在代码质量阶段，根因是依赖环境缺失，不是模块边界或 API contract 错误。

### 纠偏

命令：

```bash
cd backend && npm install
cd frontend && npm install
```

第一次安装在沙箱内失败，npm 提示无法写入用户级日志目录：

```text
npm error Exit handler never called!
npm error Log files were not written due to an error writing to the directory: /Users/hutianbo/.npm/_logs
```

纠偏动作：按权限流程放行后重新安装依赖。

安装结果摘要：

```text
backend: changed 274 packages, audited 275 packages
backend: 2 vulnerabilities (1 low, 1 moderate)

frontend: changed 226 packages, audited 227 packages
frontend: 2 vulnerabilities (1 moderate, 1 high)
```

判断：依赖安装完成；audit 风险不应由 Codex 自动 `npm audit fix`，因为这可能改变依赖版本和行为，需要人工决定是否纳入本次任务。

### 更新

根据运行结果，我对 skill 草稿加入了两条纠偏规则：

- verification failure 必须先分类，区分架构问题、代码问题、环境问题、既有风险。
- audit vulnerabilities 必须进入人工判断边界，不能被 Codex 默认自动修复。

### 复验

命令：

```bash
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

结果：

```text
== [ARCH] module structure & boundaries ==
[ARCH] OK: backend modules (1) anatomy + boundaries
[ARCH] OK: frontend modules (1) anatomy + boundaries
== [ARCH] migrations ==
[ARCH] OK: migrations (1 global prefix(es), all paired)
== [ARCH] database DDL rules ==
[ARCH] OK: database DDL rules (2 migration file(s) checked)
== [ARCH] API contract ==
[ARCH] OK: API contracts (backend 1, frontend 1)
== [CODE] type-check & lint ==
> backend@0.0.0 type-check
> tsc --noEmit
> backend@0.0.0 lint
> eslint .
> frontend@0.0.0 type-check
> vue-tsc --noEmit
> frontend@0.0.0 lint
> eslint .
verify: ALL PASSED
```

## 6. Codex 与人工分工

可以交给 Codex：

- 读取 `AGENTS.md`、README、skill 文件和项目结构。
- 判断任务涉及哪些模块和约束。
- 根据既有模式修改代码或文档。
- 跑架构检查、type-check、lint、验证脚本。
- 记录失败、分类失败、提出纠偏。
- 生成可复用 skill 草稿和证据链。

必须人工判断：

- 这个 skill 是否代表我的真实长期工作流，而不是一次作业包装。
- “业务正确”是否成立，例如功能是否真的满足团队/课程/项目目标。
- npm audit 中的漏洞是否需要本次修复，以及能否接受依赖升级风险。
- 是否允许 Codex 对架构规则作例外处理。
- 证据链是否足够支撑提交。

## 7. 结论

这份自我蒸馏的核心不是“让 Codex 自动写更多代码”，而是把我真实使用 Codex 做工程任务时最容易失控的环节收束成一个可复用工作流：先读规则，后分类，再修改，失败先判断，最后复验。

它可以直接用于后续类似仓库：只要项目有明确架构契约、模块边界和验证脚本，就能触发这个 skill；同时它保留人工判断口，避免把业务价值、安全风险和架构例外错误地交给 Codex 独断。
