import { KeyRound, Mic, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AiStatus } from "@/lib/ai/config";

// Which AI and which voice the user's requests will use (never a key). When there is no AI, it is
// the "Add your AI key in Settings" banner of the Lovable prototype.
export function AiStatusCard({ status, showSettingsLink = true }: { status: AiStatus; showSettingsLink?: boolean }) {
  if (status.mode === "none") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
        <KeyRound className="size-4 text-warning" aria-hidden="true" />
        <span className="flex-1">Add your AI key in Settings to use AI features.</span>
        {showSettingsLink && (
          <Button asChild size="sm" variant="outline">
            <Link href="/settings">Open Settings</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 border border-earth/20 bg-card p-6 shadow-soft">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">
          <Sparkles className="size-4" aria-hidden="true" /> AI in use
        </p>
        <p className="mt-2 font-display text-2xl">{status.providerLabel}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {status.mode === "own_key"
            ? "Your own key: your provider bills you directly, NextRound adds no limit."
            : "The instance key (you are the owner): limited to 8 requests per minute and 40 per day."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{status.model}</code>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Mic className="size-3.5" aria-hidden="true" />
          Voice: {status.voice === "own_key" ? "your ElevenLabs key" : status.voice === "instance" ? "ElevenLabs (instance key)" : "your browser (free)"}
        </span>
      </div>
    </section>
  );
}
