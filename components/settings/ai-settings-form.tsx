"use client";

import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WithCode } from "@/components/shared/with-code";
import type { ProviderId } from "@/lib/ai/providers";
import type { PublicAiSettings } from "@/lib/data/ai-settings";
import type { SettingsCopy } from "@/lib/i18n/settings";
import { fill } from "@/lib/interview/copy";
import { cn } from "@/lib/utils";

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

export interface AiSettingsActions {
  save: (input: { provider: ProviderId; baseUrl?: string; model: string; apiKey?: string }) => Promise<Result<PublicAiSettings>>;
  removeKey: () => Promise<Result>;
  test: () => Promise<Result<{ model: string; source: "user" | "instance" }>>;
  loadModels: (input: { provider: ProviderId; baseUrl?: string }) => Promise<Result<string[]>>;
}

interface Props {
  initial: PublicAiSettings | null;
  presets: { id: ProviderId; label: string; keysUrl: string }[];
  allowCustom: boolean;
  isOwner: boolean;
  suggestedModel: string;
  actions: AiSettingsActions;
  t: SettingsCopy;
}

type Message = { kind: "success" | "error"; text: string } | null;

// "AI provider" card (layout from the Lovable prototype). The API key only travels
// browser -> server; the server only ever sends back its last 4 characters.
export function AiSettingsForm({ initial, presets, allowCustom, isOwner, suggestedModel, actions, t }: Props) {
  const [saved, setSaved] = useState(initial);
  const [provider, setProvider] = useState<ProviderId>(initial?.provider ?? "openrouter");
  const [baseUrl, setBaseUrl] = useState(initial?.provider === "custom" ? initial.baseUrl : "");
  const [model, setModel] = useState(initial?.model ?? suggestedModel);
  const [apiKey, setApiKey] = useState("");
  const [replacing, setReplacing] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [message, setMessage] = useState<Message>(null);
  const [testResult, setTestResult] = useState<Message>(null);
  const [pending, startTransition] = useTransition();
  const listId = useId();

  const preset = presets.find((p) => p.id === provider);
  const keyOnFile = saved?.hasKey && saved.provider === provider && !replacing;
  const options = [...presets.map((p) => ({ id: p.id, label: p.label })), ...(allowCustom ? [{ id: "custom" as const, label: t.customUrl }] : [])];

  function run<T>(action: () => Promise<Result<T>>, onSuccess: (data: T) => string, target: "message" | "test" = "message") {
    const set = target === "test" ? setTestResult : setMessage;
    set(null);
    startTransition(async () => {
      const result = await action();
      set(result.ok ? { kind: "success", text: onSuccess(result.data) } : { kind: "error", text: result.error });
    });
  }

  function chooseProvider(next: ProviderId) {
    setProvider(next);
    setModels([]);
    setReplacing(false);
    setApiKey("");
    setModel(next === saved?.provider ? saved.model : next === "openrouter" ? suggestedModel : next === "anthropic" ? "claude-opus-5-5" : "");
    setMessage(null);
    setTestResult(null);
  }

  function save() {
    run(
      () => actions.save({ provider, baseUrl: provider === "custom" ? baseUrl : undefined, model: model.trim(), apiKey: apiKey.trim() || undefined }),
      (settings) => {
        setSaved(settings);
        setApiKey("");
        setReplacing(false);
        return settings.hasKey ? t.savedWithKey : t.savedNoKey;
      },
    );
  }

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader>
        <CardTitle className="font-display text-xl font-medium">{t.aiTitle}</CardTitle>
        <CardDescription>
          <WithCode text={t.aiIntro} />
          {isOwner && t.aiOwner}
        </CardDescription>
        <div className="rounded-xl border border-earth/15 px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">{t.aiUsedFor}</p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
            {[t.aiUses.interviews, t.aiUses.offers, t.aiUses.profile, t.aiUses.documents].map((use) => (
              <li key={use}>{use}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">{t.aiUses.free}</p>
        </div>
        <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-foreground">
          <WithCode text={t.aiCost} />
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label={t.provider}>
          {options.map((x) => (
            <Button
              key={x.id}
              type="button"
              variant="outline"
              aria-pressed={provider === x.id}
              onClick={() => chooseProvider(x.id)}
              className={cn("h-auto p-3 text-sm font-medium whitespace-normal", provider === x.id && "border-terracotta bg-terracotta-soft text-terracotta dark:text-earth")}
            >
              {x.label}
            </Button>
          ))}
        </div>
        {!allowCustom && (
          <p className="-mt-3 text-xs text-muted-foreground">
            <WithCode text={t.customOff} />
          </p>
        )}

        {provider === "anthropic" && (
          <p className="-mt-3 text-sm text-muted-foreground">
            {t.claudeNote}
          </p>
        )}

        {provider === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="base-url">{t.baseUrl}</Label>
            <Input id="base-url" placeholder="http://localhost:11434/v1" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="model">{t.model}</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="model"
              list={listId}
              placeholder={t.modelPlaceholder}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="sm:flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() =>
                run(
                  () => actions.loadModels({ provider, baseUrl: provider === "custom" ? baseUrl : undefined }),
                  (list) => {
                    setModels(list);
                    return fill(t.modelsLoaded, { count: list.length });
                  },
                )
              }
            >
              {t.loadModels}
            </Button>
          </div>
          <datalist id={listId}>
            {models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key">{t.apiKey}</Label>
          {keyOnFile ? (
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <code className="min-w-0 rounded-md border bg-muted px-3 py-2 text-sm break-all">••••{saved?.keyLast4}</code>
              <Button type="button" variant="outline" onClick={() => setReplacing(true)}>
                {t.replace}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  run(actions.removeKey, () => {
                    setSaved((s) => (s ? { ...s, hasKey: false, keyLast4: null } : s));
                    return t.keyRemoved;
                  })
                }
              >
                {t.remove}
              </Button>
            </div>
          ) : (
            <Input id="api-key" type="password" autoComplete="off" placeholder={t.pasteKey} value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          )}
          <p className="text-xs text-muted-foreground">
            {t.stored}
            {preset && (
              <>
                {" "}
                <a href={preset.keysUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                  {fill(t.getKey, { provider: preset.label })} <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={pending || !model.trim()} onClick={save}>
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} {t.save}
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(
                actions.test,
                (r) => fill(r.source === "user" ? t.connectedOwn : t.connectedInstance, { model: r.model }),
                "test",
              )
            }
          >
            {t.test}
          </Button>
        </div>
        <div aria-live="polite" className="space-y-1">
          {testResult && (
            <p className={cn("flex items-center gap-1 text-sm font-medium", testResult.kind === "success" ? "text-success" : "text-gap")}>
              {testResult.kind === "success" ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <XCircle className="size-4" aria-hidden="true" />}
              {testResult.text}
            </p>
          )}
          {message && <p className={cn("text-sm", message.kind === "error" ? "text-destructive" : "text-muted-foreground")}>{message.text}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
