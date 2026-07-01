# 小红书"大字封面"风格蒸馏 · 完整指南

> 基于 193 张稿定设计官方模板的程序化分析 + 设计经验归纳  
> 目标：投喂 AI 图像生成模型（Midjourney / DALL·E / SD），及/或驱动程序化封面生成器

---

## 一、数据底片（193 张模板的统计真相）

### 1.1 尺寸
| 尺寸 | 占比 | 用途 |
|------|------|------|
| 1242×1656 (3:4) | **90.1%** | 小红书标准封面 |
| 1242×2208 (9:16) | 6.2% | 视频封面 / 故事 |
| 1242×1242 (1:1) | 1.6% | 朋友圈 / 头像 |
| 其他 | 2.1% | — |

### 1.2 背景色系
| 色系 | 占比 | 典型颜色 |
|------|------|----------|
| 浅灰 / 近白（#ececec ~ #f5f5f5） | **43%** | `#eeeeee` `#ededed` `#f0f0f0` |
| 黄色系（奶油 / 柠檬 / 暖黄） | **17%** | `#fff9e1` `#fde6a5` `#ffec47` `#f8d612` |
| 纯白（#ffffff / #fafafa） | **10%** | `#ffffff` `#fcf9f0` |
| 红 / 橙 | **6%** | `#f90000` `#ed0108` `#e6213d` `#ff6333` |
| 蓝色系 | **5%** | `#cfdcfe` `#012fa7` `#cfeaff` |
| 绿色系 | **2%** | `#b8e300` `#8feba0` |
| 粉色 / 紫色 | **2%** | `#f78de9` `#ff4ce5` `#fddde2` |
| 其他混合 | 15% | — |

### 1.3 文字色
| 类型 | 占比 | 含义 |
|------|------|------|
| **浅色 / 白色文字** | **65%** | 压在彩色或灰色背景上 |
| 深色 / 黑色文字 | 33% | 压在浅色或白色背景上 |
| 彩色文字 | 2% | 少见，多为强调 |

### 1.4 饱和度
| 等级 | 占比 | 视觉感受 |
|------|------|----------|
| 几乎无彩（黑白灰） | 34% | 极简、高级、冷淡 |
| 低饱和柔色（莫兰迪/奶油） | 33% | 温柔、治愈、生活感 |
| 中等饱和 | 19% | 醒目但不刺眼 |
| 高饱和纯色 | 9% | 强冲击、年轻、促销感 |

### 1.5 明度对比度
| 等级 | 占比 |
|------|------|
| 高对比（>180） | 13% |
| 中对比（100-180） | 72% |
| 低对比（<100） | 15% |

### 1.6 文字位置
| 位置 | 占比 |
|------|------|
| 白色文字压在有色背景上 | **78%** |
| 满版撑满（文字几乎碰到边缘） | 18% |
| 居中大文字 | 3% |
| 下半部文字 | 2% |

### 1.7 关键发现
1. **65% 模板 = 有色背景 + 白色大字**，这是"大字封面"的核心公式
2. **仅 14% 用了分区布局**，绝大多数是整块纯色背景
3. **平均明度对比 140**（WCAG AAA 级别），确保手机小屏可读
4. **装饰极少**，文字就是画面主角

---

## 二、7 大风格公式（AI 可理解的高颗粒度 prompt）

### 公式 ① 纯色大字（占比 ≈45%）

**核心特征**
- 整块单一纯色背景，无渐变无纹理
- 白色或浅色超大粗体中文标题，撑满画面 60-80%
- 零装饰或仅 1 个极小的几何元素
- 文字可能略微超出画布边缘（bleed 效果）

**颜色搭配表**
| 子风格 | 背景色 hex | 文字色 hex | 视觉感受 |
|--------|-----------|-----------|----------|
| 奶油黄 | `#FFF9E1` | `#FFFFFF` | 温暖治愈 |
| 柠檬黄 | `#FFEC47` | `#FFFFFF` | 明亮活泼 |
| 正红 | `#ED0108` | `#FFFFFF` | 强冲击力 |
| 珊瑚橙 | `#FF6333` | `#FFFFFF` | 活力年轻 |
| 克莱因蓝 | `#012FA7` | `#FFD95F` | 科技高级 |
| 莫兰迪灰蓝 | `#CFDCFE` | `#FFFFFF` | 冷淡高级 |
| 灰白 | `#EEEEEE` | `#000000` | 极简杂志 |
| 纯白 | `#FFFFFF` | `#000000` | 零设计感 |
| 荧光绿 | `#B8E300` | `#000000` | 潮酷街头 |
| 薰衣草紫 | `#E1BEE7` | `#4A148C` | 女性温柔 |
| 婴儿粉 | `#FDDDE2` | `#000000` | 少女甜美 |
| 薄荷绿 | `#D7FED1` | `#000000` | 清新自然 |

**AI Prompt（英文·高颗粒度）**
```
A 3:4 aspect ratio typographic poster, minimal editorial design.
Solid [COLOR] background covering the entire frame, no gradient, no texture.
Giant white Chinese characters filling 70% of the canvas,
ultra-bold sans-serif typeface (equivalent to Noto Sans SC Black 900),
text slightly bleeding off the edges, tight letter-spacing (-0.03em),
zero decorative elements except optionally one tiny geometric dot or line in a corner,
high contrast between background and text (luminance ratio > 8:1),
flat design, no shadows, no 3D effects,
shot on a neutral studio background, soft diffused lighting, 8K resolution,
xiaohongshu cover style, social media thumbnail aesthetic
```

**AI Prompt（中文·高颗粒度）**
```
一张3:4比例的排版海报，极简编辑设计。
整块[颜色]纯色背景铺满全画面，无渐变，无纹理。
巨大的白色/浅色粗体中文标题，填充画面70%面积，
超粗无衬线字体（相当于思源黑体 Black 900字重），
文字略微超出画布边缘，紧凑字间距(-0.03em)，
除角落可能有一个极小几何点或线之外，零装饰元素，
高对比度（背景与文字明度差>8:1），
平面设计，无阴影，无立体效果，
中性影棚光线拍摄，柔和散射光，8K分辨率，
小红书封面风格，社交媒体缩略图美学
```

---

### 公式 ② 荧光撞色（占比 ≈12%）

**核心特征**
- 高饱和荧光色背景（霓虹黄/电光粉/荧光绿）
- 黑色或白色超粗文字，形成强色相反差
- 略带街头/潮流感，适合年轻话题
- 偶尔有极细的白色几何线或点

**颜色搭配表**
| 子风格 | 背景 hex | 文字 hex | 搭配元素 |
|--------|---------|---------|----------|
| 荧光黄+黑 | `#FFEC47` | `#000000` | 极细白线点缀 |
| 电光粉+白 | `#FF4CE5` | `#FFFFFF` | 黑色小圆点 |
| 霓虹绿+黑 | `#B8E300` | `#000000` | — |
| 正红+白 | `#ED0108` | `#FFFFFF` | 黄色几何块 |
| 宝蓝+黄字 | `#2677DE` | `#FFC106` | — |
| 橙+白 | `#FF6333` | `#FFFFFF` | 蓝色小方 |

**AI Prompt（英文）**
```
A 3:4 neon typographic poster, vibrant high-saturation [COLOR] background,
ultra-bold black Chinese headline filling 65-75% of the frame,
heavy sans-serif type, street culture aesthetic,
0-1 tiny geometric accent elements (hairline circle or dot in opposite color),
maximum color contrast, slightly gritty urban vibe,
flat vector style with subtle grain texture overlay (2% opacity),
no gradients, no photographs, no illustrations,
xiaohongshu thumbnail, eye-catching social media cover
```

---

### 公式 ③ 奶油质感（占比 ≈10%）

**核心特征**
- 米白/奶白/杏色底，如纸张自然色
- 深棕色或炭灰色粗体文字
- 柔和暖调光影感，像自然光打在纸上
- 带极微弱的纸纹理，但不是明显纹理

**颜色搭配表**
| 子风格 | 背景 hex | 文字 hex |
|--------|---------|---------|
| 奶白+炭灰 | `#FCF9F0` | `#2D2A26` |
| 米黄+深棕 | `#FDF6E9` | `#5D4E00` |
| 杏色+深灰 | `#FAF5EA` | `#3A3A3A` |
| 浅灰+黑 | `#EDEDED` | `#000000` |

**AI Prompt（英文）**
```
A 3:4 warm-toned poster, cream/beige paper-like background,
soft natural lighting with subtle warmth (color temperature ~4500K),
dark brown or charcoal bold Chinese title, serif or heavy sans-serif,
text fills 55-65% of frame, generous but not excessive margins,
hint of paper grain texture (barely perceptible, 1-2% opacity noise),
no decorative elements, pure typography,
elegant lifestyle magazine aesthetic, cozy and refined,
soft shadows only from ambient occlusion of paper edges (subtle vignette),
8K, photorealistic paper texture
```

---

### 公式 ④ 大阴影浮雕（占比 ≈8%）

**核心特征**
- 文字带有粗重的投影（drop shadow）或外描边（outline stroke）
- 文字从背景中"跳出"，有 2.5D 立体感
- 阴影通常偏移 4-8px，颜色为黑色或同色系深色
- 背景通常为鲜艳纯色

**颜色搭配表**
| 子风格 | 背景 hex | 文字 hex | 阴影 |
|--------|---------|---------|------|
| 粉底+白字黑影 | `#F78DE9` | `#FFFFFF` | `#000000` 40% |
| 黄底+黑字黄影 | `#FFE81C` | `#000000` | `#CC9C00` |
| 青底+白字黑影 | `#CFFBFE` | `#000000` | `#000000` 30% |
| 红底+白字黑影 | `#E6213D` | `#FFFFFF` | `#000000` 50% |

**AI Prompt（英文）**
```
A 3:4 poster, bold [COLOR] background,
giant Chinese title with HEAVY drop shadow (8px offset, 40% opacity black),
text appears to float above the background with strong 3D depth,
bold sans-serif typeface, text fills 60-70% of canvas,
shadow creates a cast-shadow effect as if text is a physical cutout,
flat lighting on the background, shadow only on the text,
no other decorative elements, pure typographic poster,
xiaohongshu cover style, high impact thumbnail
```

---

### 公式 ⑤ 双色竖分（占比 ≈8%）

**核心特征**
- 画面竖着分成两半：一半纯色块 + 一半白/浅灰底
- 大字跨两个区域的边界，或偏在某一侧
- 左右分或上下分，左右分更常见
- 分割线通常笔直锐利，无过渡

**颜色搭配表**
| 子风格 | 左/上色 | 右/下色 | 文字色 |
|--------|---------|---------|--------|
| 黄+白 | `#FDE6A5` | `#FFFFFF` | `#000000` |
| 红+白 | `#ED0108` | `#FFFFFF` | `#FFFFFF` |
| 蓝+白 | `#CFDCFE` | `#FFFFFF` | `#000000` |
| 灰+白 | `#DDDDDD` | `#FFFFFF` | `#000000` |
| 黑+黄 | `#000000` | `#FFE81C` | `#FFFFFF` |

**AI Prompt（英文）**
```
A 3:4 poster with a strict vertical split layout,
left half [COLOR_A] solid block, right half [COLOR_B] solid block,
clean sharp dividing line between the two zones (no gradient, no blur),
giant Chinese title crossing both color zones or positioned asymmetrically in one zone,
ultra-bold typography, editorial magazine spread aesthetic,
minimal and structured, modern Swiss design influence,
no decorations beyond the geometric split itself,
high contrast, flat vector style, xiaohongshu cover
```

---

### 公式 ⑥ 信息层叠（占比 ≈5%）

**核心特征**
- 主标题（40% 面积）+ 副标题（15%）+ 底部标签/编号（5%）
- 三层信息结构，类似杂志目录页
- 有明显的视觉层级：大→中→小
- 常用于教程、清单、多主题合集类封面

**AI Prompt（英文）**
```
A 3:4 editorial layout poster on a [COLOR] background,
three-level typography hierarchy:
  Level 1 (top 40%): giant bold Chinese headline, largest font,
  Level 2 (middle 30%): medium subtitle or secondary text,
  Level 3 (bottom 10%): small tag, date, or number stamp,
clean grid alignment, generous white space between levels,
thin horizontal separator line between sections (1px, 30% opacity),
sophisticated magazine cover aesthetic,
flat design, pure typography, no images,
xiaohongshu educational/guide cover style
```

---

### 公式 ⑦ 几何装饰（占比 ≈2%）

**核心特征**
- 纯色背景 + 大字标题
- 文字周围点缀 1-3 个极简几何元素（实心圆、空心圆、短横线、小方块、括号）
- 几何元素小且克制，不抢文字注意力
- 类似现代品牌 VI 的简练感

**AI Prompt（英文）**
```
A 3:4 poster, clean [COLOR] solid background,
large Chinese title in bold type,
surrounded by 1-3 tiny geometric accent elements:
  - solid or outlined circle (8-12px diameter)
  - short horizontal line (20-40px length, 2px width)
  - small square (8-10px)
  - parentheses or bracket fragment
elements positioned in corners or near the title, not centered,
modern branding / visual identity aesthetic,
clean, minimal, graphic design poster,
xiaohongshu creative cover style
```

---

### 2.8 公式 × 话题智能匹配矩阵

以下矩阵用于：用户输入文案后，系统自动检测话题类型并推荐最佳公式。

```
检测方式：关键词匹配 → 话题分类 → 主推公式 + 备选公式
```

| 话题分类 | 触发关键词 | 主推公式 | 备选公式 | 推荐配色系 | 推荐字体 |
|----------|-----------|----------|----------|-----------|----------|
| 📊 职场/效率 | 职场、工作、效率、工具、上班、加班、PPT、Excel、开会、述职、跳槽、简历、面试 | ① 纯色大字 | ⑥ 信息层叠 | 蓝色系 b1-b6 | F1 黑体 |
| 📚 学习/考试 | 学习、读书、考试、笔记、考研、考证、英语、日语、编程、上课、期末 | ① 纯色大字 | ⑥ 信息层叠 | 黄色系 y1-y4 | F1 黑体 / F2 宋体 |
| 🍔 美食/探店 | 吃、喝、美食、餐厅、咖啡、奶茶、蛋糕、面包、探店、火锅、甜品、料理 | ② 荧光撞色 | ① 纯色大字 | 红橙系 r1-r6 / 黄系 | F3 快乐 / F1 黑体 |
| 💄 美妆/穿搭 | 穿搭、美妆、护肤、口红、香水、发型、OOTD、化妆品、粉底、眼影 | ③ 奶油质感 | ⑤ 双色竖分 | 粉紫系 p1-p6 | F5 小薇 / F2 宋体 |
| 💰 理财/副业 | 钱、理财、副业、赚钱、投资、省钱、基金、股票、存款、收入、被动收入 | ① 纯色大字 | ④ 大阴影 | 黄色系 y2-y5 / 红系 | F1 黑体 |
| ❤️ 情感/关系 | 情感、恋爱、分手、暗恋、前任、暧昧、相亲、婚姻、闺蜜、友情 | ③ 奶油质感 | ⑦ 几何装饰 | 粉紫系 p4-p6 / 奶白 | F4 手写 / F6 草书 |
| ✈️ 旅行/出游 | 旅行、旅游、攻略、酒店、民宿、打卡、探店、自驾、徒步、背包客 | ③ 奶油质感 | ⑦ 几何装饰 | 绿色系 g1-g4 / 蓝系 | F5 小薇 |
| 🏠 家居/生活 | 家居、装修、收纳、租房、布置、整理、搬家、独居、改造、好物 | ③ 奶油质感 | ⑤ 双色竖分 | 灰白系 w1-w5 | F2 宋体 |
| 🏃 运动/健身 | 运动、健身、跑步、瑜伽、减肥、跳绳、增肌、减脂、马甲线 | ② 荧光撞色 | ① 纯色大字 | 蓝系 b1-b5 / 绿系 | F1 黑体 |
| 🎮 科技/数码 | 科技、数码、手机、电脑、App、AI、人工智能、ChatGPT、工具 | ⑤ 双色竖分 | ① 纯色大字 | 蓝系 b1-b6 / 黑 | F1 黑体 |
| 🎵 娱乐/追星 | 综艺、追星、偶像、演唱会、音乐、电影、电视剧、综艺、追剧 | ② 荧光撞色 | ④ 大阴影 | 粉紫系 p1-p3 / 撞色 | F3 快乐 / F1 黑体 |
| 🎓 育儿/母婴 | 育儿、宝宝、母婴、亲子、带娃、幼儿园、怀孕、产后 | ③ 奶油质感 | ⑦ 几何装饰 | 粉系 p4-p6 / 奶黄 | F3 快乐 / F4 手写 |
| 🐱 萌宠 | 猫、狗、宠物、猫咪、狗狗、萌宠、主子、铲屎官 | ② 荧光撞色 | ③ 奶油质感 | 黄系 y1-y4 / 暖色 | F3 快乐 |
| 🎨 创意/设计 | 创意、设计、灵感、配色、排版、海报、品牌、LOGO | ⑦ 几何装饰 | ⑤ 双色竖分 | 灰白系 w1-w8 / 撞色 | F5 小薇 / F2 宋体 |
| 🎉 节庆/促销 | 618、双11、双十二、新年、圣诞、国庆、情人节、母亲节、促销 | ② 荧光撞色 | ④ 大阴影 | 红系 r1-r4 / 撞色 | F1 黑体 |

**匹配强度说明：**
- **精确匹配**（命中触发关键词的前 50 个汉字内）→ 置信度 90%，直接用主推公式
- **模糊匹配**（全文中出现但距离较远）→ 置信度 60%，主推+备选各占 50%
- **无匹配**（未命中任何话题）→ 默认公式 ① + 随机配色，或让用户手动选

**用户覆盖规则：**
如果用户手动选了公式/配色/字体，则忽略自动匹配，以用户选择为准。

---

## 三、统一底层基因（适用所有公式）

无论用以上哪个公式，以下规则锁定"大字封面"的逼真度：

### 3.1 字号铁律
| 规则 | 值 | 说明 |
|------|-----|------|
| 主标题占比 | **60-80%** 画面面积 | 文字是视觉主体 |
| 最小字号 | 不小于画面高度的 **8%** | 保证缩略图可读 |
| 字重 | **≥700 (Bold)**，推荐 900 (Black) | 中文细字在封面中无存在感 |
| 字数 | **3-12 字** 最理想 | 超过 15 字需缩小到破坏风格 |
| 行数 | **1-3 行** | 超过 3 行失去"大字"冲击力 |

### 3.2 配色铁律
| 规则 | 说明 |
|------|------|
| 只用 **1-2 色** | 背景色 + 文字色 = 两个颜色 |
| 明度对比 ≥ **100** | 确保手机屏可读（WCAG AAA） |
| 不用纯 `#000` 配纯 `#FFF` | 用 `#2D2A26` 配 `#FAFAFA`，更高级 |
| 高饱和背景用白色文字 | 红/蓝/绿底一律白字 |
| 低饱和背景用深色文字 | 奶油/米白底用深棕/炭灰 |

### 3.3 构图铁律
| 规则 | 说明 |
|------|------|
| 文字可略微 **bleed** 出画布 | 增强视觉张力（5% 溢出边界） |
| 左右留白 ≤ **8%** | 最大化文字空间 |
| 上下留白 ≤ **12%** | 宽松但不过度 |
| 文字对齐：**居中** 或 **偏左** | 极少数偏右（需要特殊理由） |
| **不要**在角落放 logo | 封面是独立视觉作品 |

### 3.4 装饰铁律
| 规则 | 说明 |
|------|------|
| 装饰元素 ≤ **2 个** | 超过 2 个就不是"大字封面"了 |
| 装饰面积 ≤ **3%** 画面 | 极小、克制 |
| 装饰类型：**几何 > 插画 > 照片** | 几何点线面是最安全的装饰 |
| 装饰在角落 | 不在画面中心区域 |

### 3.5 字体排版细节参数（投喂 AI 必备）

#### 3.5.1 字间距（letter-spacing）

| 字号范围 | letter-spacing (px) | letter-spacing (em) | 适用场景 |
|----------|---------------------|---------------------|----------|
| 48-64px (Hero 大字) | -2 ~ -4px | **-0.03em ~ -0.05em** | 收紧字距，增强整体感 |
| 32-46px (中等标题) | -0.5 ~ -2px | **-0.01em ~ -0.03em** | 微收紧 |
| 16-30px (小标题/副标题) | 0 ~ +1px | **0 ~ +0.02em** | 正常或微松 |
| 10-14px (标签/辅助) | +1 ~ +3px | **+0.05em ~ +0.15em** | 松散，提高小字可读性 |

**黑体/无衬线规则：** 大字号必须负间距（收紧），否则中文字会显得松散。
**宋体/衬线规则：** 正常间距即可，衬线笔画本身有视觉连接。
**手写/草书规则：** 正间距（+0.03~0.08em），保留手写呼吸感。

#### 3.5.2 行间距（line-height）

| 行数 | 最佳 line-height | 说明 |
|------|-----------------|------|
| 1 行 | **1.0 ~ 1.1** | 无行间距需求，文字填满 |
| 2 行 | **1.15 ~ 1.25** | 紧凑但可分辨两行 |
| 3 行 | **1.25 ~ 1.35** | 需清晰区分行边界 |
| ≥4 行 | **1.35 ~ 1.5** | 避免行间视觉挤压 |

#### 3.5.3 文字描边（-webkit-text-stroke）

描边用于增强文字可读性（尤其在图片/渐变背景上）：

| 描边用途 | 粗细 | 颜色 | 适用场景 |
|----------|------|------|----------|
| 轻微增强对比 | **1px** | 同文字色或稍深 | 浅色背景深色字 |
| 标准描边 | **2-3px** | 黑色或深灰 | 彩色背景白色字 |
| 重描边（漫画风） | **4-6px** | 黑色 | 荧光撞色、街头风 |
| 发光描边 | **0px + box-shadow** | 同色系浅色 | 夜间/深色背景 |

```
CSS 示例:
/* 白字 + 3px 黑描边 = 最稳组合 */
text-shadow: 
  -3px -3px 0 #000000,  
   3px -3px 0 #000000,
  -3px  3px 0 #000000,
   3px  3px 0 #000000;
```

#### 3.5.4 中英文/数字混排

| 混排类型 | 英/数专用字体 | 相对中文字号 |
|----------|-------------|-------------|
| 中文标题中含英文单词 | Inter / DM Sans | **×0.85**（英文视觉更大） |
| 中文标题中含数字 | Inter / SF Pro | **×0.9**（数字比中文窄） |
| 纯英文标题 | Inter Bold 800+ | 正常字号的 **×1.15** |
| 日期/编号 | DM Serif Display | 正常 |

**中英混排 AI Prompt 补充：**
```
Chinese and English mixed typography:
Chinese characters in [CHINESE_FONT], 
English words and numbers in Inter/DM Sans, 
English glyphs 15% smaller than Chinese to maintain visual balance.
```

#### 3.5.5 主标题 × 副标题 字号比例

| 主标题:副标题 | 视觉感受 | 适用话题 |
|---------------|----------|----------|
| **3:1** | 强主次，主标题极突出 | 干货、教程、工具 |
| **2.5:1** | 经典比例，最常用 | 通用 |
| **2:1** | 副标题存在感较强 | 生活、叙事、情感 |
| **1.8:1** | 接近同等重要 | 合集、对比、清单 |

#### 3.5.6 文字阴影参数（仅公式④）

```
/* 标准 drop shadow */
text-shadow: 6px 6px 0 rgba(0,0,0,0.35);

/* 硬边浮雕（无模糊）*/
text-shadow: 4px 4px 0 #CC3300;

/* 双层阴影（深度感）*/
text-shadow: 
  3px 3px 0 rgba(0,0,0,0.25),
  8px 8px 12px rgba(0,0,0,0.15);
```

---

## 四、"换一换"可替换元素体系

### 4.1 元素维度矩阵

```
                    ┌──────────────────────────────────────┐
                    │          "换一换" 可替换维度            │
                    ├───────────┬──────────┬───────────────┤
                    │  不可替换  │  可替换  │   独立刷新     │
                    ├───────────┼──────────┼───────────────┤
                    │ 文字内容   │ ✅ 背景色 │ ✅ 几何装饰    │
                    │ 排版公式   │ ✅ 文字色 │ ✅ 卡通形象    │
                    │ 画布比例   │ ✅ 字体   │ ✅ emoji       │
                    │           │ ✅ 饱和度 │ ✅ 角落贴纸    │
                    │           │ ✅ 对比度 │ ✅ 纹理/噪点   │
                    │           │          │ ✅ 光斑位置     │
                    └───────────┴──────────┴───────────────┘
```

### 4.2 "换一换"的 5 层替换策略

#### 第 1 层：配色替换（低成本，高感知差异）
每次"换一换"从配色库中抽取一组新配色，保持公式不变。

**配色库**（7×6=42 组）：

```
🟡 黄色系:
  y1: bg=#FFF9E1 字=#000000  奶黄+黑
  y2: bg=#FFEC47 字=#000000  柠檬黄+黑
  y3: bg=#FDE6A5 字=#000000  米黄+黑
  y4: bg=#FFE81C 字=#000000  明黄+黑
  y5: bg=#F8D612 字=#FFFFFF  金黄+白
  y6: bg=#FFD95F 字=#012FA7  鹅黄+蓝(撞色)

🔴 红/橙系:
  r1: bg=#ED0108 字=#FFFFFF  正红+白
  r2: bg=#E6213D 字=#FFFFFF  玫红+白
  r3: bg=#FF6333 字=#FFFFFF  珊瑚橙+白
  r4: bg=#8C1A1A 字=#FFFFFF  深红+白
  r5: bg=#FFCDD2 字=#000000  浅粉+黑
  r6: bg=#D23627 字=#FFFFFF  铁锈红+白

🔵 蓝色系:
  b1: bg=#012FA7 字=#FFD95F  深蓝+黄(撞色)
  b2: bg=#CFDCFE 字=#000000  莫兰迪蓝+黑
  b3: bg=#CFFBFE 字=#000000  粉蓝+黑
  b4: bg=#CEEAFF 字=#000000  淡蓝+黑
  b5: bg=#2677DE 字=#FFFFFF  宝蓝+白
  b6: bg=#7DABE7 字=#FFFFFF  天蓝+白

🟢 绿色系:
  g1: bg=#B8E300 字=#000000  荧光绿+黑
  g2: bg=#D7FED1 字=#000000  薄荷绿+黑
  g3: bg=#8FEBA0 字=#000000  翠绿+黑
  g4: bg=#02A789 字=#FFFAEC  深绿+米白

🟣 紫/粉色系:
  p1: bg=#F78DE9 字=#000000  荧光粉+黑
  p2: bg=#FF4CE5 字=#FFFFFF  电光粉+白
  p3: bg=#E1BEE7 字=#4A148C  薰衣草紫+深紫
  p4: bg=#FDDDE2 字=#000000  婴儿粉+黑
  p5: bg=#EEBCD5 字=#000000  干枯玫瑰+黑
  p6: bg=#FD9EC0 字=#000000  樱花粉+黑

⚫ 灰/白色系:
  w1: bg=#FFFFFF 字=#000000  纯白+黑
  w2: bg=#EEEEEE 字=#000000  浅灰+黑
  w3: bg=#FCF9F0 字=#2D2A26  奶白+炭
  w4: bg=#EDEDED 字=#000000  中灰+黑
  w5: bg=#DDDDDD 字=#000000  灰白+黑
  w6: bg=#000000 字=#FFFFFF  纯黑+白
  w7: bg=#BFC5C5 字=#000000  灰绿+黑
  w8: bg=#F0E1CC 字=#857055  暖灰+棕

🟠 特殊撞色:
  s1: bg=#FFE81C 字=#FF227F  黄底+粉字
  s2: bg=#FFC106 字=#1C2850  琥珀+深蓝
  s3: bg=#FF6333 字=#286BFA  橙+蓝
  s4: bg=#FFDF6E 字=#E6213D  黄+红
```

#### 第 2 层：字体重置（中等成本，风格跳变）
字体的选择决定了封面的"语气"：

| 字体编号 | 字体 | 类别 | 视觉感受 | 适用话题 |
|----------|------|------|----------|----------|
| F1 | Noto Sans SC Black 900 | 无衬线黑体 | 现代、权威、干货 | 职场、教程、工具 |
| F2 | Noto Serif SC Bold 700 | 衬线宋体 | 文艺、温柔、叙事 | 生活、书评、情感 |
| F3 | ZCOOL KuaiLe | 圆润艺术 | 可爱、活泼、亲切 | 种草、萌宠、美食 |
| F4 | Ma Shan Zheng | 书法手写 | 治愈、随性、真诚 | 情绪、节庆、人生感悟 |
| F5 | ZCOOL XiaoWei | 细瘦楷体 | 优雅、高级、古风 | 穿搭、美学、读书 |
| F6 | Liu Jian Mao Cao | 草书 | 艺术、洒脱 | 诗句、创作、个性表达 |

#### 第 3 层：几何装饰替换（低成本，高频切换）
每次"换一换"从装饰库中随机抽取 1-2 个：

```
🔵 几何装饰库 (20种):
  1. 实心小圆 (8px, 背景对比色)
  2. 空心小圆 (border: 2px, 12px diameter)
  3. 短横线 (30px × 2px, 水平)
  4. 短竖线 (2px × 20px, 垂直)
  5. 小方块 (10px × 10px, 实心)
  6. 小方框 (border: 2px, 10px × 10px)
  7. 十字加号 (12px, hairline)
  8. 等号双横线 (间距4px)
  9. 括号片段 "(" ")"
  10. 左上角小三角 (△, 10px)
  11. 倾斜45°短线
  12. 波浪线 (~30px, SVG路径)
  13. 圆环 (border, 无填充)
  14. 双圆 (实心+空心并排)
  15. 圆点虚线 (3个点水平排列)
  16. 菱形 (12px, rotate 45°)
  17. 半圆弧 (SVG arc)
  18. 小引号 "" (10px)
  19. 星号 * (12px)
  20. 竖分隔线 (1px × 30px)
```

#### 第 4 层：卡通 / 角色组件库（高成本，最高感知差异）
这是用户明确要求的部分。角色按**风格**和**情绪**组织，确保不单调。

##### 👧 人物角色（扁平插画风，无五官或简化五官）

```
A. 职场/学习系列:
  a1: 戴眼镜女生看电脑 (侧面剪影)
  a2: 男生举手发言 (半身)
  a3: 女生拿笔写字 (桌面视角)
  a4: 男生背包行走 (全身)
  a5: 女生看书 (坐姿)
  a6: 咖啡+笔记本电脑 (无人物，办公桌面)

B. 生活/日常系列:
  b1: 女生喝咖啡 (侧面半身)
  b2: 男生骑自行车 (全身动态)
  b3: 女生自拍 pose (半身)
  b4: 男生戴耳机听歌 (半身)
  b5: 女生逛街提购物袋 (全身)
  b6: 两人聊天对话 (双人半身)

C. 情绪/氛围系列:
  c1: 女生比心手势 (手部特写)
  c2: 男生竖大拇指 (手部特写)
  c3: 女生惊讶表情 (半身)
  c4: 男生思考状 (托腮)
  c5: 女生双手捧脸 (开心)
  c6: 治愈系拥抱自己
```

##### 🐱 动物角色（圆润可爱风）

```
猫系:
  cat1: 圆脸短腿猫坐着
  cat2: 猫伸懒腰
  cat3: 猫趴着睡觉
  cat4: 猫举爪子打招呼
  cat5: 猫玩毛线球
  cat6: 黑猫剪影 (万圣/神秘)

狗系:
  dog1: 柴犬微笑脸
  dog2: 柯基短腿站立
  dog3: 金毛叼花
  dog4: 法斗歪头
  dog5: 泰迪卷毛坐姿
  dog6: 萨摩耶笑脸

其他:
  ani1: 兔子竖耳朵
  ani2: 小熊抱蜂蜜罐
  ani3: 小狐狸蜷缩睡觉
  ani4: 小鸭子游泳圈
  ani5: 仓鼠吃瓜子
  ani6: 熊猫吃竹子
  ani7: 小企鹅走路
  ani8: 树懒挂树枝
```

##### ☕ 物品/食物（小红书高频品类）

```
饮品类 (12种):
  咖啡杯(拿铁拉花) / 奶茶杯(珍珠) / 果汁杯(橙) / 茶杯(中式)
  冰美式 / 热可可 / 奶昔 / 气泡水 / 红酒 / 啤酒 / 抹茶 / 椰子

食物类 (12种):
  蛋糕(草莓) / 面包(牛角) / 寿司 / 火锅 / 冰淇淋
  汉堡 / 披萨 / 沙拉 / 面条 / 饭团 / 饼干 / 巧克力

生活类 (12种):
  书本(摊开) / 相机 / 手机 / 耳机 / 口红 / 香水瓶
  花束 / 蜡烛 / 闹钟 / 行李箱 / 瑜伽垫 / 键盘
```

##### 🎨 角色风格变体（同一角色可有3种风格）

每个角色/物品可以有 3 种渲染风格，进一步增加变体：
```
style-a: 扁平纯色 (Flat Design, 无描边, 纯色块)
style-b: 线性涂鸦 (Line Art, 2px 描边, 无填充或半透明填充)
style-c: 柔和渐变 (Soft Gradient, 高斯模糊光斑感)
style-d: 剪纸风格 (Paper Cut, 分层叠色, 轻微投影)
```

#### 第 5 层：角落贴纸 / emoji（零成本，高频替换）

```
表情类 (20个):
  😊🥰😌🤗😉😋😎🥳😴🤩😢😤🤔😱🥹🫠💀👻🤡👾

自然类 (16个):
  🌸🌺🌻🌷🪻🌼💐🍀🌿🌵🌊⭐✨💫🌈☀️

食物类 (16个):
  🍑🍓🍊🍋🍰🧁☕🍵🥤🍜🍕🥑🌮🧋🫐🥐

物品类 (16个):
  💄👛📷🎀📚✏️🎵🎧💡🔑🎁📱💻🖊️🗂️🪴

手绘类 (16个, 用SVG/emoji组合):
  ❤️‍🔥💖💗💝💘🫶👋✌️🤞🙌👏💪🧠👀🗣️💭
```

---

### 4.3 装饰组合互斥规则

装饰不是越多越好。以下规则防止"换一换"时产出糟糕组合：

#### 4.3.1 互斥矩阵

| 装饰 A ↓ 装饰 B → | 几何元素 | emoji 贴纸 | 卡通角色 | 人物插画 | 物品图标 |
|-------------------|----------|-----------|----------|---------|---------|
| **几何元素** | ✅ 可 2 个 | ✅ 可共存 | ⚠️ 慎用 | ⚠️ 慎用 | ✅ 可共存 |
| **emoji 贴纸** | ✅ 可共存 | ✅ 可 2 个 | ❌ 互斥 | ❌ 互斥 | ⚠️ 慎用 |
| **卡通角色** | ⚠️ 慎用 | ❌ 互斥 | ❌ 只能 1 个 | ❌ 互斥 | ❌ 互斥 |
| **人物插画** | ⚠️ 慎用 | ❌ 互斥 | ❌ 互斥 | ❌ 只能 1 个 | ❌ 互斥 |
| **物品图标** | ✅ 可共存 | ⚠️ 慎用 | ❌ 互斥 | ❌ 互斥 | ✅ 可 2 个 |

**图例：**
- ✅ 可共存 — 搭配自然，不会过满
- ⚠️ 慎用 — 只在装饰等级 L3（字数 < 4）时允许，其他情况禁止
- ❌ 互斥 — 永远不同时出现

#### 4.3.2 最大元素数（硬限制）

| 装饰等级 | 最大装饰元素数 | 元素类型限制 |
|----------|--------------|-------------|
| L3: 角色级 (1-4字) | **2 个** | 1 角色 + 1 几何，或 2 几何 |
| L2: emoji级 (5-9字) | **2 个** | 1 emoji + 1 几何，或 2 emoji |
| L1: 几何级 (10-15字) | **2 个** | 仅几何元素，或 1 几何 + 0 |
| L0: 纯文字 (≥16字) | **0 个** | 零装饰，文字即设计 |

#### 4.3.3 装饰位置互斥

同一个角落不能放 2 个装饰。位置分配规则：

| 装饰数量 | 位置分配 |
|----------|---------|
| 0 个 | — |
| 1 个 | 优先右下角（bottom-right） |
| 2 个 | 左下 + 右上（对角不冲突），或 左上 + 右下 |

**禁止：** 两个装饰都在同一半区（如都在上方或都在右方），视觉不平衡。

#### 4.3.4 换一换时的装饰抽取算法

```
function rollDecoration(text, formulaId, prevDecoration):
  level = detectLevel(text)        // L0-L3
  maxCount = LEVEL_MAX[level]      // 0, 2, 2, 2
  
  if maxCount == 0: return []
  
  // Step 1: 确定装饰品类
  if level == L3: pool = ['character', 'item']  // 角色或物品
  if level == L2: pool = ['emoji', 'emoji']      // 只能 emoji
  if level == L1: pool = ['geometry', 'geometry']// 只能几何
  
  // Step 2: 关键词匹配装饰主题
  category = matchCategory(text)  // 美食/职场/美妆...
  themedDeco = filterByCategory(pool, category)
  
  // Step 3: 互斥检查
  combo = buildCombo(themedDeco, maxCount)
  if isConflict(combo): fallback to ['geometry'] // 冲突时退到几何
  
  // Step 4: 避免与上一轮相同
  if combo == prevDecoration: 
    combo = rotateWithinCategory(combo)
  
  return combo
```

#### 4.3.5 装饰颜色自适应

装饰元素的颜色必须与背景色协调：

| 背景类型 | 装饰颜色规则 |
|----------|------------|
| 高饱和背景 | 装饰用白色或背景对比色（色相环 180°） |
| 低饱和浅色背景 | 装饰用深色（比背景深 40%）或背景同色系深 2 档 |
| 深色背景 | 装饰用白色或荧光色（提高亮度） |
| 纯白/近白背景 | 装饰用黑色或低饱和莫兰迪色 |

**实现方式：** 装饰颜色 = `bgColor` 的 `darken(40%)` 或 `lighten(60%)`，确保在背景上可见。

---

## 五、换一换的智能联动策略

### 5.1 字数感应装饰等级（已有逻辑，补充细化）

| 字数 | 装饰等级 | 装饰方案 |
|------|----------|----------|
| 1-4 字 | L3: 角色级 | 1 个卡通角色 (人物/动物/物品 三选一) + 1 个几何元素 |
| 5-9 字 | L2: emoji 级 | 2 个 emoji 贴纸 (角落各一, 不同类别) + 1 个几何元素 |
| 10-15 字 | L1: 几何级 | 1-2 个几何元素 (不做角色/emoji, 画面文字已够满) |
| ≥16 字 | L0: 纯文字级 | 零装饰 (文字本身即是全部视觉内容) |

### 5.2 内容关键词感应（智能匹配装饰主题）

当用户输入文案包含特定关键词时，自动匹配装饰品类：

| 关键词 | 匹配装饰品 |
|--------|-----------|
| 吃/喝/甜/美食/餐厅/咖啡/奶茶/蛋糕/面包 | 食物类 emoji/cartoon |
| 职场/工作/效率/工具/上班/加班/PPT/Excel | 办公类角色 + 💻📊 |
| 学习/读书/考试/笔记/考研/考证/英语 | 学习类角色 + 📚✏️ |
| 穿搭/美妆/护肤/口红/香水/发型/减肥 | 美妆类 + 💄👛 |
| 旅行/旅游/攻略/酒店/民宿/打卡/探店 | 旅行类 + ✈️🧳 |
| 猫/狗/宠物/萌宠/猫咪/狗狗 | 🐱🐶 动物类 |
| 情感/恋爱/分手/暗恋/前任 | 💔💗 心形 emoji |
| 钱/理财/副业/赚钱/投资/省钱/基金 | 💰📈 |
| 运动/健身/跑步/瑜伽/减肥/跳绳 | 🏃‍♀️🧘 |
| 家居/装修/收纳/租房/布置 | 🏠🪴 |

### 5.3 边缘场景处理规则

#### 5.3.1 纯英文标题

```
检测条件: 中文字符数 = 0 且 英文字母数 > 0

处理方案:
  - 字体: 强制 F1 (无衬线黑体) 或英文专用字体 (Inter Black 900)
  - 字号: 正常字号的 ×1.15 倍 (英文字形更紧凑，需要放大)
  - 大小写: 建议全大写 (ALL CAPS)，增强视觉冲击
  - 字间距: 英文 +0.02em ~ +0.05em (英文不像中文需要收紧)
  - 公式限制: 仅 ①③⑦ (纯色大字/奶油/几何)，禁用 ②⑥ (荧光/信息层叠)

示例转换:
  输入: "HOW TO STUDY"
  输出: 纯黑底 + 白色 Inter Black 全大写，字号 1.15x，字间距 +0.03em
```

#### 5.3.2 中英混排

```
检测条件: 中文字符 ≥ 1 且 英文字母 ≥ 1

处理方案:
  - 英文/数字部分: 切换到 DM Sans 或 Inter，字号 ×0.85
  - 中文部分保持原字体原大小
  - 英文前后自动加空格 (0.25em)
  
示例:
  输入: "2024年度AI工具盘点"
  处理: "2024" 用 DM Sans ×0.9 + "年度" 用 思源黑体 + "AI" 用 DM Sans ×0.85
  字间距: 中文部分 -0.03em，英文部分 +0.02em
```

#### 5.3.3 超长标题（≥16 字）

```
检测条件: 总字符数 ≥ 16 (中英文合计，空格不计)

处理方案:
  - 装饰等级: 强制 L0 (零装饰)
  - 公式限制: 仅 ①⑥ (纯色大字/信息层叠)
  - 字号: 最小值放宽到画面高度的 5% (正常是 8%)
  - 行数: 允许 3-4 行
  - 对齐: 强制左对齐 (居中对齐在长文本下显得松散)
  - 行间距: 强制 ≥ 1.35
  - 如果超过 25 字: 建议用户缩减文案 (UI 提示)

示例:
  输入: "2024年最值得推荐的10个效率工具让工作事半功倍" (21字)
  处理: L0装饰, 公式①, 左对齐, 分3行, 字号缩小, 行高1.4
```

#### 5.3.4 超短标题（≤ 3 字）

```
检测条件: 总字符数 ≤ 3

处理方案:
  - 装饰等级: 强制 L3 (角色级)
  - 字号: 最大值可以到画面高度的 25%
  - 字符撑满: 单个汉字可以占画面 70-80% 面积
  - 推荐公式: ①②④ (纯色大字/荧光撞色/大阴影)
  - 可选: 文字添加描边增强存在感 (2-3px)

示例:
  输入: "摸鱼" (2字)
  处理: L3角色(卡通猫), 公式②荧光黄底+黑字, 字占70%画面, 3px黑描边
```

#### 5.3.5 纯数字标题

```
检测条件: 中文字符 = 0, 英文字母 = 0, 数字 ≥ 1

处理方案:
  - 推荐字体: DM Serif Display (衬线数字最美) 或 Inter Black
  - 字号: ×1.2 倍
  - 推荐公式: ① (纯色大字)
  - 字间距: +0.04em (数字需要呼吸感)
  - 示例: "2024" → 深蓝底 + 超大白色 DM Serif "2024"

如数字后有单位 (如 "30天" "5分钟"):
  - 数字用英文字体 (×1.1), 单位用中文字体 (正常大小)
```

#### 5.3.6 标题中含 Emoji

```
检测条件: 文案包含 emoji 字符

处理方案:
  - 标题区的 emoji: 保留，字号与相邻文字一致，或 ×1.3 作为视觉锚点
  - 装饰 emoji: 此时装饰等级自动降一级 (避免装饰 emoji 与标题 emoji 撞车)
  
示例:
  输入: "☕️ 咖啡控必看的5家店"
  处理: ☕️ 放大 ×1.3 作为视觉锚点，装饰等级从 L2 降到 L1 (仅几何)
```

#### 5.3.7 全部大标题 / 全部小标题

```
场景 A: 全部是粗体大标题 (如 "爆款" "必看" "绝了")
  处理: 保持公式，但字号上限增加到画面高度的 25%

场景 B: 全部是轻量词 (如 "嗯" "好" "是的")
  处理: 补充推荐副标题，或自动在下方加一行 "..." 增加视觉重量
```

#### 5.3.8 含敏感词 / 品牌名

```
检测条件: 含商标名 (Apple/Nike/Coca-Cola 等) 或敏感政治词

处理方案:
  - 不改变视觉效果
  - 在 UI 层提示用户 "注意：标题中含有品牌名/敏感词，发布前请确认合规"
  - 不主动过滤或修改用户内容
```

---

## 六、GIF 动效模板分析（12 张动态封面）

> ※ 详见下方「6.1 GIF 动效类型分析」  

---

## 七、投喂 AI 的最佳实践

### 7.1 完整 Prompt 模板（复制即用）

```
[7大公式之一的核心描述], 
3:4 aspect ratio (1242x1656px),
[COLOR] solid background,
giant [FONT_STYLE] Chinese characters "[填入文案]" filling 65-75% of canvas,
[可选: DECORATION description],
[可选: CHARACTER description — 1 tiny flat-design illustration of X in corner],
ultra-bold weight, tight letter-spacing,
no photograph, no 3D rendering, no gradients, no complex textures,
minimal editorial poster, clean graphic design,
high contrast, mobile thumbnail optimized,
xiaohongshu (RED) cover style, Chinese social media aesthetic,
8K, sharp focus, studio lighting
```

### 7.2 负面 Prompt（在 SD 中使用）

```
photograph, realistic photo, 3D render, complex background,
multiple colors, rainbow, gradient background,
serif font (when using sans-serif formula),
small text, thin font weight, low contrast,
watermark, logo, QR code, barcode,
busy composition, cluttered, more than 3 elements,
landscape orientation, square format,
human face with detailed features, realistic human,
shadows on background, complex lighting,
traditional Chinese painting style, ink wash
```

### 7.3 Midjourney 特殊参数

```
--ar 3:4 --style raw --stylize 150 --v 6.1
```

`--style raw` 减少 MJ 的"艺术化"倾向  
`--stylize 150` 保持清晰但不过度渲染

### 7.4 不同 AI 工具的适配

| 工具 | 优势 | 注意事项 |
|------|------|----------|
| **Midjourney** | 视觉质感最好 | 需要英文 prompt，中文文字可能出错 |
| **DALL·E 3** | 中文文字准确 | 风格偏"干净"，缺少粗粝感 |
| **Stable Diffusion** | 可 ControlNet 控构图 | 需要专门 LoRA 训练中文排版 |
| **稿定/Canva API** | 保证字体正确 | 模板化，灵活性受限 |

---

## 八、从蒸馏到实现：两种落地路径

### 路径 A：AI 图片生成（完全依靠 prompt）

```
用户输入 "财务人必看的5个AI工具"
  ↓
选公式 (用户选 或 随机) → 选配色 → 选字体 → 选装饰等级
  ↓
拼装完整 prompt → 调 Midjourney/DALL·E API
  ↓
返回生成的 4-8 张候选图 → 用户选 → 下载
```

**优点：** 效果最接近稿定模板，质感好
**缺点：** API 成本，延迟 5-30 秒，中文文字可能不准

### 路径 B：程序化生成（HTML/CSS 渲染，当前方案）

```
用户输入 "财务人必看的5个AI工具"
  ↓
选公式 → 选配色 → 选字体 → 选装饰 → 选角色
  ↓
JavaScript 渲染 HTML → html2canvas 截图
  ↓
即时预览 20 张 → 下载 PNG
```

**优点：** 即时（< 100ms），中文完美，免费
**缺点：** 缺少 AI 的"有机感"和光影质感

### 路径 C：混合模式（推荐）

```
程序化生成排版骨架 + AI 美化润色
  ↓
HTML/CSS 生成排版、配色、文字位置
  ↓
可选：将 HTML 截图作为 img2img 底图，用 AI 添加光影/纹理/质感
  ↓
最终输出 = 精确的中文 + AI 的质感
```

---

### 6.1 GIF 动效类型分析

数据源中共 12 个 `.gif` 动效模板（占比 6.2%），程序化分析结果：

| 属性 | 值 |
|------|-----|
| 平均帧数 | 16 帧（4-20 帧） |
| 平均时长 | 680ms |
| 分辨率 | 全部 1242×1656 (3:4) |
| 帧间色彩变化 | 极小（ΔRGB < 15） |

**推断动效类型（无法查看 GIF 内容，基于稿定常见模式推断）：**

| 动效类型 | 推测占比 | 视觉描述 | 适用公式 |
|----------|---------|----------|----------|
| 粒子飘落 | ~40% | 金色/白色细小粒子从上方缓慢飘落 | ②④ |
| 文字闪烁 | ~25% | 标题文字交替显示/隐藏或明暗呼吸 | ①②④ |
| 光点游走 | ~20% | 一个亮光点沿文字笔画或对角扫过 | ①⑦ |
| 背景波光 | ~10% | 背景有极细微的明暗波动 | ③ |
| 装饰弹跳 | ~5% | 角落装饰元素做微小弹跳/旋转 | ②③ |

**将动效转化为 AI 视频生成 Prompt：**

```
第1类：粒子飘落 (Sparkle Particles)
"A 3:4 animated poster, [COLOR] solid background,
large Chinese title, 3-second seamless loop,
tiny gold/white sparkle particles gently falling from top,
particles fade in and out, soft bokeh effect,
subtle movement, calm and elegant,
xiaohongshu animated cover, social media thumbnail"

第2类：文字呼吸闪烁 (Text Breathing)
"A 3:4 animated poster, [COLOR] solid background,
bold Chinese title with gentle opacity pulse (90% to 100%),
3-second seamless loop, subtle glow around text edges,
soft ease-in-out timing, hypnotic and eye-catching,
xiaohongshu animated cover"

第3类：光点扫过 (Light Sweep)
"A 3:4 animated poster, [COLOR] solid background,
bold Chinese title, a bright light spot slowly sweeps
diagonally across the text from top-left to bottom-right,
creates a subtle highlight reflection on the text edges,
3-second loop, elegant and premium feel,
xiaohongshu animated cover"

第4类：背景微动 (Subtle Background Motion)
"A 3:4 animated poster, cream/beige paper background,
subtle ambient light shift (warm to slightly warmer),
barely perceptible paper texture shimmer,
calm breathing rhythm, 4-second loop,
lifestyle aesthetic, xiaohongshu animated cover"
```

**程序化实现动效的优先级：**
1. **CSS animation + GIF 导出**（当前可行）— 用 CSS `@keyframes` 实现粒子/闪烁，录制为 GIF
2. **Lottie/Bodymovin**（需要 AE）— 高质感但依赖设计工具
3. **纯 AI 生成视频**（Runway/Pika/Sora）— 目前最不可控

---

## 九、种子参考图索引（用于 AI img2img / style reference）

从 193 张模板中，按色彩多样性 + 公式代表性 + 构图清晰度，手动标记 12 张种子图。

### 7.1 种子图分类

```
公式① 纯色大字 (4张):
  ⭐ DM_20260630193603_097.jpg  — 奶白底+黑色大字 (最典型)
  ⭐ DM_20260630193603_098.jpg  — 纯黑底+白色大字 (深色版)
  ⭐ DM_20260630193603_026.jpg  — 正红底+白色大字 (高饱和)
  ⭐ DM_20260630193604_193.jpg  — 蓝色底+白色大字 (冷色调)
  
公式② 荧光撞色 (2张):
  ⭐ DM_20260630193603_160.jpg  — 黑底+明黄大字 (最强对比)
  ⭐ DM_20260630193603_166.jpg  — 荧光粉底+白字 (潮流感)

公式③ 奶油质感 (2张):
  ⭐ DM_20260630193603_133.jpg  — 奶白底+炭灰字 (最温柔)
  ⭐ DM_20260630193603_020.jpg  — 米黄+黑字+分区 (偏暖)

公式④ 大阴影 (1张):
  ⭐ DM_20260630193603_148.jpg  — 黄底+粉字+重阴影

公式⑤ 双色竖分 (1张):
  ⭐ DM_20260630193603_085.jpg  — 深蓝+鹅黄 左右分 (最杂志感)

公式⑥ 信息层叠 (1张):
  ⭐ DM_20260630193603_126.jpg  — 红底+黄字+三层信息

公式⑦ 几何装饰 (1张):
  ⭐ DM_20260630193604_175.png  — 蓝底+几何色块点缀
```

### 7.2 种子图使用方式

**Midjourney style reference:**
```
/imagine prompt:[公式prompt] --ar 3:4 --style raw --stylize 150 --v 6.1
然后使用 --cref [种子图URL] 参数引用对应种子图
```

**Stable Diffusion img2img:**
```
Denoising strength: 0.35-0.5 (保留构图，换颜色)
ControlNet: Canny edge (保留文字排版骨架)
Reference-only: 种子图作为 style reference
```

**程序化使用（当前方案）：**
```
提取种子图的主色 → 存入配色库
提取种子图的文字占比 → 校准 fs() 算法参数
提取种子图的装饰位置 → 校准装饰位置概率分布
```

---

## 十、附录：颜色 Hex 速查表

### 高饱和色（适合白字）
```
#ED0108  正红        #FFEC47  柠檬黄
#E6213D  玫红        #F8D612  金黄
#FF6333  珊瑚橙      #B8E300  荧光绿
#012FA7  深蓝        #2677DE  宝蓝
#FF4CE5  电光粉      #FFC106  琥珀
```

### 低饱和柔色（适合深色字）
```
#FFF9E1  奶黄        #FCF9F0  奶白
#FDF6E9  米黄        #CFDCFE  莫兰迪蓝
#CFFBFE  粉蓝        #D7FED1  薄荷绿
#FDDDE2  婴儿粉      #EEBCD5  干枯玫瑰
#FDE6A5  杏黄        #F78DE9  柔粉
```

### 无彩色（万能背景）
```
#FFFFFF  纯白        #FAFAFA  近白
#EEEEEE  浅灰        #EDEDED  中浅灰
#DDDDDD  中灰        #BFC5C5  灰绿
#000000  纯黑
```

---

> **版本:** v2.0  
> **数据源:** 稿定设计「大字封面」分类 193 张模板  
> **分析方法:** PIL 程序化色彩聚类 + 人工设计经验归纳  
> **用途:** 投喂 AI 图片生成 / 驱动程序化封面生成器  
> **更新:** v2.0 新增公式×话题匹配矩阵、装饰互斥规则、字体排版参数、边缘场景处理、GIF动效分析、种子参考图索引
