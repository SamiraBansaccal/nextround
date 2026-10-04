import { z } from "zod";

// LeetCode public profile -> one "achievement" fact (problems solved by difficulty). Pure, so it is
// unit-tested; the network call lives in the server action (app/(app)/profile/actions.ts).

export const leetcodeUsername = z.string().trim().regex(/^[A-Za-z0-9_-]{1,40}$/);

export const LEETCODE_QUERY = "query($u:String!){matchedUser(username:$u){username submitStatsGlobal{acSubmissionNum{difficulty count}}}}";

export const leetcodeResponseSchema = z.object({
  data: z.object({
    matchedUser: z
      .object({
        username: z.string(),
        submitStatsGlobal: z.object({ acSubmissionNum: z.array(z.object({ difficulty: z.string(), count: z.number() })) }),
      })
      .nullable(),
  }),
});

export type LeetcodeUser = NonNullable<z.infer<typeof leetcodeResponseSchema>["data"]["matchedUser"]>;

/** "LeetCode: 253 problems solved (60 easy, 141 medium, 52 hard)". */
export function leetcodeFact(user: LeetcodeUser): { text: string; sourceRef: string } {
  const count = (difficulty: string) => user.submitStatsGlobal.acSubmissionNum.find((s) => s.difficulty === difficulty)?.count ?? 0;
  return {
    text: `LeetCode: ${count("All")} problems solved (${count("Easy")} easy, ${count("Medium")} medium, ${count("Hard")} hard)`,
    sourceRef: `https://leetcode.com/u/${encodeURIComponent(user.username)}/`,
  };
}
