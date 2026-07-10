/**
 * 大字封面 Canvas 贴纸库 v5.0
 * ────────────────────────────────
 * 30 个高精度 Canvas 2D 手绘贴纸函数。
 * 所有贴纸在 100×100 逻辑坐标系内绘制,通过 ctx.scale(size/100) 归一化。
 *
 * 函数签名: function drawXxxSticker(ctx, x, y, size, accentColor = '#E6213D')
 *   ctx         : CanvasRenderingContext2D
 *   x, y        : 贴纸中心点(像素)
 *   size        : 贴纸基准尺寸(像素,映射到 100×100 逻辑坐标系)
 *   accentColor : 强调色(用于渐变/高光等)
 */

// ═══════════════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════════════

function hexToRgb(h) {
  const clean = h.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean[0]+clean[0]+clean[1]+clean[1]+clean[2]+clean[2] : clean, 16);
  return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}
function rgba(hex, a) { const {r,g,b}=hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
function lighten(hex, amt) { const {r,g,b}=hexToRgb(hex); const bl=(c)=>Math.min(255,Math.round(c+(255-c)*amt)); return `rgb(${bl(r)},${bl(g)},${bl(b)})`; }
function darken(hex, amt) { const {r,g,b}=hexToRgb(hex); const bl=(c)=>Math.max(0,Math.round(c*(1-amt))); return `rgb(${bl(r)},${bl(g)},${bl(b)})`; }

// ═══════════════════════════════════════════════════════════════
// 第一组: 3D 拟物类 (10 个)
// ═══════════════════════════════════════════════════════════════

/** 1. 增强版 3D 拇指点赞 */
export function drawThumb3Dv2Sticker(ctx, x, y, size, accentColor = '#E6213D') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 投影
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath();
  ctx.ellipse(52, 78, 28, 10, 0, 0, Math.PI*2); ctx.fill();
  // 手掌
  const palmGrad = ctx.createLinearGradient(30, 30, 70, 60);
  palmGrad.addColorStop(0, '#FFE4C4'); palmGrad.addColorStop(0.5, '#FFDAB0'); palmGrad.addColorStop(1, '#F0C898');
  ctx.fillStyle = palmGrad; ctx.beginPath(); ctx.roundRect(28, 28, 44, 42, 8); ctx.fill();
  // 拇指
  const thumbGrad = ctx.createLinearGradient(38, 6, 56, 30);
  thumbGrad.addColorStop(0, '#FFE0B8'); thumbGrad.addColorStop(0.6, '#FFD5A8'); thumbGrad.addColorStop(1, '#E8C090');
  ctx.fillStyle = thumbGrad; ctx.beginPath(); ctx.roundRect(38, 6, 18, 32, 9); ctx.fill();
  // 指节纹路(2条)
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(40, 20); ctx.quadraticCurveTo(48, 19, 54, 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(39, 28); ctx.quadraticCurveTo(48, 27, 55, 28); ctx.stroke();
  // 指甲高光
  const nailGrad = ctx.createLinearGradient(42, 6, 50, 20);
  nailGrad.addColorStop(0, 'rgba(255,255,255,0.7)'); nailGrad.addColorStop(1, 'rgba(255,255,255,0.1)');
  ctx.fillStyle = nailGrad; ctx.beginPath(); ctx.roundRect(42, 7, 10, 14, 6); ctx.fill();
  // 手背高光
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(42, 40, 10, 6, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 2. 3D 喇叭 */
export function drawMegaphone3DSticker(ctx, x, y, size, accentColor = '#E6213D') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 投影
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath();
  ctx.ellipse(50, 72, 26, 8, 0, 0, Math.PI*2); ctx.fill();
  // 手柄(矩形)
  const handleGrad = ctx.createLinearGradient(0, 0, 80, 0);
  handleGrad.addColorStop(0, '#888'); handleGrad.addColorStop(0.5, '#DDD'); handleGrad.addColorStop(1, '#999');
  ctx.fillStyle = handleGrad; ctx.beginPath(); ctx.roundRect(30, 50, 28, 14, 4); ctx.fill();
  // 锥形主体(梯形,用路径绘制)
  const bodyGrad = ctx.createLinearGradient(0, 0, 100, 0);
  bodyGrad.addColorStop(0, '#B8B8B8'); bodyGrad.addColorStop(0.3, '#FFFFFF'); bodyGrad.addColorStop(0.5, '#E0E0E0');
  bodyGrad.addColorStop(0.7, '#C0C0C0'); bodyGrad.addColorStop(1, '#909090');
  ctx.fillStyle = bodyGrad; ctx.beginPath();
  ctx.moveTo(58, 22); ctx.lineTo(92, 16); ctx.lineTo(96, 46); ctx.lineTo(58, 48); ctx.closePath(); ctx.fill();
  // 喇叭口(椭圆)
  const bellGrad = ctx.createRadialGradient(92, 30, 4, 92, 30, 24);
  bellGrad.addColorStop(0, '#FFFFFF'); bellGrad.addColorStop(0.5, '#DDD'); bellGrad.addColorStop(1, '#999');
  ctx.fillStyle = bellGrad; ctx.beginPath(); ctx.ellipse(92, 30, 10, 22, -0.2, 0, Math.PI*2); ctx.fill();
  // 手柄握纹
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1; ctx.beginPath();
  ctx.moveTo(34, 57); ctx.lineTo(54, 57); ctx.moveTo(34, 62); ctx.lineTo(54, 62); ctx.stroke();
  ctx.restore();
}

/** 3. 3D 立体星 */
export function drawStar3DSticker(ctx, x, y, size, accentColor = '#FFD700') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 投影
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath();
  ctx.ellipse(50, 70, 22, 8, 0, 0, Math.PI*2); ctx.fill();
  // 五角星(10个顶点:外5+内5)
  const outerR = 44, innerR = 18;
  const starPts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / 10) * Math.PI*2 - Math.PI/2;
    starPts.push({ x: 50 + Math.cos(a)*r, y: 50 + Math.sin(a)*r });
  }
  // 填充星形(金色渐变)
  const starGrad = ctx.createRadialGradient(42, 38, 5, 50, 50, 50);
  starGrad.addColorStop(0, lighten(accentColor, 0.7));
  starGrad.addColorStop(0.4, accentColor);
  starGrad.addColorStop(1, darken(accentColor, 0.45));
  ctx.fillStyle = starGrad;
  ctx.beginPath(); ctx.moveTo(starPts[0].x, starPts[0].y);
  for (let i = 1; i < starPts.length; i++) ctx.lineTo(starPts[i].x, starPts[i].y);
  ctx.closePath(); ctx.fill();
  // 描边(厚度)
  ctx.strokeStyle = darken(accentColor, 0.5); ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  // 中心高光
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(44, 42, 10, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 4. 3D 立体心 */
export function drawHeart3DSticker(ctx, x, y, size, accentColor = '#ED0108') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 投影
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(50, 72, 18, 7, 0, 0, Math.PI*2); ctx.fill();
  // 心形路径
  function heartPath(ctx, cx, cy, r) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.4);
    ctx.bezierCurveTo(cx - r*1.2, cy - r*0.3, cx - r*0.5, cy - r*0.9, cx, cy - r*0.4);
    ctx.bezierCurveTo(cx + r*0.5, cy - r*0.9, cx + r*1.2, cy - r*0.3, cx, cy + r*0.4);
  }
  // 主体渐变
  const heartGrad = ctx.createRadialGradient(38, 32, 5, 50, 50, 46);
  heartGrad.addColorStop(0, lighten(accentColor, 0.5));
  heartGrad.addColorStop(0.5, accentColor);
  heartGrad.addColorStop(1, darken(accentColor, 0.4));
  heartPath(ctx, 50, 44, 38); ctx.fillStyle = heartGrad; ctx.fill();
  // 描边
  ctx.strokeStyle = darken(accentColor, 0.55); ctx.lineWidth = 2.5; ctx.stroke();
  // 左上高光
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(36, 30, 10, 7, -0.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 5. 3D 火焰 */
export function drawFire3DSticker(ctx, x, y, size, accentColor = '#FF6600') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 外层红色火焰
  const outerPath = (scale) => { ctx.beginPath(); ctx.moveTo(50, 72);
    ctx.bezierCurveTo(20, 50, 10, 20, 50, 4);
    ctx.bezierCurveTo(90, 20, 80, 50, 50, 72); };
  outerPath(1); ctx.fillStyle = 'rgba(237,1,8,0.8)'; ctx.fill();
  // 中层橙色
  ctx.save(); ctx.translate(1, -2); ctx.scale(0.72, 0.72); ctx.translate(50-50*0.72, 50-50*0.72);
  const midPath = () => { ctx.beginPath(); ctx.moveTo(50, 72);
    ctx.bezierCurveTo(28, 52, 22, 28, 50, 10);
    ctx.bezierCurveTo(78, 28, 72, 52, 50, 72); };
  midPath(); ctx.fillStyle = '#FF8C00'; ctx.fill(); ctx.restore();
  // 内层黄色
  ctx.save(); ctx.translate(1, -4); ctx.scale(0.45, 0.45); ctx.translate(50-50*0.45, 50-50*0.45);
  const innerPath = () => { ctx.beginPath(); ctx.moveTo(50, 72);
    ctx.bezierCurveTo(35, 56, 32, 36, 50, 18);
    ctx.bezierCurveTo(68, 36, 65, 56, 50, 72); };
  innerPath(); ctx.fillStyle = '#FFE066'; ctx.fill(); ctx.restore();
  // 蓝色焰心
  ctx.fillStyle = 'rgba(0,150,255,0.45)'; ctx.beginPath(); ctx.arc(50, 58, 10, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 6. 3D 钻石 */
export function drawDiamond3DSticker(ctx, x, y, size, accentColor = '#4A9EFF') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 投影
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(50, 76, 16, 6, 0, 0, Math.PI*2); ctx.fill();
  // 底部三角形
  ctx.beginPath(); ctx.moveTo(50, 74); ctx.lineTo(18, 44); ctx.lineTo(82, 44); ctx.closePath();
  const botGrad = ctx.createLinearGradient(50, 44, 50, 74);
  botGrad.addColorStop(0, 'rgba(180,210,255,0.9)'); botGrad.addColorStop(1, 'rgba(100,150,200,0.95)');
  ctx.fillStyle = botGrad; ctx.fill();
  // 顶部六边形面(简化为菱形+三角)
  ctx.beginPath(); ctx.moveTo(50, 6); ctx.lineTo(35, 28); ctx.lineTo(50, 44); ctx.lineTo(65, 28); ctx.closePath();
  const topGrad = ctx.createLinearGradient(50, 6, 50, 44);
  topGrad.addColorStop(0, '#FFFFFF'); topGrad.addColorStop(0.3, 'rgba(220,235,255,0.95)');
  topGrad.addColorStop(1, 'rgba(160,200,240,0.9)');
  ctx.fillStyle = topGrad; ctx.fill();
  // 侧面切割线
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(50, 44); ctx.lineTo(18, 44); ctx.moveTo(50, 44); ctx.lineTo(82, 44);
  ctx.moveTo(35, 28); ctx.lineTo(18, 44); ctx.moveTo(65, 28); ctx.lineTo(82, 44); ctx.stroke();
  // 顶面高光
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(50, 18, 8, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 7. 3D 王冠 */
export function drawCrown3DSticker(ctx, x, y, size, accentColor = '#FFD700') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(50, 70, 24, 8, 0, 0, Math.PI*2); ctx.fill();
  // 底座
  const baseGrad = ctx.createLinearGradient(0, 54, 0, 72);
  baseGrad.addColorStop(0, lighten(accentColor, 0.4)); baseGrad.addColorStop(1, darken(accentColor, 0.4));
  ctx.fillStyle = baseGrad; ctx.beginPath(); ctx.roundRect(18, 54, 64, 18, 6); ctx.fill();
  // 5个尖角
  const peaks = [22, 30, 50, 70, 78];
  peaks.forEach((px, i) => {
    const grad = ctx.createLinearGradient(px, 14, px, 54);
    grad.addColorStop(0, '#FFFFFF'); grad.addColorStop(0.4, lighten(accentColor, 0.5));
    grad.addColorStop(1, accentColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px - 8, 54); ctx.lineTo(px, 14 + (i === 2 ? -6 : 0)); ctx.lineTo(px + 8, 54); ctx.closePath(); ctx.fill();
  });
  // 中心宝石
  const gemGrad = ctx.createRadialGradient(48, 38, 2, 50, 40, 8);
  gemGrad.addColorStop(0, '#FFFFFF'); gemGrad.addColorStop(0.3, '#FF4444'); gemGrad.addColorStop(1, '#880000');
  ctx.fillStyle = gemGrad; ctx.beginPath(); ctx.ellipse(50, 40, 8, 6, 0, 0, Math.PI*2); ctx.fill();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(47, 37, 3, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 8. 3D 奖杯 */
export function drawTrophy3DSticker(ctx, x, y, size, accentColor = '#FFD700') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(50, 76, 18, 6, 0, 0, Math.PI*2); ctx.fill();
  // 底座(梯形)
  const baseGrad = ctx.createLinearGradient(0, 60, 0, 76);
  baseGrad.addColorStop(0, lighten(accentColor, 0.3)); baseGrad.addColorStop(1, darken(accentColor, 0.3));
  ctx.fillStyle = baseGrad; ctx.beginPath(); ctx.moveTo(28, 60); ctx.lineTo(72, 60);
  ctx.lineTo(64, 76); ctx.lineTo(36, 76); ctx.closePath(); ctx.fill();
  // 杯体(U形)
  const cupGrad = ctx.createRadialGradient(44, 30, 5, 50, 38, 30);
  cupGrad.addColorStop(0, '#FFFFFF'); cupGrad.addColorStop(0.3, lighten(accentColor, 0.5));
  cupGrad.addColorStop(1, accentColor);
  ctx.fillStyle = cupGrad;
  ctx.beginPath(); ctx.moveTo(20, 60); ctx.lineTo(20, 30);
  ctx.bezierCurveTo(20, 10, 80, 10, 80, 30); ctx.lineTo(80, 60); ctx.lineTo(70, 60);
  ctx.lineTo(70, 34); ctx.bezierCurveTo(70, 20, 30, 20, 30, 34); ctx.lineTo(30, 60);
  ctx.closePath(); ctx.fill();
  // 把手(2个半圆)
  ctx.strokeStyle = accentColor; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(18, 42, 9, -Math.PI/2, Math.PI/2); ctx.stroke();
  ctx.beginPath(); ctx.arc(82, 42, 9, Math.PI/2, -Math.PI/2); ctx.stroke();
  // 高光条
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(38, 30, 6, 14, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 9. 3D 气球 */
export function drawBalloon3DSticker(ctx, x, y, size, accentColor = '#ED0108') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  // 绳结
  ctx.beginPath(); ctx.moveTo(48, 66); ctx.lineTo(52, 66); ctx.lineTo(54, 72); ctx.lineTo(46, 72); ctx.closePath();
  ctx.fillStyle = darken(accentColor, 0.4); ctx.fill();
  // 绳子(曲线)
  ctx.strokeStyle = 'rgba(120,120,120,0.7)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(50, 72); ctx.quadraticCurveTo(58, 82, 50, 90); ctx.stroke();
  // 球体
  const balloonGrad = ctx.createRadialGradient(38, 28, 5, 50, 40, 38);
  balloonGrad.addColorStop(0, lighten(accentColor, 0.7)); balloonGrad.addColorStop(0.3, lighten(accentColor, 0.3));
  balloonGrad.addColorStop(0.7, accentColor); balloonGrad.addColorStop(1, darken(accentColor, 0.4));
  ctx.fillStyle = balloonGrad; ctx.beginPath(); ctx.ellipse(50, 36, 30, 36, 0, 0, Math.PI*2); ctx.fill();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(36, 24, 10, 7, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 10. 3D 礼物盒 */
export function drawGiftbox3DSticker(ctx, x, y, size, accentColor = '#ED0108') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(50, 76, 20, 7, 0, 0, Math.PI*2); ctx.fill();
  // 盒体正面
  const frontGrad = ctx.createLinearGradient(0, 38, 0, 72);
  frontGrad.addColorStop(0, accentColor); frontGrad.addColorStop(1, darken(accentColor, 0.3));
  ctx.fillStyle = frontGrad; ctx.beginPath(); ctx.rect(24, 38, 52, 34); ctx.fill();
  // 盒体顶面
  const topGrad = ctx.createLinearGradient(0, 18, 0, 38);
  topGrad.addColorStop(0, lighten(accentColor, 0.5)); topGrad.addColorStop(1, accentColor);
  ctx.fillStyle = topGrad; ctx.beginPath(); ctx.moveTo(20, 30); ctx.lineTo(50, 16); ctx.lineTo(80, 30); ctx.lineTo(76, 38); ctx.lineTo(24, 38); ctx.closePath(); ctx.fill();
  // 十字丝带(竖)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.rect(44, 16, 12, 56); ctx.fill();
  // 十字丝带(横)
  ctx.beginPath(); ctx.rect(24, 48, 52, 10); ctx.fill();
  // 蝴蝶结
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(44, 16, 10, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(56, 16, 10, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,200,50,0.9)'; ctx.beginPath(); ctx.arc(50, 16, 5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 第二组: 文具便签类 (8 个)
// ═══════════════════════════════════════════════════════════════

/** 11. 和纸胶带 */
export function drawWashiTapeSticker(ctx, x, y, size, accentColor = '#F0E5C5') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.rotate(-0.06);
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.roundRect(-20, -6, 92, 16, 3); ctx.fill();
  // 胶带主体(半透明)
  ctx.fillStyle = rgba(accentColor, 0.75); ctx.beginPath(); ctx.roundRect(-22, -8, 94, 16, 3); ctx.fill();
  // 条纹图案(5条)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 0; i < 9; i++) { ctx.moveTo(-14 + i*12, -8); ctx.lineTo(-14 + i*12, 8); } ctx.stroke();
  // 顶部高光
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.roundRect(-22, -8, 94, 4, 2); ctx.fill();
  ctx.restore();
}

/** 12. 便利贴 */
export function drawStickyNoteSticker(ctx, x, y, size, accentColor = '#FFE066') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.roundRect(-32, -28, 64, 60, 4); ctx.fill();
  // 主体
  const grad = ctx.createLinearGradient(0, -30, 0, 32);
  grad.addColorStop(0, lighten(accentColor, 0.2)); grad.addColorStop(1, accentColor);
  ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(-34, -30, 64, 60, 4); ctx.fill();
  // 右下翘角(卷起效果)
  ctx.fillStyle = darken(accentColor, 0.1); ctx.beginPath();
  ctx.moveTo(22, 22); ctx.quadraticCurveTo(30, 10, 34, 18); ctx.lineTo(30, 30); ctx.closePath(); ctx.fill();
  // 横线(3条)
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1; ctx.beginPath();
  ctx.moveTo(-24, -8); ctx.lineTo(16, -8); ctx.moveTo(-24, 2); ctx.lineTo(18, 2); ctx.moveTo(-24, 12); ctx.lineTo(14, 12); ctx.stroke();
  ctx.restore();
}

/** 13. 回形针 */
export function drawPaperClipSticker(ctx, x, y, size, accentColor = '#C0C0C0') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.rotate(0.3);
  // 阴影
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(30, 28); ctx.lineTo(30, 56); ctx.arc(36, 56, 6, Math.PI, 0);
  ctx.lineTo(52, 62); ctx.arc(52, 48, 14, Math.PI/2, -Math.PI/2, true);
  ctx.lineTo(38, 34); ctx.arc(30, 34, 8, 0, Math.PI, true); ctx.stroke();
  // 主体(金属渐变)
  const grad = ctx.createLinearGradient(20, 0, 60, 0);
  grad.addColorStop(0, '#999'); grad.addColorStop(0.5, '#EEE'); grad.addColorStop(1, '#888');
  ctx.strokeStyle = grad; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(30, 28); ctx.lineTo(30, 56); ctx.arc(36, 56, 6, Math.PI, 0);
  ctx.lineTo(52, 62); ctx.arc(52, 48, 14, Math.PI/2, -Math.PI/2, true);
  ctx.lineTo(38, 34); ctx.arc(30, 34, 8, 0, Math.PI, true); ctx.stroke();
  // 高光点
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(52, 42, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 14. 图钉 */
export function drawPushpinSticker(ctx, x, y, size, accentColor = '#ED0108') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(50, 58, 4, 0, Math.PI*2); ctx.fill();
  // 针尖(三角形)
  const needleGrad = ctx.createLinearGradient(0, 46, 0, 64);
  needleGrad.addColorStop(0, '#AAA'); needleGrad.addColorStop(1, '#555');
  ctx.fillStyle = needleGrad; ctx.beginPath(); ctx.moveTo(47, 46); ctx.lineTo(53, 46); ctx.lineTo(50, 64); ctx.closePath(); ctx.fill();
  // 塑料头(圆形)
  const headGrad = ctx.createRadialGradient(42, 30, 5, 50, 40, 22);
  headGrad.addColorStop(0, lighten(accentColor, 0.6)); headGrad.addColorStop(0.5, accentColor);
  headGrad.addColorStop(1, darken(accentColor, 0.3));
  ctx.fillStyle = headGrad;
  ctx.beginPath(); ctx.moveTo(34, 36); ctx.bezierCurveTo(28, 44, 30, 52, 40, 48);
  ctx.lineTo(50, 46); ctx.lineTo(60, 48); ctx.bezierCurveTo(70, 52, 72, 44, 66, 36);
  ctx.bezierCurveTo(58, 28, 42, 28, 34, 36); ctx.closePath(); ctx.fill();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(44, 36, 7, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 15. 红印章 */
export function drawRealisticStampSticker(ctx, x, y, size, accentColor = '#C8252C') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.rotate(-0.22);
  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.arc(52, 52, 38, 0, Math.PI*2); ctx.fill();
  // 不规则边缘圆(12个微扰动)
  ctx.fillStyle = accentColor; ctx.beginPath();
  const pts = 12, baseR = 35;
  for (let i = 0; i < pts*2; i++) {
    const a = (i / (pts*2)) * Math.PI*2;
    const perturbation = (Math.sin(i * 3.7) * 2 + Math.cos(i * 5.1) * 1.5);
    const r = baseR + perturbation;
    const px = 50 + Math.cos(a) * r, py = 50 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  // 白色内虚线边框
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.arc(50, 50, baseR * 0.8, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  // 内部文字
  ctx.fillStyle = '#FFFFFF'; ctx.font = '900 22px "Noto Sans SC","PingFang SC",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HOT', 50, 50);
  ctx.restore();
}

/** 16. 拍立得相框 */
export function drawPolaroidFrameSticker(ctx, x, y, size, accentColor = '#FFFFFF') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.roundRect(-34, -24, 74, 80, 4); ctx.fill();
  // 白框主体
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(-36, -26, 74, 80, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1; ctx.stroke();
  // 内部灰色照片区
  ctx.fillStyle = '#E8E4DF'; ctx.beginPath(); ctx.rect(-28, -18, 58, 48); ctx.fill();
  // 照片区纹理(简单渐变模拟照片)
  const photoGrad = ctx.createLinearGradient(0, -18, 0, 30);
  photoGrad.addColorStop(0, '#D8D4CF'); photoGrad.addColorStop(1, '#C8C4BE');
  ctx.fillStyle = photoGrad; ctx.beginPath(); ctx.rect(-28, -18, 58, 48); ctx.fill();
  // 照片区小太阳
  ctx.fillStyle = '#FFE066'; ctx.beginPath(); ctx.arc(14, -2, 8, 0, Math.PI*2); ctx.fill();
  // 底部宽白边
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.rect(-28, 30, 58, 18); ctx.fill();
  ctx.restore();
}

/** 17. 索引标签贴 */
export function drawIndexTabSticker(ctx, x, y, size, accentColor = '#2677DE') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.roundRect(-24, -10, 52, 32, 6); ctx.fill();
  // 主体(矩形+半圆组合)
  const grad = ctx.createLinearGradient(0, -14, 0, 22);
  grad.addColorStop(0, lighten(accentColor, 0.2)); grad.addColorStop(1, accentColor);
  ctx.fillStyle = grad; ctx.beginPath();
  ctx.moveTo(-18, -14); ctx.lineTo(18, -14); ctx.arc(0, -14, 18, 0, Math.PI, true);
  ctx.lineTo(22, 18); ctx.lineTo(-22, 18); ctx.closePath(); ctx.fill();
  // 白字
  ctx.fillStyle = '#FFFFFF'; ctx.font = '700 16px "Noto Sans SC","PingFang SC",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TAG', 0, 4);
  ctx.restore();
}

/** 18. 长尾夹 */
export function drawBinderClipSticker(ctx, x, y, size, accentColor = '#000000') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.roundRect(-12, 10, 26, 42, 3); ctx.fill();
  // 夹体(黑色金属)
  const bodyGrad = ctx.createLinearGradient(0, -8, 0, 48);
  bodyGrad.addColorStop(0, '#444'); bodyGrad.addColorStop(0.3, '#111'); bodyGrad.addColorStop(0.7, '#222'); bodyGrad.addColorStop(1, '#0A0A0A');
  ctx.fillStyle = bodyGrad; ctx.beginPath(); ctx.roundRect(-14, -8, 28, 56, 5); ctx.fill();
  // 顶部弧线
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -8, 10, Math.PI, 0); ctx.stroke();
  // 银色手柄(2个金属丝)
  const wireGrad = ctx.createLinearGradient(22, 0, 36, 0);
  wireGrad.addColorStop(0, '#888'); wireGrad.addColorStop(0.5, '#DDD'); wireGrad.addColorStop(1, '#999');
  ctx.strokeStyle = wireGrad; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(12, 6); ctx.quadraticCurveTo(30, -2, 34, 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, 30); ctx.quadraticCurveTo(30, 22, 34, 42); ctx.stroke();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.roundRect(-8, -2, 12, 40, 2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 第三组: 涂鸦标注类 (6 个)
// ═══════════════════════════════════════════════════════════════

/** 19. 手绘箭头(曲线+三角形箭头) */
export function drawHandDrawnArrowSticker(ctx, x, y, size, accentColor = '#E6213D') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 箭身(二次贝塞尔曲线,略带抖动)
  const wobble = (t) => Math.sin(t * 12) * 1.5;
  ctx.strokeStyle = accentColor; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-24, 14 + wobble(0));
  ctx.quadraticCurveTo(-8, -20 + wobble(1), 20, -10 + wobble(2));
  ctx.stroke();
  // 箭头(三角形)
  ctx.fillStyle = accentColor;
  ctx.beginPath(); ctx.moveTo(20, -10); ctx.lineTo(8, -2); ctx.lineTo(14, -20); ctx.closePath(); ctx.fill();
  // 微抖动重描
  ctx.strokeStyle = accentColor; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(-23, 15); ctx.quadraticCurveTo(-7, -18, 19, -9); ctx.stroke();
  ctx.restore();
}

/** 20. 手绘下划线(双线+波浪) */
export function drawHandDrawnUnderlineSticker(ctx, x, y, size, accentColor = '#FFEC47') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 上层线(粗,半透明)
  ctx.strokeStyle = rgba(accentColor, 0.45); ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-36, -2);
  for (let xp = -36; xp <= 36; xp += 4) {
    ctx.lineTo(xp, Math.sin(xp * 0.15) * 3);
  }
  ctx.stroke();
  // 下层线(细,深色)
  ctx.strokeStyle = rgba(accentColor, 0.8); ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-36, 6);
  for (let xp = -36; xp <= 36; xp += 3) {
    ctx.lineTo(xp, 6 + Math.sin(xp * 0.2 + 1) * 2);
  }
  ctx.stroke();
  ctx.restore();
}

/** 21. 手绘圈线增强版(双圈+不规则) */
export function drawHandDrawnCirclev2Sticker(ctx, x, y, size, accentColor = '#E6213D') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 外圈(粗,深色)
  const outerPts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const jitter = 1 + (Math.sin(i * 2.3) * 0.06 + Math.cos(i * 3.7) * 0.04);
    outerPts.push({ x: Math.cos(a) * 36 * jitter, y: Math.sin(a) * 28 * jitter });
  }
  ctx.strokeStyle = accentColor; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(outerPts[0].x, outerPts[0].y);
  for (let i = 1; i < outerPts.length; i++) {
    const cur = outerPts[i], next = outerPts[(i+1)%outerPts.length];
    ctx.quadraticCurveTo(cur.x, cur.y, (cur.x+next.x)/2, (cur.y+next.y)/2);
  }
  ctx.stroke();
  // 内圈(细,浅色)
  ctx.strokeStyle = lighten(accentColor, 0.3); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 28, 20, 0.1, 0, Math.PI*1.8); ctx.stroke();
  ctx.restore();
}

/** 22. 涂鸦星星(不规则五角星) */
export function drawDoodleStarSticker(ctx, x, y, size, accentColor = '#FFE066') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 5个尖角,每个微偏移
  const outerR = 36, innerR = 15;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR * (0.92 + (Math.sin(i*3.1)*0.08)) : innerR;
    const a = (i / 10) * Math.PI*2 - Math.PI/2;
    pts.push({ x: Math.cos(a)*r, y: Math.sin(a)*r });
  }
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#000000'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

/** 23. 涂鸦云朵 */
export function drawScribbleCloudSticker(ctx, x, y, size, accentColor = '#FFFFFF') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 5个圆组成云朵
  const circles = [
    { dx: -20, dy: 5, r: 18 }, { dx: 0, dy: -10, r: 24 },
    { dx: 18, dy: 2, r: 20 }, { dx: -8, dy: 14, r: 16 }, { dx: 12, dy: 12, r: 14 },
  ];
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; // 微阴影
  circles.forEach(c => { ctx.beginPath(); ctx.arc(c.dx+2, c.dy+2, c.r, 0, Math.PI*2); ctx.fill(); });
  ctx.fillStyle = accentColor;
  circles.forEach(c => { ctx.beginPath(); ctx.arc(c.dx, c.dy, c.r, 0, Math.PI*2); ctx.fill(); });
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1.5;
  circles.forEach(c => { ctx.beginPath(); ctx.arc(c.dx, c.dy, c.r, 0, Math.PI*2); ctx.stroke(); });
  // 内部"..."
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.font = '700 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('...', 2, 2);
  ctx.restore();
}

/** 24. 马克笔划掉 */
export function drawMarkerStrikeSticker(ctx, x, y, size, accentColor = '#FFEC47') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.rotate(-0.08);
  // 笔触主体(半透明粗线)
  ctx.strokeStyle = rgba(accentColor, 0.55); ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-38, 0); ctx.lineTo(34, -2); ctx.stroke();
  // 两端扩散
  ctx.strokeStyle = rgba(accentColor, 0.35); ctx.lineWidth = 20; ctx.beginPath();
  ctx.moveTo(-38, 0); ctx.lineTo(-28, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(26, -2); ctx.lineTo(36, -2); ctx.stroke();
  // 内层(更深色窄线)
  ctx.strokeStyle = rgba(accentColor, 0.75); ctx.lineWidth = 5; ctx.beginPath();
  ctx.moveTo(-34, 1); ctx.lineTo(30, -1); ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 第四组: 卡哇伊/表情类 (6 个)
// ═══════════════════════════════════════════════════════════════

/** 25. 萌猫脸 */
export function drawCuteCatFaceSticker(ctx, x, y, size, accentColor = '#FFD9A8') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 脸
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.arc(50, 48, 36, 0, Math.PI*2); ctx.fill();
  // 左耳(外)
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.moveTo(20, 28); ctx.lineTo(28, 4); ctx.lineTo(36, 24); ctx.closePath(); ctx.fill();
  // 右耳(外)
  ctx.beginPath(); ctx.moveTo(80, 28); ctx.lineTo(72, 4); ctx.lineTo(64, 24); ctx.closePath(); ctx.fill();
  // 左耳(内粉色)
  ctx.fillStyle = '#FFB8C8'; ctx.beginPath(); ctx.moveTo(24, 28); ctx.lineTo(30, 10); ctx.lineTo(34, 24); ctx.closePath(); ctx.fill();
  // 右耳(内)
  ctx.beginPath(); ctx.moveTo(76, 28); ctx.lineTo(70, 10); ctx.lineTo(66, 24); ctx.closePath(); ctx.fill();
  // 眼睛(大椭圆)
  ctx.fillStyle = '#3A3A3A'; ctx.beginPath(); ctx.ellipse(36, 44, 6, 8, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(64, 44, 6, 8, 0, 0, Math.PI*2); ctx.fill();
  // 眼睛高光
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(38, 40, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(66, 40, 2.5, 0, Math.PI*2); ctx.fill();
  // 鼻子
  ctx.fillStyle = '#FF9E9E'; ctx.beginPath(); ctx.moveTo(50, 52); ctx.lineTo(47, 56); ctx.lineTo(53, 56); ctx.closePath(); ctx.fill();
  // W形嘴
  ctx.strokeStyle = '#3A3A3A'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(42, 58); ctx.quadraticCurveTo(46, 62, 50, 58);
  ctx.quadraticCurveTo(54, 62, 58, 58); ctx.stroke();
  // 胡须(各3条)
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
  [26,22,18].forEach(dx => { ctx.beginPath(); ctx.moveTo(20, 44+(dx-26)*2); ctx.lineTo(dx, 50); ctx.stroke(); });
  [74,78,82].forEach(dx => { ctx.beginPath(); ctx.moveTo(80, 44+(dx-74)*2); ctx.lineTo(dx, 50); ctx.stroke(); });
  ctx.restore();
}

/** 26. 萌狗脸 */
export function drawCuteDogFaceSticker(ctx, x, y, size, accentColor = '#F5D0A0') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 脸(椭圆)
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.ellipse(50, 46, 30, 34, 0, 0, Math.PI*2); ctx.fill();
  // 左垂耳
  ctx.fillStyle = darken(accentColor, 0.2); ctx.beginPath(); ctx.ellipse(18, 38, 14, 22, -0.4, 0, Math.PI*2); ctx.fill();
  // 右垂耳
  ctx.beginPath(); ctx.ellipse(82, 38, 14, 22, 0.4, 0, Math.PI*2); ctx.fill();
  // 眼睛
  ctx.fillStyle = '#2D2A26'; ctx.beginPath(); ctx.arc(38, 40, 5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(62, 40, 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(40, 38, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(64, 38, 2, 0, Math.PI*2); ctx.fill();
  // 鼻子(椭圆)
  ctx.fillStyle = '#3A2E1A'; ctx.beginPath(); ctx.ellipse(50, 52, 7, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(48, 50, 2, 0, Math.PI*2); ctx.fill();
  // 舌头
  ctx.fillStyle = '#FF8888'; ctx.beginPath(); ctx.ellipse(50, 62, 6, 8, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 27. 星星眼 */
export function drawSparkleEyesSticker(ctx, x, y, size, accentColor = '#FFE0EC') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 脸
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.arc(50, 48, 38, 0, Math.PI*2); ctx.fill();
  // 眼睛(超大圆)
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(36, 42, 14, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(64, 42, 14, 0, Math.PI*2); ctx.fill();
  // 星形瞳孔
  function drawStar(cx, cy, r) {
    ctx.fillStyle = '#FFD700'; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = i/10*Math.PI*2-Math.PI/2; const rr = i%2?r*0.35:r;
      const px = cx+Math.cos(a)*rr, py = cy+Math.sin(a)*rr;
      i?ctx.lineTo(px,py):ctx.moveTo(px,py); } ctx.closePath(); ctx.fill();
  }
  drawStar(36, 42, 8); drawStar(64, 42, 8);
  // 小嘴
  ctx.fillStyle = '#FF9E9E'; ctx.beginPath(); ctx.arc(50, 62, 6, 0, Math.PI); ctx.fill();
  // 红晕
  ctx.fillStyle = 'rgba(255,150,150,0.35)'; ctx.beginPath(); ctx.ellipse(22, 54, 8, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(78, 54, 8, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** 28. 生气脸 */
export function drawAngryFaceSticker(ctx, x, y, size, accentColor = '#FFD9A8') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.arc(50, 48, 38, 0, Math.PI*2); ctx.fill();
  // 倒八字眉
  ctx.strokeStyle = '#3A2E1A'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(26, 32); ctx.lineTo(44, 38); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(74, 32); ctx.lineTo(56, 38); ctx.stroke();
  // 小圆眼
  ctx.fillStyle = '#3A3A3A'; ctx.beginPath(); ctx.arc(36, 44, 5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(64, 44, 5, 0, Math.PI*2); ctx.fill();
  // 锯齿嘴
  ctx.fillStyle = '#3A2E1A'; ctx.beginPath(); ctx.moveTo(34, 62);
  ctx.lineTo(40, 58); ctx.lineTo(44, 64); ctx.lineTo(50, 57); ctx.lineTo(56, 64); ctx.lineTo(60, 58); ctx.lineTo(66, 62);
  ctx.lineTo(60, 68); ctx.lineTo(40, 68); ctx.closePath(); ctx.fill();
  // 青筋符号
  ctx.strokeStyle = '#CC4444'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(38, 14); ctx.lineTo(40, 22); ctx.moveTo(44, 12); ctx.lineTo(45, 20); ctx.moveTo(50, 14); ctx.lineTo(50, 22); ctx.stroke();
  ctx.restore();
}

/** 29. 震惊脸 */
export function drawShockedFaceSticker(ctx, x, y, size, accentColor = '#FFE0B0') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.arc(50, 46, 38, 0, Math.PI*2); ctx.fill();
  // 小圆眼
  ctx.fillStyle = '#3A3A3A'; ctx.beginPath(); ctx.arc(38, 38, 4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(62, 38, 4, 0, Math.PI*2); ctx.fill();
  // O形嘴(大圆)
  ctx.fillStyle = '#2D1A0A'; ctx.beginPath(); ctx.arc(50, 58, 12, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8B2020'; ctx.beginPath(); ctx.arc(50, 58, 8, 0, Math.PI*2); ctx.fill();
  // 汗滴(3个蓝色水滴)
  ctx.fillStyle = '#88CCFF'; ctx.beginPath();
  ctx.moveTo(78, 20); ctx.bezierCurveTo(82, 28, 78, 34, 74, 30); ctx.bezierCurveTo(70, 26, 73, 16, 78, 20); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(88, 32); ctx.bezierCurveTo(90, 36, 87, 40, 84, 38); ctx.bezierCurveTo(82, 35, 84, 30, 88, 32); ctx.fill();
  // 小眉
  ctx.strokeStyle = '#3A2E1A'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(30, 28); ctx.lineTo(42, 32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(70, 28); ctx.lineTo(58, 32); ctx.stroke();
  ctx.restore();
}

/** 30. 爱心眼 */
export function drawLoveEyesSticker(ctx, x, y, size, accentColor = '#FFE0EC') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.arc(50, 48, 38, 0, Math.PI*2); ctx.fill();
  // 爱心形眼
  function drawHeartEye(cx, cy, r) {
    ctx.fillStyle = '#FF4444'; ctx.beginPath();
    ctx.moveTo(cx, cy + r*0.35);
    ctx.bezierCurveTo(cx - r*0.8, cy - r*0.1, cx - r*0.3, cy - r*0.7, cx, cy - r*0.25);
    ctx.bezierCurveTo(cx + r*0.3, cy - r*0.7, cx + r*0.8, cy - r*0.1, cx, cy + r*0.35);
    ctx.fill();
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(cx - r*0.2, cy - r*0.3, r*0.22, 0, Math.PI*2); ctx.fill();
  }
  drawHeartEye(36, 40, 12); drawHeartEye(64, 40, 12);
  // 微笑
  ctx.strokeStyle = '#FF8888'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(50, 58, 14, 0.1, Math.PI - 0.1); ctx.stroke();
  // 红晕
  ctx.fillStyle = 'rgba(255,160,160,0.4)'; ctx.beginPath(); ctx.ellipse(20, 54, 8, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(80, 54, 8, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 第五组: 全身角色/食物/植物 (对标小红书贴纸包风格, 线稿+填色) 7 个
// ═══════════════════════════════════════════════════════════════

/** 31. 全身小猫(坐姿,kawaii风格) */
export function drawFullBodyCatSticker(ctx, x, y, size, accentColor = '#FFE0C0') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 身体(圆润椭圆)
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.ellipse(50, 62, 22, 26, 0, 0, Math.PI * 2); ctx.fill();
  // 头(大圆)
  ctx.beginPath(); ctx.arc(50, 28, 24, 0, Math.PI * 2); ctx.fill();
  // 三角耳朵
  ctx.beginPath(); ctx.moveTo(28, 14); ctx.lineTo(34, -6); ctx.lineTo(44, 18); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(72, 14); ctx.lineTo(66, -6); ctx.lineTo(56, 18); ctx.closePath(); ctx.fill();
  // 内耳粉色
  ctx.fillStyle = '#FFC8D8';
  ctx.beginPath(); ctx.moveTo(32, 14); ctx.lineTo(35, 2); ctx.lineTo(40, 18); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(68, 14); ctx.lineTo(65, 2); ctx.lineTo(60, 18); ctx.closePath(); ctx.fill();
  // 大眼睛(kawaii)
  ctx.fillStyle = '#2D2010'; ctx.beginPath(); ctx.arc(38, 26, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(62, 26, 6.5, 0, Math.PI * 2); ctx.fill();
  // 高光(大)
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(40, 23, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(64, 23, 3.5, 0, Math.PI * 2); ctx.fill();
  // 小高光
  ctx.beginPath(); ctx.arc(37, 27, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(61, 27, 1.2, 0, Math.PI * 2); ctx.fill();
  // 小鼻子
  ctx.fillStyle = '#FFB0B0'; ctx.beginPath(); ctx.moveTo(50, 34); ctx.lineTo(47, 37); ctx.lineTo(53, 37); ctx.closePath(); ctx.fill();
  // W嘴
  ctx.strokeStyle = '#8A7060'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(43, 39); ctx.quadraticCurveTo(47, 43, 50, 39);
  ctx.quadraticCurveTo(53, 43, 57, 39); ctx.stroke();
  // 腮红
  ctx.fillStyle = 'rgba(255,160,160,0.45)'; ctx.beginPath(); ctx.ellipse(30, 36, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(70, 36, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  // 前爪
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.ellipse(36, 78, 8, 10, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(64, 78, 8, 10, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/** 32. 全身小狗(站立,kawaii风格) */
export function drawFullBodyDogSticker(ctx, x, y, size, accentColor = '#F5D0A0') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 身体(圆润)
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.ellipse(50, 62, 20, 24, 0, 0, Math.PI * 2); ctx.fill();
  // 头(大)
  ctx.beginPath(); ctx.ellipse(50, 30, 22, 24, 0, 0, Math.PI * 2); ctx.fill();
  // 大眼睛
  ctx.fillStyle = '#2D2010'; ctx.beginPath(); ctx.arc(40, 26, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(60, 26, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(42, 23, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(62, 23, 3, 0, Math.PI * 2); ctx.fill();
  // 大鼻子(狗狗特征)
  ctx.fillStyle = '#4A3020'; ctx.beginPath(); ctx.ellipse(50, 34, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(48, 32, 2, 0, Math.PI * 2); ctx.fill();
  // 舌头
  ctx.fillStyle = '#FF9898'; ctx.beginPath(); ctx.ellipse(50, 42, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
  // 腮红
  ctx.fillStyle = 'rgba(255,160,140,0.4)'; ctx.beginPath(); ctx.ellipse(30, 34, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(70, 34, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  // 短腿
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.ellipse(38, 80, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(62, 80, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/** 33. Q版男孩角色(简约可爱) */
export function drawBoyCharacterSticker(ctx, x, y, size, accentColor = '#FFE8D0') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 身体
  ctx.fillStyle = '#6BB5E0'; ctx.beginPath(); ctx.ellipse(50, 66, 18, 20, 0, 0, Math.PI * 2); ctx.fill();
  // 头
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.arc(50, 30, 22, 0, Math.PI * 2); ctx.fill();
  // 头发
  ctx.fillStyle = '#3A2E1A'; ctx.beginPath(); ctx.ellipse(50, 18, 20, 12, 0, Math.PI, 0); ctx.fill();
  // 大眼睛
  ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.arc(40, 30, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(60, 30, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(42, 28, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(62, 28, 2.2, 0, Math.PI * 2); ctx.fill();
  // 微笑
  ctx.strokeStyle = '#C09070'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(50, 36, 6, 0.1, Math.PI - 0.1); ctx.stroke();
  // 腮红
  ctx.fillStyle = 'rgba(255,150,130,0.35)';
  ctx.beginPath(); ctx.ellipse(30, 34, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(70, 34, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/** 34. Q版女孩角色(简约可爱) */
export function drawGirlCharacterSticker(ctx, x, y, size, accentColor = '#FFE8EE') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 身体(裙子)
  ctx.fillStyle = '#F8B0C8'; ctx.beginPath(); ctx.moveTo(34, 64); ctx.lineTo(22, 84); ctx.lineTo(78, 84); ctx.lineTo(66, 64); ctx.closePath(); ctx.fill();
  // 头
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.arc(50, 28, 22, 0, Math.PI * 2); ctx.fill();
  // 头发(齐刘海+短发)
  ctx.fillStyle = '#5A3020'; ctx.beginPath(); ctx.ellipse(50, 16, 16, 10, 0, Math.PI, 0); ctx.fill();
  // 大眼睛+睫毛
  ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.arc(38, 26, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(62, 26, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(40, 24, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(64, 24, 3, 0, Math.PI * 2); ctx.fill();
  // 微笑
  ctx.strokeStyle = '#E8889A'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(50, 34, 5, 0.1, Math.PI - 0.1); ctx.stroke();
  // 腮红
  ctx.fillStyle = 'rgba(255,160,180,0.4)'; ctx.beginPath(); ctx.ellipse(30, 32, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(70, 32, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/** 35. 咖啡杯 */
export function drawCoffeeCupSticker(ctx, x, y, size, accentColor = '#FFF8F0') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 杯身
  ctx.fillStyle = accentColor; ctx.beginPath(); ctx.moveTo(30, 30); ctx.lineTo(26, 76); ctx.lineTo(74, 76); ctx.lineTo(70, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#C0A880'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(30, 30); ctx.lineTo(26, 76); ctx.lineTo(74, 76); ctx.lineTo(70, 30); ctx.closePath(); ctx.stroke();
  // 把手
  ctx.strokeStyle = '#C0A880'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(74, 44, 10, -0.5, 0.5); ctx.stroke();
  // 热气
  ctx.strokeStyle = 'rgba(180,160,140,0.5)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  [40, 50, 60].forEach(cx => {
    ctx.beginPath(); ctx.moveTo(cx, 26); ctx.quadraticCurveTo(cx - 5, 14, cx + 3, 8); ctx.stroke();
  });
  // 咖啡液面
  ctx.fillStyle = '#6B4226'; ctx.beginPath(); ctx.ellipse(50, 32, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** 36. 小花 */
export function drawFlowerSticker(ctx, x, y, size, accentColor = '#FFE0EC') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  // 花瓣
  const petalColors = ['#FFB8C8', '#FFD0D8', '#FFE0EC', '#FFC8D8', '#FFB0C0'];
  petalColors.forEach((c, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(50 + Math.cos(a) * 16, 50 + Math.sin(a) * 16, 10, 6, a, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(200,120,140,0.4)'; ctx.lineWidth = 1;
    ctx.stroke();
  });
  // 花心
  ctx.fillStyle = '#FFE066'; ctx.beginPath(); ctx.arc(50, 50, 10, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#E8B830'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(50, 50, 10, 0, Math.PI * 2); ctx.stroke();
  // 笑脸
  ctx.fillStyle = '#C08030'; ctx.beginPath(); ctx.arc(47, 47, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(53, 47, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#C08030'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(50, 50, 4, 0.1, Math.PI - 0.1); ctx.stroke();
  // 茎
  ctx.strokeStyle = '#7AB860'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(50, 60); ctx.quadraticCurveTo(44, 74, 38, 82); ctx.stroke();
  // 叶子
  ctx.fillStyle = '#8CC870'; ctx.beginPath(); ctx.ellipse(44, 74, 8, 4, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** 37. 四叶草 */
export function drawCloverSticker(ctx, x, y, size, accentColor = '#7AB860') {
  ctx.save(); ctx.translate(x, y); const s = size / 100; ctx.scale(s, s);
  const leaves = [{dx:0,dy:-10},{dx:10,dy:6},{dx:-10,dy:6},{dx:0,dy:2}];
  leaves.forEach(l => {
    ctx.fillStyle = accentColor; ctx.beginPath(); ctx.arc(50 + l.dx, 46 + l.dy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5A9840'; ctx.lineWidth = 1.2; ctx.stroke();
    // 叶脉
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(50 + l.dx, 46 + l.dy); ctx.lineTo(50 + l.dx, 38 + l.dy); ctx.stroke();
  });
  // 茎
  ctx.strokeStyle = '#6AA050'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(50, 56); ctx.lineTo(50, 84); ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// 贴纸包装器 — 给所有贴纸加白色边框+投影+微旋转("撕下来贴上去"的感觉)
// ═══════════════════════════════════════════════════════════════

/**
 * 将任意贴纸函数包装为"贴纸风格"
 * @param {CanvasRenderingContext2D} ctx
 * @param {Function} drawFn — 原始贴纸绘制函数(ctx, cx, cy, size, accent)
 * @param {number} x, y — 贴纸中心坐标
 * @param {number} size — 贴纸尺寸(px)
 * @param {number} rotation — 旋转角度(度)
 * @param {string} accent — 主题色
 */
export function renderAsSticker(ctx, drawFn, x, y, size, rotation, accent) {
  ctx.save();
  ctx.translate(x, y);
  if (rotation) ctx.rotate(rotation * Math.PI / 180);

  const pad = size * 0.08;
  const totalSize = size + pad * 2;

  // 投影
  ctx.shadowColor = 'rgba(0,0,0,0.14)';
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetX = size * 0.02;
  ctx.shadowOffsetY = size * 0.03;

  // 白色底
  ctx.fillStyle = '#FFFFFF';
  roundRectPath(ctx, -totalSize/2, -totalSize/2, totalSize, totalSize, size * 0.1);
  ctx.fill();

  // 取消投影
  ctx.shadowColor = 'transparent';

  // 内部绘图区域
  ctx.save();
  ctx.beginPath();
  roundRectPath(ctx, -size/2 - 2, -size/2 - 2, size + 4, size + 4, size * 0.08);
  ctx.clip();
  drawFn(ctx, 0, 0, size, accent || '#E6213D');
  ctx.restore();

  // 白色描边
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = pad;
  roundRectPath(ctx, -totalSize/2, -totalSize/2, totalSize, totalSize, size * 0.1);
  ctx.stroke();

  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
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
}
// 暴露到全局, 供 template-renderer.js 等非模块代码使用
window._roundRectPath = roundRectPath;

// ═══════════════════════════════════════════════════════════════
// 导出列表
// ═══════════════════════════════════════════════════════════════

// 暴露到全局,供 template-renderer.js 调用
window.renderAsSticker = renderAsSticker;

export const STICKER_NAMES = [
  'drawThumb3Dv2Sticker','drawMegaphone3DSticker','drawStar3DSticker','drawHeart3DSticker',
  'drawFire3DSticker','drawDiamond3DSticker','drawCrown3DSticker','drawTrophy3DSticker',
  'drawBalloon3DSticker','drawGiftbox3DSticker','drawWashiTapeSticker','drawStickyNoteSticker',
  'drawPaperClipSticker','drawPushpinSticker','drawRealisticStampSticker','drawPolaroidFrameSticker',
  'drawIndexTabSticker','drawBinderClipSticker','drawHandDrawnArrowSticker','drawHandDrawnUnderlineSticker',
  'drawHandDrawnCirclev2Sticker','drawDoodleStarSticker','drawScribbleCloudSticker','drawMarkerStrikeSticker',
  'drawCuteCatFaceSticker','drawCuteDogFaceSticker','drawSparkleEyesSticker','drawAngryFaceSticker',
  'drawShockedFaceSticker','drawLoveEyesSticker',
  'drawFullBodyCatSticker','drawFullBodyDogSticker','drawBoyCharacterSticker','drawGirlCharacterSticker',
  'drawCoffeeCupSticker','drawFlowerSticker','drawCloverSticker',
];
