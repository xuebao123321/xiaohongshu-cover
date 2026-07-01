# Changelog

本项目所有重要变更都记录于此。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## [v3.0] - 2026-06-30

### Added(新增)

#### 风格族
- 5 大真实风格族(从 192 张稿定模板蒸馏)
  - 🅰️ 手绘便签(`styleA_handDrawn`)
  - 🅱️ 拼贴 collage(`styleB_collage`)
  - 🅲 漫画 pop(`styleC_comicPop`)
  - 🅳 报纸大字(`styleD_newspaper`)
  - 🅴 极简大字(`styleE_minimal`)
- 每族 6 张配色变体,合计 **30 张** 封面
- `STYLE_GUIDE_v3.0.md`(1886 行,9 主章 + 10 附录)

#### 视觉特征库(`lib/features.js`,12 项)
- `drawHandDrawnCircle` 手绘圈
- `drawCloudHighlight` 云朵高光
- `drawNotebookPaper` 笔记本纸(横线/方格/空白)
- `drawHalftone` 半色调网点
- `drawSpeechBubble` 对话气泡
- `drawHighlighter` 荧光笔划线
- `drawTornNote` 撕纸便签
- `drawStamp` 印章
- `drawEmojiSticker` 表情贴纸
- `drawComicBurst` 漫画爆炸框
- `drawMarkerText` 马克笔字
- `drawStickerCharacter` 贴纸角色

#### 配色系统(`lib/colors.js`)
- 30 套配色(5 族 × 6 套)
- WCAG 对比度自动校正(`ensureContrast`)
- 42 个快速色卡(`QUICK_SWATCH`)
- 颜色工具:`hexToRgb`、`relativeLuminance`、`contrastRatio`、`withAlpha`、`pickBlock`

#### 字体(8 种)
- 黑体(Noto Sans SC)
- 宋体(Noto Serif SC)
- 马克笔(Permanent Marker)
- 卡通(ZCOOL QingKe HuangYou)
- 草书(Liu Jian Mao Cao)
- 小薇(ZCOOL XiaoWei)
- 手写(Ma Shan Zheng)
- 快乐(ZCOOL KuaiLe)

#### 交互细节
- 4 档字号自适应算法(≤4 / ≤9 / ≤15 / >15 字)
- 装饰位置防冲突(`allocDecorPositions`)
- 0.3s 渐隐换一换过渡(替代 v2 的 rotateY)
- 字体加载 10s 超时兜底
- Promise.all + requestAnimationFrame 批量渲染
- 移动端长按 0.5s 下载
- 键盘 Tab 顺序: textarea → 生成 → 换一换 → 字体 → 风格 → 卡片
- `Ctrl/Cmd + Enter` 直接触发生成
- 响应式三档断点(480 / 767 / 1024)
- 触摸目标 ≥ 44×44px(Apple HIG)

#### 工程化
- ES Module 架构(`./lib/features.js` + `./lib/colors.js`)
- 三层下载回退(canvas.toBlob → html2canvas → 文本提示)
- 渲染性能监控(单卡 > 80ms 警告)
- 错误占位渲染(单卡失败不影响其他)

### Changed(变更)
- **配色规则**: 从 v2 的"3 色严格"放宽到 v3 的"4-6 色分级"(主色 + 强调色)
- **装饰上限**: 从 v2 的 ≤ 2 个放宽到 v3 的 4-6 个(分区清晰后不再拥挤)
- **AI Prompt 方向**: 从 v2 的"editorial / poster design"改为 v3 的"Chinese KOL sticker"
- **Canvas 分辨率**: 从 v2 的 900×1200 改为 1242×1656(3:4,小红书官方推荐)
- **字体加载策略**: 从 v2 的阻塞等待改为 v3 的 10s 超时降级
- **代码组织**: 从 v2 的单文件内嵌改为 v3 的 ES Module 拆分

### Deprecated(废弃)
- v2 的 5 种风格(Notebook / iOS Notes / Halo / Quotes / Torn Paper)
  - 现已整合到 5 大风格族中:`index_v2_backup.html` 已归档
- v2 的 4 套配色 × 5 风格 = 20 张模式
- `STYLE_GUIDE.md`(v2 版)保留归档,不再更新

### Fixed(修复)
- **重复声明 renderCard**(批次 6 发现): 旧 stub 函数与新实现冲突,导致整页脚本不执行 → 删除 stub
- **file:// CORS**(批次 6 测试发现): ES Module 在 file:// 协议下被拦截 → 必须 HTTP 部署
- v2 的字体切换不会重渲染已生成卡片 → v3 在字体 tab 切换时强制重渲染
- v2 的换一换动画在低端设备卡顿 → v3 简化为 opacity 渐隐
- v2 移动端 hover 不工作导致无法下载 → v3 长按 0.5s 触发

---

## [v2.0] - 2026-06-25

### Added
- 5 种基础风格(Notebook / iOS Notes / Halo / Quotes / Torn Paper)
- 4 套配色 × 5 风格 = 20 张封面
- 5 种字体(衬线 / 黑体 / 草书 / 小薇 / 快乐)
- 字数自适应算法
- 单卡换一换 / 全部换一换
- 下载 PNG / 复制到剪贴板
- html2canvas 回退路径
- Google Fonts 国内镜像(fonts.font.im)

### Known Issues(已废弃,不再修复)
- 移动端无法下载(无 hover)
- 字体未加载完成时中文偶有乱码
- 装饰元素位置冲突

---

## [v1.0] - 2026-06-20

### Added
- 概念原型:Canvas 2 张测试卡(手绘便签 / 极简大字)
- 静态 HTML,无交互
- 仅作为视觉验证,不发布

---

## 升级路径

| 当前版本 | 升级到 v3.0 |
|---|---|
| v1.0 | 不支持直接升级,建议重写 |
| v2.0 | 阅读 [DEPLOY.md](./DEPLOY.md) 新部署,旧的 `index_v2_backup.html` 保留对照 |
| v3.0.x | patch 版本可直接覆盖 `index.html`,minor 版本建议备份 |

## 版本规范

- **Major**(v3.0 → v4.0): 架构级变化、风格族重构
- **Minor**(v3.0 → v3.1): 新功能(自定义图片、历史记录)
- **Patch**(v3.0.0 → v3.0.1): bug 修复、性能优化

详细变更日志参见 GitHub Releases。