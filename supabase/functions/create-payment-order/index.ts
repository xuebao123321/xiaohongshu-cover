import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAN_PRICES: Record<string, number> = {
  monthly: 990, // ¥9.90 = 990 分
  annual: 9900, // ¥99.00 = 9900 分
};

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  annual: 365,
};

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

  // 验证登录
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return corsResponse({ ok: false, code: 'LOGIN_REQUIRED', message: '请先登录' }, 401);
  }

  const body = await safeJson(req);
  const plan = String(body.plan || 'annual');
  const provider = String(body.provider || 'manual');

  if (!['monthly', 'annual'].includes(plan)) {
    return corsResponse({ ok: false, message: '无效的套餐' }, 400);
  }

  const amount = PLAN_PRICES[plan];
  const days = PLAN_DAYS[plan];
  const userId = authData.user.id;
  const orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

  try {
    // 写入订单
    const { error: insertError } = await adminClient
      .from('payment_orders')
      .insert({
        user_id: userId,
        plan,
        amount,
        provider,
        provider_order_id: provider === 'manual' ? orderId : null,
        status: 'pending',
      });

    if (insertError) throw insertError;

    // manual 模式：直接标记为已支付并开通 VIP
    if (provider === 'manual') {
      const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

      await adminClient
        .from('payment_orders')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('provider_order_id', orderId);

      await adminClient
        .from('profiles')
        .update({ role: 'vip', expires_at: expiresAt, updated_at: new Date().toISOString() })
        .eq('id', userId);

      return corsResponse({
        ok: true,
        orderId,
        status: 'paid',
        expiresAt,
        message: plan === 'annual' ? '年度 VIP 已开通' : '月度 VIP 已开通',
      });
    }

    // 微信/支付宝模式：返回支付参数
    // TODO: 接入微信/支付宝统一下单 API
    return corsResponse({
      ok: true,
      orderId,
      amount,
      plan,
      provider,
      // 微信 Native 支付返回 code_url（二维码链接）
      // 支付宝返回支付页面 URL
      payUrl: null, // 待接入
      status: 'pending',
    });
  } catch (e) {
    return corsResponse({ ok: false, message: e.message || '创建订单失败' }, 500);
  }
});

async function safeJson(req: Request): Promise<any> {
  try { return await req.json(); } catch (_) { return {}; }
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
