"use client";

import { Check, Mail, UserCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { WithCode } from "@/components/shared/with-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SettingsCopy } from "@/lib/i18n/settings";
import { fill } from "@/lib/interview/copy";

type Result = { ok: true; data: string } | { ok: false; error: string };

interface Props {
  requests: { id: string; email: string; askedOn: string }[];
  guests: { id: string; email: string; you: boolean }[];
  mailOn: boolean;
  actions: { allow: (id: string) => Promise<Result>; decline: (id: string) => Promise<Result>; remove: (id: string) => Promise<Result> };
  t: SettingsCopy;
}

// "Access requests" (Settings, owner only): who asked to join, with Allow / Decline, and the guest list.
export function AccessRequests({ requests, guests, mailOn, actions, t }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<Result>) =>
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? { kind: "success", text: result.data } : { kind: "error", text: result.error });
      if (result.ok) router.refresh();
    });

  return (
    <Card className="border-0 shadow-soft" id="access">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-xl font-medium">
          <Mail className="size-5" aria-hidden="true" /> {t.accessTitle}
        </CardTitle>
        <CardDescription>
          {t.accessIntro} <WithCode text={mailOn ? t.accessMailOn : t.accessMailOff} />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <section>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.accessNone}</p>
          ) : (
            <ul className="divide-y rounded-xl border border-earth/15">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{r.email}</span>
                    <span className="text-xs text-muted-foreground">{fill(t.accessAsked, { date: r.askedOn })}</span>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" disabled={pending} onClick={() => run(() => actions.allow(r.id))}>
                      <Check aria-hidden="true" /> {t.accessAllow}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => actions.decline(r.id))}>
                      <X aria-hidden="true" /> {t.accessDecline}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="guests-title">
          <h3 id="guests-title" className="flex items-center gap-2 text-sm font-semibold">
            <UserCheck className="size-4" aria-hidden="true" /> {t.accessGuests}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{t.accessGuestsHint}</p>
          <ul className="mt-2 space-y-1">
            {guests.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">
                  {g.email}
                  {g.you && <span className="text-muted-foreground"> ({t.accessYou})</span>}
                </span>
                {!g.you && (
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => actions.remove(g.id))}>
                    {t.accessRemove}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
        <p aria-live="polite" className={`min-h-5 text-sm lg:col-span-2 ${message?.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message?.text}
        </p>
      </CardContent>
    </Card>
  );
}
