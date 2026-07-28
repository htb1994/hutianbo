import fs from "node:fs";
import path from "node:path";
import { firstValue, listValue } from "./records.js";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v"]);

const KEYWORD_RULES = [
  { terms: ["同步刷题"], keywords: ["同步刷题"] },
  { terms: ["专项突破"], keywords: ["专项突破"] },
  { terms: ["试卷库"], keywords: ["试卷库"] },
  { terms: ["高频错题"], keywords: ["高频错题"] },
  { terms: ["学情报告", "家长端"], keywords: ["学情报告", "家长端"], preferred: ["image-3"] },
  { terms: ["课程质量", "用户好评"], keywords: ["课程质量", "用户好评"] },
  { terms: ["品牌", "师资"], keywords: ["师资", "品牌", "宣传展示", "课程制作流程"] },
  { terms: ["提前学"], keywords: ["提前学"] },
  { terms: ["培优"], keywords: ["培优"] },
  { terms: ["结营", "表彰"], keywords: ["slide_", "红金喜报", "结营"] }
];

export function resolveLocalMaterialFiles(materials, project, config) {
  const materialDir = config.defaults.materialDir;
  const maxFiles = config.defaults.maxMaterialFiles ?? 8;
  const maxUploadBytes = config.defaults.maxUploadBytes ?? 80 * 1024 * 1024;

  if (!materialDir || !fs.existsSync(materialDir)) {
    return { selected: [], skipped: [], directory: materialDir, warning: "素材目录不存在" };
  }

  const files = fs.readdirSync(materialDir)
    .map((name) => {
      const filePath = path.join(materialDir, name);
      const stat = fs.statSync(filePath);
      return {
        name,
        filePath,
        size: stat.size,
        ext: path.extname(name).toLowerCase(),
        normalized: normalizeText(name)
      };
    })
    .filter((file) => fs.statSync(file.filePath).isFile());

  const selected = [];
  const skipped = [];
  const seen = new Set();
  const productPoints = listValue(project["产品重点"]);

  for (const material of materials) {
    if (firstValue(material["状态"]) !== "可用") continue;
    if (!matchesProduct(material, productPoints)) continue;

    const file = findBestFile(material, files);
    if (!file || seen.has(file.filePath)) continue;

    if (!isSupported(file.ext)) {
      skipped.push({ material: material["素材名称"], reason: "暂不支持的文件类型", fileName: file.name, size: file.size });
      continue;
    }

    if (file.size > maxUploadBytes) {
      skipped.push({ material: material["素材名称"], reason: "文件超过自动上传上限", fileName: file.name, size: file.size });
      continue;
    }

    selected.push({
      materialName: material["素材名称"],
      fileName: file.name,
      filePath: file.filePath,
      size: file.size,
      type: IMAGE_EXTENSIONS.has(file.ext) ? "image" : "file",
      caption: buildCaption(material, file)
    });
    seen.add(file.filePath);

    if (selected.length >= maxFiles) break;
  }

  return { selected, skipped, directory: materialDir, warning: "" };
}

function findBestFile(material, files) {
  const materialName = material["素材名称"] || "";
  const normalizedName = normalizeText(materialName);
  const productPoints = listValue(material["关联产品点"]);
  const nodes = listValue(material["适用节点"]);
  const searchTerms = [materialName, ...productPoints, ...nodes].filter(Boolean);

  const direct = files.find((file) => file.normalized.includes(normalizedName) || normalizedName.includes(file.normalized));
  if (direct) return direct;

  const rules = KEYWORD_RULES.filter((rule) => {
    const source = normalizeText(searchTerms.join(" "));
    return rule.terms.some((term) => source.includes(normalizeText(term)));
  });

  for (const rule of rules) {
    if (rule.preferred) {
      const preferred = files.find((file) => rule.preferred.some((keyword) => file.normalized.includes(normalizeText(keyword))));
      if (preferred) return preferred;
    }
    const matched = files.find((file) => rule.keywords.some((keyword) => file.normalized.includes(normalizeText(keyword))));
    if (matched) return matched;
  }

  return null;
}

function matchesProduct(material, productPoints) {
  if (!productPoints.length) return true;
  const materialPoints = listValue(material["关联产品点"]);
  if (!materialPoints.length) return true;
  return materialPoints.some((point) => productPoints.includes(point));
}

function isSupported(ext) {
  return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext) || [".pptx", ".pdf", ".docx", ".xlsx"].includes(ext);
}

function buildCaption(material, file) {
  const type = firstValue(material["素材类型"]) || (IMAGE_EXTENSIONS.has(file.ext) ? "图片" : "文件");
  return `${material["素材名称"] || file.name}（${type}）`;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[()\[\]（）【】_\-\s]/g, "");
}
