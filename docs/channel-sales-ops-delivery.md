# 渠道转化作战台交付说明

## 原始需求

用户当前是洋葱学园城市经理，负责渠道业务。日常工作包括对接代理商，推动代理商入校获客，并持续跟进家长/学生 C 端体验与付费转化。需要一个符合该工作场景的 App，而不是通用 Todo 或泛 CRM。

## MVP 版本

MVP 做“学校推进看板优先”的渠道转化作战台：

- 记录代理商、负责人、城市/区域、学校名称。
- 维护学校推进阶段：待接触、已进校、已获客、体验中、已转化、暂停。
- 记录线索数、体验数、付费数、下次跟进日期、下一步动作。
- 首页汇总学校数、推进中学校数、线索数、体验数、付费数、整体转化率、今日待跟进数。
- 数据通过后端 `channel` 模块持久化，前端通过 `channel` 模块呈现。

## 验收标准

- 可以新增学校推进记录。
- 可以查看所有学校推进记录。
- 可以删除学校推进记录。
- 首页指标会根据记录自动汇总。
- 转化率由 `paidCount / leadCount` 自动计算，不需要人工录入。
- 前后端字段保持一致：后端 zod schema、数据库字段、前端类型、API client 均对齐。
- 项目架构校验脚本 `bash .agents/skills/vibecoding-verify/scripts/verify.sh` 通过。

## 沉淀项目 Skills

已新增项目 Skill：

- `.agents/skills/channel-sales-ops/SKILL.md`

触发场景：后续设计或修改城市经理渠道业务工具、代理商管理、入校获客、线索/体验/付费转化、周度经营复盘等功能时使用。

## 项目代码 Github/Gitlab

当前工作目录不是 git 仓库，`git status --short` 返回 `fatal: not a git repository`，因此暂时无法读取远程 GitHub/GitLab 地址或创建提交。

代码落点：

- 后端：`backend/src/modules/channel/`
- 前端：`frontend/src/modules/channel/`
- 交付说明：`docs/channel-sales-ops-delivery.md`
- 项目 Skill：`.agents/skills/channel-sales-ops/SKILL.md`

建议初始化或关联仓库后填写：

- GitHub/GitLab 地址：待填写
- 默认分支：待填写
- 本地路径：`/Users/hutianbo/Downloads/vibeCodingTemplate-main`
