import assert from "node:assert/strict";
import test from "node:test";
import { buildTaskDocument } from "../src/workbenchGenerator.js";

test("localizes workbench scripts for school-start tasks", () => {
  const task = {
    "任务名称": "益阳赫山区初中14天开学收心营配套话术",
    "所属项目": "益阳赫山区初中14天开学收心营社群SOP",
    "任务类型": ["生成配套话术"],
    "城市/学校": "益阳赫山区",
    "活动名称": "开学收心营",
    "年级/学段": ["初中"],
    "补充要求": "14天"
  };

  const content = buildTaskDocument(task);

  assert.match(content, /开学收心营/);
  assert.match(content, /开学收心学习节奏/);
  assert.match(content, /开学前后最重要的不是一天学很多/);
  assert.match(content, /不要让开学前后的好状态断掉/);
  assert.doesNotMatch(content, /暑假加油站|暑假学习节奏|暑假的好状态|暑假最重要/);
});

test("localizes workbench default award names", () => {
  const task = {
    "任务名称": "益阳赫山区初中14天开学收心营表彰物料",
    "任务类型": ["表彰海报"],
    "城市/学校": "益阳赫山区",
    "活动名称": "开学收心营",
    "年级/学段": ["初中"],
    "补充要求": "14天"
  };

  const content = buildTaskDocument(task);

  assert.match(content, /开学潜力之星/);
  assert.doesNotMatch(content, /暑假潜力之星/);
});
