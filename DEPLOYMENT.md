# 部署说明

## 推荐方式：Render

本项目已经配置为 Render 单服务部署：

- 前端构建产物会复制到 `backend/public`
- 后端 Fastify 同时提供 API 和前端静态页面
- Render 启动后，一个公网地址即可访问 App

## 部署步骤

1. 打开 [Render Dashboard](https://dashboard.render.com/)
2. 点击 **New +**
3. 选择 **Blueprint**
4. 连接 GitHub 仓库：

```text
https://github.com/htb1994/hutianbo
```

5. Render 会读取根目录 `render.yaml`
6. 点击 **Apply**
7. 等待构建完成

构建命令：

```bash
npm run deploy:build
```

启动命令：

```bash
npm run deploy:start
```

## 环境变量

`render.yaml` 已配置：

- `NODE_ENV=production`
- `LOG_LEVEL=info`
- `DB_DIALECT=sqlite`
- `DB_SQLITE_FILE=./data/prod.db`

## 验收

部署完成后，Render 会生成类似下面的公网地址：

```text
https://channel-sales-ops.onrender.com
```

打开后应能看到“渠道转化作战台”，并可以新增学校推进记录。

健康检查地址：

```text
https://你的-render-域名/health
```

## 注意

当前配置使用 SQLite，适合作业演示。Render 免费服务的本地文件可能在重启或重新部署后丢失。若要长期正式使用，建议切换到 Postgres，并配置 `DB_DIALECT=postgres` 与 `DATABASE_URL`。
