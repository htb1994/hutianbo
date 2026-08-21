import assert from "node:assert/strict";
import test from "node:test";
import { buildProjectRecord, detectIntent, missingFields, parseProjectRequest } from "../src/botAssistant.js";

test("routes multiple Feishu bot functions by intent", () => {
  assert.equal(detectIntent("生成衡阳成章实验中学初中14天SOP"), "sop");
  assert.equal(detectIntent("查结营邀约话术"), "script");
  assert.equal(detectIntent("查长沙项目进度"), "progress");
  assert.equal(detectIntent("/help"), "help");
});

test("parse complete SOP request from a Feishu bot message", () => {
  const project = parseProjectRequest("生成衡阳市成章实验中学初中14天开学收心营SOP，8月24日开始，周末轻服务，服务转化版，产品重点同步学、同步刷题、专项突破、学情报告，需要结营表彰");

  assert.equal(project.projectName, "衡阳市成章实验中学初中14天开学收心营SOP");
  assert.equal(project.city, "衡阳");
  assert.equal(project.district, "衡阳市成章实验中学");
  assert.deepEqual(project.stages, ["初中"]);
  assert.equal(project.period, "14天");
  assert.equal(project.startDate, `${new Date().getFullYear()}-08-24`);
  assert.equal(project.weekendRule, "周末轻服务");
  assert.equal(project.templateType, "服务转化版");
  assert.deepEqual(project.productPoints, ["同步学", "同步刷题", "专项突破", "学情报告"]);
  assert.equal(project.needsClosing, true);
  assert.deepEqual(missingFields(project), []);
});

test("merge follow-up details into an incomplete request", () => {
  const first = parseProjectRequest("帮我生成成章实验中学SOP");
  const merged = parseProjectRequest("城市衡阳，学校成章实验中学，初中，14天，2026年8月24日开始", first);

  assert.equal(merged.city, "衡阳");
  assert.equal(merged.district, "成章实验中学");
  assert.deepEqual(merged.stages, ["初中"]);
  assert.equal(merged.period, "14天");
  assert.equal(merged.startDate, "2026-08-24");
  assert.deepEqual(missingFields(merged), []);
});

test("build project config record uses bot-safe generating status", () => {
  const project = parseProjectRequest("生成长沙中建仰天湖小学小学14天开学收心营SOP，2026年8月24日开始");
  const record = buildProjectRecord(project);

  assert.equal(record["生成状态"], "生成中");
  assert.equal(record["城市"], "长沙");
  assert.deepEqual(record["产品重点"], ["同步学", "同步刷题", "专项突破", "学情报告"]);
});
