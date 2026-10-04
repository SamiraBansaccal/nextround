// When does a requirement of an offer count as covered by the candidate's profile? Only through facts
// the candidate VALIDATED. And a project built with AI ("vibe coding", marked in the profile) shows
// interest in AI, creativity, hackathons: it may support a soft requirement, never a technical one, so
// using TypeScript in a vibe-coded project never reads as "masters TypeScript". Pure (tests/offers/coverage.test.ts).

export interface CoverageFact {
  id: string;
  validated: boolean;
  aiAssisted: boolean;
}

export interface CoverableRequirement {
  category: string; // "tech" | "soft" | "language"
  factIds: readonly string[];
}

export function factIndex(facts: readonly CoverageFact[]): Map<string, CoverageFact> {
  return new Map(facts.map((f) => [f.id, f]));
}

/** May this fact prove a requirement of this category? */
export function canProve(fact: CoverageFact | undefined, category: string): boolean {
  return !!fact && fact.validated && !(category === "tech" && fact.aiAssisted);
}

/** The facts that prove a requirement today (facts can be removed, rejected or marked later). */
export function provingFactIds(requirement: CoverableRequirement, facts: ReadonlyMap<string, CoverageFact>): string[] {
  return requirement.factIds.filter((id) => canProve(facts.get(id), requirement.category));
}

export function isCovered(requirement: CoverableRequirement, facts: ReadonlyMap<string, CoverageFact>): boolean {
  return provingFactIds(requirement, facts).length > 0;
}

export function matchScore(requirements: readonly CoverableRequirement[], facts: ReadonlyMap<string, CoverageFact>) {
  const covered = requirements.filter((r) => isCovered(r, facts)).length;
  return { covered, total: requirements.length, score: requirements.length ? covered / requirements.length : 0 };
}
