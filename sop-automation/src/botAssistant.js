import { loadConfig } from "./config.js";
import { createLarkClient } from "./larkCli.js";

const DEFAULT_PRODUCTS = ["同步学", "同步刷题", "专项突破", "学情报告"];
const PRODUCT_KEYWORDS = ["同步学", "提前学", "同步刷题", "专项突破", "试卷库", "高频错题", "学情报告", "组合品"];
const STAGES = ["小学", "初中", "高中"];
const PERIODS = ["7天", "14天", "15天", "19天", "21天"];
const WEEKEND_RULES = ["周末轻服务", "周末休息", "周末正常运营"];
const TEMPLATE_TYPES = ["服务转化版", "转化加强版", "纯服务版"];

const sessions = new Map();
const handledEvents = new Set();

export function createBotAssistant(options = {}) {
  const config = loadConfig();
  const lark = createLarkClient(config);
  const bot = new SopBot({ config, lark, ...options });
  return bot;
}

export function parseProjectRequest(text, previous = {}) {
  const normalized = normalizeText(text);
  const parsed = { ...previous };
  const projectName = parseProjectName(normalized);
  const city = parseCity(normalized);
  const district = parseDistrict(normalized, city);
  const stages = parseStages(normalized);
  const periodInfo = parsePeriod(normalized);
  const startDate = parseStartDate(normalized);
  const weekendRule = parseWeekendRule(normalized);
  const templateType = parseTemplateType(normalized);
  const productPoints = parseProductPoints(normalized);

  if (projectName) parsed.projectName = projectName;
  if (city) parsed.city = city;
  if (district) parsed.district = district;
  if (stages.length) parsed.stages = stages;
  if (periodInfo.period) parsed.period = periodInfo.period;
  if (periodInfo.customDays) parsed.customDays = periodInfo.customDays;
  if (startDate) parsed.startDate = startDate;
  if (weekendRule) parsed.weekendRule = weekendRule;
  if (templateType) parsed.templateType = templateType;
  if (productPoints.length) parsed.productPoints = productPoints;
  if (/不需要结营|不要结营|不表彰/.test(normalized)) parsed.needsClosing = false;
  if (/结营|表彰/.test(normalized)) parsed.needsClosing = true;

  return parsed;
}

export function missingFields(project) {
  const missing = [];
  if (!project.projectName) missing.push("项目名称");
  if (!project.city) missing.push("城市");
  if (!project.district) missing.push("区县/校区或学校");
  if (!project.stages?.length) missing.push("学段");
  if (!project.period) missing.push("社群周期");
  if (project.period === "自定义" && !project.customDays) missing.push("运营天数");
  if (!project.startDate) missing.push("开始日期");
  return missing;
}

export function buildProjectRecord(project) {
  const period = project.period || "14天";
  return {
    "项目名称": project.projectName,
    "城市": project.city,
    "区县/校区": project.district,
    "学段": project.stages,
    "社群周期": period,
    ...(period === "自定义" ? { "运营天数": Number(project.customDays) } : {}),
    "开始日期": `${project.startDate} 00:00:00`,
    "周末规则": project.weekendRule || "周末轻服务",
    "模板类型": project.templateType || "服务转化版",
    "产品重点": project.productPoints?.length ? project.productPoints : DEFAULT_PRODUCTS,
    "是否需要结营表彰": project.needsClosing ?? true,
    "生成状态": "生成中",
    "备注": "由飞书机器人创建并自动生成"
  };
}

class SopBot {
  constructor({ config, lark }) {
    this.config = config;
    this.lark = lark;
  }

  async handleEvent(body) {
    if (body?.challenge) return { challenge: body.challenge };
    if (body?.type === "url_verification" && body?.challenge) return { challenge: body.challenge };

    const eventId = body?.header?.event_id || body?.uuid || body?.event_id;
    if (eventId) {
      if (handledEvents.has(eventId)) return { ok: true, deduped: true };
      handledEvents.add(eventId);
      setTimeout(() => handledEvents.delete(eventId), 10 * 60 * 1000).unref?.();
    }

    const eventType = body?.header?.event_type || body?.type;
    if (eventType && eventType !== "im.message.receive_v1") return { ok: true, ignored: eventType };

    const event = body?.event || {};
    const message = event.message || {};
    if (message.message_type && message.message_type !== "text") {
      await this.reply(message.message_id, "我现在第一版先支持文字生成 SOP。你可以直接发：生成衡阳成章实验中学初中14天开学收心营SOP，8月24日开始。");
      return { ok: true, ignored: "non_text" };
    }

    const rawText = extractText(message);
    const text = stripBotMention(rawText, message.mentions);
    if (!shouldHandleMessage(text, message)) return { ok: true, ignored: "not_sop_request" };

    const sessionKey = buildSessionKey(event, message);
    this.processMessage({ sessionKey, messageId: message.message_id, text }).catch((error) => {
      console.error("[sop-bot] 处理消息失败", error);
      if (message.message_id) {
        this.reply(message.message_id, `生成失败了：${shortError(error)}\n你可以补充完整信息后再发一次。`).catch(() => {});
      }
    });

    return { ok: true };
  }

  async processMessage({ sessionKey, messageId, text }) {
    if (/^\/?(help|帮助)$/i.test(text.trim())) {
      await this.reply(messageId, helpText());
      return;
    }

    if (/^\/?(reset|重新来|重置)$/i.test(text.trim())) {
      sessions.delete(sessionKey);
      await this.reply(messageId, "已重置。你可以重新发：生成长沙某某学校初中14天开学收心营SOP，8月24日开始。");
      return;
    }

    if (/^\/?(status|进度|查进度)$/i.test(text.trim())) {
      const session = sessions.get(sessionKey);
      await this.reply(messageId, session ? statusText(session.project) : "当前会话没有正在补齐的 SOP 需求。");
      return;
    }

    const session = sessions.get(sessionKey) || { project: {} };
    const project = parseProjectRequest(text, session.project);
    const missing = missingFields(project);

    if (missing.length) {
      sessions.set(sessionKey, { project, updatedAt: Date.now() });
      await this.reply(messageId, askMissingText(project, missing));
      return;
    }

    sessions.delete(sessionKey);
    await this.reply(messageId, `收到，开始生成：${project.projectName}\n我会先写入项目配置表，然后自动生成云文档。`);

    const record = buildProjectRecord(project);
    const created = await this.lark.createRecords({
      tableId: this.config.tables.projects,
      records: [record]
    });
    const recordId = created.data?.record_id_list?.[0];
    if (!recordId) throw new Error(`项目配置记录创建成功但没有返回 record_id：${JSON.stringify(created).slice(0, 300)}`);

    const { processProjectByRecordId } = await import("./server.js");
    const result = await processProjectByRecordId(recordId, { force: true });
    await this.reply(messageId, doneText(project, result?.url, recordId));
  }

  async reply(messageId, text) {
    if (!messageId) return;
    return this.lark.replyMessage({
      messageId,
      text,
      idempotencyKey: makeIdempotencyKey(messageId, text)
    });
  }
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[，。；：]/g, (match) => ({ "，": ",", "。": ".", "；": ";", "：": ":" }[match]))
    .replace(/\s+/g, " ")
    .trim();
}

function extractText(message) {
  const content = message?.content;
  if (!content) return "";
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      return parsed.text || parsed.content || "";
    } catch {
      return content;
    }
  }
  return content.text || content.content || "";
}

function stripBotMention(text, mentions = []) {
  let cleaned = String(text || "");
  for (const mention of mentions || []) {
    if (mention?.key) cleaned = cleaned.replaceAll(mention.key, "");
    if (mention?.name) cleaned = cleaned.replaceAll(`@${mention.name}`, "");
  }
  return cleaned.trim();
}

function shouldHandleMessage(text, message) {
  const value = String(text || "").trim();
  if (!value) return false;
  if (message.chat_type === "p2p") return true;
  return /SOP|sop|生成|社群|话术|进度|帮助|\/help|\/status|\/reset/.test(value);
}

function buildSessionKey(event, message) {
  const sender = event?.sender?.sender_id?.open_id || event?.sender?.sender_id?.user_id || "unknown";
  return `${message.chat_id || "chat"}:${sender}`;
}

function parseProjectName(text) {
  const match = text.match(/(?:生成|做一版|制作|帮我做|帮我生成)\s*(.+?)(?:SOP|sop|云文档|$)/);
  const raw = match?.[1] || (/(SOP|sop)/.test(text) ? text.replace(/SOP|sop/g, "") : "");
  const cleaned = raw
    .replace(/^(一个|一版|一下|请|帮我)/, "")
    .replace(/[,.;].*$/, "")
    .replace(/(需要|不用|不要)?结营表彰/g, "")
    .trim();
  if (!cleaned || cleaned.length < 4) return "";
  return cleaned.endsWith("SOP") ? cleaned : `${cleaned}SOP`;
}

function parseCity(text) {
  const direct = text.match(/(?:城市|地区)[:： ]*([\u4e00-\u9fa5]{2,6})(?:市)?/);
  if (direct) return normalizeCity(direct[1]);
  const known = ["衡阳", "怀化", "长沙", "株洲", "湘潭", "岳阳", "益阳", "郴州", "常德", "邵阳", "永州", "娄底", "张家界", "湘西"];
  const knownCity = known.find((item) => text.includes(item));
  if (knownCity) return knownCity;
  const city = text.match(/([\u4e00-\u9fa5]{2,6})市/);
  if (city) return normalizeCity(city[1].replace(/^(生成|制作|帮我|做一版)/, ""));
  return "";
}

function normalizeCity(value) {
  return String(value || "").replace(/市$/, "").trim();
}

function parseDistrict(text, city) {
  const explicit = text.match(/(?:区县|校区|学校)[:： ]*([\u4e00-\u9fa5A-Za-z0-9（）()·-]{2,30})/);
  if (explicit) return cleanupDistrict(explicit[1]);
  const school = text.match(/([\u4e00-\u9fa5A-Za-z0-9（）()·-]{2,30}(?:学校|中学|小学|高中|实验|校区))/);
  if (school) return cleanupDistrict(school[1]);
  const district = text.match(/([\u4e00-\u9fa5]{2,8}(?:区|县|市))/);
  if (district && district[1] !== `${city}市`) return cleanupDistrict(district[1]);
  return "";
}

function cleanupDistrict(value) {
  return String(value || "")
    .replace(/^(城市|地区|区县|校区|学校)[:： ]*/, "")
    .replace(/^(生成|制作|帮我生成|帮我做|做一版|帮我)/, "")
    .replace(/(初中|小学|高中|14天|21天|15天|19天|7天).*$/, "")
    .trim();
}

function parseStages(text) {
  return STAGES.filter((stage) => text.includes(stage));
}

function parsePeriod(text) {
  const days = text.match(/(\d{1,2})\s*天/);
  if (!days) return {};
  const value = `${Number(days[1])}天`;
  if (PERIODS.includes(value)) return { period: value };
  return { period: "自定义", customDays: Number(days[1]) };
}

function parseStartDate(text) {
  const full = text.match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})日?/);
  if (full) return formatDate(Number(full[1]), Number(full[2]), Number(full[3]));
  const short = text.match(/(\d{1,2})月(\d{1,2})日?/);
  if (short) return formatDate(new Date().getFullYear(), Number(short[1]), Number(short[2]));
  return "";
}

function formatDate(year, month, day) {
  if (!year || !month || !day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseWeekendRule(text) {
  return WEEKEND_RULES.find((rule) => text.includes(rule)) || "";
}

function parseTemplateType(text) {
  return TEMPLATE_TYPES.find((type) => text.includes(type)) || "";
}

function parseProductPoints(text) {
  return PRODUCT_KEYWORDS.filter((keyword) => text.includes(keyword));
}

function askMissingText(project, missing) {
  return [
    "我可以生成，但还差这些信息：",
    missing.map((item) => `- ${item}`).join("\n"),
    "",
    "你直接补一句就行，例如：",
    "城市衡阳，学校成章实验中学，初中，14天，8月24日开始，周末轻服务，服务转化版，产品重点同步学、同步刷题、专项突破、学情报告，需要结营表彰。",
    "",
    statusText(project)
  ].join("\n");
}

function statusText(project) {
  const pairs = [
    ["项目名称", project.projectName],
    ["城市", project.city],
    ["区县/校区", project.district],
    ["学段", project.stages?.join("、")],
    ["周期", project.period === "自定义" ? `${project.customDays || ""}天` : project.period],
    ["开始日期", project.startDate],
    ["周末规则", project.weekendRule || "默认周末轻服务"],
    ["模板类型", project.templateType || "默认服务转化版"],
    ["产品重点", project.productPoints?.length ? project.productPoints.join("、") : DEFAULT_PRODUCTS.join("、")]
  ];
  return pairs.map(([key, value]) => `${key}：${value || "未填写"}`).join("\n");
}

function doneText(project, url, recordId) {
  return [
    `已生成：${project.projectName}`,
    `状态：待审核`,
    url ? `云文档：${url}` : "云文档：已生成，但链接暂未返回，请到项目配置表查看。",
    `项目配置记录：${recordId}`
  ].join("\n");
}

function helpText() {
  return [
    "洋葱学园 SOP 助手第一版可以这样用：",
    "",
    "生成长沙中建仰天湖小学小学14天开学收心营SOP，8月24日开始，周末轻服务，服务转化版，产品重点同步学、提前学、同步刷题、学情报告，需要结营表彰。",
    "",
    "常用命令：",
    "/status 查看当前补齐进度",
    "/reset 重置当前会话"
  ].join("\n");
}

function makeIdempotencyKey(messageId, text) {
  const seed = `${messageId}:${text}`.replace(/[^a-zA-Z0-9]/g, "");
  return seed.slice(0, 50) || undefined;
}

function shortError(error) {
  return String(error?.message || error).replace(/\s+/g, " ").slice(0, 300);
}
