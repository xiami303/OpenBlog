# AGENTS.md

Guidance for AI coding agents (OpenAI Codex and similar) working in the **OpenBlog** repository.

## What this repo is

OpenBlog is a personal blog project. The repository is currently an early
scaffold — at the time of writing it contains only a `README.md` and a starter
GitHub Actions workflow (`.github/workflows/blank.yml`). There is **no
application code, build system, or test suite yet**. Treat the structure below
as the intended target; create files as needed when implementing a task.

## Repository layout

```
.
├── AGENTS.md                  # this file
├── README.md
└── .github/
    └── workflows/
        └── blank.yml          # placeholder CI (echoes hello world)
```

When you add real code, prefer a conventional static-site / blog layout
(e.g. `src/`, `content/` or `posts/` for Markdown articles, `public/` or
`dist/` for build output). Document any structure you introduce back in this
file and the `README.md`.

## Branches

- `main` — default / production branch.
- `develop` — integration branch.

Open pull requests against `main` unless the task says otherwise. Never force-push
shared branches.

## Build, run, and test

There is no build or test tooling configured yet. **Do not invent commands that
do not exist.** If a task requires building or testing:

1. Choose a stack appropriate to a blog (e.g. a static-site generator), add its
   manifest (`package.json`, etc.), and wire real `build`/`test` scripts.
2. Update this section and the CI workflow with the actual commands you added.
3. Verify commands run locally before claiming they work.

Until then, validation means: the repo still clones, Markdown/HTML renders, and
the CI workflow stays green.

## Conventions

- Keep changes focused and minimal; match the style of surrounding files.
- Blog content should be authored in Markdown.
- Commit messages: short imperative subject line; explain the "why" in the body
  when non-obvious.
- Do not commit secrets, build artifacts, or large binaries.

## For the Codex cloud agent

- Read this file first to understand scope before making changes.
- An optional environment setup script lives at `.codex/setup.sh` — run it to
  prepare a working environment. It is a no-op until a real toolchain is added.
- Make the smallest change that satisfies the task, open a PR against `main`,
  and describe what you did and how you verified it.
