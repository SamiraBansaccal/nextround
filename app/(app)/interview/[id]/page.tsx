import { notFound } from "next/navigation";
import { InterviewSession } from "@/components/interview/interview-session";
import { getAiStatus } from "@/lib/ai/config";
import { getAccount } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { getInterview } from "@/lib/data/interviews";
import { submitAnswerAction } from "../actions";

export const maxDuration = 120;

export default async function InterviewPage({ params, searchParams }: PageProps<"/interview/[id]">) {
  const { id } = await params;
  const { q } = await searchParams;
  const account = await getAccount();
  const userId = account.userId;
  const [data, facts, status] = await Promise.all([getInterview(userId, id), listFacts(userId), getAiStatus(userId, account.isOwner)]);
  if (!data) notFound();

  const latest = new Map<string, (typeof data.answers)[number]>();
  for (const a of data.answers) if (!latest.has(a.questionId)) latest.set(a.questionId, a); // answers are newest first
  const start = Math.min(Math.max(Number(q) || 0, 0), Math.max(data.questions.length - 1, 0));

  return (
    <InterviewSession
      interviewId={data.interview.id}
      offerId={data.offer?.id ?? null}
      me={{ name: account.fullName, imageUrl: account.imageUrl }}
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
      language={data.offer?.language ?? null}
      voiceLabel={status.voice === "browser" ? "your browser (free)" : status.voice === "own_key" ? "ElevenLabs (your key)" : "ElevenLabs"}
      submit={submitAnswerAction}
    />
  );
}
