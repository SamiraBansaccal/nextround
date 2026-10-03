import "server-only";
import { z } from "zod";

// Public GitHub data for the profile import: one request, no token needed (public repos only).
const repoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  html_url: z.string().url(),
  pushed_at: z.string().nullable(),
  fork: z.boolean(),
  archived: z.boolean().optional(),
});

export type GithubRepo = z.infer<typeof repoSchema>;

const LOGIN_RE = /^[a-z\d](?:[a-z\d-]{0,38})$/i;

/** Relevant public repos of a user: not forks, not archived, most recently pushed first. */
export async function fetchRelevantRepos(login: string, limit = 12): Promise<GithubRepo[]> {
  if (!LOGIN_RE.test(login)) throw new Error("Invalid GitHub username");
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=100&sort=pushed&type=owner`,
    {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "NextRound" },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
  const repos = z.array(repoSchema).parse(await response.json());
  return repos.filter((r) => !r.fork && !r.archived).slice(0, limit);
}

/** One proposed "project" fact per repo, built only from what GitHub returned. */
export function repoToFactText(repo: GithubRepo): string {
  const parts = [repo.name];
  if (repo.description) parts.push(`— ${repo.description.trim()}`);
  if (repo.language) parts.push(`(${repo.language})`);
  return parts.join(" ");
}
