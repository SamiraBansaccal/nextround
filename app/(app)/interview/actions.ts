"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aiErrorMessage } from "@/lib/ai/errors";
import { getAccount, requireUserId } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { createInterview, deleteInterview, getInterview, getQuestionWithOffer, listAskedBankIds, saveAnswer, switchInterviewer } from "@/lib/data/interviews";
import { getOfferDetail } from "@/lib/data/offers";
import { bankAnswerText, findBankQuestion, findTech } from "@/lib/interview/bank";
import { answerFeedback, MAX_ANSWER } from "@/lib/interview/feedback";
import { toLang } from "@/lib/interview/copy";
import { generateQuestions } from "@/lib/interview/generate";
import { registerOf } from "@/lib/interview/register";
import { FOCUSES } from "@/lib/interview/session";
import { findInterviewer } from "@/lib/interviewers";
import { flavorInterview } from "@/lib/interviewers/flavor";
import { personaInstructions } from "@/lib/interviewers/persona";
import type { Feedback } from "@/lib/types";

const startSchema = z.object({
  offerId: z.string().uuid(),
  interviewerId: z.string().trim().min(1).max(80),
  language: z.enum(["en", "fr"]),
  focus: z.enum(FOCUSES),
});

/**
 * Turns the setup screen's configuration into an interview session: questions of the chosen kind, in
 * the chosen language, phrased in the chosen interviewer's style.
 */
export async function startInterviewAction(input: unknown): Promise<{ ok: true; interviewId: string } | { ok: false; error: string }> {
  const account = await getAccount();
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Offer not found." };
  const { language, focus } = parsed.data;
  const fail = (en: string, fr: string) => ({ ok: false as const, error: language === "fr" ? fr : en });
  const interviewer = findInterviewer(parsed.data.interviewerId);
  if (!interviewer) return fail("Choose an interviewer first.", "Choisis d'abord qui mène l'entretien.");
  const detail = await getOfferDetail(account.userId, parsed.data.offerId);
  if (!detail) return fail("Offer not found.", "Offre introuvable.");
  const [allFacts, askedBefore] = await Promise.all([listFacts(account.userId), listAskedBankIds(account.userId)]);
  const facts = allFacts.filter((f) => f.validated);
  const valid = new Set(facts.map((f) => f.id));
  try {
    const generated = await generateQuestions(
      { userId: account.userId, isOwner: account.isOwner },
      {
        title: detail.offer.title,
        company: detail.offer.company,
        language: detail.offer.language,
        stack: detail.offer.stack,
        requirements: detail.requirements.map((r) => ({ text: r.text, quote: r.quote, covered: r.factIds.some((id) => valid.has(id)) })),
      },
      facts,
      { language, focus, persona: personaInstructions(interviewer), register: registerOf(interviewer.traits), askedBefore },
    );
    if (generated.length < 4) return fail("This model could not return valid output — try another model.", "Ce modèle n'a pas renvoyé de réponse valide — essaie un autre modèle.");
    // What the interviewer says around each question (greeting, catchphrases, lead-ins): code, not AI.
    const lines = flavorInterview(interviewer, generated.map((q) => ({ tech: q.group === "technical" ? (q.techLabel ?? null) : null })), language);
    const questions = generated.map((q, i) => ({ ...q, intro: lines[i].intro, outro: lines[i].outro }));
    const interviewId = await createInterview(account.userId, detail.offer.id, questions, { interviewerId: interviewer.id, language, focus });
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
    const feedback = await answerFeedback(
      { userId: account.userId, isOwner: account.isOwner },
      {
        question: found.question.text,
        group: found.question.group,
        answer: parsed.data.answer,
        offerTitle: found.offer?.title ?? null,
        company: found.offer?.company ?? null,
        language: lang,
        reference: bank && bank.kind !== "experience" ? bankAnswerText(bank, lang) : null,
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
