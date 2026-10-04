import { notFound } from "next/navigation";
import { InterviewSession } from "@/components/interview/interview-session";
import { getAiStatus } from "@/lib/ai/config";
import { getAccount } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { getInterview } from "@/lib/data/interviews";
import { INTERVIEW_COPY, toLang } from "@/lib/interview/copy";
import { questionLabel } from "@/lib/interview/question-types";
import { getInterviewer } from "@/lib/interviewers";
import { KIND_NOTICE } from "@/lib/interviewers/labels";
import { submitAnswerAction } from "../actions";

export const maxDuration = 120;

// The call. Everything is shown in the interview's language (a property of the session).
export default async function InterviewPage({ params, searchParams }: PageProps<"/interview/[id]">) {
  const { id } = await params;
  const { q } = await searchParams;
  const account = await getAccount();
  const userId = account.userId;
  const [data, facts, status] = await Promise.all([getInterview(userId, id), listFacts(userId), getAiStatus(userId, account.isOwner)]);
  if (!data) notFound();

  const lang = toLang(data.interview.language);
  const copy = INTERVIEW_COPY[lang];
  const latest = new Map<string, (typeof data.answers)[number]>();
  for (const a of data.answers) if (!latest.has(a.questionId)) latest.set(a.questionId, a); // answers are newest first
  const start = Math.min(Math.max(Number(q) || 0, 0), Math.max(data.questions.length - 1, 0));
  const interviewer = getInterviewer(data.interview.interviewerId);
  const who = interviewer.copy[lang];

  return (
    <InterviewSession
      interviewId={data.interview.id}
      offerId={data.offer?.id ?? null}
      me={{ name: account.fullName, imageUrl: account.imageUrl }}
      offerTitle={[data.offer?.title, data.offer?.company].filter(Boolean).join(" · ")}
      lang={lang}
      copy={copy}
      interviewer={{ id: interviewer.id, name: who.name, role: who.role, image: interviewer.image, notice: KIND_NOTICE[interviewer.kind]?.[lang] ?? null }}
      questions={data.questions.map((question) => {
        const answer = latest.get(question.id);
        return {
          id: question.id,
          group: question.group,
          label: questionLabel(question.group, question.type, lang),
          text: question.text,
          source: question.source,
          suggestedAnswer: question.suggestedAnswer,
          lastAnswer: answer ? { answer: answer.answer, feedback: answer.feedback ?? null } : null,
        };
      })}
      facts={Object.fromEntries(facts.filter((f) => f.validated).map((f) => [f.id, f.text]))}
      initialIndex={start}
      voiceLabel={status.voice === "browser" ? copy.voiceBrowser : status.voice === "own_key" ? copy.voiceOwn : copy.voiceInstance}
      submit={submitAnswerAction}
    />
  );
}
