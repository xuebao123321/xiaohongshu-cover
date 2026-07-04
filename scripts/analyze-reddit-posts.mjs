import { readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const DATA_DIR = join(root, 'data', 'reddit');

const SOURCES_PATH = join(DATA_DIR, 'sources.json');
const POSTS_PATH = join(DATA_DIR, 'posts.json');
const ANALYSIS_PATH = join(DATA_DIR, 'analysis.json');
const KEYWORDS_PATH = join(DATA_DIR, 'keywords.json');
const TMP_ANALYSIS_PATH = join(DATA_DIR, '.tmp_analysis.json');

const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';
const AI_BASE_URL = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const MAX_TO_ANALYZE = 30;
const MAX_CONTENT_LENGTH = 4000;

// ── helpers ──

/** Check if post title+content matches at least one keyword (case-insensitive) */
function matchesKeywords(post, keywords) {
  if (!keywords || keywords.length === 0) return true; // no keywords = allow all
  const haystack = ((post.title || '') + ' ' + (post.content || '')).toLowerCase();
  for (const kw of keywords) {
    if (kw && haystack.includes(kw.toLowerCase())) return true;
  }
  return false;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function truncate(text, maxLen) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...[truncated]';
}

/** Extract JSON from AI response — handles ```json fences and plain text */
function extractJson(text) {
  if (!text) return null;

  // Try ```json ... ``` block first
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : text.trim();

  // Find the outermost { ... } in the candidate
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) return null;

  return candidate.slice(firstBrace, lastBrace + 1);
}

/** Clamp a number to [min, max] */
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/** Build a priority map from sources: sourceId -> priority */
function buildPriorityMap(sources) {
  const map = {};
  for (const s of sources) {
    if (s.id && typeof s.priority === 'number') {
      map[s.id] = s.priority;
    }
  }
  return map;
}

/** Derive recommendedAction from totalScore */
function deriveAction(totalScore) {
  if (totalScore >= 15) return 'high_priority_reply';
  if (totalScore >= 10) return 'reply';
  if (totalScore >= 6) return 'save_topic';
  return 'ignore';
}

// ── system prompt ──

const SYSTEM_PROMPT = `你是一家正规合规的 AI 论文辅导机构的 Reddit 市场分析助手。
机构只提供 academic writing coaching、manuscript editing、reviewer response support、journal submission strategy、research communication coaching。
机构不提供代写、包发表、保证录用、伪造数据、替用户完成学术任务等服务。

你的任务是分析输入的 Reddit 帖子，判断它是否包含论文写作、审稿返修、英文润色、选刊投稿、AI 写作等相关需求。

必须先判断帖子类型：
1. user_need：用户真实求助
2. competitor_marketing：同行营销或服务推广
3. academic_discussion：普通学术讨论
4. irrelevant：无关内容

如果不是 user_need 或 competitor_marketing，不要强行提炼私域钩子。
如果信息没有出现，请写 null，不要编造。

请只输出 JSON，不要输出解释。`;

function buildUserPrompt(post, sourceKeyword) {
  return `请分析以下 Reddit 帖子：

Subreddit: ${post.subreddit || ''}
Title: ${post.title || ''}
Content: ${truncate(post.content || '', MAX_CONTENT_LENGTH)}
Source keyword: ${sourceKeyword || ''}

请输出以下 JSON：
{
  "postType": "user_need | competitor_marketing | academic_discussion | irrelevant",
  "painPoint": "",
  "problemType": "harsh_reviewer | writing_unclear | lack_of_novelty | english_editing | journal_selection | rr_anxiety | ai_writing | thesis_structure | other | irrelevant",
  "urgencyScore": 1,
  "serviceFitScore": 1,
  "replyWorthinessScore": 1,
  "riskScore": 1,
  "totalScore": 0,
  "recommendedAction": "ignore | save_topic | reply | high_priority_reply",
  "suggestedReplyAngle": "",
  "ctaLevel": "none | soft | medium | direct",
  "summary": "",
  "xiaohongshuTopic": "",
  "instagramTopic": "",
  "complianceNotes": ""
}`;
}

// ── AI call ──

async function analyzePost(post, priorityMap) {
  const sourceKeyword = post.sourceKeyword || '';
  const userPrompt = buildUserPrompt(post, sourceKeyword);

  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`AI API HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI API returned empty response');

  const extracted = extractJson(content);
  if (!extracted) throw new Error(`Failed to extract JSON from AI response: ${content.slice(0, 200)}`);

  const parsed = JSON.parse(extracted);

  // Compute totalScore from AI scores + source priority
  const sourcePriority = priorityMap[post.sourceId] || 1;
  const urgency = clamp(Number(parsed.urgencyScore) || 1, 1, 5);
  const serviceFit = clamp(Number(parsed.serviceFitScore) || 1, 1, 5);
  const replyWorth = clamp(Number(parsed.replyWorthinessScore) || 1, 1, 5);
  const risk = clamp(Number(parsed.riskScore) || 1, 1, 5);
  const totalScore = clamp(urgency + serviceFit + replyWorth + sourcePriority - risk, 0, 20);

  return {
    postId: post.id,
    postType: String(parsed.postType || 'irrelevant'),
    painPoint: String(parsed.painPoint || ''),
    problemType: String(parsed.problemType || 'irrelevant'),
    urgencyScore: urgency,
    serviceFitScore: serviceFit,
    replyWorthinessScore: replyWorth,
    riskScore: risk,
    totalScore,
    recommendedAction: deriveAction(totalScore),
    suggestedReplyAngle: String(parsed.suggestedReplyAngle || ''),
    ctaLevel: String(parsed.ctaLevel || 'none'),
    summary: String(parsed.summary || ''),
    xiaohongshuTopic: String(parsed.xiaohongshuTopic || ''),
    instagramTopic: String(parsed.instagramTopic || ''),
    complianceNotes: String(parsed.complianceNotes || ''),
    analyzedAt: new Date().toISOString(),
  };
}

// ── atomic write ──

async function atomicWrite(tmpPath, targetPath, data) {
  await writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  const raw = await readFile(tmpPath, 'utf-8');
  JSON.parse(raw);
  await rename(tmpPath, targetPath);
}

// ── main ──

async function main() {
  if (!AI_API_KEY) {
    console.error('[analyze-reddit-posts] Error: AI_API_KEY (or OPENAI_API_KEY) env var is required.');
    process.exit(1);
  }

  console.log(`[analyze-reddit-posts] Using model: ${AI_MODEL} @ ${AI_BASE_URL}`);

  // 1. Read posts
  let posts;
  try {
    posts = JSON.parse(await readFile(POSTS_PATH, 'utf-8'));
  } catch (e) {
    console.error('[analyze-reddit-posts] Failed to read posts.json:', e.message);
    process.exit(1);
  }

  if (posts.length === 0) {
    console.log('[analyze-reddit-posts] No posts to analyze. Done.');
    return;
  }

  // 2. Read existing analyses
  let analyses;
  try {
    analyses = JSON.parse(await readFile(ANALYSIS_PATH, 'utf-8'));
  } catch {
    analyses = [];
  }

  // Only skip posts that have been successfully analyzed (analyzedAt is set).
  // Posts with analysisError will be retried.
  const analyzedIds = new Set(
    analyses
      .filter((a) => a.analyzedAt)
      .map((a) => a.postId)
      .filter(Boolean)
  );
  // Remove failed entries from analyses so they can be re-attempted
  analyses = analyses.filter((a) => a.analyzedAt);

  // 3. Read sources for priority map
  let sources;
  try {
    sources = JSON.parse(await readFile(SOURCES_PATH, 'utf-8'));
  } catch {
    sources = [];
  }
  const priorityMap = buildPriorityMap(sources);

  // 4. Read keywords for pre-filter
  let keywords = [];
  try {
    keywords = JSON.parse(await readFile(KEYWORDS_PATH, 'utf-8'));
  } catch {
    keywords = [];
  }
  console.log(`[analyze-reddit-posts] Loaded ${keywords.length} pre-filter keywords`);

  // 5. Find unanalyzed posts, sort by source priority desc
  const unanalyzed = posts
    .filter((p) => p.id && !analyzedIds.has(p.id))
    .sort((a, b) => {
      const pa = priorityMap[a.sourceId] || 1;
      const pb = priorityMap[b.sourceId] || 1;
      return pb - pa;
    });

  // 6. Pre-filter: split into keyword-matching (→ AI) and non-matching (→ skipped)
  const candidates = [];
  const skippedPosts = [];
  for (const p of unanalyzed) {
    if (matchesKeywords(p, keywords)) {
      candidates.push(p);
    } else {
      skippedPosts.push(p);
    }
  }

  // Mark skipped posts in analysis.json so they don't get re-checked
  for (const sp of skippedPosts) {
    analyses.push({
      postId: sp.id,
      postType: 'irrelevant',
      painPoint: '',
      problemType: 'irrelevant',
      urgencyScore: 1,
      serviceFitScore: 1,
      replyWorthinessScore: 1,
      riskScore: 5,
      totalScore: 0,
      recommendedAction: 'ignore',
      suggestedReplyAngle: '',
      ctaLevel: 'none',
      summary: '',
      xiaohongshuTopic: '',
      instagramTopic: '',
      complianceNotes: '',
      analyzedAt: new Date().toISOString(),
      skipped: true,
    });
  }

  // Limit AI analysis to MAX_TO_ANALYZE, highest priority first
  const toAnalyze = candidates.slice(0, MAX_TO_ANALYZE);

  console.log(`[analyze-reddit-posts] ${unanalyzed.length} unanalyzed → ${candidates.length} keyword match → ${toAnalyze.length} queued for AI (${skippedPosts.length} skipped, ${analyzedIds.size} already done)`);

  if (toAnalyze.length === 0) {
    // Still write skipped posts
    await atomicWrite(TMP_ANALYSIS_PATH, ANALYSIS_PATH, analyses);
    console.log('[analyze-reddit-posts] No posts matched keywords. Done.');
    return;
  }

  // 7. Analyze each post
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toAnalyze.length; i++) {
    const post = toAnalyze[i];
    console.log(`[analyze-reddit-posts] [${i + 1}/${toAnalyze.length}] Analyzing: ${post.id} (${post.title?.slice(0, 50)}...)`);

    try {
      const result = await analyzePost(post, priorityMap);
      analyses.push(result);
      successCount++;
      console.log(`  -> type=${result.postType} problem=${result.problemType} score=${result.totalScore} action=${result.recommendedAction}`);
    } catch (e) {
      // Failed analysis — record with error, don't block others
      analyses.push({
        postId: post.id,
        postType: 'irrelevant',
        painPoint: '',
        problemType: 'irrelevant',
        urgencyScore: 1,
        serviceFitScore: 1,
        replyWorthinessScore: 1,
        riskScore: 5,
        totalScore: 0,
        recommendedAction: 'ignore',
        suggestedReplyAngle: '',
        ctaLevel: 'none',
        summary: '',
        xiaohongshuTopic: '',
        instagramTopic: '',
        complianceNotes: '',
        analyzedAt: null,
        analysisError: e.message || 'Unknown error',
      });
      failCount++;
      console.error(`  -> FAILED: ${e.message}`);
    }

    // Small delay between API calls to avoid rate limiting
    if (i < toAnalyze.length - 1) {
      await sleep(500);
    }
  }

  // 6. Atomic write
  await atomicWrite(TMP_ANALYSIS_PATH, ANALYSIS_PATH, analyses);
  console.log(`[analyze-reddit-posts] Wrote ${analyses.length} analyses to analysis.json`);
  console.log(`Done. Analyzed: ${successCount} succeeded, ${failCount} failed.`);
}

// ── entrypoint ──
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((e) => {
    console.error('[analyze-reddit-posts] Fatal error:', e);
    process.exit(1);
  });
}
