"use client";

import { Link2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Add an offer</CardTitle>
        <CardDescription>
          Paste the link (Indeed, Actiris, Le Forem, LinkedIn, a company site…). The AI reads it; every requirement, stack item and
          contact is kept only if its quote is found word for word in the offer.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="Offer link"
            className="sm:flex-1"
          />
          <Button disabled={pending || (!url.trim() && !text.trim())} onClick={submit}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
            Scan
          </Button>
        </div>
        {!showText && (
          <button type="button" className="w-fit text-sm text-muted-foreground underline" onClick={() => setShowText(true)}>
            Or paste the offer text
          </button>
        )}
        {showText && (
          <textarea
            className="min-h-40 w-full rounded-md border bg-transparent p-3 text-sm"
            placeholder="Paste the full text of the offer here"
            value={text}
            maxLength={30000}
            onChange={(e) => setText(e.target.value)}
            aria-label="Offer text"
          />
        )}
        <p aria-live="polite" className="text-sm">
          {pending && <span className="text-muted-foreground">Reading the offer and checking every quote… this can take up to a minute with free models.</span>}
          {!pending && error && <span className="text-destructive">{error}</span>}
        </p>
      </CardContent>
    </Card>
  );
}
