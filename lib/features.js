/**
 * 大字封面视觉特征库 v3.0
 * 12 项基础特征,每项一个独立函数
 * 依赖: Canvas 2D API
 * 配套: STYLE_GUIDE_v3.0.md §3
 *
 * 所有函数签名约定:
 *   ctx    : CanvasRenderingContext2D(必须已 beginPath)
 *   坐标   : 像素值,左上角原点
 *   颜色   : '#RRGGBB' 字符串
 *   返回值 : void(直接绘制到 ctx)
 */

// ═══════════ F1. 手绘圈线 ═══════════

/**
 * 绘制不规则椭圆,模拟马克笔/签字笔手绘圈线效果。
 * 典型场景: 手账/便签类封面,圈出关键词,营造手作感。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 椭圆中心 X
 * @param {number} y - 椭圆中心 Y
 * @param {number} w - 椭圆宽
 * @param {number} h - 椭圆高
 * @param {string} color - 描边色(默认 '#5D4E37')
 * @param {number} lineWidth - 描边粗细(默认 3)
 * @returns {void}
 */
export function drawHandDrawnCircle(ctx, x, y, w, h, color = '#5D4E37', lineWidth = 3) {
  const cx = x;
  const cy = y;
  const rx = w / 2;
  const ry = h / 2;
  // 8 个控制点 + 抖动相位(基于 sin 模拟手绘不规则)
  const t = Date.now() * 0.001;
  const jitter = (i) => Math.sin(i * 1.3 + t) * 0.08 + 1.0;
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    pts.push({
      x: cx + Math.cos(a) * rx * jitter(i),
      y: cy + Math.sin(a) * ry * jitter(i + 0.5),
    });
  }
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  // 用二次贝塞尔绘制,3-4 段
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % pts.length];
    const mid = { x: (cur.x + next.x) / 2, y: (cur.y + next.y) / 2 };
    ctx.quadraticCurveTo(cur.x, cur.y, mid.x, mid.y);
  }
  // 末端不闭合:停在中点前 5-10px
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

// ═══════════ F2. 云朵高光 ═══════════

/**
 * 绘制云朵形柔光高光,叠加径向渐变模拟荧光笔涂出。
 * 典型场景: 突出标题/关键词,营造氛围光。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 云朵左上 X
 * @param {number} y - 云朵左上 Y
 * @param {number} w - 云朵宽
 * @param {number} h - 云朵高
 * @param {string} color - 颜色(默认 '#FFFFFF')
 * @param {number} opacity - 不透明度 0-1(默认 0.6)
 * @returns {void}
 */
export function drawCloudHighlight(ctx, x, y, w, h, color = '#FFFFFF', opacity = 0.6) {
  ctx.save();
  // 5 个圆相切组成云朵形状
  const circles = [
    { dx: 0.0, dy: 0.5, r: 0.35 },
    { dx: 0.2, dy: 0.25, r: 0.4 },
    { dx: 0.5, dy: 0.15, r: 0.45 },
    { dx: 0.8, dy: 0.3, r: 0.38 },
    { dx: 1.0, dy: 0.55, r: 0.32 },
  ];
  // 创建径向渐变(中心到边缘 alpha 衰减)
  const grad = ctx.createRadialGradient(
    x + w * 0.5, y + h * 0.4, w * 0.1,
    x + w * 0.5, y + h * 0.4, w * 0.55
  );
  grad.addColorStop(0, hexA(color, opacity));
  grad.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  for (const c of circles) {
    ctx.moveTo(x + c.dx * w + c.r * w, y + c.dy * h);
    ctx.arc(x + c.dx * w, y + c.dy * h, c.r * w, 0, Math.PI * 2);
  }
  ctx.fill();
  // 叠加柔化(再次用大半径渐变)
  const blurGrad = ctx.createRadialGradient(
    x + w * 0.5, y + h * 0.5, w * 0.2,
    x + w * 0.5, y + h * 0.5, w * 0.7
  );
  blurGrad.addColorStop(0, hexA(color, opacity * 0.4));
  blurGrad.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = blurGrad;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// ═══════════ F3. 笔记本/方格纸背景 ═══════════

/**
 * 绘制笔记本/方格纸/横线/点阵背景。
 * 典型场景: 手绘便签风卡片的底色。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - 画布宽
 * @param {number} h - 画布高
 * @param {string} paperType - 'grid' | 'lined' | 'dot' | 'plain'
 * @returns {void}
 */
export function drawNotebookPaper(ctx, w, h, paperType = 'lined') {
  ctx.save();
  if (paperType === 'grid') {
    // 方格纸:垂直+水平细线
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    const step = 24;
    ctx.beginPath();
    for (let x = step; x < w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = step; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  } else if (paperType === 'lined') {
    // 横线便签:顶部 80px 空白,然后等距横线
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    const step = 32;
    ctx.beginPath();
    for (let y = 80; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  } else if (paperType === 'dot') {
    // 点阵便签
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    const step = 20;
    for (let y = step; y < h; y += step) {
      for (let x = step; x < w; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (paperType === 'plain') {
    // 米黄纯色(本身无图案,只是底色填充)
    ctx.fillStyle = '#FDF6E9';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

// ═══════════ F4. 半色调网点 ═══════════

/**
 * 绘制半色调网点(漫画 pop 风核心)。
 * 典型场景: 漫画 pop 风卡片底色,营造漫画/复古印刷感。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 区域左上 X
 * @param {number} y - 区域左上 Y
 * @param {number} w - 区域宽
 * @param {number} h - 区域高
 * @param {string} dotColor - 圆点色(默认 '#000000')
 * @param {number} density - 密度 0.1-1.0(默认 0.5)
 * @returns {void}
 */
export function drawHalftone(ctx, x, y, w, h, dotColor = '#000000', density = 0.5) {
  ctx.save();
  ctx.fillStyle = dotColor;
  const spacing = Math.max(6, 14 - density * 8); // 密度越大,间距越小
  const maxRadius = 1 + density * 3; // 密度越大,圆点越大
  // 用伪随机保证稳定
  const seed = (i, j) => (Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
  for (let j = 0; j * spacing < h; j++) {
    for (let i = 0; i * spacing < w; i++) {
      const r = Math.abs(seed(i, j));
      const radius = 1 + r * maxRadius;
      const px = x + i * spacing + spacing / 2;
      const py = y + j * spacing + spacing / 2;
      ctx.globalAlpha = 0.4 + r * 0.4;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ═══════════ F5. 对话气泡 ═══════════

/**
 * 绘制漫画对话气泡(白底带尾巴)。
 * 典型场景: 漫画 pop 风卡片,放置感叹词/对话。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 气泡左上 X
 * @param {number} y - 气泡左上 Y
 * @param {number} w - 气泡宽
 * @param {number} h - 气泡高
 * @param {string} fillColor - 填充色(默认 '#FFFFFF')
 * @param {string} borderColor - 边框色(默认 '#000000')
 * @param {string} tailDir - 尾巴方向 'left'|'right'|'top'|'bottom'(默认 'bottom')
 * @returns {void}
 */
export function drawSpeechBubble(ctx, x, y, w, h, fillColor = '#FFFFFF', borderColor = '#000000', tailDir = 'bottom') {
  ctx.save();
  const r = Math.min(w, h) * 0.25; // 圆角半径
  // 气泡主体(圆角矩形)
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  // 尾巴
  ctx.beginPath();
  if (tailDir === 'bottom') {
    ctx.moveTo(x + w * 0.3, y + h);
    ctx.lineTo(x + w * 0.25, y + h + h * 0.5);
    ctx.lineTo(x + w * 0.45, y + h);
  } else if (tailDir === 'top') {
    ctx.moveTo(x + w * 0.3, y);
    ctx.lineTo(x + w * 0.25, y - h * 0.5);
    ctx.lineTo(x + w * 0.45, y);
  } else if (tailDir === 'left') {
    ctx.moveTo(x, y + h * 0.3);
    ctx.lineTo(x - w * 0.4, y + h * 0.4);
    ctx.lineTo(x, y + h * 0.5);
  } else if (tailDir === 'right') {
    ctx.moveTo(x + w, y + h * 0.3);
    ctx.lineTo(x + w + w * 0.4, y + h * 0.4);
    ctx.lineTo(x + w, y + h * 0.5);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  // 边框
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  // 整体轮廓:主体 + 尾巴合并描边
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// ═══════════ F6. 荧光笔高亮 ═══════════

/**
 * 绘制荧光笔高亮条(半透明长条色块)。
 * 典型场景: 标记标题中的关键词,营造手写标注感。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 左上 X
 * @param {number} y - 左上 Y
 * @param {number} w - 长条宽
 * @param {number} h - 长条高
 * @param {string} color - 高亮色(默认 '#FFEC47')
 * @returns {void}
 */
export function drawHighlighter(ctx, x, y, w, h, color = '#FFEC47') {
  ctx.save();
  ctx.fillStyle = hexA(color, 0.4);
  // 用 Path 绘制边缘不规则的长条(上下边略带抖动)
  ctx.beginPath();
  const segments = 12;
  ctx.moveTo(x, y);
  for (let i = 1; i <= segments; i++) {
    const px = x + (w * i) / segments;
    const wobble = Math.sin(i * 1.7) * 2;
    ctx.lineTo(px, y + wobble);
  }
  for (let i = segments; i >= 0; i--) {
    const px = x + (w * i) / segments;
    const wobble = Math.sin(i * 1.3 + 0.7) * 2;
    ctx.lineTo(px, y + h + wobble);
  }
  ctx.closePath();
  ctx.fill();
  // 叠加更深一层(alpha 0.25)模拟笔触重叠
  ctx.fillStyle = hexA(color, 0.25);
  ctx.fillRect(x + 2, y + h * 0.15, w - 4, h * 0.7);
  ctx.restore();
}

// ═══════════ F7. 撕边便签 ═══════════

/**
 * 绘制撕边便签纸(边缘不规则锯齿)。
 * 典型场景: 拼贴 collage 风卡片,叠加多张便签。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 左上 X
 * @param {number} y - 左上 Y
 * @param {number} w - 便签宽
 * @param {number} h - 便签高
 * @param {string} paperColor - 便签色(默认 '#FFE082')
 * @returns {void}
 */
export function drawTornNote(ctx, x, y, w, h, paperColor = '#FFE082') {
  ctx.save();
  // 阴影
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = paperColor;
  // 顶部撕边(锯齿)
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  const tearSegments = 18;
  for (let i = 0; i <= tearSegments; i++) {
    const px = x + (w * i) / tearSegments;
    const py = y + (i % 2 === 0 ? 4 : 12) + Math.sin(i * 0.9) * 2;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x + w, y + h - 2);
  ctx.lineTo(x + w - 2, y + h);
  ctx.lineTo(x + 2, y + h);
  ctx.closePath();
  ctx.fill();
  // 关闭阴影
  ctx.shadowColor = 'transparent';
  // 内描边
  ctx.strokeStyle = hexA(paperColor, -0.15); // 微暗边
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// ═══════════ F8. 印章 ═══════════

/**
 * 绘制圆形印章(带粗边框 + 中心文字 + 旋转)。
 * 典型场景: 拼贴/报纸/手绘风,作为差异化招牌。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 印章中心 X
 * @param {number} y - 印章中心 Y
 * @param {number} w - 印章宽(直径)
 * @param {number} h - 印章高(直径)
 * @param {string} text - 印章内文字(2-4 字符)
 * @param {string} color - 印章底色(默认 '#E6213D')
 * @param {number} rotation - 旋转角度(弧度),默认 -10°
 * @returns {void}
 */
export function drawStamp(ctx, x, y, w, h, text, color = '#E6213D', rotation = -10 * Math.PI / 180) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const r = Math.min(w, h) / 2;
  // 阴影
  ctx.shadowColor = hexA(color, 0.35);
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  // 主体圆
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  // 关闭阴影(虚线边框不需要阴影)
  ctx.shadowColor = 'transparent';
  // 虚线边框
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // 中心文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 ${Math.max(11, r * 0.4)}px "Noto Sans SC", "PingFang SC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || 'TOP', 0, 0);
  ctx.restore();
}

// ═══════════ F9. 3D Emoji 大图 ═══════════

/**
 * 绘制放大版 emoji(带柔和白色外发光)。
 * 典型场景: 漫画 pop 风卡片主体,作为视觉锚点。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - emoji 中心 X
 * @param {number} y - emoji 中心 Y
 * @param {number} size - 字号(默认 80px)
 * @param {string} emoji - emoji 字符串(默认 '🔥')
 * @returns {void}
 */
export function drawEmojiSticker(ctx, x, y, size = 80, emoji = '🔥') {
  ctx.save();
  ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // 外发光(模拟 3D)
  ctx.shadowColor = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur = size * 0.15;
  ctx.fillText(emoji, x, y);
  ctx.shadowBlur = 0;
  // 主绘制
  ctx.fillText(emoji, x, y);
  // 底部轻投影
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.04;
  ctx.fillText(emoji, x, y);
  ctx.restore();
}

// ═══════════ F10. 漫画放射线 ═══════════

/**
 * 绘制多角星放射线(漫画爆炸效果)。
 * 典型场景: 漫画 pop 风卡片背景,营造冲击感。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - 中心 X
 * @param {number} cy - 中心 Y
 * @param {number} outerR - 外半径
 * @param {number} innerR - 内半径(默认 outerR * 0.5)
 * @param {number} points - 尖角数(默认 16)
 * @param {string} color - 描边色(默认 '#FFFFFF')
 * @returns {void}
 */
export function drawComicBurst(ctx, cx, cy, outerR, innerR, points = 16, color = '#FFFFFF') {
  ctx.save();
  if (!innerR) innerR = outerR * 0.5;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  // 绘制尖角星
  ctx.beginPath();
  const totalPoints = points * 2;
  for (let i = 0; i < totalPoints; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / totalPoints) * Math.PI * 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  // 绘制放射线(从中心到外尖)
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    ctx.moveTo(cx + Math.cos(a) * innerR * 0.5, cy + Math.sin(a) * innerR * 0.5);
    ctx.lineTo(cx + Math.cos(a) * outerR * 1.05, cy + Math.sin(a) * outerR * 1.05);
  }
  ctx.stroke();
  ctx.restore();
}

// ═══════════ F11. 马克笔字 ═══════════

/**
 * 在已有文字之上叠加 2-3 个偏移版本(alpha 0.15),模拟马克笔涂出/重影。
 * 典型场景: 漫画 pop / 手绘便签,作为主标题文字。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text - 主文字内容
 * @param {number} x - 文字左上 X
 * @param {number} y - 文字基线 Y
 * @param {number} fontSize - 字号
 * @param {string} color - 主文字色
 * @returns {void}
 */
export function drawMarkerText(ctx, text, x, y, fontSize, color = '#000000') {
  ctx.save();
  ctx.font = `900 ${fontSize}px "Noto Sans SC", "PingFang SC", sans-serif`;
  ctx.textBaseline = 'top';
  // 偏移 1:向左上
  ctx.fillStyle = hexA(color, 0.18);
  ctx.fillText(text, x - fontSize * 0.02, y - fontSize * 0.02);
  // 偏移 2:向右下
  ctx.fillStyle = hexA(color, 0.15);
  ctx.fillText(text, x + fontSize * 0.025, y + fontSize * 0.025);
  // 主文字
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ═══════════ F12. 卡通贴纸角色 ═══════════

/**
 * 绘制 6 种内置卡通贴纸角色(SVG Path 简化版,无外部依赖)。
 * 典型场景: 手绘便签 / 拼贴 collage,作为画面角色元素。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} type - 'cat-megaphone'|'alarm-clock'|'thumbs-up'|'sparkle'|'crown'|'lightning'
 * @param {number} x - 角色左上 X
 * @param {number} y - 角色左上 Y
 * @param {number} size - 角色尺寸(默认 80px)
 * @returns {void}
 */
export function drawStickerCharacter(ctx, type, x, y, size = 80) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 80; // 标准化到 80x80 坐标系
  ctx.scale(s, s);
  switch (type) {
    case 'cat-megaphone': {
      // 拿喇叭的猫
      ctx.fillStyle = '#FFD9A8';
      ctx.beginPath();
      ctx.arc(40, 45, 22, 0, Math.PI * 2); // 猫脸
      ctx.fill();
      // 耳朵
      ctx.beginPath();
      ctx.moveTo(20, 30); ctx.lineTo(28, 15); ctx.lineTo(34, 28); ctx.closePath();
      ctx.moveTo(60, 30); ctx.lineTo(52, 15); ctx.lineTo(46, 28); ctx.closePath();
      ctx.fill();
      // 眼睛
      ctx.fillStyle = '#3A3A3A';
      ctx.beginPath(); ctx.arc(32, 45, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(48, 45, 2.5, 0, Math.PI * 2); ctx.fill();
      // 嘴
      ctx.strokeStyle = '#3A3A3A'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(40, 53, 4, 0, Math.PI); ctx.stroke();
      // 喇叭
      ctx.fillStyle = '#E6213D';
      ctx.beginPath();
      ctx.moveTo(58, 45);
      ctx.lineTo(75, 35);
      ctx.lineTo(75, 55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFD95F';
      ctx.beginPath(); ctx.arc(72, 45, 5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'alarm-clock': {
      // 闹钟
      ctx.fillStyle = '#E6213D';
      ctx.beginPath();
      ctx.arc(40, 45, 25, 0, Math.PI * 2); // 表盘
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(40, 45, 20, 0, Math.PI * 2);
      ctx.fill();
      // 指针
      ctx.strokeStyle = '#3A3A3A'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(40, 45); ctx.lineTo(40, 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, 45); ctx.lineTo(50, 50); ctx.stroke();
      // 顶铃
      ctx.fillStyle = '#E6213D';
      ctx.beginPath(); ctx.arc(30, 18, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(50, 18, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3A3A3A'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(30, 18); ctx.lineTo(40, 25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(50, 18); ctx.lineTo(40, 25); ctx.stroke();
      // 12 3 6 9 标记
      ctx.fillStyle = '#3A3A3A';
      ctx.font = '7px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('12', 40, 30); ctx.fillText('3', 55, 45); ctx.fillText('6', 40, 60); ctx.fillText('9', 25, 45);
      break;
    }
    case 'thumbs-up': {
      // 竖大拇指
      ctx.fillStyle = '#FFD9A8';
      ctx.beginPath();
      ctx.roundRect(25, 30, 30, 35, 5); // 手掌
      ctx.fill();
      // 拇指(竖起)
      ctx.beginPath();
      ctx.roundRect(33, 8, 14, 28, 6);
      ctx.fill();
      // 关节线
      ctx.strokeStyle = '#E0B58A'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(28, 45); ctx.lineTo(52, 45); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(28, 55); ctx.lineTo(52, 55); ctx.stroke();
      // 描边
      ctx.strokeStyle = '#8B6F47'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(25, 30, 30, 35, 5); ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(33, 8, 14, 28, 6); ctx.stroke();
      // 闪光
      ctx.fillStyle = '#FFEC47';
      ctx.beginPath(); ctx.arc(58, 18, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(64, 28, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(18, 22, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'sparkle': {
      // 闪光(4 角星 + 小星)
      ctx.fillStyle = '#FFEC47';
      ctx.beginPath();
      const drawStar = (cx, cy, r) => {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const rr = i % 2 === 0 ? r : r * 0.35;
          const px = cx + Math.cos(a) * rr;
          const py = cy + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
      };
      drawStar(40, 40, 25); ctx.fill();
      drawStar(20, 20, 8); ctx.fill();
      drawStar(62, 60, 10); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(35, 35, 5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'crown': {
      // 王冠
      ctx.fillStyle = '#FFD95F';
      ctx.beginPath();
      ctx.moveTo(15, 60); ctx.lineTo(15, 30); ctx.lineTo(25, 45);
      ctx.lineTo(40, 20); ctx.lineTo(55, 45); ctx.lineTo(65, 30);
      ctx.lineTo(65, 60); ctx.closePath();
      ctx.fill();
      // 宝石
      ctx.fillStyle = '#E6213D';
      ctx.beginPath(); ctx.arc(25, 50, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2677DE';
      ctx.beginPath(); ctx.arc(40, 45, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#88C078';
      ctx.beginPath(); ctx.arc(55, 50, 3, 0, Math.PI * 2); ctx.fill();
      // 描边
      ctx.strokeStyle = '#8B6F47'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(15, 60); ctx.lineTo(15, 30); ctx.lineTo(25, 45);
      ctx.lineTo(40, 20); ctx.lineTo(55, 45); ctx.lineTo(65, 30);
      ctx.lineTo(65, 60); ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'lightning': {
      // 闪电
      ctx.fillStyle = '#FFEC47';
      ctx.beginPath();
      ctx.moveTo(45, 5); ctx.lineTo(20, 42); ctx.lineTo(38, 42);
      ctx.lineTo(30, 75); ctx.lineTo(60, 35); ctx.lineTo(42, 35);
      ctx.lineTo(50, 5); ctx.closePath();
      ctx.fill();
      // 描边
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(45, 5); ctx.lineTo(20, 42); ctx.lineTo(38, 42);
      ctx.lineTo(30, 75); ctx.lineTo(60, 35); ctx.lineTo(42, 35);
      ctx.lineTo(50, 5); ctx.closePath();
      ctx.stroke();
      break;
    }
    default: {
      // fallback: 灰色方块
      ctx.fillStyle = '#A8A098';
      ctx.fillRect(20, 20, 40, 40);
    }
  }
  ctx.restore();
}

// ═══════════ 辅助函数 ═══════════

/**
 * 把 #RRGGBB 转为 rgba 字符串(hexA 内部实现)
 */
function hexA(hex, alpha) {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// ═══════════ 统一导出 ═══════════

export {
  // 重新声明以保持顺序与命名一致
};

// ESM 默认导出检查列表(供外部校验)
export const FEATURE_NAMES = [
  'drawHandDrawnCircle',
  'drawCloudHighlight',
  'drawNotebookPaper',
  'drawHalftone',
  'drawSpeechBubble',
  'drawHighlighter',
  'drawTornNote',
  'drawStamp',
  'drawEmojiSticker',
  'drawComicBurst',
  'drawMarkerText',
  'drawStickerCharacter',
];