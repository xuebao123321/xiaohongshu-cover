/**
 * 大字封面阴影工具库 v5.0
 * ────────────────────────────────
 * 10 个 Canvas 2D 阴影模拟函数。Canvas 2D 没有原生多层阴影和内阴影，
 * 所有效果通过多次绘制叠加来模拟。
 *
 * 函数签名约定:
 *   ctx   : CanvasRenderingContext2D
 *   矩形参数: (x, y, w, h) — 左上角坐标 + 宽高
 *   opts  : 可选参数对象,全部有默认值
 *   opts.r : 圆角半径(默认 0,仅影响矩形类函数)
 */

// ═══════════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════════

/**
 * 解析 hex 颜色 + alpha 为 rgba 字符串
 */
function rgba(hex, alpha) {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * 绘制圆角矩形路径(不填充,不描边,仅构建路径)
 */
function roundRectPath(ctx, x, y, w, h, r) {
  if (r <= 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  const cr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + cr, y);
  ctx.lineTo(x + w - cr, y);
  ctx.arcTo(x + w, y, x + w, y + cr, cr);
  ctx.lineTo(x + w, y + h - cr);
  ctx.arcTo(x + w, y + h, x + w - cr, y + h, cr);
  ctx.lineTo(x + cr, y + h);
  ctx.arcTo(x, y + h, x, y + h - cr, cr);
  ctx.lineTo(x, y + cr);
  ctx.arcTo(x, y, x + cr, y, cr);
  ctx.closePath();
}

// ═══════════════════════════════════════════════════════════════
// 1. 软投影 — 多层偏移矩形,alpha 递减 + blur 递增
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制软投影。通过 3-4 层偏移矩形叠加模拟,每层 alpha 递减、blur 递增。
 * 不绘制原始矩形本身,只绘制投影。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 矩形左上 X
 * @param {number} y - 矩形左上 Y
 * @param {number} w - 矩形宽
 * @param {number} h - 矩形高
 * @param {object} [opts]
 * @param {number} [opts.r=0] 圆角半径
 * @param {number} [opts.offsetX=4]
 * @param {number} [opts.offsetY=6]
 * @param {string} [opts.color='#000000']
 * @param {number} [opts.alpha=0.12]
 * @param {number} [opts.blur=8]
 */
export function drawSoftDropShadow(ctx, x, y, w, h, opts = {}) {
  const r = opts.r || 0;
  const ox = opts.offsetX != null ? opts.offsetX : 4;
  const oy = opts.offsetY != null ? opts.offsetY : 6;
  const color = opts.color || '#000000';
  const alpha = opts.alpha != null ? opts.alpha : 0.12;
  const blur = opts.blur != null ? opts.blur : 8;

  ctx.save();
  // 4 层叠加: alpha 从 100%→60%→35%→15%, blur 从 1.0×→1.6×→2.5×→4.0×
  const layers = [
    { a: alpha, b: blur, ox: ox * 1.0, oy: oy * 1.0 },
    { a: alpha * 0.65, b: blur * 1.6, ox: ox * 1.3, oy: oy * 1.4 },
    { a: alpha * 0.35, b: blur * 2.5, ox: ox * 1.7, oy: oy * 1.9 },
    { a: alpha * 0.18, b: blur * 4.0, ox: ox * 2.0, oy: oy * 2.4 },
  ];

  for (const layer of layers) {
    ctx.shadowColor = rgba(color, layer.a);
    ctx.shadowBlur = layer.b;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = rgba(color, layer.a);
    ctx.beginPath();
    roundRectPath(ctx, x + layer.ox, y + layer.oy, w, h, r);
    ctx.fill();
  }

  // 清除阴影设置
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 2. 硬投影 — 单个偏移纯色矩形(无模糊)
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制硬投影。单个偏移纯色矩形,无模糊,模拟锐利阴影。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts]
 * @param {number} [opts.r=0]
 * @param {number} [opts.offsetX=3]
 * @param {number} [opts.offsetY=4]
 * @param {string} [opts.color='#000000']
 * @param {number} [opts.alpha=0.15]
 */
export function drawHardDropShadow(ctx, x, y, w, h, opts = {}) {
  const r = opts.r || 0;
  const ox = opts.offsetX != null ? opts.offsetX : 3;
  const oy = opts.offsetY != null ? opts.offsetY : 4;
  const color = opts.color || '#000000';
  const alpha = opts.alpha != null ? opts.alpha : 0.15;

  ctx.save();
  ctx.fillStyle = rgba(color, alpha);
  ctx.beginPath();
  roundRectPath(ctx, x + ox, y + oy, w, h, r);
  ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 3. 彩色外发光(霓虹效果) — 3 层 blur 递减,颜色向白色过渡
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制彩色外发光。3 层: 外层大 blur + 中 blur + 内层小 blur,
 * 颜色逐渐从 opts.color 过渡到白色,模拟霓虹发光。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts]
 * @param {number} [opts.r=0]
 * @param {string} [opts.color='#00F5FF']
 * @param {number} [opts.spread=20] 最大发光扩散距离
 * @param {number} [opts.intensity=0.8] 发光强度
 */
export function drawColoredGlow(ctx, x, y, w, h, opts = {}) {
  const r = opts.r || 0;
  const color = opts.color || '#00F5FF';
  const spread = opts.spread != null ? opts.spread : 20;
  const intensity = opts.intensity != null ? opts.intensity : 0.8;

  ctx.save();
  // 3 层发光: outer → mid → inner
  const layers = [
    { blur: spread, alpha: intensity * 0.35, mixColor: color },
    { blur: spread * 0.5, alpha: intensity * 0.55, mixColor: color },
    { blur: spread * 0.18, alpha: intensity * 0.75, mixColor: '#FFFFFF' },
  ];

  for (const layer of layers) {
    ctx.shadowColor = rgba(layer.mixColor, layer.alpha);
    ctx.shadowBlur = layer.blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = rgba(layer.mixColor, layer.alpha * 0.3);
    ctx.beginPath();
    roundRectPath(ctx, x, y, w, h, r);
    ctx.fill();
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 4. 内阴影(inset 凹陷效果)
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制内阴影。通过 clip 到矩形区域后在内部四边绘制线性渐变暗条来模拟凹陷。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts]
 * @param {number} [opts.r=0]
 * @param {string} [opts.color='#000000']
 * @param {number} [opts.blur=6] 内阴影宽度
 * @param {number} [opts.alpha=0.3]
 */
export function drawInnerShadow(ctx, x, y, w, h, opts = {}) {
  const r = opts.r || 0;
  const color = opts.color || '#000000';
  const blur = opts.blur != null ? opts.blur : 6;
  const alpha = opts.alpha != null ? opts.alpha : 0.3;

  ctx.save();
  // Clip 到矩形区域
  ctx.beginPath();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.clip();

  const inset = Math.max(1, blur);

  // 顶部内阴影(从上往下渐变: 暗→透明)
  const topGrad = ctx.createLinearGradient(x, y, x, y + inset);
  topGrad.addColorStop(0, rgba(color, alpha));
  topGrad.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = topGrad;
  ctx.fillRect(x, y, w, inset);

  // 底部内阴影(从下往上渐变)
  const botGrad = ctx.createLinearGradient(x, y + h - inset, x, y + h);
  botGrad.addColorStop(0, rgba(color, 0));
  botGrad.addColorStop(1, rgba(color, alpha));
  ctx.fillStyle = botGrad;
  ctx.fillRect(x, y + h - inset, w, inset);

  // 左侧内阴影
  const leftGrad = ctx.createLinearGradient(x, y, x + inset, y);
  leftGrad.addColorStop(0, rgba(color, alpha));
  leftGrad.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = leftGrad;
  ctx.fillRect(x, y, inset, h);

  // 右侧内阴影
  const rightGrad = ctx.createLinearGradient(x + w - inset, y, x + w, y);
  rightGrad.addColorStop(0, rgba(color, 0));
  rightGrad.addColorStop(1, rgba(color, alpha));
  ctx.fillStyle = rightGrad;
  ctx.fillRect(x + w - inset, y, inset, h);

  // 四角叠加(让内阴影在圆角处更自然)
  if (r > 0) {
    const cornerGrad = ctx.createRadialGradient(x + r, y + r, 0, x + r, y + r, r + inset);
    cornerGrad.addColorStop(0, rgba(color, alpha * 0.3));
    cornerGrad.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = cornerGrad;
    ctx.fillRect(x, y, r + inset, r + inset);              // 左上
    ctx.fillRect(x + w - r - inset, y, r + inset, r + inset); // 右上
    ctx.fillRect(x, y + h - r - inset, r + inset, r + inset); // 左下
    ctx.fillRect(x + w - r - inset, y + h - r - inset, r + inset, r + inset); // 右下
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 5. 文字 3D 投影 — N 层偏移,由深到浅
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制文字 3D 投影。将同一文字用偏移颜色绘制 N 层(由深到浅),
 * 最上层用主色绘制文字本体。调用方需在绘制后用主色自行 fillText。
 *
 * 注意: 此函数仅绘制投影层,不绘制文字本体。返回投影占用的偏移量。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text - 文字内容
 * @param {number} x - 文字锚点 X
 * @param {number} y - 文字基线 Y
 * @param {object} [opts]
 * @param {number} [opts.depth=6] 投影层数
 * @param {string} [opts.color='#000000'] 投影颜色
 * @param {number} [opts.alpha=0.2] 每层 alpha
 * @param {string} [opts.direction='bottom-right'] 'bottom-right'|'bottom-left'|'top-right'|'top-left'
 * @param {number} [opts.fontSize=100]
 * @param {string} [opts.fontFamily='"Noto Sans SC",sans-serif']
 * @param {number} [opts.fontWeight=900]
 * @returns {{dx:number, dy:number}} 文字本体的建议偏移(最后一层到原点)
 */
export function drawText3DShadow(ctx, text, x, y, opts = {}) {
  const depth = opts.depth != null ? opts.depth : 6;
  const color = opts.color || '#000000';
  const alpha = opts.alpha != null ? opts.alpha : 0.2;
  const direction = opts.direction || 'bottom-right';
  const fontSize = opts.fontSize || 100;
  const fontFamily = opts.fontFamily || '"Noto Sans SC","PingFang SC",sans-serif';
  const fontWeight = opts.fontWeight || 900;

  // 确定每层偏移方向
  const dirMap = {
    'bottom-right': { dx: 1, dy: 1 },
    'bottom-left': { dx: -1, dy: 1 },
    'top-right': { dx: 1, dy: -1 },
    'top-left': { dx: -1, dy: -1 },
  };
  const { dx, dy } = dirMap[direction] || dirMap['bottom-right'];

  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  // 从最深层(最浅)到最浅层(最深)绘制 N 层
  for (let i = depth; i >= 1; i--) {
    const layerAlpha = alpha * (1 - (i - 1) / depth) * (i / depth);
    const offsetX = dx * i * 1.2;
    const offsetY = dy * i * 1.2;
    ctx.fillStyle = rgba(color, layerAlpha);
    ctx.fillText(text, x + offsetX, y + offsetY);
  }

  ctx.restore();
  return { dx: 0, dy: 0 };
}

// ═══════════════════════════════════════════════════════════════
// 6. 长投影(扁平设计风格)
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制长投影。从矩形边缘向指定角度延伸的长三角形/梯形阴影。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts]
 * @param {number} [opts.r=0]
 * @param {number} [opts.angle=45] 投影角度(度,0=右,90=下)
 * @param {number} [opts.length=300] 投影长度
 * @param {string} [opts.color='#000000']
 * @param {number} [opts.alpha=0.15]
 */
export function drawLongShadow(ctx, x, y, w, h, opts = {}) {
  const r = opts.r || 0;
  const angle = (opts.angle != null ? opts.angle : 45) * Math.PI / 180;
  const length = opts.length != null ? opts.length : 300;
  const color = opts.color || '#000000';
  const alpha = opts.alpha != null ? opts.alpha : 0.15;

  ctx.save();
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // 计算矩形四个角及投影远端
  const corners = [
    { x: x + r, y: y },
    { x: x + w - r, y: y },
    { x: x + w, y: y + r },
    { x: x + w, y: y + h - r },
    { x: x + w - r, y: y + h },
    { x: x + r, y: y + h },
    { x: x, y: y + h - r },
    { x: x, y: y + r },
  ];

  // 找出在投影方向上的"前沿"两点和"后沿"两点
  // 简化: 用矩形边的端点在投影方向上的投影确定阴影区域
  // 更稳健的做法: 将矩形所有角投影,找出最远轮廓

  const projected = corners.map(c => ({
    x: c.x + cos * length,
    y: c.y + sin * length,
  }));

  // 找出最远的两个投影点(它们在矩形上的原点到投影点的连线最靠外)
  // 简化处理: 取矩形的两条与角度相对的边,连接其投影
  // 对于右下方向(angle 45°)阴影:
  //   阴影从矩形的右边和下边延伸

  // 确定哪两条边是"阴影源边"
  const normAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  let edgePoints = [];

  if (normAngle >= 0 && normAngle < Math.PI / 2) {
    // 右下: 源边 = 右边 + 下边
    edgePoints = [
      { x: x + w, y: y + r, px: x + w + cos * length, py: y + r + sin * length },
      { x: x + w, y: y + h - r, px: x + w + cos * length, py: y + h - r + sin * length },
      { x: x + r, y: y + h, px: x + r + cos * length, py: y + h + sin * length },
    ];
  } else if (normAngle >= Math.PI / 2 && normAngle < Math.PI) {
    // 左下
    edgePoints = [
      { x: x, y: y + r, px: x + cos * length, py: y + r + sin * length },
      { x: x, y: y + h - r, px: x + cos * length, py: y + h - r + sin * length },
      { x: x + r, y: y + h, px: x + r + cos * length, py: y + h + sin * length },
    ];
  } else if (normAngle >= Math.PI && normAngle < Math.PI * 1.5) {
    // 左上
    edgePoints = [
      { x: x, y: y + r, px: x + cos * length, py: y + r + sin * length },
      { x: x + r, y: y, px: x + r + cos * length, py: y + sin * length },
      { x: x + w - r, y: y, px: x + w - r + cos * length, py: y + sin * length },
    ];
  } else {
    // 右上
    edgePoints = [
      { x: x + w, y: y + r, px: x + w + cos * length, py: y + r + sin * length },
      { x: x + w - r, y: y, px: x + w - r + cos * length, py: y + sin * length },
      { x: x + r, y: y, px: x + r + cos * length, py: y + sin * length },
    ];
  }

  // 构建阴影多边形
  ctx.fillStyle = rgba(color, alpha);
  ctx.beginPath();
  // 沿矩形边缘顺序 + 投影点
  const allPts = [...edgePoints];
  if (allPts.length >= 2) {
    ctx.moveTo(allPts[0].x, allPts[0].y);
    // 矩形上的源边点
    for (let i = 0; i < allPts.length; i++) {
      ctx.lineTo(allPts[i].x, allPts[i].y);
    }
    // 投影远端(反向连接)
    for (let i = allPts.length - 1; i >= 0; i--) {
      ctx.lineTo(allPts[i].px, allPts[i].py);
    }
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 7. 层叠阴影 — 多组不同偏移+blur 层
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制层叠阴影。使用多组不同偏移和 blur 叠加,模拟纸张厚度。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts]
 * @param {number} [opts.r=0]
 * @param {Array} [opts.layers] 层定义数组 [{offsetX,offsetY,blur,alpha}, ...]
 *   默认 3 层: [浅近, 中等, 深远]
 */
export function drawLayeredShadow(ctx, x, y, w, h, opts = {}) {
  const r = opts.r || 0;
  const layers = opts.layers || [
    { offsetX: 2, offsetY: 2, blur: 4, alpha: 0.08 },
    { offsetX: 6, offsetY: 8, blur: 12, alpha: 0.06 },
    { offsetX: 12, offsetY: 16, blur: 24, alpha: 0.04 },
  ];

  ctx.save();
  for (const layer of layers) {
    ctx.shadowColor = rgba('#000000', layer.alpha || 0.06);
    ctx.shadowBlur = layer.blur || 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = rgba('#000000', (layer.alpha || 0.06) * 0.5);
    ctx.beginPath();
    roundRectPath(ctx, x + (layer.offsetX || 0), y + (layer.offsetY || 0), w, h, r);
    ctx.fill();
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 8. 悬浮阴影 — 中间暗边缘浅
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制悬浮阴影。3 个同心圆角矩形,中心 alpha 最高向外递减,
 * 模拟卡片悬浮在背景上的效果。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts]
 * @param {number} [opts.r=0]
 * @param {number} [opts.elevation=20] 悬浮高度(影响扩散距离)
 * @param {string} [opts.color='#000000']
 * @param {number} [opts.alpha=0.15]
 */
export function drawFloatingShadow(ctx, x, y, w, h, opts = {}) {
  const r = opts.r || 0;
  const elevation = opts.elevation != null ? opts.elevation : 20;
  const color = opts.color || '#000000';
  const alpha = opts.alpha != null ? opts.alpha : 0.15;

  ctx.save();
  // 3 个同心矩形: 内层暗,向外渐淡
  const layers = [
    { inset: elevation * 0.0, blur: elevation * 0.6, a: alpha },
    { inset: elevation * 0.4, blur: elevation * 1.1, a: alpha * 0.55 },
    { inset: elevation * 0.8, blur: elevation * 1.8, a: alpha * 0.22 },
  ];

  for (const layer of layers) {
    const lx = x - layer.inset;
    const ly = y - layer.inset;
    const lw = w + layer.inset * 2;
    const lh = h + layer.inset * 2;
    const lr = r > 0 ? r + layer.inset : 0;

    ctx.shadowColor = rgba(color, layer.a);
    ctx.shadowBlur = layer.blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = rgba(color, layer.a * 0.4);
    ctx.beginPath();
    roundRectPath(ctx, lx, ly, lw, lh, lr);
    ctx.fill();
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 9. 贴纸阴影 — 微偏移 + 小 blur + 稍不规则边缘
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制贴纸阴影。微偏移、小模糊、稍微不规则的矩形边缘(4 个角偏移量微不同),
 * 模拟贴纸/胶带未完全贴合的感觉。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {object} [opts]
 * @param {number} [opts.r=4]
 * @param {string} [opts.color='#000000']
 * @param {number} [opts.alpha=0.12]
 * @param {number} [opts.blur=4]
 */
export function drawStickerShadow(ctx, x, y, w, h, opts = {}) {
  const r = opts.r != null ? opts.r : 4;
  const color = opts.color || '#000000';
  const alpha = opts.alpha != null ? opts.alpha : 0.12;
  const blur = opts.blur != null ? opts.blur : 4;
  const seed = opts.seed || 1;

  // 确定性伪随机
  const pr = (i) => {
    const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // -1 ~ 1
  };

  ctx.save();
  // 3 层叠加,每层四个角的偏移略有不同
  for (let layer = 0; layer < 3; layer++) {
    const layerAlpha = alpha * (0.5 + (1 - layer / 3) * 0.5);
    const layerBlur = blur * (0.5 + layer * 0.5);
    const lx = x + pr(layer * 4) * 2;
    const ly = y + pr(layer * 4 + 1) * 2;
    const lw = w + pr(layer * 4 + 2) * 1.5;
    const lh = h + pr(layer * 4 + 3) * 1.5;

    ctx.shadowColor = rgba(color, layerAlpha);
    ctx.shadowBlur = layerBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = rgba(color, layerAlpha * 0.4);
    ctx.beginPath();
    roundRectPath(ctx, lx, ly, lw, lh, r);
    ctx.fill();
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 10. 环境光遮蔽 — 贴纸与背景交界的径向渐变暗区
// ═══════════════════════════════════════════════════════════════

/**
 * 绘制环境光遮蔽。在指定点周围绘制径向渐变暗区,
 * 模拟贴纸/物体底部与背景接触处的柔和阴影。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 遮蔽中心 X
 * @param {number} y - 遮蔽中心 Y
 * @param {number} radius - 遮蔽半径
 * @param {object} [opts]
 * @param {string} [opts.color='#000000']
 * @param {number} [opts.alpha=0.08] 最大不透明度(中心)
 * @param {number} [opts.spread=1.0] 扩散系数(>1 更集中,<1 更扩散)
 */
export function drawAmbientOcclusion(ctx, x, y, radius, opts = {}) {
  const color = opts.color || '#000000';
  const alpha = opts.alpha != null ? opts.alpha : 0.08;
  const spread = opts.spread != null ? opts.spread : 1.0;
  const r = radius || 80;

  ctx.save();
  const grad = ctx.createRadialGradient(x, y, r * 0.05, x, y, r);
  grad.addColorStop(0, rgba(color, alpha));
  grad.addColorStop(0.4 / spread, rgba(color, alpha * 0.5));
  grad.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 导出列表
// ═══════════════════════════════════════════════════════════════

export const SHADOW_NAMES = [
  'drawSoftDropShadow',
  'drawHardDropShadow',
  'drawColoredGlow',
  'drawInnerShadow',
  'drawText3DShadow',
  'drawLongShadow',
  'drawLayeredShadow',
  'drawFloatingShadow',
  'drawStickerShadow',
  'drawAmbientOcclusion',
];
