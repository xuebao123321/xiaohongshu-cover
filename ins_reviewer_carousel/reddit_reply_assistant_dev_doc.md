# Reddit 评论回复助手开发文档

## 1. 项目背景

本项目是在现有运营工具网站中新增一个二级页面，用于辅助运营人员根据 Reddit 评论或帖子内容，快速生成专业、自然、低营销感的英文回复草稿。

目标业务是 AI 论文辅导、SCI/CCF 论文写作辅导、英文论文润色、审稿意见回复辅导、投稿策略辅导等合规服务。

该工具的核心目标不是自动发评论，而是帮助运营人员：

- 更快理解 Reddit 用户的问题
- 生成符合社区语气的专业回答
- 在不冒犯社区的前提下建立专业信任
- 适度引导用户主动私信或进一步咨询
- 沉淀 Reddit 运营话术和内容素材

## 2. 产品定位

页面名称建议：

```text
Reddit 评论回复助手
```

英文名称：

```text
Reddit Reply Assistant
```

建议页面路径：

```text
/reddit-reply-assistant/
```

一句话定位：

```text
一个面向学术服务机构的 Reddit 评论草稿生成器，把用户问题转成有帮助、像真人、带轻量转化钩子的专业回复。
```

重要边界：

```text
这是“回复草稿生成器”，不是“Reddit 自动评论器”。
```

工具只负责生成草稿、提示风险、辅助人工编辑，不做自动发帖、自动评论、自动私信、批量刷评、多账号轮换等功能。

## 3. 使用场景

运营人员在 Reddit 中看到以下类型的问题时，可以复制评论或帖子内容到工具中：

```text
How do I respond to harsh reviewers?
My advisor says my writing is unclear
Paper rejected for lack of novelty
English editing service recommendations
How to choose a journal
Revise and resubmit anxiety
AI polishing made my paper sound generic
I don't know how to structure my Introduction
```

工具生成适合评论区发布的英文回复草稿，运营人员人工检查后复制到 Reddit。

## 4. 核心原则

### 4.1 先帮助，再转化

Reddit 用户反感硬广。回复必须先解决问题，不能一上来介绍服务。

推荐结构：

```text
1. 先共情一句
2. 判断问题本质
3. 给一个具体框架
4. 给一个示例句
5. 根据情况加入轻量钩子
```

### 4.2 小钩子要有，但不能每条都硬塞

最终业务目标是引导用户主动私信或找机构辅导，因此回复中可以保留“小钩子”。

但钩子必须根据上下文决定是否出现，以及出现多强。

建议分为 4 个 CTA 强度：

```text
None：不放 CTA，只提供帮助
Soft：轻钩子，例如 happy to share a checklist if useful
Medium：引导评论或私信关键词，例如 feel free to DM "reviewer" if you want the checklist
Direct：明确邀请咨询，例如 if you want, I can take a quick look at the reviewer comment
```

默认使用：

```text
Soft
```

只有当用户明确在找资源、服务、模板、编辑建议时，才建议使用 Medium。

Direct 只适合非常明确的高意向问题，例如：

```text
Can anyone recommend an academic editing service?
I need someone to help me respond to reviewers.
Is there a writing coach for PhD students?
```

### 4.3 回复要像 Reddit 用户，不像品牌客服

避免：

```text
As a professional academic writing service...
We offer manuscript editing...
Contact us for guaranteed publication...
DM me for paid help...
```

推荐：

```text
I’d start by diagnosing what the reviewer is actually questioning.
A useful way to think about this is...
One sentence pattern that often works is...
Happy to share a checklist if useful.
```

## 5. 页面信息架构

页面采用运营工具式布局。

```text
┌────────────────────────────────────────────────────┐
│ 顶部导航 / Reddit 评论回复助手                      │
├───────────────────────┬────────────────────────────┤
│ 左侧输入与设置区       │ 右侧输出与编辑区             │
│                       │                            │
│ Reddit 原评论          │ 回复版本 tabs                │
│ 帖子标题               │ Short / Helpful / Deep       │
│ Subreddit              │                            │
│ 问题类型               │ 生成的回复草稿                │
│ 用户身份               │                            │
│ 学科领域               │ 风险检测结果                  │
│ 回复目标               │                            │
│ 语气                   │ CTA 建议                     │
│ CTA 强度               │                            │
│ 生成按钮               │ 复制按钮 / 保存模板            │
├───────────────────────┴────────────────────────────┤
│ 底部：常用模板 / CTA 库 / 风险词库 / 历史记录         │
└────────────────────────────────────────────────────┘
```

## 6. 用户流程

```text
复制 Reddit 评论或帖子
→ 粘贴到工具
→ 选择 subreddit、问题类型、语气、CTA 强度
→ 点击生成回复
→ 查看 Short / Helpful / Deep 三个版本
→ 检查风险提示
→ 人工微调
→ 复制到 Reddit 手动发布
```

## 7. 输入字段

### 7.1 必填字段

```text
Reddit 原评论或帖子内容
```

### 7.2 推荐字段

```text
帖子标题
Subreddit
问题类型
回复语气
CTA 强度
```

### 7.3 可选字段

```text
用户身份：Master / PhD / Postdoc / Faculty / Unknown
学科领域：CS / Medical / Engineering / Social Science / Business / General
回复目标：帮忙 / 建立专业度 / 引导私信 / 收集痛点
是否包含示例句：是 / 否
是否包含 checklist：是 / 否
是否允许提到“我有相关经验”：是 / 否
```

## 8. 问题类型

MVP 建议内置 8 类问题。

```text
1. Harsh reviewer response
2. Advisor says writing is unclear
3. Rejected for lack of novelty
4. English editing recommendation
5. Journal selection
6. Revise and resubmit anxiety
7. AI writing / AI polishing concern
8. Dissertation / thesis structure confusion
```

每个问题类型都应对应一套回复逻辑。

## 9. 回复输出版本

工具每次建议生成 3 个版本。

### 9.1 Short

适合快速评论。

长度：

```text
80-120 words
```

特点：

- 简短
- 不展开太多
- 通常不放强 CTA
- 适合低意向评论

### 9.2 Helpful

默认推荐版本。

长度：

```text
150-220 words
```

特点：

- 有共情
- 有判断
- 有框架
- 有一个例子
- 可放 Soft CTA

### 9.3 Deep

适合高价值问题。

长度：

```text
250-400 words
```

特点：

- 回答更完整
- 适合专业 subreddit
- 可以展示更强的专业度
- 根据上下文决定是否放 Medium CTA

## 10. 回复生成结构

后台生成逻辑可以是结构化的，但前台输出必须是自然段落，不能机械显示 1、2、3、4、5。

内部结构：

```text
1. Empathy：共情
2. Diagnosis：判断问题本质
3. Framework：给出分析框架
4. Example：给一个具体句子或回复方式
5. Action：告诉用户下一步怎么做
6. CTA：根据场景加入轻量钩子
```

示例输入：

```text
My paper was rejected because the reviewer said it lacks novelty. I don't know how to fix that.
```

示例输出：

```text
That’s a really common but frustrating reviewer comment, because “lack of novelty” often sounds vague.

I wouldn’t start by just adding sentences like “this study is novel.” Usually the issue is that the paper hasn’t positioned itself clearly enough against prior work.

A useful way to diagnose it is: what have previous studies already done, what specific gap remains, and what does your study add that changes or extends that work?

For example, instead of writing “This study is novel and important,” you could write something more specific, like: “Unlike prior studies that focus on X, this study examines Y under Z conditions.”

Then in the response letter, mention exactly where you revised the manuscript, such as the final paragraph of the Introduction.

Happy to share a reviewer-response checklist if useful.
```

## 11. CTA 钩子策略

### 11.1 CTA 目标

CTA 的目的不是直接卖课，而是让用户主动产生下一步动作：

```text
主动回复评论
主动私信
索要 checklist
索要 template
询问是否能帮看审稿意见
预约论文诊断
```

### 11.2 CTA 强度规则

#### None

使用场景：

- 严肃学术讨论
- 社区规则非常严格
- 用户只是表达情绪，没有求资源
- 账号近期已经多次留下 CTA

示例：

```text
Hope that helps.
```

#### Soft

使用场景：

- 默认选项
- 用户有明确问题，但没有直接找服务
- 想建立专业度，不想太营销

示例：

```text
Happy to share a reviewer-response checklist if useful.
```

```text
I can share the structure I use for response letters if that helps.
```

```text
I have a short checklist for this kind of revision if you want it.
```

#### Medium

使用场景：

- 用户明确想要模板、服务、推荐、资料
- 问题和机构服务高度匹配
- Subreddit 对资源分享相对宽松

示例：

```text
Feel free to DM me “REVIEWER” and I can send the checklist.
```

```text
If you want, DM me the reviewer comment and I can suggest how I’d classify it.
```

```text
I’m happy to share a response-letter template by DM.
```

#### Direct

使用场景：

- 用户明确在找学术写作辅导、论文编辑、审稿回复帮助
- 不能用于普通讨论帖
- 频率必须低

示例：

```text
If you want another pair of eyes on the reviewer comments, feel free to DM me.
```

```text
I work with ESL researchers on manuscript revision and reviewer responses. Happy to point you in the right direction if useful.
```

### 11.3 CTA 频率建议

工具可以给出运营提醒：

```text
同一账号最近 10 条评论中，带 CTA 的评论建议不超过 2-3 条。
```

这是运营建议，不需要 MVP 中强制实现。

### 11.4 CTA 风险等级

低风险：

```text
Happy to share a checklist if useful.
```

中风险：

```text
Feel free to DM me for the template.
```

高风险：

```text
DM me for paid manuscript editing.
```

禁止：

```text
We guarantee acceptance.
We can write the paper for you.
We can publish it for you.
```

## 12. 模板逻辑

### 12.1 Harsh Reviewer Response

适用输入：

```text
Reviewer was harsh
Reviewer was rude
How do I respond to aggressive comments?
```

回复逻辑：

```text
共情：harsh comments feel personal
诊断：separate tone from substance
框架：extract actionable points
示例：We thank the reviewer for pointing this out...
行动：respond calmly, revise specifically
CTA：reviewer-response checklist
```

### 12.2 Advisor Says Writing Is Unclear

适用输入：

```text
My advisor says my writing is unclear
My supervisor says rewrite this section
I don't know what unclear means
```

回复逻辑：

```text
共情：unclear is frustrating because it is vague
诊断：often structure, not grammar
框架：topic sentence / logical flow / contribution
示例：This paragraph argues that...
行动：ask advisor which level is unclear
CTA：paragraph diagnosis checklist
```

### 12.3 Rejected for Lack of Novelty

适用输入：

```text
rejected for lack of novelty
reviewer says contribution is limited
not novel enough
```

回复逻辑：

```text
共情：vague and common comment
诊断：positioning problem
框架：prior work / gap / contribution
示例：Unlike prior studies that focus on X...
行动：revise Introduction and Discussion
CTA：reviewer-response checklist
```

### 12.4 English Editing Recommendation

适用输入：

```text
Can anyone recommend an English editing service?
Do I need a native speaker editor?
My English is not good enough
```

回复逻辑：

```text
共情：ESL academic writing is hard
诊断：editing is useful but may not solve argument problems
框架：grammar / clarity / logic / journal fit
示例：ask editor to comment on structure, not only wording
行动：choose service based on manuscript stage
CTA：可以 Medium 或 Direct
```

注意：

这类问题商业意图较强，可以适度使用 Medium CTA，但仍避免硬广。

### 12.5 Journal Selection

适用输入：

```text
How do I choose a journal?
Should I submit to this journal?
Impact factor or scope?
```

回复逻辑：

```text
共情：journal selection is confusing
诊断：do not choose by impact factor only
框架：scope / article type / recent papers / review speed / red flags
示例：read 5-10 recent articles
行动：make a shortlist of 3 journals
CTA：journal selection checklist
```

### 12.6 Revise and Resubmit Anxiety

适用输入：

```text
R&R anxiety
revise and resubmit stress
major revision panic
```

回复逻辑：

```text
共情：major revision can feel overwhelming
诊断：not all comments have equal weight
框架：must-fix / negotiate / clarify
示例：group comments by theme
行动：make a revision matrix
CTA：revision planning checklist
```

### 12.7 AI Writing / AI Polishing Concern

适用输入：

```text
AI made my paper sound generic
Can I use ChatGPT to polish my paper?
My writing sounds like AI
```

回复逻辑：

```text
共情：AI polishing can improve surface clarity
诊断：AI often weakens specificity
框架：claim / evidence / limitation / contribution
示例：replace generic claims with study-specific claims
行动：use AI for sentence options, not argument design
CTA：AI polishing checklist
```

### 12.8 Dissertation / Thesis Structure Confusion

适用输入：

```text
I don't know how to structure my thesis
dissertation chapter structure
my thesis feels messy
```

回复逻辑：

```text
共情：large writing projects become messy quickly
诊断：usually an architecture problem
框架：research question / chapter role / evidence / transition
示例：This chapter answers...
行动：write a one-sentence job for each chapter
CTA：thesis structure worksheet
```

## 13. 语气选项

建议支持 4 种语气。

### 13.1 Warm

特点：

```text
更共情，更适合焦虑型用户。
```

适合：

```text
revise and resubmit anxiety
harsh reviewer response
advisor says writing unclear
```

### 13.2 Direct

特点：

```text
简洁、清楚、少情绪。
```

适合：

```text
journal selection
technical writing questions
CS / engineering communities
```

### 13.3 Expert

特点：

```text
专业、结构化、有框架。
```

适合：

```text
AskAcademia
PhD
scientific writing
```

### 13.4 Casual

特点：

```text
像普通 Reddit 用户，不太正式。
```

适合：

```text
GradSchool
InternationalStudents
general discussion threads
```

## 14. 风险检测

工具需要对生成结果进行风险提示。

### 14.1 营销感风险

检测信号：

```text
DM me 出现过多
service / paid / client / company 出现过多
自我介绍过长
回复没有先解决问题
CTA 比正文更突出
```

提示示例：

```text
这条回复营销感偏强。建议删除服务描述，只保留 checklist 钩子。
```

### 14.2 学术合规风险

高风险表达：

```text
guaranteed acceptance
we can publish it for you
we write your paper
ghostwriting
contract cheating
submit on your behalf
write my essay
```

替代表达：

```text
manuscript diagnosis
academic writing coaching
language editing
logic restructuring
reviewer response support
journal submission strategy
research communication coaching
```

### 14.3 Reddit 社区风险

提示逻辑：

```text
如果 CTA 强度为 Medium 或 Direct，提醒用户检查 subreddit rules。
如果回复包含链接，提醒用户谨慎发布。
如果自我介绍超过 1 句，提示精简。
```

提示示例：

```text
发布前建议检查该 subreddit 是否允许 self-promotion 或 DM 引导。
```

## 15. 输出编辑区功能

### 15.1 基础功能

```text
复制回复
重新生成
缩短
展开
变得更自然
变得更专业
降低营销感
增强 CTA
移除 CTA
```

### 15.2 版本切换

Tabs：

```text
Short
Helpful
Deep
```

### 15.3 局部重写

建议提供按钮：

```text
重写开头
重写诊断部分
重写示例句
重写 CTA
```

## 16. 常用 CTA 库

### 16.1 Checklist 型

```text
Happy to share a reviewer-response checklist if useful.
I have a short checklist for this kind of revision if you want it.
Happy to share the checklist I use for sorting reviewer comments.
```

### 16.2 Template 型

```text
I can share a simple response-letter structure if that helps.
Happy to share a template for organizing the response letter.
```

### 16.3 轻诊断型

```text
If you want, you can paste the reviewer comment here and I can help classify what it is really asking for.
If you want another pair of eyes on the reviewer wording, feel free to DM me.
```

### 16.4 服务边界型

```text
I work with ESL researchers on manuscript clarity and reviewer responses, but I’d start with the diagnosis above before paying for editing.
```

这类 CTA 更真实，因为它不是直接推销，而是先给用户理性建议。

## 17. 数据结构建议

### 17.1 Input 对象

```json
{
  "sourceText": "My paper was rejected because the reviewer said it lacks novelty.",
  "postTitle": "Paper rejected for lack of novelty",
  "subreddit": "PhD",
  "problemType": "lack_of_novelty",
  "userType": "PhD",
  "field": "General",
  "tone": "warm",
  "replyGoal": "build_trust",
  "ctaLevel": "soft"
}
```

### 17.2 Reply 对象

```json
{
  "version": "helpful",
  "wordCount": 190,
  "replyText": "That’s a really common but frustrating reviewer comment...",
  "ctaLevel": "soft",
  "risk": {
    "marketing": "low",
    "compliance": "low",
    "redditCommunity": "medium"
  },
  "suggestions": [
    "Check subreddit rules before using CTA.",
    "Consider removing the final sentence if the thread is strict about self-promotion."
  ]
}
```

### 17.3 Template 对象

```json
{
  "id": "lack_of_novelty",
  "name": "Rejected for lack of novelty",
  "defaultTone": "warm",
  "defaultCtaLevel": "soft",
  "logic": {
    "empathy": "vague and frustrating reviewer comment",
    "diagnosis": "positioning problem, not only language",
    "framework": ["prior work", "gap", "contribution"],
    "examplePattern": "Unlike prior studies that focus on X, this study examines Y under Z conditions.",
    "cta": "Happy to share a reviewer-response checklist if useful."
  }
}
```

## 18. Prompt 生成建议

如果后续接入大模型，建议系统 prompt 强调：

```text
You are helping draft Reddit comments for academic writing support.
The reply must sound like a helpful Reddit user, not a brand advertisement.
Do not guarantee publication, acceptance, grades, or outcomes.
Do not offer ghostwriting or doing the user's work.
Always provide concrete advice before any CTA.
CTA must be optional, subtle, and context-aware.
If CTA level is none, do not include any CTA.
If CTA level is soft, use a low-pressure sentence such as "happy to share a checklist if useful."
If CTA level is medium, invite the user to DM only when the input suggests they want a resource.
If CTA level is direct, keep it transparent and avoid salesy language.
```

## 19. 与 Instagram 图生成器的关系

这个页面应和 Instagram 学术内容图生成器并列，组成运营后台。

建议导航：

```text
小红书封面生成器
Instagram 学术内容图生成器
Reddit 评论回复助手
```

联动方式：

```text
Reddit 回复助手收集高频问题
→ 一键保存为选题
→ 转到 Instagram Carousel 生成器
→ 生成对应图文内容
```

例如：

```text
Reddit 上多人问 "lack of novelty"
→ 保存为选题
→ 生成 Instagram Carousel: Reviewer says "lack of novelty"
```

## 20. MVP 开发范围

### P0

```text
新增二级页面 /reddit-reply-assistant/
支持粘贴 Reddit 原评论
支持选择问题类型
支持选择语气
支持选择 CTA 强度
生成 Helpful 版本
支持复制回复
内置 3 个模板：lack_of_novelty / harsh_reviewer / writing_unclear
```

### P1

```text
支持 Short / Helpful / Deep 三个版本
支持 8 个问题类型
支持风险检测
支持降低营销感按钮
支持移除 CTA / 增强 CTA
支持常用 CTA 库
```

### P2

```text
支持保存历史回复
支持保存为选题
支持一键转 Instagram Carousel 选题
支持自定义模板
支持项目 JSON 导入导出
```

### P3

```text
支持根据 subreddit 自动建议语气
支持高频问题统计
支持团队话术库
支持账号 CTA 频率提醒
支持多语言辅助解释
```

## 21. 验收标准

### 21.1 功能验收

```text
用户能输入一条 Reddit 评论并生成可用回复
用户能选择问题类型、语气、CTA 强度
用户能复制生成结果
用户能生成至少 3 类问题的高质量回答
用户能看到营销风险和合规风险提示
```

### 21.2 内容验收

```text
回复先提供实质帮助，再考虑 CTA
回复不像广告
回复不像 AI 模板
回复不承诺发表、录用、通过
回复不暗示代写或替用户完成学术任务
CTA 低压、自然、可删除
```

### 21.3 运营验收

```text
运营人员 1 分钟内能生成一条可编辑回复
Helpful 版本无需大改即可发布
Short 版本适合低价值评论
Deep 版本适合高价值问题
风险提示能有效降低硬广感
```

## 22. 第一批内置示例

### 示例 1：lack of novelty

输入：

```text
My paper was rejected because the reviewer said it lacks novelty. I don't know how to fix that.
```

默认输出方向：

```text
共情：评论很常见且模糊
诊断：不是简单加一句 novelty，而是定位问题
框架：prior work / gap / contribution
示例句：Unlike prior studies...
CTA：Happy to share a reviewer-response checklist if useful.
```

### 示例 2：writing unclear

输入：

```text
My advisor keeps saying my writing is unclear but doesn't explain what to change.
```

默认输出方向：

```text
共情：unclear 很让人困惑
诊断：可能是段落结构、逻辑连接或贡献表达
框架：topic sentence / flow / contribution
示例句：This paragraph argues that...
CTA：I can share a paragraph-level checklist if useful.
```

### 示例 3：English editing service

输入：

```text
Can anyone recommend a good English editing service for a journal paper?
```

默认输出方向：

```text
共情：ESL 写作确实难
诊断：先判断需要语言编辑还是逻辑重构
框架：grammar / clarity / argument / journal fit
建议：不要只找改语法的服务
CTA：I work with ESL researchers on this, but I’d first check whether the issue is language or structure.
```

## 23. 开发注意事项

- 不要设计自动发布到 Reddit 的功能。
- 不要设计批量刷评论功能。
- 不要设计自动私信功能。
- 不要鼓励用户规避 Reddit 社区规则。
- 生成结果必须默认可编辑。
- CTA 必须可关闭。
- 风险提示必须明显，但不要阻塞用户使用。
- 所有示例默认使用合规表达，避免“代写、包发表、保证录用”等表述。

## 24. 总结

这个页面的核心价值不是提高评论数量，而是提高 Reddit 互动质量。

正确方向：

```text
更像专业人士
更像真实 Reddit 用户
更有帮助
更少营销感
更容易引导高意向用户主动私信
```

错误方向：

```text
批量评论
自动私信
硬广引流
重复话术
承诺发表结果
暗示代写
```

推荐第一版先做轻量 MVP：

```text
输入评论
选择问题类型
选择语气
选择 CTA 强度
生成 Helpful 回复
复制发布
风险提示
```

跑通后，再加入历史库、选题库、Instagram Carousel 联动。
