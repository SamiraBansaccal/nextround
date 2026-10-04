"use client";

import { Check, Loader2, PencilLine, X } from "lucide-react";
import { type ReactNode, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export interface EditableLineCopy {
  editLine: string;
  save: string;
  cancel: string;
}

/**
 * A line of text shown as is, with a small pencil next to it (always visible on touch screens, on
 * hover or focus elsewhere). The pencil turns the line into a text field: Enter or the tick saves,
 * Escape or the cross cancels. `onSave` returns false to keep the field open (the error is shown by the page).
 */
export function EditableLine({
  value,
  onSave,
  t,
  children,
  className,
  hint,
}: {
  value: string;
  onSave: (value: string) => Promise<boolean>;
  t: EditableLineCopy;
  /** How the line looks when not edited (defaults to the value). */
  children?: ReactNode;
  className?: string;
  /** Shown under the field while editing (e.g. "Leave empty to remove the line."). */
  hint?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, startTransition] = useTransition();

  function save() {
    if (draft.trim() === value.trim()) return setEditing(false);
    startTransition(async () => {
      if (await onSave(draft)) setEditing(false);
    });
  }

  if (editing) {
    return (
      <span className={cn("flex w-full flex-col gap-1", className)}>
        <span className="flex items-start gap-1">
          <textarea
            autoFocus
            rows={Math.min(6, Math.max(1, Math.ceil(draft.length / 70)))}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                save();
              }
              if (e.key === "Escape") setEditing(false);
            }}
            aria-label={t.editLine}
            className="min-w-0 flex-1 resize-y rounded-md border border-primary/40 bg-background px-2 py-1 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
          <button type="button" onClick={save} disabled={pending} aria-label={t.save} className="grid size-7 shrink-0 place-items-center rounded-md text-success hover:bg-success-soft">
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => setEditing(false)} disabled={pending} aria-label={t.cancel} className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted">
            <X className="size-4" aria-hidden="true" />
          </button>
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
    );
  }

  return (
    <span className={cn("group/line inline", className)}>
      {children ?? value}
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        aria-label={`${t.editLine}: ${value}`}
        title={t.editLine}
        className="no-print ml-1 inline-grid size-5 place-items-center rounded align-middle text-muted-foreground/70 transition-opacity hover:text-primary focus-visible:opacity-100 sm:opacity-0 sm:group-hover/line:opacity-100"
      >
        <PencilLine className="size-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}
