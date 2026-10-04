import { describe, expect, it } from "vitest";
import { groupNearDuplicates, isNearDuplicate } from "@/lib/profile/dedupe-facts";

// Several CVs, one fact base: the same fact written differently is shown once.

describe("near-duplicate facts", () => {
  it("sees the same fact written differently in two CVs", () => {
    expect(isNearDuplicate("Développeuse Java – Collabr (2024)", "Développeuse Java chez Collabr, 2024")).toBe(true);
    expect(isNearDuplicate("Formation Java", "Formation Java au Bruxelles Formation, en cours")).toBe(false); // two words only: too short to merge
    expect(isNearDuplicate("Professeure de mathématiques, Athénée Royal (2015-2019)", "Professeure de mathématiques à l'Athénée Royal, 2015-2019")).toBe(true);
  });

  it("keeps different facts apart", () => {
    expect(isNearDuplicate("Développeuse Java chez Collabr", "Développeuse React chez Collabr")).toBe(false);
    expect(isNearDuplicate("Anglais : C1", "Néerlandais : B1")).toBe(false);
  });

  it("shows each fact once, in its most complete wording, and keeps the others as duplicates", () => {
    const facts = [
      { id: "1", type: "experience", text: "Développeuse Java chez Collabr, 2024" },
      { id: "2", type: "experience", text: "Développeuse Java – Collabr (2024), API REST Spring Boot" },
      { id: "3", type: "skill", text: "Docker" },
      { id: "4", type: "project", text: "Développeuse Java chez Collabr, 2024" }, // another type: never merged
    ];
    const groups = groupNearDuplicates(facts);
    expect(groups.map((g) => g.fact.id)).toEqual(["2", "3", "4"]);
    expect(groups[0].duplicates.map((d) => d.id)).toEqual(["1"]);
  });
});
