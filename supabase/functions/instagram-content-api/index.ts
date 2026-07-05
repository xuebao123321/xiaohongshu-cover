import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

const SAFE_ALTERNATIVES: Record<string, string> = {
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

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    if (path.includes('/generate-instagram-content')) {
      return await handleGenerate(req);
    }
    if (path.includes('/rewrite-instagram-content')) {
      return await handleRewrite(req);
    }
    if (path.includes('/generate-reels-video-plan')) {
      return await handleVideoPlan(req);
    }
    return json({ ok: false, error: `Unknown path: ${path}` }, 404);
  } catch (err) {
    console.error('Function error:', err);
    return json({ ok: false, error: '服务器异常，请稍后再试' }, 500);
  }
});

// ── Model call ──

async function callModel(messages: Array<{ role: string; content: string }>) {
  const baseUrl = (Deno.env.get('AI_BASE_URL') || 'https://api.deepseek.com').replace(/\/+$/, '');
  const model = Deno.env.get('AI_MODEL') || 'deepseek-chat';
  const apiKey = Deno.env.get('AI_API_KEY') || Deno.env.get('DEEPSEEK_API_KEY') || '';

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured');
  }

  let response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI API error ${response.status}: ${text.substring(0, 300)}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('AI returned empty response');

  // Parse JSON with fix attempts
  let parsed = tryParseJson(rawContent);
  if (!parsed) {
    // Retry once
    response = await fetch(`${baseUrl}/chat/completions`, {
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
          { role: 'user', content: 'The JSON you returned was invalid. Please output ONLY valid JSON. Do not wrap in markdown code blocks.' },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });
    if (response.ok) {
      const retryData = await response.json();
      const retryContent = retryData.choices?.[0]?.message?.content;
      if (retryContent) parsed = tryParseJson(retryContent);
    }
  }

  if (!parsed) throw new Error('AI returned invalid JSON after retry');
  return parsed;
}

function tryParseJson(raw: string): any {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/, '');
  text = text.replace(/,(\s*[}\]])/g, '$1');
  const openBraces = (text.match(/\{/g) || []).length;
  const closeBraces = (text.match(/\}/g) || []).length;
  if (openBraces > closeBraces) text += '}'.repeat(openBraces - closeBraces);
  const openBrackets = (text.match(/\[/g) || []).length;
  const closeBrackets = (text.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) text += ']'.repeat(openBrackets - closeBrackets);
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ── Compliance ──

function complianceCheck(text: string) {
  const riskFlags: string[] = [];
  const complianceNotes: string[] = [];
  const seen = new Set<string>();
  for (const pattern of HIGH_RISK_PATTERNS) {
    const match = text.match(pattern);
    if (match && !seen.has(match[0].toLowerCase())) {
      seen.add(match[0].toLowerCase());
      riskFlags.push(match[0]);
      const key = Object.keys(SAFE_ALTERNATIVES).find(
        k => k.toLowerCase() === match[0].toLowerCase()
      ) || '';
      complianceNotes.push(`"${match[0]}" → consider "${SAFE_ALTERNATIVES[key] || 'compliant alternatives'}" instead`);
    }
  }
  return { riskFlags, complianceNotes };
}

function extractText(result: any): string {
  const parts: string[] = [];
  if (result.topic) parts.push(result.topic);
  if (result.angle) parts.push(result.angle);
  if (result.carousel?.slides) {
    for (const s of result.carousel.slides) {
      if (s.title) parts.push(s.title);
      if (s.body) parts.push(s.body);
    }
  }
  if (result.reels?.script) parts.push(result.reels.script);
  if (result.reels?.hook) parts.push(result.reels.hook);
  if (result.caption) parts.push(typeof result.caption === 'string' ? result.caption : result.caption?.caption || '');
  if (result.dmHook) parts.push(result.dmHook);
  return parts.join(' ');
}

// ── Prompts ──

const SYSTEM_PROMPT = `You are an Instagram content strategist for a compliant academic writing coaching service.

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

function buildUserPrompt(params: any): string {
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

Return JSON with:
- topic (string)
- angle (string)
- contentPillar (string)
- carousel (object with template, style, and slides array — exactly 7 slides with roles: hook, common_mistake, diagnosis, framework, example, checklist, cta)
- reels (object with duration, hook, script, timeline, onScreenText, shotList, brollIdeas, cta)
- caption (string)
- hashtags (array of strings, 5-15 tags)
- story (array of story objects with type "poll" or "question")
- dmHook (string)`;
}

// ── Handlers ──

async function handleGenerate(req: Request) {
  const payload = await req.json().catch(() => ({}));

  const sourceText = String(payload.sourceText || '').trim();
  if (!sourceText) return json({ ok: false, error: 'sourceText is required' }, 400);
  if (sourceText.length > 8000) return json({ ok: false, error: 'sourceText must be under 8000 characters' }, 400);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(payload) },
  ];

  let result = await callModel(messages);

  // Compliance scan
  const allText = extractText(result);
  const { riskFlags, complianceNotes } = complianceCheck(allText);
  result.complianceNotes = [...new Set([...(result.complianceNotes || []), ...complianceNotes])];
  result.riskFlags = [...new Set([...(result.riskFlags || []), ...riskFlags])];

  // Normalize carousel slides
  if (result.carousel && Array.isArray(result.carousel.slides)) {
    const slides = result.carousel.slides.slice(0, 7);
    while (slides.length < 7) {
      slides.push({ slide: slides.length + 1, role: 'placeholder', title: '', body: '' });
    }
    slides.forEach((s: any, i: number) => { s.slide = i + 1; });
    result.carousel.slides = slides;
  }

  if (!Array.isArray(result.hashtags)) {
    result.hashtags = typeof result.hashtags === 'string'
      ? result.hashtags.split(/[\s,]+/).filter(Boolean)
      : [];
  }
  if (!Array.isArray(result.story)) result.story = [];

  result.ok = true;
  return json(result);
}

async function handleRewrite(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const content = String(payload.content || '').trim();
  if (!content) return json({ ok: false, error: 'content is required' }, 400);

  const messages = [
    { role: 'system', content: 'You are an Instagram content editor. Rewrite the given content according to the goal. Output valid JSON only with key "rewritten".' },
    { role: 'user', content: `Content type: ${payload.contentType || 'text'}\nRewrite goal: ${payload.rewriteGoal || 'make_more_natural'}\nTone: ${payload.tone || 'professional'}\n\nOriginal:\n${content}\n\nReturn JSON: {"rewritten": "..."}` },
  ];

  const result = await callModel(messages);
  return json({ ok: true, rewritten: result.rewritten || content });
}

async function handleVideoPlan(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const script = String(payload.script || '').trim();
  if (!script) return json({ ok: false, error: 'script is required' }, 400);

  const duration = parseInt(payload.duration || '35', 10) || 35;
  const template = payload.template || 'paper-annotation';

  const messages = [
    { role: 'system', content: 'You are a video production assistant. Given a Reels voiceover script, output a shot-by-shot video plan. Output valid JSON only.' },
    { role: 'user', content: `Create a shot plan for a vertical Reel (1080x1920, ${duration}s, style: ${template}).\n\nScript:\n${script}\n\nReturn JSON: {"video": {"size": "1080x1920", "duration": ${duration}, "template": "${template}", "scenes": [{"index":1,"duration":3,"type":"hook","visual":"...","voiceover":"..."}]}}` },
  ];

  const result = await callModel(messages);
  return json({ ok: true, ...result });
}

// ── Helpers ──

function json(payload: any, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
