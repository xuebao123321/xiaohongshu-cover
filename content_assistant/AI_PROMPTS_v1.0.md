# Instagram 内容策划助手 · 多批次 AI 构建提示词 v1.0

> **用途**: 用户按顺序逐条复制每条提示词，喂给 AI 编程助手（Claude Code / Cursor / Copilot）
> **目标**: 在现有 `cover-maker/` 项目基础上，基于 `instagram_content_assistant_dev_doc.md` 开发文档，从零构建完整可运行的 Instagram 内容策划助手
> **版本**: v1.0（2026-07-04）
> **配套文件**: `instagram_content_assistant_dev_doc.md`（开发文档，必读）
> **执行原则**: 严格按 7 个批次顺序执行，每条提示词末尾固定结束语是质量验收闸门

---

## 📋 总体执行规则

1. **顺序执行**: 必须按 批次 1 → 2 → 3 → 4 → 5 → 6 → 7 顺序执行，不可跳批
2. **每条提示词末尾固定结束语**:
   ```
   执行完这些提示词后，系统要完整可运行并且不会有任何bug
   ```
   AI 输出完成后，必须自己验证满足此条；不满足则继续修复直到满足
3. **每批次结束运行验证命令**: 见每批次末尾的"批次验收"小节
4. **任何批次失败**: 先修复当前批次再继续，不要带着 bug 进入下一批
5. **跨批次的引用**: 后续批次提示词中标注的"前置产物"是输入；AI 需先读取它们再开工
6. **项目路径**: 所有操作基于 `/Users/andy/Documents/Andy AI/cover-maker/`

---

## 批次 1 · Cloudflare Worker API 代理层

> **目标**: 在现有 `src/worker.js` 中新增 3 个 API 路由，安全代理 DeepSeek API 调用
> **前置**: 开发文档已阅读，现有 worker.js 已理解

### 提示词 1.1 · 阅读现有 Worker 并新增 Instagram 内容生成 API

```
你是一名资深全栈工程师，熟悉 Cloudflare Workers。请按以下步骤，在现有 worker 中新增 Instagram 内容策划助手的 API 路由。

【第一步：阅读现有代码】
1. 使用 Read 工具完整阅读 /Users/andy/Documents/Andy AI/cover-maker/src/worker.js
2. 使用 Read 工具完整阅读 /Users/andy/Documents/Andy AI/cover-maker/wrangler.toml
3. 使用 Read 工具完整阅读 /Users/andy/Documents/Andy AI/cover-maker/content_assistant/instagram_content_assistant_dev_doc.md
   重点关注：第 5 节（模型适配层）、第 9 节（API 设计）、第 11 节（Prompt 设计）、第 21 节（Worker 伪代码）、第 22 节（错误处理）

【第二步：在 worker.js 中新增以下内容】

在 handleApi 函数中新增 3 个路由（插入到现有路由之后、catch 之前）：
- POST /api/generate-instagram-content → 生成完整内容包
- POST /api/rewrite-instagram-content → 改写内容
- POST /api/generate-reels-video-plan → 生成 Reels 分镜

【第三步：新增函数实现】

3.1 模型调用抽象函数 callModel(env, messages)：
- 从 env 读取 MODEL_BASE_URL、MODEL_NAME、DEEPSEEK_API_KEY
- POST 到 `${env.MODEL_BASE_URL}/chat/completions`
- 默认 model 为 deepseek-chat，temperature 0.7
- 设置 response_format: { type: "json_object" }
- 返回解析后的 JSON 对象
- 如果 JSON.parse 失败，尝试修复常见问题（尾部逗号、未闭合括号、markdown代码块包裹）
- 修复失败则重试一次，仍失败返回结构化错误

3.2 handleGenerateInstagramContent(request, env)：
- 解析请求 body，提取 sourceType, sourceText, audience, goal, painPoint, formats, tone, ctaLevel, languageMode
- 校验必填字段 sourceText（非空，最长 8000 字符）
- 校验 formats 数组有效
- 构建 system prompt（严格按开发文档第 11.1 节）
- 构建 user prompt（严格按开发文档第 11.2 节模板，用请求参数替换占位符）
- 调用 callModel(env, messages)
- 对返回结果做合规检测（检查高风险词列表，见开发文档第 14 节）
- 如果检测到高风险词，在 complianceNotes 和 riskFlags 中标记
- 返回完整 JSON 响应（结构见开发文档第 9.1 节响应格式）

3.3 handleRewriteInstagramContent(request, env)：
- 解析请求 body，提取 contentType, content, rewriteGoal, tone
- 校验必填字段
- 构建改写 prompt：
  system: "You are an Instagram content editor for an academic writing coaching service. Rewrite the given content according to the goal. Output valid JSON only: { "rewritten": "..." }"
  user: "Content type: {contentType}\nContent: {content}\nRewrite goal: {rewriteGoal}\nTone: {tone}\n\nReturn JSON with the rewritten content."
- 调用 callModel
- 返回 { rewritten: "..." }

3.4 handleGenerateReelsVideoPlan(request, env)：
- 解析请求 body，提取 script, duration, template
- 根据 Reels 脚本生成 scenes.json（结构见开发文档第 9.3 节）
- system prompt: "You are a video production assistant. Given a Reels script, output a shot-by-shot video plan. Output valid JSON only."
- 返回 scenes 数组

【第四步：限流中间件】

新增 rateLimit(env, request) 函数：
- 使用简单的 IP-based 计数（存在内存 Map 或 env 变量中）
- 单 IP 每分钟最多 10 次请求
- 超限返回 429 + { ok: false, error: "Too many requests" }

在 handleApi 函数开头调用 rateLimit 检查。

【第五步：CORS 处理】

在 json() 响应函数中（或新增一个带 CORS 的响应函数）添加 CORS 头：
- Access-Control-Allow-Origin: *（或从请求 Origin 动态设置）
- Access-Control-Allow-Methods: POST, OPTIONS
- Access-Control-Allow-Headers: Content-Type
- 处理 OPTIONS 预检请求

确保前端跨域调用不被拦截。

【验收标准】
- src/worker.js 文件完整无语法错误
- 3 个 API 路由正确注册
- callModel 函数能处理 JSON 解析失败并重试
- 合规检测逻辑能标记高风险词
- 限流逻辑可用（不影响本地开发）
- CORS 头正确设置

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 1 验收

```
用 Bash 执行: node -e "import('./src/worker.js').then(m => console.log('Worker module syntax OK:', Object.keys(m)))"
预期: 无语法错误，模块正常导出
```

---

## 批次 2 · Instagram 内容策划助手页面 - HTML 结构与 CSS 样式

> **目标**: 创建 `/instagram-content-assistant/index.html` 页面，完成完整的 HTML 结构和 CSS 样式
> **前置**: 批次 1 完成（Worker API 已就绪）

### 提示词 2.1 · 创建完整 HTML 页面（结构与样式）

```
你是一名资深前端工程师，擅长设计运营工具界面。请创建 Instagram 内容策划助手的完整 HTML 页面。

【第一步：阅读参考文件】
1. 使用 Read 工具阅读 /Users/andy/Documents/Andy AI/cover-maker/index.html（前 200 行，理解设计系统和 CSS 变量风格）
2. 使用 Read 工具阅读 /Users/andy/Documents/Andy AI/cover-maker/content_assistant/instagram_content_assistant_dev_doc.md
   重点关注：第 6 节（页面信息架构）、第 7 节（用户流程）、第 8 节（输入字段）、第 10 节（输出数据结构）、第 18 节（UI 功能清单）

【第二步：创建文件】
在 /Users/andy/Documents/Andy AI/cover-maker/content_assistant/ 下创建 index.html

【第三步：HTML 结构要求】

页面采用左右两栏布局（与开发文档第 6 节信息架构图一致）：

```
┌──────────────────────────────────────────────┐
│ 顶部 Header：标题 + 副标题                     │
├───────────────────────┬──────────────────────┤
│ 左侧输入与策略区（40%）  │ 右侧生成结果区（60%）  │
│                       │                      │
│ 📝 输入素材            │ 📱 Carousel 文案      │
│   [素材类型下拉]        │   [7页卡片展示]       │
│   [素材文本输入框]      │                      │
│                       │ 🎬 Reels 脚本         │
│ 🎯 内容策略             │   [口播稿+时间轴]     │
│   [目标人群]           │                      │
│   [内容目标]           │ 📝 Caption            │
│   [痛点类型]           │   [文案展示]          │
│   [内容形式 多选]       │                      │
│   [语气]              │ #️⃣ Hashtags           │
│   [CTA强度]           │   [标签列表]           │
│                       │                      │
│ [🚀 生成内容包] 按钮    │ 💬 DM 钩子            │
│                       │ 📊 Story 问答          │
│                       │ ⚠️ 合规提示            │
│                       │                      │
│                       │ [操作按钮组]           │
│                       │ 复制 | 改写 | 发送到   │
│                       │ Carousel生成器         │
├───────────────────────┴──────────────────────┤
│ 底部：历史记录 / 快捷操作                       │
└──────────────────────────────────────────────┘
```

具体 HTML 结构：

1. **Header 区域**
   - 标题："📱 Instagram 内容策划助手"
   - 副标题："把 Reddit 痛点、审稿意见、论文写作问题转成 Carousel 文案、Reels 脚本和私信转化钩子"
   - 返回首页链接

2. **左侧输入区（.input-panel）**
   - 素材类型选择器 sourceType（select）：topic / reddit_post / reviewer_comment / student_consultation / weak_sentence / analysis_result
   - 素材文本输入 sourceText（textarea，至少 6 行，placeholder："粘贴 Reddit 帖子、审稿意见、学生咨询记录，或直接输入一句选题..."）
   - 内容策略区（字段分组）：
     - 目标人群 audience（select）：Chinese PhD / ESL researcher / Master student / Medical student / CS student / Engineering PhD / Bioinformatics researcher / General academic audience
     - 内容目标 goal（select）：reach 涨粉 / save 收藏 / dm 私信 / diagnosis 免费诊断 / trust 专业度 / education 教育
     - 痛点类型 painPoint（select）：reviewer_response / lack_of_novelty / writing_unclear / journal_selection / ai_polishing / english_editing / method_unclear / discussion_weak / cover_letter / introduction_structure
     - 内容形式 formats（checkbox 多选）：carousel / reels / caption / hashtags / story / dm_hook，默认全选
     - 语气 tone（select）：professional / warm / direct / slightly_bold / educational / expert / casual，默认 professional
     - CTA 强度 ctaLevel（select）：none / soft / medium / direct，默认 soft
     - 语言模式 languageMode（select）：english / bilingual / chinese，默认 bilingual
   - 生成按钮（主按钮，大号，醒目）："🚀 生成 Instagram 内容包"
   - 加载状态指示器（生成中显示 spinner + "AI 正在策划内容..."）

3. **右侧结果区（.result-panel）**
   - 初始空状态：显示引导文案 "👈 在左侧输入素材并点击生成，AI 将为你策划 Instagram 内容包"
   - 生成后显示以下 Tab 或折叠面板：
     - 📱 Carousel 文案（7 页卡片式展示，每页显示 slide 编号、role 标签、title、body）
     - 🎬 Reels 脚本（显示 hook、完整口播稿、时间轴、屏幕文字、B-roll 建议、CTA）
     - 📝 Caption（显示 firstLine + 完整 caption + CTA）
     - #️⃣ Hashtags（标签云展示，每个标签可点击复制）
     - 💬 DM 钩子（显示私信引导文案）
     - 📊 Story 问答（显示 poll 和 question 类型）
     - ⚠️ 合规提示（如有风险标记，红色警告框提示）
   - 每个内容块右上角有复制按钮 📋
   - 结果区底部有操作按钮组：
     - "📋 复制全部" → 复制所有内容到剪贴板
     - "🖼️ 发送到 Carousel 生成器" → 写入 localStorage 并跳转
     - "🔄 改写" → 弹出改写选项
     - "📥 导出 JSON" → 下载完整 JSON

4. **底部区域**
   - 历史记录列表（从 localStorage 读取，显示最近 5 条）
   - 每条显示：时间、topic、sourceType，点击可恢复

【第四步：CSS 样式要求】

4.1 设计风格：
- 与主站 index.html 保持一致的设计语言
- 背景色：#f7f5f2
- 卡片背景：#fff，边框 1.5px solid #e8e4df，圆角 12-14px
- 主色调：#1a1a1a（文字）、#1f4b73（链接/强调）、#ED0108（CTA/警告）
- 字体：借鉴 index.html 的字体栈 "Noto Serif SC", "PingFang SC", "Microsoft YaHei", serif
- 引入 Google Fonts：Noto Sans SC (400,700,900), Noto Serif SC (700,900)

4.2 布局：
- 使用 CSS Grid 实现左右两栏：grid-template-columns: 1fr 1.5fr（或 40% 60%）
- 响应式：屏幕 < 768px 时切换为单列上下布局
- 最大宽度 1200px，居中

4.3 组件样式：
- 输入框：高度 44px，边框 1.5px solid #e8e4df，圆角 10px，focus 时边框变 #5a8cb8
- Select 下拉：与输入框一致风格
- 多选框：自定义样式或使用标准 checkbox + label
- 按钮：主按钮背景 #1a1a1a 文字白色，次要按钮背景白色边框 #e0dcd6
- Tab/折叠面板：使用 CSS 实现切换，默认显示 Carousel tab
- 加载 spinner：CSS 动画旋转
- 空状态：居中灰色提示文字
- 复制按钮：小图标按钮，hover 变色

4.4 Carousel 幻灯片卡片样式：
- 每张卡片白色背景，左边框彩色条（根据 slide role 不同颜色）
  - hook: #ED0108（红色）
  - common_mistake: #f0a030（橙色）
  - diagnosis: #5a8cb8（蓝色）
  - framework: #4caf50（绿色）
  - example: #9c27b0（紫色）
  - checklist: #00bcd4（青色）
  - cta: #ED0108（红色）
- 显示 slide 编号（圆形数字）、role 标签（小胶囊）、title、body

4.5 Hashtag 标签云：
- 每个标签：inline-block，背景 #eef4f8，文字 #1f4b73，圆角 20px，padding 4px 12px
- hover 效果

4.6 合规警告框：
- 背景 #fff5f5，边框 #ED0108，左侧红色竖条
- 列出 riskFlags 中的高风险词
- 显示替代表达建议

4.7 响应式设计：
- 768px 以下：左右布局变上下布局
- 480px 以下：进一步缩小间距和字号
- 确保在手机上可操作

【验收标准】
- index.html 文件完整，HTML 结构完整覆盖所有字段和结果区域
- CSS 样式完整，能在浏览器中正确渲染
- 布局响应式可用
- Carousel 卡片有颜色区分
- 加载和空状态正确显示
- 文件大小合理（HTML + CSS 预计 800-1500 行）

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 2 验收

```
用 Bash 执行: wc -l /Users/andy/Documents/Andy\ AI/cover-maker/content_assistant/index.html
预期: 文件存在且行数 >= 400
用浏览器打开 file:// 路径查看样式是否正确
```

---

## 批次 3 · 页面交互逻辑 - 表单、API 调用、结果渲染

> **目标**: 为页面添加完整的 JavaScript 交互逻辑，实现表单提交、API 调用、结果渲染
> **前置**: 批次 1（Worker API）+ 批次 2（HTML 页面）

### 提示词 3.1 · 实现核心 JavaScript 交互逻辑

```
你是一名资深前端工程师。请为 Instagram 内容策划助手页面添加完整的 JavaScript 交互逻辑。

【第一步：阅读文件】
1. 使用 Read 工具完整阅读 /Users/andy/Documents/Andy AI/cover-maker/content_assistant/index.html（批次 2 产物）
2. 使用 Read 工具阅读 /Users/andy/Documents/Andy AI/cover-maker/config.example.js（了解 API 配置模式）
3. 使用 Read 工具阅读 /Users/andy/Documents/Andy AI/cover-maker/content_assistant/instagram_content_assistant_dev_doc.md
   重点关注：第 9 节（API 设计）、第 15 节（与 Carousel 生成器打通）、第 16 节（与 Reddit Radar 打通）、第 17 节（历史记录）

【第二步：在 index.html 的 </body> 前添加 <script> 标签】

实现以下 JavaScript 功能模块：

══════════════════════════
模块 A：配置与常量
══════════════════════════

```js
// API 地址（Cloudflare Worker）
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8787'
  : 'https://xiaohongshu-cover.YOUR-WORKER.workers.dev'; // 替换为实际 Worker 域名

// 内容栏目列表
const CONTENT_PILLARS = [
  'Reviewer Says',
  'Before / After Rewrite',
  'Chinese PhD Mistakes',
  'SCI Writing Framework',
  'Checklist',
  'AI Writing Risk',
  'Journal Selection',
  'Advisor Feedback Decoder'
];

// 高风险词列表（用于前端合规检测）
const HIGH_RISK_WORDS = [
  'guaranteed acceptance', 'guaranteed publication', 'we write your paper',
  'ghostwriting', 'publish it for you', 'contract cheating', 'fake data',
  'do your assignment', '代写', '包发表', '保录用'
];

// 替代表达映射
const SAFE_ALTERNATIVES = {
  'ghostwriting': 'academic writing coaching',
  'guaranteed acceptance': 'improve your chances',
  'guaranteed publication': 'strengthen your manuscript',
  'we write your paper': 'we coach your writing',
  '代写': '学术写作辅导',
  '包发表': '提升发表机会',
  '保录用': '优化投稿策略'
};
```

══════════════════════════
模块 B：DOM 元素引用
══════════════════════════

- 获取所有输入控件引用（sourceType, sourceText, audience, goal, painPoint, formats checkboxes, tone, ctaLevel, languageMode）
- 获取生成按钮、加载指示器引用
- 获取结果面板容器引用
- 获取各内容展示区域引用
- 获取操作按钮引用（复制全部、发送到 Carousel、改写、导出 JSON）

══════════════════════════
模块 C：表单数据收集
══════════════════════════

```js
function collectFormData() {
  // 收集所有选中的 formats（checkbox）
  const formats = [];
  document.querySelectorAll('input[name="formats"]:checked').forEach(cb => formats.push(cb.value));

  return {
    sourceType: document.getElementById('sourceType').value,
    sourceText: document.getElementById('sourceText').value.trim(),
    audience: document.getElementById('audience').value,
    goal: document.getElementById('goal').value,
    painPoint: document.getElementById('painPoint').value,
    formats: formats.length > 0 ? formats : ['carousel', 'reels', 'caption', 'hashtags', 'story', 'dm_hook'],
    tone: document.getElementById('tone').value,
    ctaLevel: document.getElementById('ctaLevel').value,
    languageMode: document.getElementById('languageMode').value,
    brandRule: {
      noGhostwriting: true,
      noGuaranteedAcceptance: true,
      noFakeData: true,
      noDoWorkForUser: true
    }
  };
}
```

══════════════════════════
模块 D：API 调用
══════════════════════════

```js
async function generateContent() {
  const formData = collectFormData();

  // 校验：sourceText 不能为空
  if (!formData.sourceText) {
    showError('请先输入素材内容（Reddit 帖子、审稿意见或选题）。');
    return;
  }
  if (formData.sourceText.length > 8000) {
    showError('素材内容过长，请控制在 8000 字符以内。');
    return;
  }

  // 显示加载状态
  showLoading(true);
  hideError();
  hideResults();

  try {
    const response = await fetch(`${API_BASE}/api/generate-instagram-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('请求过于频繁，请稍后重试。');
      throw new Error(`API 错误 (${response.status})`);
    }

    const result = await response.json();
    if (!result.ok && result.error) {
      throw new Error(result.error);
    }

    // 保存到当前结果
    window._currentResult = result;

    // 渲染结果
    renderResults(result);

    // 保存到历史记录
    saveToHistory(formData, result);

  } catch (error) {
    showError(error.message || '生成失败，请稍后重试。');
    console.error('Generation error:', error);
  } finally {
    showLoading(false);
  }
}
```

══════════════════════════
模块 E：结果渲染
══════════════════════════

5.1 renderResults(result): 主渲染函数
- 清除结果面板的"空状态"提示
- 显示结果面板
- 调用各子渲染函数

5.2 renderCarousel(carousel):
- 渲染 7 张幻灯片卡片
- 每张卡片样式见批次 2 的 CSS 定义
- 卡片包含：圆形编号、role 标签（小胶囊，颜色对应）、title（粗体）、body
- 如果 carousel.slides 为空或长度不对，显示提示

5.3 renderReels(reels):
- 显示 duration、hook（高亮）
- 显示完整 script（保留换行）
- 显示 timeline 时间轴（表格形式：时间 | 目的 | 口播 | 屏幕文字）
- 显示 onScreenText 列表
- 显示 brollIdeas 列表
- 显示 CTA

5.4 renderCaption(caption):
- 显示 firstLine（粗体）
- 显示完整 caption（保留换行格式）
- 显示 CTA

5.5 renderHashtags(hashtags):
- 标签云展示
- 每个标签可点击复制（点击后标签短暂变色 + tooltip "已复制!"）
- 提供"复制全部标签"小按钮

5.6 renderDmHook(dmHook):
- 引号样式展示 DM 私信引导文案
- 复制按钮

5.7 renderStory(story):
- 渲染 poll 类型：问题文字 + 选项按钮（仅展示，不可交互）
- 渲染 question 类型：问题文字 + 输入框占位

5.8 renderCompliance(complianceNotes, riskFlags):
- 如果 riskFlags 非空：显示红色警告框，列出风险项和替代表达
- 如果 complianceNotes 非空：显示蓝色提示框
- 如果都没有：显示绿色 ✅ "内容合规检查通过"
- 提供"降低风险重写"按钮

5.9 renderTopicAngle(result):
- 在结果区顶部显示：topic + angle + contentPillar（小标签）

══════════════════════════
模块 F：结果区 Tab 切换
══════════════════════════

- 实现 Tab 切换逻辑（Carousel | Reels | Caption | Hashtags | DM钩子 | Story | 合规）
- 默认显示 Carousel tab
- 点击 tab 切换对应内容区域显示/隐藏
- URL hash 同步（如 #carousel、#reels）

══════════════════════════
模块 G：复制功能
══════════════════════════

```js
async function copyToClipboard(text, buttonEl) {
  try {
    await navigator.clipboard.writeText(text);
    // 按钮短暂显示 "已复制!"
    if (buttonEl) {
      const originalText = buttonEl.textContent;
      buttonEl.textContent = '✅ 已复制!';
      buttonEl.style.color = '#4caf50';
      setTimeout(() => {
        buttonEl.textContent = originalText;
        buttonEl.style.color = '';
      }, 2000);
    }
  } catch (err) {
    // Fallback: 使用 textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

function copyAllContent() {
  const result = window._currentResult;
  if (!result) return;
  let text = '';
  if (result.topic) text += `📌 ${result.topic}\n`;
  if (result.angle) text += `💡 ${result.angle}\n\n`;
  if (result.carousel?.slides) {
    text += '═══ Carousel 文案 ═══\n';
    result.carousel.slides.forEach(s => {
      text += `\n第 ${s.slide} 页 [${s.role}]\n${s.title}\n${s.body || ''}\n`;
    });
  }
  if (result.reels?.script) text += `\n═══ Reels 脚本 ═══\n${result.reels.script}\n`;
  if (result.caption) text += `\n═══ Caption ═══\n${result.caption}\n`;
  if (result.hashtags?.length) text += `\n═══ Hashtags ═══\n${result.hashtags.join(' ')}\n`;
  if (result.dmHook) text += `\n═══ DM 钩子 ═══\n${result.dmHook}\n`;
  copyToClipboard(text, document.getElementById('btnCopyAll'));
}
```

══════════════════════════
模块 H：发送到 Carousel 图片生成器
══════════════════════════

```js
function sendToCarouselGenerator() {
  const result = window._currentResult;
  if (!result || !result.carousel) {
    showError('请先生成 Carousel 内容。');
    return;
  }
  localStorage.setItem('instagram_carousel_prefill', JSON.stringify({
    template: result.carousel.template || 'reviewer-response',
    style: result.carousel.style || 'academic-paper',
    slides: result.carousel.slides || [],
    caption: result.caption || '',
    hashtags: result.hashtags || [],
    cta: result.dmHook || ''
  }));
  window.location.href = '../ins_reviewer_carousel/';
}
```

══════════════════════════
模块 I：错误处理与状态管理
══════════════════════════

```js
function showLoading(show) {
  const loader = document.getElementById('loadingIndicator');
  const btn = document.getElementById('btnGenerate');
  if (loader) loader.style.display = show ? 'flex' : 'none';
  if (btn) {
    btn.disabled = show;
    btn.textContent = show ? '⏳ AI 正在策划内容...' : '🚀 生成 Instagram 内容包';
  }
}

function showError(message) {
  const el = document.getElementById('errorBanner');
  if (el) {
    el.textContent = '⚠️ ' + message;
    el.style.display = 'block';
    // 5 秒后自动隐藏
    clearTimeout(window._errorTimer);
    window._errorTimer = setTimeout(() => { el.style.display = 'none'; }, 8000);
  }
}

function hideError() {
  const el = document.getElementById('errorBanner');
  if (el) el.style.display = 'none';
}

function hideResults() {
  const panel = document.getElementById('resultPanel');
  const empty = document.getElementById('emptyState');
  if (panel) panel.style.display = 'none';
  if (empty) empty.style.display = 'flex';
}
```

══════════════════════════
模块 J：历史记录（localStorage）
══════════════════════════

```js
const HISTORY_KEY = 'instagram_content_history';
const MAX_HISTORY = 20;

function saveToHistory(formData, result) {
  try {
    const history = getHistory();
    history.unshift({
      id: 'ig_' + Date.now(),
      createdAt: new Date().toISOString(),
      sourceType: formData.sourceType,
      sourceText: formData.sourceText.substring(0, 200),
      topic: result.topic || '',
      result: result  // 保存完整结果以便恢复
    });
    // 只保留最近 MAX_HISTORY 条
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
  } catch (e) {
    console.warn('Failed to save history:', e);
  }
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function renderHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;
  const history = getHistory();
  if (history.length === 0) {
    container.innerHTML = '<div class="empty-hint">暂无历史记录</div>';
    return;
  }
  container.innerHTML = history.slice(0, 5).map((item, i) => `
    <div class="history-item" data-index="${i}">
      <span class="history-time">${formatTime(item.createdAt)}</span>
      <span class="history-topic">${escapeHtml(item.topic || '未命名')}</span>
      <span class="history-type">${escapeHtml(item.sourceType)}</span>
      <button class="btn-sm" onclick="restoreHistory(${i})">恢复</button>
    </div>
  `).join('');
}

function restoreHistory(index) {
  const history = getHistory();
  const item = history[index];
  if (!item || !item.result) return;
  window._currentResult = item.result;
  renderResults(item.result);
  // 滚动到结果区
  document.getElementById('resultPanel')?.scrollIntoView({ behavior: 'smooth' });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

══════════════════════════
模块 K：Reddit Radar 预填（读取 localStorage）
══════════════════════════

```js
function checkRedditRadarPrefill() {
  try {
    const prefillStr = localStorage.getItem('instagram_content_prefill');
    if (!prefillStr) return;
    const prefill = JSON.parse(prefillStr);
    // 清除标记（只使用一次）
    localStorage.removeItem('instagram_content_prefill');

    // 预填表单
    if (prefill.sourceType) document.getElementById('sourceType').value = prefill.sourceType;
    if (prefill.sourceText) document.getElementById('sourceText').value = prefill.sourceText;
    if (prefill.audience) document.getElementById('audience').value = prefill.audience;
    if (prefill.goal) document.getElementById('goal').value = prefill.goal;
    if (prefill.painPoint) document.getElementById('painPoint').value = prefill.painPoint;
    if (prefill.tone) document.getElementById('tone').value = prefill.tone;
    if (prefill.ctaLevel) document.getElementById('ctaLevel').value = prefill.ctaLevel;

    // 显示来源提示
    showInfo('📡 已从 Reddit Radar 带入线索，请确认信息后点击生成。');
  } catch (e) {
    console.warn('Failed to load Reddit Radar prefill:', e);
  }
}
```

══════════════════════════
模块 L：初始化
══════════════════════════

```js
document.addEventListener('DOMContentLoaded', () => {
  // 绑定生成按钮
  const btnGenerate = document.getElementById('btnGenerate');
  if (btnGenerate) btnGenerate.addEventListener('click', generateContent);

  // 绑定操作按钮
  document.getElementById('btnCopyAll')?.addEventListener('click', copyAllContent);
  document.getElementById('btnSendToCarousel')?.addEventListener('click', sendToCarouselGenerator);
  document.getElementById('btnExportJson')?.addEventListener('click', exportResultAsJson);

  // 绑定改写按钮（如果存在）
  document.getElementById('btnRewrite')?.addEventListener('click', openRewritePanel);

  // 绑定快速选题按钮
  document.querySelectorAll('.quick-topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('sourceText').value = btn.dataset.topic;
      document.getElementById('sourceType').value = 'topic';
    });
  });

  // 检查 Reddit Radar 预填
  checkRedditRadarPrefill();

  // 渲染历史记录
  renderHistory();

  // 键盘快捷键：Cmd/Ctrl + Enter 触发生成
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      generateContent();
    }
  });
});
```

══════════════════════════
模块 M：导出 JSON
══════════════════════════

```js
function exportResultAsJson() {
  const result = window._currentResult;
  if (!result) return;
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `instagram_content_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

【验收标准】
- 所有 JavaScript 函数正确实现
- 无语法错误（特别注意模板字符串中的反引号转义）
- 生成按钮点击后能正确调用 API
- 结果面板能正确渲染所有内容类型
- Tab 切换正常工作
- 复制功能可用（有 fallback）
- Reddit Radar 预填逻辑正确
- 历史记录保存和恢复可用
- 键盘快捷键 Cmd/Ctrl+Enter 可用
- 所有事件绑定在 DOMContentLoaded 之后

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 提示词 3.2 · 事件绑定与 DOM 初始化验证

```
请检查以下内容，确保所有 JavaScript 模块完整且正确：

1. 确认 index.html 中所有 id 与 JavaScript 中引用的 getElementById 完全一致
2. 确认所有事件监听器正确绑定
3. 确认模板字符串中没有嵌套的未转义反引号
4. 确认 checkRedditRadarPrefill 在 DOMContentLoaded 中调用
5. 确认 localStorage 读写有 try-catch 保护
6. 确认 API_BASE 地址在本地开发和部署环境都能正确解析
7. 确认所有按钮的 disabled 状态在加载期间正确切换

如有遗漏或错误，请修复。

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 3 验收

```
用 Bash 执行: grep -c "function\|addEventListener\|getElementById" /Users/andy/Documents/Andy\ AI/cover-maker/content_assistant/index.html
预期: 函数数 >= 15，事件监听 >= 8，DOM 引用 >= 20
```

---

## 批次 4 · 改写功能、Reels 分镜与批量选题

> **目标**: 实现改写面板、Reels 视频分镜生成、批量选题生成
> **前置**: 批次 1-3 完成

### 提示词 4.1 · 改写面板与 Reels 分镜功能

```
你是一名资深前端工程师。请为 Instagram 内容策划助手添加改写功能和 Reels 分镜功能。

【第一步：阅读当前文件】
使用 Read 工具完整阅读 /Users/andy/Documents/Andy AI/cover-maker/content_assistant/index.html

【第二步：在结果区操作按钮旁添加"改写"按钮】

如果还没有改写按钮，在结果区底部操作按钮组中添加：
```html
<button id="btnRewrite" class="btn secondary">🔄 改写内容</button>
```

【第三步：添加改写弹窗 HTML】

在 index.html 底部（</body> 前）添加改写弹窗：

```html
<!-- 改写弹窗 -->
<div id="rewriteModal" class="modal-mask" style="display:none">
  <div class="rewrite-modal">
    <div class="modal-header">
      <h3>🔄 改写内容</h3>
      <button class="modal-close" onclick="closeRewritePanel()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>要改写的内容类型</label>
        <select id="rewriteContentType">
          <option value="carousel_slide">Carousel 某页</option>
          <option value="reels_script">Reels 脚本</option>
          <option value="caption">Caption</option>
          <option value="dm_hook">DM 钩子</option>
        </select>
      </div>
      <div class="form-group" id="rewriteSlideGroup">
        <label>选择幻灯片（仅 Carousel）</label>
        <select id="rewriteSlideIndex"></select>
      </div>
      <div class="form-group">
        <label>当前内容</label>
        <textarea id="rewriteOriginalText" rows="6" readonly></textarea>
      </div>
      <div class="form-group">
        <label>改写目标</label>
        <select id="rewriteGoal">
          <option value="make_shorter">更短</option>
          <option value="make_more_professional">更专业</option>
          <option value="make_more_natural">更自然</option>
          <option value="reduce_marketing_tone">降低营销感</option>
          <option value="strengthen_cta">增强 CTA</option>
          <option value="remove_cta">移除 CTA</option>
          <option value="for_chinese_phd">更适合 Chinese PhD</option>
        </select>
      </div>
      <div class="form-group">
        <label>语气调整</label>
        <select id="rewriteTone">
          <option value="professional">professional</option>
          <option value="warm">warm</option>
          <option value="direct">direct</option>
          <option value="educational">educational</option>
          <option value="casual">casual</option>
        </select>
        <button id="btnDoRewrite" class="btn primary">✨ 改写</button>
        <button class="btn secondary" onclick="closeRewritePanel()">取消</button>
      </div>
      <div id="rewriteResult" style="display:none; margin-top:16px;">
        <label>改写结果</label>
        <div id="rewriteResultText" class="result-box"></div>
        <button class="btn primary" id="btnApplyRewrite">✅ 应用改写</button>
      </div>
    </div>
  </div>
</div>
```

改写弹窗 CSS：
- 居中固定定位弹窗，白色背景，圆角 14px
- 最大宽度 560px
- 半透明黑色遮罩
- z-index 高于结果面板

【第四步：实现改写 JavaScript 逻辑】

```js
// 改写弹窗控制
function openRewritePanel() {
  const result = window._currentResult;
  if (!result) return;
  const modal = document.getElementById('rewriteModal');

  // 填充 Carousel slide 选择器
  const slideSelect = document.getElementById('rewriteSlideIndex');
  if (slideSelect && result.carousel?.slides) {
    slideSelect.innerHTML = result.carousel.slides.map((s, i) =>
      `<option value="${i}">Slide ${s.slide}: ${(s.title || '').substring(0, 40)}</option>`
    ).join('');
  }

  // 默认显示 Carousel 第一页的内容
  updateRewriteOriginalText();

  // 监听内容类型变化，更新原文
  document.getElementById('rewriteContentType').addEventListener('change', updateRewriteOriginalText);
  document.getElementById('rewriteSlideIndex')?.addEventListener('change', updateRewriteOriginalText);

  modal.style.display = 'flex';
}

function updateRewriteOriginalText() {
  const result = window._currentResult;
  if (!result) return;
  const type = document.getElementById('rewriteContentType').value;
  let text = '';

  switch (type) {
    case 'carousel_slide':
      const idx = parseInt(document.getElementById('rewriteSlideIndex')?.value || '0');
      const slide = result.carousel?.slides?.[idx];
      text = slide ? `${slide.title}\n${slide.body || ''}` : '';
      break;
    case 'reels_script':
      text = result.reels?.script || '';
      break;
    case 'caption':
      text = result.caption || '';
      break;
    case 'dm_hook':
      text = result.dmHook || '';
      break;
  }
  document.getElementById('rewriteOriginalText').value = text;
}

function closeRewritePanel() {
  document.getElementById('rewriteModal').style.display = 'none';
  document.getElementById('rewriteResult').style.display = 'none';
}

// 调用改写 API
async function doRewrite() {
  const contentType = document.getElementById('rewriteContentType').value;
  const content = document.getElementById('rewriteOriginalText').value;
  const rewriteGoal = document.getElementById('rewriteGoal').value;
  const tone = document.getElementById('rewriteTone').value;

  if (!content.trim()) return;

  const btn = document.getElementById('btnDoRewrite');
  btn.disabled = true;
  btn.textContent = '⏳ 改写中...';

  try {
    const response = await fetch(`${API_BASE}/api/rewrite-instagram-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, content, rewriteGoal, tone })
    });
    const data = await response.json();
    document.getElementById('rewriteResultText').textContent = data.rewritten || '改写失败';
    document.getElementById('rewriteResult').style.display = 'block';
  } catch (err) {
    showError('改写失败: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '✨ 改写';
  }
}

// 应用改写结果
function applyRewrite() {
  const rewritten = document.getElementById('rewriteResultText').textContent;
  if (!rewritten) return;
  const type = document.getElementById('rewriteContentType').value;
  const result = window._currentResult;
  if (!result) return;

  switch (type) {
    case 'carousel_slide':
      const idx = parseInt(document.getElementById('rewriteSlideIndex')?.value || '0');
      if (result.carousel?.slides?.[idx]) {
        const parts = rewritten.split('\n');
        result.carousel.slides[idx].title = parts[0] || result.carousel.slides[idx].title;
        result.carousel.slides[idx].body = parts.slice(1).join('\n') || result.carousel.slides[idx].body;
      }
      break;
    case 'reels_script':
      result.reels.script = rewritten;
      break;
    case 'caption':
      result.caption = rewritten;
      break;
    case 'dm_hook':
      result.dmHook = rewritten;
      break;
  }

  // 重新渲染
  renderResults(result);
  closeRewritePanel();
  showInfo('✅ 改写已应用');
}

// 绑定改写按钮
document.getElementById('btnRewrite')?.addEventListener('click', openRewritePanel);
document.getElementById('btnDoRewrite')?.addEventListener('click', doRewrite);
document.getElementById('btnApplyRewrite')?.addEventListener('click', applyRewrite);
```

【第五步：批量选题生成功能】

在左侧输入区底部添加"💡 快速选题"区域：

```html
<div class="quick-topics-section">
  <div class="section-label">💡 快速选题</div>
  <div class="quick-topics-grid">
    <button class="quick-topic-btn" data-topic="Reviewer says your paper lacks novelty. How to respond?">审稿人说缺乏创新</button>
    <button class="quick-topic-btn" data-topic="My introduction was rejected because the gap is unclear.">引言研究空白不清晰</button>
    <button class="quick-topic-btn" data-topic="How to write a strong discussion section for SCI papers?">SCI 论文讨论章节写法</button>
    <button class="quick-topic-btn" data-topic="Common English mistakes Chinese PhD students make in manuscripts.">中国博士生常见英文错误</button>
    <button class="quick-topic-btn" data-topic="Is it safe to use ChatGPT for academic writing polishing?">ChatGPT 润色论文安全吗</button>
    <button class="quick-topic-btn" data-topic="How to select the right journal for your manuscript?">如何选择投稿期刊</button>
  </div>
</div>
```

CSS：快速选题按钮为小号 pill 样式，hover 变色。

批量选题按钮点击后：
- 自动填入 sourceText
- 设置 sourceType 为 "topic"
- 滚动到生成按钮

```js
document.querySelectorAll('.quick-topic-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('sourceText').value = btn.dataset.topic;
    document.getElementById('sourceType').value = 'topic';
    document.getElementById('btnGenerate')?.scrollIntoView({ behavior: 'smooth' });
  });
});
```

【验收标准】
- 改写弹窗正确打开/关闭
- 改写 API 调用正确
- 改写结果可以应用到当前内容并重新渲染
- 快速选题按钮能正确填入文本
- 所有事件绑定正确

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 提示词 4.2 · Reels 视频分镜表与导出功能

```
请为页面添加 Reels 分镜表展示和导出功能。

【实现内容】

1. Reels 分镜表展示：

在 Reels 结果 tab 中，除了口播脚本和时间轴，增加一个"📋 分镜表"子区域：

```html
<div class="shot-list-table" id="shotListContainer">
  <table>
    <thead>
      <tr>
        <th>镜头</th><th>时长</th><th>类型</th><th>口播</th><th>屏幕文字</th><th>B-roll</th>
      </tr>
    </thead>
    <tbody id="shotListBody"></tbody>
  </table>
</div>
```

renderShotList 函数：根据 reels.timeline 渲染分镜表。

2. "生成分镜视频方案"按钮：

在 Reels 结果区底部添加按钮：
```html
<button id="btnGenerateVideoPlan" class="btn secondary">🎬 生成视频分镜方案 (scenes.json)</button>
```

点击后调用 /api/generate-reels-video-plan：
```js
async function generateVideoPlan() {
  const result = window._currentResult;
  if (!result?.reels?.script) return;
  const btn = document.getElementById('btnGenerateVideoPlan');
  btn.disabled = true;
  btn.textContent = '⏳ 生成中...';

  try {
    const response = await fetch(`${API_BASE}/api/generate-reels-video-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: result.reels.script,
        duration: result.reels.duration || 35,
        template: result.reels.template || 'paper-annotation'
      })
    });
    const data = await response.json();
    // 显示 scenes.json 预览
    renderVideoPlan(data);
    // 同时保存到 result 中
    window._currentResult.videoPlan = data;
  } catch (err) {
    showError('生成视频方案失败: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🎬 生成视频分镜方案 (scenes.json)';
  }
}
```

renderVideoPlan(data)：
- 显示视频规格（尺寸、时长、模板）
- 显示 scenes 列表（每个 scene 的详情卡片）
- 提供"下载 scenes.json"按钮

3. 导出功能增强：

在导出 JSON 按钮旁增加：
- "📝 导出提词稿 (.txt)"：导出 Reels 口播稿纯文本
- "🎬 导出 scenes.json"：导出视频分镜 JSON

```js
function exportTeleprompter() {
  const result = window._currentResult;
  if (!result?.reels?.script) return;
  const text = result.reels.script;
  downloadFile(`reels_script_${Date.now()}.txt`, text, 'text/plain');
}

function exportScenesJson() {
  const plan = window._currentResult?.videoPlan;
  if (!plan) return;
  downloadFile(`scenes_${Date.now()}.json`, JSON.stringify(plan, null, 2), 'application/json');
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

【验收标准】
- 分镜表能正确渲染
- 视频分镜方案生成按钮能调用 API
- scenes.json 预览和下载可用
- 提词稿导出可用
- 所有新增函数无语法错误

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 4 验收

```
在浏览器中打开页面，依次测试：
1. 生成内容后点击"改写"→ 弹窗打开，选择改写目标，点击改写 → 结果返回并应用
2. 点击快速选题按钮 → 文本填入
3. 生成 Reels 内容后，点击"生成视频分镜方案" → 分镜表展示
4. 点击"导出提词稿"→ 下载 .txt 文件
```

---

## 批次 5 · 项目集成 - 注册、导航、同步与部署配置

> **目标**: 将 Instagram 内容策划助手注册到主项目，打通所有入口
> **前置**: 批次 1-4 完成

### 提示词 5.1 · 全项目注册与集成

```
你是一名全栈工程师。请将 Instagram 内容策划助手集成到主项目的所有入口。

【第一步：阅读所有需要修改的文件】
1. /Users/andy/Documents/Andy AI/cover-maker/admin.html（管理后台页面权限管理）
2. /Users/andy/Documents/Andy AI/cover-maker/index.html（主导航工具链接）
3. /Users/andy/Documents/Andy AI/cover-maker/scripts/sync-public.mjs（部署同步脚本）
4. /Users/andy/Documents/Andy AI/cover-maker/wrangler.toml（Worker 配置）
5. /Users/andy/Documents/Andy AI/cover-maker/config.example.js（配置示例）
6. /Users/andy/Documents/Andy AI/cover-maker/config.js（实际配置）

【第二步：admin.html 添加 page_access 管理】

2.1 找到 admin.html 中所有 page-access-chip 的定义位置（约第 366-391 行）
参照现有的 ins_reviewer_carousel、reddit_reply_assistant、reddit_radar、reddit_post_writer 模式

在 reddit_post_writer 的 chip 之后新增：

```html
<span class="page-access-chip ${pageAccess.includes('instagram_content_assistant') ? 'granted' : ''}"
      data-userid="${u.id}" data-page="instagram_content_assistant"
      onclick="togglePageAccess(this)" style="cursor:pointer"
      title="点击切换 Instagram 内容策划助手页面权限">
    ${pageAccess.includes('instagram_content_assistant') ? '✓' : '○'} IG内容
</span>
```

2.2 确认 togglePageAccess 函数能正确处理新增的 'instagram_content_assistant' 页面权限（该函数应该已经是通用的，接受 data-page 属性值）

【第三步：index.html 添加工具导航链接】

3.1 在 tool-links-bar（约第 550-556 行）中添加新链接：

找到最后一个工具链接（reddit-post-writer），在其 </a> 之后添加：

```html
<a href="./instagram-content-assistant/" id="linkInstagramContent" style="display:none">📱 Instagram 内容策划 <span class="tl-badge">NEW</span></a>
```

3.2 在 showAuthState 函数中（约第 921-937 行）添加权限检查：

在 var linkPostWriter = ... 之后添加：
```js
var linkInstagramContent = document.getElementById('linkInstagramContent');
```

在 hasPostWriter 变量定义之后添加：
```js
var hasInstagramContent = pageAccess.indexOf('instagram_content_assistant') !== -1;
```

在 linkPostWriter.style.display 之后添加：
```js
linkInstagramContent.style.display = hasInstagramContent ? '' : 'none';
```

在 toolBar.style.display 条件中添加 hasInstagramContent：
```js
toolBar.style.display = (hasIns || hasReddit || hasRadar || hasPostWriter || hasInstagramContent) ? '' : 'none';
```

【第四步：sync-public.mjs 添加同步目录】

在 sync-public.mjs 中，找到最后一个 cp 调用（reddit-post-writer），在其之后添加：

```js
await cp(join(root, 'instagram-content-assistant'), join(publicDir, 'instagram-content-assistant'), { recursive: true });
```

【第五步：wrangler.toml 添加环境变量说明】

在 wrangler.toml 的 [vars] 段下方添加注释（不需要实际添加变量值，变量通过 wrangler secret 管理）：

```toml
# Instagram 内容策划助手 - 模型配置（通过 wrangler secret put 设置）
# DEEPSEEK_API_KEY  - DeepSeek API 密钥
# MODEL_PROVIDER     - 模型提供商（默认 deepseek）
# MODEL_BASE_URL     - 模型 API 地址（默认 https://api.deepseek.com）
# MODEL_NAME         - 模型名称（默认 deepseek-chat）
```

同时确认 worker.js 中使用了 env 读取这些变量（批次 1 已实现）。

如果 wrangler.toml 有 [vars] 段，可以考虑添加默认值（非敏感信息）：
```toml
MODEL_PROVIDER = "deepseek"
MODEL_BASE_URL = "https://api.deepseek.com"
MODEL_NAME = "deepseek-chat"
```

【第六步：config.example.js 添加注释】

在 config.example.js 末尾添加说明注释：

```js
// Instagram Content Assistant API
// Uses Cloudflare Worker proxy → DeepSeek API
// API Key managed via: wrangler secret put DEEPSEEK_API_KEY
// Worker routes:
//   POST /api/generate-instagram-content
//   POST /api/rewrite-instagram-content
//   POST /api/generate-reels-video-plan
```

【第七步：ins_reviewer_carousel 页面读取预填数据】

检查 /Users/andy/Documents/Andy AI/cover-maker/ins_reviewer_carousel/index.html
确认在页面加载时读取 localStorage 中的 instagram_carousel_prefill 数据。

如果尚未实现，在该页面的 JavaScript 初始化部分添加：

```js
function checkInstagramContentPrefill() {
  try {
    const prefillStr = localStorage.getItem('instagram_carousel_prefill');
    if (!prefillStr) return;
    const data = JSON.parse(prefillStr);
    localStorage.removeItem('instagram_carousel_prefill');

    // 根据数据结构预填表单
    // 需要在 carousel.html 中根据实际字段调整
    console.log('Instagram content prefill loaded:', data);
    // TODO: 根据 ins_reviewer_carousel 实际表单字段映射预填
  } catch (e) {
    console.warn('Failed to load Instagram content prefill:', e);
  }
}

// 在 DOMContentLoaded 中调用
checkInstagramContentPrefill();
```

【验收标准】
- admin.html 中能看到 IG内容 的权限 chip
- 点击 chip 能正确切换权限（toggle 数据库中的 page_access 数组）
- index.html 中 VIP 用户能看到 IG内容 导航链接
- sync-public.mjs 能正确同步新目录
- 所有修改无语法错误
- 确保修改后 index.html、admin.html 仍能正常加载

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 提示词 5.2 · 创建目录软链接与部署命令

```
请确认以下部署相关配置正确：

1. 确认项目根目录下有 instagram-content-assistant 目录（不是 content_assistant）
   如果 content_assistant 目录中是源代码，需要确认 sync-public.mjs 中的
   源路径和目标路径对应关系正确。

   当前 setup：
   - 源码目录: /Users/andy/Documents/Andy AI/cover-maker/content_assistant/
   - 部署目标: public/instagram-content-assistant/
   - Worker 域名访问路径: /instagram-content-assistant/

   请在 sync-public.mjs 中使用正确的源路径：
   ```js
   await cp(join(root, 'content_assistant'), join(publicDir, 'instagram-content-assistant'), { recursive: true });
   ```

2. 确认 wrangler.toml 中的 [assets] 配置正确：
   ```toml
   [assets]
   directory = "./public"
   binding = "ASSETS"
   not_found_handling = "single-page-application"
   ```
   这样 /instagram-content-assistant/ 路径会被正确路由到 public/instagram-content-assistant/index.html

3. 创建部署说明文件：
   在 /Users/andy/Documents/Andy AI/cover-maker/content_assistant/ 下创建 DEPLOY.md：

   ```markdown
   # Instagram 内容策划助手 - 部署说明

   ## 环境变量（Cloudflare Worker Secrets）

   部署前需要设置以下 secrets：

   ```bash
   wrangler secret put DEEPSEEK_API_KEY
   # 输入 DeepSeek API Key

   # 以下可选（默认值已写入 wrangler.toml vars）
   wrangler secret put MODEL_PROVIDER    # 默认 deepseek
   wrangler secret put MODEL_BASE_URL    # 默认 https://api.deepseek.com
   wrangler secret put MODEL_NAME        # 默认 deepseek-chat
   ```

   ## 部署步骤

   ```bash
   # 1. 同步静态资源
   npm run sync:public

   # 2. 本地测试
   npm run dev:cf
   # 访问 http://localhost:8787/instagram-content-assistant/

   # 3. 部署到 Cloudflare
   npm run deploy:cf
   ```

   ## 切换模型 Provider

   修改 wrangler.toml 中的 vars 或通过 wrangler secret 覆盖：

   - OpenAI: MODEL_BASE_URL=https://api.openai.com/v1, MODEL_NAME=gpt-4.1-mini
   - SiliconFlow: MODEL_BASE_URL=https://api.siliconflow.cn/v1, MODEL_NAME=deepseek-ai/DeepSeek-V3
   ```

【验收标准】
- sync-public.mjs 路径映射正确
- wrangler.toml 配置完整
- DEPLOY.md 内容准确

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 5 验收

```
用 Bash 执行:
1. node /Users/andy/Documents/Andy\ AI/cover-maker/scripts/sync-public.mjs
   预期: 成功执行，无报错
2. ls /Users/andy/Documents/Andy\ AI/cover-maker/public/instagram-content-assistant/
   预期: 能看到 index.html
3. grep "instagram" /Users/andy/Documents/Andy\ AI/cover-maker/scripts/sync-public.mjs
   预期: 包含 cp 命令
4. grep "instagram" /Users/andy/Documents/Andy\ AI/cover-maker/index.html | head -5
   预期: 包含 linkInstagramContent 和 instagram-content-assistant
```

---

## 批次 6 · 前端合规检测增强、Story 问答完善、历史记录搜索

> **目标**: 完善合规检测前端展示、Story 交互、历史记录搜索
> **前置**: 批次 1-5 完成

### 提示词 6.1 · 合规检测增强与内容安全检查

```
你是一名前端工程师。请增强 Instagram 内容策划助手的前端合规检测功能。

【第一步：阅读当前文件】
使用 Read 工具完整阅读 /Users/andy/Documents/Andy AI/cover-maker/content_assistant/index.html

【第二步：增强合规检测面板】

2.1 改进 renderCompliance 函数，使其更详细：

```js
function renderCompliance(complianceNotes, riskFlags) {
  const container = document.getElementById('complianceContent');
  if (!container) return;

  let html = '';

  // 前端二次扫描（以防 Worker 遗漏）
  const fullText = extractAllText(window._currentResult);
  const frontendRisks = scanForRisks(fullText);

  // 合并 Worker 和前端检测结果
  const allRisks = [...new Set([...(riskFlags || []), ...frontendRisks])];

  if (allRisks.length > 0) {
    html += '<div class="compliance-warning">';
    html += '<div class="compliance-icon">⚠️</div>';
    html += '<div class="compliance-text">';
    html += '<strong>检测到以下高风险表达，建议替换：</strong>';
    html += '<ul class="risk-list">';
    allRisks.forEach(risk => {
      const alternative = SAFE_ALTERNATIVES[risk.toLowerCase()] || '请使用合规的服务描述';
      html += `<li><span class="risk-word">"${escapeHtml(risk)}"</span> → <span class="safe-word">${escapeHtml(alternative)}</span></li>`;
    });
    html += '</ul>';
    html += '<button class="btn secondary btn-sm" onclick="rewriteToReduceRisk()">🛡️ 降低风险重写</button>';
    html += '</div></div>';
  } else {
    html += '<div class="compliance-pass">';
    html += '<span class="pass-icon">✅</span> 内容合规检查通过，未检测到代写、包发表、保证录用等高风险表达。';
    html += '</div>';
  }

  // 合规说明
  if (complianceNotes && complianceNotes.length > 0) {
    html += '<div class="compliance-notes">';
    html += '<strong>📋 合规说明：</strong>';
    html += '<ul>';
    complianceNotes.forEach(note => {
      html += `<li>${escapeHtml(note)}</li>`;
    });
    html += '</ul></div>';
  }

  container.innerHTML = html;
}

function scanForRisks(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return HIGH_RISK_WORDS.filter(word => lower.includes(word.toLowerCase()));
}

function extractAllText(result) {
  if (!result) return '';
  const parts = [];
  if (result.topic) parts.push(result.topic);
  if (result.angle) parts.push(result.angle);
  if (result.carousel?.slides) {
    result.carousel.slides.forEach(s => {
      parts.push(s.title, s.body || '', s.subtitle || '');
    });
  }
  if (result.reels?.script) parts.push(result.reels.script);
  if (result.reels?.hook) parts.push(result.reels.hook);
  if (result.caption) parts.push(result.caption);
  if (result.dmHook) parts.push(result.dmHook);
  return parts.join(' ');
}
```

2.2 实现"降低风险重写"功能：

```js
async function rewriteToReduceRisk() {
  const result = window._currentResult;
  if (!result) return;

  // 找到有风险的文本
  const fullText = extractAllText(result);
  const risks = scanForRisks(fullText);
  if (risks.length === 0) return;

  showLoading(true);
  try {
    const response = await fetch(`${API_BASE}/api/rewrite-instagram-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: 'full_package',
        content: JSON.stringify({
          carousel: result.carousel,
          reels: result.reels,
          caption: result.caption,
          dmHook: result.dmHook,
          hashtags: result.hashtags
        }),
        rewriteGoal: 'remove_risky_language',
        tone: result.tone || 'professional'
      })
    });

    if (!response.ok) throw new Error('重写失败');

    const data = await response.json();
    // 尝试解析重写后的内容并合并
    try {
      const rewritten = JSON.parse(data.rewritten);
      if (rewritten.carousel) result.carousel = rewritten.carousel;
      if (rewritten.reels) result.reels = rewritten.reels;
      if (rewritten.caption) result.caption = rewritten.caption;
      if (rewritten.dmHook) result.dmHook = rewritten.dmHook;
      if (rewritten.hashtags) result.hashtags = rewritten.hashtags;
    } catch (e) {
      // 如果返回的不是 JSON，则整体替换 caption
      result.caption = data.rewritten;
    }

    renderResults(result);
    showInfo('✅ 内容已重写，风险表达已降低');
  } catch (err) {
    showError('降低风险重写失败: ' + err.message);
  } finally {
    showLoading(false);
  }
}
```

【第三步：增强 Story 问答渲染】

改进 renderStory 函数，使 Story 问答展示更有互动感：

```js
function renderStory(storyItems) {
  const container = document.getElementById('storyContent');
  if (!container) return;

  if (!storyItems || storyItems.length === 0) {
    container.innerHTML = '<div class="empty-hint">未生成 Story 内容</div>';
    return;
  }

  let html = '';
  storyItems.forEach((item, index) => {
    if (item.type === 'poll') {
      html += `
        <div class="story-card poll-card">
          <div class="story-label">📊 投票互动</div>
          <div class="poll-question">${escapeHtml(item.text)}</div>
          <div class="poll-options">
            ${(item.options || []).map((opt, i) => `
              <div class="poll-option">
                <span class="poll-option-letter">${String.fromCharCode(65 + i)}</span>
                <span>${escapeHtml(opt)}</span>
              </div>
            `).join('')}
          </div>
          <button class="btn-sm secondary" onclick="copyToClipboard('${escapeHtml(JSON.stringify(item))}', this)">📋 复制</button>
        </div>`;
    } else if (item.type === 'question') {
      html += `
        <div class="story-card question-card">
          <div class="story-label">💬 提问互动</div>
          <div class="question-text">${escapeHtml(item.text)}</div>
          <div class="question-input-placeholder">
            <span class="input-hint">✍️ 粉丝在此输入回答...</span>
          </div>
          <button class="btn-sm secondary" onclick="copyToClipboard('${escapeHtml(JSON.stringify(item))}', this)">📋 复制</button>
        </div>`;
    }
  });

  container.innerHTML = html;
}
```

Story 卡片 CSS：
- 背景 #f8f7f4，边框 1px solid #e8e4df，圆角 10px
- poll-option 模拟 Instagram 投票按钮样式（圆角矩形边框）
- question-input-placeholder 模拟输入框外观

【验收标准】
- 合规检测面板能显示 Worker 检测 + 前端扫描结果
- "降低风险重写"按钮能正确调用 API 并更新内容
- Story 投票和提问展示美观
- 所有复制按钮可用

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 提示词 6.2 · 历史记录搜索与清空功能

```
请为历史记录区域添加搜索和清空功能。

【实现内容】

1. 在历史记录区域头部添加搜索框和清空按钮：

```html
<div class="history-header">
  <span class="section-label">📋 历史记录</span>
  <div class="history-actions">
    <input type="text" id="historySearch" placeholder="搜索历史..." class="input-sm">
    <button class="btn-sm ghost" onclick="clearAllHistory()">🗑️ 清空</button>
  </div>
</div>
```

2. 搜索过滤逻辑：

```js
function renderHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;
  const searchTerm = (document.getElementById('historySearch')?.value || '').toLowerCase();
  let history = getHistory();

  // 搜索过滤
  if (searchTerm) {
    history = history.filter(item =>
      (item.topic || '').toLowerCase().includes(searchTerm) ||
      (item.sourceText || '').toLowerCase().includes(searchTerm) ||
      (item.sourceType || '').toLowerCase().includes(searchTerm)
    );
  }

  if (history.length === 0) {
    container.innerHTML = '<div class="empty-hint">' + (searchTerm ? '无匹配记录' : '暂无历史记录') + '</div>';
    return;
  }

  container.innerHTML = history.slice(0, 10).map((item, i) => `
    <div class="history-item" data-index="${i}">
      <div class="history-item-main">
        <span class="history-time">${formatTime(item.createdAt)}</span>
        <span class="history-topic">${escapeHtml(item.topic || '未命名')}</span>
        <span class="history-type pill">${escapeHtml(item.sourceType)}</span>
      </div>
      <div class="history-item-actions">
        <button class="btn-sm secondary" onclick="restoreHistory(${i})">📋 恢复</button>
        <button class="btn-sm ghost" onclick="deleteHistoryItem(${i})">🗑️</button>
      </div>
    </div>
  `).join('');
}

// 监听搜索输入
document.getElementById('historySearch')?.addEventListener('input', debounce(renderHistory, 300));
```

3. 清空和删除：

```js
function clearAllHistory() {
  if (!confirm('确定清空所有历史记录？此操作不可恢复。')) return;
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function deleteHistoryItem(index) {
  const history = getHistory();
  history.splice(index, 1);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

// 防抖函数
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

4. 历史记录 CSS 样式增强：
- .history-header: flex justify-between align-center
- .history-item: 白色卡片，hover 浅灰背景，flex justify-between
- .history-item-main: 左侧信息
- .history-item-actions: 右侧操作按钮
- .pill: 小圆角标签

【验收标准】
- 搜索框输入后历史记录实时过滤
- 清空按钮有确认弹窗
- 单条删除可用
- 防抖函数正常工作

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 6 验收

```
在浏览器中测试：
1. 生成内容后切换到"合规"tab → 查看风险检测结果
2. 点击"降低风险重写"→ 观察内容变化
3. 切换到"Story"tab → 查看投票和提问展示
4. 在历史搜索框输入关键词 → 验证过滤
5. 点击单条删除和全部清空 → 验证功能
```

---

## 批次 7 · 端到端测试、Bug 修复与最终验收

> **目标**: 全面测试，修复所有 bug，确保系统完整可运行
> **前置**: 批次 1-6 所有代码完成

### 提示词 7.1 · 全链路端到端测试

```
你是一名资深 QA 工程师。请对 Instagram 内容策划助手进行端到端测试。

【测试环境】
- 项目根目录: /Users/andy/Documents/Andy AI/cover-maker/
- 测试页面: content_assistant/index.html
- Worker: src/worker.js

【第一步：代码静态检查】

1.1 使用 Bash 执行以下语法检查：

```bash
# 检查 HTML 文件行数和基本结构
wc -l /Users/andy/Documents/Andy\ AI/cover-maker/content_assistant/index.html

# 检查是否有明显的 HTML 语法问题（未闭合标签）
grep -c "<script\|</script>" /Users/andy/Documents/Andy\ AI/cover-maker/content_assistant/index.html
# 预期: script 标签数量是偶数

grep -c "<style\|</style>" /Users/andy/Documents/Andy\ AI/cover-maker/content_assistant/index.html
# 预期: style 标签数量是偶数（如果有内联样式）

# 检查 Worker JS 语法
node --check /Users/andy/Documents/Andy\ AI/cover-maker/src/worker.js
```

1.2 检查关键 JavaScript 函数是否都定义了：

```bash
grep -c "function generateContent\|function renderResults\|function renderCarousel\|function renderReels\|function renderCaption\|function renderHashtags\|function renderDmHook\|function renderStory\|function renderCompliance\|function copyToClipboard\|function collectFormData\|function saveToHistory\|function getHistory\|function checkRedditRadarPrefill" /Users/andy/Documents/Andy\ AI/cover-maker/content_assistant/index.html
# 预期: 至少 10 个函数定义
```

1.3 检查关键的 id 和事件绑定：

```bash
grep -c "getElementById\|addEventListener" /Users/andy/Documents/Andy\ AI/cover-maker/content_assistant/index.html
# 预期: >= 15
```

【第二步：功能测试清单】

请逐项检查以下功能是否完整实现：

□ 2.1 输入表单
  □ sourceType 下拉有 6 个选项
  □ sourceText 文本域可输入
  □ audience 下拉有 8 个选项
  □ goal 下拉有 6 个选项
  □ painPoint 下拉有 10 个选项
  □ formats 多选默认全选
  □ tone 下拉有 7 个选项
  □ ctaLevel 下拉有 4 个选项
  □ languageMode 下拉有 3 个选项
  □ 生成按钮可见且可点击

□ 2.2 生成流程
  □ 空输入时点击生成显示错误提示
  □ 输入超长文本（>8000字符）显示错误提示
  □ 正常输入后点击生成显示 loading 状态
  □ 生成按钮在 loading 期间被禁用
  □ API 调用成功后结果面板显示

□ 2.3 结果展示
  □ Carousel 7 页卡片正确渲染
  □ 每页有正确的颜色条和编号
  □ Reels 脚本正确显示
  □ Caption 正确显示
  □ Hashtags 标签云正确显示
  □ DM 钩子正确显示
  □ Story 投票和提问正确显示
  □ 合规检测结果正确显示
  □ Tab 切换正常工作

□ 2.4 操作功能
  □ 单个内容块复制按钮可用
  □ 复制全部按钮可用
  □ 发送到 Carousel 生成器按钮可用（写入 localStorage）
  □ 导出 JSON 按钮可下载文件

□ 2.5 改写功能
  □ 改写弹窗可打开/关闭
  □ 选择不同类型显示对应原文
  □ 改写 API 调用并返回结果
  □ 应用改写后内容更新

□ 2.6 历史记录
  □ 生成后自动保存到 localStorage
  □ 历史列表正确渲染
  □ 点击恢复可回填结果
  □ 搜索过滤可用
  □ 单条删除可用
  □ 清空全部可用

□ 2.7 Reddit Radar 预填
  □ 读取 localStorage 中 instagram_content_prefill
  □ 正确预填各字段
  □ 读取后清除 localStorage 标记

□ 2.8 快速选题
  □ 点击快速选题按钮填入文本
  □ 自动设置 sourceType 为 topic

□ 2.9 其他
  □ Cmd/Ctrl+Enter 快捷键触发生成
  □ 移动端响应式布局正常

【第三步：Worker API 检查】

3.1 检查 worker.js 中的新路由是否正确注册：

```bash
grep -c "generate-instagram-content\|rewrite-instagram-content\|generate-reels-video-plan" /Users/andy/Documents/Andy\ AI/cover-maker/src/worker.js
# 预期: >= 6（每个路由在 handleApi 和函数定义中各出现一次）
```

3.2 检查 callModel 函数是否正确实现：

```bash
grep -c "callModel\|MODEL_BASE_URL\|MODEL_NAME\|DEEPSEEK_API_KEY" /Users/andy/Documents/Andy\ AI/cover-maker/src/worker.js
# 预期: >= 5
```

3.3 检查错误处理：

```bash
grep -c "try\b\|catch\b\|json(" /Users/andy/Documents/Andy\ AI/cover-maker/src/worker.js
# 预期: try >= 5, catch >= 5
```

【第四步：集成检查】

4.1 检查 index.html 导航链接：

```bash
grep "instagram-content-assistant\|linkInstagramContent\|hasInstagramContent" /Users/andy/Documents/Andy\ AI/cover-maker/index.html
# 预期: 至少有链接、变量声明、权限判断

4.2 检查 admin.html 权限 chip：

```bash
grep "instagram_content_assistant" /Users/andy/Documents/Andy\ AI/cover-maker/admin.html
# 预期: 能找到 page-access-chip

4.3 检查 sync-public.mjs：

```bash
grep "instagram-content-assistant\|content_assistant" /Users/andy/Documents/Andy\ AI/cover-maker/scripts/sync-public.mjs
# 预期: 能找到 cp 命令
```

【第五步：报告问题】

请输出一份测试报告，包含：
- 通过项数量和总检查项数量
- 发现的 bug 或缺失功能列表
- 每个 bug 的建议修复方案
- 总体评估：是否可以投入生产使用

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 提示词 7.2 · Bug 修复与最终打磨

```
请根据上一步的测试报告，逐一修复所有发现的 bug。

【修复原则】
1. 优先修复阻断性 bug（页面无法加载、JS 报错、API 不通）
2. 其次修复功能性 bug（功能不可用、数据错误）
3. 最后修复体验性问题（样式偏移、文案不准确）

【常见问题预检清单】

□ API 地址是否正确（本地 localhost:8787，部署后为 Worker 域名）
□ fetch 请求的 Content-Type 是否设置为 application/json
□ Worker 的 CORS 头是否正确设置
□ localStorage 读写是否有 try-catch 保护
□ 模板字符串中是否有未转义的反引号
□ JavaScript 中引用的 DOM id 是否都在 HTML 中存在
□ 事件监听器是否在元素存在后才绑定（DOMContentLoaded）
□ Worker 的 JSON 响应格式前端解析是否正确
□ 历史记录恢复时是否正确还原各字段
□ Reddit Radar 预填后是否清除了 localStorage 标记
□ 改写弹窗关闭时是否正确清理状态
□ 复制功能的 fallback（execCommand）是否可用
□ 导出文件时 blob 类型是否正确
□ 移动端媒体查询断点是否正确（768px / 480px）
□ 加载状态切换是否完整（try-catch-finally 中确保 loading 一定关闭）
□ 所有按钮 disabled 状态切换是否完整

【修复验证】
每修复一个 bug 后，重新检查相关功能链路是否正常。

【最终验收标准】
- 从打开页面到生成内容全链路无报错
- 所有按钮和交互均可正常使用
- Worker API 能正确代理 DeepSeek 请求
- 页面在不同屏幕尺寸下布局正常
- localStorage 数据正确持久化和恢复
- 与其他工具（Reddit Radar、Carousel 生成器）的打通链路正确

执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 7 验收

```
最终验收清单：
1. 本地启动 wrangler dev，访问 /instagram-content-assistant/
2. 输入一句选题，点击生成 → 等待 API 返回 → 查看所有内容区域
3. 分别切换到 Carousel / Reels / Caption / Hashtags / DM钩子 / Story / 合规 tab
4. 测试复制功能（单个和全部）
5. 测试发送到 Carousel 生成器
6. 测试改写功能
7. 测试历史记录（搜索、恢复、删除、清空）
8. 模拟 Reddit Radar 预填（手动在控制台 set localStorage）
9. 在 375px / 768px / 1200px 三种宽度下检查布局
10. 检查无 console 报错
```

---

## 📊 附录 A：文件清单

完成所有批次后，以下文件应存在且完整：

```
cover-maker/
├── src/worker.js                          # [修改] 新增 3 个 API 路由 + callModel
├── wrangler.toml                          # [修改] 新增模型配置 vars
├── index.html                             # [修改] 新增导航链接 + 权限检查
├── admin.html                             # [修改] 新增 page_access chip
├── scripts/sync-public.mjs                # [修改] 新增同步目录
├── config.example.js                      # [修改] 新增注释
├── content_assistant/                     # [新增] 完整目录
│   ├── index.html                         # [新增] 主页面（1500-2500行）
│   ├── instagram_content_assistant_dev_doc.md  # [已有] 开发文档
│   ├── AI_PROMPTS_v1.0.md                 # [新增] 本文件
│   └── DEPLOY.md                          # [新增] 部署说明
├── ins_reviewer_carousel/
│   └── index.html                         # [可能修改] 读取预填数据
└── public/
    └── instagram-content-assistant/       # [自动生成] sync-public 产物
        └── index.html
```

---

## 📊 附录 B：API 接口速查表

| 方法 | 路径 | 用途 | 请求参数 |
|------|------|------|---------|
| POST | /api/generate-instagram-content | 生成完整内容包 | sourceType, sourceText, audience, goal, painPoint, formats, tone, ctaLevel, languageMode |
| POST | /api/rewrite-instagram-content | 改写指定内容 | contentType, content, rewriteGoal, tone |
| POST | /api/generate-reels-video-plan | 生成分镜方案 | script, duration, template |

---

## 📊 附录 C：localStorage 键名速查表

| 键名 | 用途 | 写入方 | 读取方 |
|------|------|--------|--------|
| instagram_content_history | 历史记录 | Instagram 内容策划助手 | Instagram 内容策划助手 |
| instagram_content_prefill | Reddit Radar → 助手预填 | Reddit Radar | Instagram 内容策划助手 |
| instagram_carousel_prefill | 助手 → Carousel 预填 | Instagram 内容策划助手 | Instagram Carousel 生成器 |

---

## 📊 附录 D：环境变量速查表

| 变量名 | 用途 | 默认值 | 设置方式 |
|--------|------|--------|---------|
| DEEPSEEK_API_KEY | DeepSeek API 密钥 | 无（必设） | wrangler secret put |
| MODEL_PROVIDER | 模型提供商 | deepseek | wrangler.toml [vars] 或 secret |
| MODEL_BASE_URL | API 基础地址 | https://api.deepseek.com | wrangler.toml [vars] 或 secret |
| MODEL_NAME | 模型名称 | deepseek-chat | wrangler.toml [vars] 或 secret |

---

> **版本**: v1.0
> **创建日期**: 2026-07-04
> **适用项目**: cover-maker (小红书封面生成器 + 运营工具集)
> **开发文档**: instagram_content_assistant_dev_doc.md
> **下次更新**: 待 P2/P3 功能开发时升级为 v2.0
