import http from "node:http";
import { spawn } from "node:child_process";
import crypto from "node:crypto";

const port = Number(process.env.PORT || 8787);
const cli = process.env.LARK_CLI_PATH || "node_modules/.bin/lark-cli";
const base = process.env.SALES_BASE_TOKEN || "QWHIbE8qHaucPfspVy5cFoiAnmc";
const table = process.env.SALES_TABLE_ID || "tblvTOT0stTJ0i2t";

function run(args, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(cli, args, { stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (x) => { out += x; });
    child.stderr.on("data", (x) => { err += x; });
    child.on("close", (code) => code === 0 ? resolve(JSON.parse(out)) : reject(new Error(err || out)));
    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

async function initialize() {
  if (!process.env.LARK_APP_ID || !process.env.LARK_APP_SECRET) return;
  await run(["config", "init", "--app-id", process.env.LARK_APP_ID, "--app-secret-stdin", "--brand", "feishu"], process.env.LARK_APP_SECRET);
}

async function createRecord(text) {
  const body = { create_records: [{ "用例ID": "BOT-RENDER", "家长原话": text, "生成状态": "待生成" }] };
  const result = await run(["base", "+record-batch-create", "--base-token", base, "--table-id", table, "--as", "bot", "--json", JSON.stringify(body)]);
  return result.data.record_id_list[0];
}

async function getRecord(id) {
  return (await run(["base", "+record-get", "--base-token", base, "--table-id", table, "--record-id", id, "--as", "bot", "--format", "json"])).data;
}

async function processMessage(chatId, text) {
  const id = await createRecord(text);
  for (let i = 0; i < 24; i += 1) {
    await new Promise((r) => setTimeout(r, 5000));
    const record = await getRecord(id);
    const state = Array.isArray(record["生成状态"]) ? record["生成状态"][0] : record["生成状态"];
    console.log(`[sales-bot] record ${id} state: ${state}`);
    if (["已完成", "需人工检查", "失败"].includes(state)) {
      const reply = `微信回复：${record["AI推荐回复"] || "暂无"}\n电话沟通版：${record["电话沟通版"] || "暂无"}\n下一步追问：${record["下一步追问"] || "暂无"}\n使用注意事项：${record["使用注意事项"] || "暂无"}\n质量状态：${state}`;
      await run(["im", "+messages-send", "--chat-id", chatId, "--text", reply, "--as", "bot"]);
      console.log(`[sales-bot] reply sent to ${chatId}`);
      return;
    }
  }
}

function json(res, body) {
  const raw = JSON.stringify(body);
  res.writeHead(200, { "content-type": "application/json", "content-length": Buffer.byteLength(raw) });
  res.end(raw);
}

function decryptEvent(data) {
  if (!data.encrypt) return data;
  const encryptKey = process.env.LARK_ENCRYPT_KEY;
  if (!encryptKey) throw new Error("LARK_ENCRYPT_KEY is required for encrypted Feishu events");
  const key = crypto.createHash("sha256").update(encryptKey).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, key.subarray(0, 16));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data.encrypt, "base64")), decipher.final()]).toString("utf8"));
}

const server = http.createServer((req, res) => {
  console.log(`[sales-bot] ${req.method} ${req.url}`);
  if (req.method === "GET" && req.url === "/health") return json(res, { ok: true, service: "sales-bot" });
  if (req.method !== "POST" || req.url !== "/events") return json(res, { ok: false, error: "not_found" });
  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    const data = decryptEvent(JSON.parse(body || "{}"));
    console.log(`[sales-bot] event received: ${data.event?.message?.message_type || data.type || "challenge"}`);
    if (data.challenge) return json(res, { challenge: data.challenge });
    const message = data.event?.message || {};
    let content = message.content || "";
    try { content = JSON.parse(content).text || content; } catch {}
    if (message.chat_id && content) {
      console.log(`[sales-bot] processing chat ${message.chat_id}`);
      processMessage(message.chat_id, content).catch((e) => console.error("[sales-bot] processing failed", e));
    } else {
      console.warn("[sales-bot] event had no chat_id or content");
    }
    json(res, { ok: true });
  });
});

initialize().then(() => server.listen(port, () => console.log(`[sales-bot] listening on ${port}`))).catch((e) => { console.error(e); process.exit(1); });
