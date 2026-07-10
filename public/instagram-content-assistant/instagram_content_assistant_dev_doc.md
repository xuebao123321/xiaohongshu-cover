# Instagram 内容策划助手开发文档

## 1. 项目背景

现有网站已经包含或规划包含以下运营工具：

```text
小红书封面生成器
Reddit 评论回复助手
Reddit Radar 线索雷达
Instagram Carousel 图片生成器
```

本项目新增一个二级页面：

```text
Instagram 内容策划助手
```

该页面负责接入 DeepSeek API，根据用户输入的痛点、Reddit 帖子、审稿意见、学生咨询记录等素材，自动生成适合 Instagram 发布的内容包。

内容包包括：

```text
Carousel 7 页图文文案
Reels 口播脚本
Reels 分镜
Caption
Hashtag
DM 钩子
Story 问答
```

注意：本工具负责生成“内容策划与文案”，不在 MVP 中直接生成图片或视频。图片生成由 Instagram Carousel 图片生成器完成；视频生成作为后续独立增强模块。

## 2. 页面路径

建议路径：

```text
/instagram-content-assistant/
```

中文名：

```text
Instagram 内容策划助手
```

英文名：

```text
Instagram Content Assistant
```

一句话定位：

```text
面向学术服务机构的 Instagram 内容生成工具，把 Reddit 痛点、审稿意见、论文写作问题转成 Carousel 文案、Reels 脚本和私信转化钩子。
```

## 3. 产品边界

### 3.1 本项目负责

```text
根据输入素材生成 Instagram 内容选题
生成 Carousel 结构化文案
生成 Reels 口播脚本
生成 Reels 分镜与屏幕文字
生成 Caption
生成 Hashtag
生成 Story 问答
生成 DM 钩子
合规表达检查
把 Carousel 文案传给 Instagram Carousel 图片生成器
```

### 3.2 本项目不负责

```text
Instagram 自动发布
Instagram 自动私信
Instagram 自动评论
批量刷号
直接生成真人视频
第一版直接生成 MP4
代写、包发表、保证录用等违规内容
```

### 3.3 和其他工具的关系

```text
Reddit Radar：发现高价值痛点
Instagram 内容策划助手：把痛点生成内容包
Instagram Carousel 图片生成器：把 Carousel 文案生成图片
Reddit 评论回复助手：把 Reddit 帖子生成评论回复
小红书封面生成器：做中文平台封面包装
```

## 4. 推荐技术架构

由于当前网站部署在 GitHub Pages，前端不能直接暴露 DeepSeek API Key。

推荐架构：

```text
GitHub Pages 前端
→ Cloudflare Workers API Proxy
→ DeepSeek API
→ 返回结构化 JSON
→ 前端展示内容包
→ localStorage 传给下游工具
```

### 4.1 为什么需要 API Proxy

不能在前端直接调用 DeepSeek API，原因：

```text
API Key 会暴露
无法统一做限流
无法统一切换模型
无法做日志和错误处理
无法做合规兜底
```

### 4.2 推荐后端代理

优先推荐：

```text
Cloudflare Workers
```

备选：

```text
Vercel Serverless Function
Netlify Function
Railway / Render 小后端
```

## 5. 模型适配层设计

当前使用 DeepSeek API，但开发时不要写死 DeepSeek。

需要抽象成 provider 配置。

示例：

```json
{
  "provider": "deepseek",
  "baseUrl": "https://api.deepseek.com",
  "model": "deepseek-chat",
  "apiKeyEnv": "DEEPSEEK_API_KEY"
}
```

后期可切换为：

```json
{
  "provider": "openai",
  "baseUrl": "https://api.openai.com/v1",
  "model": "gpt-4.1-mini",
  "apiKeyEnv": "OPENAI_API_KEY"
}
```

或：

```json
{
  "provider": "siliconflow",
  "baseUrl": "https://api.siliconflow.cn/v1",
  "model": "deepseek-ai/DeepSeek-V3",
  "apiKeyEnv": "SILICONFLOW_API_KEY"
}
```

### 5.1 Worker 环境变量

Cloudflare Worker Secrets：

```text
DEEPSEEK_API_KEY
MODEL_PROVIDER
MODEL_BASE_URL
MODEL_NAME
```

默认：

```text
MODEL_PROVIDER=deepseek
MODEL_BASE_URL=https://api.deepseek.com
MODEL_NAME=deepseek-chat
```

## 6. 页面信息架构

页面采用运营工具布局。

```text
┌──────────────────────────────────────────────┐
│ 顶部导航 / Instagram 内容策划助手             │
├───────────────────────┬──────────────────────┤
│ 左侧输入与策略区       │ 右侧生成结果区         │
│                       │                      │
│ 输入素材               │ Carousel 文案          │
│ 内容目标               │ Reels 脚本             │
│ 目标人群               │ Caption                │
│ 痛点类型               │ Hashtags               │
│ 内容形式               │ Story                  │
│ 语气                   │ DM 钩子                │
│ CTA 强度               │ 合规提示               │
│ 生成按钮               │ 下游操作按钮            │
├───────────────────────┴──────────────────────┤
│ 历史记录 / 常用选题 / 模板库 / 合规词库         │
└──────────────────────────────────────────────┘
```

## 7. 用户流程

### 7.1 从空白生成

```text
输入一句痛点
→ 选择目标人群
→ 选择内容目标
→ 选择内容形式
→ 点击生成
→ 得到 Carousel + Reels + Caption + Hashtag
→ 发送到 Carousel 图片生成器
```

### 7.2 从 Reddit Radar 带入

```text
Reddit Radar 高分线索
→ 点击“生成 Instagram 内容”
→ 进入 Instagram 内容策划助手
→ 自动预填标题、正文、痛点类型、人群、CTA 强度
→ 生成内容包
```

### 7.3 从审稿意见生成

```text
粘贴 reviewer comment
→ 选择 painPoint = reviewer_response
→ 生成 Reviewer Says 系列内容
```

## 8. 输入字段

### 8.1 核心字段

```text
sourceType：输入素材类型
sourceText：输入素材正文
audience：目标人群
goal：内容目标
painPoint：痛点类型
formats：生成形式
tone：语气
ctaLevel：CTA 强度
languageMode：语言模式
```

### 8.2 输入素材类型

```text
topic：一句选题
reddit_post：Reddit 帖子
reviewer_comment：审稿意见
student_consultation：学生咨询记录
weak_sentence：论文弱句
analysis_result：AI 分析结果
```

### 8.3 目标人群

```text
Chinese PhD
ESL researcher
Master student
Medical student
CS student
Engineering PhD
Bioinformatics researcher
General academic audience
```

### 8.4 内容目标

```text
reach：涨粉 / 触达
save：收藏
dm：私信
diagnosis：引导免费诊断
trust：建立专业度
education：教育用户
```

### 8.5 痛点类型

```text
reviewer_response
lack_of_novelty
writing_unclear
journal_selection
ai_polishing
english_editing
method_unclear
discussion_weak
cover_letter
introduction_structure
```

### 8.6 内容形式

```text
carousel
reels
caption
hashtags
story
dm_hook
all
```

### 8.7 语气

```text
professional
warm
direct
slightly_bold
educational
expert
casual
```

### 8.8 CTA 强度

```text
none：不放 CTA
soft：轻钩子
medium：引导评论或私信关键词
direct：明确邀请咨询
```

默认：

```text
soft
```

## 9. API 设计

### 9.1 生成完整内容包

接口：

```text
POST /api/generate-instagram-content
```

请求：

```json
{
  "sourceType": "reddit_post",
  "sourceText": "My paper was rejected because the reviewer said it lacks novelty.",
  "audience": "Chinese PhD",
  "goal": "dm",
  "painPoint": "lack_of_novelty",
  "formats": ["carousel", "reels", "caption", "hashtags", "story", "dm_hook"],
  "tone": "professional",
  "ctaLevel": "soft",
  "languageMode": "bilingual",
  "brandRule": {
    "noGhostwriting": true,
    "noGuaranteedAcceptance": true,
    "noFakeData": true,
    "noDoWorkForUser": true
  }
}
```

响应：

```json
{
  "topic": "Reviewer says lack of novelty?",
  "angle": "Don’t treat novelty as an English polishing problem.",
  "contentPillar": "Reviewer Says",
  "carousel": {
    "template": "reviewer-response",
    "style": "academic-paper",
    "slides": []
  },
  "reels": {
    "duration": 35,
    "hook": "",
    "script": "",
    "onScreenText": [],
    "shotList": [],
    "caption": "",
    "cta": ""
  },
  "caption": "",
  "hashtags": [],
  "story": [],
  "dmHook": "",
  "complianceNotes": [],
  "riskFlags": []
}
```

### 9.2 改写内容

接口：

```text
POST /api/rewrite-instagram-content
```

用途：

```text
更短
更专业
更自然
更适合 Chinese PhD
降低营销感
增强 CTA
移除 CTA
```

请求：

```json
{
  "contentType": "reels_script",
  "content": "Most students treat this as an English problem...",
  "rewriteGoal": "make_more_natural",
  "tone": "warm"
}
```

### 9.3 生成 Reels 分镜

接口：

```text
POST /api/generate-reels-video-plan
```

用途：

```text
根据 Reels 脚本生成 scenes.json
后续可供视频生成器使用
```

响应示例：

```json
{
  "video": {
    "size": "1080x1920",
    "duration": 35,
    "template": "paper-annotation",
    "scenes": [
      {
        "index": 1,
        "duration": 3,
        "type": "hook",
        "text": "Reviewer says “lack of novelty”?",
        "visual": "reviewer-comment-card",
        "voiceover": "If your reviewer says lack of novelty, don't reply like this."
      }
    ]
  }
}
```

### 9.4 后期视频生成接口

后期接口，不属于 MVP：

```text
POST /api/generate-reels-video
```

用途：

```text
根据 scenes.json 生成 MP4
```

## 10. 输出数据结构

### 10.1 Carousel 输出

固定 7 页，便于直接传给图片生成器。

```json
{
  "template": "reviewer-response",
  "style": "academic-paper",
  "slides": [
    {
      "slide": 1,
      "role": "hook",
      "title": "Reviewer says “lack of novelty”?",
      "subtitle": "Don’t just polish the English.",
      "body": ""
    },
    {
      "slide": 2,
      "role": "common_mistake",
      "title": "Common mistake",
      "body": "Many students only add one sentence saying the study is novel."
    },
    {
      "slide": 3,
      "role": "diagnosis",
      "title": "The real issue",
      "body": "The paper may not be positioned clearly against prior work."
    },
    {
      "slide": 4,
      "role": "framework",
      "title": "Use this framework",
      "body": "Prior work → gap → contribution."
    },
    {
      "slide": 5,
      "role": "example",
      "title": "Better sentence",
      "body": "Unlike prior studies that focus on X, this study examines Y under Z conditions."
    },
    {
      "slide": 6,
      "role": "checklist",
      "title": "Before revising",
      "body": "Check whether the comment is about novelty, method, data, or writing."
    },
    {
      "slide": 7,
      "role": "cta",
      "title": "Save this",
      "body": "DM “REVIEWER” for the checklist."
    }
  ]
}
```

### 10.2 Reels 输出

```json
{
  "duration": 35,
  "title": "Reviewer says “lack of novelty”? Don’t reply like this.",
  "hook": "If your reviewer says lack of novelty, don’t just add “this study is novel.”",
  "script": "Most students treat this as an English problem...",
  "timeline": [
    {
      "time": "0-2s",
      "purpose": "hook",
      "voiceover": "If your reviewer says lack of novelty, don’t reply like this.",
      "onScreenText": "Reviewer says “lack of novelty”?"
    },
    {
      "time": "3-8s",
      "purpose": "pain",
      "voiceover": "Most students treat this as an English problem. It usually isn’t.",
      "onScreenText": "Not just an English problem"
    }
  ],
  "onScreenText": [],
  "shotList": [],
  "brollIdeas": [],
  "cta": "DM “REVIEWER” for the checklist."
}
```

### 10.3 Caption 输出

```json
{
  "caption": "Reviewer response tip for SCI papers:\n\nIf your reviewer says “lack of novelty”, don’t just polish the English...",
  "firstLine": "Reviewer response tip for SCI papers:",
  "cta": "DM “REVIEWER” for the checklist."
}
```

### 10.4 Hashtag 输出

```json
{
  "hashtags": [
    "#AcademicWriting",
    "#PhDLife",
    "#ReviewerComments",
    "#ScientificWriting",
    "#ManuscriptEditing"
  ]
}
```

### 10.5 Story 输出

```json
{
  "story": [
    {
      "type": "poll",
      "text": "What is harder for you right now?",
      "options": ["Understanding reviewers", "Rewriting the paper"]
    },
    {
      "type": "question",
      "text": "Paste one reviewer comment you don’t know how to answer."
    }
  ]
}
```

## 11. Prompt 设计

### 11.1 System Prompt

```text
You are an Instagram content strategist for a compliant academic writing coaching service.

The service helps ESL and Chinese researchers with:
- academic writing coaching
- manuscript editing
- reviewer response support
- journal submission strategy
- research communication coaching

The service does NOT provide:
- ghostwriting
- guaranteed acceptance
- fake data
- doing assignments or papers for users
- contract cheating

Create Instagram-ready content that sounds like a professional academic writing coach, not a salesy agency.

Rules:
1. Always provide real educational value before any CTA.
2. Use a low-pressure CTA unless the user explicitly asks for services.
3. Avoid claims like guaranteed publication or acceptance.
4. Make the content useful for Chinese / ESL researchers.
5. Prefer clear frameworks, examples, and checklists.
6. Output valid JSON only.
```

### 11.2 User Prompt 模板

```text
Create an Instagram content package based on the following input.

Source type: {{sourceType}}
Audience: {{audience}}
Goal: {{goal}}
Pain point: {{painPoint}}
Formats: {{formats}}
Tone: {{tone}}
CTA level: {{ctaLevel}}
Language mode: {{languageMode}}

Source text:
{{sourceText}}

Return JSON with:
- topic
- angle
- contentPillar
- carousel
- reels
- caption
- hashtags
- story
- dmHook
- complianceNotes
- riskFlags

Carousel must have exactly 7 slides:
1. Hook
2. Common mistake
3. Diagnosis
4. Framework
5. Example
6. Checklist
7. CTA

Reels must include:
- duration
- hook
- full script
- timeline
- on-screen text
- shot list
- B-roll ideas
- CTA
```

## 12. 内容栏目

第一版内置 8 个栏目。

```text
Reviewer Says
Before / After Rewrite
Chinese PhD Mistakes
SCI Writing Framework
Checklist
AI Writing Risk
Journal Selection
Advisor Feedback Decoder
```

### 12.1 Reviewer Says

适合：

```text
lack of novelty
method unclear
insufficient discussion
English needs improvement
contribution is limited
```

### 12.2 Before / After Rewrite

适合：

```text
weak academic sentences
contribution paragraph
abstract
introduction
discussion
```

### 12.3 Chinese PhD Mistakes

适合：

```text
Introduction mistakes
Discussion mistakes
Reviewer response mistakes
AI polishing mistakes
Translation-style writing
```

### 12.4 AI Writing Risk

适合：

```text
AI polishing
generic claims
AI-sounding manuscript
ChatGPT academic writing
```

## 13. CTA 规则

### 13.1 None

```text
Save this before your next revision.
```

### 13.2 Soft

```text
Happy to share a reviewer-response checklist if useful.
DM “REVIEWER” for the checklist.
Comment “INTRO” if you want the structure.
```

### 13.3 Medium

```text
DM “REVIEWER” and I’ll send the checklist.
If you want, send the reviewer comment and I can suggest how to classify it.
```

### 13.4 Direct

```text
Book a 20-min manuscript diagnosis if you want another pair of eyes on the revision.
```

Direct 只能在高意向内容中使用，例如用户明确在找 editing service、writing coach、reviewer response help。

## 14. 合规检测

生成结果需要检测高风险词。

高风险词：

```text
guaranteed acceptance
guaranteed publication
we write your paper
ghostwriting
publish it for you
contract cheating
fake data
do your assignment
代写
包发表
保录用
```

替代表达：

```text
manuscript diagnosis
academic writing coaching
language editing
logic restructuring
reviewer response support
journal submission strategy
research communication coaching
```

前端提示：

```text
检测到高风险表达，建议替换为更合规的服务描述。
```

## 15. 和 Instagram Carousel 图片生成器打通

当用户点击：

```text
生成 Carousel 图片
```

前端写入：

```js
localStorage.setItem("instagram_carousel_prefill", JSON.stringify({
  template: result.carousel.template,
  style: result.carousel.style,
  slides: result.carousel.slides,
  caption: result.caption,
  hashtags: result.hashtags,
  cta: result.dmHook
}));

window.location.href = "../instagram-carousel/";
```

Carousel 图片生成器加载时读取：

```js
const prefill = localStorage.getItem("instagram_carousel_prefill");
if (prefill) {
  const data = JSON.parse(prefill);
  // 填入现有图片生成器
  localStorage.removeItem("instagram_carousel_prefill");
}
```

## 16. 和 Reddit Radar 打通

Reddit Radar 点击：

```text
生成 Instagram 内容
```

写入：

```js
localStorage.setItem("instagram_content_prefill", JSON.stringify({
  sourceType: "reddit_post",
  sourceText: post.title + "\n\n" + post.content,
  audience: "Chinese PhD",
  goal: "dm",
  painPoint: analysis.problemType,
  tone: "professional",
  ctaLevel: analysis.ctaLevel
}));

window.location.href = "../instagram-content-assistant/";
```

Instagram 内容策划助手加载时读取并自动填表。

## 17. 历史记录

MVP 可用 `localStorage` 保存历史。

结构：

```json
{
  "id": "ig_content_001",
  "createdAt": "2026-07-04T12:00:00Z",
  "sourceType": "reddit_post",
  "topic": "Reviewer says lack of novelty?",
  "result": {}
}
```

后续如需多人协作，可升级为数据库。

## 18. UI 功能清单

### 18.1 P0 页面功能

```text
输入素材
选择目标人群
选择内容目标
选择痛点类型
选择内容形式
选择语气
选择 CTA 强度
点击生成
展示 Carousel 文案
展示 Reels 脚本
展示 Caption
展示 Hashtags
复制结果
发送到 Carousel 图片生成器
```

### 18.2 P1 页面功能

```text
从 Reddit Radar 自动预填
保存历史
改写按钮
合规检测
Story 生成
DM 钩子生成
批量生成 10 个选题
```

### 18.3 P2 页面功能

```text
Reels 分镜表
导出拍摄提词稿
导出字幕 SRT
导出剪辑清单
生成 scenes.json
```

### 18.4 P3 页面功能

```text
模板化 Reels 视频生成
TTS 配音
自动字幕
MP4 下载
```

## 19. Reels 一键生成视频可行性

### 19.1 结论

可以做，但不建议放进第一版。

推荐分阶段实现：

```text
阶段 1：生成脚本和分镜
阶段 2：生成可剪辑素材包
阶段 3：模板化生成 MP4
阶段 4：真人素材半自动合成
```

### 19.2 阶段 1：脚本和分镜

MVP 必做。

输出：

```text
口播稿
时间轴
屏幕文字
镜头清单
B-roll 建议
CTA
```

### 19.3 阶段 2：可剪辑素材包

输出：

```text
scenes.json
字幕 SRT
口播稿 txt
封面标题
剪辑说明
```

### 19.4 阶段 3：模板化 MP4

技术路线：

```text
Reels 脚本
→ scenes.json
→ TTS 配音
→ 字幕文件
→ Remotion 或 FFmpeg 合成
→ 1080×1920 MP4
```

推荐视频模板：

```text
论文批注风
Google Doc 改写风
Before / After 对比风
Checklist 风
黑板讲解风
```

### 19.5 阶段 4：真人素材半自动

建议优先于 AI 数字人。

素材库：

```text
老师看镜头
老师指屏幕
老师翻页
老师讲解
老师思考
```

系统自动：

```text
匹配镜头
叠加字幕
叠加论文批注
插入 CTA
导出 MP4
```

### 19.6 不建议第一版做 AI 数字人

原因：

```text
真实感弱
信任感低
成本高
审核风险更高
学术服务行业更需要真人专业感
```

## 20. 后期视频生成技术建议

如果后期要做一键视频，建议单独新增：

```text
/reels-video-generator/
```

或在当前页面增加：

```text
Video Tab
```

技术建议：

```text
前端：视频模板选择和分镜预览
后端：不建议用 Cloudflare Workers 做长视频合成
视频合成：Remotion / FFmpeg
运行环境：GitHub Actions / Railway / Render / 本地服务
配音：TTS API
字幕：自动生成 SRT / ASS
输出：1080×1920 MP4
```

推荐 Remotion，因为：

```text
可用 React 组件生成视频
能复用现有 Carousel 视觉组件
适合信息图型 Reels
比手写 FFmpeg 动画更容易维护
```

## 21. Worker 伪代码

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/generate-instagram-content") {
      const payload = await request.json();
      const result = await callModel(env, buildPrompt(payload));
      return json(result);
    }

    if (url.pathname === "/api/rewrite-instagram-content") {
      const payload = await request.json();
      const result = await callModel(env, buildRewritePrompt(payload));
      return json(result);
    }

    return new Response("Not found", { status: 404 });
  }
};
```

模型调用伪代码：

```js
async function callModel(env, messages) {
  const response = await fetch(`${env.MODEL_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.MODEL_NAME || "deepseek-chat",
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

## 22. 错误处理

### 22.1 API 错误

前端提示：

```text
生成失败，请稍后重试。
```

同时保留用户输入，不清空表单。

### 22.2 JSON 解析失败

Worker 处理：

```text
尝试修复 JSON
失败则重新请求一次
仍失败则返回结构化错误
```

### 22.3 内容违规

如果模型输出高风险词：

```text
标记 riskFlags
前端提示替换建议
允许用户一键“降低风险重写”
```

### 22.4 请求频率限制

Worker 可加入简单限流：

```text
单 IP 每分钟最多 10 次
单次 sourceText 最长 8000 字符
```

## 23. 开发优先级

### P0：最小可用版

```text
Cloudflare Worker 接 DeepSeek
Instagram 内容策划助手页面
生成 Carousel 7 页文案
生成 Reels 脚本
生成 Caption
生成 Hashtags
复制结果
发送到 Carousel 图片生成器
```

### P1：运营增强版

```text
从 Reddit Radar 预填
生成 Story
生成 DM 钩子
合规检测
历史记录
改写按钮
批量生成选题
```

### P2：Reels 生产辅助

```text
生成分镜表
生成 scenes.json
导出 SRT
导出拍摄提词稿
导出剪辑清单
```

### P3：模板化视频生成

```text
TTS 配音
字幕合成
Remotion / FFmpeg 生成 MP4
视频模板库
```

### P4：真人素材半自动视频

```text
真人素材库
自动匹配 B-roll
品牌视频模板
批量生成 Reels
```

## 24. 验收标准

### 24.1 API 验收

```text
前端不暴露 DeepSeek API Key
Worker 能成功调用 DeepSeek
返回 JSON 可被前端解析
生成失败时有清晰提示
后期能通过配置切换模型 provider
```

### 24.2 内容验收

```text
能生成完整 Carousel 7 页文案
能生成 30-45 秒 Reels 脚本
能生成 Caption 和 Hashtag
CTA 低压自然
内容符合合规边界
没有代写、包发表、保证录用表达
```

### 24.3 页面验收

```text
用户 1 分钟内能生成一套内容包
结果区域结构清晰
每块内容都能复制
能一键发送到 Carousel 图片生成器
能从 Reddit Radar 预填
```

### 24.4 运营验收

```text
运营人员能从一个 Reddit 痛点生成一套 Ins 内容
Carousel 文案能直接用于图片生成
Reels 脚本能直接给老师拍摄
Caption 和 Hashtag 可直接发布前微调
```

## 25. MVP 推荐范围

第一版建议只做：

```text
DeepSeek API 代理
单条内容生成
Carousel 文案
Reels 脚本
Caption
Hashtags
DM 钩子
合规提示
发送到 Carousel 图片生成器
```

暂不做：

```text
一键生成 MP4
真人视频合成
自动发布 Instagram
团队协作数据库
复杂历史库
```

## 26. 最终判断

这个工具需要接入 API，DeepSeek 可以作为第一版模型。

最稳妥的开发路线是：

```text
先做 Instagram 内容策划助手
用 Cloudflare Worker 安全调用 DeepSeek
用结构化 JSON 输出 Carousel 和 Reels
用 localStorage 打通图片生成器
后续再做 Reels 视频生成器
```

关于 Reels 一键生成：

```text
可以做，但不建议放进 MVP。
第一阶段先生成脚本、分镜和字幕。
第二阶段再做模板化 MP4。
优先信息图视频和真人素材半自动，不优先 AI 数字人。
```

这样既能快速落地，又不会把系统一开始做得过重。
