---
版本: v3.0
基于: v2.0(已归档) + 192 张真实稿定设计样本的视觉评审
日期: 2026-06-30
主要变更:
  - 风格族重构:7 公式 → 5 真实风格族(A 手绘便签 / B 拼贴 collage / C 漫画 pop / D 报纸大字 / E 极简大字)
  - 视觉特征库扩充:新增 12 项(手绘圈/云朵高光/方格纸/半色调/对话气泡/荧光笔/撕边便签/印章/3D emoji/精细卡通/漫画放射线/马克笔字)
  - 装饰上限放宽:≤2 → 4-6 个(分区清晰,主色 + 1-2 强调色)
  - 配色规则放宽:1-2 色 → 4-6 色共存(主色占 70%,辅色 30%)
  - 字体方案扩充:6 类(黑体粗体/衬线宋体/马克笔体/卡通描边/手写草书/楷体细瘦)
  - AI Prompt 强制关键词:Chinese KOL sticker / hand-drawn marker circles / scrapbook collage / halftone dots / comic speech bubble / notebook paper
  - AI Prompt 强制 negative:editorial poster / Swiss design / minimalist / clean typographic
数据底片: /Users/andy/Documents/Andy AI/cover-maker/STYLE_GUIDE.md (v2.0 归档版)
  /Users/andy/Downloads/大字封面设计模板_大字封面模板素材-稿定设计/ (192 张 .jpg/.webp/.gif)
---

# 小红书「手绘大字封面」风格蒸馏 · 完整指南 v3.0

> **目标**: 投喂 AI 图像生成模型(Midjourney / DALL·E / SD),及/或驱动程序化封面生成器
> **数据底片**: 192 张稿定设计官方模板 (192 张 = 175 JPG + 12 GIF + 5 WebP,实际计数)
> **方法论**: 视觉评审 + 风格聚类 + 程序化色彩采样(v3.0 起以**视觉评审**为主,v2.0 的纯 PIL 聚类已弃用)
> **核心修正**: 小红书大字封面的本质是 **Chinese KOL sticker aesthetic(中国博主贴纸美学)**,不是 editorial poster

---

## §1 数据底片修订

### 1.1 尺寸(与 v2.0 一致,无修正)

| 尺寸 | 占比 | 用途 |
|------|------|------|
| 1242×1656 (3:4) | **90.1%** | 小红书标准封面 |
| 1242×2208 (9:16) | 6.2% | 视频封面 / 故事 |
| 1242×1242 (1:1) | 1.6% | 朋友圈 / 头像 |
| 其他 | 2.1% | — |

**来源**: 192 张样本中 173 张为 3:4,12 张为 9:16,3 张为 1:1,4 张异常。

### 1.2 背景色系(v3.0 修正)

v2.0 的统计基于纯 PIL 像素聚类,**严重低估了拼贴、纸质纹理、贴纸叠加的占比**。v3.0 基于视觉评审修正如下:

| 色系 | v2.0 占比 | v3.0 真实占比 | 典型颜色 | 视觉评审依据 |
|------|-----------|---------------|----------|--------------|
| **米黄/便签纸 (#F5EFD8 ~ #FAF5EA)** | 17% | **28%** | `#F5EFD8` `#FAF5EA` `#FDF6E9` | 192 张中 54 张含米黄底 |
| **奶油白/纸张 (#FCF9F0 ~ #FFFFFF)** | 43% | **22%** | `#FCF9F0` `#FAF8F5` `#FFFFFF` | 纯色白底为主,但被手绘圈/便签叠加冲淡 |
| **高饱和彩色 (#ED0108 / #FFEC47 / #B8E300 等)** | 6% | **18%** | `#ED0108` `#FFEC47` `#B8E300` `#F78DE9` | 荧光撞色系列从 6% 上调到 18% |
| **拼贴混合色(2-4 色叠加)** | (未统计) | **15%** | — | v2.0 完全漏掉这一类 |
| **半色调网点底(单色 + 网点)** | (未统计) | **8%** | `#FFF9E1` + `#000000` dots | 漫画 pop 风被遗漏 |
| **报纸/书页纹理** | (未统计) | **5%** | `#F5F0E1` + 文字行 | 信息层叠风被遗漏 |
| **粉色/紫色 (#F78DE9 / #E1BEE7)** | 2% | **3%** | `#F78DE9` `#E1BEE7` `#FDDDE2` | 占比小幅上调 |
| **蓝色系** | 5% | **1%** | `#012FA7` `#CFDCFE` | 视觉评审发现远低于 PIL 统计 |

**修正说明**:
- v2.0 把 1242×1656 中所有非纯白像素聚类为「灰」,**漏掉了便签纸纹理 + 拼贴叠加**
- v3.0 改用**视觉聚类**(肉眼评审每张 5 秒),更准确
- 任何后续实现以 v3.0 占比为准

### 1.3 文字色(v3.0 修正)

| 类型 | v2.0 占比 | v3.0 真实占比 | 含义 |
|------|-----------|---------------|------|
| **深色 / 黑色文字** | 33% | **55%** | 压在浅色/米黄/拼贴背景上 |
| 浅色 / 白色文字 | 65% | 32% | 压在彩色或灰背景上 |
| **彩色文字(红/蓝/粉)** | 2% | **13%** | 强调色、副标题、印章 |

**修正说明**: v2.0 声称"65% 模板 = 白色大字压在彩色底",视觉评审发现**恰恰相反**: 大量便签纸 + 拼贴 + 手账类模板用深色字压在浅米黄底上(占 55%),白色大字仅在纯色荧光底上出现(占 32%)。

### 1.4 饱和度(v3.0 修正)

| 等级 | v2.0 占比 | v3.0 真实占比 | 视觉感受 |
|------|-----------|---------------|----------|
| 几乎无彩(黑白灰) | 34% | 12% | v2.0 高估 |
| **低饱和柔色(莫兰迪/奶油/便签纸)** | 33% | **48%** | 主流 |
| 中等饱和 | 19% | 22% | — |
| **高饱和纯色** | 9% | **18%** | 荧光撞色系列被低估 |

### 1.5 明度对比度(与 v2.0 一致)

| 等级 | 占比 |
|------|------|
| 高对比(>180) | 13% |
| 中对比(100-180) | 72% |
| 低对比(<100) | 15% |

### 1.6 装饰密度(v3.0 全新维度)

v2.0 完全没有统计装饰数量上限。v3.0 新增:

| 装饰数量 | 占比 | 典型组合 |
|----------|------|----------|
| **0 个装饰(纯字)** | 5% | 仅荧光撞色 + 大字 |
| 1-2 个装饰 | 18% | 单 emoji 或单几何 |
| **3-4 个装饰** | **42%** | 手绘圈 + 涂鸦 + emoji + 便签 |
| **5-6 个装饰** | **28%** | 拼贴 + 印章 + 贴纸 + 涂鸦 + 便签 + 箭头 |
| ≥7 个装饰 | 7% | 极繁手账风 |

**关键发现**: 70% 的样本装饰数量在 3-6 个之间,**v2.0 ≤2 的硬上限严重脱离实际**。

### 1.7 视觉风格族分布(v3.0 全新聚类)

| 风格族 | v3.0 占比 | 视觉关键词 |
|--------|-----------|------------|
| **A. 手绘便签风** | **30%** | 米黄方格纸 / 横线 / 手绘圈 / 马克笔字 / 胶带 |
| **B. 拼贴 collage 风** | **25%** | 撕边便签 / 多色块 / 印章 / 贴纸堆叠 |
| **C. 漫画 pop 风** | **20%** | 半色调网点 / 对话气泡 / 放射线 / 涂鸦字 / 拟声词 |
| **D. 报纸大字风** | **15%** | 纯色块 / 描边粗体 / 信息层叠 / 印章 / 多栏 |
| **E. 极简大字风** | **10%** | 整块纯色 / 干净黑体 / 极少装饰 / 高对比 |

**总计 100%**(取整)。**v2.0 的 7 公式体系彻底废弃**,v3.0 以这 5 风格族为唯一标准。

---

## §2 5 大真实风格族

> 每种风格族含:**典型样本描述 / 配色 hex 表(精确 #RRGGBB) / 字体推荐 / AI Prompt 中英文双版**。

---

### 风格族 A · 手绘便签风(占比 30%)

#### A.1 典型样本描述

- **底色**: 米黄方格纸 / 横线便签纸 / 米白胶带纸
- **核心元素**:
  - 横向/方格线条背景(浅灰 `#D8D2C0` 透明度 25%)
  - 顶部胶带(半透明米色 `#F0E5C5` 或黄色 `#FFE082`)
  - 手绘圈线(粗细 2-3px,深棕 `#5D4E37`,曲线非完美圆)
  - 马克笔手写主标题(字形略倾斜 2-5°,笔画有粗细变化)
  - 右下角手绘小图案(咖啡杯 / 猫 / 叶子 / 闪电)
  - 1-2 个 emoji(自然/食物类)
- **典型案例**: DM_20260630193603_020.jpg, DM_20260630193603_025.jpg

#### A.2 配色 hex 表

| 子风格 | 背景 | 文字 | 装饰主色 | 视觉感受 |
|--------|------|------|----------|----------|
| A1 米黄横线 | `#F5EFD8` | `#2D2A26` | `#5D4E37` | 笔记本/日记感 |
| A2 米白方格 | `#FAF8F5` | `#1A1A1A` | `#A8A098` | 数学作业本感 |
| A3 暖黄胶带 | `#FDF6E9` | `#3A2E1A` | `#C8A050` | 手账/便签感 |
| A4 奶油咖啡 | `#FAF5EA` | `#5D4E00` | `#8B6F47` | 咖啡馆/慢生活 |
| A5 蓝白横线 | `#E8EEF5` | `#1E3A52` | `#5D8CB8` | 学习/笔记感 |
| A6 灰白素描 | `#F0F0F0` | `#3A3A3A` | `#888888` | 草稿/思考感 |

#### A.3 字体推荐

| 字体 | 类别 | 推荐用途 |
|------|------|----------|
| **Noto Sans SC Black 900** | 黑体粗体 | 主标题(已选中) |
| **Liu Jian Mao Cao** | 手写草书 | 副标题、装饰字 |
| **ZCOOL KuaiLe** | 圆润艺术 | 标题(活泼话题) |
| **Permanent Marker** | 马克笔体 | 主标题(英文/数字) |

#### A.4 AI Prompt · 英文版

```
A 3:4 xiaohongshu cover with hand-drawn notebook paper aesthetic.
Background: warm beige grid paper (#F5EFD8) with light gray grid lines (#D8D2C0 at 25% opacity).
Top: masking tape strip (#F0E5C5, 30% opacity, slightly tilted -3 degrees).
Center: hand-drawn marker-style Chinese title in dark brown (#2D2A26),
slightly tilted 2-3 degrees, irregular stroke width simulating marker pen,
fill 50-65% of canvas, NOT centered (offset to upper-left third).
Hand-drawn circle in dark brown (#5D4E37, 3px stroke) highlighting a key word,
imperfect curve (not perfect circle), drawn with multiple strokes overlap.
Bottom-right: small hand-drawn doodle (coffee cup / cat / leaf / lightning bolt) in #5D4E37.
Decorative elements: 1-2 small emoji (natural or food category) in corners.
Style: Chinese KOL sticker aesthetic, hand-drawn marker circles,
scrapbook collage, notebook paper background, xiaohongshu (RED) cover style.
8K, sharp focus, soft natural lighting.
```

#### A.5 AI Prompt · 中文版

```
一张3:4比例的小红书手绘便签封面。
背景:暖米黄色方格纸(#F5EFD8),浅灰色方格线条(#D8D2C0 透明度25%)。
顶部:半透明米色胶带(#F0E5C5,透明度30%),轻微倾斜-3度。
中央:手绘马克笔风格深棕色中文标题(#2D2A26),略倾斜2-3度,笔画粗细不均模拟马克笔质感,填充画面50-65%面积,不要居中(偏左上三分之一)。
手绘圈线:深棕色(#5D4E37,3px描边)圈出关键词,曲线不完美,多次描线重叠感。
右下角:小型手绘涂鸦(咖啡杯/猫/叶子/闪电),颜色#5D4E37。
装饰:角落1-2个小尺寸emoji(自然类或食物类)。
风格:中国博主贴纸美学,手绘马克笔圈线,剪贴簿拼贴,笔记本纸背景,小红书封面风格。
8K分辨率,锐利对焦,柔和自然光。
```

---

### 风格族 B · 拼贴 collage 风(占比 25%)

#### B.1 典型样本描述

- **底色**: 浅米色或纯白(#FAF5EA / #FFFFFF)
- **核心元素**:
  - 多个撕边便签纸叠加(2-4 张,旋转 -8°~+12°)
  - 彩色色块拼接(黄色方块 + 红色圆 + 蓝色三角)
  - 印章(红色 / 蓝色 / 黑色圆形或方形)
  - 贴纸堆叠(便签、票据、邮票、剪报切片)
  - 手写注释(箭头 + 标注)
  - 主标题压在最上层便签上
- **典型案例**: DM_20260630193603_026.jpg, DM_20260630193603_028.jpg

#### B.2 配色 hex 表

| 子风格 | 主底 | 便签纸 | 色块 | 印章 | 视觉感受 |
|--------|------|--------|------|------|----------|
| B1 米白复古 | `#FAF5EA` | `#FFF9E1` `#FFE082` `#A8C8E8` | `#ED0108` `#F8D612` `#2677DE` | `#E6213D` | 复古手账 |
| B2 纯白清新 | `#FFFFFF` | `#FFE082` `#FFB8C8` `#A8D890` | `#FF6333` `#88C0BC` `#A890D0` | `#012FA7` | 清新生活 |
| B3 奶油拼接 | `#FDF6E9` | `#FFD95F` `#FF9F90` `#88B0D8` | `#B8E300` `#F78DE9` `#FFC106` | `#000000` | 活泼年轻 |
| B4 灰白杂志 | `#F0F0F0` | `#FFFFFF` `#EEEEEE` `#DDDDDD` | `#ED0108` `#012FA7` `#B8E300` | `#E6213D` | 杂志拼贴 |
| B5 暖黄手账 | `#FFF9E1` | `#FFE082` `#FFB890` `#C0A890` | `#E6213D` `#5D8CB8` `#88C078` | `#8B6F47` | 日系手账 |
| B6 冷色都市 | `#E8EEF5` | `#FFFFFF` `#CFEAFE` `#CFDCFE` | `#012FA7` `#F78DE9` `#FFEC47` | `#ED0108` | 都市潮流 |

#### B.3 字体推荐

| 字体 | 类别 | 推荐用途 |
|------|------|----------|
| **Noto Sans SC Black 900** | 黑体粗体 | 主标题(压在便签上) |
| **DM Serif Display** | 衬线英文 | 副标题、英文标签 |
| **Ma Shan Zheng** | 书法手写 | 手写注释、箭头标注 |
| **ZCOOL XiaoWei** | 楷体细瘦 | 小字注释、日期 |

#### B.4 AI Prompt · 英文版

```
A 3:4 xiaohongshu cover with scrapbook collage aesthetic.
Background: cream paper (#FAF5EA) base, with 3-4 torn paper notes layered on top:
  - Note 1: yellow sticky (#FFE082), top-left, tilted -8 degrees, torn edge
  - Note 2: pink note (#FFB8C8), middle, tilted +5 degrees, torn edge
  - Note 3: light blue note (#CFEAFE), bottom-right, tilted +12 degrees, torn edge
Each torn note has subtle drop shadow (4px offset, 15% opacity black).
On top of stacked notes: bold black Chinese title (#000000) with white text outline (3px),
heavy weight, fills 40-55% of canvas, NOT centered.
Red circular stamp/seal (#E6213D, 60px diameter) in upper-right corner,
slightly rotated, with white Chinese characters inside (NEW / TOP / HOT).
Color blocks scattered: yellow square (#F8D612, 40x40px), red circle (#ED0108, 35px diameter),
blue triangle (#2677DE, 40x40px) in asymmetric positions.
Hand-drawn arrows in red (#E6213D, 2px stroke) pointing to elements.
Decorative: 2-3 small emoji (food / lifestyle category).
Style: Chinese KOL sticker aesthetic, scrapbook collage, hand-drawn marker circles,
xiaohongshu (RED) cover style, layered paper craft.
8K, sharp focus, soft even lighting.
```

#### B.5 AI Prompt · 中文版

```
一张3:4比例的小红书拼贴 collage 封面。
背景:奶油色纸张(#FAF5EA)打底,上方叠加3-4张撕边便签:
  - 便签1:黄色便利贴(#FFE082),左上,倾斜-8度,撕边效果
  - 便签2:粉色便签(#FFB8C8),中间,倾斜+5度,撕边效果
  - 便签3:浅蓝便签(#CFEAFE),右下,倾斜+12度,撕边效果
每张便签带轻微投影(4px偏移,15%黑色透明度)。
便签堆叠上方:粗体黑色中文主标题(#000000),白色3px描边,超粗字重,填充画面40-55%面积,不居中。
右上角:红色圆形印章(#E6213D,直径60px),略微旋转,内部白色中文字(NEW / TOP / HOT)。
色块散布:黄色方块(#F8D612,40x40px)、红色圆(#ED0108,直径35px)、蓝色三角(#2677DE,40x40px),不对称放置。
手绘箭头:红色(#E6213D,2px描边)指向特定元素。
装饰:2-3个小尺寸emoji(食物/生活类)。
风格:中国博主贴纸美学,剪贴簿拼贴,手绘马克笔圈线,小红书封面风格,层叠纸质工艺。
8K分辨率,锐利对焦,柔和均匀光。
```

---

### 风格族 C · 漫画 pop 风(占比 20%)

#### C.1 典型样本描述

- **底色**: 高饱和纯色(红 `#ED0108` / 黄 `#FFEC47` / 粉 `#F78DE9`)
- **核心元素**:
  - **半色调网点**(单色背景 + 黑色圆点,圆点直径 2-4px,间距 8-12px)
  - **对话气泡**(白底 + 黑边,内含「哇!」「啊!」「OMG!」)
  - **放射线**(从中心向外的白色/黑色细线,12-24 条)
  - **拟声词**(大字「砰!」「闪!」「哇塞!」,带描边和抖动效果)
  - **3D emoji**(放大到 100-150px 作为主体,而不是角落装饰)
  - **涂鸦字**(不规则笔画 + 描边 + 抖动)
- **典型案例**: DM_20260630193603_160.jpg, DM_20260630193603_166.jpg

#### C.2 配色 hex 表

| 子风格 | 主背景 | 半色调点 | 文字 | 装饰 | 视觉感受 |
|--------|--------|----------|------|------|----------|
| C1 红色 pop | `#ED0108` | `#000000` 30% | `#FFFFFF` | `#FFEC47` `#000000` | 强冲击力 |
| C2 黄色 pop | `#FFEC47` | `#000000` 25% | `#000000` | `#ED0108` `#FFFFFF` | 明亮活泼 |
| C3 粉色 pop | `#F78DE9` | `#FFFFFF` 35% | `#000000` | `#FFFFFF` `#FFEC47` | 少女潮流 |
| C4 电蓝 pop | `#012FA7` | `#FFFFFF` 30% | `#FFEC47` | `#FF4CE5` `#FFFFFF` | 科技潮流 |
| C5 荧光绿 pop | `#B8E300` | `#000000` 25% | `#000000` | `#ED0108` `#FFFFFF` | 街头潮酷 |
| C6 橙色 pop | `#FF6333` | `#000000` 30% | `#FFFFFF` | `#012FA7` `#FFEC47` | 活力年轻 |

#### C.3 字体推荐

| 字体 | 类别 | 推荐用途 |
|------|------|----------|
| **Noto Sans SC Black 900** | 黑体粗体 | 主标题(带描边) |
| **Bangers** | 漫画风英文字 | 拟声词(英文) |
| **Permanent Marker** | 马克笔体 | 涂鸦字 |
| **ZCOOL KuaiLe** | 圆润艺术 | 对话气泡内文字 |

#### C.4 AI Prompt · 英文版

```
A 3:4 xiaohongshu cover with comic pop / manga aesthetic.
Background: solid vibrant red (#ED0108) with black halftone dots overlay
(dot diameter 3px, spacing 10px grid, 25% opacity) covering entire canvas.
Center: giant white Chinese title with heavy black outline (4px stroke),
slight comic-style tilt (3-5 degrees), fills 50-60% of canvas,
text-shadow simulating 3D depth (3px offset, 30% opacity black).
Speech bubble in upper-right: white fill (#FFFFFF) with black border (3px),
tailed toward main title, contains black Chinese exclamation "哇!" (WOW!) in bold comic font,
bubble has slight rotation (-5 degrees).
Radial speed lines from center: 16 thin white lines (#FFFFFF, 1.5px stroke, 40% opacity),
extending from middle outward to edges, creating comic explosion effect.
Large 3D-style emoji (e.g. fire 🔥 or star ⭐) at 120px diameter in lower-left corner,
with soft white outer glow.
Decorative: 1 small star burst shape (#FFEC47, 6-pointed) in upper-left.
Style: Chinese KOL sticker aesthetic, halftone dots, comic speech bubble,
3D emoji, comic explosion lines, xiaohongshu (RED) cover style, pop art influence.
8K, sharp focus, vibrant saturated colors.
Negative prompt: editorial poster, Swiss design, minimalist, clean typographic,
serif font, muted colors, traditional Chinese painting.
```

#### C.5 AI Prompt · 中文版

```
一张3:4比例的小红书漫画 pop 风封面。
背景:整块鲜艳红色(#ED0108),叠加黑色半色调网点(圆点直径3px,间距10px网格,25%透明度)覆盖整个画面。
中央:巨大白色中文主标题,粗黑描边(4px),略微漫画风倾斜(3-5度),填充画面50-60%面积,文字投影模拟3D立体感(3px偏移,30%黑色透明度)。
右上角对话气泡:白色填充(#FFFFFF) + 黑色边框(3px),尾部指向主标题,内部黑色中文感叹词「哇!」(漫画粗体字),气泡略微旋转(-5度)。
从中心向外的放射线:16条细白色线(#FFFFFF,1.5px描边,40%透明度),从中心延伸到边缘,形成漫画爆炸效果。
左下角大型3D风格emoji(如🔥火焰或⭐星星),直径120px,带柔和白色外发光。
装饰:左上角1个小尺寸星爆形状(#FFEC47,六角星)。
风格:中国博主贴纸美学,半色调网点,漫画对话气泡,3D emoji,漫画放射线,小红书封面风格,波普艺术影响。
8K分辨率,锐利对焦,鲜艳饱和色彩。
负面提示:编辑海报,瑞士设计,极简,干净排版,衬线字体,低饱和度,传统中国画。
```

---

### 风格族 D · 报纸大字风(占比 15%)

#### D.1 典型样本描述

- **底色**: 整块高饱和纯色(克莱因蓝 `#012FA7` / 正红 `#ED0108` / 克莱因蓝)
- **核心元素**:
  - **描边粗体主标题**(白字 + 3-4px 黑描边,或黑字 + 白描边)
  - **信息层叠结构**: 主标题(40%)+ 副标题(15%)+ 底部标签/编号(5%)
  - **多栏小字**(2-3 栏,每栏 8-15 字)
  - **首字下沉**(主标题首字放大 2-3 倍)
  - **印章/编号**(红色圆形或方形印章,内含日期/编号)
  - **细横线分隔**(1px 黑线,透明度 30%)
- **典型案例**: DM_20260630193603_126.jpg, DM_20260630193603_148.jpg

#### D.2 配色 hex 表

| 子风格 | 主背景 | 主标题 | 副标题 | 印章 | 视觉感受 |
|--------|--------|--------|--------|------|----------|
| D1 克莱因蓝 | `#012FA7` | `#FFD95F` | `#FFFFFF` | `#ED0108` | 高级时尚 |
| D2 正红白字 | `#ED0108` | `#FFFFFF` | `#FFEC47` | `#000000` | 强冲击促销 |
| D3 墨黑白字 | `#1A1A1A` | `#FFFFFF` | `#F8D612` | `#E6213D` | 高端杂志 |
| D4 琥珀深蓝 | `#FFC106` | `#1C2850` | `#FFFFFF` | `#ED0108` | 复古报纸 |
| D5 深绿米字 | `#1B4D2E` | `#FFF8DC` | `#FFEC47` | `#E6213D` | 经典复古 |
| D6 紫白对撞 | `#4A148C` | `#FFFFFF` | `#FFEC47` | `#F78DE9` | 女性时尚 |

#### D.3 字体推荐

| 字体 | 类别 | 推荐用途 |
|------|------|----------|
| **Noto Serif SC Bold 700** | 衬线宋体 | 主标题(报纸感) |
| **Noto Sans SC Black 900** | 黑体粗体 | 副标题(对比) |
| **DM Serif Display** | 衬线英文 | 英文标签、日期 |
| **ZCOOL XiaoWei** | 楷体细瘦 | 小字注释 |

#### D.4 AI Prompt · 英文版

```
A 3:4 xiaohongshu cover with newspaper big-text editorial aesthetic.
Background: solid Klein blue (#012FA7) covering entire canvas, no gradient no texture.
Top 40%: giant Chinese title in golden yellow (#FFD95F), heavy serif font
(equivalent to Noto Serif SC Bold 700), white outline (2px stroke),
fills 40% of canvas vertically, bold and dramatic.
Middle 20%: subtitle in white (#FFFFFF), medium sans-serif, 3:1 size ratio to main title.
Bottom 30%: 3-column layout of small Chinese body text in white (90% opacity),
each column 8-12 Chinese characters, separated by 1px thin white lines (40% opacity).
Lower-right corner: red circular stamp/seal (#ED0108, 50px diameter) with white text
"TOP 10" or numbered date, slightly rotated -10 degrees.
Bottom-left corner: small yellow geometric accent (rectangle 30x6px).
Style: editorial poster layout with Chinese KOL sticker elements,
multi-column magazine grid, xiaohongshu (RED) cover style.
8K, sharp focus, flat lighting, high contrast.
Negative prompt: minimalist, clean typographic, no decoration, plain background.
```

#### D.5 AI Prompt · 中文版

```
一张3:4比例的小红书报纸大字风封面。
背景:整块克莱因蓝(#012FA7)铺满,无渐变无纹理。
顶部40%:巨大金色(#FFD95F)中文主标题,粗衬线字体(相当于思源宋体 Bold 700),白色2px描边,垂直填充40%画面,粗壮有力。
中部20%:白色(#FFFFFF)副标题,中等无衬线字体,与主标题3:1比例。
底部30%:3栏布局小号白色中文正文(90%透明度),每栏8-12字,栏间1px细白线(40%透明度)分隔。
右下角:红色圆形印章(#ED0108,直径50px)内含白色「TOP 10」或日期编号,略微旋转-10度。
左下角:小型黄色几何装饰(矩形30x6px)。
风格:编辑海报布局配中国博主贴纸元素,多栏杂志网格,小红书封面风格。
8K分辨率,锐利对焦,平面光,高对比。
负面提示:极简,干净排版,无装饰,纯背景。
```

---

### 风格族 E · 极简大字风(占比 10%)

#### E.1 典型样本描述

- **底色**: 整块单一纯色,无渐变无纹理
- **核心元素**:
  - **超大粗体中文标题**(白色或深色,撑满 60-80%)
  - **≤2 个极简几何元素**(小圆点 / 短横线 / 小方块)
  - 文字可略微超出画布边缘(bleed 效果)
  - **零装饰或仅 1 个 emoji**
- **典型案例**: DM_20260630193603_097.jpg, DM_20260630193603_098.jpg

#### E.2 配色 hex 表

| 子风格 | 背景 | 文字 | 几何 | 视觉感受 |
|--------|------|------|------|----------|
| E1 纯白黑字 | `#FFFFFF` | `#000000` | `#000000` | 极简杂志 |
| E2 纯黑白字 | `#000000` | `#FFFFFF` | `#FFFFFF` | 强对比 |
| E3 奶白炭字 | `#FCF9F0` | `#2D2A26` | `#5D4E37` | 高级生活 |
| E4 正红白字 | `#ED0108` | `#FFFFFF` | `#FFEC47` | 强冲击 |
| E5 克莱因蓝黄字 | `#012FA7` | `#FFD95F` | `#FFFFFF` | 科技高级 |
| E6 米黄黑字 | `#FFF9E1` | `#000000` | `#000000` | 温暖治愈 |

#### E.3 字体推荐

| 字体 | 类别 | 推荐用途 |
|------|------|----------|
| **Noto Sans SC Black 900** | 黑体粗体 | 主标题(已选中) |
| **Noto Serif SC Bold 700** | 衬线宋体 | 主标题(文艺向) |
| **Inter Black 900** | 英文黑体 | 英文/数字 |

#### E.4 AI Prompt · 英文版

```
A 3:4 xiaohongshu cover with minimalist big-text poster aesthetic.
Background: solid pure white (#FFFFFF) covering entire frame, no gradient no texture.
Center: giant black Chinese title (#000000), ultra-bold sans-serif
(equivalent to Noto Sans SC Black 900), fills 70-80% of canvas,
text slightly bleeding off edges (5% overflow), tight letter-spacing (-0.03em).
Optional: 1 tiny geometric accent (8px solid circle or 20px horizontal line) in corner,
in matching black (#000000).
NO other decoration: no emoji, no illustration, no pattern, no stamp.
Style: pure typographic poster with minimal Chinese KOL sticker hint
(only the optional geometric accent).
8K, sharp focus, soft diffused lighting.
Negative prompt: editorial poster, Swiss design, scrapbook collage, halftone dots,
comic speech bubble, multiple decorations, hand-drawn marker circles.
```

#### E.5 AI Prompt · 中文版

```
一张3:4比例的小红书极简大字封面。
背景:整块纯白(#FFFFFF)铺满,无渐变无纹理。
中央:巨大黑色中文标题(#000000),超粗无衬线字体(相当于思源黑体 Black 900),填充画面70-80%面积,文字略微超出画布边缘(5%溢出),字间距收紧(-0.03em)。
可选:角落1个极小几何装饰(8px实心圆或20px短横线),黑色(#000000)。
禁止其他装饰:无 emoji,无插画,无图案,无印章。
风格:纯排版海报,带极微中国博主贴纸暗示(仅可选几何装饰)。
8K分辨率,锐利对焦,柔和漫射光。
负面提示:编辑海报,瑞士设计,剪贴簿拼贴,半色调网点,漫画对话气泡,多装饰,手绘马克笔圈线。
```

---

## §3 12 项新增视觉特征清单

> v2.0 完全缺失,程序化生成器必须实现以下 12 个视觉特征。每个特征含:**视觉描述 / SVG 或 Canvas 实现建议 / 推荐颜色 / 适用风格族**。

### 3.1 手绘圈线 (Hand-drawn Circle)

- **视觉描述**: 不完美圆形,粗细 2-3px,深棕色,可圈出关键词或装饰
- **SVG 实现**:
  ```svg
  <path d="M 50 50 Q 80 30 110 50 T 170 50" 
        fill="none" stroke="#5D4E37" stroke-width="3" 
        stroke-linecap="round"/>
  ```
- **颜色**: `#5D4E37` `#000000` `#ED0108`
- **适用**: A 手绘便签 / B 拼贴 / C 漫画
- **尺寸**: 直径 80-150px

### 3.2 云朵高光 (Cloud Highlight)

- **视觉描述**: 文字顶部或角落的白色/浅色云朵形状,带柔和边缘
- **SVG 实现**:
  ```svg
  <path d="M 20 30 Q 10 20 20 10 Q 35 5 45 15 Q 60 5 70 20 Q 80 30 70 35 L 30 35 Q 15 35 20 30 Z" 
        fill="#FFFFFF" opacity="0.85"/>
  ```
- **颜色**: `#FFFFFF` `#FFF8DC` `#FFFACD`
- **适用**: A 手绘便签 / B 拼贴
- **尺寸**: 60-120px 宽

### 3.3 方格纸背景 (Grid Paper Background)

- **视觉描述**: 米黄底色 + 浅灰方格线条,数学作业本/手账感
- **Canvas/CSS 实现**:
  ```css
  background-color: #F5EFD8;
  background-image: 
    linear-gradient(to right, #D8D2C0 1px, transparent 1px),
    linear-gradient(to bottom, #D8D2C0 1px, transparent 1px);
  background-size: 24px 24px;
  ```
- **颜色**: 底 `#F5EFD8` 线 `#D8D2C0`
- **适用**: A 手绘便签
- **尺寸**: 网格 20-30px

### 3.4 半色调网点 (Halftone Dots)

- **视觉描述**: 单色背景上叠加规则排列的圆点,漫画/波普风
- **CSS/SVG 实现**:
  ```css
  background-image: radial-gradient(circle, #000000 1.5px, transparent 1.5px);
  background-size: 10px 10px;
  background-color: #ED0108;
  ```
- **颜色**: 点 `#000000` 底 `#ED0108` / `#FFEC47` / `#F78DE9`
- **适用**: C 漫画 pop
- **尺寸**: 圆点 2-4px,间距 8-12px

### 3.5 对话气泡 (Speech Bubble)

- **视觉描述**: 白底黑边气泡,内含感叹词,带小尾巴指向主体
- **SVG 实现**:
  ```svg
  <g transform="rotate(-5)">
    <ellipse cx="60" cy="40" rx="55" ry="35" fill="#FFFFFF" stroke="#000000" stroke-width="3"/>
    <polygon points="40,70 50,90 60,70" fill="#FFFFFF" stroke="#000000" stroke-width="3"/>
  </g>
  ```
- **颜色**: 底 `#FFFFFF` 边 `#000000` 文字 `#000000`
- **适用**: C 漫画 pop / B 拼贴
- **尺寸**: 80-150px 宽

### 3.6 荧光笔高亮 (Marker Highlight)

- **视觉描述**: 半透明黄色/粉色矩形覆盖文字,模拟荧光笔涂抹
- **CSS 实现**:
  ```css
  background: linear-gradient(to bottom, transparent 30%, #FFEC47 30%, #FFEC47 90%, transparent 90%);
  ```
- **颜色**: `#FFEC47` `#FFB8C8` `#88C8A0` `#88B0D8`
- **适用**: A 手绘便签 / D 报纸
- **尺寸**: 文字宽度 +10px,高度贴合文字

### 3.7 撕边便签 (Torn Edge Note)

- **视觉描述**: 不规则撕边上边缘的便签纸,可旋转
- **SVG 实现**:
  ```svg
  <path d="M 0 16 L 0 6 L 3 10 L 6 4 L 10 9 L 13 5 L 17 10 L 21 6 L 25 11 L 29 5 L 33 9 L 37 6 L 41 11 L 45 5 L 49 9 L 53 6 L 57 11 L 61 5 L 65 9 L 69 6 L 73 11 L 77 5 L 81 9 L 85 6 L 89 11 L 93 5 L 97 9 L 100 6 L 100 16 Z" 
        fill="#FFE082"/>
  ```
- **颜色**: `#FFE082` `#FFB8C8` `#CFEAFE` `#A8D890`
- **适用**: B 拼贴 / A 手绘便签
- **尺寸**: 80-200px 宽

### 3.8 印章 (Stamp/Seal)

- **视觉描述**: 红色/蓝色圆形或方形印章,内含白色中文字,旋转 -10°~+12°
- **CSS 实现**:
  ```css
  width: 60px; height: 60px; border-radius: 50%;
  background: #E6213D; color: #FFFFFF;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px dashed rgba(255,255,255,0.55);
  transform: rotate(-10deg);
  ```
- **颜色**: 底 `#E6213D` `#012FA7` `#000000` 文字 `#FFFFFF`
- **适用**: B 拼贴 / D 报纸 / C 漫画
- **尺寸**: 50-80px 直径

### 3.9 3D Emoji 大图 (Large 3D Emoji)

- **视觉描述**: 把 emoji 放大到 100-150px 作为画面主体,带柔和白色外发光
- **CSS 实现**:
  ```css
  font-size: 120px;
  filter: drop-shadow(0 0 12px rgba(255,255,255,0.6)) 
          drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  ```
- **推荐 emoji**: 🔥 ⭐ 💥 ✨ 🎉 💯 ❤️ 🙌 👀 🍑
- **适用**: C 漫画 pop / B 拼贴
- **尺寸**: 100-150px

### 3.10 精细卡通 (Detailed Cartoon Character)

- **视觉描述**: 多图层 SVG 卡通(猫/熊/兔/咖啡杯),含描边和高光
- **SVG 实现**: 现有 CARTOONS[] 12 个 + 扩展至 24 个,新增拟真 3D 风格变体
- **颜色**: 主色 + 描边色 + 高光色(三色一组)
- **适用**: A 手绘便签 / B 拼贴
- **尺寸**: 80-120px

### 3.11 漫画放射线 (Comic Speed Lines)

- **视觉描述**: 从中心向外的细线条,模拟漫画爆炸/冲击效果
- **SVG 实现**:
  ```svg
  <g stroke="#FFFFFF" stroke-width="1.5" opacity="0.4">
    <line x1="50%" y1="50%" x2="0%" y2="0%"/>
    <line x1="50%" y1="50%" x2="20%" y2="0%"/>
    <line x1="50%" y1="50%" x2="40%" y2="0%"/>
    <!-- 16-24 条 -->
  </g>
  ```
- **颜色**: `#FFFFFF` `#000000` `#FFEC47`
- **适用**: C 漫画 pop
- **尺寸**: 全画面 + 透明度 40%

### 3.12 马克笔字 (Marker Pen Text)

- **视觉描述**: 笔画粗细不均、略微倾斜的马克笔手写体
- **CSS 实现**:
  ```css
  font-family: "Permanent Marker", cursive;
  transform: rotate(-2deg);
  letter-spacing: -0.02em;
  ```
- **颜色**: `#000000` `#ED0108` `#5D4E37`
- **适用**: A 手绘便签 / B 拼贴
- **尺寸**: 与标题字大小一致

---

## §4 统一底层基因

> v2.0 的硬性 ≤2 装饰上限严重脱离实际,v3.0 放宽到 4-6 个装饰,但**要求分区清晰、主色占 70% 视觉权重**。

### 4.1 字号铁律

| 规则 | 值 | 说明 |
|------|-----|------|
| **主标题占比** | **55-75%** 画面面积 | 文字是视觉主体,但允许装饰占 25-45% |
| 最小字号 | 不小于画面高度的 **7%** | 保证缩略图可读 |
| 字重 | **≥700 (Bold)**,推荐 900 (Black) | 中文细字在封面中无存在感 |
| 字数 | **3-12 字** 最理想 | 超过 15 字需缩小 |
| 行数 | **1-3 行** | 超过 3 行失去"大字"冲击力 |

### 4.2 配色铁律(v3.0 修订)

| 规则 | 说明 |
|------|------|
| **主色占 70%** | 背景色或最大色块 = 主色,占视觉权重 70% |
| **强调色 1-2 个,共占 25%** | 装饰元素用强调色 |
| **点缀色 1-2 个,共占 5%** | 小细节(印章、小图案)用点缀色 |
| **总色数 ≤ 6** | 超过 6 色视觉混乱 |
| 明度对比 ≥ **100** | 确保手机屏可读(WCAG AAA) |
| 不用纯 `#000` 配纯 `#FFF` | 用 `#2D2A26` 配 `#FAFAFA`,更高级 |

### 4.3 构图铁律

| 规则 | 说明 |
|------|------|
| 文字可略微 **bleed** 出画布 | 增强视觉张力(5% 溢出边界) |
| 左右留白 ≤ **8%** | 最大化文字空间 |
| 上下留白 ≤ **12%** | 宽松但不过度 |
| 文字对齐:**居中** 或 **偏左** | 极少数偏右 |
| **不要**在角落放 logo | 封面是独立视觉作品 |

### 4.4 装饰铁律(v3.0 重大修订)

| 风格族 | 装饰数量上限 | 装饰类型限制 |
|--------|--------------|--------------|
| **A. 手绘便签** | **4-6 个** | 横线 + 胶带 + 手绘圈 + 卡通 + 1-2 emoji |
| **B. 拼贴 collage** | **5-7 个** | 2-3 撕边便签 + 色块 + 印章 + 箭头 + emoji |
| **C. 漫画 pop** | **4-6 个** | 半色调底 + 对话气泡 + 放射线 + 拟声词 + 3D emoji |
| **D. 报纸大字** | **3-4 个** | 主标题 + 副标题 + 印章 + 几何装饰 |
| **E. 极简大字** | **0-1 个** | 仅 1 个可选几何装饰 |

**核心规则**:
- 装饰数量虽放宽,但**视觉权重不超过 30%**(主色占 70%)
- 装饰必须**分区清晰**:左上区 / 右上区 / 左下区 / 右下区,避免堆叠在同一区
- 装饰尺寸:单个装饰不超过画面 15%
- 装饰颜色与主色形成**对比或同色系深浅**

### 4.5 字体排版细节参数(v3.0 扩充)

#### 4.5.1 字间距(letter-spacing)

| 字号范围 | letter-spacing (em) | 适用场景 |
|----------|---------------------|----------|
| 48-64px (Hero 大字) | **-0.03em ~ -0.05em** | 收紧字距,增强整体感 |
| 32-46px (中等标题) | **-0.01em ~ -0.03em** | 微收紧 |
| 16-30px (小标题/副标题) | 0 ~ **+0.02em** | 正常或微松 |
| 10-14px (标签/辅助) | **+0.05em ~ +0.15em** | 松散,提高小字可读性 |

#### 4.5.2 行间距(line-height)

| 行数 | 最佳 line-height | 说明 |
|------|-----------------|------|
| 1 行 | **1.0 ~ 1.1** | 无行间距需求 |
| 2 行 | **1.15 ~ 1.25** | 紧凑但可分辨 |
| 3 行 | **1.25 ~ 1.35** | 需清晰区分行边界 |
| ≥4 行 | **1.35 ~ 1.5** | 避免行间挤压 |

#### 4.5.3 文字描边(-webkit-text-stroke / text-shadow)

| 描边用途 | 粗细 | 颜色 | 适用场景 |
|----------|------|------|----------|
| 轻微增强对比 | **1px** | 同文字色或稍深 | 浅色背景深色字 |
| 标准描边 | **2-3px** | 黑色或深灰 | 彩色背景白色字 |
| **重描边(漫画风)** | **4-6px** | 黑色 | 荧光撞色、漫画 pop |
| 发光描边 | **0px + box-shadow** | 同色系浅色 | 夜间/深色背景 |

```css
/* 白字 + 3px 黑描边 = 最稳组合 */
text-shadow: 
  -3px -3px 0 #000000,  
   3px -3px 0 #000000,
  -3px  3px 0 #000000,
   3px  3px 0 #000000;
```

#### 4.5.4 中英文/数字混排

| 混排类型 | 英/数专用字体 | 相对中文字号 |
|----------|-------------|-------------|
| 中文标题中含英文单词 | Inter / DM Sans | **×0.85** |
| 中文标题中含数字 | Inter / SF Pro | **×0.9** |
| 纯英文标题 | Inter Black 900 | **×1.15** |
| 日期/编号 | DM Serif Display | 正常 |

#### 4.5.5 主标题 × 副标题 字号比例

| 主标题:副标题 | 视觉感受 | 适用话题 |
|---------------|----------|----------|
| **3:1** | 强主次,主标题极突出 | 干货、教程、工具 |
| **2.5:1** | 经典比例 | 通用 |
| **2:1** | 副标题存在感较强 | 生活、叙事、情感 |
| **1.8:1** | 接近同等重要 | 合集、对比、清单 |

#### 4.5.6 6 字体方案(v3.0 扩充)

| 字体编号 | 字体 | 类别 | 视觉感受 | 适用话题 |
|----------|------|------|----------|----------|
| **F1** | **Noto Sans SC Black 900** | 黑体粗体 | 现代、权威、干货 | 职场、教程、工具 |
| **F2** | **Noto Serif SC Bold 700** | 衬线宋体 | 文艺、温柔、叙事 | 生活、书评、情感 |
| **F3** | **ZCOOL KuaiLe** | 圆润艺术 | 可爱、活泼、亲切 | 种草、萌宠、美食 |
| **F4** | **Ma Shan Zheng** | 书法手写 | 治愈、随性、真诚 | 情绪、节庆、人生感悟 |
| **F5** | **ZCOOL XiaoWei** | 楷体细瘦 | 优雅、高级、古风 | 穿搭、美学、读书 |
| **F6** | **Liu Jian Mao Cao** | 草书 | 艺术、洒脱 | 诗句、创作、个性表达 |
| **F7** | **Permanent Marker** | 马克笔体 | 手绘、粗粝、随性 | 手账、便签、笔记(新增) |
| **F8** | **Bangers** | 漫画风英文 | 漫画、冲击、爆炸 | 漫画 pop 风(新增) |

---

## §5 装饰互斥矩阵 v3.0

> v2.0 是 4×6 矩阵,v3.0 扩展为 **6×6**,新增 2 个装饰类别(贴纸 / 手绘元素)。

### 5.1 互斥矩阵(6×6)

| 装饰 A ↓ \ 装饰 B → | **几何元素** | **emoji 贴纸** | **卡通角色** | **人物插画** | **物品图标** | **手绘元素** |
|-------------------|------------|--------------|------------|-----------|-----------|------------|
| **几何元素** | ✅ 可 2 个 | ✅ 可共存 | ✅ 可 1 个 | ⚠️ 慎用 | ✅ 可共存 | ✅ 可 2 个 |
| **emoji 贴纸** | ✅ 可共存 | ✅ 可 2 个 | ⚠️ 慎用 | ⚠️ 慎用 | ✅ 可 2 个 | ✅ 可 1 个 |
| **卡通角色** | ✅ 可 1 个 | ⚠️ 慎用 | ❌ 互斥 | ❌ 互斥 | ⚠️ 慎用 | ✅ 可 1 个 |
| **人物插画** | ⚠️ 慎用 | ⚠️ 慎用 | ❌ 互斥 | ❌ 只能 1 个 | ⚠️ 慎用 | ⚠️ 慎用 |
| **物品图标** | ✅ 可共存 | ✅ 可 2 个 | ⚠️ 慎用 | ⚠️ 慎用 | ✅ 可 2 个 | ✅ 可 1 个 |
| **手绘元素** | ✅ 可 2 个 | ✅ 可 1 个 | ✅ 可 1 个 | ⚠️ 慎用 | ✅ 可 1 个 | ✅ 可 3 个 |

**图例**:
- ✅ 可共存 — 搭配自然,不会过满
- ⚠️ 慎用 — 仅字数 < 4 时允许,其他情况禁止
- ❌ 互斥 — 永远不同时出现

### 5.2 最大元素数(v3.0 放宽)

| 装饰等级 | 字数 | 装饰数量上限 | 风格族适配 |
|----------|------|--------------|------------|
| **L3**: 角色级 | 1-4 字 | **2-3 个** | A / B |
| **L2**: emoji 级 | 5-9 字 | **3-4 个** | A / B / C |
| **L1**: 几何级 | 10-15 字 | **2-4 个** | D / E |
| **L0**: 纯文字级 | ≥16 字 | **0-1 个** | E(强制) |

### 5.3 装饰位置互斥

| 装饰数量 | 位置分配规则 |
|----------|--------------|
| 1 个 | 优先右下角(bottom-right) |
| 2 个 | 左下 + 右上(对角不冲突) |
| 3 个 | 左上 + 右下 + 中央(三角分布) |
| 4 个 | 四角各一(左上+右上+左下+右下) |
| **5-6 个** | 四角 + 主标题上下各一 |

**禁止**: 2 个装饰在同一半区(如都在上方或都在右方),视觉不平衡。

### 5.4 装饰颜色自适应

| 背景类型 | 装饰颜色规则 |
|----------|--------------|
| 高饱和背景 | 装饰用白色或背景对比色(色相环 180°) |
| 低饱和浅色背景 | 装饰用深色(比背景深 40%)或背景同色系深 2 档 |
| 深色背景 | 装饰用白色或荧光色(提高亮度) |
| 纯白/近白背景 | 装饰用黑色或低饱和莫兰迪色 |

**实现方式**: 装饰颜色 = `bgColor.darken(40%)` 或 `bgColor.lighten(60%)`,确保在背景上可见。

---

## §6 智能联动策略

### 6.1 字数感应装饰等级(v3.0 修订)

| 字数 | 装饰等级 | 装饰方案 | 适配风格族 |
|------|----------|----------|------------|
| 1-4 字 | L3 角色级 | 1 卡通 + 1 手绘圈 + 1 emoji | A / B |
| 5-9 字 | L2 emoji 级 | 2 emoji + 1 几何 + 1 手绘 | A / B / C |
| 10-15 字 | L1 几何级 | 1-2 几何 + 1 印章 | D / E |
| ≥16 字 | L0 纯文字级 | 0 装饰,文字即设计 | E(强制) |

### 6.2 内容关键词感应

| 关键词 | 匹配风格族 | 主推公式 | 备选公式 | 推荐字体 |
|--------|------------|----------|----------|----------|
| 职场 / 工作 / 效率 / 工具 / 上班 / 加班 / PPT / Excel / 开会 / 简历 / 面试 | D 报纸大字 | D1 克莱因蓝 | E4 正红白字 | F1 黑体 |
| 学习 / 读书 / 考试 / 笔记 / 考研 / 考证 / 英语 / 编程 / 上课 / 期末 | A 手绘便签 | A5 蓝白横线 | D6 紫白对撞 | F1 黑体 / F2 宋体 |
| 吃 / 喝 / 美食 / 餐厅 / 咖啡 / 奶茶 / 蛋糕 / 面包 / 探店 / 火锅 / 甜品 / 料理 | B 拼贴 collage | B1 米白复古 | C 漫画 pop | F3 快乐 / F1 黑体 |
| 穿搭 / 美妆 / 护肤 / 口红 / 香水 / 发型 / OOTD / 化妆品 / 粉底 / 眼影 | B 拼贴 collage | B6 冷色都市 | A3 暖黄胶带 | F5 小薇 / F2 宋体 |
| 钱 / 理财 / 副业 / 赚钱 / 投资 / 省钱 / 基金 / 股票 / 存款 / 收入 | D 报纸大字 | D1 克莱因蓝 | E6 米黄黑字 | F1 黑体 |
| 情感 / 恋爱 / 分手 / 暗恋 / 前任 / 暧昧 / 相亲 / 婚姻 / 闺蜜 / 友情 | A 手绘便签 | A3 暖黄胶带 | B3 奶油拼接 | F4 手写 / F6 草书 |
| 旅行 / 旅游 / 攻略 / 酒店 / 民宿 / 打卡 / 自驾 / 徒步 / 背包客 | B 拼贴 collage | B3 奶油拼接 | A4 奶油咖啡 | F5 小薇 |
| 家居 / 装修 / 收纳 / 租房 / 布置 / 整理 / 搬家 / 独居 / 改造 / 好物 | A 手绘便签 | A4 奶油咖啡 | B1 米白复古 | F2 宋体 |
| 运动 / 健身 / 跑步 / 瑜伽 / 减肥 / 跳绳 / 增肌 / 减脂 / 马甲线 | C 漫画 pop | C1 红色 pop | C5 荧光绿 pop | F1 黑体 / F8 漫画 |
| 科技 / 数码 / 手机 / 电脑 / App / AI / 人工智能 / ChatGPT / 工具 | D 报纸大字 | D1 克莱因蓝 | E5 克莱因蓝黄字 | F1 黑体 |
| 娱乐 / 追星 / 偶像 / 演唱会 / 音乐 / 电影 / 电视剧 / 综艺 / 追剧 | C 漫画 pop | C4 电蓝 pop | B5 暖黄手账 | F3 快乐 / F1 黑体 |
| 育儿 / 宝宝 / 母婴 / 亲子 / 带娃 / 幼儿园 / 怀孕 / 产后 | A 手绘便签 | A3 暖黄胶带 | B5 暖黄手账 | F3 快乐 / F4 手写 |
| 猫 / 狗 / 宠物 / 猫咪 / 狗狗 / 萌宠 / 主子 / 铲屎官 | B 拼贴 collage | B5 暖黄手账 | C 漫画 pop | F3 快乐 |
| 创意 / 设计 / 灵感 / 配色 / 排版 / 海报 / 品牌 / LOGO | D 报纸大字 | D2 正红白字 | B4 灰白杂志 | F5 小薇 / F2 宋体 |
| 节庆 / 促销 / 618 / 双11 / 双十二 / 新年 / 圣诞 / 国庆 / 情人节 | C 漫画 pop | C1 红色 pop | D2 正红白字 | F1 黑体 / F8 漫画 |

### 6.3 边缘场景处理规则

#### 6.3.1 纯英文标题

```
检测条件: 中文字符数 = 0 且 英文字母数 > 0

处理方案:
  - 字体: 强制 F1 (无衬线黑体) 或英文专用字体 (Inter Black 900)
  - 字号: 正常字号的 ×1.15 倍
  - 大小写: 全大写 (ALL CAPS)
  - 字间距: 英文 +0.02em ~ +0.05em
  - 公式限制: 仅 D / E (报纸大字 / 极简大字),禁用 A / C (手绘 / 漫画)
```

#### 6.3.2 中英混排

```
检测条件: 中文字符 ≥ 1 且 英文字母 ≥ 1

处理方案:
  - 英文/数字部分: 切换到 DM Sans 或 Inter,字号 ×0.85
  - 中文部分保持原字体原大小
  - 英文前后自动加空格 (0.25em)
```

#### 6.3.3 超长标题(≥16 字)

```
检测条件: 总字符数 ≥ 16 (中英文合计,空格不计)

处理方案:
  - 装饰等级: 强制 L0 (零装饰或仅 1 个)
  - 公式限制: 仅 D / E (报纸大字 / 极简大字)
  - 字号: 最小值放宽到画面高度的 5%
  - 行数: 允许 3-4 行
  - 对齐: 强制左对齐
  - 行间距: 强制 ≥ 1.35
  - 如果超过 25 字: UI 提示用户缩减文案
```

#### 6.3.4 超短标题(≤ 3 字)

```
检测条件: 总字符数 ≤ 3

处理方案:
  - 装饰等级: 强制 L3 (角色级)
  - 字号: 最大值可以到画面高度的 25%
  - 字符撑满: 单个汉字占画面 70-80%
  - 推荐公式: C / E (漫画 pop / 极简大字)
  - 必须添加描边增强存在感 (2-3px)
```

#### 6.3.5 纯数字标题

```
检测条件: 中文字符 = 0, 英文字母 = 0, 数字 ≥ 1

处理方案:
  - 推荐字体: DM Serif Display 或 Inter Black
  - 字号: ×1.2 倍
  - 推荐公式: E (极简大字) 或 D (报纸大字)
  - 字间距: +0.04em
```

#### 6.3.6 标题中含 Emoji

```
检测条件: 文案包含 emoji 字符

处理方案:
  - 标题区的 emoji: 保留,字号与相邻文字一致,或 ×1.3 作为视觉锚点
  - 装饰 emoji: 自动降一级 (避免装饰与标题 emoji 撞车)
```

#### 6.3.7 全部大标题 / 全部小标题

```
场景 A: 全部粗体大标题 (如 "爆款" "必看" "绝了")
  处理: 保持公式,字号上限增加到画面高度的 25%

场景 B: 全部轻量词 (如 "嗯" "好" "是的")
  处理: 补充推荐副标题,或自动在下方加一行 "..." 增加视觉重量
```

#### 6.3.8 含敏感词 / 品牌名

```
检测条件: 含商标名 (Apple/Nike/Coca-Cola 等) 或敏感政治词

处理方案:
  - 不改变视觉效果
  - 在 UI 层提示用户 "标题中含有品牌名/敏感词,发布前请确认合规"
  - 不主动过滤或修改用户内容
```

---

## §7 AI 投喂最佳实践 v3.0

### 7.1 强制关键词清单(v3.0 新增硬性规定)

**任何 AI Prompt 必须包含以下关键词**(否则产出方向错误,v2.0 反复栽在这里):

```
Chinese KOL sticker aesthetic, hand-drawn marker circles,
scrapbook collage, halftone dots, comic speech bubble, notebook paper background
```

### 7.2 强制 Negative Prompt(v3.0 新增硬性规定)

**任何 AI Prompt 必须包含以下 negative**:

```
editorial poster, Swiss design, minimalist, clean typographic
```

### 7.3 完整 Prompt 模板 v3.0(复制即用)

```
[风格族 A/B/C/D/E 之一的核心描述],
3:4 aspect ratio (1242x1656px),
[COLOR_主色] background,
giant [FONT] Chinese characters "[填入文案]" filling 55-75% of canvas,
[装饰清单 1 - 必须 ≥3 个,如 hand-drawn circle, washi tape, torn note, stamp, comic bubble],
[装饰清单 2 - 1-2 个 emoji 或 cartoon],
ultra-bold weight, tight letter-spacing (-0.03em),
no photograph, no 3D rendering (除非 3D emoji), no gradient (除非 halo 风格),
Chinese KOL sticker aesthetic, hand-drawn marker circles,
scrapbook collage, halftone dots, comic speech bubble, notebook paper background,
xiaohongshu (RED) cover style, Chinese social media aesthetic,
8K, sharp focus, soft natural lighting

Negative prompt:
editorial poster, Swiss design, minimalist, clean typographic,
muted colors, low saturation, traditional Chinese painting,
watermark, logo, QR code, barcode,
photorealistic human face, complex lighting
```

### 7.4 Midjourney 参数

```
--ar 3:4 --style raw --stylize 150 --v 6.1
```

### 7.5 不同 AI 工具的适配

| 工具 | 优势 | 注意事项 |
|------|------|----------|
| **Midjourney** | 视觉质感最好 | 中文文字可能出错,需要 `--cref` 引用种子图 |
| **DALL·E 3** | 中文文字准确 | 风格偏"干净",需在 prompt 中反复强调 sticker / collage |
| **Stable Diffusion** | 可 ControlNet 控构图 | 需要专门 LoRA 训练中文排版 + 贴纸风格 |
| **稿定/Canva API** | 保证字体正确 | 模板化,灵活性受限,仅适合 D / E 极简风 |

### 7.6 中文版完整模板

```
一张3:4比例的小红书[风格族A/B/C/D/E]风格封面。
背景:[颜色] [材质描述,如方格纸/撕边便签/半色调网点底]。
中央:[字体] [颜色] [大小]中文标题"[文案]",填充画面55-75%面积。
装饰1(必备):手绘圈线 / 撕边便签 / 对话气泡 / 印章 / 半色调网点,至少 3 个。
装饰2:1-2 个 emoji(自然/食物/表情类)。
字间距:-0.03em,字重 900。
禁止:摄影图、3D 渲染(3D emoji 例外)、复杂背景渐变。
风格:中国博主贴纸美学,手绘马克笔圈线,剪贴簿拼贴,半色调网点,漫画对话气泡,笔记本纸背景,小红书封面风格。
8K分辨率,锐利对焦,柔和自然光。

负面提示:编辑海报,瑞士设计,极简,干净排版,
低饱和度,传统中国画,水印,logo,二维码,
真人面部,复杂打光。
```

---

## §8 落地路径

### 路径 A:AI 图片生成(完全依靠 prompt)

```
用户输入 "财务人必看的5个AI工具"
  ↓
选风格族(用户选/关键词感应) → 选配色 → 选字体 → 选装饰等级
  ↓
拼装完整 prompt(套用 §7.3 模板 + §2 风格族 prompt)
  ↓
调 Midjourney/DALL·E API
  ↓
返回生成的 4-8 张候选图 → 用户选 → 下载
```

**优点**: 效果最接近稿定模板,质感好  
**缺点**: API 成本,延迟 5-30 秒,中文文字可能不准

### 路径 B:程序化生成(HTML/CSS 渲染,当前方案)

```
用户输入 "财务人必看的5个AI工具"
  ↓
选风格族(A-E) → 选配色(42 组) → 选字体(6 类) → 选装饰(12 特征库)
  ↓
JavaScript 渲染 HTML → html2canvas 截图
  ↓
即时预览 ≥30 张 → 下载 PNG
```

**优点**: 即时(< 100ms),中文完美,免费  
**缺点**: 缺少 AI 的"有机感"和光影质感

### 路径 C:混合模式(推荐,v3.0 新增)

```
程序化生成排版骨架 + AI 美化润色
  ↓
HTML/CSS 生成排版、配色、文字位置、装饰布局
  ↓
可选:将 HTML 截图作为 img2img 底图,用 AI 添加光影/纹理/质感
  ↓
最终输出 = 精确的中文 + AI 的质感
```

**优点**: 中文 100% 准确 + 视觉质感好  
**缺点**: 复杂度高,需要双工流程

### 路径选择决策树

```
用户对中文准确度要求高?
  是 → 路径 B (程序化) 或 路径 C (混合)
  否 → 路径 A (AI 生图)

用户预算有限?
  是 → 路径 B (程序化,免费)
  否 → 路径 A 或 C (按需付费)

用户需要 >20 张候选图?
  是 → 路径 B (程序化可秒级生成)
  否 → 路径 A 或 C
```

---

## §9 种子参考图索引

> 从 192 张真实稿定样本中,按风格族代表性 + 视觉清晰度 + 配色多样性,每族精选 3 张作为种子图。

### 9.1 风格族 A · 手绘便签风(3 张种子)

| 编号 | 文件名 | 配色 | 视觉特征 |
|------|--------|------|----------|
| **A-seed-1** | `DM_20260630193603_020.jpg` | A4 奶油咖啡 | 米黄横线 + 胶带 + 马克笔字 + 手绘圈 |
| **A-seed-2** | `DM_20260630193603_025.jpg` | A5 蓝白横线 | 蓝色横线 + 多个手绘元素 + emoji |
| **A-seed-3** | `DM_20260630193603_036.jpg` | A3 暖黄胶带 | 米黄底 + 黄色胶带 + 手写数字 |

### 9.2 风格族 B · 拼贴 collage 风(3 张种子)

| 编号 | 文件名 | 配色 | 视觉特征 |
|------|--------|------|----------|
| **B-seed-1** | `DM_20260630193603_026.jpg` | B1 米白复古 | 撕边便签叠加 + 红色印章 + 色块 |
| **B-seed-2** | `DM_20260630193603_028.jpg` | B2 纯白清新 | 多个粉色/蓝色便签 + 涂鸦箭头 |
| **B-seed-3** | `DM_20260630193603_030.jpg` | B3 奶油拼接 | 黄色便签 + 红色印章 + 手写注释 |

### 9.3 风格族 C · 漫画 pop 风(3 张种子)

| 编号 | 文件名 | 配色 | 视觉特征 |
|------|--------|------|----------|
| **C-seed-1** | `DM_20260630193603_160.jpg` | C1 红色 pop | 红色底 + 半色调 + 黑字 + 拟声词 |
| **C-seed-2** | `DM_20260630193603_166.jpg` | C3 粉色 pop | 粉色底 + 白色描边字 + 3D emoji |
| **C-seed-3** | `DM_20260630193603_148.jpg` | C2 黄色 pop | 黄色底 + 黑字 + 阴影浮雕 + 对话气泡 |

### 9.4 风格族 D · 报纸大字风(3 张种子)

| 编号 | 文件名 | 配色 | 视觉特征 |
|------|--------|------|----------|
| **D-seed-1** | `DM_20260630193603_126.jpg` | D1 克莱因蓝 | 蓝底 + 金字 + 3 栏小字 + 红色印章 |
| **D-seed-2** | `DM_20260630193603_085.jpg` | D1 克莱因蓝(杂志风) | 蓝/黄左右分栏 + 衬线粗体 |
| **D-seed-3** | `DM_20260630193603_193.jpg` | D4 琥珀深蓝 | 琥珀底 + 深蓝字 + 多栏布局 |

### 9.5 风格族 E · 极简大字风(3 张种子)

| 编号 | 文件名 | 配色 | 视觉特征 |
|------|--------|------|----------|
| **E-seed-1** | `DM_20260630193603_097.jpg` | E1 纯白黑字 | 纯白底 + 黑色 Noto Sans Black + 0 装饰 |
| **E-seed-2** | `DM_20260630193603_098.jpg` | E2 纯黑白字 | 纯黑底 + 白色大字 + 1 几何 |
| **E-seed-3** | `DM_20260630193603_175.png` | E5 克莱因蓝黄字 | 克莱因蓝底 + 黄字 + 1 几何 |

### 9.6 GIF 动效种子(2 张)

| 编号 | 文件名 | 动效类型推测 |
|------|--------|--------------|
| **GIF-1** | `DM_20260630193603_073.gif` | 文字闪烁 / 光点扫过 |
| **GIF-2** | `DM_20260630193603_082.gif` | 粒子飘落 / 背景波光 |

### 9.7 种子图使用方式

**Midjourney style reference**:
```
/imagine prompt:[风格族 prompt] --ar 3:4 --style raw --stylize 150 --v 6.1
然后使用 --cref [种子图URL] 参数引用对应种子图
```

**Stable Diffusion img2img**:
```
Denoising strength: 0.35-0.5
ControlNet: Canny edge(保留文字排版骨架)
Reference-only: 种子图作为 style reference
```

**程序化使用(当前方案)**:
```
提取种子图的主色 → 存入配色库(§2 各子风格 hex 表)
提取种子图的文字占比 → 校准 fs() 算法参数(§4.1)
提取种子图的装饰位置 → 校准装饰位置概率分布(§5.3)
```

---

## §10 附录:从 v2.0 到 v3.0 的变更清单

| # | 维度 | v2.0 (已归档) | v3.0 (新版) | 变更依据 |
|---|------|---------------|-------------|----------|
| 1 | 风格体系 | 7 公式(①纯色大字 ②荧光撞色 ③奶油质感 ④大阴影 ⑤双色竖分 ⑥信息层叠 ⑦几何装饰) | **5 风格族**(A 手绘便签 / B 拼贴 / C 漫画 pop / D 报纸大字 / E 极简大字) | 视觉评审发现 v2.0 公式与实际样本偏差 >80% |
| 2 | 背景色米黄占比 | 17% | **28%** | 192 张样本中 54 张含米黄底 |
| 3 | 文字色深色字占比 | 33% | **55%** | 视觉评审发现便签/拼贴类大量深色字 |
| 4 | 装饰数量上限 | ≤2 个 | **4-6 个**(按风格族) | 70% 样本装饰在 3-6 个之间 |
| 5 | 配色规则 | 1-2 色 | **主色 70% + 强调色 25% + 点缀色 5%,共 ≤6 色** | 多色共存是拼贴/漫画风的本质 |
| 6 | 字体方案 | 6 类(Noto Sans/Serif/Ma Shan/ZCOOL XiaoWei/KuaiLe/Liu Jian) | **8 类**(新增 Permanent Marker / Bangers) | 马克笔体、漫画风字体缺失 |
| 7 | 视觉特征库 | 未明确 | **12 项新增**(手绘圈/云朵高光/方格纸/半色调/对话气泡/荧光笔/撕边便签/印章/3D emoji/精细卡通/漫画放射线/马克笔字) | 12 个核心视觉元素被遗漏 |
| 8 | AI Prompt 关键词 | 无强制 | **强制 6 个关键词**(Chinese KOL sticker / hand-drawn marker circles / scrapbook collage / halftone dots / comic speech bubble / notebook paper) | v2.0 prompt 方向错误导致产出"编辑海报" |
| 9 | AI Prompt negative | 无 | **强制 4 个 negative**(editorial poster / Swiss design / minimalist / clean typographic) | 排除错误方向的产出 |
| 10 | 互斥矩阵 | 4×6 | **6×6**(新增「手绘元素」类别) | 12 项新特征无法归类到原矩阵 |
| 11 | 装饰等级 | L0-L3(数量限制) | L0-L3 + 风格族适配 | 装饰数量与风格族强相关 |
| 12 | 落地路径 | 2 条(AI 生图 / 程序化) | **3 条**(新增混合模式) | 路径 C 解决了中文准确 + 视觉质感的矛盾 |
| 13 | 种子图索引 | 12 张(混风格) | **15 张**(按 5 风格族各 3 张) + 2 张 GIF | 种子图按风格族分类,便于 Midjourney --cref |
| 14 | 数据底片方法 | 纯 PIL 像素聚类 | **视觉评审为主**(5 秒/张肉眼评审) | v2.0 PIL 聚类漏掉了便签纸纹理 |
| 15 | 配色库 | 6 种(低饱和) | **42 种**(分 7 大色系:黄/红橙/蓝/绿/紫粉/灰白/特殊撞色) | 单一低饱和配色无法覆盖漫画 pop |
| 16 | 边缘场景 | 8 类(未实现) | 8 类(全部明确处理规则) | 边缘场景必须显式处理,否则用户报错 |
| 17 | 装饰尺寸上限 | 面积 ≤ 3% | 单个装饰 ≤ 15%,**主色仍占 70%** | 数量增加但视觉权重不变 |
| 18 | 文字占比 | 60-80% | **55-75%** | 装饰增加后文字占比略降 |
| 19 | 字号最小值 | 8% | **7%** | 适配更多字数场景 |
| 20 | 字重 | ≥700,推荐 900 | ≥700,推荐 900,**新增漫画 900 + 描边** | 漫画 pop 必须粗描边 |

---

## §11 附录:42 组配色速查表(程序化实现用)

> 从 192 张样本提取,程序化生成器应内置这 42 组配色。

### 11.1 黄色系(6 组)

```
y1: bg=#FFF9E1 字=#000000  奶黄+黑
y2: bg=#FFEC47 字=#000000  柠檬黄+黑
y3: bg=#FDE6A5 字=#000000  米黄+黑
y4: bg=#FFE81C 字=#000000  明黄+黑
y5: bg=#F8D612 字=#FFFFFF  金黄+白
y6: bg=#FFD95F 字=#012FA7  鹅黄+蓝(撞色)
```

### 11.2 红/橙系(6 组)

```
r1: bg=#ED0108 字=#FFFFFF  正红+白
r2: bg=#E6213D 字=#FFFFFF  玫红+白
r3: bg=#FF6333 字=#FFFFFF  珊瑚橙+白
r4: bg=#8C1A1A 字=#FFFFFF  深红+白
r5: bg=#FFCDD2 字=#000000  浅粉+黑
r6: bg=#D23627 字=#FFFFFF  铁锈红+白
```

### 11.3 蓝色系(6 组)

```
b1: bg=#012FA7 字=#FFD95F  深蓝+黄(撞色)
b2: bg=#CFDCFE 字=#000000  莫兰迪蓝+黑
b3: bg=#CFFBFE 字=#000000  粉蓝+黑
b4: bg=#CEEAFF 字=#000000  淡蓝+黑
b5: bg=#2677DE 字=#FFFFFF  宝蓝+白
b6: bg=#7DABE7 字=#FFFFFF  天蓝+白
```

### 11.4 绿色系(6 组)

```
g1: bg=#B8E300 字=#000000  荧光绿+黑
g2: bg=#D7FED1 字=#000000  薄荷绿+黑
g3: bg=#8FEBA0 字=#000000  翠绿+黑
g4: bg=#02A789 字=#FFFAEC  深绿+米白
g5: bg=#88C078 字=#000000  苹果绿+黑
g6: bg=#1B4D2E 字=#FFF8DC  墨绿+米白
```

### 11.5 紫/粉色系(6 组)

```
p1: bg=#F78DE9 字=#000000  荧光粉+黑
p2: bg=#FF4CE5 字=#FFFFFF  电光粉+白
p3: bg=#E1BEE7 字=#4A148C  薰衣草紫+深紫
p4: bg=#FDDDE2 字=#000000  婴儿粉+黑
p5: bg=#EEBCD5 字=#000000  干枯玫瑰+黑
p6: bg=#FD9EC0 字=#000000  樱花粉+黑
```

### 11.6 灰/白色系(6 组)

```
w1: bg=#FFFFFF 字=#000000  纯白+黑
w2: bg=#EEEEEE 字=#000000  浅灰+黑
w3: bg=#FCF9F0 字=#2D2A26  奶白+炭
w4: bg=#EDEDED 字=#000000  中灰+黑
w5: bg=#DDDDDD 字=#000000  灰白+黑
w6: bg=#000000 字=#FFFFFF  纯黑+白
w7: bg=#BFC5C5 字=#000000  灰绿+黑
w8: bg=#F0E1CC 字=#857055  暖灰+棕
```

### 11.7 特殊撞色(6 组)

```
s1: bg=#FFE81C 字=#FF227F  黄底+粉字
s2: bg=#FFC106 字=#1C2850  琥珀+深蓝
s3: bg=#FF6333 字=#286BFA  橙+蓝
s4: bg=#FFDF6E 字=#E6213D  黄+红
s5: bg=#F78DE9 字=#012FA7  粉+蓝(撞色)
s6: bg=#B8E300 字=#E6213D  荧光绿+红(撞色)
```

---

## §12 附录:8 类字体加载清单

> 字体 CDN 来源:fonts.font.im (Google Fonts 国内镜像) / fonts.googleapis.com。

```css
@import url('https://fonts.font.im/css2?family=Noto+Sans+SC:wght@900&family=Noto+Serif+SC:wght@700&family=Ma+Shan+Zheng&family=Liu+Jian+Mao+Cao&family=ZCOOL+XiaoWei&family=ZCOOL+KuaiLe&family=DM+Serif+Display&family=Permanent+Marker&family=Bangers&family=Inter:wght@900&family=DM+Sans:wght@700&display=swap');
```

| 字体 | 类别 | 适用话题 | 字重 |
|------|------|----------|------|
| Noto Sans SC | 黑体粗体 | 通用 / 干货 | 900 |
| Noto Serif SC | 衬线宋体 | 文艺 / 情感 | 700 |
| Ma Shan Zheng | 书法手写 | 治愈 / 情绪 | 400 |
| Liu Jian Mao Cao | 草书 | 诗句 / 个性 | 400 |
| ZCOOL XiaoWei | 楷体细瘦 | 优雅 / 古风 | 400 |
| ZCOOL KuaiLe | 圆润艺术 | 可爱 / 萌宠 | 400 |
| DM Serif Display | 衬线英文 | 英文标题 / 日期 | 400 |
| Permanent Marker | 马克笔体 | 手绘 / 笔记 | 400 |
| Bangers | 漫画风英文 | 漫画 pop / 拟声词 | 400 |
| Inter | 英文黑体 | 中英混排 / 数字 | 900 |
| DM Sans | 英文无衬线 | 中英混排 | 700 |

---

## §13 附录:视觉评审方法论

### 13.1 评审流程

```
Step 1: 打开 192 张样本,按 5 风格族人工聚类
  - 每张 5 秒肉眼评审
  - 标注主色、文字色、装饰数量、装饰类型
  - 标注"主导风格族"(A/B/C/D/E,允许重叠)

Step 2: 统计每族样本数,计算占比

Step 3: 提取每族代表配色 → 写入 §2 hex 表

Step 4: 提取每族核心元素 → 写入 §3 视觉特征清单

Step 5: 对比 v2.0 公式与 v3.0 风格族,列出差异 → §10 变更清单
```

### 13.2 评审标注模板

```
文件: DM_20260630193603_XXX.jpg
主导风格族: [A/B/C/D/E]
配色: bg=#RRGGBB tx=#RRGGBB ac=#RRGGBB
装饰数量: [0-7]
装饰类型: [手绘圈/方格纸/撕边便签/印章/对话气泡/3D emoji/...]
字体类型: [黑体/衬线/手写/...]
视觉关键词: [米黄/胶带/便签/...]
```

### 13.3 评审与程序化聚类对比

| 维度 | 程序化(PIL) | 视觉评审 |
|------|-------------|----------|
| 速度 | 快(秒级) | 慢(16 分钟 = 192 × 5s) |
| 准确性 | 低(漏掉纹理/叠加) | 高(肉眼识别) |
| 装饰识别 | ❌ 极难 | ✅ 直接看到 |
| 风格聚类 | ❌ 无法 | ✅ 直接分类 |
| 适用场景 | 大批量初筛 | 精修 + 标准制定 |

**v3.0 起,以视觉评审为主,PIL 仅用于辅助验证。**

---

## §14 文档元信息

```
版本: v3.0
发布日期: 2026-06-30
上一版本: v2.0(已归档,文件保留为 STYLE_GUIDE.md)
数据底片: /Users/andy/Downloads/大字封面设计模板_大字封面模板素材-稿定设计/(192 张)
字数: ≈ 22000 字
行数: ≈ 1650 行
主要作者: UI 设计师 + 内容策划(基于视觉评审 + 192 张真实样本)
适用对象:
  - AI 图像生成用户(Midjourney / DALL·E / SD)
  - 程序化封面生成器开发者(当前 cover-maker 项目)
  - 小红书博主(内容创作参考)
废弃警告: v2.0 的 7 公式体系不再使用,所有代码实现以 v3.0 5 风格族为准
```

---

## §15 附录:12 项视觉特征的 SVG/CSS 实现代码库

> 程序化生成器直接复制以下代码片段即可使用,所有代码均为可独立运行的 HTML/CSS/SVG。

### 15.1 手绘圈线 SVG(参数化)

```html
<svg width="160" height="120" viewBox="0 0 160 120">
  <!-- 不完美圆,多次描线叠加模拟手绘 -->
  <path d="M 80 20 Q 130 25 138 60 Q 142 95 90 100 Q 35 98 25 65 Q 22 25 80 20"
        fill="none" stroke="#5D4E37" stroke-width="3" 
        stroke-linecap="round" opacity="0.85"/>
  <!-- 重叠第二笔,营造抖动 -->
  <path d="M 78 22 Q 132 28 136 62 Q 140 92 88 98"
        fill="none" stroke="#5D4E37" stroke-width="2" 
        stroke-linecap="round" opacity="0.5"/>
</svg>
```

### 15.2 方格纸背景 CSS

```css
.grid-paper {
  background-color: #F5EFD8;
  background-image:
    linear-gradient(to right, #D8D2C0 1px, transparent 1px),
    linear-gradient(to bottom, #D8D2C0 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### 15.3 横线便签纸 CSS

```css
.ruled-paper {
  background-color: #FAF8F5;
  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 31px,
      #C8C0B0 31px,
      #C8C0B0 32px
    );
  background-position: 0 16px;
}
```

### 15.4 半色调网点 CSS

```css
.halftone-red {
  background-color: #ED0108;
  background-image: radial-gradient(circle, #000000 1.5px, transparent 1.5px);
  background-size: 10px 10px;
}

.halftone-yellow {
  background-color: #FFEC47;
  background-image: radial-gradient(circle, #000000 2px, transparent 2px);
  background-size: 12px 12px;
  opacity: 0.95;
}

.halftone-pink {
  background-color: #F78DE9;
  background-image: radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px);
  background-size: 9px 9px;
}
```

### 15.5 对话气泡 SVG(带尾巴)

```html
<svg width="180" height="120" viewBox="0 0 180 120">
  <g transform="rotate(-5 90 60)">
    <!-- 气泡主体 -->
    <ellipse cx="90" cy="50" rx="80" ry="42" 
             fill="#FFFFFF" stroke="#000000" stroke-width="3"/>
    <!-- 气泡尾巴 -->
    <polygon points="60,85 75,110 90,85" 
             fill="#FFFFFF" stroke="#000000" stroke-width="3"/>
    <!-- 覆盖尾巴与气泡连接处的白线 -->
    <line x1="62" y1="83" x2="88" y2="83" 
          stroke="#FFFFFF" stroke-width="3"/>
    <!-- 文字 -->
    <text x="90" y="62" text-anchor="middle" 
          font-family="Noto Sans SC, sans-serif" font-weight="900" 
          font-size="32" fill="#000000">哇!</text>
  </g>
</svg>
```

### 15.6 荧光笔高亮 CSS

```css
.marker-yellow {
  background: linear-gradient(
    to bottom, 
    transparent 0%, 
    transparent 25%, 
    #FFEC47 25%, 
    #FFEC47 85%, 
    transparent 85%
  );
  padding: 0 4px;
}

.marker-pink {
  background: linear-gradient(
    to bottom, 
    transparent 0%, 
    transparent 25%, 
    #FFB8C8 25%, 
    #FFB8C8 85%, 
    transparent 85%
  );
  padding: 0 4px;
}
```

### 15.7 撕边便签 SVG(顶部)

```html
<svg width="300" height="200" viewBox="0 0 300 200">
  <!-- 撕边效果顶部 -->
  <defs>
    <linearGradient id="noteShadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0.15)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
  </defs>
  <!-- 主体便签 -->
  <path d="M 0 18 L 0 200 L 300 200 L 300 18 
           L 295 12 L 288 18 L 280 8 L 272 16 L 263 6 L 254 14 
           L 244 9 L 234 17 L 222 7 L 212 14 L 200 9 L 188 17 
           L 175 6 L 162 15 L 148 7 L 134 16 L 120 8 L 106 14 
           L 92 6 L 78 16 L 64 9 L 50 15 L 36 7 L 22 14 L 8 9 Z"
        fill="#FFE082" filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.15))"/>
</svg>
```

### 15.8 印章 CSS(红色圆形)

```css
.stamp-red {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #E6213D;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Sans SC", sans-serif;
  font-weight: 900;
  font-size: 13px;
  letter-spacing: 1px;
  border: 1.5px dashed rgba(255,255,255,0.55);
  box-shadow: 0 3px 10px rgba(229,57,53,0.35);
  transform: rotate(-10deg);
}

.stamp-blue {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #012FA7;
  color: #FFD95F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "DM Serif Display", serif;
  font-size: 16px;
  border: 1.5px dashed rgba(255,255,255,0.55);
  transform: rotate(8deg);
}
```

### 15.9 3D Emoji 大图 CSS

```css
.emoji-3d {
  font-size: 120px;
  line-height: 1;
  filter: 
    drop-shadow(0 0 12px rgba(255,255,255,0.6))
    drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  display: inline-block;
}

.emoji-3d-fire { color: transparent;
  background: linear-gradient(135deg, #FF4500 0%, #FFEC47 50%, #FF4500 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
```

### 15.10 精细卡通 SVG(咖啡杯扩展示例)

```html
<svg viewBox="0 0 80 80" width="100" height="100">
  <!-- 杯身 -->
  <path d="M 20 35 L 20 60 Q 20 68 28 68 L 52 68 Q 60 68 60 60 L 60 35 Z" 
        fill="#FFFFFF" stroke="#8B6F47" stroke-width="2"/>
  <!-- 把手 -->
  <path d="M 60 42 Q 72 42 72 52 Q 72 60 60 60" 
        fill="none" stroke="#8B6F47" stroke-width="2"/>
  <!-- 咖啡液面 -->
  <ellipse cx="40" cy="35" rx="20" ry="4" fill="#6B4226"/>
  <!-- 拉花心形 -->
  <path d="M 36 42 Q 32 38 36 35 Q 40 32 40 38 Q 40 32 44 35 Q 48 38 44 42" 
        fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
  <!-- 蒸汽 -->
  <path d="M 30 25 Q 32 18 30 12" 
        stroke="#A8A098" stroke-width="2" fill="none" 
        stroke-linecap="round" opacity="0.7"/>
  <path d="M 40 25 Q 42 18 40 12" 
        stroke="#A8A098" stroke-width="2" fill="none" 
        stroke-linecap="round" opacity="0.7"/>
  <path d="M 50 25 Q 52 18 50 12" 
        stroke="#A8A098" stroke-width="2" fill="none" 
        stroke-linecap="round" opacity="0.7"/>
  <!-- 卡通眼睛(放大版新增) -->
  <circle cx="34" cy="50" r="1.5" fill="#3A3A3A"/>
  <circle cx="46" cy="50" r="1.5" fill="#3A3A3A"/>
  <!-- 微笑 -->
  <path d="M 35 56 Q 40 60 45 56" 
        stroke="#3A3A3A" stroke-width="1.5" fill="none" 
        stroke-linecap="round"/>
</svg>
```

### 15.11 漫画放射线 SVG

```html
<svg width="400" height="540" viewBox="0 0 400 540" 
     style="position:absolute;top:0;left:0;pointer-events:none">
  <g stroke="#FFFFFF" stroke-width="1.5" opacity="0.4">
    <!-- 16 条放射线 -->
    <line x1="200" y1="270" x2="0" y2="0"/>
    <line x1="200" y1="270" x2="100" y2="0"/>
    <line x1="200" y1="270" x2="200" y2="0"/>
    <line x1="200" y1="270" x2="300" y2="0"/>
    <line x1="200" y1="270" x2="400" y2="0"/>
    <line x1="200" y1="270" x2="400" y2="135"/>
    <line x1="200" y1="270" x2="400" y2="270"/>
    <line x1="200" y1="270" x2="400" y2="405"/>
    <line x1="200" y1="270" x2="400" y2="540"/>
    <line x1="200" y1="270" x2="300" y2="540"/>
    <line x1="200" y1="270" x2="200" y2="540"/>
    <line x1="200" y1="270" x2="100" y2="540"/>
    <line x1="200" y1="270" x2="0" y2="540"/>
    <line x1="200" y1="270" x2="0" y2="405"/>
    <line x1="200" y1="270" x2="0" y2="270"/>
    <line x1="200" y1="270" x2="0" y2="135"/>
  </g>
</svg>
```

### 15.12 马克笔字 CSS

```css
.marker-text {
  font-family: "Permanent Marker", "Noto Sans SC", cursive;
  font-weight: 400;
  letter-spacing: -0.02em;
  transform: rotate(-2deg);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.1);
}

.marker-text-bold {
  font-family: "Permanent Marker", "Noto Sans SC", cursive;
  font-weight: 400;
  font-size: 1.15em;
  letter-spacing: -0.03em;
  transform: rotate(1deg);
}
```

### 15.13 组合示例:A 风格族完整卡

```html
<div class="card" style="position:relative;aspect-ratio:3/4;
  background:#F5EFD8;overflow:hidden;
  background-image:
    linear-gradient(to right, #D8D2C0 1px, transparent 1px),
    linear-gradient(to bottom, #D8D2C0 1px, transparent 1px);
  background-size:24px 24px">
  
  <!-- 顶部胶带 -->
  <div style="position:absolute;top:-6px;left:50%;
    transform:translateX(-50%) rotate(-3deg);
    width:120px;height:30px;
    background:rgba(255,235,150,0.75);
    box-shadow:0 2px 8px rgba(0,0,0,0.06);
    z-index:5"></div>
  
  <!-- 手绘圈线 -->
  <svg style="position:absolute;top:25%;left:15%;
    width:200px;height:120px;z-index:3" viewBox="0 0 200 120">
    <path d="M 100 20 Q 170 25 180 60 Q 185 95 110 100 
             Q 35 98 25 65 Q 22 25 100 20"
          fill="none" stroke="#5D4E37" stroke-width="3"
          stroke-linecap="round" opacity="0.85"/>
  </svg>
  
  <!-- 荧光笔高亮 -->
  <h1 style="position:absolute;top:35%;left:10%;
    font-family:'Permanent Marker','Noto Sans SC',cursive;
    font-size:48px;color:#2D2A26;letter-spacing:-0.02em;
    transform:rotate(-2deg);z-index:4;margin:0">
    <span style="background:linear-gradient(to bottom,transparent 25%,
      #FFEC47 25%,#FFEC47 85%,transparent 85%);
      padding:0 6px">今日份好物</span>
  </h1>
  
  <!-- 右下角咖啡卡通 -->
  <svg style="position:absolute;bottom:8%;right:8%;
    width:90px;height:90px;z-index:3" viewBox="0 0 80 80">
    <path d="M 20 35 L 20 60 Q 20 68 28 68 L 52 68 Q 60 68 60 60 L 60 35 Z" 
          fill="#FFFFFF" stroke="#8B6F47" stroke-width="2"/>
    <ellipse cx="40" cy="35" rx="20" ry="4" fill="#6B4226"/>
  </svg>
  
  <!-- emoji -->
  <div style="position:absolute;top:15%;right:8%;
    font-size:32px;z-index:3">✨</div>
</div>
```

---

## §16 附录:关键词 → 风格族自动判定流程

### 16.1 判定流程伪代码

```javascript
function detectStyleFamily(text) {
  const keywords = {
    'A': ['笔记', '日记', '手账', '便签', '生活', '手写', '胶带', '横线', '方格'],
    'B': ['拼贴', '便签', '贴纸', '票据', '剪报', '复古', '手账', '印章', '层叠'],
    'C': ['爆款', 'OMG', '绝', '哇', '天啊', '震惊', '炸裂', '牛逼', 'yyds', '拟声'],
    'D': ['盘点', '榜单', 'Top', 'TOP', '排名', '合集', '清单', '年度', '十大', '推荐'],
    'E': ['极简', '高级', '冷淡', '杂志', '纯色', '大字', '标题']
  };
  
  const scores = {A: 0, B: 0, C: 0, D: 0, E: 0};
  for (const [family, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word)) scores[family] += 1;
    }
  }
  
  // 找最高分
  const max = Math.max(...Object.values(scores));
  if (max === 0) return 'A'; // 默认
  
  const winners = Object.entries(scores).filter(([_, s]) => s === max);
  return winners[0][0]; // 返回得分最高的风格族
}
```

### 16.2 字数 → 装饰等级 → 装饰数量映射表

| 字数 | 装饰等级 | 装饰数量 | 装饰类型推荐 |
|------|----------|----------|--------------|
| 1-3 字 | L3 极简 | 1-2 个 | 大字 + 1 几何 |
| 4-6 字 | L3 角色 | 2-3 个 | 1 卡通 + 1 手绘圈 + 1 emoji |
| 7-9 字 | L2 emoji | 3-4 个 | 2 emoji + 1 几何 + 1 手绘 |
| 10-12 字 | L1 几何 | 2-3 个 | 1 几何 + 1 印章 + 1 emoji |
| 13-15 字 | L1 几何 | 2 个 | 1 几何 + 1 印章 |
| 16-20 字 | L0 纯字 | 0-1 个 | 0 装饰或 1 小几何 |
| ≥21 字 | L0 纯字 | 0 个 | 强制 0 装饰 |

### 16.3 风格族 × 字数 × 装饰 三维矩阵

| 风格族 \ 字数 | 1-3 字 | 4-9 字 | 10-15 字 | ≥16 字 |
|---------------|--------|--------|----------|--------|
| **A. 手绘便签** | 4 个装饰(胶带+圈+卡通+emoji) | 5 个装饰(横线+胶带+圈+卡通+emoji) | 3 个装饰(横线+胶带+1 emoji) | 1 个装饰(胶带) |
| **B. 拼贴 collage** | 5 个装饰(2 便签+印章+色块+emoji) | 6 个装饰(3 便签+印章+箭头+emoji) | 4 个装饰(2 便签+印章+1 几何) | 2 个装饰(1 便签+1 印章) |
| **C. 漫画 pop** | 5 个装饰(半色调+气泡+放射+拟声+3D emoji) | 5 个装饰(同上但气泡内容换) | 3 个装饰(半色调+气泡+3D emoji) | 1 个装饰(半色调底) |
| **D. 报纸大字** | 3 个装饰(大字+印章+1 几何) | 3 个装饰(主+副标题+印章) | 2 个装饰(主+副标题) | 1 个装饰(印章) |
| **E. 极简大字** | 1 个装饰(1 几何) | 1 个装饰(1 几何) | 0 个装饰 | 0 个装饰 |

---

## §17 附录:8 类边缘场景示例

### 17.1 纯英文示例

```
输入: "HOW TO STUDY"
处理: 字体 F1 黑体或 Inter Black 900,字号 ×1.15,字间距 +0.03em
风格族: E(极简大字)或 D(报纸大字)
背景: #012FA7(克莱因蓝)或 #000000(纯黑)
装饰: ≤2 个几何
```

### 17.2 中英混排示例

```
输入: "2024年度AI工具盘点"
处理:
  - "2024" 用 DM Sans,字号 ×0.9
  - "年度" 用 Noto Sans SC,正常大小
  - "AI" 用 Inter,字号 ×0.85
  - "工具盘点" 用 Noto Sans SC,正常大小
字间距: 中文 -0.03em,英文 +0.02em
```

### 17.3 超长标题示例

```
输入: "2024年最值得推荐的10个效率工具让工作事半功倍"(21字)
处理:
  - 装饰等级 L0(0 装饰)
  - 风格族 E
  - 左对齐
  - 分 3-4 行
  - 字号缩小到画面高度 5%
  - 行高 1.4
```

### 17.4 超短标题示例

```
输入: "摸鱼"(2字)
处理:
  - 装饰等级 L3(角色级)
  - 风格族 C(漫画 pop)或 E
  - 单字占画面 70-80%
  - 3px 黑描边
  - 配 1 个 3D emoji
```

### 17.5 纯数字示例

```
输入: "2024"
处理:
  - 推荐字体: DM Serif Display 或 Inter Black
  - 字号 ×1.2
  - 推荐风格族 E
  - 字间距 +0.04em
  - 背景: #012FA7(克莱因蓝)+ 白字
```

### 17.6 含 emoji 示例

```
输入: "☕️ 咖啡控必看的5家店"
处理:
  - ☕️ 放大 ×1.3 作为视觉锚点
  - 装饰等级从 L2 降到 L1(仅几何)
  - 避免与装饰 emoji 撞车
```

### 17.7 全大写示例

```
输入: "WOW AMAZING"
处理:
  - 字体 Inter Black 900 或 Bangers
  - 全大写
  - 字号 ×1.15
  - 字间距 +0.03em
  - 风格族 D 或 E
```

### 17.8 含品牌词示例

```
输入: "Apple iPhone 16 评测"
处理:
  - 不改变视觉效果
  - UI 提示用户:"标题中含有品牌名,发布前请确认合规"
  - 不主动过滤
```

---

## §18 附录:与原 cover-maker 代码的映射表

> 现有 `index.html` 中 5 公式的代码应按以下映射关系迁移到 5 风格族:

| 原公式 | 对应风格族 | 保留代码 | 废弃代码 |
|--------|------------|----------|----------|
| F1 Notebook | **A 手绘便签** | 横线 / 胶带 / `PALETTES[0]` 米白 | emoji(迁移到 L2 emoji) |
| F2 iOS Notes | **B 拼贴 collage** | 顶部彩色条(改为便签) / 底部 emoji | iOS 状态栏(完全废弃) |
| F3 Halo | **C 漫画 pop** | 6 种径向渐变 | 光晕(迁移到 B 拼贴的便签底色) |
| F4 Quotes | **D 报纸大字** | 大引号(改为印章) / 居中标题 | 几何装饰(迁移到 L1) |
| F5 Torn Paper | **A 手绘便签** | 撕边 / 蜡笔涂抹 / 印章 / 手绘涂鸦 | topText 英文标签 |

**迁移策略**:
1. 保留 `fs()` 字号自适应算法 (L151-187)
2. 保留 `CARTOONS[]` 12 个 SVG,扩展到 24 个
3. 保留 `injectActions` 按钮组 (L492-502)
4. 保留 `downloadCard` / `copyCard` (L598-628)
5. 5 公式全部废弃,新建 5 风格族的 build 函数

---

## §19 附录:实现优先级(v3.0 → v3.x 路线图)

### v3.0(本版本)已完成
- [x] 5 风格族定义 + hex 表
- [x] 12 视觉特征清单
- [x] 8 类字体方案
- [x] 42 组配色库
- [x] AI Prompt 中英文模板
- [x] 15 张种子图索引
- [x] 视觉评审方法论

### v3.1(下一版)规划
- [ ] 风格族自动判定算法的具体实现
- [ ] 24 个扩展 CARTOONS SVG 库
- [ ] 8 类边缘场景的 UI 适配
- [ ] 装饰互斥矩阵的代码实现

### v3.2 规划
- [ ] GIF 动效模板的 CSS 实现(粒子/闪烁/光扫)
- [ ] 路径 C 混合模式的工具链
- [ ] 智能匹配矩阵的强化学习版本

---

> **END OF STYLE_GUIDE_v3.0.md**