# 小红书封面生成器 · 多批次 AI 构建提示词 v2.0

> **用途**: 用户按顺序逐条复制每条提示词，喂给 AI 编程助手（Claude Code / Cursor / Copilot）
> **目标**: 在现有 v4.0 DESIGN_LOCK 模板体系基础上，将 Canvas 几何手绘封面升级为接近稿定设计专业模板的视觉质量
> **版本**: v2.0 (2026-07-06)
> **配套文件**: `DEV_PLAN_v5.0.md`、`DESIGN_LOCK.md`、`STYLE_GUIDE_v3.0.md`、`index.html`(~5945 行，待增强)
> **执行原则**: 严格按 9 个批次顺序执行，每条提示词末尾固定结束语是质量验收闸门
> **硬性约束**: 纯前端渲染、DESIGN_LOCK.md 规则不可绕过、不引入外部 API、移动端兼容

---

## 📋 总体执行规则

1. **顺序执行**: 必须按 批次 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 顺序执行，不可跳批
2. **每条提示词末尾固定结束语**:
   ```
   执行完这些提示词后，系统要完整可运行并且不会有任何bug
   ```
   AI 输出完成后，必须自己验证满足此条；不满足则继续修复直到满足
3. **每批次结束运行验证**: 用浏览器打开 `index.html`，输入文案生成封面，确认无报错
4. **任何批次失败**: 先修复当前批次再继续，不要带着 bug 进入下一批
5. **禁止覆盖已有文件**: 如果目标文件已存在，检查内容后增量修改或改名版本号

---

## 🔧 批次 1：新建 lib/textures.js — 20 个背景纹理函数

### 背景
当前系统背景只有纯色、横线、放射线三种。需要 20 个纹理函数来模拟稿定设计模板中的纸张纹理、噪点、晕染效果，让封面看起来有"纸质质感"而非"纯色屏幕"。

### 具体提示词

```
你是一个资深前端工程师，精通 Canvas 2D API。现在要在现有封面生成器项目中新建一个纹理函数库。

## 项目路径
/Users/andy/Documents/Andy AI/cover-maker/

## 任务
新建文件 lib/textures.js，导出 20 个 Canvas 2D 纹理绘制函数。每个函数接收 (ctx, W, H, options) 参数，在已存在背景色的 Canvas 上叠加纹理效果。

## 20 个函数清单

### 纸质纹理 (8 个)
1. drawNotebookGrid(ctx, W, H, opts) — 方格纸。opts: {spacing:24, color:'rgba(0,0,0,0.06)', lineWidth:1}
2. drawNotebookLined(ctx, W, H, opts) — 横线纸。opts: {spacing:32, color:'rgba(0,0,0,0.08)', topMargin:80}
3. drawDotGrid(ctx, W, H, opts) — 点阵纸。opts: {spacing:20, color:'rgba(0,0,0,0.12)', radius:1.2}
4. drawKraftPaper(ctx, W, H, opts) — 牛皮纸纹理。用 1500+ 随机短纤维线段 + 微噪点模拟。opts: {density:1.0, color:'rgba(139,111,71,0.15)'}
5. drawRicePaper(ctx, W, H, opts) — 宣纸纹理。用不规则纤维曲线 + 轻微水渍椭圆。opts: {fiberCount:200, stainCount:3}
6. drawWashiPaper(ctx, W, H, opts) — 和纸纹理。细纤维网格 + 半透明薄层。opts: {opacity:0.12}
7. drawCardboardTexture(ctx, W, H, opts) — 纸板纹理。粗水平纤维条纹 + 微小凹陷。opts: {roughness:0.7}
8. drawVintagePaper(ctx, W, H, opts) — 旧纸张。边缘暗化(径向渐变) + 随机污渍圆点 + 泛黄叠加层。opts: {age:0.5}

### 特效纹理 (7 个)
9. drawFilmGrain(ctx, W, H, opts) — 胶片颗粒。800-1200 个随机位置微矩形散点。opts: {density:1.0, color:'rgba(0,0,0,0.06)', size:2}
10. drawHalftoneDots(ctx, W, H, opts) — 半色调网点。已有 lib/features.js 中的版本，这里增强：支持 {diameter:3, spacing:10, color:'#000000', opacity:0.3, shape:'circle'|'square'}
11. drawWatercolorWash(ctx, W, H, opts) — 水彩晕染。3-5 个随机位置径向渐变圆叠加。opts: {count:4, colors:['rgba(255,200,150,0.08)',...]}
12. drawInkSplatter(ctx, W, H, opts) — 墨点飞溅。20-40 个随机大小圆 + 椭圆集群。opts: {count:30, color:'rgba(0,0,0,0.08)', spread:0.5}
13. drawNoiseTexture(ctx, W, H, opts) — 噪点纹理。全画布像素级随机 alpha。用 ImageData 逐像素操作性能太差，改用分块随机填充微矩形。opts: {density:0.5, opacity:0.04}
14. drawScanlines(ctx, W, H, opts) — 扫描线。水平条纹模拟 CRT。opts: {spacing:4, color:'rgba(0,0,0,0.06)', gapColor:'rgba(255,255,255,0.02)'}
15. drawCrosshatch(ctx, W, H, opts) — 交叉排线。两组 45°/-45° 斜线叠加，素描阴影感。opts: {spacing:8, color:'rgba(0,0,0,0.06)', lineWidth:1}

### 几何纹理 (5 个)
16. drawPolkaDots(ctx, W, H, opts) — 波尔卡圆点。均匀网格圆点，可选大小渐变。opts: {spacing:30, radius:8, color:'rgba(0,0,0,0.1)', gradientSize:false}
17. drawZigzagStripes(ctx, W, H, opts) — Z 字条纹。锯齿形水平条纹。opts: {amplitude:15, frequency:40, color:'rgba(0,0,0,0.08)', lineWidth:2}
18. drawCheckerboard(ctx, W, H, opts) — 棋盘格。方形交替填充。opts: {cellSize:40, color1:'rgba(0,0,0,0.06)', color2:'rgba(255,255,255,0.04)', rotation:0}
19. drawConcentricRings(ctx, W, H, opts) — 同心圆环。从画布中心向外扩散的圆环。opts: {spacing:30, color:'rgba(0,0,0,0.06)', lineWidth:2, centerX:0.5, centerY:0.5}
20. drawDiagonalStripes(ctx, W, H, opts) — 斜条纹。指定角度平行线。opts: {angle:45, spacing:20, color:'rgba(0,0,0,0.06)', lineWidth:2}

## 实现要求
- 所有函数签名: function drawXxx(ctx, W, H, opts = {})
- 每个函数内部用 ctx.save() / ctx.restore() 包裹，避免污染全局状态
- opts 参数全部可选，提供合理默认值
- 纹理叠加在已有背景之上（不覆盖前景文字和贴纸）
- 性能: 每个函数执行时间 < 30ms
- 导出: export { drawNotebookGrid, drawNotebookLined, ... 全部 20 个 }
- 同时在文件底部导出 TEXTURE_NAMES 数组（20 个函数名字符串）

## 在 index.html 中的集成方式
在 index.html 现有 <script type="module"> 的 import 区域增加一行:
import { drawNotebookGrid, drawNotebookLined, drawDotGrid, drawKraftPaper, drawRicePaper, drawWashiPaper, drawCardboardTexture, drawVintagePaper, drawFilmGrain, drawHalftoneDots, drawWatercolorWash, drawInkSplatter, drawNoiseTexture, drawScanlines, drawCrosshatch, drawPolkaDots, drawZigzagStripes, drawCheckerboard, drawConcentricRings, drawDiagonalStripes } from './lib/textures.js';

然后在 drawLockedTemplateCover 函数内的 drawTemplateBackground 调用处，根据 LOCKED_TEMPLATE_STYLES[family].template 值按 DEV_PLAN_v5.0 第 2.1 节"纹理组合规则"表中列出的对应关系，在背景色填充后、面板绘制前调用对应的 1-2 个纹理函数。如果 template 没有明确规则，默认不加纹理。

## 验收标准
- 打开浏览器输入文案生成封面，不再报任何 JS 错误
- F12 console 中无 import 失败或 undefined 函数错误
- 不同风格族 (A-T) 的背景应出现对应的纹理效果
- 执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 1 验收
- 用浏览器打开 `index.html`，输入 "测试文案" 点击生成
- F12 console 无报错
- 风格族 A (手账白底) 应看到方格纸纹理
- 风格族 F (复古胶片) 应看到胶片颗粒 + 旧纸张纹理
- 风格族 C (红色事件) 应看到半色调网点

---

## 🔧 批次 2：新建 lib/shadows.js — 10 个阴影工具函数

### 背景
当前系统只使用 Canvas 原生 `shadowBlur` / `shadowOffsetX` / `shadowOffsetY` 做单层阴影。专业模板需要多层投影（纸张厚度）、彩色发光（霓虹）、内阴影（印章凹陷）、文字 3D 投影等。

### 具体提示词

```
你是一个资深前端工程师，精通 Canvas 2D API 的阴影模拟技术。现在要在封面生成器项目中新建一个阴影工具库。

## 项目路径
/Users/andy/Documents/Andy AI/cover-maker/

## 任务
新建文件 lib/shadows.js，导出 10 个阴影工具函数。由于 Canvas 2D 没有原生多层阴影和内阴影 API，所有函数需要通过多次绘制叠加来模拟。

## 10 个函数清单

1. drawSoftDropShadow(ctx, x, y, w, h, opts)
   — 软投影。绘制 3-4 个偏移矩形，每层 alpha 递减 + blur 递增
   — opts: {offsetX:4, offsetY:6, color:'#000000', alpha:0.12, blur:8}
   — 实现: 用 ctx.save/restore + shadowBlur 变化绘制多层，不绘制原始矩形

2. drawHardDropShadow(ctx, x, y, w, h, opts)
   — 硬投影。单个偏移纯色矩形（无模糊）
   — opts: {offsetX:3, offsetY:4, color:'#000000', alpha:0.15}

3. drawColoredGlow(ctx, x, y, w, h, opts)
   — 彩色外发光（霓虹效果）。3 层：外层大 blur + 中 blur + 内层小 blur，颜色逐渐由 opts.color 过渡到白色
   — opts: {color:'#00F5FF', spread:20, intensity:0.8}

4. drawInnerShadow(ctx, x, y, w, h, opts)
   — 内阴影（inset 凹陷效果）。通过在矩形内部四边绘制渐变条模拟
   — opts: {color:'#000000', blur:6, alpha:0.3}
   — 实现: 用 clip 到矩形区域，然后在内部四边画线性渐变暗条

5. drawText3DShadow(ctx, text, x, y, opts)
   — 文字 3D 投影。将同一文字用偏移颜色绘制 N 层（由深到浅），最后在上面用主色绘制文字本体
   — opts: {depth:6, color:'#000000', alpha:0.2, direction:'bottom-right', fontSize:100, fontFamily:'...', fontWeight:900}
   — direction: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

6. drawLongShadow(ctx, x, y, w, h, opts)
   — 长投影（扁平设计风格）。从矩形边缘向指定角度延伸的长三角形阴影
   — opts: {angle:45, length:300, color:'#000000', alpha:0.15}

7. drawLayeredShadow(ctx, x, y, w, h, opts)
   — 层叠阴影（2-4 层不同偏移量 + 不同 blur）。模拟纸张叠加厚度
   — opts: {layers:[{offsetX:2,offsetY:2,blur:4,alpha:0.08},{offsetX:6,offsetY:8,blur:12,alpha:0.06},{offsetX:12,offsetY:16,blur:24,alpha:0.04}]}

8. drawFloatingShadow(ctx, x, y, w, h, opts)
   — 悬浮阴影（中间暗边缘浅）。用 3 个同心圆角矩形：中心 alpha 最高，向外递减
   — opts: {elevation:20, color:'#000000', alpha:0.15}

9. drawStickerShadow(ctx, x, y, w, h, opts)
   — 贴纸阴影。微偏移 + 小 blur + 稍微不规则的矩形边缘（4 个角偏移量微不同）
   — opts: {color:'#000000', alpha:0.12, blur:4}

10. drawAmbientOcclusion(ctx, x, y, radius, opts)
    — 环境光遮蔽。在指定点周围绘制径向渐变暗区（贴纸与背景交界处）
    — opts: {color:'#000000', alpha:0.08, radius:80}

## 实现要求
- 所有函数用 ctx.save() / ctx.restore() 包裹
- 不修改传入 ctx 的全局 compositing 设置（如 globalCompositeOperation）
- 函数兼容: 支持圆角矩形（额外 opts.r 参数表示圆角半径，默认 0）——针对需要矩形参数的函数
- 默认参数合理，不传 opts 也能正常工作
- 导出全部 10 个函数 + SHADOW_NAMES 数组

## 在 index.html 中的集成
- 在 <script type="module"> import 区域增加 10 个函数的 import
- 在 drawLockedTemplateCover 中的 drawTemplatePanel 调用后、drawTemplateStickerSlot 调用前：
  * 白卡面板 (tpl.id === 'card') 调用 drawLayeredShadow
  * 气泡面板 (tpl.id === 'bubble') 调用 drawSoftDropShadow + drawStickerShadow
  * 撕纸面板 (tpl.id === 'paper') 调用 drawHardDropShadow
  * 深色底风格 (style.template === 'event' || 'darkPop') 文字调用 drawColoredGlow
  * drawTemplateStickerSlot 内的贴纸绘制前调用 drawStickerShadow + drawAmbientOcclusion
- 传入的参数从现有 style 和 tpl 变量中获取

## 验收标准
- 打开浏览器生成封面，console 无报错
- 白卡面板有明显多层投影（纸张厚度感）
- 气泡面板有软投影
- 深色底风格的文字有彩色发光
- 执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 2 验收
- 生成封面，F12 console 无错误
- 目视检查：白卡、气泡、撕纸面板有明显阴影层次

---

## 🔧 批次 3：新建 lib/gradients.js — 12 个预设渐变生成器

### 背景
当前系统只使用简单的 ctx.createLinearGradient 做基础渐变。需要 12 个专业的预设渐变生成器来模拟日落、极光、金属、镀铬、玻璃等复杂渐变效果。

### 具体提示词

```
你是一个资深前端工程师，精通 Canvas 2D 渐变 API。现在要在封面生成器项目中新建一个渐变工具库。

## 项目路径
/Users/andy/Documents/Andy AI/cover-maker/

## 任务
新建文件 lib/gradients.js，导出 12 个预设渐变生成器函数。每个函数创建并返回一个 CanvasGradient 对象，调用方可直接 ctx.fillStyle = 返回值 后 fillRect。

## 12 个函数清单

1. createSunsetGradient(ctx, W, H)
   — 日落渐变。从上到下：深橙→粉色→紫色
   — 色标: 0% '#FF6B35', 40% '#FF6B9D', 70% '#9B5DE5', 100% '#1A0A2E'
   — 类型: LinearGradient (vertical)

2. createAuroraGradient(ctx, W, H, seed)
   — 极光渐变。对角线渐变 + 中间色带弯曲（用多个色标模拟流动感）
   — 色标: 0% '#88E0EF', 30% '#5CD8A8', 50% '#B967FF', 70% '#FFB7E5', 100% '#3A86FF'
   — seed 参数让色标位置产生微偏移（±5%），模拟每次生成不同的极光
   — 类型: LinearGradient (diagonal)

3. createNeonGlowGradient(ctx, W, H)
   — 霓虹发光渐变。暗底上方一个水平亮带
   — 色标: 0% '#0A0A0A', 40% '#1A0033', 55% '#FF006E'(亮), 60% '#00F5FF'(亮), 65% '#1A0033', 100% '#0A0A0A'
   — 类型: LinearGradient (vertical)

4. createMetallicGradient(ctx, W, H, metalType)
   — 金属渐变。多色条模拟金属反光
   — metalType: 'gold' → #D4AF37/#FFF8DC/#D4AF37/#8B7536/#D4AF37
   — metalType: 'silver' → #C0C0C0/#FFFFFF/#C0C0C0/#888888/#C0C0C0
   — metalType: 'copper' → #B87333/#FFC89A/#B87333/#8B4513/#B87333
   — 类型: LinearGradient (horizontal)

5. createChromeGradient(ctx, W, H)
   — 镀铬渐变。高对比度黑白交替条 + 彩色 tint
   — 色标: 0% '#888888', 20% '#FFFFFF', 40% '#555555', 45% '#AAAAAA', 60% '#FFFFFF', 80% '#666666', 100% '#CCCCCC'
   — 类型: LinearGradient (diagonal)

6. createGlassGradient(ctx, W, H)
   — 玻璃渐变。半透明白色渐变 + 顶部高光条
   — 色标: 0% 'rgba(255,255,255,0.5)', 15% 'rgba(255,255,255,0.05)', 85% 'rgba(255,255,255,0.02)', 100% 'rgba(255,255,255,0.15)'
   — 类型: LinearGradient (vertical)

7. createPastelWash(ctx, W, H, seed)
   — 粉彩晕染。3 个 RadialGradient 叠加，模拟水彩混合
   — 三个色块位置由 seed 决定（分散在画面不同位置）
   — 返回数组 [grad1, grad2, grad3]，每个是 radialGradient
   — 调用方需要分别用 ctx.fillRect 绘制三个渐变

8. createDuotoneGradient(ctx, W, H, preset)
   — 双色调。经典摄影双色调效果
   — preset: 'blue-pink' → shadows#012FA7, highlights#F78DE9
   — preset: 'red-blue' → shadows#ED0108, highlights#2677DE
   — preset: 'green-cream' → shadows#1B4D2E, highlights#FFF8DC
   — 类型: LinearGradient (vertical)

9. createRadialSphere(ctx, cx, cy, radius, color)
   — 径向球体。3D 球面高光效果
   — 色标: 0% '#FFFFFF'(高光点), 25% color变亮, 70% color, 100% color变暗
   — 高光点偏左上 (cx-radius*0.3, cy-radius*0.3)
   — 类型: RadialGradient

10. createMeshGradient(ctx, W, H, seed)
    — 网格渐变。4 个 RadialGradient 分布在四个象限，叠加产生网格混合效果
    — 每个径向渐变颜色随机从调色板 ['#FF6B9D','#4ECDC4','#FFE066','#9B5DE5','#FF8C42'] 选
    — 返回数组 [gradTL, gradTR, gradBL, gradBR]
    — 类型: 4 × RadialGradient

11. createVignetteGradient(ctx, W, H, intensity)
    — 暗角渐变。中心透明 → 边缘暗化
    — 色标: 0% 'rgba(0,0,0,0)', 60% 'rgba(0,0,0,0)', 100% `rgba(0,0,0,${intensity})`
    — intensity 默认 0.45
    — 类型: RadialGradient (center to edge)

12. createLightLeak(ctx, W, H, seed)
    — 漏光效果。画面边缘的彩色光晕
    — 1-2 个 RadialGradient 分布在边缘位置，颜色为橙/红/粉
    — 色标: 0% 'rgba(255,150,50,0.25)', 100% 'rgba(255,150,50,0)'
    — 类型: 1-2 × RadialGradient

## 实现要求
- 所有函数接收 ctx 作为第一个参数（用于 ctx.createLinearGradient / ctx.createRadialGradient）
- 返回 CanvasGradient 对象或 CanvasGradient[] 数组
- 不直接绘制（不调用 ctx.fillRect），只返回渐变对象
- 导出全部 12 个函数 + GRADIENT_NAMES 数组

## 在 index.html 中的集成
- 在 <script type="module"> import 区域增加 import
- 在 drawTemplateBackground 函数中，根据 style.template 值：
  * 'darkPop' (K/N) → 用 createNeonGlowGradient 填充背景
  * 'poster' (F/O/R) → 用 createVignetteGradient 叠加
  * 'dopamine' (G/T) → 用 createMeshGradient 叠加
  * 'soft' (L/M/Q) → 用 createPastelWash 叠加
  * 'event' (C) → 用 createDuotoneGradient 叠加（如果 variant 匹配）
  * 渐变叠加使用 globalAlpha 控制强度 (0.08-0.25)
- 渐变层放在背景色填充之后、纹理之前

## 验收标准
- 打开浏览器生成封面，console 无报错
- 风格族 K/N 有霓虹渐变背景
- 风格族 G 有多色网格渐变
- 执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 3 验收
- 生成封面，console 无错误
- 暗色风格族有明显渐变层次（非纯黑）
- 多巴胺风格有明显的多彩渐变混合

---

## 🔧 批次 4：新增 30 个高精度 Canvas 贴纸 + 多槽位随机系统

### 背景
当前只有 9 个简陋的 Canvas 几何贴纸，每张卡片只放 1 个。需要 30 个更高精度的贴纸 + 随机 1-3 个槽位的布局系统。

### 具体提示词

```
你是一个资深前端工程师，精通 Canvas 2D 复杂图形绘制。现在要大幅升级封面生成器的贴纸系统。

## 项目路径
/Users/andy/Documents/Andy AI/cover-maker/

## 重要前提
index.html 中已有 9 个贴纸绘制函数 (drawThumb3DSticker, drawEmojiAngry3DSticker, drawComicFistSticker, drawBigEyesSticker, drawPaintRollerRealSticker, drawPlumpCatSticker, drawCatPhotoCardSticker, drawDogFrameSticker, drawPlushMegaphoneSticker) 和 drawTemplateSticker 分发函数。请保留这些已有函数不动。

## 任务 A：新建 src/stickers-canvas.js — 30 个新 Canvas 贴纸

在项目根目录新建 src/ 目录（如果不存在），创建 src/stickers-canvas.js。每个贴纸是一个导出函数，签名统一为:
function drawXxxSticker(ctx, x, y, size, accentColor)

其中 (x, y) 是贴纸中心点，size 是贴纸基准尺寸。所有贴纸在 100×100 逻辑坐标系内绘制，用 ctx.scale(size/100, size/100) 归一化。

### 第一组：3D 拟物类 (10 个)

1. drawThumb3Dv2Sticker — 增强版 3D 拇指。基于现有 drawThumb3DSticker 改良：增加指甲高光、指节纹路、渐变层次从 2 层变为 5 层，底部投影

2. drawMegaphone3DSticker — 3D 喇叭。锥形主体（梯形）+ 手柄（矩形）+ 口部椭圆。镀铬渐变（银色 + 白色高光 + 浅蓝 tint）。带一个装饰星形在喇叭口

3. drawStar3DSticker — 3D 立体星。五角星形状，每个角分配不同深浅的金色渐变，中心凸起高光。边缘有厚度层

4. drawHeart3DSticker — 3D 立体心。心形路径（两个弧 + 底部尖角），红色到粉色的径向渐变，左上角白色高光椭圆

5. drawFire3DSticker — 3D 火焰。3 层火焰形状叠加（外层红→中层橙→内层黄），底部有蓝色焰心。形状用贝塞尔曲线模拟火焰摇曳

6. drawDiamond3DSticker — 3D 钻石。多边形切割面：顶部六边形 + 中间四边形面 + 底部尖点。每个面不同深浅的蓝白渐变。顶面高光

7. drawCrown3DSticker — 3D 王冠。5 个尖角 + 弧形底座 + 中心宝石（红色椭圆）。金色金属渐变 + 宝石高光

8. drawTrophy3DSticker — 3D 奖杯。杯体（U 形）+ 两侧把手（半圆）+ 底座（梯形）。金色渐变 + 高光条

9. drawBalloon3DSticker — 3D 气球。椭圆球体 + 底部三角形绳结 + 曲线绳子。主体径向渐变（高光左上），可选 red/blue/green

10. drawGiftbox3DSticker — 3D 礼物盒。立方体（3 个面不同深浅）+ 十字丝带 + 蝴蝶结（两个圆 + 中心结）。顶面高光

### 第二组：文具便签类 (8 个)

11. drawWashiTapeSticker — 和纸胶带。水平矩形，半透明底色 + 细条纹图案。略微旋转。边缘微锯齿。color 参数控制底色

12. drawStickyNoteSticker — 便利贴。正方形带微翘角（右下角略微卷起，用曲线表示）。浅黄色底 + 轻阴影

13. drawPaperClipSticker — 回形针。金属银色圆角矩形线框（双层同心，末端圆头）。用 ctx.lineTo 描出回形针路径

14. drawPushpinSticker — 图钉。圆形塑料头（径向渐变）+ 金属针尖（三角形）。红色/蓝色可选

15. drawRealisticStampSticker — 红印章。圆形，红色底 + 白色虚线内边框 + 内部白色文字（用 ctx.fillText 写 1-2 字）。整体旋转 -10°。边缘用 12 个微扰动点模拟不规则

16. drawPolaroidFrameSticker — 拍立得相框。白色矩形 + 内部灰色矩形（照片区）+ 底部宽白边。轻阴影

17. drawIndexTabSticker — 索引标签贴。半圆 + 矩形的组合形状，彩色底 + 白字。贴附在边缘

18. drawBinderClipSticker — 长尾夹。黑色金属：两个三角形夹片 + 顶部弧形 + 两个银色金属丝手柄。用渐变模拟金属光泽

### 第三组：涂鸦标注类 (6 个)

19. drawHandDrawnArrowSticker — 手绘箭头。曲线箭身（二次贝塞尔）+ 三角形箭头 + 微抖动线条。color 参数控制颜色

20. drawHandDrawnUnderlineSticker — 手绘下划线。两条平行曲线（微抖动）+ 可选波浪线模式。粗笔触

21. drawHandDrawnCirclev2Sticker — 手绘圈线增强版。基于 lib/features.js 的 drawHandDrawnCircle 增强：双圈（外圈 + 内圈，不同颜色），8 段抖动

22. drawDoodleStarSticker — 涂鸦星星。不规则五角星（5 个尖角位置随机微偏移 ±8%），填充 + 粗描边

23. drawScribbleCloudSticker — 涂鸦云朵。5-7 个圆相切组成云朵轮廓，白色填充 + 浅灰描边 + 内部小字 "..."

24. drawMarkerStrikeSticker — 马克笔划掉。粗水平线（半透明彩色），笔触两端略有扩散。模拟荧光笔划掉效果

### 第四组：卡哇伊/表情类 (6 个)

25. drawCuteCatFaceSticker — 萌猫脸。大圆脸 + 三角耳(内粉色) + 大椭圆眼(内高光) + 小三角鼻 + W 形嘴 + 两侧胡须(各 3 条线)

26. drawCuteDogFaceSticker — 萌狗脸。椭圆脸 + 垂耳(两个椭圆) + 圆眼(内高光) + 椭圆鼻 + 吐舌(小椭圆)

27. drawSparkleEyesSticker — 星星眼。大圆脸 + 超大圆眼 + 星形瞳孔(用 5 角星) + 小嘴 + 红晕(粉色椭圆)

28. drawAngryFaceSticker — 生气脸。圆脸 + 倒八字眉(粗线) + 小圆眼 + 锯齿嘴 + 额头青筋符号(3 条短竖线)

29. drawShockedFaceSticker — 震惊脸。大圆脸 + 小圆眼 + 大 O 形嘴(圆形) + 汗滴(蓝色水滴形)

30. drawLoveEyesSticker — 爱心眼。圆脸 + 爱心形眼(两个心形) + 微笑弧线 + 脸红晕

## 每个贴纸的绘制规范
- 函数签名: function drawXxxSticker(ctx, x, y, size, accentColor = '#E6213D')
- 内部: ctx.save(); ctx.translate(x, y); ctx.scale(size/100, size/100); ... 绘制 ...; ctx.restore();
- 在 100×100 逻辑坐标系中绘制，中心在 (50, 50)
- 使用多层渐变、高光、阴影增强立体感
- 每个贴纸 ≥ 30 行代码

## 任务 B：升级 drawTemplateStickerSlot — 1-3 个随机槽位

在 index.html 的 drawLockedTemplateCover 函数中修改贴纸槽位逻辑：

### B1. 新增辅助函数 getStickerSlotCount(seed)
```javascript
function getStickerSlotCount(seed) {
  const r = Math.abs(seed * 7919) % 100;
  if (r < 30) return 1;      // 30% 概率 1 个
  if (r < 70) return 2;      // 40% 概率 2 个
  return 3;                   // 30% 概率 3 个
}
```

### B2. 新增 3 个槽位位置计算函数
```javascript
function getPrimarySlot(tpl, load) {
  // 右下或左下。短文案 22-26% 画布，中 18%，长 14%
  const side = Math.abs(seed * 3) % 2 ? 'right' : 'left';
  return { x: side === 'right' ? 0.78 : 0.22, y: 0.78, size: load==='short'?0.24:load==='medium'?0.18:0.13 };
}

function getCornerSlot(tpl, load, primarySide) {
  // 与 primary 对角。尺寸比 primary 小 30%
  const side = primarySide === 'right' ? 'left' : 'right';
  return { x: side === 'right' ? 0.82 : 0.18, y: 0.22, size: load==='short'?0.16:load==='medium'?0.12:0.09 };
}

function getFloatSlot(tpl, load, textBlock) {
  // 文字边缘浮动。如果主槽在下，浮动在上；反之亦然
  return { x: 0.50, y: 0.13, size: load==='short'?0.12:load==='medium'?0.10:0.07 };
}
```

### B3. 修改 drawLockedTemplateCover
将原来的单次 drawTemplateStickerSlot 调用替换为：
1. 调用 getStickerSlotCount(seed) 确定数量 N
2. 调用 getPrimarySlot 获取主槽位
3. 如果 N≥2，调用 getCornerSlot 获取对角槽位
4. 如果 N≥3，调用 getFloatSlot 获取浮动槽位
5. 对每个启用的槽位调用 drawTemplateSticker，从 LOCKED_TEMPLATE_STYLES[family].stickers 中随机选不同贴纸
6. 如果 load === 'xl'，强制只使用 1 个槽位且尺寸缩小至 40%

### B4. 扩展 LOCKED_TEMPLATE_STYLES 的 stickers 数组
将每个风格族的 stickers 数组从 5 个扩展到所有 30 个新贴纸 ID（加上原有 9 个，共 39 个）。格式为贴纸 ID 字符串数组。

### B5. 更新 drawTemplateSticker 分发函数
在 drawTemplateSticker 函数的 if/else 链中增加 30 个新贴纸的分发：
```javascript
else if (type === 'thumb3d_v2') drawThumb3Dv2Sticker(ctx, 0, 0, s * 1.02, accent);
else if (type === 'megaphone3d') drawMegaphone3DSticker(ctx, 0, 0, s * 0.98);
// ... 其余 28 个
```

### B6. 在 index.html 中 import
在 <script type="module"> 顶部增加:
import { drawThumb3Dv2Sticker, drawMegaphone3DSticker, ... 全部 30 个 } from './src/stickers-canvas.js';

## 验收标准
- 打开浏览器生成封面，console 无任何错误
- 每张卡片应有 1-3 个贴纸（不是固定 1 个）
- 短文案贴纸较大，长文案贴纸较小/较少
- 贴纸分布在画面不同位置（对角 + 浮动）
- 执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 4 验收
- 生成 100 张卡片，随机抽查 20 张
- 确认每张卡片贴纸数量在 1-3 个之间
- 确认贴纸位置各不相同
- F12 console 无错误

---

## 🔧 批次 5：文字排版增强 — 4 种排版模式 + 多字体混排

### 背景
当前所有文案用同一种字体、同一种字号居中绘制，缺乏对比。需要根据文案长度自动切换 4 种排版模式，并支持数字/英文用不同字体、关键词放大等。

### 具体提示词

```
你是一个资深前端工程师，精通 Canvas 2D 文字排版。现在要升级封面生成器的文字排版系统。

## 项目路径
/Users/andy/Documents/Andy AI/cover-maker/

## 任务 A：新增排版模式分析函数
在 index.html 的 <script type="module"> 中（靠近 getTextLoad 函数附近），新增函数:

```javascript
function analyzeTextLayout(text) {
  const cleaned = String(text || '').trim();
  const visibleChars = cleaned.replace(/\s/g, '').length;
  const lines = splitInputLines(cleaned);
  const lineCount = Math.max(1, lines.length);

  if (visibleChars <= 4)
    return { mode: 'headline', maxSize: 260, lineHeight: 1.02, align: 'center' };
  if (visibleChars <= 10)
    return { mode: 'standard', maxSize: 190, lineHeight: 1.08, align: 'center', accentSize: 0.70 };
  if (visibleChars <= 20)
    return { mode: 'subhead', maxSize: 156, lineHeight: 1.12, align: 'center', subRatio: 0.70 };
  return { mode: 'newspaper', maxSize: 114, lineHeight: 1.18, align: 'center', dropCap: 2.5 };
}
```

## 任务 B：修改 drawTemplateUserText — 支持多模式排版
重写 drawTemplateUserText 函数（保留原有接口兼容性），新逻辑:

### B1. 调用 analyzeTextLayout 获取 mode
### B2. 根据 mode 绘制:

**headline 模式 (≤4 字)**:
- 超大字居中，单行
- 文字使用 ctx.shadowColor 绘制 4 层偏移投影（模拟 3D 厚度）
- 数字/英文自动切换为 'DM Serif Display' 字体
- 字号 = gdTextBlock 计算的 fontSize（max 260px）

**standard 模式 (5-10 字)**:
- 主标题正常绘制（gdTextBlock）
- 取文案最后 2 字作为"关键词"，在文字块下方用 accent 颜色放大绘制
- 关键词字号 = 主标题 × 0.70
- 关键词字体切换为相邻字体（如果当前是 serif 则用 black，如果是 black 则用 qingke）

**subhead 模式 (11-20 字)**:
- 将文案用 gdLines 拆为 2 行
- 第一行作为主标题（100% 字号）
- 第二行作为副标题（70% 字号），颜色用 style.second
- 副标题前加 "-- " 前缀或缩小缩进

**newspaper 模式 (>20 字)**:
- 3 行小字排列
- 首字放大 2.5×（drop cap 效果）：第一个字用大字号单独绘制，后续文字环绕
- 行间距加大（lineHeight 1.18）
- 底部加一条细横线分隔

### B3. 字体混合策略
在 gdTextBlock 函数内部增加逻辑:
- 检测每个字符：如果是 ASCII 字母或数字 (/\w/)，切换字体为 '"DM Serif Display", "Noto Serif SC", serif'
- 检测标点符号：缩小为 80% 字号并向下偏移 10%
- 这需要逐字符绘制（而非整行 fillText），但只在 text.length < 20 时启用逐字符模式以保证性能

### B4. 向后兼容
- analyzeTextLayout 返回的 mode 存入 STATE.currentLayoutMode 以便调试
- 所有新排版模式不影响下载 PNG 和复制功能

## 验收标准
- 输入 "好" (1 字) → 生成 headline 模式超大字
- 输入 "今天天气真好" (6 字) → 生成 standard 模式主标题+关键词
- 输入 "如何在一个月内提高英语口语能力" (14 字) → 生成 subhead 模式双行
- 输入 "这是一段非常长的测试文案用于验证报纸模式排版是否正常工作请复制粘贴" (>20 字) → 生成 newspaper 模式
- 所有模式下 console 无报错
- 下载的 PNG 中文字清晰可辨
- 执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 5 验收
- 分别输入 1 字、6 字、14 字、25 字文案测试
- 确认 4 种模式均正确触发
- 检查关键词放大、首字下沉效果
- F12 console 无错误

---

## 🔧 批次 6：新建 lib/stickers.js — 图片贴纸加载器 + 素材目录 + 背景纹理目录

### 背景
前 5 个批次都是纯 Canvas 代码绘制。此批次开始引入真实的图片素材（PNG/WebP），需要建立加载器、注册表、素材目录结构和回退机制。

### 具体提示词

```
你是一个资深前端工程师，精通浏览器图片加载 API（Image, createImageBitmap, Canvas）。现在要为封面生成器建立图片贴纸素材系统。

## 项目路径
/Users/andy/Documents/Andy AI/cover-maker/

## 任务 A：创建目录结构
在项目根目录下创建:
- public/stickers/3d/       (3D 渲染物体类贴纸)
- public/stickers/doodle/    (手绘涂鸦类贴纸)
- public/stickers/stationery/ (办公文具类贴纸)
- public/stickers/emoji/     (Emoji 替代类贴纸)
- public/stickers/texture/   (纹理贴片类贴纸)
- public/stickers/decor/     (装饰图案类贴纸)
- public/stickers/frame/     (相框/卡片类贴纸)
- public/stickers/effect/    (特效元素类贴纸)
- public/backgrounds/notebook/  (笔记本/纸张类背景)
- public/backgrounds/solid/     (纯色纹理类背景)
- public/backgrounds/gradient/  (渐变底色类背景)
- public/backgrounds/geo/       (几何图案类背景)
- public/backgrounds/fx/        (特效底类背景)
- public/backgrounds/floral/    (装饰底纹类背景)

## 任务 B：新建 lib/stickers.js — 图片贴纸加载器

创建 lib/stickers.js，导出以下内容:

### B1. 贴纸注册表 STICKER_REGISTRY
一个大的 JSON 对象，包含 150+ 个贴纸的元数据。现在素材图片文件还没有，所以每个贴纸的 file 字段先指向占位路径，并设置 fallback 指向对应的 Canvas 绘制函数。

格式:
```javascript
export const STICKER_REGISTRY = {
  // === 3D 渲染物体 (30 个) ===
  'thumb3d_gold': {
    file: 'public/stickers/3d/thumb-gold.webp',
    w: 200, h: 200,
    displaySize: { short: 0.24, medium: 0.18, long: 0.12 },
    categories: ['3d', 'positive'],
    fallback: 'drawThumb3Dv2Sticker',
  },
  'thumb3d_blue': {
    file: 'public/stickers/3d/thumb-blue.webp',
    w: 200, h: 200,
    displaySize: { short: 0.24, medium: 0.18, long: 0.12 },
    categories: ['3d', 'positive'],
    fallback: 'drawThumb3Dv2Sticker',
  },
  'megaphone3d_red': {
    file: 'public/stickers/3d/megaphone-red.webp',
    w: 220, h: 180,
    displaySize: { short: 0.22, medium: 0.16, long: 0.10 },
    categories: ['3d', 'alert'],
    fallback: 'drawMegaphone3DSticker',
  },
  // ... 请列出全部 150+ 个贴纸元数据，覆盖以下分类:
  // 3D 类: thumb3d_gold/blue/white, megaphone3d_red/yellow, star3d_gold/silver,
  //        heart3d_red/pink, fire3d, diamond3d, crown3d_gold/silver,
  //        trophy3d_gold, balloon3d_red/blue/green/yellow, giftbox3d_red/blue/green,
  //        envelope3d, calendar3d, clock3d, magnifier3d, lightbulb3d,
  //        rocket3d, cart3d, camera3d, phone3d, book3d, mapPin3d
  // 涂鸦类: arrow_red/black/blue (各含 8 方向，共 24 个),
  //         circle_rough_red/black, underline_double/wave, star_doodle_5,
  //         checkmark_green/red, crossmark_red, question_red, exclaim_yellow,
  //         speech_bubble_white, cloud_white, lightning_yellow, heart_doodle_red
  // 文具类: washiTape_beige/pink/blue/green/yellow/red (6),
  //         stickyNote_yellow/pink/blue/green/mint (5),
  //         paperClip_silver/gold/colorful (3),
  //         pushpin_red/blue/green/yellow (4),
  //         stamp_new/hot/top/best/sale/limited (6),
  //         polaroidFrame_white, indexTab_blue/red/yellow/green (4),
  //         binderClip_black/silver (2)
  // Emoji类: emoji_fire/star/sparkles/hundred/party/heart/clap/rocket/
  //          eyes/bulb/tada/muscle/bell/music/rainbow/clover/bulb2/
  //          target/dart/gem/boom (20)
  // 纹理类: tear_top/bottom/left/right (4),
  //         watercolor_pink/blue/yellow (3),
  //         inksplat_black/blue (2),
  //         coffee_stain_light/dark (2),
  //         crayon_red/blue (2),
  //         paint_drip (1)
  // 装饰类: flower_pink/red/yellow/white/purple (5),
  //         leaf_green/dark/autumn (3),
  //         geo_circle/triangle/square/hexagon/diamond/star6 (6),
  //         ribbon_red/gold/blue (3),
  //         corner_gold/silver/black (3),
  //         tape_piece_clear/yellow (2),
  //         badge_new/hot/sale (3)
  // 相框类: polaroidFrame_white/cream/pink/blue (4),
  //         filmFrame_black, phoneFrame_black/white,
  //         ticketFrame_white/red/blue,
  //         labelCard_yellow/white/blue/pink/green (5),
  //         filmStrip (1)
  // 特效类: sparkle_gold/silver/rainbow (3),
  //         burst_comic_red/yellow/white (3),
  //         bubble_white/pink/blue (3),
  //         glow_soft_warm/cool/pink (3),
  //         speedLines_white/black (2),
  //         confetti_colorful (1)

  总计应达到 150-200 个贴纸元数据。每个必须有 file, w, h, displaySize, categories, fallback 字段。
};
```

### B2. 风格族贴纸候选池 FAMILY_STICKER_POOL
```javascript
export const FAMILY_STICKER_POOL = {
  A: [/* 40-50 个贴纸 ID，侧重文具/手绘/便签类 */],
  B: [/* 40-50 个贴纸 ID，侧重 3D/提醒/印章类 */],
  C: [/* 40-50 个贴纸 ID，侧重漫画/特效/表情类 */],
  // ... D-T 各 40-50 个
};
```
每个风格族的候选池从 STICKER_REGISTRY 的 keys 中选择，应包含 40-50 个适合该风格族的贴纸 ID。

### B3. 核心加载 API（5 个导出函数）

1. preloadStickersForFamily(family)
   — 从 FAMILY_STICKER_POOL[family] 获取候选贴纸列表
   — 对每个贴纸，创建 Image 对象并设置 src 为 STICKER_REGISTRY[id].file
   — 将加载完成的 Image 存入内存缓存 Map
   — 加载失败时静默处理（后续用 fallback）
   — 返回 Promise，全部加载完成后 resolve

2. getRandomStickers(family, count)
   — 从 FAMILY_STICKER_POOL[family] 随机选 count 个不重复贴纸 ID
   — 返回 string[] (贴纸 ID 数组)

3. drawStickerImage(ctx, stickerId, x, y, size, rotation, accent)
   — 如果贴纸图片已缓存: ctx.drawImage(img, x-size/2, y-size/2, size, size)
   — 如果未缓存: 调用 getStickerFallbackFn 执行 Canvas 绘制
   — rotation 参数: 绘制前 ctx.rotate(rotation)
   — accent 参数传递给 fallback 函数

4. isStickerLoaded(stickerId)
   — 返回 boolean，检查该贴纸是否已加载到内存

5. getStickerFallbackFn(stickerId)
   — 查找 STICKER_REGISTRY[id].fallback
   — 返回对应的 Canvas 绘制函数引用
   — 需要一个映射表将 fallback 字符串映射到实际函数:
     { 'drawThumb3Dv2Sticker': drawThumb3Dv2Sticker, ... }

### B4. 加载策略
- 页面加载后自动调用 preloadStickersForFamily('A') 预加载第一个风格族
- 用户切换风格族 tab 时，后台异步预加载对应族
- 贴纸加载超时 5 秒后放弃，使用 fallback

## 任务 C：创建占位素材文件
由于实际收集 150-200 个素材图片是一个设计任务，现在需要创建一些占位图片:

### C1. 生成 5 个基础占位贴纸
用 Canvas 在 Node.js 脚本中生成（或直接在 lib/stickers.js 中增加一个初始化函数），创建 5 个基础 PNG 贴纸写入 public/stickers/ 对应目录:
- 3d/thumb-gold.webp — 200×200，金色拇指
- doodle/arrow-red.webp — 300×80，红色手绘箭头
- stationery/stamp-hot.webp — 160×160，红色圆形印章
- emoji/emoji-fire.webp — 200×200，火焰 emoji
- effect/sparkle-gold.webp — 160×160，金色闪光

使用 Canvas drawImage + canvas.toBlob 在浏览器端生成并下载。增加一个隐藏的管理页面入口（URL hash #generate-placeholders）触发此功能。

如果太复杂，可以先创建 1×1 像素的透明 PNG 占位文件（用代码写入），然后在实际使用时全部走 fallback Canvas 绘制。这样系统至少能正常运行。

### C2. 背景纹理占位处理
新建 public/backgrounds/ 各子目录下创建 .gitkeep 文件（确保目录被 git 跟踪）。
在 drawTemplateBackground 中增加背景图片加载逻辑：如果背景图存在则用 drawImage 绘制，否则用批次 1 的 Canvas 纹理函数生成。

## 在 index.html 中的集成
- 在 <script type="module"> 中 import { preloadStickersForFamily, getRandomStickers, drawStickerImage, isStickerLoaded, getStickerFallbackFn, STICKER_REGISTRY, FAMILY_STICKER_POOL } from './lib/stickers.js';
- 修改 drawTemplateStickerSlot：调用 getRandomStickers(family, count) 获取贴纸 ID，然后用 drawStickerImage 绘制每个
- 在页面初始化时调用 preloadStickersForFamily('A')
- 在风格族 tab 切换时预加载对应族

## 验收标准
- 打开浏览器，console 中贴纸加载器初始化成功（可能有 404 加载失败，但应静默回退到 Canvas 绘制）
- 生成封面，贴纸正常显示（fallback Canvas 版本）
- 即使 public/stickers/ 下没有任何真实图片，系统仍能完整运行
- 执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 6 验收
- 删除 public/stickers/ 下所有图片（如果有）
- 生成封面，确认所有贴纸回退到 Canvas 版本，无报错
- 网络面板中显示 404 但系统不崩溃

---

## 🔧 批次 7：LOCKED_TEMPLATE_STYLES 扩展 + 贴纸滑动交互

### 背景
每个风格族的 stickers 候选池需从 5 个扩展到 30-50 个（已在批次 4 和 6 准备好），并增加用户左右滑动切换贴纸的交互功能。

### 具体提示词

```
你是一个资深前端工程师，精通 DOM 交互和 Canvas。现在要扩展贴纸候选池并增加用户交互。

## 项目路径
/Users/andy/Documents/Andy AI/cover-maker/

## 任务 A：扩展 LOCKED_TEMPLATE_STYLES 的 stickers 数组
在 index.html 中找到 LOCKED_TEMPLATE_STYLES 对象（约第 3263 行），将每个风格族的 stickers 数组从当前的 5 个元素扩展到 30-50 个贴纸 ID。

贴纸 ID 来自 lib/stickers.js 中 STICKER_REGISTRY 的所有 key（150-200 个）。每个风格族分配 30-50 个适合其视觉风格的贴纸:

### A. 手账白底 — 侧重纸张/便签/手绘
stickers: ['washiTape_beige','washiTape_pink','stickyNote_yellow','stickyNote_pink','paperClip_silver','pushpin_red','realisticStamp_red','polaroidFrame_white','indexTab_blue','binderClip_black','handDrawnArrow_red','handDrawnUnderline_double','handDrawnCircle_rough','doodleStar','scribbleCloud','markerStrike_yellow','cuteCatFace','cuteDogFace','sparkleEyes','emoji_star','emoji_sparkles','emoji_heart','emoji_clover','flower_pink','leaf_green','tape_piece_clear','sparkle_gold','glow_soft_warm','arrow_red_tl','arrow_red_tr','checkmark_green','paint_drip','ribbon_red','badge_new','labelCard_white','crayon_red','watercolor_pink','inksplat_black','coffee_stain_light','pushpin_blue','stickyNote_mint','heart3d_red','balloon3d_pink']

### B. 黄底提醒 — 侧重 3D/喇叭/印章/强提醒
stickers: ['megaphone3d_red','megaphone3d_yellow','thumb3d_gold','star3d_gold','fire3d','stamp_new','stamp_hot','stamp_best','stamp_limited','emoji_fire','emoji_hundred','emoji_rocket','emoji_boom','arrow_red_tl','arrow_red_tr','arrow_red_bl','arrow_red_br','exclaim_yellow','burst_comic_red','burst_comic_yellow','sparkle_gold','badge_hot','badge_new','ribbon_red','binderClip_black','pushpin_red','lightbulb3d','alarm_clock','crown3d_gold','trophy3d_gold','diamond3d','speedLines_white','checkmark_green','crossmark_red','markerStrike_yellow','angryFace','shockedFace','sparkleEyes','ticketFrame_red','filmFrame_black']

### C. 红色事件 — 侧重漫画/爆炸/拟声
stickers: ['burst_comic_red','burst_comic_yellow','burst_comic_white','megaphone3d_red','fistComic','emoji_boom','emoji_fire','emoji_exclaim','sparkle_gold','sparkle_silver','lightning_yellow','speech_bubble_white','speedLines_white','stamp_limited','stamp_hot','trophy3d_gold','crown3d_gold','star3d_gold','heart3d_red','fire3d','angryFace','shockedFace','loveEyes','arrow_red_bl','arrow_red_br','doodleStar','confetti_colorful','badge_new','badge_hot','ribbon_red','ticketFrame_red','labelCard_red','bubble_white','glow_soft_warm','sparkle_rainbow','checkmark_green','crossmark_red']

### D. 蓝绿信息 — 侧重书本/学习/清单
stickers: ['book3d','lightbulb3d','magnifier3d','thumb3d_blue','star3d_silver','paperClip_silver','stickyNote_blue','stickyNote_green','stickyNote_mint','indexTab_blue','indexTab_green','binderClip_silver','pushpin_blue','pushpin_green','washiTape_blue','washiTape_green','emoji_bulb','emoji_star','emoji_clover','emoji_target','arrow_blue_tl','arrow_blue_tr','checkmark_green','underline_double','handDrawnCircle_rough','doodleStar','scribbleCloud','cuteCatFace','cuteDogFace','sparkleEyes','leaf_green','geo_circle','geo_triangle','geo_hexagon','filmFrame_black','labelCard_blue','labelCard_green','sparkle_silver','glow_soft_cool','corner_silver']

### E. 极简金句 — 侧重留白/线条/小点缀
stickers: ['handDrawnCircle_rough','handDrawnUnderline_double','doodleStar','scribbleCloud','arrow_black_tl','arrow_black_tr','washiTape_beige','paperClip_silver','stickyNote_yellow','pushpin_red','thumb3d_gold','star3d_silver','heart3d_red','sparkleEyes','loveEyes','cuteCatFace','emoji_star','emoji_sparkles','emoji_heart','flower_pink','leaf_green','tape_piece_clear','geo_circle','geo_diamond','geo_star6','corner_gold','corner_silver','ribbon_gold','badge_new','labelCard_white','markerStrike_yellow','handDrawnArrow_black','sparkle_gold','glow_soft_warm','watercolor_pink']

### F-T 风格族同理，每个 30-50 个贴纸 ID。
确保选择的贴纸 ID 都存在于 STICKER_REGISTRY 的 key 中。

## 任务 B：贴纸左右滑动切换交互

### B1. 在卡片上增加滑动交互
修改 buildOneCard 函数（约 4938 行），在 actions 区域增加贴纸切换指示器:
```html
<div class="sticker-nav">
  <button class="sticker-prev" title="换贴纸">◀</button>
  <span class="sticker-indicator">贴纸 1/3</span>
  <button class="sticker-next" title="换贴纸">▶</button>
</div>
```

### B2. CSS样式
在 <style> 中增加:
```css
.sticker-nav {
  position: absolute;
  bottom: 44px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  opacity: 0;
  transition: opacity .2s;
  background: rgba(0,0,0,.55);
  border-radius: 20px;
  padding: 4px 10px;
}
.card-wrap:hover .sticker-nav { opacity: 1; }
.sticker-nav button {
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  min-width: 32px;
  min-height: 32px;
}
.sticker-nav .sticker-indicator {
  color: #fff;
  font-size: 11px;
  white-space: nowrap;
}
```

### B3. 交互逻辑
- 点击 ◀/▶ 按钮触发 rerollStickersOnly(wrap, direction)
- rerollStickersOnly 函数：
  1. 保持当前模板骨架 (tpl.id) 和文字内容不变
  2. 从 FAMILY_STICKER_POOL[family] 中随机选取新的 1-3 个贴纸（槽位数量不变）
  3. 重新渲染 Canvas
  4. 0.3s 淡入淡出过渡
- 移动端支持触摸滑动（touchstart/touchend 判断左右滑动方向）

### B4. 批量模式下也支持
在批量模式的卡片上也增加贴纸切换功能。

## 验收标准
- 鼠标悬停卡片，底部出现贴纸切换按钮
- 点击 ◀/▶ 可切换贴纸组合（保持模板和文字不变）
- 每个风格族 stickers 数组有 30+ 个可选贴纸
- 移动端触摸滑动可切换贴纸
- 执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 7 验收
- 生成封面，hover 卡片确认贴纸导航出现
- 点击左右按钮切换贴纸，确认贴纸组合变化
- F12 console 中确认无错误

---

## 🔧 批次 8：新建 lib/color-ai.js — AI 辅助色彩/Emoji 匹配

### 背景
当前所有贴纸、配色选择完全是随机种子驱动的。需要根据用户输入的文案内容，智能推荐色调、emoji 装饰和排版模式。

### 具体提示词

```
你是一个资深前端工程师，擅长中文文本分析和规则引擎设计。现在要为封面生成器增加文案智能分析功能。

## 项目路径
/Users/andy/Documents/Andy AI/cover-maker/

## 任务：新建 lib/color-ai.js

创建 lib/color-ai.js，导出 3 个核心函数。全部纯客户端规则引擎，不调用任何外部 API。

### 函数 1: analyzeTextTone(text) — 文案色调推荐
```javascript
export function analyzeTextTone(text) {
  const t = String(text || '');
  // 30-40 条关键词规则，按优先级匹配
  const rules = [
    { words: ['紧急','通知','注意','重要','必看','警告','马上','立即','速看','错过'],
      tone: 'urgent', familyPrefer: ['B','C'], accentColor: '#ED0108' },
    { words: ['治愈','温柔','慢慢','安静','生活','日常','小确幸','温暖','柔软','舒服'],
      tone: 'healing', familyPrefer: ['A','E','L'], accentColor: '#C8A050' },
    { words: ['学习','知识','技巧','方法','教程','指南','干货','笔记','总结','经验'],
      tone: 'study', familyPrefer: ['D','A','E'], accentColor: '#2677DE' },
    { words: ['活动','福利','免费','折扣','限时','优惠','促销','抢购','秒杀','省钱'],
      tone: 'promo', familyPrefer: ['C','B','G'], accentColor: '#ED0108' },
    { words: ['科技','AI','智能','数字','未来','新','GPT','机器','算法','代码'],
      tone: 'tech', familyPrefer: ['K','H','M'], accentColor: '#00F5FF' },
    { words: ['美食','好吃','推荐','打卡','探店','餐厅','甜品','饮品','火锅','烧烤'],
      tone: 'food', familyPrefer: ['C','G','T'], accentColor: '#FF6333' },
    { words: ['穿搭','美妆','护肤','变美','好看','时尚','发型','化妆','服装','搭配'],
      tone: 'beauty', familyPrefer: ['C','G','L'], accentColor: '#F78DE9' },
    { words: ['旅行','出游','景点','打卡','周末','假期','旅游','攻略','路线','风景'],
      tone: 'travel', familyPrefer: ['D','L','Q'], accentColor: '#4ECDC4' },
    { words: ['职场','工作','效率','升职','跳槽','副业','赚钱','理财','存钱','收入'],
      tone: 'career', familyPrefer: ['D','E','O'], accentColor: '#1A1A1A' },
    { words: ['健身','减肥','运动','瑜伽','跑步','健康','养生','睡眠','饮食','打卡'],
      tone: 'health', familyPrefer: ['D','G','L'], accentColor: '#2AB673' },
    { words: ['情感','恋爱','分手','前任','暧昧','暗恋','相亲','婚姻','闺蜜','友情'],
      tone: 'emotion', familyPrefer: ['E','C','L'], accentColor: '#FF6B9D' },
    { words: ['搞笑','幽默','笑话','段子','整蛊','沙雕','离谱','抽象','好笑的','笑死'],
      tone: 'funny', familyPrefer: ['C','G','T'], accentColor: '#FFE066' },
    { words: ['装修','家居','收纳','整理','房间','租房','搬家','布置','改造','设计'],
      tone: 'home', familyPrefer: ['A','D','S'], accentColor: '#8B6F47' },
    { words: ['摄影','拍照','调色','滤镜','修图','相机','构图','vlog','视频','剪辑'],
      tone: 'photo', familyPrefer: ['F','R','Q'], accentColor: '#D4A574' },
    { words: ['音乐','歌曲','歌单','推荐','听歌','演唱会','乐器','弹唱','说唱','民谣'],
      tone: 'music', familyPrefer: ['N','K','H'], accentColor: '#B967FF' },
  ];
  // 遍历规则，统计每个 tone 的命中次数，返回得分最高的
  // 如果没有命中，返回 { tone: 'general', familyPrefer: [], accentColor: null }
}
```

### 函数 2: matchEmojiForText(text) — Emoji 智能匹配
```javascript
// 200 个中文关键词 → emoji 映射表
const EMOJI_KEYWORD_MAP = {
  '学习':'📚','知识':'🧠','技巧':'💡','方法':'🔧','教程':'📖',
  '美食':'🍽️','好吃':'😋','推荐':'⭐','必看':'👀','紧急':'🚨',
  '通知':'📢','注意':'⚠️','活动':'🎉','福利':'🎁','免费':'🆓',
  '折扣':'🏷️','科技':'🔮','AI':'🤖','智能':'🧠','未来':'🚀',
  '穿搭':'👗','美妆':'💄','护肤':'✨','旅行':'✈️','出游':'🗺️',
  '健身':'💪','减肥':'🏃','运动':'⚽','健康':'❤️','养生':'🍵',
  '职场':'💼','工作':'📊','效率':'⚡','赚钱':'💰','理财':'📈',
  '情感':'💕','恋爱':'💗','搞笑':'🤣','幽默':'😆',
  '装修':'🏠','家居':'🛋️','收纳':'📦','摄影':'📷','拍照':'🤳',
  '音乐':'🎵','歌单':'🎧','咖啡':'☕','奶茶':'🧋','宠物':'🐱',
  '电影':'🎬','读书':'📚','画画':'🎨','手工':'✂️','植物':'🌿',
  '晚安':'🌙','早安':'☀️','加油':'💪','开心':'😊','难过':'😢',
  '惊喜':'🎁','感动':'🥹','生气':'😤','害怕':'😱','期待':'👀',
  '完成':'✅','进行中':'🔄','开始':'▶️','结束':'🏁','第一名':'🥇',
  '第二名':'🥈','第三名':'🥉','清单':'📋','日历':'📅','时间':'⏰',
  '地点':'📍','电话':'📞','消息':'💬','链接':'🔗','搜索':'🔍',
  '收藏':'❤️','点赞':'👍','分享':'🔄','下载':'⬇️','上传':'⬆️',
  '设置':'⚙️','工具':'🔧','安全':'🔒','警告':'⚠️','错误':'❌',
  '成功':'✅','失败':'❌','问题':'❓','答案':'💡',
  '春节':'🧧','中秋':'🌕','圣诞':'🎄','生日':'🎂','毕业':'🎓',
  '婚礼':'💒','宝宝':'👶','宠物狗':'🐕','宠物猫':'🐈',
  // ... 补充至 200 个
};

export function matchEmojiForText(text) {
  const t = String(text || '');
  const matched = [];
  for (const [keyword, emoji] of Object.entries(EMOJI_KEYWORD_MAP)) {
    if (t.includes(keyword)) matched.push(emoji);
  }
  // 去重，返回前 3 个
  return [...new Set(matched)].slice(0, 3);
}
```

### 函数 3: analyzeTextAndRoute(text) — 综合分析
```javascript
export function analyzeTextAndRoute(text) {
  const layout = analyzeTextLayout(text);  // 来自批次 5
  const tone = analyzeTextTone(text);
  const emojis = matchEmojiForText(text);
  return {
    layout,
    tone,
    emojis,           // 推荐的 emoji 列表
    recommendedFamilies: tone.familyPrefer,  // 推荐的风格族
    accentColor: tone.accentColor,           // 推荐强调色（如果匹配到）
    textLength: String(text || '').replace(/\s/g, '').length,
  };
}
```

## 在 index.html 中的集成
- import { analyzeTextAndRoute, matchEmojiForText, analyzeTextTone } from './lib/color-ai.js';
- 在 generate() 函数开头调用 analyzeTextAndRoute(text)，将结果存入 STATE.textAnalysis
- 如果有 accentColor 推荐，在 drawLockedTemplateCover 中使用推荐色覆盖默认 accent
- 在 drawTemplateStickerSlot 中优先选择匹配 emoji 的贴纸（如果候选池中有对应的 emoji 贴纸）
- 如果推荐了风格族 (recommendedFamilies)，在 UI 中高亮这些族（加一个 "推荐" 标签在 tab 上）
- 如果没有命中任何规则（tone === 'general'），使用默认随机行为

## 验收标准
- 输入 "学习英语的方法"，F12 console 检查 STATE.textAnalysis：
  tone 应为 'study'，emojis 应包含 📚 或 💡，recommendedFamilies 应包含 D
- 输入 "今天吃什么好吃的"，tone 应为 'food'，emojis 应包含 🍽️ 或 😋
- 输入 "随便写写" → tone 应为 'general'，不崩溃，回退到默认行为
- 执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 8 验收
- 输入不同类型文案，F12 console 检查分析结果是否正确
- 确认推荐风格族在 UI 上有视觉提示
- 确认 accentColor 推荐被应用到封面

---

## 🔧 批次 9：代码拆分 + 性能优化 + v5.0 统一入口

### 背景
index.html 已达 ~6500+ 行，难以维护。需要拆分为独立 JS 模块。同时增加性能优化和 v5.0 入口。

### 具体提示词

```
你是一个资深前端工程师，精通 ES Module 代码组织和性能优化。现在要对封面生成器进行架构重构。

## 项目路径
/Users/andy/Documents/Andy AI/cover-maker/

## 任务 A：代码拆分

将 index.html 中 <script type="module"> 内约 4000 行的 JavaScript 代码按职责拆分为以下独立文件:

### 拆分目标

#### src/main.js — 入口文件 (~200 行)
从 index.html 的 <script type="module"> 中迁移:
- STATE, BATCH_STATE, AUTH_STATE 全局状态定义
- DOM 事件绑定（按钮点击、tab 切换、字体切换）
- generate(), rerollAll(), clearAll() 主流程函数
- updateCounter(), updateGenerateButton(), renderBatchPanel() 等 UI 更新函数
- 初始化代码（DOMContentLoaded）
- import 其他所有模块并重新导出给 window 使用

#### src/templates.js — 模板定义 (~500 行)
从 index.html 迁移:
- CANVAS_W, CANVAS_H, CARDS_PER_FAMILY, FONT_MAP
- FAMILY_LABELS, FAMILY_TO_PALETTE
- TEMPLATE_CONTRACT, TEMPLATE_VARIANTS
- LOCKED_TEMPLATE_STYLES (含扩展后的 30-50 个 stickers)
- CLEAN_STYLE
- drawLockedTemplateCover (含所有子函数)
- drawTemplateBackground, drawTemplatePanel, drawTemplateStickerSlot
- drawTemplateUserText, drawTemplateEmphasis, drawTemplateBurst
- drawTemplatePaperStack, drawTemplateCornerMarks
- getTextLoad, templateTextBox, templateStickerSlot
- drawTemplateSticker (分发函数)
- gdLines, gdTextBlock, gdWrapLines, gdRoundRect, gdTopChrome
- gdNotebook, gdAccentWord, gdUnderline, gdSafeW
- LEGACY 风格族函数 A-T (styleA_legacyHandDrawn 等)
- 稿定式重校准函数 A-E (styleA_handDrawn 等)
- cleanCoverStyle 遗留回退函数
- allocDecorPositions

#### src/renderer.js — 渲染核心 (~300 行)
从 index.html 迁移:
- renderCard(), buildOneCard()
- assertTemplateSafeBounds()
- pickPalette()（如果存在）
- generateBatchCovers()
- rerollOne()
- rerollStickersOnly()（批次 7 新增的贴纸切换函数）
- downloadCanvas(), copyCanvas()
- splitInputLines, hasVisibleText, normalizeVisibleText
- fs()（自适应字号）
- drawWrappedText(), measureTextWidth()
- rand(), pick()

#### src/stickers-canvas.js — 已有（批次 4 创建）
保持 30 个 Canvas 贴纸函数在此文件中。

#### src/layout.js — 文字排版核心 (~200 行)
从 index.html 迁移:
- analyzeTextLayout()（批次 5 新增）
- gdTextBlock, gdLines, gdWrapLines, gdAccentWord
- fs() 自适应字号函数
- drawWrappedText, measureTextWidth
- templateTextBox, getTextLoad
- 排版相关的工具函数

#### src/ui.js — DOM 交互 (~300 行)
从 index.html 迁移:
- showToast()
- 所有 modal 相关（openAuthModal, closeAuthModal, openUpgradeModal 等）
- renderAccountBar()
- renderBatchPanel()
- analyzeBatchTexts(), parseBatchTexts()
- batchGenerate 相关的 DOM 操作
- selectPlan, showUpgradeQrCode, handlePaidDone, backToPlans
- 风格族/字体 tab 切换逻辑

#### src/auth.js — 账号/会员 (~200 行)
从 index.html 迁移:
- SUPABASE_CONFIG, supabase 初始化
- authRequest(), fetchAuthPayload(), applyAuthPayload()
- requestDownloadAccess(), submitAuth(), logout()
- formatAuthError()
- refreshAuthState()

### 拆分后 index.html 结构
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>小红书大字封面生成器 v5.0</title>
  <!-- 保留全部 <style> CSS (约 460 行) -->
</head>
<body>
  <!-- 保留全部 HTML 结构 (约 200 行) -->

  <!-- 外部依赖 -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="./config.js"></script>

  <!-- 主入口 -->
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

### 拆分规则
1. 每个拆分出的文件只包含 export 语句和函数定义，不包含顶层执行代码
2. 所有 import 使用相对路径（如 '../lib/colors.js', './templates.js'）
3. 确保循环依赖不存在（lib/* 不依赖 src/*）
4. 保留所有原有注释和 DESIGN_LOCK 相关说明
5. 所有暴露给 window 的全局函数（window.generate, window.downloadCanvas 等）统一在 main.js 中赋值

## 任务 B：性能优化

### B1. 文字测量缓存
在 src/layout.js 中新增:
```javascript
const measureCache = new Map();
function cachedMeasureText(ctx, text, fontSize, fontFamily, fontWeight) {
  const key = `${text}|${fontSize}|${fontFamily}|${fontWeight}`;
  if (measureCache.has(key)) return measureCache.get(key);
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const w = ctx.measureText(text).width;
  measureCache.set(key, w);
  return w;
}
// 限制缓存大小: 超过 1000 条时清空一半
if (measureCache.size > 1000) {
  const keys = [...measureCache.keys()].slice(0, 500);
  keys.forEach(k => measureCache.delete(k));
}
```

### B2. 分片渲染（批量模式）
在 generateBatchCovers 中，如果卡片数量 > 30，使用 requestAnimationFrame 分片:
```javascript
async function generateBatchCoversChunked(items, families, seed) {
  const CHUNK_SIZE = 5;  // 每帧渲染 5 张
  const allCards = [];
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    // 渲染当前批
    for (const item of chunk) { /* 生成卡片 */ }
    // 等待下一帧
    if (i + CHUNK_SIZE < items.length) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }
  return allCards;
}
```

### B3. 背景纹理图预加载
在 src/main.js 初始化时:
```javascript
const bgImageCache = new Map();
async function preloadBackgroundImages(family) {
  const style = LOCKED_TEMPLATE_STYLES[family];
  if (!style || !style.bgImages) return;
  for (const bgPath of style.bgImages) {
    if (bgImageCache.has(bgPath)) continue;
    const img = new Image();
    img.src = bgPath;
    try {
      await img.decode();
      bgImageCache.set(bgPath, img);
    } catch (_) { /* 加载失败静默处理 */ }
  }
}
```

## 任务 C：v5.0 统一入口 + 版本共存

### C1. 新增 drawTemplateEnhancedCover
在 src/templates.js 中新增 v5.0 入口函数:
```javascript
export function drawTemplateEnhancedCover(ctx, text, palette, options, family) {
  // 与 drawLockedTemplateCover 接口完全一致
  // 内部整合了:
  //   - 批次 1: 纹理（从 lib/textures.js）
  //   - 批次 2: 阴影（从 lib/shadows.js）
  //   - 批次 3: 渐变（从 lib/gradients.js）
  //   - 批次 4: 1-3 个随机贴纸槽位
  //   - 批次 5: 4 种排版模式
  //   - 批次 8: AI 色彩/Emoji 辅助

  // 实现: 先调用 analyzeTextAndRoute(text) 获取推荐
  // 再用推荐色覆盖 style.accent（如果有）
  // 然后执行 enhanced 渲染管线
}
```

### C2. 版本切换
在 STYLE_FUNCS 中:
```javascript
const USE_V5 = !location.search.includes('v=4');  // 默认 v5
const STYLE_FUNCS = {
  A: (ctx, text, palette, options) => USE_V5
    ? drawTemplateEnhancedCover(ctx, text, palette, options, 'A')
    : drawLockedTemplateCover(ctx, text, palette, options, 'A'),
  // B-T 同理
};
```

### C3. 更新文档
在页面 header 的 badge 中显示版本号:
```html
<div class="badge">v5.0 · 20 种风格 · 每种 5 张 · 30+ 贴纸可选</div>
```

## 验收标准
- 所有 import 路径正确，浏览器不报 404
- 用浏览器打开 index.html，所有功能正常:
  - 登录/注册
  - 输入文案生成封面
  - 下载 PNG
  - 复制到剪贴板
  - 批量模式
  - 换一换
  - 贴纸左右切换
- F12 console 无 import 错误
- 打开 index.html?v=4 确认回退到 v4.0 旧版本
- 单次 100 张卡片生成 < 5 秒
- 执行完这些提示词后，系统要完整可运行并且不会有任何bug
```

### 批次 9 验收
- `ls src/` 确认 8 个 JS 文件存在
- `ls lib/` 确认 7 个 JS 文件存在
- `wc -l index.html` 确认 HTML 缩减到 ~800 行以内
- 所有功能正常工作
- `?v=4` 回退验证通过

---

## 📊 全部批次完成后的最终验证

完成全部 9 个批次后，执行以下端到端验证:

### 功能验证
1. [ ] 打开 `index.html`，页面正常加载，无白屏
2. [ ] F12 console 无任何错误或 warning（允许图片 404 因为素材图片还未全部收集）
3. [ ] 输入 "测试" (2 字) → 生成 headline 模式超大字封面
4. [ ] 输入 "今天天气真好适合出去玩" (10 字) → 生成 standard 模式 + 关键词放大
5. [ ] 输入 "如何在一个月内快速提高英语口语和听力能力" (18 字) → 生成 subhead 模式双行
6. [ ] 输入一段 30 字长文案 → 生成 newspaper 模式首字下沉
7. [ ] 每张卡片有 1-3 个贴纸，分布在画面不同位置
8. [ ] 背景有纹理/渐变效果（不是纯色）
9. [ ] 白卡/气泡面板有阴影层次
10. [ ] hover 卡片出现贴纸左右切换按钮，点击可切换
11. [ ] 下载 PNG 分辨率 1242×1656
12. [ ] 复制到剪贴板成功
13. [ ] 全部换一换功能正常
14. [ ] 批量模式（888 分隔）正常
15. [ ] 风格族/字体 tab 切换正常
16. [ ] 移动端 480px 响应式布局正常
17. [ ] `index.html?v=4` 可回退到旧版本
18. [ ] 输入 "美食推荐" 检查推荐风格族是否包含 G/T
19. [ ] 输入 "学习方法" 检查推荐 emoji 是否包含 📚
20. [ ] 登录/注册功能正常

### 性能验证
- [ ] 单次 100 张卡片 < 5 秒
- [ ] 批量模式 10 条文案 × 5 风格 < 8 秒
- [ ] 贴纸切换 < 500ms（含重绘）
- [ ] 页面首次加载 < 3 秒

---

> **版本**: v2.0
> **日期**: 2026-07-06
> **配套**: DEV_PLAN_v5.0.md
> **上一版本**: AI_PROMPTS_v1.0.md（v3.0 封面生成器构建）
> **下一版本**: AI_PROMPTS_v3.0.md（素材收集与 AI 图像生成集成，待规划）
