import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const cli = process.env.LARK_CLI_PATH || resolveLocalLarkCli();

async function main() {
  await configureLarkCli();
  const { startWebhookServer } = await import("../src/webhookServer.js");
  startWebhookServer();
}

async function configureLarkCli() {
  const appId = process.env.LARK_APP_ID || process.env.FEISHU_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET || process.env.FEISHU_APP_SECRET;
  const brand = process.env.LARK_BRAND || "feishu";

  if (!appId || !appSecret) {
    console.log("[render-start] 未设置 LARK_APP_ID/LARK_APP_SECRET，跳过 lark-cli 初始化");
    return;
  }

  await runCli(["config", "init", "--app-id", appId, "--app-secret-stdin", "--brand", brand], {
    stdin: appSecret
  });
  console.log("[render-start] lark-cli 配置已初始化");
}

function runCli(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cli, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        LARKSUITE_CLI_NO_UPDATE_NOTIFIER: "1",
        LARKSUITE_CLI_NO_SKILLS_NOTIFIER: "1"
      }
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(new Error(`lark-cli 初始化失败：${stderr || stdout}`));
    });

    if (options.stdin) {
      child.stdin.write(options.stdin);
    }
    child.stdin.end();
  });
}

function resolveLocalLarkCli() {
  const candidates = [
    path.resolve("node_modules/.bin/lark-cli"),
    "lark-cli"
  ];
  return candidates.find((candidate) => candidate === "lark-cli" || existsSync(candidate)) || "lark-cli";
}

main().catch((error) => {
  console.error("[render-start] 启动失败", error);
  process.exitCode = 1;
});
