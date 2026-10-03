"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAccount, requireUserId } from "@/lib/auth";
import { createFact, deleteFact, listFacts, updateFact } from "@/lib/data/facts";
import { fetchRelevantRepos, repoToFactText } from "@/lib/github";

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

/** GitHub import: proposes one project fact per relevant public repo (source_ref = repo URL). */
export async function importGithubAction(): Promise<ActionResult> {
  const account = await getAccount();
  if (!account.githubLogin) return { ok: false, error: "Sign in with GitHub to import your repositories." };
  let repos;
  try {
    repos = await fetchRelevantRepos(account.githubLogin);
  } catch {
    return { ok: false, error: "GitHub could not be reached. Please try again in a moment." };
  }
  const existingRefs = new Set((await listFacts(account.userId)).map((f) => f.sourceRef));
  const fresh = repos.filter((r) => !existingRefs.has(r.html_url));
  for (const repo of fresh) {
    await createFact(account.userId, {
      type: "project",
      text: repoToFactText(repo),
      source: "github",
      sourceRef: repo.html_url,
      validated: false,
    });
  }
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: fresh.length ? `${fresh.length} projects proposed from GitHub: validate the ones that are yours.` : "Already up to date.",
  };
}

const idSchema = z.string().uuid();

export async function validateFactAction(id: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success || !(await updateFact(userId, parsed.data, { validated: true }))) return { ok: false, error: "Fact not found." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Validated." };
}

export async function rejectFactAction(id: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success || !(await deleteFact(userId, parsed.data))) return { ok: false, error: "Fact not found." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Removed." };
}

const editSchema = z.object({ id: z.string().uuid(), text: z.string().trim().min(3).max(500) });

export async function editFactAction(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Text must be 3 to 500 characters." };
  if (!(await updateFact(userId, parsed.data.id, { text: parsed.data.text }))) return { ok: false, error: "Fact not found." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved." };
}

const manualSchema = z.object({
  type: z.enum(["experience", "skill", "project", "education", "language", "achievement"]),
  text: z.string().trim().min(3).max(500),
});

/** Manual facts (e.g. LeetCode) are written by the user, so they are validated directly. */
export async function addManualFactAction(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = manualSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose a type and write 3 to 500 characters." };
  await createFact(userId, { ...parsed.data, source: "manual", validated: true });
  revalidatePath("/", "layout");
  return { ok: true, message: "Fact added." };
}
