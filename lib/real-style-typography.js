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

  // ── 规则1：显式换行 ──
  if (trimmed.includes('\n')) {
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

  const titleAreaRatioRange = (familyConfig && familyConfig.titleAreaRatio) || [0.52, 0.68];
  const typo = (familyConfig && familyConfig.typography) || {};
  const letterSpacing = typo.letterSpacing || -0.03;
  const allowBleed = !!typo.allowBleed;
  const subRatio = typo.subRatio || 0.34;
  const keywordRatio = typo.keywordRatio || 0.52;

  // ── 可用宽度 ──
  const paddingX = CANVAS_W * 0.08;   // 左右各 ~8%
  const maxTextWidth = CANVAS_W - paddingX * 2;  // ~1043px

  // ── 对齐 ──
  const alignOptions = typo.align || ['center'];
  let alignment = alignOptions[0];
  if (alignOptions.length > 1) {
    // 对于 minimal/newspaper，偏左概率更高
    if (layoutId && (layoutId.startsWith('minimal') || layoutId.startsWith('newspaper'))) {
      alignment = Math.random() < 0.55 ? 'left' : 'center';
    } else {
      alignment = Math.random() < 0.5 ? alignOptions[0] : alignOptions[1] || alignOptions[0];
    }
  }

  // ── 主标题字号 ──
  const mainLen = [...mainTitle].length;
  let mainFontSize;

  if (mainLen === 0) {
    mainFontSize = 180;
  } else if (mainLen <= 2) {
    // 极短：280-320
    mainFontSize = 300;
  } else if (mainLen <= 4) {
    // 短标题：240-300
    mainFontSize = 260;
  } else if (mainLen <= 6) {
    // 中短：210-260
    mainFontSize = 230;
  } else if (mainLen <= 8) {
    // 中等：190-240
    mainFontSize = 210;
  } else if (mainLen <= 12) {
    // 中长：160-200
    mainFontSize = 180;
  } else {
    // 长标题：130-170
    mainFontSize = 150;
  }

  // 根据可用宽度调整字号（确保不超出）
  const fontFamily = 'Noto Sans SC';
  for (let iter = 0; iter < 8; iter++) {
    const w = measureTextWidth(ctx, mainTitle, mainFontSize, fontFamily);
    if (w <= maxTextWidth) break;
    mainFontSize = Math.floor(mainFontSize * 0.90);
  }

  // 根据 familyConfig.titleAreaRatio 调整
  // titleAreaRatio = (mainFontSize * mainFontSize * mainLen * 行数系数) / (CANVAS_W * CANVAS_H)
  // 我们做简化：确保主标题不超出可用高度
  const lineCount = Math.ceil(measureTextWidth(ctx, mainTitle, mainFontSize, fontFamily) / maxTextWidth);
  const mainLineHeightRatio = lineCount <= 1 ? 1.05 : lineCount === 2 ? 1.20 : 1.30;
  const mainBlockH = mainFontSize * lineCount * mainLineHeightRatio;
  const mainBlockW = Math.min(measureTextWidth(ctx, mainTitle, mainFontSize, fontFamily), maxTextWidth);
  const estimatedAreaRatio = (mainBlockW * mainBlockH) / (CANVAS_W * CANVAS_H);

  // 如果面积占比太小，放大；如果太大，缩小
  if (estimatedAreaRatio < titleAreaRatioRange[0] && mainLen > 0) {
    const scale = Math.sqrt(titleAreaRatioRange[0] / Math.max(estimatedAreaRatio, 0.01));
    mainFontSize = Math.min(340, Math.floor(mainFontSize * Math.min(scale, 1.5)));
  } else if (estimatedAreaRatio > titleAreaRatioRange[1]) {
    const scale = Math.sqrt(titleAreaRatioRange[1] / estimatedAreaRatio);
    mainFontSize = Math.max(100, Math.floor(mainFontSize * Math.max(scale, 0.6)));
  }

  // ── 字号派生 ──
  const subFontSize = subTitle ? Math.max(40, Math.round(mainFontSize * subRatio)) : 0;
  const keywordFontSize = keyword ? Math.max(36, Math.round(mainFontSize * keywordRatio)) : 0;
  const badgeFontSize = badgeText ? Math.max(28, Math.round(mainFontSize * 0.18)) : 0;
  const footerFontSize = footerText ? Math.max(24, Math.round(mainFontSize * 0.16)) : 0;

  // ── 行高 ──
  const mainLineHeight = mainLineHeightRatio;
  const subLineHeight = subTitle ? 1.25 : 1.3;

  // ── 位置计算 ──
  // 画布垂直空间分配
  const topMargin = CANVAS_H * 0.10;
  const bottomMargin = CANVAS_H * 0.10;
  const availableH = CANVAS_H - topMargin - bottomMargin;

  // 计算各块高度
  const badgeH = badgeFontSize * 1.3;
  const keywordH = keywordFontSize * 1.3;
  const mainH = mainFontSize * lineCount * mainLineHeight;
  const subH = subFontSize * subLineHeight;
  const footerH = footerFontSize * 1.3;
  const gap = 28;

  // 总计高度
  const totalTextH = badgeH + gap + keywordH + gap + mainH + gap + subH + gap + footerH;

  // 主标题 Y —— 居中偏上
  let mainY;
  if (totalTextH < availableH) {
    mainY = topMargin + (availableH - totalTextH) / 2 + badgeH + gap + keywordH + gap;
  } else {
    mainY = CANVAS_H * 0.32;
  }
  // 调整到范围 [0.28, 0.45] * CANVAS_H
  mainY = Math.max(CANVAS_H * 0.28, Math.min(CANVAS_H * 0.45, mainY));

  // 限定主标题不超出画布底部太多
  if (mainY + mainH > CANVAS_H - bottomMargin) {
    mainY = CANVAS_H - bottomMargin - mainH;
  }

  let mainX;
  if (alignment === 'center') {
    mainX = (CANVAS_W - mainBlockW) / 2;
  } else {
    mainX = paddingX;
  }

  const mainTextBox = {
    x: Math.round(mainX),
    y: Math.round(mainY),
    w: Math.round(mainBlockW),
    h: Math.round(mainH),
  };

  // ── 副标题 ──
  let subY = mainY + mainH + gap;
  let subX = alignment === 'center' ? (CANVAS_W - (subTitle ? measureTextWidth(ctx, subTitle, subFontSize, fontFamily) : 0)) / 2 : paddingX;
  const subW = subTitle ? measureTextWidth(ctx, subTitle, subFontSize, fontFamily) : 0;

  const subTextBox = {
    x: Math.round(subX),
    y: Math.round(subY),
    w: Math.round(subW),
    h: Math.round(subFontSize * subLineHeight),
  };

  // ── 关键词 ──
  // 关键词放在主标题上方或副标题旁边
  const keywordW = keyword ? measureTextWidth(ctx, keyword, keywordFontSize, fontFamily) : 0;
  const keywordAbove = mainY - keywordFontSize * 1.3 - 12;
  const keywordAlongside = subY;

  const keywordBox = {
    x: Math.round(alignment === 'center' ? (CANVAS_W - keywordW) / 2 : paddingX),
    y: Math.round(keyword ? Math.max(topMargin, keywordAbove) : keywordAlongside),
    w: Math.round(keywordW),
    h: Math.round(keywordFontSize * 1.3),
  };

  // ── badge ──
  const badgeW = badgeText ? measureTextWidth(ctx, badgeText, badgeFontSize, fontFamily) + 24 : 0;
  const badgeBox = {
    x: Math.round(alignment === 'center' ? 60 : CANVAS_W - badgeW - 60),
    y: Math.round(topMargin * 0.5),
    w: Math.round(badgeW),
    h: Math.round(badgeH),
  };

  // ── footer ──
  const footerW = footerText ? measureTextWidth(ctx, footerText, footerFontSize, fontFamily) : 0;
  const footerY = Math.min(CANVAS_H - footerFontSize * 1.5 - 40, subY + subH + gap * 2);

  const footerBox = {
    x: Math.round(alignment === 'center' ? (CANVAS_W - footerW) / 2 : paddingX),
    y: Math.round(footerY),
    w: Math.round(footerW),
    h: Math.round(footerFontSize * 1.3),
  };

  // ── 主标题实际面积占比 ──
  const titleAreaRatio = (mainBlockW * mainBlockH) / (CANVAS_W * CANVAS_H);

  return {
    mainFontSize,
    subFontSize,
    keywordFontSize,
    badgeFontSize,
    footerFontSize,
    mainLineHeight,
    subLineHeight,
    letterSpacing,
    alignment,
    mainTextBox,
    subTextBox,
    keywordBox,
    badgeBox,
    footerBox,
    titleAreaRatio,
    allowBleed,
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
