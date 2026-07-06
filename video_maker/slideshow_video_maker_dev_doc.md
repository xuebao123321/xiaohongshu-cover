# 轮播短视频生成器开发文档

## 1. 项目背景

现有网站正在逐步扩展为一个海外内容运营工具箱，已包含或规划包含：

```text
小红书封面生成器
Instagram 内容策划助手
Instagram Carousel 图片生成器
Reddit Radar 线索雷达
Reddit 评论回复助手
```

本项目新增一个工具：

```text
轮播短视频生成器
Image-to-Reels Video Maker
```

它的目标是把多张图片自动合成为适合 Instagram Reels、TikTok、YouTube Shorts 等平台发布的竖屏轮播短视频。

核心场景：

```text
上传 N 张图片
→ 设置每张图展示时长
→ 设置转场和动态效果
→ 上传或选择音乐
→ 自动合成 9:16 短视频
→ 下载 MP4
```

本工具特别适合和 Instagram Carousel 图片生成器联动：

```text
Instagram Content Assistant 生成文案
→ Instagram Carousel Generator 生成 7 张图
→ Slideshow Video Maker 把 7 张图变成 Reels / TikTok 视频
```

## 2. 页面路径

建议路径：

```text
/slideshow-video-maker/
```

中文名：

```text
轮播短视频生成器
```

英文名：

```text
Slideshow Video Maker
```

一句话定位：

```text
把多张运营图片和音乐自动合成为适合 Instagram Reels / TikTok 的竖屏轮播短视频。
```

## 3. 是否消耗 API Token

MVP 不消耗 DeepSeek 或其他大模型 API token。

原因：

```text
图片 + 音乐 → 视频
属于视频合成任务，不属于 AI 文本生成任务。
```

MVP 消耗的是：

```text
浏览器本地 CPU
浏览器内存
用户设备性能
```

只有以下高级功能才可能消耗 API token：

```text
自动根据图片生成字幕
自动生成视频脚本
自动匹配音乐情绪
自动生成 AI 配音
自动生成 AI 图片
自动分析图片内容并排序
```

MVP 不做这些 AI 功能。

## 4. 产品边界

### 4.1 MVP 负责

```text
上传多张图片
上传音乐
拖拽排序
设置视频尺寸
设置每张图展示时长
设置转场
设置轻微动态效果
设置音乐起点
设置音量
设置音频淡入淡出
添加账号水印
添加封面停留
添加结尾 CTA 停留
浏览器本地导出 MP4
```

### 4.2 MVP 不负责

```text
AI 自动生成视频脚本
AI 自动生成配音
AI 数字人
自动发布到 Instagram / TikTok
平台音乐库调用
云端存储用户素材
长视频批量渲染
多人协作
```

### 4.3 后续可扩展

```text
节拍卡点
后端 FFmpeg 稳定渲染
Remotion 模板视频
字幕自动生成
TTS 配音
批量生成
真人素材半自动合成
```

## 5. 推荐技术路线

### 5.1 第一阶段：浏览器本地生成

推荐第一版采用浏览器本地合成。

技术：

```text
前端：静态 HTML / CSS / JS
视频合成：ffmpeg.wasm
图片预览：Canvas
文件处理：File API / Blob URL
部署：GitHub Pages
```

优点：

```text
不需要服务器
不需要 API token
不上传用户素材
部署简单
和现有 GitHub Pages 网站兼容
```

缺点：

```text
首次加载 ffmpeg.wasm 较大
手机端性能有限
视频太长或图片太多会慢
Safari 兼容性需要测试
```

### 5.2 第二阶段：后端生成

如果后续需要更稳定或批量生成，再升级到后端。

技术：

```text
前端：GitHub Pages
后端：Railway / Render / Fly.io / VPS
视频合成：FFmpeg
任务队列：简单 Job Queue
临时存储：本地临时目录 / Cloudflare R2 / S3
输出：MP4 下载链接
```

不建议用 Cloudflare Workers 直接做视频合成，因为 Workers 不适合长时间 FFmpeg 重计算任务。

## 6. 推荐输出规格

MVP 默认输出：

```text
尺寸：1080 × 1920
比例：9:16
格式：MP4
视频编码：H.264
音频编码：AAC
帧率：30fps
颜色空间：sRGB
```

平台：

```text
Instagram Reels
TikTok
YouTube Shorts
```

后续可增加：

```text
Instagram Square：1080 × 1080
Instagram Feed Portrait：1080 × 1350
TikTok / Reels Safe Zone Preview
```

## 7. MVP 限制建议

为了保证浏览器本地版稳定，第一版建议限制：

```text
图片数量：3-20 张
单张图片大小：建议小于 5MB
总素材大小：建议小于 100MB
音乐格式：MP3 / WAV / M4A
视频最长：60 秒
默认每图时长：2 秒
默认转场：fade
默认动态：slow_zoom
```

超过限制时前端提示：

```text
素材较大，浏览器本地生成可能较慢。建议压缩图片或减少图片数量。
```

## 8. 页面信息架构

页面采用工具型布局。

```text
┌──────────────────────────────────────────────┐
│ 顶部导航 / 轮播短视频生成器                   │
├───────────────────────┬──────────────────────┤
│ 左侧素材与设置区       │ 右侧手机预览区         │
│                       │                      │
│ 上传图片               │ 9:16 视频预览          │
│ 拖拽排序               │ 播放 / 暂停            │
│ 上传音乐               │ 当前时长               │
│ 平台尺寸               │ 导出进度               │
│ 每图时长               │ 下载 MP4               │
│ 转场                   │                      │
│ 动态效果               │                      │
│ 音乐裁剪               │                      │
│ 水印 / 账号名           │                      │
├───────────────────────┴──────────────────────┤
│ 底部时间轴：图片顺序、时长、删除、替换          │
└──────────────────────────────────────────────┘
```

## 9. UI 功能清单

### 9.1 上传图片

功能：

```text
支持批量上传
支持 PNG / JPG / WebP
显示缩略图
支持拖拽排序
支持删除单张
支持替换单张
显示图片尺寸
显示图片文件大小
```

### 9.2 上传音乐

功能：

```text
支持 MP3 / WAV / M4A
显示音乐文件名
显示音频时长
可选择音乐起始秒数
可设置音量
可设置淡入淡出
可选择无音乐导出
```

### 9.3 视频设置

字段：

```text
平台：Instagram Reels / TikTok / YouTube Shorts
尺寸：1080×1920
每张图片时长：1s / 1.5s / 2s / 2.5s / 3s / 自定义
封面停留：0s / 1s / 2s
结尾停留：0s / 1s / 2s
转场：none / fade / slide / zoom
动态效果：none / slow_zoom / pan_left / pan_right / pan_up
背景填充：cover / contain_blur / contain_solid
水印：关闭 / 开启
账号名：@yourhandle
```

### 9.4 预览

MVP 预览可以先用 Canvas 或 CSS 模拟，不必实时渲染完整 MP4。

功能：

```text
显示 9:16 手机框
播放图片顺序预览
预览转场和动态效果
显示预计总时长
显示安全区
```

### 9.5 导出

功能：

```text
生成 MP4
显示进度
生成完成后下载
生成失败时保留用户设置
允许重新生成
```

导出文件名：

```text
slideshow-video-YYYYMMDD-HHmm.mp4
```

## 10. 和现有工具的打通

### 10.1 从 Instagram Carousel 图片生成器进入

在 Instagram Carousel 图片生成器中增加按钮：

```text
生成轮播视频
```

点击后写入：

```js
localStorage.setItem("slideshow_video_prefill", JSON.stringify({
  images: generatedCarouselImages,
  platform: "reels",
  size: "1080x1920",
  secondsPerImage: 2.5,
  transition: "fade",
  motion: "slow_zoom",
  watermark: "@yourhandle"
}));

window.location.href = "../slideshow-video-maker/";
```

### 10.2 Slideshow 页面读取

页面加载时：

```js
const prefillRaw = localStorage.getItem("slideshow_video_prefill");
if (prefillRaw) {
  const prefill = JSON.parse(prefillRaw);
  // 将图片和默认设置载入页面
  localStorage.removeItem("slideshow_video_prefill");
}
```

注意：

```text
如果 Carousel 生成器里的图片是 Blob URL，需要确认跳转后仍可访问。
更稳方案是把图片转成 dataURL 或保存到 IndexedDB。
```

推荐：

```text
MVP：使用 dataURL 传递少量图片
增强版：使用 IndexedDB 存储图片 Blob
```

## 11. 数据结构

### 11.1 Project 配置

```json
{
  "id": "slideshow_001",
  "platform": "reels",
  "size": {
    "width": 1080,
    "height": 1920
  },
  "fps": 30,
  "secondsPerImage": 2.5,
  "coverHold": 1,
  "endHold": 1,
  "transition": "fade",
  "motion": "slow_zoom",
  "backgroundMode": "cover",
  "watermark": {
    "enabled": true,
    "text": "@yourhandle",
    "position": "bottom-right"
  },
  "audio": {
    "enabled": true,
    "startAt": 0,
    "volume": 0.8,
    "fadeIn": 1,
    "fadeOut": 2
  }
}
```

### 11.2 Image Item

```json
{
  "id": "img_001",
  "name": "slide-01.png",
  "type": "image/png",
  "width": 1080,
  "height": 1350,
  "size": 245000,
  "duration": 2.5,
  "objectUrl": "blob:...",
  "dataUrl": "data:image/png;base64,..."
}
```

### 11.3 Export Result

```json
{
  "fileName": "slideshow-video-20260706-1530.mp4",
  "duration": 22.5,
  "size": 12000000,
  "format": "mp4",
  "videoCodec": "h264",
  "audioCodec": "aac"
}
```

## 12. 视频合成逻辑

### 12.1 基础流程

```text
1. 读取图片文件
2. 统一处理为 1080×1920 画布
3. 每张图片生成一段视频片段
4. 对片段添加动态效果
5. 对片段之间添加转场
6. 合并所有片段
7. 裁剪音乐到视频长度
8. 添加音乐淡入淡出
9. 混合音频和视频
10. 输出 MP4
```

### 12.2 背景填充模式

#### cover

```text
图片铺满 1080×1920，多余部分裁切。
适合已经是竖屏图。
```

#### contain_blur

```text
图片完整显示，不裁切。
背景使用同图放大模糊填充。
适合 1080×1350 Carousel 图片。
```

#### contain_solid

```text
图片完整显示，不裁切。
背景使用纯色填充。
适合文字类图片。
```

默认建议：

```text
contain_blur
```

因为 Instagram Carousel 图片通常是 1080×1350，直接 cover 到 1080×1920 会裁切文字。

### 12.3 动态效果

#### none

```text
静态图片停留。
```

#### slow_zoom

```text
每张图轻微放大 100% → 106%。
```

#### pan_left / pan_right

```text
图片轻微横向移动。
```

#### pan_up

```text
图片轻微向上移动，适合长图。
```

### 12.4 转场

MVP 支持：

```text
none
fade
```

P1 可加：

```text
slide
zoom
wipe
```

## 13. ffmpeg.wasm 实现建议

### 13.1 依赖

可选：

```text
@ffmpeg/ffmpeg
@ffmpeg/util
```

注意：

```text
ffmpeg.wasm 包体积较大，建议懒加载。
用户点击“生成视频”时再加载。
```

### 13.2 前端处理策略

建议：

```text
先用 Canvas 把每张图片预处理为统一尺寸 PNG
再交给 ffmpeg.wasm 合成
```

这样可以减少 FFmpeg filter_complex 的复杂度。

Canvas 预处理：

```text
输入任意比例图片
输出 1080×1920 PNG
应用 backgroundMode
应用水印
应用安全区辅助元素
```

### 13.3 简化合成策略

MVP 可先不做复杂 filter 运动，而是：

```text
Canvas 生成每张标准图
FFmpeg 将图片序列按时长合成视频
加入音乐
导出 MP4
```

P1 再加：

```text
zoompan
xfade
audio fade
```

## 14. 预览实现建议

不要为了预览就实时生成 MP4。

MVP 预览：

```text
用 CSS/Canvas 按时间切换图片
模拟 fade 转场
模拟 slow_zoom
播放上传的 audio
```

预览和最终导出可能略有差异，但可以接受。

## 15. 安全区设计

Instagram / TikTok 会在视频上覆盖界面元素。

建议预览中显示安全区提示：

```text
顶部标题安全区
右侧按钮安全区
底部 caption / profile 安全区
```

默认不要把水印放在右侧中下方，避免被 TikTok 按钮区遮挡。

推荐水印位置：

```text
bottom-left
top-left
```

不推荐：

```text
bottom-right
right-center
```

## 16. 音乐版权提示

页面需要提示：

```text
请确认你拥有上传音乐的使用权，或在发布时使用 Instagram / TikTok 平台内置音乐。
```

提供两个模式：

```text
带音乐导出
无音乐导出，发布时在平台内配乐
```

默认建议：

```text
无音乐导出
```

运营使用时，如果是内部授权音乐或免版权音乐，再选择带音乐导出。

## 17. 页面文案建议

标题：

```text
轮播短视频生成器
```

副标题：

```text
把多张图片快速合成为适合 Reels / TikTok 的竖屏短视频。
```

按钮：

```text
上传图片
上传音乐
生成预览
导出 MP4
重新生成
下载视频
```

提示：

```text
本工具在浏览器本地处理素材，不消耗 AI API token。
```

大文件提示：

```text
素材较大时生成可能较慢，请保持页面打开。
```

## 18. 推荐文件结构

```text
/slideshow-video-maker/
  index.html
  slideshow-video-maker.css
  slideshow-video-maker.js

/assets/
  video-templates/
    default.json
    academic-paper.json
    checklist.json

/shared/
  storage.js
  file-utils.js
  media-utils.js
```

如果现有站点是单文件部署，也可以把 CSS/JS 内联到 `index.html`，但长期建议拆分。

## 19. 开发优先级

### P0：最小可用版

```text
上传 3-20 张图片
显示缩略图
拖拽排序
固定输出 1080×1920
固定每张图 2 秒
上传音乐或无音乐
浏览器本地导出 MP4
下载视频
```

### P1：运营可用版

```text
每图时长设置
fade 转场
slow_zoom 动态
contain_blur 背景
音乐裁剪
音量控制
音频淡入淡出
账号水印
封面停留
结尾 CTA 停留
安全区预览
```

### P2：和现有工具深度联动

```text
从 Instagram Carousel 图片生成器导入图片
从本地历史项目恢复
保存项目配置
导出项目 JSON
导入项目 JSON
批量生成不同音乐版本
```

### P3：高级视频功能

```text
节拍卡点
字幕层
标题层
模板库
多平台尺寸
封面图导出
```

### P4：后端稳定版

```text
后端 FFmpeg
任务队列
云端临时文件
渲染进度
下载链接
批量渲染
多人协作
```

## 20. 后端升级方案

当浏览器本地版遇到以下问题时，考虑升级后端：

```text
用户设备性能不足
视频生成太慢
图片数量超过 20 张
需要批量生成
需要稳定导出长视频
需要多人协作
```

后端接口：

```text
POST /api/slideshow-video/jobs
GET /api/slideshow-video/jobs/:id
GET /api/slideshow-video/jobs/:id/download
```

后端流程：

```text
上传素材
创建任务
FFmpeg 渲染
返回进度
生成下载链接
定时清理临时文件
```

临时文件清理：

```text
生成后 24 小时自动删除
```

## 21. 后期 AI 增强功能

这些不是 MVP。

可选：

```text
自动根据图片内容生成字幕
自动生成视频标题
自动推荐音乐节奏
自动生成口播稿
自动生成 TTS 配音
自动选择图片顺序
```

这些功能需要接入 DeepSeek 或其他 API，会消耗 token。

## 22. 错误处理

### 22.1 图片错误

提示：

```text
部分图片无法读取，请更换文件格式。
```

### 22.2 音频错误

提示：

```text
音乐文件无法解析，请使用 MP3 / WAV / M4A。
```

### 22.3 生成失败

提示：

```text
视频生成失败，请减少图片数量或压缩图片后重试。
```

保留：

```text
用户上传的图片
用户设置
排序结果
```

### 22.4 内存不足

提示：

```text
当前设备内存不足，建议减少图片数量或改用桌面浏览器。
```

## 23. 性能优化

建议：

```text
图片上传后生成缩略图
导出前再处理原图
ffmpeg.wasm 懒加载
大图先用 Canvas 压缩
释放不用的 Blob URL
导出完成后允许清理缓存
```

图片预处理：

```text
将所有图片统一转换为 1080×1920
压缩为合理质量
减少 FFmpeg 处理压力
```

## 24. 兼容性建议

优先支持：

```text
Chrome desktop
Edge desktop
Chrome Android
```

谨慎支持：

```text
Safari
iPhone Safari
```

原因：

```text
ffmpeg.wasm 在移动端和 Safari 上可能存在性能或内存限制。
```

页面提示：

```text
建议使用 Chrome 或 Edge 桌面浏览器生成视频。
```

## 25. 验收标准

### 25.1 功能验收

```text
能上传 3-20 张图片
能拖拽排序
能上传音乐
能选择无音乐导出
能生成 1080×1920 MP4
能下载视频
能从 Carousel 图片生成器导入图片
```

### 25.2 视觉验收

```text
预览为 9:16 手机框
图片不被严重裁切
文字类图片默认完整显示
水印不进入右侧按钮遮挡区
安全区提示清晰
```

### 25.3 视频验收

```text
导出视频可在本地正常播放
导出视频有正确比例
导出视频无黑屏
导出视频音画同步
音乐正常播放
无音乐模式视频正常导出
```

### 25.4 性能验收

```text
10 张 1080×1350 图片生成 20-30 秒视频可在桌面 Chrome 完成
生成过程中有进度提示
生成失败不丢失用户素材和设置
```

## 26. MVP 推荐实现范围

第一版建议只做：

```text
图片上传
图片排序
固定 1080×1920
contain_blur 背景
每图统一时长
上传音乐 / 无音乐
导出 MP4
下载
从 Carousel 生成器导入图片
```

暂不做：

```text
复杂转场
节拍卡点
字幕
TTS
AI 分析
后端渲染
自动发布
```

## 27. 最终判断

这个工具可以实现，并且非常适合嵌入现有网站。

推荐第一版采用：

```text
GitHub Pages 静态页面
浏览器本地 ffmpeg.wasm 合成
不接 DeepSeek API
不消耗 API token
localStorage / IndexedDB 接入 Carousel 图片生成器
```

后续升级路线：

```text
P0 本地合成可用
P1 增加转场和水印
P2 深度联动现有 Carousel 工具
P3 增加字幕和模板
P4 后端 FFmpeg 稳定渲染
P5 AI 配文 / 配音 / 卡点
```

最重要的开发原则：

```text
先把“多图 + 音乐 → 9:16 MP4”跑通。
不要第一版就做 AI、TTS、复杂节拍和云端渲染。
```
