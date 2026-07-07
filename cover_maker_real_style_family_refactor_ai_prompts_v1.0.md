# 小红书封面生成器 - 真实风格族重构 AI 提示词（v1.0）

> **使用方式**：按批次顺序，逐条复制提示词给 AI 执行。每批次执行完毕后，系统必须完整可运行、无 bug，再进行下一批次。
>
> **总批次**：10 批
>
> **适用项目**：`/Users/andy/Documents/Andy AI/cover-maker/`
>
> **当前架构**：单文件 `index.html`（~6930行）+ `lib/` 目录下模块化文件（features.js, colors.js, stickers.js, stickers-canvas.js, textures.js, shadows.js, gradients.js, color-ai.js）

---

## 🔑 关键架构速查（给 AI 的上下文）

```
现有渲染管线：
  family A-T → LOCKED_TEMPLATE_STYLES[family] → TEMPLATE_VARIANTS[vi] → drawLockedTemplateCover()

现有5个变体模板：burst / card / bubble / paper / frame
现有20个风格入口：A-T，定义在 FAMILY_LABELS、LOCKED_TEMPLATE_STYLES 中
现有STATE对象：{ text, font, families: Set, seed, activeCount, textAnalysis }
现有BATCH_STATE：{ items: [], generated: false }
现有渲染入口：drawTemplateEnhancedCover() → drawLockedTemplateCover()
现有版本开关：?v=4 回退旧版，USE_V5 标志控制
输出尺寸：1242×1656px
现有批量分隔符：888
```

---

## 📦 批次一：基础骨架 — Real Style Map 与配置系统

> **目标**：创建核心数据层，不改渲染逻辑。系统运行不受影响。

---

### AI 提示词（批次一）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

当前项目是一个小红书封面生成器，所有逻辑在 index.html（~6930行）中，lib/ 下有模块化文件。
现在要进行"真实风格族重构"，第一批次只做数据层，不修改任何渲染逻辑。

请你严格按照以下步骤执行：

## 步骤1：创建 lib/real-style-map.js

新建文件 lib/real-style-map.js，内容包含：

1. REAL_STYLE_MAP 对象 —— 将 A-T 20个风格映射到5个真实风格族：
   - handnote（手绘便签风）：A, J, L
   - collage（拼贴collage风）：F, I, M, T
   - comic（漫画pop风）：B, C, G, H, N, P
   - newspaper（报纸大字风）：D, K, O, R
   - minimal（极简大字风）：E, Q, S

   每个映射包含 realFamily 和 subStyle 字段。subStyle 命名如下：
   A→creamNotebook, B→yellowWarning, C→redEvent, D→blueGreenInfo, E→cleanQuote,
   F→retroFilm, G→dopaminePop, H→acidPop, I→memphisCollage, J→chinesePaper,
   K→cyberEditorial, L→japaneseSoft, M→threeDSticker, N→vaporwavePop, O→darkEditorial,
   P→pixelPop, Q→auroraMinimal, R→vintagePoster, S→glassMinimal, T→cartoonCollage

2. REAL_STYLE_CONFIGS 对象 —— 5个真实风格族的配置，每个包含：
   - name: 中文名称
   - titleAreaRatio: [最小值, 最大值]（主标题占画面面积比例）
   - decorationCount: [最小值, 最大值]（装饰数量范围）
   - layouts: 5个layout名称数组
   - typography: { mainRatio:1, subRatio, keywordRatio, align数组, letterSpacing, stroke(仅collage/comic), serifAllowed(仅newspaper), allowBleed(仅minimal) }

   参数严格使用开发文档第6.1节的值。

3. REAL_SUBSTYLE_CONFIGS 对象 —— 至少完成所有20个子风格的配置，每个包含：
   - palette: { bg数组(5个背景色), text, accent, second }
   - texture: 纹理名称字符串
   - decorationBias: 装饰倾向数组

   颜色值沿用 LOCKED_TEMPLATE_STYLES 中已有的颜色（在 index.html 的 LOCKED_TEMPLATE_STYLES 对象中定义）。
   对于没有对应现有颜色的子风格，从同真实风格族的其他子风格中变化得出。

4. 将三个对象 export 到 window：
   window.REAL_STYLE_MAP = REAL_STYLE_MAP;
   window.REAL_STYLE_CONFIGS = REAL_STYLE_CONFIGS;
   window.REAL_SUBSTYLE_CONFIGS = REAL_SUBSTYLE_CONFIGS;

5. 工具函数：
   - resolveRealStyle(family): 输入 A-T 字母，返回 { realFamily, subStyle, subStyleConfig, familyConfig }
   - getRealFamilies(): 返回5个真实风格族名称数组

## 步骤2：在 index.html 中引入新文件

在 index.html 的 <script type="module"> 区域（大约第745行附近，其他 lib 文件的 import 之后），添加：
  import './lib/real-style-map.js';

确保新文件在现有所有 lib 文件之后加载。

## 步骤3：添加 STATE 扩展

在 index.html 的 STATE 对象定义处（约第912行），添加：
  realStyleMode: true,  // 真实风格模式开关

## 步骤4：验证

在浏览器控制台中执行以下验证（请你把验证命令以注释形式写在文件末尾）：
  console.log('REAL_STYLE_MAP:', window.REAL_STYLE_MAP);
  console.log('REAL_STYLE_CONFIGS keys:', Object.keys(window.REAL_STYLE_CONFIGS));
  console.log('REAL_SUBSTYLE_CONFIGS keys:', Object.keys(window.REAL_SUBSTYLE_CONFIGS));
  console.log('resolveRealStyle("A"):', resolveRealStyle('A'));
  console.log('resolveRealStyle("K"):', resolveRealStyle('K'));

预期输出：
- REAL_STYLE_MAP 有20个键 A-T
- REAL_STYLE_CONFIGS 有5个键 handnote/collage/comic/newspaper/minimal
- REAL_SUBSTYLE_CONFIGS 有20个键
- resolveRealStyle('A') 返回 { realFamily: 'handnote', subStyle: 'creamNotebook', ... }
- resolveRealStyle('K') 返回 { realFamily: 'newspaper', subStyle: 'cyberEditorial', ... }

## 重要约束
- 不修改 index.html 中任何现有渲染逻辑（drawLockedTemplateCover、drawTemplateEnhancedCover 等）
- 不修改 LOCKED_TEMPLATE_STYLES、TEMPLATE_VARIANTS、FAMILY_LABELS 等现有数据结构
- 不修改任何 lib/ 下已有文件
- 新文件只导出数据，不执行任何 DOM 操作或 Canvas 操作
- 确保 index.html 加载后，20个风格入口的封面生成功能完全不受影响

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📦 批次二：文案结构化解析 + 排版计算

> **前置**：批次一完成，lib/real-style-map.js 已创建并引入
> **目标**：实现文案自动拆分和排版参数计算

---

### AI 提示词（批次二）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

批次一已完成，lib/real-style-map.js 存在且已引入 index.html。
本批次创建文案解析和排版计算模块。

请你严格按照以下步骤执行：

## 步骤1：创建 lib/real-style-typography.js

新建文件 lib/real-style-typography.js，实现以下内容：

### 1.1 parseCoverContent(rawText) 函数

输入：用户原始文本字符串
输出：{ mainTitle, subTitle, keyword, badgeText, footerText, rawText }

解析规则（按优先级）：

规则1 - 显式换行：
  如果 rawText 包含换行符 \n：
    第1行 → mainTitle
    第2行 → subTitle
    第3行 → footerText（如果存在）

规则2 - 分隔符：
  如果包含 ｜ 或 | 或 - 或 ： 或 : 或 ——：
    分隔符前 → mainTitle
    分隔符后第一个片段 → subTitle
    剩余 → footerText

规则3 - 自动拆分（按字数）：
  3-8字：全部 → mainTitle
  9-14字：前3-6字 → mainTitle，剩余 → subTitle，取最后2-4字 → keyword
  15-24字：前4-8字 → mainTitle，中间 → subTitle，最后2-4字 → keyword
  24字以上：前5-10字 → mainTitle，中间 → subTitle，最后部分 → footerText

keyword 的智能提取：
  - 如果 subTitle 非空，取 subTitle 中最后2-4个有意义的字符
  - 避免取"的""了""吗""呢"等虚词作为 keyword 结尾
  - 如果 mainTitle 本身≤4字，keyword 可以和 mainTitle 重复

badgeText 的生成（可选，返回空字符串也可以）：
  - 检测文本中是否包含学术/论文关键词（论文/SCI/审稿/返修/投稿/期刊），若是则生成英文badge如"SCI GUIDE""REVISION""PAPER"
  - 检测是否包含职场关键词（面试/简历/升职/跳槽），若是则生成如"CAREER""JOB TIPS"
  - 其他情况返回空字符串 ''

### 1.2 computeTypographyPlan(ctx, content, familyConfig, layoutId, centerShape, subStyle) 函数

输入：
  - ctx: Canvas 2D 上下文（用于 measureText）
  - content: parseCoverContent 的输出
  - familyConfig: REAL_STYLE_CONFIGS[realFamily]
  - layoutId: 布局ID字符串
  - centerShape: 中央承载图形对象（当前可为 null，预留）
  - subStyle: REAL_SUBSTYLE_CONFIGS[subStyle]

输出：
  {
    mainFontSize: number,      // 主标题像素字号
    subFontSize: number,       // 副标题像素字号
    keywordFontSize: number,   // 关键词像素字号
    badgeFontSize: number,     // badge像素字号
    footerFontSize: number,    // 底部文字像素字号
    mainLineHeight: number,    // 主标题行高（比例）
    subLineHeight: number,     // 副标题行高
    letterSpacing: number,     // 字间距（em）
    alignment: string,         // 'center' | 'left'
    mainTextBox: { x, y, w, h },      // 主标题在画布上的区域（像素）
    subTextBox: { x, y, w, h },       // 副标题区域
    keywordBox: { x, y, w, h },       // 关键词区域
    badgeBox: { x, y, w, h },         // badge区域
    footerBox: { x, y, w, h },        // footer区域
    titleAreaRatio: number,           // 实际主标题面积占比
    allowBleed: boolean,
  }

计算规则：

主标题字号选择：
  - 先测量在给定字体下，文本所需的宽度
  - 画布宽度 1242px，左右留白合计约 8%-16%（即可用宽度约 1043-1143px）
  - 短标题（≤4字）：目标字号 240-320px，保证单行能放下
  - 中标题（5-8字）：目标字号 190-260px
  - 长标题（9字以上）：目标字号 130-190px，可能需要多行
  - 最终字号要保证文本不超出可用宽度，且主标题面积占比在 familyConfig.titleAreaRatio 范围内

副标题字号 = 主标题字号 × familyConfig.typography.subRatio
关键词字号 = 主标题字号 × familyConfig.typography.keywordRatio
badge字号 = 主标题字号 × 0.18（约）
footer字号 = 主标题字号 × 0.16（约）

行高：
  - 主标题1行：1.05，2行：1.2，3行：1.3
  - 副标题：1.2-1.4
  - 其他：1.3

字间距：
  - 使用 familyConfig.typography.letterSpacing（如 -0.035）
  - 如果没有定义，大标题默认 -0.03，小标签默认 +0.05

对齐：
  - 从 familyConfig.typography.align 数组中随机选取
  - minimal 风格偏左概率更高
  - newspaper 风格偏左概率更高

位置计算：
  - 以画布 1242×1656 为参考
  - 主标题垂直居中偏上（y 约在 0.28-0.45 范围）
  - 副标题紧接主标题下方（gap 约 20-40px）
  - keyword 可放在主标题上方小标签、或副标题旁边
  - badge 放在左上角或右上角
  - footer 放在底部

### 1.3 辅助函数

getTextSeed(text, textIndex, globalSeed):
  简单的字符串哈希函数，返回整数
  function getTextSeed(text, textIndex, globalSeed) {
    let hash = globalSeed || 0;
    const str = text + ':' + textIndex;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

seededRandom(seed):
  返回一个基于 seed 的伪随机数生成器函数
  function seededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) | 0;
      return (s >>> 0) / 4294967296;
    };
  }

### 1.4 导出

将以上所有函数挂到 window：
  window.parseCoverContent = parseCoverContent;
  window.computeTypographyPlan = computeTypographyPlan;
  window.getTextSeed = getTextSeed;
  window.seededRandom = seededRandom;

## 步骤2：在 index.html 中引入

在 index.html 的 <script type="module"> 中，lib/real-style-map.js 的 import 之后，添加：
  import './lib/real-style-typography.js';

## 步骤3：验证

在文件末尾添加验证注释，开发者可在控制台执行：

  // 测试 parseCoverContent
  const r1 = parseCoverContent('审稿人说创新性不足到底怎么改');
  console.log('测试1:', r1);
  // 预期 mainTitle 非空，subTitle 非空

  const r2 = parseCoverContent('论文返修不要急着先改语言');
  console.log('测试2:', r2);

  const r3 = parseCoverContent('三天搞定｜SCI论文讨论部分写作模板');
  console.log('测试3:', r3);
  // 预期 mainTitle='三天搞定', subTitle='SCI论文讨论部分写作模板'

  const r4 = parseCoverContent('短标题');
  console.log('测试4:', r4);
  // 预期 mainTitle='短标题'，subTitle=''

  // 测试 computeTypographyPlan
  const testCtx = document.createElement('canvas').getContext('2d');
  testCtx.font = 'bold 100px "Noto Sans SC"';
  const plan = computeTypographyPlan(testCtx, r1, window.REAL_STYLE_CONFIGS.handnote, 'handnoteTape', null, window.REAL_SUBSTYLE_CONFIGS.creamNotebook);
  console.log('排版计划:', plan);

## 重要约束
- 不修改 index.html 渲染逻辑
- 不修改任何 lib/ 下已有文件
- parseCoverContent 必须对所有中文输入都能给出合理结果
- computeTypographyPlan 的字号计算必须在 Canvas 可用宽度内
- 即使 centerShape 为 null，computeTypographyPlan 也能正常工作（使用默认画布区域）

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📦 批次三：中央承载图形库（40种）

> **前置**：批次一、二完成
> **目标**：创建不少于40种中央承载图形

---

### AI 提示词（批次三）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

批次一、二已完成，real-style-map.js 和 real-style-typography.js 存在且已引入。
本批次创建中央承载图形库，不少于40种图形。

请你严格按照以下步骤执行：

## 步骤1：创建 lib/real-style-center-shapes.js

新建文件，实现 CENTER_SHAPE_LIBRARY 和选择逻辑。

### 1.1 图形库结构

const CENTER_SHAPE_LIBRARY = {
  handnote: [],    // 至少8种
  collage: [],     // 至少8种
  comic: [],       // 至少8种
  newspaper: [],   // 至少8种
  minimal: []      // 至少8种
};

每个 shape 对象结构：
{
  id: string,              // 唯一标识，如 'lined-note'
  name: string,            // 中文名称，如 '横线便签纸'
  realFamily: string,      // 所属真实风格族
  textSafeArea: {          // 文字安全区（归一化 0-1，相对于1242×1656画布）
    x: number,  // 0.08-0.20
    y: number,  // 0.25-0.45
    w: number,  // 0.60-0.84
    h: number   // 0.40-0.55
  },
  allowRotation: boolean,  // 是否允许文字微旋转（±3度）
  allowBleed: boolean,     // 是否允许文字出血
  decorationSlots: string[], // 可用装饰槽位，如 ['topRight', 'bottomLeft', 'aboveTitle']
  draw(ctx, box, palette, seed) {} // 绘制函数
}

注：box 参数为 { x, y, w, h } 像素坐标，由 textSafeArea * 画布尺寸计算得出。
    palette 来自子风格配置 { bg, text, accent, second }。
    seed 用于随机但稳定的绘制变化。

### 1.2 handnote 的8种图形（必须全部实现 draw 方法）

每种图形 draw 方法使用 Canvas 2D API 绘制，在 box 区域内外绘制对应形状。

1. lined-note（横线便签纸）：米白底色圆角矩形 + 浅灰横线（每隔约30px一条）+ 轻微阴影
2. grid-note（方格便签纸）：浅底色圆角矩形 + 浅灰方格网（约25px间距）+ 轻微阴影
3. tape-paper（胶带固定纸片）：白色矩形纸片 + 顶部半透明胶带（米黄半透明矩形，略微超出纸片宽度）+ 轻微旋转感
4. torn-paper（撕边纸片）：用贝塞尔曲线绘制不规则上边缘 + 底部直线 + 轻微阴影
5. curled-corner（卷角纸片）：矩形 + 右下角三角形折角（用不同深浅色表现卷起效果）
6. diary-label（手账标签页）：圆角矩形 + 左侧或上方小圆孔（黑色实心圆）+ 标签绳子
7. round-note（圆角便签）：大圆角矩形（borderRadius约30-40px）+ 柔和阴影
8. cloud-frame（手绘云朵框）：用多个圆弧拼接成云朵形状的封闭路径 + 浅色填充 + 虚线描边

### 1.3 collage 的8种图形

9. tilted-note（单张斜放便签）：旋转-3°到-8°的矩形 + 阴影偏移
10. triple-stack（三层纸片堆叠）：三个矩形，依次偏移(8,8)px，颜色逐层变浅
11. torn-collage（撕边拼贴纸）：不规则四边形 + 撕边效果 + 阴影
12. polaroid（拍立得相框）：白色大矩形 + 内部稍小的浅灰矩形（照片区）+ 下方较宽的白色边框
13. ticket（票根ticket）：矩形 + 左右两侧半圆形切口（用 globalCompositeOperation 或路径裁剪）
14. magazine-cut（杂志剪纸块）：不规则多边形（5-7个顶点，轻微随机偏移）+ 轻微旋转
15. color-blocks（不规则色块拼接）：2-3个不同颜色的矩形/三角形拼接在一起
16. tape-sticker（透明胶带贴纸片）：矩形纸片 + 上方半透明胶带条

### 1.4 comic 的8种图形

17. burst-star（爆炸星形框）：用多边形绘制星爆形状（12-16个锯齿顶点）+ 描边/填充
18. speech-bubble（对话气泡）：椭圆主体 + 下方小三角指向 + 粗描边
19. cloud-bubble（云朵气泡）：多个圆弧拼接的云朵形状 + 粗描边
20. jagged-burst（锯齿爆炸框）：不规则锯齿多边形 + 粗描边
21. circle-comic（圆形漫画框）：正圆形 + 粗描边（5-8px）+ 半色调网点填充
22. skewed-action（斜切动感框）：矩形 + 水平倾斜变换（ctx.transform）+ 粗描边
23. halftone-circle（半色调圆形底）：圆形 + 内部半色调点阵填充（用小圆点排列）
24. speedline-box（速度线标题框）：矩形 + 左右两侧速度线（水平放射线）

### 1.5 newspaper 的8种图形

25. headline-block（报纸头版块）：大矩形 + 顶部细线 + 底部双细线
26. multi-column（多栏文字块）：矩形被2-3条竖线分割成栏目
27. banner-strip（横幅标题条）：横跨画布的矩形条 + 上下粗边框
28. split-blocks（上下分割色块）：上下两个不同颜色的矩形区域
29. poster-frame（海报边框框）：多层嵌套矩形边框（3层，逐层缩小）
30. print-label（印刷标签框）：圆角矩形 + 虚线边框 + 角落小圆点
31. vertical-column（竖向栏目框）：窄高的竖矩形 + 细边框
32. skewed-block（斜切报纸块）：轻微旋转的矩形（rotate ±2°）

### 1.6 minimal 的8种图形

33. no-frame（无框纯大字）：透明/无绘制，文字安全区覆盖大部分画布
34. huge-circle（超大圆形底）：大圆形（直径为画布宽度的50-65%）+ 纯色/半透明填充
35. oval-base（椭圆形底）：椭圆（rx=画布宽35%, ry=画布高25%）+ 纯色填充
36. pill-shape（胶囊形底）：圆角极大的矩形（borderRadius=高度的一半）+ 纯色填充
37. arch-base（半圆拱形底）：上半圆拱形 + 纯色填充
38. thin-frame（极细线框）：1-2px 细线矩形边框
39. left-block（左侧色块）：画布左侧竖条色块（宽度约8-12%画布宽）
40. bottom-line（底部短横线托底）：标题下方一条短粗横线（宽度约30-50%标题宽，居中）

### 1.7 选择函数

selectCenterShape(realFamily, family, variantIndex, seed):
  1. 从 CENTER_SHAPE_LIBRARY[realFamily] 获取候选图形列表
  2. 使用 seededRandom(seed) 生成随机索引
  3. 同一文案的不同 variantIndex 应尽量选不同 shape
  4. 返回选中的 shape 对象（深拷贝，避免引用共享）
  5. 如果 realFamily 不存在，兜底返回 handnote 的第一个 shape

### 1.8 导出

window.CENTER_SHAPE_LIBRARY = CENTER_SHAPE_LIBRARY;
window.selectCenterShape = selectCenterShape;

## 步骤2：在 index.html 中引入

在 index.html 的 <script type="module"> 中，real-style-typography.js 的 import 之后，添加：
  import './lib/real-style-center-shapes.js';

## 步骤3：验证

// 验证图形数量
const families = ['handnote', 'collage', 'comic', 'newspaper', 'minimal'];
families.forEach(f => {
  console.log(f + ' 图形数量:', CENTER_SHAPE_LIBRARY[f].length);
});
// 预期每个 >= 8

// 验证绘制（在临时canvas上测试）
const testCanvas = document.createElement('canvas');
testCanvas.width = 1242;
testCanvas.height = 1656;
const testCtx = testCanvas.getContext('2d');
const shape = CENTER_SHAPE_LIBRARY.handnote[0];
const box = { x: 100, y: 400, w: 1042, h: 700 };
shape.draw(testCtx, box, { bg: '#F5EFD8', text: '#2D2A26', accent: '#5D4E37', second: '#FFEC47' }, 42);
console.log('绘制完成，检查 testCanvas.toDataURL() 是否有内容');
// 预期 testCanvas 上有可见图形

## 重要约束
- 所有 draw 方法必须使用纯 Canvas 2D API，不依赖任何图片资源
- draw 方法内部不应抛出异常，异常应被 try-catch 捕获并降级为简单矩形
- 图形绘制在 box 区域内或略微超出（不超过 box 边界的 10%）
- 文字安全区 textSafeArea 必须在 draw 方法绘制的形状内部
- 确保每种图形之间有明显的视觉差异

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📦 批次四：Layout 系统（5×5 = 25个Layout）

> **前置**：批次一、二、三完成
> **目标**：实现每个真实风格族5个layout，共25个

---

### AI 提示词（批次四）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

批次一至三已完成。本批次创建 layout 系统，每个真实风格族5个layout，共计25个。

请你严格按照以下步骤执行：

## 步骤1：创建 lib/real-style-layouts.js

新建文件。每个 layout 是一个对象，定义该 layout 下的几何参数和排版倾向。

### 1.1 Layout 对象结构

{
  id: string,              // 如 'handnoteTape'
  name: string,            // 中文名称，如 '顶部胶带+横线纸'
  realFamily: string,      // 所属真实风格族
  geometry: {
    titleZone: {           // 主标题区域（归一化0-1）
      x: number, y: number, w: number, h: number
    },
    subZone: { x, y, w, h },     // 副标题区域
    keywordZone: { x, y, w, h }, // 关键词区域
  },
  decorationSlots: string[],     // 推荐装饰槽位
  preferredAlign: string,        // 推荐对齐 'center'|'left'
  allowBleed: boolean,
  preferredCenterShapeIds: string[], // 推荐搭配的中央图形ID列表
}

### 1.2 handnote 的5个 layout

1. handnoteTape（顶部胶带+横线纸+中央大字）
   - titleZone: 画布上部偏中，约占55-65%面积
   - 推荐中央图形: lined-note, round-note
   - preferredAlign: 'center'
   - decorationSlots: ['topLeft', 'bottomRight']

2. handnoteCircle（手绘圈围绕关键词+右下涂鸦）
   - titleZone: 画布中央偏上，约占50-60%
   - 推荐中央图形: cloud-frame, diary-label
   - preferredAlign: 'center'
   - decorationSlots: ['aroundKeyword', 'bottomRight']

3. handnoteMarker（荧光笔高亮+马克笔重影）
   - titleZone: 画布上半部，约占55-65%
   - 推荐中央图形: torn-paper, curled-corner
   - preferredAlign: 'left'
   - decorationSlots: ['aboveTitle', 'bottomLeft']

4. handnoteGrid（方格纸+左上编号+小贴纸）
   - titleZone: 居中，约占55-68%
   - 推荐中央图形: grid-note, tape-paper
   - preferredAlign: 'center'
   - decorationSlots: ['topLeft', 'topRight']

5. handnoteDiary（便签纸+日期标签+手绘箭头）
   - titleZone: 中央偏上，约占50-60%
   - 推荐中央图形: diary-label, curled-corner
   - preferredAlign: 'left'
   - decorationSlots: ['topRight', 'bottomLeft', 'belowTitle']

### 1.3 collage 的5个 layout

6. collageStack（3张撕边便签叠层+主标题压在上层）
   - titleZone: 居中，约占52-65%
   - 推荐中央图形: triple-stack, torn-collage
   - preferredAlign: 'center'
   - decorationSlots: ['topRight', 'bottomLeft', 'bottomRight']

7. collageStamp（便签+右上印章+色块散布）
   - titleZone: 中央偏上，约占52-65%
   - 推荐中央图形: tilted-note, torn-collage
   - preferredAlign: 'left'
   - decorationSlots: ['topRight', 'bottomLeft']

8. collageDiagonal（斜向拼贴纸片+箭头指向标题）
   - titleZone: 居中偏右，约占50-60%
   - 推荐中央图形: magazine-cut, color-blocks
   - preferredAlign: 'left'
   - decorationSlots: ['topLeft', 'belowTitle']

9. collageScrapbook（照片框/便签/胶带组合）
   - titleZone: 中央偏上，约占52-62%
   - 推荐中央图形: polaroid, tape-sticker
   - preferredAlign: 'center'
   - decorationSlots: ['topLeft', 'topRight', 'bottomRight']

10. collageMagazine（杂志拼贴+大字描边+小标签）
    - titleZone: 画布上部，约占55-68%
    - 推荐中央图形: magazine-cut, color-blocks
    - preferredAlign: 'center'
    - decorationSlots: ['topRight', 'bottomLeft', 'aboveTitle']

### 1.4 comic 的5个 layout

11. comicBurst（放射线+巨大描边标题）
    - titleZone: 画布中央偏上，约占58-72%
    - 推荐中央图形: burst-star, jagged-burst
    - preferredAlign: 'center'
    - decorationSlots: ['aboveTitle', 'belowTitle']
    - strokeWidth: 5-6px（描边宽度提示）

12. comicBubble（对话气泡+半色调网点）
    - titleZone: 居中，约占55-65%
    - 推荐中央图形: speech-bubble, cloud-bubble
    - preferredAlign: 'center'
    - decorationSlots: ['bottomLeft', 'topRight']

13. comicEmoji（大3D emoji+SFX拟声词）
    - titleZone: 画布中上部，约占58-70%
    - 推荐中央图形: circle-comic, halftone-circle
    - preferredAlign: 'center'
    - decorationSlots: ['aboveTitle', 'topRight']

14. comicHalftone（全屏半色调+倾斜标题）
    - titleZone: 居中偏右上，约占60-75%
    - 推荐中央图形: skewed-action, halftone-circle
    - preferredAlign: 'center'
    - decorationSlots: ['topLeft', 'bottomRight']

15. comicSfx（拟声词+星爆+速度线）
    - titleZone: 画布中央，约占58-72%
    - 推荐中央图形: speedline-box, burst-star
    - preferredAlign: 'center'
    - decorationSlots: ['aboveTitle', 'topLeft', 'topRight']

### 1.5 newspaper 的5个 layout

16. newspaperHero（顶部巨大主标题+中部副标题+底部编号）
    - titleZone: 画布上部，约占55-70%
    - 推荐中央图形: headline-block, banner-strip
    - preferredAlign: 'left'
    - decorationSlots: ['bottomLeft', 'topRight']

17. newspaperColumns（主标题+底部2-3栏小字）
    - titleZone: 画布中上部，约占50-62%
    - 推荐中央图形: multi-column, vertical-column
    - preferredAlign: 'left'
    - decorationSlots: ['bottomLeft', 'bottomRight']

18. newspaperStamp（大字+印章+横线分割）
    - titleZone: 居中偏上，约占55-68%
    - 推荐中央图形: print-label, poster-frame
    - preferredAlign: 'center'
    - decorationSlots: ['topRight', 'bottomRight']

19. newspaperPoster（复古海报边框+大标题）
    - titleZone: 居中，约占55-72%
    - 推荐中央图形: poster-frame, headline-block
    - preferredAlign: 'center'
    - decorationSlots: ['topLeft', 'topRight', 'bottomLeft']

20. newspaperSplit（上下色块分割+主副标题）
    - titleZone: 画布上半部，约占55-68%
    - 推荐中央图形: split-blocks, skewed-block
    - preferredAlign: 'left'
    - decorationSlots: ['bottomLeft', 'topRight']

### 1.6 minimal 的5个 layout

21. minimalCenter（中央超大字，几乎无装饰）
    - titleZone: 画布中央，约占65-78%
    - 推荐中央图形: no-frame, thin-frame
    - preferredAlign: 'center'
    - decorationSlots: []
    - allowBleed: true

22. minimalBleed（文字允许5%溢出画布）
    - titleZone: 画布中央偏上，约占68-80%
    - 推荐中央图形: no-frame, bottom-line
    - preferredAlign: 'center'
    - decorationSlots: []
    - allowBleed: true

23. minimalLeft（偏左大字+小横线）
    - titleZone: 画布左侧，约占60-72%
    - 推荐中央图形: left-block, bottom-line
    - preferredAlign: 'left'
    - decorationSlots: ['bottomLeft']

24. minimalHuge（单词/短句撑满75-80%画面）
    - titleZone: 画布中央，约占70-80%
    - 推荐中央图形: huge-circle, oval-base
    - preferredAlign: 'center'
    - decorationSlots: []
    - allowBleed: true

25. minimalStripe（纯色背景+1个短横线/小圆点）
    - titleZone: 画布中央偏上，约占65-75%
    - 推荐中央图形: pill-shape, arch-base
    - preferredAlign: 'center'
    - decorationSlots: ['belowTitle']

### 1.7 导出数据结构

const REAL_STYLE_LAYOUTS = {
  handnote: [handnoteTape, handnoteCircle, handnoteMarker, handnoteGrid, handnoteDiary],
  collage: [collageStack, collageStamp, collageDiagonal, collageScrapbook, collageMagazine],
  comic: [comicBurst, comicBubble, comicEmoji, comicHalftone, comicSfx],
  newspaper: [newspaperHero, newspaperColumns, newspaperStamp, newspaperPoster, newspaperSplit],
  minimal: [minimalCenter, minimalBleed, minimalLeft, minimalHuge, minimalStripe]
};

function selectLayout(realFamily, variantIndex) {
  const layouts = REAL_STYLE_LAYOUTS[realFamily];
  if (!layouts) return REAL_STYLE_LAYOUTS.handnote[0];
  return layouts[variantIndex % layouts.length];
}

window.REAL_STYLE_LAYOUTS = REAL_STYLE_LAYOUTS;
window.selectLayout = selectLayout;

## 步骤2：在 index.html 中引入

在 index.html 的 <script type="module"> 中，real-style-center-shapes.js 的 import 之后，添加：
  import './lib/real-style-layouts.js';

## 步骤3：验证

// 验证每个风格族有5个layout
Object.keys(REAL_STYLE_LAYOUTS).forEach(f => {
  console.log(f + ' layouts:', REAL_STYLE_LAYOUTS[f].length);
});
// 预期每个输出 5

// 验证 selectLayout
const l1 = selectLayout('handnote', 2);
const l2 = selectLayout('handnote', 7); // 7 % 5 = 2
console.log('同一layout:', l1.id === l2.id); // 预期 true

## 重要约束
- 所有 geometry 中的坐标使用归一化值（0-1），实际像素由渲染器换算
- layout 之间有明显差异（标题位置、对齐方式、装饰槽位不同）
- 每个 layout 至少有1个推荐的中央图形ID
- decorationSlots 数量合理：handnote 2-3个，collage 2-3个，comic 2-3个，newspaper 2-3个，minimal 0-2个

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📦 批次五：装饰系统

> **前置**：批次一至四完成
> **目标**：实现风格化装饰包生成、位置分配、互斥规则

---

### AI 提示词（批次五）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

批次一至四已完成。本批次创建装饰系统。

请你严格按照以下步骤执行：

## 步骤1：创建 lib/real-style-decorations.js

新建文件，实现装饰计划生成、位置分配和互斥规则。

### 1.1 装饰对象结构

每个装饰项：
{
  id: string,              // 如 'washi-tape-top'
  type: string,            // 装饰类型: 'tape'|'stamp'|'arrow'|'emoji'|'doodle'|'sticker'|'line'|'dot'|'badge'|'bubble'|'burst'|'halftone'|'sfx'
  slot: string,            // 位置槽位: 'topLeft'|'topRight'|'bottomLeft'|'bottomRight'|'aboveTitle'|'belowTitle'|'aroundKeyword'
  renderLayer: string,     // 'background'|'behind'|'above'
  drawInstruction: {       // 绘制指令（由渲染器执行）
    type: string,          // 'rect'|'circle'|'line'|'text'|'emoji'|'path'|'sticker'
    params: object         // 参数
  }
}

### 1.2 buildDecorationPlan(realFamily, subStyle, layoutId, centerShape, content, seed) 函数

输入：
  - realFamily: 真实风格族
  - subStyle: 子风格配置对象
  - layoutId: 布局ID
  - centerShape: 中央图形对象
  - content: parseCoverContent 的输出
  - seed: 随机种子

输出：
  {
    backgroundDecorations: [],   // 背景层装饰
    behindTextDecorations: [],   // 文字后方装饰
    aboveTextDecorations: [],    // 文字上方装饰
    cornerDecorations: [],       // 角落装饰
    stickers: []                 // 贴纸项
  }

### 1.3 装饰数量规则

const DECORATION_COUNT_RULES = {
  handnote: [4, 6],    // 随机4-6个装饰
  collage: [5, 7],
  comic: [4, 6],
  newspaper: [3, 4],
  minimal: [0, 1]
};

使用 seededRandom(seed) 在范围内选择具体数量。

### 1.4 各风格族装饰生成

#### handnote 装饰包

必选（至少出现1次）：
- 胶带(tape)：半透明米色矩形，位置在 topLeft 或 topRight
- 手绘圈(doodle)：椭圆形圈，围绕关键词或主标题某个字
- 日期标签(badge)：小圆角矩形+文字，位置在 topLeft 或 topRight

可选（随机0-2个）：
- 手绘箭头(doodle)：从角落指向标题
- 右下小涂鸦(doodle)：简笔画小花/星星/笑脸
- emoji：1个装饰性emoji文字（⭐📌✏️📖💡等）
- 荧光笔高亮(line)：主标题下方的半透明粗线

#### collage 装饰包

必选（至少出现1次）：
- 印章(stamp)：红色或深色圆形/椭圆形印章，位置在 topRight 或 bottomRight
- 色块(rect)：1-2个装饰性小色块，散布在角落
- 便签纸影(rect)：辅助的小矩形暗示叠层

可选（随机0-2个）：
- 胶带(tape)
- 手绘箭头(doodle)
- emoji（🔥💥⚡等）
- 编号标签(badge)
- 小圆点(dot)

#### comic 装饰包

必选（至少出现1次）：
- 半色调网点(halftone)：背景层圆点矩阵
- 放射线或速度线(burst)：从标题向外发射的线段
- 描边效果(stroke)：此装饰通过 renderLayer='above' 标记

可选（随机0-2个）：
- 对话气泡(bubble)
- 3D emoji(sticker)
- 拟声词(sfx)：大的半透明文字如「啪！」「咚！」
- 星爆形状(burst)
- 小闪电(doodle)

#### newspaper 装饰包

必选（至少出现1次）：
- 分割线(line)：细横线或竖线
- 编号/日期标签(badge)

可选（随机0-1个）：
- 印章(stamp)
- 几何短条(line)
- 小圆点(dot)

#### minimal 装饰包

必选：无

可选（随机0-1个）：
- 小圆点(dot)：直径6-12px的实心圆
- 短横线(line)：20-60px长的细横线
- 极细边框(line)：1px边框

### 1.5 allocateDecorationSlots(count, realFamily, layout) 函数

位置分配规则（按数量）：
  count 0-1: ['belowTitle'] 或 ['topRight']
  count 2: ['bottomLeft', 'topRight'] 或 ['topLeft', 'bottomRight']
  count 3: ['topLeft', 'bottomRight', 'aroundTitle'] 或轮换
  count 4: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
  count 5: 四角 + 'aboveTitle'
  count 6+: 四角 + 'aboveTitle' + 'belowTitle'

使用 seededRandom(seed) 打乱槽位顺序，确保不同 seed 产生不同分配。

### 1.6 互斥规则

function applyMutualExclusion(plan, realFamily, titleBox) {
  // 规则1：卡通角色/sticker 类型最多1个（collage、comic可能有）
  // 规则2：emoji 最多2个
  // 规则3：同一角落（topLeft等）最多1个主装饰（stamp/tape不能放一起）
  // 规则4：装饰不得进入标题保护区
  // 规则5：handnote 手绘元素最多3个（doodle类型）
  // 规则6：minimal 任何装饰不能遮挡主标题
  return plan;
}

标题保护区计算：
function getTitleSafeRect(titleBox) {
  return {
    x: titleBox.x - 40,
    y: titleBox.y - 40,
    w: titleBox.w + 80,
    h: titleBox.h + 80
  };
}

装饰如果与标题保护区重叠超过30%，需要移开或取消。

### 1.7 绘制函数

drawDecorations(ctx, decorations, palette):
  遍历 decorations 数组，根据每个装饰的 drawInstruction 执行 Canvas 绘制。
  支持的 drawInstruction.type：
  - 'rect': fillRect 或 strokeRect
  - 'circle': arc + fill/stroke
  - 'line': moveTo + lineTo + stroke
  - 'text': fillText（小标签文字）
  - 'emoji': fillText（emoji字符，较大字号）
  - 'path': 自定义路径（贝塞尔曲线等）
  - 'dot': 小实心圆
  - 'sticker': 调用现有贴纸系统函数

### 1.8 导出

window.buildDecorationPlan = buildDecorationPlan;
window.allocateDecorationSlots = allocateDecorationSlots;
window.applyMutualExclusion = applyMutualExclusion;
window.drawDecorations = drawDecorations;
window.getTitleSafeRect = getTitleSafeRect;
window.DECORATION_COUNT_RULES = DECORATION_COUNT_RULES;

## 步骤2：在 index.html 中引入

在 index.html 的 <script type="module"> 中，real-style-layouts.js 的 import 之后，添加：
  import './lib/real-style-decorations.js';

## 步骤3：验证

// 测试装饰计划生成
const testContent = { mainTitle: '测试标题', subTitle: '副标题', keyword: '测试', badgeText: '', footerText: '', rawText: '测试标题' };
const plan = buildDecorationPlan('handnote', window.REAL_SUBSTYLE_CONFIGS.creamNotebook, 'handnoteTape', null, testContent, 42);
console.log('handnote装饰计划:', plan);
console.log('背景装饰:', plan.backgroundDecorations.length);
console.log('文字后装饰:', plan.behindTextDecorations.length);
console.log('文字上装饰:', plan.aboveTextDecorations.length);

// 测试 minimal 只有0-1个装饰
const planMin = buildDecorationPlan('minimal', window.REAL_SUBSTYLE_CONFIGS.cleanQuote, 'minimalCenter', null, testContent, 99);
const totalMin = planMin.backgroundDecorations.length + planMin.behindTextDecorations.length + planMin.aboveTextDecorations.length;
console.log('minimal装饰总数:', totalMin, '(预期 ≤ 1)');

// 测试位置分配
const slots = allocateDecorationSlots(4, 'collage');
console.log('4个装饰槽位分配:', slots, '(预期4个不同位置)');

## 重要约束
- 所有装饰使用纯 Canvas 2D API 绘制
- 装饰不依赖任何外部图片（贴纸项可通过 sticker 类型引用现有系统）
- 装饰尺寸不超过画布的12%（大装饰如印章约8-10%，小装饰如圆点约1-3%）
- 互斥规则严格执行，不能出现两个装饰在同一角落重叠
- buildDecorationPlan 返回的装饰必须在风格族规则内

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📦 批次六：渲染管线主入口 — 串联所有模块

> **前置**：批次一至五完成
> **目标**：实现 drawRealStyleCover 主渲染函数，接入现有系统

---

### AI 提示词（批次六）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

批次一至五已完成，所有 lib/real-style-*.js 文件已创建并引入。
本批次创建渲染器主入口，串联所有模块，并接入现有系统。

请你严格按照以下步骤执行：

## 步骤1：创建 lib/real-style-renderer.js

新建文件，实现完整的真实风格渲染管线。

### 1.1 主渲染函数

async function drawRealStyleCover(ctx, rawText, palette, options, family) {
  // options: { vi: variantIndex(0-4), seed: number, font: string }
  // family: 'A'-'T'

  // Step 1: 解析真实风格
  const map = window.REAL_STYLE_MAP[family] || window.REAL_STYLE_MAP.A;
  const realFamily = map.realFamily;
  const subStyleConfig = window.REAL_SUBSTYLE_CONFIGS[map.subStyle] || window.REAL_SUBSTYLE_CONFIGS.creamNotebook;
  const familyConfig = window.REAL_STYLE_CONFIGS[realFamily] || window.REAL_STYLE_CONFIGS.handnote;

  // Step 2: 解析文案
  const content = window.parseCoverContent(rawText);

  // Step 3: 选择子风格调色板（使用传入的 palette 或子风格默认色）
  const effectivePalette = {
    bg: palette.bg || subStyleConfig.palette.bg,
    text: palette.text || subStyleConfig.palette.text,
    accent: palette.accent || subStyleConfig.palette.accent,
    second: palette.second || subStyleConfig.palette.second
  };

  // Step 4: 选择 layout
  const layout = window.selectLayout(realFamily, options.vi);

  // Step 5: 选择中央承载图形
  const centerShape = window.selectCenterShape(realFamily, family, options.vi, options.seed);

  // Step 6: 计算排版计划
  const typography = window.computeTypographyPlan(
    ctx, content, familyConfig, layout.id, centerShape, subStyleConfig
  );

  // Step 7: 生成装饰计划
  const decorationPlan = window.buildDecorationPlan(
    realFamily, subStyleConfig, layout.id, centerShape, content, options.seed
  );

  // Step 8: 应用互斥规则
  const safeTitleBox = window.getTitleSafeRect(typography.mainTextBox);
  window.applyMutualExclusion(decorationPlan, realFamily, safeTitleBox);

  // Step 9: 绘制背景
  drawRealBackground(ctx, realFamily, subStyleConfig, effectivePalette, layout);

  // Step 10: 绘制中央承载图形
  if (centerShape && centerShape.draw) {
    const shapeBox = {
      x: centerShape.textSafeArea.x * 1242,
      y: centerShape.textSafeArea.y * 1656,
      w: centerShape.textSafeArea.w * 1242,
      h: centerShape.textSafeArea.h * 1656
    };
    centerShape.draw(ctx, shapeBox, effectivePalette, options.seed);
  }

  // Step 11: 绘制背景层装饰
  window.drawDecorations(ctx, decorationPlan.backgroundDecorations, effectivePalette);

  // Step 12: 绘制文字后装饰
  window.drawDecorations(ctx, decorationPlan.behindTextDecorations, effectivePalette);

  // Step 13: 绘制结构化文字
  drawStructuredTypography(ctx, content, typography, effectivePalette, options.font);

  // Step 14: 绘制文字上方装饰
  window.drawDecorations(ctx, [...decorationPlan.aboveTextDecorations, ...decorationPlan.cornerDecorations], effectivePalette);

  // Step 15: 安全边界检查
  assertSafeBounds(typography);
}

### 1.2 drawRealBackground(ctx, realFamily, subStyleConfig, palette, layout)

根据真实风格族绘制背景：

handnote 背景：
  - 填充 palette.bg[0] 或 palette.bg[options.vi % bg.length]
  - 如果是 lined-note / grid-note 类型中央图形，画布整体画浅横线/方格
  - 柔和纸张纹理（可选：随机散布极浅色的斑点模拟纸质感）

collage 背景：
  - 填充较中性的底色（palette.bg[0]）
  - 可选大面积的半透明色块（1-2个，约占画布10-20%面积）

comic 背景：
  - 填充鲜艳底色
  - 如果 layout 是 comicHalftone：整个画布画半色调网点
  - 如果 layout 是 comicBurst：从画布中心画放射线

newspaper 背景：
  - 填充偏白或偏灰底色
  - 可选极淡的竖线或栏目分割线

minimal 背景：
  - 纯色填充 palette.bg[0]
  - 不加纹理，不加装饰
  - 可选极淡的渐变（上到下微变）

### 1.3 drawStructuredTypography(ctx, content, typography, palette, fontKey)

绘制结构化文字（主标题、副标题、关键词、badge、footer）。

重要：Canvas 原生 fillText 不支持 letter-spacing。你需要实现逐字绘制。

实现方法：
  function drawTextWithSpacing(ctx, text, x, y, fontSize, letterSpacingEm, fontFamily, color) {
    ctx.save();
    ctx.font = `bold ${fontSize}px "${fontFamily || 'Noto Sans SC'}"`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    const spacing = fontSize * letterSpacingEm;
    let currentX = x;
    for (const char of text) {
      ctx.fillText(char, currentX, y);
      currentX += ctx.measureText(char).width + spacing;
    }
    ctx.restore();
    return currentX - x; // 返回总宽度
  }

绘制顺序（从上层到下层）：
  1. badge（如果有）：小字号，topLeft 或 topRight，背景色块 + 文字
  2. keyword（如果有）：中等字号，highlight 效果
  3. mainTitle：最大字号，如果 comic 风格且有 stroke，先画描边再画填充
  4. subTitle（如果有）：主标题下方
  5. footerText（如果有）：画布底部

对于 comic 风格的描边效果：
  function drawStrokedTitle(ctx, text, x, y, fontSize, fontFamily, fillColor, strokeColor, strokeWidth) {
    ctx.font = `bold ${fontSize}px "${fontFamily || 'Noto Sans SC'}"`;
    ctx.textBaseline = 'top';
    // 先画描边
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    // 再画填充
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
  }

关键词荧光笔高亮效果（handnote风格）：
  function drawHighlightedText(ctx, text, x, y, fontSize, fontFamily, textColor, highlightColor) {
    ctx.font = `bold ${fontSize}px "${fontFamily || 'Noto Sans SC'}"`;
    const textWidth = ctx.measureText(text).width;
    // 先画高亮背景（半透明矩形）
    ctx.fillStyle = highlightColor;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x - 4, y + fontSize * 0.1, textWidth + 8, fontSize * 0.85);
    ctx.globalAlpha = 1;
    // 再画文字
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  }

### 1.4 assertSafeBounds(typography)

检查主标题没有超出画布太多（允许 minimal 和 comic 最多5%溢出）：
  function assertSafeBounds(typography) {
    const box = typography.mainTextBox;
    const bleed = typography.allowBleed ? 0.05 : 0;
    const canvasW = 1242, canvasH = 1656;
    if (box.x < -canvasW * bleed || box.y < -canvasH * bleed ||
        box.x + box.w > canvasW * (1 + bleed) ||
        box.y + box.h > canvasH * (1 + bleed)) {
      console.warn('文字区域超出安全边界', box);
    }
  }

### 1.5 导出

window.drawRealStyleCover = drawRealStyleCover;
window.drawRealBackground = drawRealBackground;
window.drawStructuredTypography = drawStructuredTypography;
window.drawTextWithSpacing = drawTextWithSpacing;

## 步骤2：修改 index.html 渲染入口

### 2.1 在 index.html 中引入新文件

在 <script type="module"> 中，real-style-decorations.js 的 import 之后，添加：
  import './lib/real-style-renderer.js';

### 2.2 修改 STYLE_FUNCS 或添加入口路由

找到 index.html 中的 STYLE_FUNCS 对象（约第5745行），该对象将 A-T 映射到渲染函数。
不要修改现有 STYLE_FUNCS，而是在 drawTemplateEnhancedCover 函数内部（约第3501行）添加路由：

找到 function drawTemplateEnhancedCover(ctx, text, palette, options, family) { ... }
在其函数体最开始处添加：

```javascript
// 真实风格模式路由
if (STATE.realStyleMode && window.drawRealStyleCover) {
  try {
    return await window.drawRealStyleCover(ctx, text, palette, options, family);
  } catch (err) {
    console.warn('真实风格渲染失败，回退到旧版', err);
    // 继续执行旧版渲染
  }
}
```

注意：如果 drawTemplateEnhancedCover 不是 async 函数，需要改为 async function。

### 2.3 添加 URL 参数控制

在 STATE 初始化代码附近（约第912行），添加：

```javascript
// 真实风格模式：URL 参数 ?mode=legacy 可回退旧版
if (getUrlParam('mode') === 'legacy') {
  STATE.realStyleMode = false;
}
```

确保 getUrlParam 函数存在，如果不存在则添加：
```javascript
function getUrlParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}
```

## 步骤3：验证

在浏览器控制台执行：

// 测试单张渲染
const testCanvas = document.createElement('canvas');
testCanvas.width = 1242;
testCanvas.height = 1656;
const testCtx = testCanvas.getContext('2d');

// 使用 await（在 async 上下文中）
await drawRealStyleCover(testCtx, '审稿人说创新性不足到底怎么改',
  { bg: ['#F5EFD8'], text: '#2D2A26', accent: '#5D4E37', second: '#FFEC47' },
  { vi: 0, seed: 42, font: 'black' }, 'A');

console.log('渲染完成');
// 可以查看 testCanvas.toDataURL() 确认有内容

// 测试 legacy 回退
// 在 URL 中添加 ?mode=legacy 后刷新页面，检查封面是否使用旧版渲染

验证项：
- 20个风格 A-T 分别调用 drawRealStyleCover 都能正常渲染
- 5个真实风格族视觉差异明显
- URL 参数 ?mode=legacy 可以回退到旧版
- 渲染错误时自动降级到旧版

## 重要约束
- drawRealStyleCover 函数必须是 async function（因为有潜在异步操作）
- 所有 Canvas 操作前先 ctx.save()，完成后 ctx.restore()
- 不要在渲染函数内部修改全局 STATE（除了读取）
- 兼容现有字体系统（FONT_MAP 中的字体）
- 渲染性能：单张封面渲染时间不超过200ms
- 确保 index.html 的 20 个风格入口 A-T 点击后能正常生成封面

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📦 批次七：批量候选 30 张 + 横向滚动 UI

> **前置**：批次一至六完成
> **目标**：每条文案生成30张候选，横向滚动浏览

---

### AI 提示词（批次七）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

批次一至六已完成，真实风格渲染管线已接入。
本批次改造批量生成系统：每条文案生成30张候选图，添加横向滚动UI。

请你严格按照以下步骤执行：

## 步骤1：理解现有批量系统

在 index.html 中找到以下现有函数并理解其逻辑（只读不修改）：
- parseBatchTexts()：用 888 分隔符拆分文本
- renderBatchPanel()：渲染批量面板
- generateBatchCovers()：生成批量封面
- buildOneCard()：构建单张卡片
- renderCard()：渲染单张封面到 Canvas
- BATCH_STATE 对象

## 步骤2：修改 candidate 生成逻辑

### 2.1 新增候选生成配置

在 BATCH_STATE 附近添加：

```javascript
const CANDIDATE_CONFIG = {
  candidatesPerText: 30,        // 每条文案生成30张候选
  initialRenderCount: 6,        // 首次渲染前6张
  lazyLoadBatchSize: 6,         // 每次懒加载6张
  familiesPerText: 6,           // 每条文案使用6个不同风格入口
};
```

### 2.2 新增候选生成函数

```javascript
function generateCandidatesForText(text, textIndex, globalSeed) {
  // 为一条文案生成30个候选的配置数组
  const candidates = [];
  const textSeed = getTextSeed(text, textIndex, globalSeed);

  // 从20个风格中选6个（按推荐权重）
  const selectedFamilies = selectFamiliesForCandidates(text, textSeed);

  // 每个选中风格生成5张候选（6×5=30）
  let candidateIndex = 0;
  for (const family of selectedFamilies) {
    for (let vi = 0; vi < 5; vi++) {
      candidates.push({
        textIndex: textIndex,
        candidateIndex: candidateIndex,
        family: family,
        vi: vi,
        seed: getTextSeed(text, textIndex, globalSeed) + candidateIndex * 7919,
      });
      candidateIndex++;
    }
  }

  return candidates;
}

function selectFamiliesForCandidates(text, textSeed) {
  // 默认推荐权重：handnote 2个, collage 1-2个, comic 1个, newspaper 1个, minimal 0-1个
  const rng = seededRandom(textSeed);

  // 从每个真实风格族中随机抽取子风格入口
  const handnoteFamilies = ['A', 'J', 'L'];
  const collageFamilies = ['F', 'I', 'M', 'T'];
  const comicFamilies = ['B', 'C', 'G', 'H', 'N', 'P'];
  const newspaperFamilies = ['D', 'K', 'O', 'R'];
  const minimalFamilies = ['E', 'Q', 'S'];

  // 随机选择：handnote取2个，collage取1-2个，comic取1个，newspaper取1个，minimal取0-1个
  const pick = (arr, n) => {
    const shuffled = [...arr].sort(() => rng() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
  };

  const selected = [
    ...pick(handnoteFamilies, 2),
    ...pick(collageFamilies, rng() > 0.5 ? 2 : 1),
    ...pick(comicFamilies, 1),
    ...pick(newspaperFamilies, 1),
    ...pick(minimalFamilies, rng() > 0.5 ? 1 : 0),
  ];

  // 确保有6个风格入口（如果不够，从handnote补充）
  while (selected.length < 6) {
    const fallback = handnoteFamilies[selected.length % handnoteFamilies.length];
    if (!selected.includes(fallback)) {
      selected.push(fallback);
    } else {
      selected.push(comicFamilies[selected.length % comicFamilies.length]);
    }
  }

  return selected.slice(0, 6);
}
```

### 2.3 修改 generateBatchCovers 函数

修改现有的 generateBatchCovers() 函数（约第6203行），改为：

1. 对于每个选中的批量文本项：
   a. 调用 generateCandidatesForText() 生成30个候选配置
   b. 创建 batch-group DOM 结构
   c. 先渲染前 CANDIDATE_CONFIG.initialRenderCount（6）张
   d. 设置 IntersectionObserver 监听滚动，懒加载剩余候选

具体实现：

```javascript
async function generateBatchCovers() {
  const selectedItems = BATCH_STATE.items.filter(item => item.selected);
  if (selectedItems.length === 0) {
    showToast('请至少选择一条文案');
    return;
  }

  const container = document.getElementById('batch-results');
  container.innerHTML = '';

  const globalSeed = Date.now();

  for (let i = 0; i < selectedItems.length; i++) {
    const item = selectedItems[i];
    const candidates = generateCandidatesForText(item.text, i, globalSeed);

    // 创建 batch-group
    const group = document.createElement('section');
    group.className = 'batch-group';
    group.dataset.textIndex = i;
    group.innerHTML = `
      <header class="batch-header">
        <h3>文案 ${i + 1}</h3>
        <span class="batch-text-preview">${escapeHtml(item.text.substring(0, 30))}${item.text.length > 30 ? '...' : ''}</span>
        <div class="batch-actions">
          <button class="btn-download-selected" data-text-index="${i}">下载选中</button>
          <button class="btn-download-all" data-text-index="${i}">下载本组(${candidates.length}张)</button>
        </div>
      </header>
      <div class="candidate-scroll" data-text-index="${i}">
        <!-- 候选卡片将被渲染到这里 -->
      </div>
    `;

    container.appendChild(group);

    // 存储候选配置
    group._candidates = candidates;
    group._renderedCount = 0;

    // 首次渲染前6张
    await renderCandidateBatch(group, 0, CANDIDATE_CONFIG.initialRenderCount);

    // 设置懒加载
    setupLazyLoading(group);
  }

  BATCH_STATE.generated = true;
  updateBatchDownloadButtons();
}
```

### 2.4 新增候选卡片渲染函数

```javascript
async function renderCandidateBatch(group, startIndex, count) {
  const scrollContainer = group.querySelector('.candidate-scroll');
  const candidates = group._candidates;
  const endIndex = Math.min(startIndex + count, candidates.length);

  for (let i = startIndex; i < endIndex; i++) {
    const candidate = candidates[i];
    const cardWrap = document.createElement('article');
    cardWrap.className = 'card-wrap candidate-card';
    cardWrap.dataset.candidateIndex = i;
    cardWrap.dataset.family = candidate.family;

    // 创建 canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1242;
    canvas.height = 1656;
    canvas.className = 'cover-canvas';

    // 添加复选框
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'candidate-checkbox';
    checkbox.dataset.candidateIndex = i;

    cardWrap.appendChild(canvas);
    cardWrap.appendChild(checkbox);
    scrollContainer.appendChild(cardWrap);

    // 渲染封面
    try {
      const ctx = canvas.getContext('2d');
      const palette = pickPalette(candidate.family, candidate.vi);
      const options = {
        vi: candidate.vi,
        seed: candidate.seed,
        font: STATE.font || 'black'
      };
      await window.drawRealStyleCover(ctx, candidate.text || group._text, palette, options, candidate.family);
    } catch (err) {
      console.error(`候选 ${i} 渲染失败:`, err);
      // 降级：红色X占位
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1242, 1656);
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 48px "Noto Sans SC"';
      ctx.fillText('✕ 渲染失败', 400, 800);
    }
  }

  group._renderedCount = endIndex;
}
```

### 2.5 懒加载

```javascript
function setupLazyLoading(group) {
  const scrollContainer = group.querySelector('.candidate-scroll');
  const sentinel = document.createElement('div');
  sentinel.className = 'lazy-sentinel';
  sentinel.style.cssText = 'min-width:1px; min-height:1px;';
  scrollContainer.appendChild(sentinel);

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const current = group._renderedCount;
        const total = group._candidates.length;
        if (current < total) {
          renderCandidateBatch(group, current, CANDIDATE_CONFIG.lazyLoadBatchSize);
        }
        if (current + CANDIDATE_CONFIG.lazyLoadBatchSize >= total) {
          observer.disconnect();
        }
      }
    }
  }, { root: scrollContainer, rootMargin: '300px' });

  observer.observe(sentinel);
}
```

## 步骤3：添加横向滚动 CSS

在 index.html 的 <style> 区域（约第1-740行）末尾，添加：

```css
/* ===== 批量候选横向滚动 ===== */
.batch-group {
  margin-bottom: 32px;
  border: 1px solid var(--border, #E5E7EB);
  border-radius: 12px;
  padding: 16px;
  background: #FAFAFA;
}

.batch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.batch-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.batch-text-preview {
  color: #6B7280;
  font-size: 13px;
  flex: 1;
  min-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.candidate-scroll {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(200px, 260px);
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.candidate-scroll::-webkit-scrollbar {
  height: 6px;
}

.candidate-scroll::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 3px;
}

.candidate-scroll::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 3px;
}

.candidate-card {
  scroll-snap-align: start;
  position: relative;
  flex-shrink: 0;
}

.candidate-card .cover-canvas {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, transform 0.2s;
}

.candidate-card:hover .cover-canvas {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.candidate-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 2;
  accent-color: #4F46E5;
}

/* 候选卡片选中态 */
.candidate-card.selected .cover-canvas {
  outline: 3px solid #4F46E5;
  outline-offset: -2px;
  border-radius: 10px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .candidate-scroll {
    grid-auto-columns: minmax(180px, 78vw);
    gap: 10px;
  }

  .batch-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .batch-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
```

## 步骤4：修改下载逻辑

在现有的下载函数附近添加：

```javascript
function downloadSelectedCandidates(textIndex) {
  const group = document.querySelector(`.batch-group[data-text-index="${textIndex}"]`);
  if (!group) return;

  const checkboxes = group.querySelectorAll('.candidate-checkbox:checked');
  if (checkboxes.length === 0) {
    showToast('请至少选中一张候选图');
    return;
  }

  const canvases = [];
  checkboxes.forEach(cb => {
    const card = cb.closest('.candidate-card');
    if (card) {
      const canvas = card.querySelector('canvas');
      if (canvas) canvases.push(canvas);
    }
  });

  downloadCanvases(canvases, `cover_batch_${textIndex + 1}`);
}

function downloadAllCandidates(textIndex) {
  const group = document.querySelector(`.batch-group[data-text-index="${textIndex}"]`);
  if (!group) return;

  const totalCanvases = group._candidates ? group._candidates.length : 0;
  if (totalCanvases > 30) {
    if (!confirm(`将下载 ${totalCanvases} 张图片，可能需要一些时间。确定继续？`)) {
      return;
    }
  }

  const canvases = Array.from(group.querySelectorAll('canvas'));
  downloadCanvases(canvases, `cover_batch_${textIndex + 1}_all`);
}

// 绑定事件：在 renderBatchPanel 或生成后绑定按钮事件
function bindBatchDownloadEvents() {
  document.querySelectorAll('.btn-download-selected').forEach(btn => {
    btn.addEventListener('click', () => {
      const textIndex = parseInt(btn.dataset.textIndex);
      downloadSelectedCandidates(textIndex);
    });
  });

  document.querySelectorAll('.btn-download-all').forEach(btn => {
    btn.addEventListener('click', () => {
      const textIndex = parseInt(btn.dataset.textIndex);
      downloadAllCandidates(textIndex);
    });
  });
}
```

## 步骤5：验证

验证清单（在浏览器中操作）：

1. 输入多行文案（用888分隔），点击批量生成
2. 检查每条文案下方是否出现横向滚动候选区
3. 检查首屏是否显示6张候选图
4. 向右滚动，检查是否加载更多候选图
5. 每条文案应有30张候选
6. 不同候选图之间中央图形、布局有明显变化
7. 点击复选框选中候选图，点击"下载选中"
8. 点击"下载本组(30张)"
9. 移动端（Chrome DevTools 模拟）检查横向滑动是否顺滑

## 重要约束
- 批量生成性能：30张候选不应阻塞UI，使用 setTimeout 或 requestIdleCallback 分片渲染
- 如果用户未指定风格，使用推荐权重分配风格入口
- 如果用户指定了风格（如只选了A），则30张候选都在该风格对应的真实风格族内变化
- 懒加载的 IntersectionObserver 在移动端也需正常工作
- 下载功能保留现有的 free/VIP 限制逻辑

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📦 批次八：随机性与去雷同

> **前置**：批次一至七完成
> **目标**：实现稳定随机种子、结构签名、去重约束

---

### AI 提示词（批次八）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

批次一至七已完成，批量30张候选已实现。
本批次增加随机性控制与去雷同机制，确保不同候选图、不同文案之间视觉上有明显变化。

请你严格按照以下步骤执行：

## 步骤1：创建 lib/real-style-random.js

新建文件，实现随机种子和去雷同逻辑。

### 1.1 稳定哈希函数

```javascript
function stableHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getTextSeed(text, textIndex, globalSeed) {
  return stableHash(text + '::text::' + textIndex + '::seed::' + (globalSeed || 0));
}

function getCandidateSeed(textSeed, candidateIndex) {
  return stableHash(textSeed + '::candidate::' + candidateIndex);
}

function getVariantSeed(candidateSeed, variantType) {
  return stableHash(candidateSeed + '::variant::' + variantType);
}
```

### 1.2 结构签名

```javascript
function getCompositionSignature(plan) {
  // 生成唯一的结构签名，用于检测雷同
  return [
    plan.realFamily || '',
    plan.layoutId || '',
    plan.centerShapeId || '',
    (plan.decorationSlots || []).sort().join(','),
    plan.titleAlignment || '',
    plan.titlePositionKey || '',
    plan.badgePosition || '',
    plan.footerPosition || ''
  ].join('|');
}

function getCompositionKey(candidate) {
  // 从候选配置生成结构键
  const map = window.REAL_STYLE_MAP[candidate.family] || window.REAL_STYLE_MAP.A;
  const layout = window.selectLayout(map.realFamily, candidate.vi);
  const shape = window.selectCenterShape(map.realFamily, candidate.family, candidate.vi, candidate.seed);
  return [
    map.realFamily,
    layout.id,
    shape.id,
    candidate.vi,
  ].join('|');
}
```

### 1.3 去雷同约束器

```javascript
function createDeduplicationContext() {
  // 在一个批量生成上下文中维护已出现的结构签名
  const recentSignatures = new Set();
  const recentCenterShapes = new Map();  // realFamily -> [最近使用的shapeId列表]

  return {
    register(signature, realFamily, centerShapeId) {
      recentSignatures.add(signature);

      if (!recentCenterShapes.has(realFamily)) {
        recentCenterShapes.set(realFamily, []);
      }
      const arr = recentCenterShapes.get(realFamily);
      arr.push(centerShapeId);
      if (arr.length > 6) arr.shift(); // 只保留最近6个
    },

    isDuplicate(signature) {
      return recentSignatures.has(signature);
    },

    getRecentShapes(realFamily) {
      return recentCenterShapes.get(realFamily) || [];
    },

    clear() {
      recentSignatures.clear();
      recentCenterShapes.clear();
    }
  };
}
```

### 1.4 抖动函数（重试换参）

```javascript
function jitterCandidate(candidate, dedupContext, maxRetries = 5) {
  // 如果候选的结构签名已存在，尝试抖动参数
  let current = { ...candidate };
  let retries = 0;

  while (retries < maxRetries) {
    const key = getCompositionKey(current);
    if (!dedupContext.isDuplicate(key)) {
      return current;
    }

    // 抖动策略：改变 vi（换layout）、改变 seed（换centerShape）
    if (retries % 2 === 0) {
      current.vi = (current.vi + 1 + retries) % 5;
    } else {
      current.seed = getVariantSeed(current.seed, 'jitter_' + retries);
    }
    retries++;
  }

  // 最终兜底：强制使用不同 seed
  current.seed = getVariantSeed(candidate.seed, 'forced_' + Date.now());
  return current;
}
```

### 1.5 同一文案内去重

```javascript
function deduplicateCandidatesForText(candidates) {
  const dedup = createDeduplicationContext();
  const result = [];

  for (const candidate of candidates) {
    const key = getCompositionKey(candidate);
    if (!dedup.isDuplicate(key)) {
      dedup.register(key, candidate.realFamily || '', candidate.centerShapeId || '');
      result.push(candidate);
    } else {
      // 抖动后重试
      const jittered = jitterCandidate(candidate, dedup);
      const newKey = getCompositionKey(jittered);
      dedup.register(newKey, jittered.realFamily || '', jittered.centerShapeId || '');
      result.push(jittered);
    }
  }

  return result;
}
```

### 1.6 不同文案间去重

```javascript
function deduplicateAcrossTexts(allTextCandidates) {
  // allTextCandidates: [[candidate1_text0, ...], [candidate1_text1, ...], ...]
  const globalDedup = createDeduplicationContext();
  const result = [];

  for (const textCandidates of allTextCandidates) {
    const deduped = [];
    for (const candidate of textCandidates) {
      const key = getCompositionKey(candidate);
      if (!globalDedup.isDuplicate(key)) {
        globalDedup.register(key, candidate.realFamily || '', candidate.centerShapeId || '');
        deduped.push(candidate);
      } else {
        const jittered = jitterCandidate(candidate, globalDedup);
        const newKey = getCompositionKey(jittered);
        globalDedup.register(newKey, jittered.realFamily || '', jittered.centerShapeId || '');
        deduped.push(jittered);
      }
    }
    result.push(deduped);
  }

  return result;
}
```

### 1.7 每个真实风格族的随机边界控制

```javascript
const FAMILY_RANDOMIZATION_BOUNDS = {
  handnote: {
    // 可随机：纸张类型、胶带位置、手绘圈位置
    allowedJitterDimensions: ['centerShapeId', 'decorationPosition', 'paperTexture'],
    // 不可随机：必须有纸张背景、必须有手绘元素
    requiredElements: ['paperBackground', 'handDrawnElement'],
    maxRotation: 3, // 度
  },
  collage: {
    allowedJitterDimensions: ['paperLayers', 'stampPosition', 'arrowDirection', 'colorBlockPosition'],
    requiredElements: ['paperLayers', 'stamp'],
    maxRotation: 8,
  },
  comic: {
    allowedJitterDimensions: ['burstPosition', 'bubblePosition', 'emojiPosition', 'halftoneDensity'],
    requiredElements: ['boldStroke', 'popElement'],
    maxRotation: 5,
  },
  newspaper: {
    allowedJitterDimensions: ['columnLayout', 'stampPosition', 'dividerPosition', 'labelPosition'],
    requiredElements: ['divider', 'label'],
    maxRotation: 2,
  },
  minimal: {
    allowedJitterDimensions: ['alignment', 'bleedAmount', 'dotPosition'],
    requiredElements: [], // minimal 无必需装饰
    maxRotation: 0,
  }
};

function validateFamilyBounds(plan, realFamily) {
  const bounds = FAMILY_RANDOMIZATION_BOUNDS[realFamily];
  if (!bounds) return true;

  // 检查必需元素
  for (const required of bounds.requiredElements) {
    const hasRequired = checkRequiredElement(plan, required);
    if (!hasRequired) {
      console.warn(`风格族 ${realFamily} 缺少必需元素: ${required}`);
      return false;
    }
  }

  return true;
}

function checkRequiredElement(plan, elementName) {
  // 检查装饰计划或布局计划中是否包含指定元素
  const allDecorations = [
    ...(plan.backgroundDecorations || []),
    ...(plan.behindTextDecorations || []),
    ...(plan.aboveTextDecorations || []),
    ...(plan.cornerDecorations || [])
  ];

  switch (elementName) {
    case 'paperBackground':
      return allDecorations.some(d => d.type === 'tape' || d.type === 'doodle');
    case 'handDrawnElement':
      return allDecorations.some(d => d.type === 'doodle');
    case 'paperLayers':
      return allDecorations.some(d => d.type === 'stamp' || d.type === 'rect');
    case 'stamp':
      return allDecorations.some(d => d.type === 'stamp');
    case 'boldStroke':
      return true; // comic 标题描边在 typography 中处理
    case 'popElement':
      return allDecorations.some(d => d.type === 'bubble' || d.type === 'burst' || d.type === 'sfx' || d.type === 'emoji');
    case 'divider':
      return allDecorations.some(d => d.type === 'line');
    case 'label':
      return allDecorations.some(d => d.type === 'badge');
    default:
      return true;
  }
}
```

### 1.8 导出

```javascript
window.stableHash = stableHash;
window.getTextSeed = getTextSeed;
window.getCandidateSeed = getCandidateSeed;
window.getVariantSeed = getVariantSeed;
window.getCompositionSignature = getCompositionSignature;
window.getCompositionKey = getCompositionKey;
window.createDeduplicationContext = createDeduplicationContext;
window.jitterCandidate = jitterCandidate;
window.deduplicateCandidatesForText = deduplicateCandidatesForText;
window.deduplicateAcrossTexts = deduplicateAcrossTexts;
window.FAMILY_RANDOMIZATION_BOUNDS = FAMILY_RANDOMIZATION_BOUNDS;
window.validateFamilyBounds = validateFamilyBounds;
```

## 步骤2：接入现有系统

### 2.1 引入新文件

在 index.html 的 <script type="module"> 中，添加：
  import './lib/real-style-random.js';

### 2.2 修改 generateCandidatesForText

在步骤2.2中创建的 generateCandidatesForText 函数末尾，添加去重调用：

在 return candidates 之前添加：
  // 去重
  const deduped = deduplicateCandidatesForText(candidates);
  return deduped;

### 2.3 修改批量生成，加入跨文案去重

在 generateBatchCovers 函数中，收集所有文案的 candidates 后：
  const allCandidates = selectedItems.map((item, i) =>
    generateCandidatesForText(item.text, i, globalSeed)
  );
  const dedupedAll = deduplicateAcrossTexts(allCandidates);

然后使用 dedupedAll 而不是 allCandidates 进行渲染。

## 步骤3：验证

在浏览器控制台中：

// 测试哈希稳定性
const s1 = getTextSeed('测试文案', 0, 42);
const s2 = getTextSeed('测试文案', 0, 42);
console.log('哈希稳定:', s1 === s2); // 预期 true

// 测试不同文案的种子不同
const s3 = getTextSeed('不同文案', 0, 42);
console.log('不同文案种子不同:', s1 !== s3); // 预期 true

// 测试结构签名
const sig1 = getCompositionKey({ family: 'A', vi: 0, seed: 42 });
const sig2 = getCompositionKey({ family: 'A', vi: 0, seed: 42 });
console.log('同结构同签名:', sig1 === sig2); // 预期 true

const sig3 = getCompositionKey({ family: 'A', vi: 1, seed: 42 });
console.log('不同结构不同签名:', sig1 !== sig3); // 预期 true

// 端到端测试：
// 1. 输入3条不同文案（用888分隔）
// 2. 点击批量生成
// 3. 观察每条文案的30张候选
// 4. 确认同一文案的30张候选之间视觉差异明显
// 5. 确认不同文案之间不会出现完全相同上下结构的图

## 重要约束
- 哈希函数必须是确定性的（同样输入永远同样输出）
- 去重逻辑不能无限循环（maxRetries=5）
- 跨文案去重不能导致候选数减少（通过抖动补充）
- 随机边界控制不能破坏风格族特征（如 minimal 不能出现大量装饰）
- 换一换功能应推进 seed（例如 seed + 1000），使得新一轮候选有明显变化

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📦 批次九：贴纸真实感升级

> **前置**：批次一至八完成
> **目标**：按风格族筛选贴纸，为真实PNG素材做准备

---

### AI 提示词（批次九）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

批次一至八已完成。本批次升级贴纸系统，按真实风格族筛选贴纸。

请你严格按照以下步骤执行：

## 步骤1：创建 lib/real-style-stickers.js

新建文件，实现风格族贴纸筛选和元数据管理。

### 1.1 风格族贴纸白名单

从现有的 STICKER_REGISTRY（在 lib/stickers.js 中，约160+个贴纸条目）和 FAMILY_STICKER_POOL（在 index.html 中）中，按真实风格族重新组织贴纸：

```javascript
const REAL_STYLE_STICKER_POOL = {
  handnote: {
    // 手绘便签风适用的贴纸
    categories: ['stationery', 'doodle', 'texture', 'decor'],
    preferred: [
      // 胶带类 washi tape
      'washi-tape-1', 'washi-tape-2',
      // 手绘类
      'hand-arrow', 'hand-circle', 'hand-underline',
      // 纸品类
      'sticky-note', 'paper-clip', 'push-pin',
      // 涂鸦类
      'doodle-star', 'doodle-flower',
      // emoji 类（有限）
      'emoji-sparkles', 'emoji-pencil', 'emoji-book',
    ],
    maxEmoji: 2,
    maxDoodle: 3,
  },

  collage: {
    categories: ['stationery', 'stamp', 'frame', 'decor', 'texture'],
    preferred: [
      // 便签类
      'sticky-note', 'sticky-note-2',
      // 印章类
      'red-stamp', 'circle-stamp',
      // 拍立得/票根
      'polaroid-frame', 'ticket-frame',
      // 色块装饰
      'geometric-block',
      // 箭头
      'hand-arrow',
      // emoji（少量）
      'emoji-fire', 'emoji-sparkles',
    ],
    maxEmoji: 1,
    maxDoodle: 2,
  },

  comic: {
    categories: ['3d', 'effect', 'emoji', 'decor'],
    preferred: [
      // 3D 拟物
      'thumb-3d', 'megaphone-3d', 'star-3d', 'heart-3d',
      'fire-3d', 'diamond-3d', 'crown-3d', 'trophy-3d',
      // 特效类
      'burst', 'speed-lines', 'sparkles-effect',
      // emoji（大量）
      'emoji-fire', 'emoji-star', 'emoji-hundred', 'emoji-party',
      'emoji-rocket', 'emoji-lightning',
      // 拟声词装饰
      'sfx-boom', 'sfx-bang',
    ],
    maxEmoji: 4,
    maxDoodle: 1,
  },

  newspaper: {
    categories: ['stamp', 'frame', 'decor', 'texture'],
    preferred: [
      // 印章类
      'red-stamp', 'official-stamp',
      // 边框类
      'label-card', 'corner-decor',
      // 编号/标签
      'number-badge', 'date-label',
      // 几何线条
      'geometric-line', 'divider-line',
    ],
    maxEmoji: 0,
    maxDoodle: 0,
  },

  minimal: {
    categories: [], // 极简不使用贴纸
    preferred: [],
    maxEmoji: 0,
    maxDoodle: 0,
  }
};
```

### 1.2 贴纸筛选函数

```javascript
function filterStickersByFamily(realFamily, availableStickers) {
  // availableStickers 来自现有 STICKER_REGISTRY 或 FAMILY_STICKER_POOL
  const pool = REAL_STYLE_STICKER_POOL[realFamily];
  if (!pool) return [];

  // 如果 realFamily 是 minimal，直接返回空数组（不使用贴纸）
  if (realFamily === 'minimal') return [];

  // 筛选：贴纸的 categories 与 pool.categories 有交集
  const filtered = availableStickers.filter(sticker => {
    if (!sticker.categories) return false;
    return sticker.categories.some(cat => pool.categories.includes(cat));
  });

  // 按 preferred 列表优先排序
  const preferred = filtered.filter(s => pool.preferred.includes(s.id));
  const rest = filtered.filter(s => !pool.preferred.includes(s.id));

  return [...preferred, ...rest];
}

function getStickerCountForFamily(realFamily, seed) {
  const rng = seededRandom(seed);
  const ranges = {
    handnote: [1, 3],
    collage: [2, 4],
    comic: [2, 4],
    newspaper: [1, 2],
    minimal: [0, 0]
  };
  const [min, max] = ranges[realFamily] || [1, 3];
  return min + Math.floor(rng() * (max - min + 1));
}

function pickStickersForCard(realFamily, availableStickers, count, seed) {
  const filtered = filterStickersByFamily(realFamily, availableStickers);
  const rng = seededRandom(seed);

  // Fisher-Yates shuffle with seeded random
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 应用 maxEmoji / maxDoodle 限制
  const pool = REAL_STYLE_STICKER_POOL[realFamily];
  const result = [];
  let emojiCount = 0;
  let doodleCount = 0;

  for (const sticker of shuffled) {
    if (result.length >= count) break;

    const isEmoji = sticker.categories && sticker.categories.includes('emoji');
    const isDoodle = sticker.categories && sticker.categories.includes('doodle');

    if (isEmoji && emojiCount >= (pool.maxEmoji || 0)) continue;
    if (isDoodle && doodleCount >= (pool.maxDoodle || 0)) continue;

    result.push(sticker);
    if (isEmoji) emojiCount++;
    if (isDoodle) doodleCount++;
  }

  return result;
}
```

### 1.3 真实PNG素材路径映射（中期准备）

```javascript
const REAL_STICKER_ASSET_PATHS = {
  handnote: '/assets/stickers/handnote/',
  collage: '/assets/stickers/collage/',
  comic: '/assets/stickers/comic/',
  newspaper: '/assets/stickers/newspaper/',
  minimal: '/assets/stickers/minimal/',
};

// 真实贴纸元数据模板（为中期PNG素材做准备）
const REAL_STICKER_METADATA_TEMPLATE = {
  id: '',
  family: '',           // handnote/collage/comic/newspaper/minimal
  type: '',             // stamp/tape/sticker/emoji/doodle/frame
  file: '',             // 文件名（如 'red_stamp_01.webp'）
  preferredSlots: [],   // ['topRight', 'bottomRight', ...]
  maxSizeRatio: 0.12,   // 最大占画布比例
  displaySize: 'medium', // short/medium/long
};

function getStickerAssetPath(realFamily, stickerId) {
  return `${REAL_STICKER_ASSET_PATHS[realFamily]}${stickerId}.webp`;
}
```

### 1.4 导出

```javascript
window.REAL_STYLE_STICKER_POOL = REAL_STYLE_STICKER_POOL;
window.filterStickersByFamily = filterStickersByFamily;
window.getStickerCountForFamily = getStickerCountForFamily;
window.pickStickersForCard = pickStickersForCard;
window.REAL_STICKER_ASSET_PATHS = REAL_STICKER_ASSET_PATHS;
window.getStickerAssetPath = getStickerAssetPath;
```

## 步骤2：接入渲染管线

### 2.1 引入新文件

在 index.html 的 <script type="module"> 中，添加：
  import './lib/real-style-stickers.js';

### 2.2 修改 drawRealStyleCover

在 lib/real-style-renderer.js 的 drawRealStyleCover 函数中，在装饰计划生成后添加贴纸逻辑：

```javascript
// 在 buildDecorationPlan 之后添加：
// 贴纸选择
const stickerCount = window.getStickerCountForFamily(realFamily, options.seed);
const availableStickers = window.FAMILY_STICKER_POOL ?
  (window.FAMILY_STICKER_POOL[family] || []) : [];

const selectedStickers = window.pickStickersForCard(
  realFamily, availableStickers, stickerCount, options.seed + 1
);

// 将贴纸加入装饰计划
for (const sticker of selectedStickers) {
  decorationPlan.stickers.push({
    id: sticker.id || sticker,
    type: 'sticker',
    slot: decorationPlan.cornerDecorations.length > 0 ?
      'topRight' : 'bottomLeft',
    renderLayer: 'above',
    drawInstruction: {
      type: 'sticker',
      params: {
        stickerId: sticker.id || sticker,
        family: realFamily,
      }
    }
  });
}
```

### 2.3 修改 drawDecorations 支持贴纸类型

在 lib/real-style-decorations.js 的 drawDecorations 函数中，添加 sticker 类型处理：

```javascript
// 在 drawDecorations 函数中，添加 case 'sticker':
case 'sticker':
  // 调用现有贴纸系统
  if (d.drawInstruction.params && d.drawInstruction.params.stickerId) {
    const stickerId = d.drawInstruction.params.stickerId;
    // 尝试使用现有 drawStickerImage 或 Canvas fallback
    if (typeof drawStickerImage === 'function') {
      drawStickerImage(ctx, stickerId, d.x, d.y, d.w, d.h);
    } else if (typeof window.drawStickerById === 'function') {
      window.drawStickerById(ctx, stickerId, d.x, d.y, d.w, d.h);
    }
    // 如果都没有，静默跳过
  }
  break;
```

## 步骤3：验证

// 测试贴纸筛选
const testStickers = [
  { id: 'washi-tape-1', categories: ['stationery'] },
  { id: 'red-stamp', categories: ['stamp'] },
  { id: 'emoji-fire', categories: ['emoji', '3d'] },
  { id: 'hand-arrow', categories: ['doodle'] },
];
const filtered = filterStickersByFamily('handnote', testStickers);
console.log('handnote贴纸:', filtered.map(s => s.id));
// 预期包含 stationery 和 doodle 类贴纸，不含 stamp 类

const filteredMin = filterStickersByFamily('minimal', testStickers);
console.log('minimal贴纸:', filteredMin.length); // 预期 0

// 测试贴纸选择
const picked = pickStickersForCard('comic', testStickers, 3, 42);
console.log('comic选取贴纸:', picked);
// 预期不超过3个，且满足 maxEmoji ≤ 4

// 端到端测试：
// 生成一张 handnote 风格封面，检查贴纸是否为胶带/手绘类
// 生成一张 minimal 风格封面，检查不应有任何贴纸
// 生成一张 comic 风格封面，检查贴纸以3D/emoji为主

## 重要约束
- 不删除现有的 STICKER_REGISTRY 或 FAMILY_STICKER_POOL
- 贴纸加载失败时静默降级（不显示破损图标）
- minimal 风格不使用任何贴纸
- 贴纸不能遮挡主标题（titleSafeRect 检查）
- 贴纸总数不得超过对应风格族的数量上限

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📦 批次十：最终集成与全面打磨

> **前置**：批次一至九完成
> **目标**：全面检查、修复边界情况、性能优化、确保系统完整可运行

---

### AI 提示词（批次十 - 最终）

```
你是一个全栈工程师。项目路径：/Users/andy/Documents/Andy AI/cover-maker/

批次一至九已完成，所有真实风格族重构模块已就位。
本批次是最终集成打磨，确保系统完整、稳定、高性能。

请你严格按照以下步骤执行：

## 步骤1：全局错误处理

### 1.1 在 drawRealStyleCover 中添加完整错误处理

确保 lib/real-style-renderer.js 中的 drawRealStyleCover 函数：

```javascript
async function drawRealStyleCover(ctx, rawText, palette, options, family) {
  ctx.save();
  try {
    // === 现有渲染逻辑 ===

    // 每个步骤包裹 try-catch，单步失败不影响整体
    let content, layout, centerShape, typography, decorationPlan;

    // Step 1: 解析真实风格
    const map = window.REAL_STYLE_MAP[family] || window.REAL_STYLE_MAP.A;
    const realFamily = map.realFamily;

    // Step 2: 解析文案
    try {
      content = window.parseCoverContent(rawText || '');
    } catch (e) {
      console.warn('文案解析失败:', e);
      content = { mainTitle: rawText || '', subTitle: '', keyword: '', badgeText: '', footerText: '', rawText: rawText || '' };
    }

    // ...后续步骤同样包裹 try-catch，失败时使用兜底值...

  } catch (err) {
    console.error('真实风格渲染完全失败:', err);
    // 红色错误占位
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1242, 1656);
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 48px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText('渲染错误，请重试', 621, 800);
    ctx.textAlign = 'start';
    throw err; // 重新抛出，让外层回退到 legacy
  } finally {
    ctx.restore();
  }
}
```

### 1.2 确保 legacy 回退正常工作

在 index.html 的 drawTemplateEnhancedCover 函数中确认：

```javascript
async function drawTemplateEnhancedCover(ctx, text, palette, options, family) {
  // 真实风格模式
  if (STATE.realStyleMode && window.drawRealStyleCover) {
    try {
      return await window.drawRealStyleCover(ctx, text, palette, options, family);
    } catch (err) {
      console.warn('真实风格渲染失败，回退到旧版:', err.message);
      // 继续执行旧版渲染
    }
  }

  // 旧版渲染逻辑
  return drawLockedTemplateCover(ctx, text, palette, options, family);
}
```

## 步骤2：性能优化

### 2.1 Canvas 内存管理

在 renderCandidateBatch 函数中添加内存优化：

```javascript
// 将不可见的 canvas 转为缩略图以释放内存
function offloadCanvasToThumbnail(canvas, maxWidth = 280) {
  if (canvas.dataset.offloaded === 'true') return;

  try {
    const thumbCanvas = document.createElement('canvas');
    const scale = maxWidth / canvas.width;
    thumbCanvas.width = maxWidth;
    thumbCanvas.height = Math.round(canvas.height * scale);

    const thumbCtx = thumbCanvas.getContext('2d');
    thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);

    // 替换 src（canvas 保留，但可被 GC）
    canvas.parentNode.insertBefore(thumbCanvas, canvas);
    canvas.style.display = 'none';
    canvas.dataset.offloaded = 'true';
    canvas.dataset.thumbCanvasId = thumbCanvas.id || '';

    // 存储原始 canvas 引用以便恢复
    thumbCanvas.dataset.originalCanvasHidden = 'true';
    thumbCanvas._originalCanvas = canvas;
  } catch (e) {
    console.warn('Canvas offload failed:', e);
  }
}

function restoreCanvasFromThumbnail(thumbCanvas) {
  if (!thumbCanvas._originalCanvas) return;
  const original = thumbCanvas._originalCanvas;
  original.style.display = '';
  original.dataset.offloaded = 'false';
  thumbCanvas.parentNode.insertBefore(original, thumbCanvas);
  thumbCanvas.remove();
}
```

### 2.2 使用 requestIdleCallback 优化渲染调度

```javascript
function scheduleRender(task, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const id = (window.requestIdleCallback || window.setTimeout)(() => {
      try {
        const result = task();
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }, { timeout });
  });
}
```

### 2.3 批量渲染限流

```javascript
const RENDER_THROTTLE = {
  activeRenders: 0,
  maxConcurrent: 3,
  queue: [],

  async enqueue(task) {
    while (this.activeRenders >= this.maxConcurrent) {
      await new Promise(r => setTimeout(r, 50));
    }
    this.activeRenders++;
    try {
      return await task();
    } finally {
      this.activeRenders--;
    }
  }
};
```

## 步骤3：边界情况处理

### 3.1 空文本处理

在 parseCoverContent 中确保：
- 空字符串返回 { mainTitle: '', subTitle: '', keyword: '', badgeText: '', footerText: '', rawText: '' }
- 只有空格的文本同上
- 纯标点符号同上
- mainTitle 永远不为 null/undefined（至少为空字符串）

### 3.2 极短文本（1-2字）

- 1-2字的文本，mainTitle = 原文，使用 huge 排版（字号 280-320px）
- subTitle 和 keyword 为空

### 3.3 极长文本（50字以上）

- 取前 6-10 字作 mainTitle
- 中间 15-20 字作 subTitle
- 其余截断
- 如果文本包含换行或多段分隔符，优先使用显式结构

### 3.4 特殊字符处理

- 包含 emoji：保留 emoji，但在计算字号宽度时使用 measureText
- 包含英文：中英混排时，英文单词不拆分
- 包含 URL：忽略不显示

### 3.5 降级字体

如果用户选择的字体加载失败：
```javascript
const safeFontFamily = (fontKey) => {
  const font = FONT_MAP[fontKey];
  if (!font) return '"Noto Sans SC", sans-serif';
  return `${font.family}, "Noto Sans SC", sans-serif`;
};
```

## 步骤4：移动端兼容性

### 4.1 检查触摸滚动

确保横向滚动区域在 iOS Safari 上可正常滑动：
- 确认 `-webkit-overflow-scrolling: touch;` 已添加（批次七已添加）
- 确认 scroll-snap 在移动端不冲突

### 4.2 移动端按钮尺寸

在小屏设备上（< 768px），按钮最小触摸区域 44×44px：
```css
@media (max-width: 768px) {
  .batch-actions button {
    min-height: 44px;
    min-width: 44px;
    padding: 8px 14px;
    font-size: 14px;
  }
}
```

### 4.3 Canvas 缩放

确保 Canvas 在移动端正确缩放：
```css
.candidate-card .cover-canvas {
  max-width: 100%;
  height: auto;
  aspect-ratio: 1242 / 1656;
}
```

## 步骤5：兼容性检查清单

遍历检查以下功能，确保全部正常：

1. [ ] 单个封面生成：输入文字，点击风格 A-T，每个都能正常生成
2. [ ] 5个变体：每个风格点击"换一换"，5个变体视觉不同
3. [ ] 批量生成：输入多条文案（888分隔），生成30张候选
4. [ ] 横向滚动：候选区可左右滑动
5. [ ] 下载选中：勾选候选图，下载所选
6. [ ] 下载本组全部：点击下载本组全部30张
7. [ ] 复制图片：点击复制按钮
8. [ ] 字体切换：切换8种字体，生成封面字体相应改变
9. [ ] 贴纸切换：如果有贴纸切换功能，正常切换
10. [ ] Legacy 回退：URL 添加 ?mode=legacy，确认使用旧版渲染
11. [ ] 错误回退：模拟渲染错误（如传入无效 family），确认回退到 legacy
12. [ ] 移动端浏览：Chrome DevTools 模拟移动端，检查布局和滚动
13. [ ] VIP 限制：免费用户下载限制仍生效
14. [ ] 视频制作器联动：选中卡片发送到视频制作器

## 步骤6：控制台全局诊断函数

在 index.html 末尾添加调试工具：

```javascript
// === 真实风格族诊断工具 ===
window.diagnose = {
  // 检查所有模块是否正确加载
  checkModules() {
    const modules = [
      'REAL_STYLE_MAP', 'REAL_STYLE_CONFIGS', 'REAL_SUBSTYLE_CONFIGS',
      'REAL_STYLE_LAYOUTS', 'CENTER_SHAPE_LIBRARY',
      'parseCoverContent', 'computeTypographyPlan',
      'selectLayout', 'selectCenterShape',
      'buildDecorationPlan', 'allocateDecorationSlots',
      'drawRealStyleCover', 'drawRealBackground',
      'drawStructuredTypography', 'drawTextWithSpacing',
      'filterStickersByFamily', 'pickStickersForCard',
      'getTextSeed', 'createDeduplicationContext',
      'FAMILY_RANDOMIZATION_BOUNDS',
    ];
    const results = {};
    modules.forEach(name => {
      results[name] = {
        loaded: typeof window[name] !== 'undefined',
        type: typeof window[name]
      };
    });
    console.table(results);
    return results;
  },

  // 测试所有风格族的渲染
  async testAllFamilies() {
    const results = {};
    for (const family of 'ABCDEFGHIJKLMNOPQRST') {
      const canvas = document.createElement('canvas');
      canvas.width = 1242;
      canvas.height = 1656;
      const ctx = canvas.getContext('2d');
      const start = performance.now();
      try {
        await window.drawRealStyleCover(ctx, '测试标题文字',
          { bg: ['#F5EFD8'], text: '#2D2A26', accent: '#5D4E37', second: '#FFEC47' },
          { vi: 0, seed: 42, font: 'black' }, family);
        results[family] = { success: true, time: Math.round(performance.now() - start) + 'ms' };
      } catch (e) {
        results[family] = { success: false, error: e.message };
      }
    }
    console.table(results);
    return results;
  },

  // 获取统计信息
  stats() {
    const centerShapes = {};
    Object.keys(CENTER_SHAPE_LIBRARY).forEach(f => {
      centerShapes[f] = CENTER_SHAPE_LIBRARY[f].length;
    });
    console.log('中央图形统计:', centerShapes);
    console.log('Layout 统计:', Object.keys(REAL_STYLE_LAYOUTS).reduce((acc, f) => {
      acc[f] = REAL_STYLE_LAYOUTS[f].length;
      return acc;
    }, {}));
    console.log('真实风格模式:', STATE.realStyleMode ? '开启' : '关闭');
  }
};

console.log('🔧 真实风格族诊断工具已就绪，使用 window.diagnose.checkModules() 检查模块加载状态');
console.log('使用 window.diagnose.testAllFamilies() 测试所有风格渲染');
console.log('使用 window.diagnose.stats() 查看统计信息');
```

## 步骤7：最终验证

在浏览器中进行完整的端到端测试：

1. 打开页面，确认无 JS 错误
2. 在控制台执行 `window.diagnose.checkModules()`，确认所有模块加载成功
3. 执行 `window.diagnose.testAllFamilies()`，确认20个风格都能渲染
4. 执行 `window.diagnose.stats()`，确认中央图形≥40种、Layout=25个
5. 手动测试：
   - 单封面生成（A-T各风格）
   - 换一换
   - 字体切换
   - 批量生成（3条文案×30张=90张候选）
   - 横向滚动
   - 下载
   - Legacy 回退（?mode=legacy）
6. Chrome DevTools → Lighthouse 检查性能分数

## 重要约束

这是最终批次，必须确保：
- 系统完整可运行，没有任何 JS 错误
- 20个风格入口 A-T 全部正常工作
- Legacy 回退正常
- 批量生成30张候选正常
- 横向滚动正常
- 下载功能正常
- 移动端正常
- 任何渲染错误都不会导致页面白屏（有降级方案）

执行完这些提示词后，系统要完整可运行并且不会有任何bug。
```

---

## 📋 批次总览

| 批次 | 模块 | 新建文件 | 核心交付 |
|------|------|----------|----------|
| 一 | 数据层 | `lib/real-style-map.js` | REAL_STYLE_MAP + 20子风格配置 |
| 二 | 文案解析 | `lib/real-style-typography.js` | parseCoverContent + 排版计算 |
| 三 | 中央图形 | `lib/real-style-center-shapes.js` | 40+种中央承载图形 |
| 四 | Layout | `lib/real-style-layouts.js` | 25个Layout（5族×5个） |
| 五 | 装饰系统 | `lib/real-style-decorations.js` | 装饰包 + 位置分配 + 互斥 |
| 六 | 渲染入口 | `lib/real-style-renderer.js` | drawRealStyleCover 主函数 |
| 七 | 批量候选 | 修改 `index.html` | 30张候选 + 横向滚动UI |
| 八 | 随机去重 | `lib/real-style-random.js` | 种子哈希 + 结构签名 + 去重 |
| 九 | 贴纸升级 | `lib/real-style-stickers.js` | 风格族贴纸白名单 + 筛选 |
| 十 | 集成打磨 | 修改多个文件 | 错误处理 + 性能 + 兼容性 |

---

## ⚠️ 使用注意事项

1. **必须按批次顺序执行**，不可跳过或乱序
2. **每批次执行完毕后**，在浏览器中验证系统可运行、无报错
3. **遇到错误先修复再继续**，不要带着 bug 进入下一批次
4. **每个 AI 提示词末尾已包含**："执行完这些提示词后，系统要完整可运行并且不会有任何bug"
5. **新建文件不覆盖已有文件**：如需迭代，在文件名后加版本号（如 `real-style-map-v2.js`）
6. **修改 index.html 前先备份**：`cp index.html index.html.bak.$(date +%Y%m%d_%H%M%S)`
7. **lib/ 下已有文件不修改**：colors.js, stickers.js, stickers-canvas.js, textures.js, shadows.js, gradients.js, color-ai.js, features.js 保持不动
