# AGENTS.md

Guidance for AI coding agents (OpenAI Codex and similar) working in the **OpenBlog** repository.

## What this repo is

OpenBlog is a personal blog system positioned as an **AI-driven, auto-generate &
auto-publish blog**: daily thoughts become your memory, daily posts become your
IP. See [README.md](README.md) for the full positioning.

The repo now ships a working **static-site generator**: Markdown posts in
`posts/` are rendered to a static site in `public/` and published to GitHub
Pages by CI.

## Repository layout

```
.
├── AGENTS.md                  # this file
├── README.md                  # positioning + usage
├── package.json               # scripts: build, serve, generate
├── memory/                    # daily raw thoughts (input for AI generation)
│   └── *.md                   # one note per thought; front matter: date, tags
├── posts/                     # Markdown articles (the site content source)
│   └── *.md                   # front matter: title, date, tags, summary
├── scripts/
│   ├── build.mjs              # static-site generator (Markdown -> public/)
│   ├── serve.mjs              # local preview server
│   ├── generate.mjs           # AI article generator (memory/ -> posts/)
│   └── providers/             # pluggable AI providers (anthropic/openai/dryrun)
├── public/                    # build output (git-ignored, regenerated)
└── .github/
    └── workflows/
        ├── publish.yml        # scheduled build + publish to Pages (from main)
        └── generate.yml       # scheduled AI generate -> PR to develop
```

## Branch policy — IMPORTANT

- **`develop`** — integration branch. **This is the default branch for all work
  and pushes.** Commit here and `git push origin develop`.
- **`main`** — production / published branch. The publish workflow deploys from
  `main`. Only merge `develop -> main` when explicitly releasing/publishing.

**Default to `develop`.** Do NOT push or open PRs against `main` unless the task
explicitly says to release/publish. Never force-push shared branches.

## Build, run, and test

Toolchain: Node.js (ESM), deps `marked` + `gray-matter`.

```bash
npm ci          # install (CI) — or npm install locally
npm run build   # render posts/ -> public/
npm run serve   # build, then serve public/ at http://localhost:8080
npm run generate -- --provider dryrun   # memory/ -> a new posts/*.md (no API key needed)
```

Validation for a change: `npm run build` succeeds and produces
`public/index.html` plus one `public/posts/<slug>.html` per post. Verify the
build runs before claiming it works.

## Authoring posts

Add a `.md` file under `posts/` (filename becomes the URL slug). Front matter:

```markdown
---
title: My thought
date: 2026-06-11
tags: [memory, ai]
summary: One-line teaser shown on the index.
---

# My thought
...
```

All fields are optional — missing title falls back to the first heading or the
filename; missing date falls back to file mtime.

## AI generation (memory/ -> posts/)

`scripts/generate.mjs` reads recent notes from `memory/`, asks the selected AI
provider to distill them into one article, and writes it to `posts/`. Provider
selection (`scripts/providers/index.mjs`): `OPENBLOG_PROVIDER` override, else
`ANTHROPIC_API_KEY` -> anthropic, else `OPENAI_API_KEY` -> openai, else
**dryrun** (a zero-dependency, no-network stub so the pipeline always runs). The
SDKs are `optionalDependencies` — install only when wiring a real key. The
`generate.yml` workflow runs this and opens a PR to `develop` for review; it
never publishes directly.

## Conventions

- Keep changes focused and minimal; match the style of surrounding files.
- Blog content is authored in Markdown.
- Don't commit `node_modules/` or `public/` (both git-ignored).
- Commit messages: short imperative subject; explain the "why" when non-obvious.

## For the Codex cloud agent

- Read this file first; respect the **develop-default** branch policy above.
- Environment setup script: [.codex/setup.sh](.codex/setup.sh) (runs `npm ci`).
- Make the smallest change that satisfies the task, push to `develop`, and
  describe what you did and how you verified it (`npm run build`).
