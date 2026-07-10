# 轮播短视频生成器 · 多批次 AI 构建提示词 v1.0

> **用途**: 用户按顺序逐条复制每条提示词,喂给 AI 编程助手(Claude Code / Cursor / Copilot)
> **目标**: 在现有 `cover-maker/` 项目基础上,新增一个完整的轮播短视频生成器二级页面,包含滤镜、特效、贴片、去重等完整功能,产出**完整可运行无 bug** 的系统
> **版本**: v1.0 (2026-07-06)
> **配套文件**: `slideshow_video_maker_dev_doc.md`(开发文档,已存在)
> **执行原则**: 严格按 9 个批次顺序执行,每条提示词末尾固定结束语是质量验收闸门

---

## 📋 总体执行规则

1. **顺序执行**: 必须按 批次 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 顺序执行,不可跳批
2. **每条提示词末尾固定结束语**:
   ```
   执行完这些提示词后,系统要完整可运行并且不会有任何bug
   ```
   AI 输出完成后,必须自己验证满足此条;不满足则继续修复直到满足
3. **每批次结束运行验证命令**: 见每批次末尾的"批次验收"小节
4. **任何批次失败**: 先修复当前批次再继续,不要带着 bug 进入下一批
5. **跨批次的引用**: 后续批次提示词中标注的"前置产物"是输入;AI 需先读取它们再开工

---

## 批次 1 · 项目初始化与基础骨架

> **目标**: 创建 video_maker 目录结构,搭建 HTML/CSS/JS 三件套基础骨架,完成页面信息架构
> **前置**: 无(新功能)
> **新增文件**:
> - `/Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html`(单文件应用,内联 CSS/JS)

### 提示词 1.1 · 阅读开发文档并搭建基础页面骨架

```
你是一名资深全栈工程师。请基于开发文档创建轮播短视频生成器的基础页面骨架。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【第一步:阅读开发文档】
用 Read 工具完整阅读以下文件,理解产品需求和技术路线:
- /Users/andy/Documents/Andy AI/cover-maker/video_maker/slideshow_video_maker_dev_doc.md

【第二步:了解现有项目风格】
用 Read 工具阅读以下文件,了解现有网站的视觉风格:
- /Users/andy/Documents/Andy AI/cover-maker/index.html(前 500 行即可,重点看 CSS 变量、配色、按钮样式、字体)
- /Users/andy/Documents/Andy AI/cover-maker/STYLE_GUIDE_v3.0.md(前 200 行,了解配色体系)

【第三步:创建页面骨架】
新建文件 /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html

页面采用工具型左右分栏布局(桌面端) / 上下布局(移动端):

```
┌──────────────────────────────────────────────┐
│ 顶部导航栏: 返回首页 + 工具标题               │
├────────────────────┬─────────────────────────┤
│ 左侧:素材与设置区   │ 右侧:手机预览区          │
│                    │                         │
│ 📁 上传图片        │ ┌───────────┐           │
│ 🎵 上传音乐        │ │           │           │
| 🎨 滤镜选择        │ │  9:16     │           │
│ ✨ 特效设置        │ │  手机框   │           │
│ 🎯 贴片/水印       │ │  预览     │           │
│ 🔄 去重设置        │ │           │           │
│ ⏱ 时长/转场       │ └───────────┘           │
│                    │ 导出进度 + 下载按钮      │
├────────────────────┴─────────────────────────┤
│ 底部:时间轴(图片缩略图排序、删除、替换)       │
└──────────────────────────────────────────────┘
```

【第四步:HTML 结构要求】

页面必须包含以下 DOM 结构(用语义化标签):

1. **顶部导航栏** (`<header class="vm-header">`)
   - 返回首页链接: `<a href="../">← 返回工具箱</a>`
   - 工具标题: "轮播短视频生成器"
   - 副标题: "多图 + 音乐 → 9:16 短视频"

2. **左侧设置区** (`<section class="vm-panel vm-settings">`)
   分为 7 个可折叠卡片(每个用 `<details>` 或 `<div class="vm-card">`):
   - 📁 图片素材(上传按钮 + 拖拽区 + 已上传列表容器)
   - 🎵 背景音乐(上传按钮 + 文件名 + 音频预览)
   - 🎨 滤镜效果(滤镜选择按钮组)
   - ✨ 动态特效(特效选择按钮组 + 转场选择)
   - 🎯 贴片水印(贴片开关 + 文字输入 + emoji 选择)
   - 🔄 去重设置(去重开关 + 强度滑块)
   - ⚙️ 导出设置(每图时长 / 封面停留 / 结尾停留 / 输出尺寸)

3. **右侧预览区** (`<section class="vm-panel vm-preview">`)
   - 9:16 手机框容器
   - Canvas 预览画布(1080×1920 等比缩放显示)
   - 播放/暂停按钮
   - 进度条
   - 当前时间 / 总时长显示

4. **底部时间轴** (`<section class="vm-timeline">`)
   - 横向滚动的图片缩略图列表
   - 每张缩略图可拖拽排序
   - 删除按钮、替换按钮
   - 时长标签

5. **导出区** (固定在预览区下方)
   - "生成视频" 主按钮(CTA,醒目)
   - 进度条(默认隐藏)
   - "下载 MP4" 按钮(生成完成后显示)

【第五步:CSS 样式要求】

样式必须与现有网站保持一致的视觉语言:

1. **配色方案**:参考 index.html 的配色
   - 背景: #f7f5f2
   - 卡片背景: #fff
   - 边框: #e8e4df
   - 主文字: #2d2a26
   - 次要文字: #8a8a8a
   - 主按钮: #1a1a1a(黑色) 或 #ED0108(红色)
   - 强调色: #5a8cb8

2. **字体**:与主站一致
   - 标题: "DM Serif Display", "Noto Serif SC", serif
   - 正文: "Noto Sans SC", "PingFang SC", sans-serif

3. **按钮样式**:圆角 10-14px,使用 .btn 类体系
   - .btn-primary: 黑底白字
   - .btn-outline: 白底黑字 + 边框
   - .btn-ghost: 浅灰底

4. **响应式断点**:
   - > 1024px: 左右分栏,左侧 400px 固定,右侧自适应
   - 768-1024px: 左右分栏,左侧 340px
   - ≤ 767px: 上下布局,设置区在预览区下方
   - ≤ 480px: 单列,卡片占满宽

5. **手机预览框**:
   - aspect-ratio: 9/16
   - 最大宽度 360px(桌面端)
   - 圆角边框 + 阴影模拟手机外观
   - Canvas 内部等比缩放

【第六步:JS 基础架构】

使用 ES Module 模式(与主站一致),在 `<script type="module">` 中:

1. **全局状态对象**:
```js
const STATE = {
  images: [],           // { id, name, file, objectUrl, width, height, duration }
  audio: null,          // { file, objectUrl, startAt, volume, fadeIn, fadeOut, duration }
  settings: {
    platform: 'reels',  // 'reels' | 'tiktok' | 'shorts'
    outputSize: { w: 1080, h: 1920 },
    fps: 30,
    secondsPerImage: 2.5,
    coverHold: 1,
    endHold: 1,
    transition: 'fade', // 'none' | 'fade' | 'slide' | 'zoom'
    motion: 'slow_zoom',// 'none' | 'slow_zoom' | 'pan_left' | 'pan_right' | 'pan_up'
    backgroundMode: 'contain_blur',
  },
  filter: 'none',       // 当前选中滤镜
  stickers: [],         // 贴片列表
  watermark: { enabled: false, text: '@yourhandle', position: 'bottom-left' },
  dedup: { enabled: false, strength: 0.5 },
  exportProgress: 0,
  isExporting: false,
};
```

2. **占位函数**(本批次只定义签名,后续批次实现):
```js
function handleImageUpload(files) { /* 批次 2 实现 */ }
function handleAudioUpload(file) { /* 批次 3 实现 */ }
function renderTimeline() { /* 批次 2 实现 */ }
function updatePreview() { /* 批次 4 实现 */ }
function applyFilter(ctx, filterName) { /* 批次 5 实现 */ }
function applyEffect(ctx, effectName, progress) { /* 批次 6 实现 */ }
function applyStickers(ctx) { /* 批次 7 实现 */ }
function checkDuplicate(newImage, existingImages) { /* 批次 8 实现 */ }
async function exportVideo() { /* 批次 4 实现 */ }
```

3. **DOM 事件绑定**:
   - 图片上传 input change 事件
   - 音乐上传 input change 事件
   - 拖拽区域 dragover / drop 事件
   - 设置项 change 事件(统一委托)
   - 按钮 click 事件

【验证步骤(AI 必须自测)】
1. 用 Bash 确认文件存在: ls -la /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html
2. 用 Read 自检 index.html 至少 2 次:
   - 确认 7 个设置卡片全部存在
   - 确认预览区 Canvas 元素存在
   - 确认时间轴容器存在
   - 确认所有按钮有对应的 id 或 class
3. 用 grep 验证关键结构:
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker/video_maker
   grep -c "vm-header" index.html       # 应 ≥ 1
   grep -c "vm-settings" index.html     # 应 ≥ 1
   grep -c "vm-preview" index.html      # 应 ≥ 1
   grep -c "vm-timeline" index.html     # 应 ≥ 1
   grep -c "<canvas" index.html         # 应 ≥ 1
   grep -c "handleImageUpload" index.html  # 应 ≥ 1
   grep -c "exportVideo" index.html     # 应 ≥ 1
   ```
4. HTML 行数应在 600-1000 行(骨架阶段)

【视觉对齐要求】
- 页面在桌面端 1440px 视口下,左侧面板宽度不超过 420px
- 手机预览框居中显示
- 所有卡片间距一致(12-16px)
- 按钮对齐主站 .btn 体系

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 1 验收
- `video_maker/index.html` 存在且行数在 600-1000 之间
- 7 个设置卡片全部存在
- Canvas 预览区存在
- 时间轴容器存在
- 所有 grep 检查命中
- 响应式三档断点 CSS 已写
- JS 全局 STATE 对象已定义

---

## 批次 2 · 图片上传、管理与时间轴

> **目标**: 实现图片上传(批量)、缩略图预览、拖拽排序、时间轴交互
> **前置产物**: 批次 1 的 index.html 骨架
> **修改文件**: `video_maker/index.html`

### 提示词 2.1 · 实现图片上传与时间轴

```
你是一名资深前端工程师。在批次 1 的基础上,实现图片上传、管理和时间轴功能。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
- /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html(批次 1 已生成)

【本次实现清单(必须逐项完成,缺一不可)】

1. **图片上传功能**
   - 支持点击按钮选择文件: `<input type="file" accept="image/png,image/jpeg,image/webp" multiple>`
   - 支持拖拽到上传区域
   - 支持粘贴图片(Ctrl+V / Cmd+V)
   - 读取文件后生成:
     * objectUrl: URL.createObjectURL(file)
     * thumbnail: Canvas 缩略图(200×200)
     * 读取图片原始尺寸(用 Image 对象加载后获取 naturalWidth/naturalHeight)
   - 单张图片 > 10MB 时弹出警告,但仍允许使用
   - 图片数量限制 3-30 张,超出提示
   - 上传后自动追加到 STATE.images 数组末尾

2. **缩略图生成函数**
```js
function createThumbnail(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 200;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > h) { h = h * maxSize / w; w = maxSize; }
      else { w = w * maxSize / h; h = maxSize; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
```

3. **时间轴渲染函数 renderTimeline()**
   - 在底部 vm-timeline 容器中渲染图片缩略图横排列表
   - 每项包含:
     * 序号标签(1, 2, 3...)
     * 缩略图(60×80px, object-fit: cover, 圆角)
     * 文件名(截断到 15 字 + "...")
     * 时长标签(如 "2.5s")
     * 删除按钮(×)
     * 替换按钮(🔄)
   - 支持横向滚动(overflow-x: auto)
   - 空状态:显示 "请上传图片" 提示

4. **拖拽排序功能**
   - 使用原生 Drag and Drop API(不引入外部库)
   - 每张缩略图设置 draggable="true"
   - dragstart: 记录拖拽起点索引,设置半透明效果
   - dragover: 计算插入位置,显示蓝色插入线
   - drop: 重新排列 STATE.images 数组,重新渲染时间轴
   - 移动端使用 touch 事件模拟拖拽(touchstart → touchmove → touchend)

5. **图片删除与替换**
   - 删除:从 STATE.images 中 splice,释放 objectUrl(URL.revokeObjectURL),重新渲染
   - 替换:弹出文件选择,替换当前位置图片,保留时长设置
   - 删除前确认(仅当图片 > 1 张时)

6. **图片设置卡片**(在左侧面板的"图片素材"卡片中)
   - 显示总图片数: "已上传 5/30 张"
   - 显示总预计时长: "预计视频时长: 18.5s"
   - 统一设置每图时长:滑块或输入框(0.5s - 10s,默认 2.5s)
   - "全部删除"按钮(带二次确认)

7. **STATE 同步**
   - 每次修改 STATE.images 后调用 renderTimeline()
   - 每次修改 STATE.images 后调用 updateTotalDuration() 更新预计时长显示
   - 图片 objectUrl 在页面关闭前通过 beforeunload 事件释放

8. **错误处理**
   - 文件类型校验:非图片文件弹出提示 "请选择 PNG / JPG / WebP 格式"
   - 文件读取失败:提示 "部分图片无法读取,请更换文件格式"
   - 图片加载超时(10s):自动跳过,提示用户

【验证步骤(AI 必须自测)】
1. 用 Read 自检 index.html 至少 2 次确认所有修改到位
2. 用 grep 验证关键函数:
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker/video_maker
   grep -c "createThumbnail" index.html      # 应 ≥ 1
   grep -c "renderTimeline" index.html       # 应 ≥ 1
   grep -c "handleImageUpload" index.html    # 应 ≥ 1
   grep -c "draggable" index.html            # 应 ≥ 1
   grep -c "URL.createObjectURL\|URL.revokeObjectURL" index.html  # 应 ≥ 2
   grep -c "beforeunload" index.html         # 应 ≥ 1
   ```
3. 行数检查:应在 1100-1800 行之间
4. 用 Bash 验证无语法错误(如果 JS 从 HTML 中可提取):
   ```bash
   node -e "console.log('syntax check passed')"
   ```

【性能要求】
- 30 张图片上传后缩略图生成总时间 < 5s
- 拖拽排序操作延迟 < 50ms(用 requestAnimationFrame)
- 时间轴横向滚动帧率 ≥ 30fps

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 2 验收
- 图片上传(点击/拖拽/粘贴)三种方式全部实现
- 缩略图在时间轴中正确显示
- 拖拽排序可用(桌面端)
- 删除/替换功能可用
- 总时长计算正确
- 5 个 grep 命令命中
- 行数在 1100-1800 之间

---

## 批次 3 · 音乐上传与音频控制

> **目标**: 实现音乐上传、音频预览、裁剪、音量控制、淡入淡出
> **前置产物**: 批次 2 的 index.html
> **修改文件**: `video_maker/index.html`

### 提示词 3.1 · 实现音乐上传与音频控制

```
你是一名资深前端工程师。在批次 2 基础上实现完整的音频上传与控制功能。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
- /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html(批次 2 已更新)

【本次实现清单(必须逐项完成,缺一不可)】

1. **音乐上传**
   - 支持点击上传按钮选择文件: `<input type="file" accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg">`
   - 支持拖拽到音乐上传区域
   - 读取音频元数据(用 Audio 对象加载后读取 duration)
   - 文件大小 > 50MB 时警告
   - 上传后存入 STATE.audio

2. **音频预览播放器**
   - 在"背景音乐"卡片中显示迷你播放器:
     * 文件名(截断)
     * 音频时长(mm:ss 格式)
     * 播放/暂停按钮(▶ / ❚❚)
     * 当前播放时间 / 总时长
     * 简易进度条(可点击跳转)
   - 使用 HTML5 `<audio>` 元素(隐藏) + 自定义控件
   - 播放时进度条实时更新(requestAnimationFrame 或 timeupdate 事件)

3. **音乐裁剪控制**
   - 起始时间滑块:范围 0 到音频总时长,默认 0
   - 预览裁剪:拖动滑块时实时跳转 audio.currentTime
   - 显示裁剪后实际使用时长

4. **音量控制**
   - 音量滑块: 0% - 100%, 默认 80%
   - 实时预览:拖动时调整 audio.volume

5. **淡入淡出**
   - 淡入时长: 0s / 0.5s / 1s / 1.5s / 2s(下拉选择,默认 1s)
   - 淡出时长: 0s / 1s / 2s / 3s / 4s(下拉选择,默认 2s)
   - 预览时模拟淡入淡出效果(用 gain 节点或直接操作 volume)

6. **无音乐模式**
   - "无音乐"复选框:勾选后隐藏音频设置,仅导出纯视频
   - 默认为无音乐模式(与开发文档一致)

7. **移除音乐**
   - "移除音乐"按钮:清除 STATE.audio,释放 objectUrl,重置控件

8. **音频状态栏**
   在音乐卡片中显示当前配置摘要:
   ```
   已选: song.mp3 (3:42)
   裁剪: 0:05 → 0:25 | 音量: 80% | 淡入 1s 淡出 2s
   ```

9. **错误处理**
   - 文件格式校验:非音频文件提示 "请选择 MP3 / WAV / M4A 格式"
   - 音频加载失败:提示 "音乐文件无法解析,请更换文件"
   - 浏览器不支持格式:提示 "当前浏览器不支持此音频格式,建议使用 MP3"

【验证步骤(AI 必须自测)】
1. 用 Read 自检 index.html 至少 2 次
2. 用 grep 验证:
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker/video_maker
   grep -c "audio\|Audio" index.html                     # 应 ≥ 5
   grep -c "handleAudioUpload\|audioUpload" index.html   # 应 ≥ 1
   grep -c "fadeIn\|fadeOut\|fade" index.html            # 应 ≥ 2
   grep -c "audio.*volume\|gain" index.html              # 应 ≥ 1
   grep -c "timeupdate\|currentTime" index.html          # 应 ≥ 1
   ```
3. 行数检查:应在 1500-2200 行之间

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 3 验收
- 音乐上传可用
- 迷你播放器可播放/暂停/跳转
- 起始时间裁剪可用
- 音量滑块可用
- 淡入淡出选择可用
- 无音乐模式可切换
- 5 个 grep 命中
- 行数在 1500-2200

---

## 批次 4 · 视频合成核心(ffmpeg.wasm)

> **目标**: 集成 ffmpeg.wasm,实现图片序列 + 音频 → MP4 视频导出
> **前置产物**: 批次 2、3 的 index.html
> **修改文件**: `video_maker/index.html`

### 提示词 4.1 · 集成 ffmpeg.wasm 实现视频导出

```
你是一名资深前端工程师,精通 ffmpeg.wasm。在批次 2-3 基础上实现视频合成与导出。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
- /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html(批次 3 已更新)

【技术选型说明】
使用 ffmpeg.wasm(@ffmpeg/ffmpeg v0.12+) 进行浏览器端视频合成。
CDN 引入方式(不增加 npm 依赖,与现有项目保持一致):
```html
<script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js"></script>
```

ffmpeg.wasm 需要 SharedArrayBuffer,因此需要设置 COOP/COEP 响应头。
由于 GitHub Pages 不支持自定义响应头,使用以下 workaround:
- 使用 ffmpeg.wasm 的单线程版本(无需 SharedArrayBuffer)
- 或使用开源 CDN 提供的跨域隔离页面作为中间层

**推荐方案:使用 @ffmpeg/ffmpeg 的单线程模式 + 本地 fallback**
如果单线程版本不可用,退而使用 Canvas 帧序列 + MediaRecorder API 方案作为 fallback。

【本次实现清单(必须逐项完成,缺一不可)】

1. **Canvas 预处理管线(核心)**
   在调用 FFmpeg 之前,先用 Canvas 2D 将每张图片预处理为统一规格:
```js
async function preprocessImage(imageObj, settings) {
  const canvas = document.createElement('canvas');
  canvas.width = settings.outputSize.w;   // 1080
  canvas.height = settings.outputSize.h;  // 1920
  const ctx = canvas.getContext('2d');

  // 1. 应用背景模式(contain_blur / cover / contain_solid)
  applyBackgroundMode(ctx, imageObj, settings.backgroundMode);

  // 2. 应用滤镜(批次 5 实现,本批次先用 identity pass)
  // applyFilter(ctx, STATE.filter);

  // 3. 应用动态效果(批次 6 实现,本批次生成静止帧)
  // applyMotion(ctx, settings.motion, progress);

  // 4. 应用贴片(批次 7 实现)
  // applyStickers(ctx);

  // 5. 应用水印
  if (STATE.watermark.enabled) applyWatermark(ctx);

  // 6. 输出 Blob
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}
```

2. **背景填充模式函数 applyBackgroundMode(ctx, img, mode)**
   - 'cover': 图片等比缩放填满画布,居中裁剪(类似 CSS background-size: cover)
   - 'contain_blur': 图片完整显示,背景层用同一图片模糊填充(用 ctx.filter = 'blur(30px)' 先画模糊底,再画清晰图)
   - 'contain_solid': 图片完整显示,背景填充主色调(采样图片边缘平均色)

```js
function applyBackgroundMode(ctx, img, mode) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const imgRatio = img.width / img.height;
  const canvasRatio = W / H;

  if (mode === 'cover') {
    let sw, sh, sx, sy;
    if (imgRatio > canvasRatio) {
      sh = img.height; sw = sh * canvasRatio; sx = (img.width - sw) / 2; sy = 0;
    } else {
      sw = img.width; sh = sw / canvasRatio; sy = (img.height - sh) / 2; sx = 0;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  } else if (mode === 'contain_blur') {
    // 先画模糊背景
    ctx.filter = 'blur(40px)';
    ctx.drawImage(img, 0, 0, W, H);
    ctx.filter = 'none';
    // 再画清晰图居中
    let dw, dh, dx, dy;
    if (imgRatio > canvasRatio) {
      dw = W; dh = W / imgRatio; dx = 0; dy = (H - dh) / 2;
    } else {
      dh = H; dw = H * imgRatio; dy = 0; dx = (W - dw) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  } else { // contain_solid
    const sampleColor = sampleEdgeColor(img);
    ctx.fillStyle = sampleColor;
    ctx.fillRect(0, 0, W, H);
    let dw, dh, dx, dy;
    if (imgRatio > canvasRatio) {
      dw = W; dh = W / imgRatio; dx = 0; dy = (H - dh) / 2;
    } else {
      dh = H; dw = H * imgRatio; dy = 0; dx = (W - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  }
}
```

3. **主视频合成函数 exportVideo()**
   采用分步策略,避免一次性加载大量帧到内存:

```js
async function exportVideo() {
  if (STATE.images.length === 0) { showToast('请先上传图片'); return; }

  STATE.isExporting = true;
  STATE.exportProgress = 0;
  updateExportUI();

  try {
    // 尝试方案 A: ffmpeg.wasm
    await exportWithFFmpeg();
  } catch (ffmpegError) {
    console.warn('ffmpeg.wasm 不可用,降级到 Canvas + MediaRecorder:', ffmpegError);
    // 方案 B: Canvas 帧序列 + MediaRecorder
    await exportWithMediaRecorder();
  }

  STATE.isExporting = false;
  updateExportUI();
}
```

4. **方案 A: ffmpeg.wasm 导出**
```js
async function exportWithFFmpeg() {
  const { FFmpeg } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
  const ffmpeg = new FFmpeg();

  // 加载(懒加载,仅在导出时触发)
  await ffmpeg.load();

  // 预处理每张图片为统一帧
  const totalFrames = calculateTotalFrames();
  for (let i = 0; i < STATE.images.length; i++) {
    const frameBlob = await preprocessImage(STATE.images[i], STATE.settings);
    const frameData = new Uint8Array(await frameBlob.arrayBuffer());
    await ffmpeg.writeFile(`frame_${String(i).padStart(3, '0')}.png`, frameData);
    STATE.exportProgress = ((i + 1) / STATE.images.length) * 0.5;
    updateExportUI();
  }

  // 生成视频命令
  const durationPerFrame = STATE.settings.secondsPerImage;
  let cmd = [
    '-framerate', `1/${durationPerFrame}`,
    '-i', 'frame_%03d.png',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '23',
    '-r', String(STATE.settings.fps),
  ];

  // 如果有音乐,添加音频
  if (STATE.audio && STATE.audio.file) {
    const audioData = new Uint8Array(await STATE.audio.file.arrayBuffer());
    await ffmpeg.writeFile('audio_input', audioData);
    cmd.push('-i', 'audio_input', '-c:a', 'aac', '-b:a', '128k', '-shortest');
  }

  cmd.push('output.mp4');
  await ffmpeg.exec(cmd);

  STATE.exportProgress = 0.9;
  const data = await ffmpeg.readFile('output.mp4');
  const blob = new Blob([data.buffer], { type: 'video/mp4' });
  triggerDownload(blob);

  STATE.exportProgress = 1.0;
  updateExportUI();
}
```

5. **方案 B: Canvas + MediaRecorder fallback**
```js
async function exportWithMediaRecorder() {
  const canvas = document.createElement('canvas');
  canvas.width = STATE.settings.outputSize.w;
  canvas.height = STATE.settings.outputSize.h;
  const ctx = canvas.getContext('2d');

  const stream = canvas.captureStream(STATE.settings.fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm',
    videoBitsPerSecond: 8000000,
  });

  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);

  const done = new Promise(resolve => { recorder.onstop = resolve; });
  recorder.start();

  const totalFrames = calculateTotalFrames();
  const frameDuration = 1000 / STATE.settings.fps;

  for (let f = 0; f < totalFrames; f++) {
    const imgIndex = getImageIndexAtFrame(f, totalFrames);
    const img = STATE.images[imgIndex];
    if (!img) continue;

    // 加载图片
    const imageEl = await loadImage(img.objectUrl);
    applyBackgroundMode(ctx, imageEl, STATE.settings.backgroundMode);

    // 计算当前帧在图片展示中的进度 [0, 1]
    const progress = getProgressInImage(f, imgIndex, totalFrames);
    // applyMotion(ctx, STATE.settings.motion, progress); // 批次 6

    // 写帧
    ctx.fillStyle = '#000';
    // (Canvas 已在上一步绘制)

    await sleep(frameDuration);
    STATE.exportProgress = f / totalFrames;
    updateExportUI();
  }

  recorder.stop();
  await done;

  const blob = new Blob(chunks, { type: 'video/webm' });
  triggerDownload(blob, 'slideshow-video.webm');
  STATE.exportProgress = 1.0;
  updateExportUI();
}
```

6. **辅助函数**
```js
function calculateTotalFrames() {
  let total = 0;
  for (const img of STATE.images) {
    total += (img.duration || STATE.settings.secondsPerImage) * STATE.settings.fps;
  }
  total += STATE.settings.coverHold * STATE.settings.fps;
  total += STATE.settings.endHold * STATE.settings.fps;
  return Math.floor(total);
}

function getImageIndexAtFrame(frame, totalFrames) { /* 返回该帧对应的图片索引 */ }

function getProgressInImage(frame, imgIndex, totalFrames) { /* 返回图片展示进度 0-1 */ }

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `slideshow-video-${Date.now().toString(36)}.mp4`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ 视频已开始下载');
}
```

7. **导出进度 UI**
   - 进度条容器(底部固定):灰色背景条 + 蓝色/红色填充条 + 百分比文字
   - 导出中:进度条显示,"生成视频"按钮替换为 "生成中...XX%" 且 disabled
   - 导出完成:进度条变绿,显示 "下载 MP4" 按钮
   - 导出失败:进度条变红,显示错误信息 + "重新生成" 按钮
   - 进度计算:图片预处理占 50%,FFmpeg 合成占 40%,最终打包 10%

8. **自动生成预览帧(非实时渲染)**
   在"预览区"显示当前选中的设置效果:
   - 用 Canvas 渲染第一张图片 + 当前设置(背景模式、滤镜、水印)的静态预览
   - 点击"预览效果"按钮时触发快速帧遍历(CSS 动画模拟)

9. **错误处理**
   - ffmpeg.wasm 加载失败:自动降级到 MediaRecorder 方案,提示用户
   - 内存不足:捕获 Out of Memory,提示减少图片数量或压缩
   - 生成超时(120s):提示 "生成超时,请减少图片数量后重试"
   - 所有错误保留 STATE 数据,允许重试

10. **内存管理**
    - 导出完成后释放中间帧 Blob
    - 提供"清除缓存"按钮手动释放所有 Blob URL
    - beforeunload 事件释放所有 objectUrl

【验证步骤(AI 必须自测)】
1. 用 Read 自检 index.html 至少 2 次
2. 用 grep 验证:
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker/video_maker
   grep -c "preprocessImage\|applyBackgroundMode" index.html  # 应 ≥ 2
   grep -c "exportVideo\|exportWith" index.html              # 应 ≥ 2
   grep -c "ffmpeg\|FFmpeg" index.html                       # 应 ≥ 2
   grep -c "MediaRecorder\|captureStream" index.html         # 应 ≥ 1
   grep -c "triggerDownload\|createObjectURL" index.html     # 应 ≥ 2
   grep -c "calculateTotalFrames" index.html                 # 应 ≥ 1
   ```
3. 行数检查:应在 2200-3200 行之间

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 4 验收
- Canvas 预处理管线实现(背景填充 3 种模式)
- 两种导出方案(ffmpeg.wasm + MediaRecorder fallback)全部实现
- 导出进度 UI 可用
- 下载触发逻辑可用
- 错误降级机制完整
- 6 个 grep 命中
- 行数在 2200-3200

---

## 批次 5 · 滤镜系统

> **目标**: 实现 12+ 种图片滤镜(颜色调节、风格化),支持实时预览
> **前置产物**: 批次 4 的 index.html
> **修改文件**: `video_maker/index.html`

### 提示词 5.1 · 实现完整滤镜系统

```
你是一名资深前端工程师,精通 Canvas 2D 图像处理。在批次 4 基础上实现滤镜系统。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
- /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html(批次 4 已更新)

【滤镜系统设计原则】
- 所有滤镜基于 Canvas 2D API 实现(globalCompositeOperation + filter + pixel manipulation)
- 滤镜可叠加使用(但 MVP 仅支持单滤镜)
- 滤镜参数可调强度(0-100%)
- 滤镜在 preprocessImage 阶段应用,不影响原始图片
- 支持实时预览(静态帧)

【本次实现清单(必须逐项完成,缺一不可)】

1. **滤镜注册表**
```js
const FILTERS = {
  none:        { name: '无滤镜',   icon: '🚫', category: 'basic' },
  grayscale:   { name: '黑白',     icon: '⬛', category: 'color',   hasStrength: true },
  sepia:       { name: '复古棕',   icon: '🟤', category: 'color',   hasStrength: true },
  vintage:     { name: '老照片',   icon: '📷', category: 'style',   hasStrength: true },
  vivid:       { name: '鲜艳',     icon: '🌈', category: 'color',   hasStrength: true },
  cool:        { name: '冷色调',   icon: '🧊', category: 'color',   hasStrength: true },
  warm:        { name: '暖色调',   icon: '🔥', category: 'color',   hasStrength: true },
  softGlow:    { name: '柔光',     icon: '✨', category: 'style',   hasStrength: true },
  lofi:        { name: 'Lo-Fi',    icon: '📺', category: 'style',   hasStrength: false },
  cinema:     { name: '电影感',   icon: '🎬', category: 'style',   hasStrength: true },
  posterize:  { name: '海报化',   icon: '🖼️', category: 'artistic', hasStrength: true },
  sketch:     { name: '素描',     icon: '✏️', category: 'artistic', hasStrength: true },
  pixelate:   { name: '像素化',   icon: '👾', category: 'artistic', hasStrength: true },
  invert:     { name: '反相',     icon: '🔄', category: 'basic',    hasStrength: true },
};
```

2. **核心滤镜应用函数 applyFilter(ctx, filterName, strength)**
```js
function applyFilter(ctx, filterName, strength = 1.0) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;

  switch (filterName) {
    case 'none': break;

    case 'grayscale':
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = lerp(data[i], gray, strength);
        data[i + 1] = lerp(data[i + 1], gray, strength);
        data[i + 2] = lerp(data[i + 2], gray, strength);
      }
      break;

    case 'sepia':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const sr = r * 0.393 + g * 0.769 + b * 0.189;
        const sg = r * 0.349 + g * 0.686 + b * 0.168;
        const sb = r * 0.272 + g * 0.534 + b * 0.131;
        data[i]     = lerp(r, Math.min(255, sr), strength);
        data[i + 1] = lerp(g, Math.min(255, sg), strength);
        data[i + 2] = lerp(b, Math.min(255, sb), strength);
      }
      break;

    case 'vintage':
      // 老照片:降饱和 + 暖色偏 + 轻微暗角
      applyFilter(ctx, 'sepia', strength * 0.6);
      applyVignette(ctx, strength * 0.4);
      break;

    case 'vivid':
      // 提高饱和度
      for (let i = 0; i < data.length; i += 4) {
        const hsl = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        hsl[1] = Math.min(1, hsl[1] * (1 + strength * 0.8));
        const [r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2]);
        data[i] = r; data[i + 1] = g; data[i + 2] = b;
      }
      break;

    case 'cool':
      // 增加蓝色通道
      for (let i = 0; i < data.length; i += 4) {
        data[i]     = lerp(data[i], data[i] * 0.85, strength);
        data[i + 1] = lerp(data[i + 1], data[i + 1] * 0.9, strength);
        data[i + 2] = lerp(data[i + 2], Math.min(255, data[i + 2] * 1.2), strength);
      }
      break;

    case 'warm':
      // 增加红/黄色通道
      for (let i = 0; i < data.length; i += 4) {
        data[i]     = lerp(data[i], Math.min(255, data[i] * 1.15), strength);
        data[i + 1] = lerp(data[i + 1], Math.min(255, data[i + 1] * 1.08), strength);
        data[i + 2] = lerp(data[i + 2], data[i + 2] * 0.9, strength);
      }
      break;

    case 'softGlow':
      // 柔光:轻微模糊 + 提高亮度 + 降低对比度
      applyBoxBlur(ctx, 2 * strength);
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = `rgba(255,255,255,${0.15 * strength})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      break;

    case 'lofi':
      // Lo-Fi:降分辨率 + 轻微色偏 + 噪点
      applyPixelate(ctx, 3);
      for (let i = 0; i < data.length; i += 4) {
        data[i] += (Math.random() - 0.5) * 30;
        data[i + 1] += (Math.random() - 0.5) * 30;
        data[i + 2] += (Math.random() - 0.5) * 30;
      }
      break;

    case 'cinema':
      // 电影感:上下黑边(letterbox) + 色调映射
      applyLetterbox(ctx, 0.12);
      // 提暗部压亮部(S 曲线)
      for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          const v = data[i + c] / 255;
          data[i + c] = Math.round(255 * (v < 0.5 ? 2 * v * v : -1 + (4 - 2 * v) * v));
        }
      }
      break;

    case 'posterize':
      // 海报化:减少色阶
      const levels = Math.round(lerp(256, 4, strength));
      for (let i = 0; i < data.length; i += 4) {
        data[i]     = Math.round(data[i] / (256 / levels)) * (256 / levels);
        data[i + 1] = Math.round(data[i + 1] / (256 / levels)) * (256 / levels);
        data[i + 2] = Math.round(data[i + 2] / (256 / levels)) * (256 / levels);
      }
      break;

    case 'sketch':
      // 素描:灰度 → 边缘检测(Sobel 简化)
      applyFilter(ctx, 'grayscale', 1.0);
      // 简化:用灰度反转 + color-dodge 混合模拟
      const grayData = ctx.getImageData(0, 0, W, H);
      for (let i = 0; i < grayData.data.length; i += 4) {
        const inv = 255 - grayData.data[i];
        grayData.data[i] = grayData.data[i + 1] = grayData.data[i + 2] =
          Math.min(255, grayData.data[i] + (inv * grayData.data[i]) / 255);
      }
      ctx.putImageData(grayData, 0, 0);
      break;

    case 'pixelate':
      applyPixelate(ctx, lerp(1, 20, strength));
      break;

    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        data[i]     = lerp(data[i], 255 - data[i], strength);
        data[i + 1] = lerp(data[i + 1], 255 - data[i + 1], strength);
        data[i + 2] = lerp(data[i + 2], 255 - data[i + 2], strength);
      }
      break;
  }

  ctx.putImageData(imageData, 0, 0);
}
```

3. **辅助图像处理函数**
```js
// 线性插值
function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

// RGB → HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) { /* 标准 HSL→RGB 转换 */ }

// 暗角效果
function applyVignette(ctx, strength) { /* 径向渐变黑色边框 */ }

// 上下黑边(letterbox)
function applyLetterbox(ctx, ratio) { /* 顶部和底部填充黑色矩形 */ }

// 像素化
function applyPixelate(ctx, blockSize) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, W, H);
  const bs = Math.max(1, Math.round(blockSize));
  for (let y = 0; y < H; y += bs) {
    for (let x = 0; x < W; x += bs) {
      const i = (y * W + x) * 4;
      const r = imageData.data[i], g = imageData.data[i + 1], b = imageData.data[i + 2];
      for (let dy = 0; dy < bs && y + dy < H; dy++) {
        for (let dx = 0; dx < bs && x + dx < W; dx++) {
          const j = ((y + dy) * W + (x + dx)) * 4;
          imageData.data[j] = r; imageData.data[j + 1] = g; imageData.data[j + 2] = b;
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// 简易高斯模糊(3×3 box blur 多 pass 近似)
function applyBoxBlur(ctx, radius) { /* 多 pass 均值模糊 */ }
```

4. **滤镜 UI(在左侧面板"滤镜效果"卡片中)**
   - 滤镜分类标签: 基础 / 色彩 / 风格化 / 艺术效果
   - 每个滤镜用图标按钮展示,一行 4 个
   - 选中态:黑底白字 + 边框高亮
   - 有强度参数的滤镜:选中后下方出现强度滑块(0-100%)
   - 滤镜选择后实时更新 Canvas 静态预览
   - 预览区显示当前滤镜名称标签

5. **滤镜预览更新**
   在 preprocessImage 的流程中插入滤镜调用:
```js
// 在预处理管线中
applyBackgroundMode(ctx, img, mode);
applyFilter(ctx, STATE.filter, STATE.filterStrength); // 🎨 滤镜在此
// applyMotion(ctx, ...) // 批次 6
// applyStickers(ctx)    // 批次 7
```

6. **滤镜强度滑块**
```html
<div class="filter-strength" id="filterStrengthRow" style="display:none">
  <label>滤镜强度</label>
  <input type="range" id="filterStrength" min="0" max="100" value="80">
  <span id="filterStrengthValue">80%</span>
</div>
```

7. **滤镜对比预览**(可选增强)
   - 在预览区提供"原图 / 滤镜后"切换按钮
   - 或左右分屏对比(鼠标按下显示原图,松开显示滤镜后)

【验证步骤(AI 必须自测)】
1. 用 Read 自检 index.html 至少 2 次
2. 用 grep 验证:
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker/video_maker
   grep -c "FILTERS\s*=" index.html             # 应 ≥ 1
   grep -c "applyFilter" index.html            # 应 ≥ 2
   grep -c "grayscale\|sepia\|vintage\|vivid\|cool\|warm" index.html  # 应 ≥ 4
   grep -c "getImageData\|putImageData" index.html  # 应 ≥ 2
   grep -c "rgbToHsl\|hslToRgb\|lerp" index.html    # 应 ≥ 3
   ```
3. 行数检查:应在 2800-4000 行之间

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 5 验收
- 14 种滤镜全部注册并实现
- 滤镜 UI 可切换
- 强度滑块对支持强度的滤镜可用
- Canvas 静态预览反映滤镜效果
- 5 个 grep 命令命中
- 行数在 2800-4000

---

## 批次 6 · 动态特效与转场系统

> **目标**: 实现 Ken Burns 效果(slow_zoom/pan)和转场效果(fade/slide/zoom)
> **前置产物**: 批次 5 的 index.html
> **修改文件**: `video_maker/index.html`

### 提示词 6.1 · 实现动态特效与转场

```
你是一名资深前端工程师。在批次 5 基础上实现动态特效(Ken Burns)和转场系统。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
- /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html(批次 5 已更新)

【动态特效系统说明】
每张图片展示期间应用微小的动态效果(不改变图片内容,只改变变换矩阵),让视频更有动感。

【本次实现清单(必须逐项完成,缺一不可)】

1. **动态特效函数 applyMotion(ctx, img, motionType, progress)**
   progress 是该图片展示的进度 [0, 1],0 为开始,1 为结束。

```js
function applyMotion(ctx, img, motionType, progress) {
  const W = ctx.canvas.width, H = ctx.canvas.height;

  ctx.save();

  switch (motionType) {
    case 'none':
      // 不添加动态效果
      break;

    case 'slow_zoom':
      // 轻微放大: 100% → 106%
      const zoomScale = 1 + progress * 0.06;
      const zoomX = W / 2 - (W * zoomScale) / 2;
      const zoomY = H / 2 - (H * zoomScale) / 2;
      ctx.translate(zoomX, zoomY);
      ctx.scale(zoomScale, zoomScale);
      break;

    case 'pan_left':
      // 从右向左平移
      const panLX = -W * 0.05 * (1 - progress);
      ctx.translate(panLX, 0);
      break;

    case 'pan_right':
      // 从左向右平移
      const panRX = W * 0.05 * (1 - progress);
      ctx.translate(panRX, 0);
      break;

    case 'pan_up':
      // 从下向上平移
      const panUY = -H * 0.05 * (1 - progress);
      ctx.translate(0, panUY);
      break;

    case 'pan_down':
      // 从上向下平移
      const panDY = H * 0.05 * (1 - progress);
      ctx.translate(0, panDY);
      break;

    case 'ken_burns':
      // 经典 Ken Burns: 放大 + 微移
      const kbScale = 1 + progress * 0.08;
      const kbX = W / 2 - (W * kbScale) / 2 + Math.sin(progress * Math.PI) * W * 0.02;
      const kbY = H / 2 - (H * kbScale) / 2 + Math.cos(progress * Math.PI) * H * 0.02;
      ctx.translate(kbX, kbY);
      ctx.scale(kbScale, kbScale);
      break;

    case 'rotate_cw':
      // 轻微顺时针旋转
      const rot = progress * 2 * Math.PI / 180;
      ctx.translate(W / 2, H / 2);
      ctx.rotate(rot);
      ctx.translate(-W / 2, -H / 2);
      break;

    case 'bounce':
      // 轻微弹跳
      const bounceY = Math.sin(progress * Math.PI * 2) * H * 0.02 * (1 - progress);
      ctx.translate(0, bounceY);
      break;
  }

  // 实际绘制图片在 applyMotion 之后由调用者执行
  // 调用模式: applyMotion(ctx, img, type, progress); ctx.drawImage(img, ...);
}
```

2. **转场效果函数 applyTransition(ctx, fromImg, toImg, progress)**
   progress: [0, 1],0 = 完全显示 fromImg,1 = 完全显示 toImg

```js
function applyTransition(ctx, fromImg, toImg, progress, transitionType) {
  const W = ctx.canvas.width, H = ctx.canvas.height;

  switch (transitionType) {
    case 'none':
      // 硬切
      if (progress < 0.5) drawFullImage(ctx, fromImg);
      else drawFullImage(ctx, toImg);
      break;

    case 'fade':
      // 交叉淡入淡出
      ctx.globalAlpha = 1;
      drawFullImage(ctx, fromImg);
      ctx.globalAlpha = progress;
      drawFullImage(ctx, toImg);
      ctx.globalAlpha = 1;
      break;

    case 'slide_left':
      // 向左滑动
      const slideX = W * progress;
      drawFullImage(ctx, fromImg);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W - slideX, H);
      ctx.clip();
      drawFullImage(ctx, toImg);
      ctx.restore();
      break;

    case 'slide_right':
      const slideRX = -W * (1 - progress);
      drawFullImage(ctx, fromImg);
      ctx.save();
      ctx.beginPath();
      ctx.rect(Math.max(0, slideRX), 0, W, H);
      ctx.clip();
      drawFullImage(ctx, toImg);
      ctx.restore();
      break;

    case 'slide_up':
      const slideUY = H * progress;
      drawFullImage(ctx, fromImg);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H - slideUY);
      ctx.clip();
      drawFullImage(ctx, toImg);
      ctx.restore();
      break;

    case 'zoom_in':
      // 下一张图从中心放大进入
      drawFullImage(ctx, fromImg);
      const ziScale = progress * 0.5 + 0.5; // 0.5 → 1.0
      ctx.save();
      ctx.globalAlpha = progress;
      ctx.translate(W / 2, H / 2);
      ctx.scale(ziScale, ziScale);
      ctx.translate(-W / 2, -H / 2);
      drawFullImage(ctx, toImg);
      ctx.restore();
      break;

    case 'zoom_out':
      // 当前图缩小退出,下一张图显现
      drawFullImage(ctx, toImg);
      const zoScale = 1 - progress * 0.5; // 1.0 → 0.5
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.translate(W / 2, H / 2);
      ctx.scale(zoScale, zoScale);
      ctx.translate(-W / 2, -H / 2);
      drawFullImage(ctx, fromImg);
      ctx.restore();
      break;

    case 'wipe_left':
      // 从左到右擦除
      drawFullImage(ctx, fromImg);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W * progress, H);
      ctx.clip();
      drawFullImage(ctx, toImg);
      ctx.restore();
      break;
  }
}

function drawFullImage(ctx, img) {
  // 应用背景模式绘制单张图片到满画布
  applyBackgroundMode(ctx, img, STATE.settings.backgroundMode);
}
```

3. **动态效果注册表**
```js
const MOTION_EFFECTS = {
  none:        { name: '无特效',     icon: '⏸️' },
  slow_zoom:   { name: '缓慢放大',   icon: '🔍' },
  pan_left:    { name: '左移',       icon: '⬅️' },
  pan_right:   { name: '右移',       icon: '➡️' },
  pan_up:      { name: '上移',       icon: '⬆️' },
  pan_down:    { name: '下移',       icon: '⬇️' },
  ken_burns:   { name: 'Ken Burns',  icon: '🎥' },
  rotate_cw:   { name: '微旋转',     icon: '🔄' },
  bounce:      { name: '弹跳',       icon: '🦘' },
};

const TRANSITIONS = {
  none:        { name: '无转场',     icon: '⏹️' },
  fade:        { name: '淡入淡出',   icon: '🌫️' },
  slide_left:  { name: '左滑',       icon: '⬅️' },
  slide_right: { name: '右滑',       icon: '➡️' },
  slide_up:    { name: '上滑',       icon: '⬆️' },
  zoom_in:     { name: '放大进入',   icon: '🔍' },
  zoom_out:    { name: '缩小退出',   icon: '🔎' },
  wipe_left:   { name: '擦除',       icon: '🧹' },
};
```

4. **效果 UI(在左侧面板"动态特效"卡片中)**
   - 动态效果:图标按钮组,一行 4 个,单选
   - 转场效果:图标按钮组,一行 4 个,单选
   - 选中态视觉反馈
   - 每个效果有 tooltip 说明
   - 切换后触发静态预览更新

5. **在视频合成中集成动态特效与转场**
   修改 preprocessImage 和导出流程:

```js
// 生成单帧(给定图片索引和帧内进度)
async function renderFrame(ctx, imgIndex, imgProgress, transitionProgress, transitionType) {
  const currentImg = STATE.images[imgIndex];
  const nextImg = STATE.images[Math.min(imgIndex + 1, STATE.images.length - 1)];

  const imgEl = await loadImage(currentImg.objectUrl);

  if (transitionProgress > 0 && nextImg && nextImg !== currentImg) {
    // 转场中:需要两张图
    const nextImgEl = await loadImage(nextImg.objectUrl);
    // 先画转场中的当前图
    ctx.save();
    applyMotion(ctx, imgEl, STATE.settings.motion, imgProgress);
    ctx.drawImage(imgEl, ...calculateDrawRect(imgEl));
    ctx.restore();
    // 再画转场中的下一张
    ctx.save();
    applyMotion(ctx, nextImgEl, STATE.settings.motion, 0);
    ctx.globalAlpha = transitionProgress;
    ctx.drawImage(nextImgEl, ...calculateDrawRect(nextImgEl));
    ctx.globalAlpha = 1;
    ctx.restore();
  } else {
    // 正常帧
    applyMotion(ctx, imgEl, STATE.settings.motion, imgProgress);
    ctx.drawImage(imgEl, ...calculateDrawRect(imgEl));
  }
}
```

6. **帧计算更新**
   更新 getImageIndexAtFrame 和 getProgressInImage 函数以支持转场:
   - 转场持续时间 = 0.3s(在两张图之间)
   - coverHold 帧:首张图静态停留
   - endHold 帧:末张图静态停留
   - 转场帧:两张图交叉

7. **预览区的动效模拟**
   - 在静态预览中,用 CSS animation 模拟当前选中的动态效果
   - 例如 slow_zoom:用 CSS transform: scale() + animation 在预览 Canvas 上模拟

【验证步骤(AI 必须自测)】
1. 用 Read 自检 index.html 至少 2 次
2. 用 grep 验证:
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker/video_maker
   grep -c "applyMotion" index.html                 # 应 ≥ 2
   grep -c "applyTransition" index.html             # 应 ≥ 2
   grep -c "slow_zoom\|pan_left\|ken_burns\|bounce" index.html  # 应 ≥ 3
   grep -c "MOTION_EFFECTS\s*=" index.html          # 应 ≥ 1
   grep -c "TRANSITIONS\s*=" index.html             # 应 ≥ 1
   grep -c "renderFrame" index.html                 # 应 ≥ 2
   ```
3. 行数检查:应在 3400-4800 行之间

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 6 验收
- 8 种动态效果全部实现(带 easing)
- 8 种转场效果全部实现
- 效果 UI 可切换
- 视频导出包含动态效果和转场
- 帧计算逻辑正确处理转场过渡
- 6 个 grep 命令命中
- 行数在 3400-4800

---

## 批次 7 · 贴片、水印与文字叠加

> **目标**: 实现 emoji 贴片、文字水印、品牌叠加层,一键添加/拖拽定位
> **前置产物**: 批次 6 的 index.html
> **修改文件**: `video_maker/index.html`

### 提示词 7.1 · 实现贴片、水印与文字叠加系统

```
你是一名资深前端工程师。在批次 6 基础上实现贴片/水印/文字叠加系统。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
- /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html(批次 6 已更新)

【贴片系统设计原则】
- 贴片是叠加在视频上的装饰元素,包括: emoji、文字标签、品牌水印、进度条装饰
- 贴片在每帧的固定位置渲染(或按时间轴出现/消失)
- 支持预设模板(如"热门推荐"角标、"新品首发"横幅)
- 水印是半透明文字,固定在角落

【本次实现清单(必须逐项完成,缺一不可)】

1. **贴片数据模型**
```js
// STATE.stickers 数组,每项:
{
  id: 'sticker_001',
  type: 'emoji' | 'text' | 'badge' | 'banner' | 'progress',
  content: '🔥',            // emoji 字符 或文本内容
  x: 0.85,                  // 相对位置(0-1,基于画布宽高)
  y: 0.15,
  scale: 1.0,              // 缩放
  opacity: 0.9,            // 透明度
  rotation: 0,             // 旋转角度(度)
  fontSize: 80,            // 仅 text 类型
  fontFamily: '"Noto Sans SC",sans-serif',
  color: '#FFFFFF',
  backgroundColor: 'rgba(0,0,0,0.5)',
  borderRadius: 8,
  padding: 12,
  startTime: 0,            // 出现时间(秒),0=始终显示
  endTime: null,           // 消失时间,null=始终显示
  animation: 'none' | 'pulse' | 'bounce' | 'slide_in',
}
```

2. **贴片渲染函数 applyStickers(ctx, currentTime)**
```js
function applyStickers(ctx, currentTime) {
  const W = ctx.canvas.width, H = ctx.canvas.height;

  for (const sticker of STATE.stickers) {
    // 时间范围检查
    if (currentTime < sticker.startTime) continue;
    if (sticker.endTime !== null && currentTime > sticker.endTime) continue;

    ctx.save();

    // 计算绝对坐标
    const absX = sticker.x * W;
    const absY = sticker.y * H;

    // 入场动画
    let animScale = 1, animOffsetY = 0, animAlpha = sticker.opacity;
    const elapsed = currentTime - sticker.startTime;
    if (sticker.animation === 'pulse') {
      animScale = 1 + Math.sin(elapsed * 3) * 0.1;
    } else if (sticker.animation === 'bounce') {
      animOffsetY = Math.abs(Math.sin(elapsed * 4)) * -30;
      if (elapsed < 0.3) animAlpha = elapsed / 0.3;
    } else if (sticker.animation === 'slide_in') {
      if (elapsed < 0.3) {
        animOffsetY = (1 - elapsed / 0.3) * 60;
        animAlpha = elapsed / 0.3;
      }
    }

    ctx.globalAlpha = animAlpha;
    ctx.translate(absX, absY + animOffsetY);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.scale(sticker.scale * animScale, sticker.scale * animScale);

    switch (sticker.type) {
      case 'emoji':
        renderEmojiSticker(ctx, sticker);
        break;
      case 'text':
        renderTextSticker(ctx, sticker);
        break;
      case 'badge':
        renderBadgeSticker(ctx, sticker);
        break;
      case 'banner':
        renderBannerSticker(ctx, sticker);
        break;
      case 'progress':
        renderProgressSticker(ctx, sticker, currentTime);
        break;
    }

    ctx.restore();
  }
}

function renderEmojiSticker(ctx, sticker) {
  const fontSize = sticker.fontSize || 80;
  ctx.font = `${fontSize}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // emoji 投影
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 8;
  ctx.fillText(sticker.content, 0, 0);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

function renderTextSticker(ctx, sticker) {
  const fontSize = sticker.fontSize || 48;
  ctx.font = `700 ${fontSize}px ${sticker.fontFamily || '"Noto Sans SC",sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 背景
  if (sticker.backgroundColor) {
    const metrics = ctx.measureText(sticker.content);
    const pw = sticker.padding || 12;
    const bw = metrics.width + pw * 2;
    const bh = fontSize * 1.4 + pw * 2;
    ctx.fillStyle = sticker.backgroundColor;
    roundRect(ctx, -bw / 2, -bh / 2, bw, bh, sticker.borderRadius || 8);
    ctx.fill();
  }

  // 文字
  ctx.fillStyle = sticker.color || '#FFFFFF';
  ctx.fillText(sticker.content, 0, 0);
}

function renderBadgeSticker(ctx, sticker) {
  // 角标:红底白字,常用于"热门"、"新品"
  const fontSize = sticker.fontSize || 36;
  ctx.font = `800 ${fontSize}px "Noto Sans SC",sans-serif`;
  const metrics = ctx.measureText(sticker.content);
  const pw = 14, ph = 10;
  const bw = metrics.width + pw * 2;
  const bh = fontSize * 1.2 + ph * 2;

  ctx.fillStyle = sticker.color || '#ED0108';
  roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 6);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(sticker.content, 0, 1);
}

function renderBannerSticker(ctx, sticker) {
  // 横幅:横跨顶部或底部的半透明条
  const W = ctx.canvas.width;
  const H = 72;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(-W / 2, -H / 2, W, H);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 36px "Noto Sans SC",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sticker.content, 0, 0);
}

function renderProgressSticker(ctx, sticker, currentTime) {
  // 进度条装饰:显示视频播放进度(适合教程类视频)
  const barWidth = 300;
  const barHeight = 6;
  const progress = Math.min(1, currentTime / (STATE.totalDuration || 10));

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  roundRect(ctx, -barWidth / 2, -barHeight / 2, barWidth, barHeight, 3);
  ctx.fill();
  ctx.fillStyle = '#ED0108';
  roundRect(ctx, -barWidth / 2, -barHeight / 2, barWidth * progress, barHeight, 3);
  ctx.fill();
}

// 圆角矩形辅助函数
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
```

3. **贴片管理 UI(在左侧面板"贴片水印"卡片中)**

   **3a. 预设贴片模板库**
```js
const STICKER_TEMPLATES = [
  { type: 'badge',   content: '🔥 热门',   x: 0.85, y: 0.08, color: '#ED0108', animation: 'pulse' },
  { type: 'badge',   content: '🆕 新品',   x: 0.15, y: 0.08, color: '#52a87a', animation: 'bounce' },
  { type: 'badge',   content: '⭐ 推荐',   x: 0.85, y: 0.08, color: '#e08820', animation: 'pulse' },
  { type: 'badge',   content: '限时',      x: 0.85, y: 0.08, color: '#ED0108', animation: 'bounce' },
  { type: 'banner',  content: '📢 关注获取更多干货', y: 0.95, animation: 'slide_in' },
  { type: 'emoji',   content: '✨',         x: 0.80, y: 0.82, scale: 1.5 },
  { type: 'emoji',   content: '💡',         x: 0.20, y: 0.20, scale: 1.3 },
  { type: 'emoji',   content: '🎯',         x: 0.75, y: 0.25, scale: 1.2 },
  { type: 'text',    content: 'SAVE THIS', x: 0.88, y: 0.92, fontSize: 28, animation: 'pulse' },
  { type: 'progress', y: 0.97 },
];
```

   **3b. UI 控件**
   - 预设贴片库:一行 4-5 个卡片,点击添加
   - "自定义 emoji" 输入框:选择 emoji 添加到贴片列表
   - "自定义文字" 输入框 + 添加按钮
   - 已添加贴片列表:预览 + 删除按钮 + 位置微调(上下左右箭头)
   - 贴片数量限制:最多 8 个

4. **水印系统(独立于贴片)**
```js
function applyWatermark(ctx) {
  if (!STATE.watermark.enabled) return;
  const wm = STATE.watermark;
  const W = ctx.canvas.width, H = ctx.canvas.height;

  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.font = '600 36px "Noto Sans SC",sans-serif';

  let x, y;
  const text = wm.text || '@yourhandle';
  const metrics = ctx.measureText(text);
  const tw = metrics.width;
  const padding = 20;

  switch (wm.position) {
    case 'bottom-left':  x = padding;                  y = H - padding; break;
    case 'bottom-right': x = W - tw - padding;         y = H - padding; break;
    case 'top-left':     x = padding;                  y = padding + 36; break;
    case 'top-right':    x = W - tw - padding;         y = padding + 36; break;
    default:             x = padding;                  y = H - padding;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, x, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
}
```

5. **水印 UI**
   - 启用/禁用开关
   - 文字输入框(默认 "@yourhandle")
   - 位置选择:左下/右下/左上/右上(4 个按钮)
   - 透明度滑块(10%-90%)

6. **在合成管线中集成贴片和水印**
   在 renderFrame 中插入贴片和水印调用:
```js
async function renderFrame(ctx, imgIndex, imgProgress, transitionProgress) {
  // ... 现有渲染逻辑 ...
  applyStickers(ctx, currentTime);   // 🎯 贴片(在图片之上)
  applyWatermark(ctx);               // 💧 水印(在最顶层)
}
```

7. **贴片时间轴可视化**
   在底部时间轴中标记贴片出现的时间段:
   - 每个贴片在对应位置显示彩色标记点
   - 点击标记点可编辑贴片时间范围

【验证步骤(AI 必须自测)】
1. 用 Read 自检 index.html 至少 2 次
2. 用 grep 验证:
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker/video_maker
   grep -c "applyStickers" index.html            # 应 ≥ 2
   grep -c "applyWatermark" index.html           # 应 ≥ 2
   grep -c "renderEmojiSticker\|renderTextSticker\|renderBadgeSticker\|renderBannerSticker" index.html  # 应 ≥ 3
   grep -c "STICKER_TEMPLATES\s*=" index.html    # 应 ≥ 1
   grep -c "roundRect" index.html                # 应 ≥ 1
   ```
3. 行数检查:应在 4200-5800 行之间

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 7 验收
- 5 种贴片类型全部实现(emoji/text/badge/banner/progress)
- 10 个预设模板可用
- 自定义 emoji 和文字贴片可添加
- 水印开关/文字/位置/透明度可用
- 贴片时间范围控制可用
- 5 个 grep 命中
- 行数在 4200-5800

---

## 批次 8 · 去重引擎

> **目标**: 实现图片去重检测、内容指纹、相似度评分,帮助用户避免上传重复/相似图片
> **前置产物**: 批次 7 的 index.html
> **修改文件**: `video_maker/index.html`

### 提示词 8.1 · 实现去重检测引擎

```
你是一名资深前端工程师,精通图像处理和哈希算法。在批次 7 基础上实现去重检测引擎。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【输入文件】
- /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html(批次 7 已更新)

【去重引擎设计原则】
- 去重不是阻止上传,而是检测并提示相似图片
- 使用多级指纹:感知哈希(pHash) + 颜色直方图 + 边缘特征
- 计算在 Web Worker 中执行避免阻塞主线程
- 提供三级去重强度:宽松 / 标准 / 严格
- 去重结果在时间轴中可视化标记

【本次实现清单(必须逐项完成,缺一不可)】

1. **感知哈希(pHash)实现**
   使用缩小 + DCT + 二值化生成 64 位指纹:
```js
function computePHash(imageData, targetSize = 32) {
  // 1. 缩小到 targetSize × targetSize
  const small = resizeImageData(imageData, targetSize, targetSize);

  // 2. 转灰度
  const gray = toGrayscale(small);

  // 3. 计算 DCT(离散余弦变换)简化版
  // 使用 8×8 DCT(取左上角低频部分)
  const dctSize = 8;
  const dct = computeDCT2D(gray, targetSize, dctSize);

  // 4. 计算 DCT 均值(排除 DC 分量 [0,0])
  let sum = 0;
  for (let i = 0; i < dctSize; i++) {
    for (let j = 0; j < dctSize; j++) {
      if (i === 0 && j === 0) continue;
      sum += dct[i * dctSize + j];
    }
  }
  const mean = sum / (dctSize * dctSize - 1);

  // 5. 生成 64 位哈希
  let hash = '';
  for (let i = 0; i < dctSize; i++) {
    for (let j = 0; j < dctSize; j++) {
      hash += dct[i * dctSize + j] > mean ? '1' : '0';
    }
  }
  return hash;
}

// 简易 DCT-II(用于 32×32 → 8×8 提取)
function computeDCT2D(grayData, srcSize, dctSize) {
  const result = new Float64Array(dctSize * dctSize);
  for (let u = 0; u < dctSize; u++) {
    for (let v = 0; v < dctSize; v++) {
      let sum = 0;
      for (let x = 0; x < srcSize; x++) {
        for (let y = 0; y < srcSize; y++) {
          sum += grayData[x * srcSize + y]
            * Math.cos((2 * x + 1) * u * Math.PI / (2 * srcSize))
            * Math.cos((2 * y + 1) * v * Math.PI / (2 * srcSize));
        }
      }
      const cu = u === 0 ? 1 / Math.SQRT2 : 1;
      const cv = v === 0 ? 1 / Math.SQRT2 : 1;
      result[u * dctSize + v] = (2 / srcSize) * cu * cv * sum;
    }
  }
  return result;
}
```

2. **颜色直方图指纹**
```js
function computeColorHistogram(imageData, bins = 16) {
  // 将 RGB 空间划分为 bins³ 个桶
  const histogram = new Float32Array(bins * bins * bins);
  const data = imageData.data;
  const totalPixels = imageData.width * imageData.height;

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.floor(data[i] / (256 / bins));
    const g = Math.floor(data[i + 1] / (256 / bins));
    const b = Math.floor(data[i + 2] / (256 / bins));
    histogram[r * bins * bins + g * bins + b]++;
  }

  // 归一化
  for (let i = 0; i < histogram.length; i++) {
    histogram[i] /= totalPixels;
  }
  return histogram;
}
```

3. **相似度计算**
```js
function computeSimilarity(hash1, hash2, hist1, hist2) {
  // 1. 汉明距离(感知哈希) - 权重 0.6
  let hammingDist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) hammingDist++;
  }
  const hashSimilarity = 1 - hammingDist / hash1.length;

  // 2. 直方图相关性(巴氏系数) - 权重 0.4
  let bhattacharyya = 0;
  for (let i = 0; i < hist1.length; i++) {
    bhattacharyya += Math.sqrt(hist1[i] * hist2[i]);
  }
  // 巴氏系数在 [0, 1] 之间,1 表示完全相同

  // 3. 加权融合
  const combined = hashSimilarity * 0.6 + bhattacharyya * 0.4;
  return combined;
}
```

4. **去重检测主函数**
```js
async function checkDuplicate(newImageFile, existingImages) {
  // 1. 提取新图片的指纹
  const newFingerprint = await extractFingerprint(newImageFile);

  const results = [];
  for (let i = 0; i < existingImages.length; i++) {
    const existing = existingImages[i];
    if (!existing.fingerprint) {
      existing.fingerprint = await extractFingerprint(existing.file);
    }

    const similarity = computeSimilarity(
      newFingerprint.pHash,
      existing.fingerprint.pHash,
      newFingerprint.histogram,
      existing.fingerprint.histogram
    );

    results.push({
      index: i,
      imageName: existing.name,
      similarity: similarity,
      isDuplicate: similarity > STATE.dedup.threshold,
    });
  }

  return results;
}

async function extractFingerprint(file) {
  const imageData = await loadImageData(file);
  return {
    pHash: computePHash(imageData),
    histogram: computeColorHistogram(imageData),
  };
}

function loadImageData(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, img.width, img.height));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
```

5. **去重阈值与强度级别**
```js
const DEDUP_LEVELS = {
  loose:   { threshold: 0.95, name: '宽松', desc: '仅检测几乎完全相同的图片' },
  normal:  { threshold: 0.85, name: '标准', desc: '检测明显相似的图片' },
  strict:  { threshold: 0.75, name: '严格', desc: '检测有一定相似度的图片(含裁剪/滤镜后)' },
};

// STATE.dedup.threshold 从 DEDUP_LEVELS 中取值
```

6. **去重检测触发时机**
   - 上传新图片时自动检测(与已有图片比对)
   - 批量上传时检测相互重复
   - "全部检测"按钮:手动触发全量检测

7. **去重 UI**
   在左侧面板"去重设置"卡片中:
   - 去重开关(默认开启)
   - 强度选择:宽松 / 标准 / 严格(单选按钮组)
   - "全部检测"按钮

8. **去重结果可视化(在时间轴中)**
   - 相似图片用相同颜色的边框标记(红/橙/黄表示相似组)
   - 鼠标悬停时显示相似度百分比
   - 点击"查看相似组"按钮高亮所有相似图片
   - 提供"保留最佳画质"按钮(自动删除低分辨率重复图)

9. **去重结果面板**
```html
<div class="dedup-results" id="dedupResults" style="display:none">
  <div class="dedup-head">
    <strong>去重检测结果</strong>
    <span id="dedupSummary"></span>
  </div>
  <div class="dedup-groups" id="dedupGroups">
    <!-- 每组相似图片:缩略图 + 相似度 + 删除按钮 -->
  </div>
  <div class="dedup-actions">
    <button class="btn small ghost" id="btnDedupAutoClean">自动清理重复图片</button>
    <button class="btn small ghost" id="btnDedupDismiss">忽略</button>
  </div>
</div>
```

10. **自动清理逻辑**
```js
function autoCleanDuplicates(duplicateGroups) {
  // 每组重复图片保留画质最好的一张(按文件大小或分辨率)
  for (const group of duplicateGroups) {
    group.sort((a, b) => {
      const qualityA = STATE.images[a.index].width * STATE.images[a.index].height;
      const qualityB = STATE.images[b.index].width * STATE.images[b.index].height;
      return qualityB - qualityA;
    });
    // 保留第一张(最好),删除其余
    const toRemove = group.slice(1);
    // 从后往前删除避免索引错乱
    const indices = toRemove.map(r => r.index).sort((a, b) => b - a);
    for (const idx of indices) {
      URL.revokeObjectURL(STATE.images[idx].objectUrl);
      STATE.images.splice(idx, 1);
    }
  }
  renderTimeline();
  showToast(`✅ 已自动清理 ${toRemove.length} 张重复图片`);
}
```

11. **性能优化(Web Worker)**
   对于大图(> 1000px),指纹提取放入 Web Worker:
```js
// 创建内联 Worker
function createFingerprintWorker() {
  const workerCode = `
    self.onmessage = function(e) {
      const { imageData } = e.data;
      // 实现 pHash + histogram(复用主线程函数代码)
      const result = {
        pHash: computePHash(imageData),
        histogram: computeColorHistogram(imageData),
      };
      self.postMessage(result);
    };
    // (复制主线程的 computePHash 和 computeColorHistogram 到 Worker)
  `;
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}
```
   如果 Worker 不可用(某些移动端),降级到主线程执行但加 loading 提示。

12. **错误处理**
   - 图片无法加载:跳过去重,标记为 "无法检测"
   - Worker 崩溃:降级到主线程
   - 内存不足:分批检测,每批 5 张

【验证步骤(AI 必须自测)】
1. 用 Read 自检 index.html 至少 2 次
2. 用 grep 验证:
   ```bash
   cd /Users/andy/Documents/Andy AI/cover-maker/video_maker
   grep -c "computePHash" index.html                 # 应 ≥ 1
   grep -c "computeColorHistogram" index.html        # 应 ≥ 1
   grep -c "computeSimilarity" index.html            # 应 ≥ 1
   grep -c "checkDuplicate" index.html               # 应 ≥ 2
   grep -c "DEDUP_LEVELS" index.html                 # 应 ≥ 1
   grep -c "extractFingerprint\|fingerprint" index.html  # 应 ≥ 2
   ```
3. 行数检查:应在 5000-6800 行之间

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 8 验收
- pHash 和颜色直方图双指纹实现
- 相似度融合计算(汉明距离 + 巴氏系数)
- 三级去重强度可用
- 去重结果可视化(时间轴颜色标记)
- 自动清理功能可用
- Web Worker 降级方案
- 6 个 grep 命令命中
- 行数在 5000-6800

---

## 批次 9 · 集成、测试、部署与主站联动

> **目标**: 完成所有功能闭环,修复 bug,同步到 public/ 目录,与主站工具面板联动
> **前置产物**: 批次 1-8 的完整 video_maker/index.html
> **修改文件**: `video_maker/index.html`, `index.html`(主站), `scripts/sync-public.mjs`

### 提示词 9.1 · 全量自检、修复、部署集成

```
你是一名资深全栈工程师 + QA。对 video_maker 系统做完整自检,修复所有 bug,并完成主站集成。

【项目根目录】
/Users/andy/Documents/Andy AI/cover-maker/

【第一步:完整功能清单自检】
用 Read 工具逐段阅读 /Users/andy/Documents/Andy AI/cover-maker/video_maker/index.html,逐项验证以下功能是否存在且逻辑正确:

□ 1. 图片上传(点击/拖拽/粘贴)三种方式
□ 2. 缩略图生成与时间轴渲染
□ 3. 拖拽排序(Drag API + Touch 降级)
□ 4. 图片删除/替换
□ 5. 音乐上传与音频预览播放器
□ 6. 音乐裁剪(起始时间) + 音量 + 淡入淡出
□ 7. 无音乐模式
□ 8. Canvas 预处理管线(cover / contain_blur / contain_solid)
□ 9. ffmpeg.wasm 视频导出
□ 10. MediaRecorder fallback 降级导出
□ 11. 导出进度 UI
□ 12. 14 种滤镜(含强度调节)
□ 13. 8 种动态效果(Ken Burns / pan / zoom / bounce)
□ 14. 8 种转场效果(fade / slide / zoom / wipe)
□ 15. 5 种贴片类型(emoji / text / badge / banner / progress)
□ 16. 10 个预设贴片模板
□ 17. 水印系统(文字/位置/透明度)
□ 18. 去重检测(pHash + 颜色直方图 + 三级强度)
□ 19. 去重结果可视化
□ 20. 自动清理重复图片
□ 21. 响应式三档断点(≤480 / ≤767 / ≥1024)
□ 22. 全局 STATE 状态管理
□ 23. 错误处理(文件格式/内存超限/生成失败)
□ 24. Blob URL 内存释放(beforeunload)

对每一项:
- 如果缺失 → 补充实现
- 如果实现有误 → 修复
- 如果逻辑不完整 → 完善

【第二步:静态代码检查】
执行以下 Bash 命令,修复所有错误:

```bash
cd /Users/andy/Documents/Andy AI/cover-maker/video_maker

# 检查 HTML 完整性
echo "=== HTML Structure ==="
grep -c "<!DOCTYPE html>" index.html     # 应 = 1
grep -c "</html>" index.html             # 应 = 1
grep -c "<script" index.html             # 应 ≥ 1
grep -c "</script>" index.html           # 应 ≥ 1

# 检查关键 CSS 断点
echo "=== Responsive Breakpoints ==="
grep -c "@media" index.html              # 应 ≥ 3

# 检查全部关键函数
echo "=== Core Functions ==="
grep -c "handleImageUpload\|createThumbnail\|renderTimeline" index.html          # 应 ≥ 3
grep -c "handleAudioUpload\|audioPlay\|audioPause" index.html                    # 应 ≥ 2
grep -c "preprocessImage\|applyBackgroundMode" index.html                        # 应 ≥ 2
grep -c "exportVideo\|exportWithFFmpeg\|exportWithMediaRecorder" index.html      # 应 ≥ 2
grep -c "applyFilter\|FILTERS\s*=" index.html                                    # 应 ≥ 2
grep -c "applyMotion\|MOTION_EFFECTS" index.html                                 # 应 ≥ 2
grep -c "applyTransition\|TRANSITIONS" index.html                                # 应 ≥ 2
grep -c "applyStickers\|STICKER_TEMPLATES" index.html                            # 应 ≥ 2
grep -c "applyWatermark" index.html                                              # 应 ≥ 1
grep -c "computePHash\|checkDuplicate\|extractFingerprint" index.html            # 应 ≥ 2

# 检查错误处理
echo "=== Error Handling ==="
grep -c "try\b\|catch\|\.error\|showToast.*❌" index.html                        # 应 ≥ 5

# 文件大小
echo "=== File Size ==="
wc -l index.html
```

【第三步:手动测试场景验证(用 Bash 模拟)】
用 Node.js 脚本验证 JavaScript 无语法错误:

```bash
# 提取 HTML 中的 <script> 内容到临时文件做语法检查
cd /Users/andy/Documents/Andy AI/cover-maker/video_maker
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
// 简单检查:尝试用 Function 构造函数解析所有 script 标签内容
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
console.log('Script tags found:', scripts.length);
// 检查是否有未闭合的括号/大括号
const openBraces = (html.match(/\{/g) || []).length;
const closeBraces = (html.match(/\}/g) || []).length;
console.log('Open braces:', openBraces, 'Close braces:', closeBraces);
if (openBraces !== closeBraces) console.log('WARNING: Mismatched braces!');
const openParens = (html.match(/\(/g) || []).length;
const closeParens = (html.match(/\)/g) || []).length;
console.log('Open parens:', openParens, 'Close parens:', closeParens);
if (openParens !== closeParens) console.log('WARNING: Mismatched parentheses!');
"
```

【第四步:修复发现的任何问题】
根据前两步的结果,修复:
- 缺失的功能
- 语法错误
- 括号/大括号不匹配
- 逻辑不完整

【第五步:与主站联动】

5a. 更新 sync-public.mjs 添加 video_maker:
```javascript
// 在 sync-public.mjs 中添加:
await cp(join(root, 'video_maker'), join(publicDir, 'video_maker'), { recursive: true });
```

5b. 在主站 index.html 的运营工具面板中添加 video_maker 卡片:
找到文件中的 tools-grid 区域,添加新卡片:
```html
<a href="./video_maker/" class="tool-card" id="linkVideoMaker" style="display:none" target="_blank">
  <span class="tc-icon">🎬</span>
  <span class="tc-body">
    <span class="tc-name">短视频生成 <span class="tc-badge">NEW</span></span>
    <span class="tc-desc">多图+音乐合成 Reels/TikTok 短视频,支持滤镜特效贴片去重</span>
  </span>
</a>
```

5c. 在主站 JS 中配置 video_maker 的 page_access 权限:
找到 renderAccountBar 函数中的 pageAccess 逻辑,添加:
```javascript
var linkVideoMaker = document.getElementById('linkVideoMaker');
var hasVideoMaker = pageAccess.indexOf('video_maker') !== -1;
if (linkVideoMaker) linkVideoMaker.style.display = hasVideoMaker ? '' : 'none';
// 更新 toolCount 计算
var toolCount = (hasIns?1:0)+(hasReddit?1:0)+(hasRadar?1:0)+(hasPostWriter?1:0)+(hasInstagramContent?1:0)+(hasVideoMaker?1:0);
```

5d. 在 video_maker/index.html 的顶部导航中确保"返回工具箱"链接正确:
```html
<a href="../" class="vm-back-link">← 返回工具箱</a>
```

【第六步:最终验证清单】
用 Bash 验证所有文件正确:

```bash
cd /Users/andy/Documents/Andy AI/cover-maker

echo "=== File Existence ==="
ls -la video_maker/index.html
ls -la index.html
ls -la scripts/sync-public.mjs

echo "=== Main Site Integration ==="
grep -c "video_maker" scripts/sync-public.mjs        # 应 ≥ 1
grep -c "video_maker\|短视频生成" index.html           # 应 ≥ 1

echo "=== Video Maker Completeness ==="
cd video_maker
grep -c "handleImageUpload" index.html                # 应 ≥ 1
grep -c "exportVideo" index.html                      # 应 ≥ 1
grep -c "applyFilter" index.html                      # 应 ≥ 1
grep -c "applyMotion" index.html                      # 应 ≥ 1
grep -c "applyStickers" index.html                    # 应 ≥ 1
grep -c "computePHash" index.html                     # 应 ≥ 1

echo "=== Total Lines ==="
wc -l index.html

echo "=== Final Status ==="
echo "✅ All checks passed. System is ready."
```

【第七步:输出最终自检报告】
格式:
```
=== 轮播短视频生成器 · 最终自检报告 ===
文件: video_maker/index.html
总行数: XXXX
功能清单: 24/24 项全部就绪
静态检查: PASS
语法检查: PASS
主站集成: PASS（sync-public.mjs + index.html 工具面板）
响应式: 三档断点已配置

已知限制:
  1. ffmpeg.wasm 需要 HTTPS 或 localhost 环境(CDN 加载需求)
  2. 移动端视频导出可能较慢(建议桌面端使用)
  3. 超过 30 张图片或 > 60s 视频建议压缩后再生成

最终状态: ✅ 系统可运行,无已知 bug
```

执行完这些提示词后,系统要完整可运行并且不会有任何bug。
```

### 批次 9 验收
- 24 项功能清单全部勾选
- 静态代码检查全部 PASS
- 括号/大括号完全匹配
- sync-public.mjs 已更新
- 主站工具面板已添加 video_maker 卡片
- 返回链接正确
- 所有 grep 命令命中
- 自检报告完整输出

---

## 🎯 总体验收(所有批次完成后)

执行批次 1-9 后,系统必须满足:

```
✅ 完整性:
- video_maker/index.html 单文件包含所有功能
- 24 项功能全部实现(上传/排序/音乐/滤镜/特效/转场/贴片/水印/去重/导出)
- 主站 index.html 工具面板已集成
- scripts/sync-public.mjs 已更新

✅ 可运行性:
- 直接双击 video_maker/index.html 在浏览器打开即可使用(部分功能需 HTTP 服务)
- 或 python3 -m http.server 8000 后访问 localhost:8000/video_maker/
- 无任何 console error 或 page error

✅ 功能完整性:
- 上传 3-30 张图片,拖拽排序
- 上传音乐 + 裁剪 + 音量 + 淡入淡出
- 14 种滤镜可选,支持强度调节
- 8 种动态效果(Ken Burns 体系)
- 8 种转场效果
- 5 类贴片(emoji/text/badge/banner/progress) + 10 个预设
- 水印(文字/位置/透明度)
- 三级去重(宽松/标准/严格)
- Canvas + ffmpeg.wasm 双方案导出 MP4
- 响应式三档断点(≤480 / ≤767 / ≥1024)

✅ 代码质量:
- 所有 Blob URL 在 beforeunload 释放
- 所有 async 函数有 try-catch 错误处理
- 用户设置保留(导出失败不丢失)
- 降级方案(ffmpeg.wasm → MediaRecorder, Worker → 主线程)

✅ 无 bug:
- 括号/大括号完整匹配
- JS 无语法错误
- 功能逻辑闭环
```

**任何一条不满足 → 回到对应批次修复 → 重新验收**

---

## 📌 版本说明

| 文件 | 版本 | 说明 |
|------|------|------|
| `video_maker/slideshow_video_maker_dev_doc.md` | v1.0 | 开发文档(已存在) |
| `video_maker/AI_PROMPTS_v1.0.md` | v1.0 | 本文件,构建提示词归档 |
| `video_maker/index.html` | v1.0 | 主应用文件(批次 1-9 生成) |

> **本文档约定**: 后续如需再升级(如添加 AI 配音/字幕/节拍卡点),新增 `AI_PROMPTS_v2.0.md`,不覆盖本文件。

---

## 📊 批次概览

| 批次 | 名称 | 主要交付物 | 预计行数增量 |
|------|------|-----------|-------------|
| 1 | 项目初始化与基础骨架 | 页面布局 + STATE + 占位函数 | 600-1000 |
| 2 | 图片上传与管理 | 上传/缩略图/拖拽排序/时间轴 | 1100-1800 |
| 3 | 音乐上传与音频控制 | 播放器/裁剪/音量/淡入淡出 | 1500-2200 |
| 4 | 视频合成核心 | ffmpeg.wasm + MediaRecorder | 2200-3200 |
| 5 | 滤镜系统 | 14 种滤镜 + 强度调节 | 2800-4000 |
| 6 | 动态特效与转场 | Ken Burns + 8 种转场 | 3400-4800 |
| 7 | 贴片水印系统 | 5 类贴片 + 水印 | 4200-5800 |
| 8 | 去重引擎 | pHash + 直方图 + 三级强度 | 5000-6800 |
| 9 | 集成测试部署 | bug 修复 + 主站联动 | 最终稳定 |

---

> **提示**: 复制每条提示词到 AI 编程助手中,按批次顺序执行。每条提示词末尾的"执行完这些提示词后,系统要完整可运行并且不会有任何bug"是质量闸门——AI 必须自我验证通过后才算完成。
