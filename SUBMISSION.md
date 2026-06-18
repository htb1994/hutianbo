# 渠道转化作战台作业提交说明

## 项目简介

本项目使用 Codex + Superpowers，在现有 Vue 3 + Fastify 全栈模板中完成了一个符合洋葱学园城市经理渠道业务场景的 App：渠道转化作战台。

城市经理可以用它记录代理商入校推进情况，管理学校阶段、线索数、体验数、付费数、下次跟进动作，并在首页看到渠道转化核心指标。

## 原始需求

用户是洋葱学园城市经理，负责渠道业务。日常工作包括对接代理商，推动代理商入校获客，并持续跟进 C 端体验与付费转化。需要一个符合该工作场景的 App。

## MVP 版本

- 代理商/负责人/城市/学校推进记录管理
- 学校阶段：待接触、已进校、已获客、体验中、已转化、暂停
- 线索数、体验数、付费数、下次跟进、下一步动作记录
- 首页指标：学校数、推进中学校数、线索数、体验数、付费数、整体转化率、今日待跟进数
- 后端 SQLite 持久化
- 前端渠道看板页面

## 验收标准

- 可以新增学校推进记录
- 可以查看所有学校推进记录
- 可以删除学校推进记录
- 首页指标根据记录自动汇总
- 转化率由后端自动计算
- 前后端字段保持一致
- `bash .agents/skills/vibecoding-verify/scripts/verify.sh` 通过

## 重点文件

- 后端模块：`backend/src/modules/channel/`
- 前端模块：`frontend/src/modules/channel/`
- 交付说明：`docs/channel-sales-ops-delivery.md`
- 项目 Skill：`.agents/skills/channel-sales-ops/SKILL.md`

## 本地运行

后端：

```bash
cd backend
npm install
npm run dev
```

前端：

```bash
cd frontend
npm install
npm run dev
```

打开：

```text
http://localhost:5173/
```

## 验证

从项目根目录运行：

```bash
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

当前验证结果：

```text
verify: ALL PASSED
```

## GitHub/GitLab

当前目录不是 git 仓库，因此无法自动读取远程仓库地址。提交作业时可以直接上传压缩包；如果需要仓库链接，可以先初始化 git 并推送到 GitHub/GitLab。
