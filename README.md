# Mike's store

Mike 的单卖家个人衣橱商店。它把每件衣服当作一件独立藏品来展示，同时提供可靠的库存锁定、Stripe 支付、订单履约和轻量后台。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-149eca)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748)
![Tests](https://img.shields.io/badge/tests-Vitest-6e9f18)

## 这次重做包含什么

- 编辑型 storefront：首页主视觉、分类与多关键词搜索、藏品详情、响应式购物袋和结账复核。
- 单件库存保护：打开 Stripe Checkout 时原子锁定商品 32 分钟；Stripe session 在 30 分钟过期。
- 幂等支付履约：webhook 与成功页都可安全完成订单，并防止重复售卖或重复处理事件。
- 实用后台：商品上架/隐藏/编辑、图片上传、订单查看、物流单号、未付款订单释放。
- 更安全的管理面：scrypt 密码哈希、加密会话、数据库级登录限流、同源写操作检查。
- 图片管线：服务端验证、旋转、缩放、去除元数据，并统一输出 WebP 到 Vercel Blob。
- 可部署基础：Postgres migration、seed、SEO metadata、sitemap、robots、环境变量模板和 Docker 开发库。

## 技术栈

- Next.js 16 App Router、React 19、TypeScript、Tailwind CSS 4
- Prisma 6 + PostgreSQL
- Stripe Checkout + webhook
- Vercel Blob + Sharp
- iron-session、Zustand、Zod、Vitest、ESLint

## 本地启动

要求 Node.js 22 LTS（22.13+）或 Node.js 24，以及 Docker Desktop。

```powershell
npm ci
Copy-Item .env.example .env.local
docker compose up -d
npm run admin:hash-password -- "choose-a-long-password"
```

把最后一条命令生成的值复制到 `.env.local` 的 `ADMIN_PASSWORD_HASH`，再设置至少 32 字符的 `SESSION_SECRET`。随后：

```powershell
npm run db:deploy
npm run db:seed
npm run dev
```

- 商店：http://localhost:3000
- 后台：http://localhost:3000/admin/login

`db:seed` 会加入六件视觉占位商品，只用于开发和演示。正式上线前请在后台删除或隐藏它们，换成 Mike 的真实藏品与照片。

## 环境变量

| 变量 | 必需 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 是 | PostgreSQL 连接串；Vercel 可使用 Neon |
| `ADMIN_PASSWORD_HASH` | 是 | `npm run admin:hash-password -- "..."` 生成的 scrypt hash |
| `SESSION_SECRET` | 是 | 至少 32 字符的随机会话密钥 |
| `STRIPE_SECRET_KEY` | 是 | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | 是 | webhook endpoint 的 `whsec_...` |
| `STRIPE_ALLOWED_COUNTRIES` | 否 | 逗号分隔，默认只允许 `US` |
| `BLOB_READ_WRITE_TOKEN` | 部署时 | Vercel Blob token；已连接的 Vercel 项目也可使用 OIDC |
| `APP_URL` | 是 | 完整站点地址，用于可信 Stripe redirect |
| `NEXT_PUBLIC_SHIPPING_CENTS` | 否 | 固定运费，按最小货币单位；`800` 为 $8，`0` 为免邮 |
| `NEXT_PUBLIC_SHOP_*` | 否 | 店名、店主、地点、邮箱、Instagram 等公开品牌信息 |
| `NEXT_PUBLIC_CURRENCY` | 否 | 默认 `usd` |
| `NEXT_PUBLIC_LOCALE` | 否 | 默认 `en-US` |

完整示例见 [.env.example](./.env.example)。所有 `NEXT_PUBLIC_*` 变量都会出现在浏览器中，不能放密钥。

## Stripe 本地测试

另开一个终端，用 Stripe CLI 将事件转发到本地：

```powershell
stripe login
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

把 CLI 输出的 webhook secret 填入 `.env.local` 后重启开发服务器。测试模式可使用 Stripe 的 `4242 4242 4242 4242` 测试卡。

Webhook 需要订阅：

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

## 上线到 Vercel

1. 在 Neon 创建生产 Postgres，在 Vercel 创建项目并连接 Vercel Blob。
2. 在 Vercel 的 Production 环境填入 `.env.example` 中的生产值；`APP_URL` 必须是最终 HTTPS 域名。
3. 从可信本地环境对生产数据库运行一次 `npm run db:deploy`。不要对生产库运行 `db:seed`，除非确实想导入演示商品。
4. 部署项目；推荐 Vercel Node.js 24 runtime。
5. 在 Stripe Dashboard 创建 `https://你的域名/api/webhook/stripe`，订阅上面的四个事件，并把 signing secret 写回 Vercel。
6. 用 Stripe test mode 完成一次购买，确认后台订单、地址、商品 `SOLD` 状态和发货流程都正确，再切换 live keys。

上线前还需要 Mike 确认：最终域名、退换货政策、隐私条款、实际运费、服务国家、联系邮箱和 Stripe 商家资料。这些属于业务配置，不应该由代码替他猜定。

## 质量检查

```powershell
npm run check
npm audit
```

`npm run check` 依次执行 ESLint、TypeScript、Vitest 和 production build。

## 关键目录

```text
prisma/
  migrations/          数据库结构历史
  schema.prisma        商品、订单、库存锁、登录限流
  seed.ts              仅开发用示例藏品
src/
  app/(public)/        商店、藏品、购物袋、结账
  app/admin/           登录后的经营后台
  app/api/             checkout、webhook、上传和后台写操作
  components/          storefront 与 admin 组件
  lib/                 库存、履约、认证、Stripe、站点配置
```

## 库存与支付模型

```text
AVAILABLE -> RESERVED -> SOLD
                    \-> AVAILABLE  (Stripe 过期或创建失败)
```

每件商品只有一个库存单位。结账 API 使用 Serializable transaction 创建订单并锁定商品；锁定归属于该订单。完成或过期事件只允许修改自己持有的锁，因此延迟 webhook、重复 webhook 和并发结账不会把别人的库存错误释放。
