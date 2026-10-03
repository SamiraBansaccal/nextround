"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAccount, requireUserId } from "@/lib/auth";
import { createFact, deleteFact, listFacts, updateFact } from "@/lib/data/facts";
import { aiErrorMessage } from "@/lib/ai/errors";
import { addSource, cvRef, removeCvSource } from "@/lib/data/sources";
import { fetchRelevantRepos, repoToFactText } from "@/lib/github";
import { factKey, proposeFactsFromText } from "@/lib/profile/extract-facts";

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

// ---------- Phase 3: Codewars, CV / LinkedIn PDFs (as many as you want), onboarding chat ----------

const codewarsUser = z.string().trim().regex(/^[A-Za-z0-9_-]{1,40}$/);
const codewarsSchema = z.object({
  username: z.string(),
  ranks: z.object({
    overall: z.object({ name: z.string() }),
    languages: z.record(z.string(), z.object({ name: z.string() })).default({}),
  }),
  codeChallenges: z.object({ totalCompleted: z.number() }),
});

/** Codewars (public profile): proposes one achievement fact with the rank, katas and languages. */
export async function importCodewarsAction(username: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = codewarsUser.safeParse(username);
  if (!parsed.success) return { ok: false, error: "Enter a valid Codewars username." };
  let profile;
  try {
    const response = await fetch(`https://www.codewars.com/api/v1/users/${encodeURIComponent(parsed.data)}`, {
      headers: { "User-Agent": "NextRound" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (response.status === 404) return { ok: false, error: "No Codewars user with this name." };
    profile = codewarsSchema.parse(await response.json());
  } catch {
    return { ok: false, error: "Codewars could not be reached. Please try again." };
  }
  const languages = Object.entries(profile.ranks.languages)
    .slice(0, 5)
    .map(([lang, rank]) => `${lang} ${rank.name}`)
    .join(", ");
  const text = `Codewars: ${profile.ranks.overall.name} overall, ${profile.codeChallenges.totalCompleted} katas completed${languages ? ` (${languages})` : ""}`;
  const ref = `https://www.codewars.com/users/${encodeURIComponent(profile.username)}`;
  const existing = (await listFacts(userId)).find((f) => f.source === "codewars" && f.sourceRef === ref);
  if (existing) await updateFact(userId, existing.id, { text, validated: false });
  else await createFact(userId, { type: "achievement", text, source: "codewars", sourceRef: ref, validated: false });
  await addSource(userId, "codewars", ref);
  revalidatePath("/", "layout");
  return { ok: true, message: "Codewars achievement proposed: check it, then keep it." };
}

const cvSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  text: z.string().trim().min(100, "This PDF has almost no text (is it a scan?).").max(60_000),
});

/** One CV or LinkedIn PDF: the browser extracted its text; the AI proposes facts with verified quotes. */
export async function importCvTextAction(input: unknown): Promise<ActionResult> {
  const account = await getAccount();
  const parsed = cvSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid file." };
  const text = parsed.data.text.slice(0, 15_000);
  let result;
  try {
    result = await proposeFactsFromText({ userId: account.userId, isOwner: account.isOwner }, text, "cv");
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error) };
  }
  const source = await addSource(account.userId, "cv_upload", parsed.data.fileName);
  const known = new Set((await listFacts(account.userId)).map((f) => factKey(f.text)));
  let added = 0;
  for (const fact of result.facts) {
    if (known.has(factKey(fact.text))) continue; // already found in another CV
    known.add(factKey(fact.text));
    await createFact(account.userId, { ...fact, source: "cv_upload", sourceRef: cvRef(source.id), validated: false });
    added++;
  }
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: `${parsed.data.fileName}: ${added} new fact${added === 1 ? "" : "s"} to review${result.dropped ? ` (${result.dropped} dropped: quote not found in the PDF)` : ""}.`,
  };
}

export async function removeCvAction(sourceId: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const ok = typeof sourceId === "string" && (await removeCvSource(userId, sourceId));
  revalidatePath("/", "layout");
  return ok ? { ok: true, message: "CV removed (its validated facts are kept)." } : { ok: false, error: "CV not found." };
}

const chatSchema = z.array(z.object({ question: z.string().max(300), answer: z.string().trim().max(2000) })).min(1).max(8);

/** Onboarding chat: facts proposed from the user's own answers, each with a quote from them. */
export async function chatFactsAction(input: unknown): Promise<ActionResult> {
  const account = await getAccount();
  const parsed = chatSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please answer at least one question." };
  const answers = parsed.data.filter((a) => a.answer.length > 0);
  if (answers.length === 0) return { ok: false, error: "Please answer at least one question." };
  // Only the ANSWERS are the source: quotes must come from what the user wrote, not from the questions.
  const text = answers.map((a) => a.answer).join("\n\n");
  let result;
  try {
    result = await proposeFactsFromText({ userId: account.userId, isOwner: account.isOwner }, text, "chat");
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error) };
  }
  const known = new Set((await listFacts(account.userId)).map((f) => factKey(f.text)));
  let added = 0;
  for (const fact of result.facts) {
    if (known.has(factKey(fact.text))) continue;
    known.add(factKey(fact.text));
    await createFact(account.userId, { ...fact, source: "chat", validated: false });
    added++;
  }
  await addSource(account.userId, "chat", "onboarding");
  revalidatePath("/", "layout");
  return { ok: true, message: `${added} fact${added === 1 ? "" : "s"} proposed from your answers: review them below.` };
}

export async function validateAllAction(): Promise<ActionResult> {
  const userId = await requireUserId();
  const pending = (await listFacts(userId)).filter((f) => !f.validated);
  for (const f of pending) await updateFact(userId, f.id, { validated: true });
  revalidatePath("/", "layout");
  return { ok: true, message: `${pending.length} facts validated.` };
}
