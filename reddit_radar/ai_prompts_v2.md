# Reddit Radar 阶段二：Subreddit 画像 + 独立发帖助手 — 多批次 AI 提示词

> 基于阶段一已完成的 Reddit 线索雷达，新增 Subreddit 画像系统和独立发帖助手。
>
> **使用方式**：从 Batch A 到 Batch E 依次复制粘贴到 AI 编码助手中执行。每批执行完毕后系统应处于完整可运行状态。
>
> **项目技术栈**：GitHub Pages 静态部署、Supabase（Auth + Edge Functions）、Vanilla JS、`sync-public.mjs` 构建脚本。

---

## Batch A：Subreddit 画像数据层 + Edge Function

```
请你按照以下要求创建 Subreddit 画像系统的基础数据层，不要遗漏任何一步。

## 第一步：创建 /data/reddit/subreddit_profiles.json

新建文件，写入以下 10 个 Subreddit 画像配置：

```json
[
  {
    "subreddit": "PhD",
    "displayName": "r/PhD",
    "description": "A community for PhD students to discuss their research, struggles, and experiences.",
    "audienceMood": "压力大、同病相怜、互相取暖",
    "replyProfile": {
      "defaultTone": "warm",
      "defaultCtaLevel": "soft",
      "preferredStyle": "story_first",
      "openingTemplate": "I went through something similar during my PhD. Here's what worked for me:",
      "avoidPatterns": "hard_sell, academic_jargon, dismissive"
    },
    "postProfile": {
      "storyFramework": "problem, solution, result, feedback",
      "preferredLength": "medium",
      "toneNotes": "真诚比专业更重要，允许脆弱和幽默",
      "hotPostPattern": "个人经历 + 总结教训 + 邀请讨论"
    }
  },
  {
    "subreddit": "GradSchool",
    "displayName": "r/GradSchool",
    "description": "A community for graduate students to share advice, experiences, and support.",
    "audienceMood": "迷茫焦虑、寻求生存指南",
    "replyProfile": {
      "defaultTone": "warm",
      "defaultCtaLevel": "soft",
      "preferredStyle": "story_first",
      "openingTemplate": "I remember feeling exactly this way in grad school. Here's what helped me:",
      "avoidPatterns": "hard_sell, talking_down, dismissive"
    },
    "postProfile": {
      "storyFramework": "struggle, solution, lesson, feedback",
      "preferredLength": "medium",
      "toneNotes": "老学长/姐口吻，允许自嘲",
      "hotPostPattern": "踩坑经历 + 总结 + 求经验分享"
    }
  },
  {
    "subreddit": "AskAcademia",
    "displayName": "r/AskAcademia",
    "description": "A community for academics and those interested in academia to ask and answer questions.",
    "audienceMood": "求专业建议、学术职业导向、审慎",
    "replyProfile": {
      "defaultTone": "expert",
      "defaultCtaLevel": "soft",
      "preferredStyle": "direct_advice",
      "openingTemplate": "Based on my experience in academic publishing:",
      "avoidPatterns": "casual_slang, oversharing, vague_advice"
    },
    "postProfile": {
      "storyFramework": "research, solution, evidence, feedback",
      "preferredLength": "medium_long",
      "toneNotes": "数据说话，结构清晰，引用规范",
      "hotPostPattern": "研究发现 + 方法论 + 开放讨论"
    }
  },
  {
    "subreddit": "academia",
    "displayName": "r/academia",
    "description": "A community for discussion of academia, research, and higher education.",
    "audienceMood": "职业讨论、政策关注、批判性",
    "replyProfile": {
      "defaultTone": "expert",
      "defaultCtaLevel": "none",
      "preferredStyle": "direct_advice",
      "openingTemplate": "From an academic perspective:",
      "avoidPatterns": "marketing_language, anecdotes, emotional_appeal"
    },
    "postProfile": {
      "storyFramework": "argument, evidence, discussion, feedback",
      "preferredLength": "medium_long",
      "toneNotes": "学术辩论风格，尊重不同观点",
      "hotPostPattern": "观点论证 + 引用 + 邀请反驳"
    }
  },
  {
    "subreddit": "AcademicWriting",
    "displayName": "r/AcademicWriting",
    "description": "A community for discussing academic writing techniques and challenges.",
    "audienceMood": "纯技术讨论、求知欲强",
    "replyProfile": {
      "defaultTone": "expert",
      "defaultCtaLevel": "soft",
      "preferredStyle": "direct_advice",
      "openingTemplate": "A technique that helped my writing significantly:",
      "avoidPatterns": "oversimplification, vague_tips, emotional_stories"
    },
    "postProfile": {
      "storyFramework": "problem, technique, example, feedback",
      "preferredLength": "medium",
      "toneNotes": "实用、具体，用例子说话",
      "hotPostPattern": "具体技巧 + 前后对比 + 讨论"
    }
  },
  {
    "subreddit": "scientificwriting",
    "displayName": "r/scientificwriting",
    "description": "A community for scientific writing and communication.",
    "audienceMood": "科研写作、技术导向",
    "replyProfile": {
      "defaultTone": "expert",
      "defaultCtaLevel": "soft",
      "preferredStyle": "direct_advice",
      "openingTemplate": "In scientific writing, one approach that works well:",
      "avoidPatterns": "marketing_fluff, non_scientific, overpromising"
    },
    "postProfile": {
      "storyFramework": "problem, method, evidence, feedback",
      "preferredLength": "medium",
      "toneNotes": "科学严谨，具体可操作",
      "hotPostPattern": "方法介绍 + 数据支持 + 讨论"
    }
  },
  {
    "subreddit": "InternationalStudents",
    "displayName": "r/InternationalStudents",
    "description": "A community for international students to share experiences and advice.",
    "audienceMood": "语言/文化焦虑、寻求归属感",
    "replyProfile": {
      "defaultTone": "warm",
      "defaultCtaLevel": "soft",
      "preferredStyle": "story_first",
      "openingTemplate": "As a fellow international student, I totally understand. Here's what I learned:",
      "avoidPatterns": "hard_sell, condescending, complex_jargon"
    },
    "postProfile": {
      "storyFramework": "struggle, insight, advice, feedback",
      "preferredLength": "medium",
      "toneNotes": "共鸣第一，信息第二，温暖叙述",
      "hotPostPattern": "文化冲击故事 + 经验总结 + 讨论"
    }
  },
  {
    "subreddit": "gradadmissions",
    "displayName": "r/gradadmissions",
    "description": "A community for discussing graduate school admissions.",
    "audienceMood": "申请焦虑、信息饥渴、竞争心态",
    "replyProfile": {
      "defaultTone": "direct",
      "defaultCtaLevel": "soft",
      "preferredStyle": "direct_advice",
      "openingTemplate": "Having been through the admissions process:",
      "avoidPatterns": "vague_encouragement, fear_mongering, hard_sell"
    },
    "postProfile": {
      "storyFramework": "background, strategy, result, feedback",
      "preferredLength": "medium",
      "toneNotes": "信息密集，干货优先",
      "hotPostPattern": "申请经验 + 数据 + 答疑"
    }
  },
  {
    "subreddit": "MachineLearning",
    "displayName": "r/MachineLearning",
    "description": "A community for discussing machine learning research and applications.",
    "audienceMood": "技术导向、高标准、质疑精神",
    "replyProfile": {
      "defaultTone": "expert",
      "defaultCtaLevel": "none",
      "preferredStyle": "direct_advice",
      "openingTemplate": "From a technical perspective:",
      "avoidPatterns": "marketing_claims, non_technical, vague_benefits"
    },
    "postProfile": {
      "storyFramework": "problem, method, benchmark, feedback",
      "preferredLength": "long",
      "toneNotes": "技术深度第一，代码/数据说话",
      "hotPostPattern": "技术方案 + benchmark + 开源"
    }
  },
  {
    "subreddit": "bioinformatics",
    "displayName": "r/bioinformatics",
    "description": "A community for bioinformatics professionals and researchers.",
    "audienceMood": "跨学科、实用导向",
    "replyProfile": {
      "defaultTone": "expert",
      "defaultCtaLevel": "soft",
      "preferredStyle": "direct_advice",
      "openingTemplate": "In bioinformatics, here's an approach we've used:",
      "avoidPatterns": "oversimplification, domain_ignorance"
    },
    "postProfile": {
      "storyFramework": "problem, tool, validation, feedback",
      "preferredLength": "medium",
      "toneNotes": "bridge CS + biology, 工具导向",
      "hotPostPattern": "工具/流程介绍 + 基准测试 + 讨论"
    }
  }
]
```

## 第二步：更新 radar-manage Edge Function

修改 /supabase/functions/radar-manage/index.ts，在现有的 `save_keywords` case 之后添加 `save_profiles` case。

在 switch 块中的 `case 'save_keywords':` 那一行之后，添加：

```typescript
      case 'save_profiles':
        return await handleSaveProfiles(body);
```

然后在 `handleSaveKeywords` 函数之后、`// ── helpers ──` 注释之前，添加 `handleSaveProfiles` 函数：

```typescript
// ── save_profiles ──
async function handleSaveProfiles(body: any) {
  const profiles = body.profiles;
  if (!Array.isArray(profiles)) {
    return corsResponse({ ok: false, message: 'profiles 必须是数组' }, 400);
  }

  const newContent = JSON.stringify(profiles, null, 2);
  const profilesPath = 'data/reddit/subreddit_profiles.json';

  // 1. Get current file SHA
  const getUrl = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${profilesPath}`;
  const getRes = await fetch(getUrl, { headers: gitHeaders() });
  let sha = '';
  if (getRes.ok) {
    const fileData: any = await getRes.json();
    sha = fileData.sha || '';
  }

  // 2. Commit updated file
  const putBody: any = {
    message: `Update Reddit Radar subreddit profiles [skip ci]`,
    content: btoa(unescape(encodeURIComponent(newContent))),
    branch: 'main',
  };
  if (sha) putBody.sha = sha;

  const putRes = await fetch(getUrl, {
    method: 'PUT',
    headers: gitHeaders(),
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`保存画像失败: ${putRes.status} ${err.slice(0, 200)}`);
  }

  console.log(`[radar-manage] subreddit_profiles.json updated (${profiles.length} profiles)`);
  return corsResponse({ ok: true, message: `画像已保存（${profiles.length} 个版块），下次操作自动生效` });
}
```

## 第三步：部署 Edge Function

运行以下命令部署更新后的 Edge Function：
```bash
npx supabase functions deploy radar-manage
```

执行完这些步骤后，Subreddit 画像数据层和保存接口就绪。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch B：Radar 页面 Subreddit 画像编辑器 + 回复预填优化

```
请你修改 Reddit Radar 前端页面，在配置面板中增加 Subreddit 画像编辑器，并优化回复预填逻辑使其自动应用画像。

## 第一步：修改 /reddit-radar/index.html 的 CSS

在 `</style>` 标签之前，添加以下样式：

```css
.profile-card{
  background:#faf9f7;border:1.5px solid #e8e4df;border-radius:8px;
  padding:12px 14px;margin-bottom:8px;
}
.profile-card h4{font-size:13px;font-weight:900;margin-bottom:4px;color:#1a1a1a}
.profile-card .prof-row{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;margin-top:6px}
.profile-card .prof-field{flex:1;min-width:140px}
.profile-card .prof-label{color:#8a8a8a;font-weight:700;font-size:10px;text-transform:uppercase}
.profile-card select,.profile-card input[type="text"]{
  width:100%;padding:4px 6px;border:1.5px solid #e0dcd6;border-radius:4px;
  font-size:11px;background:#fff;font-family:inherit;
}
.profile-card select:focus,.profile-card input:focus{border-color:#5a8cb8;outline:none}
.profile-actions{display:flex;gap:8px;margin-top:14px}
```

## 第二步：在配置面板 HTML 中添加 Subreddit 画像分区

在已有的关键词粗筛 `</textarea>` 之后、`<div class="btn-row" style="margin-top:8px">`（保存关键词按钮行）之后，添加：

```html
      <h3 style="margin-top:20px">📋 Subreddit 画像</h3>
      <div class="config-hint">
        为每个 Reddit 版块设置回复风格偏好。从 Radar 点击"生成回复"时会自动应用对应版块的最佳 tone 和 CTA。
      </div>
      <div id="profilesContainer"></div>
      <div class="profile-actions">
        <button class="btn-config btn-save-cfg" onclick="saveProfiles()">💾 保存画像</button>
      </div>
```

## 第三步：在主脚本中添加画像加载/编辑/保存函数

在现有的 `saveKeywords` 函数之后、`escapeAttr` 函数之前，添加以下 JavaScript 函数：

```javascript
var profileData = [];

function loadProfiles() {
  fetch('../data/reddit/subreddit_profiles.json')
    .then(function(r) { return r.json(); })
    .then(function(profiles) {
      profileData = profiles;
      renderProfiles();
    })
    .catch(function() { profileData = []; });
}

function renderProfiles() {
  var container = document.getElementById('profilesContainer');
  if (!container) return;
  if (profileData.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:#8a8a8a">暂无画像数据</p>';
    return;
  }
  var tones = ['warm', 'direct', 'expert', 'casual'];
  var ctas = ['none', 'soft', 'medium', 'direct'];
  var styles = ['story_first', 'direct_advice'];

  container.innerHTML = profileData.map(function(p, i) {
    var toneOpts = tones.map(function(t) {
      var replyTone = (p.replyProfile && p.replyProfile.defaultTone) || 'warm';
      return '<option value="' + t + '"' + (replyTone === t ? ' selected' : '') + '>' + t + '</option>';
    }).join('');
    var ctaOpts = ctas.map(function(c) {
      var replyCta = (p.replyProfile && p.replyProfile.defaultCtaLevel) || 'soft';
      return '<option value="' + c + '"' + (replyCta === c ? ' selected' : '') + '>' + c + '</option>';
    }).join('');
    var styleOpts = styles.map(function(s) {
      var replyStyle = (p.replyProfile && p.replyProfile.preferredStyle) || 'story_first';
      return '<option value="' + s + '"' + (replyStyle === s ? ' selected' : '') + '>' + s + '</option>';
    }).join('');
    return '<div class="profile-card">' +
      '<h4>' + escapeAttr(p.displayName || p.subreddit) + '</h4>' +
      '<div style="font-size:10px;color:#8a8a8a;margin-bottom:4px">' + escapeAttr((p.description || '').slice(0, 100)) + '</div>' +
      '<div class="prof-row">' +
        '<div class="prof-field"><span class="prof-label">回复语气</span><select data-idx="' + i + '" data-field="replyTone">' + toneOpts + '</select></div>' +
        '<div class="prof-field"><span class="prof-label">CTA强度</span><select data-idx="' + i + '" data-field="replyCta">' + ctaOpts + '</select></div>' +
        '<div class="prof-field"><span class="prof-label">回复风格</span><select data-idx="' + i + '" data-field="replyStyle">' + styleOpts + '</select></div>' +
      '</div>' +
      '<div class="prof-row" style="margin-top:4px">' +
        '<div class="prof-field" style="flex:2"><span class="prof-label">开头模板</span><input type="text" value="' + escapeAttr((p.replyProfile && p.replyProfile.openingTemplate) || '') + '" data-idx="' + i + '" data-field="openingTemplate"></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function collectProfileData() {
  var inputs = document.querySelectorAll('#profilesContainer [data-field]');
  inputs.forEach(function(el) {
    var idx = parseInt(el.dataset.idx, 10);
    var field = el.dataset.field;
    var val = el.value;
    if (!profileData[idx]) return;
    if (!profileData[idx].replyProfile) profileData[idx].replyProfile = {};
    if (field === 'replyTone') profileData[idx].replyProfile.defaultTone = val;
    if (field === 'replyCta') profileData[idx].replyProfile.defaultCtaLevel = val;
    if (field === 'replyStyle') profileData[idx].replyProfile.preferredStyle = val;
    if (field === 'openingTemplate') profileData[idx].replyProfile.openingTemplate = val;
  });
}

async function saveProfiles() {
  var auth = await (window.__radarGetAuth ? window.__radarGetAuth() : null);
  if (!auth) { showConfigMsg('❌ 登录已过期', 'error'); return; }
  collectProfileData();
  showConfigMsg('保存中...', 'info');
  try {
    var supabase = window.__radarSupabase;
    if (!supabase) throw new Error('Supabase 未初始化');
    var res = await supabase.functions.invoke('radar-manage', {
      body: { action: 'save_profiles', profiles: profileData }
    });
    if (res.error || !res.data || !res.data.ok) throw new Error((res.data && res.data.message) || '保存失败');
    showConfigMsg('✅ ' + res.data.message, 'success');
  } catch(e) {
    showConfigMsg('❌ ' + (e.message || '保存失败'), 'error');
  }
}
```

## 第四步：优化 goGenerateReply 函数以使用画像

找到现有的 `goGenerateReply` 函数（约第723行），在函数内部的 `localStorage.setItem` 调用之前，添加画像查询逻辑。修改后的函数开头应为：

```javascript
function goGenerateReply(postId) {
  var m = findMerged(postId);
  if (!m) return;
  // 查找对应 subreddit 的画像
  var profile = null;
  for (var i = 0; i < profileData.length; i++) {
    if (profileData[i].subreddit === m.subreddit) { profile = profileData[i]; break; }
  }
  var rp = (profile && profile.replyProfile) ? profile.replyProfile : {};
  try {
    localStorage.setItem('reddit_reply_prefill', JSON.stringify({
      title: m.title || '',
      content: m.content || '',
      subreddit: m.subreddit || '',
      problemType: m.problemType || '',
      userType: 'Unknown',
      field: 'General',
      tone: rp.defaultTone || 'warm',
      replyGoal: 'build_trust',
      ctaLevel: rp.defaultCtaLevel || 'soft',
      suggestedReplyAngle: m.suggestedReplyAngle || '',
      openingTemplate: rp.openingTemplate || '',
      sourceUrl: m.url || ''
    }));
```

注意：新增了 `openingTemplate` 字段传给回复助手。

## 第五步：在 initConfigPanel 中加载画像

找到 `initConfigPanel` 函数，在 `loadKeywords();` 之后添加：

```javascript
  loadProfiles();
```

执行完这些步骤后，Subreddit 画像编辑器在配置面板可见，点击"生成回复"时会自动根据帖子所在版块选择最佳回复语气和 CTA 强度。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch C：注册独立发帖助手权限 + 导航集成

```
请你为新增的独立发帖助手注册页面权限和导航入口。不要遗漏任何一步。

## 第一步：修改 Edge Function

修改 /supabase/functions/admin-manage/index.ts，在 validPages 数组中追加 `'reddit_post_writer'`：

```typescript
const validPages = ['ins_reviewer_carousel', 'reddit_reply_assistant', 'reddit_radar', 'reddit_post_writer'];
```

部署：
```bash
npx supabase functions deploy admin-manage
```

## 第二步：修改 /admin.html

在 pageChips 区域的 `reddit_radar` chip 之后、`</div>` 之前，添加第四个 chip：

```html
<span class="page-access-chip ${pageAccess.includes('reddit_post_writer') ? 'granted' : ''}"
      data-userid="${u.id}" data-page="reddit_post_writer"
      onclick="event.stopPropagation();window._togglePageAccess(this)"
      title="Reddit 独立发帖助手">
  ${pageAccess.includes('reddit_post_writer') ? '✓' : '○'} 发帖
</span>
```

完整修改：找到 admin.html 中包含 `data-page="reddit_radar"` 的 `<span>` 标签（约第381行），在其 `</span>` 之后、`</div>` 之前插入上面的 chip。确保四个 chip 都在同一个 `<div class="page-access-row">` 内。

## 第三步：修改 /index.html

### HTML 部分
在 toolLinksBar 中的 `linkRedditRadar` 链接之后，添加：

```html
<a href="./reddit-post-writer/" id="linkPostWriter" style="display:none">✍️ Reddit 独立发帖 <span class="tl-badge">NEW</span></a>
```

### JavaScript 部分
在 renderAccountBar 函数中的 toolLinksBar 控制代码块（约第919-932行），添加 `linkPostWriter` 的支持。将该代码块更新为：

```javascript
var toolBar = document.getElementById('toolLinksBar');
var linkIns = document.getElementById('linkInsCarousel');
var linkReddit = document.getElementById('linkRedditReply');
var linkRadar = document.getElementById('linkRedditRadar');
var linkPostWriter = document.getElementById('linkPostWriter');
if (toolBar && linkIns && linkReddit && linkRadar && linkPostWriter) {
  var pageAccess = (AUTH_STATE.user && Array.isArray(AUTH_STATE.user.page_access)) ? AUTH_STATE.user.page_access : [];
  var hasIns = pageAccess.indexOf('ins_reviewer_carousel') !== -1;
  var hasReddit = pageAccess.indexOf('reddit_reply_assistant') !== -1;
  var hasRadar = pageAccess.indexOf('reddit_radar') !== -1;
  var hasPostWriter = pageAccess.indexOf('reddit_post_writer') !== -1;
  linkIns.style.display = hasIns ? '' : 'none';
  linkReddit.style.display = hasReddit ? '' : 'none';
  linkRadar.style.display = hasRadar ? '' : 'none';
  linkPostWriter.style.display = hasPostWriter ? '' : 'none';
  toolBar.style.display = (hasIns || hasReddit || hasRadar || hasPostWriter) ? '' : 'none';
}
```

## 第四步：更新构建脚本

修改 /scripts/sync-public.mjs，在 `reddit-radar` 复制行之后添加：

```javascript
await cp(join(root, 'reddit-post-writer'), join(publicDir, 'reddit-post-writer'), { recursive: true });
```

执行完这些步骤后，管理员可以在 admin 后台为用户开通独立发帖助手权限，VIP 用户可以在首页看到入口链接。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch D：Reddit 独立发帖助手页面

```
请你创建 Reddit 独立发帖助手的前端页面。这是一个单文件自包含页面（内联 CSS + JS），风格与项目现有页面保持一致。

## 任务：创建 /reddit-post-writer/index.html

URL 路径：`/reddit-post-writer/`

页面是一个独立发帖工具，核心流程：选择目标 Subreddit → 输入中文内容 → AI 改写为英文 → 针对每个版块生成独特文章 → 并排对比 → 人工微调 → 复制发布。

### 1. 页面布局

采用三列布局（桌面端）：

```
┌─────────────────────────────────────────────────────┐
│ 顶部导航：✍️ Reddit 独立发帖  ←封面  🧠回复  🔭雷达    │
├──────────┬──────────────────────┬───────────────────┤
│ 左侧面板  │ 中间预览区            │ 右侧面板           │
│ (30%)    │ (40%)                │ (30%)             │
│          │                      │                   │
│ 📋Subreddit│ 当前版块: r/PhD       │ ⚙️ AI 参数        │
│ 选择      │ 文章预览              │ 模型选择           │
│ r/PhD ✓  │                      │ 温度调节           │
│ r/GradS ✓│ [生成的英文文章]       │                   │
│ r/AskAc  │                      │ 📊 版块对比        │
│          │                      │ 高亮两版差异       │
│ 📝 输入   │                      │                   │
│ 中文标题  │                      │                   │
│ 中文正文  │                      │                   │
│          │                      │                   │
│ 📐 框架   │                      │                   │
│ [选择框]  │                      │                   │
│          │                      │                   │
│ ✨ 生成   │                      │                   │
│ [重写]    │                      │                   │
│ [复制]    │                      │                   │
│ [保存]    │                      │                   │
└──────────┴──────────────────────┴───────────────────┘
```

### 2. 左侧面板（输入区）

**2.1 Subreddit 选择器**
- 多选 checkbox 列表，从 `../data/reddit/subreddit_profiles.json` 加载
- 每个版块显示：名称 + 简要描述 + 受众心态
- 已选版块高亮
- 最多选 3 个（提示：选太多会导致文章同质化风险增加）
- 选择后自动加载对应版块的 postProfile，右侧显示版块提示

**2.2 中文输入**
- 标题输入框：`<input>` 单行
- 正文文本框：`<textarea>` 多行，建议 10-15 行
- 提示文案："输入中文版本的文章内容。可以是你想推广的产品故事、经验分享、或学术观点。"

**2.3 框架选择**
- 下拉选择预设框架：
  - `problem_solution_feedback` — 发现问题 → 解决 → 求反馈（默认，通用）
  - `research_evidence_discuss` — 研究 → 证据 → 讨论（学术版）
  - `struggle_lesson_ask` — 经历 → 教训 → 提问（轻量版）
  - `technique_example_compare` — 技巧 → 前后对比 → 邀请讨论
  - `custom` — 自定义（不指定框架，由 AI 自由发挥）
- 每个框架选项旁显示简介

**2.4 操作按钮组**
- 🚀 重写为英文（主按钮，红色/醒目）
- 📋 复制当前
- 💾 保存草稿（存 localStorage）

### 3. 中间面板（预览区）

**3.1 顶部 Tab 切换**
- 每个已选的 Subreddit 一个 Tab
- Tab 显示版块名称和简短标识
- 当前选中 Tab 高亮
- 未生成的版块显示灰色占位

**3.2 文章预览**
- 渲染为 Markdown 风格（标题加粗、段落间距、列表缩进）
- 红色高亮显示与"默认版本"的差异文字
- 底部显示该版块的热门帖结构参考（从 profile 读取）

**3.3 AI 改写提示**
- 改写过程中显示加载动画
- 改写完成后摘要：字数、预估阅读时间、与默认版本的差异度

### 4. 右侧面板**

**4.1 AI 参数**
- 模型选择下拉：`deepseek-chat` / `deepseek-reasoner`
- 温度滑块：0.3 ~ 1.0（默认 0.7）

**4.2 版块对比**
- 小卡片，列出每个已选版块的关键差异：
  - 框架是否不同
  - 语气差异
  - CTA 策略
- 帮助用户理解 AI 针对不同版块做了什么调整

**4.3 当前版块提示**
- 显示当前选中 Tab 对应版块的完整画像信息
- 热门帖结构参考
- 发帖注意事项

### 5. 技术实现

#### CSS 规范
- 使用 CSS Grid 三列布局（桌面端），单列堆叠（移动端 ≤768px）
- 配色与项目统一：背景 `#f7f5f2`，卡片 `#fff`，边框 `#e8e4df`
- 紧凑运营风格，与 Radar 页面保持一致

#### JavaScript 架构
- 纯 Vanilla JS，普通 `<script>` 标签
- 使用 Supabase SDK（`type="module"`）调用 DeepSeek API 进行文章改写
- 状态管理：`STATE = { selectedSubs, title, content, framework, posts: {}, activeTab, drafts }`

#### AI 改写流程

```
用户点击"重写为英文"
  → 遍历已选 Subreddit
    → 每个版块：构建独立 prompt（框架 + 语气 + 避免模式 + 热门帖结构）
    → 调用 DeepSeek API（/chat/completions）
    → 解析返回 → 存入 STATE.posts[subreddit]
  → 更新预览 Tab
```

#### Prompt 结构（独特性引擎）

系统 Prompt 对每个版块使用相同的"角色设定 + 任务说明"，但用户 Prompt 根据版块画像动态定制：

```
系统 Prompt:
你是一位精通 Reddit 文化和学术写作的英文改写助手。
你的任务是将用户的中文内容改写为一篇适合在 Reddit 特定版块发布的英文文章。
改写规则：
1. 必须保持原文的核心信息和价值主张
2. 语气、结构、开头方式必须适配目标版块的文化
3. 绝不要添加原文中没有的事实或数据
4. 字数控制在 300-600 词之间（根据版块偏好调整）
5. 使用自然的 Reddit 发帖格式（无 markdown 标题，用空行分段）
6. 结尾必须包含自然的互动邀请（非硬广 CTA）

用户 Prompt（每个版块不同）:
目标版块：r/PhD
版块文化：{audienceMood}
推荐框架：{storyFramework}
语气指导：{toneNotes}
应避免：{avoidPatterns}
热门帖结构参考：{hotPostPattern}
开头方式建议：{openingTemplate}

待改写的中文内容：
标题：{title}
正文：{content}
```

#### 独特性保证

- **每个版块的用户 Prompt 不同**：框架、语气、开头方式、避免模式都从 subreddit_profiles.json 读取
- **不同版块不会得到相同文章**：因为 prompt 中的版块文化、框架、语气显著不同
- **并排对比**：预览区可以切换 Tab 查看不同版块的文章，差异文字用颜色标注

#### localStorage 持久化
- `reddit_post_writer_drafts`：草稿数组
- 每条草稿：`{ id, title, content, framework, subreddits, posts: {}, savedAt }`

#### API 调用
- 使用 Supabase Edge Function 或直接调用 DeepSeek（从页面读取 config）
- 如果直接调用：从 `window.COVER_MAKER_CONFIG` 或 localStorage 读取 API key
- 每次改写约 5-10 秒

### 6. 空状态和错误处理
- 未选择 Subreddit：提示请先选择目标版块
- 未输入内容：提示请输入中文内容
- AI 调用失败：显示错误信息 + 重试按钮
- 加载画像失败：使用默认画像（通用 warm + story_first）

### 7. 响应式
- 桌面端（>768px）：三列 Grid 布局
- 移动端（≤768px）：单列堆叠，左侧输入区 → 中间预览 → 右侧面板

执行完这些步骤后，独立发帖助手页面应完整可运行。用户可以选择 Subreddit、输入中文、AI 改写成针对每个版块的独特英文文章。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## Batch E：独特性引擎强化 + 回复助手画像联动

```
请你完成最后的集成工作：强化独特性引擎确保每个版块生成不同文章；让回复助手读取 Subreddit 画像提供的 openingTemplate。

## 第一步：修改回复助手

修改 /reddit-reply-assistant/index.html，在现有的 Reddit Radar 预填代码块中（约第2752行之后的 checkRadarPrefill 函数），添加对 `openingTemplate` 的处理。

在预填逻辑中找到任何合适的位置（比如预填回复语气之后），添加以下代码：

```javascript
    // 预填 Subreddit 画像提供的开头模板
    if (prefill.openingTemplate && typeof setOpeningTemplate === 'function') {
      setOpeningTemplate(prefill.openingTemplate);
    } else if (prefill.openingTemplate) {
      // Fallback：如果回复助手有能用的输入框，将模板预填到某处
      // 将 openingTemplate 追加到 sourceText 的开头
      var stEl = document.getElementById('sourceText');
      if (stEl && prefill.openingTemplate) {
        var currentVal = stEl.value || '';
        if (currentVal.indexOf(prefill.openingTemplate) === -1) {
          stEl.value = prefill.openingTemplate + '\n\n' + currentVal;
          stEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
```

注意：这段代码应该放在现有 Radar 预填代码的 try 块内，在后续预填逻辑的合适位置。

## 第二步：确保独立发帖页面的独特性引擎

创建 /reddit-post-writer/ 页面时（Batch D），确保以下关键设计：

1. **每个版块调用一次 AI**：不是一次调用生成所有版本，而是每个版块单独调用
2. **Prompt 差异化**：每次调用的用户 Prompt 必须从 subreddit_profiles.json 中读取对应的字段（框架、语气、开头方式、避免模式、热门帖结构），确保不同版块的 AI 输入有显著差异
3. **随机种子**：可在 prompt 末尾添加 `\n\n[随机标识: {随机数}]` 进一步降低重复概率

在独立发帖页面的 JS 中，生成文章的函数核心逻辑应遵循以下模式：

```javascript
async function generateForSubreddit(subreddit, profile, title, content, framework) {
  var rp = profile.postProfile || {};
  var pp = profile; // 整个 profile 对象

  var userPrompt = [
    '目标版块：' + (profile.displayName || ('r/' + profile.subreddit)),
    '版块介绍：' + (profile.description || ''),
    '版块受众心态：' + (profile.audienceMood || ''),
    '',
    '本次发帖要求：',
    '- 使用框架：' + framework,
    '- 语气指导：' + (rp.toneNotes || ''),
    '- 热门帖结构参考：' + (rp.hotPostPattern || ''),
    '- 应避免的模式：' + (rp.avoidPatterns || ''),
    '',
    '待改写的中文内容：',
    '标题：' + title,
    '正文：' + content,
    '',
    '请直接输出改写后的英文文章，不要输出任何解释或标注。'
  ].join('\n');

  // 调用 DeepSeek（通过 Supabase Edge Function 或直接 fetch）
  var result = await callAI(userPrompt, '改写英文文章，适配 ' + profile.displayName);
  return result;
}
```

## 第三步：统一清理和验证

确认以下文件存在且格式正确：
- `/data/reddit/subreddit_profiles.json` — 10 个版块画像
- `/reddit-post-writer/index.html` — 独立发帖页面
- `/supabase/functions/radar-manage/index.ts` — 含 save_profiles action
- `/supabase/functions/admin-manage/index.ts` — validPages 含 reddit_post_writer
- `/admin.html` — 含发帖 chip
- `/index.html` — 含 linkPostWriter 链接和 JS
- `/scripts/sync-public.mjs` — 含 reddit-post-writer/ 复制
- `/reddit-radar/index.html` — 含画像编辑器 + goGenerateReply 使用画像
- `/reddit-reply-assistant/index.html` — 含 openingTemplate 预填

全部 5 个 Batch 执行完毕后，逐一确认清单中各项。系统应处于完整可运行状态，不会产生任何 bug。
```

---

## 批量执行完成后检查清单

| # | 检查项 | 验证方式 |
|---|--------|---------|
| 1 | `subreddit_profiles.json` 存在且含 10 个版块画像 | 直接查看文件 |
| 2 | `radar-manage` Edge Function 支持 save_profiles | 部署后查看 Supabase Dashboard |
| 3 | Radar 配置面板可见 "📋 Subreddit 画像" 分区 | 浏览器打开雷达页面 |
| 4 | 从 Radar 点 "生成回复" 自动应用版块画像的 tone/CTA | 点击生成回复后查看回复助手预填 |
| 5 | admin.html 有 "发帖" page-access chip | 管理员登录查看 |
| 6 | 首页 toolLinksBar 有 "✍️ Reddit 独立发帖" 链接 | VIP 用户登录查看 |
| 7 | `/reddit-post-writer/` 页面可访问且功能完整 | 浏览器打开 |
| 8 | 选择不同 Subreddit 生成的英文文章内容不同 | 测试多版块生成 |
| 9 | 回复助手能读取 openingTemplate 并预填 | 从 Radar 跳转测试 |
| 10 | sync-public.mjs 包含 reddit-post-writer/ 复制 | 检查脚本 |

---

## 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1 | 2026-07-04 | 初版，8批次覆盖 Reddit Radar MVP |
| v2 | 2026-07-04 | 阶段二：Subreddit 画像 + 独立发帖助手，5批次 |
