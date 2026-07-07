/**
 * template-renderer.js
 * 参考模板驱动渲染器 — 模板定义结构，用户文案填进去
 * 替代规则生成器的随机引擎。每个模板严格复刻参考图。
 */
var TPL_CW = 1242, TPL_CH = 1656;

/** 加载模板 JSON（支持异步） */
function loadTemplate(templateId) {
  var templates = window.TEMPLATE_LIBRARY;
  if (!templates || !templates[templateId]) {
    // 模板尚未加载完成 → 不报错，交给外层回退
    return null;
  }
  // 深拷贝避免多次渲染共享引用
  return JSON.parse(JSON.stringify(templates[templateId]));
}

/**
 * 模板驱动渲染 — 填文字到固定模板
 * @returns {object} { success, canvas? }
 */
function renderTemplate(ctx, templateId, content, options) {
  var tpl = loadTemplate(templateId);
  if (!tpl) return { success: false, error: 'template not found' };

  ctx.save();
  try {
    // 1. 背景
    drawTemplateBackground(ctx, tpl);

    // 2. 背景装饰层
    drawTemplateDecorations(ctx, tpl, 'behind');

    // 3. 标题（自动缩放适配 titleBox）
    fitTextIntoBox(ctx, content.mainTitle || '', tpl.titleBox, tpl.titleFont, tpl.styleFamily);

    // 4. 副标题
    if (content.subTitle && tpl.subTitleBox && tpl.subTitleFont) {
      fitTextIntoBox(ctx, content.subTitle, tpl.subTitleBox, tpl.subTitleFont);
    }

    // 5. 关键词
    if (content.keyword && tpl.keywordBox && tpl.keywordFont) {
      fitTextIntoBox(ctx, content.keyword, tpl.keywordBox, tpl.keywordFont);
    }

    // 6. Footer
    if (content.footerText && tpl.footerBox && tpl.footerFont) {
      fitTextIntoBox(ctx, content.footerText, tpl.footerBox, tpl.footerFont);
    }

    // 7. Badge
    if (content.badgeText && tpl.badgeBox) {
      drawBadge(ctx, content.badgeText, tpl.badgeBox, tpl);
    }

    // 8. 上层装饰
    drawTemplateDecorations(ctx, tpl, 'above');

    return { success: true };
  } catch (e) {
    console.error('Template render error:', templateId, e);
    // 降级：纯色背景 + 大字
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, TPL_CW, TPL_CH);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 180px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(content.mainTitle || '', TPL_CW / 2, TPL_CH / 2);
    return { success: false, error: e.message };
  } finally {
    ctx.restore();
  }
}

/** 绘制模板背景 */
function drawTemplateBackground(ctx, tpl) {
  var bg = tpl.background;
  if (!bg) { ctx.fillStyle = '#FAFAFA'; ctx.fillRect(0, 0, TPL_CW, TPL_CH); return; }

  if (bg.type === 'split') {
    ctx.fillStyle = bg.topColor || '#FFF';
    ctx.fillRect(0, 0, TPL_CW, bg.splitY || TPL_CH / 2);
    ctx.fillStyle = bg.bottomColor || '#EEE';
    ctx.fillRect(0, bg.splitY || TPL_CH / 2, TPL_CW, TPL_CH - (bg.splitY || TPL_CH / 2));
  } else {
    ctx.fillStyle = bg.color || '#FAFAFA';
    ctx.fillRect(0, 0, TPL_CW, TPL_CH);
  }

  // 网格/横线叠加
  if (bg.overlay) {
    var ov = bg.overlay;
    ctx.strokeStyle = ov.color;
    ctx.lineWidth = ov.lineWidth || 0.8;
    if (ov.type === 'grid') {
      for (var x = ov.spacing; x < TPL_CW; x += ov.spacing)
        for (var y = ov.spacing; y < TPL_CH; y += ov.spacing)
          ctx.strokeRect(x, y, ov.spacing, ov.spacing);
    } else if (ov.type === 'lines') {
      for (var ly = 80; ly < TPL_CH - 80; ly += ov.spacing) {
        ctx.beginPath(); ctx.moveTo(60, ly); ctx.lineTo(TPL_CW - 60, ly); ctx.stroke();
      }
    }
  }

  // 半色调网点
  if (tpl.backgroundOverlay && tpl.backgroundOverlay.type === 'halftone') {
    var ho = tpl.backgroundOverlay;
    ctx.fillStyle = ho.color;
    for (var hx = ho.spacing; hx < TPL_CW; hx += ho.spacing)
      for (var hy = ho.spacing; hy < TPL_CH; hy += ho.spacing)
        { ctx.beginPath(); ctx.arc(hx, hy, ho.dotSize, 0, Math.PI * 2); ctx.fill(); }
  }

  // 放射线
  if (tpl.burstLines) {
    var bl = tpl.burstLines;
    ctx.strokeStyle = bl.color; ctx.lineWidth = bl.lineWidth;
    for (var bi = 0; bi < bl.count; bi++) {
      var a = (bi / bl.count) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(bl.from.x + Math.cos(a) * bl.innerR, bl.from.y + Math.sin(a) * bl.innerR);
      ctx.lineTo(bl.from.x + Math.cos(a) * bl.outerR, bl.from.y + Math.sin(a) * bl.outerR);
      ctx.stroke();
    }
  }

  // 顶栏/底栏
  if (tpl.headerBar) { ctx.fillStyle = tpl.headerBar.color; ctx.fillRect(0, tpl.headerBar.y, TPL_CW, tpl.headerBar.h); }
  if (tpl.footerBar) { ctx.fillStyle = tpl.footerBar.color; ctx.fillRect(0, tpl.footerBar.y, TPL_CW, tpl.footerBar.h); }

  // 栏目竖线
  if (tpl.columnDividers) {
    var cd = tpl.columnDividers;
    ctx.strokeStyle = cd.color; ctx.lineWidth = cd.lineWidth;
    for (var ci = 1; ci < cd.count; ci++) {
      var cx = (TPL_CW / cd.count) * ci;
      ctx.beginPath(); ctx.moveTo(cx, cd.yStart); ctx.lineTo(cx, cd.yEnd); ctx.stroke();
    }
  }

  // 横幅条
  if (tpl.bannerStrip) {
    var bs = tpl.bannerStrip;
    ctx.fillStyle = bs.color;
    ctx.fillRect(0, bs.y, TPL_CW, bs.h);
  }

  // 聚焦圆形/色块
  if (tpl.focusShape) {
    var fc = tpl.focusShape;
    ctx.fillStyle = fc.color;
    if (fc.type === 'circle') {
      ctx.beginPath(); ctx.arc(fc.cx, fc.cy, fc.r, 0, Math.PI * 2); ctx.fill();
    } else if (fc.type === 'block') {
      ctx.fillRect(fc.x, fc.y, fc.w, fc.h);
    }
  }
}

/** 绘制模板装饰 */
function drawTemplateDecorations(ctx, tpl, layer) {
  var decos = tpl.decorations || [];
  decos.forEach(function (d) {
    if (d.layer !== layer) return;
    var b = d.box;
    ctx.save();
    try {
      if (d.rotation) { ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.rotate(d.rotation * Math.PI / 180); ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2)); }
      switch (d.type) {
        case 'tape':         drawTapeDeco(ctx, b, d); break;
        case 'handCircle':   drawHandCircleDeco(ctx, b, d); break;
        case 'highlighter':  drawHighlighterDeco(ctx, b, d); break;
        case 'stamp':        drawStampDeco(ctx, b, d); break;
        case 'tornNote':     drawTornNoteDeco(ctx, b, d); break;
        case 'arrow':        drawArrowDeco(ctx, b, d); break;
        case 'colorBlock':   drawColorBlockDeco(ctx, b, d); break;
        case 'badge':        drawBadgeDeco(ctx, b, d); break;
        case 'doodle':       drawDoodleDeco(ctx, b, d); break;
        case 'emoji':        drawEmojiDeco(ctx, b, d); break;
        case 'speechBubble':drawBubbleDeco(ctx, b, d); break;
        case 'sfx':          drawSfxDeco(ctx, b, d); break;
        case 'starBurst':    drawStarBurstDeco(ctx, b, d); break;
        case 'divider':      drawDividerDeco(ctx, b, d); break;
        case 'thickLine':    drawThickLineDeco(ctx, b, d); break;
        case 'polaroid':     drawPolaroidDeco(ctx, b, d); break;
        case 'markerGhost':  drawMarkerGhostDeco(ctx, b, d); break;
      }
    } catch (e) { /* deco fail → skip */ }
    ctx.restore();
  });
}

/** 文字自适应填充 — 字多时扩展到画布75-85%，不裁字不超边框 */
function fitTextIntoBox(ctx, text, box, fontConf, family) {
  if (!text || !box) return;
  var fFamily = (fontConf && fontConf.family) || '"Noto Sans SC", sans-serif';
  var fColor = (fontConf && fontConf.color) || '#111111';
  var fWeight = (fontConf && fontConf.weight) || 900;
  var fMax = (fontConf && fontConf.max) || 400;
  var fSpacing = (fontConf && fontConf.letterSpacing) || -0.03;
  var fStroke = fontConf && fontConf.stroke;

  // ══════ 文字多时扩展可用区域至画布85% ══════
  var lines = text.split('\n');
  var lineHeight = 1.20;
  // 扩展 box: 最多用到画布的 8%-92%（即84%宽度，84%高度）
  var maxW = TPL_CW * 0.84;
  var maxH = TPL_CH * 0.84;
  var expandW = Math.min(box.w * 1.4, maxW);
  var expandH = Math.min(box.h * 1.5, maxH);
  // 居中扩展
  var expandX = Math.max(TPL_CW * 0.08, box.x - (expandW - box.w) / 2);
  var expandY = Math.max(TPL_CH * 0.08, box.y - (expandH - box.h) / 2);
  // 确保不超出画布
  if (expandX + expandW > TPL_CW * 0.92) expandX = TPL_CW * 0.92 - expandW;
  if (expandY + expandH > TPL_CH * 0.92) expandY = TPL_CH * 0.92 - expandH;
  var drawBox = { x: expandX, y: expandY, w: expandW, h: expandH };

  // Start at max, shrink to fit
  var fontSize = fMax;
  var maxLineW, totalH;
  for (var iter = 0; iter < 30; iter++) {
    ctx.font = 'bold ' + fontSize + 'px ' + fFamily;
    maxLineW = 0;
    for (var li = 0; li < lines.length; li++) {
      var lw = 0;
      var lchars = lines[li].split('');
      for (var ci = 0; ci < lchars.length; ci++) {
        lw += ctx.measureText(lchars[ci]).width;
        if (ci < lchars.length - 1) lw += fontSize * fSpacing;
      }
      if (lw > maxLineW) maxLineW = lw;
    }
    totalH = fontSize * lineHeight * lines.length;
    if (maxLineW <= drawBox.w && totalH <= drawBox.h) break;
    fontSize = Math.floor(fontSize * 0.92);
    if (fontSize < 20) { fontSize = 20; break; }
  }

  // 逐行居中绘制
  var startY = drawBox.y + (drawBox.h - totalH) / 2;
  ctx.font = 'bold ' + fontSize + 'px ' + fFamily;
  ctx.fillStyle = fColor;
  ctx.textBaseline = 'top';

  for (var li = 0; li < lines.length; li++) {
    var lchars = lines[li].split('');
    var lw = 0;
    for (var ci = 0; ci < lchars.length; ci++) {
      lw += ctx.measureText(lchars[ci]).width;
      if (ci < lchars.length - 1) lw += fontSize * fSpacing;
    }
    var lx = drawBox.x + (drawBox.w - lw) / 2;
    var ly = startY + li * fontSize * lineHeight;
    var cx = lx;
    for (var ci = 0; ci < lchars.length; ci++) {
      if (fStroke && family === 'comic') {
        ctx.strokeStyle = fStroke.color; ctx.lineWidth = fStroke.width; ctx.lineJoin = 'round';
        ctx.strokeText(lchars[ci], cx, ly);
      }
      ctx.fillText(lchars[ci], cx, ly);
      cx += ctx.measureText(lchars[ci]).width + fontSize * fSpacing;
    }
  }
}

// ── 各装饰绘制函数 ──

function drawTapeDeco(ctx, b, d) {
  ctx.fillStyle = d.color || 'rgba(230,210,170,0.55)';
  ctx.fillRect(b.x, b.y, b.w, b.h);
}

function drawHandCircleDeco(ctx, b, d) {
  ctx.strokeStyle = d.color; ctx.lineWidth = d.lineWidth || 2.5;
  if (d.dashed) ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
  ctx.stroke(); ctx.setLineDash([]);
}

function drawHighlighterDeco(ctx, b, d) {
  ctx.fillStyle = d.color; ctx.fillRect(b.x, b.y, b.w, b.h);
}

function drawStampDeco(ctx, b, d) {
  var r = Math.min(b.w, b.h) / 2;
  ctx.strokeStyle = d.color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, r, 0, Math.PI * 2); ctx.stroke();
  if (d.label) {
    ctx.fillStyle = d.color; ctx.font = 'bold ' + (r * 0.45) + 'px "Noto Sans SC"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.label, b.x + b.w / 2, b.y + b.h / 2);
  }
}

function drawTornNoteDeco(ctx, b, d) {
  if (d.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 12; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 4; }
  ctx.fillStyle = d.color;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y + 20);
  for (var i = 0; i < 8; i++) { ctx.lineTo(b.x + (i / 7) * b.w, b.y + (i % 2 ? 6 : -4)); }
  ctx.lineTo(b.x + b.w, b.y + b.h); ctx.lineTo(b.x, b.y + b.h); ctx.closePath(); ctx.fill();
  ctx.shadowColor = 'transparent';
}

function drawArrowDeco(ctx, b, d) {
  ctx.strokeStyle = d.color; ctx.lineWidth = d.lineWidth || 2.5;
  var ex = b.x + b.w, ey = b.y + b.h / 2;
  ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h / 2);
  ctx.quadraticCurveTo(b.x + b.w * 0.6, b.y + b.h * 0.3, ex, ey); ctx.stroke();
  var al = 16;
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - al * 0.7, ey - al * 0.7);
  ctx.moveTo(ex, ey); ctx.lineTo(ex - al * 0.7, ey + al * 0.7); ctx.stroke();
}

function drawColorBlockDeco(ctx, b, d) {
  ctx.fillStyle = d.color;
  if (d.shape === 'circle') { ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, Math.min(b.w, b.h) / 2, 0, Math.PI * 2); ctx.fill(); }
  else if (d.shape === 'pill') { var r = Math.min(b.h / 2, 40); ctx.beginPath(); ctx.moveTo(b.x+r,b.y); ctx.lineTo(b.x+b.w-r,b.y); ctx.arcTo(b.x+b.w,b.y,b.x+b.w,b.y+r,r); ctx.lineTo(b.x+b.w,b.y+b.h-r); ctx.arcTo(b.x+b.w,b.y+b.h,b.x+b.w-r,b.y+b.h,r); ctx.lineTo(b.x+r,b.y+b.h); ctx.arcTo(b.x,b.y+b.h,b.x,b.y+b.h-r,r); ctx.lineTo(b.x,b.y+r); ctx.arcTo(b.x,b.y,b.x+r,b.y,r); ctx.closePath(); ctx.fill(); }
  else { ctx.fillRect(b.x, b.y, b.w, b.h); }
}

function drawBadgeDeco(ctx, b, d) {
  ctx.fillStyle = d.color;
  var r = Math.min(b.h / 2, 8);
  ctx.beginPath(); ctx.moveTo(b.x + r, b.y); ctx.lineTo(b.x + b.w - r, b.y);
  ctx.arcTo(b.x + b.w, b.y, b.x + b.w, b.y + r, r);
  ctx.lineTo(b.x + b.w, b.y + b.h - r);
  ctx.arcTo(b.x + b.w, b.y + b.h, b.x + b.w - r, b.y + b.h, r);
  ctx.lineTo(b.x + r, b.y + b.h);
  ctx.arcTo(b.x, b.y + b.h, b.x, b.y + b.h - r, r);
  ctx.lineTo(b.x, b.y + r);
  ctx.arcTo(b.x, b.y, b.x + r, b.y, r); ctx.closePath(); ctx.fill();
  if (d.label) {
    ctx.fillStyle = d.labelColor || '#FFF'; ctx.font = (d.fontSize || 16) + 'px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.label, b.x + b.w / 2, b.y + b.h / 2);
  }
}

function drawDoodleDeco(ctx, b, d) {
  ctx.strokeStyle = d.color; ctx.lineWidth = d.lineWidth || 1.5;
  var cx = b.x + b.w / 2, cy = b.y + b.h / 2, or = b.w / 2;
  ctx.beginPath();
  for (var i = 0; i < 10; i++) {
    var a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? or * 0.4 : or;
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath(); ctx.stroke();
}

function drawEmojiDeco(ctx, b, d) {
  ctx.font = (d.fontSize || 90) + 'px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(d.emoji || '⭐', b.x + b.w / 2, b.y + b.h / 2);
}

function drawBubbleDeco(ctx, b, d) {
  ctx.fillStyle = d.color || '#FFF';
  ctx.strokeStyle = d.strokeColor || '#000'; ctx.lineWidth = d.strokeWidth || 3;
  ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(b.x + b.w * 0.65, b.y + b.h); ctx.lineTo(b.x + b.w * 0.7, b.y + b.h + 18); ctx.lineTo(b.x + b.w * 0.8, b.y + b.h); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (d.text) { ctx.fillStyle = d.strokeColor || '#000'; ctx.font = 'bold ' + (d.textSize || 30) + 'px "Noto Sans SC"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.text, b.x + b.w / 2, b.y + b.h * 0.45); }
}

function drawSfxDeco(ctx, b, d) {
  ctx.font = 'bold ' + (d.fontSize || 70) + 'px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (d.strokeColor) { ctx.strokeStyle = d.strokeColor; ctx.lineWidth = d.strokeWidth || 2; ctx.strokeText(d.text, b.x + b.w / 2, b.y + b.h / 2); }
  ctx.fillStyle = d.color; ctx.fillText(d.text, b.x + b.w / 2, b.y + b.h / 2);
}

function drawStarBurstDeco(ctx, b, d) {
  var cx = b.x + b.w / 2, cy = b.y + b.h / 2, or = b.w / 2, ir = or * 0.4;
  ctx.fillStyle = d.color; ctx.strokeStyle = d.strokeColor; ctx.lineWidth = d.strokeWidth || 2;
  ctx.beginPath();
  for (var i = 0; i < 16; i++) {
    var a = (i / 16) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? ir : or;
    i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
}

function drawDividerDeco(ctx, b, d) {
  ctx.strokeStyle = d.color; ctx.lineWidth = d.lineWidth; ctx.beginPath();
  ctx.moveTo(b.x, b.y + b.h / 2); ctx.lineTo(b.x + b.w, b.y + b.h / 2); ctx.stroke();
}

function drawThickLineDeco(ctx, b, d) {
  ctx.strokeStyle = d.color; ctx.lineWidth = d.lineWidth || 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h / 2); ctx.lineTo(b.x + b.w, b.y + b.h / 2); ctx.stroke();
}

function drawPolaroidDeco(ctx, b, d) {
  if (d.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 16; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5; }
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#F0F0F0'; ctx.fillRect(b.x + 20, b.y + 16, b.w - 40, b.h - 60);
}

function drawMarkerGhostDeco(ctx, b, d) {
  ctx.fillStyle = d.color;
  ctx.font = 'bold ' + (b.h * 0.8) + 'px "Noto Sans SC", sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('███████', b.x + d.offsetX, b.y + d.offsetY);
}

function drawBadge(ctx, text, box, tpl) {
  if (!text || !box) return;
  ctx.fillStyle = '#111111'; ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 18px "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, box.x + box.w / 2, box.y + box.h / 2);
}

// ═══ 挂载 ═══
window.TEMPLATE_LIBRARY = window.TEMPLATE_LIBRARY || {};
window.loadTemplate = loadTemplate;
window.renderTemplate = renderTemplate;
window.fitTextIntoBox = fitTextIntoBox;
