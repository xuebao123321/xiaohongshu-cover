# 小红书大字封面生成器 · 开发文档 v5.0

> **版本**: v5.0
> **日期**: 2026-07-06
> **基于**: v4.0 DESIGN_LOCK 模板体系 + STYLE_GUIDE_v3.0 192 张样本分析
> **目标**: 将 Canvas 几何手绘封面升级为接近稿定设计专业模板的视觉质量
> **设计原则**: 文字第一、模板骨架固定、贴纸槽位制、禁止额外文案

---

## 目录

1. [背景与问题诊断](#1-背景与问题诊断)
2. [第一阶段：Canvas 渲染质量升级](#2-第一阶段canvas-渲染质量升级)
3. [第二阶段：图片素材库](#3-第二阶段图片素材库)
4. [第三阶段：AI 辅助生成增强](#4-第三阶段ai-辅助生成增强)
5. [第四阶段：架构优化与性能](#5-第四阶段架构优化与性能)
6. [实施计划与里程碑](#6-实施计划与里程碑)
7. [验证清单](#7-验证清单)

---

## 1. 背景与问题诊断

### 1.1 当前状态

封面生成器 (`index.html`, ~5945 行) 使用纯 Canvas 2D API 通过几何图形（arc、rect、path、ellipse）手绘所有视觉元素。v4.0 引入了 `drawLockedTemplateCover` 统一模板入口，包含 5 个模板骨架 × 20 个风格族 = 100 种组合。

### 1.2 核心差距（vs 稿定设计 260+ 张专业模板）

| 维度 | 当前系统 | 稿定设计参考模板 | 差距 |
|------|---------|-----------------|------|
| 贴纸数量 | 每卡 1 个 | 每卡 3-6 个 | **3-6×** |
| 贴纸质量 | Canvas 几何手绘 | 真实照片/3D 渲染/插画 | **无法比较** |
| 背景纹理 | 纯色 + 横线/放射线 | 纸张纹理/渐变/噪点/晕染 | **5-8 种** |
| 阴影层次 | `shadowBlur` 单层 | 多层投影/内阴影/彩色阴影 | **3-5 层** |
| 渐变丰富度 | 线性渐变为主 | 径向/锥形/多色/高斯模糊 | **3-4 种** |
| 文字排版 | 1 种字体 × 1 种字号 | 2-3 种字体 × 3-4 种字号混排 | **对比度不足** |
| 贴纸槽随机性 | 1 个固定槽位 | 1-3 个随机槽位（动态数量） | **位置模式单一** |
| 贴纸可选范围 | 5 个 per 风格 | 应该 30-50 个 per 风格 | **10× 差距** |

### 1.3 约束条件

- 纯前端渲染（Cloudflare Pages 静态部署，无服务端）
- 100 张卡片需在 5 秒内生成
- DESIGN_LOCK.md 规则不可绕过
- 不引入外部 API 依赖（保持离线可用）
- 移动端兼容（最小 480px 视口）

---

## 2. 第一阶段：Canvas 渲染质量升级

> **目标**: 纯代码优化，不引入任何图片文件，视觉质量提升 40-50%
> **工作量**: 3 天
> **文件影响**: `index.html`, `lib/features.js`, `lib/colors.js`，新建 3 个 lib 文件

### 2.1 背景纹理库（新增 20 个纹理函数）

在 `lib/features.js` 和新建 `lib/textures.js` 中实现：

#### 纸质纹理（8 个）

| # | 函数名 | 效果 | 适用风格 |
|---|--------|------|---------|
| 1 | `drawNotebookGrid` | 方格纸（已有，增强密度可配） | A/D/E |
| 2 | `drawNotebookLined` | 横线纸（已有，增强边距可配） | A/E |
| 3 | `drawDotGrid` | 点阵纸，间距/透明度可配 | A/D/E/L |
| 4 | `drawKraftPaper` | 牛皮纸纹理（纤维噪点叠加） | F/J/R |
| 5 | `drawRicePaper` | 宣纸纹理（不规则纤维 + 水渍） | J |
| 6 | `drawWashiPaper` | 和纸纹理（细纤维 + 微透明） | L |
| 7 | `drawCardboardTexture` | 纸板纹理（粗纤维条纹） | B/I |
| 8 | `drawVintagePaper` | 旧纸张（泛黄 + 边缘暗化 + 污渍） | F/R |

#### 特效纹理（7 个）

| # | 函数名 | 效果 | 适用风格 |
|---|--------|------|---------|
| 9 | `drawFilmGrain` | 胶片颗粒（随机散点，密度可配） | F/O |
| 10 | `drawHalftoneDots` | 半色调网点（已有，增强直径/间距/形状） | C |
| 11 | `drawWatercolorWash` | 水彩晕染（多层径向渐变叠加） | J/L/T |
| 12 | `drawInkSplatter` | 墨点飞溅（随机圆 + 椭圆集群） | J/H |
| 13 | `drawNoiseTexture` | Perlin 风格噪点（像素级随机 alpha） | F/G/K |
| 14 | `drawScanlines` | 扫描线（水平条纹，CRT 效果） | K/P/N |
| 15 | `drawCrosshatch` | 交叉排线（素描感阴影线） | E/O |

#### 几何纹理（5 个）

| # | 函数名 | 效果 | 适用风格 |
|---|--------|------|---------|
| 16 | `drawPolkaDots` | 波尔卡圆点（大小/间距渐变） | G/I/T |
| 17 | `drawZigzagStripes` | Z 字条纹（间距/粗细可配） | I |
| 18 | `drawCheckerboard` | 棋盘格（大小可配，带旋转） | P |
| 19 | `drawConcentricRings` | 同心圆环（间距/粗细可配） | H/S |
| 20 | `drawDiagonalStripes` | 斜条纹（角度/间距/双色） | I/R |

#### 纹理组合规则

每种风格族默认叠加 1-2 个纹理：
- A (手账白底): `drawNotebookGrid` + `drawFilmGrain`(轻)
- B (黄底提醒): `drawFilmGrain`(轻)
- C (红色事件): `drawHalftoneDots`
- D (蓝绿信息): `drawNotebookGrid` + `drawDotGrid`
- E (极简金句): `drawNoiseTexture`(极轻) 或纯色
- F (复古胶片): `drawFilmGrain` + `drawVintagePaper`
- G (多巴胺): `drawPolkaDots`
- H (酸性设计): `drawConcentricRings` + `drawNoiseTexture`
- I (孟菲斯): `drawZigzagStripes` + `drawPolkaDots`
- J (国风): `drawRicePaper` + `drawInkSplatter`(轻)
- K (赛博朋克): `drawScanlines` + `drawNoiseTexture`
- L (日系清新): `drawWashiPaper`
- M (3D 渲染): `drawNoiseTexture`(轻)
- N (蒸汽波): `drawScanlines` + `drawDiagonalStripes`
- O (暗黑系): `drawFilmGrain` + `drawCrosshatch`(轻)
- P (像素风): `drawCheckerboard`
- Q (极光渐变): 渐变底 + `drawNoiseTexture`(轻)
- R (复古海报): `drawVintagePaper` + `drawFilmGrain`
- S (玻璃拟态): `drawNoiseTexture`(极轻)
- T (卡通插画): `drawPolkaDots` + `drawWatercolorWash`(轻)

---

### 2.2 阴影系统升级

新建 `lib/shadows.js`，统一管理所有阴影效果。

#### 阴影类型（10 个工具函数）

| # | 函数名 | 效果 | 参数 |
|---|--------|------|------|
| 1 | `drawSoftDropShadow` | 软投影（多层高斯模糊模拟） | rect, blur, offset, color, alpha |
| 2 | `drawHardDropShadow` | 硬投影（偏移纯色块） | rect, offset, color, alpha |
| 3 | `drawColoredGlow` | 彩色外发光（霓虹效果） | target, color, blur, spread |
| 4 | `drawInnerShadow` | 内阴影（inset 效果，模拟凹陷） | rect, blur, color |
| 5 | `drawText3DShadow` | 文字 3D 投影（多层偏移堆叠） | text, depth, color, direction |
| 6 | `drawLongShadow` | 长投影（扁平设计风格） | target, angle, length, color |
| 7 | `drawLayeredShadow` | 层叠阴影（2-4 层不同 blur） | rect, layers[] |
| 8 | `drawFloatingShadow` | 悬浮阴影（中间深边缘浅） | rect, elevation, color |
| 9 | `drawStickerShadow` | 贴纸阴影（微偏移 + 不规则边缘） | rect, color, alpha |
| 10 | `drawAmbientOcclusion` | 环境光遮蔽（贴纸与背景交界） | position, radius, color |

#### 应用规则

- **白卡面板**: `drawLayeredShadow` (3 层，模拟纸张厚度)
- **气泡面板**: `drawSoftDropShadow` + `drawStickerShadow`
- **撕纸面板**: `drawHardDropShadow`(微偏移)
- **标题文字**: `drawText3DShadow`(深色底) 或 `drawColoredGlow`(暗色底)
- **贴纸元素**: `drawStickerShadow` + `drawAmbientOcclusion`
- **印章**: `drawInnerShadow`(凹陷感)
- **霓虹风格 (K/N)**: `drawColoredGlow`

---

### 2.3 渐变系统升级

新建 `lib/gradients.js`，新增 12 个预设渐变生成器。

#### 渐变类型

| # | 函数名 | 效果 | 适用风格 |
|---|--------|------|---------|
| 1 | `createSunsetGradient` | 日落渐变（橙→粉→紫） | Q/N |
| 2 | `createAuroraGradient` | 极光渐变（绿→蓝→紫流动） | Q |
| 3 | `createNeonGlowGradient` | 霓虹发光渐变（暗底 + 亮色边） | K |
| 4 | `createMetallicGradient` | 金属渐变（金/银/铜色条） | O/R |
| 5 | `createChromeGradient` | 镀铬渐变（液态金属反光） | H |
| 6 | `createGlassGradient` | 玻璃渐变（半透明 + 高光条） | S/M |
| 7 | `createPastelWash` | 粉彩晕染（多色柔光混合） | L/T |
| 8 | `createDuotoneGradient` | 双色调（经典蓝/粉、红/蓝等） | F/R |
| 9 | `createRadialSphere` | 径向球体（3D 球面高光） | M |
| 10 | `createMeshGradient` | 网格渐变（多锚点色彩混合） | G/I |
| 11 | `createVignetteGradient` | 暗角渐变（中心亮边缘暗） | F/O |
| 12 | `createLightLeak` | 漏光效果（边缘彩色光晕） | F/N |

#### 应用规则

- 每种风格族绑定 1 个默认渐变叠加层
- 渐变通过 `ctx.globalAlpha` 控制强度（0.08-0.25）
- 渐变叠加在背景色之上、纹理之下

---

### 2.4 Canvas 贴纸升级（新增 30 个高精度手绘贴纸）

在 `index.html` 或新建 `src/stickers-canvas.js` 中实现。替代当前 9 个贴纸中的 6 个简陋版本，新增 30 个。

#### 第一组：3D 拟物类（10 个）

| # | 贴纸 ID | 名称 | 描述 |
|---|---------|------|------|
| 1 | `thumb3d_v2` | 3D 拇指点赞 | 增强版（多层渐变 + 高光 + 指甲细节） |
| 2 | `megaphone3d` | 3D 喇叭 | 镀铬质感（渐变 + 反光条） |
| 3 | `star3d` | 3D 立体星 | 五角星带厚度 + 高光 |
| 4 | `heart3d` | 3D 立体心 | 心形带厚度 + 渐变 |
| 5 | `fire3d` | 3D 火焰 | 多层火焰形状 + 发光 |
| 6 | `diamond3d` | 3D 钻石 | 多边形切割面 |
| 7 | `crown3d` | 3D 王冠 | 金/银质感 |
| 8 | `trophy3d` | 3D 奖杯 | 金属杯体 + 底座 |
| 9 | `balloon3d` | 3D 气球 | 带高光和绳结 |
| 10 | `giftbox3d` | 3D 礼物盒 | 带蝴蝶结 + 丝带 |

#### 第二组：文具便签类（8 个）

| # | 贴纸 ID | 名称 | 描述 |
|---|---------|------|------|
| 11 | `washiTape` | 和纸胶带 | 半透明条纹胶带 |
| 12 | `stickyNote` | 便利贴 | 带微翘角 + 阴影 |
| 13 | `paperClip` | 回形针 | 金属光泽 |
| 14 | `pushpin` | 图钉 | 红色/蓝色可选 |
| 15 | `realisticStamp` | 红印章 | 带纹理 + 不规则边缘 |
| 16 | `polaroidFrame` | 拍立得相框 | 白边 + 底部宽边 |
| 17 | `indexTab` | 索引标签贴 | 半圆 + 矩形 |
| 18 | `binderClip` | 长尾夹 | 黑色金属质感 |

#### 第三组：涂鸦标注类（6 个）

| # | 贴纸 ID | 名称 | 描述 |
|---|---------|------|------|
| 19 | `handDrawnArrow` | 手绘箭头 | 曲线箭头，多方向可选 |
| 20 | `handDrawnUnderline` | 手绘下划线 | 双线/波浪线可选 |
| 21 | `handDrawnCircle_v2` | 手绘圈线 | 增强版（双圈 + 不规则） |
| 22 | `doodleStar` | 涂鸦星星 | 不规则五角星 |
| 23 | `scribbleCloud` | 涂鸦云朵 | 对话/思考云 |
| 24 | `markerStrike` | 马克笔划掉 | 粗横线划掉效果 |

#### 第四组：卡哇伊/表情类（6 个）

| # | 贴纸 ID | 名称 | 描述 |
|---|---------|------|------|
| 25 | `cuteCatFace` | 萌猫脸 | 大眼 + 小嘴 + 胡须 |
| 26 | `cuteDogFace` | 萌狗脸 | 垂耳 + 圆眼 |
| 27 | `sparkleEyes` | 星星眼 | 大圆眼 + 星形瞳孔 |
| 28 | `angryFace` | 生气脸 | 倒眉 + 咬牙 |
| 29 | `shockedFace` | 震惊脸 | 大圆嘴 + 小圆眼 |
| 30 | `loveEyes` | 爱心眼 | 爱心形瞳孔 |

---

### 2.5 文字排版增强

在 `drawTemplateUserText` 基础上新增对比排版模式。

#### 排版模式

| 模式 | 触发条件 | 布局 |
|------|---------|------|
| `headline` | 文案 ≤ 4 字 | 超大字（max 240px），居中，单行 |
| `standard` | 文案 5-10 字 | 主标题 + 关键词双色（主 100% + 关键词 70%） |
| `subhead` | 文案 11-20 字 | 主标题 + 副标题双行，字号比 1.3:1 |
| `newspaper` | 文案 > 20 字 | 三行小字 + 首字放大 2.5× |

#### 字体混合策略

- 中文主标题：始终保持用户选择的字体
- 数字/英文：自动使用 `DM Serif Display`（衬线，形成对比）
- 标点符号：缩小 20% 并在基线下方偏移
- 关键词（后 2 字）：切换到 `FONT_MAP` 中相邻的对比字体

---

## 3. 第二阶段：图片素材库

> **目标**: 引入真实 PNG/WebP 图片素材，视觉质量接近稿定设计 60-70%
> **工作量**: 3 天
> **文件影响**: 新建 `public/stickers/`, `public/backgrounds/`, `lib/stickers.js`

### 3.1 贴纸素材收集（150-200 个 PNG/WebP）

新建 `public/stickers/` 目录，从免费可商用来源收集素材。

#### 素材分类与数量

| 分类 | 数量 | 内容 | 推荐来源 |
|------|------|------|---------|
| 📦 3D 渲染物体 | 25-30 | 拇指点赞、喇叭、信封、日历、时钟、放大镜、灯泡、奖杯、火箭、购物车、相机、手机、书本、地图标记 | Freepik, unDraw, Humaaans, Blush |
| ✏️ 手绘涂鸦 | 25-30 | 箭头（8 向）、圈线（3 种）、下划线（4 种）、星星（5 种）、对勾、叉号、问号、感叹号、对话框、云朵、闪电 | OpenClipart, SVGRepo |
| 📎 办公文具 | 20-25 | 胶带（6 色）、便利贴（5 色）、回形针（3 色）、图钉（4 色）、印章（6 种文字）、拍立得框、索引标签（4 色）、长尾夹 | Freepik, Pngtree |
| 😊 Emoji 替代 | 25-30 | 高质量放大版：🔥✨⭐💯🎉❤️😄😱👍👏🌟💪📌🔔🎵🌈🍀💡🎯🚀💎 | Twemoji, OpenMoji, Noto Emoji |
| 🎨 纹理贴片 | 15-20 | 撕纸边（4 方向）、水彩渍（5 种）、墨点（3 种）、咖啡渍（2 种）、蜡笔涂（3 种） | Freepik, Rawpixel |
| 🌸 装饰图案 | 20-25 | 花朵（5 种）、叶子（4 种）、几何形（6 种）、丝带（3 种）、边框角标（4 种） | Freepik, Vecteezy |
| 📷 相框/卡片 | 15-20 | 拍立得框（4 色）、胶卷框、手机框、票据框、标签卡（5 种） | Freepik |
| ✨ 特效元素 | 15-20 | 闪光（4 种）、爆炸（3 种）、泡泡（3 种）、光晕（5 种）、速度线（3 种） | Freepik |

**总计**: 160-200 个素材

#### 素材规格要求

- 格式：WebP（优先）或 PNG，必须带透明通道
- 分辨率：实际渲染尺寸的 2×（~300-500px，Canvas 中缩放到 100-250px）
- 单文件大小：< 20KB（WebP 压缩 quality 80%）
- 总体积：~3-5MB（延迟加载，按需加载）
- 版权：全部来自可商用免费来源（CC0 / MIT / Freepik free license with attribution）

### 3.2 背景纹理图（50-70 个预生成背景）

新建 `public/backgrounds/` 目录。

#### 背景分类

| 分类 | 数量 | 内容 |
|------|------|------|
| 📓 笔记本/纸张 | 10-12 | 方格纸（3 色）、横线纸（3 色）、点阵纸（2 色）、牛皮纸（2 色）、宣纸（2 色） |
| 🎨 纯色纹理 | 8-10 | 米白（带微噪点）、奶油黄、浅蓝、浅粉、浅绿、浅紫、浅灰、纯白 |
| 🌈 渐变底色 | 10-12 | 日落、极光、海洋、森林、薰衣草、蜜桃、薄荷、天空、火焰、霓虹紫 |
| 📐 几何图案 | 8-10 | 波点（2 密度）、条纹（3 方向）、格子（2 密度）、菱形、三角 |
| 🎬 特效底 | 8-10 | 胶片颗粒（2 密度）、暗角（2 强度）、漏光（3 色）、水彩晕染（3 色） |
| 🌸 装饰底纹 | 8-10 | 碎花、爱心、星星、圆点散落、波浪线、云朵 |

**总计**: 52-64 个背景纹理

#### 背景规格

- 格式：WebP（优先）或 JPG
- 分辨率：1242×1656（与输出相同，避免拉伸损失）
- 单文件大小：< 40KB（JPG quality 75%）
- 总体积：~2-3MB
- 使用方式：Canvas `drawImage` 铺底，然后叠加文字和贴纸

---

### 3.3 贴纸加载器

新建 `lib/stickers.js`，管理所有图片素材的加载、缓存和绘制。

```javascript
// 贴纸注册表结构
const STICKER_REGISTRY = {
  'thumb3d_gold': {
    file: 'stickers/3d/thumb-gold.webp',
    w: 200, h: 200,               // 实际像素尺寸
    displaySize: { short: 0.22, medium: 0.16, long: 0.10 },  // 占画布比例
    categories: ['3d', 'positive'],
    fallback: 'drawThumb3DSticker', // 加载失败时回退的 Canvas 函数
  },
  // ... 其余 150-200 个
};

// 风格族 → 贴纸候选池（30-50 个 per 风格）
const FAMILY_STICKER_POOL = {
  A: ['washiTape_beige', 'stickyNote_yellow', 'handDrawnCircle', ...],  // 40 个
  B: ['megaphone3d', 'stamp_hot', 'arrow_red', ...],                    // 40 个
  // ...
};
```

#### 核心 API

| 函数 | 用途 |
|------|------|
| `preloadStickersForFamily(family)` | 按风格族预加载所需贴纸（后台异步） |
| `getRandomStickers(family, count)` | 从候选池随机选取 `count` 个贴纸 |
| `drawStickerImage(ctx, stickerId, x, y, size, rotation)` | 在 Canvas 上绘制贴纸图片 |
| `isStickerLoaded(stickerId)` | 检查贴纸是否已加载到内存 |
| `getStickerFallbackFn(stickerId)` | 获取回退的 Canvas 绘制函数 |

#### 加载策略

1. 页面加载时：预加载所有风格族的第一张卡片所需的贴纸（~20 个）
2. 用户切换风格族时：后台预加载该族的贴纸缓存（~40 个）
3. 生成卡片时：优先使用已加载的图片贴纸，未加载的先用 Canvas 回退函数绘制，加载完成后自动替换
4. 使用 `createImageBitmap` 在 Worker 中异步解码，不阻塞主线程

---

### 3.4 模板槽位升级

#### `LOCKED_TEMPLATE_STYLES` 扩展

每个风格族的 `stickers` 数组从 **5 个扩展到 30-50 个**：

```javascript
const LOCKED_TEMPLATE_STYLES = {
  A: {
    // ...现有配置
    stickers: [
      // 3D 类 (10 个)
      'thumb3d_gold', 'thumb3d_blue', 'star3d_yellow', 'heart3d_red',
      'fire3d', 'crown3d_gold', 'trophy3d', 'balloon3d_pink',
      'giftbox3d_red', 'diamond3d',
      // 文具类 (8 个)
      'washiTape_beige', 'stickyNote_yellow', 'paperClip_silver',
      'pushpin_red', 'realisticStamp_red', 'polaroidFrame',
      'indexTab_blue', 'binderClip_black',
      // 涂鸦类 (6 个)
      'handDrawnArrow_red', 'handDrawnUnderline_double',
      'handDrawnCircle_rough', 'doodleStar', 'scribbleCloud', 'markerStrike_yellow',
      // 卡哇伊类 (6 个)
      'cuteCatFace', 'cuteDogFace', 'sparkleEyes', 'angryFace',
      'shockedFace', 'loveEyes',
      // emoji 类 (8 个)
      'emoji_fire', 'emoji_star', 'emoji_sparkles', 'emoji_hundred',
      'emoji_party', 'emoji_heart', 'emoji_clap', 'emoji_rocket',
      // 装饰类 (8 个)
      'flower_pink', 'leaf_green', 'geometric_circle', 'ribbon_red',
      'corner_bracket_gold', 'tape_piece', 'photoFrame_white',
      'badge_new',
      // 特效类 (4 个)
      'sparkle_gold', 'burst_comic', 'bubble_speech', 'glow_soft',
    ],  // 共 50 个候选
  },
  // B-T 同理，根据风格调整候选池内容...
};
```

#### 贴纸数量与位置随机规则

**数量规则（1-3 个）**：
- 40% 概率放 2 个贴纸
- 30% 概率放 1 个贴纸
- 30% 概率放 3 个贴纸

**位置槽位（3 个槽位，按需启用）**：

| 槽位 | 位置 | 大小比例 | 说明 |
|------|------|---------|------|
| **主视觉槽** (primary) | 右下或左下 | 画布 18-26% | 核心贴纸，如 3D 拇指/星星 |
| **边角槽** (corner) | 对角（与主槽相反） | 画布 10-16% | 次要贴纸，如胶带/标签 |
| **浮动槽** (float) | 文字边缘/留白区 | 画布 8-14% | 小型点缀，如箭头/圈线 |

**位置互斥规则**：
- 1 个贴纸 → 放入主视觉槽（右下/左下随机）
- 2 个贴纸 → 主视觉槽 + 边角槽（对角分布）
- 3 个贴纸 → 主视觉槽 + 边角槽 + 浮动槽（文字边缘）

**尺寸随文本长度退让**：
- short（短文案）：贴纸大尺寸（100% 槽位比例）
- medium：贴纸缩小至 75%
- long：贴纸缩小至 55% 并推至边角
- xl：贴纸缩小至 40% 并只用 1 个槽位

#### 用户交互：左右滑动选择贴纸

在卡片下方或侧边增加贴纸选择条：
- 用户看到卡片后，可以**左右滑动**切换贴纸组合
- 每次滑动替换 1-3 个贴纸（保持槽位数量不变，换内容）
- 滑动时 0.3s 淡入淡出过渡
- 移动端支持触摸滑动，桌面端支持鼠标拖拽或滚轮

---

## 4. 第三阶段：AI 辅助生成增强

> **目标**: 让每次生成与文案内容更匹配，减少手动调整
> **工作量**: 1 天
> **文件影响**: 新建 `lib/color-ai.js`，修改 `index.html`

### 4.1 文案 → 色调智能推荐

```javascript
// 关键词 → 色调规则引擎（纯客户端，无 API 调用）
const TONE_RULES = [
  { keywords: ['紧急','通知','注意','重要','必看','警告'], tone: 'urgent', palette: 'redPop' },
  { keywords: ['治愈','温柔','慢慢','安静','生活','日常'], tone: 'healing', palette: 'creamWarm' },
  { keywords: ['学习','知识','技巧','方法','教程','指南'], tone: 'study', palette: 'blueLined' },
  { keywords: ['活动','福利','免费','折扣','限时','优惠'], tone: 'promo', palette: 'yellowPop' },
  { keywords: ['科技','AI','智能','数字','未来','新'], tone: 'tech', palette: 'neonCyan' },
  { keywords: ['美食','好吃','推荐','打卡','探店'], tone: 'food', palette: 'warmTape' },
  { keywords: ['穿搭','美妆','护肤','变美','好看'], tone: 'beauty', palette: 'pinkPop' },
  { keywords: ['旅行','出游','景点','打卡','周末'], tone: 'travel', palette: 'mintCream' },
  // ... 共 30-40 条规则
];
```

### 4.2 Emoji 智能匹配

```javascript
// 200 词中文关键词 → emoji 映射
const EMOJI_MAP = {
  '学习': '📚', '知识': '🧠', '技巧': '💡', '方法': '🔧',
  '美食': '🍽️', '好吃': '😋', '推荐': '⭐', '必看': '👀',
  // ... 200 个映射
};
```

### 4.3 文案长度 → 排版模式自动切换

已在 2.5 中描述，此处新增一个智能前置判断函数 `analyzeTextAndRoute(text)`。

---

## 5. 第四阶段：架构优化与性能

> **目标**: 代码可维护、100 张卡片 < 5 秒
> **工作量**: 2 天

### 5.1 代码拆分

当前 `index.html` 5945 行，拆分为以下模块：

```
cover-maker/
├── index.html              # HTML 壳 + CSS (~1500 行)
├── src/
│   ├── main.js             # 入口：初始化、事件绑定、状态管理
│   ├── templates.js        # LOCKED_TEMPLATE_STYLES + TEMPLATE_VARIANTS + drawLockedTemplateCover
│   ├── renderer.js         # renderCard / buildOneCard / generate / batchGenerate
│   ├── stickers-canvas.js  # 30 个 Canvas 手绘贴纸函数
│   ├── layout.js           # gdTextBlock / gdLines / gdWrapLines / fs / drawWrappedText
│   ├── ui.js               # DOM 操作：toast / modal / 批量面板 / 卡片网格
│   └── auth.js             # Supabase 账号/会员/权限
├── lib/
│   ├── features.js         # 12 个基础特征（已有，保持不变）
│   ├── colors.js           # 配色库 + hexToRgb + contrastRatio（已有）
│   ├── textures.js         # **新建** — 20 个纹理函数
│   ├── shadows.js          # **新建** — 10 个阴影工具
│   ├── gradients.js        # **新建** — 12 个渐变生成器
│   ├── stickers.js         # **新建** — 图片贴纸加载器 + 注册表
│   └── color-ai.js         # **新建** — 文案分析 + 色彩推荐
├── public/
│   ├── stickers/           # **新建** — 150-200 个 WebP 贴纸
│   └── backgrounds/        # **新建** — 50-70 个 WebP 背景纹理
└── DESIGN_LOCK.md          # 更新 v5.0
```

### 5.2 性能优化

- 贴纸图片使用 `createImageBitmap` 异步解码
- 背景纹理图预加载并缓存为 `Image` 对象
- 文字测量结果缓存（`Map<string, number>`，key = `text+fontSize+font`）
- 批量模式使用 `requestIdleCallback` 或分片渲染（每帧 5 张）
- 贴纸图片懒加载：只加载当前可见/即将使用的

### 5.3 版本共存

- URL 参数 `?v=4` → 使用旧 `drawLockedTemplateCover`（回退）
- URL 参数 `?v=5`（默认）→ 使用新 `drawTemplateEnhancedCover`
- 通过 feature flag 逐步启用 v5 功能

---

## 6. 实施计划与里程碑

### 里程碑 1：Canvas 增强（第 1-3 天）

| 任务 | 工作量 | 输出 |
|------|--------|------|
| 新建 `lib/textures.js` + 20 个纹理函数 | 1 天 | 纹理库完整可用 |
| 新建 `lib/shadows.js` + 10 个阴影工具 | 0.5 天 | 阴影系统完整可用 |
| 新建 `lib/gradients.js` + 12 个渐变生成器 | 0.5 天 | 渐变系统完整可用 |
| 模板槽位从 1 → 3 个（随机 1-3） | 0.5 天 | 多贴纸布局 |
| 新增 30 个 Canvas 贴纸 | 0.5 天 | 贴纸选择大幅增加 |
| 文字多模式排版 | 0.5 天 | 4 种排版模式 |

**验证**: 生成 100 张卡片，目视检查纹理/阴影/渐变/贴纸均有明显改善。

### 里程碑 2：图片素材集成（第 4-6 天）

| 任务 | 工作量 | 输出 |
|------|--------|------|
| 收集 150-200 个贴纸素材 | 1 天 | 素材库就绪 |
| 收集/生成 50-70 个背景纹理 | 0.5 天 | 背景库就绪 |
| 新建 `lib/stickers.js` 贴纸加载器 | 1 天 | API 完整可用 |
| `LOCKED_TEMPLATE_STYLES.stickers` 扩展到 30-50 个 | 0.5 天 | 风格族贴纸池 |
| 用户左右滑动选择贴纸交互 | 0.5 天 | 用户可手动换贴纸 |

**验证**: 素材加载成功率 > 95%，回退 Canvas 版本视觉可接受。

### 里程碑 3：AI 辅助（第 7 天）

| 任务 | 工作量 | 输出 |
|------|--------|------|
| 新建 `lib/color-ai.js` | 0.5 天 | 文案→色调推荐 |
| Emoji 智能匹配（200 词映射） | 0.25 天 | 不再随机选 emoji |
| 文案分析 + 排版模式路由 | 0.25 天 | 自动选最佳排版 |

**验证**: 输入不同类型文案（活动/知识/美食等），检查色调和 emoji 是否匹配。

### 里程碑 4：架构 + 性能（第 8-9 天）

| 任务 | 工作量 | 输出 |
|------|--------|------|
| 代码拆分为 7+ 个 JS 模块 | 1 天 | 结构清晰 |
| 性能优化（缓存/分片/预加载） | 0.5 天 | 100 张 < 5 秒 |
| `drawTemplateEnhancedCover` v5.0 入口 | 0.5 天 | 新旧版本共存 |

---

## 7. 验证清单

### 功能验证

- [ ] 短文案（≤4 字）自动使用"爆炸式"大字布局
- [ ] 长文案（>20 字）自动使用"报纸式"小字布局
- [ ] 每种风格族 5 个变体视觉差异明显（不同模板骨架）
- [ ] 每张卡片有 1-3 个贴纸（随机数量 + 随机位置）
- [ ] 背景有纹理/渐变（非纯色）
- [ ] 文字有大小对比（主标题 + 关键词双色/双字号）
- [ ] 左右滑动可切换贴纸组合
- [ ] 批量模式 10 条文案 × 选中风格族生成正常
- [ ] 下载 PNG 分辨率 1242×1656
- [ ] 移动端 480px 卡片网格正常
- [ ] URL `?v=4` 可回退到旧版本

### 性能验证

- [ ] 单次生成 100 张卡片 < 5 秒
- [ ] 贴纸图片首次加载 < 2 秒（预加载后 < 100ms）
- [ ] 批量模式 20 条文案 × 5 风格 < 8 秒
- [ ] 内存占用 < 200MB（含所有贴纸缓存）

### 设计验证

- [ ] 遵守 DESIGN_LOCK.md 全部 7 条规则
- [ ] 每张卡片只显示用户输入文字
- [ ] 贴纸不遮挡主文字
- [ ] 文字与背景对比度 ≥ WCAG AA (4.5)

---

> **文档维护**: 每次阶段完成后更新本文档的实施状态。
> **关联文件**: `DESIGN_LOCK.md`, `STYLE_GUIDE_v3.0.md`, `CHANGELOG.md`
> **代码分支**: `dev/v5.0`
