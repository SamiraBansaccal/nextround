"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAccount, requireUserId } from "@/lib/auth";
import { createFact, deleteFact, listFacts, updateFact } from "@/lib/data/facts";
import { aiErrorMessage } from "@/lib/ai/errors";
import { PROFILE_COPY } from "@/lib/i18n/profile";
import { getUiLang } from "@/lib/i18n/server";
import { fill } from "@/lib/interview/copy";
import { addSource, cvRef, getCvSource, removeCvSource, setCvDocument } from "@/lib/data/sources";
import { fetchRelevantRepos, repoToFactText } from "@/lib/github";
import { codewarsFact, codewarsProfileSchema, codewarsUsername } from "@/lib/profile/codewars";
import { isEmptyCvDocument, structureCv } from "@/lib/profile/cv-document";
import { factKey, proposeFactsFromText } from "@/lib/profile/extract-facts";

/** Messages in the site's language (the facts themselves keep the language they were written in). */
async function uiCopy() {
  const ui = await getUiLang();
  return { ui, t: PROFILE_COPY[ui] };
}

export type ActionResult = { ok: true; message: string; sourceId?: string } | { ok: false; error: string };

/** GitHub import: proposes one project fact per relevant public repo (source_ref = repo URL). */
export async function importGithubAction(): Promise<ActionResult> {
  const { t } = await uiCopy();
  const account = await getAccount();
  if (!account.githubLogin) return { ok: false, error: t.githubSignInFirst };
  let repos;
  try {
    repos = await fetchRelevantRepos(account.githubLogin);
  } catch {
    return { ok: false, error: t.githubDown };
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
    message: fresh.length ? fill(t.githubProposed, { count: fresh.length }) : t.upToDate,
  };
}

const idSchema = z.string().uuid();

export async function validateFactAction(id: unknown): Promise<ActionResult> {
  const { t } = await uiCopy();
  const userId = await requireUserId();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success || !(await updateFact(userId, parsed.data, { validated: true }))) return { ok: false, error: t.factNotFound };
  revalidatePath("/", "layout");
  return { ok: true, message: t.validatedMsg };
}

export async function rejectFactAction(id: unknown): Promise<ActionResult> {
  const { t } = await uiCopy();
  const userId = await requireUserId();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success || !(await deleteFact(userId, parsed.data))) return { ok: false, error: t.factNotFound };
  revalidatePath("/", "layout");
  return { ok: true, message: t.removed };
}

const editSchema = z.object({ id: z.string().uuid(), text: z.string().trim().min(3).max(500) });

export async function editFactAction(input: unknown): Promise<ActionResult> {
  const { t } = await uiCopy();
  const userId = await requireUserId();
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t.textLength };
  if (!(await updateFact(userId, parsed.data.id, { text: parsed.data.text }))) return { ok: false, error: t.factNotFound };
  revalidatePath("/", "layout");
  return { ok: true, message: t.saved };
}

const manualSchema = z.object({
  type: z.enum(["experience", "skill", "project", "education", "language", "achievement"]),
  text: z.string().trim().min(3).max(500),
});

/** Manual facts (e.g. LeetCode) are written by the user, so they are validated directly. */
export async function addManualFactAction(input: unknown): Promise<ActionResult> {
  const { t } = await uiCopy();
  const userId = await requireUserId();
  const parsed = manualSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t.chooseType };
  await createFact(userId, { ...parsed.data, source: "manual", validated: true });
  revalidatePath("/", "layout");
  return { ok: true, message: t.factAdded };
}

// ---------- Phase 3: Codewars, CV / LinkedIn PDFs (as many as you want), onboarding chat ----------

/** Codewars (public profile): proposes one achievement fact with the rank, katas and languages. */
export async function importCodewarsAction(username: unknown): Promise<ActionResult> {
  const { t } = await uiCopy();
  const userId = await requireUserId();
  const parsed = codewarsUsername.safeParse(username);
  if (!parsed.success) return { ok: false, error: t.codewarsInvalid };
  let profile;
  try {
    const response = await fetch(`https://www.codewars.com/api/v1/users/${encodeURIComponent(parsed.data)}`, {
      headers: { "User-Agent": "NextRound" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (response.status === 404) return { ok: false, error: t.codewarsUnknown };
    profile = codewarsProfileSchema.parse(await response.json());
  } catch {
    return { ok: false, error: t.codewarsDown };
  }
  const { text, sourceRef } = codewarsFact(profile);
  const existing = (await listFacts(userId)).find((f) => f.source === "codewars" && f.sourceRef === sourceRef);
  if (existing) await updateFact(userId, existing.id, { text, validated: false });
  else await createFact(userId, { type: "achievement", text, source: "codewars", sourceRef, validated: false });
  await addSource(userId, "codewars", sourceRef);
  revalidatePath("/", "layout");
  return { ok: true, message: t.codewarsProposed };
}

const cvSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  text: z.string().trim().min(100).max(60_000), // under 100 characters: probably a scan
});

/**
 * One CV or LinkedIn PDF: the browser extracted its text. In parallel, the AI proposes facts (each with
 * a verified quote) and structures the CV as a document (each string checked against the text).
 */
export async function importCvTextAction(input: unknown): Promise<ActionResult> {
  const { ui, t } = await uiCopy();
  const account = await getAccount();
  const parsed = cvSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.path[0] === "text" && parsed.error.issues[0].code === "too_small" ? t.scannedPdf : t.invalidFile };
  const text = parsed.data.text.slice(0, 15_000);
  const ctx = { userId: account.userId, isOwner: account.isOwner };
  const [factsResult, documentResult] = await Promise.allSettled([proposeFactsFromText(ctx, text, "cv"), structureCv(ctx, text)]);
  if (factsResult.status === "rejected") return { ok: false, error: aiErrorMessage(factsResult.reason, ui) };
  const result = factsResult.value;
  const document = documentResult.status === "fulfilled" && !isEmptyCvDocument(documentResult.value.document) ? documentResult.value.document : null;
  const source = await addSource(account.userId, "cv_upload", parsed.data.fileName, { text, document });
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
    sourceId: source.id,
    message:
      fill(added === 1 ? t.cvImportedOne : t.cvImportedMany, { file: parsed.data.fileName, count: added }) +
      (result.dropped ? fill(t.cvDropped, { count: result.dropped }) : "") +
      "." +
      (document ? "" : t.cvNotLaidOut),
  };
}

/** Lays out one of the user's CVs as a document again, from the text kept at import. */
export async function structureCvAction(sourceId: unknown): Promise<ActionResult> {
  const { ui, t } = await uiCopy();
  const account = await getAccount();
  const source = typeof sourceId === "string" ? await getCvSource(account.userId, sourceId) : null;
  if (!source) return { ok: false, error: t.cvNotFound };
  if (!source.text) return { ok: false, error: t.cvNoText };
  try {
    const { document } = await structureCv({ userId: account.userId, isOwner: account.isOwner }, source.text);
    if (isEmptyCvDocument(document)) return { ok: false, error: t.cvNothingVerified };
    await setCvDocument(account.userId, source.id, document);
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, ui) };
  }
  revalidatePath("/profile");
  return { ok: true, sourceId: source.id, message: t.cvLaidOut };
}

export async function removeCvAction(sourceId: unknown): Promise<ActionResult> {
  const { t } = await uiCopy();
  const userId = await requireUserId();
  const ok = typeof sourceId === "string" && (await removeCvSource(userId, sourceId));
  revalidatePath("/", "layout");
  return ok ? { ok: true, message: t.cvRemoved } : { ok: false, error: t.cvNotFound };
}

const chatSchema = z.array(z.object({ question: z.string().max(300), answer: z.string().trim().max(2000) })).min(1).max(8);

/** Onboarding chat: facts proposed from the user's own answers, each with a quote from them. */
export async function chatFactsAction(input: unknown): Promise<ActionResult> {
  const { ui, t } = await uiCopy();
  const account = await getAccount();
  const parsed = chatSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t.answerOne };
  const answers = parsed.data.filter((a) => a.answer.length > 0);
  if (answers.length === 0) return { ok: false, error: t.answerOne };
  // Only the ANSWERS are the source: quotes must come from what the user wrote, not from the questions.
  const text = answers.map((a) => a.answer).join("\n\n");
  let result;
  try {
    result = await proposeFactsFromText({ userId: account.userId, isOwner: account.isOwner }, text, "chat");
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, ui) };
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
  return { ok: true, message: fill(added === 1 ? t.chatProposedOne : t.chatProposedMany, { count: added }) };
}

export async function validateAllAction(): Promise<ActionResult> {
  const { t } = await uiCopy();
  const userId = await requireUserId();
  const pending = (await listFacts(userId)).filter((f) => !f.validated);
  for (const f of pending) await updateFact(userId, f.id, { validated: true });
  revalidatePath("/", "layout");
  return { ok: true, message: fill(t.validatedCount, { count: pending.length }) };
}

const aiAssistedSchema = z.object({ id: z.string().uuid(), aiAssisted: z.boolean() });

/**
 * Marks a project as built with AI ("vibe coding") or written by hand. A vibe-coded project stays in the
 * profile (interest in AI, creativity, hackathons) but never proves mastery of its technologies.
 */
export async function setAiAssistedAction(input: unknown): Promise<ActionResult> {
  const { t } = await uiCopy();
  const userId = await requireUserId();
  const parsed = aiAssistedSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t.factNotFound };
  const fact = await updateFact(userId, parsed.data.id, { aiAssisted: parsed.data.aiAssisted });
  if (!fact) return { ok: false, error: t.factNotFound };
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: parsed.data.aiAssisted
      ? t.markedAi
      : t.markedYours,
  };
}

const manySchema = z.array(z.string().uuid()).min(1).max(200);

/** Validates several facts at once (e.g. all the facts proposed from one CV). */
export async function validateManyAction(ids: unknown): Promise<ActionResult> {
  const { t } = await uiCopy();
  const userId = await requireUserId();
  const parsed = manySchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: t.factsNotFound };
  let kept = 0;
  for (const id of parsed.data) if (await updateFact(userId, id, { validated: true })) kept++;
  revalidatePath("/", "layout");
  return { ok: true, message: fill(kept === 1 ? t.keptOne : t.keptMany, { count: kept }) };
}
