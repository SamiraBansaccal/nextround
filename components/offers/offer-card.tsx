import { ArrowUpRight, BellRing, MessagesSquare, Play } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteBadge, StatusBadge, statusVisual } from "@/components/source/badges";
import { Button } from "@/components/ui/button";
import type { PipelineCardData } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

// Offer card from the Lovable prototype: tinted by status, match, practice count, follow-up.
export function OfferCard({ card, footer }: { card: PipelineCardData; footer?: ReactNode }) {
  const percent = card.total ? Math.round((card.covered / card.total) * 100) : 0;
  return (
    <article className={cn("rounded-md border p-5 transition-colors sm:p-6", statusVisual[card.status].surface)}>
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <SiteBadge site={card.sourceSite} />
        <StatusBadge status={card.status} />
      </div>
      <Link
        href={`/offers/${card.id}`}
        className="group inline-flex items-start gap-2 font-display text-2xl leading-snug hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {card.title ?? "Untitled offer"}
        <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </Link>
      <p className="mt-1 text-sm text-muted-foreground">{[card.company, card.location].filter(Boolean).join(" · ") || "Company not stated"}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-current/15 pt-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">
          {percent}% match · {card.covered}/{card.total}
        </span>
        <span className="flex items-center gap-1">
          <MessagesSquare className="size-3.5" aria-hidden="true" />
          {card.interviews} practised
        </span>
        {card.appliedOn && <span>Applied {card.appliedOn}</span>}
      </div>
      {card.followUp && (
        <span className={cn("mt-3 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold", card.followUp.due ? "bg-warning-soft text-warning" : "text-muted-foreground")}>
          <BellRing className="size-3.5" aria-hidden="true" /> {card.followUp.due ? "Follow up today" : `Follow up on ${card.followUp.on}`}
        </span>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm" className="w-full bg-background/70 sm:w-auto">
          <Link href={`/offers/${card.id}#practise`}>
            <Play className="size-3.5" aria-hidden="true" /> Practise interview
          </Link>
        </Button>
        {footer}
      </div>
    </article>
  );
}
