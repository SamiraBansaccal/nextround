import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { answers, interviews, offers, questions } from "@/lib/db/schema";
import { isUuid } from "@/lib/ids";
import type { GeneratedQuestion } from "@/lib/interview/generate";
import type { Feedback } from "@/lib/types";

// Interviews, questions and answers: every query filters on the session user id.

export async function createInterview(userId: string, offerId: string, generated: GeneratedQuestion[]): Promise<string> {
  const db = getDb();
  const [interview] = await db.insert(interviews).values({ userId, offerId, mode: "text" }).returning({ id: interviews.id });
  await db.insert(questions).values(
    generated.map((q, i) => ({
      userId,
      interviewId: interview.id,
      position: i,
      group: q.group,
      text: q.text,
      source: q.source,
      suggestedAnswer: q.suggestedAnswer,
    })),
  );
  await db.update(offers).set({ status: "interview" }).where(and(eq(offers.id, offerId), eq(offers.userId, userId), eq(offers.status, "applied")));
  return interview.id;
}

export async function listInterviewIdsForOffer(userId: string, offerId: string): Promise<string[]> {
  if (!isUuid(offerId)) return [];
  const rows = await getDb()
    .select({ id: interviews.id })
    .from(interviews)
    .where(and(eq(interviews.offerId, offerId), eq(interviews.userId, userId)))
    .orderBy(asc(interviews.createdAt));
  return rows.map((r) => r.id);
}

export async function getInterview(userId: string, interviewId: string) {
  if (!isUuid(interviewId)) return null;
  const db = getDb();
  const [interview] = await db
    .select()
    .from(interviews)
    .where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId)))
    .limit(1);
  if (!interview) return null;
  const [offer] = await db
    .select()
    .from(offers)
    .where(and(eq(offers.id, interview.offerId), eq(offers.userId, userId)))
    .limit(1);
  const qs = await db
    .select()
    .from(questions)
    .where(and(eq(questions.interviewId, interview.id), eq(questions.userId, userId)))
    .orderBy(asc(questions.position));
  const ans = qs.length
    ? await db
        .select()
        .from(answers)
        .where(and(inArray(answers.questionId, qs.map((q) => q.id)), eq(answers.userId, userId)))
        .orderBy(desc(answers.createdAt))
    : [];
  return { interview, offer: offer ?? null, questions: qs, answers: ans };
}

export async function getQuestionWithOffer(userId: string, questionId: string) {
  if (!isUuid(questionId)) return null;
  const db = getDb();
  const [question] = await db
    .select()
    .from(questions)
    .where(and(eq(questions.id, questionId), eq(questions.userId, userId)))
    .limit(1);
  if (!question) return null;
  const [interview] = await db
    .select()
    .from(interviews)
    .where(and(eq(interviews.id, question.interviewId), eq(interviews.userId, userId)))
    .limit(1);
  const [offer] = interview
    ? await db.select().from(offers).where(and(eq(offers.id, interview.offerId), eq(offers.userId, userId))).limit(1)
    : [];
  return { question, offer: offer ?? null };
}

export async function saveAnswer(userId: string, questionId: string, answer: string, feedback: Feedback) {
  const [row] = await getDb().insert(answers).values({ userId, questionId, answer, feedback }).returning();
  return row;
}

/** Number of practice interviews per offer, for the dashboard. */
export async function countInterviewsByOffer(userId: string): Promise<Map<string, number>> {
  const rows = await getDb().select({ offerId: interviews.offerId }).from(interviews).where(eq(interviews.userId, userId));
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.offerId, (counts.get(r.offerId) ?? 0) + 1);
  return counts;
}
