# Instagram 学术内容图生成器开发文档

## 1. 项目背景

现有网站是“小红书大字封面生成器”，已具备多风格模板、字体切换、批量文案识别、Canvas 导出等基础能力。

本项目是在现有网站中新增一个二级页面，用于批量生成适合 Instagram 发布的学术内容图片，主要服务于 AI 论文辅导、SCI/CCF 写作辅导、英文论文润色、审稿意见回复辅导等业务场景。

目标不是做通用设计工具，而是做一个“模板化内容生产器”：用户只需要选择模板、粘贴文案，即可生成一套专业、合规、可直接发布的 Instagram Carousel 图片。

## 2. 页面定位

建议页面路径：

```text
/instagram-carousel/
```

或：

```text
/ins-post-generator/
```

页面名称：

```text
Instagram 学术内容图生成器
```

英文名称：

```text
Academic Instagram Carousel Generator
```

核心用户：

- 面向海外中国留学生获客的论文辅导机构
- SCI/CCF 写作辅导团队
- 学术润色、投稿辅导、返修辅导服务商
- 需要批量生产 Instagram 内容的运营人员

核心使用场景：

- 快速生成 Instagram Carousel
- 根据固定模板批量生产内容图
- 将 Reddit、小红书、咨询记录中的痛点转成 Ins 内容
- 生成审稿意见回复、论文改写、投稿 checklist 等内容资产

## 3. 核心用户流程

```text
进入 Instagram 学术内容图生成器
→ 选择内容模板
→ 选择视觉风格
→ 输入或粘贴文案
→ 自动拆分为多页
→ 实时预览
→ 调整账号名 / CTA / 字体 / 颜色
→ 生成图片
→ 下载当前页 / 下载整套 Carousel
```

## 4. MVP 范围

第一期只做 Instagram Carousel。

### 4.1 支持尺寸

MVP 必须支持：

```text
Instagram Carousel: 1080 × 1350
```

后续可扩展：

```text
Instagram Reel Cover: 1080 × 1920
Instagram Square Post: 1080 × 1080
Instagram Story: 1080 × 1920
```

### 4.2 MVP 模板数量

第一期建议支持 5 个内容模板：

```text
1. Reviewer Response
2. Before / After Rewrite
3. Chinese PhD Mistakes
4. SCI Writing Framework
5. Checklist
```

### 4.3 MVP 视觉风格数量

第一期建议支持 5 个视觉风格：

```text
1. Academic Paper
2. Editorial Research
3. Dark Lecture
4. Minimal Checklist
5. Blue Lab
```

### 4.4 MVP 核心功能

- 选择内容模板
- 选择视觉风格
- 输入文案
- 自动生成 5-7 页 Carousel
- 实时预览单页
- 上一页 / 下一页切换
- 修改账号名
- 修改 CTA
- PNG 下载当前页
- PNG 批量下载整套 Carousel
- 支持批量文案识别

## 5. 页面信息架构

页面采用左右布局。

```text
┌──────────────────────────────────────────────┐
│ 顶部导航 / 工具标题                           │
├───────────────────┬──────────────────────────┤
│ 左侧控制区         │ 右侧预览区                │
│                   │                          │
│ 模板类型           │ 当前页预览                │
│ 图片尺寸           │                          │
│ 视觉风格           │ 上一页 / 下一页            │
│ 字体设置           │                          │
│ 账号名             │ 下载当前页                │
│ CTA 设置           │ 下载整套 Carousel          │
│ 文案输入           │                          │
│ 批量识别           │                          │
├───────────────────┴──────────────────────────┤
│ 模板库 / 合规词库 / 常用 CTA / 历史记录        │
└──────────────────────────────────────────────┘
```

## 6. 左侧控制区

### 6.1 模板类型

使用下拉或卡片选择。

选项：

```text
Reviewer Response
Before / After Rewrite
Chinese PhD Mistakes
SCI Writing Framework
Checklist
```

### 6.2 图片尺寸

MVP 默认：

```text
Instagram Carousel 1080 × 1350
```

后续预留扩展：

```text
Reel Cover 1080 × 1920
Square Post 1080 × 1080
Story 1080 × 1920
```

### 6.3 视觉风格

选项：

```text
Academic Paper
Editorial Research
Dark Lecture
Minimal Checklist
Blue Lab
```

### 6.4 字体设置

建议支持：

```text
Inter
Helvetica
Arial
PingFang SC
Noto Sans SC
Source Han Sans
```

建议默认：

```text
英文：Inter / Helvetica
中文：PingFang SC / Noto Sans SC
```

### 6.5 品牌设置

字段：

```text
Instagram 账号名
品牌短语
CTA 关键词
```

默认值示例：

```text
@yourhandle
SCI / CCF writing coaching
DM "REVIEWER" for the checklist.
```

### 6.6 文案输入

支持普通模式和高级模式。

普通模式：

```text
标题：Reviewer says "lack of novelty"
副标题：This is not solved by polishing English.
页面1：...
页面2：...
页面3：...
CTA：DM "REVIEWER" for the checklist.
```

高级字段模式：

```text
[template] before-after
[title] Stop writing this in SCI papers
[weak] This study is very important.
[why] It is too generic and does not show contribution.
[better] This study contributes to X by showing Y under Z conditions.
[cta] Save this before submission.
```

批量模式：

```text
第一组文案
...
888
第二组文案
...
888
第三组文案
...
```

## 7. 右侧预览区

### 7.1 预览内容

显示当前生成页。

建议提供：

- 当前页码
- 上一页
- 下一页
- 缩放预览
- 适配窗口
- 真实尺寸预览

### 7.2 下载按钮

按钮：

```text
下载当前页 PNG
下载整套 Carousel
```

后续可支持：

```text
下载 ZIP
复制为图片
导出 PDF
导出项目 JSON
导入项目 JSON
```

## 8. 内容模板规范

### 8.1 Reviewer Response 模板

用途：

讲解审稿意见如何拆解和回应。

适合主题：

```text
lack of novelty
method unclear
insufficient discussion
English needs improvement
contribution is limited
```

默认页数：7 页。

结构：

```text
Slide 1: Reviewer says...
Slide 2: This may not mean...
Slide 3: Diagnose the issue
Slide 4: Weak reply
Slide 5: Stronger reply
Slide 6: What to revise in manuscript
Slide 7: Checklist + CTA
```

字段：

```text
reviewer_comment
misinterpretation
real_issue
weak_reply
stronger_reply
revision_action
checklist_items
cta
```

### 8.2 Before / After Rewrite 模板

用途：

展示论文句子的改写能力，适合建立专业信任。

默认页数：7 页。

结构：

```text
Slide 1: Stop writing this in SCI papers
Slide 2: Weak sentence
Slide 3: Why it sounds weak
Slide 4: Better version
Slide 5: Why this version works
Slide 6: Rewrite formula
Slide 7: CTA
```

字段：

```text
topic
weak_sentence
weak_reason
better_sentence
better_reason
rewrite_formula
cta
```

示例：

```text
Weak:
This study is very important.

Better:
This study contributes to X by showing Y under Z conditions.
```

### 8.3 Chinese PhD Mistakes 模板

用途：

精准面向海外中国留学生、博士、硕士、科研新手。

默认页数：7 页。

结构：

```text
Slide 1: 5 mistakes Chinese PhD students make in papers
Slide 2: Mistake 1
Slide 3: Mistake 2
Slide 4: Mistake 3
Slide 5: Mistake 4
Slide 6: Mistake 5
Slide 7: Save / DM CTA
```

字段：

```text
topic
mistake_1
mistake_2
mistake_3
mistake_4
mistake_5
cta
```

适合主题：

```text
Introduction mistakes
Discussion mistakes
Reviewer response mistakes
Abstract mistakes
AI polishing mistakes
```

### 8.4 SCI Writing Framework 模板

用途：

生产收藏型内容，讲解论文写作框架。

默认页数：7 页。

结构：

```text
Slide 1: A simple framework for...
Slide 2: Step 1
Slide 3: Step 2
Slide 4: Step 3
Slide 5: Example
Slide 6: Common mistake
Slide 7: Checklist
```

字段：

```text
framework_title
step_1
step_2
step_3
example
common_mistake
checklist_items
cta
```

适合主题：

```text
How to write contribution paragraph
How to write limitations
How to write cover letter
How to structure Introduction
How to respond to revise and resubmit
```

### 8.5 Checklist 模板

用途：

高收藏、高转发，用于资料包引流。

默认页数：5-7 页。

结构：

```text
Slide 1: Before you submit your paper...
Slide 2: Checklist item group 1
Slide 3: Checklist item group 2
Slide 4: Checklist item group 3
Slide 5: Checklist item group 4
Slide 6: Final check
Slide 7: CTA
```

字段：

```text
checklist_title
checklist_items
warning
cta
```

适合主题：

```text
SCI submission checklist
Reviewer response checklist
Introduction checklist
AI polishing checklist
Cover letter checklist
```

## 9. 后续可扩展模板

第二期可加入：

```text
Reviewer Comment Decoder
Myth vs Fact
Case Breakdown
Journal Submission Strategy
AI Writing Risk
```

### 9.1 Reviewer Comment Decoder

结构：

```text
Slide 1: When reviewer says X, they may mean Y
Slide 2: Literal meaning
Slide 3: Real concern
Slide 4: What not to do
Slide 5: What to revise
Slide 6: Reply sentence
Slide 7: CTA
```

### 9.2 Myth vs Fact

结构：

```text
Slide 1: Myth vs Fact
Slide 2: Myth 1
Slide 3: Fact 1
Slide 4: Myth 2
Slide 5: Fact 2
Slide 6: What to do instead
Slide 7: CTA
```

### 9.3 Case Breakdown

结构：

```text
Slide 1: Why this paragraph feels weak
Slide 2: Original problem
Slide 3: Diagnosis
Slide 4: Revision strategy
Slide 5: Improved version
Slide 6: What changed
Slide 7: CTA
```

### 9.4 Journal Submission Strategy

结构：

```text
Slide 1: Don’t choose a journal only by IF
Slide 2: Scope match
Slide 3: Article type
Slide 4: Recent papers
Slide 5: Review speed
Slide 6: Red flags
Slide 7: Save this
```

### 9.5 AI Writing Risk

结构：

```text
Slide 1: Your paper still sounds like AI
Slide 2: Problem 1: generic claims
Slide 3: Problem 2: weak transitions
Slide 4: Problem 3: fake precision
Slide 5: Better revision principle
Slide 6: Example
Slide 7: CTA
```

## 10. 视觉风格规范

### 10.1 Academic Paper

定位：

专业、克制、像论文批注页。

适用：

```text
Reviewer Response
Before / After Rewrite
Checklist
```

视觉特征：

```text
背景：白色 / 浅灰 / 纸张纹理
主色：深蓝
强调色：批注红
辅助色：浅灰
元素：论文引用框、批注线、checklist、页码
```

### 10.2 Editorial Research

定位：

杂志排版感，更高级、更像知识品牌。

适用：

```text
SCI Writing Framework
Myth vs Fact
Journal Submission Strategy
```

视觉特征：

```text
背景：米白或暖白
主色：黑色 / 深灰
强调色：酒红 / 墨绿
元素：大标题、细线、留白、文章式排版
```

### 10.3 Dark Lecture

定位：

深色课堂感，适合做 Reels 封面或更抓眼的 Carousel。

适用：

```text
AI Writing Risk
Chinese PhD Mistakes
Reviewer Comment Decoder
```

视觉特征：

```text
背景：深灰 / 近黑
主色：白色
强调色：荧光绿 / 黄色 / 红色
元素：高亮笔、代码块、讲义框
```

### 10.4 Minimal Checklist

定位：

极简、清楚、适合收藏。

适用：

```text
Checklist
SCI Writing Framework
Submission Strategy
```

视觉特征：

```text
背景：白色
主色：黑色
强调色：蓝色或红色
元素：大 checkbox、编号、列表、少量分割线
```

### 10.5 Blue Lab

定位：

蓝白科技感，适合 SCI、CCF、AI、CS 方向。

适用：

```text
CCF paper writing
AI research writing
Method / Data explanation
```

视觉特征：

```text
背景：浅蓝白
主色：科技蓝
强调色：青色 / 红色
元素：网格、表格、数据块、标签
```

## 11. 内容生成规则

### 11.1 自动拆页规则

当用户输入一整段文案时，系统应根据模板字段拆页。

优先级：

```text
1. 用户显式填写字段
2. 用户用 Slide 1 / Slide 2 标记
3. 用户用换行段落分组
4. 系统按模板默认结构自动分配
```

### 11.2 文案长度限制

建议限制：

```text
封面标题：最多 70 英文字符或 28 中文字符
副标题：最多 120 英文字符或 50 中文字符
正文段落：每页最多 3-5 行
Checklist：每项最多 90 英文字符或 36 中文字符
CTA：最多 80 英文字符或 32 中文字符
```

超出时：

```text
优先自动缩小字号
其次自动换行
仍超出时提示用户精简
```

### 11.3 中英文混排规则

建议：

```text
英文作为主标题
中文作为解释
英文作为示例句
```

示例：

```text
主标题：Reviewer asked for revision?
中文解释：论文被返修，别急着先改语言。
示例句："The contribution is unclear."
```

## 12. 合规词库

工具中建议内置合规提醒，避免生成高风险营销表达。

### 12.1 推荐表达

```text
academic writing coaching
manuscript editing
language editing
logic restructuring
reviewer response support
journal submission strategy
research communication coaching
manuscript diagnosis
publication strategy consultation
```

### 12.2 避免表达

```text
ghostwriting
guaranteed acceptance
we write your paper
write my essay
submit on your behalf
contract cheating
代写
包中
包发表
保录用
保过
```

### 12.3 提醒方式

当用户文案出现高风险词时：

```text
1. 高亮风险词
2. 给出替代表达
3. 允许用户继续，但展示合规提示
```

示例：

```text
检测到“包发表”。建议替换为“投稿策略辅导”或“返修方案支持”。
```

## 13. 常用 CTA 库

建议内置可选 CTA：

```text
Save this before your next revision.
DM "REVIEWER" for the checklist.
Comment "TEMPLATE" for the structure.
Follow for SCI writing tips.
Send this to a friend preparing revision.
Book a 20-min manuscript diagnosis.
DM "INTRO" for the Introduction checklist.
DM "SUBMIT" for the submission checklist.
```

中文辅助 CTA：

```text
保存这张，返修前再看一遍。
私信 REVIEWER，领取审稿回复 checklist。
评论 TEMPLATE，领取回复信结构。
关注获取更多 SCI 写作技巧。
```

## 14. 数据结构建议

### 14.1 Template 对象

```json
{
  "id": "reviewer-response",
  "name": "Reviewer Response",
  "defaultSlides": 7,
  "fields": [
    "reviewer_comment",
    "misinterpretation",
    "real_issue",
    "weak_reply",
    "stronger_reply",
    "revision_action",
    "checklist_items",
    "cta"
  ],
  "supportedStyles": [
    "academic-paper",
    "editorial-research",
    "blue-lab"
  ]
}
```

### 14.2 Slide 对象

```json
{
  "slideIndex": 1,
  "type": "cover",
  "title": "Reviewer asked for revision?",
  "subtitle": "论文被返修，别急着先改语言。",
  "body": "",
  "quote": "\"The contribution is unclear.\"",
  "cta": "Save this before your next revision."
}
```

### 14.3 Style 对象

```json
{
  "id": "academic-paper",
  "name": "Academic Paper",
  "colors": {
    "background": "#fbfaf7",
    "text": "#182033",
    "primary": "#1f4b73",
    "accent": "#c94538",
    "muted": "#667085"
  },
  "fonts": {
    "latin": "Inter",
    "cjk": "PingFang SC"
  },
  "radius": 4
}
```

## 15. 导出规范

### 15.1 图片格式

MVP：

```text
PNG
```

后续：

```text
JPG
PDF
ZIP
```

### 15.2 文件命名

单套 Carousel：

```text
reviewer-response-slide-01.png
reviewer-response-slide-02.png
reviewer-response-slide-03.png
```

批量生成：

```text
2026-07-03-reviewer-response-001-slide-01.png
2026-07-03-reviewer-response-001-slide-02.png
```

### 15.3 导出尺寸

```text
1080 × 1350 px
```

必须保证：

- 不出现页面边框外留白
- 不出现文字溢出
- 不出现按钮、页码、CTA 被裁切
- 图片可直接上传 Instagram

## 16. 与现有网站的关系

建议复用现有能力：

- 风格选择
- 字体选择
- 批量文案识别
- Canvas 渲染
- PNG 下载
- 会员下载逻辑

建议新增能力：

- 多页 Carousel 管理
- 学术内容模板库
- 合规词提醒
- CTA 库
- Instagram 尺寸管理
- 整套 Carousel 批量导出

## 17. 第一版开发优先级

### P0

- 新增二级页面入口
- 支持 1080 × 1350 Carousel
- 支持 Reviewer Response 模板
- 支持 Academic Paper 风格
- 支持单页预览
- 支持 PNG 下载

### P1

- 支持 5 个 MVP 模板
- 支持 5 个视觉风格
- 支持上一页 / 下一页
- 支持账号名和 CTA 修改
- 支持整套 Carousel 下载

### P2

- 支持批量文案生成多套 Carousel
- 支持合规词检测
- 支持常用 CTA 库
- 支持项目 JSON 保存 / 导入

### P3

- 支持 Reel Cover
- 支持 Square Post
- 支持 Story
- 支持 AI 辅助拆文案
- 支持模板市场或自定义模板

## 18. 推荐验收标准

### 功能验收

- 用户可以在 3 分钟内生成一套 7 页 Instagram Carousel
- 用户可以修改账号名和 CTA
- 用户可以切换模板和视觉风格
- 用户可以下载当前页 PNG
- 用户可以下载整套 Carousel
- 批量文案可以被正确拆分

### 视觉验收

- 1080 × 1350 图片无白边
- 所有文字在安全区内
- 中英文混排不拥挤
- CTA 不贴边、不被裁切
- 页码清晰
- 内容风格符合学术服务的专业感

### 内容验收

- 模板结构能覆盖常见 Instagram 内容
- 默认文案不涉及代写、包发表、保录用等高风险表达
- 示例内容符合 SCI/CCF 写作辅导场景
- CTA 能自然引导私信或保存

## 19. 建议第一批内置示例选题

```text
Reviewer says "lack of novelty"
Reviewer says "method is unclear"
Stop writing "This study is important"
5 Introduction mistakes Chinese PhD students make
Before you submit your SCI paper, check these 7 things
How to write a stronger contribution paragraph
Why your paper still sounds like AI
How to politely disagree with reviewers
Don't choose a journal only by impact factor
What "insufficient discussion" really means
```

## 20. 一句话产品定位

```text
一个面向学术服务机构的 Instagram 内容图生成器，把审稿意见、论文改写、SCI 写作框架和投稿 checklist 快速转成专业 Carousel。
```
