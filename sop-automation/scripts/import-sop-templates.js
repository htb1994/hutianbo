import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

const ROOT = process.cwd();
const WORKSPACE_ROOT = path.resolve(ROOT, "..");
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));

const REQUIRED_TEXT_FIELDS = [
  "模板类型",
  "适用学校",
  "产品重点",
  "模板正文",
  "素材配置规则",
  "鼓励师话术规则",
  "转化节点",
  "来源文件",
  "导入批次"
];

const IMPORT_BATCH = "2026-07-28 SOP模板库升级导入";

const TEMPLATES = [
  {
    name: "湖南通用21天暑假社群运营SOP-素材补全版",
    file: "outputs/湖南通用_21天暑假社群运营SOP_素材补全2.0.md",
    period: "21天",
    stages: ["纯服务", "服务转化"],
    city: "湖南通用",
    school: "小学/初中/高中通用",
    type: "暑假社群运营SOP",
    product: "同步学、同步刷题、专项突破、错题巩固、家长学情报告",
    materialRule: "按每日运营节点配置课程价值图、APP操作视频、用户认可视频、学情报告截图和转化期组合品素材。",
    coachRule: "鼓励师话术以低压力陪伴、具体反馈、学习动作肯定为主，避免空泛催促。",
    conversionNode: "前14天以服务和打卡为主，后7天进入课程价值承接与组合品转化。",
    usage: "适合湖南区域小学、初中、高中暑假社群服务转化项目，作为通用模板底稿。"
  },
  {
    name: "衡阳本地14天洋葱学园暑假加油站SOP-参考框架版",
    file: "outputs/衡阳本地_洋葱学园暑假加油站社群运营14天SOP_按参考框架版.md",
    period: "14天",
    stages: ["纯服务", "服务转化"],
    city: "湖南衡阳",
    school: "衡阳本地小学/初中/高中通用，可改为具体学校",
    type: "本地化暑假加油站SOP",
    product: "洋葱学园APP使用、同步学、同步刷题、专项突破、高频错题、试卷库",
    materialRule: "结合衡阳本地暑假节奏配置APP操作素材、课程质量素材、用户认可素材和阶段性转化素材。",
    coachRule: "话术强调衡阳本地家长关心的开学衔接、学习习惯、错题暴露和暑假节奏。",
    conversionNode: "前12天纯服务，第13天开始转化，第14天结营收口。",
    usage: "适合衡阳本地暑假加油站14天社群，可复制后替换学校、日期、奖项和素材。"
  },
  {
    name: "怀化市鹤城区洋葱学园暑假加油站SOP-参考框架版",
    file: "outputs/怀化鹤城区_洋葱学园暑假加油站社群运营SOP_按参考框架版.md",
    period: "自定义",
    stages: ["纯服务", "服务转化", "结营表彰"],
    city: "怀化市鹤城区",
    school: "鹤城区小学/初中/高中通用",
    type: "区域本地化暑假加油站SOP",
    product: "洋葱学园APP学习路径、同步课程、刷题练习、学情报告、家长端反馈",
    materialRule: "按7月6日-7月24日工作日节奏配置素材，周末只做课程价值传递和轻提醒。",
    coachRule: "话术更接地气，突出孩子愿意学、家长看得见、老师能跟进。",
    conversionNode: "中后段通过学情反馈、阶段表扬、结营仪式完成转化承接。",
    usage: "适合怀化市鹤城区暑假加油站社群，已按用户参考文档框架整理。"
  },
  {
    name: "洋葱学园暑假加油站结营表彰群内执行SOP",
    file: "outputs/洋葱学园暑假加油站结营表彰群内执行SOP.md",
    period: "自定义",
    stages: ["结营表彰", "服务转化"],
    city: "湖南通用",
    school: "小学/初中/高中通用",
    type: "结营表彰执行SOP",
    product: "连续打卡、学情报告、错题突破、组合品转化、PPT表彰仪式",
    materialRule: "按仪式流程插入PPT截图、表扬榜海报、完整版PPT附件和活动后转化素材。",
    coachRule: "群内采用文字+语音+PPT截图组合，文字控节奏，语音传情绪，截图制造仪式感。",
    conversionNode: "活动前邀约、活动中表彰、活动后私聊承接购买洋葱学园组合品。",
    usage: "适合社群结营当天直接执行，包含邀约、群公告、群内主持、表彰和转化跟进。"
  }
];

async function main() {
  if (!config.tables?.templates) {
    throw new Error("config.json 缺少 tables.templates，无法定位 SOP模板库。");
  }

  await ensureFields();
  await importTemplates();
}

async function ensureFields() {
  const fields = await listFields();
  const existingNames = new Set(fields.map((field) => field.field_name || field.name).filter(Boolean));

  for (const fieldName of REQUIRED_TEXT_FIELDS) {
    if (existingNames.has(fieldName)) {
      console.log(`[fields] 已存在：${fieldName}`);
      continue;
    }

    await run([
      "base", "+field-create",
      "--as", "user",
      "--base-token", config.baseToken,
      "--table-id", config.tables.templates,
      "--json", JSON.stringify({ name: fieldName, type: "text" })
    ]);
    console.log(`[fields] 已创建：${fieldName}`);
    await delay(800);
  }
}

async function importTemplates() {
  const existingNames = await listExistingTemplateNames();
  const rows = [];

  for (const template of TEMPLATES) {
    if (existingNames.has(template.name)) {
      console.log(`[import] 跳过已存在模板：${template.name}`);
      continue;
    }

    const absoluteFile = path.join(WORKSPACE_ROOT, template.file);
    const body = fs.readFileSync(absoluteFile, "utf8");

    rows.push([
      template.name,
      ["小学", "初中", "高中"],
      template.period,
      "",
      template.usage,
      "启用",
      template.stages,
      template.city,
      template.type,
      template.school,
      template.product,
      body,
      template.materialRule,
      template.coachRule,
      template.conversionNode,
      absoluteFile,
      IMPORT_BATCH
    ]);
  }

  if (rows.length === 0) {
    console.log("[import] 没有需要新增的模板。");
    return;
  }

  const fields = [
    "模板名称",
    "适用学段",
    "周期类型",
    "模板链接",
    "使用说明",
    "状态",
    "运营阶段",
    "适用城市/区域",
    "模板类型",
    "适用学校",
    "产品重点",
    "模板正文",
    "素材配置规则",
    "鼓励师话术规则",
    "转化节点",
    "来源文件",
    "导入批次"
  ];

  await run([
    "base", "+record-batch-create",
    "--as", "user",
    "--base-token", config.baseToken,
    "--table-id", config.tables.templates,
    "--json", JSON.stringify({ fields, rows })
  ]);

  console.log(`[import] 已导入 SOP 模板：${rows.length}条`);
}

async function listFields() {
  const response = await run([
    "base", "+field-list",
    "--as", "user",
    "--base-token", config.baseToken,
    "--table-id", config.tables.templates,
    "--format", "json"
  ]);
  return response.data?.items || response.data?.fields || response.items || [];
}

async function listExistingTemplateNames() {
  const response = await run([
    "base", "+record-list",
    "--as", "user",
    "--base-token", config.baseToken,
    "--table-id", config.tables.templates,
    "--limit", "200",
    "--format", "json",
    "--field-id", "模板名称"
  ]);

  const rows = response.data?.data || [];
  return new Set(rows.map((row) => normalizeText(row[0])).filter(Boolean));
}

function normalizeText(value) {
  if (Array.isArray(value)) return value.map(normalizeText).join("");
  if (value && typeof value === "object") return value.text || value.name || value.link || "";
  return String(value ?? "").trim();
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
      } catch {
        reject(new Error(`lark-cli 返回不是 JSON：${stdout}`));
      }
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
