import { notFound } from "next/navigation";
import { InterviewSession } from "@/components/interview/interview-session";
import { requireUserId } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { getInterview } from "@/lib/data/interviews";
import { submitAnswerAction } from "../actions";

export const maxDuration = 120;

export default async function InterviewPage({ params, searchParams }: PageProps<"/interview/[id]">) {
  const { id } = await params;
  const { q } = await searchParams;
  const userId = await requireUserId();
  const [data, facts] = await Promise.all([getInterview(userId, id), listFacts(userId)]);
  if (!data) notFound();

  const latest = new Map<string, (typeof data.answers)[number]>();
  for (const a of data.answers) if (!latest.has(a.questionId)) latest.set(a.questionId, a); // answers are newest first
  const start = Math.min(Math.max(Number(q) || 0, 0), Math.max(data.questions.length - 1, 0));

  return (
    <InterviewSession
      interviewId={data.interview.id}
      offerTitle={[data.offer?.title, data.offer?.company].filter(Boolean).join(" · ") || "Interview practice"}
      questions={data.questions.map((question) => {
        const answer = latest.get(question.id);
        return {
          id: question.id,
          group: question.group,
          text: question.text,
          source: question.source,
          suggestedAnswer: question.suggestedAnswer,
          lastAnswer: answer ? { answer: answer.answer, feedback: answer.feedback ?? null } : null,
        };
      })}
      facts={Object.fromEntries(facts.filter((f) => f.validated).map((f) => [f.id, f.text]))}
      initialIndex={start}
      submit={submitAnswerAction}
    />
  );
}
