# Reddit Radar 线索雷达开发文档（方案 A：GitHub Pages + GitHub Actions）

## 1. 项目定位

本项目是在现有网站中新增一个 Reddit 线索雷达页面，用于自动抓取 Reddit 公开 RSS 数据，筛选与论文辅导、SCI/CCF 写作、审稿回复、英文润色、投稿策略相关的帖子，并通过 AI 分析生成结构化线索。

本项目不开发自动评论、自动私信、批量发帖、飞书推送等功能。

现有 Reddit 评论回复助手已经负责生成评论草稿，因此本项目只做“上游发现与筛选”。

## 2. 与现有工具的关系

现有页面：

```text
/reddit-reply-assistant/
```

已有能力：

```text
输入 Reddit 原评论/帖子
选择问题类型
选择用户身份
选择学科领域
选择回复语气
选择回复目标
选择 CTA 强度
生成 Short / Helpful / Deep 三种回复
复制回复
风险提示
CTA 钩子库
```

新增页面：

```text
/reddit-radar/
```

新增页面只负责：

```text
抓取 Reddit RSS
去重
AI 分析
线索评分
列表展示
筛选排序
保存为内容选题
跳转到现有回复助手生成回复
```

不要重复开发：

```text
Short / Helpful / Deep 回复生成
CTA 钩子库
回复语气选择
局部重写
复制回复
评论风险重写
```

## 3. 一句话产品目标

```text
每天自动发现 Reddit 上和论文写作、审稿返修、选刊投稿、英文润色相关的高价值帖子，并把适合互动的线索送到现有 Reddit 回复助手中生成评论草稿。
```

## 4. 推荐页面路径

```text
/reddit-radar/
```

导航中建议形成运营工具组：

```text
小红书封面生成器
Instagram 学术内容图生成器
Reddit 评论回复助手
Reddit 线索雷达
```

## 5. 技术方案

采用轻量静态方案。

```text
前端：GitHub Pages 静态网页
定时任务：GitHub Actions
数据源：Reddit RSS
数据存储：仓库内 JSON 文件
AI 分析：GitHub Actions 中调用 AI API
展示方式：前端读取 JSON 并渲染
```

不使用：

```text
飞书推送
飞书多维表格
后端数据库
自动评论
自动私信
```

## 6. 整体数据流

```text
sources.json 配置关键词和 subreddit
→ GitHub Actions 定时运行 fetch 脚本
→ 抓取 Reddit RSS
→ 解析帖子
→ 根据 URL / Reddit ID 去重
→ 写入 posts.json
→ GitHub Actions 调用 AI 分析新帖子
→ 写入 analysis.json
→ GitHub Pages 展示 /reddit-radar/
→ 运营人员筛选高分线索
→ 点击“生成回复”
→ 跳转到 /reddit-reply-assistant/ 并自动预填内容
```

## 7. 文件结构建议

```text
/reddit-radar/
  index.html
  reddit-radar.css
  reddit-radar.js

/reddit-reply-assistant/
  index.html
  existing files...

/data/reddit/
  sources.json
  posts.json
  analysis.json
  topics.json
  fetch-log.json

/scripts/
  fetch-reddit-rss.mjs
  analyze-reddit-posts.mjs
  merge-reddit-data.mjs

/.github/workflows/
  reddit-radar.yml
```

如果现有项目是单文件结构，也可以把 CSS/JS 内联到 `/reddit-radar/index.html`，但长期建议拆分。

## 8. 数据源配置

文件：

```text
/data/reddit/sources.json
```

示例结构：

```json
[
  {
    "id": "phd-lack-of-novelty",
    "enabled": true,
    "type": "subreddit_search",
    "subreddit": "PhD",
    "keyword": "lack of novelty",
    "priority": 5,
    "rssUrl": "https://www.reddit.com/r/PhD/search.rss?q=lack%20of%20novelty&restrict_sr=1&sort=new"
  },
  {
    "id": "global-reviewer-comments",
    "enabled": true,
    "type": "global_search",
    "subreddit": "",
    "keyword": "reviewer comments",
    "priority": 4,
    "rssUrl": "https://www.reddit.com/search.rss?q=reviewer%20comments&sort=new"
  },
  {
    "id": "askacademia-new",
    "enabled": true,
    "type": "subreddit_new",
    "subreddit": "AskAcademia",
    "keyword": "",
    "priority": 3,
    "rssUrl": "https://www.reddit.com/r/AskAcademia/new.rss"
  }
]
```

## 9. 第一批关键词

### 9.1 审稿返修

```text
revise and resubmit
reviewer comments
response to reviewers
harsh reviewer
major revision
minor revision
lack of novelty
insufficient discussion
contribution is unclear
method is unclear
```

### 9.2 论文被拒

```text
paper rejected
manuscript rejected
journal rejection
desk reject
rejected for novelty
```

### 9.3 写作问题

```text
academic writing unclear
advisor says my writing is unclear
supervisor says rewrite
PhD writing help
ESL academic writing
scientific writing help
paper structure
introduction section
discussion section
```

### 9.4 选刊投稿

```text
choose a journal
journal selection
impact factor
predatory journal
where should I submit
journal scope
```

### 9.5 英文润色

```text
English editing service
manuscript editing
academic editing service
native speaker editing
language editing
```

### 9.6 AI 写作

```text
AI polished my paper
ChatGPT academic writing
paper sounds like AI
AI generated writing
AI writing detector
```

## 10. 第一批 Subreddit

```text
r/PhD
r/GradSchool
r/AskAcademia
r/academia
r/AcademicWriting
r/InternationalStudents
r/scientificwriting
r/gradadmissions
r/MachineLearning
r/bioinformatics
r/statistics
```

建议第一版先配置 20-40 个 RSS 源，不要一开始过多，避免 RSS 限流和噪音过大。

## 11. RSS 抓取脚本

文件：

```text
/scripts/fetch-reddit-rss.mjs
```

职责：

```text
读取 sources.json
过滤 enabled=true 的源
逐个请求 RSS URL
解析 XML
提取 title / content / link / publishedAt / subreddit / sourceKeyword
生成稳定 post id
根据 url 或 reddit id 去重
合并到 posts.json
记录 fetch-log.json
```

抓取频率建议：

```text
每天 1-2 次
```

不要高频抓取，避免 RSS 限流。

建议请求头：

```text
User-Agent: academic-reddit-radar/1.0 by yourdomain
Accept: application/rss+xml, application/xml, text/xml
```

## 12. 帖子数据结构

文件：

```text
/data/reddit/posts.json
```

示例：

```json
[
  {
    "id": "reddit_abc123",
    "redditId": "abc123",
    "title": "Paper rejected for lack of novelty",
    "content": "My paper was rejected because the reviewer said it lacks novelty...",
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
]
```

## 13. 去重规则

优先级：

```text
1. Reddit post id
2. 原始 URL
3. contentHash = hash(title + url)
```

同一个帖子被多个关键词抓到时：

```text
保留一条主记录
sourceKeyword 可合并为数组
sourceId 可合并为数组
priority 取最高
```

可选结构：

```json
"sourceKeywords": ["lack of novelty", "paper rejected"]
```

## 14. AI 分析脚本

文件：

```text
/scripts/analyze-reddit-posts.mjs
```

职责：

```text
读取 posts.json
读取 analysis.json
找出还没有分析的新帖子
调用 AI API
输出结构化 JSON
写回 analysis.json
```

为了控制成本：

```text
每次最多分析 20-50 条新帖
只分析标题或内容包含关键词的帖子
内容过长时截断到 3000-5000 字符
已经分析过的帖子不重复分析
```

## 15. AI 分析 Prompt

建议系统 Prompt：

```text
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

用户 Prompt 模板：

```text
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

## 16. 评分规则

建议总分 0-20。

```text
urgencyScore：需求紧急程度，1-5
serviceFitScore：和机构服务匹配度，1-5
replyWorthinessScore：是否适合公开回复，1-5
riskScore：营销/合规/社区风险，1-5
```

计算：

```text
totalScore = urgencyScore + serviceFitScore + replyWorthinessScore + sourcePriority - riskScore
```

其中：

```text
sourcePriority = 1-5
```

建议动作：

```text
0-5：ignore
6-9：save_topic
10-14：reply
15+：high_priority_reply
```

## 17. 分析数据结构

文件：

```text
/data/reddit/analysis.json
```

示例：

```json
[
  {
    "postId": "reddit_abc123",
    "postType": "user_need",
    "painPoint": "The user is confused by a reviewer comment about lack of novelty.",
    "problemType": "lack_of_novelty",
    "urgencyScore": 4,
    "serviceFitScore": 5,
    "replyWorthinessScore": 4,
    "riskScore": 1,
    "totalScore": 16,
    "recommendedAction": "high_priority_reply",
    "suggestedReplyAngle": "Explain that lack of novelty is usually a positioning problem, not only an English polishing issue.",
    "ctaLevel": "soft",
    "summary": "A PhD student needs help interpreting and responding to a lack-of-novelty rejection.",
    "xiaohongshuTopic": "审稿人说创新性不足，到底该怎么改？",
    "instagramTopic": "Reviewer says lack of novelty? Don't just polish English.",
    "complianceNotes": "Safe to reply with advice and a low-pressure checklist CTA.",
    "analyzedAt": "2026-07-04T12:30:00Z"
  }
]
```

## 18. 内容选题数据结构

文件：

```text
/data/reddit/topics.json
```

用途：

运营人员把 Reddit 线索保存为小红书/Instagram 选题。

示例：

```json
[
  {
    "id": "topic_001",
    "sourcePostId": "reddit_abc123",
    "platform": ["instagram", "xiaohongshu"],
    "title": "Reviewer says lack of novelty? Don't just polish English.",
    "painPoint": "lack_of_novelty",
    "suggestedFormat": "Instagram Carousel",
    "priority": 5,
    "status": "new",
    "createdAt": "2026-07-04T12:40:00Z"
  }
]
```

MVP 可以先在前端用 `localStorage` 保存选题，不一定要写回仓库。

## 19. GitHub Actions 定时任务

文件：

```text
/.github/workflows/reddit-radar.yml
```

建议频率：

```text
每天 2 次
```

示例：

```yaml
name: Reddit Radar

on:
  schedule:
    - cron: "0 2,14 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  reddit-radar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm install

      - run: node scripts/fetch-reddit-rss.mjs

      - run: node scripts/analyze-reddit-posts.mjs
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Commit updated data
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git add data/reddit/*.json
          git commit -m "Update Reddit radar data" || echo "No changes"
          git push
```

如果项目没有 `package.json`，可新增。

## 20. 环境变量

在 GitHub Secrets 中配置：

```text
OPENAI_API_KEY
```

如使用其他模型服务，可改成：

```text
AI_API_KEY
AI_BASE_URL
AI_MODEL
```

## 21. Reddit Radar 页面功能

页面路径：

```text
/reddit-radar/
```

### 21.1 顶部统计

显示：

```text
今日新增
高分线索
适合回复
可转内容选题
最近更新时间
```

### 21.2 筛选区

筛选项：

```text
关键词搜索
Subreddit
问题类型
推荐动作
CTA 强度
最低分数
时间范围
只看今日新增
只看适合回复
只看可转内容选题
```

### 21.3 线索列表

每条卡片显示：

```text
标题
Subreddit
发布时间
来源关键词
问题类型
痛点摘要
线索分
推荐动作
CTA 建议
原帖链接
生成回复按钮
保存为选题按钮
```

### 21.4 排序

支持：

```text
按线索分排序
按发布时间排序
按抓取时间排序
按服务匹配度排序
按回复价值排序
```

### 21.5 详情抽屉或详情页

点击线索后显示：

```text
原帖标题
原帖正文
原帖链接
AI 摘要
痛点分析
推荐回复角度
CTA 强度建议
合规提醒
小红书选题建议
Instagram 选题建议
```

## 22. 与现有回复助手打通

推荐使用 `localStorage` 传参，避免 URL 过长。

### 22.1 Radar 页面写入

当用户点击“生成回复”：

```js
localStorage.setItem("reddit_reply_prefill", JSON.stringify({
  title: post.title,
  content: post.content,
  subreddit: post.subreddit,
  problemType: analysis.problemType,
  userType: "Unknown",
  field: "General",
  tone: "warm",
  replyGoal: "build_trust",
  ctaLevel: analysis.ctaLevel,
  suggestedReplyAngle: analysis.suggestedReplyAngle,
  sourceUrl: post.url
}));

window.location.href = "../reddit-reply-assistant/";
```

### 22.2 Reply Assistant 页面读取

现有回复助手加载时增加：

```js
const prefillRaw = localStorage.getItem("reddit_reply_prefill");
if (prefillRaw) {
  const prefill = JSON.parse(prefillRaw);
  // 将 prefill 填入现有表单
  localStorage.removeItem("reddit_reply_prefill");
}
```

如果现有回复助手暂时不方便改，MVP 可先在 Radar 页面提供“复制原帖内容”按钮。

## 23. 页面 UI 建议

页面风格应偏运营后台，而不是营销页面。

关键词：

```text
紧凑
清晰
可筛选
可批量浏览
低装饰
专业工具感
```

布局：

```text
顶部：标题 + 最近更新时间 + 手动刷新提示
统计栏：今日新增 / 高分 / 可回复 / 可转选题
筛选栏：横向或左侧
主区：线索卡片列表
右侧或抽屉：详情与操作
```

卡片颜色建议：

```text
high_priority_reply：红色或橙色标签
reply：蓝色标签
save_topic：绿色标签
ignore：灰色标签
```

## 24. 状态管理

因为方案 A 不使用数据库，MVP 的运营状态可以先存在浏览器 `localStorage`。

状态：

```text
new
reviewed
reply_ready
replied
saved_topic
ignored
```

本地结构：

```json
{
  "reddit_abc123": {
    "status": "reply_ready",
    "note": "适合生成 lack_of_novelty 回复",
    "updatedAt": "2026-07-04T13:00:00Z"
  }
}
```

注意：

```text
localStorage 只适合单人使用。
如果后续多人协作，应升级到 Supabase 或其他数据库。
```

## 25. 手动刷新机制

GitHub Pages 前端不能直接运行抓取任务。

MVP 的刷新方式：

```text
GitHub Actions 定时刷新
GitHub Actions workflow_dispatch 手动触发
```

页面上可以显示：

```text
最近更新时间：2026-07-04 20:00
数据由 GitHub Actions 自动更新
```

可选：放一个“如何手动刷新”的说明链接。

## 26. 错误处理

### 26.1 RSS 抓取失败

记录到：

```text
/data/reddit/fetch-log.json
```

字段：

```text
sourceId
rssUrl
status
errorMessage
fetchedAt
```

页面可显示：

```text
部分数据源抓取失败
```

### 26.2 AI 分析失败

处理：

```text
保留帖子
analysis 状态标记为 failed
下次任务重试
```

### 26.3 JSON 损坏

脚本写文件前：

```text
先写临时文件
校验 JSON.parse 成功
再覆盖正式文件
```

## 27. 合规与平台边界

本工具只做：

```text
公开 RSS 低频监控
人工查看
人工发布回复
人工决定是否私信
```

不做：

```text
自动评论
自动私信
自动点赞
自动顶帖
批量账号轮换
绕过 Reddit 限制
抓取隐私数据
高频请求
```

内容合规边界：

```text
不提供代写
不承诺发表
不承诺录用
不伪造数据
不替用户完成学术任务
```

推荐表达：

```text
academic writing coaching
manuscript editing
reviewer response support
journal submission strategy
research communication coaching
manuscript diagnosis
```

避免表达：

```text
ghostwriting
guaranteed acceptance
we write your paper
publish it for you
contract cheating
```

## 28. MVP 开发顺序

### Step 1：创建数据目录

新增：

```text
/data/reddit/sources.json
/data/reddit/posts.json
/data/reddit/analysis.json
/data/reddit/fetch-log.json
```

### Step 2：配置第一批 RSS 源

先配置：

```text
10 个 subreddit new RSS
20 个关键词 search RSS
```

总量控制在 30 个源左右。

### Step 3：开发 RSS 抓取脚本

实现：

```text
读取 sources
抓取 RSS
解析 XML
去重
写 posts.json
写 fetch-log.json
```

### Step 4：开发 AI 分析脚本

实现：

```text
读取 posts
跳过已分析帖子
调用 AI
写 analysis.json
失败重试或标记 failed
```

### Step 5：配置 GitHub Actions

实现：

```text
定时运行
手动触发
自动 commit JSON 数据
```

### Step 6：开发 Reddit Radar 页面

实现：

```text
读取 posts.json 和 analysis.json
合并数据
展示统计
展示列表
筛选排序
详情抽屉
打开原帖
```

### Step 7：打通回复助手

实现：

```text
Radar 点击“生成回复”
写入 localStorage
跳转到 /reddit-reply-assistant/
回复助手自动预填
```

### Step 8：保存选题

MVP 用 localStorage：

```text
保存为 Instagram 选题
保存为小红书选题
```

后续再考虑写入 JSON 或数据库。

## 29. P0 / P1 / P2 范围

### P0：最小可用版

```text
RSS 抓取
JSON 去重入库
AI 分析
Reddit Radar 列表展示
按分数排序
打开原帖
生成回复按钮跳转到现有回复助手
```

### P1：运营可用版

```text
筛选器
详情抽屉
状态标记
保存为选题
统计栏
fetch-log 展示
回复助手自动预填
```

### P2：增强版

```text
多源优先级管理
本地选题库
导出 CSV
手动导入 Reddit 链接分析
高频痛点统计
和 Instagram Carousel 生成器联动
```

## 30. 后续升级方向

当方案 A 跑通后，如果数据量或多人协作需求增加，可以升级为：

```text
Supabase 数据库
登录权限
团队状态同步
评论发布记录
内容选题库
趋势统计图表
```

但第一版不建议直接上数据库，先用 GitHub Actions + JSON 验证价值。

## 31. 验收标准

### 31.1 数据验收

```text
每天能抓取 Reddit RSS
重复帖子不会重复展示
帖子能保留标题、正文、链接、subreddit、发布时间
失败源能记录日志
```

### 31.2 AI 验收

```text
能正确判断帖子类型
能输出痛点标签
能给出问题类型
能给出线索分
能给出建议动作
不会强行编造私域钩子
不会输出代写或包发表导向
```

### 31.3 页面验收

```text
能显示线索列表
能按分数排序
能筛选问题类型
能打开原帖
能查看 AI 分析
能点击生成回复并跳转现有回复助手
```

### 31.4 运营验收

```text
运营人员每天 5 分钟内能看到高价值 Reddit 线索
能快速判断哪些帖子值得回复
能一键带入回复助手生成草稿
能把高频痛点保存为内容选题
```

## 32. 第一版建议配置

第一版建议：

```text
RSS 源：30 个以内
每日运行：2 次
每次最多新增分析：30 条
展示最近：14 天数据
默认只显示 totalScore >= 6
默认排序：totalScore 从高到低
```

默认推荐动作：

```text
15+：高优先级回复
10-14：可回复
6-9：保存为内容选题
0-5：默认隐藏
```

## 33. 核心判断

这套方案与现有 Reddit 评论回复助手不冲突。

最终分工：

```text
Reddit Radar：发现问题、筛选问题、判断价值
Reddit Reply Assistant：回答问题、生成评论、控制 CTA
Instagram Generator：把高频问题转成 Ins Carousel
小红书封面生成器：把中文内容包装成小红书封面
```

最高效的开发原则：

```text
新增 Radar，不重做 Reply Assistant。
用 localStorage 打通两个页面。
先用 JSON 跑通数据闭环。
后续有多人协作需求再升级数据库。
```
