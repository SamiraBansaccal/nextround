"use client";

import { ArrowUpRight, Bookmark, Briefcase, Check, Clock3, MessagesSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { OfferCard } from "@/components/offers/offer-card";
import { Button } from "@/components/ui/button";
import type { PipelineCardData } from "@/lib/pipeline";
import type { OfferStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// The application pipeline (Phase 7) in the Lovable layout: one tab per stage
// (Saved -> Applied -> Interview -> Offer / Rejected, the last two grouped as "Closed").
type Tab = "all" | "saved" | "applied" | "interview" | "closed";

const TABS: { key: Tab; label: string; Icon: typeof Briefcase; tone: string }[] = [
  { key: "all", label: "All", Icon: Briefcase, tone: "bg-primary-soft text-primary" },
  { key: "saved", label: "Saved", Icon: Bookmark, tone: "bg-warning-soft text-warning" },
  { key: "applied", label: "Applied", Icon: Check, tone: "bg-success-soft text-success" },
  { key: "interview", label: "Interview", Icon: MessagesSquare, tone: "bg-terracotta-soft text-terracotta" },
  { key: "closed", label: "Closed", Icon: Clock3, tone: "bg-secondary text-secondary-foreground" },
];

const STATUSES: { value: OfferStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

const inTab = (tab: Tab, status: OfferStatus) =>
  tab === "all" || (tab === "closed" ? status === "offer" || status === "rejected" : status === tab);

export function Opportunities({
  cards,
  move,
}: {
  cards: PipelineCardData[];
  move: (input: { offerId: string; status: OfferStatus }) => Promise<{ ok: boolean }>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [pending, startTransition] = useTransition();
  const visible = cards.filter((c) => inTab(tab, c.status));

  return (
    <section aria-labelledby="opportunities-title">
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
        <h2 id="opportunities-title" className="font-display text-2xl sm:text-3xl">
          Your opportunities
        </h2>
        <span className="text-sm text-muted-foreground">{cards.length} tracked</span>
      </div>
      <div className="mb-7 flex snap-x gap-2 overflow-x-auto border-b border-border pb-3" role="tablist" aria-label="Filter opportunities by stage">
        {TABS.map(({ key, label, Icon, tone }) => {
          const count = cards.filter((c) => inTab(key, c.status)).length;
          return (
            <Button
              key={key}
              type="button"
              variant="ghost"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "h-11 shrink-0 snap-start gap-2 border-b-2 px-3",
                tab === key ? "border-primary bg-primary-soft/60 text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              <span className={cn("grid size-7 place-items-center rounded-md", tone)}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {label}
              <span className="text-xs tabular-nums opacity-70">{count}</span>
            </Button>
          );
        })}
      </div>
      <div role="tabpanel" className="min-h-40">
        {visible.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((card) => (
              <OfferCard
                key={card.id}
                card={card}
                footer={
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Stage
                    <select
                      className="rounded border bg-background/70 px-1.5 py-1 text-xs text-foreground"
                      value={card.status}
                      disabled={pending}
                      onChange={(e) => {
                        const status = e.target.value as OfferStatus;
                        startTransition(async () => {
                          await move({ offerId: card.id, status });
                          router.refresh();
                        });
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 border-y border-border py-9 text-sm text-muted-foreground">
            <ArrowUpRight className="size-5" aria-hidden="true" />
            {cards.length ? "Nothing at this stage yet." : "No offers saved yet — paste a link above: NextRound reads it and shows how well you match."}
          </div>
        )}
      </div>
    </section>
  );
}
