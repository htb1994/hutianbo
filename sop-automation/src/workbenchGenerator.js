import { escapeXml, li, p } from "./xml.js";
import { firstValue, listValue } from "./records.js";

const BUILTIN_SCRIPTS = [
  {
    name: "开营邀约",
    scene: "开营邀约",
    text: "家长您好，我们这期【暑假加油站】主要是帮孩子把暑假学习节奏先带起来：每天任务不重，但会有明确的学习动作、打卡反馈和鼓励师提醒。孩子只要愿意跟着完成，我们就能看到他的学习状态和薄弱点。"
  },
  {
    name: "每日打卡提醒",
    scene: "每日打卡",
    text: "同学们，今天的学习任务已经发出啦。完成后记得把截图发到群里，老师会逐个看。暑假最重要的不是一天学很多，而是每天都能稳稳完成一点。"
  },
  {
    name: "未打卡私聊",
    scene: "未打卡提醒",
    text: "家长您好，今天孩子这边还没有看到学习截图。我先提醒一下，不用给孩子太大压力，今晚先完成最基础的一项就可以。关键是别让节奏断掉。"
  },
  {
    name: "课程价值传递",
    scene: "课程价值",
    text: "洋葱学园的课程不是单纯让孩子看视频，而是把一个知识点拆成更容易理解的小步骤，再配合同步练习和错题反馈。孩子愿意学、能听懂，后面的刷题才更有效。"
  },
  {
    name: "结营表彰",
    scene: "结营表彰",
    text: "这段时间我们不只看成绩，更看孩子有没有开始行动、有没有坚持完成、有没有愿意面对错题。今天上榜的同学，都值得被认真表扬一次。"
  },
  {
    name: "转化承接",
    scene: "转化私聊",
    text: "家长您好，这段时间孩子的学习表现我们已经看到了。后面最关键的是不要让暑假的好状态断掉，建议继续用同步学、专项突破和学情报告把薄弱点接住，开学后会更稳。"
  },
  {
    name: "价格异议",
    scene: "异议处理",
    text: "我理解您会考虑价格。其实我们更建议先看孩子是否真的用得起来：如果孩子愿意跟着学、错题能被记录、家长能看到学情，这个产品才有价值。我们可以按孩子目前的薄弱点来判断是否适合。"
  }
];

export function buildTaskDocument(task, scripts = [], followups = [], dashboardRows = []) {
  const type = firstValue(task["任务类型"]) || "生成配套话术";
  if (type.includes("群发")) return buildDailyGroupContent(task, scripts);
  if (type.includes("转化")) return buildConversionScripts(task, scripts, followups);
  if (type.includes("看板")) return buildDashboardBrief(task, dashboardRows, followups);
  if (type.includes("跟进")) return buildFollowupGuide(task, followups);
  if (type.includes("海报") || type.includes("表彰")) return buildAwardBrief(task);
  return buildScriptPack(task, scripts);
}

export function buildScriptPack(task, scripts = []) {
  const title = `${taskTitle(task)}｜配套话术`;
  const matched = mergeScripts(scripts);
  return [
    `<title>${escapeXml(title)}</title>`,
    taskHeader(task, "这份话术包用于开营、日常打卡、课程价值传递、结营表彰和转化私聊。"),
    "<h1>一、群内话术</h1>",
    scriptSection(matched, ["开营邀约", "每日打卡", "课程价值", "结营表彰"]),
    "<h1>二、私聊话术</h1>",
    scriptSection(matched, ["未打卡提醒", "转化私聊", "异议处理"]),
    "<h1>三、使用提醒</h1>",
    "<ul>",
    li("群内话术要短，重点是让家长和学生马上知道今天要做什么。"),
    li("私聊话术先肯定孩子具体动作，再给下一步建议，最后才承接产品价值。"),
    li("涉及购买时，不要先报价，先复盘孩子表现和薄弱点。"),
    "</ul>"
  ].join("\n");
}

export function buildDailyGroupContent(task, scripts = []) {
  const matched = mergeScripts(scripts);
  const days = inferDays(task);
  const rows = [];
  for (let day = 1; day <= days; day += 1) {
    rows.push([
      `Day ${day}`,
      day <= Math.max(days - 2, 1) ? "服务运营" : "转化承接",
      day === 1 ? pick(matched, "开营邀约") : pick(matched, "每日打卡"),
      day <= Math.max(days - 2, 1) ? "提醒完成学习任务并反馈截图" : "展示学习成果，承接后续学习规划"
    ]);
  }
  return [
    `<title>${escapeXml(`${taskTitle(task)}｜每日群发内容`)}</title>`,
    taskHeader(task, "按天整理群发内容，运营老师可复制后直接发群或二次微调。"),
    tableWithHeader(["日期", "阶段", "群发话术", "当天动作"], rows)
  ].join("\n");
}

export function buildConversionScripts(task, scripts = [], followups = []) {
  const matched = mergeScripts(scripts);
  const hotFollowups = followups.filter((item) => ["A高意向", "B中意向"].includes(firstValue(item["意向等级"])));
  return [
    `<title>${escapeXml(`${taskTitle(task)}｜转化私聊话术`)}</title>`,
    taskHeader(task, "用于结营后承接组合品购买、异议处理和重点家长跟进。"),
    "<h1>一、通用转化私聊</h1>",
    p(pick(matched, "转化私聊")),
    "<h1>二、异议处理</h1>",
    p(pick(matched, "异议处理")),
    "<h1>三、重点跟进名单</h1>",
    hotFollowups.length
      ? tableWithHeader(["学生", "学校", "意向等级", "转化状态", "异议点", "跟进建议"], hotFollowups.slice(0, 50).map((item) => [
        item["学生姓名"] || "",
        item["学校"] || "",
        firstValue(item["意向等级"]),
        firstValue(item["转化状态"]),
        item["异议点"] || "",
        "先复盘学习表现，再给后续学习建议"
      ]))
      : p("暂无 A/B 意向跟进记录，可先在「转化跟进表」补充。")
  ].join("\n");
}

export function buildFollowupGuide(task, followups = []) {
  const rows = followups.slice(0, 100).map((item) => [
    item["学生姓名"] || "",
    item["学校"] || "",
    item["家长称呼"] || "",
    firstValue(item["意向等级"]),
    firstValue(item["转化状态"]),
    item["异议点"] || "",
    item["下次跟进时间"] || ""
  ]);
  return [
    `<title>${escapeXml(`${taskTitle(task)}｜转化跟进清单`)}</title>`,
    taskHeader(task, "把高意向、待跟进、已成交和暂不考虑家长沉淀下来，方便运营复盘。"),
    rows.length
      ? tableWithHeader(["学生", "学校", "家长", "意向等级", "状态", "异议点", "下次跟进"], rows)
      : p("当前跟进表暂无记录，请先在飞书「转化跟进表」录入。")
  ].join("\n");
}

export function buildDashboardBrief(task, dashboardRows = [], followups = []) {
  const totals = dashboardRows.reduce((acc, row) => {
    acc.students += number(row["学生数"]);
    acc.checkins += number(row["打卡人数"]);
    acc.missing += number(row["未打卡人数"]);
    acc.intent += number(row["意向客户数"]);
    acc.deals += number(row["成交数"]);
    return acc;
  }, { students: 0, checkins: 0, missing: 0, intent: 0, deals: 0 });
  const conversionRate = totals.intent ? `${Math.round((totals.deals / totals.intent) * 1000) / 10}%` : "暂无";
  return [
    `<title>${escapeXml(`${taskTitle(task)}｜数据看板简报`)}</title>`,
    taskHeader(task, "第一版先生成数据简报，后续可升级为飞书仪表盘。"),
    "<h1>一、核心数据</h1>",
    table([
      ["累计学生数", String(totals.students)],
      ["累计打卡人数", String(totals.checkins)],
      ["累计未打卡人数", String(totals.missing)],
      ["意向客户数", String(totals.intent)],
      ["成交数", String(totals.deals)],
      ["意向转化率", conversionRate],
      ["跟进记录数", String(followups.length)]
    ]),
    "<h1>二、日报明细</h1>",
    dashboardRows.length
      ? tableWithHeader(["项目", "日期", "学生数", "打卡", "未打卡", "意向", "成交", "备注"], dashboardRows.map((row) => [
        row["项目名称"] || "",
        row["日期"] || "",
        row["学生数"] || "",
        row["打卡人数"] || "",
        row["未打卡人数"] || "",
        row["意向客户数"] || "",
        row["成交数"] || "",
        row["备注"] || ""
      ]))
      : p("暂无数据日报记录，请先在飞书「运营数据日报」录入。")
  ].join("\n");
}

export function buildAwardBrief(task) {
  const awards = listValue(task["奖项设置"]);
  const names = parseNames(task["学生名单"]);
  return [
    `<title>${escapeXml(`${taskTitle(task)}｜表彰物料生成说明`)}</title>`,
    taskHeader(task, "第一版先生成表彰执行说明；海报/PPT可继续使用本地红金模板脚本批量导出。"),
    "<h1>一、奖项设置</h1>",
    awards.length ? `<ul>${awards.map((award) => li(award)).join("")}</ul>` : p("未填写奖项设置，建议使用连续打卡之星、进步突破之星、错题攻坚之星、课堂专注之星、暑假潜力之星。"),
    "<h1>二、学生名单</h1>",
    names.length ? tableWithHeader(["序号", "姓名"], names.map((name, index) => [String(index + 1), name])) : p("未填写学生名单。"),
    "<h1>三、发群建议</h1>",
    "<ul>",
    li("先发结营开场文字，再发奖项海报，最后发鼓励师语音或文字表扬。"),
    li("每张海报对应一段简短表扬话术，避免只甩图片。"),
    li("表彰结束后再承接学习规划，不要在第一条就直接转化。"),
    "</ul>"
  ].join("\n");
}

function taskHeader(task, description) {
  return [
    `<callout emoji="✅" background-color="light-green" border-color="green">`,
    p(description),
    p(`项目：${task["所属项目"] || task["任务名称"] || "未填写"}；学校/城市：${task["城市/学校"] || "未填写"}；活动：${task["活动名称"] || "暑假加油站"}。`),
    `</callout>`
  ].join("\n");
}

function scriptSection(scripts, scenes) {
  return scenes.map((scene) => [
    `<h2>${escapeXml(scene)}</h2>`,
    p(pick(scripts, scene))
  ].join("\n")).join("\n");
}

function mergeScripts(scripts) {
  const active = scripts.filter((item) => firstValue(item["状态"]) !== "停用");
  const mapped = new Map(BUILTIN_SCRIPTS.map((script) => [script.scene, script.text]));
  for (const item of active) {
    const scene = firstValue(item["使用场景"]);
    const text = item["话术正文"];
    if (scene && text) mapped.set(scene, text);
  }
  return mapped;
}

function pick(scripts, scene) {
  return scripts.get(scene) || BUILTIN_SCRIPTS.find((script) => script.scene === scene)?.text || "";
}

function inferDays(task) {
  const text = `${task["补充要求"] || ""} ${task["活动名称"] || ""}`;
  const match = text.match(/(\d+)\s*天/);
  return match ? Math.min(Math.max(Number(match[1]), 1), 31) : 14;
}

function taskTitle(task) {
  return task["任务名称"] || `${task["城市/学校"] || "洋葱学园"}${task["活动名称"] || "暑假加油站"}`;
}

function parseNames(value) {
  return [...new Set(String(value || "").split(/[\n、,，\t ]+/).map((item) => item.trim()).filter(Boolean))];
}

function number(value) {
  const parsed = Number(firstValue(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function table(rows) {
  return tableWithHeader(["字段", "内容"], rows);
}

function tableWithHeader(headers, rows) {
  const head = headers.map((header) => `<th background-color="light-gray">${escapeXml(header)}</th>`).join("");
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeXml(cell)}</td>`).join("")}</tr>`).join("\n");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}
