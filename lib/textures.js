/**
 * 大字封面纹理函数库 v5.0
 * ────────────────────────────────
 * 20 个 Canvas 2D 纹理绘制函数,模拟纸张/噪点/晕染等效果。
 * 所有函数在已有背景色之上叠加纹理,不覆盖前景文字和贴纸。
 *
 * 函数签名约定:
 *   ctx   : CanvasRenderingContext2D
 *   W, H  : 画布宽高(像素)
 *   opts  : 可选参数对象,全部有默认值
 */

// ═══════════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════════

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * 确定性伪随机(基于坐标,可复现)
 */
function pseudoRand(x, y, seed) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
}

// ═══════════════════════════════════════════════════════════════
// 纸质纹理 (8 个)
// ═══════════════════════════════════════════════════════════════

/**
 * 1. 方格纸 - 垂直+水平细线
 */
export function drawNotebookGrid(ctx, W, H, opts = {}) {
  const spacing = opts.spacing || 24;
  const color = opts.color || 'rgba(0,0,0,0.06)';
  const lineWidth = opts.lineWidth || 1;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let x = spacing; x < W; x += spacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
  }
  for (let y = spacing; y < H; y += spacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * 2. 横线纸 - 顶部留白,等距横线
 */
export function drawNotebookLined(ctx, W, H, opts = {}) {
  const spacing = opts.spacing || 32;
  const color = opts.color || 'rgba(0,0,0,0.08)';
  const topMargin = opts.topMargin || 80;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = topMargin; y < H; y += spacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * 3. 点阵纸 - 均匀分布圆点
 */
export function drawDotGrid(ctx, W, H, opts = {}) {
  const spacing = opts.spacing || 20;
  const color = opts.color || 'rgba(0,0,0,0.12)';
  const radius = opts.radius || 1.2;
  ctx.save();
  ctx.fillStyle = color;
  for (let y = spacing; y < H; y += spacing) {
    for (let x = spacing; x < W; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * 4. 牛皮纸纹理 - 随机短纤维线段 + 微噪点
 */
export function drawKraftPaper(ctx, W, H, opts = {}) {
  const density = opts.density || 1.0;
  const color = opts.color || 'rgba(139,111,71,0.15)';
  const fiberCount = Math.floor(1500 * density);
  const seed = opts.seed || 1;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (let i = 0; i < fiberCount; i++) {
    const x = pseudoRand(i, 0, seed) * W;
    const y = pseudoRand(i, 1, seed) * H;
    const angle = pseudoRand(i, 2, seed) * Math.PI * 2;
    const len = 3 + pseudoRand(i, 3, seed) * 18;
    const alpha = 0.3 + pseudoRand(i, 4, seed) * 0.7;
    ctx.strokeStyle = withAlpha('#8B6F47', alpha * 0.15 * density);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }
  // 微噪点
  ctx.fillStyle = color;
  const dotCount = Math.floor(400 * density);
  for (let i = 0; i < dotCount; i++) {
    const x = pseudoRand(i, 5, seed + 1) * W;
    const y = pseudoRand(i, 6, seed + 1) * H;
    const r = 0.5 + pseudoRand(i, 7, seed + 1) * 2;
    ctx.globalAlpha = 0.2 + pseudoRand(i, 8, seed + 1) * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 5. 宣纸纹理 - 不规则纤维曲线 + 轻微水渍
 */
export function drawRicePaper(ctx, W, H, opts = {}) {
  const fiberCount = opts.fiberCount || 200;
  const stainCount = opts.stainCount || 3;
  const seed = opts.seed || 1;
  ctx.save();
  // 纤维曲线
  ctx.strokeStyle = 'rgba(180,160,140,0.12)';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (let i = 0; i < fiberCount; i++) {
    const startX = pseudoRand(i, 0, seed) * W;
    const startY = pseudoRand(i, 1, seed) * H;
    const cpX = startX + (pseudoRand(i, 2, seed) - 0.5) * 120;
    const cpY = startY + (pseudoRand(i, 3, seed) - 0.5) * 120;
    const endX = startX + (pseudoRand(i, 4, seed) - 0.3) * 80;
    const endY = startY + (pseudoRand(i, 5, seed) - 0.3) * 80;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();
  }
  // 水渍椭圆
  for (let i = 0; i < stainCount; i++) {
    const sx = pseudoRand(i, 6, seed + 10) * W;
    const sy = pseudoRand(i, 7, seed + 10) * H;
    const sr = 40 + pseudoRand(i, 8, seed + 10) * 100;
    const grad = ctx.createRadialGradient(sx, sy, sr * 0.1, sx, sy, sr);
    grad.addColorStop(0, 'rgba(200,180,150,0.06)');
    grad.addColorStop(1, 'rgba(200,180,150,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, sr, sr * (0.5 + pseudoRand(i, 9, seed + 10) * 0.5), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 6. 和纸纹理 - 细纤维网格 + 半透明薄层
 */
export function drawWashiPaper(ctx, W, H, opts = {}) {
  const opacity = opts.opacity || 0.12;
  const seed = opts.seed || 1;
  ctx.save();
  // 水平细纤维
  ctx.strokeStyle = `rgba(200,190,170,${opacity})`;
  ctx.lineWidth = 0.5;
  ctx.lineCap = 'round';
  for (let y = 0; y < H; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y + pseudoRand(0, y, seed) * 3);
    for (let x = 10; x < W; x += 12) {
      ctx.lineTo(x, y + pseudoRand(x, y, seed) * 3);
    }
    ctx.stroke();
  }
  // 垂直线(更稀疏)
  ctx.globalAlpha = 0.5;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x + pseudoRand(x, 0, seed + 1) * 4, 0);
    for (let y = 10; y < H; y += 14) {
      ctx.lineTo(x + pseudoRand(x, y, seed + 1) * 4, y);
    }
    ctx.stroke();
  }
  // 半透明薄层
  ctx.fillStyle = `rgba(255,252,245,${opacity * 0.6})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/**
 * 7. 纸板纹理 - 粗水平纤维条纹 + 微小凹陷
 */
export function drawCardboardTexture(ctx, W, H, opts = {}) {
  const roughness = opts.roughness || 0.7;
  const seed = opts.seed || 1;
  ctx.save();
  // 粗水平条纹
  const stripeSpacing = 8 + (1 - roughness) * 12;
  for (let y = 0; y < H; y += stripeSpacing) {
    const alpha = 0.03 + pseudoRand(0, y, seed) * roughness * 0.12;
    const h = 1 + pseudoRand(0, y, seed + 1) * roughness * 3;
    ctx.fillStyle = `rgba(120,100,70,${alpha})`;
    ctx.fillRect(0, y, W, h);
  }
  // 微小凹陷圆点
  ctx.fillStyle = `rgba(80,60,30,${roughness * 0.08})`;
  const dotCount = Math.floor(200 * roughness);
  for (let i = 0; i < dotCount; i++) {
    const x = pseudoRand(i, 0, seed + 10) * W;
    const y = pseudoRand(i, 1, seed + 10) * H;
    const r = 0.8 + pseudoRand(i, 2, seed + 10) * 2.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 8. 旧纸张 - 边缘暗化(径向渐变) + 随机污渍圆点 + 泛黄叠加层
 */
export function drawVintagePaper(ctx, W, H, opts = {}) {
  const age = opts.age != null ? opts.age : 0.5;
  const seed = opts.seed || 1;
  ctx.save();
  // 边缘暗化(暗角)
  const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.72);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, `rgba(0,0,0,${0.15 + age * 0.3})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  // 泛黄叠加层
  ctx.fillStyle = `rgba(210,180,120,${age * 0.12})`;
  ctx.fillRect(0, 0, W, H);
  // 随机污渍圆点
  const stainCount = Math.floor(30 + age * 50);
  for (let i = 0; i < stainCount; i++) {
    const sx = pseudoRand(i, 0, seed) * W;
    const sy = pseudoRand(i, 1, seed) * H;
    const sr = 3 + pseudoRand(i, 2, seed) * 30 * age;
    const grad = ctx.createRadialGradient(sx, sy, sr * 0.1, sx, sy, sr);
    grad.addColorStop(0, `rgba(160,130,80,${0.02 + age * 0.06})`);
    grad.addColorStop(1, 'rgba(160,130,80,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 特效纹理 (7 个)
// ═══════════════════════════════════════════════════════════════

/**
 * 9. 胶片颗粒 - 随机位置微矩形散点
 */
export function drawFilmGrain(ctx, W, H, opts = {}) {
  const density = opts.density != null ? opts.density : 1.0;
  const color = opts.color || 'rgba(0,0,0,0.06)';
  const size = opts.size || 2;
  const seed = opts.seed || 1;
  const count = Math.floor(800 * density);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = pseudoRand(i, 0, seed) * W;
    const y = pseudoRand(i, 1, seed) * H;
    const s = size * (0.5 + pseudoRand(i, 2, seed));
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

/**
 * 10. 半色调网点(增强版) - 支持圆点/方形,可控直径/间距/透明度
 */
export function drawHalftoneDots(ctx, W, H, opts = {}) {
  const diameter = opts.diameter || 3;
  const spacing = opts.spacing || 10;
  const color = opts.color || '#000000';
  const opacity = opts.opacity != null ? opts.opacity : 0.3;
  const shape = opts.shape || 'circle';
  const seed = opts.seed || 1;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  const step = Math.max(4, spacing);
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const r = (pseudoRand(x, y, seed) * 0.5 + 0.5) * (diameter / 2);
      if (shape === 'square') {
        const s = r * 1.4;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

/**
 * 11. 水彩晕染 - 多个随机位置径向渐变圆叠加
 */
export function drawWatercolorWash(ctx, W, H, opts = {}) {
  const count = opts.count || 4;
  const colors = opts.colors || [
    'rgba(255,200,150,0.08)',
    'rgba(200,220,255,0.06)',
    'rgba(255,220,180,0.07)',
    'rgba(180,220,200,0.05)',
  ];
  const seed = opts.seed || 1;
  ctx.save();
  for (let i = 0; i < count; i++) {
    const cx = pseudoRand(i, 0, seed) * W;
    const cy = pseudoRand(i, 1, seed) * H;
    const r = W * (0.2 + pseudoRand(i, 2, seed) * 0.4);
    const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    const col = colors[i % colors.length];
    grad.addColorStop(0, col);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.restore();
}

/**
 * 12. 墨点飞溅 - 随机大小圆 + 椭圆集群
 */
export function drawInkSplatter(ctx, W, H, opts = {}) {
  const count = opts.count || 30;
  const color = opts.color || 'rgba(0,0,0,0.08)';
  const spread = opts.spread != null ? opts.spread : 0.5;
  const seed = opts.seed || 1;
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    // 主力圆
    const cx = pseudoRand(i, 0, seed) * W;
    const cy = pseudoRand(i, 1, seed) * H;
    const r = 1 + pseudoRand(i, 2, seed) * 12 * spread;
    ctx.beginPath();
    if (pseudoRand(i, 3, seed) > 0.5) {
      // 圆形
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else {
      // 椭圆(飞溅方向)
      const rx = r * (0.4 + pseudoRand(i, 4, seed) * 1.2);
      const ry = r * (0.4 + pseudoRand(i, 5, seed) * 0.6);
      ctx.ellipse(cx, cy, rx, ry, pseudoRand(i, 6, seed) * Math.PI, 0, Math.PI * 2);
    }
    ctx.fill();
    // 有时添加卫星小点
    if (pseudoRand(i, 7, seed) > 0.5) {
      const satellites = Math.floor(pseudoRand(i, 8, seed) * 5);
      for (let s = 0; s < satellites; s++) {
        const angle = pseudoRand(i, 9 + s, seed) * Math.PI * 2;
        const dist = r * (1.2 + pseudoRand(i, 10 + s, seed) * 2.5);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

/**
 * 13. 噪点纹理 - 分块随机填充微矩形(避免 ImageData 性能问题)
 */
export function drawNoiseTexture(ctx, W, H, opts = {}) {
  const density = opts.density != null ? opts.density : 0.5;
  const opacity = opts.opacity != null ? opts.opacity : 0.04;
  const seed = opts.seed || 1;
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${opacity})`;
  const blockSize = 6;
  const cols = Math.ceil(W / blockSize);
  const rows = Math.ceil(H / blockSize);
  const threshold = density;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (pseudoRand(col, row, seed) < threshold) {
        const x = col * blockSize;
        const y = row * blockSize;
        const s = blockSize * (0.5 + pseudoRand(col, row, seed + 1) * 0.5);
        ctx.fillRect(x, y, s, s);
      }
    }
  }
  ctx.restore();
}

/**
 * 14. 扫描线 - 水平条纹模拟 CRT 效果
 */
export function drawScanlines(ctx, W, H, opts = {}) {
  const spacing = opts.spacing || 4;
  const color = opts.color || 'rgba(0,0,0,0.06)';
  const gapColor = opts.gapColor || 'rgba(255,255,255,0.02)';
  ctx.save();
  for (let y = 0; y < H; y += spacing) {
    ctx.fillStyle = color;
    ctx.fillRect(0, y, W, spacing / 2);
    if (spacing > 2) {
      ctx.fillStyle = gapColor;
      ctx.fillRect(0, y + spacing / 2, W, spacing / 2);
    }
  }
  ctx.restore();
}

/**
 * 15. 交叉排线 - 两组 45°/-45° 斜线叠加,素描阴影感
 */
export function drawCrosshatch(ctx, W, H, opts = {}) {
  const spacing = opts.spacing || 8;
  const color = opts.color || 'rgba(0,0,0,0.06)';
  const lineWidth = opts.lineWidth || 1;
  const diagonal = Math.ceil((W + H) / spacing);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  // 45° 线
  ctx.beginPath();
  for (let i = -diagonal; i <= diagonal; i++) {
    const offset = i * spacing;
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + H, H);
  }
  ctx.stroke();
  // -45° 线
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  for (let i = 0; i <= diagonal * 2; i++) {
    const offset = i * spacing;
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset - H, H);
  }
  ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 几何纹理 (5 个)
// ═══════════════════════════════════════════════════════════════

/**
 * 16. 波尔卡圆点 - 均匀网格圆点,可选大小渐变
 */
export function drawPolkaDots(ctx, W, H, opts = {}) {
  const spacing = opts.spacing || 30;
  const radius = opts.radius || 8;
  const color = opts.color || 'rgba(0,0,0,0.1)';
  const gradientSize = opts.gradientSize || false;
  ctx.save();
  ctx.fillStyle = color;
  const cols = Math.ceil(W / spacing);
  const rows = Math.ceil(H / spacing);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing + spacing / 2;
      const y = row * spacing + spacing / 2;
      let r = radius;
      if (gradientSize) {
        const distFromCenter = Math.sqrt((x - W/2) ** 2 + (y - H/2) ** 2) / Math.sqrt((W/2) ** 2 + (H/2) ** 2);
        r = radius * (0.4 + distFromCenter * 1.2);
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * 17. Z 字条纹 - 锯齿形水平条纹
 */
export function drawZigzagStripes(ctx, W, H, opts = {}) {
  const amplitude = opts.amplitude || 15;
  const frequency = opts.frequency || 40;
  const color = opts.color || 'rgba(0,0,0,0.08)';
  const lineWidth = opts.lineWidth || 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let y = 0; y < H; y += frequency) {
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 20) {
      const zigY = y + Math.sin(x * 0.04) * amplitude;
      ctx.lineTo(x, zigY);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * 18. 棋盘格 - 方形交替填充,可选旋转
 */
export function drawCheckerboard(ctx, W, H, opts = {}) {
  const cellSize = opts.cellSize || 40;
  const color1 = opts.color1 || 'rgba(0,0,0,0.06)';
  const color2 = opts.color2 || 'rgba(255,255,255,0.04)';
  const rotation = opts.rotation || 0;
  ctx.save();
  if (rotation) {
    ctx.translate(W / 2, H / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-W / 2, -H / 2);
  }
  const cols = Math.ceil(W / cellSize) + 1;
  const rows = Math.ceil(H / cellSize) + 1;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? color1 : color2;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }
  ctx.restore();
}

/**
 * 19. 同心圆环 - 从画布中心向外扩散的圆环
 */
export function drawConcentricRings(ctx, W, H, opts = {}) {
  const spacing = opts.spacing || 30;
  const color = opts.color || 'rgba(0,0,0,0.06)';
  const lineWidth = opts.lineWidth || 2;
  const centerX = (opts.centerX || 0.5) * W;
  const centerY = (opts.centerY || 0.5) * H;
  const maxR = Math.sqrt(W * W + H * H);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  for (let r = spacing; r < maxR; r += spacing) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 20. 斜条纹 - 指定角度平行线
 */
export function drawDiagonalStripes(ctx, W, H, opts = {}) {
  const angle = opts.angle || 45;
  const spacing = opts.spacing || 20;
  const color = opts.color || 'rgba(0,0,0,0.06)';
  const lineWidth = opts.lineWidth || 2;
  const rad = angle * Math.PI / 180;
  const diagonal = Math.ceil((W + H) / spacing) * 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const dx = Math.cos(rad) * spacing;
  const dy = Math.sin(rad) * spacing;
  for (let i = -diagonal; i <= diagonal; i++) {
    const offset = i * spacing;
    const startX = -H * Math.sin(rad) + offset * Math.cos(rad);
    const startY = H * Math.cos(rad) + offset * Math.sin(rad);
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX + H * Math.sin(rad) * 2, H);
  }
  ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 导出列表(供外部校验)
// ═══════════════════════════════════════════════════════════════

export const TEXTURE_NAMES = [
  'drawNotebookGrid',
  'drawNotebookLined',
  'drawDotGrid',
  'drawKraftPaper',
  'drawRicePaper',
  'drawWashiPaper',
  'drawCardboardTexture',
  'drawVintagePaper',
  'drawFilmGrain',
  'drawHalftoneDots',
  'drawWatercolorWash',
  'drawInkSplatter',
  'drawNoiseTexture',
  'drawScanlines',
  'drawCrosshatch',
  'drawPolkaDots',
  'drawZigzagStripes',
  'drawCheckerboard',
  'drawConcentricRings',
  'drawDiagonalStripes',
];
