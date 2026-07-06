const SESSION_COOKIE = 'cm_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

// ── Instagram Content Assistant: rate-limit store (in-memory, per-isolate) ──
const rateLimitMap = new Map();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, url);
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request, env, url) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return corsResponse(new Response(null, { status: 204 }));
  }

  // Rate limit for Instagram content endpoints
  if (
    url.pathname === '/api/generate-instagram-content' ||
    url.pathname === '/api/rewrite-instagram-content' ||
    url.pathname === '/api/generate-reels-video-plan'
  ) {
    const limitResult = checkRateLimit(request);
    if (!limitResult.allowed) {
      return corsResponse(
        new Response(JSON.stringify({ ok: false, error: '请求过于频繁，请稍后重试' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        })
      );
    }
  }

  try {
    if (request.method === 'GET' && url.pathname === '/api/me') return handleMe(request, env);
    if (request.method === 'POST' && url.pathname === '/api/register') return handleRegister(request, env);
    if (request.method === 'POST' && url.pathname === '/api/login') return handleLogin(request, env);
    if (request.method === 'POST' && url.pathname === '/api/logout') return handleLogout(request, env);
    if (request.method === 'POST' && url.pathname === '/api/downloads/authorize') return handleDownloadAuthorize(request, env);
    // ── Instagram Content Assistant routes ──
    if (request.method === 'POST' && url.pathname === '/api/generate-instagram-content') return handleGenerateInstagramContent(request, env);
    if (request.method === 'POST' && url.pathname === '/api/rewrite-instagram-content') return handleRewriteInstagramContent(request, env);
    if (request.method === 'POST' && url.pathname === '/api/generate-reels-video-plan') return handleGenerateReelsVideoPlan(request, env);
    return json({ ok: false, error: 'Not found' }, 404);
  } catch (error) {
    console.error(error);
    return json({ ok: false, message: '服务器异常,请稍后再试' }, 500);
  }
}

async function handleMe(request, env) {
  const user = await currentUser(request, env);
  return json(await authPayload(env, user));
}

async function handleRegister(request, env) {
  const payload = await readJson(request);
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  if (!email.includes('@') || email.length > 180) {
    return json({ ok: false, code: 'INVALID_EMAIL', message: '请输入有效邮箱' }, 400);
  }
  if (password.length < 6) {
    return json({ ok: false, code: 'WEAK_PASSWORD', message: '密码至少 6 位' }, 400);
  }
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);
  try {
    const result = await env.DB.prepare(
      "INSERT INTO users(email, password_hash, role, created_at, updated_at) VALUES (?, ?, 'free', ?, ?)"
    ).bind(email, passwordHash, now, now).run();
    const userId = result.meta.last_row_id;
    const token = await createSession(env, userId);
    const user = await getUserById(env, userId);
    return json(await authPayload(env, user), 200, [sessionCookie(request, token)]);
  } catch (error) {
    if (String(error && error.message || '').includes('UNIQUE')) {
      return json({ ok: false, code: 'EMAIL_EXISTS', message: '这个邮箱已经注册' }, 409);
    }
    throw error;
  }
}

async function handleLogin(request, env) {
  const payload = await readJson(request);
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return json({ ok: false, code: 'BAD_CREDENTIALS', message: '邮箱或密码不正确' }, 401);
  }
  const token = await createSession(env, user.id);
  return json(await authPayload(env, user), 200, [sessionCookie(request, token)]);
}

async function handleLogout(request, env) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  return json({ ok: true }, 200, [clearSessionCookie(request)]);
}

async function handleDownloadAuthorize(request, env) {
  const payload = await readJson(request);
  const count = clamp(parseInt(payload.count || '1', 10) || 1, 1, 500);
  const scope = String(payload.scope || 'single').slice(0, 40);
  const user = await currentUser(request, env);
  if (!user) {
    return json({ ok: false, code: 'LOGIN_REQUIRED', message: '请先登录后下载' }, 401);
  }
  if (user.role === 'vip') {
    return json({ ...(await authPayload(env, user)), authorized: true });
  }
  if (scope !== 'single' || count !== 1) {
    return json({ ok: false, code: 'VIP_REQUIRED', message: '普通会员不支持批量下载,请升级 VIP' }, 403);
  }
  const used = await usedDownloadsToday(env, user.id);
  const dailyLimit = freeDailyDownloads(env);
  if (used + count > dailyLimit) {
    return json({
      ok: false,
      code: 'DAILY_LIMIT_EXCEEDED',
      message: `普通会员每天最多下载 ${dailyLimit} 张`,
      limits: await limitsPayload(env, user),
    }, 403);
  }
  await env.DB.prepare(
    'INSERT INTO download_logs(user_id, download_date, count, scope, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, todayKey(), count, scope, new Date().toISOString()).run();
  return json({ ...(await authPayload(env, user)), authorized: true });
}

// ═══════════════════════════════════════════════════════════════
// Instagram Content Assistant – helper functions
// ═══════════════════════════════════════════════════════════════

function checkRateLimit(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const maxRequests = 10;
  const key = `${ip}:${Math.floor(now / windowMs)}`;
  const count = (rateLimitMap.get(key) || 0) + 1;
  rateLimitMap.set(key, count);
  // Clean up old entries periodically
  if (rateLimitMap.size > 10_000) {
    const cutoff = Math.floor(now / windowMs) - 2;
    for (const k of rateLimitMap.keys()) {
      const parts = k.split(':');
      if (parseInt(parts[1] || '0', 10) < cutoff) rateLimitMap.delete(k);
    }
  }
  return { allowed: count <= maxRequests, count };
}

function corsResponse(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

function jsonCors(payload, status = 200, cookies = []) {
  return corsResponse(json(payload, status, cookies));
}

async function callModel(env, messages) {
  const baseUrl = env.MODEL_BASE_URL || 'https://api.deepseek.com';
  const model = env.MODEL_NAME || 'deepseek-chat';
  const apiKey = env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  const body = JSON.stringify({
    model,
    messages,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    });
  } catch (err) {
    throw new Error(`Failed to reach model API: ${err.message}`);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Model API error ${response.status}: ${text.substring(0, 300)}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Model returned empty response');
  }

  // Parse JSON with fix attempts
  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch (_first) {
    // Try fixing common JSON issues
    const fixed = fixJson(rawContent);
    try {
      parsed = JSON.parse(fixed);
    } catch (_second) {
      // Retry once
      const retryResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            ...messages,
            { role: 'assistant', content: rawContent },
            { role: 'user', content: 'The JSON you returned was invalid. Please output ONLY valid JSON. Do not wrap in markdown code blocks. Do not add trailing commas. Ensure all braces and brackets are properly closed.' },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const retryContent = retryData.choices?.[0]?.message?.content;
        if (retryContent) {
          try {
            parsed = JSON.parse(retryContent);
          } catch (_third) {
            parsed = JSON.parse(fixJson(retryContent));
          }
        }
      }
      if (!parsed) {
        throw new Error('Model returned invalid JSON after retry');
      }
    }
  }

  return parsed;
}

function fixJson(raw) {
  let text = raw.trim();
  // Remove markdown code block wrappers
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/, '');
  // Remove trailing commas before closing braces/brackets
  text = text.replace(/,(\s*[}\]])/g, '$1');
  // Fix unclosed braces/brackets (simple heuristic)
  const openBraces = (text.match(/\{/g) || []).length;
  const closeBraces = (text.match(/\}/g) || []).length;
  const openBrackets = (text.match(/\[/g) || []).length;
  const closeBrackets = (text.match(/\]/g) || []).length;
  if (openBraces > closeBraces) {
    text += '}'.repeat(openBraces - closeBraces);
  }
  if (openBrackets > closeBrackets) {
    text += ']'.repeat(openBrackets - closeBrackets);
  }
  return text;
}

// ── Compliance ──

const HIGH_RISK_PATTERNS = [
  /guaranteed\s+acceptance/gi,
  /guaranteed\s+publication/gi,
  /we\s+write\s+your\s+paper/gi,
  /ghostwriting/gi,
  /publish\s+it\s+for\s+you/gi,
  /contract\s+cheating/gi,
  /fake\s+data/gi,
  /do\s+your\s+assignment/gi,
  /代写/gi,
  /包发表/gi,
  /保录用/gi,
];

const SAFE_ALTERNATIVES_MAP = {
  'guaranteed acceptance': 'improve your chances of acceptance',
  'guaranteed publication': 'strengthen your manuscript for submission',
  'we write your paper': 'we coach your academic writing',
  'ghostwriting': 'academic writing coaching',
  'publish it for you': 'support your publication journey',
  'contract cheating': 'academic integrity coaching',
  'fake data': 'help with data analysis',
  'do your assignment': 'provide learning support',
  '代写': '学术写作辅导',
  '包发表': '提升发表机会',
  '保录用': '优化投稿策略',
};

function complianceCheck(text) {
  const riskFlags = [];
  const complianceNotes = [];
  const seen = new Set();
  for (const pattern of HIGH_RISK_PATTERNS) {
    const match = text.match(pattern);
    if (match && !seen.has(match[0].toLowerCase())) {
      seen.add(match[0].toLowerCase());
      riskFlags.push(match[0]);
      const alt = SAFE_ALTERNATIVES_MAP[match[0]] ||
                  SAFE_ALTERNATIVES_MAP[match[0].toLowerCase()] ||
                  ' compliant service description';
      complianceNotes.push(`"${match[0]}" → consider using "${alt}" instead`);
    }
  }
  return { riskFlags, complianceNotes };
}

function extractAllTextFromResult(result) {
  const parts = [];
  if (result.topic) parts.push(result.topic);
  if (result.angle) parts.push(result.angle);
  if (result.carousel?.slides) {
    for (const s of result.carousel.slides) {
      if (s.title) parts.push(s.title);
      if (s.body) parts.push(s.body);
      if (s.subtitle) parts.push(s.subtitle);
    }
  }
  if (result.reels?.script) parts.push(result.reels.script);
  if (result.reels?.hook) parts.push(result.reels.hook);
  if (result.caption) parts.push(typeof result.caption === 'string' ? result.caption : result.caption.caption || '');
  if (result.dmHook) parts.push(result.dmHook);
  return parts.join(' ');
}

// ── System prompt (Instagram Content Strategist) ──

function buildSystemPrompt() {
  return `You are an Instagram content strategist for a compliant academic writing coaching service.

The service helps ESL and Chinese researchers with:
- academic writing coaching
- manuscript editing
- reviewer response support
- journal submission strategy
- research communication coaching

The service does NOT provide:
- ghostwriting
- guaranteed acceptance
- fake data
- doing assignments or papers for users
- contract cheating

Create Instagram-ready content that sounds like a professional academic writing coach, not a salesy agency.

Rules:
1. Always provide real educational value before any CTA.
2. Use a low-pressure CTA unless the user explicitly asks for services.
3. Avoid claims like guaranteed publication or acceptance.
4. Make the content useful for Chinese / ESL researchers.
5. Prefer clear frameworks, examples, and checklists.
6. Output valid JSON only.`;
}

function buildUserPrompt(params) {
  return `Create an Instagram content package based on the following input.

Source type: ${params.sourceType || 'topic'}
Audience: ${params.audience || 'General academic audience'}
Goal: ${params.goal || 'trust'}
Pain point: ${params.painPoint || 'writing_unclear'}
Formats: ${JSON.stringify(params.formats || ['all'])}
Tone: ${params.tone || 'professional'}
CTA level: ${params.ctaLevel || 'soft'}
Language mode: ${params.languageMode || 'bilingual'}

Source text:
${params.sourceText || ''}

Return JSON with these keys:
- topic (string)
- angle (string)
- contentPillar (string, one of: "Reviewer Says", "Before / After Rewrite", "Chinese PhD Mistakes", "SCI Writing Framework", "Checklist", "AI Writing Risk", "Journal Selection", "Advisor Feedback Decoder")
- carousel (object with template, style, and slides array)
- reels (object with duration, hook, script, timeline, onScreenText, shotList, brollIdeas, cta)
- caption (string or object with caption, firstLine, cta)
- hashtags (array of strings, 5-15 relevant hashtags)
- story (array of story objects with type "poll" or "question")
- dmHook (string)
- complianceNotes (array of strings, empty if all clean)
- riskFlags (array of strings, empty if all clean)

Carousel must have exactly 7 slides:
1. Hook (role: "hook")
2. Common mistake (role: "common_mistake")
3. Diagnosis (role: "diagnosis")
4. Framework (role: "framework")
5. Example (role: "example")
6. Checklist (role: "checklist")
7. CTA (role: "cta")

Each slide must have: slide (number), role (string), title (string), body (string).

Reels must include:
- duration (number, 30-45 seconds recommended)
- hook (string, first 2 seconds)
- full script as "script" (string, the complete voiceover)
- timeline (array of {time, purpose, voiceover, onScreenText})
- onScreenText (array of strings)
- shotList (array of strings)
- brollIdeas (array of strings)
- cta (string)

Caption should be a string with at most 2-3 emojis, useful content, and a soft CTA.

Hashtags should include a mix of broad (#AcademicWriting, #PhDLife) and niche tags.

Story should include at least one poll and one open question when the format is requested.`;
}

// ── API handlers ──

async function handleGenerateInstagramContent(request, env) {
  const payload = await readJson(request);

  if (!payload.sourceText || !String(payload.sourceText).trim()) {
    return jsonCors({ ok: false, error: 'sourceText is required' }, 400);
  }

  const sourceText = String(payload.sourceText).trim();
  if (sourceText.length > 8000) {
    return jsonCors({ ok: false, error: 'sourceText must be under 8000 characters' }, 400);
  }

  const params = {
    sourceType: payload.sourceType || 'topic',
    sourceText,
    audience: payload.audience || 'General academic audience',
    goal: payload.goal || 'trust',
    painPoint: payload.painPoint || 'writing_unclear',
    formats: Array.isArray(payload.formats) && payload.formats.length > 0
      ? payload.formats
      : ['carousel', 'reels', 'caption', 'hashtags', 'story', 'dm_hook'],
    tone: payload.tone || 'professional',
    ctaLevel: payload.ctaLevel || 'soft',
    languageMode: payload.languageMode || 'bilingual',
  };

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: buildUserPrompt(params) },
  ];

  let result;
  try {
    result = await callModel(env, messages);
  } catch (err) {
    console.error('callModel error:', err.message);
    return jsonCors({ ok: false, error: 'AI 生成失败，请稍后重试' }, 502);
  }

  // Compliance scan on all generated text
  const allText = extractAllTextFromResult(result);
  const { riskFlags, complianceNotes } = complianceCheck(allText);

  // Merge with any compliance data from the model
  result.complianceNotes = [...new Set([...(result.complianceNotes || []), ...complianceNotes])];
  result.riskFlags = [...new Set([...(result.riskFlags || []), ...riskFlags])];

  // Normalize carousel slides to have exactly 7 entries
  if (result.carousel && Array.isArray(result.carousel.slides)) {
    const slides = result.carousel.slides.slice(0, 7);
    while (slides.length < 7) {
      slides.push({
        slide: slides.length + 1,
        role: 'placeholder',
        title: '',
        body: '',
      });
    }
    // Re-number slides
    slides.forEach((s, i) => { s.slide = i + 1; });
    result.carousel.slides = slides;
  }

  // Ensure hashtags are an array
  if (!Array.isArray(result.hashtags)) {
    result.hashtags = typeof result.hashtags === 'string'
      ? result.hashtags.split(/[\s,]+/).filter(Boolean)
      : [];
  }

  // Ensure story is an array
  if (!Array.isArray(result.story)) {
    result.story = [];
  }

  result.ok = true;
  return jsonCors(result);
}

async function handleRewriteInstagramContent(request, env) {
  const payload = await readJson(request);

  if (!payload.content || !String(payload.content).trim()) {
    return jsonCors({ ok: false, error: 'content is required' }, 400);
  }

  const contentType = payload.contentType || 'reels_script';
  const content = String(payload.content).trim();
  const rewriteGoal = payload.rewriteGoal || 'make_more_natural';
  const tone = payload.tone || 'professional';

  const systemPrompt = 'You are an Instagram content editor for an academic writing coaching service. Rewrite the given content according to the goal. Output valid JSON only with the key "rewritten".';

  const userPrompt = `Content type: ${contentType}
Rewrite goal: ${rewriteGoal}
Desired tone: ${tone}

Original content:
${content}

Return JSON with:
{
  "rewritten": "<the rewritten content>"
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let result;
  try {
    result = await callModel(env, messages);
  } catch (err) {
    console.error('callModel error (rewrite):', err.message);
    return jsonCors({ ok: false, error: '改写失败，请稍后重试' }, 502);
  }

  return jsonCors({ ok: true, rewritten: result.rewritten || content });
}

async function handleGenerateReelsVideoPlan(request, env) {
  const payload = await readJson(request);

  const script = String(payload.script || '').trim();
  if (!script) {
    return jsonCors({ ok: false, error: 'script is required' }, 400);
  }

  const duration = parseInt(payload.duration || '35', 10) || 35;
  const template = payload.template || 'paper-annotation';

  const systemPrompt = 'You are a video production assistant for academic content creators. Given a Reels voiceover script, output a detailed shot-by-shot video plan. Output valid JSON only.';

  const userPrompt = `Create a video shot plan for a vertical Instagram Reel (1080x1920).

Voiceover script:
${script}

Target duration: ${duration} seconds
Visual template style: ${template}

Return JSON with:
{
  "video": {
    "size": "1080x1920",
    "duration": ${duration},
    "template": "${template}",
    "scenes": [
      {
        "index": 1,
        "duration": <seconds>,
        "type": "hook" | "pain" | "education" | "example" | "cta",
        "visual": "<description of what to show>",
        "voiceover": "<corresponding voiceover segment>"
      }
    ]
  }
}

Each scene should be 2-5 seconds. Cover the entire script. Total scene durations should sum to approximately ${duration} seconds.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let result;
  try {
    result = await callModel(env, messages);
  } catch (err) {
    console.error('callModel error (video plan):', err.message);
    return jsonCors({ ok: false, error: '生成分镜失败，请稍后重试' }, 502);
  }

  return jsonCors({ ok: true, ...result });
}

// ── End Instagram Content Assistant ──

async function currentUser(request, env) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return null;
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    `SELECT users.*
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ? AND sessions.expires_at > ?`
  ).bind(token, now).first();
  if (!row) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ? OR expires_at <= ?').bind(token, now).run();
    return null;
  }
  return row;
}

async function createSession(env, userId) {
  const token = cryptoRandomToken(32);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await env.DB.prepare(
    'INSERT INTO sessions(token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
  ).bind(token, userId, expiresAt, new Date().toISOString()).run();
  return token;
}

async function getUserById(env, userId) {
  return env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
}

async function authPayload(env, user) {
  return {
    ok: true,
    authenticated: !!user,
    user: publicUser(user),
    limits: await limitsPayload(env, user),
  };
}

function publicUser(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}

function limitsPayloadSync(env, user) {
  if (!user) {
    return {
      freeDailyDownloads: freeDailyDownloads(env),
      usedToday: 0,
      remainingToday: 0,
      canBatchDownload: false,
    };
  }
  if (user.role === 'vip') {
    return {
      freeDailyDownloads: freeDailyDownloads(env),
      usedToday: 0,
      remainingToday: null,
      canBatchDownload: true,
    };
  }
  return {
    freeDailyDownloads: freeDailyDownloads(env),
    usedToday: user.__usedToday || 0,
    remainingToday: Math.max(freeDailyDownloads(env) - (user.__usedToday || 0), 0),
    canBatchDownload: false,
  };
}

async function limitsPayload(env, user) {
  if (!user) return limitsPayloadSync(env, user);
  if (user.role === 'vip') return limitsPayloadSync(env, user);
  const usedToday = await usedDownloadsToday(env, user.id);
  return limitsPayloadSync(env, { ...user, __usedToday: usedToday });
}

async function usedDownloadsToday(env, userId) {
  const row = await env.DB.prepare(
    'SELECT COALESCE(SUM(count), 0) AS used FROM download_logs WHERE user_id = ? AND download_date = ?'
  ).bind(userId, todayKey()).first();
  return Number(row && row.used ? row.used : 0);
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await derivePasswordKey(password, salt);
  const digest = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  return ['pbkdf2_sha256', '210000', base64Encode(salt), base64Encode(digest)].join('$');
}

async function verifyPassword(password, stored) {
  try {
    const [algo, iterations, saltB64, digestB64] = String(stored || '').split('$');
    if (algo !== 'pbkdf2_sha256') return false;
    const salt = base64Decode(saltB64);
    const expected = base64Decode(digestB64);
    const key = await derivePasswordKey(password, salt, parseInt(iterations, 10));
    const actual = new Uint8Array(await crypto.subtle.exportKey('raw', key));
    return timingSafeEqual(actual, expected);
  } catch (_) {
    return false;
  }
}

async function derivePasswordKey(password, salt, iterations = 210000) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    material,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign', 'verify']
  );
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function base64Encode(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64Decode(value) {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function cookieValue(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const parts = cookie.split(';');
  for (const part of parts) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (rawKey === name) return rawValue.join('=');
  }
  return null;
}

function cookieSecureFlag(request) {
  return new URL(request.url).protocol === 'https:' ? '; Secure' : '';
}

function sessionCookie(request, token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly${cookieSecureFlag(request)}; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

function clearSessionCookie(request) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly${cookieSecureFlag(request)}; SameSite=Lax; Max-Age=0`;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (_) {
    return {};
  }
}

function json(payload, status = 200, cookies = []) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(JSON.stringify(payload), { status, headers });
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function freeDailyDownloads(env) {
  return parseInt(env.FREE_DAILY_DOWNLOADS || '3', 10) || 3;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cryptoRandomToken(byteLength) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
