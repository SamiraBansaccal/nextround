"use client";

import { ArrowUpRight, Briefcase, Shapes } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TechLogo } from "@/components/interview/tech-logo";
import { statusVisual } from "@/components/offers/badges";
import { OfferCard, TRACK_TONE } from "@/components/offers/offer-card";
import { Button } from "@/components/ui/button";
import type { DashboardCopy } from "@/lib/i18n/dashboard";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import type { UiLang } from "@/lib/i18n/ui";
import { fill } from "@/lib/interview/copy";
import { TRACKS } from "@/lib/interview/tracks";
import type { PipelineCardData } from "@/lib/offers/pipeline";
import type { OfferStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// The candidate's offers, one tab per career track (the same tracks as the technical practice: DevOps,
// web, Java…), so the offers that match what she is practising sit together. The stage of an
// application (saved, applied…) is picked on the card itself.

const STATUSES: OfferStatus[] = ["saved", "applied", "interview", "offer", "rejected"];
const OTHER = "other";

export function Opportunities({
  cards,
  move,
  lang,
  t,
  heading = true,
  grid = "lg:grid-cols-2",
}: {
  cards: PipelineCardData[];
  move: (input: { offerId: string; status: OfferStatus }) => Promise<{ ok: boolean }>;
  lang: UiLang;
  t: DashboardCopy;
  /** False on the offers page, which has its own title. */
  heading?: boolean;
  /** Columns of the card grid (the dashboard keeps two, the offers page three). */
  grid?: string;
}) {
  const status = OFFERS_COPY[lang].status;
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [pending, startTransition] = useTransition();
  const trackOf = (c: PipelineCardData) => c.track ?? OTHER;
  const count = (key: string) => (key === "all" ? cards.length : cards.filter((c) => trackOf(c) === key).length);
  // The tracks that have offers, the fullest first, then the offers without a known technology.
  const tabs = [
    ...TRACKS.filter((tr) => count(tr.id) > 0)
      .sort((a, b) => count(b.id) - count(a.id))
      .map((tr) => ({ key: tr.id, label: tr.label[lang], logo: cards.find((c) => c.track === tr.id && c.techs.length)?.techs[0]?.logo })),
    ...(count(OTHER) > 0 ? [{ key: OTHER, label: t.tabOther, logo: undefined }] : []),
  ];
  const current = tab === "all" || tabs.some((x) => x.key === tab) ? tab : "all";
  const visible = current === "all" ? cards : cards.filter((c) => trackOf(c) === current);

  const select = (card: PipelineCardData) => (
    <label className="relative">
      <span className="sr-only">{t.stage}</span>
      <select
        className={cn("cursor-pointer appearance-none rounded-full border px-2.5 py-0.5 pr-6 text-xs font-semibold", statusVisual[card.status].badge)}
        value={card.status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as OfferStatus;
          startTransition(async () => {
            await move({ offerId: card.id, status: next });
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
      <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px]" aria-hidden="true">
        ▾
      </span>
    </label>
  );

  return (
    <section aria-labelledby={heading ? "opportunities-title" : undefined} aria-label={heading ? undefined : t.yourOpportunities}>
      {heading && (
        <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
          <h2 id="opportunities-title" className="font-display text-2xl sm:text-3xl">
            {t.yourOpportunities}
          </h2>
          <span className="text-sm text-muted-foreground">{fill(t.tracked, { count: cards.length })}</span>
        </div>
      )}
      {cards.length > 0 && (
        <div className="mb-7 flex snap-x gap-2 overflow-x-auto border-b border-border pb-3" role="tablist" aria-label={t.filterLabel}>
          {[{ key: "all", label: t.tabAll, logo: undefined }, ...tabs].map(({ key, label, logo }) => (
            <Button
              key={key}
              type="button"
              variant="ghost"
              role="tab"
              aria-selected={current === key}
              onClick={() => setTab(key)}
              className={cn(
                "h-11 shrink-0 snap-start gap-2 border-b-2 px-3",
                current === key ? "border-primary bg-primary-soft/60 text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              {logo ? (
                <TechLogo logo={logo} className="size-7 bg-background shadow-none ring-1 ring-earth/10" />
              ) : (
                <span className={cn("grid size-7 place-items-center rounded-full", key === "all" ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground")}>
                  {key === "all" ? <Briefcase className="size-4" aria-hidden="true" /> : <Shapes className="size-4" aria-hidden="true" />}
                </span>
              )}
              <span className={cn(key !== "all" && key !== OTHER && current === key && TRACK_TONE[key]?.text)}>{label}</span>
              <span className="text-xs tabular-nums opacity-70">{count(key)}</span>
            </Button>
          ))}
        </div>
      )}
      <div role="tabpanel" className="min-h-40">
        {visible.length ? (
          <div className={cn("grid gap-4", grid)}>
            {visible.map((card) => (
              <OfferCard key={card.id} card={card} lang={lang} status={select(card)} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 border-y border-border py-9 text-sm text-muted-foreground">
            <ArrowUpRight className="size-5" aria-hidden="true" />
            {t.noOffersYet}
          </div>
        )}
      </div>
    </section>
  );
}
