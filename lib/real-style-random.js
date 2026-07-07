/**
 * real-style-random.js
 * 真实风格族重构 — 随机性控制与去雷同机制
 *
 * 职责：
 *   1. 稳定哈希种子（同一输入永远同一输出）
 *   2. 结构签名（检测不同候选图是否结构雷同）
 *   3. 去重约束器（同文案内去重 + 跨文案去重）
 *   4. 抖动函数（候选参数微调，确保多样性）
 *   5. 风格族随机边界（限制随机范围，不破坏风格特征）
 */

// ═══════════════════════════════════════════════════════════════
// 1. 稳定哈希函数（确定性，跨平台一致）
// ═══════════════════════════════════════════════════════════════

function stableHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 基于文本、索引和全局种子的稳定哈希种子。
 * 覆盖 typography.js 中的同名函数，使用更稳健的 djb2 算法。
 */
function getTextSeed(text, textIndex, globalSeed) {
  return stableHash((text || '') + '::text::' + (textIndex || 0) + '::seed::' + (globalSeed || 0));
}

/** 从文案种子衍生候选种子 */
function getCandidateSeed(textSeed, candidateIndex) {
  return stableHash(String(textSeed) + '::candidate::' + (candidateIndex || 0));
}

/** 从候选种子衍生变体种子（用于抖动） */
function getVariantSeed(candidateSeed, variantType) {
  return stableHash(String(candidateSeed) + '::variant::' + (variantType || 'jitter'));
}

// ═══════════════════════════════════════════════════════════════
// 2. 结构签名（检测雷同）
// ═══════════════════════════════════════════════════════════════

/**
 * 从渲染计划中提取结构签名。
 * 用于判断两张封面是否"看起来一样"。
 */
function getCompositionSignature(plan) {
  if (!plan) return '';
  return [
    plan.realFamily || '',
    plan.layoutId || '',
    plan.centerShapeId || '',
    (plan.decorationSlots || []).slice().sort().join(','),
    plan.titleAlignment || '',
    plan.titlePositionKey || '',
    plan.badgePosition || '',
    plan.footerPosition || '',
  ].join('|');
}

/**
 * 从候选配置直接计算结构键（无需先渲染）。
 * 基于 family + variant → layout + centerShape 的确定性推导。
 */
function getCompositionKey(candidate) {
  if (!candidate) return '';
  try {
    const map = (window.REAL_STYLE_MAP && window.REAL_STYLE_MAP[candidate.family])
      || { realFamily: 'handnote' };
    const realFamily = map.realFamily || 'handnote';
    const layout = window.selectLayout
      ? window.selectLayout(realFamily, candidate.vi || 0)
      : { id: 'unknown' };
    const shape = window.selectCenterShape
      ? window.selectCenterShape(realFamily, candidate.family, candidate.vi || 0, candidate.seed || 0)
      : { id: 'unknown' };
    return [realFamily, layout.id, shape.id, String(candidate.vi || 0)].join('|');
  } catch (e) {
    return (candidate.family || '?') + '|' + (candidate.vi || 0) + '|' + (candidate.seed || 0);
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. 去重约束器
// ═══════════════════════════════════════════════════════════════

function createDeduplicationContext() {
  const recentSignatures = new Set();
  const recentCenterShapes = new Map(); // realFamily → [最近6个shapeId]

  return {
    register(signature, realFamily, centerShapeId) {
      recentSignatures.add(signature);
      if (realFamily) {
        if (!recentCenterShapes.has(realFamily)) {
          recentCenterShapes.set(realFamily, []);
        }
        const arr = recentCenterShapes.get(realFamily);
        if (centerShapeId) arr.push(centerShapeId);
        if (arr.length > 6) arr.shift();
      }
    },

    isDuplicate(signature) {
      return recentSignatures.has(signature);
    },

    getRecentShapes(realFamily) {
      return recentCenterShapes.get(realFamily) || [];
    },

    clear() {
      recentSignatures.clear();
      recentCenterShapes.clear();
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// 4. 抖动函数
// ═══════════════════════════════════════════════════════════════

/**
 * 如果候选的结构签名已存在，通过微调 vi/seed 来产生新结构。
 * 最多重试 maxRetries 次，避免无限循环。
 */
function jitterCandidate(candidate, dedupContext, maxRetries) {
  maxRetries = maxRetries || 5;
  const current = {
    textIndex: candidate.textIndex,
    candidateIndex: candidate.candidateIndex,
    family: candidate.family,
    vi: candidate.vi,
    seed: candidate.seed,
    _text: candidate._text,
  };

  for (let retries = 0; retries < maxRetries; retries++) {
    const key = getCompositionKey(current);
    if (!dedupContext.isDuplicate(key)) {
      return current;
    }
    // 策略：奇数轮换 vi（换layout），偶数轮换 seed（换centerShape）
    if (retries % 2 === 0) {
      current.vi = (current.vi + 1 + retries) % 5;
    } else {
      current.seed = getVariantSeed(current.seed, 'jitter_' + retries);
    }
  }

  // 兜底：用时间戳强制不同
  current.seed = getVariantSeed(candidate.seed || 0, 'forced_' + Date.now());
  return current;
}

// ═══════════════════════════════════════════════════════════════
// 5. 去重流程
// ═══════════════════════════════════════════════════════════════

/**
 * 同一文案内部的候选去重。
 * 保证30张候选在 layout + centerShape 组合上有明显差异。
 */
function deduplicateCandidatesForText(candidates) {
  if (!candidates || candidates.length === 0) return [];
  const dedup = createDeduplicationContext();
  const result = [];

  for (const candidate of candidates) {
    const key = getCompositionKey(candidate);
    if (!dedup.isDuplicate(key)) {
      dedup.register(key, null, null);
      result.push(candidate);
    } else {
      const jittered = jitterCandidate(candidate, dedup);
      const newKey = getCompositionKey(jittered);
      dedup.register(newKey, null, null);
      result.push(jittered);
    }
  }

  return result;
}

/**
 * 跨文案去重：不同文案之间也应避免完全相同结构。
 * allTextCandidates: [[cand_t0, ...], [cand_t1, ...], ...]
 */
function deduplicateAcrossTexts(allTextCandidates) {
  if (!allTextCandidates || allTextCandidates.length === 0) return [];
  const globalDedup = createDeduplicationContext();
  const result = [];

  for (const textCandidates of allTextCandidates) {
    const deduped = [];
    for (const candidate of textCandidates) {
      const key = getCompositionKey(candidate);
      if (!globalDedup.isDuplicate(key)) {
        globalDedup.register(key, null, null);
        deduped.push(candidate);
      } else {
        const jittered = jitterCandidate(candidate, globalDedup);
        const newKey = getCompositionKey(jittered);
        globalDedup.register(newKey, null, null);
        deduped.push(jittered);
      }
    }
    result.push(deduped);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// 6. 风格族随机边界
// ═══════════════════════════════════════════════════════════════

const FAMILY_RANDOMIZATION_BOUNDS = {
  handnote: {
    allowedJitterDimensions: ['centerShapeId', 'decorationPosition', 'paperTexture'],
    requiredElements: ['paperBackground', 'handDrawnElement'],
    maxRotation: 3,
  },
  collage: {
    allowedJitterDimensions: ['paperLayers', 'stampPosition', 'arrowDirection', 'colorBlockPosition'],
    requiredElements: ['paperLayers', 'stamp'],
    maxRotation: 8,
  },
  comic: {
    allowedJitterDimensions: ['burstPosition', 'bubblePosition', 'emojiPosition', 'halftoneDensity'],
    requiredElements: ['boldStroke', 'popElement'],
    maxRotation: 5,
  },
  newspaper: {
    allowedJitterDimensions: ['columnLayout', 'stampPosition', 'dividerPosition', 'labelPosition'],
    requiredElements: ['divider', 'label'],
    maxRotation: 2,
  },
  minimal: {
    allowedJitterDimensions: ['alignment', 'bleedAmount', 'dotPosition'],
    requiredElements: [],
    maxRotation: 0,
  },
};

function checkRequiredElement(plan, elementName) {
  if (!plan) return false;
  const allDecorations = [
    ...(plan.backgroundDecorations || []),
    ...(plan.behindTextDecorations || []),
    ...(plan.aboveTextDecorations || []),
    ...(plan.cornerDecorations || []),
  ];

  switch (elementName) {
    case 'paperBackground':
      return allDecorations.some(function (d) { return d.type === 'tape' || d.type === 'doodle'; });
    case 'handDrawnElement':
      return allDecorations.some(function (d) { return d.type === 'doodle'; });
    case 'paperLayers':
      return allDecorations.some(function (d) { return d.type === 'stamp' || d.type === 'rect'; });
    case 'stamp':
      return allDecorations.some(function (d) { return d.type === 'stamp'; });
    case 'boldStroke':
      return true; // 标题描边在 typography 中处理
    case 'popElement':
      return allDecorations.some(function (d) {
        return d.type === 'bubble' || d.type === 'burst' || d.type === 'sfx' || d.type === 'emoji';
      });
    case 'divider':
      return allDecorations.some(function (d) { return d.type === 'line'; });
    case 'label':
      return allDecorations.some(function (d) { return d.type === 'badge'; });
    default:
      return true;
  }
}

function validateFamilyBounds(plan, realFamily) {
  var bounds = FAMILY_RANDOMIZATION_BOUNDS[realFamily];
  if (!bounds) return true;

  for (var i = 0; i < bounds.requiredElements.length; i++) {
    var required = bounds.requiredElements[i];
    if (!checkRequiredElement(plan, required)) {
      console.warn('风格族 ' + realFamily + ' 缺少必需元素: ' + required);
      return false;
    }
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════
// 7. 挂载到 window
// ═══════════════════════════════════════════════════════════════

window.stableHash = stableHash;
window.getTextSeed = getTextSeed;   // 覆盖 typography.js 中的版本
window.getCandidateSeed = getCandidateSeed;
window.getVariantSeed = getVariantSeed;
window.getCompositionSignature = getCompositionSignature;
window.getCompositionKey = getCompositionKey;
window.createDeduplicationContext = createDeduplicationContext;
window.jitterCandidate = jitterCandidate;
window.deduplicateCandidatesForText = deduplicateCandidatesForText;
window.deduplicateAcrossTexts = deduplicateAcrossTexts;
window.FAMILY_RANDOMIZATION_BOUNDS = FAMILY_RANDOMIZATION_BOUNDS;
window.validateFamilyBounds = validateFamilyBounds;
window.checkRequiredElement = checkRequiredElement;

/*
 * ─── 验证命令（浏览器控制台）───
 *
 * // 测试哈希稳定性
 * const s1 = getTextSeed('测试文案', 0, 42);
 * const s2 = getTextSeed('测试文案', 0, 42);
 * console.log('哈希稳定:', s1 === s2, '(expected true)');
 *
 * // 不同文案种子不同
 * const s3 = getTextSeed('不同文案', 0, 42);
 * console.log('不同文案种子不同:', s1 !== s3, '(expected true)');
 *
 * // 结构签名
 * const sig1 = getCompositionKey({ family: 'A', vi: 0, seed: 42 });
 * const sig2 = getCompositionKey({ family: 'A', vi: 0, seed: 42 });
 * console.log('同结构同签名:', sig1 === sig2, '(expected true)');
 *
 * // 去重上下文
 * const ctx = createDeduplicationContext();
 * ctx.register('A|handnoteTape|lined-note|0', 'handnote', 'lined-note');
 * console.log('重复检测:', ctx.isDuplicate('A|handnoteTape|lined-note|0'), '(expected true)');
 * console.log('不重复:', ctx.isDuplicate('B|comicBurst|burst-star|0'), '(expected false)');
 *
 * // 去重测试（10个重复候选 → 抖动后应全不同）
 * const testCands = Array.from({length:10}, (_,i) => ({ family:'A', vi:0, seed:100, _text:'test', textIndex:0, candidateIndex:i }));
 * const deduped = deduplicateCandidatesForText(testCands);
 * console.log('去重后数量:', deduped.length, '(expected 10)');
 */
