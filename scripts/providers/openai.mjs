// OpenAI provider. Uses the official `openai` SDK, imported dynamically so it's
// only required when this provider is actually selected.
//
// Requires OPENAI_API_KEY in the environment. Install the SDK with:
//   npm install openai

import { SYSTEM_PROMPT, buildUserPrompt, parseResult } from "./prompt.mjs";

const DEFAULT_MODEL = "gpt-4o"; // override with OPENBLOG_MODEL

/**
 * @param {{notes: Array<{name: string, content: string}>, date: string}} input
 * @returns {Promise<{title: string, tags: string[], summary: string, body: string}>}
 */
export async function generate({ notes, date }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "openai provider selected but OPENAI_API_KEY is not set. " +
        "Set the key, or use --provider dryrun."
    );
  }

  let OpenAI;
  try {
    ({ default: OpenAI } = await import("openai"));
  } catch {
    throw new Error(
      "openai provider selected but the `openai` package is not installed. " +
        "Run: npm install openai (it's an optionalDependency)."
    );
  }

  const client = new OpenAI();
  const model = process.env.OPENBLOG_MODEL || DEFAULT_MODEL;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt({ notes, date }) },
    ],
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content || "";
  return parseResult(text);
}
