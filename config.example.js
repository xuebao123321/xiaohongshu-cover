window.COVER_MAKER_CONFIG = {
  supabaseUrl: 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_PUBLIC_KEY',
  // 管理员邮箱列表（用于 admin.html 管理后台）
  // 在 Supabase Edge Function 中也需要设置 ADMIN_EMAILS 环境变量
  adminEmails: ['admin@example.com'],
  // 收款码（微信和支付宝个人收款码图片 URL）
  // 把图片放到 GitHub 仓库或图床，然后填链接
  paymentQrCodes: {
    wechat: '',
    alipay: '',
  },
  // Instagram Content Assistant API
  // Uses Cloudflare Worker proxy → DeepSeek API
  // API Key managed via: wrangler secret put DEEPSEEK_API_KEY
  // Worker routes:
  //   POST /api/generate-instagram-content
  //   POST /api/rewrite-instagram-content
  //   POST /api/generate-reels-video-plan
};
