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
