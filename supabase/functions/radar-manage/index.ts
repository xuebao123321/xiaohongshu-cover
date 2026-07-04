import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN') || '';
const GITHUB_REPO = Deno.env.get('GITHUB_REPO') || 'xuebao123321/xiaohongshu-cover';

const GITHUB_API = 'https://api.github.com';
const WORKFLOW_PATH = '.github/workflows/reddit-radar.yml';
const SOURCES_PATH = 'data/reddit/sources.json';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse(null, 204);
  if (req.method !== 'POST') return corsResponse({ ok: false, message: 'Method not allowed' }, 405);

  // ── Auth ──
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const authHeader = req.headers.get('Authorization') || '';

  if (!authHeader) {
    return corsResponse({ ok: false, message: '请先登录' }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return corsResponse({ ok: false, code: 'LOGIN_REQUIRED', message: '请先登录' }, 401);
  }

  const userEmail = (authData.user.email || '').toLowerCase();
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return corsResponse({ ok: false, code: 'FORBIDDEN', message: '仅管理员可操作' }, 403);
  }

  if (!GITHUB_TOKEN) {
    return corsResponse({ ok: false, message: 'GITHUB_TOKEN 未配置' }, 500);
  }

  // ── Parse body ──
  const body = await safeJson(req);
  const action = String(body.action || '');

  try {
    switch (action) {
      case 'trigger_fetch':
        return await handleTriggerFetch();
      case 'save_sources':
        return await handleSaveSources(body);
      case 'save_keywords':
        return await handleSaveKeywords(body);
      default:
        return corsResponse({ ok: false, message: `未知操作: ${action}` }, 400);
    }
  } catch (e: any) {
    return corsResponse({ ok: false, message: e.message || '服务器错误' }, 500);
  }
});

// ── trigger_fetch ──
async function handleTriggerFetch() {
  // 1. Get workflow ID
  const listUrl = `${GITHUB_API}/repos/${GITHUB_REPO}/actions/workflows`;
  const listRes = await fetch(listUrl, {
    headers: gitHeaders(),
  });
  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error(`获取 workflow 列表失败: ${listRes.status} ${err.slice(0, 200)}`);
  }

  const listData: any = await listRes.json();
  const workflow = listData.workflows?.find(
    (w: any) => w.path === WORKFLOW_PATH || w.name === 'Reddit Radar',
  );

  if (!workflow) {
    throw new Error(`未找到 Reddit Radar workflow: ${WORKFLOW_PATH}`);
  }

  // 2. Trigger workflow_dispatch
  const dispatchUrl = `${GITHUB_API}/repos/${GITHUB_REPO}/actions/workflows/${workflow.id}/dispatches`;
  const dispatchRes = await fetch(dispatchUrl, {
    method: 'POST',
    headers: gitHeaders(),
    body: JSON.stringify({ ref: 'main' }),
  });

  if (!dispatchRes.ok) {
    const err = await dispatchRes.text();
    throw new Error(`触发 workflow 失败: ${dispatchRes.status} ${err.slice(0, 200)}`);
  }

  console.log(`[radar-manage] Workflow "${workflow.name}" (id=${workflow.id}) triggered by ${GITHUB_REPO}`);
  return corsResponse({ ok: true, message: '抓取任务已触发，约 3-5 分钟后刷新页面查看结果' });
}

// ── save_sources ──
async function handleSaveSources(body: any) {
  const sources = body.sources;
  if (!Array.isArray(sources) || sources.length === 0) {
    return corsResponse({ ok: false, message: 'sources 不能为空' }, 400);
  }

  const newContent = JSON.stringify(sources, null, 2);

  // 1. Get current file SHA
  const getUrl = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${SOURCES_PATH}`;
  const getRes = await fetch(getUrl, { headers: gitHeaders() });
  let sha = '';
  if (getRes.ok) {
    const fileData: any = await getRes.json();
    sha = fileData.sha || '';
  }

  // 2. Commit updated file
  const putBody: any = {
    message: `Update Reddit Radar sources [skip ci]`,
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
    throw new Error(`保存配置失败: ${putRes.status} ${err.slice(0, 200)}`);
  }

  console.log(`[radar-manage] sources.json updated (${sources.length} sources)`);
  return corsResponse({ ok: true, message: `配置已保存（${sources.length} 个源），提交后自动生效` });
}

// ── save_keywords ──
async function handleSaveKeywords(body: any) {
  const keywords = body.keywords;
  if (!Array.isArray(keywords)) {
    return corsResponse({ ok: false, message: 'keywords 必须是数组' }, 400);
  }

  const newContent = JSON.stringify(keywords, null, 2);
  const keywordsPath = 'data/reddit/keywords.json';

  // 1. Get current file SHA
  const getUrl = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${keywordsPath}`;
  const getRes = await fetch(getUrl, { headers: gitHeaders() });
  let sha = '';
  if (getRes.ok) {
    const fileData: any = await getRes.json();
    sha = fileData.sha || '';
  }

  // 2. Commit updated file
  const putBody: any = {
    message: `Update Reddit Radar keywords [skip ci]`,
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
    throw new Error(`保存关键词失败: ${putRes.status} ${err.slice(0, 200)}`);
  }

  console.log(`[radar-manage] keywords.json updated (${keywords.length} keywords)`);
  return corsResponse({ ok: true, message: `关键词已保存（${keywords.length} 个），下次分析生效` });
}

// ── helpers ──

function gitHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'reddit-radar/1.0',
  };
}

async function safeJson(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch (_) {
    return {};
  }
}

function corsResponse(payload: any, status = 200) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  };
  if (status === 204) return new Response(null, { status, headers });
  return new Response(JSON.stringify(payload), { status, headers });
}
