import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { resolveLocalMaterialFiles } from "../src/localMaterials.js";

const project = {
  "产品重点": ["同步学", "同步刷题", "专项突破", "试卷库", "学情报告", "组合品"]
};

const materials = [
  material("App操作视频_同步刷题", "同步刷题"),
  material("App操作视频_专项突破", "专项突破"),
  material("App操作视频_试卷库", "试卷库"),
  material("家长端学情报告功能介绍", "学情报告", "https://example.com/report"),
  material("洋葱课程质量用户好评", "同步学", "https://example.com/good")
];

test("matches local files by product point and material name", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sop-materials-"));
  for (const fileName of [
    "App操作视频_同步刷题 (1).mp4",
    "App操作视频_专项突破 (1).mp4",
    "App操作视频_试卷库 (1).mp4",
    "image-3.png",
    "洋葱的课程质量（用户好评） (4).mp4"
  ]) {
    fs.writeFileSync(path.join(dir, fileName), "x");
  }

  const result = resolveLocalMaterialFiles(materials, project, {
    defaults: { materialDir: dir, maxMaterialFiles: 8, maxUploadBytes: 1024 }
  });

  assert.equal(result.selected.length, 5);
  assert.equal(result.linked.length, 0);
  assert.equal(result.skipped.length, 0);
});

test("falls back to material links when local directory is unavailable", () => {
  const result = resolveLocalMaterialFiles(materials, project, {
    defaults: { materialDir: "/path/not/exist", maxMaterialFiles: 8, maxUploadBytes: 1024 }
  });

  assert.equal(result.selected.length, 0);
  assert.equal(result.linked.length, 2);
  assert.equal(result.skipped.length, 3);
  assert.match(result.skipped[0].reason, /云端无法访问本地素材目录/);
});

function material(name, point, link = "") {
  return {
    "素材名称": name,
    "状态": ["可用"],
    "素材类型": ["视频"],
    "适用节点": ["APP功能"],
    "关联产品点": [point],
    "素材链接": link,
    "使用话术提示": ""
  };
}
