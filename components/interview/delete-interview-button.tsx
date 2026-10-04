"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

// Deletes a practice interview from the list, after a confirmation. Display and event only: the
// server action is passed in.
export function DeleteInterviewButton({
  interviewId,
  text,
  remove,
}: {
  interviewId: string;
  label: string;
  /** In the site's language. */
  text: { delete: string; confirm: string; ariaLabel: string };
  remove: (id: string) => Promise<{ ok: boolean }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="danger"
      className="h-10 rounded-full px-4"
      disabled={pending}
      aria-label={text.ariaLabel}
      title={text.ariaLabel}
      onClick={() => {
        if (!window.confirm(text.confirm)) return;
        startTransition(async () => {
          await remove(interviewId);
          router.refresh();
        });
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
      <span className="hidden sm:inline">{text.delete}</span>
    </Button>
  );
}
