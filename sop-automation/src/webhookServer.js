import http from "node:http";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { processProjectByRecordId, processTaskByRecordId, tick } from "./server.js";
import { createBotAssistant } from "./botAssistant.js";

const config = loadConfig();
const botAssistant = createBotAssistant();

export function startWebhookServer(options = {}) {
  const port = Number(options.port || process.env.PORT || config.webhook?.port || 8787);
  const polling = startBackgroundPolling(options);
  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      console.error("[sop-webhook] 请求处理失败", error);
      sendJson(response, error.statusCode || 500, {
        ok: false,
        error: {
          message: error.message
        }
      });
    });
  });

  server.listen(port, () => {
    console.log(`[sop-webhook] 启动成功：http://localhost:${port}`);
    console.log("[sop-webhook] 健康检查：GET /health");
    console.log("[sop-webhook] 生成接口：POST /api/generate");
  });

  server.on("close", () => {
    if (polling) clearInterval(polling);
  });

  return server;
}

function startBackgroundPolling(options = {}) {
  const enabled = options.enablePolling ?? process.env.SOP_ENABLE_POLLING !== "false";
  if (!enabled) return null;

  const intervalMs = Number(process.env.SOP_POLL_INTERVAL_MS || config.pollIntervalMs || 60000);
  const run = () => {
    tick().catch((error) => {
      console.error("[sop-webhook] 兜底轮询失败", error);
    });
  };

  const startupDelayMs = Number(process.env.SOP_POLL_STARTUP_DELAY_MS || 15000);
  setTimeout(run, startupDelayMs).unref?.();
  const timer = setInterval(run, intervalMs);
  timer.unref?.();
  console.log(`[sop-webhook] 兜底轮询已启用：每 ${intervalMs}ms 扫描待生成记录`);
  return timer;
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && url.pathname === "/") {
    sendJson(response, 200, {
      ok: true,
      service: "onion-sop-webhook",
      message: "洋葱学园 SOP 自动生成服务运行中",
      endpoints: {
        health: "GET /health",
        generate: "POST /api/generate",
        larkEvents: "POST /api/lark/events"
      },
      usage: "在飞书多维表格中将生成状态改为待生成，或在飞书机器人里发送生成 SOP 的需求，即可触发自动生成。"
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "onion-sop-webhook"
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/generate") {
    const body = await readJsonBody(request);
    validateSecret(request, body);

    const type = normalizeType(body.type);
    const recordId = String(body.recordId || body.record_id || "").trim();
    if (!recordId) {
      sendJson(response, 400, {
        ok: false,
        error: {
          message: "缺少 recordId"
        }
      });
      return;
    }

    const result = type === "project"
      ? await processProjectByRecordId(recordId, { force: Boolean(body.force), dryRun: Boolean(body.dryRun) })
      : await processTaskByRecordId(recordId, { force: Boolean(body.force), dryRun: Boolean(body.dryRun) });

    sendJson(response, 200, {
      ok: true,
      data: result
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lark/events") {
    const body = await readJsonBody(request);
    const result = await botAssistant.handleEvent(body);
    sendJson(response, 200, result);
    return;
  }

  sendJson(response, 404, {
    ok: false,
    error: {
      message: "接口不存在"
    }
  });
}

function normalizeType(value) {
  const type = String(value || "project").trim().toLowerCase();
  if (["project", "task"].includes(type)) return type;
  const error = new Error("type 只能是 project 或 task");
  error.statusCode = 400;
  throw error;
}

function validateSecret(request, body) {
  const expected = process.env.SOP_WEBHOOK_SECRET || config.webhook?.secret || "";
  if (!expected) return;

  const actual = request.headers["x-sop-secret"] || body.secret || "";
  if (actual !== expected) {
    const error = new Error("Webhook 密钥校验失败");
    error.statusCode = 401;
    throw error;
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        request.destroy();
        reject(new Error("请求体过大"));
      }
    });
    request.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        const error = new Error("请求体不是合法 JSON");
        error.statusCode = 400;
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startWebhookServer();
}
