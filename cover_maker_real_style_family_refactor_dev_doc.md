# 小红书封面生成器真实风格族重构开发文档

## 1. 项目背景

当前小红书封面生成器 v5.0 已有 20 个风格入口：

```text
A 手账白底
B 黄底提醒
C 红色事件
D 蓝绿信息
E 极简金句
F 复古胶片
G 多巴胺
H 酸性设计
I 孟菲斯
J 国风
K 赛博朋克
L 日系清新
M 3D 渲染
N 蒸汽波
O 暗黑系
P 像素风
Q 极光渐变
R 复古海报
S 玻璃拟态
T 卡通插画
```

这些风格入口需要保留，不删除，不减少。

但参考模板分析表明，专业小红书大字封面并不是 20 种完全独立的视觉系统，而是集中在 5 个真实风格母体：

```text
1. 手绘便签风
2. 拼贴 collage 风
3. 漫画 pop 风
4. 报纸大字风
5. 极简大字风
```

因此，本次改造目标不是砍掉 20 个风格，而是：

```text
保留 20 个风格入口
将 20 个风格映射到 5 个真实风格族
每个入口成为对应真实风格族下的子风格
重构渲染逻辑，让每个风格族拥有专属版式、装饰包、文字层级和配色规则
```

## 2. 核心结论

当前系统的问题不在于风格数量多，而在于：

```text
20 个风格共用了过于通用的模板骨架
文字层级不够
主标题占比不够大
装饰数量和组织方式不符合参考模板
装饰是随机贴纸槽位，而不是风格化装饰包
```

本次重构后：

```text
用户仍然看到 20 个风格入口
内部只维护 5 套真实风格渲染器
每个入口通过子风格参数影响颜色、纹理、装饰倾向和字体氛围
```

## 3. 设计目标

### 3.1 保持不变

```text
保留 A-T 20 个风格入口
保留每个风格 5 张变体
保留当前 1242×1656 输出尺寸
保留批量生成
保留下载 / 复制 / 换一换
保留用户字体选择
保留贴纸切换能力
```

### 3.2 必须改变

```text
将 20 个风格映射到 5 个真实风格族
弃用全风格共用的 burst/card/bubble/paper/frame 逻辑作为主路径
新增真实风格族专属 layout
新增结构化文案拆分
提高主标题画面占比
将贴纸槽位升级为风格装饰包
增加主副标题层级
按参考模板控制装饰数量和互斥关系
```

### 3.3 不做

```text
不删除 20 个风格
不改变用户已有操作习惯
不引入 AI API
不做自动生成额外营销文案
不破坏现有 v5.0，可通过版本开关回退
```

## 4. 总体架构

新增一层真实风格族路由。

当前：

```text
family A-T
→ LOCKED_TEMPLATE_STYLES[family]
→ TEMPLATE_VARIANTS[vi]
→ drawLockedTemplateCover()
```

改造后：

```text
family A-T
→ REAL_STYLE_MAP[family]
→ realFamily: handnote / collage / comic / newspaper / minimal
→ subStyle: 具体子风格参数
→ REAL_STYLE_RENDERERS[realFamily]()
→ family-specific layout + decorations + typography
```

建议新增入口：

```javascript
drawRealStyleCover(ctx, text, palette, options, family)
```

并让当前渲染入口改为：

```javascript
function drawTemplateEnhancedCover(ctx, text, palette, options, family) {
  if (STATE.realStyleMode !== false) {
    return drawRealStyleCover(ctx, text, palette, options, family);
  }
  return drawLockedTemplateCover(ctx, text, palette, options, family);
}
```

## 5. 20 风格到 5 真实风格族映射

### 5.1 映射表

```javascript
const REAL_STYLE_MAP = {
  A: { realFamily: 'handnote',  subStyle: 'creamNotebook' },
  B: { realFamily: 'comic',     subStyle: 'yellowWarning' },
  C: { realFamily: 'comic',     subStyle: 'redEvent' },
  D: { realFamily: 'newspaper', subStyle: 'blueGreenInfo' },
  E: { realFamily: 'minimal',   subStyle: 'cleanQuote' },

  F: { realFamily: 'collage',   subStyle: 'retroFilm' },
  G: { realFamily: 'comic',     subStyle: 'dopaminePop' },
  H: { realFamily: 'comic',     subStyle: 'acidPop' },
  I: { realFamily: 'collage',   subStyle: 'memphisCollage' },
  J: { realFamily: 'handnote',  subStyle: 'chinesePaper' },

  K: { realFamily: 'newspaper', subStyle: 'cyberEditorial' },
  L: { realFamily: 'handnote',  subStyle: 'japaneseSoft' },
  M: { realFamily: 'collage',   subStyle: 'threeDSticker' },
  N: { realFamily: 'comic',     subStyle: 'vaporwavePop' },
  O: { realFamily: 'newspaper', subStyle: 'darkEditorial' },

  P: { realFamily: 'comic',     subStyle: 'pixelPop' },
  Q: { realFamily: 'minimal',   subStyle: 'auroraMinimal' },
  R: { realFamily: 'newspaper', subStyle: 'vintagePoster' },
  S: { realFamily: 'minimal',   subStyle: 'glassMinimal' },
  T: { realFamily: 'collage',   subStyle: 'cartoonCollage' }
};
```

### 5.2 映射原则

```text
手账、日系、国风纸张类 → handnote
拼贴、复古、3D、卡通贴纸类 → collage
高饱和、提醒、事件、多巴胺、酸性、像素类 → comic
信息、赛博、暗黑、复古海报类 → newspaper
极简、极光、玻璃拟态类 → minimal
```

### 5.3 用户感知

用户仍然看到原来的 20 个风格名。

内部显示可选：

```text
A 手账白底 / 手绘便签
B 黄底提醒 / 漫画 pop
...
```

但不建议在第一版改 UI 名称，避免用户困惑。

## 6. 新数据结构

### 6.1 RealStyleConfig

```javascript
const REAL_STYLE_CONFIGS = {
  handnote: {
    name: '手绘便签风',
    titleAreaRatio: [0.55, 0.68],
    decorationCount: [4, 6],
    layouts: ['handnoteTape', 'handnoteCircle', 'handnoteMarker', 'handnoteGrid', 'handnoteDiary'],
    typography: {
      mainRatio: 1,
      subRatio: 0.36,
      keywordRatio: 0.52,
      align: ['center', 'left'],
      letterSpacing: -0.035
    }
  },
  collage: {
    name: '拼贴 collage 风',
    titleAreaRatio: [0.52, 0.68],
    decorationCount: [5, 7],
    layouts: ['collageStack', 'collageStamp', 'collageDiagonal', 'collageScrapbook', 'collageMagazine'],
    typography: {
      mainRatio: 1,
      subRatio: 0.34,
      keywordRatio: 0.58,
      align: ['center', 'left'],
      stroke: true
    }
  },
  comic: {
    name: '漫画 pop 风',
    titleAreaRatio: [0.58, 0.75],
    decorationCount: [4, 6],
    layouts: ['comicBurst', 'comicBubble', 'comicEmoji', 'comicHalftone', 'comicSfx'],
    typography: {
      mainRatio: 1,
      subRatio: 0.32,
      keywordRatio: 0.62,
      align: ['center'],
      strokeWidth: [4, 6],
      letterSpacing: -0.04
    }
  },
  newspaper: {
    name: '报纸大字风',
    titleAreaRatio: [0.55, 0.72],
    decorationCount: [3, 4],
    layouts: ['newspaperHero', 'newspaperColumns', 'newspaperStamp', 'newspaperPoster', 'newspaperSplit'],
    typography: {
      mainRatio: 1,
      subRatio: 0.36,
      bodyRatio: 0.18,
      align: ['left', 'center'],
      serifAllowed: true
    }
  },
  minimal: {
    name: '极简大字风',
    titleAreaRatio: [0.65, 0.80],
    decorationCount: [0, 1],
    layouts: ['minimalCenter', 'minimalBleed', 'minimalLeft', 'minimalHuge', 'minimalStripe'],
    typography: {
      mainRatio: 1,
      subRatio: 0.28,
      align: ['center', 'left'],
      allowBleed: true,
      letterSpacing: -0.045
    }
  }
};
```

### 6.2 SubStyleConfig

20 个风格入口作为子风格配置。

```javascript
const REAL_SUBSTYLE_CONFIGS = {
  creamNotebook: {
    palette: {
      bg: ['#F5EFD8', '#FAF8F5', '#FDF6E9', '#FAF5EA', '#E8EEF5'],
      text: '#2D2A26',
      accent: '#5D4E37',
      second: '#FFEC47'
    },
    texture: 'linedPaper',
    decorationBias: ['tape', 'handCircle', 'markerHighlight', 'doodle', 'emoji']
  },
  yellowWarning: {
    palette: {
      bg: ['#FFEC47', '#FFE45C', '#FFD95F', '#FFC106', '#FFF9E1'],
      text: '#111111',
      accent: '#ED0108',
      second: '#FFFFFF'
    },
    texture: 'halftoneLight',
    decorationBias: ['burstLines', 'speechBubble', 'stamp', 'emoji', 'sfx']
  }
};
```

## 7. 文案结构化

当前系统把用户输入当作一个整体，并额外取最后 2 字做强调。需要改为结构化文案。

### 7.1 新函数

```javascript
function parseCoverContent(rawText) {
  return {
    mainTitle: '',
    subTitle: '',
    keyword: '',
    badgeText: '',
    footerText: '',
    rawText: rawText
  };
}
```

### 7.2 解析规则

优先级：

```text
1. 用户显式换行
   第 1 行 → mainTitle
   第 2 行 → subTitle
   第 3 行 → footerText 或 badgeText

2. 用户使用分隔符
   标题｜副标题
   标题 - 副标题
   标题：副标题

3. 自动拆分
   3-8 字：全部作为 mainTitle
   9-14 字：拆为 mainTitle + keyword
   15-24 字：拆为 mainTitle + subTitle
   24 字以上：mainTitle + subTitle + footerText
```

### 7.3 自动拆分示例

输入：

```text
审稿人说创新性不足到底怎么改
```

输出：

```javascript
{
  mainTitle: '创新性不足',
  subTitle: '审稿人这样说到底怎么改',
  keyword: '怎么改',
  badgeText: 'REVISION',
  footerText: ''
}
```

输入：

```text
论文返修不要急着先改语言
```

输出：

```javascript
{
  mainTitle: '论文返修',
  subTitle: '不要急着先改语言',
  keyword: '返修',
  badgeText: 'SCI GUIDE',
  footerText: ''
}
```

## 8. 文字排版规则

### 8.1 主标题面积

参考模板要求主标题占画面面积 55-75%。

实现建议：

```javascript
const TITLE_AREA_RULES = {
  handnote: [0.55, 0.68],
  collage: [0.52, 0.68],
  comic: [0.58, 0.75],
  newspaper: [0.55, 0.72],
  minimal: [0.65, 0.80]
};
```

### 8.2 字号范围

当前多处最大字号在 162-178，应提高。

建议：

```text
短标题：240-320px
中标题：190-260px
长标题：130-190px
副标题：主标题的 28%-40%
关键词：主标题的 45%-65%
```

### 8.3 留白

```text
左右留白：4%-8%
上下留白：8%-12%
允许 minimal / comic 主标题 bleed 5%
```

### 8.4 字间距

```text
大标题：-0.03em ~ -0.05em
中标题：-0.01em ~ -0.03em
小标签：+0.05em ~ +0.15em
```

Canvas 原生 `fillText` 不支持 letter-spacing，需要实现逐字绘制或复用已有逐字符绘制逻辑。

### 8.5 行高

```text
1 行：1.0-1.1
2 行：1.15-1.25
3 行：1.25-1.35
4 行以上：1.35-1.5
```

### 8.6 主副标题比例

```text
干货 / 教程：3:1
通用封面：2.5:1
生活 / 情绪：2:1
合集 / 对比：1.8:1
```

## 9. 风格专属 Layout

每个真实风格族 5 个 layout，对应现有每个 family 的 5 个 variant。

这样可以保持：

```text
20 个风格 × 5 个变体 = 100 张卡片
```

但每张卡片不再是通用 `burst/card/bubble/paper/frame`，而是：

```text
realFamily.layouts[vi % 5]
```

## 9A. 中央承载图形库 Center Shape Library

正式版不能只有方形或矩形中间面板。需要新增中央承载图形库，让文字承载区域有真实变化，同时保证文字安全可读。

### 9A.1 数量要求

```text
中央承载图形总数不少于 40 种
每个真实风格族不少于 8 种
每张封面只能使用与真实风格族匹配的中央图形
同一批次同一文案的候选图中，应尽量避免连续重复同一种中央图形
```

### 9A.2 图形库结构

```javascript
const CENTER_SHAPE_LIBRARY = {
  handnote: [],
  collage: [],
  comic: [],
  newspaper: [],
  minimal: []
};
```

单个 shape 定义：

```javascript
{
  id: 'torn-paper-stack',
  name: '撕边纸片堆叠',
  realFamily: 'collage',
  textSafeArea: { x: 0.12, y: 0.28, w: 0.76, h: 0.48 },
  allowRotation: true,
  allowBleed: false,
  decorationSlots: ['topRight', 'bottomLeft', 'aboveTitle'],
  draw(ctx, box, palette, seed) {}
}
```

### 9A.3 handnote 图形，不少于 8 种

```text
1. 横线便签纸
2. 方格便签纸
3. 胶带固定纸片
4. 撕边纸片
5. 卷角纸片
6. 手账标签页
7. 圆角便签
8. 手绘云朵框
```

### 9A.4 collage 图形，不少于 8 种

```text
9. 单张斜放便签
10. 三层纸片堆叠
11. 撕边拼贴纸
12. 拍立得相框
13. 票根 ticket
14. 杂志剪纸块
15. 不规则色块拼接
16. 透明胶带贴纸片
```

### 9A.5 comic 图形，不少于 8 种

```text
17. 爆炸星形框
18. 对话气泡
19. 云朵气泡
20. 锯齿爆炸框
21. 圆形漫画框
22. 斜切动感框
23. 半色调圆形底
24. 速度线标题框
```

### 9A.6 newspaper 图形，不少于 8 种

```text
25. 报纸头版块
26. 多栏文字块
27. 横幅标题条
28. 上下分割色块
29. 海报边框框
30. 印刷标签框
31. 竖向栏目框
32. 斜切报纸块
```

### 9A.7 minimal 图形，不少于 8 种

```text
33. 无框纯大字
34. 超大圆形底
35. 椭圆形底
36. 胶囊形底
37. 半圆拱形底
38. 极细线框
39. 左侧色块
40. 底部短横线托底
```

### 9A.8 选择规则

中央图形选择不应全局随机，而应按真实风格族抽取。

```text
family A-T
→ REAL_STYLE_MAP 得到 realFamily
→ 从 CENTER_SHAPE_LIBRARY[realFamily] 中选择 shape
→ shape 决定文字安全区、装饰槽位和部分构图
```

示例：

```text
A 手账白底 → handnote → 横线便签 / 方格纸 / 胶带纸 / 撕边纸 / 云朵框
F 复古胶片 → collage → 票根 / 拍立得 / 杂志剪纸 / 撕边纸 / 三层纸片
C 红色事件 → comic → 爆炸框 / 气泡 / 圆形底 / 锯齿框 / 动感斜切框
D 蓝绿信息 → newspaper → 报纸头版 / 多栏 / 横幅 / 竖栏 / 分割色块
E 极简金句 → minimal → 无框 / 圆形 / 椭圆 / 胶囊 / 细线框
```

### 9A.9 安全区要求

```text
图形可以不规则
文字区域必须稳定可读
每个 shape 必须提供 textSafeArea
装饰不得进入主标题核心区域
如果 shape 允许 bleed，仅限 minimal / comic 等大字风格
```

### 9.1 handnote layouts

```text
handnoteTape
顶部胶带 + 横线纸 + 中央大字

handnoteCircle
手绘圈围绕关键词 + 右下涂鸦

handnoteMarker
荧光笔高亮 + 马克笔重影

handnoteGrid
方格纸 + 左上编号 + 小贴纸

handnoteDiary
便签纸 + 日期标签 + 手绘箭头
```

### 9.2 collage layouts

```text
collageStack
3 张撕边便签叠层 + 主标题压在上层

collageStamp
便签 + 右上印章 + 色块散布

collageDiagonal
斜向拼贴纸片 + 箭头指向标题

collageScrapbook
照片框 / 便签 / 胶带组合

collageMagazine
杂志拼贴 + 大字描边 + 小标签
```

### 9.3 comic layouts

```text
comicBurst
放射线 + 巨大描边标题

comicBubble
对话气泡 + 半色调网点

comicEmoji
大 3D emoji + SFX 拟声词

comicHalftone
全屏半色调 + 倾斜标题

comicSfx
拟声词 + 星爆 + 速度线
```

### 9.4 newspaper layouts

```text
newspaperHero
顶部巨大主标题 + 中部副标题 + 底部编号

newspaperColumns
主标题 + 底部 2-3 栏小字

newspaperStamp
大字 + 印章 + 横线分割

newspaperPoster
复古海报边框 + 大标题

newspaperSplit
上下色块分割 + 主副标题
```

### 9.5 minimal layouts

```text
minimalCenter
中央超大字，几乎无装饰

minimalBleed
文字允许 5% 溢出画布

minimalLeft
偏左大字 + 小横线

minimalHuge
单词 / 短句撑满 75-80% 画面

minimalStripe
纯色背景 + 1 个短横线 / 小圆点
```

## 10. 风格装饰包

当前贴纸是 1-3 个槽位随机贴纸。需要改为装饰包。

### 10.1 新函数

```javascript
function buildDecorationPlan(realFamily, subStyle, layoutId, content, seed) {
  return {
    backgroundDecorations: [],
    titleDecorations: [],
    cornerDecorations: [],
    stickers: []
  };
}
```

### 10.2 装饰数量

```javascript
const DECORATION_COUNT_RULES = {
  handnote: [4, 6],
  collage: [5, 7],
  comic: [4, 6],
  newspaper: [3, 4],
  minimal: [0, 1]
};
```

### 10.3 handnote 装饰包

必选：

```text
横线或方格纸背景
胶带或日期标签
手绘圈或荧光笔
```

可选：

```text
云朵高光
手绘箭头
右下小涂鸦
1-2 个 emoji
```

### 10.4 collage 装饰包

必选：

```text
2-3 张便签纸
1 个印章
1-2 个色块
```

可选：

```text
胶带
手绘箭头
emoji
拍立得框
编号标签
```

### 10.5 comic 装饰包

必选：

```text
半色调网点
放射线或速度线
重描边标题
```

可选：

```text
对话气泡
3D emoji
拟声词
星爆
闪电
```

### 10.6 newspaper 装饰包

必选：

```text
大标题
细分割线
编号 / 日期 / 小标签
```

可选：

```text
印章
多栏小字
几何短条
边框
```

### 10.7 minimal 装饰包

必选：

```text
无
```

可选：

```text
小圆点
短横线
极细边框
```

## 11. 装饰位置互斥

实现装饰位置规划器，避免乱叠。

```javascript
function allocateDecorationSlots(count, realFamily, layoutId) {
  if (count <= 1) return ['bottomRight'];
  if (count === 2) return ['bottomLeft', 'topRight'];
  if (count === 3) return ['topLeft', 'bottomRight', 'aroundTitle'];
  if (count === 4) return ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
  return ['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'aboveTitle', 'belowTitle'];
}
```

### 11.1 互斥规则

```text
卡通角色最多 1 个
人物插画最多 1 个
emoji 最多 2 个
物品图标最多 2 个
手绘元素最多 3 个
同一角落最多 1 个主装饰
装饰不得覆盖主标题核心区域
```

### 11.2 标题保护区

```javascript
const titleSafeRect = {
  x: titleBox.x - 40,
  y: titleBox.y - 40,
  w: titleBox.w + 80,
  h: titleBox.h + 80
};
```

所有角落装饰可以与标题边缘轻微接触，但不得进入标题主体 70% 区域。

## 12. 配色系统调整

### 12.1 保留 20 个风格色

原有颜色可以保留，但需要按真实风格族重新约束。

### 12.2 总色数限制

每张封面：

```text
主色：70%
强调色：1-2 个，共 25%
点缀色：1-2 个，共 5%
总色数：≤6
```

### 12.3 黑白替换

避免纯黑纯白：

```text
黑色文字：#2D2A26 / #1A1A1A
白色文字：#FAFAFA / #FFF8EA
```

### 12.4 默认生成权重

虽然保留 20 个入口，但 AI 推荐和默认展示应向参考模板分布靠拢：

```text
handnote：30%
collage：25%
comic：20%
newspaper：15%
minimal：10%
```

如果用户手动选择具体 A-T 风格，则按用户选择。

## 13. 贴纸真实感策略

### 13.1 短期

保留现有 Canvas 贴纸，但按风格族筛选。

```text
handnote：胶带、手绘圈、涂鸦、猫、纸夹
collage：便签、印章、拍立得、色块、箭头
comic：3D emoji、星爆、气泡、闪电、拟声词
newspaper：印章、编号、几何条、边框
minimal：小圆点、短线
```

### 13.2 中期

引入真实 PNG / WebP 素材包。

目录建议：

```text
/assets/stickers/handnote/
/assets/stickers/collage/
/assets/stickers/comic/
/assets/stickers/newspaper/
/assets/stickers/minimal/
```

每个素材需要 metadata：

```json
{
  "id": "red_stamp_01",
  "family": "collage",
  "type": "stamp",
  "preferredSlots": ["topRight", "bottomRight"],
  "maxSizeRatio": 0.12
}
```

## 14. 渲染流程

### 14.1 新流程

```text
drawRealStyleCover()
  1. resolveRealStyle(family)
  2. parseCoverContent(text)
  3. selectSubStylePalette()
  4. selectFamilyLayout(realFamily, vi, seed)
  5. selectCenterShape(realFamily, family, vi, seed)
  6. computeTypographyPlan()
  7. buildDecorationPlan()
  8. drawRealBackground()
  9. drawCenterShape()
  10. drawFamilyDecorationsBehindText()
  11. drawStructuredTypography()
  12. drawFamilyDecorationsAboveText()
  13. assertSafeBounds()
```

### 14.2 伪代码

```javascript
function drawRealStyleCover(ctx, rawText, palette, options, family) {
  const map = REAL_STYLE_MAP[family] || REAL_STYLE_MAP.A;
  const realFamily = map.realFamily;
  const subStyle = REAL_SUBSTYLE_CONFIGS[map.subStyle];
  const familyConfig = REAL_STYLE_CONFIGS[realFamily];
  const content = parseCoverContent(rawText);
  const layout = familyConfig.layouts[options.vi % familyConfig.layouts.length];
  const centerShape = selectCenterShape(realFamily, family, options.vi, options.seed);
  const typography = computeTypographyPlan(ctx, content, familyConfig, layout, centerShape, subStyle);
  const decorationPlan = buildDecorationPlan(realFamily, subStyle, layout, centerShape, content, options.seed);

  drawRealBackground(ctx, realFamily, subStyle, layout);
  drawCenterShape(ctx, centerShape, subStyle, layout, typography, options.seed);
  drawDecorations(ctx, decorationPlan.backgroundDecorations, 'behind');
  drawStructuredTypography(ctx, content, typography, subStyle);
  drawDecorations(ctx, decorationPlan.titleDecorations, 'above');
  drawDecorations(ctx, decorationPlan.cornerDecorations, 'above');
}
```

## 15. 兼容策略

### 15.1 版本开关

新增：

```javascript
STATE.realStyleMode = true;
```

URL 参数：

```text
?mode=real
?mode=legacy
```

行为：

```javascript
if (getUrlParam('mode') === 'legacy') {
  STATE.realStyleMode = false;
}
```

### 15.2 回退

如果新渲染器报错：

```javascript
try {
  drawRealStyleCover(...);
} catch (err) {
  console.warn('real style render failed, fallback to legacy', err);
  drawLockedTemplateCover(...);
}
```

## 16. 文件拆分建议

当前 `index.html` 过大，建议将新逻辑拆到独立文件。

```text
/lib/real-style-map.js
/lib/real-style-configs.js
/lib/real-style-layouts.js
/lib/real-style-center-shapes.js
/lib/real-style-typography.js
/lib/real-style-decorations.js
/lib/real-style-renderer.js
```

职责：

```text
real-style-map.js
  A-T 到 5 真实风格族映射

real-style-configs.js
  5 真实风格族配置 + 20 子风格配置

real-style-layouts.js
  25 个真实 layout 定义和几何参数

real-style-center-shapes.js
  不少于 40 个中央承载图形，提供 draw()、textSafeArea 和 decorationSlots

real-style-typography.js
  文案结构化、字号、行高、字距、主副标题计算

real-style-decorations.js
  装饰包生成、位置分配、互斥规则

real-style-renderer.js
  drawRealStyleCover 主入口
```

## 17. 开发优先级

### P0：真实风格模式骨架

```text
新增 REAL_STYLE_MAP
新增 drawRealStyleCover 入口
新增 mode=real / mode=legacy
保留 20 个风格入口
实现 5 个真实风格族各 1 个 layout
实现 parseCoverContent
实现每个真实风格族至少 2 个 center shape
```

验收：

```text
20 个风格都能正常渲染
每个风格归属到正确真实风格族
旧模式可回退
```

### P1：完整 5×5 Layout

```text
每个真实风格族实现 5 个 layout
共 25 个 layout
替代 burst/card/bubble/paper/frame 主路径
每个 family 仍输出 5 张变体
中央承载图形扩展到不少于 40 种
```

验收：

```text
20 个风格 × 5 个变体 = 100 张
同一真实风格族内部看起来同源但不重复
```

### P2：文字层级改造

```text
主标题 / 副标题 / 关键词 / badge / footer
主标题占画面 55-75%
字号上限提高
字距和行高按参考规则调整
支持 5% bleed
```

验收：

```text
3-12 字短文案有大字冲击
15-24 字文案能形成主副标题
长文案不再像小字说明书
```

### P3：装饰包改造

```text
按真实风格族生成装饰包
装饰数量符合 3-6 主流区间
minimal 保持 0-1 个装饰
增加装饰互斥和标题保护区
```

验收：

```text
handnote 有胶带/手绘圈/纸张感
collage 有便签/印章/箭头/色块
comic 有半色调/气泡/放射线/emoji
newspaper 有印章/分割线/多栏
minimal 干净有大字
```

### P4：真实贴纸素材

```text
引入真实 PNG / WebP 贴纸素材
为贴纸添加 metadata
按风格族筛选贴纸
Canvas 手绘作为 fallback
```

验收：

```text
贴纸质感明显优于纯 Canvas 图形
不会随机出现风格不匹配贴纸
```

### P5：推荐与权重

```text
AI 推荐改为推荐真实风格族 + 子风格
默认推荐权重匹配参考模板分布
保留用户手动选择 A-T
```

验收：

```text
默认生成更接近参考模板分布
学习/笔记类优先 handnote
强提醒类优先 comic
干货教程可走 newspaper / minimal
```

### P6：批量候选数量与横向滚动

```text
批量文案模式下，每一个文案默认生成 30 张候选图
同一文案的 30 张图支持横向滚动选择
每张候选图保持下载 / 复制 / 换一换能力
候选图不再只对应 5 个 variant，而是 30 个 candidate
```

验收：

```text
每条文案下方能看到横向滚动候选带
默认首屏显示 3-5 张，左右滚动查看更多
每条文案至少有 30 张候选
候选图之间在中央图形、装饰位置、上下布局上有明显变化
```

## 17A. 批量生成 30 张候选图

当前批量文案中，每个文案对应图片数量偏少，且不同文案之间上下结构雷同。需要改为每条文案生成 30 张候选图，并使用横向滚动区域展示。

### 17A.1 目标

```text
每个文案默认生成 30 张候选图
用户可以左右滚动选择
不同候选图之间中央图形、装饰位置、上下布局、配色子方案有变化
不同文案之间不要共享完全相同的上下装饰结构
```

### 17A.2 数据模型

新增 candidate 概念。

```javascript
{
  textIndex: 0,
  candidateIndex: 0,
  family: 'A',
  realFamily: 'handnote',
  subStyle: 'creamNotebook',
  layoutId: 'handnoteTape',
  centerShapeId: 'lined-note',
  seed: 12345,
  variantSeed: 67890
}
```

### 17A.3 生成策略

每条文案 30 张，不再简单等于：

```text
5 个 variant
```

而是：

```text
30 candidates = family/subStyle + layout + centerShape + decorationPlan + paletteVariant + typographyVariant 的组合
```

推荐组合：

```text
同一个文案：
6 个 family/subStyle × 每个 5 张 = 30 张
```

如果用户已经指定风格族：

```text
同一 family 下：
5 个 layout × 6 个 centerShape / decoration variants = 30 张
```

### 17A.4 默认候选来源

如果用户没有指定风格，使用推荐权重抽取 6 个风格入口：

```text
handnote 2 个
collage 1-2 个
comic 1 个
newspaper 1 个
minimal 0-1 个
```

示例：

```text
A 手账白底
L 日系清新
F 复古胶片
C 红色事件
D 蓝绿信息
E 极简金句
```

每个风格生成 5 张，共 30 张。

### 17A.5 横向滚动 UI

每条文案对应一个 batch group。

```text
文案标题 / 操作区
横向滚动候选列表
  candidate 1
  candidate 2
  ...
  candidate 30
```

UI 结构：

```html
<section class="batch-group">
  <header class="batch-header">
    <h3>文案 1</h3>
    <button>下载选中</button>
    <button>下载全部</button>
  </header>
  <div class="candidate-scroll">
    <article class="card-wrap">...</article>
    ...
  </div>
</section>
```

CSS 建议：

```css
.candidate-scroll {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(220px, 280px);
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  padding-bottom: 12px;
}

.candidate-scroll .card-wrap {
  scroll-snap-align: start;
}
```

### 17A.6 移动端

```text
横向滑动
候选卡片宽度约 78vw
保留下载 / 复制 / 换一换按钮
```

### 17A.7 性能

每条文案 30 张会显著增加渲染量，需要做懒渲染。

建议：

```text
先渲染前 6 张
用户横向滚动接近末尾时再渲染下一组 6 张
每个 batch group 最多同时保留 30 张 canvas
不可见 canvas 可转为缩略图 image，减少内存
```

实现：

```text
IntersectionObserver
requestIdleCallback
render queue
```

### 17A.8 下载逻辑

```text
下载选中：只下载用户勾选候选
下载本组全部：下载该文案 30 张
下载全部：下载所有文案的全部候选
```

需要注意批量下载体积变大，建议：

```text
下载全部前显示确认
超过 100 张时提示可能较慢
```

## 17B. 批量候选随机性与去雷同

当前问题：

```text
不同文案生成的图片上下结构雷同
装饰位置重复
中央区域形状重复
看起来只是换了文字
```

需要引入“稳定随机 + 去重约束”。

### 17B.1 稳定随机种子

每条文案必须有自己的基础 seed。

```javascript
function getTextSeed(text, textIndex, globalSeed) {
  return hash(text + ':' + textIndex + ':' + globalSeed);
}
```

每张候选图：

```javascript
candidateSeed = hash(textSeed + ':' + candidateIndex);
```

这样可以保证：

```text
同一文案每次生成稳定
不同文案 seed 不同
同一文案 30 张候选彼此不同
点击换一换时可以推进 seed
```

### 17B.2 去雷同维度

同一文案的 30 张候选至少应在以下维度变化：

```text
realFamily
subStyle
layoutId
centerShapeId
decorationSlots
decorationCount
paletteVariant
titleAlignment
titlePosition
badgePosition
footerPosition
```

不同文案之间也应避免完全同结构。

### 17B.3 最近结构缓存

新增结构签名：

```javascript
function getCompositionSignature(plan) {
  return [
    plan.realFamily,
    plan.layoutId,
    plan.centerShapeId,
    plan.decorationSlots.join(','),
    plan.titleAlignment,
    plan.titlePositionKey,
    plan.badgePosition
  ].join('|');
}
```

批量生成时维护最近签名：

```javascript
const recentCompositionSignatures = new Set();
```

如果新候选的签名已经出现：

```text
重新抽取 centerShape / decorationSlots / typographyVariant
最多重试 5 次
```

### 17B.4 上下结构随机化

不要固定：

```text
badge 永远在左上
stamp 永远在右上
footer 永远在底部
subtitle 永远在黄色条
```

应允许：

```text
badge：左上 / 右上 / 左中 / 顶部横条
stamp：右上 / 右下 / 中右 / 左下
subtitle：主标题下 / 顶部小条 / 底部条 / 侧边竖排
footer：底部左 / 底部中 / 左侧竖排 / 不显示
arrow：左下指向 / 右上指向 / 底部弧线 / 不显示
```

### 17B.5 每个真实风格族的随机边界

随机性必须在风格规则内发生。

```text
handnote 可以随机纸张、胶带、手绘圈位置
collage 可以随机纸片层级、印章位置、箭头方向
comic 可以随机气泡、爆炸框、emoji 位置
newspaper 可以随机栏目、印章、横线、上下分割
minimal 只能轻微随机对齐、bleed、短线位置
```

不要为了随机而破坏风格。

## 18. 验收标准

### 18.1 结构验收

```text
A-T 20 个入口全部保留
每个入口都有 realFamily 和 subStyle
每个入口仍有 5 个变体
中央承载图形不少于 40 种
legacy 模式可用
```

### 18.2 视觉验收

```text
封面能明显归入 5 个真实风格族之一
不再出现赛博/极光/玻璃等脱离小红书参考模板的独立视觉方向
主标题占画面 55-75%
装饰数量符合对应风格族规则
文字层级明显
同一批候选图不会全部都是方形中间面板
```

### 18.3 排版验收

```text
短文案冲击力强
中长文案有主副标题层级
副标题不抢主标题
关键词强调自然
大字不显得保守
```

### 18.4 装饰验收

```text
装饰不遮挡文字
装饰位置有组织
装饰数量不是随机 1-3 个
不同装饰之间有互斥
minimal 风格不会被装饰污染
```

### 18.5 兼容验收

```text
下载 PNG 正常
复制图片正常
批量生成正常
批量模式下每条文案可生成 30 张候选
候选图支持横向滚动浏览
换一换正常
贴纸切换不报错
移动端可正常浏览
```

## 19. 建议的最小改造切口

如果开发资源有限，不要一次性重写全部。

推荐最小切口：

```text
1. 先新增 REAL_STYLE_MAP
2. 只实现 5 个真实风格族各 1 个 layout
3. 让 A-T 全部走新 realFamily renderer
4. 主标题放大到参考范围
5. 每个真实风格族实现基础装饰包
6. 每个真实风格族先实现至少 8 个中央承载图形的占位版本
7. 批量模式先将每条文案候选数从 5 提升到 30，并使用横向滚动
```

这一步完成后，视觉会立刻明显接近参考模板。

随后再扩展到：

```text
每族 5 个 layout
真实贴纸素材
更完整的装饰互斥
更多子风格 palette
```

## 20. 关键开发原则

```text
20 个风格入口是产品层，不是 20 套独立视觉系统。
5 个真实风格族是设计层，是主要渲染逻辑。
子风格只调整颜色、纹理、贴纸倾向、字体气质。
版式和装饰组织必须跟随真实风格族。
不要继续在通用模板上叠效果。
```

一句话总结：

```text
保留 20 个入口，重构为 5 个真实风格族下的 20 个子风格。
用户选择不变，生成逻辑变专业。
```
