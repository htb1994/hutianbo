import path from "node:path";
import { execFile } from "node:child_process";

export function createLarkClient(config) {
  const cli = config.larkCli;
  const identity = config.identity || "user";

  function run(args, options = {}) {
    const env = {
      ...process.env,
      LARKSUITE_CLI_NO_UPDATE_NOTIFIER: "1",
      LARKSUITE_CLI_NO_SKILLS_NOTIFIER: "1"
    };

    return new Promise((resolve, reject) => {
      execFile(cli, args, { env, cwd: options.cwd ?? process.cwd(), maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          const wrapped = new Error(`lark-cli 执行失败: ${args.join(" ")}\n${stderr || stdout}`);
          wrapped.cause = error;
          reject(wrapped);
          return;
        }

        if (options.raw) {
          resolve(stdout);
          return;
        }

        try {
          resolve(JSON.parse(stdout));
        } catch (parseError) {
          const wrapped = new Error(`lark-cli 返回不是 JSON: ${args.join(" ")}\n${stdout}`);
          wrapped.cause = parseError;
          reject(wrapped);
        }
      });
    });
  }

  return {
    run,
    listRecords: ({ tableId, fields, limit }) => run([
      "base", "+record-list",
      "--as", identity,
      "--base-token", config.baseToken,
      "--table-id", tableId,
      "--limit", String(limit),
      "--format", "json",
      ...fields.flatMap((field) => ["--field-id", field])
    ]),
    updateRecord: ({ tableId, recordId, patch }) => run([
      "base", "+record-batch-update",
      "--as", identity,
      "--base-token", config.baseToken,
      "--table-id", tableId,
      "--json", JSON.stringify({ update_records: { [recordId]: patch } })
    ]),
    createRecord: ({ tableId, fields, rows }) => run([
      "base", "+record-batch-create",
      "--as", identity,
      "--base-token", config.baseToken,
      "--table-id", tableId,
      "--json", JSON.stringify({
        create_records: rows.map((row) => Object.fromEntries(fields.map((field, index) => [field, row[index]])))
      })
    ]),
    createRecords: ({ tableId, records }) => run([
      "base", "+record-batch-create",
      "--as", identity,
      "--base-token", config.baseToken,
      "--table-id", tableId,
      "--json", JSON.stringify({ create_records: records })
    ]),
    replyMessage: ({ messageId, text, markdown, idempotencyKey }) => run([
      "im", "+messages-reply",
      "--as", identity,
      "--message-id", messageId,
      ...(markdown ? ["--markdown", markdown] : ["--text", text || ""]),
      ...(idempotencyKey ? ["--idempotency-key", idempotencyKey] : []),
      "--format", "json"
    ]),
    sendMessage: ({ chatId, text, markdown, idempotencyKey }) => run([
      "im", "+messages-send",
      "--as", identity,
      "--chat-id", chatId,
      ...(markdown ? ["--markdown", markdown] : ["--text", text || ""]),
      ...(idempotencyKey ? ["--idempotency-key", idempotencyKey] : []),
      "--format", "json"
    ]),
    createDoc: ({ content, docFormat = "xml", title }) => run([
      "docs", "+create",
      "--as", identity,
      "--doc-format", docFormat,
      ...(title ? ["--title", title] : []),
      "--content", content,
      "--format", "json"
    ]),
    appendDoc: ({ docId, content }) => run([
      "docs", "+update",
      "--as", identity,
      "--doc", docId,
      "--command", "append",
      "--content", content,
      "--format", "json"
    ]),
    updateDocPublicPermission: ({ docId, linkShareEntity = "tenant_editable" }) => run([
      "drive", "permission.public", "patch",
      "--as", identity,
      "--token", docId,
      "--type", "docx",
      "--data", JSON.stringify({
        link_share_entity: linkShareEntity,
        share_entity: "same_tenant",
        comment_entity: "anyone_can_edit",
        security_entity: "anyone_can_edit"
      }),
      "--yes",
      "--format", "json"
    ]),
    insertMedia: ({ docId, filePath, type, caption }) => {
      const dir = path.dirname(filePath);
      const file = `./${path.basename(filePath)}`;
      const args = [
        "docs", "+media-insert",
        "--as", identity,
        "--doc", docId,
        "--file", file,
        "--type", type
      ];
      if (type === "image") {
        args.push("--align", "center", "--width", "720");
      } else {
        args.push("--file-view", "preview");
      }
      if (caption) {
        args.push("--caption", caption);
      }
      return run(args, { cwd: dir });
    }
  };
}
