import { describe, expect, it } from "vitest";
import { codewarsFact, codewarsProfileSchema, codewarsUsername } from "@/lib/profile/codewars";

describe("Codewars import", () => {
  it("turns the public profile into one achievement, best languages first", () => {
    const profile = codewarsProfileSchema.parse({
      username: "alex",
      honor: 10, // extra fields from the API are ignored
      ranks: {
        overall: { name: "5 kyu" },
        languages: { python: { name: "6 kyu", score: 300 }, javascript: { name: "5 kyu", score: 900 } },
      },
      codeChallenges: { totalCompleted: 120 },
    });
    expect(codewarsFact(profile)).toEqual({
      text: "Codewars: 5 kyu overall, 120 katas completed (javascript 5 kyu, python 6 kyu)",
      sourceRef: "https://www.codewars.com/users/alex",
    });
  });
  it("only accepts plain usernames (no path tricks)", () => {
    expect(codewarsUsername.safeParse("alex_99").success).toBe(true);
    expect(codewarsUsername.safeParse("../admin").success).toBe(false);
    expect(codewarsUsername.safeParse("a b").success).toBe(false);
  });
});
