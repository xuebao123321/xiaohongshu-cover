/**
 * real-style-layouts.js
 * 真实风格族重构 — Layout 系统（5族 × 5变体 = 25个Layout）
 *
 * 每个 layout 定义：
 *   - 主标题/副标题/关键词的几何区域（归一化 0-1）
 *   - 装饰槽位推荐
 *   - 对齐偏好
 *   - 推荐搭配的中央承载图形
 *
 * 替代旧版 burst/card/bubble/paper/frame 通用模板体系。
 * 实际像素由渲染器按 1242×1656 换算。
 */

// ═══════════════════════════════════════════════════════════════
// 1. handnote — 手绘便签风 (5个)
// ═══════════════════════════════════════════════════════════════

const handnoteTape = {
  id: 'handnoteTape',
  name: '顶部胶带+横线纸+中央大字',
  realFamily: 'handnote',
  structure: 'center-title',   // ══════ #4: 结构类型 ══════
  geometry: {
    // 画布上部偏中，占55-65%面积
    titleZone:  { x: 0.10, y: 0.28, w: 0.80, h: 0.48 },
    subZone:    { x: 0.12, y: 0.77, w: 0.76, h: 0.08 },
    keywordZone:{ x: 0.10, y: 0.20, w: 0.80, h: 0.07 },
  },
  decorationSlots: ['topLeft', 'bottomRight'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['lined-note', 'round-note'],
};

const handnoteCircle = {
  id: 'handnoteCircle',
  structure: 'bottom-heavy',  // ══════ #4: 结构变体 ══════
  name: '手绘圈围绕关键词+右下涂鸦',
  realFamily: 'handnote',
  geometry: {
    titleZone:  { x: 0.12, y: 0.30, w: 0.76, h: 0.44 },
    subZone:    { x: 0.14, y: 0.76, w: 0.72, h: 0.08 },
    keywordZone:{ x: 0.25, y: 0.22, w: 0.50, h: 0.07 },
  },
  decorationSlots: ['aroundKeyword', 'bottomRight'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['cloud-frame', 'diary-label'],
};

const handnoteMarker = {
  id: 'handnoteMarker',
  structure: 'top-heavy',  // ══════ #4: 结构变体 ══════
  name: '荧光笔高亮+马克笔重影',
  realFamily: 'handnote',
  geometry: {
    titleZone:  { x: 0.08, y: 0.26, w: 0.84, h: 0.50 },
    subZone:    { x: 0.10, y: 0.78, w: 0.80, h: 0.08 },
    keywordZone:{ x: 0.08, y: 0.19, w: 0.40, h: 0.06 },
  },
  decorationSlots: ['aboveTitle', 'bottomLeft'],
  preferredAlign: 'left',
  allowBleed: false,
  preferredCenterShapeIds: ['torn-paper', 'curled-corner'],
};

const handnoteGrid = {
  id: 'handnoteGrid',
  structure: 'center-title',  // ══════ #4: 结构变体 ══════
  name: '方格纸+左上编号+小贴纸',
  realFamily: 'handnote',
  geometry: {
    titleZone:  { x: 0.12, y: 0.27, w: 0.76, h: 0.50 },
    subZone:    { x: 0.14, y: 0.78, w: 0.72, h: 0.08 },
    keywordZone:{ x: 0.50, y: 0.19, w: 0.42, h: 0.07 },
  },
  decorationSlots: ['topLeft', 'topRight'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['grid-note', 'tape-paper'],
};

const handnoteDiary = {
  id: 'handnoteDiary',
  structure: 'left-title',  // ══════ #4: 结构变体 ══════
  name: '便签纸+日期标签+手绘箭头',
  realFamily: 'handnote',
  geometry: {
    titleZone:  { x: 0.10, y: 0.29, w: 0.80, h: 0.46 },
    subZone:    { x: 0.12, y: 0.76, w: 0.76, h: 0.09 },
    keywordZone:{ x: 0.10, y: 0.21, w: 0.50, h: 0.07 },
  },
  decorationSlots: ['topRight', 'bottomLeft', 'belowTitle'],
  preferredAlign: 'left',
  allowBleed: false,
  preferredCenterShapeIds: ['diary-label', 'curled-corner'],
};

// ═══════════════════════════════════════════════════════════════
// 2. collage — 拼贴风 (5个)
// ═══════════════════════════════════════════════════════════════

const collageStack = {
  id: 'collageStack',
  structure: 'center-title',  // ══════ #4: 结构变体 ══════
  name: '3张撕边便签叠层+主标题压在上层',
  realFamily: 'collage',
  geometry: {
    titleZone:  { x: 0.12, y: 0.30, w: 0.76, h: 0.44 },
    subZone:    { x: 0.14, y: 0.76, w: 0.72, h: 0.08 },
    keywordZone:{ x: 0.20, y: 0.22, w: 0.60, h: 0.07 },
  },
  decorationSlots: ['topRight', 'bottomLeft', 'bottomRight'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['triple-stack', 'torn-collage'],
};

const collageStamp = {
  id: 'collageStamp',
  structure: 'top-heavy',  // ══════ #4: 结构变体 ══════
  name: '便签+右上印章+色块散布',
  realFamily: 'collage',
  geometry: {
    titleZone:  { x: 0.10, y: 0.29, w: 0.80, h: 0.46 },
    subZone:    { x: 0.12, y: 0.77, w: 0.76, h: 0.08 },
    keywordZone:{ x: 0.45, y: 0.21, w: 0.48, h: 0.07 },
  },
  decorationSlots: ['topRight', 'bottomLeft'],
  preferredAlign: 'left',
  allowBleed: false,
  preferredCenterShapeIds: ['tilted-note', 'torn-collage'],
};

const collageDiagonal = {
  id: 'collageDiagonal',
  structure: 'left-title',  // ══════ #4: 结构变体 ══════
  name: '斜向拼贴纸片+箭头指向标题',
  realFamily: 'collage',
  geometry: {
    titleZone:  { x: 0.18, y: 0.28, w: 0.70, h: 0.46 },
    subZone:    { x: 0.20, y: 0.76, w: 0.66, h: 0.08 },
    keywordZone:{ x: 0.52, y: 0.20, w: 0.40, h: 0.07 },
  },
  decorationSlots: ['topLeft', 'belowTitle'],
  preferredAlign: 'left',
  allowBleed: false,
  preferredCenterShapeIds: ['magazine-cut', 'color-blocks'],
};

const collageScrapbook = {
  id: 'collageScrapbook',
  structure: 'bottom-heavy',  // ══════ #4: 结构变体 ══════
  name: '照片框/便签/胶带组合',
  realFamily: 'collage',
  geometry: {
    titleZone:  { x: 0.13, y: 0.27, w: 0.74, h: 0.46 },
    subZone:    { x: 0.15, y: 0.75, w: 0.70, h: 0.09 },
    keywordZone:{ x: 0.30, y: 0.19, w: 0.40, h: 0.07 },
  },
  decorationSlots: ['topLeft', 'topRight', 'bottomRight'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['polaroid', 'tape-sticker'],
};

const collageMagazine = {
  id: 'collageMagazine',
  structure: 'split-block',  // ══════ #4: 结构变体 ══════
  name: '杂志拼贴+大字描边+小标签',
  realFamily: 'collage',
  geometry: {
    titleZone:  { x: 0.11, y: 0.25, w: 0.78, h: 0.50 },
    subZone:    { x: 0.13, y: 0.77, w: 0.74, h: 0.08 },
    keywordZone:{ x: 0.11, y: 0.18, w: 0.40, h: 0.06 },
  },
  decorationSlots: ['topRight', 'bottomLeft', 'aboveTitle'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['magazine-cut', 'color-blocks'],
};

// ═══════════════════════════════════════════════════════════════
// 3. comic — 漫画 pop 风 (5个)
// ═══════════════════════════════════════════════════════════════

const comicBurst = {
  id: 'comicBurst',
  structure: 'full-bleed-title',  // ══════ #4: 结构变体 ══════
  name: '放射线+巨大描边标题',
  realFamily: 'comic',
  geometry: {
    titleZone:  { x: 0.10, y: 0.25, w: 0.80, h: 0.52 },
    subZone:    { x: 0.12, y: 0.79, w: 0.76, h: 0.08 },
    keywordZone:{ x: 0.25, y: 0.17, w: 0.50, h: 0.07 },
  },
  decorationSlots: ['aboveTitle', 'belowTitle'],
  preferredAlign: 'center',
  allowBleed: true,
  preferredCenterShapeIds: ['burst-star', 'jagged-burst'],
};

const comicBubble = {
  id: 'comicBubble',
  structure: 'center-title',  // ══════ #4: 结构变体 ══════
  name: '对话气泡+半色调网点',
  realFamily: 'comic',
  geometry: {
    titleZone:  { x: 0.14, y: 0.30, w: 0.72, h: 0.42 },
    subZone:    { x: 0.16, y: 0.74, w: 0.68, h: 0.08 },
    keywordZone:{ x: 0.30, y: 0.22, w: 0.40, h: 0.07 },
  },
  decorationSlots: ['bottomLeft', 'topRight'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['speech-bubble', 'cloud-bubble'],
};

const comicEmoji = {
  id: 'comicEmoji',
  structure: 'top-heavy',  // ══════ #4: 结构变体 ══════
  name: '大3D emoji+SFX拟声词',
  realFamily: 'comic',
  geometry: {
    titleZone:  { x: 0.11, y: 0.24, w: 0.78, h: 0.50 },
    subZone:    { x: 0.13, y: 0.76, w: 0.74, h: 0.09 },
    keywordZone:{ x: 0.20, y: 0.16, w: 0.60, h: 0.07 },
  },
  decorationSlots: ['aboveTitle', 'topRight'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['circle-comic', 'halftone-circle'],
};

const comicHalftone = {
  id: 'comicHalftone',
  structure: 'full-bleed-title',  // ══════ #4: 结构变体 ══════
  name: '全屏半色调+倾斜标题',
  realFamily: 'comic',
  geometry: {
    titleZone:  { x: 0.09, y: 0.22, w: 0.82, h: 0.55 },
    subZone:    { x: 0.11, y: 0.79, w: 0.78, h: 0.08 },
    keywordZone:{ x: 0.45, y: 0.15, w: 0.48, h: 0.06 },
  },
  decorationSlots: ['topLeft', 'bottomRight'],
  preferredAlign: 'center',
  allowBleed: true,
  preferredCenterShapeIds: ['skewed-action', 'halftone-circle'],
};

const comicSfx = {
  id: 'comicSfx',
  structure: 'split-block',  // ══════ #4: 结构变体 ══════
  name: '拟声词+星爆+速度线',
  realFamily: 'comic',
  geometry: {
    titleZone:  { x: 0.10, y: 0.26, w: 0.80, h: 0.50 },
    subZone:    { x: 0.12, y: 0.78, w: 0.76, h: 0.08 },
    keywordZone:{ x: 0.25, y: 0.18, w: 0.50, h: 0.07 },
  },
  decorationSlots: ['aboveTitle', 'topLeft', 'topRight'],
  preferredAlign: 'center',
  allowBleed: true,
  preferredCenterShapeIds: ['speedline-box', 'burst-star'],
};

// ═══════════════════════════════════════════════════════════════
// 4. newspaper — 报纸大字风 (5个)
// ═══════════════════════════════════════════════════════════════

const newspaperHero = {
  id: 'newspaperHero',
  structure: 'top-heavy',  // ══════ #4: 结构变体 ══════
  name: '顶部巨大主标题+中部副标题+底部编号',
  realFamily: 'newspaper',
  geometry: {
    titleZone:  { x: 0.07, y: 0.22, w: 0.86, h: 0.52 },
    subZone:    { x: 0.09, y: 0.76, w: 0.82, h: 0.09 },
    keywordZone:{ x: 0.07, y: 0.15, w: 0.40, h: 0.06 },
  },
  decorationSlots: ['bottomLeft', 'topRight'],
  preferredAlign: 'left',
  allowBleed: false,
  preferredCenterShapeIds: ['headline-block', 'banner-strip'],
};

const newspaperColumns = {
  id: 'newspaperColumns',
  structure: 'bottom-heavy',  // ══════ #4: 结构变体 ══════
  name: '主标题+底部2-3栏小字',
  realFamily: 'newspaper',
  geometry: {
    titleZone:  { x: 0.09, y: 0.26, w: 0.82, h: 0.46 },
    subZone:    { x: 0.11, y: 0.74, w: 0.78, h: 0.12 },
    keywordZone:{ x: 0.09, y: 0.18, w: 0.40, h: 0.07 },
  },
  decorationSlots: ['bottomLeft', 'bottomRight'],
  preferredAlign: 'left',
  allowBleed: false,
  preferredCenterShapeIds: ['multi-column', 'vertical-column'],
};

const newspaperStamp = {
  id: 'newspaperStamp',
  structure: 'center-title',  // ══════ #4: 结构变体 ══════
  name: '大字+印章+横线分割',
  realFamily: 'newspaper',
  geometry: {
    titleZone:  { x: 0.10, y: 0.27, w: 0.80, h: 0.48 },
    subZone:    { x: 0.12, y: 0.77, w: 0.76, h: 0.09 },
    keywordZone:{ x: 0.40, y: 0.19, w: 0.50, h: 0.07 },
  },
  decorationSlots: ['topRight', 'bottomRight'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['print-label', 'poster-frame'],
};

const newspaperPoster = {
  id: 'newspaperPoster',
  structure: 'split-block',  // ══════ #4: 结构变体 ══════
  name: '复古海报边框+大标题',
  realFamily: 'newspaper',
  geometry: {
    titleZone:  { x: 0.12, y: 0.26, w: 0.76, h: 0.50 },
    subZone:    { x: 0.14, y: 0.78, w: 0.72, h: 0.09 },
    keywordZone:{ x: 0.30, y: 0.18, w: 0.40, h: 0.07 },
  },
  decorationSlots: ['topLeft', 'topRight', 'bottomLeft'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['poster-frame', 'headline-block'],
};

const newspaperSplit = {
  id: 'newspaperSplit',
  structure: 'split-block',  // ══════ #4: 结构变体 ══════
  name: '上下色块分割+主副标题',
  realFamily: 'newspaper',
  geometry: {
    titleZone:  { x: 0.08, y: 0.24, w: 0.84, h: 0.48 },
    subZone:    { x: 0.10, y: 0.74, w: 0.80, h: 0.10 },
    keywordZone:{ x: 0.50, y: 0.16, w: 0.44, h: 0.07 },
  },
  decorationSlots: ['bottomLeft', 'topRight'],
  preferredAlign: 'left',
  allowBleed: false,
  preferredCenterShapeIds: ['split-blocks', 'skewed-block'],
};

// ═══════════════════════════════════════════════════════════════
// 5. minimal — 极简大字风 (5个)
// ═══════════════════════════════════════════════════════════════

const minimalCenter = {
  id: 'minimalCenter',
  structure: 'full-bleed-title',  // ══════ #4: 结构变体 ══════
  name: '中央超大字，几乎无装饰',
  realFamily: 'minimal',
  geometry: {
    titleZone:  { x: 0.08, y: 0.22, w: 0.84, h: 0.58 },
    subZone:    { x: 0.10, y: 0.82, w: 0.80, h: 0.07 },
    keywordZone:{ x: 0.30, y: 0.15, w: 0.40, h: 0.06 },
  },
  decorationSlots: [],
  preferredAlign: 'center',
  allowBleed: true,
  preferredCenterShapeIds: ['no-frame', 'thin-frame'],
};

const minimalBleed = {
  id: 'minimalBleed',
  structure: 'full-bleed-title',  // ══════ #4: 结构变体 ══════
  name: '文字允许5%溢出画布',
  realFamily: 'minimal',
  geometry: {
    titleZone:  { x: 0.04, y: 0.18, w: 0.92, h: 0.64 },
    subZone:    { x: 0.08, y: 0.84, w: 0.84, h: 0.07 },
    keywordZone:{ x: 0.25, y: 0.12, w: 0.50, h: 0.05 },
  },
  decorationSlots: [],
  preferredAlign: 'center',
  allowBleed: true,
  preferredCenterShapeIds: ['no-frame', 'bottom-line'],
};

const minimalLeft = {
  id: 'minimalLeft',
  structure: 'left-title',  // ══════ #4: 结构变体 ══════
  name: '偏左大字+小横线',
  realFamily: 'minimal',
  geometry: {
    titleZone:  { x: 0.06, y: 0.25, w: 0.82, h: 0.54 },
    subZone:    { x: 0.08, y: 0.81, w: 0.70, h: 0.08 },
    keywordZone:{ x: 0.06, y: 0.17, w: 0.40, h: 0.07 },
  },
  decorationSlots: ['bottomLeft'],
  preferredAlign: 'left',
  allowBleed: false,
  preferredCenterShapeIds: ['left-block', 'bottom-line'],
};

const minimalHuge = {
  id: 'minimalHuge',
  structure: 'full-bleed-title',  // ══════ #4: 结构变体 ══════
  name: '单词/短句撑满75-80%画面',
  realFamily: 'minimal',
  geometry: {
    titleZone:  { x: 0.04, y: 0.15, w: 0.92, h: 0.68 },
    subZone:    { x: 0.08, y: 0.85, w: 0.84, h: 0.07 },
    keywordZone:{ x: 0.25, y: 0.09, w: 0.50, h: 0.05 },
  },
  decorationSlots: [],
  preferredAlign: 'center',
  allowBleed: true,
  preferredCenterShapeIds: ['huge-circle', 'oval-base'],
};

const minimalStripe = {
  id: 'minimalStripe',
  structure: 'center-title',  // ══════ #4: 结构变体 ══════
  name: '纯色背景+1个短横线/小圆点',
  realFamily: 'minimal',
  geometry: {
    titleZone:  { x: 0.08, y: 0.23, w: 0.84, h: 0.56 },
    subZone:    { x: 0.10, y: 0.81, w: 0.80, h: 0.08 },
    keywordZone:{ x: 0.30, y: 0.16, w: 0.40, h: 0.06 },
  },
  decorationSlots: ['belowTitle'],
  preferredAlign: 'center',
  allowBleed: false,
  preferredCenterShapeIds: ['pill-shape', 'arch-base'],
};

// ═══════════════════════════════════════════════════════════════
// 聚合 & 选择函数
// ═══════════════════════════════════════════════════════════════

const REAL_STYLE_LAYOUTS = {
  handnote:  [handnoteTape, handnoteCircle, handnoteMarker, handnoteGrid, handnoteDiary],
  collage:   [collageStack, collageStamp, collageDiagonal, collageScrapbook, collageMagazine],
  comic:     [comicBurst, comicBubble, comicEmoji, comicHalftone, comicSfx],
  newspaper: [newspaperHero, newspaperColumns, newspaperStamp, newspaperPoster, newspaperSplit],
  minimal:   [minimalCenter, minimalBleed, minimalLeft, minimalHuge, minimalStripe],
};

/**
 * 从指定真实风格族中选择 layout。
 * @param {string} realFamily - 真实风格族名称
 * @param {number} variantIndex - 变体索引 0-4
 * @returns {object} layout 对象
 */
function selectLayout(realFamily, variantIndex) {
  const layouts = REAL_STYLE_LAYOUTS[realFamily];
  if (!layouts || layouts.length === 0) {
    return REAL_STYLE_LAYOUTS.handnote[0];
  }
  return layouts[(variantIndex || 0) % layouts.length];
}

/**
 * 获取指定风格族的所有 layout ID 列表。
 * @param {string} realFamily
 * @returns {string[]}
 */
function getLayoutIds(realFamily) {
  const layouts = REAL_STYLE_LAYOUTS[realFamily];
  return layouts ? layouts.map(l => l.id) : [];
}

// ═══════════════════════════════════════════════════════════════
// 挂载到 window
// ═══════════════════════════════════════════════════════════════

window.REAL_STYLE_LAYOUTS = REAL_STYLE_LAYOUTS;
window.selectLayout = selectLayout;
window.getLayoutIds = getLayoutIds;

/*
 * ─── 验证命令（浏览器控制台）───
 *
 * Object.keys(REAL_STYLE_LAYOUTS).forEach(f => {
 *   console.log(f + ' layouts:', REAL_STYLE_LAYOUTS[f].length);
 * });
 * // 预期每个输出 5
 *
 * // 验证 selectLayout 一致性
 * const l1 = selectLayout('handnote', 2);
 * const l2 = selectLayout('handnote', 7); // 7 % 5 = 2
 * console.log('同一layout:', l1.id === l2.id, '(expected true)');
 *
 * // 验证 layout 结构
 * const sample = REAL_STYLE_LAYOUTS.handnote[0];
 * console.log('id:', sample.id);
 * console.log('geometry keys:', Object.keys(sample.geometry));
 * console.log('decorationSlots:', sample.decorationSlots);
 * console.log('preferredCenterShapeIds:', sample.preferredCenterShapeIds);
 *
 * // 遍历所有 layout 检查完整性
 * let errors = [];
 * Object.entries(REAL_STYLE_LAYOUTS).forEach(([family, layouts]) => {
 *   layouts.forEach(l => {
 *     if (!l.id) errors.push('missing id in ' + family);
 *     if (!l.geometry) errors.push('missing geometry in ' + l.id);
 *     if (!l.geometry.titleZone) errors.push('missing titleZone in ' + l.id);
 *     if (!l.preferredCenterShapeIds || l.preferredCenterShapeIds.length === 0) {
 *       errors.push('no preferredCenterShapeIds in ' + l.id);
 *     }
 *   });
 * });
 * console.log('结构检查:', errors.length === 0 ? '✅ 全部通过' : errors);
 */
