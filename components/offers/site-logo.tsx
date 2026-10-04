import { Building2, ClipboardPaste } from "lucide-react";
import Image from "next/image";
import { siIndeed } from "simple-icons";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import type { UiLang } from "@/lib/i18n/ui";
import type { SourceSite } from "@/lib/types";

// Where an offer comes from: the platform's small logo (public/sites/, Indeed from Simple Icons) and its
// name. Pasted text and company sites get a plain icon.

const IMAGES: Partial<Record<SourceSite, string>> = { actiris: "/sites/actiris.png", forem: "/sites/forem.png", linkedin: "/sites/linkedin.png" };

function Mark({ site }: { site: SourceSite }) {
  const src = IMAGES[site];
  if (src) return <Image src={src} width={16} height={16} alt="" className="size-4 rounded-sm object-contain" />;
  if (site === "indeed") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill={`#${siIndeed.hex}`} aria-hidden="true">
        <path d={siIndeed.path} />
      </svg>
    );
  }
  const Icon = site === "company" ? Building2 : ClipboardPaste;
  return <Icon className="size-4 text-muted-foreground" aria-hidden="true" />;
}

export function SiteLogo({ site, lang = "en" }: { site: SourceSite; lang?: UiLang }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Mark site={site} />
      <span className="truncate">{OFFERS_COPY[lang].site[site]}</span>
    </span>
  );
}
