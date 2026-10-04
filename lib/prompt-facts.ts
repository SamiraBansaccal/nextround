// Validated facts are sent to the AI under short aliases (F1, F2…): weaker models copy short ids
// reliably, long UUIDs much less. The code maps aliases back and rejects unknown ones.

export interface FactForPrompt {
  id: string;
  type: string;
  text: string;
  /** A project built with AI ("vibe coding"): told to the AI so it never reads as mastery of its technologies. */
  aiAssisted?: boolean;
}

const AI_ASSISTED = ", built with AI assistance (vibe coding): shows interest in AI, creativity, hackathons; NOT mastery of its technologies";

export function factAliases(facts: FactForPrompt[]) {
  const aliasToId = new Map<string, string>();
  const idToAlias = new Map<string, string>();
  const lines = facts.map((fact, i) => {
    const alias = `F${i + 1}`;
    aliasToId.set(alias, fact.id);
    idToAlias.set(fact.id, alias);
    return `${alias} [${fact.type}${fact.aiAssisted ? AI_ASSISTED : ""}] ${fact.text.replace(/\s+/g, " ").slice(0, 300)}`;
  });
  return { aliasToId, idToAlias, listing: lines.join("\n") };
}
