/**
 * 大字封面配色库 v3.0
 * 数据源: STYLE_GUIDE_v3.0.md §2(5 风格族)+ §11(42 组配色速查表)
 * 字段约定: 每套配色含 bg / primary / secondary / accent / text 5 个色
 *   bg:       背景主色
 *   primary:  主装饰色(印章/标签/便签底)
 *   secondary:次要装饰色(箭头/涂鸦/小图案)
 *   accent:   强调色(高亮/3D emoji/拟声词)
 *   text:     文字主色(对比度 ≥ WCAG AA 4.5)
 */

// ═══════════ 风格族 A · 手绘便签风 ═══════════
// 配色来自 STYLE_GUIDE_v3.0.md §2 A.2
export const handDrawn = {
  // A1 米黄横线 — 笔记本/日记感
  beigeLined: {
    name: 'A1 米黄横线',
    bg: '#F5EFD8',
    primary: '#5D4E37',
    secondary: '#A8A098',
    accent: '#FFE082',
    text: '#2D2A26',
  },
  // A2 米白方格 — 数学作业本感
  whiteGrid: {
    name: 'A2 米白方格',
    bg: '#FAF8F5',
    primary: '#A8A098',
    secondary: '#888888',
    accent: '#FFD95F',
    text: '#1A1A1A',
  },
  // A3 暖黄胶带 — 手账/便签感
  warmTape: {
    name: 'A3 暖黄胶带',
    bg: '#FDF6E9',
    primary: '#C8A050',
    secondary: '#8B6F47',
    accent: '#FFE082',
    text: '#3A2E1A',
  },
  // A4 奶油咖啡 — 咖啡馆/慢生活
  creamCoffee: {
    name: 'A4 奶油咖啡',
    bg: '#FAF5EA',
    primary: '#8B6F47',
    secondary: '#C8A050',
    accent: '#D4C080',
    text: '#5D4E00',
  },
  // A5 蓝白横线 — 学习/笔记感
  blueLined: {
    name: 'A5 蓝白横线',
    bg: '#E8EEF5',
    primary: '#5D8CB8',
    secondary: '#A8C0D8',
    accent: '#88B0D8',
    text: '#1E3A52',
  },
  // A6 灰白素描 — 草稿/思考感
  graySketch: {
    name: 'A6 灰白素描',
    bg: '#F0F0F0',
    primary: '#888888',
    secondary: '#A8A8A8',
    accent: '#FFEC47',
    text: '#3A3A3A',
  },
};

// ═══════════ 风格族 B · 拼贴 collage 风 ═══════════
// 配色来自 STYLE_GUIDE_v3.0.md §2 B.2
export const collage = {
  // B1 米白复古 — 复古手账
  beigeRetro: {
    name: 'B1 米白复古',
    bg: '#FAF5EA',
    primary: '#FFF9E1',
    secondary: '#FFE082',
    accent: '#A8C8E8',
    text: '#1A1A1A',
    // 拼贴风额外色块
    blocks: ['#ED0108', '#F8D612', '#2677DE'],
    stamp: '#E6213D',
  },
  // B2 纯白清新 — 清新生活
  whiteFresh: {
    name: 'B2 纯白清新',
    bg: '#FFFFFF',
    primary: '#FFE082',
    secondary: '#FFB8C8',
    accent: '#A8D890',
    text: '#1A1A1A',
    blocks: ['#FF6333', '#88C0BC', '#A890D0'],
    stamp: '#012FA7',
  },
  // B3 奶油拼接 — 活泼年轻
  creamMix: {
    name: 'B3 奶油拼接',
    bg: '#FDF6E9',
    primary: '#FFD95F',
    secondary: '#FF9F90',
    accent: '#88B0D8',
    text: '#1A1A1A',
    blocks: ['#B8E300', '#F78DE9', '#FFC106'],
    stamp: '#000000',
  },
  // B4 灰白杂志 — 杂志拼贴
  grayMag: {
    name: 'B4 灰白杂志',
    bg: '#F0F0F0',
    primary: '#FFFFFF',
    secondary: '#EEEEEE',
    accent: '#DDDDDD',
    text: '#1A1A1A',
    blocks: ['#ED0108', '#012FA7', '#B8E300'],
    stamp: '#E6213D',
  },
  // B5 暖黄手账 — 日系手账
  warmJournal: {
    name: 'B5 暖黄手账',
    bg: '#FFF9E1',
    primary: '#FFE082',
    secondary: '#FFB890',
    accent: '#C0A890',
    text: '#3A2E1A',
    blocks: ['#E6213D', '#5D8CB8', '#88C078'],
    stamp: '#8B6F47',
  },
  // B6 冷色都市 — 都市潮流
  coolUrban: {
    name: 'B6 冷色都市',
    bg: '#E8EEF5',
    primary: '#FFFFFF',
    secondary: '#CFEAFE',
    accent: '#CFDCFE',
    text: '#012FA7',
    blocks: ['#012FA7', '#F78DE9', '#FFEC47'],
    stamp: '#ED0108',
  },
};

// ═══════════ 风格族 C · 漫画 pop 风 ═══════════
// 配色来自 STYLE_GUIDE_v3.0.md §2 C.2
export const comicPop = {
  // C1 红色 pop — 强冲击力
  redPop: {
    name: 'C1 红色 pop',
    bg: '#ED0108',
    primary: '#000000',
    secondary: '#FFFFFF',
    accent: '#FFEC47',
    text: '#FFFFFF',
    halftone: '#000000',
    halftoneOpacity: 0.3,
  },
  // C2 黄色 pop — 明亮活泼
  yellowPop: {
    name: 'C2 黄色 pop',
    bg: '#FFEC47',
    primary: '#000000',
    secondary: '#ED0108',
    accent: '#FFFFFF',
    text: '#000000',
    halftone: '#000000',
    halftoneOpacity: 0.25,
  },
  // C3 粉色 pop — 少女潮流
  pinkPop: {
    name: 'C3 粉色 pop',
    bg: '#F78DE9',
    primary: '#FFFFFF',
    secondary: '#000000',
    accent: '#FFEC47',
    text: '#000000',
    halftone: '#FFFFFF',
    halftoneOpacity: 0.35,
  },
  // C4 电蓝 pop — 科技潮流
  bluePop: {
    name: 'C4 电蓝 pop',
    bg: '#012FA7',
    primary: '#FFFFFF',
    secondary: '#FF4CE5',
    accent: '#FFEC47',
    text: '#FFEC47',
    halftone: '#FFFFFF',
    halftoneOpacity: 0.3,
  },
  // C5 荧光绿 pop — 街头潮酷
  greenPop: {
    name: 'C5 荧光绿 pop',
    bg: '#B8E300',
    primary: '#000000',
    secondary: '#ED0108',
    accent: '#FFFFFF',
    text: '#000000',
    halftone: '#000000',
    halftoneOpacity: 0.25,
  },
  // C6 橙色 pop — 活力年轻
  orangePop: {
    name: 'C6 橙色 pop',
    bg: '#FF6333',
    primary: '#000000',
    secondary: '#012FA7',
    accent: '#FFFFFF',
    text: '#FFFFFF',
    halftone: '#000000',
    halftoneOpacity: 0.3,
  },
};

// ═══════════ 风格族 D · 报纸大字风 ═══════════
// 配色来自 STYLE_GUIDE_v3.0.md §2 D.2
export const newspaper = {
  // D1 克莱因蓝 — 高级时尚
  klein: {
    name: 'D1 克莱因蓝',
    bg: '#012FA7',
    primary: '#FFD95F',
    secondary: '#FFFFFF',
    accent: '#ED0108',
    text: '#FFD95F',
  },
  // D2 正红白字 — 强冲击促销
  redWhite: {
    name: 'D2 正红白字',
    bg: '#ED0108',
    primary: '#FFFFFF',
    secondary: '#FFEC47',
    accent: '#000000',
    text: '#FFFFFF',
  },
  // D3 墨黑白字 — 高端杂志
  inkWhite: {
    name: 'D3 墨黑白字',
    bg: '#1A1A1A',
    primary: '#FFFFFF',
    secondary: '#F8D612',
    accent: '#E6213D',
    text: '#FFFFFF',
  },
  // D4 琥珀深蓝 — 复古报纸
  amberNavy: {
    name: 'D4 琥珀深蓝',
    bg: '#FFC106',
    primary: '#1C2850',
    secondary: '#FFFFFF',
    accent: '#ED0108',
    text: '#1C2850',
  },
  // D5 深绿米字 — 经典复古
  forestCream: {
    name: 'D5 深绿米字',
    bg: '#1B4D2E',
    primary: '#FFF8DC',
    secondary: '#FFEC47',
    accent: '#E6213D',
    text: '#FFF8DC',
  },
  // D6 紫白对撞 — 女性时尚
  purpleWhite: {
    name: 'D6 紫白对撞',
    bg: '#4A148C',
    primary: '#FFFFFF',
    secondary: '#FFEC47',
    accent: '#F78DE9',
    text: '#FFFFFF',
  },
};

// ═══════════ 风格族 E · 极简大字风 ═══════════
// 配色来自 STYLE_GUIDE_v3.0.md §2 E.2
export const minimal = {
  // E1 纯白黑字 — 极简杂志
  whiteBlack: {
    name: 'E1 纯白黑字',
    bg: '#FFFFFF',
    primary: '#000000',
    secondary: '#000000',
    accent: '#000000',
    text: '#000000',
  },
  // E2 纯黑白字 — 强对比
  blackWhite: {
    name: 'E2 纯黑白字',
    bg: '#000000',
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    accent: '#FFEC47',
    text: '#FFFFFF',
  },
  // E3 奶白炭字 — 高级生活
  creamCharcoal: {
    name: 'E3 奶白炭字',
    bg: '#FCF9F0',
    primary: '#5D4E37',
    secondary: '#A8A098',
    accent: '#5D4E37',
    text: '#2D2A26',
  },
  // E4 正红白字 — 强冲击
  redImpact: {
    name: 'E4 正红白字',
    bg: '#ED0108',
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    accent: '#FFEC47',
    text: '#FFFFFF',
  },
  // E5 克莱因蓝黄字 — 科技高级
  kleinYellow: {
    name: 'E5 克莱因蓝黄字',
    bg: '#012FA7',
    primary: '#FFD95F',
    secondary: '#FFFFFF',
    accent: '#FFFFFF',
    text: '#FFD95F',
  },
  // E6 米黄黑字 — 温暖治愈
  creamWarm: {
    name: 'E6 米黄黑字',
    bg: '#FFF9E1',
    primary: '#000000',
    secondary: '#000000',
    accent: '#FFEC47',
    text: '#000000',
  },
};

// ═══════════ v3.1 新增 15 个风格族配色 ═══════════

/**
 * F · 复古胶片(retroFilm)
 * 棕褐色调,5 套配色
 */
export const retroFilm = {
  sepiaWarm: {
    name: 'F1 棕褐暖调',
    bg: '#3A2A1A', bg2: '#5C3A22',
    primary: '#D4A574', secondary: '#A87850',
    accent: '#FFD89A', text: '#F5E6D0',
  },
  blueOld: {
    name: 'F2 老蓝调',
    bg: '#1A2B3A', bg2: '#2D4A5C',
    primary: '#8AA8C0', secondary: '#5C7A92',
    accent: '#FFB85C', text: '#E0EAF0',
  },
  greenFaded: {
    name: 'F3 褪色绿',
    bg: '#2A3A28', bg2: '#3D5236',
    primary: '#A8C088', secondary: '#7A8C5C',
    accent: '#E8B870', text: '#E8E4D0',
  },
  pinkDusty: {
    name: 'F4 灰尘粉',
    bg: '#4A2A38', bg2: '#6E3A52',
    primary: '#D890B0', secondary: '#A86890',
    accent: '#F0C870', text: '#F5E0E8',
  },
  bwFilm: {
    name: 'F5 黑白胶片',
    bg: '#1A1A1A', bg2: '#2D2D2D',
    primary: '#888888', secondary: '#555555',
    accent: '#E0E0E0', text: '#F0F0F0',
  },
};

/**
 * G · 多巴胺(dopamine)
 * 高饱和撞色,5 套配色
 */
export const dopamine = {
  pinkYellow: {
    name: 'G1 粉黄撞',
    bg: '#FF6B9D', primary: '#FFE066',
    secondary: '#FF8C42', accent: '#FFFFFF', text: '#FFFFFF',
  },
  bluePink: {
    name: 'G2 蓝粉撞',
    bg: '#4ECDC4', primary: '#FF6B9D',
    secondary: '#FFE066', accent: '#FFFFFF', text: '#FFFFFF',
  },
  greenOrange: {
    name: 'G3 绿橙撞',
    bg: '#7FCD91', primary: '#FF6B35',
    secondary: '#FFE066', accent: '#FFFFFF', text: '#FFFFFF',
  },
  purpleYellow: {
    name: 'G4 紫黄撞',
    bg: '#9B5DE5', primary: '#FFE066',
    secondary: '#FF6B9D', accent: '#FFFFFF', text: '#FFFFFF',
  },
  redBlue: {
    name: 'G5 红蓝撞',
    bg: '#E63946', primary: '#4ECDC4',
    secondary: '#FFE066', accent: '#FFFFFF', text: '#FFFFFF',
  },
};

/**
 * H · 酸性设计(acid)
 * 深色底 + 金属渐变,5 套配色
 */
export const acid = {
  chromeGreen: {
    name: 'H1 镀铬绿',
    bg: '#0A0A0A', primary: '#00FF88',
    secondary: '#00CC66', accent: '#88FFCC', text: '#FFFFFF',
  },
  chromePink: {
    name: 'H2 镀铬粉',
    bg: '#0A0A0A', primary: '#FF00FF',
    secondary: '#CC00CC', accent: '#FFAAFF', text: '#FFFFFF',
  },
  chromeBlue: {
    name: 'H3 镀铬蓝',
    bg: '#0A0A0A', primary: '#00CCFF',
    secondary: '#0099CC', accent: '#88DDFF', text: '#FFFFFF',
  },
  silverGold: {
    name: 'H4 银金',
    bg: '#1A1A1A', primary: '#FFD700',
    secondary: '#C0C0C0', accent: '#FFEC8B', text: '#F0F0F0',
  },
  liquidPurple: {
    name: 'H5 液态紫',
    bg: '#0A0A0A', primary: '#B967FF',
    secondary: '#7B2CBF', accent: '#E0B0FF', text: '#FFFFFF',
  },
};

/**
 * I · 孟菲斯(memphis)
 * 浅色底 + 撞色几何,5 套配色
 */
export const memphis = {
  pastelPink: {
    name: 'I1 粉色粉笔',
    bg: '#FFE5EC', primary: '#FF6B9D',
    secondary: '#4ECDC4', accent: '#FFE066', text: '#2D2D2D',
  },
  mintCoral: {
    name: 'I2 薄荷珊瑚',
    bg: '#D4F1F4', primary: '#FF6B6B',
    secondary: '#FFD93D', accent: '#6BCB77', text: '#2D2D2D',
  },
  creamTeal: {
    name: 'I3 米色青',
    bg: '#FFF8DC', primary: '#008B8B',
    secondary: '#FF6347', accent: '#FFD700', text: '#2D2D2D',
  },
  lavenderMint: {
    name: 'I4 薰衣草薄荷',
    bg: '#E6E6FA', primary: '#9B5DE5',
    secondary: '#00BBF9', accent: '#FEE440', text: '#2D2D2D',
  },
  peachNavy: {
    name: 'I5 桃色藏青',
    bg: '#FFDAB9', primary: '#1B3A5C',
    secondary: '#FF6B6B', accent: '#FFD700', text: '#1B3A5C',
  },
};

/**
 * J · 国风(chinese)
 * 宣纸红印章,5 套配色
 */
export const chinese = {
  redInkBlack: {
    name: 'J1 朱墨黑',
    bg: '#F5EBD8', primary: '#C8252C',
    secondary: '#5C4A3A', accent: '#8B0000', text: '#2D2520',
  },
  bambooGreen: {
    name: 'J2 竹青墨',
    bg: '#F2EAD3', primary: '#5C8A4A',
    secondary: '#8B6F47', accent: '#C8252C', text: '#2D3A2D',
  },
  palaceGold: {
    name: 'J3 宫墙金',
    bg: '#F8E8D0', primary: '#A02828',
    secondary: '#D4A04C', accent: '#5C4A2A', text: '#3D2A1A',
  },
  inkWashGray: {
    name: 'J4 水墨灰',
    bg: '#E8E4D8', primary: '#2D2520',
    secondary: '#5C4A3A', accent: '#C8252C', text: '#1A1612',
  },
  jadeWhite: {
    name: 'J5 玉石白',
    bg: '#E8F0E8', primary: '#5C8A7A',
    secondary: '#A8804C', accent: '#C8252C', text: '#2D3D38',
  },
};

/**
 * K · 赛博朋克(cyberpunk)
 * 深紫黑 + 霓虹,5 套配色
 */
export const cyberpunk = {
  neonPink: {
    name: 'K1 霓虹粉',
    bg: '#1A0A2E', primary: '#FF006E',
    secondary: '#00F5FF', accent: '#FFE066', text: '#FFFFFF',
  },
  neonCyan: {
    name: 'K2 霓虹青',
    bg: '#0A0A1F', primary: '#00F5FF',
    secondary: '#FF006E', accent: '#FFE066', text: '#FFFFFF',
  },
  neonGreen: {
    name: 'K3 霓虹绿',
    bg: '#0A1A0A', primary: '#39FF14',
    secondary: '#FF006E', accent: '#00F5FF', text: '#FFFFFF',
  },
  neonPurple: {
    name: 'K4 霓虹紫',
    bg: '#1F0A2E', primary: '#B967FF',
    secondary: '#00F5FF', accent: '#FF006E', text: '#FFFFFF',
  },
  neonOrange: {
    name: 'K5 霓虹橙',
    bg: '#1F0A0A', primary: '#FF6600',
    secondary: '#00F5FF', accent: '#FFE066', text: '#FFFFFF',
  },
};

/**
 * L · 日系清新(japanese)
 * 柔和粉/米/蓝,5 套配色
 */
export const japanese = {
  sakura: {
    name: 'L1 樱花',
    bg: '#FFE4E8', primary: '#FF9EB5',
    secondary: '#88B8D8', accent: '#FFFFFF', text: '#5C3A4A',
  },
  skyBlue: {
    name: 'L2 天蓝',
    bg: '#DDEEF7', primary: '#7AB8D8',
    secondary: '#FFB8C8', accent: '#FFFFFF', text: '#3A4A5C',
  },
  mintCream: {
    name: 'L3 薄荷奶油',
    bg: '#E8F5E8', primary: '#88C8A0',
    secondary: '#FFCC88', accent: '#FFFFFF', text: '#3A4A3A',
  },
  peach: {
    name: 'L4 蜜桃',
    bg: '#FFE8D8', primary: '#FFAA88',
    secondary: '#88C8C8', accent: '#FFFFFF', text: '#5C3A2D',
  },
  lavender: {
    name: 'L5 薰衣草',
    bg: '#E8E0F0', primary: '#B088D8',
    secondary: '#FFC8D8', accent: '#FFFFFF', text: '#4A3A5C',
  },
};

/**
 * M · 3D 渲染(threeD)
 * 渐变球体,5 套配色
 */
export const threeD = {
  blueSphere: {
    name: 'M1 蓝球',
    bg: '#E0EAF5', bg2: '#B0C8E0',
    primary: '#4A7AB8', accent: '#FF8866', text: '#1A2D4A',
  },
  purpleSphere: {
    name: 'M2 紫球',
    bg: '#EEE0F0', bg2: '#C8B0D8',
    primary: '#8A4AB8', accent: '#FFD700', text: '#3A1A4A',
  },
  orangeSphere: {
    name: 'M3 橙球',
    bg: '#FFF0E0', bg2: '#F5C8A0',
    primary: '#E8762D', accent: '#2D88C8', text: '#5C2D0A',
  },
  pinkSphere: {
    name: 'M4 粉球',
    bg: '#FCE8F0', bg2: '#F0B8D0',
    primary: '#E85A88', accent: '#2DD8B8', text: '#5C1A3A',
  },
  tealSphere: {
    name: 'M5 青球',
    bg: '#E0F5F0', bg2: '#A8D8C8',
    primary: '#2D9C88', accent: '#FF6688', text: '#0A3A30',
  },
};

/**
 * N · 蒸汽波(vaporwave)
 * 紫粉渐变,5 套配色
 */
export const vaporwave = {
  purplePink: {
    name: 'N1 紫粉',
    bg: '#2A0845', bg2: '#FF006E',
    primary: '#FFE066', accent: '#00F5FF', text: '#FFFFFF',
  },
  sunsetGrid: {
    name: 'N2 日落网格',
    bg: '#FF006E', bg2: '#8338EC',
    primary: '#FFE066', accent: '#3A86FF', text: '#FFFFFF',
  },
  bluePink: {
    name: 'N3 蓝粉',
    bg: '#3A86FF', bg2: '#FF006E',
    primary: '#FFE066', accent: '#FFFFFF', text: '#FFFFFF',
  },
  tealPink: {
    name: 'N4 青粉',
    bg: '#00F5FF', bg2: '#FF006E',
    primary: '#FFE066', accent: '#8338EC', text: '#FFFFFF',
  },
  darkPurple: {
    name: 'N5 暗紫',
    bg: '#1A0033', bg2: '#5C00B8',
    primary: '#FF006E', accent: '#FFE066', text: '#FFFFFF',
  },
};

/**
 * O · 暗黑系(dark)
 * 深黑 + 金/银,5 套配色
 */
export const dark = {
  blackGold: {
    name: 'O1 黑金',
    bg: '#0A0A0A', primary: '#D4AF37',
    secondary: '#8B7536', accent: '#FFD700', text: '#F5F5F5',
  },
  blackSilver: {
    name: 'O2 黑银',
    bg: '#0A0A0A', primary: '#C0C0C0',
    secondary: '#888888', accent: '#FFFFFF', text: '#F5F5F5',
  },
  blackRed: {
    name: 'O3 黑红',
    bg: '#0A0A0A', primary: '#8B0000',
    secondary: '#5C0000', accent: '#C8252C', text: '#F5F5F5',
  },
  blackPurple: {
    name: 'O4 黑紫',
    bg: '#0A0A0A', primary: '#6B2D9C',
    secondary: '#3D1A5C', accent: '#B967FF', text: '#F5F5F5',
  },
  blackGreen: {
    name: 'O5 黑绿',
    bg: '#0A0A0A', primary: '#2D6B3D',
    secondary: '#1A4A2A', accent: '#5CB870', text: '#F5F5F5',
  },
};

/**
 * P · 像素风(pixel)
 * 8-bit 撞色,5 套配色
 */
export const pixel = {
  nesClassic: {
    name: 'P1 红白机',
    bg: '#1A1A1A', primary: '#E63946',
    secondary: '#06D6A0', accent: '#FFD166', text: '#FFFFFF',
  },
  gameboy: {
    name: 'P2 绿屏',
    bg: '#9BBC0F', primary: '#0F380F',
    secondary: '#306230', accent: '#8BAC0F', text: '#0F380F',
  },
  arcade: {
    name: 'P3 街机',
    bg: '#000000', primary: '#FF006E',
    secondary: '#00F5FF', accent: '#FFE066', text: '#FFFFFF',
  },
  snes: {
    name: 'P4 16位',
    bg: '#5C94FC', primary: '#FFD700',
    secondary: '#FF6B6B', accent: '#FFFFFF', text: '#FFFFFF',
  },
  dotMatrix: {
    name: 'P5 点阵',
    bg: '#000000', primary: '#00FF66',
    secondary: '#FF6600', accent: '#FFFFFF', text: '#00FF66',
  },
};

/**
 * Q · 极光渐变(aurora)
 * 粉蓝紫渐变,5 套配色
 */
export const aurora = {
  pinkPurple: {
    name: 'Q1 粉紫',
    bg: '#FFB7E5', bg2: '#B967FF',
    primary: '#FFFFFF', accent: '#FFE066', text: '#FFFFFF',
  },
  blueGreen: {
    name: 'Q2 蓝绿',
    bg: '#88E0EF', bg2: '#5CD8A8',
    primary: '#FFFFFF', accent: '#FFE066', text: '#1A4A4A',
  },
  purpleBlue: {
    name: 'Q3 紫蓝',
    bg: '#B967FF', bg2: '#3A86FF',
    primary: '#FFFFFF', accent: '#FFE066', text: '#FFFFFF',
  },
  sunset: {
    name: 'Q4 日落',
    bg: '#FFB85C', bg2: '#FF006E',
    primary: '#FFFFFF', accent: '#5CD8E8', text: '#FFFFFF',
  },
  mintLavender: {
    name: 'Q5 薄荷薰衣草',
    bg: '#A8E6CF', bg2: '#D8B0FF',
    primary: '#FFFFFF', accent: '#FFE066', text: '#3A2D5C',
  },
};

/**
 * R · 复古海报(vintagePoster)
 * Art Deco 金边,5 套配色
 */
export const vintagePoster = {
  classicCream: {
    name: 'R1 经典米色',
    bg: '#F0E4D0', primary: '#8B0000',
    secondary: '#1A3A5C', accent: '#D4AF37', text: '#2D2520',
  },
  deepBlue: {
    name: 'R2 深蓝金',
    bg: '#1A2B5C', primary: '#D4AF37',
    secondary: '#E0E0E0', accent: '#FFE066', text: '#F5F5F5',
  },
  burgundy: {
    name: 'R3 酒红',
    bg: '#5C1A2A', primary: '#D4AF37',
    secondary: '#E8D4A0', accent: '#FFE066', text: '#F5E8D8',
  },
  tealGold: {
    name: 'R4 青绿金',
    bg: '#1A4A4A', primary: '#D4AF37',
    secondary: '#E0E0E0', accent: '#FFE066', text: '#F5F5F5',
  },
  olive: {
    name: 'R5 橄榄金',
    bg: '#4A4A2D', primary: '#D4AF37',
    secondary: '#E8D4A0', accent: '#FFE066', text: '#F5E8D8',
  },
};

/**
 * S · 玻璃拟态(glass)
 * 渐变 + 半透明,5 套配色
 */
export const glass = {
  blueGlass: {
    name: 'S1 蓝玻璃',
    bg: '#88B8E8', bg2: '#B8D8F0',
    primary: '#1A4A7A', accent: '#FFFFFF', text: '#0A2A4A',
  },
  purpleGlass: {
    name: 'S2 紫玻璃',
    bg: '#B088D8', bg2: '#D8B8F0',
    primary: '#3A1A5C', accent: '#FFFFFF', text: '#2A0A4A',
  },
  pinkGlass: {
    name: 'S3 粉玻璃',
    bg: '#FFB8D8', bg2: '#FFD8E8',
    primary: '#7A1A3A', accent: '#FFFFFF', text: '#5C0A2A',
  },
  mintGlass: {
    name: 'S4 薄荷玻璃',
    bg: '#88D8C8', bg2: '#B8E8D8',
    primary: '#1A5C4A', accent: '#FFFFFF', text: '#0A3A2A',
  },
  peachGlass: {
    name: 'S5 桃玻璃',
    bg: '#FFB898', bg2: '#FFD8B8',
    primary: '#7A2A0A', accent: '#FFFFFF', text: '#5C1A0A',
  },
};

/**
 * T · 卡通插画(cartoon)
 * 卡哇伊撞色,5 套配色
 */
export const cartoon = {
  sweetPink: {
    name: 'T1 甜心粉',
    bg: '#FFE0EC', primary: '#FF6B9D',
    secondary: '#FFE066', accent: '#88E0EF', text: '#5C1A3A',
  },
  sunnyYellow: {
    name: 'T2 阳光黄',
    bg: '#FFF4B8', primary: '#FF6B6B',
    secondary: '#88E0EF', accent: '#9B5DE5', text: '#5C3A0A',
  },
  skyBlue: {
    name: 'T3 天空蓝',
    bg: '#D8F0FF', primary: '#FF9F68',
    secondary: '#FFE066', accent: '#FF6B9D', text: '#1A3A5C',
  },
  mintGreen: {
    name: 'T4 薄荷绿',
    bg: '#D8F5E0', primary: '#FF6B9D',
    secondary: '#FFE066', accent: '#9B5DE5', text: '#1A5C3A',
  },
  lavender: {
    name: 'T5 薰衣草紫',
    bg: '#E8E0F5', primary: '#FFE066',
    secondary: '#FF6B9D', accent: '#88E0EF', text: '#3A1A5C',
  },
};

// ═══════════ 统一导出 ═══════════
export const PALETTES = {
  handDrawn, collage, comicPop, newspaper, minimal,
  retroFilm, dopamine, acid, memphis, chinese,
  cyberpunk, japanese, threeD, vaporwave, dark,
  pixel, aurora, vintagePoster, glass, cartoon,
};

// 42 组基础配色速查(用于"换一换"功能),来自 STYLE_GUIDE_v3.0.md §11
export const QUICK_SWATCH = [
  // 黄色系 6
  { name: 'y1 奶黄黑', bg: '#FFF9E1', text: '#000000' },
  { name: 'y2 柠檬黄黑', bg: '#FFEC47', text: '#000000' },
  { name: 'y3 米黄黑', bg: '#FDE6A5', text: '#000000' },
  { name: 'y4 明黄黑', bg: '#FFE81C', text: '#000000' },
  { name: 'y5 金黄白', bg: '#F8D612', text: '#FFFFFF' },
  { name: 'y6 鹅黄蓝', bg: '#FFD95F', text: '#012FA7' },
  // 红橙系 6
  { name: 'r1 正红白', bg: '#ED0108', text: '#FFFFFF' },
  { name: 'r2 玫红白', bg: '#E6213D', text: '#FFFFFF' },
  { name: 'r3 珊瑚橙白', bg: '#FF6333', text: '#FFFFFF' },
  { name: 'r4 深红白', bg: '#8C1A1A', text: '#FFFFFF' },
  { name: 'r5 浅粉黑', bg: '#FFCDD2', text: '#000000' },
  { name: 'r6 铁锈红白', bg: '#D23627', text: '#FFFFFF' },
  // 蓝色系 6
  { name: 'b1 深蓝黄', bg: '#012FA7', text: '#FFD95F' },
  { name: 'b2 莫兰迪蓝黑', bg: '#CFDCFE', text: '#000000' },
  { name: 'b3 粉蓝黑', bg: '#CFFBFE', text: '#000000' },
  { name: 'b4 淡蓝黑', bg: '#CEEAFF', text: '#000000' },
  { name: 'b5 宝蓝白', bg: '#2677DE', text: '#FFFFFF' },
  { name: 'b6 天蓝白', bg: '#7DABE7', text: '#FFFFFF' },
  // 绿色系 6
  { name: 'g1 荧光绿黑', bg: '#B8E300', text: '#000000' },
  { name: 'g2 薄荷绿黑', bg: '#D7FED1', text: '#000000' },
  { name: 'g3 翠绿黑', bg: '#8FEBA0', text: '#000000' },
  { name: 'g4 深绿米白', bg: '#02A789', text: '#FFFAEC' },
  { name: 'g5 苹果绿黑', bg: '#88C078', text: '#000000' },
  { name: 'g6 墨绿米白', bg: '#1B4D2E', text: '#FFF8DC' },
  // 紫粉色系 6
  { name: 'p1 荧光粉黑', bg: '#F78DE9', text: '#000000' },
  { name: 'p2 电光粉白', bg: '#FF4CE5', text: '#FFFFFF' },
  { name: 'p3 薰衣草紫', bg: '#E1BEE7', text: '#4A148C' },
  { name: 'p4 婴儿粉黑', bg: '#FDDDE2', text: '#000000' },
  { name: 'p5 干枯玫瑰黑', bg: '#EEBCD5', text: '#000000' },
  { name: 'p6 樱花粉黑', bg: '#FD9EC0', text: '#000000' },
  // 灰白色系 6
  { name: 'w1 纯白黑', bg: '#FFFFFF', text: '#000000' },
  { name: 'w2 浅灰黑', bg: '#EEEEEE', text: '#000000' },
  { name: 'w3 奶白炭', bg: '#FCF9F0', text: '#2D2A26' },
  { name: 'w4 中灰黑', bg: '#EDEDED', text: '#000000' },
  { name: 'w5 灰白黑', bg: '#DDDDDD', text: '#000000' },
  { name: 'w6 纯黑白', bg: '#000000', text: '#FFFFFF' },
  // 特殊撞色 6
  { name: 's1 黄底粉字', bg: '#FFE81C', text: '#FF227F' },
  { name: 's2 琥珀深蓝', bg: '#FFC106', text: '#1C2850' },
  { name: 's3 橙蓝', bg: '#FF6333', text: '#286BFA' },
  { name: 's4 黄红', bg: '#FFDF6E', text: '#E6213D' },
  { name: 's5 粉蓝', bg: '#F78DE9', text: '#012FA7' },
  { name: 's6 荧光绿红', bg: '#B8E300', text: '#E6213D' },
];

// ═══════════ 工具函数 ═══════════

/**
 * 解析 hex 颜色为 RGB(0-255)
 * @param {string} hex - '#RRGGBB' 或 '#RGB'
 * @returns {{r:number,g:number,b:number}}
 */
export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const num = parseInt(h, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * 计算 sRGB 相对亮度(WCAG 2.1 公式)
 * @param {string} hex
 * @returns {number} 0-1
 */
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * WCAG 对比度比值(1-21)
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number}
 */
export function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 若 bg/text 对比度 < 4.5(WCAG AA),自动把 textColor 改为黑或白
 * @param {string} bgColor - 背景色 #RRGGBB
 * @param {string} textColor - 候选文字色 #RRGGBB
 * @returns {string} 调整后的文字色(若原色已满足 ≥ 4.5 则原样返回)
 */
export function ensureContrast(bgColor, textColor) {
  if (contrastRatio(bgColor, textColor) >= 4.5) {
    return textColor;
  }
  // 选择对比度更高者
  const blackContrast = contrastRatio(bgColor, '#000000');
  const whiteContrast = contrastRatio(bgColor, '#FFFFFF');
  return blackContrast > whiteContrast ? '#000000' : '#FFFFFF';
}

/**
 * 随机取一个色块组(B 拼贴风专用)
 * @param {object} palette - collage 风格的调色板
 * @returns {string} hex 颜色
 */
export function pickBlock(palette) {
  if (!palette.blocks || !palette.blocks.length) return palette.primary;
  return palette.blocks[Math.floor(Math.random() * palette.blocks.length)];
}

/**
 * 把 hex 颜色按 alpha 转 rgba 字符串
 * @param {string} hex
 * @param {number} alpha - 0-1
 * @returns {string}
 */
export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}