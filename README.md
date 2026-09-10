# JKTAC 开发成果展示站

Next.js 全栈项目，用于展示内部开发成果并收集同事反馈。

## 环境要求

- Node.js 20+
- PostgreSQL 14+
- Nginx（生产部署）

## 快速开始

```bash
cp .env.example .env
# 编辑 DATABASE_URL、ADMIN_USERNAME、ADMIN_PASSWORD、NEXTAUTH_SECRET、NEXTAUTH_URL

npm install
npx prisma migrate deploy
npm run db:seed   # 可选
npm run dev
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 |
| `ADMIN_USERNAME` | 管理员用户名 |
| `ADMIN_PASSWORD` | 管理员密码（推荐 bcrypt 哈希） |
| `NEXTAUTH_SECRET` | 会话密钥 |
| `NEXTAUTH_URL` | 站点 URL，如 `https://jktac.top` |

生成 bcrypt 密码：

```bash
node scripts/hash-password.mjs 你的密码
```

## 生产部署

```bash
npm run build
pm2 start ecosystem.config.js
```

Nginx 参考 `deploy/nginx.conf`，需配置：

- SSL 证书
- `/uploads/` 静态 alias 到 `public/uploads/`
- 反向代理 `location /` → `127.0.0.1:3000`

部署后重启：

```bash
npm run build && pm2 restart dev-showcase && nginx -s reload
```

## 冒烟测试

```bash
npm run smoke
```

## 反馈通知

在 `.env` 中配置 SMTP 和/或企微 Webhook，新反馈提交后会自动通知：

- `NOTIFY_EMAIL_TO` + `SMTP_*` — 邮件通知
- `WECHAT_WEBHOOK_URL` — 企微群机器人

## 定时备份

```bash
npm run backup
```

建议添加 cron（参考 `deploy/backup.cron`），每日自动备份数据库与 `public/uploads`。

## 操作审计

管理后台 → **操作审计** 可查看登录、项目、媒体、反馈等操作记录。

## 主要功能

- 首页项目卡片展示（仅已发布）
- 项目详情：截图、下载、教程、视频、反馈
- 管理后台：项目 CRUD、媒体管理、GitHub 导入、反馈处理
- 匿名反馈（含附件）
