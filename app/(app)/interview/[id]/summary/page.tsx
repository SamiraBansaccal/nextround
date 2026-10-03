import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { getInterview } from "@/lib/data/interviews";
import type { Feedback } from "@/lib/types";

// End-of-interview summary, computed by code from the verified feedback (no extra AI call).
const CRITERIA: { key: "star" | "relevance" | "evidence" | "honesty"; label: string }[] = [
  { key: "star", label: "STAR structure" },
  { key: "relevance", label: "Relevance to the question and the offer" },
  { key: "evidence", label: "Evidence from your profile" },
  { key: "honesty", label: "Honesty about gaps" },
];

export default async function SummaryPage({ params }: PageProps<"/interview/[id]/summary">) {
  const { id } = await params;
  const userId = await requireUserId();
  const data = await getInterview(userId, id);
  if (!data) notFound();

  const latest = new Map<string, Feedback | null>();
  for (const a of data.answers) if (!latest.has(a.questionId)) latest.set(a.questionId, a.feedback ?? null);

  const tally = CRITERIA.map((c) => {
    let good = 0;
    let improve = 0;
    let comment = "";
    for (const fb of latest.values()) {
      const criterion = fb?.[c.key];
      if (!criterion) continue;
      if (criterion.rating === "good") good++;
      else {
        improve++;
        comment ||= criterion.comment;
      }
    }
    return { ...c, good, improve, comment };
  });
  const strengths = tally.filter((t) => t.good > 0 && t.good >= t.improve);
  const toWork = [...tally].filter((t) => t.improve > 0).sort((a, b) => b.improve - a.improve).slice(0, 3);
  const toRetry = data.questions
    .map((q, index) => ({ q, index, fb: latest.get(q.id) }))
    .filter(({ fb }) => !fb || CRITERIA.some((c) => fb[c.key]?.rating === "to_improve"));
  const unsupportedClaims = [...latest.values()].reduce((n, fb) => n + (fb?.evidence.claims.filter((c) => !c.factId).length ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{[data.offer?.title, data.offer?.company].filter(Boolean).join(" · ")}</p>
        <h1 className="text-3xl font-semibold tracking-tight">Interview summary</h1>
        <p className="text-muted-foreground">
          {latest.size} of {data.questions.length} questions answered
          {unsupportedClaims > 0 && ` · ${unsupportedClaims} claim${unsupportedClaims > 1 ? "s" : ""} not backed by your profile`}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strengths</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {strengths.length === 0 ? <p className="text-muted-foreground">Answer more questions to see your strengths.</p> : (
              <ul className="ml-5 list-disc">
                {strengths.map((s) => (
                  <li key={s.key}>
                    {s.label}: good on {s.good} answer{s.good > 1 ? "s" : ""}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top things to work on</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {toWork.length === 0 ? <p className="text-muted-foreground">Nothing flagged so far.</p> : (
              <ol className="ml-5 list-decimal">
                {toWork.map((t) => (
                  <li key={t.key}>
                    <span className="font-medium">{t.label}</span> ({t.improve}×){t.comment && <span className="text-muted-foreground"> — {t.comment}</span>}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Questions to retry</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {toRetry.length === 0 && <p className="text-muted-foreground">All answered well.</p>}
          {toRetry.map(({ q, index, fb }) => (
            <div key={q.id} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                {index + 1}. {q.text} {!fb && <span className="text-muted-foreground">(not answered)</span>}
              </span>
              <Button asChild size="sm" variant="outline">
                <Link href={`/interview/${data.interview.id}?q=${index}`}>Retry</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
