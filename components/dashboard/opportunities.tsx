"use client";

import { ArrowUpRight, Bookmark, Briefcase, Check, Clock3, MessagesSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { OfferCard } from "@/components/offers/offer-card";
import { Button } from "@/components/ui/button";
import type { DashboardCopy } from "@/lib/i18n/dashboard";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import type { UiLang } from "@/lib/i18n/ui";
import { fill } from "@/lib/interview/copy";
import type { PipelineCardData } from "@/lib/offers/pipeline";
import type { OfferStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// The application pipeline (Phase 7) in the Lovable layout: one tab per stage
// (Saved -> Applied -> Interview -> Offer / Rejected, the last two grouped as "Closed").
type Tab = "all" | "saved" | "applied" | "interview" | "closed";

const TABS: { key: Tab; Icon: typeof Briefcase; tone: string }[] = [
  { key: "all", Icon: Briefcase, tone: "bg-primary-soft text-primary" },
  { key: "saved", Icon: Bookmark, tone: "bg-warning-soft text-warning" },
  { key: "applied", Icon: Check, tone: "bg-success-soft text-success" },
  { key: "interview", Icon: MessagesSquare, tone: "bg-terracotta-soft text-terracotta" },
  { key: "closed", Icon: Clock3, tone: "bg-secondary text-secondary-foreground" },
];

const STATUSES: OfferStatus[] = ["saved", "applied", "interview", "offer", "rejected"];

const inTab = (tab: Tab, status: OfferStatus) =>
  tab === "all" || (tab === "closed" ? status === "offer" || status === "rejected" : status === tab);

export function Opportunities({
  cards,
  move,
  lang,
  t,
}: {
  cards: PipelineCardData[];
  move: (input: { offerId: string; status: OfferStatus }) => Promise<{ ok: boolean }>;
  lang: UiLang;
  t: DashboardCopy;
}) {
  const status = OFFERS_COPY[lang].status;
  const tabLabel = (key: Tab) => (key === "all" ? t.tabAll : key === "closed" ? t.tabClosed : status[key]);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [pending, startTransition] = useTransition();
  const visible = cards.filter((c) => inTab(tab, c.status));

  return (
    <section aria-labelledby="opportunities-title">
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
        <h2 id="opportunities-title" className="font-display text-2xl sm:text-3xl">
          {t.yourOpportunities}
        </h2>
        <span className="text-sm text-muted-foreground">{fill(t.tracked, { count: cards.length })}</span>
      </div>
      <div className="mb-7 flex snap-x gap-2 overflow-x-auto border-b border-border pb-3" role="tablist" aria-label={t.filterLabel}>
        {TABS.map(({ key, Icon, tone }) => {
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
              {tabLabel(key)}
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
                lang={lang}
                footer={
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    {t.stage}
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
                        <option key={s} value={s}>
                          {status[s]}
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
            {cards.length ? t.nothingAtStage : t.noOffersYet}
          </div>
        )}
      </div>
    </section>
  );
}
