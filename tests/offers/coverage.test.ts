import { describe, expect, it } from "vitest";
import { factIndex, isCovered, matchScore, provingFactIds } from "@/lib/offers/coverage";

// A requirement is covered only by facts the candidate validated; a vibe-coded project (built with AI)
// may support a soft requirement, never a technical one.

const facts = factIndex([
  { id: "own-c", validated: true, aiAssisted: false }, // minishell, written by hand
  { id: "vibe-ts", validated: true, aiAssisted: true }, // NextRound, built with AI
  { id: "draft", validated: false, aiAssisted: false }, // not validated yet
]);

describe("coverage", () => {
  it("lets a vibe-coded project support curiosity or creativity, never a technology", () => {
    expect(isCovered({ category: "tech", factIds: ["vibe-ts"] }, facts)).toBe(false);
    expect(isCovered({ category: "soft", factIds: ["vibe-ts"] }, facts)).toBe(true);
    expect(provingFactIds({ category: "tech", factIds: ["vibe-ts", "own-c"] }, facts)).toEqual(["own-c"]);
  });

  it("only counts validated facts that still exist", () => {
    expect(isCovered({ category: "tech", factIds: ["draft"] }, facts)).toBe(false);
    expect(isCovered({ category: "language", factIds: ["deleted"] }, facts)).toBe(false);
  });

  it("scores an offer from those rules", () => {
    const score = matchScore(
      [
        { category: "tech", factIds: ["own-c"] },
        { category: "tech", factIds: ["vibe-ts"] },
        { category: "soft", factIds: ["vibe-ts"] },
        { category: "tech", factIds: [] },
      ],
      facts,
    );
    expect(score).toEqual({ covered: 2, total: 4, score: 0.5 });
  });
});
