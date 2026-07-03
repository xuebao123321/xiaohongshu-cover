# Reddit 评论回复助手 — 多批次 AI 提示词

> 版本：v1.0
> 生成日期：2026-07-03
> 基于开发文档：`reddit_reply_assistant_dev_doc.md`
> 目标页面路径：`/reddit-reply-assistant/index.html`

---

## 使用说明

以下提示词按批次排列，**必须按顺序执行**，每批次依赖上一批次的产出。
每批次末尾均要求"系统完整可运行且无 bug"，请在确认当前批次无误后再进入下一批。

**技术路线约定：**
- 纯前端单文件 HTML（`index.html`），零构建工具依赖，所有 CSS/JS 内联
- 回复生成：纯客户端 JavaScript 模板引擎，不依赖后端 API（后续可接入大模型）
- 风格：延续现有项目（`index.html` 主站 + `ins_reviewer_carousel/`）的设计语言，CSS 自定义属性命名统一
- 页面布局：CSS Grid 左右分栏，左侧输入控制区（400px），右侧输出编辑区
- 部署方式：GitHub Pages，文件放在 `/reddit-reply-assistant/index.html`，浏览器直接访问

---

## 第一批：项目骨架 + 左右布局 + 状态管理

```
请在一个新的 HTML 文件 `reddit-reply-assistant/index.html` 中构建 Reddit 评论回复助手的页面骨架。

### 1. 目录结构

在项目根目录下创建新文件夹：
```
reddit-reply-assistant/
└── index.html
```

### 2. 页面结构（左右布局）

使用 CSS Grid 实现全屏左右布局：

```
┌──────────────────────────────────────────────────────┐
│ 顶部导航栏（工具标题 + 返回主页链接）                    │
├─────────────────────┬────────────────────────────────┤
│ 左侧输入与设置区      │ 右侧输出与编辑区                  │
│ （400px 宽）         │ （剩余宽度）                      │
│ 可垂直滚动            │ 可垂直滚动                       │
│                     │                                │
│ Reddit 原评论        │ [Short] [Helpful] [Deep] tabs  │
│ 帖子标题              │                                │
│ Subreddit            │ 生成的回复草稿                    │
│ 问题类型              │                                │
│ 用户身份              │ 风险检测结果                     │
│ 学科领域              │                                │
│ 回复语气              │ CTA 建议                        │
│ CTA 强度              │                                │
│ [生成回复] 按钮        │ [复制] [重新生成] 按钮           │
├─────────────────────┴────────────────────────────────┤
│ 底部工具栏：CTA 库 / 风险词提示 / 使用说明               │
└──────────────────────────────────────────────────────┘
```

具体要求：
- 顶部导航栏：高度约 56px，白色背景，底部细分割线。左侧显示 "🧠 Reddit 评论回复助手" 标题，右侧显示 "← 返回运营工具台" 链接（href="../index.html"）。
- 左侧控制区：宽度固定 400px，背景 #fafaf9，内边距 24px，可垂直滚动（overflow-y: auto），最大高度为 calc(100vh - 56px)。
- 右侧输出区：flex 布局，白色背景，内边距 32px，可垂直滚动。
- 底部工具栏：高度约 48px，灰色背景 #f5f5f4，显示快捷操作按钮和 CTA 库入口。

### 3. 左侧控制区内容（仅 UI 壳子，先不做逻辑）

按以下顺序排列控件，每个控件带 label + 对应表单元素，label 用 13px、颜色 #667085、font-weight 500：

a) **Reddit 原评论或帖子内容**（必填）
   `<textarea>` 高度 160px，placeholder 示例："My paper was rejected because the reviewer said it lacks novelty. I don't know how to fix that."

b) **帖子标题**（选填）
   `<input type="text">`，placeholder："Paper rejected for lack of novelty"

c) **Subreddit**（选填）
   `<input type="text">`，placeholder："r/PhD"

d) **问题类型**（下拉选择框 `<select>`，默认选中第一个）
   选项：
   - Harsh Reviewer Response
   - Advisor Says Writing Is Unclear
   - Rejected for Lack of Novelty
   - English Editing Recommendation
   - Journal Selection
   - Revise and Resubmit Anxiety
   - AI Writing / AI Polishing Concern
   - Dissertation / Thesis Structure Confusion

e) **用户身份**（下拉选择框 `<select>`）
   选项：Unknown（默认）/ Master / PhD / Postdoc / Faculty

f) **学科领域**（下拉选择框 `<select>`）
   选项：General（默认）/ CS / Medical / Engineering / Social Science / Business

g) **回复语气**（4 个 radio 样式卡片，水平排列，每行 2 个）
   - Warm（默认选中）—— 更共情，适合焦虑型用户
   - Direct —— 简洁清楚，适合技术类问题
   - Expert —— 专业结构化，适合学术社区
   - Casual —— 像普通 Reddit 用户，不太正式

h) **回复目标**（下拉选择框 `<select>`）
   选项：建立专业度（默认）/ 帮忙 / 引导私信 / 收集痛点

i) **CTA 强度**（滑块式选择，4 个分段按钮水平排列）
   - None / Soft（默认选中）/ Medium / Direct
   每个按钮下方有小字说明：
   - None：纯帮助，无钩子
   - Soft：轻钩子，如 "Happy to share a checklist if useful"
   - Medium：引导私信关键词
   - Direct：明确邀请咨询

j) **生成按钮**
   `<button>` 蓝色主按钮，宽度 100%，高度 44px，文案 "生成回复草稿 ✨"
   按钮下方显示一行小字提示："工具生成草稿后，请人工审核再发布到 Reddit。"

### 4. 右侧输出区内容（仅 UI 壳子）

a) **版本切换 Tabs**
   三个 tab 按钮水平排列：Short / Helpful / Deep
   - Helpful 默认选中（高亮），Short 和 Deep 为灰色
   - 每个 tab 下方显示字数范围：Short（80-120 words）/ Helpful（150-220 words）/ Deep（250-400 words）

b) **回复显示区**
   一个白色圆角卡片（border: 1px solid #e5e5e5, border-radius: 8px, padding: 24px）
   卡片内显示占位文字：
   ```
   在左侧粘贴 Reddit 评论，选择问题类型和语气，然后点击"生成回复草稿"。
   生成的回复将显示在这里。
   ```

c) **操作按钮行**
   回复卡片下方显示一行按钮：
   - [📋 复制回复] 蓝色主按钮
   - [🔄 重新生成] 次按钮
   - [📏 缩短] 次按钮
   - [📝 展开] 次按钮
   - 每个按钮带 tooltip 提示

d) **风险检测区**
   回复卡片下方显示一个浅黄色提示区（background: #fffdf5, border: 1px solid #f0e8c0）：
   ```
   ⚠️ 风险提示：生成回复后，这里会显示营销风险、合规风险和社区风险提示。
   ```

e) **CTA 建议区**
   风险区下方显示一个浅绿色区（background: #f5fdf7, border: 1px solid #d0ead5）：
   ```
   💡 CTA 建议：当前建议的钩子策略和替代方案。
   ```

### 5. 底部工具栏

显示三组按钮：
- 📚 CTA 钩子库
- ⚠️ 风险词提示
- 📖 使用说明
- 每个按钮点击后展开对应面板（先做占位，后续批次实现内容）

### 6. JavaScript 状态管理

在 `<script>` 中定义一个全局状态对象：

```javascript
const state = {
  // 输入
  sourceText: '',
  postTitle: '',
  subreddit: '',
  problemType: 'lack_of_novelty',
  userType: 'Unknown',
  field: 'General',
  tone: 'warm',
  replyGoal: 'build_trust',
  ctaLevel: 'soft',

  // 输出
  replies: {
    short: { text: '', wordCount: 0 },
    helpful: { text: '', wordCount: 0 },
    deep: { text: '', wordCount: 0 },
  },
  activeVersion: 'helpful',

  // 风险
  risks: {
    marketing: 'low',
    compliance: 'low',
    redditCommunity: 'low',
    suggestions: [],
  },

  // 状态
  isGenerating: false,
  generationError: null,
};
```

实现一个 `updatePreview()` 函数（目前只需 console.log 当前 state），并将所有控件的 `onchange` / `oninput` / `onclick` 事件绑定到 state 更新 + `updatePreview()` 调用。

### 7. 样式规范

- CSS 自定义属性命名风格与主站 `index.html` 和 `ins_reviewer_carousel/index.html` 保持一致：
  ```css
  :root {
    --ink: #182033;
    --muted: #667085;
    --paper: #fbfaf7;
    --line: #d9d6ce;
    --blue: #1f4b73;
    --red: #c94538;
    --green: #2f735c;
    --gold: #b47d25;
    --gray: #f0eee8;
    --control-bg: #f9f9f9;
    --panel-border: #e5e5e5;
    --card-hover-shadow: 0 4px 16px rgba(24, 32, 51, 0.12);
    --card-selected-border: #1f4b73;
  }
  ```
- 字体：`Inter, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", sans-serif`
- 整体色调干净、专业、学术感
- 按钮 hover 有过渡效果（transition: all 0.2s）
- 语气选择卡片 hover 有阴影提升效果，选中状态蓝色边框
- CTA 强度分段按钮：选中状态蓝色背景白色文字，未选中灰色背景
- 所有 form 控件统一高度 40px，border: 1px solid var(--line)，border-radius: 6px
- label 和控件之间间距 6px，控件组之间间距 20px

### 8. 验收标准

- 用浏览器打开 `reddit-reply-assistant/index.html`，能看到完整的左右三区布局
- 左侧所有控件可见、可交互（下拉框能展开、文本框能输入、语气卡片能点击选中）
- 语气卡片点击后蓝色边框高亮
- CTA 强度分段按钮点击切换选中状态
- 修改任何控件值，浏览器 console 能看到 state 对象更新
- 右侧显示占位内容，tabs 可点击切换
- 页面不报任何 JavaScript 错误
- 顶部"返回运营工具台"链接指向 `../index.html`

执行完这些提示词后，系统要完整可运行并且不会有任何bug，认真仔细整理提示词。
```

---

## 第二批：8 种问题类型模板数据 + CTA 钩子库

```
在第一批产出的 `reddit-reply-assistant/index.html` 基础上，继续开发。不要创建新文件。

### 1. 定义 8 个问题类型的完整模板数据

在 `<script>` 中 state 定义之前，添加以下常量：

```javascript
const PROBLEM_TEMPLATES = {
  lack_of_novelty: {
    id: 'lack_of_novelty',
    name: 'Rejected for Lack of Novelty',
    keywords: ['lack of novelty', 'not novel', 'contribution', 'limited novelty', 'incremental'],
    defaultTone: 'warm',
    defaultCtaLevel: 'soft',
    logic: {
      empathy: "That's a really common but frustrating reviewer comment, because 'lack of novelty' often sounds vague and unfair.",
      diagnosis: "I wouldn't start by just adding sentences like 'this study is novel.' Usually the issue is that the paper hasn't positioned itself clearly enough against prior work. This is a positioning problem, not a quality problem.",
      framework: [
        "What have previous studies already done?",
        "What specific gap remains?",
        "What does your study add that changes or extends that work?",
      ],
      example: "Instead of writing 'This study is novel and important,' you could write: 'Unlike prior studies that focus on X, this study examines Y under Z conditions.' Then in the response letter, cite exactly where you revised the manuscript, such as the final paragraph of the Introduction.",
      action: "Revise your Introduction's final paragraph and the Discussion section to make the gap and contribution more explicit. Then quote those exact revisions in your response letter.",
      cta: 'Happy to share a reviewer-response checklist if useful.',
    },
  },

  harsh_reviewer: {
    id: 'harsh_reviewer',
    name: 'Harsh Reviewer Response',
    keywords: ['harsh', 'rude', 'aggressive', 'mean', 'unfair', 'personal'],
    defaultTone: 'warm',
    defaultCtaLevel: 'soft',
    logic: {
      empathy: "I know this can feel personal, but try to remember that harsh reviewer comments often say more about the reviewer's communication style than about your work.",
      diagnosis: "The key is to separate tone from substance. Even a rude comment usually contains a technical concern underneath. Your job is to extract the actionable point and ignore the delivery.",
      framework: [
        "What is the actual technical concern behind the harsh wording?",
        "Is this a real methodological issue, or just presentation?",
        "Can you address it with a concrete revision?",
      ],
      example: "If the reviewer wrote 'This analysis is completely wrong,' don't defend yourself emotionally. Instead: 'We thank the reviewer for pointing this out. We have re-examined the analysis and made the following revisions: [specific changes]. We believe these revisions strengthen the paper.'",
      action: "Create a response matrix: each reviewer comment in the left column, your calm, evidence-based response in the right column. Never match their tone.",
      cta: 'Happy to share a reviewer-response checklist if useful.',
    },
  },

  writing_unclear: {
    id: 'writing_unclear',
    name: 'Advisor Says Writing Is Unclear',
    keywords: ['unclear', 'writing', 'advisor', 'supervisor', 'rewrite', 'vague'],
    defaultTone: 'warm',
    defaultCtaLevel: 'soft',
    logic: {
      empathy: "'Unclear' is one of the most frustrating feedback to receive because it's so vague. You're not alone in this.",
      diagnosis: "Usually 'unclear' means the reader can't follow the logical thread: why this sentence connects to the next, why this paragraph exists, what point it's making. It's typically a structure and flow problem, not a grammar problem.",
      framework: [
        "Does each paragraph have a clear topic sentence that states its argument?",
        "Does each sentence logically connect to the one before it?",
        "Is the contribution of each paragraph obvious to a reader?",
      ],
      example: "Instead of 'The results show that X affects Y,' try: 'This paragraph argues that X is the primary driver of Y, because [evidence].' This tells the reader WHY this information matters.",
      action: "Try this: next time you meet your advisor, ask 'At what level is it unclear — the sentence, the paragraph, or the overall argument?' This gives you something concrete to work with.",
      cta: 'I can share a paragraph-level checklist if useful.',
    },
  },

  english_editing: {
    id: 'english_editing',
    name: 'English Editing Recommendation',
    keywords: ['editing', 'English', 'native speaker', 'ESL', 'language editing', 'proofread'],
    defaultTone: 'warm',
    defaultCtaLevel: 'medium',
    logic: {
      empathy: "ESL academic writing is genuinely hard — you're not only managing complex ideas but also expressing them in a language that isn't your first. Respect for putting yourself out there.",
      diagnosis: "First, figure out what kind of help you actually need: surface-level grammar editing, or deeper logic and structure work. A pure language edit won't fix an unclear argument. A structure coach won't fix your grammar. Most papers need both at different stages.",
      framework: [
        "Stage 1: Is your argument structure solid? If not, fix that first.",
        "Stage 2: Is the logic clear at the paragraph level?",
        "Stage 3: Now polish the English at the sentence level.",
      ],
      example: "When you do hire an editor, ask them to comment on structure and clarity, not just wording. A good editor should be able to tell you 'this paragraph's argument is unclear' — that's more valuable than just fixing grammar.",
      action: "Choose editing support based on your manuscript's stage: early draft → focus on argument structure; near-final draft → focus on language polish.",
      cta: 'I work with ESL researchers on manuscript clarity and reviewer responses, but I\'d start with the diagnosis above before considering paid editing.',
    },
  },

  journal_selection: {
    id: 'journal_selection',
    name: 'Journal Selection',
    keywords: ['journal', 'submit', 'impact factor', 'scope', 'where to publish'],
    defaultTone: 'direct',
    defaultCtaLevel: 'soft',
    logic: {
      empathy: "Journal selection is confusing because everyone talks about impact factor, but that's only one piece of the puzzle.",
      diagnosis: "Don't choose a journal by impact factor alone. Start with scope: does this journal actually publish papers like yours? Read 5-10 recent articles from your shortlisted journals to check.",
      framework: [
        "Scope: Do they publish your type of research?",
        "Article type: Do they accept your article category?",
        "Recent papers: What have they published in the last 1-2 years?",
        "Review speed: Check average turnaround times.",
        "Red flags: Predatory practices, excessive APCs, fake editorial boards.",
      ],
      example: "Make a spreadsheet with 5 candidate journals. For each, list: scope match (yes/no), average review time, APC cost, 3 recent similar papers. This makes the decision data-driven, not emotional.",
      action: "Create a shortlist of 3 journals ranked by fit, not by prestige. Submit to the best-fit journal first.",
      cta: 'Happy to share a journal selection checklist if useful.',
    },
  },

  revise_resubmit_anxiety: {
    id: 'revise_resubmit_anxiety',
    name: 'Revise and Resubmit Anxiety',
    keywords: ['revise and resubmit', 'R&R', 'major revision', 'anxiety', 'overwhelmed', 'stress'],
    defaultTone: 'warm',
    defaultCtaLevel: 'soft',
    logic: {
      empathy: "Getting a major revision can feel overwhelming — it's like being told 'your paper is not good enough, but try again.' Take a breath. A revise-and-resubmit is actually good news: they didn't reject it.",
      diagnosis: "Not all reviewer comments have equal weight. Some are must-fix, some are negotiable, some are simple clarifications. Your first step is to categorize them so you don't treat every comment as equally urgent.",
      framework: [
        "Must-fix: Major methodological or logical issues. These are non-negotiable.",
        "Negotiate: Points you disagree with. You can politely explain why, with evidence.",
        "Clarify: Misunderstandings. Fix the wording so future readers don't have the same confusion.",
      ],
      example: "Don't respond to 30 comments in random order. Group them by theme first: all comments about the method go together, all comments about the literature review go together. Respond to each theme as a block, not comment-by-comment.",
      action: "Make a revision matrix: columns for reviewer comment, your response, manuscript changes, and page/line numbers. This keeps you organized and makes writing the response letter much easier.",
      cta: 'Happy to share a revision planning checklist if useful.',
    },
  },

  ai_writing_concern: {
    id: 'ai_writing_concern',
    name: 'AI Writing / AI Polishing Concern',
    keywords: ['AI', 'ChatGPT', 'polish', 'generic', 'sounds like AI', 'AI writing'],
    defaultTone: 'expert',
    defaultCtaLevel: 'soft',
    logic: {
      empathy: "AI polishing tools can improve surface-level clarity, but they often make academic writing sound generic — like every other paper. You're right to be concerned.",
      diagnosis: "The problem isn't AI itself; it's that AI defaults to safe, generic academic phrases. It strips away specificity: your unique claims, your specific evidence, your nuanced limitations. Readers (and reviewers) can tell when writing has been homogenized.",
      framework: [
        "Claim: What exactly are you arguing? Be specific to your study.",
        "Evidence: What data or reasoning supports this claim?",
        "Limitation: What's the boundary of this claim?",
        "Contribution: How does this advance the conversation beyond prior work?",
      ],
      example: "Instead of 'This study contributes to the literature on X,' write: 'Unlike [Author 2022], who found X increases Y, this study shows X only increases Y when Z is present — suggesting the relationship is conditional, not universal.' AI won't write that. Only you can.",
      action: "Use AI for sentence-level options ('give me 5 ways to say this'), not for full-paragraph generation. YOU make the argument decisions. AI just gives you wording choices.",
      cta: 'Happy to share an AI polishing checklist if useful.',
    },
  },

  thesis_structure: {
    id: 'thesis_structure',
    name: 'Dissertation / Thesis Structure Confusion',
    keywords: ['thesis', 'dissertation', 'structure', 'chapter', 'messy', 'organization'],
    defaultTone: 'warm',
    defaultCtaLevel: 'soft',
    logic: {
      empathy: "Large writing projects become messy quickly. A dissertation isn't one big paper — it's several chapters that need to work together as a coherent argument. That's genuinely hard.",
      diagnosis: "A structure problem is usually an architecture problem: your chapters might individually be fine, but they don't form a single, progressive argument from question to answer.",
      framework: [
        "What is the ONE research question your whole dissertation answers?",
        "What is the job of each chapter in answering that question?",
        "How does each chapter's conclusion set up the next chapter?",
      ],
      example: "For each chapter, write a one-sentence job description: 'This chapter establishes that existing methods for measuring X are unreliable under condition Y.' If you can't write that sentence, the chapter's purpose isn't clear.",
      action: "Write a one-page 'dissertation map': research question at the top, then for each chapter: its job, its key finding, and how it transitions to the next chapter. Share this with your advisor before sending full chapters.",
      cta: 'Happy to share a thesis structure worksheet if useful.',
    },
  },
};
```

### 2. 定义 CTA 钩子库

```javascript
const CTA_LIBRARY = {
  checklist: [
    "Happy to share a reviewer-response checklist if useful.",
    "I have a short checklist for this kind of revision if you want it.",
    "Happy to share the checklist I use for sorting reviewer comments.",
    "I can share a paragraph-level checklist if useful.",
    "Happy to share a revision planning checklist if useful.",
    "Happy to share a journal selection checklist if useful.",
    "Happy to share an AI polishing checklist if useful.",
  ],
  template: [
    "I can share a simple response-letter structure if that helps.",
    "Happy to share a template for organizing the response letter.",
    "I can share the structure I use for response letters if that helps.",
    "Happy to share a thesis structure worksheet if useful.",
  ],
  light_diagnosis: [
    "If you want, paste the reviewer comment here and I can help classify what it's really asking for.",
    "If you want another pair of eyes on the reviewer wording, feel free to DM me.",
    "I'm happy to share a response-letter template by DM.",
    "Feel free to DM me 'REVIEWER' and I can send the checklist.",
  ],
  service_aware: [
    "I work with ESL researchers on manuscript clarity and reviewer responses, but I'd start with the diagnosis above before considering paid editing.",
    "If you want another pair of eyes on the reviewer comments, feel free to DM me.",
    "I work with ESL researchers on manuscript revision and reviewer responses. Happy to point you in the right direction if useful.",
  ],
};

const RISK_PATTERNS = {
  banned: [
    { pattern: /guaranteed?\s*acceptance/i, label: '禁止承诺发表' },
    { pattern: /we\s*(can|will)\s*publish/i, label: '禁止代投承诺' },
    { pattern: /we\s*(can|will)\s*write\s*(your\s*)?paper/i, label: '禁止代写暗示' },
    { pattern: /ghostwriting/i, label: '禁止提及代写' },
    { pattern: /contract\s*cheating/i, label: '禁止提及合同作弊' },
    { pattern: /submit\s*on\s*your\s*behalf/i, label: '禁止代投' },
    { pattern: /write\s*my\s*essay/i, label: '禁止代写' },
  ],
  highRisk: [
    { pattern: /paid\s*manuscript/i, label: '高风险：付费手稿' },
    { pattern: /guaranteed?\s*(grade|score|pass)/i, label: '高风险：承诺分数' },
  ],
  marketing: [
    { pattern: /\bDM\s+me\b.*\bDM\s+me\b/i, label: 'DM me 出现多次' },
    { pattern: /\b(service|paid|client|company)\b.*\b(service|paid|client|company)\b/i, label: '营销词汇过多' },
  ],
};

const RISK_REPLACEMENTS = {
  'guaranteed acceptance': 'improve manuscript competitiveness',
  'we publish it for you': 'journal submission strategy',
  'we write your paper': 'academic writing coaching',
  'ghostwriting': 'research communication support',
  'contract cheating': 'manuscript diagnosis',
  'submit on your behalf': 'journal submission guidance',
  'write my essay': 'language editing',
};
```

### 3. 将输入控件与模板关联

当用户在左侧选择"问题类型"时：
- 自动更新 `state.problemType`
- 根据模板的 `defaultTone` 自动设置语气（可被用户手动覆盖）
- 根据模板的 `defaultCtaLevel` 自动设置 CTA 强度（可被用户手动覆盖）
- 在 console.log 中打印当前匹配到的模板数据

实现 `onProblemTypeChange()` 函数处理此逻辑。

### 4. 底部 CTA 库面板（基础版）

点击底部工具栏的 "📚 CTA 钩子库" 按钮时：
- 在底部展开一个面板（高度约 200px，可滚动）
- 面板内按 4 个分类展示 CTA_LIBRARY 中的所有条目
- 每个条目右侧有一个 "复制" 小按钮，点击可复制到剪贴板
- 再次点击 "📚 CTA 钩子库" 按钮或面板外的关闭按钮可关闭面板

点击底部工具栏的 "⚠️ 风险词提示" 按钮时：
- 展开面板显示 RISK_PATTERNS.banned 中的禁止词列表
- 用红色标签展示每个禁止词

### 5. 验收标准

- 选择不同问题类型，console 能看到对应模板数据
- 语气和 CTA 强度自动更新为模板默认值
- CTA 库面板可展开/关闭，条目可复制
- 风险词提示面板可展开/关闭
- 所有交互不报 JavaScript 错误

执行完这些提示词后，系统要完整可运行并且不会有任何bug，认真仔细整理提示词。
```

---

## 第三批：回复生成引擎 + 三版本输出 + 复制功能

```
在第二批产出的基础上，继续在 `reddit-reply-assistant/index.html` 中开发。不要创建新文件。

### 1. 回复生成核心函数

实现 `generateReply(version)` 函数，参数为 'short' | 'helpful' | 'deep'。

生成逻辑：

```javascript
function generateReply(version) {
  const template = PROBLEM_TEMPLATES[state.problemType];
  const { logic } = template;
  const tone = state.tone;
  const ctaLevel = state.ctaLevel;

  // 根据 version 决定各部分展开程度
  const config = {
    short:    { empathy: true,  diagnosis: true,  framework: false, example: false, action: false, cta: false, maxWords: 120 },
    helpful:  { empathy: true,  diagnosis: true,  framework: true,  example: true,  action: true,  cta: true,  maxWords: 220 },
    deep:     { empathy: true,  diagnosis: true,  framework: true,  example: true,  action: true,  cta: true,  maxWords: 400 },
  }[version];

  // 构建回复文本
  let paragraphs = [];

  // 1. Empathy（所有版本都有）
  paragraphs.push(applyTone(logic.empathy, tone));

  // 2. Diagnosis（所有版本都有）
  paragraphs.push(applyTone(logic.diagnosis, tone));

  // 3. Framework（Helpful 和 Deep 有）
  if (config.framework && logic.framework) {
    const items = logic.framework;
    if (version === 'short') {
      // Short 不展开
    } else if (version === 'helpful') {
      paragraphs.push('A useful way to think about this: ' + items.join(' '));
    } else {
      // Deep：编号展开
      paragraphs.push('Here is how I would approach this step by step:');
      items.forEach(function(item, i) {
        paragraphs.push((i + 1) + '. ' + item);
      });
    }
  }

  // 4. Example（Helpful 和 Deep 有）
  if (config.example && logic.example) {
    paragraphs.push('For example, ' + logic.example);
  }

  // 5. Action（Helpful 和 Deep 有）
  if (config.action && logic.action) {
    paragraphs.push(logic.action);
  }

  // 6. CTA
  if (config.cta && ctaLevel !== 'none') {
    const cta = selectCTA(template, ctaLevel, version);
    if (cta) paragraphs.push(cta);
  }

  // 拼接成自然段落文本（不显示数字标记）
  let fullText = paragraphs.join('\n\n');

  // 检查字数并截断（Deep 可适当放宽）
  const words = fullText.split(/\s+/).length;
  if (words > config.maxWords * 1.3) {
    // 简单截断到合理范围
    fullText = truncateToWordLimit(fullText, config.maxWords);
  }

  return {
    text: fullText,
    wordCount: words,
  };
}
```

### 2. 语气调整函数

实现 `applyTone(text, tone)` 函数：

```javascript
function applyTone(text, tone) {
  // 根据语气微调文本
  switch (tone) {
    case 'warm':
      // 保持原样，warm 是默认共情风格
      return text;
    case 'direct':
      // 去掉过多情感表达，更直接
      return text
        .replace(/That's a really common but frustrating/i, 'This is a common')
        .replace(/genuinely /gi, '')
        .replace(/Take a breath\. /gi, '')
        .replace(/You're not alone in this\. /gi, '');
    case 'expert':
      // 更结构化，使用更多学术表达
      return text
        .replace(/I know this can feel/i, 'From a methodological perspective, this')
        .replace(/I wouldn't start by/i, 'The recommended approach is to');
    case 'casual':
      // 更口语化
      return text
        .replace(/I wouldn't start by/i, "Don't just")
        .replace(/A useful way to think about this/i, 'One way to think about it')
        .replace(/I recommend/i, 'I\'d say');
    default:
      return text;
  }
}
```

### 3. CTA 选择函数

实现 `selectCTA(template, ctaLevel, version)` 函数：

```javascript
function selectCTA(template, ctaLevel, version) {
  // Short 版本不放 CTA（除非 Direct）
  if (version === 'short' && ctaLevel !== 'direct') return null;

  // Deep 版本可放稍强的 CTA
  const effectiveLevel = version === 'deep' && ctaLevel === 'soft' ? 'medium' : ctaLevel;

  switch (effectiveLevel) {
    case 'none':
      return 'Hope that helps.';
    case 'soft':
      // 从 template 默认 CTA 或 checklist 库中选
      return template.logic.cta || CTA_LIBRARY.checklist[0];
    case 'medium':
      // 从 template 或 light_diagnosis 中选
      return CTA_LIBRARY.light_diagnosis[Math.floor(Math.random() * CTA_LIBRARY.light_diagnosis.length)];
    case 'direct':
      return CTA_LIBRARY.service_aware[Math.floor(Math.random() * CTA_LIBRARY.service_aware.length)];
    default:
      return template.logic.cta || 'Hope that helps.';
  }
}
```

注意：CTA 选择要考虑上下文。如果用户问题明确在找服务（problemType 为 english_editing），则 CTA 可适度加强；如果问题类型是 thesis_structure 或 revise_resubmit_anxiety（情感支持为主），则 CTA 保持弱势。

### 4. 字数截断函数

```javascript
function truncateToWordLimit(text, maxWords) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  // 在 maxWords 处截断，然后在最后一个句号处结束
  const truncated = words.slice(0, maxWords).join(' ');
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > maxWords * 0.7) {
    return truncated.substring(0, lastPeriod + 1);
  }
  return truncated + '...';
}
```

### 5. 生成按钮功能

点击 "生成回复草稿 ✨" 按钮时：

a) **输入验证**
   - 如果 `state.sourceText` 为空（去除空白后），显示错误提示："请先粘贴 Reddit 评论或帖子内容。"
   - 错误提示用红色文字显示在生成按钮下方，3 秒后自动消失

b) **生成状态**
   - 设置 `state.isGenerating = true`
   - 按钮文字变为 "生成中..."
   - 按钮 disabled
   - 模拟 800ms 延迟（让用户感知处理过程，后续可接入真实 API）

c) **调用生成**
   - 依次调用 `generateReply('short')`, `generateReply('helpful')`, `generateReply('deep')`
   - 将结果存入 `state.replies`
   - 默认切换到 Helpful tab（`state.activeVersion = 'helpful'`）

d) **更新右侧面板**
   - 实现 `renderReply()` 函数：根据 `state.activeVersion` 显示对应回复文本
   - 回复文本以自然段落显示（段落间有间距，字体大小 15px，行高 1.7）
   - 当前选中版本的字数显示在 tab 旁边

e) **恢复按钮状态**
   - `state.isGenerating = false`
   - 按钮文字恢复为 "生成回复草稿 ✨"
   - 按钮 enabled

### 6. 版本切换 Tabs

- 点击 Short / Helpful / Deep tab 更新 `state.activeVersion` 并调用 `renderReply()`
- 当前选中 tab 高亮（蓝色底部边框 + 蓝色文字）
- 未选中 tab 灰色
- 如果对应版本尚未生成（text 为空），tab 显示为半透明 disabled 状态

### 7. 复制回复功能

点击 "📋 复制回复" 按钮时：
- 将当前激活版本的 `replyText` 写入剪贴板：`navigator.clipboard.writeText(text)`
- 复制成功后按钮文字短暂变为 "✅ 已复制"，1.5 秒后恢复
- 如果 clipboard API 不可用，使用 fallback：创建临时 textarea，select() + document.execCommand('copy')

### 8. 重新生成功能

点击 "🔄 重新生成" 按钮时：
- 重新调用 `generateReply()` 对所有三个版本
- 保持当前选中的 tab
- 刷新 `renderReply()`

### 9. 验收标准

- 输入文本后点击生成按钮，右侧显示 Helpful 版本的回复
- 三个 tab 可切换，各自显示不同长度的回复
- Short 版本约 80-120 words，无 CTA（除非 Direct）
- Helpful 版本约 150-220 words，有完整结构
- Deep 版本约 250-400 words，展开框架 + 示例 + CTA
- 复制按钮可将回复复制到剪贴板
- 重新生成按钮可刷新回复
- 不同语气选择会微调回复风格
- 生成过程中按钮不可重复点击
- 空输入提交显示错误提示

执行完这些提示词后，系统要完整可运行并且不会有任何bug，认真仔细整理提示词。
```

---

## 第四批：风险检测系统 + 输出编辑工具

```
在第三批产出的基础上，继续在 `reddit-reply-assistant/index.html` 中开发。不要创建新文件。

### 1. 风险检测引擎

实现 `detectRisks(replyText)` 函数，接受回复文本，返回风险检测结果：

```javascript
function detectRisks(replyText) {
  const risks = {
    marketing: 'low',
    compliance: 'low',
    redditCommunity: 'low',
    suggestions: [],
  };

  // 1. 合规风险检测（banned 词）
  for (const item of RISK_PATTERNS.banned) {
    if (item.pattern.test(replyText)) {
      risks.compliance = 'high';
      risks.suggestions.push('🚫 ' + item.label + '：请立即删除相关表述。');
    }
  }

  // 2. 高风险检测
  for (const item of RISK_PATTERNS.highRisk) {
    if (item.pattern.test(replyText)) {
      risks.compliance = Math.max(risks.compliance === 'high' ? 'high' : 'medium', 'medium');
      risks.suggestions.push('⚠️ ' + item.label + '：建议替换为合规表述。');
    }
  }

  // 3. 营销感检测
  const dmCount = (replyText.match(/\bDM\b/gi) || []).length;
  const marketingWords = (replyText.match(/\b(service|paid|client|company|guarantee|discount|offer)\b/gi) || []).length;

  if (marketingWords >= 3 || dmCount >= 2) {
    risks.marketing = 'high';
    risks.suggestions.push('📢 营销感偏强：建议删除服务描述，只保留轻量钩子。');
  } else if (marketingWords >= 1 || dmCount >= 1) {
    risks.marketing = 'medium';
    risks.suggestions.push('💡 营销感适中：发布前请人工确认语气是否合适。');
  }

  // 4. Reddit 社区风险
  if (state.ctaLevel === 'medium' || state.ctaLevel === 'direct') {
    risks.redditCommunity = 'medium';
    risks.suggestions.push('📋 发布前建议检查 r/' + (state.subreddit || '该subreddit') + ' 是否允许 self-promotion 或 DM 引导。');
  }
  if (state.ctaLevel === 'direct') {
    risks.redditCommunity = 'high';
    risks.suggestions.push('🔴 CTA 强度为 Direct，请确保用户明确在找服务，且 subreddit 规则允许。');
  }

  // 5. 回复结构检查
  if (replyText.indexOf('DM me') === 0 || replyText.indexOf('Contact') === 0) {
    risks.marketing = 'high';
    risks.suggestions.push('📢 回复不能以 CTA 开头。请确保先提供实质帮助，再放钩子。');
  }

  return risks;
}
```

### 2. 风险显示 UI

生成回复后，调用 `detectRisks()` 并将结果渲染到右侧风险检测区：

a) **风险状态颜色**
   - 全部 low：绿色边框，绿色背景（#f5fdf7），显示 "✅ 风险检测通过"
   - 有 medium：黄色边框，黄色背景（#fffdf5），显示 "⚠️ 有中度风险提示"
   - 有 high：红色边框，红色背景（#fff5f5），显示 "🔴 有高风险项需处理"

b) **建议列表**
   - 每条 suggestion 用列表项显示
   - 高风险项目红色文字，中度黄色，低风险绿色

c) **合规替换建议**
   - 如果检测到 banned/highRisk 词，额外显示一段替换建议
   - 例如检测到 "guaranteed acceptance"，显示：
     ```
     💡 建议替换："guaranteed acceptance" → "improve manuscript competitiveness"
     ```

### 3. 输出编辑工具按钮

实现以下编辑功能按钮（放在回复卡片下方操作按钮行中）：

a) **📏 缩短**
   - 将当前版本回复缩短约 30%
   - 保留核心结构（empathy + diagnosis），压缩 framework 和 example
   - 实现逻辑：取前 60-70% 的句子，确保在最后一个完整句子结束

b) **📝 展开**
   - 将当前版本回复展开约 40%
   - 在 framework 部分增加更多细节，example 部分增加更多解释
   - 注意：展开后不要超过对应版本的字数上限

c) **🧹 降低营销感**
   - 扫描回复文本
   - 移除或弱化营销性表达：
     - "DM me" → 替换为更轻的表达
     - "service" → 替换为 "support" 或 "help"
     - "paid" → 移除
     - 自我介绍超过 1 句 → 精简为 1 句
   - 重新检测风险并更新风险显示

d) **📢 增强 CTA**
   - 仅在 CTA 强度不是 Direct 时可用
   - 将 CTA 强度临时提升一级（soft → medium, medium → direct）
   - 按钮旁边显示提示："此操作会增强营销感，请谨慎使用"

e) **🚫 移除 CTA**
   - 移除回复末尾的 CTA 钩子
   - 替换为 "Hope that helps." 或直接删除
   - 更新风险检测（marketing 风险降低）

f) **✏️ 局部重写按钮组**（放在编辑按钮行下方，用分隔线隔开）
   - [重写开头] — 重新生成共情部分
   - [重写诊断] — 重新生成问题判断部分
   - [重写示例] — 重新生成示例句
   - [重写结尾] — 重新生成 CTA 部分

实现这些功能时，每个按钮点击后：
1. 修改 `state.replies[activeVersion].text`
2. 重新调用 `detectRisks()` 更新风险检测
3. 调用 `renderReply()` 刷新显示

### 4. 验收标准

- 生成回复后，风险检测区自动显示风险等级和建议
- 合规风险（banned 词）标记为高风险红色
- 营销风险根据关键词数量分级显示
- "缩短"按钮有效减少字数约 30%
- "展开"按钮有效增加内容
- "降低营销感"按钮可移除 DM me 等营销表达
- "移除 CTA" 按钮清除末尾钩子
- "增强 CTA" 仅在非 Direct 时可用
- 局部重写按钮各自生效
- 所有编辑操作后风险检测自动更新

执行完这些提示词后，系统要完整可运行并且不会有任何bug，认真仔细整理提示词。
```

---

## 第五批：CTA 强度建议面板 + 使用说明 + 历史记录

```
在第四批产出的基础上，继续在 `reddit-reply-assistant/index.html` 中开发。不要创建新文件。

### 1. CTA 建议面板（右侧底部）

在风险检测区下方的浅绿色 CTA 建议区中，实现以下内容：

a) **当前 CTA 策略说明**
   根据 `state.ctaLevel` 显示当前策略说明：
   - None：显示 "当前：无 CTA。回复仅提供帮助，不包含任何钩子。适合严肃学术讨论和高规则严格社区。"
   - Soft：显示 "当前：轻钩子。使用低压力的 checklist/template 邀请。默认策略，适合大多数场景。"
   - Medium：显示 "当前：中度钩子。引导用户私信关键词索要资源。仅在用户明确想获取资料时使用。"
   - Direct：显示 "当前：直接钩子。明确邀请咨询。⚠️ 仅适合用户明确在找服务的高意向场景。"

b) **替代 CTA 建议**
   显示 2-3 条来自 CTA_LIBRARY 的替代钩子文案：
   - 根据当前 `ctaLevel` 选择对应级别的钩子
   - 每条可点击复制（点击后按钮变 "✅" 1.5 秒）
   - 如果 ctaLevel 为 none，显示 "当前无 CTA" 并给出轻钩子作为参考

c) **CTA 频率提醒**
   显示一条运营提醒：
   ```
   💡 运营建议：同一账号最近 10 条评论中，带 CTA 的评论建议不超过 2-3 条。
   ```

### 2. 模板匹配提示

在问题类型下拉框右侧，添加一个小信息图标（ℹ️），hover 时显示 tooltip：
```
此问题类型将使用预设的回复逻辑：
- 共情角度：[模板的 empathy 前 50 字]
- 诊断方向：[模板的 diagnosis 前 50 字]
- 默认 CTA：[模板的 cta]
```

### 3. 使用说明面板

点击底部工具栏 "📖 使用说明" 按钮时，展开面板显示：

```
📖 使用说明

1. 在 Reddit 上看到相关讨论时，复制评论或帖子原文
2. 粘贴到左侧输入框（必填），可选填写帖子标题和 subreddit
3. 选择问题类型 — 系统会自动匹配最佳回复逻辑
4. 选择合适的语气：Warm（焦虑/情感类）、Direct（技术类）、Expert（学术类）、Casual（轻松类）
5. 选择 CTA 强度：默认 Soft（轻钩子），根据场景调整
6. 点击生成 → 在 Short / Helpful / Deep 三个版本中切换
7. 检查风险提示 → 必要时使用编辑工具调整
8. 人工审核 → 复制 → 手动粘贴到 Reddit 发布

⚠️ 重要提醒：
- 本工具生成的是回复草稿，仅供人工参考
- 请在发布前仔细审核每条回复
- 务必遵守各 subreddit 的社区规则
- 不要使用自动发帖或批量评论工具
- 建议每条回复根据实际情况进行个性化调整
```

### 4. 回复历史记录（简易版）

在左侧控制区底部（生成按钮下方），添加一个历史记录区：

a) **存储逻辑**
   - 每次点击"生成回复草稿"成功后，将当前输入和输出存入 `localStorage`
   - 键名：`reddit-reply-history`
   - 存储结构：
     ```javascript
     {
       id: Date.now(),
       timestamp: new Date().toISOString(),
       input: {
         sourceText: state.sourceText.substring(0, 100) + '...',
         problemType: state.problemType,
         tone: state.tone,
         ctaLevel: state.ctaLevel,
       },
       output: {
         version: 'helpful',
         text: state.replies.helpful.text,
       },
     }
     ```
   - 最多保留最近 20 条记录

b) **显示**
   - 在左侧底部显示 "📜 最近生成记录" 标题
   - 每条记录显示：时间戳 + 问题类型标签 + 输入文本前 60 字预览
   - 点击记录可恢复到当时的输入参数 + 生成的回复
   - 点击记录旁的 × 按钮可删除单条记录
   - 底部显示 "清空全部记录" 链接

c) **恢复功能**
   - 点击历史记录时：
     - 恢复所有输入参数（sourceText, problemType, tone, ctaLevel 等）
     - 恢复对应的输出
     - 自动滚动到右侧查看回复

### 5. 验收标准

- CTA 建议面板根据当前 CTA 强度显示对应策略说明
- 替代 CTA 可点击复制
- 问题类型 ℹ️ 图标 hover 显示模板信息
- 使用说明面板可展开/关闭，内容清晰
- 生成回复后历史记录自动保存到 localStorage
- 关闭页面重新打开后，历史记录仍然存在
- 点击历史记录可恢复输入和输出
- 可单独删除或清空历史记录

执行完这些提示词后，系统要完整可运行并且不会有任何bug，认真仔细整理提示词。
```

---

## 第六批：边缘情况处理 + 响应式适配 + 导航集成 + 最终验收

```
在第五批产出的基础上，继续在 `reddit-reply-assistant/index.html` 中开发。这是最后一批。

### 1. 边缘情况处理

a) **空输入保护**
   - 生成按钮点击时，如果 `sourceText` 为空 → 显示红色错误提示，不执行生成
   - 如果 `sourceText` 少于 20 个字符 → 显示黄色警告 "输入内容较短，生成结果可能不够精准。是否继续？" 并提供 [继续] 和 [取消] 按钮

b) **超长输入处理**
   - 如果 `sourceText` 超过 2000 个字符 → 显示提示 "输入内容较长（{N} 字符），已自动截取前 2000 字符进行处理。"
   - 实际处理时截取前 2000 字符

c) **特殊字符处理**
   - 输入中的 HTML 标签（如 `<div>`, `<script>`）→ 自动转义，防止 XSS
   - 实现 `escapeHtml(text)` 函数并在渲染时使用

d) **生成失败处理**
   - 如果 `generateReply()` 抛出异常 → catch 后显示 "生成失败，请稍后重试。如果问题持续出现，请刷新页面。"
   - 错误状态显示在右侧回复区

e) **网络离线提示**
   - 虽然工具是纯前端，但检查 `navigator.onLine`
   - 如果离线，在顶部显示黄色提示条："当前处于离线状态，工具仍可正常使用，但复制到剪贴板的功能可能受限。"

f) **浏览器兼容性**
   - 检测 `navigator.clipboard` 是否可用
   - 不可用时使用 fallback 方案（textarea + execCommand）
   - 检测 `localStorage` 是否可用，不可用时历史记录功能静默禁用

g) **localStorage 配额**
   - 写入 localStorage 时用 try-catch 包裹
   - 配额满时提示用户清理历史记录

### 2. 响应式适配

a) **断点：≤900px（平板/小屏）**
   - 布局从左右分栏切换为上下堆叠
   - 左侧控制区宽度变为 100%，最大高度 50vh
   - 右侧输出区宽度变为 100%
   - 顶部导航栏高度不变

b) **断点：≤640px（手机）**
   - 字体大小适当缩小（14px）
   - 语气选择卡片改为 2×2 网格
   - CTA 强度按钮改为垂直排列
   - 操作按钮改为 2 列网格
   - 回复区 padding 减小为 16px

c) **响应式实现**
   - 使用 CSS media query，不要用 JavaScript 检测宽度
   - 所有尺寸使用相对单位或 CSS 变量，方便调整

### 3. 导航集成

a) **顶部导航栏**
   - 左侧：logo/title "🧠 Reddit 评论回复助手"
   - 右侧：三个导航链接：
     - "← 封面生成器" → `../index.html`
     - "📱 Instagram 图" → `../ins_reviewer_carousel/`
     - "运营工具台" → `../index.html`

b) **移动端导航**
   - 宽度 ≤640px 时，导航链接收起到汉堡菜单
   - 点击汉堡图标展开下拉菜单

c) **页面标题**
   - `<title>` 标签设置为 "Reddit 评论回复助手 - 学术运营工具台"

### 4. 键盘快捷键

实现以下快捷键：

- `Ctrl/Cmd + Enter`：生成回复草稿
- `Ctrl/Cmd + 1/2/3`：切换到 Short / Helpful / Deep tab
- `Ctrl/Cmd + C`（在回复区聚焦时）：复制当前回复
- `Esc`：关闭任何打开的面板（CTA 库、使用说明等）

在页面底部添加一个不显眼的 "⌨️ 快捷键" 提示，hover 显示快捷键列表。

### 5. 页面加载动画

- 页面首次加载时，各区域有轻微的淡入动画（fadeInUp，duration 0.3s，stagger 0.05s）
- 生成回复时，右侧回复区有轻微的骨架屏效果（pulse animation）

### 6. 无障碍增强

- 所有按钮添加 `aria-label`
- 表单控件添加对应的 `<label>` 或 `aria-labelledby`
- tab 切换支持键盘导航（左右箭头键）
- 风险等级用颜色 + 文字 + aria-label 三重表达

### 7. 最终验收标准

**功能验收：**
- 用户能输入 Reddit 评论并生成 Short/Helpful/Deep 三个版本的可用回复
- 8 种问题类型各有独立的回复逻辑，生成结果准确、相关
- 4 种语气能明显改变回复风格
- 4 种 CTA 强度能正确控制钩子策略
- 风险检测覆盖合规、营销、社区三类风险
- 所有编辑工具按钮功能正常
- 历史记录正确存取和恢复
- 在 Chrome、Safari、Firefox 最新版中功能一致

**内容验收：**
- 回复先提供实质帮助，再考虑 CTA
- 回复不像广告、不像 AI 模板
- 回复不包含 banned 词汇（guaranteed acceptance / ghostwriting / contract cheating 等）
- CTA 低压、自然、可删除

**鲁棒性验收：**
- 空输入不崩溃，有错误提示
- 超长输入有截断提示
- 特殊字符正确转义
- localStorage 不可用时历史记录静默降级
- 所有编辑操作后风险检测自动更新
- 响应式布局在大屏/平板/手机上都可用

**集成验收：**
- 顶部导航链接指向正确
- 可从主站 index.html 导航到此页面
- 页面标题正确
- 浏览器 console 无任何错误

### 8. 提交清单

完成开发后，确认以下文件已创建/修改：
- `reddit-reply-assistant/index.html` — 新增，完整功能
- `index.html` — 如需添加导航链接（可选）

执行完这些提示词后，系统要完整可运行并且不会有任何bug，认真仔细整理提示词。
```

---

## 附录：开发优先级与迭代建议

| 批次 | 内容 | 预计产出 | 依赖 |
|------|------|----------|------|
| 第一批 | 页面骨架 + 状态管理 | 可交互的空壳页面 | 无 |
| 第二批 | 模板数据 + CTA 库 | 数据层完整 | 第一批 |
| 第三批 | 生成引擎 + 版本输出 | 核心功能可用的 MVP | 第二批 |
| 第四批 | 风险检测 + 编辑工具 | 安全与编辑能力 | 第三批 |
| 第五批 | CTA 建议 + 历史记录 | 辅助运营功能 | 第四批 |
| 第六批 | 边缘情况 + 响应式 + 集成 | 完整可上线版本 | 第五批 |

**建议：**
- 第三批完成后即可进行内部试用（MVP）
- 第四批完成后可小范围运营测试
- 第六批完成后正式上线

---

> 提示词编写完成。请按批次顺序复制执行，每批次确认无误后再进入下一批次。
> 所有提示词末尾均包含质量检查要求，确保渐进式开发中系统始终保持可运行状态。
