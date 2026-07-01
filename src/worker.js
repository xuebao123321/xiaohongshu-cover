const SESSION_COOKIE = 'cm_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

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
  try {
    if (request.method === 'GET' && url.pathname === '/api/me') return handleMe(request, env);
    if (request.method === 'POST' && url.pathname === '/api/register') return handleRegister(request, env);
    if (request.method === 'POST' && url.pathname === '/api/login') return handleLogin(request, env);
    if (request.method === 'POST' && url.pathname === '/api/logout') return handleLogout(request, env);
    if (request.method === 'POST' && url.pathname === '/api/downloads/authorize') return handleDownloadAuthorize(request, env);
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
