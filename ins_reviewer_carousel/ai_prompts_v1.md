# Instagram 学术内容图生成器 — 多批次 AI 提示词

> 版本：v1
> 生成日期：2026-07-03
> 基于开发文档：`instagram_academic_generator_dev_doc.md`
> 现有代码基础：`carousel.html`、`export.js`

---

## 使用说明

以下提示词按批次排列，**必须按顺序执行**，每批次依赖上一批次的产出。
每批次末尾均要求"系统完整可运行且无 bug"，请在确认当前批次无误后再进入下一批。

**技术路线约定：**
- 纯前端单文件 HTML（`instagram-carousel.html`），零构建工具依赖
- 预览区：DOM 渲染 1080×1350 幻灯片，CSS `transform: scale()` 缩放适配右侧面板
- 导出：SVG `foreignObject` → Canvas → PNG 纯客户端方案，无需服务端
- 风格系统：CSS 自定义属性 + class 切换，复用现有 `carousel.html` 的 CSS 变量命名习惯（`--ink`、`--paper`、`--blue`、`--red` 等）

---

## 第一批：项目骨架 + 左右布局 + 状态管理

```
请在一个新的 HTML 文件 `instagram-carousel.html` 中构建 Instagram 学术内容图生成器的页面骨架。

### 1. 页面结构（左右布局）

使用 CSS Grid 实现全屏左右布局：

┌──────────────────────────────────────────────┐
│ 顶部导航栏（工具标题 + 副标题）                  │
├────────────────┬─────────────────────────────┤
│ 左侧控制区      │ 右侧预览区                    │
│ （400px 宽）    │ （剩余宽度，居中显示幻灯片）     │
│ 可垂直滚动      │ 灰色背景，幻灯片缩放展示        │
├────────────────┴─────────────────────────────┤
│ 底部状态栏（可选）                              │
└──────────────────────────────────────────────┘

具体要求：
- 顶部导航栏：左侧显示 "Instagram 学术内容图生成器" 标题，右侧显示 "Academic Carousel Generator" 英文副标题，高度约 60px，背景白色，底部有细分割线。
- 左侧控制区：宽度固定 400px，背景 #f9f9f9，内边距 20px，可垂直滚动（overflow-y: auto），最大高度为视口高度减去顶部导航栏。
- 右侧预览区：背景 #e0e0e0，flex 布局居中显示预览卡片，预览卡片是一个 1080×1350 的容器通过 CSS transform scale 缩放适配。

### 2. 左侧控制区内容（仅 UI 壳子，先不做逻辑）

按以下顺序排列控件，每个控件带 label + 对应表单元素：

a) **内容模板**（下拉选择框 `<select>`）
   选项：Reviewer Response / Before After Rewrite / Chinese PhD Mistakes / SCI Writing Framework / Checklist

b) **图片尺寸**（下拉选择框 `<select>`）
   选项：Instagram Carousel 1080×1350（默认选中）/ Reel Cover 1080×1920（disabled 灰色）/ Square Post 1080×1080（disabled 灰色）/ Story 1080×1920（disabled 灰色）

c) **视觉风格**（卡片式单选，5 个风格用 div 排列成 2 行，每行 2-3 个）
   每个卡片显示风格名称和一个小色块预览：
   - Academic Paper（白底 + 深蓝色块 + 红色块）
   - Editorial Research（米白底 + 深灰色块 + 酒红色块）
   - Dark Lecture（深灰底 + 白色块 + 荧光绿色块）
   - Minimal Checklist（白底 + 黑色块 + 蓝色块）
   - Blue Lab（浅蓝白底 + 科技蓝色块 + 青色块）
   点击卡片高亮选中状态（蓝色边框），默认选中 Academic Paper。

d) **字体选择**（下拉选择框 `<select>`）
   选项：Inter（默认）/ Helvetica / Arial / PingFang SC / Noto Sans SC / Source Han Sans

e) **品牌设置**（三个文本输入框）
   - Instagram 账号名：默认值 `@yourhandle`
   - 品牌短语：默认值 `SCI / CCF writing coaching`
   - CTA 文案：默认值 `DM "REVIEWER" for the checklist.`

f) **文案输入区**（一个大文本域 `<textarea>`，高度 200px）
   默认显示一段占位示例文案：
   ```
   标题：Reviewer says "lack of novelty"
   副标题：This is not solved by polishing English.
   页面1：Many students think the problem is their English.
   页面2：But reviewers are often questioning your logic, not your language.
   页面3：Diagnose first: is the problem novelty, method, data, or writing?
   页面4：Weak reply example: "Thank you. We emphasized novelty."
   页面5：Stronger reply example: "We clarified how our work differs from X, Y, Z..."
   页面6：Revise the manuscript itself, not just the response letter.
   CTA：DM "REVIEWER" for the checklist.
   ```

g) **批量识别开关**（一个 checkbox + 说明文字）
   "启用批量文案识别（以 888 分隔多组文案）"，默认不勾选。

### 3. 右侧预览区内容（仅 UI 壳子）

- 灰色背景（#e0e0e0）
- 中间显示一个白色矩形（模拟幻灯片预览），尺寸按 1080×1350 等比缩放至适合右侧面板高度（最大高度约 700px，宽度等比）
- 白色矩形内显示占位文字 "选择模板并输入文案后，预览将显示在这里"
- 预览区下方显示页码指示器："第 1 / 7 页"
- 页码指示器左右有 "< 上一页" 和 "下一页 >" 按钮（当前可 disabled）

### 4. 下载按钮区（放在左侧控制区底部或右侧预览区下方）

- "下载当前页 PNG" 按钮（蓝色主按钮）
- "下载整套 Carousel（ZIP）" 按钮（次按钮）
- 两个按钮当前均 disabled，后续批次接入功能

### 5. JavaScript 状态管理

在 `<script>` 中定义一个全局状态对象：

```javascript
const state = {
  template: 'reviewer-response',       // 当前模板 ID
  size: { width: 1080, height: 1350 }, // 当前尺寸
  style: 'academic-paper',             // 当前视觉风格 ID
  font: 'Inter',                       // 当前字体
  accountName: '@yourhandle',
  brandPhrase: 'SCI / CCF writing coaching',
  cta: 'DM "REVIEWER" for the checklist.',
  rawText: '',                         // 用户输入的原始文案
  slides: [],                          // 解析后的幻灯片数组 [{slideIndex, type, title, subtitle, body, ...}]
  currentSlide: 0,                     // 当前预览页码（0-based）
  batchMode: false,                    // 是否启用批量识别
};
```

实现一个 `updatePreview()` 函数（目前只需 console.log 当前 state），并将所有控件的 `onchange` / `oninput` 事件绑定到 state 更新 + `updatePreview()` 调用。

### 6. 样式规范

- 复用 `carousel.html` 中的 CSS 自定义属性命名风格
- 字体使用 system-ui 栈：`Inter, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", sans-serif`
- 整体色调干净、专业，不要花哨
- 按钮 hover 有过渡效果（transition: all 0.2s）
- 风格选择卡片 hover 有阴影提升效果

### 7. 验收标准

- 用浏览器打开 `instagram-carousel.html`，能看到完整的左右布局
- 左侧所有控件可见、可交互（下拉框能展开、文本框能输入、卡片能点击选中）
- 风格选择卡片点击后高亮
- 修改任何控件值，浏览器 console 能看到 state 对象更新
- 页面不报任何 JavaScript 错误
- 右侧预览区显示占位状态

执行完这些提示词后，系统要完整可运行并且不会有任何 bug。
```

---

## 第二批：模板数据定义 + 文案解析引擎

```
在第一批产出的 `instagram-carousel.html` 基础上，继续开发。

### 1. 定义 5 个内容模板的完整数据结构

在 `<script>` 中添加以下模板定义（放在 state 定义之前）：

```javascript
const TEMPLATES = {
  'reviewer-response': {
    id: 'reviewer-response',
    name: 'Reviewer Response',
    defaultSlides: 7,
    fields: ['reviewer_comment', 'misinterpretation', 'real_issue', 'weak_reply', 'stronger_reply', 'revision_action', 'checklist_items', 'cta'],
    slideStructure: [
      { slideIndex: 1, type: 'cover',    titleField: 'reviewer_comment', subtitleField: 'misinterpretation' },
      { slideIndex: 2, type: 'content',  title: 'This may not mean...', bodyField: 'misinterpretation' },
      { slideIndex: 3, type: 'diagnosis', title: 'Diagnose the issue', bodyField: 'real_issue' },
      { slideIndex: 4, type: 'compare',  title: 'Weak reply vs Stronger reply', weakField: 'weak_reply', strongField: 'stronger_reply' },
      { slideIndex: 5, type: 'content',  title: 'What to revise in manuscript', bodyField: 'revision_action' },
      { slideIndex: 6, type: 'content',  title: 'Key takeaway', bodyField: 'revision_action' },
      { slideIndex: 7, type: 'checklist', title: 'Before you revise...', itemsField: 'checklist_items' },
    ]
  },
  'before-after-rewrite': {
    id: 'before-after-rewrite',
    name: 'Before / After Rewrite',
    defaultSlides: 7,
    fields: ['topic', 'weak_sentence', 'weak_reason', 'better_sentence', 'better_reason', 'rewrite_formula', 'cta'],
    slideStructure: [
      { slideIndex: 1, type: 'cover',    titleField: 'topic' },
      { slideIndex: 2, type: 'content',  title: 'Stop writing this', bodyField: 'weak_sentence' },
      { slideIndex: 3, type: 'content',  title: 'Why it sounds weak', bodyField: 'weak_reason' },
      { slideIndex: 4, type: 'content',  title: 'Better version', bodyField: 'better_sentence' },
      { slideIndex: 5, type: 'content',  title: 'Why this version works', bodyField: 'better_reason' },
      { slideIndex: 6, type: 'content',  title: 'Rewrite formula', bodyField: 'rewrite_formula' },
      { slideIndex: 7, type: 'cta',      bodyField: 'cta' },
    ]
  },
  'chinese-phd-mistakes': {
    id: 'chinese-phd-mistakes',
    name: 'Chinese PhD Mistakes',
    defaultSlides: 7,
    fields: ['topic', 'mistake_1', 'mistake_2', 'mistake_3', 'mistake_4', 'mistake_5', 'cta'],
    slideStructure: [
      { slideIndex: 1, type: 'cover',    titleField: 'topic' },
      { slideIndex: 2, type: 'numbered', title: 'Mistake 1', bodyField: 'mistake_1', number: 1 },
      { slideIndex: 3, type: 'numbered', title: 'Mistake 2', bodyField: 'mistake_2', number: 2 },
      { slideIndex: 4, type: 'numbered', title: 'Mistake 3', bodyField: 'mistake_3', number: 3 },
      { slideIndex: 5, type: 'numbered', title: 'Mistake 4', bodyField: 'mistake_4', number: 4 },
      { slideIndex: 6, type: 'numbered', title: 'Mistake 5', bodyField: 'mistake_5', number: 5 },
      { slideIndex: 7, type: 'cta',      bodyField: 'cta' },
    ]
  },
  'sci-writing-framework': {
    id: 'sci-writing-framework',
    name: 'SCI Writing Framework',
    defaultSlides: 7,
    fields: ['framework_title', 'step_1', 'step_2', 'step_3', 'example', 'common_mistake', 'checklist_items', 'cta'],
    slideStructure: [
      { slideIndex: 1, type: 'cover',    titleField: 'framework_title' },
      { slideIndex: 2, type: 'numbered', title: 'Step 1', bodyField: 'step_1', number: 1 },
      { slideIndex: 3, type: 'numbered', title: 'Step 2', bodyField: 'step_2', number: 2 },
      { slideIndex: 4, type: 'numbered', title: 'Step 3', bodyField: 'step_3', number: 3 },
      { slideIndex: 5, type: 'content',  title: 'Example', bodyField: 'example' },
      { slideIndex: 6, type: 'content',  title: 'Common mistake', bodyField: 'common_mistake' },
      { slideIndex: 7, type: 'checklist', title: 'Quick checklist', itemsField: 'checklist_items' },
    ]
  },
  'checklist': {
    id: 'checklist',
    name: 'Checklist',
    defaultSlides: 7,
    fields: ['checklist_title', 'checklist_items', 'warning', 'cta'],
    slideStructure: [
      { slideIndex: 1, type: 'cover',    titleField: 'checklist_title' },
      { slideIndex: 2, type: 'checklist', title: 'Part 1', itemsField: 'checklist_items', groupIndex: 0 },
      { slideIndex: 3, type: 'checklist', title: 'Part 2', itemsField: 'checklist_items', groupIndex: 1 },
      { slideIndex: 4, type: 'checklist', title: 'Part 3', itemsField: 'checklist_items', groupIndex: 2 },
      { slideIndex: 5, type: 'checklist', title: 'Part 4', itemsField: 'checklist_items', groupIndex: 3 },
      { slideIndex: 6, type: 'content',  title: '⚠️ Warning', bodyField: 'warning' },
      { slideIndex: 7, type: 'cta',      bodyField: 'cta' },
    ]
  },
};
```

### 2. 文案解析引擎

实现 `parseRawText(rawText, templateId)` 函数：

**解析规则（优先级从高到低）：**
1. 如果文本包含 `[fieldName] value` 格式的高级字段标记，按 field 名称匹配
2. 如果文本包含 `标题：` / `副标题：` / `页面N：` / `CTA：` 等中文标签，按标签解析
3. 如果文本包含 `Slide 1:` / `Slide 2:` 等英文标记，按标记解析
4. 如果文本包含 `888` 分隔符，识别为批量模式，按组分隔
5. 兜底：按空行分隔段落，按模板默认结构顺序分配到各字段

函数返回格式：
```javascript
// 单组模式
{ groups: [[{ slideIndex: 1, type: 'cover', title: '...', subtitle: '...', body: '...', cta: '...' }, ...]] }

// 批量模式（888 分隔）
{ groups: [[...slides group1...], [...slides group2...], ...] }
```

### 3. 默认示例文案

为每个模板提供一套默认示例文案（英文为主，关键位置配中文解释），存储在 `DEFAULT_TEXTS` 对象中：
- `reviewer-response`：围绕 "Reviewer says lack of novelty" 主题
- `before-after-rewrite`：围绕 "Stop writing 'This study is very important'" 主题
- `chinese-phd-mistakes`：围绕 "5 Introduction mistakes Chinese PhD students make" 主题
- `sci-writing-framework`：围绕 "How to write a stronger contribution paragraph" 主题
- `checklist`：围绕 "Before you submit your SCI paper, check these 7 things" 主题

当用户切换模板时，如果 textarea 为空（或用户尚未手动编辑），自动填入对应默认文案。

### 4. 接入现有 UI

- 模板下拉框切换时 → 更新 `state.template` → 如果 textarea 未手动编辑过，填入对应默认文案 → 调用 `parseRawText()` → 更新 `state.slides` → 调用 `updatePreview()`
- textarea 内容变化时 → 调用 `parseRawText()` → 更新 `state.slides` → 调用 `updatePreview()`
- 批量识别 checkbox 勾选时 → 更新 `state.batchMode` → 重新解析

### 5. 验收标准

- 切换模板下拉框，textarea 自动填入对应默认文案
- 修改 textarea 内容，console 中能看到解析后的 slides 数组
- 每种模板的默认文案都能正确解析出 7 个 slide
- 手动输入 `Slide 1: test` 格式能被正确识别
- 页面无 JavaScript 错误

执行完这些提示词后，系统要完整可运行并且不会有任何 bug。
```

---

## 第三批：DOM 幻灯片渲染引擎 + 5 种视觉风格

```
在第二批产出的 `instagram-carousel.html` 基础上，继续开发。

### 1. 定义 5 个视觉风格的 CSS 变量配置

在 JavaScript 中定义 `STYLES` 对象：

```javascript
const STYLES = {
  'academic-paper': {
    name: 'Academic Paper',
    colors: { background: '#fbfaf7', text: '#182033', primary: '#1f4b73', accent: '#c94538', muted: '#667085', surface: '#ffffff', border: '#d9d6ce', tagBg: 'rgba(255,255,255,0.56)', tagBorder: 'rgba(31,75,115,0.22)' },
    fonts: { latin: 'Inter', cjk: 'PingFang SC' },
    features: { gridBg: true, frameBorder: true, paperTexture: false, darkMode: false },
  },
  'editorial-research': {
    name: 'Editorial Research',
    colors: { background: '#faf8f2', text: '#1a1a1a', primary: '#2d2d2d', accent: '#8b2e2e', muted: '#6b6b6b', surface: '#ffffff', border: '#d4cfc4', tagBg: 'rgba(255,255,255,0.7)', tagBorder: 'rgba(45,45,45,0.2)' },
    fonts: { latin: 'Helvetica', cjk: 'PingFang SC' },
    features: { gridBg: false, frameBorder: true, paperTexture: false, darkMode: false, thinLines: true },
  },
  'dark-lecture': {
    name: 'Dark Lecture',
    colors: { background: '#1a1d23', text: '#e8e8e8', primary: '#ffffff', accent: '#00ff88', muted: '#999999', surface: '#252830', border: '#3a3d44', tagBg: 'rgba(0,255,136,0.1)', tagBorder: 'rgba(0,255,136,0.3)' },
    fonts: { latin: 'Inter', cjk: 'PingFang SC' },
    features: { gridBg: false, frameBorder: true, paperTexture: false, darkMode: true, glowAccent: true },
  },
  'minimal-checklist': {
    name: 'Minimal Checklist',
    colors: { background: '#ffffff', text: '#111111', primary: '#000000', accent: '#2563eb', muted: '#737373', surface: '#fafafa', border: '#e5e5e5', tagBg: 'rgba(37,99,235,0.06)', tagBorder: 'rgba(37,99,235,0.2)' },
    fonts: { latin: 'Inter', cjk: 'Noto Sans SC' },
    features: { gridBg: false, frameBorder: false, paperTexture: false, darkMode: false, cleanBorderless: true },
  },
  'blue-lab': {
    name: 'Blue Lab',
    colors: { background: '#f0f4f8', text: '#1a2a3a', primary: '#0d47a1', accent: '#00acc1', muted: '#607d8b', surface: '#ffffff', border: '#cfd8e3', tagBg: 'rgba(13,71,161,0.08)', tagBorder: 'rgba(13,71,161,0.25)' },
    fonts: { latin: 'Arial', cjk: 'Source Han Sans' },
    features: { gridBg: true, frameBorder: true, paperTexture: false, darkMode: false, techGrid: true },
  },
};
```

### 2. 构建 DOM 幻灯片渲染函数

实现 `renderSlide(slideData, styleId, templateId, state)` 函数，返回一个 DOM 元素（1080×1350 的完整幻灯片）。

**通用幻灯片结构：**
```
┌──────────────────────────────────────┐ 1080px
│  ┌────────────────────────────────┐  │
│  │ 内边距 80px                       │  │
│  │                                  │  │
│  │  [顶部标签]              [页码]   │  │ ← 标签行（可选）
│  │                                  │  │
│  │  标题（大字）                      │  │
│  │  副标题（中文解释）                │  │
│  │  正文 / 引用框 / 对比卡 / 列表    │  │ ← 根据 slide type 变化
│  │                                  │  │
│  │                          [CTA]   │  │
│  │                                  │  │
│  │  [底部信息行]          [账号名]   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘ 1350px
```

**根据 `slideData.type` 渲染不同的内容区域：**

a) **cover 类型**（封面页）：
   - 大标题（font-size: 88px, font-weight: 850）
   - 中文副标题（font-size: 42px, 颜色为 primary）
   - 装饰性色块（右下角半透明方块，旋转 -8 度）
   - CTA 文字
   - 底部品牌信息 + 账号名

b) **content 类型**（内容页）：
   - 标题（font-size: 70px）
   - 正文段落（font-size: 38px, line-height: 1.4）
   - 可选引用框

c) **diagnosis 类型**（诊断页）：
   - 标题
   - 2×2 网格布局的四个卡片（Novelty / Method / Data / Writing）
   - 每个卡片带圆点 + 标题 + 说明文字

d) **compare 类型**（对比页）：
   - 标题
   - 左侧 "Weak ❌" 红色标签 + 内容框
   - 右侧 "Stronger ✅" 绿色标签 + 内容框
   - 底部解释文字

e) **numbered 类型**（编号页）：
   - 大号数字（如 "1" 或 "Step 1"）
   - 标题
   - 正文内容

f) **checklist 类型**（清单页）：
   - 标题
   - 4 个复选框项（大方框 + 文字），每项占一行
   - 方框尺寸 38×38px，蓝色边框

g) **cta 类型**（行动号召页）：
   - 大标题
   - CTA 文字（大号、强调色）
   - 底部品牌信息

**引用框（quote）样式：**
- 白色背景，红色/蓝色左边框（8px 宽）
- Georgia 衬线字体
- 带阴影

### 3. 风格应用到幻灯片

实现 `applyStyle(slideElement, styleConfig)` 函数：
- 设置 `slideElement.style.backgroundColor` = style.colors.background
- 设置 CSS 自定义属性 `--ink`、`--blue`、`--red`、`--muted`、`--paper` 等映射到 style.colors
- 如果 `features.gridBg` 为 true，添加网格背景（类似 `carousel.html` 中的 `.slide::before` 伪元素效果）
- 如果 `features.frameBorder` 为 true，添加内边框（类似 `carousel.html` 中的 `.slide::after` 伪元素效果）
- 如果 `features.darkMode` 为 true，调整文字颜色为浅色
- 如果 `features.glowAccent` 为 true，为 accent 色元素添加发光效果（text-shadow 或 box-shadow）
- 如果 `features.cleanBorderless` 为 true，不添加任何装饰性边框和网格

**注意：5 个风格必须在视觉上有明显区别**，用户切换风格时能立即看到不同。

### 4. 预览区渲染

实现（或完善第一批的）`updatePreview()` 函数：
- 获取当前 `state.slides[state.currentSlide]`
- 调用 `renderSlide()` 生成 1080×1350 的 DOM 元素
- 将该元素放入右侧预览区的预览容器中
- 使用 CSS `transform: scale(calc)` 缩放到合适大小（计算方法：预览区可用高度 / 1350，确保整张幻灯片可见）
- 更新页码指示器："第 X / Y 页"
- 根据是否有 slides 数据，启用/禁用 上一页/下一页 按钮和下载按钮

### 5. 页面导航

- "上一页" 按钮：`state.currentSlide` 减 1（最小为 0），调用 `updatePreview()`
- "下一页" 按钮：`state.currentSlide` 加 1（最大为 slides.length - 1），调用 `updatePreview()`
- 边界时按钮 disabled

### 6. 复用现有 `carousel.html` 的视觉资产

从 `carousel.html` 中提取并沿用以下 CSS 样式模式：
- 网格背景（linear-gradient 实现）
- 内边框（绝对定位 + border）
- 标签样式（.tag）
- 引用框样式（.comment）
- 对比布局（.wrong-right / .bad / .good）
- 检查清单样式（.check / .checkbox）

将它们适配为可通过 style 配置动态生成的 JavaScript 样式。

### 7. 验收标准

- 切换模板后，右侧预览区显示对应的幻灯片内容（1080×1350 缩放后可见）
- 切换视觉风格，预览区幻灯片的颜色、背景、装饰元素明显变化
- 5 个风格之间有清晰的视觉差异
- 上一页/下一页按钮可正常切换预览
- 页码指示器正确显示
- 所有 5 个模板 × 5 个风格组合均无布局错乱
- 幻灯片中英文混排正常，中文不出现 tofu 方块
- 页面无 JavaScript 错误

执行完这些提示词后，系统要完整可运行并且不会有任何 bug。
```

---

## 第四批：交互完善 + 品牌设置 + 批量模式 + 合规检测

```
在第三批产出的 `instagram-carousel.html` 基础上，继续开发。

### 1. 品牌设置实时生效

- 账号名输入框修改时 → `state.accountName` 更新 → 所有幻灯片底部的账号名实时更新 → `updatePreview()`
- 品牌短语输入框修改时 → `state.brandPhrase` 更新 → 所有幻灯片底部的品牌信息实时更新
- CTA 文案输入框修改时 → `state.cta` 更新 → 所有幻灯片的 CTA 文字实时更新（覆盖模板默认 CTA 和文案解析出的 CTA）

**注意：** CTA 设置优先级：用户在 CTA 输入框手动输入的值 > 文案中解析出的 CTA > 模板默认 CTA。

### 2. 字体切换实时生效

- 字体下拉框切换时 → `state.font` 更新 → 预览区幻灯片容器 font-family 更新 → 所有文字以新字体渲染
- 英文字体切换后，中文字体应保持 fallback 到 PingFang SC 或 Noto Sans SC

### 3. 批量文案识别模式

当 "启用批量文案识别" 被勾选时：

a) textarea 下方动态显示提示："每组文案用 888 分隔（独占一行）"

b) 解析逻辑调整：
   - 将 textarea 内容按 `\n888\n` 或 `\n888` 或 `888\n` 分隔为多组
   - 每组独立解析为一套 slides
   - `state.slides` 变为嵌套数组：`[[slides_group1], [slides_group2], ...]`

c) 预览区调整：
   - 显示当前组号下拉框："第 1 组 / 共 3 组"
   - 页码指示器显示当前组内的页码
   - 上一页/下一页在组内切换，到达组边界时自动切换到下一组的第一页或上一组的最后一页
   - 也可以直接通过下拉框跳转到任意组

d) 下载整套 Carousel 时，下载所有组的所有幻灯片

e) textarea 默认提供批量示例（勾选后自动填入）：
   ```
   标题：Reviewer says "lack of novelty"
   副标题：Diagnose before you revise
   页面1：Reviewers question more than language
   页面2：Classify: Novelty, Method, Data, or Writing?
   页面3：Weak reply example
   页面4：Stronger reply example
   页面5：Revise the manuscript
   CTA：DM "REVIEWER"
   888
   标题：Reviewer says "method is unclear"
   副标题：Don't just add more details
   页面1：What "unclear method" really means
   页面2：Missing steps or missing rationale?
   页面3：Add implementation details
   页面4：Add evaluation metrics
   页面5：Revise Section 2
   CTA：DM "METHOD"
   ```

### 4. 合规词检测

实现 `checkCompliance(text)` 函数：

a) 定义高风险词列表（中英文）：
   - 英文：ghostwriting, guaranteed acceptance, we write your paper, write my essay, submit on your behalf, contract cheating
   - 中文：代写、包中、包发表、保录用、保过、代投、代发、枪手、论文代笔

b) 定义推荐替代表达：
   - "包发表" → "投稿策略辅导"
   - "保录用" → "返修方案支持"
   - "代写" → "写作辅导"
   - "guaranteed acceptance" → "publication strategy consultation"
   - "ghostwriting" → "manuscript editing support"

c) 检测逻辑：
   - 每次 textarea 内容变化时（debounce 500ms），扫描全部文案
   - 如果发现高风险词，在 textarea 下方显示黄色警告条
   - 警告条内容：列出发现的风险词，每个后跟推荐替代表达
   - 格式：`⚠️ 检测到"包发表"。建议替换为"投稿策略辅导"或"返修方案支持"。`
   - 同时高亮 textarea 中的风险词（通过 CSS 背景色标记，可以用覆盖层或 contenteditable 实现；如果实现复杂，可先用警告条文字提示即可，不做 textarea 内高亮）

d) 合规警告不影响用户继续使用，仅作为提醒

### 5. CTA 快捷选择器

在 CTA 输入框下方添加一个 CTA 快捷选择区域：

a) 显示为一行小标签/按钮，每个按钮上写简短 CTA 关键词，hover 显示完整 CTA 文案

b) 内置 CTA 选项：
   - "Save this before your next revision."
   - 'DM "REVIEWER" for the checklist.'
   - 'Comment "TEMPLATE" for the structure.'
   - "Follow for SCI writing tips."
   - "Send this to a friend preparing revision."
   - "Book a 20-min manuscript diagnosis."
   - 'DM "INTRO" for the Introduction checklist.'
   - 'DM "SUBMIT" for the submission checklist.'

c) 点击任一 CTA 标签 → 自动填入 CTA 输入框 → 触发预览更新

### 6. UI 微调

- 风格选择卡片被选中时，显示蓝色边框 + 浅蓝背景
- 模板下拉框旁边增加一个小信息图标（ℹ️），hover 显示该模板的用途说明 tooltip：
  - Reviewer Response："讲解审稿意见如何拆解和回应"
  - Before After Rewrite："展示论文句子改写能力，建立专业信任"
  - Chinese PhD Mistakes："面向中国留学生，常见论文写作错误"
  - SCI Writing Framework："论文写作框架，收藏型内容"
  - Checklist："高收藏高转发，资料包引流"
- textarea 右下角显示字符计数："已输入 XXX 字符"

### 7. 验收标准

- 修改账号名、品牌短语、CTA 输入框，预览区幻灯片即时更新
- 切换字体，预览区文字以新字体渲染
- 勾选批量模式，输入 888 分隔的多组文案，能正确拆分并逐组预览
- 输入含"包发表"或"ghostwriting"的文案，出现黄色合规警告
- 点击 CTA 快捷标签，CTA 输入框自动填入
- 所有交互流畅，无 JavaScript 错误

执行完这些提示词后，系统要完整可运行并且不会有任何 bug。
```

---

## 第五批：客户端 PNG 导出 + ZIP 打包

```
在第四批产出的 `instagram-carousel.html` 基础上，继续开发。

### 1. 单页 PNG 导出

实现 `exportCurrentSlide()` 函数：

**技术方案：SVG foreignObject → Canvas → PNG blob → 下载**

步骤：
a) 获取当前幻灯片 DOM 元素（调用 `renderSlide()` 在内存中生成，不挂载到 DOM）
b) 将该元素的 outerHTML 序列化
c) 构建一个 SVG 字符串：
```javascript
const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
  <foreignObject width="1080" height="1350">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:1080px;height:1350px;">
      ${slideElement.outerHTML}
    </div>
  </foreignObject>
</svg>`;
```
d) 创建 Blob → Object URL → 加载到 `<img>` → 绘制到 Canvas（1080×1350）→ `canvas.toBlob()` → 触发下载
e) 注意：SVG 中的样式必须内联（将 `<style>` 标签嵌入 foreignObject 的 div 中），确保渲染正确
f) 确保所有字体已加载（使用 `document.fonts.ready` 等待）

下载文件名格式：
- 单组：`{template-id}-slide-{NN}.png`（如 `reviewer-response-slide-01.png`）
- 批量：`{YYYY-MM-DD}-{template-id}-{group-NN}-slide-{NN}.png`

实现时注意：
- 图片必须 1080×1350 px，无白边、无裁切
- 导出前显示 loading 状态（按钮文字变为"导出中..."，按钮 disabled）
- 导出完成后恢复按钮状态
- 导出失败时 alert 提示错误信息

### 2. 整套 Carousel 批量导出

实现 `exportAllSlides()` 函数：

a) 普通模式（单组）：
   - 遍历 `state.slides`，为每个 slide 生成 PNG 并触发下载
   - 每次下载间隔 300ms（避免浏览器阻止批量下载）

b) 批量模式（多组）：
   - 遍历所有组的所有 slides，依次下载
   - 文件名区分组号

c) **ZIP 打包方案**（优先实现）：
   - 使用 JSZip（CDN 加载：`https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`）
   - 将所有 slide 渲染为 Canvas → 获取 blob → 添加到 ZIP
   - 文件名按规范命名
   - 最后 `zip.generateAsync({ type: 'blob' })` → 触发下载
   - ZIP 文件名：`{template-id}-carousel-{YYYY-MM-DD}.zip`

d) 进度提示：
   - 批量导出时显示进度条或文字提示："正在导出 3/7..."
   - 导出完成后显示 "已导出 7 张图片"

### 3. 导出质量保证

在导出流程中加入以下检查：

a) **字体加载检查**：导出前调用 `document.fonts.ready` 确保字体就绪
b) **Canvas 尺寸确认**：canvas.width 必须为 1080，canvas.height 必须为 1350
c) **图片格式**：PNG（image/png），不压缩质量
d) **白边检查**：幻灯片背景色必须充满整个 1080×1350（设置 `.slide` 的 background-color）
e) **文字不可溢出**：确保所有文字在 80px 内边距后的安全区内（即 80px ~ 1000px 宽 × 80px ~ 1270px 高）

### 4. 下载按钮接入

- "下载当前页 PNG" 按钮 → 绑定 `exportCurrentSlide()`
- "下载整套 Carousel（ZIP）" 按钮 → 绑定 `exportAllSlides()`
- 两个按钮在 state.slides 为空时 disabled
- 导出过程中两个按钮均 disabled + 显示 loading 文字

### 5. 动态加载 JSZip

在 `<head>` 或 `<script>` 顶部按需加载 JSZip：
```javascript
function loadJSZip() {
  return new Promise((resolve, reject) => {
    if (window.JSZip) return resolve(window.JSZip);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve(window.JSZip);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

### 6. 验收标准

- 点击"下载当前页 PNG"，浏览器下载一张 1080×1350 的 PNG 图片
- 下载的图片用预览工具打开，确认无白边、无文字裁切、颜色正确
- 中英文文字清晰可读（无模糊）
- 点击"下载整套 Carousel"，浏览器下载一个 ZIP 文件
- 解压 ZIP，包含正确命名的 7 张（或 N 张）PNG 图片
- 批量模式下，ZIP 包含所有组的所有幻灯片
- 导出过程中有 loading 提示，完成后恢复
- 5 种风格导出的图片均有正确的视觉风格
- 无 JavaScript 错误

执行完这些提示词后，系统要完整可运行并且不会有任何 bug。
```

---

## 第六批：边缘情况处理 + 文字溢出保护 + 响应式适配 + 最终集成

```
在第五批产出的 `instagram-carousel.html` 基础上，继续开发和完善。

### 1. 文字溢出保护

实现 `fitText(element, maxWidth, maxHeight)` 函数：

a) 渲染后检测文字是否超出容器
b) 溢出时按优先级处理：
   1. 自动缩小字号（每次减 2px，最小不低于原字号的 60%）
   2. 仍溢出时自动换行（word-break: break-word）
   3. 仍溢出时截断并显示省略号
c) 对以下元素做溢出检查：
   - 封面标题（h1）：最大宽度 860px，最大高度约 200px
   - 副标题：最大宽度 850px，最大高度约 120px
   - 正文段落：最大宽度 850px，最大高度约 300px
   - CTA 文字：最大宽度 850px，单行优先

实现方式：
- 在幻灯片渲染完成后，遍历所有文字元素
- 使用 `element.scrollWidth > element.clientWidth` 或 `element.scrollHeight > element.clientHeight` 检测溢出
- 逐步减小 font-size 直到不再溢出或达到下限

### 2. 文字长度超限提示

在 textarea 上方或下方添加实时校验：

a) 封面标题：超过 70 英文字符或 28 中文字符时，显示橙色提示 "⚠️ 标题过长，建议精简（当前 XX 字符）"
b) 正文段落：每页超过 5 行时，显示提示
c) CTA：超过 80 英文字符或 32 中文字符时，显示提示

提示不要阻断用户操作，仅作为建议。

### 3. 中英文混排优化

a) 在中英文混排的文字元素上应用以下 CSS：
   - `text-rendering: optimizeLegibility`
   - 英文单词与中文字符之间自动添加 0.25em 间距（通过正则替换或 word-spacing）
   - 行高对中英文混合行做微调

b) 实现辅助函数 `addCJKS pacing(text)`：
   - 在中文字符和英文字符/数字之间自动插入微间距（可以用 `<span style="margin:0 0.125em">` 或 Unicode 微空格）
   - 示例：`"论文被返修 don't rush"` → `"论文被返修 don't rush"`

### 4. 图片尺寸切换预留

虽然 MVP 只支持 1080×1350，但代码需要为后续扩展做好准备：

a) 当 `state.size` 改变时，幻灯片容器尺寸和导出尺寸随之改变
b) Reel Cover 和 Story（1080×1920）的布局调整为：标题区占比缩小，内容区上移，底部留更多空间
c) Square Post（1080×1080）的布局调整为：内容区压缩，减少 padding
d) MVP 阶段，size 下拉框中非 1080×1350 的选项保持 disabled，但代码中的渲染逻辑支持动态尺寸

实现方式：
- 将硬编码的 1080、1350、80（padding）等值替换为从 `state.size` 派生的变量
- 幻灯片渲染函数接受 width、height 参数

### 5. 错误状态处理

a) **文案解析失败**：如果 `parseRawText()` 返回空 slides 数组，预览区显示友好提示："无法解析文案，请检查格式。（提示：可用 '标题：' '页面1：' 等标签标记内容）"

b) **字体加载失败**：如果指定字体不可用，回退到系统默认字体（sans-serif），不报错

c) **导出失败**：
   - Canvas 污染（tainted canvas）→ alert 具体错误信息
   - Blob 创建失败 → alert "浏览器不支持导出功能，请使用 Chrome 或 Edge"
   - JSZip 加载失败 → 降级为逐个下载（不使用 ZIP）

d) **图片加载超时**：SVG → img 转换超时（10 秒）则提示用户重试

### 6. 响应式适配

a) 视口宽度 < 1200px 时：
   - 左侧控制区宽度缩小为 340px
   - 预览区幻灯片缩放比例相应减小
   - 风格选择卡片从 2 行变为 3+2 或单列排列

b) 视口宽度 < 900px 时：
   - 布局从左右切换为上下（左侧控制区在上，预览区在下）
   - 左侧控制区变为可折叠的手风琴面板
   - 预览区幻灯片缩小到合适尺寸

c) 移动端（< 600px）：
   - 全部控件垂直堆叠
   - 预览区幻灯片进一步缩小
   - 按钮变为全宽

### 7. 键盘快捷键

添加以下键盘快捷键（带提示，可选显示/隐藏）：

- `Ctrl/Cmd + ←`：上一页
- `Ctrl/Cmd + →`：下一页
- `Ctrl/Cmd + S`：下载当前页 PNG
- `Ctrl/Cmd + Shift + S`：下载整套 Carousel

在预览区下方或顶部添加一个小图标 `⌨️`，hover 显示快捷键列表。

### 8. 最终集成检查

a) 确保所有 5 个模板 × 5 个风格 = 25 个组合均能正常渲染和导出
b) 确保批量模式 + 模板切换 + 风格切换 + 字体切换的组合操作不产生状态冲突
c) 确保 CTA 设置优先级正确（手动 > 解析 > 默认）
d) 确保合规检测不产生误报（如 "submission" 不应匹配 "submit on your behalf"）
e) 清理所有 `console.log` 调试代码（或改为 `console.debug`）
f) 代码中添加关键注释，标注各模块职责

### 9. 验收标准

- 输入超长标题文案，幻灯片中文字自动缩小不溢出
- 调整浏览器窗口大小，布局正常切换（桌面 → 平板 → 手机）
- 中英文混排文字间距自然、美观
- 所有错误状态都有友好提示，不出现白屏或静默失败
- 键盘快捷键正常工作
- 25 个模板×风格组合均可正常预览和导出
- 导出的 PNG 图片可直接用于 Instagram 发布
- 整个工具从选择模板到下载整套 Carousel 可在 3 分钟内完成
- 无任何 JavaScript 错误或警告

执行完这些提示词后，系统要完整可运行并且不会有任何 bug。最终系统是一个完整可用的 Instagram 学术内容图生成器，用户可以在不借助任何外部工具的情况下，独立完成模板选择、文案输入、风格切换、预览确认、PNG/ZIP 导出的完整工作流。
```

---

## 附录：各批次产出文件清单

| 批次 | 文件 | 操作 |
|------|------|------|
| 第一批 | `instagram-carousel.html` | 新建 |
| 第二批 | `instagram-carousel.html` | 修改（追加模板数据 + 解析引擎） |
| 第三批 | `instagram-carousel.html` | 修改（追加渲染引擎 + 5 风格） |
| 第四批 | `instagram-carousel.html` | 修改（追加交互 + 合规 + CTA） |
| 第五批 | `instagram-carousel.html` | 修改（追加导出功能） |
| 第六批 | `instagram-carousel.html` | 修改（完善边缘情况） |

所有批次操作同一个文件，逐批累加功能。

---

## 附录：技术备忘

1. **为什么选 SVG foreignObject 方案而不是 html2canvas？**
   零外部依赖（除 JSZip），完全控制渲染管线，font 处理和颜色准确性更好。

2. **为什么 DOM 渲染而不是 Canvas 渲染预览？**
   DOM 可以复用现有的 CSS 样式系统，文字渲染质量更高（亚像素渲染），中英文混排由浏览器原生处理，开发和调试更容易。

3. **JSZip 为何通过 CDN 加载？**
   唯一的外部依赖。如果 CDN 不可用，降级为逐个下载。

4. **canvas 尺寸为什么是 1080×1350 而不是 1080/2=540×675？**
   Instagram 要求 1080×1350。如果担心性能，可以在预览时用较小 canvas，导出时用全尺寸。但 DOM 预览方案不存在此问题——预览是 CSS scale 缩放的 DOM，导出时才走 Canvas 管线。
