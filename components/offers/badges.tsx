import { Ban, Bookmark, CheckCircle2, MessagesSquare, Quote, Send, Trophy, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { fill } from "@/lib/interview/copy";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import type { UiLang } from "@/lib/i18n/ui";
import type { OfferStatus, SourceSite } from "@/lib/types";
import { cn } from "@/lib/utils";

// Shared visual language (from the Lovable prototype): status and site badges, match ring,
// covered / gap labels, and the quote chip that shows the verbatim quote from the offer.
// Labels follow the site's language (`lang`, English by default).

export function SiteBadge({ site, lang = "en" }: { site: SourceSite; lang?: UiLang }) {
  return <span className="inline-flex w-fit items-center justify-self-start rounded-md border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{OFFERS_COPY[lang].site[site]}</span>;
}

export const statusVisual: Record<OfferStatus, { label: string; surface: string; badge: string; Icon: typeof Bookmark }> = {
  saved: { label: "Saved", surface: "bg-warning-soft border-warning/30", badge: "bg-warning-soft text-warning border-warning/30", Icon: Bookmark },
  applied: { label: "Applied", surface: "bg-success-soft border-success/30", badge: "bg-success-soft text-success border-success/30", Icon: Send },
  interview: { label: "Interview", surface: "bg-terracotta-soft border-terracotta/30", badge: "bg-terracotta-soft text-terracotta border-terracotta/30", Icon: MessagesSquare },
  offer: { label: "Offer", surface: "bg-primary-soft border-primary/30", badge: "bg-primary-soft text-primary border-primary/30", Icon: Trophy },
  rejected: { label: "Rejected", surface: "bg-secondary border-muted-foreground/30", badge: "bg-secondary text-muted-foreground border-muted-foreground/30", Icon: Ban },
};

export function StatusBadge({ status, lang = "en" }: { status: OfferStatus; lang?: UiLang }) {
  const { badge, Icon } = statusVisual[status];
  const label = OFFERS_COPY[lang].status[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", badge)}>
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export function CoverageLabel({ covered, lang = "en" }: { covered: boolean; lang?: UiLang }) {
  const t = OFFERS_COPY[lang];
  return covered ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
      <CheckCircle2 className="size-3.5" aria-hidden="true" /> {t.covered}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gap">
      <XCircle className="size-3.5" aria-hidden="true" /> {t.gap}
    </span>
  );
}

export function MatchRing({ covered, total, size = 72, lang = "en" }: { covered: number; total: number; size?: number; lang?: UiLang }) {
  const score = total ? covered / total : 0;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={fill(OFFERS_COPY[lang].matchAria, { percent: Math.round(score * 100) })}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - score)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-foreground text-sm font-semibold">
        {Math.round(score * 100)}%
      </text>
    </svg>
  );
}

/** Quote icon; hovering or focusing shows the verbatim quote from the offer. */
export function QuoteChip({ quote, label, lang = "en" }: { quote: string; label?: string; lang?: UiLang }) {
  const t = OFFERS_COPY[lang];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={fill(t.quoteAria, { quote })}
          className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-1.5 py-0.5 align-middle text-xs text-accent-foreground hover:ring-1 hover:ring-primary/40"
        >
          <Quote className="size-3" aria-hidden="true" />
          {label && <span>{label}</span>}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-[11px] tracking-wide uppercase opacity-70">{t.fromOffer}</p>
        <p className="italic">“{quote}”</p>
      </TooltipContent>
    </Tooltip>
  );
}
