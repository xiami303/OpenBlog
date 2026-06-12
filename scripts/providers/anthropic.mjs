// Anthropic (Claude) provider. Uses the official @anthropic-ai/sdk, imported
// dynamically so it's only required when this provider is actually selected
// (the dryrun path has zero dependencies).
//
// Requires ANTHROPIC_API_KEY in the environment. Install the SDK with:
//   npm install @anthropic-ai/sdk

import { SYSTEM_PROMPT, buildUserPrompt, parseResult } from "./prompt.mjs";

// Latest Claude model, suited to writing tasks. Override with OPENBLOG_MODEL.
const DEFAULT_MODEL = "claude-opus-4-8";

/**
 * @param {{notes: Array<{name: string, content: string}>, date: string}} input
 * @returns {Promise<{title: string, tags: string[], summary: string, body: string}>}
 */
export async function generate({ notes, date }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "anthropic provider selected but ANTHROPIC_API_KEY is not set. " +
        "Set the key, or use --provider dryrun."
    );
  }

  let Anthropic;
  try {
    ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  } catch {
    throw new Error(
      "anthropic provider selected but @anthropic-ai/sdk is not installed. " +
        "Run: npm install @anthropic-ai/sdk (it's an optionalDependency)."
    );
  }

  const client = new Anthropic();
  const model = process.env.OPENBLOG_MODEL || DEFAULT_MODEL;

  // Stream because output may be long; collect the final message.
  const stream = client.messages.stream({
    model,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt({ notes, date }) }],
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error("Claude declined to generate this article (stop_reason: refusal).");
  }

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  return parseResult(text);
}
