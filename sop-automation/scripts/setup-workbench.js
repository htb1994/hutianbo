import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

const ROOT = process.cwd();
const configPath = path.join(ROOT, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const TABLES = [
  {
    key: "tasks",
    name: "任务表",
    fields: [
      { name: "任务名称", type: "text" },
      { name: "所属项目", type: "text" },
      { name: "任务类型", type: "select", multiple: false, options: ["生成配套话术", "生成每日群发内容", "生成转化私聊话术", "生成数据看板", "生成转化跟进清单", "生成表彰物料说明"].map(nameOption) },
      { name: "城市/学校", type: "text" },
      { name: "活动名称", type: "text" },
      { name: "年级/学段", type: "text" },
      { name: "奖项设置", type: "text" },
      { name: "学生名单", type: "text" },
      { name: "补充要求", type: "text" },
      { name: "生成状态", type: "select", multiple: false, options: ["待生成", "生成中", "待审核", "需修改"].map(nameOption) },
      { name: "结果链接", type: "text" },
      { name: "备注", type: "text" }
    ]
  },
  {
    key: "scripts",
    name: "话术库",
    fields: [
      { name: "话术名称", type: "text" },
      { name: "使用场景", type: "select", multiple: false, options: ["开营邀约", "每日打卡", "未打卡提醒", "课程价值", "结营表彰", "转化私聊", "异议处理"].map(nameOption) },
      { name: "适用学段", type: "text" },
      { name: "产品点", type: "text" },
      { name: "话术正文", type: "text" },
      { name: "状态", type: "select", multiple: false, options: ["可用", "停用"].map(nameOption) }
    ]
  },
  {
    key: "followups",
    name: "转化跟进表",
    fields: [
      { name: "学生姓名", type: "text" },
      { name: "学校", type: "text" },
      { name: "年级", type: "text" },
      { name: "家长称呼", type: "text" },
      { name: "意向等级", type: "select", multiple: false, options: ["A高意向", "B中意向", "C低意向", "D暂不考虑"].map(nameOption) },
      { name: "转化状态", type: "select", multiple: false, options: ["待首聊", "跟进中", "已成交", "暂不考虑"].map(nameOption) },
      { name: "异议点", type: "text" },
      { name: "跟进记录", type: "text" },
      { name: "下次跟进时间", type: "text" },
      { name: "备注", type: "text" }
    ]
  },
  {
    key: "dashboard",
    name: "运营数据日报",
    fields: [
      { name: "项目名称", type: "text" },
      { name: "日期", type: "text" },
      { name: "学生数", type: "number" },
      { name: "打卡人数", type: "number" },
      { name: "未打卡人数", type: "number" },
      { name: "意向客户数", type: "number" },
      { name: "成交数", type: "number" },
      { name: "备注", type: "text" }
    ]
  }
];

async function main() {
  const existing = await listTables();
  for (const table of TABLES) {
    const found = existing.find((item) => item.name === table.name);
    if (found) {
      config.tables[table.key] = found.table_id;
      console.log(`[setup] 复用已有表：${table.name} -> ${found.table_id}`);
      continue;
    }

    const created = await run([
      "base", "+table-create",
      "--as", "user",
      "--base-token", config.baseToken,
      "--name", table.name,
      "--fields", JSON.stringify(table.fields),
      "--format", "json"
    ]);
    const tableId = created.data?.table_id || created.table_id || created.data?.table?.table_id || created.data?.table?.id;
    if (!tableId) {
      throw new Error(`创建表成功但未找到 table_id：${JSON.stringify(created)}`);
    }
    config.tables[table.key] = tableId;
    console.log(`[setup] 创建表：${table.name} -> ${tableId}`);
  }

  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log("[setup] config.json 已更新");
}

async function listTables() {
  const response = await run([
    "base", "+table-list",
    "--as", "user",
    "--base-token", config.baseToken,
    "--format", "json"
  ]);
  const tables = response.data?.items || response.data?.tables || response.items || [];
  return tables.map((table) => ({
    table_id: table.table_id || table.id,
    name: table.name || table.table_name
  })).filter((table) => table.table_id && table.name);
}

function run(args) {
  return new Promise((resolve, reject) => {
    execFile(config.larkCli, args, {
      env: {
        ...process.env,
        LARKSUITE_CLI_NO_UPDATE_NOTIFIER: "1",
        LARKSUITE_CLI_NO_SKILLS_NOTIFIER: "1"
      },
      maxBuffer: 50 * 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`lark-cli 执行失败：${args.join(" ")}\n${stderr || stdout}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (parseError) {
        reject(new Error(`lark-cli 返回不是 JSON：${stdout}`));
      }
    });
  });
}

function nameOption(name) {
  return { name };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
