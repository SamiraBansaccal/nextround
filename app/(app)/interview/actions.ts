"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aiErrorMessage } from "@/lib/ai/errors";
import { getAccount, requireUserId } from "@/lib/server/auth";
import { listFacts } from "@/lib/data/facts";
import { factIndex, isCovered } from "@/lib/offers/coverage";
import { createInterview, deleteInterview, findSavedFeedback, getInterview, getQuestionWithOffer, listAskedBankIds, saveAnswer, switchInterviewer } from "@/lib/data/interviews";
import { getOfferDetail } from "@/lib/data/offers";
import { bankAnswerText, findBankQuestion, findTech } from "@/lib/interview/bank";
import { answerFeedback, isReusableFeedback, MAX_ANSWER } from "@/lib/interview/feedback";
import { toLang } from "@/lib/interview/copy";
import { buildQuestions, type OfferForInterview } from "@/lib/interview/generate";
import { hrAnswerText } from "@/lib/interview/hr-bank";
import { INTERVIEW_KINDS, practiceFocus, practiceOffer } from "@/lib/interview/practice";
import { parseTopic, type Topic, topicValue } from "@/lib/interview/tracks";
import { registerOf } from "@/lib/interview/register";
import { FOCUSES } from "@/lib/interview/session";
import { findInterviewer } from "@/lib/interviewers";
import { flavorInterview } from "@/lib/interviewers/flavor";
import type { Feedback } from "@/lib/types";

const startSchema = z.object({
  kind: z.enum(INTERVIEW_KINDS).default("offer"),
  offerId: z.string().uuid().nullish(),
  topic: z.string().trim().max(80).nullish(), // technology interviews: "track:<id>" or "tech:<id>"
  interviewerId: z.string().trim().min(1).max(80),
  language: z.enum(["en", "fr"]),
  focus: z.enum(FOCUSES).default("both"), // offer interviews only
});

export type StartInterviewInput = z.input<typeof startSchema>;

/**
 * Turns the setup screen's configuration into an interview session: on an offer (general, technical or
 * both), on a technology or a track (technical questions from the bank), or general HR questions; in
 * the chosen language, phrased in the chosen interviewer's style.
 */
export async function startInterviewAction(input: unknown): Promise<{ ok: true; interviewId: string } | { ok: false; error: string }> {
  const account = await getAccount();
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid interview settings." };
  const { kind, language } = parsed.data;
  const fail = (en: string, fr: string) => ({ ok: false as const, error: language === "fr" ? fr : en });
  const interviewer = findInterviewer(parsed.data.interviewerId);
  if (!interviewer) return fail("Choose an interviewer first.", "Choisis d'abord qui mène l'entretien.");

  let offer: OfferForInterview;
  let offerId: string | null = null;
  let focus = parsed.data.focus;
  let topic: Topic | null = null;
  let requirements: { text: string; quote: string; category: string; factIds: string[] }[] = [];
  if (kind === "offer") {
    const detail = parsed.data.offerId ? await getOfferDetail(account.userId, parsed.data.offerId) : null;
    if (!detail) return fail("Offer not found.", "Offre introuvable.");
    offerId = detail.offer.id;
    offer = {
      title: detail.offer.title,
      company: detail.offer.company,
      language: detail.offer.language,
      stack: detail.offer.stack,
      requirements: [], // filled below, once the validated facts are known
    };
    requirements = detail.requirements;
  } else {
    topic = kind === "technology" ? parseTopic(parsed.data.topic) : null;
    if (kind === "technology" && !topic) return fail("Choose a technology first.", "Choisis d'abord une technologie.");
    offer = practiceOffer(topic);
    focus = practiceFocus(kind);
  }

  const [allFacts, askedBefore] = await Promise.all([listFacts(account.userId), listAskedBankIds(account.userId)]);
  const facts = allFacts.filter((f) => f.validated);
  const profile = factIndex(allFacts); // a vibe-coded project never covers a technical requirement
  offer.requirements = requirements.map((r) => ({ text: r.text, quote: r.quote, covered: isCovered(r, profile) }));
  try {
    // Written in advance (question banks), so no AI call here: instant and in correct English or French.
    // The profile's technologies come only from facts that can prove one: not from vibe-coded projects.
    const generated = buildQuestions(offer, facts.filter((f) => !f.aiAssisted).map((f) => f.text), {
      language,
      focus,
      register: registerOf(interviewer.traits),
      askedBefore,
      stackOnly: kind === "technology",
    });
    if (generated.length === 0) return fail("No question could be prepared for this interview.", "Aucune question n'a pu être préparée pour cet entretien.");
    // What the interviewer says around each question (greeting, catchphrases, lead-ins): code, not AI.
    const lines = flavorInterview(interviewer, generated.map((q) => ({ tech: q.group === "technical" ? (q.techLabel ?? null) : null })), language);
    const questions = generated.map((q, i) => ({ ...q, intro: lines[i].intro, outro: lines[i].outro }));
    const interviewId = await createInterview(
      account.userId,
      offerId,
      questions,
      { interviewerId: interviewer.id, language, focus },
      kind === "offer" ? null : { kind, topic: topic ? topicValue(topic) : null },
    );
    revalidatePath("/", "layout");
    return { ok: true, interviewId };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, language) };
  }
}

const answerSchema = z.object({ questionId: z.string().uuid(), answer: z.string().trim().min(1).max(MAX_ANSWER) });

export async function submitAnswerAction(input: unknown): Promise<{ ok: true; feedback: Feedback } | { ok: false; error: string }> {
  const account = await getAccount();
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: `Write an answer of 1 to ${MAX_ANSWER} characters.` };
  const found = await getQuestionWithOffer(account.userId, parsed.data.questionId);
  if (!found) return { ok: false, error: "Question not found." };
  const lang = toLang(found.interview?.language); // feedback in the interview's language
  const facts = (await listFacts(account.userId)).filter((f) => f.validated);
  // A bank question's model answer guides the technical part of the feedback ("experience" ones have none).
  const bank = findBankQuestion(found.question.bankId);
  try {
    // The same answer to the same question already has feedback: reuse it (no new AI call), unless the
    // validated facts it relies on have changed since.
    const saved = await findSavedFeedback(account.userId, found.question.text, parsed.data.answer, found.interview?.offerId ?? null);
    const reusable = saved && isReusableFeedback(saved, new Set(facts.map((f) => f.id))) ? saved : null;
    const feedback = reusable ?? await answerFeedback(
      { userId: account.userId, isOwner: account.isOwner },
      {
        question: found.question.text,
        group: found.question.group,
        answer: parsed.data.answer,
        offerTitle: found.offer?.title ?? null,
        company: found.offer?.company ?? null,
        language: lang,
        reference: bank && bank.kind !== "experience" ? bankAnswerText(bank, lang) : hrAnswerText(found.question.bankId ?? "", lang),
      },
      facts,
    );
    await saveAnswer(account.userId, found.question.id, parsed.data.answer, feedback);
    revalidatePath("/", "layout");
    return { ok: true, feedback };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, lang) };
  }
}

/** Deletes one of the user's practice interviews (from the interviews list). */
export async function deleteInterviewAction(interviewId: unknown): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  const ok = typeof interviewId === "string" && (await deleteInterview(userId, interviewId));
  if (ok) revalidatePath("/", "layout");
  return { ok };
}

const switchSchema = z.object({ interviewId: z.string().uuid(), interviewerId: z.string().trim().min(1).max(80) });

/**
 * Changes who leads an interview in progress: the call shows the new interviewer, and the lines said
 * around the questions not answered yet are the new interviewer's. The questions themselves stay.
 */
export async function switchInterviewerAction(input: unknown): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  const parsed = switchSchema.safeParse(input);
  const interviewer = parsed.success ? findInterviewer(parsed.data.interviewerId) : null;
  if (!parsed.success || !interviewer) return { ok: false };
  const data = await getInterview(userId, parsed.data.interviewId);
  if (!data) return { ok: false };
  const lang = toLang(data.interview.language);
  const slots = data.questions.map((q) => ({ tech: q.group === "technical" ? (findTech(findBankQuestion(q.bankId)?.tech)?.label[lang] ?? null) : null }));
  const flavor = flavorInterview(interviewer, slots, lang);
  const lines = new Map(data.questions.map((q, i) => [q.id, { intro: flavor[i].intro, outro: flavor[i].outro }]));
  const ok = await switchInterviewer(userId, data.interview.id, interviewer.id, lines);
  if (ok) revalidatePath("/", "layout");
  return { ok };
}
