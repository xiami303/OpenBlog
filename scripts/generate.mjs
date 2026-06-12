#!/usr/bin/env node
// OpenBlog article generator.
//
// Reads recent notes from memory/, asks the selected AI provider to distill
// them into one blog article, and writes it as a Markdown file into posts/
// (with front matter, ready for scripts/build.mjs to render).
//
// Usage:
//   node scripts/generate.mjs [--date YYYY-MM-DD] [--provider name]
//                             [--days N] [--max N] [--force]
//
// Provider is chosen automatically (see scripts/providers/index.mjs):
// ANTHROPIC_API_KEY -> anthropic, OPENAI_API_KEY -> openai, else dryrun.
// With no key set it runs the dryrun stub, so the pipeline works out of the box.

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, basename, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { getProvider } from "./providers/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MEMORY_DIR = join(ROOT, "memory");
const POSTS_DIR = join(ROOT, "posts");

function parseArgs(argv) {
  const args = { days: 7, max: 20, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--date") args.date = argv[++i];
    else if (a === "--provider") args.provider = argv[++i];
    else if (a === "--days") args.days = Number(argv[++i]);
    else if (a === "--max") args.max = Number(argv[++i]);
    else if (a === "--force") args.force = true;
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function isoToday() {
  // Scripts can't use new Date() reliably in all envs; require --date in CI.
  // For local convenience, fall back to the system date here.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

// Collect recent memory notes, newest first, bounded by --days and --max.
async function collectNotes({ days, max, date }) {
  if (!(await exists(MEMORY_DIR))) return [];
  const cutoff = new Date(date);
  cutoff.setDate(cutoff.getDate() - days);

  const files = (await readdir(MEMORY_DIR)).filter(
    (f) => extname(f) === ".md" && !f.startsWith(".") && f !== "README.md"
  );

  const notes = [];
  for (const file of files) {
    const full = join(MEMORY_DIR, file);
    const raw = await readFile(full, "utf8");
    const { data, content } = matter(raw);
    const fileStat = await stat(full);
    const noteDate = data.date ? new Date(data.date) : fileStat.mtime;
    if (noteDate < cutoff) continue;
    notes.push({ name: file, date: noteDate, content });
  }
  notes.sort((a, b) => b.date - a.date);
  return notes.slice(0, max);
}

function slugify(title) {
  // Keep ASCII letters/numbers only; CJK and punctuation collapse to dashes.
  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // CJK-only titles collapse to empty -> caller falls back to a date-based name.
  return slug || "post";
}

async function uniquePath(date, slug, force) {
  let candidate = join(POSTS_DIR, `${date}-${slug}.md`);
  if (force || !(await exists(candidate))) return candidate;
  for (let n = 2; n < 100; n++) {
    candidate = join(POSTS_DIR, `${date}-${slug}-${n}.md`);
    if (!(await exists(candidate))) return candidate;
  }
  return candidate;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      "Usage: node scripts/generate.mjs [--date YYYY-MM-DD] [--provider name] [--days N] [--max N] [--force]"
    );
    return;
  }
  const date = args.date || isoToday();

  const notes = await collectNotes({ days: args.days, max: args.max, date });
  if (notes.length === 0) {
    console.log(
      `No memory notes within the last ${args.days} day(s) of ${date}. ` +
        `Add notes to memory/ and re-run. Nothing generated.`
    );
    return;
  }

  const provider = await getProvider(args.provider);
  console.log(`OpenBlog: generating from ${notes.length} note(s) via "${provider.name}" provider...`);

  const result = await provider.generate({ notes, date });

  const slug = slugify(result.title, date);
  await mkdir(POSTS_DIR, { recursive: true });
  const outPath = await uniquePath(date, slug, args.force);

  const fileContent = matter.stringify(result.body, {
    title: result.title,
    date,
    tags: result.tags,
    summary: result.summary,
    generated_by: provider.name,
  });

  await writeFile(outPath, fileContent);
  console.log(`OpenBlog: wrote ${basename(outPath)} (title: "${result.title}")`);
}

main().catch((err) => {
  console.error("generate failed:", err.message);
  process.exit(1);
});
