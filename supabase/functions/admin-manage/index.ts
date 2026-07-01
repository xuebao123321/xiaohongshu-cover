import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse(null, 204);
  if (req.method !== 'POST') return corsResponse({ ok: false, message: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const authHeader = req.headers.get('Authorization') || '';

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // ---- 验证用户已登录 ----
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return corsResponse({ ok: false, code: 'LOGIN_REQUIRED', message: '请先登录' }, 401);
  }

  const userEmail = (authData.user.email || '').toLowerCase();

  // ---- 验证是否为管理员 ----
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return corsResponse({ ok: false, code: 'FORBIDDEN', message: '无管理员权限' }, 403);
  }

  // ---- 解析请求 ----
  const body = await safeJson(req);
  const action = String(body.action || '');

  try {
    switch (action) {
      case 'listUsers':
        return await handleListUsers(adminClient, body);
      case 'setRole':
        return await handleSetRole(adminClient, body);
      case 'stats':
        return await handleStats(adminClient);
      default:
        return corsResponse({ ok: false, message: `未知操作: ${action}` }, 400);
    }
  } catch (e) {
    return corsResponse({ ok: false, message: e.message || '服务器错误' }, 500);
  }
});

// ── listUsers ──
async function handleListUsers(adminClient: any, body: any) {
  const search = String(body.search || '').trim();
  const page = Math.max(1, Number(body.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(body.pageSize || 50)));

  let query = adminClient
    .from('profiles')
    .select('id, email, role, created_at', { count: 'exact' });

  if (search) {
    query = query.ilike('email', `%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return corsResponse({
    ok: true,
    users: data || [],
    total: count || 0,
    page,
    pageSize,
  });
}

// ── setRole ──
async function handleSetRole(adminClient: any, body: any) {
  const userId = String(body.userId || '').trim();
  const newRole = String(body.role || '').trim();

  if (!userId) {
    return corsResponse({ ok: false, message: '缺少 userId' }, 400);
  }
  if (!['free', 'vip'].includes(newRole)) {
    return corsResponse({ ok: false, message: '角色只能是 free 或 vip' }, 400);
  }

  const { data, error } = await adminClient
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, email, role, created_at')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return corsResponse({ ok: false, message: '用户不存在' }, 404);
    }
    throw error;
  }

  return corsResponse({ ok: true, user: data });
}

// ── stats ──
async function handleStats(adminClient: any) {
  const today = new Date().toISOString().slice(0, 10);

  const [profilesResult, vipResult, downloadsResult] = await Promise.all([
    adminClient.from('profiles').select('id', { count: 'exact', head: true }),
    adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'vip'),
    adminClient
      .from('download_logs')
      .select('count')
      .eq('download_date', today),
  ]);

  const totalUsers = profilesResult.count || 0;
  const totalVip = vipResult.count || 0;
  const todayDownloads = (downloadsResult.data || []).reduce(
    (sum: number, row: any) => sum + Number(row.count || 0),
    0,
  );

  return corsResponse({
    ok: true,
    stats: {
      totalUsers,
      totalVip,
      todayDownloads,
    },
  });
}

// ── 工具函数 ──
async function safeJson(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch (_) {
    return {};
  }
}

function corsResponse(payload: any, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  };
  if (status === 204) return new Response(null, { status, headers });
  return new Response(JSON.stringify(payload), { status, headers });
}
