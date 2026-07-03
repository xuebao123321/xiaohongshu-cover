-- Run this in Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'free' check (role in ('free', 'vip')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.download_logs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  download_date date not null default current_date,
  count integer not null check (count > 0),
  scope text not null,
  created_at timestamptz not null default now()
);

create index if not exists download_logs_user_date_idx
  on public.download_logs(user_id, download_date);

alter table public.profiles enable row level security;
alter table public.download_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "download_logs_select_own" on public.download_logs;
create policy "download_logs_select_own"
  on public.download_logs for select
  using (auth.uid() = user_id);

drop policy if exists "download_logs_insert_own" on public.download_logs;
create policy "download_logs_insert_own"
  on public.download_logs for insert
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), 'free')
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════ v4.1: 会员过期 + 支付订单 ═══════════

alter table public.profiles
  add column if not exists expires_at timestamptz;
-- null = 免费用户, 有值且在将来 = VIP (过期后由 authorize-download 自动降级)

alter table public.profiles
  add column if not exists page_access jsonb not null default '[]'::jsonb;
-- JSON array of page slugs the VIP user can access, e.g. ["ins_reviewer_carousel", "reddit_reply_assistant"]
-- Admin controls this via admin-manage → setPageAccess

create table if not exists public.payment_orders (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'annual')),
  amount integer not null,
  provider text not null default 'manual',
  provider_order_id text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payment_orders enable row level security;

drop policy if exists "payment_orders_select_own" on public.payment_orders;
create policy "payment_orders_select_own"
  on public.payment_orders for select
  using (auth.uid() = user_id);

-- Helpful admin queries:
-- View users:
-- select id, email, role, created_at from public.profiles order by created_at desc;
--
-- Make a user VIP:
-- update public.profiles set role = 'vip', updated_at = now() where email = 'user@example.com';
--
-- Restore free member:
-- update public.profiles set role = 'free', updated_at = now() where email = 'user@example.com';
