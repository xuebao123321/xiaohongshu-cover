/**
 * real-style-center-shapes.js
 * 真实风格族重构 — 中央承载图形库
 *
 * 不少于 40 种中央承载图形，每个真实风格族 ≥ 8 种。
 * 每个 shape 提供 draw()、textSafeArea、decorationSlots。
 * 纯 Canvas 2D API，不依赖图片资源。
 */

// ═══════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════

/** 在 box 内用种子取随机数 */
function shapeRand(seed) {
  let s = (seed || 42) | 0;
  return function () {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

/** 深拷贝 shape 对象（避免引用共享） */
function cloneShape(shape) {
  return {
    ...shape,
    textSafeArea: { ...shape.textSafeArea },
    decorationSlots: [...(shape.decorationSlots || [])],
  };
}

// ═══════════════════════════════════════════════════════════════
// 1. handnote — 手绘便签风 (8种)
// ═══════════════════════════════════════════════════════════════

const handnoteShapes = [
  {
    id: 'lined-note',
    name: '横线便签纸',
    realFamily: 'handnote',
    textSafeArea: { x: 0.10, y: 0.30, w: 0.80, h: 0.46 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topLeft', 'bottomRight', 'aboveTitle'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        // 柔和阴影
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;
        // 米白底色圆角矩形
        const pad = 24;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        const radius = 14;
        ctx.fillStyle = palette.bg ? palette.bg[0] || '#FBFAF4' : '#FBFAF4';
        roundRect(ctx, rx, ry, rw, rh, radius);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        // 浅灰横线
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        const lineSpacing = 30;
        for (let y = ry + 60; y < ry + rh - 40; y += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(rx + 40, y);
          ctx.lineTo(rx + rw - 40, y);
          ctx.stroke();
        }
        // 左边红线（手账风格）
        ctx.strokeStyle = palette.accent || '#E6213D';
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rx + 52, ry + 48);
        ctx.lineTo(rx + 52, ry + rh - 48);
        ctx.stroke();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'grid-note',
    name: '方格便签纸',
    realFamily: 'handnote',
    textSafeArea: { x: 0.10, y: 0.30, w: 0.80, h: 0.46 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topLeft', 'topRight', 'bottomLeft'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        // 阴影
        ctx.shadowColor = 'rgba(0,0,0,0.10)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;
        const pad = 20;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = palette.bg ? (palette.bg[2] || '#FFF8DC') : '#FFF8DC';
        roundRect(ctx, rx, ry, rw, rh, 10);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        // 方格网
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 0.6;
        const gridSize = 25;
        for (let x = rx + 35; x < rx + rw - 30; x += gridSize) {
          for (let y = ry + 35; y < ry + rh - 30; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
          }
        }
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'tape-paper',
    name: '胶带固定纸片',
    realFamily: 'handnote',
    textSafeArea: { x: 0.11, y: 0.32, w: 0.78, h: 0.44 },
    allowRotation: true,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        // 轻微旋转
        const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
        ctx.translate(cx, cy);
        ctx.rotate(((rng() - 0.5) * 4 * Math.PI) / 180);
        ctx.translate(-cx, -cy);
        // 白色纸片
        ctx.shadowColor = 'rgba(0,0,0,0.10)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 3;
        const pad = 16;
        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, box.x - pad, box.y - pad, box.w + pad * 2, box.h + pad * 2, 6);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        // 顶部半透明胶带
        ctx.fillStyle = 'rgba(230, 210, 170, 0.55)';
        const tapeW = box.w + pad * 2 + 40;
        const tapeH = 28;
        const tapeX = box.x - pad - 20;
        const tapeY = box.y - pad - 8;
        ctx.fillRect(tapeX, tapeY, tapeW, tapeH);
        // 胶带边缘小锯齿
        ctx.fillStyle = 'rgba(230, 210, 170, 0.35)';
        for (let i = 0; i < tapeW; i += 6) {
          ctx.fillRect(tapeX + i, tapeY - 2, 3, 4);
        }
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'torn-paper',
    name: '撕边纸片',
    realFamily: 'handnote',
    textSafeArea: { x: 0.12, y: 0.33, w: 0.76, h: 0.42 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topLeft', 'bottomRight'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.10)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 3;
        const pad = 20;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FBFAF4') : '#FBFAF4';
        // 不规则上边缘（撕边效果）
        ctx.beginPath();
        ctx.moveTo(rx, ry + rh);
        ctx.lineTo(rx, ry + 30);
        // 上边缘贝塞尔抖动
        const segments = 10;
        const segW = rw / segments;
        for (let i = 0; i < segments; i++) {
          const sx = rx + i * segW;
          const jitter = (rng() - 0.5) * 16;
          if (i % 2 === 0) {
            ctx.lineTo(sx + segW * 0.5, ry + jitter);
            ctx.lineTo(sx + segW, ry + (rng() - 0.5) * 10);
          } else {
            ctx.quadraticCurveTo(sx + segW * 0.5, ry + jitter - 8, sx + segW, ry + jitter);
          }
        }
        ctx.lineTo(rx + rw, ry + rh);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'curled-corner',
    name: '卷角纸片',
    realFamily: 'handnote',
    textSafeArea: { x: 0.11, y: 0.31, w: 0.78, h: 0.45 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft', 'belowTitle'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 20;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        const cornerSize = 42;
        // 纸片主体
        ctx.shadowColor = 'rgba(0,0,0,0.10)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FBFAF4') : '#FBFAF4';
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + rw - cornerSize, ry);
        ctx.lineTo(rx + rw, ry + cornerSize);
        ctx.lineTo(rx + rw, ry + rh);
        ctx.lineTo(rx, ry + rh);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = 'transparent';
        // 卷角三角形
        ctx.fillStyle = darkenColor(ctx.fillStyle || '#FBFAF4', 0.15);
        ctx.beginPath();
        ctx.moveTo(rx + rw - cornerSize, ry);
        ctx.lineTo(rx + rw, ry + cornerSize);
        ctx.lineTo(rx + rw - cornerSize, ry + cornerSize);
        ctx.closePath();
        ctx.fill();
        // 折痕线
        ctx.strokeStyle = darkenColor(ctx.fillStyle || '#FBFAF4', 0.25);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx + rw - cornerSize, ry);
        ctx.lineTo(rx + rw - cornerSize, ry + cornerSize);
        ctx.lineTo(rx + rw, ry + cornerSize);
        ctx.stroke();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'diary-label',
    name: '手账标签页',
    realFamily: 'handnote',
    textSafeArea: { x: 0.12, y: 0.32, w: 0.76, h: 0.44 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomRight', 'aboveTitle'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;
        const pad = 20;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FBFAF4') : '#FBFAF4';
        roundRect(ctx, rx, ry, rw, rh, 12);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        // 左侧小圆孔
        const holeY = ry + rh / 2;
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(rx + 16, holeY, 5, 0, Math.PI * 2);
        ctx.fill();
        // 标签绳（从圆孔延伸出去）
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(rx + 20, holeY);
        ctx.quadraticCurveTo(rx - 20, holeY - 60, rx - 40, holeY - 100);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'round-note',
    name: '圆角便签',
    realFamily: 'handnote',
    textSafeArea: { x: 0.11, y: 0.31, w: 0.78, h: 0.46 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topLeft', 'bottomRight', 'belowTitle'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.10)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;
        const pad = 22;
        ctx.fillStyle = palette.bg ? (palette.bg[1] || '#FFFFFF') : '#FFFFFF';
        roundRect(ctx, box.x - pad, box.y - pad, box.w + pad * 2, box.h + pad * 2, 36);
        ctx.fill();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'cloud-frame',
    name: '手绘云朵框',
    realFamily: 'handnote',
    textSafeArea: { x: 0.15, y: 0.35, w: 0.70, h: 0.38 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft', 'aroundTitle'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        const pad = 20;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        // 云朵形状：用多个圆弧拼接
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.strokeStyle = palette.accent || '#5D4E37';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        const cx = rx + rw / 2, cy = ry + rh / 2;
        const cloudW = rw * 0.75, cloudH = rh * 0.65;
        // 用贝塞尔曲线画近似云朵
        ctx.moveTo(cx - cloudW / 2, cy);
        ctx.bezierCurveTo(cx - cloudW / 2, cy - cloudH * 0.6, cx - cloudW * 0.2, cy - cloudH * 0.75, cx + cloudW * 0.1, cy - cloudH * 0.55);
        ctx.bezierCurveTo(cx + cloudW * 0.3, cy - cloudH * 0.85, cx + cloudW * 0.6, cy - cloudH * 0.6, cx + cloudW / 2, cy - cloudH * 0.25);
        ctx.bezierCurveTo(cx + cloudW * 0.55, cy + cloudH * 0.1, cx + cloudW * 0.25, cy + cloudH * 0.45, cx, cy + cloudH * 0.35);
        ctx.bezierCurveTo(cx - cloudW * 0.3, cy + cloudH * 0.55, cx - cloudW / 2, cy + cloudH * 0.2, cx - cloudW / 2, cy);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// 2. collage — 拼贴风 (8种)
// ═══════════════════════════════════════════════════════════════

const collageShapes = [
  {
    id: 'tilted-note',
    name: '单张斜放便签',
    realFamily: 'collage',
    textSafeArea: { x: 0.13, y: 0.30, w: 0.74, h: 0.44 },
    allowRotation: true,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft', 'aboveTitle'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
        const angle = (-3 - rng() * 5) * Math.PI / 180;
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.translate(-cx, -cy);
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 6;
        ctx.shadowOffsetY = 5;
        const pad = 18;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFF8DC') : '#FFF8DC';
        roundRect(ctx, box.x - pad, box.y - pad, box.w + pad * 2, box.h + pad * 2, 6);
        ctx.fill();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'triple-stack',
    name: '三层纸片堆叠',
    realFamily: 'collage',
    textSafeArea: { x: 0.12, y: 0.33, w: 0.76, h: 0.42 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft', 'bottomRight'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        const pad = 24;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        // 底层 — 最深色
        ctx.fillStyle = darkenColor(palette.bg ? palette.bg[0] || '#F5E6CF' : '#F5E6CF', 0.1);
        roundRect(ctx, rx + 12, ry + 16, rw, rh, 6);
        ctx.fill();
        // 中层
        ctx.fillStyle = darkenColor(palette.bg ? palette.bg[1] || '#F8ECD8' : '#F8ECD8', 0.05);
        roundRect(ctx, rx + 6, ry + 8, rw, rh, 6);
        ctx.fill();
        // 顶层
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, rx, ry, rw, rh, 6);
        ctx.fill();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'torn-collage',
    name: '撕边拼贴纸',
    realFamily: 'collage',
    textSafeArea: { x: 0.13, y: 0.32, w: 0.74, h: 0.43 },
    allowRotation: true,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft', 'aboveTitle'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 3;
        const pad = 20;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#F5E6CF') : '#F5E6CF';
        // 不规则四边形 + 撕边
        ctx.beginPath();
        ctx.moveTo(rx + (rng() * 10), ry);
        for (let i = 0; i < 8; i++) {
          const sx = rx + (i / 7) * rw;
          const jitter = (i % 2 === 0 ? -1 : 1) * rng() * 10;
          ctx.lineTo(sx, ry + jitter);
        }
        ctx.lineTo(rx + rw + (rng() - 0.5) * 8, ry);
        ctx.lineTo(rx + rw + (rng() - 0.5) * 6, ry + rh);
        ctx.lineTo(rx + (rng() - 0.5) * 8, ry + rh);
        for (let i = 7; i >= 0; i--) {
          const sx = rx + (i / 7) * rw;
          const jitter = (i % 2 === 0 ? 1 : -1) * rng() * 8;
          ctx.lineTo(sx, ry + rh + jitter);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'polaroid',
    name: '拍立得相框',
    realFamily: 'collage',
    textSafeArea: { x: 0.15, y: 0.28, w: 0.70, h: 0.40 },
    allowRotation: true,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft', 'belowTitle'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 16;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;
        // 白色相框
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.shadowColor = 'transparent';
        // 内部照片区（浅灰）
        const photoX = rx + 28, photoY = ry + 20;
        const photoW = rw - 56, photoH = rh - 60;
        ctx.fillStyle = palette.bg ? (palette.bg[2] || '#E8E8E8') : '#E8E8E8';
        ctx.fillRect(photoX, photoY, photoW, photoH);
        // 相框内阴影
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(photoX, photoY, photoW, photoH);
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'ticket',
    name: '票根 ticket',
    realFamily: 'collage',
    textSafeArea: { x: 0.13, y: 0.32, w: 0.74, h: 0.42 },
    allowRotation: true,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 20;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 3;
        // 票根主体
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFF8DC') : '#FFF8DC';
        ctx.beginPath();
        // 左侧半圆切口
        const notchR = 14;
        const notchY1 = ry + rh * 0.3;
        const notchY2 = ry + rh * 0.7;
        ctx.moveTo(rx + notchR, ry);
        ctx.lineTo(rx + rw - notchR, ry);
        ctx.arc(rx + rw - notchR, notchY1, notchR, -Math.PI / 2, Math.PI / 2);
        ctx.arc(rx + rw - notchR, notchY2, notchR, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(rx + notchR, ry + rh);
        ctx.arc(rx + notchR, notchY2, notchR, Math.PI / 2, -Math.PI / 2);
        ctx.arc(rx + notchR, notchY1, notchR, Math.PI / 2, -Math.PI / 2);
        ctx.closePath();
        ctx.fill();
        // 虚线分割
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.moveTo(rx + rw - notchR * 2, ry);
        ctx.lineTo(rx + rw - notchR * 2, ry + rh);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'magazine-cut',
    name: '杂志剪纸块',
    realFamily: 'collage',
    textSafeArea: { x: 0.14, y: 0.33, w: 0.72, h: 0.42 },
    allowRotation: true,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft', 'aboveTitle'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
        ctx.translate(cx, cy);
        ctx.rotate(((rng() - 0.5) * 5 * Math.PI) / 180);
        ctx.translate(-cx, -cy);
        ctx.shadowColor = 'rgba(0,0,0,0.10)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        const pad = 18;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFE5EC') : '#FFE5EC';
        // 5-7 个顶点的随机多边形
        const vertices = 5 + Math.floor(rng() * 3);
        ctx.beginPath();
        for (let i = 0; i < vertices; i++) {
          const angle = (i / vertices) * Math.PI * 2 - Math.PI / 2;
          const vx = cx + Math.cos(angle) * (rw / 2 - 10 + rng() * 20);
          const vy = cy + Math.sin(angle) * (rh / 2 - 10 + rng() * 20);
          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'color-blocks',
    name: '不规则色块拼接',
    realFamily: 'collage',
    textSafeArea: { x: 0.13, y: 0.31, w: 0.74, h: 0.44 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topLeft', 'bottomRight'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        const pad = 20;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        // 2-3 个不同色块拼接
        const colors = [
          palette.accent || '#FF6B6B',
          palette.second || '#2677DE',
          palette.text || '#111111',
        ];
        ctx.globalAlpha = 0.12;
        // 色块1 — 左侧竖条
        ctx.fillStyle = colors[0];
        ctx.fillRect(rx, ry, rw * 0.3, rh);
        // 色块2 — 右上三角
        ctx.fillStyle = colors[1];
        ctx.beginPath();
        ctx.moveTo(rx + rw * 0.5, ry);
        ctx.lineTo(rx + rw, ry);
        ctx.lineTo(rx + rw, ry + rh * 0.5);
        ctx.closePath();
        ctx.fill();
        // 色块3 — 底部横条
        ctx.fillStyle = colors[2];
        ctx.fillRect(rx, ry + rh * 0.78, rw, rh * 0.22);
        ctx.globalAlpha = 1;
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'tape-sticker',
    name: '透明胶带贴纸片',
    realFamily: 'collage',
    textSafeArea: { x: 0.12, y: 0.32, w: 0.76, h: 0.43 },
    allowRotation: true,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft', 'belowTitle'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.10)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;
        const pad = 16;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFF8DC') : '#FFF8DC';
        roundRect(ctx, box.x - pad, box.y - pad, box.w + pad * 2, box.h + pad * 2, 6);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        // 胶带条（不同角度）
        ctx.fillStyle = 'rgba(240, 225, 185, 0.6)';
        ctx.save();
        ctx.translate(box.x + box.w * 0.3, box.y - pad - 4);
        ctx.rotate(-0.12);
        ctx.fillRect(-box.w * 0.5, -14, box.w * 1.1, 26);
        ctx.restore();
        // 第二条胶带
        ctx.fillStyle = 'rgba(225, 210, 175, 0.5)';
        ctx.save();
        ctx.translate(box.x + box.w * 0.6, box.y - pad - 2);
        ctx.rotate(0.08);
        ctx.fillRect(-box.w * 0.4, -12, box.w * 0.9, 22);
        ctx.restore();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// 3. comic — 漫画 pop 风 (8种)
// ═══════════════════════════════════════════════════════════════

const comicShapes = [
  {
    id: 'burst-star',
    name: '爆炸星形框',
    realFamily: 'comic',
    textSafeArea: { x: 0.14, y: 0.30, w: 0.72, h: 0.44 },
    allowRotation: false,
    allowBleed: true,
    decorationSlots: ['aboveTitle', 'belowTitle'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
        const outerRx = box.w / 2 + 10, outerRy = box.h / 2 + 10;
        const spikes = 16;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFE45C') : '#FFE45C';
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
          const angle = (i / spikes) * Math.PI * 2 - Math.PI / 2;
          const isSpike = i % 2 === 0;
          const r = isSpike ? Math.max(outerRx, outerRy) : Math.min(outerRx, outerRy) * 0.7;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'speech-bubble',
    name: '对话气泡',
    realFamily: 'comic',
    textSafeArea: { x: 0.14, y: 0.30, w: 0.72, h: 0.40 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['bottomLeft', 'topRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 16;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        // 椭圆主体 + 下方三角
        ctx.beginPath();
        ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 小三角
        ctx.beginPath();
        const triX = rx + rw * 0.75;
        const triY = ry + rh * 0.92;
        ctx.moveTo(triX - 20, triY);
        ctx.lineTo(triX, triY + 32);
        ctx.lineTo(triX + 20, triY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'cloud-bubble',
    name: '云朵气泡',
    realFamily: 'comic',
    textSafeArea: { x: 0.16, y: 0.33, w: 0.68, h: 0.40 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 16;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 4;
        // 云朵由多个圆叠加而成
        const centerX = rx + rw / 2, centerY = ry + rh / 2;
        const bubbles = [
          { x: centerX, y: centerY, r: rh * 0.35 },
          { x: centerX - rw * 0.25, y: centerY - rh * 0.05, r: rh * 0.28 },
          { x: centerX + rw * 0.25, y: centerY - rh * 0.05, r: rh * 0.28 },
          { x: centerX - rw * 0.15, y: centerY - rh * 0.2, r: rh * 0.22 },
          { x: centerX + rw * 0.15, y: centerY - rh * 0.2, r: rh * 0.22 },
        ];
        for (const b of bubbles) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'jagged-burst',
    name: '锯齿爆炸框',
    realFamily: 'comic',
    textSafeArea: { x: 0.13, y: 0.31, w: 0.74, h: 0.42 },
    allowRotation: false,
    allowBleed: true,
    decorationSlots: ['aboveTitle', 'topLeft', 'topRight'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        const pad = 20;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#ED0108') : '#ED0108';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        // 不规则锯齿多边形
        const teeth = 20;
        ctx.beginPath();
        for (let i = 0; i < teeth; i++) {
          const t = i / teeth;
          const [ex, ey] = pointOnRect(rx, ry, rw, rh, t);
          const jitter = (i % 3 === 0 ? 18 : i % 2 === 0 ? -12 : 8) + rng() * 8;
          const nx = ex + (ex < rx + rw / 2 ? -jitter : jitter) * (t < 0.25 || t > 0.75 ? 1 : 0);
          const ny = ey + jitter * (t >= 0.25 && t <= 0.75 ? 1 : 0);
          if (i === 0) ctx.moveTo(nx, ny);
          else ctx.lineTo(nx, ny);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'circle-comic',
    name: '圆形漫画框',
    realFamily: 'comic',
    textSafeArea: { x: 0.18, y: 0.32, w: 0.64, h: 0.42 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['aboveTitle', 'topRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
        const r = Math.min(box.w, box.h) / 2 + 12;
        // 半色调网点填充
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FF6B9D') : '#FF6B9D';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        // 粗描边
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 7;
        ctx.stroke();
        // 半色调网格点
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        const dotSpacing = 14;
        for (let dx = -r; dx < r; dx += dotSpacing) {
          for (let dy = -r; dy < r; dy += dotSpacing) {
            if (dx * dx + dy * dy < (r - 20) * (r - 20)) {
              ctx.beginPath();
              ctx.arc(cx + dx, cy + dy, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'skewed-action',
    name: '斜切动感框',
    realFamily: 'comic',
    textSafeArea: { x: 0.13, y: 0.30, w: 0.74, h: 0.44 },
    allowRotation: false,
    allowBleed: true,
    decorationSlots: ['topLeft', 'bottomRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 18;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        // 水平倾斜
        ctx.transform(1, 0, -0.12, 1, 40, 0);
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFE45C') : '#FFE45C';
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 5;
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'halftone-circle',
    name: '半色调圆形底',
    realFamily: 'comic',
    textSafeArea: { x: 0.18, y: 0.33, w: 0.64, h: 0.42 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['aboveTitle', 'bottomRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
        const r = Math.min(box.w, box.h) / 2 + 16;
        // 底色圆
        ctx.fillStyle = palette.accent || '#2677DE';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        // 半色调：同心圆行，小圆点从中心向外逐渐变大
        const ringStep = 10;
        for (let radius = 8; radius < r - 10; radius += ringStep) {
          const circumference = 2 * Math.PI * radius;
          const dotCount = Math.floor(circumference / (ringStep * 1.2));
          const dotR = 2 + (radius / r) * 3;
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          for (let i = 0; i < dotCount; i++) {
            const angle = (i / dotCount) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, dotR, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'speedline-box',
    name: '速度线标题框',
    realFamily: 'comic',
    textSafeArea: { x: 0.14, y: 0.30, w: 0.72, h: 0.45 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['aboveTitle', 'topLeft', 'topRight'],
    draw(ctx, box, palette, seed) {
      try {
        const rng = shapeRand(seed);
        ctx.save();
        const pad = 16;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        // 主体矩形
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFFFFF') : '#FFFFFF';
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 3;
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
        // 左右速度线
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 2;
        const lineCount = 12;
        for (let i = 0; i < lineCount; i++) {
          const y = ry + 20 + (rh - 40) * (i / (lineCount - 1));
          const len = 30 + rng() * 50;
          // 左侧线
          ctx.beginPath();
          ctx.moveTo(rx - 4, y);
          ctx.lineTo(rx - 4 - len, y);
          ctx.stroke();
          // 右侧线
          ctx.beginPath();
          ctx.moveTo(rx + rw + 4, y);
          ctx.lineTo(rx + rw + 4 + len, y);
          ctx.stroke();
        }
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// 4. newspaper — 报纸大字风 (8种)
// ═══════════════════════════════════════════════════════════════

const newspaperShapes = [
  {
    id: 'headline-block',
    name: '报纸头版块',
    realFamily: 'newspaper',
    textSafeArea: { x: 0.09, y: 0.26, w: 0.82, h: 0.50 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['bottomLeft', 'topRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 18;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFFFFF') : '#FFFFFF';
        ctx.fillRect(rx, ry, rw, rh);
        // 顶部粗线
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(rx, ry + 2);
        ctx.lineTo(rx + rw, ry + 2);
        ctx.stroke();
        // 顶部细线
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, ry + 10);
        ctx.lineTo(rx + rw, ry + 10);
        ctx.stroke();
        // 底部双线
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx, ry + rh - 10);
        ctx.lineTo(rx + rw, ry + rh - 10);
        ctx.stroke();
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(rx, ry + rh - 4);
        ctx.lineTo(rx + rw, ry + rh - 4);
        ctx.stroke();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'multi-column',
    name: '多栏文字块',
    realFamily: 'newspaper',
    textSafeArea: { x: 0.10, y: 0.28, w: 0.80, h: 0.48 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['bottomLeft', 'bottomRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 16;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFFFFF') : '#FFFFFF';
        ctx.fillRect(rx, ry, rw, rh);
        // 2-3 条竖线
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        const cols = 3;
        for (let c = 1; c < cols; c++) {
          const x = rx + (rw / cols) * c;
          ctx.setLineDash([4, 8]);
          ctx.beginPath();
          ctx.moveTo(x, ry + 16);
          ctx.lineTo(x, ry + rh - 16);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'banner-strip',
    name: '横幅标题条',
    realFamily: 'newspaper',
    textSafeArea: { x: 0.06, y: 0.32, w: 0.88, h: 0.42 },
    allowRotation: false,
    allowBleed: true,
    decorationSlots: ['bottomLeft', 'topRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 12;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        // 横跨画布的矩形条
        ctx.fillStyle = palette.accent || '#2677DE';
        ctx.globalAlpha = 0.12;
        ctx.fillRect(rx, ry, rw, rh);
        ctx.globalAlpha = 1;
        // 上下粗边框
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + rw, ry);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rx, ry + rh);
        ctx.lineTo(rx + rw, ry + rh);
        ctx.stroke();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'split-blocks',
    name: '上下分割色块',
    realFamily: 'newspaper',
    textSafeArea: { x: 0.10, y: 0.27, w: 0.80, h: 0.50 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['bottomLeft', 'topRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 16;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        const splitY = ry + rh * 0.55;
        // 上半色块
        ctx.fillStyle = palette.accent || '#2677DE';
        ctx.globalAlpha = 0.08;
        ctx.fillRect(rx, ry, rw, splitY - ry);
        // 下半色块
        ctx.fillStyle = palette.second || '#22B26B';
        ctx.globalAlpha = 0.06;
        ctx.fillRect(rx, splitY, rw, ry + rh - splitY);
        ctx.globalAlpha = 1;
        // 分割线
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx, splitY);
        ctx.lineTo(rx + rw, splitY);
        ctx.stroke();
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'poster-frame',
    name: '海报边框框',
    realFamily: 'newspaper',
    textSafeArea: { x: 0.14, y: 0.30, w: 0.72, h: 0.46 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topLeft', 'topRight', 'bottomLeft'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 14;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        // 三层嵌套边框
        ctx.strokeStyle = palette.accent || '#B0823B';
        for (let layer = 0; layer < 3; layer++) {
          const inset = layer * 10;
          ctx.lineWidth = layer === 1 ? 3 : 1.5;
          ctx.strokeRect(rx + inset, ry + inset, rw - inset * 2, rh - inset * 2);
        }
        // 四角装饰方块
        ctx.fillStyle = palette.accent || '#B0823B';
        const cornerSize = 14;
        // 左上
        ctx.fillRect(rx + 28, ry + 4, cornerSize, cornerSize);
        // 右上
        ctx.fillRect(rx + rw - 28 - cornerSize, ry + 4, cornerSize, cornerSize);
        // 左下
        ctx.fillRect(rx + 28, ry + rh - 4 - cornerSize, cornerSize, cornerSize);
        // 右下
        ctx.fillRect(rx + rw - 28 - cornerSize, ry + rh - 4 - cornerSize, cornerSize, cornerSize);
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'print-label',
    name: '印刷标签框',
    realFamily: 'newspaper',
    textSafeArea: { x: 0.13, y: 0.31, w: 0.74, h: 0.44 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 18;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFFFFF') : '#FFFFFF';
        roundRect(ctx, rx, ry, rw, rh, 8);
        ctx.fill();
        // 虚线边框
        ctx.strokeStyle = palette.text || '#111111';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 5]);
        roundRect(ctx, rx + 8, ry + 8, rw - 16, rh - 16, 4);
        ctx.stroke();
        ctx.setLineDash([]);
        // 角落小圆点
        ctx.fillStyle = palette.text || '#111111';
        [[rx + 20, ry + 20], [rx + rw - 20, ry + 20], [rx + 20, ry + rh - 20], [rx + rw - 20, ry + rh - 20]]
          .forEach(([dx, dy]) => {
            ctx.beginPath();
            ctx.arc(dx, dy, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'vertical-column',
    name: '竖向栏目框',
    realFamily: 'newspaper',
    textSafeArea: { x: 0.08, y: 0.30, w: 0.84, h: 0.45 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['topRight', 'bottomLeft'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 12;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        // 窄高的竖矩形 + 细边框
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFFFFF') : '#FFFFFF';
        ctx.strokeStyle = 'rgba(0,0,0,0.20)';
        ctx.lineWidth = 1;
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
        // 左侧竖条色带
        ctx.fillStyle = palette.accent || '#2677DE';
        ctx.globalAlpha = 0.15;
        ctx.fillRect(rx, ry, 6, rh);
        ctx.globalAlpha = 1;
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },

  {
    id: 'skewed-block',
    name: '斜切报纸块',
    realFamily: 'newspaper',
    textSafeArea: { x: 0.10, y: 0.30, w: 0.80, h: 0.45 },
    allowRotation: true,
    allowBleed: false,
    decorationSlots: ['bottomLeft', 'topRight'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 16;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        const cx = rx + rw / 2, cy = ry + rh / 2;
        ctx.translate(cx, cy);
        ctx.rotate((-1.5 * Math.PI) / 180);
        ctx.translate(-cx, -cy);
        ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FFFFFF') : '#FFFFFF';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.restore();
      } catch (e) { fallbackRect(ctx, box, palette); }
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// 5. minimal — 极简大字风 (8种)
// ═══════════════════════════════════════════════════════════════

const minimalShapes = [
  {
    id: 'no-frame',
    name: '无框纯大字',
    realFamily: 'minimal',
    textSafeArea: { x: 0.08, y: 0.25, w: 0.84, h: 0.55 },
    allowRotation: false,
    allowBleed: true,
    decorationSlots: [],
    draw(ctx, box, palette, seed) {
      // 不绘制任何图形 — 纯文字
    },
  },

  {
    id: 'huge-circle',
    name: '超大圆形底',
    realFamily: 'minimal',
    textSafeArea: { x: 0.20, y: 0.32, w: 0.60, h: 0.40 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: [],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const cx = 621, cy = 820;
        const r = 1242 * 0.32;
        ctx.fillStyle = palette.accent || '#2AB673';
        ctx.globalAlpha = 0.10;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      } catch (e) { /* minimal fails silently */ }
    },
  },

  {
    id: 'oval-base',
    name: '椭圆形底',
    realFamily: 'minimal',
    textSafeArea: { x: 0.18, y: 0.33, w: 0.64, h: 0.38 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: [],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const cx = 621, cy = 810;
        ctx.fillStyle = palette.accent || '#6B7CFF';
        ctx.globalAlpha = 0.08;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 1242 * 0.35, 1656 * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      } catch (e) { /* silent */ }
    },
  },

  {
    id: 'pill-shape',
    name: '胶囊形底',
    realFamily: 'minimal',
    textSafeArea: { x: 0.15, y: 0.32, w: 0.70, h: 0.41 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: [],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 16;
        const rx = box.x - pad, ry = box.y - pad;
        const rw = box.w + pad * 2, rh = box.h + pad * 2;
        const pillRadius = rh / 2;
        ctx.fillStyle = palette.accent || '#6B7CFF';
        ctx.globalAlpha = 0.08;
        roundRect(ctx, rx, ry, rw, rh, pillRadius);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      } catch (e) { /* silent */ }
    },
  },

  {
    id: 'arch-base',
    name: '半圆拱形底',
    realFamily: 'minimal',
    textSafeArea: { x: 0.22, y: 0.28, w: 0.56, h: 0.48 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: [],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const cx = 621, cy = box.y + box.h * 0.6;
        const rx = box.w / 2 + 10, ry = box.h * 0.65;
        ctx.fillStyle = palette.accent || '#2AB673';
        ctx.globalAlpha = 0.07;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      } catch (e) { /* silent */ }
    },
  },

  {
    id: 'thin-frame',
    name: '极细线框',
    realFamily: 'minimal',
    textSafeArea: { x: 0.12, y: 0.30, w: 0.76, h: 0.46 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: [],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        const pad = 14;
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(box.x - pad, box.y - pad, box.w + pad * 2, box.h + pad * 2);
        ctx.restore();
      } catch (e) { /* silent */ }
    },
  },

  {
    id: 'left-block',
    name: '左侧色块',
    realFamily: 'minimal',
    textSafeArea: { x: 0.14, y: 0.28, w: 0.78, h: 0.49 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: [],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        // 画布左侧竖条色块
        const barW = 1242 * 0.10;
        ctx.fillStyle = palette.accent || '#2AB673';
        ctx.globalAlpha = 0.10;
        ctx.fillRect(0, box.y - 80, barW, box.h + 160);
        ctx.globalAlpha = 1;
        ctx.restore();
      } catch (e) { /* silent */ }
    },
  },

  {
    id: 'bottom-line',
    name: '底部短横线托底',
    realFamily: 'minimal',
    textSafeArea: { x: 0.10, y: 0.28, w: 0.80, h: 0.48 },
    allowRotation: false,
    allowBleed: false,
    decorationSlots: ['belowTitle'],
    draw(ctx, box, palette, seed) {
      try {
        ctx.save();
        // 底部短粗横线（标题下方）
        const lineW = box.w * 0.45;
        const lineX = box.x + (box.w - lineW) / 2;
        const lineY = box.y + box.h * 0.88;
        ctx.strokeStyle = palette.accent || palette.text || '#111111';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lineX, lineY);
        ctx.lineTo(lineX + lineW, lineY);
        ctx.stroke();
        ctx.restore();
      } catch (e) { /* silent */ }
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// 图形库聚合
// ═══════════════════════════════════════════════════════════════

const CENTER_SHAPE_LIBRARY = {
  handnote: handnoteShapes,
  collage: collageShapes,
  comic: comicShapes,
  newspaper: newspaperShapes,
  minimal: minimalShapes,
};

// ═══════════════════════════════════════════════════════════════
// 选择函数
// ═══════════════════════════════════════════════════════════════

/**
 * 从指定真实风格族中选择一个中央承载图形。
 * 使用 seededRandom 确保确定性；同一文案的不同 variantIndex 会选不同 shape。
 *
 * @param {string} realFamily - 真实风格族名
 * @param {string} family - A-T 风格字母
 * @param {number} variantIndex - 变体索引 0-4
 * @param {number} seed - 随机种子
 * @returns {object} 选中的 shape（深拷贝）
 */
function selectCenterShape(realFamily, family, variantIndex, seed) {
  const shapes = CENTER_SHAPE_LIBRARY[realFamily];
  if (!shapes || shapes.length === 0) {
    // 兜底：handnote 第一个
    return cloneShape(CENTER_SHAPE_LIBRARY.handnote[0]);
  }

  // 用 variantIndex 偏移种子，确保5个变体选不同图形
  const rng = shapeRand(seed + variantIndex * 31337);
  const idx = Math.floor(rng() * shapes.length);
  return cloneShape(shapes[idx]);
}

// ═══════════════════════════════════════════════════════════════
// 通用工具
// ═══════════════════════════════════════════════════════════════

/** 绘制圆角矩形路径 */
function roundRect(ctx, x, y, w, h, r) {
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

/** 颜色加深 */
function darkenColor(hex, amount) {
  try {
    const c = hex.replace('#', '');
    const r = Math.max(0, parseInt(c.slice(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(c.slice(2, 4), 16) * (1 - amount));
    const b = Math.max(0, parseInt(c.slice(4, 6), 16) * (1 - amount));
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return 'rgba(0,0,0,' + amount + ')';
  }
}

/** 矩形周长上的点 (t 从 0 到 1，顺时针从左上角开始) */
function pointOnRect(x, y, w, h, t) {
  const perimeter = 2 * (w + h);
  let dist = t * perimeter;
  if (dist < w) return [x + dist, y];
  dist -= w;
  if (dist < h) return [x + w, y + dist];
  dist -= h;
  if (dist < w) return [x + w - dist, y + h];
  dist -= w;
  return [x, y + h - dist];
}

/** 异常降级：绘制简单矩形 */
function fallbackRect(ctx, box, palette) {
  try {
    ctx.fillStyle = palette.bg ? (palette.bg[0] || '#FAFAFA') : '#FAFAFA';
    ctx.fillRect(box.x - 10, box.y - 10, box.w + 20, box.h + 20);
  } catch (e) {
    // 完全失败，不做任何事
  }
}

// ═══════════════════════════════════════════════════════════════
// 挂载到 window
// ═══════════════════════════════════════════════════════════════

window.CENTER_SHAPE_LIBRARY = CENTER_SHAPE_LIBRARY;
window.selectCenterShape = selectCenterShape;

/*
 * ─── 验证命令（浏览器控制台）───
 *
 * const families = ['handnote', 'collage', 'comic', 'newspaper', 'minimal'];
 * families.forEach(f => {
 *   console.log(f + ' 图形数量:', CENTER_SHAPE_LIBRARY[f].length);
 * });
 * // 预期每个 >= 8
 *
 * // 测试绘制
 * const cvs = document.createElement('canvas');
 * cvs.width = 1242; cvs.height = 1656;
 * const ctx = cvs.getContext('2d');
 * const shape = CENTER_SHAPE_LIBRARY.handnote[0];
 * const box = { x: 100, y: 400, w: 1042, h: 700 };
 * shape.draw(ctx, box, { bg: ['#F5EFD8'], text: '#2D2A26', accent: '#5D4E37', second: '#FFEC47' }, 42);
 * console.log('绘制完成，toDataURL 长度:', cvs.toDataURL().length);
 *
 * // 测试 selectCenterShape
 * const s1 = selectCenterShape('handnote', 'A', 0, 42);
 * const s2 = selectCenterShape('handnote', 'A', 1, 42);
 * console.log('不同 variant 选不同 shape:', s1.id !== s2.id ? '✅' : '❌');
 */
