"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aiErrorMessage } from "@/lib/ai/errors";
import { getAccount } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { createInterview, getQuestionWithOffer, saveAnswer } from "@/lib/data/interviews";
import { getOfferDetail } from "@/lib/data/offers";
import { answerFeedback, MAX_ANSWER } from "@/lib/interview/feedback";
import { generateQuestions } from "@/lib/interview/generate";
import type { Feedback } from "@/lib/types";

export async function startInterviewAction(offerId: unknown): Promise<{ ok: true; interviewId: string } | { ok: false; error: string }> {
  const account = await getAccount();
  if (typeof offerId !== "string") return { ok: false, error: "Offer not found." };
  const detail = await getOfferDetail(account.userId, offerId);
  if (!detail) return { ok: false, error: "Offer not found." };
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
    );
    if (generated.length < 4) return { ok: false, error: "This model could not return valid output — try another model." };
    const interviewId = await createInterview(account.userId, detail.offer.id, generated);
    revalidatePath("/", "layout");
    return { ok: true, interviewId };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error) };
  }
}

const answerSchema = z.object({ questionId: z.string().uuid(), answer: z.string().trim().min(1).max(MAX_ANSWER) });

export async function submitAnswerAction(input: unknown): Promise<{ ok: true; feedback: Feedback } | { ok: false; error: string }> {
  const account = await getAccount();
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: `Write an answer of 1 to ${MAX_ANSWER} characters.` };
  const found = await getQuestionWithOffer(account.userId, parsed.data.questionId);
  if (!found) return { ok: false, error: "Question not found." };
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
        language: found.offer?.language ?? null,
      },
      facts,
    );
    await saveAnswer(account.userId, found.question.id, parsed.data.answer, feedback);
    revalidatePath("/", "layout");
    return { ok: true, feedback };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error) };
  }
}
