<div align="center">

# OpenBlog

**一个基于 AI 的自动生成、自动发布的博客系统**

_每日所思、所想,都是你的记忆。_
_每日分享的 Blog,是你的 IP。_

</div>

---

## 这是什么

**OpenBlog** 是一个由 AI Agent 驱动的个人博客系统。它把「写博客」这件事从「每天逼自己坐下来码字」,变成「把每天的所思所想交给 AI,由它替你沉淀、生成、发布」。

它的核心信念很简单:

- **你的每日所思、所想 —— 是你的记忆。** 碎片化的想法、读到的文章、灵光一现的念头,不该消散在聊天框和便签里。它们被收集、结构化、长期保存,成为可检索、可复用的个人知识资产。
- **你每日分享的 Blog —— 是你的 IP。** 持续输出、署你名字的内容,日积月累就是你的个人品牌与影响力。OpenBlog 让这件事自动、稳定地发生。

一句话:**记忆负责沉淀,IP 负责生长。AI 把两者连起来。**

## 为什么需要它

写作的难点从来不是「写」,而是**持续地写**。灵感零散、整理费时、排版繁琐、发布断更 —— 大多数博客死于「三天热度」。

OpenBlog 用 AI Agent 把这条链路自动化:

> 收集想法 → 沉淀记忆 → 生成文章 → 自动发布 → 形成 IP

你只需要「想」,剩下的交给它。

## 核心特性

| 能力 | 说明 |
| --- | --- |
| 🧠 **记忆沉淀** | 每日的笔记、对话、摘录被收集并结构化存储,形成可检索的长期记忆库 |
| ✍️ **AI 自动生成** | 基于你的记忆与近期所思,AI 自动撰写成结构完整、风格一致的博客文章 |
| 🚀 **自动发布** | 文章生成后自动构建并发布到站点,无需手动操作 |
| 🪪 **IP 沉淀** | 持续、署名的内容输出,日积月累构建你的个人品牌 |
| 🔁 **流水线驱动** | 「收集 → 沉淀 → 生成 → 发布」全流程由 Agent 编排,可定时触发 |
| 🤖 **Agent 友好** | 内置 [AGENTS.md](AGENTS.md),支持 OpenAI Codex 等 AI 编码 Agent 协作开发 |

## 工作原理

```
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │   每日所思   │ ──▶ │    记忆库    │ ──▶ │   AI 生成    │ ──▶ │   自动发布   │
  │想法·摘录·对话│     │结构化·可检索 │     │   撰写文章   │     │   上线成文   │
  └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
        输入              你的记忆            你的表达            你的 IP
```

1. **采集** —— 汇聚你每日的想法、笔记、阅读摘录与对话。
2. **沉淀** —— 将碎片整理为结构化的长期记忆,可被检索与复用。
3. **生成** —— AI 基于记忆与近期主题,自动撰写博客文章。
4. **发布** —— 文章自动构建、上线,持续累积为你的个人 IP。

## 项目状态

> 🚧 **早期可用(Early / MVP)**
>
> 已具备一条可运行的静态站点流水线:`posts/` 里的 Markdown 文章会被生成器渲染成站点,并由 CI 定时构建、自动发布到 GitHub Pages。AI 自动撰写文章的环节正在逐步接入。

### 路线图(Roadmap)

- [x] 静态站点生成器(Markdown → HTML)
- [x] 自动构建与发布(GitHub Pages,定时 + 触发)
- [x] AI 文章生成流水线(由记忆自动撰写,provider 可插拔)
- [ ] 记忆采集与结构化存储(目前为手动写入 `memory/`)
- [ ] 站点主题与个人化配置

## 快速开始

```bash
git clone https://github.com/xiami303/OpenBlog.git
cd OpenBlog
npm install        # 安装依赖
npm run build      # 渲染 posts/ → public/
npm run serve      # 构建并本地预览 http://localhost:8080
```

### 写一篇文章

在 `posts/` 下新建一个 `.md` 文件(文件名即文章 URL slug),开头写好 front matter:

```markdown
---
title: 我的想法
date: 2026-06-11
tags: [memory, ai]
summary: 显示在首页的一句话简介。
---

# 我的想法
...
```

所有字段都可省略 —— 没有 title 就用第一个标题或文件名,没有 date 就用文件修改时间。运行 `npm run build` 后,文章就会出现在站点上。

## 让 AI 由记忆自动写文章

把每天零散的所思所想写进 `memory/`(一篇 `.md` 一段想法),然后让 AI 把它们沉淀成一篇博客:

```bash
npm run generate                      # 读取近 7 天的 memory/ → 生成一篇文章到 posts/
npm run generate -- --days 3 --max 5  # 只看最近 3 天、最多 5 条记忆
npm run generate -- --provider dryrun # 强制用占位生成器(不调用 AI)
```

**Provider 可插拔,模型待定 —— 无需 key 也能跑:**

| 条件 | 使用的 provider |
| --- | --- |
| 设了 `ANTHROPIC_API_KEY` | `anthropic`(Claude,默认 `claude-opus-4-8`) |
| 设了 `OPENAI_API_KEY` | `openai` |
| 都没设 | `dryrun`(占位生成器,把记忆整理成文章骨架,**零依赖、不联网**) |

> 想接真实模型:设好对应的环境变量,再 `npm install @anthropic-ai/sdk`(或 `openai`)即可。可用 `OPENBLOG_PROVIDER` / `OPENBLOG_MODEL` 覆盖默认选择。

CI 里的 **AI Generate Post** 工作流会每日定时(或手动触发)运行生成器,并把结果**开成一个针对 `develop` 的 PR 供你审阅**;审阅合并后再走 `develop → main` 发布。API key 通过仓库 Secrets(`ANTHROPIC_API_KEY` / `OPENAI_API_KEY`)注入;没配也会用 dryrun 开 PR。

## 目录结构

```
memory/               # 每日零散想法(AI 生成的输入源)
posts/                # Markdown 文章(站点内容)
scripts/build.mjs     # 静态站点生成器(Markdown → public/)
scripts/generate.mjs  # AI 文章生成器(memory/ → posts/)
scripts/providers/    # 可插拔的 AI provider(anthropic / openai / dryrun)
public/               # 构建产物(自动生成,已 gitignore)
.github/workflows/    # 定时生成开 PR + 自动发布到 Pages
```

## 分支规则

- **`develop`** —— 集成分支,**日常开发与提交的默认分支**。
- **`main`** —— 生产 / 已发布分支,CI 从这里部署到 Pages。仅在发布时把 `develop` 合并到 `main`。

## 参与开发

本仓库对 AI 编码 Agent 友好。若你使用 **OpenAI Codex** 等 Agent 协作开发:

- 先阅读 [AGENTS.md](AGENTS.md) 了解仓库约定与目标结构。
- 环境准备脚本位于 [.codex/setup.sh](.codex/setup.sh)。
- 默认分支为 `main`,集成分支为 `develop`;Pull Request 请提交到 `main`。

## 许可

待定(TBD)。

---

<div align="center">
<sub>把每一天的想法,变成属于你的内容资产。</sub>
</div>
