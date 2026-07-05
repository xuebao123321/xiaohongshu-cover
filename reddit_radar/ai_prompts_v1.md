# Reddit Radar（线索雷达）多批次 AI 提示词

> 基于 `reddit_radar_scheme_a_dev_doc.md` 开发文档，对应项目 `/Users/andy/Documents/Andy AI/cover-maker/`
>
> **使用方式**：从 Batch 1 到 Batch 8 依次复制粘贴到 AI 编码助手中执行。每批执行完毕后系统应处于完整可运行状态。
>
> **项目现有技术栈**：GitHub Pages 静态部署、Supabase（Auth + Edge Functions + PostgreSQL）、Vanilla JS（无框架）、ES Modules、`sync-public.mjs` 构建脚本。

---

## Batch 1：数据层基础 + 权限系统注册

```
请你按照以下要求，逐步修改项目文件，不要遗漏任何一步。

## 第一步：创建数据目录和初始 JSON 文件

在项目根目录下创建以下新文件：

### 1. /data/reddit/sources.json
写入以下内容（30个RSS源配置）：
```json
[
  {"id":"phd-new","enabled":true,"type":"subreddit_new","subreddit":"PhD","keyword":"","priority":3,"rssUrl":"https://www.reddit.com/r/PhD/new.rss"},
  {"id":"gradschool-new","enabled":true,"type":"subreddit_new","subreddit":"GradSchool","keyword":"","priority":3,"rssUrl":"https://www.reddit.com/r/GradSchool/new.rss"},
  {"id":"askacademia-new","enabled":true,"type":"subreddit_new","subreddit":"AskAcademia","keyword":"","priority":3,"rssUrl":"https://www.reddit.com/r/AskAcademia/new.rss"},
  {"id":"academia-new","enabled":true,"type":"subreddit_new","subreddit":"academia","keyword":"","priority":2,"rssUrl":"https://www.reddit.com/r/academia/new.rss"},
  {"id":"academicwriting-new","enabled":true,"type":"subreddit_new","subreddit":"AcademicWriting","keyword":"","priority":2,"rssUrl":"https://www.reddit.com/r/AcademicWriting/new.rss"},
  {"id":"scientificwriting-new","enabled":true,"type":"subreddit_new","subreddit":"scientificwriting","keyword":"","priority":2,"rssUrl":"https://www.reddit.com/r/scientificwriting/new.rss"},
  {"id":"internationalstudents-new","enabled":true,"type":"subreddit_new","subreddit":"InternationalStudents","keyword":"","priority":2,"rssUrl":"https://www.reddit.com/r/InternationalStudents/new.rss"},
  {"id":"gradadmissions-new","enabled":true,"type":"subreddit_new","subreddit":"gradadmissions","keyword":"","priority":2,"rssUrl":"https://www.reddit.com/r/gradadmissions/new.rss"},
  {"id":"machinelearning-new","enabled":true,"type":"subreddit_new","subreddit":"MachineLearning","keyword":"","priority":1,"rssUrl":"https://www.reddit.com/r/MachineLearning/new.rss"},
  {"id":"bioinformatics-new","enabled":true,"type":"subreddit_new","subreddit":"bioinformatics","keyword":"","priority":1,"rssUrl":"https://www.reddit.com/r/bioinformatics/new.rss"},
  {"id":"phd-lack-of-novelty","enabled":true,"type":"subreddit_search","subreddit":"PhD","keyword":"lack of novelty","priority":5,"rssUrl":"https://www.reddit.com/r/PhD/search.rss?q=lack%20of%20novelty&restrict_sr=1&sort=new"},
  {"id":"phd-reviewer-comments","enabled":true,"type":"subreddit_search","subreddit":"PhD","keyword":"reviewer comments","priority":5,"rssUrl":"https://www.reddit.com/r/PhD/search.rss?q=reviewer%20comments&restrict_sr=1&sort=new"},
  {"id":"phd-revise-resubmit","enabled":true,"type":"subreddit_search","subreddit":"PhD","keyword":"revise and resubmit","priority":5,"rssUrl":"https://www.reddit.com/r/PhD/search.rss?q=revise%20and%20resubmit&restrict_sr=1&sort=new"},
  {"id":"phd-paper-rejected","enabled":true,"type":"subreddit_search","subreddit":"PhD","keyword":"paper rejected","priority":4,"rssUrl":"https://www.reddit.com/r/PhD/search.rss?q=paper%20rejected&restrict_sr=1&sort=new"},
  {"id":"phd-writing-help","enabled":true,"type":"subreddit_search","subreddit":"PhD","keyword":"writing help","priority":4,"rssUrl":"https://www.reddit.com/r/PhD/search.rss?q=writing%20help&restrict_sr=1&sort=new"},
  {"id":"phd-journal","enabled":true,"type":"subreddit_search","subreddit":"PhD","keyword":"journal","priority":3,"rssUrl":"https://www.reddit.com/r/PhD/search.rss?q=journal&restrict_sr=1&sort=new"},
  {"id":"phd-major-revision","enabled":true,"type":"subreddit_search","subreddit":"PhD","keyword":"major revision","priority":5,"rssUrl":"https://www.reddit.com/r/PhD/search.rss?q=major%20revision&restrict_sr=1&sort=new"},
  {"id":"phd-esl-writing","enabled":true,"type":"subreddit_search","subreddit":"PhD","keyword":"ESL academic writing","priority":3,"rssUrl":"https://www.reddit.com/r/PhD/search.rss?q=ESL%20academic%20writing&restrict_sr=1&sort=new"},
  {"id":"gradschool-rejected","enabled":true,"type":"subreddit_search","subreddit":"GradSchool","keyword":"rejected","priority":4,"rssUrl":"https://www.reddit.com/r/GradSchool/search.rss?q=rejected&restrict_sr=1&sort=new"},
  {"id":"gradschool-writing","enabled":true,"type":"subreddit_search","subreddit":"GradSchool","keyword":"writing","priority":3,"rssUrl":"https://www.reddit.com/r/GradSchool/search.rss?q=writing&restrict_sr=1&sort=new"},
  {"id":"askacademia-reviewer","enabled":true,"type":"subreddit_search","subreddit":"AskAcademia","keyword":"reviewer","priority":4,"rssUrl":"https://www.reddit.com/r/AskAcademia/search.rss?q=reviewer&restrict_sr=1&sort=new"},
  {"id":"askacademia-publish","enabled":true,"type":"subreddit_search","subreddit":"AskAcademia","keyword":"publish","priority":3,"rssUrl":"https://www.reddit.com/r/AskAcademia/search.rss?q=publish&restrict_sr=1&sort=new"},
  {"id":"askacademia-journal","enabled":true,"type":"subreddit_search","subreddit":"AskAcademia","keyword":"journal","priority":3,"rssUrl":"https://www.reddit.com/r/AskAcademia/search.rss?q=journal&restrict_sr=1&sort=new"},
  {"id":"global-reviewer-comments","enabled":true,"type":"global_search","subreddit":"","keyword":"reviewer comments","priority":4,"rssUrl":"https://www.reddit.com/search.rss?q=reviewer%20comments&sort=new"},
  {"id":"global-manuscript-rejected","enabled":true,"type":"global_search","subreddit":"","keyword":"manuscript rejected","priority":4,"rssUrl":"https://www.reddit.com/search.rss?q=manuscript%20rejected&sort=new"},
  {"id":"global-academic-writing","enabled":true,"type":"global_search","subreddit":"","keyword":"academic writing unclear","priority":3,"rssUrl":"https://www.reddit.com/search.rss?q=academic%20writing%20unclear&sort=new"},
  {"id":"global-english-editing","enabled":true,"type":"global_search","subreddit":"","keyword":"English editing service","priority":3,"rssUrl":"https://www.reddit.com/search.rss?q=English%20editing%20service&sort=new"},
  {"id":"global-predatory-journal","enabled":true,"type":"global_search","subreddit":"","keyword":"predatory journal","priority":3,"rssUrl":"https://www.reddit.com/search.rss?q=predatory%20journal&sort=new"},
  {"id":"global-chatgpt-writing","enabled":true,"type":"global_search","subreddit":"","keyword":"ChatGPT academic writing","priority":2,"rssUrl":"https://www.reddit.com/search.rss?q=ChatGPT%20academic%20writing&sort=new"},
  {"id":"global-desk-reject","enabled":true,"type":"global_search","subreddit":"","keyword":"desk reject","priority":4,"rssUrl":"https://www.reddit.com/search.rss?q=desk%20reject&sort=new"}
]
```

### 2. /data/reddit/posts.json
写入空数组：
```json
[]
```

### 3. /data/reddit/analysis.json
写入空数组：
```json
[]
```

### 4. /data/reddit/fetch-log.json
写入空数组：
```json
[]
```

### 5. /data/reddit/topics.json
写入空数组：
```json
[]
```

## 第二步：更新构建脚本

修改 /scripts/sync-public.mjs，在文件末尾 cp 调用之前，添加一行把整个 data 目录也复制到 public/ 下。也就是在 `await cp(join(root, 'reddit-reply-assistant'), ...)` 那行之后，添加：
```js
await cp(join(root, 'data'), join(publicDir, 'data'), { recursive: true });
```

## 第三步：注册新页面权限到 Edge Function

修改 /supabase/functions/admin-manage/index.ts 文件中的 validPages 数组（约第138行），在 `'reddit_reply_assistant'` 后面追加 `'reddit_radar'`，使该行变为：
```typescript
const validPages = ['ins_reviewer_carousel', 'reddit_reply_assistant', 'reddit_radar'];
```

## 第四步：确认目录结构

请确认以下文件/目录已存在或已创建：
- /data/reddit/ 目录及其下5个JSON文件
- /scripts/sync-public.mjs 已更新
- /supabase/functions/admin-manage/index.ts 已更新

执行完这些步骤后，整个项目的数据层基础就已就绪，构建脚本也会把 Reddit Radar 数据文件部署到 GitHub Pages。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch 2：RSS 抓取脚本

```
请你按照以下要求创建 RSS 抓取脚本，确保代码健壮、无 bug。

## 任务：创建 /scripts/fetch-reddit-rss.mjs

这是一个 Node.js 脚本（.mjs 模块），功能是从 sources.json 读取启用的 RSS 源，逐个抓取 Reddit RSS 数据，解析 XML 提取帖子，去重后写入 posts.json，同时记录抓取日志到 fetch-log.json。

### 完整要求

1. **读取配置**：从项目根目录的 `../data/reddit/sources.json` 读取所有 `enabled: true` 的源
2. **请求 RSS**：使用原生 `fetch`（Node 18+ 内置），设置请求头：
   - `User-Agent: academic-reddit-radar/1.0 (yourdomain)`
   - `Accept: application/rss+xml, application/xml, text/xml`
   - 每个请求超时 30 秒（使用 AbortController）
   - 源之间间隔 2 秒（避免限流），用简单的 `await new Promise(r => setTimeout(r, 2000))`
3. **解析 XML**：不依赖第三方 XML 库，使用正则表达式从 RSS XML 中提取 `<entry>` 或 `<item>` 节点。Reddit RSS 使用的是 Atom 格式（`<entry>`），需要提取：
   - `id` → Reddit post id（从 URL 中提取，如 `/r/PhD/comments/abc123/...` → `abc123`）
   - `title` → 帖子标题
   - `content` → 帖子正文（`<content type="html">` 中的文本，去掉 HTML 标签）
   - `link` → 帖子链接（`<link href="..."/>` 或 `<link>...</link>`）
   - `published` 或 `updated` → 发布时间（ISO 8601 格式）
   - `category` → subreddit 名称（从 `<category term="..." label="..."/>` 提取）
4. **提取 Reddit post ID**：从 link 或 id 字段中用正则 `/\/comments\/([a-z0-9]+)/i` 提取
5. **去重逻辑**：
   - 先读取现有的 `../data/reddit/posts.json`
   - 按优先级顺序去重：Reddit post id > URL > contentHash（SHA256 的简化版本）
   - 对于 contentHash，使用 Node.js 内置 `crypto.createHash('sha256').update(title + url).digest('hex')`
   - 如果同一个帖子被多个关键词抓到，保留第一条主记录，将 sourceKeyword 和 sourceId 合并为数组（额外字段 `sourceKeywords` 和 `sourceIds`）
6. **写入 posts.json**：将新帖子追加到现有数组，保留不超过 14 天的数据（根据 `publishedAt` 过滤），写入前先创建临时文件 `.tmp_posts.json`，JSON.parse 校验成功后再 rename 覆盖正式文件
7. **写入 fetch-log.json**：记录每次抓取的结果，格式：
   ```json
   {
     "sourceId": "phd-new",
     "rssUrl": "https://...",
     "status": "success" | "error",
     "newPosts": 3,
     "errorMessage": null,
     "fetchedAt": "2026-07-04T12:00:00Z"
   }
   ```
8. **容错处理**：
   - 单个源抓取失败不影响其他源
   - 网络错误、非 200 响应、XML 解析错误都 catch 并记录到 log
   - 脚本末尾输出 "Done. Total new posts: N" 到 console

### 关键代码结构

```javascript
import { readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const DATA_DIR = join(root, 'data', 'reddit');
// ... 实现抓取逻辑
```

### posts.json 中每条帖子的数据结构

```json
{
  "id": "reddit_abc123",
  "redditId": "abc123",
  "title": "...",
  "content": "...",
  "url": "https://www.reddit.com/r/PhD/comments/abc123/...",
  "subreddit": "PhD",
  "author": "",
  "publishedAt": "2026-07-04T10:00:00Z",
  "fetchedAt": "2026-07-04T12:00:00Z",
  "sourceId": "phd-lack-of-novelty",
  "sourceKeyword": "lack of novelty",
  "sourceType": "subreddit_search",
  "contentHash": "sha256_xxx"
}
```

### 测试验证

脚本末尾添加：如果通过 `node scripts/fetch-reddit-rss.mjs` 直接运行，执行主函数。如果是 import 引用则不自动运行。

执行完这些步骤后，可以手动运行 `node scripts/fetch-reddit-rss.mjs` 来测试 RSS 抓取。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch 3：AI 分析脚本

```
请你按照以下要求创建 AI 分析脚本，确保代码健壮、无 bug。

## 任务：创建 /scripts/analyze-reddit-posts.mjs

这是一个 Node.js 脚本，从 posts.json 读取未分析的新帖子，调用 AI API（兼容 OpenAI 接口格式）进行结构化分析，将分析结果写入 analysis.json。

### 完整要求

1. **读取数据**：
   - 读取 `../data/reddit/posts.json`
   - 读取 `../data/reddit/analysis.json`
   - 找出所有 `postId` 不在 analysis.json 中出现过的帖子（即未分析的帖子）
2. **限制分析量**：每次最多分析 30 条新帖
3. **调用 AI API**：
   - 从环境变量读取：`AI_API_KEY`（必填）、`AI_BASE_URL`（可选，默认 `https://api.openai.com/v1`）、`AI_MODEL`（可选，默认 `gpt-4o-mini`）
   - 使用原生 `fetch` 调用 `/chat/completions` 接口
   - 请求头：`Authorization: Bearer ${AI_API_KEY}`，`Content-Type: application/json`
4. **系统 Prompt**（中英双语，严格按照开发文档第15节）：

```
你是一家正规合规的 AI 论文辅导机构的 Reddit 市场分析助手。
机构只提供 academic writing coaching、manuscript editing、reviewer response support、journal submission strategy、research communication coaching。
机构不提供代写、包发表、保证录用、伪造数据、替用户完成学术任务等服务。

你的任务是分析输入的 Reddit 帖子，判断它是否包含论文写作、审稿返修、英文润色、选刊投稿、AI 写作等相关需求。

必须先判断帖子类型：
1. user_need：用户真实求助
2. competitor_marketing：同行营销或服务推广
3. academic_discussion：普通学术讨论
4. irrelevant：无关内容

如果不是 user_need 或 competitor_marketing，不要强行提炼私域钩子。
如果信息没有出现，请写 null，不要编造。

请只输出 JSON，不要输出解释。
```

5. **用户 Prompt 模板**：

```
请分析以下 Reddit 帖子：

Subreddit: {{subreddit}}
Title: {{title}}
Content: {{content}}
Source keyword: {{sourceKeyword}}

请输出以下 JSON：
{
  "postType": "user_need | competitor_marketing | academic_discussion | irrelevant",
  "painPoint": "",
  "problemType": "harsh_reviewer | writing_unclear | lack_of_novelty | english_editing | journal_selection | rr_anxiety | ai_writing | thesis_structure | other | irrelevant",
  "urgencyScore": 1,
  "serviceFitScore": 1,
  "replyWorthinessScore": 1,
  "riskScore": 1,
  "totalScore": 0,
  "recommendedAction": "ignore | save_topic | reply | high_priority_reply",
  "suggestedReplyAngle": "",
  "ctaLevel": "none | soft | medium | direct",
  "summary": "",
  "xiaohongshuTopic": "",
  "instagramTopic": "",
  "complianceNotes": ""
}
```

6. **评分计算**（AI 只返回 urgencyScore/serviceFitScore/replyWorthinessScore/riskScore，脚本负责计算 totalScore）：
   - `sourcePriority` 从 sources.json 读取对应 source 的 priority
   - `totalScore = urgencyScore + serviceFitScore + replyWorthinessScore + sourcePriority - riskScore`
   - totalScore 范围限制在 0-20

7. **内容截断**：帖子内容超过 4000 字符时截断，末尾加 "...[truncated]"

8. **JSON 提取**：AI 返回的内容可能包含 markdown 代码块包裹，需要先从响应中提取 JSON（去掉可能的 ```json 和 ``` 标记），再 JSON.parse

9. **失败处理**：单条分析失败时，该条标记 `analyzedAt` 为 null 且 `analysisError` 为错误信息，不阻塞其他帖子分析

10. **写入分析结果**：
    - 每条分析结果添加 `postId`（对应 posts.json 中的 `id`）和 `analyzedAt`（ISO 时间戳）
    - 使用原子写入：先写 `.tmp_analysis.json`，校验 JSON.parse 成功后 rename 覆盖

### analysis.json 中每条记录的数据结构（与 dev doc 第17节一致）：

```json
{
  "postId": "reddit_abc123",
  "postType": "user_need",
  "painPoint": "...",
  "problemType": "lack_of_novelty",
  "urgencyScore": 4,
  "serviceFitScore": 5,
  "replyWorthinessScore": 4,
  "riskScore": 1,
  "totalScore": 16,
  "recommendedAction": "high_priority_reply",
  "suggestedReplyAngle": "...",
  "ctaLevel": "soft",
  "summary": "...",
  "xiaohongshuTopic": "...",
  "instagramTopic": "...",
  "complianceNotes": "...",
  "analyzedAt": "2026-07-04T12:30:00Z"
}
```

### 关键代码结构

```javascript
import { readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const DATA_DIR = join(root, 'data', 'reddit');

const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

// ... 实现分析逻辑
```

### 环境变量兼容

优先读取 `AI_API_KEY`，如果不存在则回退到 `OPENAI_API_KEY`（兼容文档中提到的 GitHub Secrets 命名）。

执行完这些步骤后，可以手动运行 `AI_API_KEY=xxx node scripts/analyze-reddit-posts.mjs` 来测试 AI 分析。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch 4：GitHub Actions 定时任务 + 项目配置

```
请你按照以下要求修改 GitHub Actions 和项目配置，确保定时任务正确触发。不要遗漏任何一步。

## 第一步：创建 /.github/workflows/reddit-radar.yml

新建文件，写入以下内容：

```yaml
name: Reddit Radar

on:
  schedule:
    - cron: "37 2,14 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  reddit-radar:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Fetch Reddit RSS
        run: node scripts/fetch-reddit-rss.mjs

      - name: Analyze new posts
        run: node scripts/analyze-reddit-posts.mjs
        env:
          AI_API_KEY: ${{ secrets.AI_API_KEY }}
          AI_BASE_URL: ${{ secrets.AI_BASE_URL }}
          AI_MODEL: ${{ secrets.AI_MODEL }}

      - name: Commit updated data
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add data/reddit/*.json
          git diff --cached --quiet || git commit -m "Update Reddit radar data [skip ci]"
          git push
```

注意：
- cron 使用 "37 2,14 * * *" 而不是整点 "0 2,14"，避免与其他定时任务同时触发（dev doc 建议使用非整点分钟）
- commit message 加 `[skip ci]` 避免触发 GitHub Pages 重复部署（因为 data 文件变化不需要重新构建页面）
- `AI_BASE_URL` 和 `AI_MODEL` 是可选的 secrets（未配置时脚本使用默认值），但 `AI_API_KEY` 必须配置

## 第二步：更新 /package.json

在 `package.json` 的 `scripts` 对象中添加以下脚本命令（不要覆盖已有的 scripts）：

```json
"radar:fetch": "node scripts/fetch-reddit-rss.mjs",
"radar:analyze": "node scripts/analyze-reddit-posts.mjs",
"radar:run": "node scripts/fetch-reddit-rss.mjs && node scripts/analyze-reddit-posts.mjs"
```

## 第三步：检查现有 GitHub Actions 工作流不会冲突

现有的 /.github/workflows/pages.yml 是部署工作流，Reddit Radar 工作流是独立的数据更新工作流，两者互不干扰。确认 radar 工作流 commit 时带了 `[skip ci]` 不会触发 pages 工作流即可。

## 第四步：验证 sync-public.mjs 已包含 data 目录

确认 /scripts/sync-public.mjs 中已有 `await cp(join(root, 'data'), join(publicDir, 'data'), { recursive: true });` 这行（来自 Batch 1）。如果没有则补上。

执行完这些步骤后，需要在 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置以下 Secrets：
- `AI_API_KEY`（必填）：AI API 密钥
- `AI_BASE_URL`（可选）：AI API 地址
- `AI_MODEL`（可选）：模型名称

系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch 5：Reddit Radar 前端页面

```
请你创建 Reddit Radar 前端页面。这是一个单文件自包含页面（内联 CSS + JS），风格应与项目现有的 /reddit-reply-assistant/index.html 和 admin.html 保持一致。

## 任务：创建 /reddit-radar/index.html

### 页面结构

URL 路径：`/reddit-radar/`

页面是一个运营后台风格的 Reddit 线索雷达工具。包含以下区域：

### 1. 顶部导航栏（topbar）
- 左侧：页面标题 "🔭 Reddit 线索雷达"
- 右侧：链接列表
  - "← 封面生成器" → `../index.html`
  - "🧠 回复助手" → `../reddit-reply-assistant/`
  - "📱 Instagram 图" → `../ins_reviewer_carousel/`

### 2. 统计栏（stats row）
显示4个统计卡片：
- 今日新增：今天 `fetchedAt` 的帖子数
- 高分线索：`totalScore >= 15` 的数量
- 适合回复：`recommendedAction === 'reply' || 'high_priority_reply'` 的数量
- 最近更新：显示最新 `analyzedAt` 时间（格式化为中文日期时间）

### 3. 筛选区（filter bar）
横向排列的筛选项：
- 关键词搜索输入框（搜索标题和内容）
- Subreddit 下拉选择（从数据中动态提取）
- 问题类型下拉：全部 | harsh_reviewer | writing_unclear | lack_of_novelty | english_editing | journal_selection | rr_anxiety | ai_writing | thesis_structure | other
- 推荐动作下拉：全部 | high_priority_reply | reply | save_topic | ignore
- 最低分数：0-20 的滑块或输入框（默认 6）
- 时间范围下拉：全部 | 今天 | 最近3天 | 最近7天
- 复选框："只看适合回复"、"只看可转选题"
- 排序方式下拉：按线索分↓ | 按发布时间↓ | 按抓取时间↓ | 按服务匹配度↓ | 按回复价值↓

### 4. 线索列表（main list area）
以卡片列表形式展示每条线索。每条卡片显示：

**卡片布局**（紧凑运营风格）：
- 左侧彩色标记条：根据 `recommendedAction` 显示不同颜色
  - `high_priority_reply`：红色 (#ED0108)
  - `reply`：蓝色 (#1f4b73)
  - `save_topic`：绿色 (#2d8a56)
  - `ignore`：灰色 (#b0a89e)
- 主内容区：
  - 第一行：帖子标题（可点击跳转原帖，target="_blank"）+ 线索分徽章（totalScore）
  - 第二行：Subreddit 标签 + 发布时间 + 来源关键词 + 问题类型标签
  - 第三行：AI 摘要（summary 字段，最多2行省略）
  - 第四行：操作按钮组
    - "生成回复" 按钮（仅 `reply` 和 `high_priority_reply` 显示），点击后写入 localStorage 并跳转到 `/reddit-reply-assistant/`
    - "保存为选题" 按钮（下拉选 Instagram / 小红书）
    - "查看详情" 按钮（展开详情面板）
    - "标记已读" 按钮
    - 原帖链接图标

### 5. 详情面板（detail panel）
点击"查看详情"后，在列表右侧或以下方抽屉形式展开，显示：
- 原帖标题、正文（完整）、链接
- AI 分析详情：
  - 帖子类型（postType，中文显示）
  - 痛点（painPoint）
  - 问题类型（problemType，中文显示）
  - 各维度评分（urgencyScore/serviceFitScore/replyWorthinessScore/riskScore，用进度条或星星展示）
  - 推荐回复角度（suggestedReplyAngle）
  - CTA 强度建议（ctaLevel）
  - 合规提醒（complianceNotes）
  - 小红书选题建议（xiaohongshuTopic）
  - Instagram 选题建议（instagramTopic）

### 6. 空状态和加载状态
- 数据加载中显示 spinner
- 无数据时显示空状态提示："暂无 Reddit 线索，请等待数据更新"
- 数据加载失败显示错误提示和重试按钮

### 技术实现细节

#### CSS 规范
- 使用 CSS 自定义属性（`:root` 变量），风格参考项目 admin.html 和 reddit-reply-assistant
- 配色：背景 `#f7f5f2`，卡片白色 `#fff`，边框 `#e8e4df`，文字 `#2d2a26`
- 字体：`"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif`
- 响应式：支持桌面端（>768px）和移动端（≤768px）
- 紧凑风格，低装饰，专业工具感

#### JavaScript 架构
- 不使用任何框架，纯 Vanilla JS
- 不使用 ES Modules（与 reddit-reply-assistant 保持一致，用普通 `<script>` 标签）
- 不使用 Supabase SDK（本页面只读 JSON 数据）
- 状态管理：纯对象 `STATE = { posts, analyses, filters, sort, detailPostId, statuses }`

#### 数据加载
- 页面加载时从 `../data/reddit/posts.json` 和 `../data/reddit/analysis.json` fetch
- 将 posts 和 analyses 按 `postId` 做 left join 合并
- 默认只显示 `totalScore >= 6` 的线索
- 默认按 `totalScore` 从高到低排序
- 显示最近 14 天数据

#### localStorage 状态
- 运营状态存储在 `localStorage` key `reddit_radar_statuses`：
  ```json
  {
    "reddit_abc123": { "status": "reviewed", "note": "", "updatedAt": "..." }
  }
  ```
- 选题存储在 `localStorage` key `reddit_radar_topics`

#### 与回复助手打通
点击"生成回复"时：
```javascript
localStorage.setItem('reddit_reply_prefill', JSON.stringify({
  title: post.title,
  content: post.content,
  subreddit: post.subreddit,
  problemType: analysis.problemType,
  userType: 'Unknown',
  field: 'General',
  tone: 'warm',
  replyGoal: 'build_trust',
  ctaLevel: analysis.ctaLevel,
  suggestedReplyAngle: analysis.suggestedReplyAngle,
  sourceUrl: post.url
}));
window.open('../reddit-reply-assistant/', '_blank');
```
注意：使用 `window.open` 新标签页打开，而非 `window.location.href` 跳转（方便运营人员对照原页面）。

#### 排序函数
```javascript
function sortPosts(posts, sortBy) {
  const sorters = {
    score: (a, b) => (b.totalScore || 0) - (a.totalScore || 0),
    published: (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
    fetched: (a, b) => new Date(b.fetchedAt) - new Date(a.fetchedAt),
    serviceFit: (a, b) => (b.serviceFitScore || 0) - (a.serviceFitScore || 0),
    replyWorth: (a, b) => (b.replyWorthinessScore || 0) - (a.replyWorthinessScore || 0)
  };
  return [...posts].sort(sorters[sortBy] || sorters.score);
}
```

### 问题类型中文映射
```javascript
const PROBLEM_TYPE_LABELS = {
  harsh_reviewer: '审稿严苛',
  writing_unclear: '写作不清晰',
  lack_of_novelty: '创新性不足',
  english_editing: '英文润色',
  journal_selection: '选刊投稿',
  rr_anxiety: '返修焦虑',
  ai_writing: 'AI写作',
  thesis_structure: '论文结构',
  other: '其他',
  irrelevant: '无关'
};
```

执行完这些步骤后，Reddit Radar 页面应完整可运行。可以直接访问 /reddit-radar/index.html 查看效果。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch 6：管理后台集成

```
请你按照以下要求修改管理后台，让管理员可以为 VIP 用户开通 Reddit Radar 页面权限。

## 第一步：修改 /admin.html

### 1. 在页面权限 chips 区域添加 Reddit Radar 的 chip

找到 admin.html 中渲染 page-access-chip 的代码（约第367-381行），在 `reddit_reply_assistant` chip 后面添加第三个 chip：

```html
<span class="page-access-chip ${pageAccess.includes('reddit_radar') ? 'granted' : ''}"
      data-userid="${u.id}" data-page="reddit_radar"
      onclick="event.stopPropagation();window._togglePageAccess(this)"
      title="Reddit 线索雷达">
  ${pageAccess.includes('reddit_radar') ? '✓' : '○'} 雷达
</span>
```

注意：三个 chip 应该都在同一个 `<div class="page-access-row">` 里面，确保布局一致。修改后完整的 pageChips 变量应该是：

```javascript
const pageChips = isVip ? `
    <div class="page-access-row">
      <span class="page-access-chip ${pageAccess.includes('ins_reviewer_carousel') ? 'granted' : ''}"
            data-userid="${u.id}" data-page="ins_reviewer_carousel"
            onclick="event.stopPropagation();window._togglePageAccess(this)"
            title="Instagram 学术内容图生成器">
        ${pageAccess.includes('ins_reviewer_carousel') ? '✓' : '○'} IG图
      </span>
      <span class="page-access-chip ${pageAccess.includes('reddit_reply_assistant') ? 'granted' : ''}"
            data-userid="${u.id}" data-page="reddit_reply_assistant"
            onclick="event.stopPropagation();window._togglePageAccess(this)"
            title="Reddit 评论回复助手">
        ${pageAccess.includes('reddit_reply_assistant') ? '✓' : '○'} Reddit
      </span>
      <span class="page-access-chip ${pageAccess.includes('reddit_radar') ? 'granted' : ''}"
            data-userid="${u.id}" data-page="reddit_radar"
            onclick="event.stopPropagation();window._togglePageAccess(this)"
            title="Reddit 线索雷达">
        ${pageAccess.includes('reddit_radar') ? '✓' : '○'} 雷达
      </span>
    </div>` : '<span style="font-size:10px;color:#8a8a8a;">—</span>';
```

### 2. 检查表格列宽自适应

表格 header 使用了 `grid-template-columns: 1fr 90px 110px 100px 130px 100px`，页面权限列宽度 130px 可以容纳 3 个 chip。如果移动端显示拥挤，不需要修改（已有响应式断点）。

## 第二步：确认 Edge Function 已更新

确认 /supabase/functions/admin-manage/index.ts 中的 `validPages` 数组已包含 `'reddit_radar'`（Batch 1 已完成）：

```typescript
const validPages = ['ins_reviewer_carousel', 'reddit_reply_assistant', 'reddit_radar'];
```

如果没有，请补上。

## 第三步：部署 Edge Function

如果需要更新 Supabase Edge Function，运行：
```bash
cd supabase && npx supabase functions deploy admin-manage
```

执行完这些步骤后，管理员可以在 admin.html 中为 VIP 用户点击"雷达" chip 来开通 Reddit 线索雷达的页面权限。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch 7：首页导航集成

```
请你修改首页，让拥有 Reddit Radar 权限的 VIP 用户在首页看到线索雷达的入口链接。

## 第一步：修改 /index.html 的 HTML 部分

找到工具链接栏（toolLinksBar）的 HTML 代码（约第550-553行），目前有两个链接。在 `linkRedditReply` 的 `<a>` 标签后面添加第三个链接：

```html
<a href="./reddit-radar/" id="linkRedditRadar" style="display:none">🔭 Reddit 线索雷达 <span class="tl-badge">NEW</span></a>
```

修改后完整的 toolLinksBar HTML 应为：

```html
<div class="tool-links-bar" id="toolLinksBar" style="display:none">
  <span class="tl-label">运营工具</span>
  <a href="./ins_reviewer_carousel/" id="linkInsCarousel" style="display:none">📱 Instagram 学术内容图生成器 <span class="tl-badge">NEW</span></a>
  <a href="./reddit-reply-assistant/" id="linkRedditReply" style="display:none">🧠 Reddit 评论回复助手 <span class="tl-badge">NEW</span></a>
  <a href="./reddit-radar/" id="linkRedditRadar" style="display:none">🔭 Reddit 线索雷达 <span class="tl-badge">NEW</span></a>
</div>
```

## 第二步：修改 /index.html 的 JavaScript 部分

找到 `renderAccountBar` 函数中控制工具链接显示的代码（约第919-929行）。当前代码：

```javascript
var toolBar = document.getElementById('toolLinksBar');
var linkIns = document.getElementById('linkInsCarousel');
var linkReddit = document.getElementById('linkRedditReply');
if (toolBar && linkIns && linkReddit) {
  var pageAccess = (AUTH_STATE.user && Array.isArray(AUTH_STATE.user.page_access)) ? AUTH_STATE.user.page_access : [];
  var hasIns = pageAccess.indexOf('ins_reviewer_carousel') !== -1;
  var hasReddit = pageAccess.indexOf('reddit_reply_assistant') !== -1;
  linkIns.style.display = hasIns ? '' : 'none';
  linkReddit.style.display = hasReddit ? '' : 'none';
  toolBar.style.display = (hasIns || hasReddit) ? '' : 'none';
}
```

修改为：

```javascript
var toolBar = document.getElementById('toolLinksBar');
var linkIns = document.getElementById('linkInsCarousel');
var linkReddit = document.getElementById('linkRedditReply');
var linkRadar = document.getElementById('linkRedditRadar');
if (toolBar && linkIns && linkReddit && linkRadar) {
  var pageAccess = (AUTH_STATE.user && Array.isArray(AUTH_STATE.user.page_access)) ? AUTH_STATE.user.page_access : [];
  var hasIns = pageAccess.indexOf('ins_reviewer_carousel') !== -1;
  var hasReddit = pageAccess.indexOf('reddit_reply_assistant') !== -1;
  var hasRadar = pageAccess.indexOf('reddit_radar') !== -1;
  linkIns.style.display = hasIns ? '' : 'none';
  linkReddit.style.display = hasReddit ? '' : 'none';
  linkRadar.style.display = hasRadar ? '' : 'none';
  toolBar.style.display = (hasIns || hasReddit || hasRadar) ? '' : 'none';
}
```

## 第三步：构建脚本确认

确认 /scripts/sync-public.mjs 中已包含以下两行（来自 Batch 1 和已有配置）：

```javascript
await cp(join(root, 'reddit-radar'), join(publicDir, 'reddit-radar'), { recursive: true });
await cp(join(root, 'data'), join(publicDir, 'data'), { recursive: true });
```

如果 `reddit-radar` 目录还没有被复制到 public，请在 sync-public.mjs 中 `reddit-reply-assistant` 行之后添加：
```javascript
await cp(join(root, 'reddit-radar'), join(publicDir, 'reddit-radar'), { recursive: true });
```

执行完这些步骤后，VIP 用户登录首页后，如果管理员已开通 Reddit Radar 权限，就能在运营工具栏看到 "🔭 Reddit 线索雷达" 的链接。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch 8：回复助手打通（localStorage 预填）

```
请你修改 Reddit 评论回复助手，使其能够读取 Reddit Radar 传入的预填数据。

## 第一步：修改 /reddit-reply-assistant/index.html

### 1. 找到页面初始化/加载的 JavaScript 代码

在 DOMContentLoaded 或页面初始化逻辑的末尾（在所有 DOM 引用和事件绑定完成之后），添加 localStorage 预填数据的读取逻辑：

```javascript
// ── Reddit Radar 预填集成 ──
(function checkRadarPrefill() {
  try {
    var prefillRaw = localStorage.getItem('reddit_reply_prefill');
    if (!prefillRaw) return;
    var prefill = JSON.parse(prefillRaw);
    localStorage.removeItem('reddit_reply_prefill');

    // 预填原帖内容
    if (prefill.content && typeof setSourceText === 'function') {
      setSourceText(prefill.content);
    } else {
      var sourceTextEl = document.getElementById('sourceText');
      if (sourceTextEl) sourceTextEl.value = prefill.content || '';
    }

    // 预填帖子标题
    if (prefill.title) {
      var postTitleEl = document.getElementById('postTitle');
      if (postTitleEl) postTitleEl.value = prefill.title;
    }

    // 预填 Subreddit
    if (prefill.subreddit) {
      var subredditEl = document.getElementById('subreddit');
      if (subredditEl) subredditEl.value = prefill.subreddit;
    }

    // 预填问题类型（通过触发 change 事件确保模板切换）
    if (prefill.problemType) {
      var problemEl = document.getElementById('problemType');
      if (problemEl) {
        problemEl.value = prefill.problemType;
        problemEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // 预填用户身份
    if (prefill.userType) {
      var userTypeEl = document.getElementById('userType');
      if (userTypeEl) userTypeEl.value = prefill.userType;
    }

    // 预填学科领域
    if (prefill.field) {
      var fieldEl = document.getElementById('field');
      if (fieldEl) fieldEl.value = prefill.field;
    }

    // 预填回复语气（通过 data-tone 属性查找对应的按钮并点击）
    if (prefill.tone) {
      var toneBtns = document.querySelectorAll('[data-tone]');
      toneBtns.forEach(function(btn) {
        if (btn.dataset.tone === prefill.tone) {
          btn.click();
        }
      });
    }

    // 预填回复目标
    if (prefill.replyGoal) {
      var replyGoalEl = document.getElementById('replyGoal');
      if (replyGoalEl) replyGoalEl.value = prefill.replyGoal;
    }

    // 预填 CTA 强度（通过 data-cta 属性查找对应的按钮并点击）
    if (prefill.ctaLevel) {
      var ctaBtns = document.querySelectorAll('[data-cta]');
      ctaBtns.forEach(function(btn) {
        if (btn.dataset.cta === prefill.ctaLevel) {
          btn.click();
        }
      });
    }

    // 显示预填提示
    console.log('[Reddit Radar] 已自动预填线索数据，来源：' + (prefill.sourceUrl || 'Radar'));
  } catch (e) {
    console.warn('[Reddit Radar] 预填失败：', e);
  }
})();
```

### 2. 注意事项
- 预填逻辑必须放在页面所有 DOM 元素和事件绑定初始化完成之后执行
- 如果 reddit-reply-assistant 使用的是不同的 DOM 元素 id，请根据实际 HTML 结构调整选择器
- 预填完成后立即 `localStorage.removeItem`，避免刷新页面时重复预填
- 所有操作包裹在 try-catch 中，即使预填失败也不影响回复助手的正常使用

### 3. 实际 DOM 选择器适配

由于回复助手页面已有的 DOM id 可能不同，你需要先阅读 reddit-reply-assistant/index.html 中实际的 DOM 元素 id，然后调整上述代码中的选择器。关键的 DOM 元素通常包括：
- 原帖内容输入框 → 查找 `<textarea>` 或 contenteditable 区域
- 帖子标题输入框 → 查找 title 相关 input
- 问题类型下拉 → 查找 problemType select
- 用户身份下拉 → 查找 userType select
- 语气选择按钮 → 查找 tone 相关的 radio/button

请根据实际情况适配选择器，确保预填功能正常工作。如果找不到某个元素则静默跳过（`if (el) el.value = ...` 已做防护）。

执行完这些步骤后，用户在 Reddit Radar 中点击"生成回复"按钮，会自动跳转到回复助手页面并预填所有相关字段。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## 批量执行完成后检查清单

全部 8 个 Batch 执行完毕后，请逐一确认以下事项：

| # | 检查项 | 验证方式 |
|---|--------|---------|
| 1 | `/data/reddit/` 目录下5个JSON文件存在且格式正确 | 直接查看文件 |
| 2 | `scripts/fetch-reddit-rss.mjs` 可执行 | `node scripts/fetch-reddit-rss.mjs` |
| 3 | `scripts/analyze-reddit-posts.mjs` 可执行 | `AI_API_KEY=sk-test node scripts/analyze-reddit-posts.mjs` |
| 4 | GitHub Actions reddit-radar.yml 配置正确 | 检查 `.github/workflows/` 目录 |
| 5 | `/reddit-radar/index.html` 页面可访问 | 浏览器打开 |
| 6 | admin.html 中有"雷达" page-access chip | 管理员登录查看 |
| 7 | 首页 toolLinksBar 中有 Reddit Radar 链接 | VIP 用户登录后查看 |
| 8 | 回复助手能读取 radar 预填数据 | 从 radar 点击"生成回复"测试 |
| 9 | sync-public.mjs 包含 data/ 和 reddit-radar/ 复制 | 检查脚本内容 |
| 10 | admin-manage Edge Function validPages 包含 reddit_radar | 检查源码 |

---

## 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1 | 2026-07-04 | 初版，8个批次覆盖完整 MVP 开发 |
