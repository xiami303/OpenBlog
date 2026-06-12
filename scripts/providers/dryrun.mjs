// Dry-run provider: no network, no API key. Organizes the recent memory notes
// into a readable placeholder article so the whole generate → build → publish
// pipeline can be exercised end to end before a real model is wired up.

import { buildUserPrompt } from "./prompt.mjs";

/**
 * @param {{notes: Array<{name: string, content: string}>, date: string}} input
 * @returns {Promise<{title: string, tags: string[], summary: string, body: string}>}
 */
export async function generate({ notes, date }) {
  // Pull a rough set of bullet points out of the notes to make the stub
  // feel grounded in the actual memory content.
  const bullets = notes
    .flatMap((n) => n.content.split("\n"))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("---") && !line.includes(":"))
    .slice(0, 6);

  const body = `> 本文由 OpenBlog 的 **dry-run** 占位生成器产出 —— 它没有调用任何 AI 模型,只是把最近的记忆整理成了文章骨架。配置好 \`ANTHROPIC_API_KEY\` 或 \`OPENAI_API_KEY\` 后,这里会换成真正的 AI 写作。

## 最近在想些什么

${bullets.length ? bullets.map((b) => `- ${b}`).join("\n") : "- (最近的记忆里还没有可提炼的要点)"}

## 一点沉淀

把零散的念头记下来,本身就是一种对抗遗忘的方式。等到 AI 接管写作的那一天,这些记忆会自动长成一篇篇文章 —— 而今天,它们先以这样朴素的形式被保存下来。

_生成日期:${date} · 共参考了 ${notes.length} 条记忆_`;

  return {
    title: "每日沉淀",
    tags: ["memory", "dryrun"],
    summary: "由近期记忆自动整理的占位文章(dry-run,未调用 AI 模型)。",
    body,
  };
}

// Exposed for debugging: lets you inspect the prompt the real providers receive.
export { buildUserPrompt };
