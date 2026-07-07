/**
 * real-style-decorations.js
 * 真实风格族重构 — 装饰系统
 *
 * 职责：
 *   1. buildDecorationPlan — 按风格族生成装饰计划
 *   2. allocateDecorationSlots — 装饰位置分配
 *   3. applyMutualExclusion — 互斥规则
 *   4. drawDecorations — 渲染装饰到 Canvas
 *
 * 纯 Canvas 2D API，不依赖外部图片。
 */

// ═══════════════════════════════════════════════════════════════
// 1. 装饰数量规则
// ═══════════════════════════════════════════════════════════════

const DECORATION_COUNT_RULES = {
  handnote:  [4, 6],
  collage:   [5, 7],
  comic:     [4, 6],
  newspaper: [3, 4],
  minimal:   [0, 1],
};

// ═══════════════════════════════════════════════════════════════
// 2. 工具函数
// ═══════════════════════════════════════════════════════════════

function decoRand(seed) {
  let s = (seed || 1) | 0;
  return function () {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

function pickRandom(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

/** 生成唯一装饰 ID */
let _decoIdCounter = 0;
function decoId(prefix) {
  return (prefix || 'deco') + '_' + (++_decoIdCounter) + '_' + Math.random().toString(36).slice(2, 6);
}

/** 画布尺寸常量 */
const CW = 1242;
const CH = 1656;

// ═══════════════════════════════════════════════════════════════
// 3. 位置分配 allocateDecorationSlots
// ═══════════════════════════════════════════════════════════════

/**
 * 根据装饰数量分配槽位，使用 Fisher-Yates 打乱确保多样。
 */
function allocateDecorationSlots(count, realFamily, seed) {
  const rng = decoRand(seed);
  const allSlots = [
    'topLeft', 'topRight', 'bottomLeft', 'bottomRight',
    'aboveTitle', 'belowTitle', 'aroundKeyword',
  ];

  // 按数量筛选候选
  let candidates;
  if (count <= 1) {
    candidates = ['belowTitle', 'topRight', 'bottomRight'];
  } else if (count === 2) {
    candidates = ['bottomLeft', 'topRight', 'topLeft', 'bottomRight'];
  } else if (count === 3) {
    candidates = ['topLeft', 'bottomRight', 'aroundTitle', 'aboveTitle', 'topRight'];
  } else if (count === 4) {
    candidates = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
  } else if (count === 5) {
    candidates = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'aboveTitle'];
  } else {
    candidates = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'aboveTitle', 'belowTitle'];
  }

  // Fisher-Yates shuffle
  const arr = [...candidates];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, Math.min(count, arr.length));
}

// ═══════════════════════════════════════════════════════════════
// 4. 标题保护区
// ═══════════════════════════════════════════════════════════════

function getTitleSafeRect(titleBox) {
  if (!titleBox) {
    return { x: 100, y: 400, w: 1042, h: 600 };
  }
  return {
    x: titleBox.x - 40,
    y: titleBox.y - 40,
    w: titleBox.w + 80,
    h: titleBox.h + 80,
  };
}

/** 检查装饰是否与标题保护区重叠超过30% */
function overlapsTitleSafe(decoSlot, decoBox, titleSafeRect) {
  if (!decoBox || !titleSafeRect) return false;
  const ax = Math.max(decoBox.x, titleSafeRect.x);
  const ay = Math.max(decoBox.y, titleSafeRect.y);
  const bx = Math.min(decoBox.x + decoBox.w, titleSafeRect.x + titleSafeRect.w);
  const by = Math.min(decoBox.y + decoBox.h, titleSafeRect.y + titleSafeRect.h);
  if (ax >= bx || ay >= by) return false;
  const overlapArea = (bx - ax) * (by - ay);
  const decoArea = decoBox.w * decoBox.h;
  return overlapArea > decoArea * 0.3;
}

// ═══════════════════════════════════════════════════════════════
// 5. 装饰构建器 — 各风格族
// ═══════════════════════════════════════════════════════════════

/** ══════ #3: 大尺寸槽位 ══════ */
function slotToBox(slot) {
  var m = 30;
  switch (slot) {
    case 'topLeft':      return { x: m, y: 40, w: 320, h: 240 };
    case 'topRight':     return { x: CW - m - 320, y: 40, w: 320, h: 240 };
    case 'bottomLeft':   return { x: m, y: CH - 360, w: 320, h: 220 };
    case 'bottomRight':  return { x: CW - m - 320, y: CH - 360, w: 320, h: 220 };
    case 'aboveTitle':   return { x: CW * 0.08, y: 140, w: CW * 0.84, h: 120 };
    case 'belowTitle':   return { x: CW * 0.12, y: CH - 440, w: CW * 0.76, h: 110 };
    case 'aroundKeyword':return { x: CW * 0.18, y: 240, w: CW * 0.64, h: 100 };
    default:             return { x: CW * 0.22, y: CH * 0.55, w: 600, h: 160 };
  }
}

// ── handnote 装饰 ──────────────────────────────────────────

function buildHandnoteDecorations(slots, rng, palette, targetCount) {
  const decorations = [];
  const usedSlots = new Set();

  // ══════ #3 + #5: 强制大胶带 (必选) ══════
  const tapeSlot = pickRandom(slots.filter(s => s.includes('top')), rng) || slots[0] || 'topLeft';
  decorations.push({
    id: decoId('tape'),
    type: 'tape',
    slot: tapeSlot,
    renderLayer: 'above',
    drawInstruction: {
      type: 'rect',
      params: {
        x: tapeSlot.includes('Left') ? 30 : CW - 320,
        y: 35 + rng() * 25,
        w: 220 + rng() * 120,   // ══════ #3: 胶带 220-340px ══════
        h: 32 + rng() * 14,
        color: 'rgba(230,210,170,0.60)',
        rotation: (rng() - 0.5) * 0.10,
      },
    },
  });
  usedSlots.add(tapeSlot);

  // 必选：手绘圈
  const circleSlot = pickRandom(slots.filter(s => s === 'aroundKeyword' || s === 'aboveTitle'), rng) || 'aroundKeyword';
  const circleBox = slotToBox(circleSlot);
  decorations.push({
    id: decoId('handcircle'),
    type: 'doodle',
    slot: circleSlot,
    renderLayer: 'behind',
    drawInstruction: {
      type: 'path',
      params: {
        path: buildEllipsePath(circleBox.x + circleBox.w / 2, circleBox.y + circleBox.h / 2,
                               circleBox.w * 0.45, circleBox.h * 0.4, rng),
        stroke: palette.accent || '#E6213D',
        lineWidth: 2.5,
        dash: [6, 4],
        fill: 'transparent',
      },
    },
  });
  usedSlots.add(circleSlot);

  // 必选：日期/编号标签
  const badgeSlot = pickRandom(slots.filter(s => !usedSlots.has(s) && s.includes('Left')), rng) || 'bottomLeft';
  const badgeBox = slotToBox(badgeSlot);
  decorations.push({
    id: decoId('badge'),
    type: 'badge',
    slot: badgeSlot,
    renderLayer: 'above',
    drawInstruction: {
      type: 'rect',
      params: {
        x: badgeBox.x,
        y: badgeBox.y,
        w: 90 + rng() * 40,
        h: 32,
        color: palette.accent || '#5D4E37',
        radius: 6,
        label: String(Math.floor(rng() * 99) + 1).padStart(2, '0'),
        labelColor: '#FFFFFF',
        fontSize: 16,
      },
    },
  });
  usedSlots.add(badgeSlot);

  // 可选装饰池
  const remainingSlots = slots.filter(s => !usedSlots.has(s));
  const optionalPool = [];

  // 手绘箭头
  if (remainingSlots.length > 0) {
    const arrowSlot = remainingSlots.shift();
    const abox = slotToBox(arrowSlot);
    optionalPool.push({
      id: decoId('arrow'),
      type: 'doodle',
      slot: arrowSlot,
      renderLayer: 'above',
      drawInstruction: {
        type: 'path',
        params: {
          path: buildArrowPath(abox, arrowSlot, rng),
          stroke: palette.text || '#2D2A26',
          lineWidth: 2,
          fill: 'transparent',
        },
      },
    });
  }

  // 荧光笔高亮
  if (remainingSlots.length > 0) {
    const hlSlot = remainingSlots.shift();
    optionalPool.push({
      id: decoId('highlighter'),
      type: 'line',
      slot: hlSlot,
      renderLayer: 'behind',
      drawInstruction: {
        type: 'rect',
        params: {
          x: CW * 0.12,
          y: CH * 0.58 + rng() * 40,
          w: CW * 0.76,
          h: 36 + rng() * 20,
          color: palette.second || '#FFEC47',
          opacity: 0.35,
          radius: 2,
        },
      },
    });
  }

  // emoji
  if (remainingSlots.length > 0) {
    const emojiSlot = remainingSlots.shift();
    const ebox = slotToBox(emojiSlot);
    const emojis = ['⭐', '📌', '✏️', '📖', '💡', '🎯', '📝', '🌟'];
    optionalPool.push({
      id: decoId('emoji'),
      type: 'emoji',
      slot: emojiSlot,
      renderLayer: 'above',
      drawInstruction: {
        type: 'emoji',
        params: {
          x: ebox.x + ebox.w / 2,
          y: ebox.y + ebox.h / 2,
          emoji: pickRandom(emojis, rng),
          fontSize: 80 + rng() * 60,   // ══════ P3: emoji 80-140px ══════
        },
      },
    });
  }

  // 涂鸦星星
  if (remainingSlots.length > 0) {
    const doodleSlot = remainingSlots.shift();
    const dbox = slotToBox(doodleSlot);
    optionalPool.push({
      id: decoId('star'),
      type: 'doodle',
      slot: doodleSlot,
      renderLayer: 'above',
      drawInstruction: {
        type: 'path',
        params: {
          path: buildStarPath(dbox.x + dbox.w / 2, dbox.y + dbox.h / 2, 14 + rng() * 10, 5),
          stroke: palette.accent || '#E6213D',
          lineWidth: 1.5,
          fill: 'transparent',
        },
      },
    });
  }

  // 填充到目标数量
  const needOptional = Math.max(0, targetCount - decorations.length);
  const shuffledOptional = [...optionalPool].sort(() => rng() - 0.5);
  for (let i = 0; i < Math.min(needOptional, shuffledOptional.length); i++) {
    decorations.push(shuffledOptional[i]);
  }

  return decorations;
}

// ── collage 装饰 ──────────────────────────────────────────

function buildCollageDecorations(slots, rng, palette, targetCount) {
  const decorations = [];
  const usedSlots = new Set();

  // 必选：印章
  const stampSlot = pickRandom(slots.filter(s => s.includes('Right')), rng) || 'topRight';
  const sbox = slotToBox(stampSlot);
  decorations.push({
    id: decoId('stamp'),
    type: 'stamp',
    slot: stampSlot,
    renderLayer: 'above',
    drawInstruction: {
      type: 'circle',
      params: {
        cx: sbox.x + sbox.w / 2,
        cy: sbox.y + sbox.h / 2,
        r: 60 + rng() * 60,   // ══════ P3: 印章 80-150px 直径 ══════
        fill: 'transparent',
        stroke: palette.accent || '#E6213D',
        lineWidth: 4,
        label: 'STAMP',
        labelColor: palette.accent || '#E6213D',
        fontSize: 14,
      },
    },
  });
  usedSlots.add(stampSlot);

  // 必选：色块
  const blockSlots = slots.filter(s => !usedSlots.has(s));
  for (let i = 0; i < Math.min(2, blockSlots.length); i++) {
    const bslot = blockSlots[i];
    const bbox = slotToBox(bslot);
    decorations.push({
      id: decoId('block'),
      type: 'rect',
      slot: bslot,
      renderLayer: 'behind',
      drawInstruction: {
        type: 'rect',
        params: {
          x: bbox.x + rng() * 30,
          y: bbox.y + rng() * 20,
          w: 80 + rng() * 120,   // ══════ P3: 色块 80-200px ══════
          h: 60 + rng() * 100,
          color: palette.second || '#2677DE',
          opacity: 0.18 + rng() * 0.1,
          radius: 4,
        },
      },
    });
    usedSlots.add(bslot);
  }

  // 可选
  const remaining = slots.filter(s => !usedSlots.has(s));
  const optCount = Math.min(remaining.length, Math.floor(rng() * 3));
  const optSlots = remaining.slice(0, optCount);

  for (const oslot of optSlots) {
    const obox = slotToBox(oslot);
    const choice = rng();
    if (choice < 0.33) {
      // 胶带
      decorations.push({
        id: decoId('tape'),
        type: 'tape',
        slot: oslot,
        renderLayer: 'above',
        drawInstruction: {
          type: 'rect',
          params: {
            x: obox.x, y: obox.y + rng() * 20,
            w: 140 + rng() * 50, h: 18 + rng() * 8,
            color: 'rgba(225,210,175,0.45)',
            rotation: (rng() - 0.5) * 0.2,
          },
        },
      });
    } else if (choice < 0.66) {
      // emoji
      const emojis = ['🔥', '💥', '⚡', '✨', '📎', '🖇️'];
      decorations.push({
        id: decoId('emoji'),
        type: 'emoji',
        slot: oslot,
        renderLayer: 'above',
        drawInstruction: {
          type: 'emoji',
          params: { x: obox.x + obox.w / 2, y: obox.y + obox.h / 2,
                    emoji: pickRandom(emojis, rng), fontSize: 80 + rng() * 60 },
        },
      });
    } else {
      // ══════ #3: 大箭头代替小圆点 ══════
      decorations.push({
        id: decoId('arrow'),
        type: 'doodle',
        slot: oslot,
        renderLayer: 'above',
        drawInstruction: {
          type: 'path',
          params: {
            path: buildArrowPath(obox, oslot, rng),
            stroke: palette.accent || '#FF6B6B',
            lineWidth: 3,
            fill: 'transparent',
          },
        },
      });
    }
    usedSlots.add(oslot);
  }

  // 填充到目标数量
  while (decorations.length < targetCount) {
    const extraSlots = slots.filter(s => !usedSlots.has(s));
    if (extraSlots.length === 0) break;
    const eslot = extraSlots[0];
    const ebox = slotToBox(eslot);
    decorations.push({
      id: decoId('fill'),
      type: 'rect',
      slot: eslot,
      renderLayer: 'behind',
      drawInstruction: {
        type: 'rect',
        params: {
          x: ebox.x + rng() * 20, y: ebox.y + rng() * 15,
          w: 40 + rng() * 60, h: 40 + rng() * 50,
          color: palette.accent || '#FF6B6B',
          opacity: 0.08 + rng() * 0.08, radius: 3,
        },
      },
    });
    usedSlots.add(eslot);
  }

  return decorations;
}

// ── comic 装饰 ────────────────────────────────────────────

function buildComicDecorations(slots, rng, palette, targetCount) {
  const decorations = [];
  const usedSlots = new Set();

  // 必选：半色调网点（背景层）
  decorations.push({
    id: decoId('halftone'),
    type: 'halftone',
    slot: 'background',
    renderLayer: 'background',
    drawInstruction: {
      type: 'path',
      params: {
        type: 'halftoneGrid',
        density: 14,
        dotSize: 2.5,
        color: palette.text || '#111111',
        opacity: 0.08,
      },
    },
  });

  // 必选：放射线/速度线
  const burstSlot = pickRandom(slots.filter(s => s === 'aboveTitle' || s === 'belowTitle'), rng) || 'aboveTitle';
  decorations.push({
    id: decoId('burst'),
    type: 'burst',
    slot: burstSlot,
    renderLayer: 'behind',
    drawInstruction: {
      type: 'path',
      params: {
        type: 'radialLines',
        cx: CW / 2,
        cy: burstSlot === 'aboveTitle' ? CH * 0.38 : CH * 0.65,
        count: 16 + Math.floor(rng() * 8),
        innerR: 80,
        outerR: 500 + rng() * 200,
        stroke: palette.accent || '#FFFFFF',
        lineWidth: 2,
        opacity: 0.3,
      },
    },
  });
  usedSlots.add(burstSlot);

  // 可选
  const remaining = slots.filter(s => !usedSlots.has(s));
  const optCount = Math.min(remaining.length, Math.floor(rng() * 3));
  const optSlots = remaining.slice(0, optCount);

  for (const oslot of optSlots) {
    const obox = slotToBox(oslot);
    const choice = rng();
    if (choice < 0.3) {
      // 对话气泡（小）
      decorations.push({
        id: decoId('bubble'),
        type: 'bubble',
        slot: oslot,
        renderLayer: 'above',
        drawInstruction: {
          type: 'path',
          params: {
            type: 'smallBubble',
            cx: obox.x + obox.w / 2, cy: obox.y + obox.h / 2,
            rx: 40 + rng() * 30, ry: 28 + rng() * 20,
            fill: '#FFFFFF',
            stroke: palette.text || '#111111',
            lineWidth: 2.5,
          },
        },
      });
    } else if (choice < 0.6) {
      // 拟声词
      const sfxWords = ['啪!', '咚!', 'BAM', 'WOW', 'POP', 'BOOM', 'ザッ'];
      decorations.push({
        id: decoId('sfx'),
        type: 'sfx',
        slot: oslot,
        renderLayer: 'above',
        drawInstruction: {
          type: 'text',
          params: {
            x: obox.x + obox.w / 2, y: obox.y + obox.h / 2,
            text: pickRandom(sfxWords, rng),
            fontSize: 36 + rng() * 28,
            color: palette.accent || '#FF4FD8',
            rotation: (rng() - 0.5) * 0.3,
            bold: true,
          },
        },
      });
    } else {
      // 星爆
      decorations.push({
        id: decoId('starburst'),
        type: 'burst',
        slot: oslot,
        renderLayer: 'above',
        drawInstruction: {
          type: 'path',
          params: {
            type: 'starBurst',
            cx: obox.x + obox.w / 2, cy: obox.y + obox.h / 2,
            outerR: 18 + rng() * 16,
            innerR: 6 + rng() * 6,
            spikes: 6 + Math.floor(rng() * 4),
            fill: palette.accent || '#FFEC47',
            stroke: palette.text || '#111111',
            lineWidth: 1.5,
          },
        },
      });
    }
    usedSlots.add(oslot);
  }

  // 填充到目标数量
  while (decorations.length < targetCount) {
    const extraSlots = slots.filter(s => !usedSlots.has(s));
    if (extraSlots.length === 0) break;
    const eslot = extraSlots[0];
    const ebox = slotToBox(eslot);
    decorations.push({
      id: decoId('fill'),
      type: 'burst',
      slot: eslot,
      renderLayer: 'above',
      drawInstruction: {
        type: 'path',
        params: {
          type: 'starBurst',
          cx: ebox.x + ebox.w / 2, cy: ebox.y + ebox.h / 2,
          outerR: 12 + rng() * 10, innerR: 4 + rng() * 4,
          spikes: 6 + Math.floor(rng() * 3),
          fill: palette.accent || '#FFEC47',
          stroke: palette.text || '#111111',
          lineWidth: 1, opacity: 0.5,
        },
      },
    });
    usedSlots.add(eslot);
  }

  return decorations;
}

// ── newspaper 装饰 ────────────────────────────────────────

function buildNewspaperDecorations(slots, rng, palette, targetCount) {
  const decorations = [];
  const usedSlots = new Set();

  // 必选：分割线
  const lineSlot = pickRandom(slots.filter(s => s === 'belowTitle' || s === 'aboveTitle'), rng) || 'belowTitle';
  const lbox = slotToBox(lineSlot);
  decorations.push({
    id: decoId('divider'),
    type: 'line',
    slot: lineSlot,
    renderLayer: 'behind',
    drawInstruction: {
      type: 'line',
      params: {
        x1: lbox.x, y1: lbox.y + lbox.h / 2,
        x2: lbox.x + lbox.w, y2: lbox.y + lbox.h / 2,
        stroke: palette.text || '#111111',
        lineWidth: 1.5,
        opacity: 0.3,
      },
    },
  });
  usedSlots.add(lineSlot);

  // 必选：编号标签
  const badgeSlot = pickRandom(slots.filter(s => !usedSlots.has(s)), rng) || 'topRight';
  const bbox = slotToBox(badgeSlot);
  decorations.push({
    id: decoId('badge'),
    type: 'badge',
    slot: badgeSlot,
    renderLayer: 'above',
    drawInstruction: {
      type: 'text',
      params: {
        x: bbox.x + bbox.w / 2, y: bbox.y + bbox.h / 2,
        text: 'NO.' + String(Math.floor(rng() * 99) + 1).padStart(2, '0'),
        fontSize: 18,
        color: palette.accent || '#B0823B',
        bold: true,
      },
    },
  });
  usedSlots.add(badgeSlot);

  // 可选（最多1个）
  const remaining = slots.filter(s => !usedSlots.has(s));
  if (remaining.length > 0 && rng() > 0.4) {
    const oslot = remaining[0];
    const obox = slotToBox(oslot);
    if (rng() < 0.5) {
      // 印章
      decorations.push({
        id: decoId('stamp'),
        type: 'stamp',
        slot: oslot,
        renderLayer: 'above',
        drawInstruction: {
          type: 'circle',
          params: {
            cx: obox.x + obox.w / 2, cy: obox.y + obox.h / 2,
            r: 32 + rng() * 14,
            fill: 'transparent',
            stroke: palette.accent || '#C8252C',
            lineWidth: 2.5,
            label: '印',
            labelColor: palette.accent || '#C8252C',
            fontSize: 20,
          },
        },
      });
    } else {
      // 小圆点
      decorations.push({
        id: decoId('dot'),
        type: 'dot',
        slot: oslot,
        renderLayer: 'above',
        drawInstruction: {
          type: 'dot',
          params: { cx: obox.x + obox.w / 2, cy: obox.y + obox.h / 2,
                    r: 4 + rng() * 5, color: palette.accent || '#B0823B' },
        },
      });
    }
  }

  // 填充到目标数量
  while (decorations.length < targetCount) {
    const extraSlots = slots.filter(s => !usedSlots.has(s));
    if (extraSlots.length === 0) break;
    const eslot = extraSlots[0];
    const ebox = slotToBox(eslot);
    decorations.push({
      id: decoId('line'),
      type: 'line',
      slot: eslot,
      renderLayer: 'behind',
      drawInstruction: {
        type: 'line',
        params: {
          x1: ebox.x + 10, y1: ebox.y + ebox.h / 2,
          x2: ebox.x + ebox.w - 10, y2: ebox.y + ebox.h / 2,
          stroke: palette.text || '#111111',
          lineWidth: 0.8, opacity: 0.15,
        },
      },
    });
    usedSlots.add(eslot);
  }

  return decorations;
}

// ── minimal 装饰 ──────────────────────────────────────────

function buildMinimalDecorations(slots, rng, palette) {
  const decorations = [];
  // minimal 只有0-1个装饰
  if (slots.length === 0 || rng() > 0.5) return decorations;

  const oslot = slots[0];
  const obox = slotToBox(oslot);
  if (rng() < 0.4) {
    // 小圆点
    decorations.push({
      id: decoId('dot'),
      type: 'dot',
      slot: oslot,
      renderLayer: 'above',
      drawInstruction: {
        type: 'dot',
        params: { cx: obox.x + obox.w / 2, cy: obox.y + obox.h / 2,
                  r: 5 + rng() * 6, color: palette.accent || palette.text || '#111111' },
      },
    });
  } else if (rng() < 0.7) {
    // 短横线
    decorations.push({
      id: decoId('line'),
      type: 'line',
      slot: oslot,
      renderLayer: 'above',
      drawInstruction: {
        type: 'line',
        params: {
          x1: obox.x + obox.w * 0.25, y1: obox.y + obox.h / 2,
          x2: obox.x + obox.w * 0.75, y2: obox.y + obox.h / 2,
          stroke: palette.accent || '#2AB673',
          lineWidth: 3,
        },
      },
    });
  } else {
    // 极细边框 (不放在角落，放在 aroundKeyword)
    decorations.push({
      id: decoId('frame'),
      type: 'line',
      slot: oslot,
      renderLayer: 'behind',
      drawInstruction: {
        type: 'rect',
        params: {
          x: CW * 0.10, y: CH * 0.32,
          w: CW * 0.80, h: CH * 0.40,
          color: 'transparent',
          stroke: 'rgba(0,0,0,0.08)',
          lineWidth: 1,
          radius: 0,
        },
      },
    });
  }

  return decorations;
}

// ═══════════════════════════════════════════════════════════════
// 6. 互斥规则 applyMutualExclusion
// ═══════════════════════════════════════════════════════════════

function applyMutualExclusion(plan, realFamily, titleBox) {
  const allDecos = [
    ...plan.backgroundDecorations,
    ...plan.behindTextDecorations,
    ...plan.aboveTextDecorations,
    ...plan.cornerDecorations,
  ];

  const titleSafeRect = getTitleSafeRect(titleBox);
  const newAll = [];
  const slotUsed = new Map();  // slot -> decoration

  // 计数器
  let stickerCount = 0;
  let emojiCount = 0;
  let doodleCount = 0;

  for (const deco of allDecos) {
    // 规则1：sticker 最多1个
    if (deco.type === 'sticker') {
      if (stickerCount >= 1) continue;
      stickerCount++;
    }

    // 规则2：emoji 最多2个
    if (deco.type === 'emoji') {
      if (emojiCount >= 2) continue;
      emojiCount++;
    }

    // 规则5：handnote 手绘元素最多3个
    if (realFamily === 'handnote' && deco.type === 'doodle') {
      if (doodleCount >= 3) continue;
      doodleCount++;
    }

    // 规则3：同一角落最多1个主装饰
    if (deco.slot && deco.slot !== 'background') {
      if (slotUsed.has(deco.slot) && (deco.type === 'stamp' || deco.type === 'tape')) {
        continue; // 跳过冲突的主装饰
      }
      slotUsed.set(deco.slot, deco);
    }

    // 规则4 + 6：装饰不得进入标题保护区
    const decoBox = slotToBox(deco.slot || '');
    if (overlapsTitleSafe(deco.slot, decoBox, titleSafeRect) && realFamily !== 'minimal') {
      // 非 minimal 风格的装饰如果严重重叠，跳过
      continue;
    }

    // minimal 任何装饰不得遮挡主标题
    if (realFamily === 'minimal' && overlapsTitleSafe(deco.slot, decoBox, titleSafeRect)) {
      continue;
    }

    newAll.push(deco);
  }

  // 将结果按原分类放回
  // 简化：将过滤后的装饰全部放到 aboveTextDecorations
  // 保持原有分层信息的装饰放回原数组
  plan.backgroundDecorations = newAll.filter(d => d.renderLayer === 'background');
  plan.behindTextDecorations = newAll.filter(d => d.renderLayer === 'behind');
  const above = newAll.filter(d => d.renderLayer === 'above');
  plan.aboveTextDecorations = above.filter(d => !d.slot || !d.slot.includes('corner'));
  plan.cornerDecorations = above.filter(d => d.slot && d.slot.includes('corner'));
  // 保持 stickers 不变
}

// ═══════════════════════════════════════════════════════════════
// 7. buildDecorationPlan — 主入口
// ═══════════════════════════════════════════════════════════════

function buildDecorationPlan(realFamily, subStyle, layoutId, centerShape, content, seed) {
  const rng = decoRand(seed);
  const range = DECORATION_COUNT_RULES[realFamily] || [1, 3];
  const targetCount = range[0] + Math.floor(rng() * (range[1] - range[0] + 1));

  const plan = {
    backgroundDecorations: [],
    behindTextDecorations: [],
    aboveTextDecorations: [],
    cornerDecorations: [],
    stickers: [],
  };

  if (targetCount === 0) return plan;

  // 获取可用的全部槽位（扩充以容纳 targetCount）
  const centerSlots = (centerShape && centerShape.decorationSlots) || [];
  const allPossibleSlots = centerSlots.length >= targetCount
    ? centerSlots
    : [...new Set([...centerSlots, 'topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'aboveTitle', 'belowTitle', 'aroundKeyword'])];

  // 分配槽位（分配足够数量以覆盖 targetCount）
  const slots = allocateDecorationSlots(Math.max(targetCount, allPossibleSlots.length >= targetCount ? targetCount : allPossibleSlots.length), realFamily, seed + 1);

  // 根据风格族委托 —— 传入 targetCount 让构建器知道目标数量
  const palette = (subStyle && subStyle.palette) || {};
  let decorations;
  switch (realFamily) {
    case 'handnote':  decorations = buildHandnoteDecorations(slots, rng, palette, targetCount); break;
    case 'collage':   decorations = buildCollageDecorations(slots, rng, palette, targetCount); break;
    case 'comic':     decorations = buildComicDecorations(slots, rng, palette, targetCount); break;
    case 'newspaper': decorations = buildNewspaperDecorations(slots, rng, palette, targetCount); break;
    case 'minimal':   decorations = buildMinimalDecorations(slots, rng, palette); break;
    default:          decorations = [];
  }

  // 按 renderLayer 分类
  for (const d of decorations) {
    switch (d.renderLayer) {
      case 'background': plan.backgroundDecorations.push(d); break;
      case 'behind':     plan.behindTextDecorations.push(d); break;
      case 'above':
        if (d.slot && (d.slot.includes('Left') || d.slot.includes('Right'))) {
          plan.cornerDecorations.push(d);
        } else {
          plan.aboveTextDecorations.push(d);
        }
        break;
      default: plan.aboveTextDecorations.push(d);
    }
  }

  return plan;
}

// ═══════════════════════════════════════════════════════════════
// 8. drawDecorations — 渲染装饰
// ═══════════════════════════════════════════════════════════════

function drawDecorations(ctx, decorations, palette) {
  if (!decorations || decorations.length === 0) return;

  for (const deco of decorations) {
    if (!deco || !deco.drawInstruction) continue;
    const inst = deco.drawInstruction;
    const params = inst.params || {};

    ctx.save();
    try {
      switch (inst.type) {
        case 'rect':
          drawDecoRect(ctx, params);
          break;
        case 'circle':
          drawDecoCircle(ctx, params);
          break;
        case 'line':
          drawDecoLine(ctx, params);
          break;
        case 'dot':
          drawDecoDot(ctx, params);
          break;
        case 'text':
          drawDecoText(ctx, params);
          break;
        case 'emoji':
          drawDecoEmoji(ctx, params);
          break;
        case 'path':
          drawDecoPath(ctx, params);
          break;
        case 'sticker':
          // 接入现有贴纸系统
          if (params.stickerId) {
            try {
              if (typeof window.drawStickerImage === 'function') {
                window.drawStickerImage(ctx, params.stickerId, params.x || 0, params.y || 0, params.w || 160, params.h || 160);
              } else if (typeof drawStickerImage === 'function') {
                drawStickerImage(ctx, params.stickerId, params.x || 0, params.y || 0, params.w || 160, params.h || 160);
              }
            } catch (e) {
              // 贴纸加载失败静默跳过
            }
          }
          break;
        default:
          break;
      }
    } catch (e) {
      // 装饰渲染失败不影响整体
    }
    ctx.restore();
  }
}

// ── 各类型绘制实现 ──────────────────────────────────────────

function drawDecoRect(ctx, p) {
  if (p.opacity !== undefined) ctx.globalAlpha = p.opacity;
  if (p.rotation) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(p.rotation);
    ctx.translate(-cx, -cy);
  }
  if (p.color && p.color !== 'transparent') {
    ctx.fillStyle = p.color;
    if (p.radius > 0) {
      roundRectPath(ctx, p.x, p.y, p.w, p.h, p.radius);
      ctx.fill();
    } else {
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
  }
  if (p.stroke && p.stroke !== 'transparent') {
    ctx.strokeStyle = p.stroke;
    ctx.lineWidth = p.lineWidth || 1;
    if (p.radius > 0) {
      roundRectPath(ctx, p.x, p.y, p.w, p.h, p.radius);
      ctx.stroke();
    } else {
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }
  }
  if (p.label) {
    ctx.fillStyle = p.labelColor || '#FFFFFF';
    ctx.font = `${p.fontSize || 14}px "Noto Sans SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.label, p.x + p.w / 2, p.y + p.h / 2);
  }
  if (p.opacity !== undefined) ctx.globalAlpha = 1;
}

function drawDecoCircle(ctx, p) {
  ctx.beginPath();
  ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
  if (p.fill && p.fill !== 'transparent') {
    ctx.fillStyle = p.fill;
    ctx.fill();
  }
  if (p.stroke && p.stroke !== 'transparent') {
    ctx.strokeStyle = p.stroke;
    ctx.lineWidth = p.lineWidth || 1;
    ctx.stroke();
  }
  if (p.label) {
    ctx.fillStyle = p.labelColor || '#000000';
    ctx.font = `${p.fontSize || 14}px "Noto Sans SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.label, p.cx, p.cy);
  }
}

function drawDecoLine(ctx, p) {
  ctx.strokeStyle = p.stroke || '#000000';
  ctx.lineWidth = p.lineWidth || 1;
  if (p.opacity !== undefined) ctx.globalAlpha = p.opacity;
  ctx.beginPath();
  ctx.moveTo(p.x1, p.y1);
  ctx.lineTo(p.x2, p.y2);
  ctx.stroke();
}

function drawDecoDot(ctx, p) {
  ctx.fillStyle = p.color || '#000000';
  ctx.beginPath();
  ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
  ctx.fill();
}

function drawDecoText(ctx, p) {
  if (p.rotation) {
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.translate(-p.x, -p.y);
  }
  ctx.fillStyle = p.color || '#000000';
  ctx.font = `${p.bold ? 'bold ' : ''}${p.fontSize || 18}px "Noto Sans SC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.text, p.x, p.y);
}

function drawDecoEmoji(ctx, p) {
  ctx.font = `${p.fontSize || 48}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.emoji, p.x, p.y);
}

function drawDecoPath(ctx, p) {
  if (p.opacity !== undefined) ctx.globalAlpha = p.opacity;

  switch (p.type) {
    case 'halftoneGrid': {
      const density = p.density || 14;
      const dotSize = p.dotSize || 2;
      ctx.fillStyle = p.color || '#000000';
      for (let x = density; x < CW; x += density) {
        for (let y = density; y < CH; y += density) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'radialLines': {
      ctx.strokeStyle = p.stroke || '#000000';
      ctx.lineWidth = p.lineWidth || 1;
      const count = p.count || 16;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(p.cx + Math.cos(angle) * p.innerR, p.cy + Math.sin(angle) * p.innerR);
        ctx.lineTo(p.cx + Math.cos(angle) * p.outerR, p.cy + Math.sin(angle) * p.outerR);
        ctx.stroke();
      }
      break;
    }
    case 'smallBubble': {
      ctx.fillStyle = p.fill || '#FFFFFF';
      ctx.strokeStyle = p.stroke || '#000000';
      ctx.lineWidth = p.lineWidth || 2;
      ctx.beginPath();
      ctx.ellipse(p.cx, p.cy, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 小三角
      ctx.beginPath();
      ctx.moveTo(p.cx - 10, p.cy + p.ry - 2);
      ctx.lineTo(p.cx, p.cy + p.ry + 14);
      ctx.lineTo(p.cx + 10, p.cy + p.ry - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'starBurst': {
      ctx.fillStyle = p.fill || '#FFEC47';
      ctx.strokeStyle = p.stroke || '#111111';
      ctx.lineWidth = p.lineWidth || 1.5;
      const spikes = p.spikes || 8;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? p.outerR : p.innerR;
        const px = p.cx + Math.cos(angle) * r;
        const py = p.cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    default: {
      // 通用路径
      if (p.path) {
        ctx.strokeStyle = p.stroke || '#000000';
        ctx.lineWidth = p.lineWidth || 1;
        if (p.dash) ctx.setLineDash(p.dash);
        ctx.stroke(p.path);
        if (p.fill && p.fill !== 'transparent') {
          ctx.fillStyle = p.fill;
          ctx.fill(p.path);
        }
        ctx.setLineDash([]);
      }
      break;
    }
  }

  if (p.opacity !== undefined) ctx.globalAlpha = 1;
}

// ═══════════════════════════════════════════════════════════════
// 9. 路径构建工具
// ═══════════════════════════════════════════════════════════════

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

function buildEllipsePath(cx, cy, rx, ry, rng) {
  const path = new Path2D();
  // 手绘感：轻微不规则
  const segments = 20;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const jx = cx + Math.cos(angle) * (rx + (rng ? (rng() - 0.5) * 8 : 0));
    const jy = cy + Math.sin(angle) * (ry + (rng ? (rng() - 0.5) * 6 : 0));
    if (i === 0) path.moveTo(jx, jy);
    else path.lineTo(jx, jy);
  }
  path.closePath();
  return path;
}

function buildArrowPath(box, slot, rng) {
  const path = new Path2D();
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  // 箭头方向由槽位决定
  let dx = 0, dy = 0;
  if (slot.includes('Left')) { dx = 1; dy = (rng() - 0.5) * 0.8; }
  else if (slot.includes('Right')) { dx = -1; dy = (rng() - 0.5) * 0.8; }
  else if (slot.includes('Top')) { dx = (rng() - 0.5) * 0.8; dy = 1; }
  else { dx = (rng() - 0.5) * 0.8; dy = -1; }
  const len = 50 + rng() * 40;
  const ex = cx + dx * len, ey = cy + dy * len;
  path.moveTo(cx, cy);
  path.quadraticCurveTo(cx + dx * len * 0.6, cy + dy * len * 0.3, ex, ey);
  // 箭头尖
  const angle = Math.atan2(ey - cy, ex - cx);
  const arrowLen = 14;
  path.moveTo(ex, ey);
  path.lineTo(ex - Math.cos(angle - 0.6) * arrowLen, ey - Math.sin(angle - 0.6) * arrowLen);
  path.moveTo(ex, ey);
  path.lineTo(ex - Math.cos(angle + 0.6) * arrowLen, ey - Math.sin(angle + 0.6) * arrowLen);
  return path;
}

function buildStarPath(cx, cy, outerR, spikes) {
  const path = new Path2D();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : outerR * 0.4;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) path.moveTo(px, py);
    else path.lineTo(px, py);
  }
  path.closePath();
  return path;
}

// ═══════════════════════════════════════════════════════════════
// 10. 挂载到 window
// ═══════════════════════════════════════════════════════════════

window.DECORATION_COUNT_RULES = DECORATION_COUNT_RULES;
window.buildDecorationPlan = buildDecorationPlan;
window.allocateDecorationSlots = allocateDecorationSlots;
window.applyMutualExclusion = applyMutualExclusion;
window.drawDecorations = drawDecorations;
window.getTitleSafeRect = getTitleSafeRect;

/*
 * ─── 验证命令（浏览器控制台）───
 *
 * const testContent = { mainTitle: '测试标题', subTitle: '副标题', keyword: '测试', badgeText: '', footerText: '', rawText: '测试标题' };
 *
 * // 测试 handnote 装饰
 * const plan1 = buildDecorationPlan('handnote', REAL_SUBSTYLE_CONFIGS.creamNotebook, 'handnoteTape', null, testContent, 42);
 * console.log('handnote:', {
 *   bg: plan1.backgroundDecorations.length,
 *   behind: plan1.behindTextDecorations.length,
 *   above: plan1.aboveTextDecorations.length,
 *   corner: plan1.cornerDecorations.length,
 *   total: plan1.backgroundDecorations.length + plan1.behindTextDecorations.length + plan1.aboveTextDecorations.length + plan1.cornerDecorations.length,
 * });
 *
 * // 测试 minimal (0-1个)
 * const plan2 = buildDecorationPlan('minimal', REAL_SUBSTYLE_CONFIGS.cleanQuote, 'minimalCenter', null, testContent, 99);
 * const totalMin = plan2.backgroundDecorations.length + plan2.behindTextDecorations.length + plan2.aboveTextDecorations.length + plan2.cornerDecorations.length;
 * console.log('minimal total:', totalMin, '(expected ≤ 1)');
 *
 * // 测试位置分配
 * console.log('slots 4:', allocateDecorationSlots(4, 'collage', 42));
 * console.log('slots 2:', allocateDecorationSlots(2, 'comic', 123));
 * console.log('slots 1:', allocateDecorationSlots(1, 'minimal', 7));
 *
 * // 测试互斥规则
 * const plan3 = buildDecorationPlan('comic', REAL_SUBSTYLE_CONFIGS.yellowWarning, 'comicBurst', null, testContent, 100);
 * console.log('comic (before exclusion):', plan3);
 * applyMutualExclusion(plan3, 'comic', { x: 200, y: 500, w: 800, h: 400 });
 * console.log('comic (after exclusion):', plan3);
 */
