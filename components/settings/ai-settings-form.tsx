"use client";

import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProviderId } from "@/lib/ai/providers";
import type { PublicAiSettings } from "@/lib/data/ai-settings";

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
}

type Message = { kind: "success" | "error"; text: string } | null;

// Client component: holds the form state and calls the server actions it receives as props.
// The API key only travels browser -> server; the server only ever sends back its last 4 characters.
export function AiSettingsForm({ initial, presets, allowCustom, isOwner, suggestedModel, actions }: Props) {
  const [saved, setSaved] = useState(initial);
  const [provider, setProvider] = useState<ProviderId>(initial?.provider ?? "openrouter");
  const [baseUrl, setBaseUrl] = useState(initial?.provider === "custom" ? initial.baseUrl : "");
  const [model, setModel] = useState(initial?.model ?? suggestedModel);
  const [apiKey, setApiKey] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [message, setMessage] = useState<Message>(null);
  const [pending, startTransition] = useTransition();
  const listId = useId();

  const preset = presets.find((p) => p.id === provider);
  const savedKeyForProvider = saved?.hasKey && saved.provider === provider;

  function run<T>(action: () => Promise<Result<T>>, onSuccess: (data: T) => string) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? { kind: "success", text: onSuccess(result.data) } : { kind: "error", text: result.error });
    });
  }

  function changeProvider(value: string) {
    const next = value as ProviderId;
    setProvider(next);
    setModels([]);
    setModel(next === saved?.provider ? saved.model : next === "openrouter" ? suggestedModel : "");
    setMessage(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your AI</CardTitle>
        <CardDescription>
          Any OpenAI-compatible provider works, paid or free. OpenRouter lists free models (ids ending in{" "}
          <code>:free</code>).
          {isOwner && " As the instance owner, NextRound uses the instance key whenever you have no key saved."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="provider">Provider</Label>
          <Select value={provider} onValueChange={changeProvider}>
            <SelectTrigger id="provider" className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presets.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
              <SelectItem value="custom" disabled={!allowCustom}>
                Custom base URL {allowCustom ? "" : "(self-hosting only)"}
              </SelectItem>
            </SelectContent>
          </Select>
          {!allowCustom && (
            <p className="text-xs text-muted-foreground">
              Custom base URLs (e.g. a local model) are disabled on this public instance, so that the server never calls
              arbitrary hosts. Self-hosters enable them with <code>ALLOW_CUSTOM_LLM_BASE_URL=true</code>.
            </p>
          )}
        </div>

        {provider === "custom" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="base-url">Base URL</Label>
            <Input
              id="base-url"
              placeholder="http://localhost:11434/v1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="model">Model</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="model"
              list={listId}
              placeholder="Model id, e.g. provider/model-name"
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
                    return `${list.length} models loaded: start typing to pick one.`;
                  },
                )
              }
            >
              Load models
            </Button>
          </div>
          <datalist id={listId}>
            {models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="api-key">API key</Label>
          <Input
            id="api-key"
            type="password"
            autoComplete="off"
            placeholder={savedKeyForProvider ? `Saved key ••••${saved?.keyLast4} — leave empty to keep it` : "Paste your API key"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Stored encrypted (AES-256-GCM), used only by the server, never shown again.
            {preset && "keysUrl" in preset && (
              <>
                {" "}
                <a href={preset.keysUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                  Get a {preset.label} key <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </>
            )}
          </p>
        </div>

        <div aria-live="polite" className="min-h-6">
          {pending && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Working…
            </p>
          )}
          {!pending && message && (
            <p className={`flex items-center gap-2 text-sm ${message.kind === "error" ? "text-destructive" : ""}`}>
              {message.kind === "success" ? (
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <XCircle className="size-4" aria-hidden="true" />
              )}
              {message.text}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button
          disabled={pending || !model.trim()}
          onClick={() =>
            run(
              () =>
                actions.save({
                  provider,
                  baseUrl: provider === "custom" ? baseUrl : undefined,
                  model: model.trim(),
                  apiKey: apiKey.trim() || undefined,
                }),
              (settings) => {
                setSaved(settings);
                setApiKey("");
                return settings.hasKey ? "Saved. Your key is stored encrypted." : "Saved. Add a key to use your own AI.";
              },
            )
          }
        >
          Save
        </Button>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            run(actions.test, (r) =>
              r.source === "user" ? `Connected: ${r.model} answered with your key.` : `Connected: ${r.model} answered with the instance key.`,
            )
          }
        >
          Test connection
        </Button>
        {saved?.hasKey && (
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() =>
              run(actions.removeKey, () => {
                setSaved((s) => (s ? { ...s, hasKey: false, keyLast4: null } : s));
                return "Key removed.";
              })
            }
          >
            Remove key
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
