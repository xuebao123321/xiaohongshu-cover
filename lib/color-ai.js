/**
 * 大字封面 AI 辅助分析引擎 v5.0
 * ────────────────────────────────
 * 纯客户端规则引擎,根据用户文案智能推荐色调、Emoji 和风格族。
 * 不调用任何外部 API。
 *
 * 导出:
 *   analyzeTextTone(text)      — 文案→色调推荐
 *   matchEmojiForText(text)    — 文案→Emoji 匹配
 *   analyzeTextAndRoute(text)  — 综合分析(色调+Emoji+排版)
 *   analyzeTextLayout(text)    — 文案→排版模式(与 index.html 中版本一致)
 */

// ═══════════════════════════════════════════════════════════════
// 内部: 排版分析(与 index.html 中 analyzeTextLayout 逻辑一致)
// ═══════════════════════════════════════════════════════════════

function countVisibleChars(text) {
  return String(text || '').replace(/\s/g, '').length;
}

export function analyzeTextLayout(text) {
  const visibleChars = countVisibleChars(text);
  if (visibleChars <= 4)
    return { mode: 'headline', maxSize: 260, lineHeight: 1.02, align: 'center' };
  if (visibleChars <= 10)
    return { mode: 'standard', maxSize: 190, lineHeight: 1.08, align: 'center', accentSize: 0.70 };
  if (visibleChars <= 20)
    return { mode: 'subhead', maxSize: 156, lineHeight: 1.12, align: 'center', subRatio: 0.70 };
  return { mode: 'newspaper', maxSize: 114, lineHeight: 1.18, align: 'center', dropCap: 2.5 };
}

// ═══════════════════════════════════════════════════════════════
// 函数 1: analyzeTextTone — 文案色调推荐
// ═══════════════════════════════════════════════════════════════

/**
 * 分析文案的情感调性,推荐风格族和强调色。
 * 按优先级匹配,命中第一个规则后返回。
 *
 * @param {string} text
 * @returns {{tone:string, familyPrefer:string[], accentColor:string|null}}
 */
export function analyzeTextTone(text) {
  const t = String(text || '');

  const rules = [
    { words: ['紧急','通知','注意','重要','必看','警告','马上','立即','速看','错过','最后','倒计时'],
      tone: 'urgent', familyPrefer: ['B','C'], accentColor: '#ED0108' },
    { words: ['治愈','温柔','慢慢','安静','生活','日常','小确幸','温暖','柔软','舒服','惬意','松弛','慢生活'],
      tone: 'healing', familyPrefer: ['A','E','L'], accentColor: '#C8A050' },
    { words: ['学习','知识','技巧','方法','教程','指南','干货','笔记','总结','经验','考试','复习','备考'],
      tone: 'study', familyPrefer: ['D','A','E'], accentColor: '#2677DE' },
    { words: ['活动','福利','免费','折扣','限时','优惠','促销','抢购','秒杀','省钱','红包','补贴'],
      tone: 'promo', familyPrefer: ['C','B','G'], accentColor: '#ED0108' },
    { words: ['科技','AI','智能','数字','未来','新','GPT','机器','算法','代码','程序','软件','App'],
      tone: 'tech', familyPrefer: ['K','H','M'], accentColor: '#00F5FF' },
    { words: ['美食','好吃','推荐','打卡','探店','餐厅','甜品','饮品','火锅','烧烤','小吃','料理','厨房'],
      tone: 'food', familyPrefer: ['C','G','T'], accentColor: '#FF6333' },
    { words: ['穿搭','美妆','护肤','变美','好看','时尚','发型','化妆','服装','搭配','OOTD','ootd'],
      tone: 'beauty', familyPrefer: ['C','G','L'], accentColor: '#F78DE9' },
    { words: ['旅行','出游','景点','打卡','周末','假期','旅游','攻略','路线','风景','自驾','徒步'],
      tone: 'travel', familyPrefer: ['D','L','Q'], accentColor: '#4ECDC4' },
    { words: ['职场','工作','效率','升职','跳槽','副业','赚钱','理财','存钱','收入','搞钱','创业'],
      tone: 'career', familyPrefer: ['D','E','O'], accentColor: '#1A1A1A' },
    { words: ['健身','减肥','运动','瑜伽','跑步','健康','养生','睡眠','饮食','打卡','增肌','瘦身'],
      tone: 'health', familyPrefer: ['D','G','L'], accentColor: '#2AB673' },
    { words: ['情感','恋爱','分手','前任','暧昧','暗恋','相亲','婚姻','闺蜜','友情','crush','心动'],
      tone: 'emotion', familyPrefer: ['E','C','L'], accentColor: '#FF6B9D' },
    { words: ['搞笑','幽默','笑话','段子','整蛊','沙雕','离谱','抽象','好笑的','笑死','梗','整活'],
      tone: 'funny', familyPrefer: ['C','G','T'], accentColor: '#FFE066' },
    { words: ['装修','家居','收纳','整理','房间','租房','搬家','布置','改造','设计','软装','空间'],
      tone: 'home', familyPrefer: ['A','D','S'], accentColor: '#8B6F47' },
    { words: ['摄影','拍照','调色','滤镜','修图','相机','构图','vlog','视频','剪辑','大片','出片'],
      tone: 'photo', familyPrefer: ['F','R','Q'], accentColor: '#D4A574' },
    { words: ['音乐','歌曲','歌单','推荐','听歌','演唱会','乐器','弹唱','说唱','民谣','旋律','节奏'],
      tone: 'music', familyPrefer: ['N','K','H'], accentColor: '#B967FF' },
  ];

  // 统计每个tone的命中次数
  const scores = {};
  for (const rule of rules) {
    let hits = 0;
    for (const word of rule.words) {
      if (t.includes(word)) hits++;
    }
    if (hits > 0) {
      scores[rule.tone] = (scores[rule.tone] || 0) + hits;
    }
  }

  // 找到最高分
  let bestTone = 'general';
  let bestScore = 0;
  for (const [tone, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; bestTone = tone; }
  }

  if (bestTone === 'general') {
    return { tone: 'general', familyPrefer: [], accentColor: null };
  }

  const winner = rules.find(r => r.tone === bestTone);
  return {
    tone: bestTone,
    familyPrefer: winner ? winner.familyPrefer : [],
    accentColor: winner ? winner.accentColor : null,
  };
}

// ═══════════════════════════════════════════════════════════════
// 函数 2: matchEmojiForText — Emoji 智能匹配
// ═══════════════════════════════════════════════════════════════

const EMOJI_KEYWORD_MAP = {
  // 学习/知识
  '学习':'📚','知识':'🧠','技巧':'💡','方法':'🔧','教程':'📖','考试':'📝','复习':'📚','笔记':'📓',
  '研究':'🔬','读书':'📖','阅读':'📕','写作':'✍️','论文':'📄','毕业':'🎓','学校':'🏫',
  // 美食
  '美食':'🍽️','好吃':'😋','推荐':'⭐','必看':'👀','餐厅':'🍴','甜品':'🍰','饮品':'🧋',
  '火锅':'🍲','烧烤':'🍖','小吃':'🥟','料理':'🍳','厨房':'🔪','咖啡':'☕','奶茶':'🧋',
  '早餐':'🥐','午餐':'🍱','晚餐':'🍝',
  // 紧急/通知
  '紧急':'🚨','通知':'📢','注意':'⚠️','重要':'❗','警告':'⚠️','马上':'⏰','立即':'⚡',
  // 活动/促销
  '活动':'🎉','福利':'🎁','免费':'🆓','折扣':'🏷️','促销':'💸','优惠':'🎟️','红包':'🧧',
  '秒杀':'⚡','抢购':'🛒',
  // 科技
  '科技':'🔮','AI':'🤖','智能':'🧠','未来':'🚀','代码':'💻','程序':'⌨️','软件':'📱',
  '数据':'📊',
  // 穿搭/美妆
  '穿搭':'👗','美妆':'💄','护肤':'✨','好看':'🌟','时尚':'👠','发型':'💇','化妆':'💋',
  '服装':'👔','搭配':'🎽',
  // 旅行
  '旅行':'✈️','出游':'🗺️','景点':'🏞️','旅游':'🧳','攻略':'🗺️','风景':'🌅','自驾':'🚗',
  '徒步':'🥾','海边':'🏖️','山上':'⛰️',
  // 健身/健康
  '健身':'💪','减肥':'🏃','运动':'⚽','瑜伽':'🧘','跑步':'🏃‍♀️','健康':'❤️','养生':'🍵',
  '睡眠':'😴','饮食':'🥗','增肌':'🏋️',
  // 职场/理财
  '职场':'💼','工作':'📊','效率':'⚡','赚钱':'💰','理财':'📈','存钱':'🏦','搞钱':'💸',
  '创业':'🚀','副业':'💡',
  // 情感
  '情感':'💕','恋爱':'💗','分手':'💔','暧昧':'💓','暗恋':'💌','婚姻':'💒','心动':'💘',
  '闺蜜':'👯','友情':'🤝',
  // 搞笑
  '搞笑':'🤣','幽默':'😆','笑话':'😂','沙雕':'🤪','离谱':'🙃','梗':'🎯',
  // 装修/家居
  '装修':'🏠','家居':'🛋️','收纳':'📦','整理':'✨','房间':'🛏️','布置':'🎨','改造':'🔨',
  // 摄影
  '摄影':'📷','拍照':'🤳','调色':'🎨','滤镜':'🌈','vlog':'🎬','视频':'📹','剪辑':'✂️',
  // 音乐
  '音乐':'🎵','歌单':'🎧','演唱会':'🎤','乐器':'🎸','弹唱':'🎹','说唱':'🎙️',
  // 通用/生活
  '晚安':'🌙','早安':'☀️','加油':'💪','开心':'😊','难过':'😢','惊喜':'🎁','感动':'🥹',
  '生气':'😤','害怕':'😱','期待':'👀','完成':'✅','开始':'▶️','结束':'🏁',
  '第一名':'🥇','第二名':'🥈','第三名':'🥉','清单':'📋','日历':'📅','时间':'⏰',
  '地点':'📍','电话':'📞','消息':'💬','链接':'🔗','搜索':'🔍','收藏':'❤️','点赞':'👍',
  '分享':'🔄','下载':'⬇️','设置':'⚙️','工具':'🔧','安全':'🔒','错误':'❌','成功':'✅',
  '问题':'❓','答案':'💡',
  // 节日/特殊
  '春节':'🧧','中秋':'🌕','圣诞':'🎄','生日':'🎂','婚礼':'💒','宝宝':'👶',
  '宠物':'🐱','猫':'🐱','狗':'🐕','花':'🌸','植物':'🌿','星星':'⭐','太阳':'☀️',
  '月亮':'🌙','云':'☁️','雨':'🌧️','雪':'❄️','风':'💨',
  // 数字/动作
  '一':'1️⃣','二':'2️⃣','三':'3️⃣','免费领取':'🎁','立即查看':'👀','点击':'👉',
  '快来':'🏃','别错过':'⚠️','限时':'⏳','最后':'🔚','新人':'🆕','专属':'🔒',
};

/**
 * 从文案中匹配最相关的 Emoji
 * @param {string} text
 * @returns {string[]} 前 3 个匹配的 Emoji(去重)
 */
export function matchEmojiForText(text) {
  const t = String(text || '');
  const matched = [];
  for (const [keyword, emoji] of Object.entries(EMOJI_KEYWORD_MAP)) {
    if (t.includes(keyword)) matched.push(emoji);
  }
  return [...new Set(matched)].slice(0, 3);
}

// ═══════════════════════════════════════════════════════════════
// 函数 3: analyzeTextAndRoute — 综合分析
// ═══════════════════════════════════════════════════════════════

/**
 * 综合分析: 返回排版模式、色调、推荐Emoji、推荐风格族、推荐强调色
 * @param {string} text
 * @returns {{
 *   layout: {mode:string, maxSize:number, lineHeight:number},
 *   tone: {tone:string, familyPrefer:string[], accentColor:string|null},
 *   emojis: string[],
 *   recommendedFamilies: string[],
 *   accentColor: string|null,
 *   textLength: number,
 * }}
 */
export function analyzeTextAndRoute(text) {
  const layout = analyzeTextLayout(text);
  const tone = analyzeTextTone(text);
  const emojis = matchEmojiForText(text);
  return {
    layout,
    tone: tone.tone,
    emojis,
    recommendedFamilies: tone.familyPrefer,
    accentColor: tone.accentColor,
    textLength: countVisibleChars(text),
  };
}
