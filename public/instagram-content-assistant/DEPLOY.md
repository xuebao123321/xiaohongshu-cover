# Instagram 内容策划助手 — 部署说明

## 环境变量（Cloudflare Worker Secrets）

部署前需要设置以下 secrets：

```bash
# 必设：DeepSeek API 密钥
wrangler secret put DEEPSEEK_API_KEY
# 输入你的 DeepSeek API Key

# 以下可选（默认值已写入 wrangler.toml [vars]）
wrangler secret put MODEL_PROVIDER     # 默认 deepseek
wrangler secret put MODEL_BASE_URL     # 默认 https://api.deepseek.com
wrangler secret put MODEL_NAME         # 默认 deepseek-chat
```

## 部署步骤

```bash
# 1. 同步静态资源到 public/ 目录
npm run sync:public

# 2. 本地测试
npm run dev:cf
# 访问 http://localhost:8787/instagram-content-assistant/

# 3. 部署到 Cloudflare Workers
npm run deploy:cf
```

## 切换模型 Provider

修改 `wrangler.toml` 中的 `[vars]` 或通过 `wrangler secret put` 覆盖：

### OpenAI
```toml
MODEL_BASE_URL = "https://api.openai.com/v1"
MODEL_NAME = "gpt-4.1-mini"
```
需设置: `wrangler secret put DEEPSEEK_API_KEY` → 填入 OpenAI API Key

### SiliconFlow
```toml
MODEL_BASE_URL = "https://api.siliconflow.cn/v1"
MODEL_NAME = "deepseek-ai/DeepSeek-V3"
```
需设置: `wrangler secret put DEEPSEEK_API_KEY` → 填入 SiliconFlow API Key

## 页面权限管理

1. 访问 `admin.html` 管理后台
2. 找到对应 VIP 用户
3. 点击「IG内容」chip 切换为 ✓ 状态
4. 用户刷新首页即可看到 Instagram 内容策划助手入口

## API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/generate-instagram-content | 生成完整内容包 |
| POST | /api/rewrite-instagram-content | 改写内容 |
| POST | /api/generate-reels-video-plan | 生成 Reels 分镜方案 |

## 文件结构

```
cover-maker/
├── src/worker.js                          # Worker 含 3 个新 API 路由
├── wrangler.toml                          # 模型配置 vars
├── index.html                             # 主导航含 IG 内容入口
├── admin.html                             # 页面权限管理含 IG内容 chip
├── scripts/sync-public.mjs                # 同步 content_assistant → instagram-content-assistant
├── content_assistant/
│   ├── index.html                         # Instagram 内容策划助手主页
│   ├── instagram_content_assistant_dev_doc.md
│   ├── AI_PROMPTS_v1.0.md
│   └── DEPLOY.md                          # 本文件
└── public/
    └── instagram-content-assistant/
        └── index.html                     # 部署产物
```
