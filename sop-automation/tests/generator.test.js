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
    "模板类型": ["转化加强版"],
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
    "模板正文": [
      "<title>衡阳本地洋葱学园暑假加油站社群运营14天SOP</title>",
      "# 衡阳本地洋葱学园暑假加油站社群运营14天SOP",
      "衡阳本地小学、初中、高中暑假学习社群。",
      "适合衡阳市成章实验中学，蒸湘区/雁峰区/石鼓区可替换。",
      "衡阳暑假天气热，咱们班要坚持打卡。"
    ].join("\n")
  };

  const content = buildSopDocument(project, [], [template]);

  assert.match(content, /益阳赫山区初中14天开学收心营社群SOP/);
  assert.match(content, /益阳/);
  assert.match(content, /赫山区/);
  assert.doesNotMatch(content, /衡阳/);
  assert.doesNotMatch(content, /蒸湘区|雁峰区|石鼓区|成章实验中学/);
});
