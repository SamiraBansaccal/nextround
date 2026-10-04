"use client";

import { Check, PencilLine, Sparkles, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// The facts of one place of the profile (an entry of a CV, the GitHub projects…), reviewed where they
// come from: keep, edit or reject a proposed fact; edit or remove a validated one; mark a project built
// with AI ("vibe coding").

export interface ReviewFact {
  id: string;
  type: string;
  text: string;
  validated: boolean;
  aiAssisted: boolean;
}

type Result = { ok: true; message: string } | { ok: false; error: string };

export interface ReviewActions {
  validate: (id: string) => Promise<Result>;
  reject: (id: string) => Promise<Result>;
  edit: (input: { id: string; text: string }) => Promise<Result>;
  setAiAssisted: (input: { id: string; aiAssisted: boolean }) => Promise<Result>;
}

export function FactReviewList({
  facts,
  actions,
  pending,
  run,
  className,
}: {
  facts: ReviewFact[];
  actions: ReviewActions;
  pending: boolean;
  run: (action: () => Promise<Result>) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  if (facts.length === 0) return null;
  return (
    <ul className={cn("no-print mt-3 space-y-1.5", className)} aria-label="Facts to review">
      {facts.map((fact) => (
        <li
          key={fact.id}
          className={cn(
            "flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-2.5 py-1.5 text-sm",
            fact.validated ? "border-success/25 bg-success-soft/40" : "border-terracotta/30 bg-terracotta-soft/30",
          )}
        >
          {fact.validated ? (
            <Check className="size-4 shrink-0 text-success" aria-label="Validated" />
          ) : (
            <span className="shrink-0 rounded-full bg-terracotta px-1.5 text-[10px] font-bold text-white uppercase">to review</span>
          )}
          {editing?.id === fact.id ? (
            <Input className="h-8 min-w-0 flex-1" value={editing.text} onChange={(e) => setEditing({ id: fact.id, text: e.target.value })} aria-label="Edit fact" autoFocus />
          ) : (
            <span className="min-w-0 flex-1">{fact.text}</span>
          )}
          <span className="flex shrink-0 items-center gap-1">
            {editing?.id === fact.id ? (
              <>
                <Button size="sm" className="h-7" disabled={pending} onClick={() => run(async () => { const r = await actions.edit(editing); if (r.ok) setEditing(null); return r; })}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {!fact.validated && (
                  <Button size="sm" className="h-7" disabled={pending} onClick={() => run(() => actions.validate(fact.id))}>
                    <Check className="size-3.5" aria-hidden="true" /> Keep
                  </Button>
                )}
                {fact.type === "project" && (
                  <button
                    type="button"
                    aria-pressed={fact.aiAssisted}
                    disabled={pending}
                    onClick={() => run(() => actions.setAiAssisted({ id: fact.id, aiAssisted: !fact.aiAssisted }))}
                    title={fact.aiAssisted ? "Built with AI: never counts as mastery of its stack. Click if you wrote it yourself." : "Built with AI (vibe coding)?"}
                    className={cn(
                      "inline-flex h-7 items-center gap-1 rounded-full border px-2 text-xs disabled:opacity-50",
                      fact.aiAssisted ? "border-terracotta/40 bg-terracotta-soft text-terracotta" : "border-earth/20 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Sparkles className="size-3" aria-hidden="true" /> {fact.aiAssisted ? "Built with AI" : "AI?"}
                  </button>
                )}
                <Button size="icon" variant="ghost" className="size-7" disabled={pending} onClick={() => setEditing({ id: fact.id, text: fact.text })} aria-label={`Edit: ${fact.text}`}>
                  <PencilLine className="size-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="size-7" disabled={pending} onClick={() => run(() => actions.reject(fact.id))} aria-label={fact.validated ? `Remove: ${fact.text}` : `Reject: ${fact.text}`}>
                  {fact.validated ? <Trash2 className="size-3.5" /> : <X className="size-3.5" />}
                </Button>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
