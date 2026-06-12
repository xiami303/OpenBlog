// Shared prompt scaffolding for AI providers.
//
// All providers turn the same input — recent memory notes + a target date —
// into the same structured output: { title, tags, summary, body }.

export const SYSTEM_PROMPT = `你是 OpenBlog 的常驻写作者。OpenBlog 的理念是:每日所思即记忆,每日分享即 IP。

你的任务:把作者最近的零散笔记(记忆)沉淀成一篇结构完整、有主线、值得发布的中文博客文章。

要求:
- 不要逐条复述笔记,而是从这些零散想法里提炼出一条主线,围绕它展开。
- 语气自然、真诚,像作者本人在分享思考,而不是营销文案。
- 用 Markdown 写作正文;可以有小标题、列表、引用,但不要堆砌。
- 不要编造笔记里没有的事实或经历。
- 篇幅适中(约 400–900 字)。`;

// The instruction appended to the user message; asks for strict JSON so the
// orchestrator can parse a stable shape regardless of provider.
export const OUTPUT_INSTRUCTION = `请只输出一个 JSON 对象,不要包含任何额外文字或代码块标记,字段如下:
{
  "title": "文章标题(简洁、有吸引力)",
  "tags": ["3-5 个", "中文或英文标签"],
  "summary": "一句话摘要,显示在首页列表",
  "body": "文章正文,Markdown 格式,不要重复标题"
}`;

/**
 * Build the user-facing prompt from the collected notes.
 * @param {{notes: Array<{name: string, content: string}>, date: string}} input
 */
export function buildUserPrompt({ notes, date }) {
  const noteBlocks = notes
    .map((n, i) => `### 笔记 ${i + 1}(${n.name})\n${n.content.trim()}`)
    .join("\n\n");

  return `今天是 ${date}。以下是作者最近的零散笔记:

${noteBlocks}

请基于这些笔记写一篇博客文章。

${OUTPUT_INSTRUCTION}`;
}

/**
 * Parse a model's text response into the structured result, tolerating a
 * stray code fence around the JSON. Throws if no valid object is found.
 */
export function parseResult(text) {
  let s = text.trim();
  // Strip a ```json ... ``` fence if the model added one despite instructions.
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) s = fence[1].trim();

  let obj;
  try {
    obj = JSON.parse(s);
  } catch {
    // Last resort: grab the first {...} span.
    const span = s.match(/\{[\s\S]*\}/);
    if (!span) throw new Error("provider 返回内容不是有效 JSON:\n" + text.slice(0, 500));
    obj = JSON.parse(span[0]);
  }

  if (!obj.title || !obj.body) {
    throw new Error("provider 返回的 JSON 缺少 title 或 body 字段");
  }
  return {
    title: String(obj.title),
    tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [],
    summary: obj.summary ? String(obj.summary) : "",
    body: String(obj.body),
  };
}
