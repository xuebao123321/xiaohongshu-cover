/**
 * 大字封面渐变工具库 v5.0
 * ────────────────────────────────
 * 12 个预设渐变生成器函数。每个函数创建并返回 CanvasGradient 对象,
 * 调用方直接 ctx.fillStyle = 返回值 后 fillRect 即可。
 *
 * 函数签名约定:
 *   ctx : CanvasRenderingContext2D (用于 createLinearGradient / createRadialGradient)
 *   返回: CanvasGradient 或 CanvasGradient[] (多渐变叠加时返回数组)
 *   不直接绘制,只返回渐变对象
 */

// ═══════════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════════

/** 确定性伪随机(基于 seed) */
function pseudoRand(a, b, seed) {
  const n = Math.sin(a * 12.9898 + b * 78.233 + seed * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
}

/** 解析 hex 为 {r,g,b} */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** rgba 字符串 */
function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** 把颜色变亮(混合白色) */
function lighten(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const blend = (c) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `rgb(${blend(r)},${blend(g)},${blend(b)})`;
}

/** 把颜色变暗(混合黑色) */
function darken(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const blend = (c) => Math.max(0, Math.round(c * (1 - amount)));
  return `rgb(${blend(r)},${blend(g)},${blend(b)})`;
}

// ═══════════════════════════════════════════════════════════════
// 1. 日落渐变 — 深橙→粉色→紫色 (垂直)
// ═══════════════════════════════════════════════════════════════

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W - 画布宽
 * @param {number} H - 画布高
 * @returns {CanvasGradient} LinearGradient (垂直)
 */
export function createSunsetGradient(ctx, W, H) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#FF6B35');
  grad.addColorStop(0.25, '#FF8C42');
  grad.addColorStop(0.4, '#FF6B9D');
  grad.addColorStop(0.7, '#9B5DE5');
  grad.addColorStop(0.88, '#4A1A6B');
  grad.addColorStop(1, '#1A0A2E');
  return grad;
}

// ═══════════════════════════════════════════════════════════════
// 2. 极光渐变 — 对角线 + 色带弯曲 (seed 微偏移模拟流动)
// ═══════════════════════════════════════════════════════════════

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} [seed=1] 随机种子,让色标位置产生 ±5% 微偏移
 * @returns {CanvasGradient} LinearGradient (对角线)
 */
export function createAuroraGradient(ctx, W, H, seed = 1) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  // 色标位置微偏移(±5%)
  const shift = (pos, i) => Math.max(0, Math.min(1, pos + (pseudoRand(i, 0, seed) - 0.5) * 0.10));

  grad.addColorStop(shift(0, 1), '#88E0EF');
  grad.addColorStop(shift(0.2, 2), '#5CD8A8');
  grad.addColorStop(shift(0.35, 3), '#A8E6CF');
  grad.addColorStop(shift(0.5, 4), '#B967FF');
  grad.addColorStop(shift(0.65, 5), '#D8B0FF');
  grad.addColorStop(shift(0.75, 6), '#FFB7E5');
  grad.addColorStop(shift(0.88, 7), '#3A86FF');
  grad.addColorStop(shift(1, 8), '#1A3A8A');
  return grad;
}

// ═══════════════════════════════════════════════════════════════
// 3. 霓虹发光渐变 — 暗底上方一个水平亮带 (垂直)
// ═══════════════════════════════════════════════════════════════

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @returns {CanvasGradient} LinearGradient (垂直)
 */
export function createNeonGlowGradient(ctx, W, H) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0A0A0A');
  grad.addColorStop(0.35, '#1A0033');
  grad.addColorStop(0.5, '#2D0055');
  grad.addColorStop(0.55, '#FF006E');
  grad.addColorStop(0.58, '#FF4DA6');
  grad.addColorStop(0.6, '#00F5FF');
  grad.addColorStop(0.63, '#66FAFF');
  grad.addColorStop(0.65, '#1A0033');
  grad.addColorStop(0.8, '#0A0A1F');
  grad.addColorStop(1, '#0A0A0A');
  return grad;
}

// ═══════════════════════════════════════════════════════════════
// 4. 金属渐变 — 多色条模拟金属反光 (水平)
// ═══════════════════════════════════════════════════════════════

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {string} [metalType='gold'] 'gold' | 'silver' | 'copper'
 * @returns {CanvasGradient} LinearGradient (水平)
 */
export function createMetallicGradient(ctx, W, H, metalType = 'gold') {
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  const schemes = {
    gold:   ['#8B7536', '#D4AF37', '#FFF8DC', '#D4AF37', '#8B7536', '#C9A030', '#FFF8DC', '#B8942A'],
    silver: ['#888888', '#C0C0C0', '#FFFFFF', '#C0C0C0', '#888888', '#B8B8B8', '#FFFFFF', '#A8A8A8'],
    copper: ['#8B4513', '#B87333', '#FFC89A', '#B87333', '#8B4513', '#A8622A', '#FFC89A', '#9E5820'],
  };
  const stops = schemes[metalType] || schemes.gold;
  stops.forEach((color, i) => {
    grad.addColorStop(i / (stops.length - 1), color);
  });
  return grad;
}

// ═══════════════════════════════════════════════════════════════
// 5. 镀铬渐变 — 高对比度黑白交替条 + 冷色 tint (对角线)
// ═══════════════════════════════════════════════════════════════

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @returns {CanvasGradient} LinearGradient (对角线)
 */
export function createChromeGradient(ctx, W, H) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#777777');
  grad.addColorStop(0.12, '#CCCCCC');
  grad.addColorStop(0.2, '#FFFFFF');
  grad.addColorStop(0.28, '#999999');
  grad.addColorStop(0.38, '#555555');
  grad.addColorStop(0.45, '#AAAAAA');
  grad.addColorStop(0.52, '#EEEEEE');
  grad.addColorStop(0.6, '#FFFFFF');
  grad.addColorStop(0.68, '#888888');
  grad.addColorStop(0.78, '#666666');
  grad.addColorStop(0.88, '#CCCCCC');
  grad.addColorStop(1, '#999999');
  return grad;
}

// ═══════════════════════════════════════════════════════════════
// 6. 玻璃渐变 — 半透明白色 + 顶部高光条 (垂直)
// ═══════════════════════════════════════════════════════════════

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @returns {CanvasGradient} LinearGradient (垂直)
 */
export function createGlassGradient(ctx, W, H) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(255,255,255,0.50)');
  grad.addColorStop(0.08, 'rgba(255,255,255,0.35)');
  grad.addColorStop(0.15, 'rgba(255,255,255,0.05)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.01)');
  grad.addColorStop(0.85, 'rgba(255,255,255,0.02)');
  grad.addColorStop(0.95, 'rgba(255,255,255,0.08)');
  grad.addColorStop(1, 'rgba(255,255,255,0.15)');
  return grad;
}

// ═══════════════════════════════════════════════════════════════
// 7. 粉彩晕染 — 3 个 RadialGradient 叠加 (返回数组)
// ═══════════════════════════════════════════════════════════════

/**
 * 返回 3 个 RadialGradient 的数组,调用方需分别用 fillRect 绘制。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} [seed=1] 随机种子,决定色块位置和颜色
 * @returns {Array<{grad:CanvasGradient, x:number, y:number, r:number}>}
 *   每个元素包含渐变对象和其覆盖范围(用于 fillRect)
 */
export function createPastelWash(ctx, W, H, seed = 1) {
  const palettes = [
    ['rgba(255,200,180,0.10)', 'rgba(255,180,200,0.04)', 'rgba(255,200,180,0)'],
    ['rgba(180,210,255,0.09)', 'rgba(200,220,255,0.04)', 'rgba(180,210,255,0)'],
    ['rgba(255,220,180,0.08)', 'rgba(255,240,200,0.03)', 'rgba(255,220,180,0)'],
    ['rgba(200,240,210,0.08)', 'rgba(220,250,230,0.03)', 'rgba(200,240,210,0)'],
    ['rgba(230,200,255,0.09)', 'rgba(240,220,255,0.04)', 'rgba(230,200,255,0)'],
  ];

  const items = [];
  for (let i = 0; i < 3; i++) {
    const cx = W * (0.15 + pseudoRand(i, 0, seed) * 0.70);
    const cy = H * (0.15 + pseudoRand(i, 1, seed) * 0.70);
    const r = Math.max(W, H) * (0.25 + pseudoRand(i, 2, seed) * 0.35);
    const paletteIdx = Math.floor(pseudoRand(i, 3, seed) * palettes.length);
    const colors = palettes[paletteIdx];

    const grad = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1, colors[2]);

    items.push({ grad, x: cx - r, y: cy - r, w: r * 2, h: r * 2 });
  }
  return items;
}

// ═══════════════════════════════════════════════════════════════
// 8. 双色调 — 经典摄影双色调效果 (垂直)
// ═══════════════════════════════════════════════════════════════

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {string} [preset='blue-pink'] 'blue-pink' | 'red-blue' | 'green-cream' | 'purple-yellow'
 * @returns {CanvasGradient} LinearGradient (垂直)
 */
export function createDuotoneGradient(ctx, W, H, preset = 'blue-pink') {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  const schemes = {
    'blue-pink':    { shadow: '#012FA7', highlight: '#F78DE9' },
    'red-blue':     { shadow: '#ED0108', highlight: '#2677DE' },
    'green-cream':  { shadow: '#1B4D2E', highlight: '#FFF8DC' },
    'purple-yellow':{ shadow: '#4A148C', highlight: '#FFEC47' },
    'teal-orange':  { shadow: '#1A4A4A', highlight: '#FF8C42' },
    'navy-peach':   { shadow: '#1C2850', highlight: '#FFDAB9' },
  };
  const scheme = schemes[preset] || schemes['blue-pink'];
  grad.addColorStop(0, scheme.shadow);
  grad.addColorStop(0.5, scheme.shadow);
  grad.addColorStop(1, scheme.highlight);
  return grad;
}

// ═══════════════════════════════════════════════════════════════
// 9. 径向球体 — 3D 球面高光效果
// ═══════════════════════════════════════════════════════════════

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - 球体中心 X
 * @param {number} cy - 球体中心 Y
 * @param {number} radius - 球体半径
 * @param {string} [color='#4A7AB8'] 球体主色
 * @returns {CanvasGradient} RadialGradient
 */
export function createRadialSphere(ctx, cx, cy, radius, color = '#4A7AB8') {
  // 高光点偏左上
  const hlX = cx - radius * 0.3;
  const hlY = cy - radius * 0.3;
  const grad = ctx.createRadialGradient(hlX, hlY, radius * 0.02, cx, cy, radius);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.15, lighten(color, 0.6));
  grad.addColorStop(0.35, color);
  grad.addColorStop(0.7, darken(color, 0.25));
  grad.addColorStop(1, darken(color, 0.55));
  return grad;
}

// ═══════════════════════════════════════════════════════════════
// 10. 网格渐变 — 4 个 RadialGradient 分布在四象限 (返回数组)
// ═══════════════════════════════════════════════════════════════

/**
 * 返回 4 个 RadialGradient 数组,分布在四个象限叠加产生网格混合效果。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} [seed=1] 随机种子
 * @returns {Array<{grad:CanvasGradient, x:number, y:number, r:number}>}
 */
export function createMeshGradient(ctx, W, H, seed = 1) {
  const palette = ['#FF6B9D', '#4ECDC4', '#FFE066', '#9B5DE5', '#FF8C42'];
  // 四个象限中心
  const centers = [
    { cx: W * 0.18, cy: H * 0.18 },
    { cx: W * 0.82, cy: H * 0.18 },
    { cx: W * 0.18, cy: H * 0.82 },
    { cx: W * 0.82, cy: H * 0.82 },
  ];

  const items = [];
  for (let i = 0; i < 4; i++) {
    const colorIdx = Math.floor(pseudoRand(i, 0, seed) * palette.length);
    const color = palette[colorIdx];
    const { cx, cy } = centers[i];
    // 微偏移
    const ox = (pseudoRand(i, 1, seed) - 0.5) * W * 0.08;
    const oy = (pseudoRand(i, 2, seed) - 0.5) * H * 0.08;
    const r = Math.max(W, H) * (0.35 + pseudoRand(i, 3, seed) * 0.2);

    const grad = ctx.createRadialGradient(cx + ox, cy + oy, r * 0.02, cx + ox, cy + oy, r);
    grad.addColorStop(0, rgba(color, 0.4));
    grad.addColorStop(0.5, rgba(color, 0.12));
    grad.addColorStop(1, rgba(color, 0));

    items.push({ grad, x: cx + ox - r, y: cy + oy - r, w: r * 2, h: r * 2 });
  }
  return items;
}

// ═══════════════════════════════════════════════════════════════
// 11. 暗角渐变 — 中心透明→边缘暗化
// ═══════════════════════════════════════════════════════════════

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} [intensity=0.45] 边缘暗化强度(0-1)
 * @returns {CanvasGradient} RadialGradient
 */
export function createVignetteGradient(ctx, W, H, intensity = 0.45) {
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.sqrt(cx * cx + cy * cy);
  const grad = ctx.createRadialGradient(cx, cy, r * 0.25, cx, cy, r);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0)');
  grad.addColorStop(0.85, rgba('#000000', intensity * 0.6));
  grad.addColorStop(1, rgba('#000000', intensity));
  return grad;
}

// ═══════════════════════════════════════════════════════════════
// 12. 漏光效果 — 画面边缘的彩色光晕 (返回数组)
// ═══════════════════════════════════════════════════════════════

/**
 * 返回 1-2 个 RadialGradient 数组,分布在画面边缘,模拟相机漏光。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} [seed=1] 随机种子
 * @returns {Array<{grad:CanvasGradient, x:number, y:number, r:number}>}
 */
export function createLightLeak(ctx, W, H, seed = 1) {
  const colors = [
    'rgba(255,150,50,0.22)',
    'rgba(255,100,80,0.18)',
    'rgba(255,80,120,0.20)',
    'rgba(255,180,60,0.16)',
  ];
  // 漏光位置在边缘
  const positions = [
    { cx: W * 0.05, cy: H * 0.12 },
    { cx: W * 0.92, cy: H * 0.08 },
    { cx: W * 0.03, cy: H * 0.88 },
    { cx: W * 0.95, cy: H * 0.85 },
  ];

  const count = 1 + Math.floor(pseudoRand(0, 0, seed) * 2); // 1-2 个
  const items = [];
  for (let i = 0; i < count; i++) {
    const posIdx = Math.floor(pseudoRand(i, 0, seed + 10) * positions.length);
    const colorIdx = Math.floor(pseudoRand(i, 1, seed + 10) * colors.length);
    const { cx, cy } = positions[posIdx];
    const r = Math.max(W, H) * (0.3 + pseudoRand(i, 2, seed + 10) * 0.4);

    const grad = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r);
    grad.addColorStop(0, colors[colorIdx]);
    grad.addColorStop(1, 'rgba(255,150,50,0)');

    items.push({ grad, x: cx - r, y: cy - r, w: r * 2, h: r * 2 });
  }
  return items;
}

// ═══════════════════════════════════════════════════════════════
// 导出列表
// ═══════════════════════════════════════════════════════════════

export const GRADIENT_NAMES = [
  'createSunsetGradient',
  'createAuroraGradient',
  'createNeonGlowGradient',
  'createMetallicGradient',
  'createChromeGradient',
  'createGlassGradient',
  'createPastelWash',
  'createDuotoneGradient',
  'createRadialSphere',
  'createMeshGradient',
  'createVignetteGradient',
  'createLightLeak',
];
