# GitHub Pages + Supabase 部署说明

这个方案用于免费试运营:

- 前端: GitHub Pages
- 登录: Supabase Auth
- 数据库: Supabase Postgres
- 下载授权: Supabase Edge Function

## 1. 创建 Supabase 项目

在 Supabase 新建项目后,进入:

```text
Project Settings -> API
```

复制:

- Project URL
- anon public key

然后修改 `config.js`:

```js
window.COVER_MAKER_CONFIG = {
  supabaseUrl: 'https://你的项目ID.supabase.co',
  supabaseAnonKey: '你的 anon public key',
};
```

`anon public key` 可以放前端。不要把 `service_role` key 放进前端或 GitHub。

## 2. 创建数据库表

打开 Supabase:

```text
SQL Editor -> New query
```

粘贴并执行:

```text
supabase/schema.sql
```

会创建:

- `profiles`: 用户资料与会员角色
- `download_logs`: 下载记录
- RLS 策略
- 新用户自动创建 profile 的触发器

## 3. 部署 Edge Function

先安装并登录 Supabase CLI:

```bash
npm i -g supabase
supabase login
```

关联项目:

```bash
supabase link --project-ref 你的项目ID
```

部署下载授权函数:

```bash
supabase functions deploy authorize-download
```

Edge Function 会自动读取 Supabase 提供的环境变量:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4. 配置 Auth URL

Supabase Dashboard:

```text
Authentication -> URL Configuration
```

设置:

```text
Site URL:
https://xuebao123321.github.io/xiaohongshu-cover/
```

Redirect URLs 添加:

```text
https://xuebao123321.github.io/xiaohongshu-cover/**
http://127.0.0.1:8097/**
http://127.0.0.1:8787/**
```

## 5. 开启 GitHub Pages

GitHub 仓库:

```text
Settings -> Pages
```

选择:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

访问:

```text
https://xuebao123321.github.io/xiaohongshu-cover/
```

## 6. 管理用户和开通 VIP

Supabase Dashboard:

```text
Table Editor -> profiles
```

把用户的 `role` 从 `free` 改成 `vip` 即可开通 VIP。

SQL 方式:

```sql
select id, email, role, created_at
from public.profiles
order by created_at desc;
```

开通 VIP:

```sql
update public.profiles
set role = 'vip', updated_at = now()
where email = 'user@example.com';
```

恢复普通会员:

```sql
update public.profiles
set role = 'free', updated_at = now()
where email = 'user@example.com';
```

查看下载记录:

```sql
select
  p.email,
  p.role,
  d.download_date,
  sum(d.count) as downloads
from public.download_logs d
join public.profiles p on p.id = d.user_id
group by p.email, p.role, d.download_date
order by d.download_date desc;
```

## 注意

GitHub Pages 和 Supabase 都是海外服务,国内访问比 `workers.dev` 通常更容易试,但不能保证商业级稳定。若后续主要面向国内用户并且开始收费,最终仍建议迁到国内云服务和备案域名。
