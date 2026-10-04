"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aiErrorMessage } from "@/lib/ai/errors";
import { getAccount } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { createInterview, getQuestionWithOffer, saveAnswer } from "@/lib/data/interviews";
import { getOfferDetail } from "@/lib/data/offers";
import { answerFeedback, MAX_ANSWER } from "@/lib/interview/feedback";
import { toLang } from "@/lib/interview/copy";
import { generateQuestions } from "@/lib/interview/generate";
import { FOCUSES } from "@/lib/interview/session";
import { findInterviewer } from "@/lib/interviewers";
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
  const facts = (await listFacts(account.userId)).filter((f) => f.validated);
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
      { language, focus, persona: personaInstructions(interviewer) },
    );
    if (generated.length < 4) return fail("This model could not return valid output — try another model.", "Ce modèle n'a pas renvoyé de réponse valide — essaie un autre modèle.");
    const interviewId = await createInterview(account.userId, detail.offer.id, generated, { interviewerId: interviewer.id, language, focus });
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
