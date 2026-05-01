# 小衣柜 · Clothing Resale Platform

一个为单卖家设计的二手衣服出售平台：公开展示、Stripe 结账、后台管理。

- **前台**：商品展示 / 详情页 / 购物车 / Stripe Checkout
- **后台** `/admin`：密码登录 / 上架编辑 / 订单列表 / 标记发货
- **技术栈**：Next.js 14 App Router · Prisma · Postgres · Stripe · Vercel Blob · Tailwind

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 准备 Postgres

最简单的方式是用 Docker：

```bash
docker run --name shop-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
```

或者注册 [Neon](https://neon.tech) 免费数据库，把 `DATABASE_URL` 填进 `.env.local`。

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`，按注释填好：

```bash
cp .env.example .env.local
```

关键变量：

| 变量 | 用途 |
|---|---|
| `DATABASE_URL` | Postgres 连接串 |
| `ADMIN_PASSWORD` | 后台登录密码 |
| `SESSION_SECRET` | cookie 加密密钥（`openssl rand -base64 32`） |
| `STRIPE_SECRET_KEY` | Stripe 后端密钥 |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook 签名密钥 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 前端发布密钥 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 上传 token |
| `NEXT_PUBLIC_APP_URL` | 本地填 `http://localhost:3000` |

### 4. 初始化数据库

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000 查看商店，http://localhost:3000/admin/login 登录后台。

### 6. 本地测试 Stripe Webhook

另开一个终端：

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

把输出的 `whsec_...` 填入 `.env.local` 的 `STRIPE_WEBHOOK_SECRET`，然后重启 dev server。

测试支付：使用卡号 `4242 4242 4242 4242`，任意未来日期，任意 CVC。

## 端到端验证流程

1. 浏览首页 → 看到示例商品
2. 点商品 → "加入购物车" → "去结账"
3. 点 "前往支付" → 跳转到 Stripe 页面 → 用测试卡支付 + 填收货地址
4. 跳回 `/checkout/success` 显示订单号
5. 回 `/admin/orders` 看到新订单 + 买家 + 地址 + 金额
6. `/admin/products` 中该商品状态变为 `SOLD`
7. 点 "标记已发货" → 状态变 `SHIPPED`

## 部署到 Vercel

1. `vercel link`
2. 在 Vercel Dashboard 为 **Production** 环境填齐上面所有环境变量
3. 开启 Vercel Blob 存储并把 token 配入
4. 创建 Neon / Vercel Postgres，复制 `DATABASE_URL`
5. 运行 `npx prisma migrate deploy` 对准生产库
6. `vercel --prod`
7. Stripe Dashboard → Webhooks → 添加端点 `https://<域名>/api/webhook/stripe`，订阅：
   - `checkout.session.completed`
   - `checkout.session.expired`

## 目录结构

```
src/
├── app/
│   ├── (public)/           # 前台路由组
│   ├── admin/              # 后台
│   └── api/                # API 路由
├── components/
│   ├── storefront/
│   └── admin/
└── lib/
    ├── db.ts               # Prisma 单例
    ├── stripe.ts
    ├── session.ts          # iron-session 配置
    ├── auth.ts             # requireAdmin / isAdmin
    ├── cart-store.ts       # zustand + localStorage
    ├── money.ts
    └── i18n/               # 中文字典（先只有 zh，后续可加 en）
prisma/
├── schema.prisma
└── seed.ts
```

## 关键设计

- **防双卖**：`/api/checkout` 在创建 Stripe Session 前把商品 `status=RESERVED`，保留 15 分钟；webhook `completed` 设为 `SOLD`，`expired` 归还 `AVAILABLE`；前台查询也兼容过期预占。
- **金额**：全部以整数分（`priceCents`）存储，避免浮点。
- **删除商品**：软删除为 `HIDDEN`，保留订单外键完整性。
- **鉴权**：单一 `ADMIN_PASSWORD` + `iron-session` 加密 cookie，无需用户表。
- **图片**：Vercel Blob 公开 URL，`next.config.mjs` 已白名单。
