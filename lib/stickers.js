/**
 * 大字封面图片贴纸加载器 v5.0
 * ────────────────────────────────
 * 管理 160+ 个图片贴纸素材的加载、缓存、绘制和回退。
 * 当素材图片未加载时自动回退到 Canvas 手绘版本,
 * 确保系统在任何情况下都能完整运行。
 *
 * 导出:
 *   STICKER_REGISTRY   — 贴纸元数据注册表
 *   FAMILY_STICKER_POOL — 风格族贴纸候选池
 *   preloadStickersForFamily(family) — 预加载
 *   getRandomStickers(family, count)  — 随机选取
 *   drawStickerImage(ctx, id, x, y, size, rot, accent) — 绘制
 *   isStickerLoaded(id) — 检查加载状态
 *   getStickerFallbackRef(id) — 获取回退函数名
 */

// ═══════════════════════════════════════════════════════════════
// 内部状态
// ═══════════════════════════════════════════════════════════════

/** 已加载图片缓存: Map<stickerId, Image> */
const imageCache = new Map();

/** 加载中的 Promise: Map<stickerId, Promise> */
const loadingMap = new Map();

/** 加载超时 ms */
const LOAD_TIMEOUT = 5000;

/** fallback 函数名 → 实际函数引用映射(由外部注入) */
const fallbackFnMap = new Map();

// ═══════════════════════════════════════════════════════════════
// 贴纸元数据注册表 (160+ 个)
// ═══════════════════════════════════════════════════════════════

export const STICKER_REGISTRY = {

  // ── 3D 渲染物体 (30 个) ──
  'thumb3d_gold':      { file: 'public/stickers/3d/thumb-gold.webp', w:200,h:200, displaySize:{short:0.24,medium:0.18,long:0.12}, categories:['3d','positive'], fallback:'drawThumb3Dv2Sticker' },
  'thumb3d_blue':      { file: 'public/stickers/3d/thumb-blue.webp', w:200,h:200, displaySize:{short:0.24,medium:0.18,long:0.12}, categories:['3d','positive'], fallback:'drawThumb3Dv2Sticker' },
  'thumb3d_white':     { file: 'public/stickers/3d/thumb-white.webp', w:200,h:200, displaySize:{short:0.24,medium:0.18,long:0.12}, categories:['3d','positive'], fallback:'drawThumb3Dv2Sticker' },
  'megaphone3d_red':   { file: 'public/stickers/3d/megaphone-red.webp', w:220,h:180, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','alert'], fallback:'drawMegaphone3DSticker' },
  'megaphone3d_yellow':{ file: 'public/stickers/3d/megaphone-yellow.webp', w:220,h:180, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','alert'], fallback:'drawMegaphone3DSticker' },
  'star3d_gold':       { file: 'public/stickers/3d/star-gold.webp', w:200,h:200, displaySize:{short:0.22,medium:0.17,long:0.11}, categories:['3d','decor'], fallback:'drawStar3DSticker' },
  'star3d_silver':     { file: 'public/stickers/3d/star-silver.webp', w:200,h:200, displaySize:{short:0.22,medium:0.17,long:0.11}, categories:['3d','decor'], fallback:'drawStar3DSticker' },
  'heart3d_red':       { file: 'public/stickers/3d/heart-red.webp', w:200,h:200, displaySize:{short:0.22,medium:0.17,long:0.11}, categories:['3d','love'], fallback:'drawHeart3DSticker' },
  'heart3d_pink':      { file: 'public/stickers/3d/heart-pink.webp', w:200,h:200, displaySize:{short:0.22,medium:0.17,long:0.11}, categories:['3d','love'], fallback:'drawHeart3DSticker' },
  'fire3d':            { file: 'public/stickers/3d/fire.webp', w:200,h:200, displaySize:{short:0.24,medium:0.18,long:0.12}, categories:['3d','hot'], fallback:'drawFire3DSticker' },
  'diamond3d':         { file: 'public/stickers/3d/diamond.webp', w:180,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['3d','luxury'], fallback:'drawDiamond3DSticker' },
  'crown3d_gold':      { file: 'public/stickers/3d/crown-gold.webp', w:200,h:160, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','luxury'], fallback:'drawCrown3DSticker' },
  'crown3d_silver':    { file: 'public/stickers/3d/crown-silver.webp', w:200,h:160, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','luxury'], fallback:'drawCrown3DSticker' },
  'trophy3d_gold':     { file: 'public/stickers/3d/trophy-gold.webp', w:160,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['3d','award'], fallback:'drawTrophy3DSticker' },
  'balloon3d_red':     { file: 'public/stickers/3d/balloon-red.webp', w:160,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','party'], fallback:'drawBalloon3DSticker' },
  'balloon3d_blue':    { file: 'public/stickers/3d/balloon-blue.webp', w:160,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','party'], fallback:'drawBalloon3DSticker' },
  'balloon3d_green':   { file: 'public/stickers/3d/balloon-green.webp', w:160,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','party'], fallback:'drawBalloon3DSticker' },
  'balloon3d_yellow':  { file: 'public/stickers/3d/balloon-yellow.webp', w:160,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','party'], fallback:'drawBalloon3DSticker' },
  'giftbox3d_red':     { file: 'public/stickers/3d/giftbox-red.webp', w:200,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','party'], fallback:'drawGiftbox3DSticker' },
  'giftbox3d_blue':    { file: 'public/stickers/3d/giftbox-blue.webp', w:200,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','party'], fallback:'drawGiftbox3DSticker' },
  'giftbox3d_green':   { file: 'public/stickers/3d/giftbox-green.webp', w:200,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','party'], fallback:'drawGiftbox3DSticker' },
  'envelope3d':        { file: 'public/stickers/3d/envelope.webp', w:220,h:180, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','mail'], fallback:'drawGiftbox3DSticker' },
  'calendar3d':        { file: 'public/stickers/3d/calendar.webp', w:200,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','office'], fallback:'drawStickyNoteSticker' },
  'clock3d':           { file: 'public/stickers/3d/clock.webp', w:200,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['3d','time'], fallback:'drawDiamond3DSticker' },
  'magnifier3d':       { file: 'public/stickers/3d/magnifier.webp', w:200,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','search'], fallback:'drawDiamond3DSticker' },
  'lightbulb3d':       { file: 'public/stickers/3d/lightbulb.webp', w:180,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['3d','idea'], fallback:'drawFire3DSticker' },
  'rocket3d':          { file: 'public/stickers/3d/rocket.webp', w:180,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','launch'], fallback:'drawMegaphone3DSticker' },
  'cart3d':            { file: 'public/stickers/3d/cart.webp', w:220,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','shop'], fallback:'drawGiftbox3DSticker' },
  'camera3d':          { file: 'public/stickers/3d/camera.webp', w:200,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['3d','photo'], fallback:'drawPolaroidFrameSticker' },
  'book3d':            { file: 'public/stickers/3d/book.webp', w:220,h:180, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['3d','study'], fallback:'drawStickyNoteSticker' },

  // ── 手绘涂鸦 (26 个) ──
  'arrow_red_tl':      { file: 'public/stickers/doodle/arrow-red-tl.webp', w:200,h:100, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','arrow'], fallback:'drawHandDrawnArrowSticker' },
  'arrow_red_tr':      { file: 'public/stickers/doodle/arrow-red-tr.webp', w:200,h:100, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','arrow'], fallback:'drawHandDrawnArrowSticker' },
  'arrow_red_bl':      { file: 'public/stickers/doodle/arrow-red-bl.webp', w:200,h:100, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','arrow'], fallback:'drawHandDrawnArrowSticker' },
  'arrow_red_br':      { file: 'public/stickers/doodle/arrow-red-br.webp', w:200,h:100, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','arrow'], fallback:'drawHandDrawnArrowSticker' },
  'arrow_black_tl':    { file: 'public/stickers/doodle/arrow-black-tl.webp', w:200,h:100, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','arrow'], fallback:'drawHandDrawnArrowSticker' },
  'arrow_black_tr':    { file: 'public/stickers/doodle/arrow-black-tr.webp', w:200,h:100, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','arrow'], fallback:'drawHandDrawnArrowSticker' },
  'arrow_blue_tl':     { file: 'public/stickers/doodle/arrow-blue-tl.webp', w:200,h:100, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','arrow'], fallback:'drawHandDrawnArrowSticker' },
  'arrow_blue_tr':     { file: 'public/stickers/doodle/arrow-blue-tr.webp', w:200,h:100, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','arrow'], fallback:'drawHandDrawnArrowSticker' },
  'circle_rough_red':  { file: 'public/stickers/doodle/circle-rough-red.webp', w:200,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['doodle','markup'], fallback:'drawHandDrawnCirclev2Sticker' },
  'circle_rough_black':{ file: 'public/stickers/doodle/circle-rough-black.webp', w:200,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['doodle','markup'], fallback:'drawHandDrawnCirclev2Sticker' },
  'underline_double':  { file: 'public/stickers/doodle/underline-double.webp', w:240,h:40, displaySize:{short:0.16,medium:0.12,long:0.07}, categories:['doodle','markup'], fallback:'drawHandDrawnUnderlineSticker' },
  'underline_wave':    { file: 'public/stickers/doodle/underline-wave.webp', w:240,h:40, displaySize:{short:0.16,medium:0.12,long:0.07}, categories:['doodle','markup'], fallback:'drawHandDrawnUnderlineSticker' },
  'star_doodle':       { file: 'public/stickers/doodle/star-doodle.webp', w:160,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['doodle','star'], fallback:'drawDoodleStarSticker' },
  'checkmark_green':   { file: 'public/stickers/doodle/checkmark-green.webp', w:160,h:160, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['doodle','symbol'], fallback:'drawHandDrawnArrowSticker' },
  'crossmark_red':     { file: 'public/stickers/doodle/crossmark-red.webp', w:160,h:160, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['doodle','symbol'], fallback:'drawHandDrawnArrowSticker' },
  'question_red':      { file: 'public/stickers/doodle/question-red.webp', w:160,h:200, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','symbol'], fallback:'drawShockedFaceSticker' },
  'exclaim_yellow':    { file: 'public/stickers/doodle/exclaim-yellow.webp', w:120,h:200, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','symbol'], fallback:'drawAngryFaceSticker' },
  'speech_bubble_white':{ file: 'public/stickers/doodle/speech-bubble.webp', w:240,h:180, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['doodle','bubble'], fallback:'drawScribbleCloudSticker' },
  'cloud_white':       { file: 'public/stickers/doodle/cloud-white.webp', w:220,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['doodle','bubble'], fallback:'drawScribbleCloudSticker' },
  'lightning_yellow':  { file: 'public/stickers/doodle/lightning-yellow.webp', w:100,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['doodle','energy'], fallback:'drawFire3DSticker' },
  'heart_doodle_red':  { file: 'public/stickers/doodle/heart-doodle-red.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['doodle','love'], fallback:'drawHeart3DSticker' },
  'scribble_black':    { file: 'public/stickers/doodle/scribble-black.webp', w:200,h:100, displaySize:{short:0.16,medium:0.12,long:0.07}, categories:['doodle','markup'], fallback:'drawMarkerStrikeSticker' },
  'highlight_yellow':  { file: 'public/stickers/doodle/highlight-yellow.webp', w:240,h:40, displaySize:{short:0.16,medium:0.12,long:0.07}, categories:['doodle','markup'], fallback:'drawMarkerStrikeSticker' },
  'highlight_pink':    { file: 'public/stickers/doodle/highlight-pink.webp', w:240,h:40, displaySize:{short:0.16,medium:0.12,long:0.07}, categories:['doodle','markup'], fallback:'drawMarkerStrikeSticker' },

  // ── 办公文具 (20 个) ──
  'washiTape_beige':   { file: 'public/stickers/stationery/washi-beige.webp', w:200,h:40, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['stationery','tape'], fallback:'drawWashiTapeSticker' },
  'washiTape_pink':    { file: 'public/stickers/stationery/washi-pink.webp', w:200,h:40, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['stationery','tape'], fallback:'drawWashiTapeSticker' },
  'washiTape_blue':    { file: 'public/stickers/stationery/washi-blue.webp', w:200,h:40, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['stationery','tape'], fallback:'drawWashiTapeSticker' },
  'washiTape_green':   { file: 'public/stickers/stationery/washi-green.webp', w:200,h:40, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['stationery','tape'], fallback:'drawWashiTapeSticker' },
  'stickyNote_yellow': { file: 'public/stickers/stationery/sticky-yellow.webp', w:180,h:180, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['stationery','note'], fallback:'drawStickyNoteSticker' },
  'stickyNote_pink':   { file: 'public/stickers/stationery/sticky-pink.webp', w:180,h:180, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['stationery','note'], fallback:'drawStickyNoteSticker' },
  'stickyNote_blue':   { file: 'public/stickers/stationery/sticky-blue.webp', w:180,h:180, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['stationery','note'], fallback:'drawStickyNoteSticker' },
  'stickyNote_mint':   { file: 'public/stickers/stationery/sticky-mint.webp', w:180,h:180, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['stationery','note'], fallback:'drawStickyNoteSticker' },
  'paperClip_silver':  { file: 'public/stickers/stationery/paperclip-silver.webp', w:120,h:160, displaySize:{short:0.12,medium:0.09,long:0.06}, categories:['stationery','clip'], fallback:'drawPaperClipSticker' },
  'pushpin_red':       { file: 'public/stickers/stationery/pushpin-red.webp', w:120,h:160, displaySize:{short:0.12,medium:0.09,long:0.06}, categories:['stationery','pin'], fallback:'drawPushpinSticker' },
  'pushpin_blue':      { file: 'public/stickers/stationery/pushpin-blue.webp', w:120,h:160, displaySize:{short:0.12,medium:0.09,long:0.06}, categories:['stationery','pin'], fallback:'drawPushpinSticker' },
  'stamp_new':         { file: 'public/stickers/stationery/stamp-new.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['stationery','stamp'], fallback:'drawRealisticStampSticker' },
  'stamp_hot':         { file: 'public/stickers/stationery/stamp-hot.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['stationery','stamp'], fallback:'drawRealisticStampSticker' },
  'stamp_top':         { file: 'public/stickers/stationery/stamp-top.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['stationery','stamp'], fallback:'drawRealisticStampSticker' },
  'stamp_best':        { file: 'public/stickers/stationery/stamp-best.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['stationery','stamp'], fallback:'drawRealisticStampSticker' },
  'stamp_sale':        { file: 'public/stickers/stationery/stamp-sale.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['stationery','stamp'], fallback:'drawRealisticStampSticker' },
  'polaroidFrame_white':{ file: 'public/stickers/stationery/polaroid-white.webp', w:160,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['stationery','frame'], fallback:'drawPolaroidFrameSticker' },
  'indexTab_blue':     { file: 'public/stickers/stationery/index-blue.webp', w:180,h:100, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['stationery','tab'], fallback:'drawIndexTabSticker' },
  'indexTab_red':      { file: 'public/stickers/stationery/index-red.webp', w:180,h:100, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['stationery','tab'], fallback:'drawIndexTabSticker' },
  'binderClip_black':  { file: 'public/stickers/stationery/binderclip-black.webp', w:120,h:180, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['stationery','clip'], fallback:'drawBinderClipSticker' },

  // ── Emoji 替代 (20 个) ──
  'emoji_fire':        { file: 'public/stickers/emoji/fire.webp', w:200,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','hot'], fallback:'drawFire3DSticker' },
  'emoji_star':        { file: 'public/stickers/emoji/star.webp', w:200,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','decor'], fallback:'drawStar3DSticker' },
  'emoji_sparkles':    { file: 'public/stickers/emoji/sparkles.webp', w:200,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['emoji','decor'], fallback:'drawDoodleStarSticker' },
  'emoji_hundred':     { file: 'public/stickers/emoji/hundred.webp', w:200,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','score'], fallback:'drawStar3DSticker' },
  'emoji_party':       { file: 'public/stickers/emoji/party.webp', w:200,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','party'], fallback:'drawBalloon3DSticker' },
  'emoji_heart':       { file: 'public/stickers/emoji/heart.webp', w:200,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','love'], fallback:'drawHeart3DSticker' },
  'emoji_clap':        { file: 'public/stickers/emoji/clap.webp', w:200,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','action'], fallback:'drawThumb3Dv2Sticker' },
  'emoji_rocket':      { file: 'public/stickers/emoji/rocket.webp', w:180,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','launch'], fallback:'drawMegaphone3DSticker' },
  'emoji_eyes':        { file: 'public/stickers/emoji/eyes.webp', w:220,h:140, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['emoji','face'], fallback:'drawSparkleEyesSticker' },
  'emoji_bulb':        { file: 'public/stickers/emoji/bulb.webp', w:160,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['emoji','idea'], fallback:'drawFire3DSticker' },
  'emoji_tada':        { file: 'public/stickers/emoji/tada.webp', w:200,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','party'], fallback:'drawGiftbox3DSticker' },
  'emoji_muscle':      { file: 'public/stickers/emoji/muscle.webp', w:180,h:200, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','power'], fallback:'drawThumb3Dv2Sticker' },
  'emoji_bell':        { file: 'public/stickers/emoji/bell.webp', w:180,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['emoji','alert'], fallback:'drawMegaphone3DSticker' },
  'emoji_music':       { file: 'public/stickers/emoji/music.webp', w:200,h:180, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['emoji','music'], fallback:'drawStar3DSticker' },
  'emoji_rainbow':     { file: 'public/stickers/emoji/rainbow.webp', w:240,h:160, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['emoji','nature'], fallback:'drawBalloon3DSticker' },
  'emoji_clover':      { file: 'public/stickers/emoji/clover.webp', w:200,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['emoji','nature'], fallback:'drawHeart3DSticker' },
  'emoji_target':      { file: 'public/stickers/emoji/target.webp', w:200,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['emoji','goal'], fallback:'drawDoodleStarSticker' },
  'emoji_gem':         { file: 'public/stickers/emoji/gem.webp', w:180,h:180, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['emoji','luxury'], fallback:'drawDiamond3DSticker' },
  'emoji_boom':        { file: 'public/stickers/emoji/boom.webp', w:200,h:200, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['emoji','effect'], fallback:'drawFire3DSticker' },
  'emoji_dart':        { file: 'public/stickers/emoji/dart.webp', w:200,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['emoji','goal'], fallback:'drawPushpinSticker' },

  // ── 纹理贴片 (12 个) ──
  'tear_top':          { file: 'public/stickers/texture/tear-top.webp', w:400,h:60, displaySize:{short:0.12,medium:0.08,long:0.05}, categories:['texture','tear'], fallback:'drawWashiTapeSticker' },
  'tear_bottom':       { file: 'public/stickers/texture/tear-bottom.webp', w:400,h:60, displaySize:{short:0.12,medium:0.08,long:0.05}, categories:['texture','tear'], fallback:'drawWashiTapeSticker' },
  'watercolor_pink':   { file: 'public/stickers/texture/watercolor-pink.webp', w:300,h:300, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['texture','wash'], fallback:'drawScribbleCloudSticker' },
  'watercolor_blue':   { file: 'public/stickers/texture/watercolor-blue.webp', w:300,h:300, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['texture','wash'], fallback:'drawScribbleCloudSticker' },
  'inksplat_black':    { file: 'public/stickers/texture/inksplat-black.webp', w:200,h:200, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['texture','ink'], fallback:'drawDoodleStarSticker' },
  'inksplat_blue':     { file: 'public/stickers/texture/inksplat-blue.webp', w:200,h:200, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['texture','ink'], fallback:'drawDoodleStarSticker' },
  'coffee_stain_light':{ file: 'public/stickers/texture/coffee-light.webp', w:200,h:200, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['texture','stain'], fallback:'drawScribbleCloudSticker' },
  'crayon_red':        { file: 'public/stickers/texture/crayon-red.webp', w:200,h:80, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['texture','crayon'], fallback:'drawMarkerStrikeSticker' },
  'crayon_blue':       { file: 'public/stickers/texture/crayon-blue.webp', w:200,h:80, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['texture','crayon'], fallback:'drawMarkerStrikeSticker' },
  'paint_drip':        { file: 'public/stickers/texture/paint-drip.webp', w:80,h:200, displaySize:{short:0.10,medium:0.08,long:0.05}, categories:['texture','paint'], fallback:'drawPushpinSticker' },
  'torn_edge_left':    { file: 'public/stickers/texture/torn-edge-left.webp', w:60,h:400, displaySize:{short:0.08,medium:0.06,long:0.04}, categories:['texture','tear'], fallback:'drawWashiTapeSticker' },
  'torn_edge_right':   { file: 'public/stickers/texture/torn-edge-right.webp', w:60,h:400, displaySize:{short:0.08,medium:0.06,long:0.04}, categories:['texture','tear'], fallback:'drawWashiTapeSticker' },

  // ── 装饰图案 (16 个) ──
  'flower_pink':       { file: 'public/stickers/decor/flower-pink.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['decor','floral'], fallback:'drawHeart3DSticker' },
  'flower_red':        { file: 'public/stickers/decor/flower-red.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['decor','floral'], fallback:'drawHeart3DSticker' },
  'flower_white':      { file: 'public/stickers/decor/flower-white.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['decor','floral'], fallback:'drawHeart3DSticker' },
  'leaf_green':        { file: 'public/stickers/decor/leaf-green.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['decor','nature'], fallback:'drawDoodleStarSticker' },
  'leaf_autumn':       { file: 'public/stickers/decor/leaf-autumn.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['decor','nature'], fallback:'drawFire3DSticker' },
  'geo_circle':        { file: 'public/stickers/decor/geo-circle.webp', w:160,h:160, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['decor','geo'], fallback:'drawHandDrawnCirclev2Sticker' },
  'geo_triangle':      { file: 'public/stickers/decor/geo-triangle.webp', w:160,h:140, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['decor','geo'], fallback:'drawDoodleStarSticker' },
  'geo_square':        { file: 'public/stickers/decor/geo-square.webp', w:160,h:160, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['decor','geo'], fallback:'drawStickyNoteSticker' },
  'geo_hexagon':       { file: 'public/stickers/decor/geo-hexagon.webp', w:180,h:160, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['decor','geo'], fallback:'drawDiamond3DSticker' },
  'geo_diamond':       { file: 'public/stickers/decor/geo-diamond.webp', w:160,h:160, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['decor','geo'], fallback:'drawDiamond3DSticker' },
  'ribbon_red':        { file: 'public/stickers/decor/ribbon-red.webp', w:200,h:120, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['decor','ribbon'], fallback:'drawGiftbox3DSticker' },
  'ribbon_gold':       { file: 'public/stickers/decor/ribbon-gold.webp', w:200,h:120, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['decor','ribbon'], fallback:'drawCrown3DSticker' },
  'corner_gold':       { file: 'public/stickers/decor/corner-gold.webp', w:160,h:160, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['decor','corner'], fallback:'drawCrown3DSticker' },
  'corner_silver':     { file: 'public/stickers/decor/corner-silver.webp', w:160,h:160, displaySize:{short:0.14,medium:0.10,long:0.06}, categories:['decor','corner'], fallback:'drawDiamond3DSticker' },
  'badge_new':         { file: 'public/stickers/decor/badge-new.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['decor','badge'], fallback:'drawRealisticStampSticker' },
  'badge_hot':         { file: 'public/stickers/decor/badge-hot.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['decor','badge'], fallback:'drawRealisticStampSticker' },

  // ── 相框/卡片 (10 个) ──
  'labelCard_yellow':  { file: 'public/stickers/frame/label-yellow.webp', w:200,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['frame','label'], fallback:'drawStickyNoteSticker' },
  'labelCard_white':   { file: 'public/stickers/frame/label-white.webp', w:200,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['frame','label'], fallback:'drawStickyNoteSticker' },
  'labelCard_blue':    { file: 'public/stickers/frame/label-blue.webp', w:200,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['frame','label'], fallback:'drawStickyNoteSticker' },
  'labelCard_pink':    { file: 'public/stickers/frame/label-pink.webp', w:200,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['frame','label'], fallback:'drawStickyNoteSticker' },
  'ticketFrame_white': { file: 'public/stickers/frame/ticket-white.webp', w:220,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['frame','ticket'], fallback:'drawPolaroidFrameSticker' },
  'ticketFrame_red':   { file: 'public/stickers/frame/ticket-red.webp', w:220,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['frame','ticket'], fallback:'drawPolaroidFrameSticker' },
  'ticketFrame_blue':  { file: 'public/stickers/frame/ticket-blue.webp', w:220,h:160, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['frame','ticket'], fallback:'drawPolaroidFrameSticker' },
  'filmFrame_black':   { file: 'public/stickers/frame/film-black.webp', w:240,h:120, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['frame','film'], fallback:'drawPolaroidFrameSticker' },
  'phoneFrame_white':  { file: 'public/stickers/frame/phone-white.webp', w:120,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['frame','device'], fallback:'drawPolaroidFrameSticker' },
  'filmStrip':         { file: 'public/stickers/frame/filmstrip.webp', w:400,h:100, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['frame','film'], fallback:'drawWashiTapeSticker' },

  // ── 特效元素 (14 个) ──
  'sparkle_gold':      { file: 'public/stickers/effect/sparkle-gold.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['effect','sparkle'], fallback:'drawDoodleStarSticker' },
  'sparkle_silver':    { file: 'public/stickers/effect/sparkle-silver.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['effect','sparkle'], fallback:'drawStar3DSticker' },
  'sparkle_rainbow':   { file: 'public/stickers/effect/sparkle-rainbow.webp', w:160,h:160, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['effect','sparkle'], fallback:'drawDiamond3DSticker' },
  'burst_comic_red':   { file: 'public/stickers/effect/burst-red.webp', w:240,h:240, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['effect','burst'], fallback:'drawFire3DSticker' },
  'burst_comic_yellow':{ file: 'public/stickers/effect/burst-yellow.webp', w:240,h:240, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['effect','burst'], fallback:'drawDoodleStarSticker' },
  'burst_comic_white': { file: 'public/stickers/effect/burst-white.webp', w:240,h:240, displaySize:{short:0.22,medium:0.16,long:0.10}, categories:['effect','burst'], fallback:'drawScribbleCloudSticker' },
  'bubble_white':      { file: 'public/stickers/effect/bubble-white.webp', w:200,h:200, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['effect','bubble'], fallback:'drawScribbleCloudSticker' },
  'bubble_pink':       { file: 'public/stickers/effect/bubble-pink.webp', w:200,h:200, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['effect','bubble'], fallback:'drawScribbleCloudSticker' },
  'bubble_blue':       { file: 'public/stickers/effect/bubble-blue.webp', w:200,h:200, displaySize:{short:0.16,medium:0.12,long:0.08}, categories:['effect','bubble'], fallback:'drawScribbleCloudSticker' },
  'glow_soft_warm':    { file: 'public/stickers/effect/glow-warm.webp', w:300,h:300, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['effect','glow'], fallback:'drawFire3DSticker' },
  'glow_soft_cool':    { file: 'public/stickers/effect/glow-cool.webp', w:300,h:300, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['effect','glow'], fallback:'drawDiamond3DSticker' },
  'glow_soft_pink':    { file: 'public/stickers/effect/glow-pink.webp', w:300,h:300, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['effect','glow'], fallback:'drawHeart3DSticker' },
  'speedLines_white':  { file: 'public/stickers/effect/speedlines-white.webp', w:400,h:200, displaySize:{short:0.18,medium:0.14,long:0.08}, categories:['effect','speed'], fallback:'drawMarkerStrikeSticker' },
  'confetti_colorful': { file: 'public/stickers/effect/confetti.webp', w:240,h:240, displaySize:{short:0.20,medium:0.15,long:0.10}, categories:['effect','party'], fallback:'drawDoodleStarSticker' },
};

// ═══════════════════════════════════════════════════════════════
// 风格族贴纸候选池 (A-T 各 40+ 个)
// ═══════════════════════════════════════════════════════════════

const ALL_IDS = Object.keys(STICKER_REGISTRY);

export const FAMILY_STICKER_POOL = {
  A: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['stationery','doodle','texture','decor','frame'].includes(c));
  }).slice(0, 45),
  B: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['3d','alert','stamp','hot','award','party'].includes(c));
  }).slice(0, 45),
  C: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['effect','emoji','burst','hot','energy','party'].includes(c));
  }).slice(0, 45),
  D: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['stationery','study','office','doodle','label','clip'].includes(c));
  }).slice(0, 45),
  E: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['doodle','markup','decor','love','nature'].includes(c));
  }).slice(0, 45),
  F: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['frame','film','texture','stain','decor','corner'].includes(c));
  }).slice(0, 45),
  G: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['party','emoji','sparkle','balloon','3d','effect'].includes(c));
  }).slice(0, 45),
  H: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['3d','effect','luxury','burst','glow','diamond'].includes(c));
  }).slice(0, 45),
  I: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['geo','decor','doodle','stationery','3d'].includes(c));
  }).slice(0, 45),
  J: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['decor','frame','floral','nature','stamp','ribbon'].includes(c));
  }).slice(0, 45),
  K: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['effect','3d','burst','glow','neon','energy','tech'].includes(c));
  }).slice(0, 45),
  L: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['floral','nature','love','decor','stationery','tape'].includes(c));
  }).slice(0, 45),
  M: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['3d','sphere','balloon','luxury','glow','effect'].includes(c));
  }).slice(0, 45),
  N: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['effect','3d','burst','glow','diamond','energy'].includes(c));
  }).slice(0, 45),
  O: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['frame','luxury','corner','stamp','decor','ribbon'].includes(c));
  }).slice(0, 45),
  P: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['doodle','geo','decor','symbol','markup','effect'].includes(c));
  }).slice(0, 45),
  Q: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['glow','sparkle','effect','3d','nature','decor'].includes(c));
  }).slice(0, 45),
  R: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['frame','decor','corner','ribbon','stamp','stationery'].includes(c));
  }).slice(0, 45),
  S: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['3d','glow','effect','decor','nature','diamond'].includes(c));
  }).slice(0, 45),
  T: ALL_IDS.filter(id => {
    const cats = STICKER_REGISTRY[id].categories || [];
    return cats.some(c => ['face','emoji','love','party','balloon','decor','floral'].includes(c));
  }).slice(0, 45),
};

// 确保每个池至少有 30 个贴纸(不够则从 ALL_IDS 补充)
for (const fam of Object.keys(FAMILY_STICKER_POOL)) {
  const pool = FAMILY_STICKER_POOL[fam];
  if (pool.length < 30) {
    const existing = new Set(pool);
    for (const id of ALL_IDS) {
      if (pool.length >= 39) break;
      if (!existing.has(id)) { pool.push(id); existing.add(id); }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// 核心 API (5 个导出函数)
// ═══════════════════════════════════════════════════════════════

/**
 * 确定性伪随机
 */
function pseudoRand(seed) {
  const x = Math.sin(seed * 9999 + 137) * 10000;
  return x - Math.floor(x);
}

/**
 * 1. 预加载指定风格族的贴纸图片
 * @param {string} family - A-T
 * @returns {Promise<void>}
 */
export async function preloadStickersForFamily(family) {
  const pool = FAMILY_STICKER_POOL[family] || FAMILY_STICKER_POOL.A;
  const toLoad = pool.filter(id => !imageCache.has(id) && !loadingMap.has(id));

  const promises = toLoad.map(id => {
    const meta = STICKER_REGISTRY[id];
    if (!meta) return Promise.resolve();
    const promise = new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        loadingMap.delete(id);
        resolve(); // 超时静默放弃
      }, LOAD_TIMEOUT);
      img.onload = () => {
        clearTimeout(timeout);
        imageCache.set(id, img);
        loadingMap.delete(id);
        resolve();
      };
      img.onerror = () => {
        clearTimeout(timeout);
        loadingMap.delete(id);
        resolve(); // 加载失败静默回退
      };
      img.src = meta.file;
    });
    loadingMap.set(id, promise);
    return promise;
  });

  await Promise.all(promises);
}

/**
 * 2. 从候选池随机选取 count 个不重复贴纸ID
 * @param {string} family - A-T
 * @param {number} count
 * @param {number} [seed=1]
 * @returns {string[]}
 */
export function getRandomStickers(family, count, seed = 1) {
  const pool = FAMILY_STICKER_POOL[family] || ALL_IDS;
  if (pool.length === 0) return [];
  const result = [];
  const used = new Set();
  const maxAttempts = Math.min(count * 3, pool.length * 2);
  let attempts = 0;
  let idx = seed;
  while (result.length < count && attempts < maxAttempts) {
    const i = Math.floor(pseudoRand(idx) * pool.length);
    const id = pool[i];
    if (!used.has(id)) {
      result.push(id);
      used.add(id);
    }
    idx++;
    attempts++;
  }
  return result;
}

/**
 * 3. 绘制贴纸图片(或回退到Canvas)
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} stickerId
 * @param {number} x - 中心X
 * @param {number} y - 中心Y
 * @param {number} size - 像素尺寸
 * @param {number} [rotation=0] - 旋转弧度
 * @param {string} [accent='#E6213D'] - 回退函数强调色
 */
export function drawStickerImage(ctx, stickerId, x, y, size, rotation = 0, accent = '#E6213D') {
  const img = imageCache.get(stickerId);
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  } else {
    // 回退: 调用Canvas绘制函数
    const fallbackName = (STICKER_REGISTRY[stickerId] && STICKER_REGISTRY[stickerId].fallback) || '';
    const fallbackFn = fallbackFnMap.get(fallbackName);
    if (fallbackFn) {
      ctx.save();
      ctx.translate(x, y);
      if (rotation) ctx.rotate(rotation);
      fallbackFn(ctx, 0, 0, size, accent);
      ctx.restore();
    }
  }
}

/**
 * 4. 检查贴纸是否已加载
 * @param {string} stickerId
 * @returns {boolean}
 */
export function isStickerLoaded(stickerId) {
  const img = imageCache.get(stickerId);
  return !!(img && img.complete && img.naturalWidth > 0);
}

/**
 * 5. 获取回退函数名
 * @param {string} stickerId
 * @returns {string}
 */
export function getStickerFallbackRef(stickerId) {
  return (STICKER_REGISTRY[stickerId] && STICKER_REGISTRY[stickerId].fallback) || '';
}

/**
 * 注册回退函数映射(由外部调用,建立 字符串→函数 映射)
 * @param {string} name - 函数名字符串
 * @param {Function} fn  - 实际函数引用
 */
export function registerFallbackFn(name, fn) {
  if (typeof fn === 'function') {
    fallbackFnMap.set(name, fn);
  }
}

/**
 * 获取已加载贴纸数量
 * @returns {number}
 */
export function getLoadedCount() {
  return imageCache.size;
}

/**
 * 获取注册表贴纸总数
 * @returns {number}
 */
export function getTotalCount() {
  return Object.keys(STICKER_REGISTRY).length;
}
