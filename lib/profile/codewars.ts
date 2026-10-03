import { z } from "zod";

// Codewars public profile -> one "achievement" fact. Pure, so it is unit-tested; the network call
// lives in the server action (app/(app)/profile/actions.ts).

export const codewarsUsername = z.string().trim().regex(/^[A-Za-z0-9_-]{1,40}$/);

export const codewarsProfileSchema = z.object({
  username: z.string(),
  ranks: z.object({
    overall: z.object({ name: z.string() }),
    languages: z.record(z.string(), z.object({ name: z.string(), score: z.number().optional() })).default({}),
  }),
  codeChallenges: z.object({ totalCompleted: z.number() }),
});

export type CodewarsProfile = z.infer<typeof codewarsProfileSchema>;

/** "Codewars: 5 kyu overall, 120 katas completed (javascript 5 kyu, python 6 kyu)" — best languages first. */
export function codewarsFact(profile: CodewarsProfile): { text: string; sourceRef: string } {
  const languages = Object.entries(profile.ranks.languages)
    .sort(([, a], [, b]) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5)
    .map(([lang, rank]) => `${lang} ${rank.name}`)
    .join(", ");
  return {
    text: `Codewars: ${profile.ranks.overall.name} overall, ${profile.codeChallenges.totalCompleted} katas completed${languages ? ` (${languages})` : ""}`,
    sourceRef: `https://www.codewars.com/users/${encodeURIComponent(profile.username)}`,
  };
}
