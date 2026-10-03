"use client";

import { Check, ExternalLink, FolderGit2, Loader2, Pencil, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FactType } from "@/lib/types";

export interface FactView {
  id: string;
  type: FactType;
  text: string;
  source: string;
  sourceRef: string | null;
  validated: boolean;
}

type Result = { ok: true; message: string } | { ok: false; error: string };

interface Props {
  facts: FactView[];
  githubLogin: string | null;
  actions: {
    importGithub: () => Promise<Result>;
    validate: (id: string) => Promise<Result>;
    reject: (id: string) => Promise<Result>;
    edit: (input: { id: string; text: string }) => Promise<Result>;
    addManual: (input: { type: FactType; text: string }) => Promise<Result>;
  };
}

const TYPES: FactType[] = ["project", "experience", "skill", "education", "language", "achievement"];

// Presentational + local form state; every change goes through the server actions it receives.
export function ProfileView({ facts, githubLogin, actions }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [manual, setManual] = useState<{ type: FactType; text: string }>({ type: "skill", text: "" });

  const proposed = facts.filter((f) => !f.validated);
  const validated = facts.filter((f) => f.validated);

  function run(action: () => Promise<Result>, after?: () => void) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? { kind: "success", text: result.message } : { kind: "error", text: result.error });
      if (result.ok) after?.();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="text-muted-foreground">
          The source of truth: only validated facts are ever used to write answers, CVs and letters.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderGit2 className="size-5" aria-hidden="true" /> Import from GitHub
          </CardTitle>
          <CardDescription>
            {githubLogin
              ? `Proposes one project per public repository of @${githubLogin}. You validate what is true.`
              : "Sign in with GitHub to import your public repositories."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button disabled={pending || !githubLogin} onClick={() => run(actions.importGithub)}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <FolderGit2 className="size-4" aria-hidden="true" />}
            Import my repositories
          </Button>
          <p aria-live="polite" className={`text-sm ${message?.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>
            {message?.text}
          </p>
        </CardContent>
      </Card>

      {proposed.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="proposed-title">
          <div className="flex items-center justify-between gap-2">
            <h2 id="proposed-title" className="text-xl font-semibold">
              To review ({proposed.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => run(async () => {
                for (const f of proposed) await actions.validate(f.id);
                return { ok: true, message: "All proposed facts validated." };
              })}
            >
              <Check className="size-4" aria-hidden="true" /> Validate all
            </Button>
          </div>
          {proposed.map((fact) => (
            <FactRow key={fact.id} fact={fact} pending={pending} editing={editing} setEditing={setEditing} run={run} actions={actions} />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="validated-title">
        <h2 id="validated-title" className="text-xl font-semibold">
          Validated facts ({validated.length})
        </h2>
        {validated.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing validated yet: import from GitHub or add a fact below.</p>
        )}
        {validated.map((fact) => (
          <FactRow key={fact.id} fact={fact} pending={pending} editing={editing} setEditing={setEditing} run={run} actions={actions} />
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a fact manually</CardTitle>
          <CardDescription>For anything not on GitHub, e.g. a LeetCode streak, a language, a job.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Select value={manual.type} onValueChange={(v) => setManual((m) => ({ ...m, type: v as FactType }))}>
            <SelectTrigger className="sm:w-40" aria-label="Fact type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="e.g. Solved 150 LeetCode problems"
            value={manual.text}
            onChange={(e) => setManual((m) => ({ ...m, text: e.target.value }))}
            className="sm:flex-1"
            aria-label="Fact text"
          />
          <Button
            disabled={pending || manual.text.trim().length < 3}
            onClick={() => run(() => actions.addManual({ type: manual.type, text: manual.text.trim() }), () => setManual((m) => ({ ...m, text: "" })))}
          >
            <Plus className="size-4" aria-hidden="true" /> Add
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FactRow({
  fact,
  pending,
  editing,
  setEditing,
  run,
  actions,
}: {
  fact: FactView;
  pending: boolean;
  editing: { id: string; text: string } | null;
  setEditing: (v: { id: string; text: string } | null) => void;
  run: (action: () => Promise<Result>, after?: () => void) => void;
  actions: Props["actions"];
}) {
  const isEditing = editing?.id === fact.id;
  return (
    <Card className={fact.validated ? "" : "border-dashed"}>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{fact.type}</Badge>
            <Badge variant="outline">{fact.source}</Badge>
            {fact.validated ? (
              <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                <Check className="size-3" aria-hidden="true" /> validated
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">proposed — check it</span>
            )}
          </div>
          {isEditing ? (
            <Input value={editing.text} onChange={(e) => setEditing({ id: fact.id, text: e.target.value })} aria-label="Edit fact" />
          ) : (
            <p className="break-words">{fact.text}</p>
          )}
          {fact.sourceRef && (
            <a href={fact.sourceRef} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-1 text-xs text-muted-foreground underline">
              Source <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="flex gap-1">
          {isEditing ? (
            <Button size="sm" disabled={pending} onClick={() => run(() => actions.edit(editing), () => setEditing(null))}>
              Save
            </Button>
          ) : (
            <>
              {!fact.validated && (
                <Button size="sm" disabled={pending} onClick={() => run(() => actions.validate(fact.id))} aria-label="Validate">
                  <Check className="size-4" aria-hidden="true" /> Validate
                </Button>
              )}
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => setEditing({ id: fact.id, text: fact.text })} aria-label="Edit">
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => actions.reject(fact.id))} aria-label={fact.validated ? "Delete" : "Reject"}>
                <X className="size-4" aria-hidden="true" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
