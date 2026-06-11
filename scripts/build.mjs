#!/usr/bin/env node
// OpenBlog static site generator.
//
// Reads Markdown posts from posts/, renders them to HTML, and writes a
// browsable static site into public/. Each post may carry YAML front matter:
//
//   ---
//   title: My first thought
//   date: 2026-06-11
//   tags: [memory, ai]
//   summary: One-line teaser shown on the index.
//   ---
//
// Posts without front matter still work — the first heading or filename is
// used as the title and the file mtime as the date.

import { readdir, readFile, mkdir, writeFile, rm, stat } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = join(ROOT, "posts");
const OUT_DIR = join(ROOT, "public");

const SITE = {
  title: "OpenBlog",
  tagline: "每日所思即记忆,每日分享即 IP。",
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function formatDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function layout({ title, body }) {
  return `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header class="site-header">
  <a class="site-title" href="/">${escapeHtml(SITE.title)}</a>
  <p class="site-tagline">${escapeHtml(SITE.tagline)}</p>
</header>
<main class="container">
${body}
</main>
<footer class="site-footer">
  <p>由 AI 自动生成与发布 · OpenBlog</p>
</footer>
</body>
</html>
`;
}

const STYLE = `:root{--fg:#1a1a1a;--muted:#666;--bg:#fafafa;--card:#fff;--accent:#3b6cff;--border:#eaeaea}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;color:var(--fg);background:var(--bg);line-height:1.7}
.container{max-width:720px;margin:0 auto;padding:0 20px}
.site-header{max-width:720px;margin:0 auto;padding:48px 20px 24px}
.site-title{font-size:30px;font-weight:800;text-decoration:none;color:var(--fg)}
.site-tagline{color:var(--muted);margin:6px 0 0}
.post-list{list-style:none;padding:0;margin:0}
.post-list li{padding:18px 0;border-bottom:1px solid var(--border)}
.post-list a{font-size:20px;font-weight:600;text-decoration:none;color:var(--fg)}
.post-list a:hover{color:var(--accent)}
.post-meta{color:var(--muted);font-size:14px;margin-top:4px}
.post-summary{color:#444;margin-top:6px}
article h1{font-size:32px;margin-bottom:6px}
article .post-meta{margin-bottom:24px}
article img{max-width:100%}
article pre{background:#0d1117;color:#e6edf3;padding:14px 16px;border-radius:8px;overflow:auto}
article code{background:#eef;padding:2px 5px;border-radius:4px;font-size:.9em}
article pre code{background:none;padding:0}
.tag{display:inline-block;background:#eef;color:var(--accent);font-size:12px;padding:2px 8px;border-radius:10px;margin-right:6px}
.back{display:inline-block;margin:32px 0 0;color:var(--accent);text-decoration:none}
.site-footer{max-width:720px;margin:48px auto 32px;padding:24px 20px 0;border-top:1px solid var(--border);color:var(--muted);font-size:14px;text-align:center}
.empty{color:var(--muted);padding:40px 0}
`;

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function collectPosts() {
  if (!(await exists(POSTS_DIR))) return [];
  const files = (await readdir(POSTS_DIR)).filter((f) => extname(f) === ".md");
  const posts = [];
  for (const file of files) {
    const full = join(POSTS_DIR, file);
    const raw = await readFile(full, "utf8");
    const { data, content } = matter(raw);
    const slug = basename(file, ".md");
    const fileStat = await stat(full);
    const title =
      data.title ||
      (content.match(/^#\s+(.+)$/m)?.[1] ?? slug);
    const date = data.date ? new Date(data.date) : fileStat.mtime;
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const summary =
      data.summary ||
      content.replace(/^#.*$/m, "").trim().split("\n")[0]?.slice(0, 120) ||
      "";
    posts.push({ slug, title, date, tags, summary, content });
  }
  posts.sort((a, b) => b.date - a.date);
  return posts;
}

function renderPost(post) {
  const tags = post.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const body = `<article>
<h1>${escapeHtml(post.title)}</h1>
<div class="post-meta">${formatDate(post.date)} ${tags}</div>
${marked.parse(post.content)}
<a class="back" href="/">← 返回首页</a>
</article>`;
  return layout({ title: `${post.title} · ${SITE.title}`, body });
}

function renderIndex(posts) {
  const items = posts.length
    ? `<ul class="post-list">${posts
        .map(
          (p) => `<li>
  <a href="/posts/${escapeHtml(p.slug)}.html">${escapeHtml(p.title)}</a>
  <div class="post-meta">${formatDate(p.date)}</div>
  ${p.summary ? `<div class="post-summary">${escapeHtml(p.summary)}</div>` : ""}
</li>`
        )
        .join("\n")}</ul>`
    : `<p class="empty">还没有文章。把今天的所思所想写进 posts/ 吧 —— 它们会成为你的记忆与 IP。</p>`;
  return layout({ title: SITE.title, body: items });
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(join(OUT_DIR, "posts"), { recursive: true });

  const posts = await collectPosts();

  await writeFile(join(OUT_DIR, "style.css"), STYLE);
  await writeFile(join(OUT_DIR, "index.html"), renderIndex(posts));
  for (const post of posts) {
    await writeFile(join(OUT_DIR, "posts", `${post.slug}.html`), renderPost(post));
  }

  console.log(`OpenBlog: built ${posts.length} post(s) → public/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
