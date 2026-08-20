import assert from "node:assert/strict";
import test from "node:test";
import { buildSopDocument } from "../src/generator.js";

test("localizes hard-coded regional wording from matched templates", () => {
  const project = {
    "项目名称": "益阳赫山区初中14天开学收心营社群SOP",
    "城市": ["益阳"],
    "区县/校区": "赫山区",
    "学段": ["初中"],
    "社群周期": ["14天"],
    "模板类型": ["本地化暑假加油站SOP"],
    "产品重点": ["同步学", "同步刷题", "专项突破"],
    "生成状态": "待生成"
  };
  const template = {
    "模板名称": "衡阳本地14天洋葱学园暑假加油站SOP-参考框架版",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": ["转化加强版"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["初中"],
    "使用说明": "适合衡阳本地暑假加油站14天社群。",
    "素材配置规则": "结合衡阳本地暑假节奏配置素材。",
    "鼓励师话术规则": "话术强调衡阳本地家长关心的问题。",
    "模板正文": [
      "<title>衡阳本地洋葱学园暑假加油站社群运营14天SOP</title>",
      "# 衡阳本地洋葱学园暑假加油站社群运营14天SOP",
      "衡阳本地小学、初中、高中暑假学习社群。",
      "## 衡阳本地化表达",
      "适合衡阳市成章实验中学，蒸湘区/雁峰区/石鼓区可替换。",
      "衡阳暑假天气热，咱们班要坚持打卡。"
    ].join("\n")
  };

  const content = buildSopDocument(project, [], [template]);

  assert.match(content, /益阳赫山区初中14天开学收心营社群SOP/);
  assert.match(content, /益阳/);
  assert.match(content, /赫山区/);
  assert.match(content, /益阳赫山区本地化表达/);
  assert.doesNotMatch(content, /衡阳/);
  assert.doesNotMatch(content, /赫山区化表达/);
  assert.doesNotMatch(content, /蒸湘区|雁峰区|石鼓区|成章实验中学/);
});

test("prefers full operating SOP over closing ceremony templates", () => {
  const project = {
    "项目名称": "益阳赫山区初中14天开学收心营社群SOP",
    "城市": ["益阳"],
    "区县/校区": "赫山区",
    "学段": ["初中"],
    "社群周期": ["自定义"],
    "模板类型": ["转化加强版"],
    "产品重点": ["同步学", "同步刷题", "专项突破", "组合品"],
    "是否需要结营表彰": true,
    "生成状态": "待生成"
  };
  const fullTemplate = {
    "模板名称": "衡阳本地14天洋葱学园暑假加油站SOP-参考框架版",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": "本地化暑假加油站SOP",
    "运营阶段": ["纯服务", "服务转化"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["初中"],
    "模板正文": [
      "<title>衡阳本地洋葱学园暑假加油站社群运营14天SOP</title>",
      "## Day1（纯服务）",
      "8:30群内：衡阳暑假加油站今日学习安排。",
      "## Day13（转化期）",
      "基于前12天学习数据做后续学习方案。"
    ].join("\n")
  };
  const closingTemplate = {
    "模板名称": "洋葱学园暑假加油站结营表彰群内执行SOP",
    "状态": ["启用"],
    "周期类型": ["自定义"],
    "模板类型": "结营表彰执行SOP",
    "运营阶段": ["结营表彰", "服务转化"],
    "适用城市/区域": "湖南通用",
    "适用学段": ["初中"],
    "模板正文": "# 洋葱学园暑假加油站结营表彰群内执行SOP\n\n## 五、群内结营表彰详细执行流程"
  };

  const content = buildSopDocument(project, [], [closingTemplate, fullTemplate]);

  assert.match(content, /Day1（纯服务）/);
  assert.match(content, /Day13（转化期）/);
  assert.doesNotMatch(content, /群内结营表彰详细执行流程/);
  assert.doesNotMatch(content, /结营表彰群内执行SOP/);
});

test("localizes activity wording for school-start focus camp", () => {
  const project = {
    "项目名称": "益阳赫山区初中14天开学收心营社群SOP",
    "城市": ["益阳"],
    "区县/校区": "赫山区",
    "学段": ["初中"],
    "社群周期": ["14天"],
    "模板类型": ["转化加强版"],
    "产品重点": ["同步学", "同步刷题", "专项突破"],
    "生成状态": "待生成"
  };
  const template = {
    "模板名称": "衡阳本地14天洋葱学园暑假加油站SOP-参考框架版",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": ["转化加强版"],
    "运营阶段": ["纯服务", "服务转化"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["初中"],
    "使用说明": "适合衡阳本地暑假加油站14天社群。",
    "素材配置规则": "结合衡阳本地暑假节奏和暑促节点配置素材。",
    "鼓励师话术规则": "围绕暑假作业打卡、暑假学习反馈和暑假加油站价值传递。",
    "转化节点": "第13天暑促转化。",
    "模板正文": [
      "# 衡阳本地洋葱学园暑假加油站社群运营14天SOP",
      "本次暑假加油站总共为期xx天。",
      "Day1：发布xx天暑假作业打卡规则，建立暑假学习节奏。",
      "Day7：讲解洋葱暑假加油站的课程价值。",
      "Day13：进入暑促转化，承接暑假后半段学习规划。"
    ].join("\n")
  };

  const content = buildSopDocument(project, [], [template]);

  assert.match(content, /开学收心营/);
  assert.match(content, /开学收心学习打卡/);
  assert.match(content, /开学收心学习节奏/);
  assert.match(content, /开学季转化/);
  assert.match(content, /开学前后关键阶段学习规划/);
  assert.doesNotMatch(content, /暑假加油站|暑假作业打卡|暑促|暑假后半段/);
});

test("removes summer-only and non-target stage wording for school-start middle school SOP", () => {
  const project = {
    "项目名称": "益阳赫山区初中14天开学收心营社群SOP",
    "城市": ["益阳"],
    "区县/校区": "赫山区",
    "学段": ["初中"],
    "社群周期": ["14天"],
    "模板类型": ["转化加强版"],
    "产品重点": ["同步学"],
    "生成状态": "待生成"
  };
  const template = {
    "模板名称": "衡阳本地14天洋葱学园暑假加油站SOP",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": "本地化暑假加油站SOP",
    "运营阶段": ["纯服务", "服务转化"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["初中"],
    "模板正文": [
      "## 适用对象",
      "衡阳本地小学、初中、高中暑假学习社群。",
      "## 衡阳本地化表达",
      "衡阳暑假天气热，孩子在家容易散。",
      "# 2026暑假社群运营数据统计表",
      "小学重点讲习惯和兴趣，初中重点讲漏洞和错题，高中重点讲规划和效率。",
      "小学孩子看兴趣和习惯，初中孩子看知识点是否听懂，高中孩子看能否跟上节奏。",
      "错题复盘三步。暑假能把错题看清楚，就是在补漏洞。",
      "## Day8（固定学习时间：让暑假不散）",
      "后半段暑假是否还需要继续有人带。"
    ].join("\n")
  };

  const content = buildSopDocument(project, [], [template]);

  assert.match(content, /益阳赫山区初中开学收心学习社群/);
  assert.match(content, /2026开学季社群运营数据统计表/);
  assert.match(content, /初中重点讲知识漏洞、错题复盘和开学衔接/);
  assert.match(content, /初中孩子重点看知识点是否听懂/);
  assert.match(content, /让开学收心不散/);
  assert.doesNotMatch(content, /暑假|小学、初中、高中|小学重点|高中重点|小学孩子|高中孩子|后半段/);
});

test("moves post-camp followup outside numbered camp days", () => {
  const project = {
    "项目名称": "益阳赫山区初中14天开学收心营社群SOP",
    "城市": ["益阳"],
    "区县/校区": "赫山区",
    "学段": ["初中"],
    "社群周期": ["14天"],
    "模板类型": ["转化加强版"],
    "产品重点": ["同步学"],
    "生成状态": "待生成"
  };
  const template = {
    "模板名称": "衡阳本地14天洋葱学园暑假加油站SOP",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": "本地化暑假加油站SOP",
    "运营阶段": ["纯服务", "服务转化"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["初中"],
    "模板正文": [
      "# 衡阳本地洋葱学园暑假加油站社群运营14天SOP",
      "## Day14（结营表彰）",
      "做总结。",
      "## Day15（T+1追单期）",
      "继续跟进。"
    ].join("\n")
  };

  const content = buildSopDocument(project, [], [template]);

  assert.match(content, /## 结营后追单期（T\+1追单期）/);
  assert.doesNotMatch(content, /Day15/);
});

test("cleans stage examples and duplicated advanced-course wording", () => {
  const project = {
    "项目名称": "长沙中建仰天湖小学开学收心营",
    "城市": ["长沙"],
    "区县/校区": "天心区",
    "学段": ["小学"],
    "社群周期": ["14天"],
    "模板类型": ["转化加强版"],
    "产品重点": ["同步学"]
  };
  const template = {
    "模板名称": "衡阳本地14天洋葱学园暑假加油站SOP",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": "本地化暑假加油站SOP",
    "运营阶段": ["纯服务", "服务转化"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["小学"],
    "模板正文": [
      "示例：衡阳-初一-小宇-抖音-已入群",
      "不是所有孩子都适合直接培优。小学看兴趣和理解力，初中看基础漏洞，高中看时间规划和效率。适合的才加难度，不适合的先补基础。",
      "建议上午或晚上选一个稳定时段，暑假白天热。"
    ].join("\n")
  };

  const content = buildSopDocument(project, [], [template]);

  assert.match(content, /示例：长沙-四年级-小宇-抖音-已入群/);
  assert.match(content, /小学孩子先看基础掌握和学习状态，适合的才加难度，不适合的先补基础。/);
  assert.match(content, /开学前后节奏容易乱/);
  assert.doesNotMatch(content, /初一-小宇|适合的才加难度，不适合的先补基础。适合的才加难度|开学前后白天热/);
});

test("derives end date from start date and fixed period when end date is blank", () => {
  const project = {
    "项目名称": "衡阳初中14天暑假加油站SOP",
    "城市": ["衡阳"],
    "区县/校区": "蒸湘区",
    "学段": ["初中"],
    "社群周期": ["14天"],
    "开始日期": "2026-07-06 00:00:00",
    "结束日期": "",
    "模板类型": ["服务转化版"],
    "产品重点": ["同步学"]
  };

  const content = buildSopDocument(project, [], []);

  assert.match(content, /运营周期：2026-07-06 至 2026-07-19/);
  assert.doesNotMatch(content, /2026-07-06 至 未填写/);
});

test("uses custom operation day count to derive period and end date", () => {
  const project = {
    "项目名称": "怀化鹤城区暑假加油站SOP",
    "城市": ["怀化"],
    "区县/校区": "鹤城区",
    "学段": ["初中"],
    "社群周期": ["自定义"],
    "运营天数": 19,
    "开始日期": "2026-07-06 00:00:00",
    "模板类型": ["服务转化版"],
    "产品重点": ["同步学"]
  };

  const content = buildSopDocument(project, [], []);

  assert.match(content, /运营周期：2026-07-06 至 2026-07-24/);
  assert.match(content, /前17天以纯服务为主/);
  assert.match(content, /Day 19/);
});

test("closing checkbox does not select closing-only template for full SOP", () => {
  const project = {
    "项目名称": "衡阳初中14天暑假加油站SOP",
    "城市": ["衡阳"],
    "区县/校区": "蒸湘区",
    "学段": ["初中"],
    "社群周期": ["14天"],
    "模板类型": ["服务转化版"],
    "是否需要结营表彰": true,
    "产品重点": ["同步学"]
  };
  const fullTemplate = {
    "模板名称": "衡阳本地14天洋葱学园暑假加油站SOP-参考框架版",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": "服务转化版",
    "运营阶段": ["纯服务", "服务转化"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["初中"],
    "模板正文": "## Day1（纯服务）\n开营。\n## Day13（转化期）\n承接。"
  };
  const closingOnlyTemplate = {
    "模板名称": "衡阳14天结营表彰执行SOP",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": "结营表彰执行SOP",
    "运营阶段": ["结营表彰"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["初中"],
    "模板正文": "## 群内结营表彰详细执行流程\n只做表彰。"
  };

  const content = buildSopDocument(project, [], [closingOnlyTemplate, fullTemplate]);

  assert.match(content, /Day1（纯服务）/);
  assert.match(content, /Day13（转化期）/);
  assert.doesNotMatch(content, /只做表彰/);
});

test("appends closing ceremony module to template-first full SOP when enabled", () => {
  const project = {
    "项目名称": "衡阳初中14天暑假加油站SOP",
    "城市": ["衡阳"],
    "区县/校区": "蒸湘区",
    "学段": ["初中"],
    "社群周期": ["14天"],
    "模板类型": ["服务转化版"],
    "是否需要结营表彰": true,
    "产品重点": ["同步学"]
  };
  const template = {
    "模板名称": "衡阳本地14天洋葱学园暑假加油站SOP-参考框架版",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": "服务转化版",
    "运营阶段": ["纯服务", "服务转化"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["初中"],
    "模板正文": "## Day1（纯服务）\n开营。\n## Day14（结营）\n总结。"
  };

  const content = buildSopDocument(project, [], [template]);

  assert.match(content, /## 六、结营表彰附加执行模块/);
  assert.match(content, /连续打卡之星、进步突破之星、错题攻坚之星、课堂专注之星、暑假潜力之星/);
  assert.match(content, /先发结营开场文字，再发奖项海报/);
});

test("does not append closing ceremony module when field explicitly says no", () => {
  const project = {
    "项目名称": "衡阳初中14天暑假加油站SOP",
    "城市": ["衡阳"],
    "区县/校区": "蒸湘区",
    "学段": ["初中"],
    "社群周期": ["14天"],
    "模板类型": ["服务转化版"],
    "是否需要结营表彰": ["不需要"],
    "产品重点": ["同步学"]
  };
  const template = {
    "模板名称": "衡阳本地14天洋葱学园暑假加油站SOP-参考框架版",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": "服务转化版",
    "运营阶段": ["纯服务", "服务转化"],
    "适用城市/区域": "湖南衡阳",
    "适用学段": ["初中"],
    "模板正文": "## Day1（纯服务）\n开营。\n## Day14（结营）\n总结。"
  };

  const content = buildSopDocument(project, [], [template]);

  assert.doesNotMatch(content, /结营表彰附加执行模块/);
});

test("falls back to full SOP structure when only closing-only template is available", () => {
  const project = {
    "项目名称": "益阳赫山区初中14天开学收心营社群SOP",
    "城市": ["益阳"],
    "区县/校区": "赫山区",
    "学段": ["初中"],
    "社群周期": ["14天"],
    "模板类型": ["服务转化版"],
    "是否需要结营表彰": true,
    "产品重点": ["同步学"]
  };
  const closingOnlyTemplate = {
    "模板名称": "洋葱学园暑假加油站结营表彰群内执行SOP",
    "状态": ["启用"],
    "周期类型": ["14天"],
    "模板类型": "结营表彰执行SOP",
    "运营阶段": ["结营表彰"],
    "适用城市/区域": "湖南通用",
    "适用学段": ["初中"],
    "模板正文": "## 群内结营表彰详细执行流程\n只做表彰。"
  };

  const content = buildSopDocument(project, [], [closingOnlyTemplate]);

  assert.match(content, /每日执行SOP/);
  assert.match(content, /Day 1/);
  assert.match(content, /Day 14/);
  assert.doesNotMatch(content, /只做表彰/);
});
