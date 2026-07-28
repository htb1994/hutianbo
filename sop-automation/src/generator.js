import { escapeXml, li, p } from "./xml.js";
import { firstValue, listValue } from "./records.js";

const SERVICE_DAYS = {
  "14天": 12,
  "21天": 14
};

export function buildSopDocument(project, materials, templates = []) {
  return buildSopDocumentPayload(project, materials, templates).content;
}

export function buildSopDocumentPayload(project, materials, templates = []) {
  const template = selectTemplate(project, templates);
  if (template?.["模板正文"]) {
    return buildTemplateFirstSop(project, materials, template);
  }
  return {
    content: buildFallbackSopDocument(project, materials, templates),
    docFormat: "xml",
    title: `${project["项目名称"] || "洋葱学园暑假加油站社群运营SOP"}｜自动生成版`
  };
}

function buildFallbackSopDocument(project, materials, templates = []) {
  const title = `${project["项目名称"] || "洋葱学园暑假加油站社群运营SOP"}｜自动生成版`;
  const city = firstValue(project["城市"]) || "湖南";
  const district = project["区县/校区"] || "本地";
  const period = firstValue(project["社群周期"]) || "自定义";
  const startDate = trimDate(project["开始日期"]);
  const endDate = trimDate(project["结束日期"]);
  const weekendRule = firstValue(project["周末规则"]) || "按项目安排";
  const templateType = firstValue(project["模板类型"]) || "服务转化版";
  const stages = listValue(project["学段"]);
  const productPoints = listValue(project["产品重点"]);
  const needsClosing = Boolean(project["是否需要结营表彰"]);

  const dayCount = inferDayCount(period, startDate, endDate);
  const serviceDays = SERVICE_DAYS[period] ?? Math.max(dayCount - 2, 1);
  const relevantMaterials = matchMaterials(materials, productPoints);
  const template = selectTemplate(project, templates);

  return [
    `<title>${escapeXml(title)}</title>`,
    `<callout emoji="✅" background-color="light-green" border-color="green">`,
    p(`本 SOP 由「洋葱学园社群运营SOP生成工作台」根据飞书项目配置自动生成，适用于${city}${district}暑假加油站社群运营。`),
    p(`运营周期：${startDate || "未填写"} 至 ${endDate || "未填写"}；周期类型：${period}；模板类型：${templateType}。`),
    `</callout>`,
    `<h1>一、项目基本信息</h1>`,
    table([
      ["项目", project["项目名称"] || ""],
      ["城市/区域", `${city}${district}`],
      ["适用学段", stages.join("、") || "小学、初中、高中"],
      ["周末规则", weekendRule],
      ["产品重点", productPoints.join("、") || "同步学、同步刷题、专项突破、学情报告"],
      ["结营表彰", needsClosing ? "需要" : "不需要"]
    ]),
    template ? templateReferenceSection(template) : [
      `<h1>二、模板库匹配结果</h1>`,
      p("本次未匹配到启用状态的 SOP 模板，系统按默认暑假加油站结构生成。建议在「SOP模板库」补充对应城市、周期和产品重点。")
    ].join("\n"),
    `<h1>三、运营节奏</h1>`,
    `<ul>`,
    li(`前${serviceDays}天以纯服务为主：建立信任、引导APP使用、推动学习打卡、强化错题复盘。`),
    li(`第${serviceDays + 1}天开始进入转化承接：先展示学习成果，再讲产品价值和组合品权益。`),
    li(`周末规则：${weekendRule}。如周末休息，仅做课程价值传递、学习习惯提醒和家长认知铺垫。`),
    li(`鼓励师表达要接地气：多用孩子真实动作、完成截图、错题变化来沟通，少用空泛口号。`),
    `</ul>`,
    `<h1>四、每日执行SOP</h1>`,
    dailyTable(dayCount, serviceDays, weekendRule, productPoints),
    `<h1>五、素材配置建议</h1>`,
    materialTable(relevantMaterials),
    `<h1>六、鼓励师话术原则</h1>`,
    `<ul>`,
    li("先肯定具体行为，再给下一步动作。例如：今天同步刷题完成得很稳，明天把错题再过一遍，效果会更明显。"),
    li("对家长讲可见变化：完成了几节课、错题少了哪些、哪类题开始愿意动笔。"),
    li("转化期不要突然硬推，先复盘孩子这段时间的学习数据，再自然承接洋葱学园组合品。"),
    li("所有私聊都要留下一句可执行动作：今晚看哪一节、明天补哪一类题、家长需要关注哪一个报告。"),
    `</ul>`,
    `<h1>七、转化期承接话术</h1>`,
    p("家长您好，这段时间孩子在群里的学习状态我们已经帮您梳理了一下。现在最关键的不是再盲目多刷题，而是把已经暴露出来的薄弱点继续巩固。洋葱学园的同步学、专项突破、高频错题和学情报告可以把孩子后续学习路径接住，避免暑假结束后又回到没人盯、不会复盘的状态。"),
    `<h1>八、结营表彰建议</h1>`,
    needsClosing
      ? `<ul>${li("建议设置连续打卡之星、进步突破之星、错题攻坚之星、课堂专注之星、暑假潜力之星。")}${li("结营时按 PPT截图 + 语音表彰 + 文字名单 三段式执行，最后承接后续学习规划。")}</ul>`
      : p("本项目未勾选结营表彰，如后续需要，可在项目配置中开启后重新生成。"),
    `<h1>九、负责人检查项</h1>`,
    `<checkbox done="false">每日群内任务是否按时间发出。</checkbox>`,
    `<checkbox done="false">重点学生是否完成私聊跟进。</checkbox>`,
    `<checkbox done="false">素材是否与当天主题一致。</checkbox>`,
    `<checkbox done="false">转化期是否先展示成果再介绍组合品。</checkbox>`,
    `<checkbox done="false">输出链接是否回填到多维表格。</checkbox>`
  ].join("\n");
}

function buildTemplateFirstSop(project, materials, template) {
  const title = `${project["项目名称"] || "洋葱学园暑假加油站社群运营SOP"}｜模板完整执行版`;
  const city = firstValue(project["城市"]) || "湖南";
  const district = project["区县/校区"] || "本地";
  const period = firstValue(project["社群周期"]) || firstValue(template["周期类型"]) || "自定义";
  const startDate = trimDate(project["开始日期"]);
  const endDate = trimDate(project["结束日期"]);
  const weekendRule = firstValue(project["周末规则"]) || "按模板执行";
  const stages = listValue(project["学段"]);
  const productPoints = listValue(project["产品重点"]);
  const needsClosing = Boolean(project["是否需要结营表彰"]);
  const dayCount = inferDayCount(period, startDate, endDate);
  const serviceDays = SERVICE_DAYS[period] ?? Math.max(dayCount - 2, 1);
  const relevantMaterials = matchMaterials(materials, productPoints);
  const templateBody = localizeTemplateBody(template["模板正文"], {
    project,
    city,
    district,
    period,
    startDate,
    endDate,
    dayCount,
    serviceDays,
    stages,
    productPoints,
    needsClosing
  });

  const content = [
    `# ${title}`,
    "",
    "> 这份 SOP 按「SOP模板库」里的完整模板正文生成，保留每日节点、群内话术、私聊话术、鼓励师互动、素材位置和转化节奏。运营老师可以直接按天执行，再把文中的 xx老师、注册链接、报名链接、海报占位替换成项目实际信息。",
    "",
    "## 一、项目定制信息",
    "",
    markdownTable([
      ["项目", project["项目名称"] || "未填写"],
      ["城市/区域", `${city}${district}`],
      ["适用学段", stages.join("、") || "小学、初中、高中"],
      ["运营周期", `${startDate || "未填写"} 至 ${endDate || "未填写"}`],
      ["周期类型", period],
      ["服务/转化节奏", `前${serviceDays}天服务，第${serviceDays + 1}天开始转化，总计${dayCount}天`],
      ["周末规则", weekendRule],
      ["产品重点", productPoints.join("、") || "同步学、同步刷题、专项突破、学情报告"],
      ["结营表彰", needsClosing ? "需要" : "不需要"]
    ]),
    "",
    "## 二、匹配到的模板",
    "",
    markdownTable([
      ["模板名称", template["模板名称"] || "未命名模板"],
      ["模板类型", template["模板类型"] || "未填写"],
      ["适用区域", template["适用城市/区域"] || "未填写"],
      ["模板周期", firstValue(template["周期类型"]) || "未填写"],
      ["模板使用说明", template["使用说明"] || "未填写"],
      ["素材配置规则", template["素材配置规则"] || "未填写"],
      ["鼓励师话术规则", template["鼓励师话术规则"] || "未填写"],
      ["转化节点", template["转化节点"] || "未填写"]
    ]),
    "",
    "## 三、本项目素材匹配清单",
    "",
    relevantMaterials.length ? markdownTable([
      ["素材名称", "类型", "适用节点", "产品点", "使用提示"],
      ...relevantMaterials.slice(0, 20).map((material) => [
        material["素材名称"] || "",
        firstValue(material["素材类型"]),
        listValue(material["适用节点"]).join("、"),
        listValue(material["关联产品点"]).join("、"),
        material["使用话术提示"] || ""
      ])
    ]) : "当前素材库暂无可匹配素材，请先在「素材库」补充素材链接。",
    "",
    "## 四、运营前必须替换的信息",
    "",
    "- `xx老师`：替换为实际运营老师或鼓励师名称",
    "- `+注册链接`：替换为本项目注册/进班链接",
    "- `xxx`：替换为报名链接、团购链接、优惠倒计时等项目实际信息",
    "- `+自己的海报`、`+表扬榜`、`+缺一张海报`：替换为对应图片或 PPT 截图",
    "- `xx天`、`xx号`：按本项目周期和日期替换",
    "",
    "---",
    "",
    "# 五、详细执行 SOP（按模板完整保留）",
    "",
    templateBody
  ].join("\n");

  return {
    content,
    docFormat: "markdown",
    title
  };
}

function templateReferenceSection(template) {
  const body = String(template["模板正文"] || "");
  const excerpt = body.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").slice(0, 1600);
  const templateLink = template["模板链接"] ? p(`模板链接：${template["模板链接"]}`) : "";
  return [
    `<h1>二、模板库匹配结果</h1>`,
    `<callout emoji="🧩" background-color="light-blue" border-color="blue">`,
    p(`已匹配模板：${template["模板名称"] || "未命名模板"}`),
    p(`模板类型：${template["模板类型"] || "未填写"}；适用区域：${template["适用城市/区域"] || "未填写"}；周期：${firstValue(template["周期类型"]) || "未填写"}。`),
    templateLink,
    `</callout>`,
    table([
      ["模板使用说明", template["使用说明"] || "未填写"],
      ["产品重点", template["产品重点"] || "未填写"],
      ["素材配置规则", template["素材配置规则"] || "未填写"],
      ["鼓励师话术规则", template["鼓励师话术规则"] || "未填写"],
      ["转化节点", template["转化节点"] || "未填写"]
    ]),
    `<h2>模板正文参考摘要</h2>`,
    p(excerpt || "模板正文为空。")
  ].join("\n");
}

function selectTemplate(project, templates) {
  const active = templates.filter((template) => firstValue(template["状态"]) !== "停用");
  if (!active.length) return null;

  const city = `${firstValue(project["城市"])} ${project["区县/校区"] || ""}`;
  const period = firstValue(project["社群周期"]);
  const templateType = firstValue(project["模板类型"]);
  const stages = listValue(project["学段"]);
  const productPoints = listValue(project["产品重点"]);

  return active
    .map((template) => ({ template, score: scoreTemplate(template, { city, period, templateType, stages, productPoints }) }))
    .sort((a, b) => b.score - a.score)[0]?.template || null;
}

function scoreTemplate(template, project) {
  let score = 0;
  const haystack = [
    template["模板名称"],
    template["适用城市/区域"],
    template["适用学校"],
    template["模板类型"],
    template["产品重点"],
    template["使用说明"]
  ].join(" ");

  if (firstValue(template["状态"]) === "启用") score += 8;
  if (project.period && firstValue(template["周期类型"]) === project.period) score += 10;
  if (project.templateType && haystack.includes(project.templateType)) score += 8;
  if (project.city && includesAny(haystack, project.city.split(/\s+/).filter(Boolean))) score += 8;

  const templateStages = listValue(template["适用学段"]);
  score += project.stages.filter((stage) => templateStages.includes(stage)).length * 4;
  score += project.productPoints.filter((point) => haystack.includes(point)).length * 3;

  if (template["模板正文"]) score += 5;
  return score;
}

function includesAny(text, needles) {
  return needles.some((needle) => needle && text.includes(needle));
}

function localizeTemplateBody(body, context) {
  const school = context.project["区县/校区"] || context.district || "本地学校";
  const stageText = context.stages.join("、") || "对应年级";
  const productText = context.productPoints.join("、") || "洋葱学园APP";
  const dateText = context.startDate || "活动开始日";

  return String(body || "")
    .replace(/<title>[\s\S]*?<\/title>\s*/g, "")
    .replace(/#\s*2026暑假社群运营\s*副本\s*/g, "")
    .replaceAll("xx年级", stageText)
    .replaceAll("【xx年级", `【${stageText}`)
    .replaceAll("xx号", dateText)
    .replaceAll("总共xx天", `总共${context.dayCount}天`)
    .replaceAll("xx天暑假作业", `${context.dayCount}天暑假作业`)
    .replaceAll("本次暑假加油站总共为期xx天", `本次暑假加油站总共为期${context.dayCount}天`)
    .replaceAll("本次暑假加油站总共xx天", `本次暑假加油站总共${context.dayCount}天`)
    .replaceAll("咱们班", `${school}`)
    .replaceAll("对应年级的组合品", `${stageText}组合品`)
    .replaceAll("同步学、专项突破、学情报告、组合品", productText);
}

function markdownTable(rows) {
  if (!rows.length) return "";
  const hasHeader = rows[0].length > 2 || rows[0][0] === "素材名称";
  const headers = hasHeader ? rows[0] : ["字段", "内容"];
  const bodyRows = hasHeader ? rows.slice(1) : rows;
  return [
    `| ${headers.map(markdownCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...bodyRows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`)
  ].join("\n");
}

function markdownCell(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|")
    .trim();
}

function dailyTable(dayCount, serviceDays, weekendRule, productPoints) {
  const rows = [];
  for (let day = 1; day <= dayCount; day += 1) {
    const isConversion = day > serviceDays;
    const topic = isConversion ? conversionTopic(day - serviceDays, productPoints) : serviceTopic(day, productPoints);
    rows.push([
      `Day ${day}`,
      isConversion ? "转化承接" : "纯服务运营",
      topic.goal,
      topic.groupAction,
      topic.privateAction,
      topic.material
    ]);
  }

  return tableWithHeader(["天数", "阶段", "当天目标", "群内动作", "私聊动作", "素材建议"], rows)
    + p(`周末处理：${weekendRule}。如果当天遇到周末，可把强任务改成课程价值传递、学习成果展示、家长认知铺垫。`);
}

function serviceTopic(day, productPoints) {
  const topics = [
    ["开营建群信任", "发布开营欢迎、群规、打卡方式和APP任务入口", "私聊未进群/未登录家长，确认孩子年级和学习薄弱点", "APP路径图、任务入口录屏"],
    ["APP同步学习启动", "布置同步学第一节体验任务，提醒完成截图反馈", "跟进未完成学生，降低第一步门槛", "同步学/同步刷题操作视频"],
    ["错题意识建立", "讲清楚错题不是丢脸，是提分入口", "私聊错题多的学生家长，给出1个可完成的小目标", "高频错题或专项突破视频"],
    ["学习反馈展示", "晒优秀打卡、完成截图、阶段小榜单", "表扬具体行为，推动中间层学生补任务", "学情报告功能图"],
    ["专项突破", "围绕薄弱知识点布置专项练习", "给薄弱学生建议：先看课再刷题", "专项突破操作视频"],
    ["家长信任铺垫", "分享课程制作、师资或学习效果素材", "私聊家长解释孩子数据背后的问题", "品牌/师资/课程质量素材"]
  ];
  const picked = topics[(day - 1) % topics.length];
  const product = productPoints[(day - 1) % Math.max(productPoints.length, 1)] || "洋葱学园APP";
  return {
    goal: picked[0],
    groupAction: `${picked[1]}，结合${product}提醒当天完成标准。`,
    privateAction: picked[2],
    material: picked[3]
  };
}

function conversionTopic(offset, productPoints) {
  const product = productPoints.join("、") || "同步学、专项突破、学情报告、组合品";
  if (offset === 1) {
    return {
      goal: "学习成果复盘",
      groupAction: "发布阶段学习成果、优秀打卡和进步案例。",
      privateAction: "私聊重点家长，先复盘孩子变化，再提出后续学习建议。",
      material: "用户好评、学情报告、完成数据截图"
    };
  }
  return {
    goal: "组合品转化承接",
    groupAction: `讲清楚${product}如何承接暑假后的持续学习。`,
    privateAction: "对高意向家长发送组合品购买建议和适配理由。",
    material: "组合品权益图、试卷库/错题/学情报告功能素材"
  };
}

function materialTable(materials) {
  if (!materials.length) {
    return p("当前素材库暂无可匹配素材，请先在「素材库」补充素材链接。");
  }

  return tableWithHeader(
    ["素材名称", "类型", "适用节点", "产品点", "使用提示"],
    materials.slice(0, 12).map((material) => [
      material["素材名称"] || "",
      firstValue(material["素材类型"]),
      listValue(material["适用节点"]).join("、"),
      listValue(material["关联产品点"]).join("、"),
      material["使用话术提示"] || ""
    ])
  );
}

function matchMaterials(materials, productPoints) {
  const points = new Set(productPoints);
  return materials.filter((material) => {
    const isUsable = firstValue(material["状态"]) === "可用";
    const materialPoints = listValue(material["关联产品点"]);
    return isUsable && (!points.size || materialPoints.some((point) => points.has(point)));
  });
}

function inferDayCount(period, startDate, endDate) {
  if (period === "14天") return 14;
  if (period === "21天") return 21;
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return 14;
  const diff = Math.round((end - start) / 86400000) + 1;
  return Math.min(Math.max(diff, 1), 31);
}

function parseDate(value) {
  if (!value) return null;
  const normalized = String(value).slice(0, 10);
  const timestamp = Date.parse(`${normalized}T00:00:00+08:00`);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

function trimDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

function table(rows) {
  return tableWithHeader(["字段", "内容"], rows);
}

function tableWithHeader(headers, rows) {
  const head = headers.map((header) => `<th background-color="light-gray">${escapeXml(header)}</th>`).join("");
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeXml(cell)}</td>`).join("")}</tr>`).join("\n");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}
