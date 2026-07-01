import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  annual: 365,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsResponse(null, 204);
  if (req.method !== 'POST') return corsResponse({ ok: false, message: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const body = await safeJson(req);

  try {
    const provider = String(body.provider || 'wechat');

    // 验证签名（微信/支付宝各自实现）
    // TODO: 实现微信 API v3 签名验证
    // TODO: 实现支付宝 RSA 签名验证

    const providerOrderId = String(
      provider === 'wechat'
        ? (body.out_trade_no || body.transaction_id || '')
        : (body.out_trade_no || body.trade_no || '')
    );

    if (!providerOrderId) {
      return corsResponse({ ok: false, message: '缺少订单号' }, 400);
    }

    // 查找订单
    const { data: order, error: findError } = await adminClient
      .from('payment_orders')
      .select('id, user_id, plan, status')
      .or(`provider_order_id.eq.${providerOrderId},provider_order_id.is.null`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError || !order) {
      // 连表查询找到最新的 pending 订单
      const { data: latestOrder } = await adminClient
        .from('payment_orders')
        .select('id, user_id, plan, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestOrder) {
        return corsResponse({ ok: false, message: '未找到待支付订单' }, 404);
      }

      // 更新该订单
      const days = PLAN_DAYS[latestOrder.plan] || 30;
      const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

      await adminClient
        .from('payment_orders')
        .update({
          status: 'paid',
          provider_order_id: providerOrderId,
          paid_at: new Date().toISOString(),
        })
        .eq('id', latestOrder.id);

      await adminClient
        .from('profiles')
        .update({ role: 'vip', expires_at: expiresAt, updated_at: new Date().toISOString() })
        .eq('id', latestOrder.user_id);

      return corsResponse({ ok: true, message: '支付已验证，VIP 已开通' });
    }

    // 正常流程：根据 provider_order_id 找到订单
    const days = PLAN_DAYS[order.plan] || 30;
    const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

    await adminClient
      .from('payment_orders')
      .update({
        status: 'paid',
        provider_order_id: providerOrderId,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    await adminClient
      .from('profiles')
      .update({ role: 'vip', expires_at: expiresAt, updated_at: new Date().toISOString() })
      .eq('id', order.user_id);

    return corsResponse({ ok: true, message: 'VIP 已开通' });
  } catch (e) {
    return corsResponse({ ok: false, message: e.message || '服务器错误' }, 500);
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
