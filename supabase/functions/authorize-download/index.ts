import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FREE_DAILY_DOWNLOADS = 3;

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

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return corsResponse({ ok: false, code: 'LOGIN_REQUIRED', message: '请先登录后下载' }, 401);
  }

  const body = await safeJson(req);
  const count = clamp(Number(body.count || 1), 0, 500);
  const scope = String(body.scope || 'single').slice(0, 40);
  const user = authData.user;

  const profile = await ensureProfile(adminClient, user.id, user.email || '');
  const usedToday = await usedDownloadsToday(adminClient, user.id);

  if (scope === 'status' || count === 0) {
    return corsResponse(authPayload(profile, usedToday));
  }

  if (profile.role === 'vip') {
    return corsResponse({ ...authPayload(profile, 0), authorized: true });
  }

  if (scope !== 'single' || count !== 1) {
    return corsResponse({
      ok: false,
      code: 'VIP_REQUIRED',
      message: '普通会员不支持批量下载,请升级 VIP',
      limits: limitsPayload(profile, usedToday),
    }, 403);
  }

  if (usedToday + count > FREE_DAILY_DOWNLOADS) {
    return corsResponse({
      ok: false,
      code: 'DAILY_LIMIT_EXCEEDED',
      message: `普通会员每天最多下载 ${FREE_DAILY_DOWNLOADS} 张`,
      limits: limitsPayload(profile, usedToday),
    }, 403);
  }

  const { error: logError } = await adminClient
    .from('download_logs')
    .insert({
      user_id: user.id,
      count,
      scope,
    });
  if (logError) {
    return corsResponse({ ok: false, message: '下载授权失败,请稍后再试' }, 500);
  }

  return corsResponse({ ...authPayload(profile, usedToday + count), authorized: true });
});

async function ensureProfile(adminClient: any, userId: string, email: string) {
  const { data } = await adminClient
    .from('profiles')
    .select('id,email,role,created_at')
    .eq('id', userId)
    .maybeSingle();
  if (data) return data;
  const { data: created, error } = await adminClient
    .from('profiles')
    .insert({ id: userId, email, role: 'free' })
    .select('id,email,role,created_at')
    .single();
  if (error) throw error;
  return created;
}

async function usedDownloadsToday(adminClient: any, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await adminClient
    .from('download_logs')
    .select('count')
    .eq('user_id', userId)
    .eq('download_date', today);
  if (error) throw error;
  return (data || []).reduce((sum, row) => sum + Number(row.count || 0), 0);
}

function authPayload(profile: any, usedToday: number) {
  return {
    ok: true,
    authenticated: true,
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
    },
    limits: limitsPayload(profile, usedToday),
  };
}

function limitsPayload(profile: any, usedToday: number) {
  if (profile.role === 'vip') {
    return {
      freeDailyDownloads: FREE_DAILY_DOWNLOADS,
      usedToday: 0,
      remainingToday: null,
      canBatchDownload: true,
    };
  }
  return {
    freeDailyDownloads: FREE_DAILY_DOWNLOADS,
    usedToday,
    remainingToday: Math.max(FREE_DAILY_DOWNLOADS - usedToday, 0),
    canBatchDownload: false,
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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  };
  if (status === 204) return new Response(null, { status, headers });
  return new Response(JSON.stringify(payload), { status, headers });
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}
