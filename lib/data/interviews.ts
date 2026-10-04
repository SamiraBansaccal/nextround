import "server-only";
import { and, asc, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { answers, interviews, offers, questions } from "@/lib/db/schema";
import { isUuid } from "@/lib/ids";
import { DEFAULT_INTERVIEWER_ID } from "@/lib/interviewers";
import type { InterviewConfig } from "@/lib/interview/session";
import type { GeneratedQuestion } from "@/lib/interview/generate";
import type { Feedback } from "@/lib/types";

// Interviews, questions and answers: every query filters on the session user id.

const DEFAULT_CONFIG: InterviewConfig = { interviewerId: DEFAULT_INTERVIEWER_ID, language: "en", focus: "both" };

/**
 * Stores an interview session: its configuration (interviewer, language, questions) and its questions.
 * `offerId` null = a practice interview (`practice`: on a technology topic, or general HR questions).
 */
export async function createInterview(
  userId: string,
  offerId: string | null,
  generated: GeneratedQuestion[],
  config: Partial<InterviewConfig> = {},
  practice: { kind: "technology" | "hr"; topic: string | null } | null = null,
): Promise<string> {
  const { interviewerId, language, focus } = { ...DEFAULT_CONFIG, ...config };
  const db = getDb();
  const kind = offerId ? "offer" : (practice?.kind ?? "hr");
  const topic = offerId ? null : (practice?.topic ?? null);
  const [interview] = await db.insert(interviews).values({ userId, offerId, kind, topic, mode: "text", interviewerId, language, focus }).returning({ id: interviews.id });
  await db.insert(questions).values(
    generated.map((q, i) => ({
      userId,
      interviewId: interview.id,
      position: i,
      group: q.group,
      type: q.type ?? null,
      text: q.text,
      source: q.source,
      suggestedAnswer: q.suggestedAnswer,
      bankId: q.bankId ?? null,
      intro: q.intro ?? null,
      outro: q.outro ?? null,
    })),
  );
  if (offerId) await db.update(offers).set({ status: "interview" }).where(and(eq(offers.id, offerId), eq(offers.userId, userId), eq(offers.status, "applied")));
  return interview.id;
}

/** The bank questions already asked to this user, in any interview: the next ones favour new questions. */
export async function listAskedBankIds(userId: string): Promise<Set<string>> {
  const rows = await getDb()
    .selectDistinct({ bankId: questions.bankId })
    .from(questions)
    .where(and(eq(questions.userId, userId), isNotNull(questions.bankId)));
  return new Set(rows.map((r) => r.bankId).filter((id): id is string => !!id));
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
  const [offer] = interview.offerId
    ? await db
        .select()
        .from(offers)
        .where(and(eq(offers.id, interview.offerId), eq(offers.userId, userId)))
        .limit(1)
    : [];
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
  const [offer] = interview?.offerId
    ? await db.select().from(offers).where(and(eq(offers.id, interview.offerId), eq(offers.userId, userId))).limit(1)
    : [];
  return { question, interview: interview ?? null, offer: offer ?? null };
}

export async function saveAnswer(userId: string, questionId: string, answer: string, feedback: Feedback) {
  const [row] = await getDb().insert(answers).values({ userId, questionId, answer, feedback }).returning();
  return row;
}

/** Number of practice interviews per offer, for the dashboard. */
export async function countInterviewsByOffer(userId: string): Promise<Map<string, number>> {
  const rows = await getDb().select({ offerId: interviews.offerId }).from(interviews).where(eq(interviews.userId, userId));
  const counts = new Map<string, number>();
  for (const r of rows) if (r.offerId) counts.set(r.offerId, (counts.get(r.offerId) ?? 0) + 1);
  return counts;
}

export interface InterviewListItem {
  id: string;
  offerId: string | null;
  kind: string; // "offer" | "technology" | "hr"
  topic: string | null;
  interviewerId: string;
  offerTitle: string | null;
  company: string | null;
  createdAt: Date;
  answered: number;
  total: number;
}

/** All practice sessions of the user, newest first, with how many questions were answered. */
export async function listInterviewsWithProgress(userId: string): Promise<InterviewListItem[]> {
  const db = getDb();
  const rows = await db
    .select({ id: interviews.id, offerId: interviews.offerId, kind: interviews.kind, topic: interviews.topic, interviewerId: interviews.interviewerId, createdAt: interviews.createdAt, title: offers.title, company: offers.company })
    .from(interviews)
    .leftJoin(offers, and(eq(offers.id, interviews.offerId), eq(offers.userId, userId)))
    .where(eq(interviews.userId, userId))
    .orderBy(desc(interviews.createdAt));
  if (rows.length === 0) return [];
  const qs = await db
    .select({ id: questions.id, interviewId: questions.interviewId })
    .from(questions)
    .where(and(eq(questions.userId, userId), inArray(questions.interviewId, rows.map((r) => r.id))));
  const answeredIds = new Set(
    qs.length === 0
      ? []
      : (
          await db
            .select({ questionId: answers.questionId })
            .from(answers)
            .where(and(eq(answers.userId, userId), inArray(answers.questionId, qs.map((q) => q.id))))
        ).map((a) => a.questionId),
  );
  return rows.map((r) => {
    const own = qs.filter((q) => q.interviewId === r.id);
    return {
      id: r.id,
      offerId: r.offerId,
      kind: r.kind,
      topic: r.topic,
      interviewerId: r.interviewerId,
      offerTitle: r.title,
      company: r.company,
      createdAt: r.createdAt,
      answered: own.filter((q) => answeredIds.has(q.id)).length,
      total: own.length,
    };
  });
}

/** Deletes one of the user's interviews; its questions and answers go with it (foreign keys cascade). */
export async function deleteInterview(userId: string, interviewId: string): Promise<boolean> {
  if (!isUuid(interviewId)) return false;
  const rows = await getDb()
    .delete(interviews)
    .where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId)))
    .returning({ id: interviews.id });
  return rows.length > 0;
}

/**
 * Switches the interviewer of one of the user's interviews. `lines` gives what the new interviewer says
 * around each question (by question id); only questions without an answer get them, answered ones keep
 * what was said.
 */
export async function switchInterviewer(userId: string, interviewId: string, interviewerId: string, lines: Map<string, { intro: string | null; outro: string | null }>): Promise<boolean> {
  if (!isUuid(interviewId)) return false;
  const db = getDb();
  const updated = await db
    .update(interviews)
    .set({ interviewerId })
    .where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId)))
    .returning({ id: interviews.id });
  if (updated.length === 0) return false;
  const qs = await db
    .select({ id: questions.id })
    .from(questions)
    .where(and(eq(questions.interviewId, interviewId), eq(questions.userId, userId)));
  const answered = new Set(
    qs.length === 0
      ? []
      : (
          await db
            .select({ questionId: answers.questionId })
            .from(answers)
            .where(and(eq(answers.userId, userId), inArray(answers.questionId, qs.map((q) => q.id))))
        ).map((a) => a.questionId),
  );
  for (const q of qs) {
    const line = lines.get(q.id);
    if (!line || answered.has(q.id)) continue;
    await db
      .update(questions)
      .set({ intro: line.intro, outro: line.outro })
      .where(and(eq(questions.id, q.id), eq(questions.userId, userId)));
  }
  return true;
}
