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

const ONE_DAY = 24 * 60 * 60_000;
const loginCache = new Map<string, { at: number; login: string }>();

/**
 * The current username of a GitHub account, from its numeric id (public API, no token). The sign-in keeps the
 * stable id; the username can change, so it is looked up and kept a day. Null when GitHub cannot answer (only
 * answers are kept, never failures).
 */
export async function githubLoginForId(id: string): Promise<string | null> {
  if (!/^\d+$/.test(id)) return null;
  const hit = loginCache.get(id);
  if (hit && Date.now() - hit.at < ONE_DAY) return hit.login;
  try {
    const response = await fetch(`https://api.github.com/user/${id}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "NextRound" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) return hit?.login ?? null;
    const parsed = z.object({ login: z.string().regex(LOGIN_RE) }).safeParse(await response.json());
    if (!parsed.success) return hit?.login ?? null;
    loginCache.set(id, { at: Date.now(), login: parsed.data.login });
    return parsed.data.login;
  } catch {
    return hit?.login ?? null;
  }
}

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
