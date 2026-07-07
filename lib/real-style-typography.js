/**
 * real-style-typography.js
 * 真实风格族重构 — 文案解析与排版计算
 *
 * 职责：
 *   1. parseCoverContent — 将用户输入拆分为结构化文案
 *   2. computeTypographyPlan — 计算字号、行高、位置、对齐
 *   3. getTextSeed / seededRandom — 稳定随机工具函数
 *
 * 不修改 index.html 渲染逻辑，不修改任何 lib/ 下已有文件。
 */

// ═══════════════════════════════════════════════════════════════
// 1. 稳定随机工具函数
// ═══════════════════════════════════════════════════════════════

/**
 * 基于文本和索引的稳定哈希，同一输入永远返回同一整数。
 */
function getTextSeed(text, textIndex, globalSeed) {
  let hash = globalSeed || 0;
  const str = (text || '') + ':' + (textIndex || 0);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 返回一个基于 seed 的伪随机数生成器（0-1）。
 * 使用 Mulberry32 算法，确定性随机。
 */
function seededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

// ═══════════════════════════════════════════════════════════════
// 2. 文案结构化解析 parseCoverContent
// ═══════════════════════════════════════════════════════════════

/**
 * 高频虚词集合 —— keyword 提取时避免以这些字结尾。
 */
const FUNCTION_WORDS = new Set([
  '的', '了', '吗', '呢', '啊', '吧', '呀', '哦', '嗯', '哈',
  '着', '过', '得', '地', '在', '和', '与', '或', '但', '而',
  '是', '有', '不', '也', '就', '都', '要', '会', '可', '能',
  '这', '那', '其', '之', '及', '以', '从', '被', '让', '把',
  '对', '向', '跟', '同', '于', '则', '又', '很', '最', '更',
  '只', '才', '刚', '已', '将', '还', '没', '为', '所', '者',
]);

/**
 * 学术/论文类关键词 → badge 映射
 */
const ACADEMIC_BADGES = [
  { keywords: ['SCI', 'sci', 'SSCI', 'CSSCI', '核心期刊', '影响因子'], badge: 'SCI GUIDE' },
  { keywords: ['审稿', '审稿人', ' peer ', 'review'], badge: 'REVISION' },
  { keywords: ['返修', '修改', 'revise', '大修', '小修'], badge: 'REVISION' },
  { keywords: ['论文', '期刊', 'journal', '投稿', '发表', '录用'], badge: 'PAPER' },
  { keywords: ['博士', '硕士', '研究生', '导师', '答辩', '毕业'], badge: 'ACADEMIC' },
  { keywords: ['实验', '数据', '方法', '结果', '讨论'], badge: 'RESEARCH' },
];

/**
 * 职场类关键词 → badge 映射
 */
const CAREER_BADGES = [
  { keywords: ['面试', '简历', '求职', '招聘', 'offer', 'OFFER'], badge: 'CAREER' },
  { keywords: ['升职', '跳槽', '加薪', '涨薪', '晋升'], badge: 'JOB TIPS' },
  { keywords: ['职场', '工作', '同事', '老板', '领导'], badge: 'WORK' },
];

/**
 * 判断字符是否为 CJK 字符（中文/日文/韩文）。
 */
function isCJKChar(ch) {
  const code = ch.codePointAt(0);
  return (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK 统一汉字
         (code >= 0x3400 && code <= 0x4DBF) ||   // CJK 扩展A
         (code >= 0x20000 && code <= 0x2A6DF) || // CJK 扩展B
         (code >= 0x3040 && code <= 0x309F) ||   // 日文平假名
         (code >= 0x30A0 && code <= 0x30FF) ||   // 日文片假名
         (code >= 0xAC00 && code <= 0xD7AF);     // 韩文
}

/**
 * 将混合中英文文本分割为片段数组。
 * 中文逐字分割，英文/数字保持完整单词。
 * e.g. "带你拿到offer" → ["带","你","拿","到","offer"]
 */
function segmentMixedText(text) {
  const segments = [];
  let buf = '';
  for (const ch of [...text]) {
    if (/[a-zA-Z0-9]/.test(ch)) {
      buf += ch;
    } else {
      if (buf) { segments.push(buf); buf = ''; }
      segments.push(ch);
    }
  }
  if (buf) segments.push(buf);
  return segments;
}

/**
 * 计算文本的"视觉字数"。
 * CJK 字符计 1，英文/数字每 2 个计 1（因为英文半宽）。
 * 这样 "AI工具推荐2025" 视觉字数 ≈ 6（而非 10）。
 */
function visualCharCount(text) {
  let count = 0;
  let asciiRun = 0;
  for (const ch of [...text]) {
    if (isCJKChar(ch)) {
      count += 1 + asciiRun * 0.5;  // 先结算累积的英文
      asciiRun = 0;
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      asciiRun++;
    } else {
      count += asciiRun * 0.5;
      asciiRun = 0;
      count += 1; // 标点/空格等
    }
  }
  count += asciiRun * 0.5;
  return Math.round(count);
}

/**
 * 在文本中找一个较自然的拆分点。
 * 优先在以下位置拆分：要/不/怎/为/如/何/该/的/了 之前。
 * 如果找不到自然拆分点，返回视觉字数过半的位置。
 */
function findNaturalSplitIndex(text, targetVisualCount) {
  const naturalBreakChars = new Set(['要', '不', '怎', '为', '如', '何', '该', '的', '了', '到', '让', '把', '从', '在', '跟', '和', '与']);
  const chars = [...text];
  let visualPos = 0;
  let asciiRun = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    // 更新位置
    if (isCJKChar(ch)) {
      visualPos += 1 + asciiRun * 0.5;
      asciiRun = 0;
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      asciiRun++;
      continue;  // 英文/数字不单独作为拆分点
    } else {
      visualPos += asciiRun * 0.5;
      asciiRun = 0;
      visualPos += 1;
    }

    // 如果已达到目标位置附近，检查是否为自然拆分点
    if (visualPos >= targetVisualCount - 1 && visualPos <= targetVisualCount + 2) {
      // 下一个字符是自然拆分字符
      if (i + 1 < chars.length && naturalBreakChars.has(chars[i + 1])) {
        return i + 1;
      }
      // 当前字符是自然拆分字符
      if (naturalBreakChars.has(ch)) {
        return i;
      }
    }
  }

  // 降级：找到视觉位置刚好过半的位置
  visualPos = 0;
  asciiRun = 0;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (isCJKChar(ch)) {
      visualPos += 1 + asciiRun * 0.5;
      asciiRun = 0;
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      asciiRun++;
      continue;
    } else {
      visualPos += asciiRun * 0.5;
      asciiRun = 0;
      visualPos += 1;
    }
    if (visualPos >= targetVisualCount) {
      // 回退到前一个CJK字符之后
      for (let j = i; j >= 0; j--) {
        if (isCJKChar(chars[j])) return j + 1;
      }
      return Math.max(1, i);
    }
  }
  return Math.ceil(chars.length / 2);
}

/**
 * 解析用户原始文本，输出结构化文案对象。
 *
 * @param {string} rawText - 用户输入
 * @returns {{ mainTitle: string, subTitle: string, keyword: string,
 *             badgeText: string, footerText: string, rawText: string }}
 */
function parseCoverContent(rawText) {
  // 兜底
  if (!rawText || typeof rawText !== 'string') {
    rawText = '';
  }
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      mainTitle: '',
      subTitle: '',
      keyword: '',
      badgeText: '',
      footerText: '',
      rawText: rawText,
    };
  }

  let mainTitle = '';
  let subTitle = '';
  let footerText = '';

  // ══════ P1 修复: 英文短文本保护 ══════
  const isMostlyAscii = /^[a-zA-Z0-9\s!?.,'"]+$/.test(trimmed);
  const asciiLen = trimmed.replace(/\s/g, '').length;
  if (isMostlyAscii && asciiLen <= 20) {
    // 英文短句/短词：整句作为 mainTitle，不拆分
    mainTitle = trimmed;
    subTitle = '';
    footerText = '';
  }
  // ── 规则1：显式换行 ──
  else if (trimmed.includes('\n')) {
    const lines = trimmed.split('\n').map(s => s.trim()).filter(Boolean);
    mainTitle = lines[0] || '';
    subTitle = lines[1] || '';
    footerText = lines.slice(2).join(' ') || '';
  }
  // ── 规则2：分隔符 ──
  else if (/[｜|—\-：:]/.test(trimmed)) {
    const sepMatch = trimmed.match(/[｜|——\-：:]/);
    if (sepMatch) {
      const idx = sepMatch.index;
      mainTitle = trimmed.slice(0, idx).trim();
      const rest = trimmed.slice(idx + sepMatch[0].length).trim();

      // rest 可能还有第二层分隔
      const secondSep = rest.match(/[｜|——\-：:]/);
      if (secondSep) {
        subTitle = rest.slice(0, secondSep.index).trim();
        footerText = rest.slice(secondSep.index + secondSep[0].length).trim();
      } else {
        subTitle = rest;
      }
    }
  }
  // ── 规则3：自动拆分（按视觉字数）──
  else {
    const vLen = visualCharCount(trimmed);
    const rawLen = [...trimmed].length;
    if (vLen <= 8) {
      // 3-8视字：全部作为 mainTitle
      mainTitle = trimmed;
    } else if (vLen <= 14) {
      // 9-14视字：拆为 mainTitle + subTitle
      const target = Math.floor(vLen * 0.45);
      const splitAt = findNaturalSplitIndex(trimmed, target);
      mainTitle = trimmed.slice(0, splitAt).trim();
      subTitle = trimmed.slice(splitAt).trim();
    } else if (vLen <= 24) {
      // 15-24视字：拆为 mainTitle + subTitle
      const target = Math.floor(vLen * 0.4);
      const splitAt = findNaturalSplitIndex(trimmed, target);
      mainTitle = trimmed.slice(0, splitAt).trim();
      subTitle = trimmed.slice(splitAt).trim();
    } else {
      // 24视字以上：mainTitle + subTitle + footerText
      const target1 = Math.floor(vLen * 0.3);
      const splitAt1 = findNaturalSplitIndex(trimmed, target1);
      mainTitle = trimmed.slice(0, splitAt1).trim();
      const remaining = trimmed.slice(splitAt1).trim();
      const vLenRemain = visualCharCount(remaining);
      const target2 = Math.floor(vLenRemain * 0.5);
      const splitAt2 = findNaturalSplitIndex(remaining, target2);
      subTitle = remaining.slice(0, splitAt2).trim();
      footerText = remaining.slice(splitAt2).trim();
    }
  }

  // ── keyword 智能提取 ──
  let keyword = '';
  const sourceForKeyword = subTitle || mainTitle;
  if (sourceForKeyword) {
    // 分离中文和非中文字符序列（保留英文单词完整性）
    const segments = segmentMixedText(sourceForKeyword);
    // 提取最后一个有意义的中文片段（优先中文）
    const chineseChars = [...sourceForKeyword].filter(ch => isCJKChar(ch));
    const lastEnglishWord = segments.filter(s => /^[a-zA-Z]+$/.test(s)).pop() || '';

    if (chineseChars.length >= 2) {
      // 从尾部取 2-4 个有意义的中文字符
      if (chineseChars.length <= 4) {
        keyword = chineseChars.join('');
      } else {
        const collected = [];
        for (let i = chineseChars.length - 1; i >= 0 && collected.length < 4; i--) {
          if (!FUNCTION_WORDS.has(chineseChars[i])) {
            collected.unshift(chineseChars[i]);
          } else if (collected.length >= 2) {
            break;  // 已收集到足够有意义字符
          }
          // 如果还没收集到，跳过虚词继续向前
        }
        if (collected.length >= 2) {
          keyword = collected.join('');
        } else {
          // 降级：取最后2-4个中文字符（可能是虚词，但确保有值）
          keyword = chineseChars.slice(Math.max(0, chineseChars.length - 4)).join('');
        }
      }
    } else if (lastEnglishWord && lastEnglishWord.length >= 2) {
      // 没有足够中文，使用最后一个英文单词
      keyword = lastEnglishWord.toUpperCase();
    }
  }

  // mainTitle ≤4字时，keyword 可以用 mainTitle
  if (!keyword && mainTitle && mainTitle.length <= 4) {
    keyword = mainTitle;
  }

  // ══════ P1 修复: 单字无意义词检测 + 解析失败回退 ══════
  const meaninglessSingles = new Set(['个', '的', '了', '是', '和', '在', '有', '不', '也', '就', '都', '要', '会', '可', '能', '这', '那', '很']);
  if (mainTitle && [...mainTitle].length === 1 && meaninglessSingles.has(mainTitle)) {
    // 主标题是单字无意义虚词 → 回退 rawText
    mainTitle = trimmed;
    subTitle = '';
    keyword = trimmed;
    footerText = '';
  }
  if (keyword && [...keyword].length === 1 && meaninglessSingles.has(keyword)) {
    keyword = mainTitle.length <= 4 ? mainTitle : '';
  }
  // 如果解析后 mainTitle 为空但 rawText 有内容 → 兜底
  if (!mainTitle && trimmed) {
    mainTitle = trimmed;
  }

  // ── badgeText 生成 ──
  let badgeText = '';
  const fullText = trimmed;

  // 检测学术类
  for (const { keywords, badge } of ACADEMIC_BADGES) {
    if (keywords.some(kw => fullText.includes(kw))) {
      badgeText = badge;
      break;
    }
  }

  // 检测职场类（如果还没匹配到）
  if (!badgeText) {
    for (const { keywords, badge } of CAREER_BADGES) {
      if (keywords.some(kw => fullText.includes(kw))) {
        badgeText = badge;
        break;
      }
    }
  }

  return {
    mainTitle,
    subTitle,
    keyword,
    badgeText,
    footerText,
    rawText,
  };
}

// ═══════════════════════════════════════════════════════════════
// 3. 排版计划 computeTypographyPlan
// ═══════════════════════════════════════════════════════════════

const CANVAS_W = 1242;
const CANVAS_H = 1656;

/**
 * 测量文本在指定字体下的像素宽度。
 */
function measureTextWidth(ctx, text, fontSize, fontFamily) {
  ctx.save();
  ctx.font = `bold ${fontSize}px "${fontFamily || 'Noto Sans SC'}"`;
  const w = ctx.measureText(text).width;
  ctx.restore();
  return w;
}

/**
 * 计算排版计划 —— 确定所有文本元素的字号、位置、行高。
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} content - parseCoverContent 的输出
 * @param {object} familyConfig - REAL_STYLE_CONFIGS[realFamily]
 * @param {string} layoutId - 布局ID
 * @param {object|null} centerShape - 中央承载图形（可为 null）
 * @param {object} subStyle - REAL_SUBSTYLE_CONFIGS[subStyle]
 * @returns {object} 排版计划
 */
function computeTypographyPlan(ctx, content, familyConfig, layoutId, centerShape, subStyle) {
  const mainTitle = content.mainTitle || '';
  const subTitle = content.subTitle || '';
  const keyword = content.keyword || '';
  const badgeText = content.badgeText || '';
  const footerText = content.footerText || '';

  const typo = (familyConfig && familyConfig.typography) || {};
  const letterSpacing = typo.letterSpacing || -0.03;
  // ══════ P0 修复: 默认禁止 bleed，仅 minimal/comic 特定 layout 允许 ══════
  const allowBleed = !!(typo.allowBleed &&
    (layoutId && (layoutId.startsWith('minimal') || layoutId.startsWith('comic'))));
  const subRatio = typo.subRatio || 0.34;
  const keywordRatio = typo.keywordRatio || 0.52;
  const fontFamily = 'Noto Sans SC';

  // ══════ P0 修复: 文字安全区 — 以 centerShape.textSafeArea 为硬边界 ══════
  let safeX, safeY, safeW, safeH;
  if (centerShape && centerShape.textSafeArea) {
    safeX = (centerShape.textSafeArea.x || 0.10) * CANVAS_W;
    safeY = (centerShape.textSafeArea.y || 0.28) * CANVAS_H;
    safeW = (centerShape.textSafeArea.w || 0.80) * CANVAS_W;
    safeH = (centerShape.textSafeArea.h || 0.48) * CANVAS_H;
  } else {
    safeX = CANVAS_W * 0.10;
    safeY = CANVAS_H * 0.28;
    safeW = CANVAS_W * 0.80;
    safeH = CANVAS_H * 0.48;
  }
  if (allowBleed) {
    safeX -= CANVAS_W * 0.03;
    safeW += CANVAS_W * 0.06;
    safeY -= CANVAS_H * 0.02;
    safeH += CANVAS_H * 0.04;
  }

  // ── 对齐 ──
  const alignOptions = typo.align || ['center'];
  let alignment = alignOptions[0];
  if (alignOptions.length > 1) {
    if (layoutId && (layoutId.startsWith('minimal') || layoutId.startsWith('newspaper'))) {
      alignment = Math.random() < 0.55 ? 'left' : 'center';
    } else {
      alignment = Math.random() < 0.5 ? alignOptions[0] : alignOptions[1] || alignOptions[0];
    }
  }

  // ── 主标题字号搜索（同时约束宽+高）──
  const mainLen = [...mainTitle].length;
  let mainFontSize = mainLen === 0 ? 180
    : mainLen <= 2 ? 300
    : mainLen <= 4 ? 260
    : mainLen <= 6 ? 230
    : mainLen <= 8 ? 210
    : mainLen <= 12 ? 180
    : 150;

  // 递减字号直到主标题单行宽度 ≤ safeW
  for (let iter = 0; iter < 12; iter++) {
    const w = measureTextWidth(ctx, mainTitle, mainFontSize, fontFamily);
    if (w <= safeW) break;
    mainFontSize = Math.floor(mainFontSize * 0.88);
  }

  const mainLineHeightRatio = 1.10;
  let mainBlockW = Math.min(measureTextWidth(ctx, mainTitle, mainFontSize, fontFamily), safeW);
  let mainBlockH = mainFontSize * mainLineHeightRatio;

  // ── 字号派生 ──
  let subFontSize = subTitle ? Math.max(36, Math.round(mainFontSize * subRatio)) : 0;
  let keywordFontSize = keyword ? Math.max(32, Math.round(mainFontSize * keywordRatio)) : 0;
  let badgeFontSize = badgeText ? Math.max(26, Math.round(mainFontSize * 0.16)) : 0;
  let footerFontSize = footerText ? Math.max(22, Math.round(mainFontSize * 0.14)) : 0;

  const gap = 20;
  const badgeH = badgeFontSize * 1.3;
  const keywordH = keywordFontSize * 1.3;
  const subH = subFontSize * 1.25;
  const footerH = footerFontSize * 1.3;
  let totalH = badgeH + gap + keywordH + gap + mainBlockH + gap + subH + gap + footerH;

  // ══════ P0 修复: 如果总高度超出 safeH，逐级削减 ══════
  let attempts = 0;
  while (totalH > safeH && attempts < 20) {
    if (subFontSize > 0 && attempts < 5) {
      subFontSize = Math.floor(subFontSize * 0.88);
    } else if (keywordFontSize > 0 && attempts < 8) {
      keywordFontSize = Math.floor(keywordFontSize * 0.85);
    } else if (footerFontSize > 0 && attempts < 10) {
      footerFontSize = Math.floor(footerFontSize * 0.82);
    } else if (mainFontSize > 80) {
      mainFontSize = Math.floor(mainFontSize * 0.90);
      mainBlockW = Math.min(measureTextWidth(ctx, mainTitle, mainFontSize, fontFamily), safeW);
      mainBlockH = mainFontSize * mainLineHeightRatio;
      // 重新派生
      subFontSize = subTitle ? Math.max(36, Math.round(mainFontSize * subRatio)) : 0;
      keywordFontSize = keyword ? Math.max(32, Math.round(mainFontSize * keywordRatio)) : 0;
      badgeFontSize = badgeText ? Math.max(26, Math.round(mainFontSize * 0.16)) : 0;
      footerFontSize = footerText ? Math.max(22, Math.round(mainFontSize * 0.14)) : 0;
    } else {
      // ══════ P0 fallback: 仍放不下，只保留 mainTitle，清空其余 ══════
      subFontSize = 0;
      keywordFontSize = 0;
      badgeFontSize = 0;
      footerFontSize = 0;
      break;
    }
    attempts++;
    totalH = (badgeFontSize > 0 ? badgeFontSize * 1.3 : 0) + gap +
             (keywordFontSize > 0 ? keywordFontSize * 1.3 : 0) + gap +
             mainBlockH + gap +
             (subFontSize > 0 ? subFontSize * 1.25 : 0) + gap +
             (footerFontSize > 0 ? footerFontSize * 1.3 : 0);
  }

  // ── 垂直居中在 safeY 区域内 ──
  const mainY = safeY + Math.max(0, (safeH - totalH) / 2) +
    (badgeFontSize > 0 ? badgeFontSize * 1.3 + gap : 0) +
    (keywordFontSize > 0 ? keywordFontSize * 1.3 + gap : 0);

  let mainX = alignment === 'center' ? safeX + (safeW - mainBlockW) / 2 : safeX;
  mainX = Math.max(safeX, mainX);

  const mainTextBox = {
    x: Math.round(mainX), y: Math.round(mainY),
    w: Math.round(Math.min(mainBlockW, safeW)),
    h: Math.round(mainBlockH),
  };

  // 副标题
  const subY = mainY + mainBlockH + gap;
  let subMeasuredW = subFontSize > 0 ? measureTextWidth(ctx, subTitle, subFontSize, fontFamily) : 0;
  let subX = alignment === 'center' ? safeX + (safeW - subMeasuredW) / 2 : safeX;
  subX = Math.max(safeX, Math.min(safeX + safeW - subMeasuredW, subX));
  const subTextBox = {
    x: Math.round(subX), y: Math.round(subY),
    w: Math.round(subMeasuredW), h: Math.round(subFontSize * 1.25),
  };

  // keyword — 左上角小标签
  let keyW = keywordFontSize > 0 ? measureTextWidth(ctx, keyword, keywordFontSize, fontFamily) : 0;
  const keywordBox = {
    x: Math.round(alignment === 'center' ? safeX : safeX + safeW * 0.02),
    y: Math.round(safeY - (keywordFontSize > 0 ? keywordFontSize * 1.3 + 8 : 0)),
    w: Math.round(keyW), h: Math.round(keywordFontSize * 1.3),
  };

  // badge — 右上角
  let badgeW = badgeFontSize > 0 ? measureTextWidth(ctx, badgeText, badgeFontSize, fontFamily) + 20 : 0;
  const badgeBox = {
    x: Math.round(safeX + safeW - badgeW - 10),
    y: Math.round(Math.max(20, safeY - badgeFontSize * 1.5)),
    w: Math.round(badgeW), h: Math.round(badgeFontSize * 1.3),
  };

  // footer
  let footerW = footerFontSize > 0 ? measureTextWidth(ctx, footerText, footerFontSize, fontFamily) : 0;
  const footerY = Math.min(CANVAS_H - 60, safeY + safeH - footerFontSize * 1.5);
  const footerBox = {
    x: Math.round(alignment === 'center' ? safeX + (safeW - footerW) / 2 : safeX),
    y: Math.round(footerY), w: Math.round(footerW), h: Math.round(footerFontSize * 1.3),
  };

  return {
    mainFontSize, subFontSize, keywordFontSize, badgeFontSize, footerFontSize,
    mainLineHeight: mainLineHeightRatio,
    subLineHeight: 1.25,
    letterSpacing, alignment, allowBleed,
    mainTextBox, subTextBox, keywordBox, badgeBox, footerBox,
    titleAreaRatio: (mainBlockW * mainBlockH) / (CANVAS_W * CANVAS_H),
  };
}

// ═══════════════════════════════════════════════════════════════
// 4. 挂载到 window
// ═══════════════════════════════════════════════════════════════

window.parseCoverContent = parseCoverContent;
window.computeTypographyPlan = computeTypographyPlan;
window.getTextSeed = getTextSeed;
window.seededRandom = seededRandom;

/*
 * ─── 验证命令（在浏览器控制台执行）───
 *
 * // 测试 parseCoverContent
 * const r1 = parseCoverContent('审稿人说创新性不足到底怎么改');
 * console.log('测试1:', r1);
 * // 预期 mainTitle 非空，subTitle 非空
 *
 * const r2 = parseCoverContent('论文返修不要急着先改语言');
 * console.log('测试2:', r2);
 *
 * const r3 = parseCoverContent('三天搞定｜SCI论文讨论部分写作模板');
 * console.log('测试3:', r3);
 * // 预期 mainTitle='三天搞定', subTitle='SCI论文讨论部分写作模板'
 *
 * const r4 = parseCoverContent('短标题');
 * console.log('测试4:', r4);
 * // 预期 mainTitle='短标题'，subTitle=''
 *
 * const r5 = parseCoverContent('');
 * console.log('测试5（空文本）:', r5);
 * // 预期全部空字符串
 *
 * const r6 = parseCoverContent('面试必问的10个问题带你拿到offer');
 * console.log('测试6（职场）:', r6);
 * // 预期 badgeText 为 'CAREER'
 *
 * // 测试换行
 * const r7 = parseCoverContent('主标题在这里\n这是副标题\n这是底部文字');
 * console.log('测试7（换行）:', r7);
 *
 * // 测试 computeTypographyPlan
 * const testCtx = document.createElement('canvas').getContext('2d');
 * testCtx.font = 'bold 100px "Noto Sans SC"';
 * const plan = computeTypographyPlan(
 *   testCtx, r1,
 *   window.REAL_STYLE_CONFIGS.handnote,
 *   'handnoteTape',
 *   null,
 *   window.REAL_SUBSTYLE_CONFIGS.creamNotebook
 * );
 * console.log('排版计划:', plan);
 *
 * // 测试 seededRandom 稳定性
 * const rand1 = seededRandom(42);
 * const rand2 = seededRandom(42);
 * console.log('随机稳定性:', rand1() === rand2(), rand1(), rand2());
 * // 前两次 call 应返回相同值序列
 */
