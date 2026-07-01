# 小红书封面生成器 · 多批次 AI 构建提示词 v1.0

> **用途**: 用户按顺序逐条复制每条提示词,喂给 AI 编程助手(Claude Code / Cursor / Copilot)
> **目标**: 在现有 `cover-maker/` 项目基础上,基于 STYLE_GUIDE v2.0 的反馈评审意见,产出**完整可运行无 bug**的 v3.0 系统
> **版本**: v1.0 (2026-06-30)
> **配套文件**: `STYLE_GUIDE.md`(v2.0 保留,v3.0 待生成)、`index.html`(643 行,待重构)、`README.md`
> **执行原则**: 严格按 7 个批次顺序执行,每条提示词末尾固定结束语是质量验收闸门

---

## 📋 总体执行规则

1. **顺序执行**: 必须按 批次 1 → 2 → 3 → 4 → 5 → 6 → 7 顺序执行,不可跳批
2. **每条提示词末尾固定结束语**:
   ```
   执行完这些提示词后,系统要完整可运行并且不会有任何bug
   ```
   AI 输出完成后,必须自己验证满足此条;不满足则继续修复直到满足
3. **每批次结束运行验证命令**: 见每批次末尾的"批次验收"小节
4. **任何批次失败**: 先修复当前批次再继续,不要带着 bug 进入下一批
5. **跨批次的引用**: 后续批次提示词中标注的"前置产物"是输入;AI 需先读取它们再开工

---

## 批次 1 · 项目现状审计

> **目标**: 让 AI 完整阅读现有代码,输出一份精确审计报告,作为后续所有批次的真实起点
> **前置**: 无(项目已存在)

### 提示词 1.1 · 全量阅读并输出审计报告

```
你是一名资深全栈工程师。请按以下步骤完整审计现有项目,只读不改,最后输出一份结构化报告。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【审计要求】
1. 使用 Read 工具完整阅读以下文件(不要省略任何行):
   - /Users/andy/Documents/Andy AI/cover-maker/index.html(643 行,主应用)
   - /Users/andy/Documents/Andy AI/cover-maker/STYLE_GUIDE.md(1185 行,风格指南 v2.0)
   - /Users/andy/Documents/Andy AI/cover-maker/README.md
   - /Users/andy/Documents/Andy AI/cover-maker/.gitignore
   - /Users/andy/Documents/Andy AI/cover-maker/.claude/settings.local.json

2. 用 Bash 工具执行 ls -la /Users/andy/Documents/Andy AI/cover-maker/ 确认目录结构,列出所有文件

3. 输出报告,严格按以下 5 个章节:

   ## 1.1 技术栈与依赖
   - 列出 HTML/CSS/JS 用到的所有外部 CDN(Google Fonts、html2canvas 等)
   - 列出所有中文字体名称
   - 标注是否有构建步骤(npm/vite/webpack)

   ## 1.2 现有 5 种风格清单
   - 从 index.html 中精确提取 5 种风格(Notebook / iOS Notes / Halo / Quotes / Torn Paper)的:
     * 实现代码起始行号
     * 核心 CSS 类名
     * 视觉效果描述(基于代码推断,不要瞎编)

   ## 1.3 现有交互清单
   - 列出所有按钮及其功能(生成/换一换/下载/复制)
   - 列出所有键盘事件
   - 列出响应式断点

   ## 1.4 STYLE_GUIDE.md v2.0 已知缺陷(基于评审反馈)
   - 7 大公式的真实占比偏差(指南声称 65% 纯色大字,实际目测 20-25%)
   - 缺失的 12 个视觉特征(手绘圈、云朵高光、方格纸、半色调、对话气泡、荧光笔、撕边便签、印章、3D emoji、精细卡通、漫画放射线、马克笔字)
   - 装饰数量上限过严(指南说 ≤2,实际 4-8 个)
   - 英文 AI prompt 方向错误("editorial poster / Swiss design" 与大字封面气质相反)
   - 角色库过于扁平(缺拟真 3D / 描边插画 / 涂鸦火柴人 / Emoji 大图 4 种细分)
   - 字体方案仅 Noto Sans SC Black,缺马克笔 / 卡通描边 / 手写体

   ## 1.5 重构方向(为后续批次提供锚点)
   - 5 大真实风格族建议: 手绘便签 / 拼贴 collage / 漫画 pop / 报纸大字 / 极简大字
   - 每种风格族的典型视觉元素
   - 哪些现有代码可以保留,哪些必须废弃

4. 报告字数控制在 1500-2500 字,不要写流水账,只写对后续重构有用的信息

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 1 验收
- AI 输出报告 ≥ 5 个章节
- 报告中提到的文件路径必须与实际一致
- 不允许出现"我猜测"、"可能"等含糊措辞,该用代码引用就用代码引用

---

## 批次 2 · STYLE_GUIDE.md v3.0 重构

> **目标**: 基于批次 1 的审计报告和评审反馈,产出 `STYLE_GUIDE.md v3.0`
> **前置产物**: 批次 1.1 的审计报告
> **保留策略**: 不覆盖 v2.0,新增 `STYLE_GUIDE_v3.0.md` 作为新版本;v2.0 作为历史归档保留

### 提示词 2.1 · 重写 STYLE_GUIDE v3.0

```
你是一名资深 UI 设计师 + 内容策划,基于以下输入重写风格指南 v3.0:

【输入 1:审计报告】
批次 1.1 输出的 5 章节审计报告(包含技术栈、现有风格、缺陷清单、重构方向)

【输入 2:评审反馈】
原 STYLE_GUIDE.md v2.0 的核心缺陷(基于真实样本对比得出):
- 把"小红书大字封面"误归为"极简编辑海报"
- 实际风格是"手绘涂鸦 + 手账拼贴 + 漫画风"
- 7 大公式无法覆盖真实多样性,必须重构成 5 大真实风格族:
  * 风格族 A · 手绘便签风(米黄方格纸/横线纸 + 手绘圈线 + 马克笔字)
  * 风格族 B · 拼贴 collage 风(撕边便签 + 多色块 + 印章 + 贴纸堆叠)
  * 风格族 C · 漫画 pop 风(半色调网点 + 对话气泡 + 放射线 + 涂鸦字)
  * 风格族 D · 报纸大字风(纯色块 + 描边粗体 + 信息层叠 + 印章)
  * 风格族 E · 极简大字风(纯色 + 干净黑体 + 极少装饰,保留作为低饱和备选)
- 每种风格族的装饰上限放宽到 4-6 个,但要求分区清晰
- 配色规则放宽到 4-6 色共存,但要求主色 + 1-2 个强调色
- 字体方案扩展为 6 类: 黑体粗体 / 衬线宋体 / 马克笔体 / 卡通描边 / 手写草书 / 楷体细瘦

【输入 3:真实样本参考】
/Users/andy/Downloads/大字封面设计模板_大字封面模板素材-稿定设计/ 目录下有 192 张真实稿定设计模板 JPG/WebP/GIF,这是 v3.0 的事实数据底片(不要再用 v2.0 那套"程序化色彩聚类"——那份已经偏离真实)

【输出文件】
/Users/andy/Documents/Andy AI/cover-maker/STYLE_GUIDE_v3.0.md

【输出要求】
1. 文档顶部必须有清晰版本号:
   ---
   版本: v3.0
   基于: v2.0(已归档) + 192 张真实稿定设计样本的视觉评审
   日期: 2026-06-30
   主要变更: 风格族重构(7 公式 → 5 风格族) + 视觉特征库扩充(12 项新增)
   ---

2. 必含以下 9 个章节(顺序固定):
   - §1 数据底片修订(v2.0 的统计偏差修正,标注每个数字的依据)
   - §2 5 大真实风格族(A/B/C/D/E 各一节,每节含:典型样本描述、配色 hex 表、字体推荐、AI Prompt 中英文双版)
   - §3 12 项新增视觉特征清单(手绘圈、云朵高光、方格纸、半色调、对话气泡、荧光笔、撕边便签、印章、3D emoji、精细卡通、漫画放射线、马克笔字,每项含 SVG/Canvas 实现建议)
   - §4 统一底层基因(字号/构图/装饰密度规则,装饰上限从 ≤2 改为 4-6)
   - §5 装饰互斥矩阵 v3.0(扩展原 v2.0 的 4×6 矩阵为 6×6)
   - §6 智能联动策略(字数感应 + 关键词感应 + 边缘场景)
   - §7 AI 投喂最佳实践 v3.0(英文 prompt 必须显式包含 "Chinese KOL sticker aesthetic, hand-drawn marker circles, scrapbook collage, halftone dots, comic speech bubble, notebook paper background";必须显式 negative "editorial poster, Swiss design, minimalist, clean typographic")
   - §8 落地路径(AI 生图 / 程序化生成 / 混合模式 三选一指引)
   - §9 种子参考图索引(从 192 张样本中按 5 大风格族各选 2-3 张种子图)

3. 文档长度控制在 1500-2500 行(比 v2.0 的 1185 行扩充约 30-50%,体现新增内容)

4. 所有 hex 色值必须以 #RRGGBB 格式精确给出,不允许写"深红"、"浅灰"等模糊表述

5. 所有 AI Prompt 必须中英文双版

6. 不允许出现"建议"、"可以"等弱化措辞,该规定就规定,该禁止就禁止

7. 末尾附"从 v2.0 到 v3.0 的变更清单"表格,列出每条具体修改

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 2 验收
- 文件 `/Users/andy/Documents/Andy AI/cover-maker/STYLE_GUIDE_v3.0.md` 存在
- 包含 9 个 §章节,顺序正确
- 顶部版本号完整
- 5 大风格族各自有完整的 hex 表 + AI Prompt
- 12 项视觉特征全部列出
- 文档行数 ≥ 1500

---

## 批次 3 · 视觉特征库(12 项 SVG/Canvas 实现)

> **目标**: 把 v3.0 列出的 12 项视觉特征用代码实现,沉淀到独立 JS 模块
> **前置产物**: `STYLE_GUIDE_v3.0.md`
> **新增文件**:
> - `/Users/andy/Documents/Andy AI/cover-maker/lib/features.js`(12 个特征的渲染函数)
> - `/Users/andy/Documents/Andy AI/cover-maker/lib/colors.js`(颜色 token + 配色库)

### 提示词 3.1 · 创建 features.js 视觉特征库

```
你是一名资深前端工程师。基于 STYLE_GUIDE_v3.0.md 的 §3 章节,实现 12 项视觉特征的渲染函数库。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
/Users/andy/Documents/Andy AI/cover-maker/STYLE_GUIDE_v3.0.md(批次 2 已生成)

【输出文件 1】
/Users/andy/Documents/Andy AI/cover-maker/lib/features.js

【输出文件 2】
/Users/andy/Documents/Andy AI/cover-maker/lib/colors.js

【features.js 实现要求】
1. 使用 ES Module 导出,每个特征一个独立函数
2. 函数命名严格按以下清单(12 个,缺一不可):

   F1. drawHandDrawnCircle(ctx, x, y, w, h, color, lineWidth)
       - 用 quadraticCurveTo 绘制不规则椭圆,3-4 段贝塞尔曲线
       - 末端不闭合(留 5-10px 缺口,模拟手绘甩笔)
       - 抖动通过 sin 随机相位实现

   F2. drawCloudHighlight(ctx, x, y, w, h, color, opacity)
       - 多个圆相切组成云朵形状
       - 边缘用高斯模糊或径向渐变模拟荧光笔涂出
       - 颜色和文字色对比度 < 30%,作为背景

   F3. drawNotebookPaper(ctx, w, h, paperType)
       - paperType: 'grid' | 'lined' | 'dot' | 'plain'
       - grid: 8-10px 间距的细线网格,颜色 rgba(0,0,0,0.06)
       - lined: 顶部 80px 空白 + 等距横线
       - dot: 圆点矩阵
       - plain: 米黄纯色 #fdf6e9

   F4. drawHalftone(ctx, x, y, w, h, dotColor, density)
       - 半色调网点矩阵
       - 圆点大小随机 1-4px,密度参数 0.1-1.0
       - 颜色饱和度可比背景高

   F5. drawSpeechBubble(ctx, x, y, w, h, fillColor, borderColor, tailDir)
       - 圆角矩形 + 三角形尾巴
       - tailDir: 'left' | 'right' | 'top' | 'bottom'
       - 边框 2-3px 黑或深灰

   F6. drawHighlighter(ctx, x, y, w, h, color)
       - 半透明长条色块
       - 颜色 alpha 0.35-0.45
       - 边缘不规则模拟荧光笔

   F7. drawTornNote(ctx, x, y, w, h, paperColor)
       - 白色便签纸,边缘撕裂效果
       - 用 Path 绘制锯齿边缘
       - 可选轻微投影

   F8. drawStamp(ctx, x, y, w, h, text, color, rotation)
       - 矩形或圆角矩形印章
       - rotation 默认 -10° 到 -25°
       - 边框 3-4px 粗黑边
       - 文字白色居中

   F9. drawEmojiSticker(ctx, x, y, size, emoji)
       - 用 ctx.fillText 渲染 emoji
       - size 默认 60-120px
       - 位置可叠加轻微投影

   F10. drawComicBurst(ctx, cx, cy, outerR, innerR, points, color)
        - 多角星放射线
        - points: 12-20 个尖角
        - 旋转角度随机

   F11. drawMarkerText(ctx, text, x, y, fontSize, color)
        - 在 text 之上叠加 2-3 个偏移版本(alpha 0.15)
        - 模拟马克笔涂出/重影

   F12. drawStickerCharacter(ctx, type, x, y, size)
        - type: 'cat-megaphone' | 'alarm-clock' | 'thumbs-up' | 'sparkle' | 'crown' | 'lightning'
        - 用 SVG Path 绘制简化版卡通形象
        - 不依赖外部图片资源

3. 每个函数必须有 JSDoc 注释:
   - @param 列出所有参数及类型
   - @return 说明(若返回值为空 void 也需注明)
   - 注释顶部一句话说明典型使用场景

4. 文件末尾统一导出:
   ```js
   export {
     drawHandDrawnCircle,
     drawCloudHighlight,
     drawNotebookPaper,
     drawHalftone,
     drawSpeechBubble,
     drawHighlighter,
     drawTornNote,
     drawStamp,
     drawEmojiSticker,
     drawComicBurst,
     drawMarkerText,
     drawStickerCharacter
   };
   ```

5. 文件顶部用注释块说明:
   ```js
   /**
    * 大字封面视觉特征库 v3.0
    * 12 项基础特征,每项一个独立函数
    * 依赖: Canvas 2D API
    * 配套: STYLE_GUIDE_v3.0.md §3
    */
   ```

【colors.js 实现要求】
1. 导出 5 大风格族各自的配色方案:
   ```js
   export const PALETTES = {
     handDrawn: { /* 5 套,每套含 bg/primary/secondary/accent/text 5 个色 */ },
     collage: { /* 同上 */ },
     comicPop: { /* 同上 */ },
     newspaper: { /* 同上 */ },
     minimal: { /* 同上 */ }
   };
   ```

2. 每套配色从 STYLE_GUIDE_v3.0.md §2 对应章节精确取 hex 值

3. 额外导出一个工具函数:
   ```js
   export function ensureContrast(bgColor, textColor) {
     // 若对比度 < 4.5,自动把 textColor 改为黑或白
     // 用 WCAG 公式计算对比度
   }
   ```

4. 文件顶部注释说明配色数据来源

【验证步骤(AI 必须自测)】
1. 用 Bash 创建 lib/ 目录: mkdir -p /Users/andy/Documents/Andy AI/cover-maker/lib
2. 用 Write 创建两个文件
3. 用 Read 自检 2 次确认内容写入完整
4. 用 node -e "import('/Users/andy/Documents/Andy AI/cover-maker/lib/features.js').then(m => console.log(Object.keys(m).length))" 验证可加载且导出 12 个函数(注意:用 dynamic import,因为是 ESM)
   - 若报错,修复直到通过

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 3 验收
- `lib/features.js` 存在,导出 12 个函数名
- `lib/colors.js` 存在,导出 PALETTES 对象
- `node -e "import('.../lib/features.js').then(...)"` 命令成功执行
- 12 个函数每个都有 JSDoc 注释
- 5 大风格族配色每族 ≥ 5 套

---

## 批次 4 · index.html 重构(v3.0 风格族)

> **目标**: 重构现有 index.html,把 5 个旧风格替换为 v3.0 的 5 大风格族
> **前置产物**: `STYLE_GUIDE_v3.0.md`、`lib/features.js`、`lib/colors.js`
> **保留策略**: 把当前 `index.html` 重命名为 `index_v2_backup.html`,新建 `index.html` 作为 v3.0

### 提示词 4.1 · 重构 index.html

```
你是一名资深全栈工程师。基于 v3.0 风格指南和视觉特征库,重构现有封面生成器。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
- /Users/andy/Documents/Andy AI/cover-maker/index.html(643 行,旧版,需备份)
- /Users/andy/Documents/Andy AI/cover-maker/STYLE_GUIDE_v3.0.md(批次 2 已生成)
- /Users/andy/Documents/Andy AI/cover-maker/lib/features.js(批次 3 已生成)
- /Users/andy/Documents/Andy AI/cover-maker/lib/colors.js(批次 3 已生成)

【第一步:备份旧版】
用 Bash 执行:
cp /Users/andy/Documents/Andy AI/cover-maker/index.html /Users/andy/Documents/Andy AI/cover-maker/index_v2_backup.html

【第二步:重写 index.html】
新 index.html 必须实现以下 5 大风格族(每个风格族一个独立函数):

  styleA_handDrawn(ctx, text, palette, options)
    - 背景: drawNotebookPaper('grid')
    - 文字: drawMarkerText + 黑色超粗体
    - 装饰: drawHandDrawnCircle 圈住 1-2 个关键词
    - 总装饰元素: 3-4 个

  styleB_collage(ctx, text, palette, options)
    - 背景: drawTornNote + 轻微 drawHalftone
    - 文字: 黑体粗体 + drawHighlighter 长条高亮 1-2 处
    - 装饰: drawStamp 倾斜印章 + drawEmojiSticker 大 emoji
    - 总装饰元素: 4-6 个

  styleC_comicPop(ctx, text, palette, options)
    - 背景: 纯色 + drawComicBurst 从中心放射
    - 文字: 粗黑体 + 描边
    - 装饰: drawSpeechBubble 对话气泡 + drawEmojiSticker
    - 总装饰元素: 3-5 个

  styleD_newspaper(ctx, text, palette, options)
    - 背景: 纯色(红/黄/蓝)
    - 文字: 白/黑粗体大字 + 信息层叠(主标题+副标题+小标签)
    - 装饰: drawStamp 红色印章 + drawHighlighter
    - 总装饰元素: 2-3 个

  styleE_minimal(ctx, text, palette, options)
    - 背景: 纯色
    - 文字: 干净黑体超粗
    - 装饰: 仅 0-1 个 drawHandDrawnCircle 或几何
    - 总装饰元素: 0-1 个

【第三步:UI 结构】
1. 顶部 Header:标题 "小红书大字封面生成器 v3.0" + 副标题
2. 输入区:
   - 大 textarea(高度 100px,可输入 1-30 字)
   - "生成 20 张" 主按钮
   - "全部换一换" 次按钮
   - 5 个风格族切换 tabs(可勾选启用哪些风格)
3. 字体切换区:6 类字体 tab(衬线/黑体/马克笔/卡通描边/草书/楷体)
4. 网格区:grid 布局,响应式 auto-fill minmax(240px, 1fr)
5. 每张卡片右下角 actions: 下载 PNG / 复制到剪贴板 / 单卡换一换

【第四步:技术细节】
1. 卡片用 Canvas 渲染,分辨率 1242×1656(3:4)
2. 显示缩略图用 CSS aspect-ratio: 3/4 + transform: scale()
3. 下载用 canvas.toBlob → URL.createObjectURL → a.download
4. 复制到剪贴板用 canvas.toBlob + ClipboardItem('image/png', blob)
5. html2canvas 仍然从 CDN 引入,作为备份方案(用于含复杂 DOM 的卡片)
6. 中文字体仍用 fonts.font.im 镜像,扩展为:
   Noto Serif SC / Noto Sans SC Black / Liu Jian Mao Cao / ZCOOL XiaoWei / ZCOOL KuaiLe / ZCOOL QingKe HuangYou / Ma Shan Zheng / DM Serif Display
7. 响应式断点: ≤767px 手机端(2 列),768-1024px 平板(3 列),>1024px 桌面(4-5 列)

【第五步:替换为 ES Module】
1. 在 index.html 的 <script type="module"> 中:
   ```html
   <script type="module">
     import { ... } from './lib/features.js';
     import { PALETTES, ensureContrast } from './lib/colors.js';
     // 渲染逻辑
   </script>
   ```

2. lib/ 目录下的 JS 不再依赖 CDN,完全本地化

【第六步:可访问性 & UX】
1. 所有按钮加 aria-label
2. textarea 加 placeholder 和 maxlength=30
3. 加载状态提示(生成时按钮显示 "生成中..." 并 disabled)
4. 错误处理:字体加载失败时降级到系统字体
5. 顶部加一行提示:"💡 基于 192 张稿定设计真实样本蒸馏"

【验证步骤(AI 必须自测)】
1. 用 Bash 确认备份存在: ls -la /Users/andy/Documents/Andy AI/cover-maker/index*.html
2. 用 Read 自检新 index.html 至少 2 次确认完整
3. 用 Bash 执行静态语法检查(不需要服务器):
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker
   node --check lib/features.js  # 语法检查
   node --check lib/colors.js    # 语法检查
   ```
4. 用 grep 检查关键标识符:
   ```bash
   grep -c "styleA_handDrawn" index.html  # 应 ≥ 1
   grep -c "styleE_minimal" index.html    # 应 ≥ 1
   grep -c "drawHandDrawnCircle" index.html  # 应 ≥ 1
   ```

【文件大小约束】
新 index.html 应在 1500-2500 行(因 5 个风格族函数 + 完整 UI + ES Module 集成)
不允许 < 1500 行(说明功能不完整)
不允许 > 3000 行(说明有过多冗余)

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 4 验收
- `index_v2_backup.html` 存在(643 行旧版)
- 新 `index.html` 行数在 1500-2500 之间
- `node --check lib/features.js` 通过
- `node --check lib/colors.js` 通过
- 5 个 `styleX_*` 函数全部在 index.html 中可见
- 至少 3 个 `drawXxx` 函数被调用

---

## 批次 5 · 交互细节、动效、可访问性

> **目标**: 完善所有交互细节,确保无 bug、动效流畅、键盘可达
> **前置产物**: v3.0 index.html
> **本次修改**: 仅修改 index.html,不动其他文件

### 提示词 5.1 · 完善交互与无障碍

```
你是一名资深前端工程师,在批次 4 基础上完善 index.html 的交互细节。

【输入文件】
/Users/andy/Documents/Andy AI/cover-maker/index.html(批次 4 已生成,1500-2500 行)

【本次修改清单(必须逐项完成,缺一不可)】

1. 字号自适应算法
   - 1-4 字:字号 = canvas_height * 0.18,撑满画面 60-70%
   - 5-9 字:字号 = canvas_height * 0.13,撑满画面 50-60%
   - 10-15 字:字号 = canvas_height * 0.09,撑满画面 40-50%
   - 16-30 字:字号 = canvas_height * 0.06,撑满画面 30-40%
   - 强制约束:文字块最大宽度 = canvas_width * 0.85,超出则降字号

2. 装饰位置算法
   - drawHandDrawnCircle:圈住第 1 个或最后 1 个关键词(随机)
   - drawHighlighter:横跨第 2 行文字
   - drawStamp:右下角或左上角(随机,旋转 -10° 到 -25°)
   - drawEmojiSticker:对角位置(与 drawStamp 不在同一侧)
   - drawComicBurst:画面中心或主角字背后
   - 同一画面装饰元素数量严格遵守 STYLE_GUIDE_v3.0 §4

3. 换一换算法
   - 单卡换一换:仅重渲染当前卡片(随机换配色 + 装饰位置)
   - 全部换一换:重渲染所有卡片(每个风格族重新随机)
   - 切换时有 0.3s 的淡入淡出过渡(opacity 0 → 1)
   - 按钮 spin 动画:hover 时旋转 180°

4. 字体切换
   - 切换全局字体 tab 后,所有已渲染卡片重渲染
   - 用 canvas measureText 重新计算字号(不同字体宽度差异大)
   - 字体加载失败时 console.warn 并降级

5. 键盘可达性
   - Tab 顺序: textarea → 生成按钮 → 全部换一换 → 字体 tabs → 风格族 tabs → 卡片 actions
   - Enter 在 textarea 中换行,Ctrl+Enter 触发生成
   - 所有按钮可 Space/Enter 触发

6. 错误处理
   - 字体加载超时(10s):自动降级到 PingFang SC
   - Canvas 渲染异常:卡片显示错误占位 + 控制台错误
   - 下载失败:提示用户右键另存为

7. 性能
   - 20 张卡片并发渲染(用 Promise.all + requestAnimationFrame 分批)
   - 每张渲染耗时控制在 50ms 以内
   - 不阻塞主线程

8. 移动端优化
   - 长按卡片 0.5s 触发下载(替代 hover)
   - 单列/双列切换:>480px 双列,≤480px 单列
   - 触摸目标 ≥ 44×44px

【验证步骤(AI 必须自测)】
1. 用 Read 自检 index.html 至少 2 次确认所有修改到位
2. 用 grep 验证关键算法:
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker
   grep -c "字号自适应\|fontSize.*canvas_height" index.html  # 应 ≥ 1
   grep -c "Ctrl+Enter\|ctrlKey" index.html  # 应 ≥ 1
   grep -c "Promise.all" index.html  # 应 ≥ 1
   ```
3. 行数检查:应在 1700-2800 行之间
4. 用 node --check 任何新增的独立 JS(若内嵌在 HTML 中则跳过)

【最终交付检查清单】
- [ ] 字号自适应 4 档全部实现
- [ ] 装饰位置算法不冲突
- [ ] 换一换有动效
- [ ] 字体切换重渲染所有卡片
- [ ] 键盘 Tab 顺序正确
- [ ] 错误处理覆盖字体/渲染/下载三种失败场景
- [ ] 20 卡并发渲染 < 1s
- [ ] 移动端长按下载 + 双列布局
- [ ] 行数 1700-2800

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 5 验收
- 9 项检查清单全部勾选
- 行数在 1700-2800 之间
- 3 个 grep 命令全部命中
- 无 JavaScript 语法错误

---

## 批次 6 · 自检、测试、bug 修复

> **目标**: 通过静态分析 + 浏览器自动化测试,发现并修复所有 bug
> **前置产物**: 完整 v3.0 index.html + lib/
> **测试方法**: 用 Playwright 或 Chromium headless 截图验证

### 提示词 6.1 · 全量自检与修复

```
你是一名资深 QA 工程师 + 全栈开发者。对 v3.0 系统做完整自检,发现 bug 立即修复。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【自检流程】

第 1 步:静态检查
执行以下 Bash 命令,把输出贴出来:

cd /Users/andy/Documents/Andy AI/cover-maker

# 1. 语法检查
echo "=== JS Syntax Check ==="
node --check lib/features.js
node --check lib/colors.js

# 2. HTML 完整性
echo "=== HTML Structure ==="
grep -c "</html>" index.html  # 应 = 1
grep -c "<script" index.html   # 应 ≥ 1
grep -c "import.*lib/" index.html  # 应 ≥ 2

# 3. 关键功能点存在性
echo "=== Feature Coverage ==="
grep -c "styleA_handDrawn\|styleB_collage\|styleC_comicPop\|styleD_newspaper\|styleE_minimal" index.html  # 应 ≥ 5
grep -c "drawHandDrawnCircle\|drawCloudHighlight\|drawNotebookPaper\|drawHalftone\|drawSpeechBubble\|drawHighlighter\|drawTornNote\|drawStamp\|drawEmojiSticker\|drawComicBurst\|drawMarkerText\|drawStickerCharacter" index.html  # 应 ≥ 8

# 4. 文件大小
echo "=== File Sizes ==="
wc -l index.html lib/*.js

第 2 步:浏览器自动化测试(若已安装 playwright)
若未安装,用 Bash 执行:
npx --yes playwright@latest install chromium

然后创建 /tmp/test_cover.js:
```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text());
  });
  await page.goto('file:///Users/andy/Documents/Andy AI/cover-maker/index.html');
  await page.waitForTimeout(2000);
  // 输入文字
  await page.fill('textarea', '财务人必看的5个AI工具');
  await page.click('button:has-text("生成")');
  await page.waitForTimeout(3000);
  // 截图
  await page.screenshot({ path: '/tmp/cover_test.png', fullPage: true });
  // 检查卡片数量
  const cardCount = await page.locator('.card').count();
  console.log('CARD_COUNT:', cardCount);
  console.log('ERRORS:', errors);
  await browser.close();
})();
```

执行: node /tmp/test_cover.js

第 3 步:bug 修复
根据第 2 步输出修复任何以下问题:
- page error 报错 → 修复对应 JS
- console error → 修复或加 try-catch
- cardCount < 20 → 检查生成逻辑
- 截图视觉异常(空白/错位/中文乱码) → 修复对应渲染函数

第 4 步:响应式测试
```js
// 测试不同视口
const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' }
];
for (const vp of viewports) {
  await page.setViewportSize(vp);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `/tmp/cover_${vp.name}.png`, fullPage: true });
}
```

第 5 步:输出最终自检报告
格式:
```
=== 自检报告 ===
静态检查: PASS / FAIL (详细)
浏览器测试: PASS / FAIL (详细)
响应式测试: PASS / FAIL (详细)
修复的 bug 列表:
  1. [bug 描述] → [修复方案]
  2. ...
最终状态: 系统可运行 / 仍有 bug
```

【关键修复模式】
- 中文乱码:通常是 Canvas font 属性问题,需等字体加载完成再渲染
- 卡片空白:通常是 Canvas 渲染时机问题,加 await nextTick 或 requestAnimationFrame
- 装饰错位:通常是坐标系问题,所有坐标基于 canvas 宽高百分比而非绝对像素
- 字体未生效:确保 CSS @import 在 <head>,且 Canvas font 属性使用已加载的 fontFamily

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 6 验收
- 静态检查全部 PASS
- 浏览器测试 cardCount = 20
- 无 page error 或 console error
- 3 个视口截图都正常(非空白)
- 自检报告完整输出
- 所有发现的 bug 都被修复

---

## 批次 7 · 文档、部署、交付

> **目标**: 完善 README,提供部署指引,生成最终交付包
> **前置产物**: 通过批次 6 验收的完整 v3.0 系统

### 提示词 7.1 · 更新 README 和最终交付

```
你是一名资深技术文档工程师。基于完整 v3.0 系统,完善 README 和部署文档。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
- 当前 index.html(批次 4-6 已最终化)
- 当前 STYLE_GUIDE_v3.0.md(批次 2 已生成)
- 当前 README.md(旧版 14 行,需重写)
- 当前 lib/features.js、lib/colors.js

【输出文件 1:更新 README.md】

完整重写 README.md,包含以下章节:

# 小红书大字封面生成器 v3.0

[一段简介,3-5 句话]

## ✨ v3.0 核心升级
(对比 v2.0 的 5 大变化,每个 1 句话)

## 🎨 5 大风格族
(表格列出 5 个风格族 + 典型视觉元素 + 适用话题)

## 🚀 快速开始
### 本地运行
### 部署到 Vercel / Netlify / GitHub Pages
### 嵌入到现有网站

## 📂 项目结构
```
cover-maker/
├── index.html              # 主应用(单文件,纯静态)
├── STYLE_GUIDE.md         # v2.0(归档)
├── STYLE_GUIDE_v3.0.md    # v3.0(当前)
├── lib/
│   ├── features.js        # 12 项视觉特征
│   └── colors.js          # 配色 token
├── index_v2_backup.html   # v2.0 备份
├── AI_PROMPTS_v1.0.md     # 构建提示词归档
└── README.md
```

## 🛠 技术栈
- 纯 HTML + CSS + JavaScript(ES Module)
- Canvas 2D API
- Google Fonts(fonts.font.im 镜像)
- 零构建步骤,零 npm 依赖

## 📖 使用指南
### 输入规范
### 字体切换
### 风格族切换
### 单卡换一换 / 全部换一换
### 下载 PNG / 复制到剪贴板

## 🐛 已知问题 & Roadmap
- 当前不支持自定义装饰位置
- Roadmap:v3.1 增加自定义上传图片作为装饰

## 📜 版本历史
| 版本 | 日期 | 变更 |
|------|------|------|
| v3.0 | 2026-06-30 | 5 大风格族重构 + 12 项视觉特征 |
| v2.0 | 2026-06-25 | 初版,5 种风格 |
| v1.0 | (规划) | ... |

## 📄 License
MIT

## 🙏 致谢
基于稿定设计 192 张真实模板蒸馏

【输出文件 2:部署清单 DEPLOY.md】

新建 /Users/andy/Documents/Andy AI/cover-maker/DEPLOY.md,包含:

# 部署指南

## 选项 A:GitHub Pages
1. push 到 gh-pages 分支
2. 启用 Pages
3. 访问 https://用户名.github.io/cover-maker/

## 选项 B:Vercel
1. vercel --prod
2. 自动部署

## 选项 C:本地静态服务器
1. python3 -m http.server 8000
2. 访问 http://localhost:8000

## 选项 D:嵌入到现有网站
```html
<iframe src="path/to/cover-maker/index.html" width="100%" height="800"></iframe>
```

## CDN 注意事项
fonts.font.im 在国内可用,海外建议切换到 fonts.googleapis.com

【输出文件 3:CHANGELOG.md】

新建 /Users/andy/Documents/Andy AI/cover-maker/CHANGELOG.md:

# Changelog

## v3.0 (2026-06-30)
### Added
- 5 大真实风格族(手绘便签 / 拼贴 / 漫画 / 报纸 / 极简)
- 12 项视觉特征(手绘圈、云朵高光、半色调等)
- 6 类字体切换(增加卡通描边、马克笔体)
- ES Module 架构(lib/ 目录)
- 响应式三档断点
- 键盘可达性
- 移动端长按下载

### Changed
- 装饰元素上限从 ≤2 放宽到 4-6(分区清晰)
- 配色规则放宽到 4-6 色(主色 + 1-2 强调)
- AI Prompt 方向从"editorial"改为"Chinese KOL sticker"

### Deprecated
- 旧的 5 种风格(Notebook/iOS Notes/Halo/Quotes/Torn Paper)
  现已整合到 5 大风格族中

### Fixed
- (从批次 6 修复的 bug 列表复制)

【验证步骤】
1. 用 Read 检查 README.md / DEPLOY.md / CHANGELOG.md 三文件存在且内容完整
2. 用 Bash 列出最终项目结构:
   ```bash
   ls -la /Users/andy/Documents/Andy AI/cover-maker/
   ls -la /Users/andy/Documents/Andy AI/cover-maker/lib/
   ```
3. 用 Bash 计算总代码量:
   ```bash
   wc -l /Users/andy/Documents/Andy AI/cover-maker/*.md /Users/andy/Documents/Andy AI/cover-maker/*.html /Users/andy/Documents/Andy AI/cover-maker/lib/*.js
   ```
4. 输出最终交付清单:
   ```
   === v3.0 最终交付 ===
   ✅ index.html(行数)
   ✅ STYLE_GUIDE_v3.0.md(行数)
   ✅ lib/features.js(行数,12 个函数)
   ✅ lib/colors.js(行数,5 风格族配色)
   ✅ README.md(行数)
   ✅ DEPLOY.md(行数)
   ✅ CHANGELOG.md(行数)
   ✅ index_v2_backup.html(行数,归档)
   ✅ AI_PROMPTS_v1.0.md(行数,构建归档)
   总代码量:XXX 行
   ```

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 7 验收
- README.md 重写,≥ 80 行
- DEPLOY.md 存在,≥ 30 行
- CHANGELOG.md 存在,≥ 30 行
- 最终交付清单 9 项全部 ✅
- 项目结构与文件路径一致

---

## 🎯 总体验收(所有批次完成后)

执行批次 1-7 后,系统必须满足:

```
✅ 完整性:
- 9 个文件全部存在:index.html / STYLE_GUIDE_v3.0.md / lib/features.js / lib/colors.js / README.md / DEPLOY.md / CHANGELOG.md / index_v2_backup.html / AI_PROMPTS_v1.0.md

✅ 可运行性:
- 直接双击 index.html 在浏览器打开即可使用
- 或 python3 -m http.server 8000 后访问 localhost:8000
- 无任何 console error 或 page error

✅ 功能完整性:
- 5 大风格族全部可渲染
- 12 项视觉特征全部实现
- 输入 1-30 字均可正常生成
- 下载 PNG / 复制到剪贴板 / 换一换 全部可用
- 6 类字体可切换
- 响应式三档断点正常

✅ 文档完整性:
- README 介绍 v3.0 升级
- DEPLOY 提供 4 种部署方案
- CHANGELOG 记录变更

✅ 无 bug:
- 浏览器自动化测试通过
- 3 个视口截图正常
- 中文不乱码
- 装饰不重叠
- 下载文件可正常打开
```

**任何一条不满足 → 回到对应批次修复 → 重新验收**

---

## 📌 版本说明

| 文件 | 版本 | 关系 |
|------|------|------|
| STYLE_GUIDE.md | v2.0 | 保留归档,不再更新 |
| STYLE_GUIDE_v3.0.md | v3.0 | 当前权威版本 |
| index.html | v3.0 | v2.0 已备份为 index_v2_backup.html |
| AI_PROMPTS.md | v1.0 | 本文件,构建提示词归档 |
| README.md | v3.0 | 跟随应用版本 |
| DEPLOY.md | v1.0 | 部署指南 |
| CHANGELOG.md | v3.0 | 版本变更记录 |

> **本文档约定**: 后续如需再升级(如 v3.1),新增 `AI_PROMPTS_v2.0.md`,不覆盖本文件