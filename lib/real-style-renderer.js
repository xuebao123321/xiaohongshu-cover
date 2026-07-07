/**
 * real-style-renderer.js
 * 真实风格族重构 — 渲染管线主入口
 *
 * 串联所有模块，执行完整的 15 步渲染流程：
 *   解析风格 → 解析文案 → 选择调色板 → 选择布局 → 选择中央图形
 *   → 排版计算 → 装饰计划 → 互斥规则 → 绘制背景 → 绘制中央图形
 *   → 背景装饰 → 文字后装饰 → 结构化文字 → 文字上装饰 → 安全边界检查
 */

const R_CANVAS_W = 1242;
const R_CANVAS_H = 1656;

// ═══════════════════════════════════════════════════════════════
// 1. 主渲染函数
// ═══════════════════════════════════════════════════════════════

function drawRealStyleCover(ctx, rawText, palette, options, family) {
  ctx.save();
  try {
    // --- Step 1: 解析真实风格 ---
    const map = window.REAL_STYLE_MAP[family] || window.REAL_STYLE_MAP.A;
    const realFamily = map.realFamily;
    const subStyleConfig = window.REAL_SUBSTYLE_CONFIGS[map.subStyle] || window.REAL_SUBSTYLE_CONFIGS.creamNotebook;
    const familyConfig = window.REAL_STYLE_CONFIGS[realFamily] || window.REAL_STYLE_CONFIGS.handnote;

    // --- Step 2: 解析文案 ---
    let content;
    try {
      content = window.parseCoverContent(rawText || '');
    } catch (e) {
      content = { mainTitle: rawText || '', subTitle: '', keyword: '', badgeText: '', footerText: '', rawText: rawText || '' };
    }

    // --- Step 3: 合成有效调色板 ---
    const effectivePalette = {
      bg: (palette && palette.bg) ? palette.bg : (subStyleConfig.palette.bg || ['#FBFAF4']),
      text: (palette && palette.text) || subStyleConfig.palette.text || '#111111',
      accent: (palette && palette.accent) || subStyleConfig.palette.accent || '#E6213D',
      second: (palette && palette.second) || subStyleConfig.palette.second || '#FFEC47',
    };

    // --- Step 4: 选择 layout ---
    let layout;
    try {
      layout = window.selectLayout(realFamily, (options && options.vi) || 0);
    } catch (e) {
      layout = { id: 'handnoteTape', realFamily: 'handnote', geometry: { titleZone: { x: 0.10, y: 0.28, w: 0.80, h: 0.48 } }, decorationSlots: ['topLeft', 'bottomRight'], preferredAlign: 'center', allowBleed: false };
    }

    // --- Step 5: 选择中央承载图形 ---
    let centerShape;
    try {
      centerShape = window.selectCenterShape(realFamily, family, (options && options.vi) || 0, (options && options.seed) || 42);
    } catch (e) {
      centerShape = null;
    }

    // --- Step 6: 计算排版计划 ---
    let typography;
    try {
      typography = window.computeTypographyPlan(ctx, content, familyConfig, layout.id, centerShape, subStyleConfig);
    } catch (e) {
      typography = fallbackTypography(content);
    }

    // --- Step 7: 生成装饰计划 ---
    let decorationPlan;
    try {
      decorationPlan = window.buildDecorationPlan(realFamily, subStyleConfig, layout.id, centerShape, content, (options && options.seed) || 42);
    } catch (e) {
      decorationPlan = { backgroundDecorations: [], behindTextDecorations: [], aboveTextDecorations: [], cornerDecorations: [], stickers: [] };
    }

    // --- Step 8: 应用互斥规则 ---
    try {
      const safeTitleBox = window.getTitleSafeRect(typography.mainTextBox);
      window.applyMutualExclusion(decorationPlan, realFamily, safeTitleBox);
    } catch (e) {
      // 互斥失败不影响渲染
    }

    // --- Step 8a: 贴纸选择与集成 ---
    try {
      if (window.getStickerCountForFamily && window.pickStickersForCard) {
        const stickerCount = window.getStickerCountForFamily(realFamily, (options && options.seed) || 42);
        if (stickerCount > 0) {
          const availableStickers = (window.FAMILY_STICKER_POOL && window.FAMILY_STICKER_POOL[family])
            ? window.FAMILY_STICKER_POOL[family]
            : [];
          let stickerObjs = availableStickers;
          if (typeof availableStickers[0] === 'string') {
            stickerObjs = availableStickers.map(function (sid) {
              return { id: sid, categories: (window.STICKER_REGISTRY && window.STICKER_REGISTRY[sid] && window.STICKER_REGISTRY[sid].categories) || [] };
            });
          }
          const selectedStickers = window.pickStickersForCard(realFamily, stickerObjs, stickerCount, (options && options.seed ? options.seed + 1 : 43));
          for (let si = 0; si < selectedStickers.length; si++) {
            const sticker = selectedStickers[si];
            const cornerSlots = ['topRight', 'bottomLeft', 'topLeft', 'bottomRight'];
            const slot = cornerSlots[si % cornerSlots.length];
            decorationPlan.cornerDecorations.push({
              id: 'sticker_' + (sticker.id || si),
              type: 'sticker',
              slot: slot,
              renderLayer: 'above',
              drawInstruction: {
                type: 'sticker',
                params: {
                  stickerId: sticker.id,
                  family: realFamily,
                  x: 0, y: 0, w: 200, h: 200,
                },
              },
            });
          }
        }
      }
    } catch (e) {
      // 贴纸集成失败不影响整体渲染
    }

    // --- Step 9: 绘制背景 ---
    try {
      drawRealBackground(ctx, realFamily, subStyleConfig, effectivePalette, layout, options);
    } catch (e) {
      // 降级：纯色背景
      ctx.fillStyle = effectivePalette.bg[0] || '#FAFAFA';
      ctx.fillRect(0, 0, R_CANVAS_W, R_CANVAS_H);
    }

    // --- Step 10: 绘制中央承载图形 ---
    try {
      if (centerShape && typeof centerShape.draw === 'function') {
        const shapeBox = {
          x: (centerShape.textSafeArea.x || 0.10) * R_CANVAS_W,
          y: (centerShape.textSafeArea.y || 0.28) * R_CANVAS_H,
          w: (centerShape.textSafeArea.w || 0.80) * R_CANVAS_W,
          h: (centerShape.textSafeArea.h || 0.48) * R_CANVAS_H,
        };
        centerShape.draw(ctx, shapeBox, effectivePalette, (options && options.seed) || 42);
      }
    } catch (e) {
      // 中央图形失败不影响整体
    }

    // --- Step 11: 绘制背景层装饰 ---
    try {
      window.drawDecorations(ctx, decorationPlan.backgroundDecorations, effectivePalette);
    } catch (e) { /* silent */ }

    // --- Step 12: 绘制文字后装饰 ---
    try {
      window.drawDecorations(ctx, decorationPlan.behindTextDecorations, effectivePalette);
    } catch (e) { /* silent */ }

    // --- Step 13: 绘制结构化文字 ---
    try {
      drawStructuredTypography(ctx, content, typography, effectivePalette, (options && options.font) || 'black', realFamily);
    } catch (e) {
      // 降级：简单绘制主标题
      ctx.fillStyle = effectivePalette.text;
      ctx.font = 'bold 120px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(content.mainTitle || '', R_CANVAS_W / 2, R_CANVAS_H / 2);
    }

    // --- Step 14: 绘制文字上方装饰 ---
    try {
      const aboveDecorations = [...(decorationPlan.aboveTextDecorations || []), ...(decorationPlan.cornerDecorations || [])];
      window.drawDecorations(ctx, aboveDecorations, effectivePalette);
    } catch (e) { /* silent */ }

    // --- Step 15: 安全边界检查 ---
    try {
      assertSafeBounds(typography);
    } catch (e) { /* silent */ }

  } catch (err) {
    console.error('真实风格渲染完全失败:', err);
    // 红色错误占位
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, R_CANVAS_W, R_CANVAS_H);
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 48px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('渲染错误，请重试', R_CANVAS_W / 2, R_CANVAS_H / 2);
    ctx.textAlign = 'start';
    throw err; // 重新抛出让外层回退到 legacy
  } finally {
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. 背景绘制
// ═══════════════════════════════════════════════════════════════

function drawRealBackground(ctx, realFamily, subStyleConfig, palette, layout, options) {
  const vi = (options && options.vi) || 0;
  const bgColor = (palette.bg && palette.bg.length)
    ? palette.bg[vi % palette.bg.length]
    : (palette.bg || '#FAFAFA');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, R_CANVAS_W, R_CANVAS_H);

  switch (realFamily) {
    case 'handnote': {
      // 柔和纸张纹理：极浅横线
      ctx.strokeStyle = 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 0.8;
      for (let y = 100; y < R_CANVAS_H - 80; y += 28) {
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(R_CANVAS_W - 60, y);
        ctx.stroke();
      }
      break;
    }
    case 'collage': {
      // 大面积半透明色块
      ctx.fillStyle = withAlphaColor(palette.accent || '#FF6B6B', 0.06);
      ctx.fillRect(R_CANVAS_W * 0.55, 0, R_CANVAS_W * 0.45, R_CANVAS_H * 0.5);
      ctx.fillStyle = withAlphaColor(palette.second || '#2677DE', 0.05);
      ctx.fillRect(0, R_CANVAS_H * 0.55, R_CANVAS_W * 0.5, R_CANVAS_H * 0.45);
      break;
    }
    case 'comic': {
      // 半色调或放射线
      if (layout && (layout.id === 'comicHalftone' || layout.id === 'comicBubble')) {
        ctx.fillStyle = withAlphaColor(palette.text || '#111111', 0.05);
        const dotSpacing = 16;
        for (let x = dotSpacing; x < R_CANVAS_W; x += dotSpacing) {
          for (let y = dotSpacing; y < R_CANVAS_H; y += dotSpacing) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      if (layout && (layout.id === 'comicBurst' || layout.id === 'comicSfx')) {
        ctx.strokeStyle = withAlphaColor(palette.text || '#111111', 0.08);
        ctx.lineWidth = 2;
        const cx = R_CANVAS_W / 2, cy = R_CANVAS_H * 0.42;
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 100, cy + Math.sin(a) * 100);
          ctx.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 900);
          ctx.stroke();
        }
      }
      break;
    }
    case 'newspaper': {
      // 极淡竖线
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.lineWidth = 0.6;
      const cols = 3;
      for (let c = 1; c < cols; c++) {
        const x = (R_CANVAS_W / cols) * c;
        ctx.beginPath();
        ctx.moveTo(x, 80);
        ctx.lineTo(x, R_CANVAS_H - 80);
        ctx.stroke();
      }
      break;
    }
    case 'minimal': {
      // 可选极淡渐变
      const grad = ctx.createLinearGradient(0, 0, 0, R_CANVAS_H);
      grad.addColorStop(0, bgColor);
      grad.addColorStop(1, withAlphaColor(palette.accent || '#2AB673', 0.03));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, R_CANVAS_W, R_CANVAS_H);
      break;
    }
    default:
      break;
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. 结构化文字绘制
// ═══════════════════════════════════════════════════════════════

function drawStructuredTypography(ctx, content, typography, palette, fontKey, realFamily) {
  const fontConf = (window.FONT_MAP && window.FONT_MAP[fontKey]) || { family: '"Noto Sans SC", sans-serif', weight: 700 };
  const fontFamily = fontConf.family || '"Noto Sans SC", sans-serif';
  const alignment = typography.alignment || 'center';

  // --- badge ---
  if (content.badgeText && typography.badgeFontSize > 0) {
    const bb = typography.badgeBox;
    // 背景色块
    ctx.fillStyle = withAlphaColor(palette.accent, 0.85);
    const bw = Math.max(bb.w, typography.badgeFontSize * content.badgeText.length * 0.7 + 20);
    roundRectPath(ctx, bb.x, bb.y, bw, bb.h, 6);
    ctx.fill();
    // 文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${typography.badgeFontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(content.badgeText, bb.x + bw / 2, bb.y + bb.h / 2);
  }

  // --- keyword (荧光笔高亮效果) ---
  if (content.keyword && typography.keywordFontSize > 0) {
    const kb = typography.keywordBox;
    ctx.font = `bold ${typography.keywordFontSize}px ${fontFamily}`;
    const kw = ctx.measureText(content.keyword).width;
    // 高亮背景
    ctx.fillStyle = withAlphaColor(palette.second || '#FFEC47', 0.40);
    const kx = alignment === 'center' ? (R_CANVAS_W - kw) / 2 : kb.x;
    ctx.fillRect(kx - 6, kb.y + typography.keywordFontSize * 0.12, kw + 12, typography.keywordFontSize * 0.80);
    // 文字
    ctx.fillStyle = palette.text;
    ctx.textAlign = alignment;
    ctx.textBaseline = 'top';
    ctx.fillText(content.keyword, kx, kb.y);
  }

  // --- mainTitle ---
  if (content.mainTitle && typography.mainFontSize > 0) {
    const mb = typography.mainTextBox;
    const isComic = realFamily === 'comic';
    const letterSpacing = typography.letterSpacing || -0.03;

    if (isComic) {
      // 粗描边 + 填充
      const sw = 5; // strokeWidth
      ctx.font = `bold ${typography.mainFontSize}px ${fontFamily}`;
      ctx.textAlign = alignment;
      ctx.textBaseline = 'top';
      ctx.lineJoin = 'round';
      // 描边
      ctx.strokeStyle = palette.text;
      ctx.lineWidth = sw;
      // 使用逐字绘制实现 letterSpacing + 描边
      drawTextWithSpacingAndStroke(ctx, content.mainTitle, mb.x, mb.y,
        typography.mainFontSize, letterSpacing, fontFamily, palette.accent || '#FFFFFF', palette.text, sw);
    } else {
      // 普通逐字绘制
      drawTextWithSpacing(ctx, content.mainTitle, mb.x, mb.y,
        typography.mainFontSize, letterSpacing, fontFamily, palette.text, alignment);
    }
  }

  // --- subTitle ---
  if (content.subTitle && typography.subFontSize > 0) {
    const sb = typography.subTextBox;
    ctx.fillStyle = withAlphaColor(palette.text, 0.75);
    ctx.font = `400 ${typography.subFontSize}px ${fontFamily}`;
    ctx.textAlign = alignment;
    ctx.textBaseline = 'top';
    ctx.fillText(content.subTitle, sb.x, sb.y);
  }

  // --- footer ---
  if (content.footerText && typography.footerFontSize > 0) {
    const fb = typography.footerBox;
    ctx.fillStyle = withAlphaColor(palette.text, 0.50);
    ctx.font = `${typography.footerFontSize}px ${fontFamily}`;
    ctx.textAlign = alignment;
    ctx.textBaseline = 'top';
    ctx.fillText(content.footerText, fb.x, fb.y);
  }
}

// ═══════════════════════════════════════════════════════════════
// 4. 逐字绘制工具（Canvas letter-spacing 实现）
// ═══════════════════════════════════════════════════════════════

function drawTextWithSpacing(ctx, text, x, y, fontSize, letterSpacingEm, fontFamily, color, alignment) {
  ctx.save();
  ctx.font = `bold ${fontSize}px ${fontFamily || '"Noto Sans SC", sans-serif'}`;
  ctx.fillStyle = color || '#111111';
  ctx.textBaseline = 'top';
  const spacing = fontSize * (letterSpacingEm || 0);
  const totalWidth = measureSpacedText(ctx, text, spacing);

  let currentX;
  if (alignment === 'center') {
    currentX = x + (R_CANVAS_W * 0.5 - x) - totalWidth / 2;
    // 如果 x 已经是中心，则用 x 居中
    if (Math.abs(x - R_CANVAS_W / 2) < 100) {
      currentX = R_CANVAS_W / 2 - totalWidth / 2;
    } else {
      currentX = x;
    }
  } else {
    currentX = x;
  }

  for (const char of [...text]) {
    ctx.fillText(char, currentX, y);
    currentX += ctx.measureText(char).width + spacing;
  }
  ctx.restore();
  return totalWidth;
}

function drawTextWithSpacingAndStroke(ctx, text, x, y, fontSize, letterSpacingEm, fontFamily, fillColor, strokeColor, strokeWidth) {
  ctx.save();
  ctx.font = `bold ${fontSize}px ${fontFamily || '"Noto Sans SC", sans-serif'}`;
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'top';
  const spacing = fontSize * (letterSpacingEm || 0);
  let currentX = x;
  for (const char of [...text]) {
    ctx.strokeText(char, currentX, y);
    ctx.fillText(char, currentX, y);
    currentX += ctx.measureText(char).width + spacing;
  }
  ctx.restore();
}

function measureSpacedText(ctx, text, spacing) {
  let total = 0;
  for (const char of [...text]) {
    total += ctx.measureText(char).width;
  }
  total += spacing * (Math.max(0, [...text].length - 1));
  return total;
}

// ═══════════════════════════════════════════════════════════════
// 5. 安全边界检查
// ═══════════════════════════════════════════════════════════════

function assertSafeBounds(typography) {
  if (!typography || !typography.mainTextBox) return;
  const box = typography.mainTextBox;
  const bleed = typography.allowBleed ? 0.05 : 0;
  if (box.x < -R_CANVAS_W * bleed ||
      box.y < -R_CANVAS_H * bleed ||
      box.x + box.w > R_CANVAS_W * (1 + bleed) ||
      box.y + box.h > R_CANVAS_H * (1 + bleed)) {
    console.warn('文字区域超出安全边界', box);
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. 辅助函数
// ═══════════════════════════════════════════════════════════════

/** 将 hex 颜色加上 alpha 通道 */
function withAlphaColor(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
  try {
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16);
      const g = parseInt(clean[1] + clean[1], 16);
      const b = parseInt(clean[2] + clean[2], 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch (e) {
    return `rgba(0,0,0,${alpha})`;
  }
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

/** 生成排版计划的降级版本 */
function fallbackTypography(content) {
  return {
    mainFontSize: 160,
    subFontSize: 50,
    keywordFontSize: 70,
    badgeFontSize: 30,
    footerFontSize: 28,
    mainLineHeight: 1.15,
    subLineHeight: 1.3,
    letterSpacing: -0.03,
    alignment: 'center',
    mainTextBox: { x: 100, y: 450, w: 1042, h: 500 },
    subTextBox: { x: 100, y: 1000, w: 1042, h: 80 },
    keywordBox: { x: 300, y: 300, w: 600, h: 60 },
    badgeBox: { x: 60, y: 40, w: 160, h: 36 },
    footerBox: { x: 200, y: 1480, w: 800, h: 50 },
    titleAreaRatio: 0.35,
    allowBleed: false,
  };
}

// ═══════════════════════════════════════════════════════════════
// 7. 挂载到 window
// ═══════════════════════════════════════════════════════════════

window.drawRealStyleCover = drawRealStyleCover;
window.drawRealBackground = drawRealBackground;
window.drawStructuredTypography = drawStructuredTypography;
window.drawTextWithSpacing = drawTextWithSpacing;

/*
 * ─── 验证命令（浏览器控制台）───
 *
 * (async () => {
 *   const cvs = document.createElement('canvas');
 *   cvs.width = 1242; cvs.height = 1656;
 *   const ctx = cvs.getContext('2d');
 *   await drawRealStyleCover(ctx, '审稿人说创新性不足到底怎么改',
 *     { bg: ['#F5EFD8'], text: '#2D2A26', accent: '#5D4E37', second: '#FFEC47' },
 *     { vi: 0, seed: 42, font: 'black' }, 'A');
 *   console.log('A 渲染完成, dataURL length:', cvs.toDataURL().length);
 * })();
 *
 * // 测试全部 20 个风格
 * (async () => {
 *   for (const f of 'ABCDEFGHIJKLMNOPQRST') {
 *     const cvs = document.createElement('canvas');
 *     cvs.width = 1242; cvs.height = 1656;
 *     const ctx = cvs.getContext('2d');
 *     const t0 = performance.now();
 *     await drawRealStyleCover(ctx, '测试标题', {}, { vi: 0, seed: 42, font: 'black' }, f);
 *     console.log(f + ':', Math.round(performance.now() - t0) + 'ms');
 *   }
 * })();
 */
