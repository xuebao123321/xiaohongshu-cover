import { readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const DATA_DIR = join(root, 'data', 'reddit');

const SOURCES_PATH = join(DATA_DIR, 'sources.json');
const POSTS_PATH = join(DATA_DIR, 'posts.json');
const LOG_PATH = join(DATA_DIR, 'fetch-log.json');
const TMP_POSTS_PATH = join(DATA_DIR, '.tmp_posts.json');
const TMP_LOG_PATH = join(DATA_DIR, '.tmp_fetch-log.json');

const USER_AGENT = 'academic-reddit-radar/1.0 (yourdomain)';
const REQUEST_TIMEOUT_MS = 30_000;
const DELAY_BETWEEN_MS = 5_000;
const MAX_AGE_DAYS = 14;

// ── helpers ──

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Fetch with timeout */
async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/** Sanitize a string for safe JSON serialization */
function sanitize(str) {
  if (!str) return '';
  return str
    .replace(/\0/g, '')                          // null bytes
    .replace(/[\uD800-\uDFFF]/g, '')             // lone surrogates
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // control chars except \t \n \r
    .trim();
}

/** Strip HTML tags, decode entities roughly */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .trim();
}

/** Extract Reddit post id from a URL or id string */
function extractRedditId(str) {
  const m = str.match(/\/comments\/([a-z0-9]+)/i);
  return m ? m[1] : null;
}

/** Build a stable internal id */
function buildPostId(redditId) {
  return `reddit_${redditId}`;
}

/** Hash title + url */
function hashContent(title, url) {
  return createHash('sha256').update(`${title}\0${url}`).digest('hex');
}

// ── Atom XML parsing (regex-based, no deps) ──

/**
 * Parse Reddit Atom RSS XML into an array of post objects.
 * Handles both `<entry>` (Atom) and `<item>` (RSS 2.0) formats.
 */
function parseRssXml(xml, source) {
  const posts = [];

  // Split into entries (Atom) or items (RSS 2.0)
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/gi;
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi;

  const blocks = [];
  let m;
  while ((m = entryPattern.exec(xml))) blocks.push({ raw: m[1], type: 'atom' });
  if (blocks.length === 0) {
    while ((m = itemPattern.exec(xml))) blocks.push({ raw: m[1], type: 'rss' });
  }

  for (const block of blocks) {
    try {
      const post = parseEntry(block.raw, block.type, source);
      if (post && post.redditId) posts.push(post);
    } catch {
      // skip malformed entries
    }
  }

  return posts;
}

function firstMatch(re, str) {
  const m = str.match(re);
  return m ? (m[1] || '').trim() : '';
}

function parseEntry(raw, type, source) {
  // --- id / link ---
  let id = '';
  let url = '';

  if (type === 'atom') {
    id = firstMatch(/<id>([\s\S]*?)<\/id>/i, raw);
    // <link href="..."/>
    url = firstMatch(/<link[^>]*href="([^"]*)"/i, raw);
    if (!url) url = firstMatch(/<link[^>]*href='([^']*)'/i, raw);
  } else {
    // RSS 2.0
    url = firstMatch(/<link>([\s\S]*?)<\/link>/i, raw);
    id = url; // fallback
  }

  // Try to get a better id from the Atom <id> (usually contains the reddit post id)
  const redditId = extractRedditId(id) || extractRedditId(url);
  if (!redditId) return null;

  // --- title ---
  let title = firstMatch(/<title[^>]*>([\s\S]*?)<\/title>/i, raw);
  // strip CDATA
  title = sanitize(title.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, ''));

  // --- content ---
  let content = '';
  const contentMatch = raw.match(/<content[^>]*type="html"[^>]*>([\s\S]*?)<\/content>/i);
  if (contentMatch) {
    content = contentMatch[1];
  } else {
    // fallback: try description in RSS, or any content tag
    content = firstMatch(/<content[^>]*>([\s\S]*?)<\/content>/i, raw);
    if (!content) content = firstMatch(/<description>([\s\S]*?)<\/description>/i, raw);
  }
  content = content.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
  content = sanitize(stripHtml(content));

  // --- author ---
  let author = '';
  // Atom: <author><name>...</name></author>
  const authorMatch = raw.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/i);
  if (authorMatch) author = authorMatch[1].trim();
  if (!author) author = firstMatch(/<dc:creator>([\s\S]*?)<\/dc:creator>/i, raw);

  // --- published / updated ---
  let publishedAt = firstMatch(/<published>([\s\S]*?)<\/published>/i, raw);
  if (!publishedAt) publishedAt = firstMatch(/<updated>([\s\S]*?)<\/updated>/i, raw);
  if (!publishedAt) publishedAt = firstMatch(/<pubDate>([\s\S]*?)<\/pubDate>/i, raw);
  // Normalise to ISO (pubDate is RFC 2822)
  if (publishedAt && !publishedAt.includes('T')) {
    const d = new Date(publishedAt);
    if (!isNaN(d.getTime())) publishedAt = d.toISOString();
  }

  // --- category / subreddit ---
  let subreddit = source.subreddit || '';
  // Atom: <category term="..." label="..."/>
  const catMatch = raw.match(/<category[^>]*term="([^"]*)"[^>]*label="([^"]*)"/i);
  if (catMatch) {
    subreddit = catMatch[2] || catMatch[1] || subreddit;
  }
  // Also try dc:subject
  if (!subreddit) subreddit = firstMatch(/<dc:subject>([\s\S]*?)<\/dc:subject>/i, raw);

  const contentHash = hashContent(title, url);

  return {
    id: buildPostId(redditId),
    redditId,
    title,
    content,
    url,
    subreddit,
    author,
    publishedAt: publishedAt || new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    sourceId: source.id,
    sourceKeyword: source.keyword || '',
    sourceType: source.type,
    contentHash,
  };
}

// ── dedup & merge ──

function deduplicate(newPosts, existingPosts) {
  const seenRedditIds = new Set();
  const seenUrls = new Set();
  const seenHashes = new Set();

  for (const p of existingPosts) {
    if (p.redditId) seenRedditIds.add(p.redditId);
    if (p.url) seenUrls.add(p.url);
    if (p.contentHash) seenHashes.add(p.contentHash);
  }

  const merged = [...existingPosts];
  let added = 0;

  for (const np of newPosts) {
    // Check if already exists
    if (np.redditId && seenRedditIds.has(np.redditId)) {
      // Merge sourceKeyword / sourceId into existing record
      const existing = merged.find((p) => p.redditId === np.redditId);
      if (existing) mergeSourceFields(existing, np);
      continue;
    }
    if (np.url && seenUrls.has(np.url)) {
      const existing = merged.find((p) => p.url === np.url);
      if (existing) mergeSourceFields(existing, np);
      continue;
    }
    if (np.contentHash && seenHashes.has(np.contentHash)) {
      const existing = merged.find((p) => p.contentHash === np.contentHash);
      if (existing) mergeSourceFields(existing, np);
      continue;
    }

    // New post
    merged.push(np);
    if (np.redditId) seenRedditIds.add(np.redditId);
    if (np.url) seenUrls.add(np.url);
    if (np.contentHash) seenHashes.add(np.contentHash);
    added++;
  }

  return { merged, added };
}

function mergeSourceFields(existing, incoming) {
  // Merge sourceKeywords
  if (!Array.isArray(existing.sourceKeywords)) {
    existing.sourceKeywords = existing.sourceKeyword
      ? [existing.sourceKeyword]
      : [];
  }
  if (incoming.sourceKeyword && !existing.sourceKeywords.includes(incoming.sourceKeyword)) {
    existing.sourceKeywords.push(incoming.sourceKeyword);
  }

  // Merge sourceIds
  if (!Array.isArray(existing.sourceIds)) {
    existing.sourceIds = existing.sourceId ? [existing.sourceId] : [];
  }
  if (incoming.sourceId && !existing.sourceIds.includes(incoming.sourceId)) {
    existing.sourceIds.push(incoming.sourceId);
  }

  // Keep sourceKeyword as the joined string for backwards compat
  existing.sourceKeyword = existing.sourceKeywords.join(', ');
}

// ── age filter ──

function filterByAge(posts, maxAgeDays) {
  const cutoff = Date.now() - maxAgeDays * 86400_000;
  return posts.filter((p) => {
    const t = new Date(p.publishedAt).getTime();
    return !isNaN(t) && t >= cutoff;
  });
}

// ── atomic write ──

async function atomicWrite(tmpPath, targetPath, data) {
  await writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  // Validate by reading back
  const raw = await readFile(tmpPath, 'utf-8');
  JSON.parse(raw); // throws if invalid
  await rename(tmpPath, targetPath);
}

// ── main ──

async function main() {
  console.log('[fetch-reddit-rss] Starting...');

  // 1. Read sources
  let sources;
  try {
    sources = JSON.parse(await readFile(SOURCES_PATH, 'utf-8'));
  } catch (e) {
    console.error('[fetch-reddit-rss] Failed to read sources.json:', e.message);
    process.exit(1);
  }

  const enabled = sources.filter((s) => s.enabled === true);
  console.log(`[fetch-reddit-rss] ${enabled.length} enabled sources out of ${sources.length} total`);

  // 2. Read existing posts
  let existingPosts = [];
  try {
    const raw = await readFile(POSTS_PATH, 'utf-8');
    existingPosts = JSON.parse(raw);
    if (!Array.isArray(existingPosts)) existingPosts = [];
  } catch {
    existingPosts = [];
  }

  // 3. Read existing fetch log
  let fetchLog = [];
  try {
    const raw = await readFile(LOG_PATH, 'utf-8');
    fetchLog = JSON.parse(raw);
    if (!Array.isArray(fetchLog)) fetchLog = [];
  } catch {
    fetchLog = [];
  }

  // 4. Fetch each source
  let totalNew = 0;

  for (let i = 0; i < enabled.length; i++) {
    const source = enabled[i];
    const logEntry = {
      sourceId: source.id,
      rssUrl: source.rssUrl,
      status: 'error',
      newPosts: 0,
      errorMessage: null,
      fetchedAt: new Date().toISOString(),
    };

    try {
      console.log(`[fetch-reddit-rss] [${i + 1}/${enabled.length}] Fetching: ${source.id}`);

      const res = await fetchWithTimeout(source.rssUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const xml = await res.text();
      const newPosts = parseRssXml(xml, source);

      if (newPosts.length === 0) {
        logEntry.status = 'success';
        logEntry.newPosts = 0;
        console.log(`  -> 0 posts found`);
      } else {
        const { merged, added } = deduplicate(newPosts, existingPosts);
        existingPosts = merged;
        totalNew += added;
        logEntry.status = 'success';
        logEntry.newPosts = added;
        console.log(`  -> ${newPosts.length} parsed, ${added} new (total pool: ${existingPosts.length})`);
      }
    } catch (e) {
      logEntry.errorMessage = e.message || 'Unknown error';
      console.error(`  -> ERROR: ${logEntry.errorMessage}`);
    }

    fetchLog.push(logEntry);

    // Delay between requests (skip last)
    if (i < enabled.length - 1) {
      await sleep(DELAY_BETWEEN_MS);
    }
  }

  // 5. Filter by age
  const before = existingPosts.length;
  existingPosts = filterByAge(existingPosts, MAX_AGE_DAYS);
  const pruned = before - existingPosts.length;
  if (pruned > 0) console.log(`[fetch-reddit-rss] Pruned ${pruned} posts older than ${MAX_AGE_DAYS} days`);

  // 6. Atomic write posts.json
  await atomicWrite(TMP_POSTS_PATH, POSTS_PATH, existingPosts);
  console.log(`[fetch-reddit-rss] Wrote ${existingPosts.length} posts to posts.json`);

  // 7. Atomic write fetch-log.json
  await atomicWrite(TMP_LOG_PATH, LOG_PATH, fetchLog);
  console.log(`[fetch-reddit-rss] Wrote ${fetchLog.length} log entries to fetch-log.json`);

  console.log(`Done. Total new posts: ${totalNew}`);
}

// ── entrypoint ──
// Only auto-run when called directly (not imported)
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((e) => {
    console.error('[fetch-reddit-rss] Fatal error:', e);
    process.exit(1);
  });
}
