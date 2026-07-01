import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLAN_PRICES: Record<string, number> = { monthly: 990, annual: 9900 };
const PLAN_DAYS: Record<string, number> = { monthly: 30, annual: 365 };
const PLAN_NAMES: Record<string, string> = { monthly: '月度VIP', annual: '年度VIP' };

const NOTIFY_URL = Deno.env.get('PAYMENT_NOTIFY_URL') ||
  (Deno.env.get('SUPABASE_URL') || '') + '/functions/v1/payment-webhook';

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
    return corsResponse({ ok: false, code: 'LOGIN_REQUIRED', message: '请先登录' }, 401);
  }

  const body = await safeJson(req);
  const plan = String(body.plan || 'annual');
  const provider = String(body.provider || 'wechat');

  if (!['monthly', 'annual'].includes(plan)) {
    return corsResponse({ ok: false, message: '无效的套餐' }, 400);
  }

  const amount = PLAN_PRICES[plan];
  const days = PLAN_DAYS[plan];
  const userId = authData.user.id;
  const orderNo = 'CV' + Date.now() + randStr(8);

  try {
    // 写订单到数据库
    const { error: insertError } = await adminClient
      .from('payment_orders')
      .insert({
        user_id: userId,
        plan,
        amount,
        provider,
        provider_order_id: orderNo,
        status: 'pending',
      });
    if (insertError) throw insertError;

    if (provider === 'wechat') {
      const result = await createWechatOrder(orderNo, amount, PLAN_NAMES[plan], days);
      return corsResponse({ ok: true, provider: 'wechat', codeUrl: result.code_url, orderNo, amount });
    }

    if (provider === 'alipay') {
      const result = await createAlipayOrder(orderNo, amount, PLAN_NAMES[plan], days);
      return corsResponse({ ok: true, provider: 'alipay', payUrl: result.payUrl, orderNo, amount });
    }

    // manual fallback
    const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    await adminClient.from('payment_orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('provider_order_id', orderNo);
    await adminClient.from('profiles').update({ role: 'vip', expires_at: expiresAt, updated_at: new Date().toISOString() }).eq('id', userId);
    return corsResponse({ ok: true, status: 'paid', expiresAt, message: 'VIP 已开通' });
  } catch (e) {
    return corsResponse({ ok: false, message: e.message || '创建订单失败' }, 500);
  }
});

// ═══════════ 微信 Native 支付 API v3 ═══════════

async function createWechatOrder(outTradeNo: string, amount: number, desc: string, _days: number) {
  const mchId = Deno.env.get('WECHAT_MCH_ID') || '';
  const appId = Deno.env.get('WECHAT_APP_ID') || '';
  const apiV3Key = Deno.env.get('WECHAT_API_V3_KEY') || '';
  const privateKeyPem = Deno.env.get('WECHAT_PRIVATE_KEY') || '';
  const serialNo = Deno.env.get('WECHAT_SERIAL_NO') || '';

  if (!mchId || !appId || !privateKeyPem || !serialNo) {
    throw new Error('微信支付未配置，请在 Supabase 设置 WECHAT_* 环境变量');
  }

  const body = JSON.stringify({
    appid: appId,
    mchid: mchId,
    description: desc,
    out_trade_no: outTradeNo,
    notify_url: NOTIFY_URL,
    amount: { total: amount, currency: 'CNY' },
  });

  const method = 'POST';
  const url = '/v3/pay/transactions/native';
  const timestamp = Math.floor(Date.now() / 1000);
  const nonceStr = randStr(32);
  const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
  const signature = await signWithRsa(privateKeyPem, message);

  const authHeader = `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${serialNo}",signature="${signature}"`;

  const resp = await fetch('https://api.mch.weixin.qq.com' + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'Accept': 'application/json',
    },
    body,
  });

  const data = await resp.json();
  if (!resp.ok || !data.code_url) {
    throw new Error(data.message || '微信下单失败');
  }

  // 加密 code_url 存到数据库（用于前端轮询时解密）
  return { code_url: data.code_url };
}

// ═══════════ 支付宝电脑网站支付 ═══════════

async function createAlipayOrder(outTradeNo: string, amount: number, desc: string, _days: number) {
  const appId = Deno.env.get('ALIPAY_APP_ID') || '';
  const privateKeyPem = Deno.env.get('ALIPAY_PRIVATE_KEY') || '';

  if (!appId || !privateKeyPem) {
    throw new Error('支付宝未配置，请在 Supabase 设置 ALIPAY_* 环境变量');
  }

  const bizContent = JSON.stringify({
    out_trade_no: outTradeNo,
    product_code: 'FAST_INSTANT_TRADE_PAY',
    total_amount: (amount / 100).toFixed(2),
    subject: desc,
  });

  const params: Record<string, string> = {
    app_id: appId,
    method: 'alipay.trade.page.pay',
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00').replace(/T/, ' '),
    version: '1.0',
    notify_url: NOTIFY_URL,
    biz_content: bizContent,
  };

  const signStr = buildAlipaySignStr(params);
  const signature = await signWithRsa(privateKeyPem, signStr);
  params.sign = signature;

  const queryString = Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');

  return { payUrl: 'https://openapi.alipay.com/gateway.do?' + queryString };
}

// ═══════════ RSA 签名 (Web Crypto API) ═══════════

async function signWithRsa(pem: string, message: string): Promise<string> {
  const pemBody = pem
    .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/, '')
    .replace(/-----END (RSA )?PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const msgBytes = new TextEncoder().encode(message);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, msgBytes);
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function buildAlipaySignStr(params: Record<string, string>): string {
  return Object.keys(params)
    .filter((k) => k !== 'sign' && k !== 'sign_type' && params[k] !== '')
    .sort()
    .map((k) => k + '=' + params[k])
    .join('&');
}

// ═══════════ 工具 ═══════════

function randStr(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) result += chars[arr[i] % chars.length];
  return result;
}

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
