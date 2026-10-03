import { KeyRound, Mic, Sparkles } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiStatus } from "@/lib/ai/config";

// Presentational: which AI and which voice the user's requests will use. Never shows a key.
export function AiStatusCard({ status, showSettingsLink = true }: { status: AiStatus; showSettingsLink?: boolean }) {
  if (status.mode === "none") {
    return (
      <Alert>
        <KeyRound />
        <AlertTitle>No AI connected yet</AlertTitle>
        <AlertDescription>
          <p>Add your AI key in Settings to use AI features.</p>
          {showSettingsLink && (
            <Button asChild size="sm" className="mt-2">
              <Link href="/settings">Open Settings</Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4" aria-hidden="true" /> AI in use
        </CardTitle>
        <CardDescription>
          {status.mode === "own_key"
            ? "Your own key: your provider bills you directly, NextRound adds no limit."
            : "The instance key (you are the owner): limited to 8 requests per minute and 40 per day."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">{status.providerLabel}</Badge>
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{status.model}</code>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Mic className="size-3.5" aria-hidden="true" />
          Voice:{" "}
          {status.voice === "own_key" ? "your ElevenLabs key" : status.voice === "instance" ? "ElevenLabs (instance key)" : "your browser (free)"}
        </span>
      </CardContent>
    </Card>
  );
}
