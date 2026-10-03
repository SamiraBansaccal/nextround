"use client";

import { Link2, Loader2, ScanSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Result = { ok: true; offerId: string; dropped: number } | { ok: false; error: string; needText?: boolean };

export function AddOfferForm({ addOffer }: { addOffer: (input: { url?: string; text?: string }) => Promise<Result> }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [showText, setShowText] = useState(false);
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
      if (result.needText) setShowText(true);
    });
  }

  return (
    <section className="border-l-4 border-terracotta bg-card p-5 shadow-soft sm:p-6" aria-labelledby="add-offer-title">
      <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">
        <Link2 className="size-4" aria-hidden="true" /> Add an offer
      </p>
      <h2 id="add-offer-title" className="mt-1 text-2xl text-earth dark:text-foreground">
        Paste the link of an offer you like
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        Indeed, Actiris, Le Forem, LinkedIn, a company site… The AI reads it; every requirement, stack item and contact is kept only if
        its quote is found word for word in the offer.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input type="url" inputMode="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Offer link" className="sm:flex-1" />
        <Button disabled={pending || (!url.trim() && !text.trim())} onClick={submit}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ScanSearch className="size-4" aria-hidden="true" />}
          Scan the offer
        </Button>
      </div>
      {!showText && (
        <button type="button" className="mt-3 w-fit text-sm text-muted-foreground underline" onClick={() => setShowText(true)}>
          Or paste the offer text
        </button>
      )}
      {showText && (
        <textarea
          className="mt-3 min-h-40 w-full rounded-md border bg-background p-3 text-sm"
          placeholder="Paste the full text of the offer here"
          value={text}
          maxLength={30000}
          onChange={(e) => setText(e.target.value)}
          aria-label="Offer text"
        />
      )}
      <p aria-live="polite" className="mt-2 min-h-5 text-sm">
        {pending && <span className="text-muted-foreground">Reading the offer and checking every quote… this can take up to a minute with free models.</span>}
        {!pending && error && <span className="text-destructive">{error}</span>}
      </p>
    </section>
  );
}
