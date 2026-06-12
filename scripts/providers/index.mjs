// Provider selector. Resolves which AI backend generates the article:
//
//   OPENBLOG_PROVIDER=anthropic|openai|dryrun   explicit override
//   else ANTHROPIC_API_KEY present              -> anthropic
//   else OPENAI_API_KEY present                 -> openai
//   else                                        -> dryrun (no key, no network)
//
// Every provider exposes the same async generate({ notes, date }) signature
// returning { title, tags, summary, body }.

export function selectProviderName() {
  const explicit = (process.env.OPENBLOG_PROVIDER || "").trim().toLowerCase();
  if (explicit) return explicit;
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "dryrun";
}

export async function getProvider(name = selectProviderName()) {
  switch (name) {
    case "anthropic":
      return { name, ...(await import("./anthropic.mjs")) };
    case "openai":
      return { name, ...(await import("./openai.mjs")) };
    case "dryrun":
      return { name, ...(await import("./dryrun.mjs")) };
    default:
      throw new Error(
        `Unknown provider "${name}". Use one of: anthropic, openai, dryrun ` +
          `(via OPENBLOG_PROVIDER or --provider).`
      );
  }
}
