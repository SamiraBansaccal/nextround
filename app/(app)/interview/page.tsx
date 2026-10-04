import { ArrowRight, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { InterviewerAvatar } from "@/components/interview/interviewer-avatar";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { listInterviewsWithProgress } from "@/lib/data/interviews";
import { formatDay } from "@/lib/dates";
import { getInterviewer } from "@/lib/interviewers";

// All practice sessions (layout from the Lovable prototype).
export default async function InterviewsPage() {
  const userId = await requireUserId();
  const items = await listInterviewsWithProgress(userId);

  return (
    <div>
      <PageHeading eyebrow="One-to-one video calls with the interviewer you choose" title="Interview practice" />
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-dashed border-earth/30 p-10 text-center">
          <MessagesSquare className="size-6 text-primary" aria-hidden="true" />
          <p className="font-display text-xl">No practice yet</p>
          <p className="text-sm text-muted-foreground">Open an offer and start an interview on its stack.</p>
          <Button asChild>
            <Link href="/offers">Browse offers</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((iv) => {
            const percent = iv.total ? Math.round((iv.answered / iv.total) * 100) : 0;
            const interviewer = getInterviewer(iv.interviewerId);
            return (
              <Link
                key={iv.id}
                href={`/interview/${iv.id}`}
                className="flex flex-wrap items-center gap-6 rounded-md border bg-card p-6 shadow-soft transition hover:border-primary/40"
              >
                <InterviewerAvatar interviewer={interviewer} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl">{iv.offerTitle ?? "Untitled offer"}</p>
                  <p className="text-sm">with {interviewer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[iv.company, iv.answered === 0 ? "Ready to practise" : iv.answered === iv.total ? "Completed" : "In progress", formatDay(iv.createdAt)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="w-48">
                  <p className="mb-1 text-xs text-muted-foreground">
                    {iv.answered} of {iv.total} answered
                  </p>
                  <div className="h-2 rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Questions answered">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                </div>
                <ArrowRight className="size-5 text-muted-foreground" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
