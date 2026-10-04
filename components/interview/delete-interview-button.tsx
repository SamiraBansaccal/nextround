"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

// Deletes a practice interview from the list, after a confirmation. Display and event only: the
// server action is passed in.
export function DeleteInterviewButton({ interviewId, label, remove }: { interviewId: string; label: string; remove: (id: string) => Promise<{ ok: boolean }> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="icon"
      variant="ghost"
      className="text-muted-foreground hover:text-destructive"
      disabled={pending}
      aria-label={`Delete the interview “${label}”`}
      title="Delete this interview"
      onClick={() => {
        if (!window.confirm(`Delete the interview “${label}” and its answers? This cannot be undone.`)) return;
        startTransition(async () => {
          await remove(interviewId);
          router.refresh();
        });
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
    </Button>
  );
}
