# 小红书封面生成器 · 图片生成逻辑完整文档 v5.0

> **版本**: 基于 2026-07-06 部署的 v5.0 代码
> **文件**: `index.html`（~6930 行）+ `lib/` 下 7 个 JS 模块
> **输出**: 1242×1656 像素 PNG（3:4 小红书标准比例）
> **核心入口**: `drawLockedTemplateCover()` → 被 `drawTemplateEnhancedCover()` 包装

---

## 一、总体架构

```
用户输入文案
    ↓
generate() 或 generateBatchCovers()
    ↓
buildOneCard() → 创建 DOM 元素
    ↓
renderCard() → 创建 1242×1656 Canvas
    ↓
STYLE_FUNCS[family]() → 版本路由
    ↓
drawTemplateEnhancedCover() → v5.0 入口
    ↓
drawLockedTemplateCover() → 核心渲染
    ↓
Canvas 2D 绘制（6 个阶段）
    ↓
用户可下载 PNG / 复制到剪贴板
```

### 文件职责

| 文件 | 职责 |
|------|------|
| `index.html` | HTML 结构 + CSS + 所有渲染逻辑 (~6930行) |
| `lib/features.js` | 12 个基础特征函数（手绘圈、云朵高光、方格纸、半色调、对话气泡、荧光笔、撕边便签、印章、3D emoji、漫画放射线、马克笔字、卡通贴纸） |
| `lib/colors.js` | 配色库（20 套风格配色 + 42 组速查色 + 对比度/hex 工具） |
| `lib/textures.js` | 20 个纹理函数（纸张纹理 8 + 特效纹理 7 + 几何纹理 5） |
| `lib/shadows.js` | 10 个阴影工具（软投影/硬投影/霓虹发光/内阴影/文字3D/长投影/层叠阴影/悬浮阴影/贴纸阴影/环境光遮蔽） |
| `lib/gradients.js` | 12 个渐变生成器（日落/极光/霓虹/金属/镀铬/玻璃/粉彩/双色调/径向球体/网格/暗角/漏光） |
| `lib/stickers.js` | 146 贴纸注册表 + 图片加载器 + 回退机制 |
| `lib/stickers-canvas.js` | 30 个高精度 Canvas 手绘贴纸 |
| `lib/color-ai.js` | AI 文案分析（15 调性规则 + 194 Emoji 映射） |

---

## 二、核心数据结构

### 2.1 全局状态 STATE

```javascript
STATE = {
  text: '',              // 用户输入文案
  font: 'black',         // 当前字体选择 (black/serif/qingke/...)
  families: Set(...),    // 启用的风格族 (A-T, 默认全部)
  seed: 0,               // 全局随机种子
  activeCount: 0,        // 当前生成的卡片数
  currentLayoutMode: '', // 当前排版模式 (headline/standard/subhead/newspaper)
  textAnalysis: null,    // AI 文案分析结果
}
```

### 2.2 20 个风格族配置 LOCKED_TEMPLATE_STYLES

每个风格族包含：

```javascript
{
  template: 'notebook',   // 模板类型 (notebook/warning/event/info/quote/poster/dopamine/darkPop/memphis/classic/soft)
  name: '手账白底',        // 中文名
  bg: ['#FBFAF4', ...],   // 5 个背景色（对应 5 个变体）
  text: '#111111',         // 文字色
  accent: '#E6213D',       // 强调色
  second: '#FFEC47',       // 次要色
  stickers: ['catCard',..., 共39个], // 贴纸候选池
}
```

| 风格族 | template | 典型背景色 | 文字色 |
|--------|----------|-----------|--------|
| A 手账白底 | notebook | #FBFAF4 等米白色 | #111111 |
| B 黄底提醒 | warning | #FFE45C 等黄色 | #111111 |
| C 红色事件 | event | #ED0108 等红色 | #FFFFFF |
| D 蓝绿信息 | info | #DDF7F3 等蓝绿 | #111111 |
| E 极简金句 | quote | #FFFFFF 等白色 | #111111 |
| F 复古胶片 | poster | #3A2A1A 等深色 | #F8F1E8 |
| G 多巴胺 | dopamine | #FF6B9D 等高饱和 | #111111 |
| H 酸性设计 | darkPop | #0A0A0A 等纯黑 | #FFFFFF |
| I 孟菲斯 | memphis | #FFE5EC 等粉彩 | #111111 |
| J 国风 | classic | #F5EBD8 等宣纸 | #2D2520 |
| K 赛博朋克 | darkPop | #1A0A2E 等暗紫 | #FFFFFF |
| L 日系清新 | soft | #FFF2F6 等柔和色 | #222222 |
| M 3D 渲染 | soft | #EAF2FF 等渐变 | #111111 |
| N 蒸汽波 | darkPop | #2B1055 等紫色 | #FFFFFF |
| O 暗黑系 | poster | #050505 等纯黑 | #F5F0E8 |
| P 像素风 | info | #D8F3FF 等亮色 | #111111 |
| Q 极光渐变 | soft | #DFF6FF 等渐变 | #111111 |
| R 复古海报 | poster | #F5E6CF 等米色 | #21170F |
| S 玻璃拟态 | info | #EAF4FF 等柔和 | #111111 |
| T 卡通插画 | dopamine | #FFE7F0 等粉彩 | #111111 |

### 2.3 5 个模板骨架 TEMPLATE_VARIANTS

```javascript
[
  { id: 'burst',  name: '爆炸底', text: {x:0.50, y:0.42, w:0.72, h:0.48, max:178, lh:1.06}, sticker: {x:0.76, y:0.77, ...} },
  { id: 'card',   name: '白卡底', text: {x:0.50, y:0.48, w:0.68, h:0.48, max:166, lh:1.10}, sticker: {x:0.24, y:0.78, ...} },
  { id: 'bubble', name: '气泡底', text: {x:0.48, y:0.44, w:0.66, h:0.44, max:172, lh:1.08}, sticker: {x:0.79, y:0.27, ...} },
  { id: 'paper',  name: '撕纸底', text: {x:0.50, y:0.52, w:0.70, h:0.50, max:162, lh:1.12}, sticker: {x:0.77, y:0.79, ...} },
  { id: 'frame',  name: '边框底', text: {x:0.50, y:0.46, w:0.64, h:0.50, max:168, lh:1.09}, sticker: {x:0.22, y:0.24, ...} },
]
```

每种风格族 × 5 个变体 = 100 张不同的卡片。

### 2.4 8 种字体 FONT_MAP

```javascript
{
  black:    { family: '"Noto Sans SC",...',    weight: 900, scale: 1.00 },  // 思源黑体
  serif:    { family: '"Noto Serif SC",...',    weight: 900, scale: 1.00 },  // 思源宋体
  qingke:   { family: '"ZCOOL QingKe HuangYou",...', weight: 400, scale: 1.08 },  // 站酷庆科
  xiaowei:  { family: '"ZCOOL XiaoWei",...',    weight: 400, scale: 1.08 },  // 站酷小薇
  kuai:     { family: '"ZCOOL KuaiLe",...',      weight: 400, scale: 1.12 },  // 站酷快乐
  mashan:   { family: '"Ma Shan Zheng",...',     weight: 400, scale: 1.18 },  // 马善政
  longcang: { family: '"Long Cang",...',         weight: 400, scale: 1.20 },  // 龙藏体
  zhimang:  { family: '"Zhi Mang Xing",...',     weight: 400, scale: 1.18 },  // 志芒行书
}
```

---

## 三、渲染管线（6 个阶段）

每张卡片通过 `drawLockedTemplateCover(ctx, text, palette, options, family)` 渲染，严格按 6 个阶段顺序执行。

### 阶段 0：参数解析

```javascript
variant = options.vi % 5              // 0-4, 对应 5 个模板骨架
style = LOCKED_TEMPLATE_STYLES[family] // 该风格族配置
tpl = TEMPLATE_VARIANTS[variant]       // 该变体的模板骨架
load = getTextLoad(text)               // 文本负载: short/medium/long/xl
fontConf = FONT_MAP[STATE.font]        // 用户选择的字体
bg = style.bg[variant % 5]             // 背景色
accent = AI推荐色 || style.accent       // 强调色(AI 优先)
```

### 阶段 1：背景色填充

```javascript
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);
```

### 阶段 2：渐变叠加 `applyFamilyGradients()`

| style.template | 对应风格族 | 叠加效果 |
|---------------|-----------|---------|
| `darkPop` | K/N/H | `createNeonGlowGradient` 替代纯色背景 + `createLightLeak` 漏光 |
| `poster` | F/O/R | `createVignetteGradient` 暗角 (30-55%) + F/R 额外漏光 |
| `dopamine` | G/T | `createMeshGradient` 四象限网格渐变 (14-25%) |
| `soft` | L/M/Q | `createPastelWash` 粉彩晕染 (16-30%) + Q 额外 `createAuroraGradient` |
| `event` | C | `createDuotoneGradient` 双色调 (12%, 仅偶数 variant) |
| 其他 | A/B/D/E/I/J/P/S | 不加渐变，保持纯色背景 |

### 阶段 3：背景图案 `drawTemplateBackground()`

| style.template | 背景图案 |
|---------------|---------|
| `notebook/info/quote/soft/classic` | 横线笔记本纸（58-74px 间距） |
| `warning/event/dopamine/memphis/darkPop` | 从中心向外的放射线 (12-22 条) |
| `poster/classic` | 双层边框（外框 8px + 内框 2px） |
| `burst` 模板 (tpl.id === 'burst') | `drawTemplateBurst()` 爆炸多边形 + 椭圆描边 |
| `frame` 模板 (tpl.id === 'frame') | `drawTemplateCornerMarks()` 四角 L 形标记 + 细边框 |

### 阶段 4：纹理叠加 `applyFamilyTextures()`

根据 style.template 和 family 叠加 1-2 个纹理：

| family | 模板类型 | 纹理 |
|--------|---------|------|
| A | notebook | `drawNotebookGrid` 方格纸 + `drawFilmGrain` 胶片颗粒(轻) |
| B | warning | `drawFilmGrain` 胶片颗粒(极轻) |
| C | event | `drawHalftoneDots` 半色调网点 |
| D | info | `drawNotebookGrid` 方格纸 + `drawDotGrid` 点阵纸 |
| E | quote | `drawNoiseTexture` 噪点(极轻) 或纯色 |
| F | poster | `drawFilmGrain` + `drawVintagePaper` 旧纸张(暗角+泛黄+污渍) |
| G | dopamine | `drawPolkaDots` 波尔卡圆点 |
| H | darkPop | `drawConcentricRings` 同心圆环 + `drawNoiseTexture` |
| I | memphis | `drawZigzagStripes` Z字条纹 + `drawPolkaDots` |
| J | classic | `drawRicePaper` 宣纸(纤维+水渍) + `drawInkSplatter` 墨点(轻) |
| K | darkPop | `drawScanlines` 扫描线 + `drawNoiseTexture` |
| L | soft | `drawWashiPaper` 和纸(细纤维+半透明层) |
| M | soft | `drawNoiseTexture` 噪点(轻) |
| N | darkPop | `drawScanlines` + `drawDiagonalStripes` 斜条纹 |
| O | poster | `drawFilmGrain` + `drawCrosshatch` 交叉排线(轻) |
| P | info | `drawCheckerboard` 棋盘格 |
| Q | soft | `drawNoiseTexture` 噪点(极轻) |
| R | poster | `drawVintagePaper` 旧纸张 + `drawFilmGrain` |
| S | info | `drawNoiseTexture` 噪点(极轻) |
| T | dopamine | `drawPolkaDots` + `drawWatercolorWash` 水彩晕染(轻) |

### 阶段 5：面板绘制 `drawTemplatePanel()` + `drawTemplatePanelShadows()`

#### 5a. 面板形状

| tpl.id | 面板形状 |
|--------|---------|
| `card` | 白色圆角矩形卡片，5 组不同尺寸/旋转角度，带 `drawLayeredShadow` 3层投影 |
| `bubble` | 圆角矩形 + 三角形尾巴气泡，带 `drawSoftDropShadow` + `drawStickerShadow` |
| `paper` | 3 层旋转叠加的纸片 (`drawTemplatePaperStack`)，第一层带 `drawHardDropShadow` |
| `frame` | 半透明圆角矩形框，带 `drawFloatingShadow` |
| `burst` | 爆炸多边形 (`drawTemplateBurst`) + 椭圆描边 |

#### 5b. 深色底额外处理

深色底风格 (event/darkPop/白色文字) 在文字区域叠加 `drawColoredGlow` 霓虹发光。

### 阶段 6：贴纸 `drawMultiStickerSlots()`

#### 贴纸数量（概率）
- 30% → 1 个
- 40% → 2 个
- 30% → 3 个
- 超长文案 (xl) → 强制 1 个

#### 3 个槽位

| 槽位 | 位置 | 短文案尺寸 | 中文案 | 长文案 |
|------|------|-----------|--------|--------|
| **主视觉槽** (primary) | 右下/左下 (随机) | 24% 画布 | 18% | 13% |
| **边角槽** (corner) | 与主槽对角 | 16% 画布 | 12% | 9% |
| **浮动槽** (float) | 顶部中央 | 12% 画布 | 10% | 7% |

#### 贴纸来源

从 `LOCKED_TEMPLATE_STYLES[family].stickers`（39 个候选）中随机不重复选取。每个贴纸绘制前先尝试加载 `lib/stickers.js` 注册表中的图片素材，失败则回退到 Canvas 手绘函数（`lib/stickers-canvas.js` 的 30 个 + 原始 9 个）。

#### 贴纸阴影

每个槽位绘制前：
1. `drawStickerShadow()` — 微偏移 + 模糊
2. `drawAmbientOcclusion()` — 贴纸底部接触阴影

---

## 四、文字渲染（阶段 7-8）

### 阶段 7：用户文字 `drawTemplateUserText()`

根据文案长度自动选择 4 种排版模式之一（`analyzeTextLayout()`）。

#### 模式 1：headline（≤4 字）

```
- 超大字居中（max 260px）
- 4 种排版模式：headline/standard/subhead/newspaper
- 字体混合：ASCII 字母/数字自动切换为 DM Serif Display
- 标点符号缩小 80% + 下移 10%
```

#### 模式 2：standard（5-10 字）

```
- 主标题正常绘制（max 190px, gdTextBlock）
- 取最后 2 字作为"关键词"
- 关键词用 accent 色 + 对比字体（70% 字号）
- 关键词放在文字块下方
```

#### 模式 3：subhead（11-20 字）

```
- 拆为 2 行: 第一行 100% 字号 / 第二行 70% 字号
- 副标题用 second 颜色
```

#### 模式 4：newspaper（>20 字）

```
- 小字多行（max 114px, lineHeight 1.18）
- 首字下沉 2.5× (accent 色 + 对比字体)
- 底部细横线分隔
```

#### 文字渲染流程 `gdTextBlock()`

```
1. gdLines(text) — 智能拆行:
   ≤7 字 → 1 行
   ≤12 字 → 2 行
   >12 字 → 3 行（按 34%/34%/32% 长度分配）

2. 递减字号搜索（从 maxSize 往下降）:
   每步检查: 所有行宽 ≤ 可用宽度 && 总高度 ≤ 可用高度
   找到最大可行字号

3. 字体视觉补偿 (fontConf.scale)

4. 如果 >18px 但不满足高度约束，继续缩到 14px 保证完整展示

5. 绘制:
   - 逐行 fillText + 可选 strokeText (描边)
   - 居中/左对齐/右对齐
   - 如果 fontMixing=true 且文本 <20 字:
     逐字符绘制，ASCII→DM Serif Display，标点→缩放
```

### 阶段 8：强调词 `drawTemplateEmphasis()`

```
- 取文案最后 2 字 (gdAccentWord)
- 用 accent 色 + 描边绘制在固定位置
- 5 个变体各有一个预设位置和字号
- 长文案 (long/xl) 跳过此阶段
```

---

## 五、9 个原始贴纸函数（旧版，保留兼容）

| 函数名 | 贴纸内容 | 绘制方式 |
|--------|---------|---------|
| `drawThumb3DSticker` | 3D 拇指点赞 | 多层渐变椭圆 + 椭圆阴影 |
| `drawEmojiAngry3DSticker` | 3D 愤怒 emoji | 圆形 + 渐变 + 表情元素 |
| `drawComicFistSticker` | 漫画拳头 | 路径 + 渐变填充 |
| `drawBigEyesSticker` | 大眼萌 | 圆 + 椭圆 + 高光 |
| `drawPaintRollerRealSticker` | 油漆滚筒 | 矩形 + 渐变 + 手柄 |
| `drawPlumpCatSticker` | 胖猫 | 圆 + 三角耳 + 面部元素 |
| `drawCatPhotoCardSticker` | 猫咪拍立得 | 矩形 + 猫脸绘制 |
| `drawDogFrameSticker` | 狗相框 | 圆形 + 矩形框 + 狗脸 |
| `drawPlushMegaphoneSticker` | 毛绒喇叭 | 椭圆 + 锥形 + 手柄 |

---

## 六、30 个新 Canvas 贴纸（v5.0 新增）

### 3D 拟物类（10 个）
| ID | 函数 | 描述 |
|----|------|------|
| thumb3d_v2 | `drawThumb3Dv2Sticker` | 增强版拇指（5 层渐变 + 指甲高光 + 指节纹路） |
| megaphone3d | `drawMegaphone3DSticker` | 镀铬喇叭（锥形 + 手柄 + 椭圆口） |
| star3d | `drawStar3DSticker` | 金色五角星（径向渐变 + 厚度描边 + 中心高光） |
| heart3d | `drawHeart3DSticker` | 红心（贝塞尔曲线 + 径向渐变 + 左上高光） |
| fire3d | `drawFire3DSticker` | 3 层火焰（外红→中橙→内黄 + 蓝色焰心） |
| diamond3d | `drawDiamond3DSticker` | 钻石（六边形顶面 + 四边形面 + 切割线 + 高光） |
| crown3d | `drawCrown3DSticker` | 王冠（5 尖角 + 弧形底座 + 红宝石 + 高光） |
| trophy3d | `drawTrophy3DSticker` | 奖杯（U 形杯体 + 2 个半圆把手 + 梯形底座） |
| balloon3d | `drawBalloon3DSticker` | 气球（椭圆球体 + 径向渐变 + 绳结 + 曲线绳子） |
| giftbox3d | `drawGiftbox3DSticker` | 礼物盒（3 面立方体 + 十字丝带 + 蝴蝶结） |

### 文具便签类（8 个）
| ID | 函数 | 描述 |
|----|------|------|
| washiTape | `drawWashiTapeSticker` | 和纸胶带（半透明 + 条纹 + 旋转） |
| stickyNote | `drawStickyNoteSticker` | 便利贴（渐变底 + 右下翘角 + 横线） |
| paperClip | `drawPaperClipSticker` | 回形针（金属渐变路径 + 高光点） |
| pushpin | `drawPushpinSticker` | 图钉（径向渐变塑料头 + 金属针尖） |
| realisticStamp | `drawRealisticStampSticker` | 红印章（12 点不规则圆 + 虚线框 + 白色 HOT 字） |
| polaroidFrame | `drawPolaroidFrameSticker` | 拍立得框（白框 + 灰色照片区 + 底部宽边 + 小太阳） |
| indexTab | `drawIndexTabSticker` | 索引标签（半圆 + 矩形 + 白色 TAG 字） |
| binderClip | `drawBinderClipSticker` | 长尾夹（黑色金属体 + 2 个银色金属丝手柄） |

### 涂鸦标注类（6 个）
| ID | 函数 | 描述 |
|----|------|------|
| handDrawnArrow | `drawHandDrawnArrowSticker` | 手绘箭头（二次贝塞尔箭身 + 三角形箭头 + 抖动） |
| handDrawnUnderline | `drawHandDrawnUnderlineSticker` | 双线下划线（上层粗半透明 + 下层细正弦波） |
| handDrawnCirclev2 | `drawHandDrawnCirclev2Sticker` | 双圈线（外圈粗 8 段抖动 + 内圈细椭圆弧） |
| doodleStar | `drawDoodleStarSticker` | 涂鸦星（不规则五角星 + 黑色粗描边） |
| scribbleCloud | `drawScribbleCloudSticker` | 云朵（5 个圆 + 浅灰描边 + 内部 "..."） |
| markerStrike | `drawMarkerStrikeSticker` | 马克笔划掉（半透明粗线 + 两端扩散 + 内层深色窄线） |

### 卡哇伊/表情类（6 个）
| ID | 函数 | 描述 |
|----|------|------|
| cuteCatFace | `drawCuteCatFaceSticker` | 萌猫脸（圆脸 + 三角耳 + 大椭圆眼 + W 形嘴 + 胡须） |
| cuteDogFace | `drawCuteDogFaceSticker` | 萌狗脸（椭圆脸 + 垂耳 + 圆眼 + 椭圆鼻 + 舌头） |
| sparkleEyes | `drawSparkleEyesSticker` | 星星眼（圆脸 + 星形瞳孔 + 红晕） |
| angryFace | `drawAngryFaceSticker` | 生气脸（圆脸 + 倒八字眉 + 锯齿嘴 + 青筋符号） |
| shockedFace | `drawShockedFaceSticker` | 震惊脸（圆脸 + 小圆眼 + O 形嘴 + 蓝色汗滴） |
| loveEyes | `drawLoveEyesSticker` | 爱心眼（圆脸 + 心形瞳孔 + 微笑 + 红晕） |

---

## 七、字体计算逻辑

### `gdLines(text)` — 智能拆行
```
输入文案 → 检查是否有显式换行(\n) → 有则直接使用
→ 无则按长度智能拆分:
  ≤7 字 → [全文] (1行)
  ≤12 字 → [前半, 后半] (2行)
  >12 字 → [34%, 34%, 32%] (3行)
```

### `gdTextBlock()` — 字号搜索 + 绘制
```
1. lines = gdLines(text)
2. 递减搜索: for (size = maxSize; size >= minSize; size -= 4)
     ctx.font = `${weight} ${size}px ${family}`
     wrapped = gdWrapLines(ctx, lines, wrapW)
     if (最宽行 ≤ wrapW && 总高度 ≤ maxH - pad*2) break
3. 精细搜索: while (size > absoluteMinSize)
     if (满足约束) break; else size -= 1
4. 逐行绘制:
     for each line:
       calculate x (center/left/right alignment)
       if stroke: ctx.strokeText(line, x, y)
       ctx.fillText(line, x, y)
```

### `getTextLoad(text)` — 文本负载评估
```
visibleChars = text去空格长度
lineCount = 行数
longestLine = 最长行去空格长度
score = visibleChars + max(0, lineCount-2)*5 + max(0, longestLine-10)*0.75

score >= 54 → 'xl'
score >= 38 → 'long'
score >= 24 → 'medium'
否则 → 'short'
```

---

## 八、卡片生成流程

### `generate()` — 单文案生成
```
1. 读取输入框文案
2. 如果含 "888" 分隔符 → 走批量模式
3. STATE.text = text
4. AI 文案分析: STATE.textAnalysis = analyzeTextAndRoute(text)
5. 高亮推荐风格族 tab (红色"荐"徽章)
6. setTimeout 30ms 后:
   for each family in STATE.families (A-T, 按字母排序):
     创建 section 标签 (显示风格族名称)
     创建 grid 容器
     for vi = 0..4:
       card = buildOneCard(family, vi, text, STATE.seed)
       grid.appendChild(card)
7. 恢复按钮状态
```

### `buildOneCard()` — 构造单张卡片 DOM
```
1. 创建 div.card-wrap
2. 设置 dataset: family, vi, seed, batchIndex, cardIndex, sourceText
3. 创建 canvas 元素
4. renderCard(canvas, family, vi, text, seedOffset)
5. 创建 actions div (⬇下载 / 📋复制 / ↻换一换按钮)
6. 创建 sticker-nav div (◀ 贴纸N个 ▶)
7. 绑定点击/触摸事件
8. wrap.appendChild(canvas) → appendChild(actions) → appendChild(stickerNav)
9. return wrap
```

### `renderCard()` — 渲染单张 Canvas
```
1. canvas.width = 1242, canvas.height = 1656
2. palette = pickPalette(family, vi, seedOffset)
3. fn = STYLE_FUNCS[family] // 版本路由 (v5 or v4)
4. fn(ctx, text, palette, { seed: vi + seedOffset, vi })
5. assertTemplateSafeBounds(ctx, 54, family, vi) // 安全检查
6. 如果耗时 > 80ms: console.warn
```

### `generateBatchCovers()` — 批量生成
```
1. 获取选中/全部批量文案
2. 为每条文案创建一个 batch-group section
3. 每条文案 × 选中的风格族 = N 张卡片
4. 每组支持: 全选/下载选中/下载本组全部
5. 全局: 下载全部选中/下载全部/发送到短视频
```

---

## 九、交互功能

### 换一换 `rerollOne(wrap)`
```
1. 推进 vi: (vi + 1) % 5 (切换到下一个模板变体)
2. 推进 seed: seed + 5
3. 重新 buildOneCard
4. 0.3s 淡入淡出过渡
```

### 贴纸切换 `rerollStickersOnly(wrap, canvas, direction)`
```
1. 保持 family/vi/text 不变
2. 用新 seed 重新 renderCard (贴纸会随机重选)
3. 更新 sticker-nav 指示器
4. 0.15s 闪烁反馈
```

### 全部换一换 `rerollAll()`
```
1. STATE.seed += 5
2. 重新生成所有卡片
```

### 版本切换
```
默认 → v5.0 (drawTemplateEnhancedCover → drawLockedTemplateCover)
?v=4 → v4.0 (直接 drawLockedTemplateCover, 无纹理/阴影/渐变/AI等新功能)
```

---

## 十、配色系统

### 风格族 → 调色板映射
```javascript
FAMILY_TO_PALETTE = {
  A: 'handDrawn',    B: 'collage',      C: 'comicPop',
  D: 'newspaper',    E: 'minimal',      F: 'retroFilm',
  G: 'dopamine',     H: 'acid',         I: 'memphis',
  J: 'chinese',      K: 'cyberpunk',    L: 'japanese',
  M: 'threeD',       N: 'vaporwave',    O: 'dark',
  P: 'pixel',        Q: 'aurora',       R: 'vintagePoster',
  S: 'glass',        T: 'cartoon',
}
```

每个调色板含 5-6 个子风格（如 handDrawn 含 beigeLined/whiteGrid/warmTape/creamCoffee/blueLined/graySketch），`pickPalette()` 按 vi + seedOffset 循环选取。

---

## 十一、AI 文案分析

### `analyzeTextTone(text)` — 色调推荐
15 条规则，按关键词命中数评分，返回得分最高的调性：

| 调性 | 关键词示例 | 推荐色 |
|------|-----------|--------|
| urgent | 紧急/通知/注意/必看 | #ED0108 |
| healing | 治愈/温柔/日常/小确幸 | #C8A050 |
| study | 学习/知识/教程/笔记 | #2677DE |
| promo | 活动/福利/免费/折扣 | #ED0108 |
| tech | 科技/AI/智能/代码 | #00F5FF |
| food | 美食/好吃/火锅/甜品 | #FF6333 |
| beauty | 穿搭/美妆/护肤/时尚 | #F78DE9 |
| travel | 旅行/出游/攻略/风景 | #4ECDC4 |
| career | 职场/工作/赚钱/理财 | #1A1A1A |
| health | 健身/减肥/运动/健康 | #2AB673 |
| emotion | 情感/恋爱/分手/心动 | #FF6B9D |
| funny | 搞笑/幽默/沙雕/梗 | #FFE066 |
| home | 装修/家居/收纳/改造 | #8B6F47 |
| photo | 摄影/拍照/调色/vlog | #D4A574 |
| music | 音乐/歌单/演唱会/乐器 | #B967FF |

匹配到的 accentColor 会覆盖 `drawLockedTemplateCover` 中的默认值。

### `matchEmojiForText(text)` — Emoji 匹配
194 组中文关键词→Emoji 映射，遍历匹配，返回前 3 个不重复结果。

---

## 十二、关键技术细节

### Canvas 尺寸
- 逻辑像素: 1242×1656
- 显示: CSS `aspect-ratio: 3/4` + `canvas { width: 100%; height: 100% }` 自适应缩放
- 下载: `canvas.toBlob('image/png')` → 高清原图

### 性能优化
- 文字测量缓存 (`_measureCache`): 上限 2000 条，超限清一半
- 每次新生成时清空缓存 (`clearMeasureCache()`)
- 单张渲染目标 < 50ms，超过 80ms 打印警告
- 图片贴纸异步预加载，5 秒超时静默回退到 Canvas

### DESIGN_LOCK 约束
1. 文字第一：用户输入文字完整展示，装饰不遮挡
2. 禁止额外文案：画面只出现用户输入的文字
3. 同一风格 5 张 = 5 个模板变体（burst/card/bubble/paper/frame）
4. 贴纸只能进模板槽位
5. 新增风格必须先新增模板定义

### 移动端适配
- ≤480px: 单列布局，触摸目标 ≥44px
- ≤767px: tabs 横向滚动
- 贴纸导航支持触摸滑动（30px 阈值）

---

> **文档版本**: v5.0
> **生成日期**: 2026-07-06
> **代码行数**: index.html ~6930 行 + lib/ 7 模块 ~3000 行
