/**
 * real-style-stickers.js
 * 真实风格族重构 — 贴纸筛选与素材管理
 *
 * 职责：
 *   1. 按真实风格族筛选贴纸（白名单 + 分类过滤）
 *   2. 控制每个风格族的贴纸数量和类型上限
 *   3. 真实 PNG 素材路径映射（中期升级）
 */

// ═══════════════════════════════════════════════════════════════
// 1. 风格族贴纸白名单
// ═══════════════════════════════════════════════════════════════

const REAL_STYLE_STICKER_POOL = {
  handnote: {
    categories: ['stationery', 'doodle', 'texture', 'decor'],
    preferred: [
      'washiTape', 'stickyNote', 'paperClip', 'pushpin',
      'handDrawnArrow', 'handDrawnUnderline', 'handDrawnCirclev2',
      'doodleStar', 'scribbleCloud', 'markerStrike',
    ],
    maxEmoji: 2,
    maxDoodle: 3,
  },

  collage: {
    categories: ['stationery', 'stamp', 'frame', 'decor', 'texture'],
    preferred: [
      'stickyNote', 'polaroidFrame', 'indexTab',
      'realisticStamp', 'washiTape',
      'handDrawnArrow', 'handDrawnCirclev2',
      'binderClip', 'pushpin',
    ],
    maxEmoji: 1,
    maxDoodle: 2,
  },

  comic: {
    categories: ['3d', 'effect', 'emoji', 'decor', 'burst', 'hot', 'energy'],
    preferred: [
      'thumb3d', 'thumb3d_v2', 'megaphone3d', 'star3d', 'heart3d',
      'fire3d', 'diamond3d', 'crown3d', 'trophy3d', 'balloon3d',
      'giftbox3d', 'megaphonePlush', 'emojiAngry3d', 'fistComic',
    ],
    maxEmoji: 4,
    maxDoodle: 1,
  },

  newspaper: {
    categories: ['stamp', 'frame', 'decor', 'texture', 'label', 'clip'],
    preferred: [
      'realisticStamp', 'polaroidFrame', 'indexTab',
      'handDrawnUnderline', 'pushpin', 'binderClip',
    ],
    maxEmoji: 0,
    maxDoodle: 0,
  },

  minimal: {
    categories: [],
    preferred: [],
    maxEmoji: 0,
    maxDoodle: 0,
  },
};

// ═══════════════════════════════════════════════════════════════
// 2. 各风格族贴纸数量范围
// ═══════════════════════════════════════════════════════════════

const STICKER_COUNT_RANGES = {
  handnote:  [1, 3],
  collage:   [2, 4],
  comic:     [2, 4],
  newspaper: [1, 2],
  minimal:   [0, 0],
};

// ═══════════════════════════════════════════════════════════════
// 3. 贴纸筛选函数
// ═══════════════════════════════════════════════════════════════

/**
 * 按真实风格族筛选贴纸。
 * @param {string} realFamily - 真实风格族名
 * @param {Array} availableStickers - 现有贴纸ID数组或{id,categories}对象数组
 * @returns {Array} 筛选后的贴纸列表
 */
function filterStickersByFamily(realFamily, availableStickers) {
  var pool = REAL_STYLE_STICKER_POOL[realFamily];
  if (!pool) return [];
  if (realFamily === 'minimal') return [];

  // 标准化：确保 availableStickers 中的每个元素有 id 和 categories
  var normalized = availableStickers.map(function (s) {
    if (typeof s === 'string') {
      // 尝试从 STICKER_REGISTRY 获取 categories
      var reg = (window.STICKER_REGISTRY && window.STICKER_REGISTRY[s]) || {};
      return { id: s, categories: reg.categories || [] };
    }
    return { id: s.id || (typeof s === 'string' ? s : ''), categories: s.categories || [] };
  });

  // 按 categories 过滤
  var filtered = normalized.filter(function (sticker) {
    if (!sticker.categories || sticker.categories.length === 0) {
      // 无分类信息的贴纸仍保留（宽松策略）
      return true;
    }
    return sticker.categories.some(function (cat) {
      return pool.categories.indexOf(cat) >= 0;
    });
  });

  // 优先排列 preferred 中的贴纸
  var preferred = filtered.filter(function (s) {
    return pool.preferred.indexOf(s.id) >= 0;
  });
  var rest = filtered.filter(function (s) {
    return pool.preferred.indexOf(s.id) < 0;
  });

  return preferred.concat(rest);
}

/**
 * 根据真实风格族和种子确定贴纸数量。
 */
function getStickerCountForFamily(realFamily, seed) {
  var range = STICKER_COUNT_RANGES[realFamily] || [1, 3];
  var min = range[0];
  var max = range[1];
  if (min === max) return min;
  var rng = window.seededRandom ? window.seededRandom(seed || 42) : Math.random;
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * 从候选贴纸中选择指定数量的贴纸（Fisher-Yates + maxEmoji/maxDoodle限制）。
 */
function pickStickersForCard(realFamily, availableStickers, count, seed) {
  if (count <= 0 || realFamily === 'minimal') return [];

  var filtered = filterStickersByFamily(realFamily, availableStickers);
  if (filtered.length === 0) return [];

  var rng = window.seededRandom ? window.seededRandom(seed || 42) : Math.random;

  // Fisher-Yates shuffle
  var shuffled = filtered.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }

  // 应用 maxEmoji / maxDoodle 限额
  var pool = REAL_STYLE_STICKER_POOL[realFamily] || {};
  var result = [];
  var emojiCount = 0;
  var doodleCount = 0;

  for (var k = 0; k < shuffled.length; k++) {
    var sticker = shuffled[k];
    if (result.length >= count) break;

    var cats = sticker.categories || [];
    var isEmoji = cats.indexOf('emoji') >= 0;
    var isDoodle = cats.indexOf('doodle') >= 0;

    if (isEmoji && emojiCount >= (pool.maxEmoji || 0)) continue;
    if (isDoodle && doodleCount >= (pool.maxDoodle || 0)) continue;

    result.push(sticker);
    if (isEmoji) emojiCount++;
    if (isDoodle) doodleCount++;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// 4. 真实 PNG 素材路径（中期准备）
// ═══════════════════════════════════════════════════════════════

var REAL_STICKER_ASSET_PATHS = {
  handnote:  '/assets/stickers/handnote/',
  collage:   '/assets/stickers/collage/',
  comic:     '/assets/stickers/comic/',
  newspaper: '/assets/stickers/newspaper/',
  minimal:   '/assets/stickers/minimal/',
};

function getStickerAssetPath(realFamily, stickerId) {
  var base = REAL_STICKER_ASSET_PATHS[realFamily] || '/assets/stickers/';
  return base + (stickerId || 'unknown') + '.webp';
}

// ═══════════════════════════════════════════════════════════════
// 5. 挂载到 window
// ═══════════════════════════════════════════════════════════════

window.REAL_STYLE_STICKER_POOL = REAL_STYLE_STICKER_POOL;
window.filterStickersByFamily = filterStickersByFamily;
window.getStickerCountForFamily = getStickerCountForFamily;
window.pickStickersForCard = pickStickersForCard;
window.STICKER_COUNT_RANGES = STICKER_COUNT_RANGES;
window.REAL_STICKER_ASSET_PATHS = REAL_STICKER_ASSET_PATHS;
window.getStickerAssetPath = getStickerAssetPath;

/*
 * ─── 验证命令（浏览器控制台）───
 *
 * var testStickers = [
 *   { id: 'washiTape', categories: ['stationery'] },
 *   { id: 'realisticStamp', categories: ['stamp'] },
 *   { id: 'thumb3d', categories: ['3d', 'emoji'] },
 *   { id: 'handDrawnArrow', categories: ['doodle'] },
 *   { id: 'stickyNote', categories: ['stationery'] },
 * ];
 *
 * var f1 = filterStickersByFamily('handnote', testStickers);
 * console.log('handnote:', f1.map(function(s){return s.id}));
 * // 预期: stationery + doodle 类（washiTape, stickyNote, handDrawnArrow）
 *
 * var f2 = filterStickersByFamily('comic', testStickers);
 * console.log('comic:', f2.map(function(s){return s.id}));
 * // 预期: 3d 类（thumb3d）
 *
 * var f3 = filterStickersByFamily('minimal', testStickers);
 * console.log('minimal:', f3.length); // 预期: 0
 *
 * // 测试 pickStickersForCard
 * var picked = pickStickersForCard('comic', testStickers, 3, 42);
 * console.log('picked:', picked.length); // 预期: ≤3
 */
