import fs from "node:fs";
import path from "node:path";

export function loadConfig() {
  const configPath = path.resolve(process.cwd(), "config.json");
  const fallbackPath = path.resolve(process.cwd(), "config.example.json");
  const targetPath = fs.existsSync(configPath) ? configPath : fallbackPath;
  const raw = fs.readFileSync(targetPath, "utf8");
  const config = JSON.parse(raw);

  for (const key of ["larkCli", "tables"]) {
    if (!config[key]) {
      throw new Error(`配置缺少 ${key}`);
    }
  }

  const merged = {
    pollIntervalMs: 60000,
    defaults: {
      creator: "洋葱学园社群运营SOP生成工作台",
      pollLimit: 100
    },
    ...config,
    baseToken: process.env.FEISHU_BASE_TOKEN || process.env.SOP_BASE_TOKEN || config.baseToken,
    tables: {
      ...config.tables,
      projects: process.env.SOP_TABLE_PROJECTS || config.tables.projects,
      templates: process.env.SOP_TABLE_TEMPLATES || config.tables.templates,
      materials: process.env.SOP_TABLE_MATERIALS || config.tables.materials,
      outputs: process.env.SOP_TABLE_OUTPUTS || config.tables.outputs,
      tasks: process.env.SOP_TABLE_TASKS || config.tables.tasks,
      scripts: process.env.SOP_TABLE_SCRIPTS || config.tables.scripts,
      followups: process.env.SOP_TABLE_FOLLOWUPS || config.tables.followups,
      dashboard: process.env.SOP_TABLE_DASHBOARD || config.tables.dashboard
    },
    larkCli: process.env.LARK_CLI_PATH || config.larkCli || "lark-cli",
    identity: process.env.LARK_IDENTITY || config.identity || "user"
  };

  for (const tableKey of ["projects", "templates", "materials", "outputs"]) {
    if (!merged.tables[tableKey]) {
      throw new Error(`配置缺少 tables.${tableKey}`);
    }
  }

  if (!merged.baseToken) {
    throw new Error("配置缺少 baseToken，请设置 FEISHU_BASE_TOKEN 或 SOP_BASE_TOKEN");
  }

  return merged;
}
