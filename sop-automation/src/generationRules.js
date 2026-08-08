import { firstValue, listValue } from "./records.js";

export const DEFAULT_DOC_LINK_SHARE_ENTITY = "tenant_editable";

export function inferActivity(project) {
  const text = [
    project?.["项目名称"],
    project?.["任务名称"],
    project?.["所属项目"],
    project?.["活动名称"],
    firstValue(project?.["模板类型"]),
    listValue(project?.["产品重点"]).join(" ")
  ].join(" ");

  if (text.includes("开学收心营") || text.includes("收心营")) {
    return {
      name: "开学收心营",
      learning: "开学收心学习",
      checkin: "开学收心学习打卡",
      rhythm: "开学收心学习节奏",
      conversion: "开学季转化",
      laterStage: "开学前后关键阶段",
      potentialAward: "开学潜力之星",
      sourceSeason: "暑假",
      phraseRules: [
        [/洋葱暑假加油站/g, "洋葱开学收心营"],
        [/洋葱学园暑假加油站/g, "洋葱学园开学收心营"],
        [/暑假加油站/g, "开学收心营"],
        [/暑假作业打卡/g, "开学收心学习打卡"],
        [/暑假学习节奏/g, "开学收心学习节奏"],
        [/暑假学习反馈/g, "开学收心学习反馈"],
        [/暑假学习/g, "开学收心学习"],
        [/暑假节奏/g, "开学收心学习节奏"],
        [/暑假训练营/g, "开学收心营"],
        [/暑假后半段/g, "开学前后关键阶段"],
        [/后半段暑假/g, "开学前后关键阶段"],
        [/暑假天气热/g, "开学前后节奏紧"],
        [/暑假社群运营/g, "开学季社群运营"],
        [/暑假在家/g, "开学前后"],
        [/暑假能/g, "开学前后能"],
        [/让暑假不散/g, "让开学收心不散"],
        [/暑促转化/g, "开学季转化"],
        [/暑促/g, "开学季"],
        [/暑假潜力之星/g, "开学潜力之星"],
        [/暑假/g, "开学前后"]
      ]
    };
  }

  return {
    name: "暑假加油站",
    learning: "暑假学习",
    checkin: "暑假作业打卡",
    rhythm: "暑假学习节奏",
    conversion: "暑促转化",
    laterStage: "暑假后半段",
    potentialAward: "暑假潜力之星",
    sourceSeason: "暑假",
    phraseRules: []
  };
}

export function applyActivityRules(body, activity) {
  let localized = String(body ?? "");
  for (const [pattern, value] of activity.phraseRules || []) {
    localized = localized.replace(pattern, value);
  }
  return localized;
}

export function applyGenerationRules(body, { record, stageText, targetRegion, city, dayCount } = {}) {
  const activity = inferActivity(record || {});
  const activityLocalized = applyActivityRules(body, activity);
  const stageLocalized = applyStageRules(activityLocalized, { stageText, targetRegion, city });
  return applyTimelineRules(stageLocalized, { dayCount });
}

export function applyTimelineRules(body, { dayCount } = {}) {
  const maxDay = Number(dayCount) || 0;
  return String(body ?? "").replace(
    /(^|\n)(#{1,6}\s*)Day\s*(\d+)\s*[（(]([^）)]*(?:T\+\d+|追单)[^）)]*)[）)]/g,
    (match, prefix, hashes, day, label) => {
      if (!maxDay || Number(day) <= maxDay) return match;
      return `${prefix}${hashes}结营后追单期（${label}）`;
    }
  );
}

export function applyStageRules(body, { stageText, targetRegion, city }) {
  const stage = stageText || "对应年级";
  const region = targetRegion || city || "本地";
  return String(body ?? "")
    .replaceAll("本地小学、初中、高中", `${region}小学、初中、高中`)
    .replaceAll(`${region}小学、初中、高中`, `${region}${stage}`)
    .replaceAll("小学、初中、高中", stage)
    .replaceAll("小学重点讲习惯和兴趣，初中重点讲漏洞和错题，高中重点讲规划和效率。", stageFocusSentence(stage))
    .replaceAll("小学孩子看兴趣和习惯，初中孩子看知识点是否听懂，高中孩子看能否跟上节奏。", stageChildFocusSentence(stage))
    .replaceAll("不是所有孩子都适合直接培优。小学看兴趣和理解力，初中看基础漏洞，高中看时间规划和效率。", `不是所有孩子都适合直接培优。${stage}孩子先看基础掌握和学习状态，适合的才加难度，不适合的先补基础。`);
}

function stageFocusSentence(stageText) {
  if (isOnlyStage(stageText, "初中")) {
    return "初中重点讲知识漏洞、错题复盘和开学衔接。";
  }
  if (isOnlyStage(stageText, "小学")) {
    return "小学重点讲学习习惯、兴趣保护和每日完成感。";
  }
  if (isOnlyStage(stageText, "高中")) {
    return "高中重点讲时间规划、薄弱模块和学习效率。";
  }
  return `${stageText}按不同年级分层服务，重点看学习习惯、基础漏洞、错题复盘和学习效率。`;
}

function stageChildFocusSentence(stageText) {
  if (isOnlyStage(stageText, "初中")) {
    return "初中孩子重点看知识点是否听懂、题目是否会做、错题是否能复盘。";
  }
  if (isOnlyStage(stageText, "小学")) {
    return "小学孩子重点看兴趣、习惯和是否愿意稳定完成任务。";
  }
  if (isOnlyStage(stageText, "高中")) {
    return "高中孩子重点看能否跟上节奏、能否规划时间、能否针对薄弱模块复盘。";
  }
  return `${stageText}孩子按年级差异观察学习习惯、知识掌握、错题复盘和学习效率。`;
}

function isOnlyStage(stageText, stage) {
  const stages = ["小学", "初中", "高中"];
  return stageText.includes(stage) && stages.filter((item) => item !== stage).every((item) => !stageText.includes(item));
}
