import { loadConfig } from "./config.js";
import { createLarkClient } from "./larkCli.js";
import { PROJECT_FIELDS, SCRIPT_FIELDS, firstValue, listValue, rowsToObjects } from "./records.js";

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
  return new SopBot({ config, lark, ...options });
}

export function detectIntent(text) {
  const normalized = normalizeText(text);
  if (/^\/?(help|帮助|菜单|功能)$/i.test(normalized)) return "help";
  if (/^\/?(reset|重新来|重置)$/i.test(normalized)) return "reset";
  if (/^\/?(status|进度|查进度)$/i.test(normalized) || /(进度|状态|链接|生成好了吗|好了没|查一下)/.test(normalized)) return "progress";
  if (/(话术|怎么说|私聊|群发|朋友圈|邀约|异议|催打卡|未打卡|转化话术|群公告)/.test(normalized)) return "script";
  if (/(SOP|sop|社群运营|开学收心营|暑假加油站|寒假|训练营|加油站)/.test(normalized) || /^生成/.test(normalized)) return "sop";
  return "unknown";
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
      await this.reply(message.message_id, "我现在第一版先支持文字消息。你可以发 /help 看我能做什么。");
      return { ok: true, ignored: "non_text" };
    }

    const rawText = extractText(message);
    const text = stripBotMention(rawText, message.mentions);
    if (!shouldHandleMessage(text, message)) return { ok: true, ignored: "not_bot_request" };

    const sessionKey = buildSessionKey(event, message);
    this.processMessage({ sessionKey, messageId: message.message_id, text }).catch((error) => {
      console.error("[sop-bot] 处理消息失败", error);
      if (message.message_id) {
        this.reply(message.message_id, `处理失败了：${shortError(error)}\n你可以补充完整信息后再发一次。`).catch(() => {});
      }
    });

    return { ok: true };
  }

  async processMessage({ sessionKey, messageId, text }) {
    const intent = detectIntent(text);

    if (intent === "help") {
      await this.reply(messageId, helpText());
      return;
    }

    if (intent === "reset") {
      sessions.delete(sessionKey);
      await this.reply(messageId, "已重置。你可以重新发：生成长沙某某学校初中14天开学收心营SOP，8月24日开始。");
      return;
    }

    if (intent === "progress") {
      await this.handleProgress({ sessionKey, messageId, text });
      return;
    }

    if (intent === "script") {
      await this.handleScript({ messageId, text });
      return;
    }

    if (intent === "unknown") {
      await this.reply(messageId, unknownIntentText());
      return;
    }

    await this.handleSop({ sessionKey, messageId, text });
  }

  async handleSop({ sessionKey, messageId, text }) {
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

    const created = await this.lark.createRecords({
      tableId: this.config.tables.projects,
      records: [buildProjectRecord(project)]
    });
    const recordId = created.data?.record_id_list?.[0];
    if (!recordId) throw new Error(`项目配置记录创建成功但没有返回 record_id：${JSON.stringify(created).slice(0, 300)}`);

    const { processProjectByRecordId } = await import("./server.js");
    const result = await processProjectByRecordId(recordId, { force: true });
    await this.reply(messageId, doneText(project, result?.url, recordId));
  }

  async handleProgress({ sessionKey, messageId, text }) {
    const session = sessions.get(sessionKey);
    if (session?.project && missingFields(session.project).length) {
      await this.reply(messageId, `当前还有一条 SOP 需求没补齐：\n${statusText(session.project)}`);
      return;
    }

    const keyword = parseProgressKeyword(text);
    const records = await this.fetchProjectRecords();
    const matched = findProgressRecords(records, keyword);
    await this.reply(messageId, progressText(matched, keyword));
  }

  async handleScript({ messageId, text }) {
    const request = parseScriptRequest(text);
    const scripts = await this.fetchScripts();
    const matched = matchScripts(scripts, request);
    await this.reply(messageId, scriptReplyText(request, matched));
  }

  async fetchProjectRecords() {
    const response = await this.lark.listRecords({
      tableId: this.config.tables.projects,
      fields: PROJECT_FIELDS,
      limit: this.config.defaults.pollLimit || 100
    });
    return rowsToObjects(response).filter((record) => record["项目名称"]);
  }

  async fetchScripts() {
    if (!this.config.tables.scripts) return [];
    try {
      const response = await this.lark.listRecords({
        tableId: this.config.tables.scripts,
        fields: SCRIPT_FIELDS,
        limit: this.config.defaults.pollLimit || 100
      });
      return rowsToObjects(response).filter((record) => !firstValue(record["状态"]) || firstValue(record["状态"]) === "可用");
    } catch (error) {
      console.warn("[sop-bot] 话术库读取失败", error.message);
      return [];
    }
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
  return detectIntent(value) !== "unknown";
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
    "状态：待审核",
    url ? `云文档：${url}` : "云文档：已生成，但链接暂未返回，请到项目配置表查看。",
    `项目配置记录：${recordId}`
  ].join("\n");
}

function parseProgressKeyword(text) {
  return normalizeText(text)
    .replace(/^\/?(status|进度|查进度)/i, "")
    .replace(/(查一下|查|看看|进度|状态|链接|生成好了吗|好了没|怎么样|的)/g, " ")
    .trim();
}

function findProgressRecords(records, keyword) {
  const sorted = [...records].reverse();
  if (!keyword) return sorted.slice(0, 5);
  const words = keyword.split(/[\s,，、]+/).filter(Boolean);
  return sorted.filter((record) => {
    const haystack = [
      record["项目名称"],
      firstValue(record["城市"]),
      record["区县/校区"],
      firstValue(record["生成状态"])
    ].join(" ");
    return words.every((word) => haystack.includes(word));
  }).slice(0, 5);
}

function progressText(records, keyword) {
  if (!records.length) {
    return keyword
      ? `没有查到和「${keyword}」匹配的 SOP 记录。你可以换项目名、城市或学校再查一次。`
      : "暂时没有查到 SOP 项目记录。";
  }

  return [
    keyword ? `查到和「${keyword}」相关的记录：` : "最近的 SOP 记录：",
    "",
    ...records.map((record, index) => {
      const url = record["SOP云文档链接"] || "暂无链接";
      return [
        `${index + 1}. ${record["项目名称"]}`,
        `状态：${firstValue(record["生成状态"]) || "未填写"}`,
        `城市/校区：${firstValue(record["城市"]) || ""}${record["区县/校区"] ? ` / ${record["区县/校区"]}` : ""}`,
        `链接：${url}`,
        `备注：${record["备注"] || "无"}`
      ].join("\n");
    })
  ].join("\n");
}

function parseScriptRequest(text) {
  const normalized = normalizeText(text);
  return {
    scenario: parseScenario(normalized),
    stages: parseStages(normalized),
    productPoints: parseProductPoints(normalized),
    raw: normalized
  };
}

function parseScenario(text) {
  const scenarioMap = [
    ["开营邀约", ["开营", "邀约", "邀请"]],
    ["每日打卡", ["打卡", "每日"]],
    ["未打卡提醒", ["未打卡", "催打卡", "提醒打卡"]],
    ["课程价值", ["课程价值", "价值传递", "课程介绍"]],
    ["结营表彰", ["结营", "表彰"]],
    ["转化私聊", ["转化", "购买", "私聊", "续费", "组合品"]],
    ["异议处理", ["异议", "太贵", "没时间", "不考虑"]],
    ["群公告", ["群公告", "公告"]]
  ];
  const matched = scenarioMap.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));
  return matched?.[0] || "通用话术";
}

function matchScripts(scripts, request) {
  return scripts
    .map((script) => ({ script, score: scoreScript(script, request) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.script);
}

function scoreScript(script, request) {
  const haystack = [
    script["话术名称"],
    firstValue(script["使用场景"]),
    listValue(script["适用学段"]).join(" "),
    listValue(script["产品点"]).join(" "),
    script["话术正文"]
  ].join(" ");
  let score = 0;
  if (request.scenario && haystack.includes(request.scenario)) score += 10;
  for (const stage of request.stages) {
    if (haystack.includes(stage)) score += 4;
  }
  for (const product of request.productPoints) {
    if (haystack.includes(product)) score += 4;
  }
  for (const keyword of request.raw.split(/[\s,，、]+/).filter((item) => item.length >= 2)) {
    if (haystack.includes(keyword)) score += 1;
  }
  return score;
}

function scriptReplyText(request, scripts) {
  if (scripts.length) {
    return [
      `给你匹配到 ${scripts.length} 条「${request.scenario}」话术：`,
      "",
      ...scripts.map((script, index) => [
        `${index + 1}. ${script["话术名称"] || request.scenario}`,
        script["话术正文"] || "这条话术正文为空，请到话术库补充。",
        ""
      ].join("\n"))
    ].join("\n").trim();
  }

  return [
    `话术库里暂时没匹配到「${request.scenario}」，先给你一版可直接发的：`,
    "",
    fallbackScript(request)
  ].join("\n");
}

function fallbackScript(request) {
  if (request.scenario === "结营表彰") {
    return "各位家长、同学晚上好，本期洋葱学园学习陪伴到这里就进入收官阶段啦。我们会根据孩子这段时间的打卡、听课、练习和进步情况做一次小小的表彰，不是为了排名，而是让每个认真坚持的孩子被看见。也欢迎家长今晚一起见证孩子的努力。";
  }
  if (request.scenario === "转化私聊") {
    return "家长您好，我看孩子这段时间在洋葱学园里的学习状态还是有亮点的，尤其是愿意跟着节奏完成练习。接下来如果想把这份状态延续到开学后，建议用同步学加专项练习继续巩固，我可以按孩子当前情况给您配一套更适合的组合方案，您看我发您参考一下可以吗？";
  }
  if (request.scenario === "未打卡提醒") {
    return "家长您好，提醒一下孩子今天的洋葱学习任务还没有完成。今天内容不多，建议先完成视频学习，再做几道同步练习，把节奏稳住。暑假/开学前最重要的不是一天学很多，而是每天不断档。";
  }
  return "各位家长好，今天我们继续围绕孩子的学习习惯和薄弱点做陪伴。洋葱学园这边建议孩子先看对应知识点视频，再完成同步练习，最后把错题回看一遍。每天坚持一点点，开学后的状态会明显更稳。";
}

function unknownIntentText() {
  return [
    "我现在可以处理这些事：",
    "1. 生成SOP：生成衡阳某某学校初中14天开学收心营SOP，8月24日开始",
    "2. 查话术：查结营邀约话术 / 发一个未打卡提醒话术",
    "3. 查进度：查衡阳成章实验中学进度",
    "",
    "你也可以发 /help 看完整示例。"
  ].join("\n");
}

function helpText() {
  return [
    "我是洋葱学园社群运营助手，同一个机器人可以做这些事：",
    "",
    "1. 生成完整社群SOP",
    "示例：生成长沙中建仰天湖小学小学14天开学收心营SOP，8月24日开始，周末轻服务，服务转化版，产品重点同步学、提前学、同步刷题、学情报告，需要结营表彰。",
    "",
    "2. 查询/生成话术",
    "示例：查结营邀约话术 / 发一个未打卡提醒话术 / 给我一段组合品转化私聊话术",
    "",
    "3. 查询生成进度",
    "示例：查长沙中建仰天湖进度 / /status",
    "",
    "常用命令：",
    "/status 查看当前补齐进度或最近生成记录",
    "/reset 重置当前会话",
    "/help 查看功能菜单"
  ].join("\n");
}

function makeIdempotencyKey(messageId, text) {
  const seed = `${messageId}:${text}`.replace(/[^a-zA-Z0-9]/g, "");
  return seed.slice(0, 50) || undefined;
}

function shortError(error) {
  return String(error?.message || error).replace(/\s+/g, " ").slice(0, 300);
}
