window.COVER_MAKER_CONFIG = {
  supabaseUrl: 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_PUBLIC_KEY',
  // 管理员邮箱列表（用于 admin.html 管理后台）
  // 在 Supabase Edge Function 中也需要设置 ADMIN_EMAILS 环境变量
  adminEmails: ['admin@example.com'],
};
