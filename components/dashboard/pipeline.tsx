"use client";

import { Bell, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";

export type PipelineStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface PipelineCard {
  id: string;
  company: string | null;
  title: string | null;
  sourceSite: string;
  status: PipelineStatus;
  covered: number;
  total: number;
  interviews: number;
  appliedOn: string | null; // YYYY-MM-DD
  followUp: { due: boolean; on: string } | null;
}

const COLUMNS: { status: PipelineStatus; label: string }[] = [
  { status: "saved", label: "Saved" },
  { status: "applied", label: "Applied" },
  { status: "interview", label: "Interview" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
];

// Presentational pipeline: Saved -> Applied -> Interview -> Offer / Rejected.
export function Pipeline({ cards, move }: { cards: PipelineCard[]; move: (input: { offerId: string; status: PipelineStatus }) => Promise<{ ok: boolean }> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (cards.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        No offers yet. <Link href="/offers" className="underline">Add your first offer</Link> by pasting its link.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {COLUMNS.map((col) => {
        const inCol = cards.filter((c) => c.status === col.status);
        return (
          <section key={col.status} aria-labelledby={`col-${col.status}`} className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2">
            <h3 id={`col-${col.status}`} className="flex items-center justify-between px-1 font-sans text-sm font-semibold">
              {col.label} <span className="text-muted-foreground">{inCol.length}</span>
            </h3>
            {inCol.map((card) => (
              <article key={card.id} className="flex flex-col gap-2 rounded-md border bg-card p-3 text-sm shadow-soft">
                <Link href={`/offers/${card.id}`} className="flex flex-col hover:underline">
                  <span className="font-semibold">{card.company ?? "Company not stated"}</span>
                  <span className="text-muted-foreground">{card.title ?? "Untitled offer"}</span>
                </Link>
                <div className="flex flex-wrap gap-1 text-xs">
                  <Badge variant="outline">{card.sourceSite}</Badge>
                  <Badge variant="secondary">
                    {card.covered}/{card.total} covered
                  </Badge>
                  {card.interviews > 0 && (
                    <Badge variant="outline">
                      <MessagesSquare className="size-3" aria-hidden="true" /> {card.interviews}
                    </Badge>
                  )}
                </div>
                {card.appliedOn && <p className="text-xs text-muted-foreground">Applied on {card.appliedOn}</p>}
                {card.followUp && (
                  <p className={`flex items-center gap-1 text-xs ${card.followUp.due ? "font-semibold text-warning" : "text-muted-foreground"}`}>
                    <Bell className="size-3" aria-hidden="true" />
                    {card.followUp.due ? "Follow up today" : `Follow up on ${card.followUp.on}`}
                  </p>
                )}
                <label className="sr-only" htmlFor={`move-${card.id}`}>
                  Move to
                </label>
                <select
                  id={`move-${card.id}`}
                  className="rounded border bg-transparent px-1 py-0.5 text-xs"
                  value={card.status}
                  disabled={pending}
                  onChange={(e) => {
                    const status = e.target.value as PipelineStatus;
                    startTransition(async () => {
                      await move({ offerId: card.id, status });
                      router.refresh();
                    });
                  }}
                >
                  {COLUMNS.map((c) => (
                    <option key={c.status} value={c.status}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}
