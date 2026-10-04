"use client";

import { CheckCircle2, Volume2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WithCode } from "@/components/with-code";
import type { SettingsCopy } from "@/lib/i18n/settings";
import { fill } from "@/lib/interview/copy";

type Result = { ok: true; data: null } | { ok: false; error: string };

interface Props {
  hasKey: boolean;
  keyLast4: string | null;
  isOwner: boolean;
  /** What the interview will actually use right now. */
  currentVoice: "own_key" | "instance" | "browser";
  /** What is used once the user's own key is removed (computed by the server). */
  fallbackVoice: "instance" | "browser";
  actions: { save: (key: string) => Promise<Result>; remove: () => Promise<Result> };
  t: SettingsCopy;
}

// "Voice" card (layout from the Lovable prototype). Optional ElevenLabs key, stored encrypted.
export function VoiceSettingsForm({ hasKey: initialHasKey, keyLast4, isOwner, currentVoice, fallbackVoice, actions, t }: Props) {
  const currentLabel = { own_key: t.currentOwn, instance: t.currentInstance, browser: t.currentBrowser };
  const [hasKey, setHasKey] = useState(initialHasKey);
  const [last4, setLast4] = useState(keyLast4);
  const [current, setCurrent] = useState(currentVoice);
  const [key, setKey] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-xl font-medium">
          <Volume2 className="size-5" aria-hidden="true" /> {t.voiceTitle}
        </CardTitle>
        <CardDescription>
          {t.voiceIntro}
          {isOwner && <WithCode text={t.voiceOwner} />}
          {t.voiceCredits}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="voice-key">{t.voiceKey}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="voice-key"
            type="password"
            autoComplete="off"
            placeholder={hasKey ? fill(t.voiceSavedKey, { last4: last4 ?? "" }) : t.voiceEmpty}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="sm:flex-1"
          />
          <Button
            disabled={pending || key.trim().length === 0}
            onClick={() =>
              startTransition(async () => {
                const result = await actions.save(key.trim());
                if (result.ok) {
                  setHasKey(true);
                  setLast4(key.trim().slice(-4));
                  setCurrent("own_key");
                  setKey("");
                }
                setMessage(result.ok ? { kind: "success", text: t.voiceSaved } : { kind: "error", text: result.error });
              })
            }
          >
            {t.save}
          </Button>
          {hasKey && (
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await actions.remove();
                  if (result.ok) {
                    setHasKey(false);
                    setCurrent(fallbackVoice);
                  }
                  setMessage(result.ok ? { kind: "success", text: t.voiceRemoved } : { kind: "error", text: result.error });
                })
              }
            >
              {t.remove}
            </Button>
          )}
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" /> {fill(t.currently, { voice: currentLabel[current] })}
        </p>
        <p aria-live="polite" className={`min-h-5 text-sm ${message?.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message?.text}
        </p>
      </CardContent>
    </Card>
  );
}
