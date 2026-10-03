import { CheckCircle2, CircleAlert, RotateCcw, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { getAccount } from "@/lib/auth";
import { getInterview } from "@/lib/data/interviews";
import { summarizeInterview } from "@/lib/interview/summary";

// End-of-interview summary (layout from the Lovable prototype), computed by code from the verified
// feedback: no extra AI call, nothing that the feedback did not already say.
const GROUP_LABEL = { hr: "General HR", technical: "Technical", gap: "Gap" } as const;

export default async function SummaryPage({ params }: PageProps<"/interview/[id]/summary">) {
  const { id } = await params;
  const account = await getAccount();
  const data = await getInterview(account.userId, id);
  if (!data) notFound();
  const summary = summarizeInterview(data.questions, data.answers);

  return (
    <div>
      <PageHeading
        eyebrow={`Interview complete · ${[data.offer?.title, data.offer?.company].filter(Boolean).join(" · ")}`}
        title={summary.answered ? `Well done, ${account.displayName}. Here's what stood out.` : "No answer yet in this interview."}
      >
        <Button asChild>
          <Link href={`/interview/${data.interview.id}`}>
            <RotateCcw className="size-4" aria-hidden="true" /> Practise again
          </Link>
        </Button>
      </PageHeading>
      <p className="-mt-4 mb-8 text-sm text-muted-foreground">
        {summary.answered} of {data.questions.length} questions answered.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-card p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 text-xl">
            <CheckCircle2 className="size-5 text-success" aria-hidden="true" /> Strengths
          </h2>
          {summary.strengths.length === 0 ? (
            <p className="text-sm text-muted-foreground">Answer more questions to see your strengths.</p>
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
            <CircleAlert className="size-5 text-warning" aria-hidden="true" /> Top 3 to work on
          </h2>
          {summary.toWork.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing flagged so far.</p>
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
            <ShieldAlert className="size-5 text-gap" aria-hidden="true" /> Claims your profile does not back up
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">Add them as facts if they are true; otherwise, don&apos;t say them in the real interview.</p>
          <ul className="space-y-1 text-sm">
            {summary.unsupportedClaims.map((quote, i) => (
              <li key={i}>“{quote}”</li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-10 mb-4 text-xl">Questions to retry</h2>
      {summary.toRetry.length === 0 ? (
        <p className="text-sm text-muted-foreground">All answered well.</p>
      ) : (
        <div className="space-y-3">
          {summary.toRetry.map(({ question, index, answered }) => (
            <div key={question.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">{GROUP_LABEL[question.group]}</span>
              <p className="min-w-0 flex-1">
                {question.text} {!answered && <span className="text-sm text-muted-foreground">(not answered)</span>}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/interview/${data.interview.id}?q=${index}`}>
                  <RotateCcw className="size-4" aria-hidden="true" /> Retry
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
