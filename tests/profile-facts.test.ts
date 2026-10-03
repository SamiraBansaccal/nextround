import { describe, expect, it } from "vitest";
import { factKey, verifyProposedFacts } from "@/lib/profile/extract-facts";

// Facts proposed from a CV or the onboarding chat: kept only with a verbatim quote from the source.

const CV = `Stagiaire développeuse front-end chez WebAgency SPRL, Bruxelles (février 2025 - juin 2025).
Compétences : JavaScript, TypeScript, React.
Langues : français (langue maternelle), anglais (B2).`;

describe("verifyProposedFacts", () => {
  it("keeps facts quoted from the CV and drops invented ones", () => {
    const { facts, dropped } = verifyProposedFacts(
      {
        facts: [
          { type: "experience", text: "Front-end intern at WebAgency SPRL", quote: "Stagiaire développeuse front-end chez WebAgency SPRL" },
          { type: "language", text: "English B2", quote: "anglais (B2)" },
          { type: "skill", text: "Kubernetes", quote: "Kubernetes en production" }, // not in the CV
        ],
      },
      CV,
    );
    expect(facts.map((f) => f.text)).toEqual(["Front-end intern at WebAgency SPRL", "English B2"]);
    expect(dropped).toBe(1);
  });
});

describe("factKey (no duplicates across CVs)", () => {
  it("ignores case, punctuation and spacing", () => {
    expect(factKey("React — TypeScript!")).toBe(factKey("react typescript"));
    expect(factKey("Node.js")).not.toBe(factKey("React"));
  });
});
