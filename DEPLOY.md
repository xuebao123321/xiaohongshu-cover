# 部署指南

> 小红书封面生成器 v3.0 是**纯静态应用**(单 HTML + 2 个 ES Module),可以零配置部署到任何静态托管服务。

## 选项 A:GitHub Pages(免费 + 自定义域名)

### 步骤
```bash
# 1. 在 GitHub 新建仓库 cover-maker
# 2. 推送代码
git init
git add .
git commit -m "feat: 小红书封面生成器 v3.0"
git branch -M main
git remote add origin git@github.com:你的用户名/cover-maker.git
git push -u origin main

# 3. 在 GitHub 仓库设置 → Pages
#    Source: Deploy from a branch
#    Branch: main / (root)
#    Save

# 4. 等待 1-2 分钟,访问:
#    https://你的用户名.github.io/cover-maker/
```

### 自定义域名(可选)
1. 在仓库根目录创建 `CNAME`,写入 `cover.example.com`
2. DNS 添加 CNAME 记录指向 `你的用户名.github.io`
3. 在 Pages 设置填写自定义域名,启用 HTTPS

## 选项 B:Vercel(免费 + 全球 CDN + 自动 HTTPS)

### 步骤
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 在项目根目录执行
cd /Users/andy/Documents/Andy\ AI/cover-maker
vercel

# 首次登录会要求关联 GitHub 账号
# 之后按提示选择:
#   - Set up and deploy? Y
#   - Which scope? 你的账号
#   - Link to existing project? N
#   - Project name? cover-maker
#   - In which directory is your code located? ./
#   - Override settings? N

# 3. 生产部署
vercel --prod
```

### 输出
部署完成后会得到一个 `https://cover-maker-xxx.vercel.app` 的 URL。

### 自动部署
push 到 main 分支即自动触发部署,无需额外配置。

## 选项 C:Netlify(免费 + 表单 + 函数)

### 步骤
```bash
# 1. 安装 Netlify CLI
npm i -g netlify-cli

# 2. 登录
netlify login

# 3. 初始化 + 部署
cd /Users/andy/Documents/Andy\ AI/cover-maker
netlify init    # 选择 "Create & configure a new site"
netlify deploy --prod
```

### 通过 GitHub 集成
1. 登录 https://app.netlify.com
2. "Add new site" → "Import an existing project"
3. 选择 GitHub 仓库 `cover-maker`
4. Build settings:
   - Build command: *(留空)*
   - Publish directory: `.`
5. Deploy

## 选项 D:Cloudflare Pages(推荐,全球最快 CDN)

### 通过 Git 集成
1. 登录 https://dash.cloudflare.com
2. Workers & Pages → Create application → Pages → Connect to Git
3. 选择 `cover-maker` 仓库
4. Build settings:
   - Framework preset: None
   - Build command: *(留空)*
   - Build output directory: `/`
5. Save and Deploy

### 通过 Wrangler CLI
```bash
npm i -g wrangler
cd /Users/andy/Documents/Andy\ AI/cover-maker
wrangler pages deploy . --project-name=cover-maker
```

### 自定义域名
Workers & Pages → cover-maker → Custom domains → Set up a custom domain
按提示添加 CNAME 记录,Cloudflare 自动签发 HTTPS。

## 选项 E:本地静态服务器(开发测试)

### Python
```bash
cd /Users/andy/Documents/Andy\ AI/cover-maker
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### Node.js
```bash
npx serve .
# 访问 http://localhost:3000
```

### PHP
```bash
php -S localhost:8000
```

## 选项 F:嵌入到现有网站

### iframe 嵌入
```html
<iframe
  src="https://your-cover-maker-domain.com/index.html"
  width="100%"
  height="900"
  frameborder="0"
  style="border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:1400px;margin:0 auto;display:block">
</iframe>
```

### 反向代理(推荐)
Nginx 配置示例:
```nginx
location /cover-maker/ {
    alias /var/www/cover-maker/;
    try_files $uri $uri/ =404;
}
```

## 🌐 CDN 注意事项

### 字体源
当前使用 `https://fonts.font.im/`(国内 Google Fonts 镜像),海外访问可能较慢。
如需海外部署,建议改为:
```css
/* index.html 第 28 行附近 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700&...&display=swap');
```

### 国内访问优化
- **Vercel/Netlify**: 在国内访问可能偶尔慢,可同时部署到 Cloudflare Pages(国内访问较快)
- **Cloudflare Pages**: 国内访问依赖 Cloudflare 中国合作伙伴,可用性 95%+
- **国内 CDN**: 七牛、又拍、阿里云 OSS 静态托管都可以,只需把 `index.html` + `lib/` 上传即可

### 缓存策略
建议静态资源设置:
- `index.html` → `Cache-Control: no-cache`(确保更新即时生效)
- `lib/*.js` → `Cache-Control: public, max-age=31536000`(永久缓存)
- HTML 中可通过 `<link rel="modulepreload">` 预加载 lib/

## 🔧 常见部署问题

### Q1: 部署后页面空白,Console 报错 CORS
**A**: ES Module 必须在 HTTP/HTTPS 协议下加载。请检查:
- 是否用了 `https://` 而不是 `file://`
- 是否用了支持 ES Module 的托管服务(GitHub Pages/Vercel/Netlify/Cloudflare Pages 都支持)

### Q2: 中文显示为方框 □
**A**: 字体加载失败。检查:
- 网络是否能访问 `fonts.font.im`(国内)或 `fonts.googleapis.com`(海外)
- 是否修改过 `@import` URL 拼写错误
- 浏览器控制台 Network 面板查看字体请求状态

### Q3: 部署后某些卡片渲染慢
**A**: 30 张 canvas 同时渲染会占用 CPU。建议:
- 部署时启用 CDN 边缘缓存(Cloudflare/Vercel 默认开启)
- 用户设备性能差时,可考虑在 `buildAllCardsAsync` 中将 BATCH 从 4 改为 2

### Q4: 想绑定 xiaohongshu-cover.514993415.workers.dev 域名
**A**: 需要把该域名的 DNS 切到 Cloudflare,然后在 Workers & Pages 中添加 Custom Domain。

## 📊 部署后自检清单

部署完成后,逐项验证:

- [ ] 页面正常打开,无白屏
- [ ] 输入文字 → 点击「生成」→ 30 张卡片全部渲染
- [ ] 切换字体 → 30 张重新渲染,无报错
- [ ] 点击 ⬇ 下载,PNG 文件可正常打开
- [ ] 移动端访问(手机浏览器),长按 0.5s 下载
- [ ] 浏览器控制台 0 个 error / 0 个 warning
- [ ] Lighthouse 性能分 ≥ 80
- [ ] 所有静态资源 200 OK(Network 面板查看)

---

**部署后,把最终 URL 填入 README.md 的「线上演示」一节。** 🚀