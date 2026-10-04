import { CheckCircle2, CircleAlert, RotateCcw, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { getAccount } from "@/lib/auth";
import { getInterview } from "@/lib/data/interviews";
import { fill, INTERVIEW_COPY, toLang } from "@/lib/interview/copy";
import { questionLabel } from "@/lib/interview/question-types";
import { summarizeInterview } from "@/lib/interview/summary";
import { getInterviewer } from "@/lib/interviewers";

// End-of-interview summary (layout from the Lovable prototype), computed by code from the verified
// feedback: no extra AI call, nothing that the feedback did not already say. In the interview's language.

export default async function SummaryPage({ params }: PageProps<"/interview/[id]/summary">) {
  const { id } = await params;
  const account = await getAccount();
  const data = await getInterview(account.userId, id);
  if (!data) notFound();
  const lang = toLang(data.interview.language);
  const t = INTERVIEW_COPY[lang];
  const summary = summarizeInterview(data.questions, data.answers, lang);
  const interviewerName = getInterviewer(data.interview.interviewerId).copy[lang].name;
  const offer = [data.offer?.title, data.offer?.company].filter(Boolean).join(" · ");

  return (
    <div lang={lang}>
      <PageHeading
        eyebrow={fill(t.summaryEyebrow, { name: interviewerName, offer })}
        title={summary.answered ? fill(t.summaryTitle, { name: account.displayName }) : t.summaryEmpty}
      >
        <Button asChild>
          <Link href={`/interview/${data.interview.id}`}>
            <RotateCcw className="size-4" aria-hidden="true" /> {t.practiseAgain}
          </Link>
        </Button>
      </PageHeading>
      <p className="-mt-4 mb-8 text-sm text-muted-foreground">{fill(t.answeredCount, { answered: summary.answered, total: data.questions.length })}</p>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-card p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 text-xl">
            <CheckCircle2 className="size-5 text-success" aria-hidden="true" /> {t.strengths}
          </h2>
          {summary.strengths.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.strengthsEmpty}</p>
          ) : (
            <ul className="space-y-3">
              {summary.strengths.map((s) => (
                <li key={s} className="text-sm leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="bg-card p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 text-xl">
            <CircleAlert className="size-5 text-warning" aria-hidden="true" /> {t.toWork}
          </h2>
          {summary.toWork.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.toWorkEmpty}</p>
          ) : (
            <ol className="space-y-3">
              {summary.toWork.map((w, i) => (
                <li key={w.label} className="flex gap-3 text-sm">
                  <span className="font-display text-lg text-warning">{i + 1}</span>
                  <span>
                    <span className="font-semibold">{w.label}</span>
                    {w.comment && <span className="text-muted-foreground"> — {w.comment}</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {summary.unsupportedClaims.length > 0 && (
        <section className="mt-6 rounded-xl border border-gap/30 bg-gap-soft p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg">
            <ShieldAlert className="size-5 text-gap" aria-hidden="true" /> {t.unsupportedClaims}
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">{t.unsupportedClaimsHint}</p>
          <ul className="space-y-1 text-sm">
            {summary.unsupportedClaims.map((quote, i) => (
              <li key={i}>“{quote}”</li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-10 mb-4 text-xl">{t.toRetry}</h2>
      {summary.toRetry.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.toRetryEmpty}</p>
      ) : (
        <div className="space-y-3">
          {summary.toRetry.map(({ question, index, answered }) => (
            <div key={question.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">{questionLabel(question.group, question.type, lang)}</span>
              <p className="min-w-0 flex-1">
                {question.text} {!answered && <span className="text-sm text-muted-foreground">{t.notAnswered}</span>}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/interview/${data.interview.id}?q=${index}`}>
                  <RotateCcw className="size-4" aria-hidden="true" /> {t.retryShort}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
