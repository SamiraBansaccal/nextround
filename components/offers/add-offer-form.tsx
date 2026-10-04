"use client";

import { Link2, Loader2, ScanLine, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OffersCopy } from "@/lib/i18n/offers";
import { cn } from "@/lib/utils";

type Result = { ok: true; offerId: string; dropped: number } | { ok: false; error: string; needText?: boolean };

// Add an offer by link (main flow), or by pasted text when the page blocks access.
// Two layouts from the Lovable prototype: "card" (offers page) and "bar" (dashboard band).
export function AddOfferForm({
  addOffer,
  t,
  variant = "card",
}: {
  addOffer: (input: { url?: string; text?: string }) => Promise<Result>;
  t: OffersCopy;
  variant?: "card" | "bar";
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [showText, setShowText] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addOffer({ url: url.trim() || undefined, text: showText ? text.trim() || undefined : undefined });
      if (result.ok) {
        router.push(`/offers/${result.offerId}`);
        return;
      }
      setError(result.error);
      if (result.needText) {
        setShowText(true);
        setBlocked(true);
      }
    });
  }

  const bar = variant === "bar";

  return (
    <section
      className={cn(bar ? "border-y border-border bg-primary-soft/50 px-4 py-5 sm:px-6" : "border-l-4 border-terracotta bg-card p-5 shadow-soft sm:p-6")}
      aria-labelledby="add-offer-title"
    >
      {bar ? (
        <p id="add-offer-title" className="mb-3 text-sm font-semibold text-primary">
          {t.addOpportunity}
        </p>
      ) : (
        <>
          <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">
            <Link2 className="size-4" aria-hidden="true" /> {t.addOffer}
          </p>
          <h2 id="add-offer-title" className="mt-1 text-2xl text-earth dark:text-foreground">
            {t.addTitle}
          </h2>
          <p className="mt-1 mb-4 max-w-3xl text-sm text-muted-foreground">
            {t.addIntro}
          </p>
        </>
      )}
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="relative flex-1">
          <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.linkPlaceholder}
            aria-label={t.linkLabel}
            className="h-11 bg-background pl-9"
          />
        </div>
        <Button size="lg" className="h-11" disabled={pending || (!url.trim() && !text.trim())}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> {t.readingOffer}
            </>
          ) : (
            <>
              <ScanLine className="size-4" aria-hidden="true" /> {t.scan}
            </>
          )}
        </Button>
      </form>
      {!showText && (
        <button type="button" className="mt-3 w-fit text-sm text-muted-foreground underline" onClick={() => setShowText(true)}>
          {t.orPasteText}
        </button>
      )}
      {showText && (
        <div className={cn("mt-4 space-y-2 rounded-xl p-4", blocked ? "bg-warning-soft" : "bg-muted/60")}>
          {blocked && (
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldAlert className="size-4 text-warning" aria-hidden="true" /> {t.pageBlocked}
            </p>
          )}
          <textarea
            rows={5}
            className="w-full rounded-md border bg-card p-3 text-sm"
            placeholder={t.textPlaceholder}
            value={text}
            maxLength={30000}
            onChange={(e) => setText(e.target.value)}
            aria-label={t.textLabel}
          />
          <Button size="sm" disabled={pending || text.trim().length === 0} onClick={submit}>
            {t.useText}
          </Button>
        </div>
      )}
      <p aria-live="polite" className="mt-2 min-h-5 text-sm">
        {pending && <span className="text-muted-foreground">{t.readingHint}</span>}
        {!pending && error && !blocked && <span className="text-destructive">{error}</span>}
      </p>
    </section>
  );
}
