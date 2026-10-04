"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import { type ReactNode, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fill } from "@/lib/interview/copy";

type Result = { ok: true; data: null } | { ok: false; error: string };

/** Who serves the requests: the user's key, the instance key (owner only), or the free fallback. */
export type ServiceState = "own" | "instance" | "free";

interface Props {
  id: string;
  icon: ReactNode;
  title: string;
  intro: ReactNode;
  usedFor: { title: string; items: string[] };
  copy: { key: string; savedKey: string; empty: string; saved: string; removed: string; currently: string; save: string; remove: string };
  /** How each state is named in "Currently using: …". */
  states: Record<ServiceState, string>;
  /** What is used right now. */
  current: ServiceState;
  /** What is used once the user's own key is removed (computed by the server). */
  fallback: Exclude<ServiceState, "own">;
  hasKey: boolean;
  keyLast4: string | null;
  getKey?: { url: string; label: string };
  actions: { save: (key: string) => Promise<Result>; remove: () => Promise<Result> };
}

// A card for an optional key of a service other than the AI (voice, offer pages), stored encrypted.
export function ServiceKeyForm({ id, icon, title, intro, usedFor, copy, states, current: initialCurrent, fallback, hasKey: initialHasKey, keyLast4, getKey, actions }: Props) {
  const [hasKey, setHasKey] = useState(initialHasKey);
  const [last4, setLast4] = useState(keyLast4);
  const [current, setCurrent] = useState(initialCurrent);
  const [key, setKey] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-xl font-medium">
          {icon} {title}
        </CardTitle>
        <CardDescription>{intro}</CardDescription>
        <div className="rounded-xl border border-earth/15 px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">{usedFor.title}</p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
            {usedFor.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor={id}>{copy.key}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={id}
            type="password"
            autoComplete="off"
            placeholder={hasKey ? fill(copy.savedKey, { last4: last4 ?? "" }) : copy.empty}
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
                  setCurrent("own");
                  setKey("");
                }
                setMessage(result.ok ? { kind: "success", text: copy.saved } : { kind: "error", text: result.error });
              })
            }
          >
            {copy.save}
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
                    setCurrent(fallback);
                  }
                  setMessage(result.ok ? { kind: "success", text: copy.removed } : { kind: "error", text: result.error });
                })
              }
            >
              {copy.remove}
            </Button>
          )}
        </div>
        {getKey && (
          <a href={getKey.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground underline">
            {getKey.label} <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        )}
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" /> {fill(copy.currently, { current: states[current] })}
        </p>
        <p aria-live="polite" className={`min-h-5 text-sm ${message?.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message?.text}
        </p>
      </CardContent>
    </Card>
  );
}
