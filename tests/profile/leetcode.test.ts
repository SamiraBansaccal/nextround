import { describe, expect, it } from "vitest";
import { leetcodeFact, leetcodeResponseSchema, leetcodeUsername } from "@/lib/profile/leetcode";

// LeetCode public profile -> one achievement fact.

describe("LeetCode import", () => {
  it("turns the public stats into one fact linked to the profile", () => {
    const parsed = leetcodeResponseSchema.parse({
      data: { matchedUser: { username: "sam_b", submitStatsGlobal: { acSubmissionNum: [{ difficulty: "All", count: 12 }, { difficulty: "Easy", count: 9 }, { difficulty: "Medium", count: 3 }, { difficulty: "Hard", count: 0 }] } } },
    });
    expect(leetcodeFact(parsed.data.matchedUser!)).toEqual({ text: "LeetCode: 12 problems solved (9 easy, 3 medium, 0 hard)", sourceRef: "https://leetcode.com/u/sam_b/" });
  });

  it("accepts an unknown user (null) and refuses odd usernames", () => {
    expect(leetcodeResponseSchema.parse({ data: { matchedUser: null } }).data.matchedUser).toBeNull();
    expect(leetcodeUsername.safeParse("sam b").success).toBe(false);
    expect(leetcodeUsername.safeParse("../admin").success).toBe(false);
  });
});
