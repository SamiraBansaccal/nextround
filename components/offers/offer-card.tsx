import { ArrowUpRight, BellRing, MessagesSquare, Play } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/offers/badges";
import { SiteLogo } from "@/components/offers/site-logo";
import { TechLogo } from "@/components/interview/tech-logo";
import { Button } from "@/components/ui/button";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import type { UiLang } from "@/lib/i18n/ui";
import { fill } from "@/lib/interview/copy";
import { findTrack } from "@/lib/interview/tracks";
import type { PipelineCardData } from "@/lib/offers/pipeline";
import { cn } from "@/lib/utils";

// An offer as a card: a band in the colour of its career track, the platform it comes from, the logos of
// the technologies it asks for, the match and the practice count. The card fills its grid cell and keeps
// the match row and the buttons at the bottom, so they line up across a row of cards.

/** The colour of each career track (same tracks as the technical practice). */
export const TRACK_TONE: Record<string, { band: string; text: string }> = {
  devops: { band: "bg-terracotta", text: "text-terracotta" },
  web: { band: "bg-ink", text: "text-ink" },
  java: { band: "bg-warning", text: "text-warning" },
  "c-cpp": { band: "bg-earth dark:bg-primary", text: "text-earth dark:text-primary" },
  embedded: { band: "bg-gap", text: "text-gap" },
  languages: { band: "bg-success", text: "text-success" },
  data: { band: "bg-accent-foreground", text: "text-accent-foreground" },
  foundations: { band: "bg-muted-foreground", text: "text-muted-foreground" },
};
const NO_TRACK = { band: "bg-border", text: "text-muted-foreground" };

const MAX_LOGOS = 7;

export function OfferCard({ card, status, footer, lang = "en" }: { card: PipelineCardData; status?: ReactNode; footer?: ReactNode; lang?: UiLang }) {
  const t = OFFERS_COPY[lang];
  const percent = card.total ? Math.round((card.covered / card.total) * 100) : 0;
  const track = findTrack(card.track);
  const tone = (card.track && TRACK_TONE[card.track]) || NO_TRACK;
  const closed = card.status === "rejected";
  return (
    <article className={cn("flex h-full flex-col overflow-hidden rounded-md border border-earth/15 bg-card shadow-soft", closed && "opacity-70")}>
      <div className={cn("h-1.5 shrink-0", tone.band)} aria-hidden="true" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <SiteLogo site={card.sourceSite} lang={lang} />
          {status ?? <StatusBadge status={card.status} lang={lang} />}
        </div>
        {track && <p className={cn("mb-1 text-xs font-semibold", tone.text)}>{track.label[lang]}</p>}
        <Link
          href={`/offers/${card.id}`}
          className="group inline-flex items-start gap-2 font-display text-2xl leading-snug hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {card.title ?? t.untitledOffer}
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">{[card.company, card.location].filter(Boolean).join(" · ") || t.companyNotStated}</p>
        {card.techs.length > 0 && (
          <ul className="mt-4 flex flex-wrap items-center gap-1.5" aria-label={t.stackLabel}>
            {card.techs.slice(0, MAX_LOGOS).map((tech) => (
              <li key={tech.id} title={tech.label[lang]}>
                <TechLogo logo={tech.logo} className="size-8 bg-background shadow-none ring-1 ring-earth/10" />
                <span className="sr-only">{tech.label[lang]}</span>
              </li>
            ))}
            {card.techs.length > MAX_LOGOS && <li className="text-xs text-muted-foreground">+{card.techs.length - MAX_LOGOS}</li>}
          </ul>
        )}
        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-center gap-3 border-t border-earth/15 pt-4 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{fill(t.matchShort, { percent, covered: card.covered, total: card.total })}</span>
            <span className="flex items-center gap-1">
              <MessagesSquare className="size-3.5" aria-hidden="true" />
              {fill(t.practised, { count: card.interviews })}
            </span>
            {card.appliedOn && <span>{fill(t.appliedShort, { date: card.appliedOn })}</span>}
          </div>
          {/* Always the same height, follow-up or not, so the buttons line up. */}
          <div className="mt-3 h-6">
            {card.followUp && (
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold", card.followUp.due ? "bg-warning-soft text-warning" : "text-muted-foreground")}>
                <BellRing className="size-3.5" aria-hidden="true" /> {card.followUp.due ? t.followUpToday : fill(t.followUpOn, { date: card.followUp.on })}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href={`/interview/new?offer=${card.id}`}>
                <Play className="size-3.5" aria-hidden="true" /> {t.practiseInterview}
              </Link>
            </Button>
            {footer}
          </div>
        </div>
      </div>
    </article>
  );
}
