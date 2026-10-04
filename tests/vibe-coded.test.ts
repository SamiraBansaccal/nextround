import { describe, expect, it } from "vitest";
import { type RawExtraction, verifyExtraction } from "@/lib/offers/extract";
import { matchSchema, verifyMatches } from "@/lib/offers/match";
import { factAliases } from "@/lib/prompt-facts";

// Projects built with AI ("vibe coding"): kept in the profile as interest in AI and creativity, never as
// proof of a technology, whatever the AI proposes.

const OFFER = "We need TypeScript. Curious about AI and creative. Docker is a plus.";

describe("vibe-coded projects", () => {
  it("are announced to the AI as such", () => {
    const { listing } = factAliases([
      { id: "a", type: "project", text: "minishell (C)" },
      { id: "b", type: "project", text: "nextround (TypeScript)", aiAssisted: true },
    ]);
    expect(listing).toBe(
      "F1 [project] minishell (C)\nF2 [project, built with AI assistance (vibe coding): shows interest in AI, creativity, hackathons; NOT mastery of its technologies] nextround (TypeScript)",
    );
  });

  it("never cover a technical requirement when an offer is added, but may cover a soft one", () => {
    const raw: RawExtraction = {
      title: null, company: null, location: null, contract: null, language: "en", stack: [], contacts: [],
      requirements: [
        { kind: "must", category: "tech", text: "TypeScript", quote: "We need TypeScript.", fact_ids: ["F1", "F2"] },
        { kind: "nice", category: "soft", text: "Curious about AI", quote: "Curious about AI and creative.", fact_ids: ["F2"] },
      ],
    };
    const aliases = new Map([["F1", "own"], ["F2", "vibe"]]);
    const result = verifyExtraction(raw, OFFER, aliases, new Set(["own", "vibe"]), new Set(["vibe"]));
    expect(result.requirements.map((r) => r.factIds)).toEqual([["own"], ["vibe"]]);
  });

  it("never cover a technical requirement when an offer is matched again", () => {
    const requirements = [
      { id: "r-ts", kind: "must", category: "tech", text: "TypeScript" },
      { id: "r-ai", kind: "nice", category: "soft", text: "Curious about AI" },
      { id: "r-docker", kind: "nice", category: "tech", text: "Docker" },
    ];
    const raw = matchSchema.parse({
      matches: [
        { requirement: "R1", fact_ids: ["F2", "F9"] },
        { requirement: "r2", fact_ids: ["F2"] },
        { requirement: "R3", fact_ids: ["F1"] },
        { requirement: "R3", fact_ids: ["F1", "F3"] },
        { requirement: "R7", fact_ids: ["F1"] },
      ],
    });
    const facts = new Map([
      ["own", { id: "own", validated: true, aiAssisted: false }],
      ["vibe", { id: "vibe", validated: true, aiAssisted: true }],
      ["draft", { id: "draft", validated: false, aiAssisted: false }],
    ]);
    const links = verifyMatches(raw, requirements, new Map([["F1", "own"], ["F2", "vibe"], ["F3", "draft"]]), facts);
    expect(Object.fromEntries(links)).toEqual({ "r-ts": [], "r-ai": ["vibe"], "r-docker": ["own"] });
  });
});
