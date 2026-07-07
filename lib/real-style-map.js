/**
 * real-style-map.js
 * 真实风格族重构 — 核心数据层
 *
 * 职责：
 *   1. A-T 20 个风格入口 → 5 个真实风格族映射
 *   2. 5 个真实风格族配置（版式、排版、装饰规则）
 *   3. 20 个子风格配置（颜色、纹理、装饰倾向）
 *   4. 工具函数：resolveRealStyle / getRealFamilies
 *
 * 本文件不执行任何 DOM 操作或 Canvas 操作。
 * 不修改 index.html 中任何现有渲染逻辑。
 */

// ═══════════════════════════════════════════════════════════════
// 1. A-T → 5 真实风格族映射
// ═══════════════════════════════════════════════════════════════

const REAL_STYLE_MAP = {
  // ===== handnote 手绘便签风 =====
  A: { realFamily: 'handnote',  subStyle: 'creamNotebook' },
  J: { realFamily: 'handnote',  subStyle: 'chinesePaper' },
  L: { realFamily: 'handnote',  subStyle: 'japaneseSoft' },

  // ===== collage 拼贴 collage 风 =====
  F: { realFamily: 'collage',   subStyle: 'retroFilm' },
  I: { realFamily: 'collage',   subStyle: 'memphisCollage' },
  M: { realFamily: 'collage',   subStyle: 'threeDSticker' },
  T: { realFamily: 'collage',   subStyle: 'cartoonCollage' },

  // ===== comic 漫画 pop 风 =====
  B: { realFamily: 'comic',     subStyle: 'yellowWarning' },
  C: { realFamily: 'comic',     subStyle: 'redEvent' },
  G: { realFamily: 'comic',     subStyle: 'dopaminePop' },
  H: { realFamily: 'comic',     subStyle: 'acidPop' },
  N: { realFamily: 'comic',     subStyle: 'vaporwavePop' },
  P: { realFamily: 'comic',     subStyle: 'pixelPop' },

  // ===== newspaper 报纸大字风 =====
  D: { realFamily: 'newspaper', subStyle: 'blueGreenInfo' },
  K: { realFamily: 'newspaper', subStyle: 'cyberEditorial' },
  O: { realFamily: 'newspaper', subStyle: 'darkEditorial' },
  R: { realFamily: 'newspaper', subStyle: 'vintagePoster' },

  // ===== minimal 极简大字风 =====
  E: { realFamily: 'minimal',   subStyle: 'cleanQuote' },
  Q: { realFamily: 'minimal',   subStyle: 'auroraMinimal' },
  S: { realFamily: 'minimal',   subStyle: 'glassMinimal' },
};

// ═══════════════════════════════════════════════════════════════
// 2. 5 个真实风格族配置
// ═══════════════════════════════════════════════════════════════

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
      letterSpacing: -0.035,
    },
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
      stroke: true,
    },
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
      letterSpacing: -0.04,
    },
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
      serifAllowed: true,
    },
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
      letterSpacing: -0.045,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// 3. 20 个子风格配置
// ═══════════════════════════════════════════════════════════════
//
// 颜色值沿用 LOCKED_TEMPLATE_STYLES 中已有的颜色。
// 纹理名称映射到 lib/textures.js 中的函数逻辑。
// decorationBias 决定该子风格更倾向使用哪些类型的装饰元素。

const REAL_SUBSTYLE_CONFIGS = {
  // ── handnote 子风格 ──────────────────────────────────────

  creamNotebook: {
    palette: {
      bg: ['#FBFAF4', '#FFFFFF', '#FFF8DC', '#F4FAFF', '#FCF7EF'],
      text: '#111111',
      accent: '#E6213D',
      second: '#FFEC47',
    },
    texture: 'notebookGrid',
    decorationBias: ['tape', 'handCircle', 'markerHighlight', 'doodle', 'emoji'],
  },

  chinesePaper: {
    palette: {
      bg: ['#F5EBD8', '#F2EAD3', '#F8E8D0', '#E8E4D8', '#E8F0E8'],
      text: '#2D2520',
      accent: '#C8252C',
      second: '#B0823B',
    },
    texture: 'ricePaper',
    decorationBias: ['stamp', 'handCircle', 'tape', 'doodle', 'markerHighlight'],
  },

  japaneseSoft: {
    palette: {
      bg: ['#FFF2F6', '#EEF7FF', '#FFF8E8', '#F2FFF7', '#F8F3FF'],
      text: '#222222',
      accent: '#FFB8C8',
      second: '#A8D890',
    },
    texture: 'washiPaper',
    decorationBias: ['tape', 'doodle', 'emoji', 'handCircle', 'markerHighlight'],
  },

  // ── collage 子风格 ──────────────────────────────────────

  retroFilm: {
    palette: {
      bg: ['#3A2A1A', '#1A2B3A', '#2A3A28', '#4A2A38', '#1A1A1A'],
      text: '#F8F1E8',
      accent: '#D4A574',
      second: '#FFE0A8',
    },
    texture: 'filmGrain',
    decorationBias: ['stamp', 'paper', 'colorBlock', 'arrow', 'tape'],
  },

  memphisCollage: {
    palette: {
      bg: ['#FFE5EC', '#D4F1F4', '#FFF8DC', '#E6E6FA', '#FFDAB9'],
      text: '#111111',
      accent: '#FF6B6B',
      second: '#2677DE',
    },
    texture: 'zigzagStripes',
    decorationBias: ['colorBlock', 'paper', 'stamp', 'arrow', 'dot'],
  },

  threeDSticker: {
    palette: {
      bg: ['#EAF2FF', '#FFF1FA', '#F1FFF4', '#F6F0FF', '#FFF7E8'],
      text: '#111111',
      accent: '#8BB8FF',
      second: '#FFB8C8',
    },
    texture: 'noise',
    decorationBias: ['sticker', 'paper', 'stamp', 'emoji', 'colorBlock'],
  },

  cartoonCollage: {
    palette: {
      bg: ['#FFE7F0', '#FFF1B8', '#E7F8FF', '#F0FFE7', '#F5E7FF'],
      text: '#111111',
      accent: '#FF6B9D',
      second: '#4ECDC4',
    },
    texture: 'polkaDots',
    decorationBias: ['emoji', 'sticker', 'paper', 'arrow', 'colorBlock'],
  },

  // ── comic 子风格 ──────────────────────────────────────

  yellowWarning: {
    palette: {
      bg: ['#FFE45C', '#FFD84D', '#FFF1A8', '#F7D000', '#FFFFFF'],
      text: '#111111',
      accent: '#E6213D',
      second: '#2677DE',
    },
    texture: 'halftoneLight',
    decorationBias: ['burstLines', 'speechBubble', 'stamp', 'emoji', 'sfx'],
  },

  redEvent: {
    palette: {
      bg: ['#ED0108', '#C90012', '#B00020', '#E6213D', '#1A1A1A'],
      text: '#FFFFFF',
      accent: '#FFEC47',
      second: '#FFFFFF',
    },
    texture: 'halftoneDots',
    decorationBias: ['burstLines', 'sfx', 'emoji', 'speechBubble', 'stamp'],
  },

  dopaminePop: {
    palette: {
      bg: ['#FF6B9D', '#4ECDC4', '#7FCD91', '#9B5DE5', '#FFE066'],
      text: '#111111',
      accent: '#FFFFFF',
      second: '#FFEC47',
    },
    texture: 'polkaDots',
    decorationBias: ['emoji', 'burstLines', 'speechBubble', 'sfx', 'sticker'],
  },

  acidPop: {
    palette: {
      bg: ['#0A0A0A', '#101014', '#0B1220', '#170A24', '#111111'],
      text: '#FFFFFF',
      accent: '#00FF88',
      second: '#FF4FD8',
    },
    texture: 'concentricRings',
    decorationBias: ['burstLines', 'sfx', 'speechBubble', 'emoji', 'sticker'],
  },

  vaporwavePop: {
    palette: {
      bg: ['#2B1055', '#3B1D7A', '#53278D', '#1D2671', '#261447'],
      text: '#FFFFFF',
      accent: '#FF8BD1',
      second: '#00F5FF',
    },
    texture: 'scanlines',
    decorationBias: ['burstLines', 'emoji', 'speechBubble', 'sfx', 'sticker'],
  },

  pixelPop: {
    palette: {
      bg: ['#D8F3FF', '#FFF2C6', '#F2FFD8', '#FFE0F0', '#E8E8FF'],
      text: '#111111',
      accent: '#111111',
      second: '#E6213D',
    },
    texture: 'checkerboard',
    decorationBias: ['emoji', 'burstLines', 'speechBubble', 'sfx', 'stamp'],
  },

  // ── newspaper 子风格 ──────────────────────────────────

  blueGreenInfo: {
    palette: {
      bg: ['#DDF7F3', '#E9F3FF', '#F4F7FF', '#E6FFF4', '#FFFFFF'],
      text: '#111111',
      accent: '#2677DE',
      second: '#22B26B',
    },
    texture: 'notebookGrid',
    decorationBias: ['divider', 'badge', 'stamp', 'line', 'dot'],
  },

  cyberEditorial: {
    palette: {
      bg: ['#1A0A2E', '#0A0A1F', '#0A1A0A', '#160A24', '#111111'],
      text: '#FFFFFF',
      accent: '#00F5FF',
      second: '#FF4FD8',
    },
    texture: 'scanlines',
    decorationBias: ['divider', 'badge', 'line', 'stamp', 'dot'],
  },

  darkEditorial: {
    palette: {
      bg: ['#050505', '#111111', '#1A1410', '#10151A', '#180D14'],
      text: '#F5F0E8',
      accent: '#C9A45C',
      second: '#FFFFFF',
    },
    texture: 'filmGrain',
    decorationBias: ['divider', 'badge', 'stamp', 'line', 'frame'],
  },

  vintagePoster: {
    palette: {
      bg: ['#F5E6CF', '#F8ECD8', '#EFE1C7', '#F7EAD5', '#F4E2C5'],
      text: '#21170F',
      accent: '#B0823B',
      second: '#C8252C',
    },
    texture: 'vintagePaper',
    decorationBias: ['stamp', 'divider', 'badge', 'frame', 'line'],
  },

  // ── minimal 子风格 ────────────────────────────────────

  cleanQuote: {
    palette: {
      bg: ['#FFFFFF', '#FBFAF4', '#F6FFF9', '#FFFDF1', '#F7FAFF'],
      text: '#111111',
      accent: '#2AB673',
      second: '#FFEC47',
    },
    texture: 'none',
    decorationBias: [],  // 极简无装饰
  },

  auroraMinimal: {
    palette: {
      bg: ['#DFF6FF', '#FCE7FF', '#E6FFF2', '#FFF4D6', '#EDE7FF'],
      text: '#111111',
      accent: '#6B7CFF',
      second: '#FF8BD1',
    },
    texture: 'none',
    decorationBias: [],
  },

  glassMinimal: {
    palette: {
      bg: ['#EAF4FF', '#F7EDFF', '#EFFFF6', '#FFF3EC', '#EEF0FF'],
      text: '#111111',
      accent: '#FFFFFF',
      second: '#2677DE',
    },
    texture: 'none',
    decorationBias: [],
  },
};

// ═══════════════════════════════════════════════════════════════
// 4. 工具函数
// ═══════════════════════════════════════════════════════════════

/**
 * 根据 family 字母（A-T）解析真实风格族和子风格配置。
 * @param {string} family - 风格字母 'A'~'T'
 * @returns {{ realFamily: string, subStyle: string, subStyleConfig: object, familyConfig: object }}
 */
function resolveRealStyle(family) {
  const map = REAL_STYLE_MAP[family] || REAL_STYLE_MAP.A;
  const realFamily = map.realFamily;
  const subStyle = map.subStyle;
  const subStyleConfig = REAL_SUBSTYLE_CONFIGS[subStyle] || REAL_SUBSTYLE_CONFIGS.creamNotebook;
  const familyConfig = REAL_STYLE_CONFIGS[realFamily] || REAL_STYLE_CONFIGS.handnote;

  return {
    realFamily,
    subStyle,
    subStyleConfig,
    familyConfig,
  };
}

/**
 * 返回5个真实风格族名称数组。
 * @returns {string[]}
 */
function getRealFamilies() {
  return ['handnote', 'collage', 'comic', 'newspaper', 'minimal'];
}

/**
 * 根据真实风格族获取该族下所有子风格的 family 字母列表。
 * @param {string} realFamily - 真实风格族名
 * @returns {string[]}
 */
function getFamiliesInRealFamily(realFamily) {
  return Object.entries(REAL_STYLE_MAP)
    .filter(([, v]) => v.realFamily === realFamily)
    .map(([k]) => k);
}

// ═══════════════════════════════════════════════════════════════
// 5. 挂载到 window
// ═══════════════════════════════════════════════════════════════

window.REAL_STYLE_MAP = REAL_STYLE_MAP;
window.REAL_STYLE_CONFIGS = REAL_STYLE_CONFIGS;
window.REAL_SUBSTYLE_CONFIGS = REAL_SUBSTYLE_CONFIGS;
window.resolveRealStyle = resolveRealStyle;
window.getRealFamilies = getRealFamilies;
window.getFamiliesInRealFamily = getFamiliesInRealFamily;

/*
 * ─── 验证命令（在浏览器控制台执行）───
 *
 * console.log('REAL_STYLE_MAP:', window.REAL_STYLE_MAP);
 * console.log('REAL_STYLE_CONFIGS keys:', Object.keys(window.REAL_STYLE_CONFIGS));
 * console.log('REAL_SUBSTYLE_CONFIGS keys:', Object.keys(window.REAL_SUBSTYLE_CONFIGS));
 * console.log('resolveRealStyle("A"):', resolveRealStyle('A'));
 * console.log('resolveRealStyle("K"):', resolveRealStyle('K'));
 *
 * 预期输出：
 *   - REAL_STYLE_MAP 有20个键 A-T
 *   - REAL_STYLE_CONFIGS 有5个键 handnote/collage/comic/newspaper/minimal
 *   - REAL_SUBSTYLE_CONFIGS 有20个键
 *   - resolveRealStyle('A') → { realFamily: 'handnote', subStyle: 'creamNotebook', ... }
 *   - resolveRealStyle('K') → { realFamily: 'newspaper', subStyle: 'cyberEditorial', ... }
 */
