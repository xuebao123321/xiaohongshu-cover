# 会员体系阶段 1

本阶段已经从纯静态页面升级为轻量后端版本,用于真实上线前的会员 MVP。

## 功能范围

- 真实邮箱/密码注册和登录
- HttpOnly Cookie 会话
- 用户角色:普通会员 `free` / VIP会员 `vip`
- 普通会员每天最多下载 3 张
- 普通会员不支持批量下载
- VIP 会员开放全部下载和批量下载
- 后台手动开通/取消 VIP

## 本地启动

```bash
cd /Users/andy/Documents/Andy\ AI/cover-maker
python3 server.py --host 127.0.0.1 --port 8097
```

访问:

```text
http://127.0.0.1:8097/index.html
```

## 手动管理 VIP

### 本地 Python 版

先启动网站,在页面注册一个账号,然后执行:

```bash
cd /Users/andy/Documents/Andy\ AI/cover-maker
python3 manage_users.py list
python3 manage_users.py set-role user@example.com vip
```

恢复普通会员:

```bash
python3 manage_users.py set-role user@example.com free
```

### Cloudflare D1 线上版

查看线上用户:

```bash
cd /Users/andy/Documents/Andy\ AI/cover-maker
npx wrangler d1 execute xiaohongshu-cover-db --remote --command "SELECT id,email,role,created_at FROM users ORDER BY id DESC;"
```

开通 VIP:

```bash
npx wrangler d1 execute xiaohongshu-cover-db --remote --command "UPDATE users SET role='vip', updated_at=datetime('now') WHERE email='user@example.com';"
```

恢复普通会员:

```bash
npx wrangler d1 execute xiaohongshu-cover-db --remote --command "UPDATE users SET role='free', updated_at=datetime('now') WHERE email='user@example.com';"
```

Cloudflare 部署:

```bash
npm run d1:migrate:remote
npm run deploy:cf
```

## 上线注意

阶段 1 暂时没有接支付。上线时可以先由运营手动开通 VIP,等产品验证后再进入阶段 2:

- 支付订单
- VIP 到期时间
- 自动开通/续费
- 用户管理后台

数据库文件在 `data/cover_maker.sqlite3`,已被 `.gitignore` 忽略。正式服务器上请做好定期备份。
