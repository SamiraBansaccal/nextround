"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Result = { ok: true; data: null } | { ok: false; error: string };

interface Props {
  hasKey: boolean;
  keyLast4: string | null;
  isOwner: boolean;
  actions: { save: (key: string) => Promise<Result>; remove: () => Promise<Result> };
}

export function VoiceSettingsForm({ hasKey: initialHasKey, keyLast4, isOwner, actions }: Props) {
  const [hasKey, setHasKey] = useState(initialHasKey);
  const [last4, setLast4] = useState(keyLast4);
  const [key, setKey] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice (optional)</CardTitle>
        <CardDescription>
          Used by the voice interview mode. Without an ElevenLabs key, NextRound uses your browser&apos;s built-in voice,
          for free.
          {isOwner && " As the owner, the instance's ElevenLabs key is used when you have none."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Label htmlFor="voice-key">ElevenLabs API key</Label>
        <Input
          id="voice-key"
          type="password"
          autoComplete="off"
          placeholder={hasKey ? `Saved key ••••${last4} — paste a new one to replace it` : "Paste your ElevenLabs key"}
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <p aria-live="polite" className={`min-h-5 text-sm ${message?.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message?.text}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          disabled={pending || key.trim().length === 0}
          onClick={() =>
            startTransition(async () => {
              const result = await actions.save(key.trim());
              if (result.ok) {
                setHasKey(true);
                setLast4(key.trim().slice(-4));
                setKey("");
              }
              setMessage(result.ok ? { kind: "success", text: "Saved, stored encrypted." } : { kind: "error", text: result.error });
            })
          }
        >
          Save voice key
        </Button>
        {hasKey && (
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await actions.remove();
                if (result.ok) setHasKey(false);
                setMessage(result.ok ? { kind: "success", text: "Voice key removed." } : { kind: "error", text: result.error });
              })
            }
          >
            Remove
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
