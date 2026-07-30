import { loadConfig } from "./config.js";
import { createLarkClient } from "./larkCli.js";
import { fileURLToPath } from "node:url";
import {
  DASHBOARD_FIELDS,
  FOLLOWUP_FIELDS,
  MATERIAL_FIELDS,
  PROJECT_FIELDS,
  SCRIPT_FIELDS,
  TEMPLATE_FIELDS,
  TASK_FIELDS,
  firstValue,
  rowsToObjects
} from "./records.js";
import { buildSopDocument, buildSopDocumentPayload } from "./generator.js";
import { buildTaskDocument } from "./workbenchGenerator.js";
import { resolveLocalMaterialFiles } from "./localMaterials.js";
import { escapeXml, li, p } from "./xml.js";

const config = loadConfig();
const lark = createLarkClient(config);

let running = false;

export async function main(options = {}) {
  const once = Boolean(options.once);
  const dryRun = Boolean(options.dryRun);
  console.log(`[sop-automation] 启动成功，模式：${once ? "单次" : "常驻"}${dryRun ? "，dry-run" : ""}`);
  await tick({ dryRun });

  if (once) return;

  setInterval(() => {
    tick({ dryRun }).catch((error) => {
      console.error("[sop-automation] 轮询失败", error);
    });
  }, config.pollIntervalMs);
}

export async function tick({ dryRun = false } = {}) {
  if (running) {
    console.log("[sop-automation] 上一次任务还在执行，跳过本轮");
    return;
  }

  running = true;
  try {
    const projects = await fetchPendingProjects();
    const tasks = await fetchPendingTasks();
    if (!projects.length && !tasks.length) {
      console.log("[sop-automation] 暂无待生成项目/任务");
      return;
    }

    console.log(`[sop-automation] 发现 ${projects.length} 个待生成项目，${tasks.length} 个待生成任务`);
    const materials = await fetchMaterials();
    const templates = await fetchTemplates();
    const scripts = await fetchOptionalTable(config.tables.scripts, SCRIPT_FIELDS);
    const followups = await fetchOptionalTable(config.tables.followups, FOLLOWUP_FIELDS);
    const dashboardRows = await fetchOptionalTable(config.tables.dashboard, DASHBOARD_FIELDS);

    for (const project of projects) {
      await processProject(project, materials, templates, { dryRun });
    }

    for (const task of tasks) {
      await processTask(task, scripts, followups, dashboardRows, { dryRun });
    }
  } finally {
    running = false;
  }
}

async function fetchPendingProjects() {
  const response = await lark.listRecords({
    tableId: config.tables.projects,
    fields: PROJECT_FIELDS,
    limit: config.defaults.pollLimit
  });
  const projects = rowsToObjects(response);
  return projects.filter((project) => firstValue(project["生成状态"]) === "待生成");
}

async function fetchMaterials() {
  const response = await lark.listRecords({
    tableId: config.tables.materials,
    fields: MATERIAL_FIELDS,
    limit: config.defaults.pollLimit
  });
  return rowsToObjects(response);
}

async function fetchTemplates() {
  if (!config.tables.templates) return [];
  return fetchOptionalTable(config.tables.templates, TEMPLATE_FIELDS);
}

async function fetchPendingTasks() {
  if (!config.tables.tasks) return [];
  const tasks = await fetchOptionalTable(config.tables.tasks, TASK_FIELDS);
  return tasks.filter((task) => firstValue(task["生成状态"]) === "待生成");
}

async function fetchOptionalTable(tableId, fields) {
  if (!tableId) return [];
  try {
    const response = await lark.listRecords({
      tableId,
      fields,
      limit: config.defaults.pollLimit
    });
    return rowsToObjects(response);
  } catch (error) {
    console.warn(`[sop-automation] 可选表读取失败，已跳过：${tableId}，${error.message}`);
    return [];
  }
}

export async function processProjectByRecordId(recordId, { dryRun = false, force = false } = {}) {
  const projects = await fetchAllProjects();
  const project = findRecord(projects, recordId, "项目配置");
  if (!force && firstValue(project["生成状态"]) !== "待生成") {
    return {
      type: "project",
      recordId,
      status: "skipped",
      message: `当前生成状态为「${firstValue(project["生成状态"]) || "空"}」，不是「待生成」`
    };
  }

  const materials = await fetchMaterials();
  const templates = await fetchTemplates();
  const result = await processProject(project, materials, templates, { dryRun });
  return {
    type: "project",
    recordId,
    status: dryRun ? "dry-run" : "success",
    url: result?.url || ""
  };
}

export async function processTaskByRecordId(recordId, { dryRun = false, force = false } = {}) {
  if (!config.tables.tasks) {
    throw new Error("未配置任务表 tables.tasks");
  }
  const tasks = await fetchOptionalTable(config.tables.tasks, TASK_FIELDS);
  const task = findRecord(tasks, recordId, "任务表");
  if (!force && firstValue(task["生成状态"]) !== "待生成") {
    return {
      type: "task",
      recordId,
      status: "skipped",
      message: `当前生成状态为「${firstValue(task["生成状态"]) || "空"}」，不是「待生成」`
    };
  }

  const scripts = await fetchOptionalTable(config.tables.scripts, SCRIPT_FIELDS);
  const followups = await fetchOptionalTable(config.tables.followups, FOLLOWUP_FIELDS);
  const dashboardRows = await fetchOptionalTable(config.tables.dashboard, DASHBOARD_FIELDS);
  const result = await processTask(task, scripts, followups, dashboardRows, { dryRun });
  return {
    type: "task",
    recordId,
    status: dryRun ? "dry-run" : "success",
    url: result?.url || ""
  };
}

async function fetchAllProjects() {
  const response = await lark.listRecords({
    tableId: config.tables.projects,
    fields: PROJECT_FIELDS,
    limit: config.defaults.pollLimit
  });
  return rowsToObjects(response);
}

function findRecord(records, recordId, label) {
  const record = records.find((item) => item.recordId === recordId);
  if (!record) {
    const error = new Error(`${label}未找到记录：${recordId}`);
    error.statusCode = 404;
    throw error;
  }
  return record;
}

async function processProject(project, materials, templates, { dryRun = false } = {}) {
  const name = project["项目名称"] || project.recordId;
  console.log(`[sop-automation] 开始处理：${name}`);

  if (dryRun) {
    const content = buildSopDocument(project, materials, templates);
    const materialPlan = resolveLocalMaterialFiles(materials, project, config);
    console.log(`[sop-automation] dry-run 生成内容长度：${content.length}`);
    console.log(`[sop-automation] dry-run 将插入素材：${materialPlan.selected.map((item) => item.fileName).join("、") || "无"}`);
    if (materialPlan.skipped.length) {
      console.log(`[sop-automation] dry-run 跳过素材：${materialPlan.skipped.map((item) => `${item.fileName}(${item.reason})`).join("、")}`);
    }
    return { url: "", dryRun: true };
  }

  await updateProject(project.recordId, {
    "生成状态": "生成中",
    "备注": `自动生成服务处理中：${nowText()}`
  });

  try {
    const payload = buildSopDocumentPayload(project, materials, templates);
    const created = await lark.createDoc(payload);
    const doc = created.data.document;
    const materialResult = await insertProjectMaterials(doc.document_id, project, materials);

    await updateProject(project.recordId, {
      "生成状态": "待审核",
      "SOP云文档链接": doc.url,
      "备注": `SOP已自动生成，${formatMaterialResult(materialResult)}，等待负责人审核：${nowText()}`
    });

    await safelyArchiveOutput({
      action: () => createOutputRecord(project, doc.url),
      onFailure: (error) => updateProject(project.recordId, {
        "生成状态": "待审核",
        "SOP云文档链接": doc.url,
        "备注": `SOP已自动生成，${formatMaterialResult(materialResult)}；输出归档失败，不影响文档使用：${shortError(error)}`
      }),
      label: `项目输出归档失败：${name}`
    });
    console.log(`[sop-automation] 已完成：${name} -> ${doc.url}`);
    return { url: doc.url };
  } catch (error) {
    await updateProject(project.recordId, {
      "生成状态": "需修改",
      "备注": `自动生成失败：${String(error.message).slice(0, 500)}`
    });
    throw error;
  }
}

async function processTask(task, scripts, followups, dashboardRows, { dryRun = false } = {}) {
  const name = task["任务名称"] || task.recordId;
  console.log(`[sop-automation] 开始处理任务：${name}`);
  const type = firstValue(task["任务类型"]);

  if (isFullSopTask(type)) {
    return processFullSopTask(task, { dryRun });
  }

  if (dryRun) {
    const content = buildTaskDocument(task, scripts, followups, dashboardRows);
    console.log(`[sop-automation] dry-run 任务内容长度：${content.length}`);
    return { url: "", dryRun: true };
  }

  await updateTask(task.recordId, {
    "生成状态": "生成中",
    "备注": `自动生成服务处理中：${nowText()}`
  });

  try {
    const content = buildTaskDocument(task, scripts, followups, dashboardRows);
    const created = await lark.createDoc({ content });
    const doc = created.data.document;

    await updateTask(task.recordId, {
      "生成状态": "待审核",
      "结果链接": doc.url,
      "备注": `任务结果已生成，等待审核：${nowText()}`
    });

    await safelyArchiveOutput({
      action: () => createTaskOutputRecord(task, doc.url),
      onFailure: (error) => updateTask(task.recordId, {
        "生成状态": "待审核",
        "结果链接": doc.url,
        "备注": `任务结果已生成；输出归档失败，不影响文档使用：${shortError(error)}`
      }),
      label: `任务输出归档失败：${name}`
    });
    console.log(`[sop-automation] 任务已完成：${name} -> ${doc.url}`);
    return { url: doc.url };
  } catch (error) {
    await updateTask(task.recordId, {
      "生成状态": "需修改",
      "备注": `自动生成失败：${String(error.message).slice(0, 500)}`
    });
    throw error;
  }
}

async function processFullSopTask(task, { dryRun = false } = {}) {
  const projects = await fetchAllProjects();
  const project = findProjectForTask(task, projects);

  if (dryRun) {
    const materials = await fetchMaterials();
    const templates = await fetchTemplates();
    const content = buildSopDocument(project, materials, templates);
    console.log(`[sop-automation] dry-run 完整SOP内容长度：${content.length}`);
    return { url: "", dryRun: true };
  }

  await updateTask(task.recordId, {
    "生成状态": "生成中",
    "备注": `正在按「${project["项目名称"]}」生成完整SOP：${nowText()}`
  });

  try {
    const materials = await fetchMaterials();
    const templates = await fetchTemplates();
    const result = await processProject(project, materials, templates, { dryRun: false });

    await updateTask(task.recordId, {
      "生成状态": "待审核",
      "结果链接": result.url,
      "备注": `完整SOP已生成，来源项目：${project["项目名称"]}，等待审核：${nowText()}`
    });

    await safelyArchiveOutput({
      action: () => createTaskOutputRecord(task, result.url),
      onFailure: (error) => updateTask(task.recordId, {
        "生成状态": "待审核",
        "结果链接": result.url,
        "备注": `完整SOP已生成，来源项目：${project["项目名称"]}；任务输出归档失败，不影响文档使用：${shortError(error)}`
      }),
      label: `完整SOP任务输出归档失败：${task["任务名称"] || task.recordId}`
    });
    return result;
  } catch (error) {
    await updateTask(task.recordId, {
      "生成状态": "需修改",
      "备注": `完整SOP生成失败：${String(error.message).slice(0, 500)}`
    });
    throw error;
  }
}

function findProjectForTask(task, projects) {
  const target = String(task["所属项目"] || task["任务名称"] || "").trim();
  if (!target) {
    const error = new Error("生成完整SOP时，需要在任务表填写「所属项目」");
    error.statusCode = 400;
    throw error;
  }

  const matched = projects.find((project) => {
    const name = String(project["项目名称"] || "").trim();
    return name === target || name.includes(target) || target.includes(name);
  });

  if (!matched) {
    const error = new Error(`项目配置中未找到匹配项目：${target}`);
    error.statusCode = 404;
    throw error;
  }

  return matched;
}

function isFullSopTask(type) {
  return String(type || "").includes("完整SOP");
}

async function insertProjectMaterials(docId, project, materials) {
  const plan = resolveLocalMaterialFiles(materials, project, config);
  const intro = buildMaterialAppendixIntro(plan);
  await lark.appendDoc({ docId, content: intro });

  let inserted = 0;
  const failed = [];

  for (const item of plan.selected) {
    try {
      await lark.insertMedia({
        docId,
        filePath: item.filePath,
        type: item.type,
        caption: item.caption
      });
      inserted += 1;
      console.log(`[sop-automation] 已插入素材：${item.fileName}`);
    } catch (error) {
      failed.push({ fileName: item.fileName, reason: error.message });
      console.error(`[sop-automation] 素材插入失败：${item.fileName}`, error.message);
    }
  }

  if (failed.length) {
    await lark.appendDoc({ docId, content: buildMaterialFailureNote(failed) });
  }

  return { inserted, linked: plan.linked?.length || 0, failed, skipped: plan.skipped };
}

function buildMaterialAppendixIntro(plan) {
  const selectedList = plan.selected.length
    ? `<ul>${plan.selected.map((item) => li(`${item.fileName}：${item.caption}`)).join("")}</ul>`
    : "";
  const linkedList = plan.linked?.length
    ? `<h2>已匹配素材链接</h2><ul>${plan.linked.map((item) => li(`${item.materialName}：${item.link}`)).join("")}</ul>`
    : "";
  const emptyNote = !plan.selected.length && !plan.linked?.length
    ? p("本次没有匹配到可自动插入或可链接的素材，请检查素材库名称、产品点、素材链接或本地素材目录。")
    : "";
  const skippedList = plan.skipped.length
    ? `<h2>未自动上传素材</h2><ul>${plan.skipped.map((item) => li(`${item.fileName}：${item.reason}`)).join("")}</ul>`
    : "";

  return [
    "<hr/>",
    "<h1>九、自动匹配素材附件</h1>",
    `<callout emoji="📎" background-color="light-blue" border-color="blue">`,
    p(`素材来源目录：${plan.directory || "未配置"}`),
    p("以下素材由自动生成服务根据素材库名称、产品点和运营节点匹配。能访问到本地文件时会插入附件；云端无法访问本地文件时，会优先配置素材库里的飞书素材链接。"),
    `</callout>`,
    emptyNote,
    selectedList,
    linkedList,
    skippedList
  ].join("\n");
}

function formatMaterialResult(result) {
  const parts = [`已插入素材${result.inserted}个`];
  if (result.linked) parts.push(`已配置素材链接${result.linked}个`);
  return parts.join("，");
}

function buildMaterialFailureNote(failed) {
  return [
    "<h2>素材插入失败记录</h2>",
    "<ul>",
    ...failed.map((item) => li(`${item.fileName}：${escapeXml(item.reason).slice(0, 300)}`)),
    "</ul>"
  ].join("\n");
}

async function updateProject(recordId, patch) {
  await lark.updateRecord({
    tableId: config.tables.projects,
    recordId,
    patch
  });
}

async function updateTask(recordId, patch) {
  await lark.updateRecord({
    tableId: config.tables.tasks,
    recordId,
    patch
  });
}

async function createOutputRecord(project, url) {
  await lark.createRecord({
    tableId: config.tables.outputs,
    fields: ["输出名称", "所属项目", "输出类型", "输出链接", "生成日期", "审核状态", "备注"],
    rows: [[
      `${project["项目名称"] || "未命名项目"} SOP云文档`,
      project["项目名称"] || "",
      "SOP云文档",
      url,
      `${todayText()} 00:00:00`,
      "待审核",
      `由本地自动生成服务创建：${nowText()}`
    ]]
  });
}

async function safelyArchiveOutput({ action, onFailure, label }) {
  try {
    await action();
  } catch (error) {
    console.warn(`[sop-automation] ${label}`, error.message);
    await onFailure(error);
  }
}

function shortError(error) {
  return String(error.message || error).replace(/\s+/g, " ").slice(0, 260);
}

async function createTaskOutputRecord(task, url) {
  await lark.createRecord({
    tableId: config.tables.outputs,
    fields: ["输出名称", "所属项目", "输出类型", "输出链接", "生成日期", "审核状态", "备注"],
    rows: [[
      `${task["任务名称"] || "未命名任务"} 自动生成结果`,
      task["所属项目"] || "",
      outputTypeForTask(task),
      url,
      `${todayText()} 00:00:00`,
      "待审核",
      `由本地自动生成服务创建：${nowText()}`
    ]]
  });
}

function outputTypeForTask(task) {
  const type = firstValue(task["任务类型"]);
  if (type.includes("完整SOP")) return "SOP云文档";
  if (type.includes("表彰")) return "结营执行方案";
  if (type.includes("看板")) return "素材配置表";
  if (type.includes("跟进")) return "结营执行方案";
  if (type.includes("话术") || type.includes("群发")) return "结营执行方案";
  return "结营执行方案";
}

function nowText() {
  return new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
}

function todayText() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  main({
    once: args.has("--once"),
    dryRun: args.has("--dry-run")
  }).catch((error) => {
    console.error("[sop-automation] 启动失败", error);
    process.exitCode = 1;
  });
}
