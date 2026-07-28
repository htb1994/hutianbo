import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));

const SCRIPT_FIELDS = ["话术名称", "使用场景", "适用学段", "产品点", "话术正文", "状态"];
const SCRIPT_ROWS = [
  ["开营邀约通用版", "开营邀约", "小学/初中/高中", "APP使用/同步学", "家长您好，我们这期【暑假加油站】主要是帮孩子把暑假学习节奏先带起来：每天任务不重，但会有明确学习动作、打卡反馈和鼓励师提醒。", "可用"],
  ["每日打卡提醒通用版", "每日打卡", "小学/初中/高中", "同步学/同步刷题", "同学们，今天的学习任务已经发出啦。完成后记得把截图发到群里，老师会逐个看。暑假最重要的不是一天学很多，而是每天都能稳稳完成一点。", "可用"],
  ["未打卡私聊提醒", "未打卡提醒", "小学/初中/高中", "学习习惯", "家长您好，今天孩子这边还没有看到学习截图。我先提醒一下，不用给孩子太大压力，今晚先完成最基础的一项就可以，关键是别让节奏断掉。", "可用"],
  ["课程价值传递", "课程价值", "小学/初中/高中", "同步学/专项突破", "洋葱学园的课程不是单纯让孩子看视频，而是把一个知识点拆成更容易理解的小步骤，再配合同步练习和错题反馈。孩子愿意学、能听懂，后面的刷题才更有效。", "可用"],
  ["结营表彰话术", "结营表彰", "小学/初中/高中", "结营表彰", "这段时间我们不只看成绩，更看孩子有没有开始行动、有没有坚持完成、有没有愿意面对错题。今天上榜的同学，都值得被认真表扬一次。", "可用"],
  ["转化私聊承接", "转化私聊", "小学/初中/高中", "组合品/学情报告", "家长您好，这段时间孩子的学习表现我们已经看到了。后面最关键的是不要让暑假的好状态断掉，建议继续用同步学、专项突破和学情报告把薄弱点接住，开学后会更稳。", "可用"],
  ["价格异议处理", "异议处理", "小学/初中/高中", "组合品", "我理解您会考虑价格。其实我们更建议先看孩子是否真的用得起来：如果孩子愿意跟着学、错题能被记录、家长能看到学情，这个产品才有价值。", "可用"]
];

const TASK_FIELDS = ["任务名称", "所属项目", "任务类型", "城市/学校", "活动名称", "年级/学段", "奖项设置", "学生名单", "补充要求", "生成状态", "结果链接", "备注"];
const TASK_ROWS = [
  ["样例：衡阳市成章实验中学配套话术", "衡阳市成章实验中学暑假加油站", "生成配套话术", "衡阳市成章实验中学", "暑假加油站", "初中", "连续打卡之星、进步突破之星、错题攻坚之星、课堂专注之星、暑假潜力之星", "张三\n李四", "14天，前12天服务，第13天转化", "待生成", "", "样例任务，可直接运行一次生成话术文档"]
];

async function main() {
  await seedTable(config.tables.scripts, SCRIPT_FIELDS, SCRIPT_ROWS, "话术库");
  await seedTable(config.tables.tasks, TASK_FIELDS, TASK_ROWS, "任务表");
}

async function seedTable(tableId, fields, rows, label) {
  if (!tableId) {
    console.log(`[seed] 跳过${label}：未配置 table id`);
    return;
  }
  const existing = await run([
    "base", "+record-list",
    "--as", "user",
    "--base-token", config.baseToken,
    "--table-id", tableId,
    "--limit", "10",
    "--format", "json",
    "--field-id", fields[0]
  ]);
  const count = existing.data?.data?.length || 0;
  if (count > 0) {
    console.log(`[seed] ${label}已有记录，跳过样例导入`);
    return;
  }
  await run([
    "base", "+record-batch-create",
    "--as", "user",
    "--base-token", config.baseToken,
    "--table-id", tableId,
    "--json", JSON.stringify({ fields, rows })
  ]);
  console.log(`[seed] 已导入${label}样例记录：${rows.length}条`);
}

function run(args) {
  return new Promise((resolve, reject) => {
    execFile(config.larkCli, args, {
      env: {
        ...process.env,
        LARKSUITE_CLI_NO_UPDATE_NOTIFIER: "1",
        LARKSUITE_CLI_NO_SKILLS_NOTIFIER: "1"
      },
      maxBuffer: 50 * 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`lark-cli 执行失败：${args.join(" ")}\n${stderr || stdout}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`lark-cli 返回不是 JSON：${stdout}`));
      }
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
