# Sales Bot

独立的内部销售顾问机器人服务。Render 新建服务时使用启动命令：

```bash
node sales-bot/server.js
```

环境变量：`LARK_APP_ID`、`LARK_APP_SECRET`、`SALES_BASE_TOKEN`、`SALES_TABLE_ID`。

健康检查：`GET /health`。飞书事件订阅地址：`POST /events`。
