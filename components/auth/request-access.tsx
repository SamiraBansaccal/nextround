"use client";

import { Loader2, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Result = { ok: true; message: string } | { ok: false; error: string };

// "Request access": a small form for people who are not invited yet (home and sign-up pages). The owner
// gets the request in Settings, and by email when email sending is set up. English, like the public pages.
export function RequestAccess({ request, startOpen = false }: { request: (input: { email: string; name: string; message: string; website: string }) => Promise<Result>; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [form, setForm] = useState({ email: "", name: "", message: "", website: "" });
  const [result, setResult] = useState<Result | null>(null);
  const [pending, startTransition] = useTransition();
  const set = (field: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [field]: e.target.value }));

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
        No invitation yet? Request access
      </button>
    );
  }

  if (result?.ok) {
    return (
      <p role="status" className="max-w-sm rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm">
        {result.message}
      </p>
    );
  }

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-3 rounded-md border bg-card p-4 shadow-soft"
      aria-labelledby="request-access-title"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => setResult(await request(form)));
      }}
    >
      <p id="request-access-title" className="flex items-center gap-2 font-semibold">
        <Mail className="size-4 text-primary" aria-hidden="true" /> Request access
      </p>
      <p className="text-sm text-muted-foreground">Sign-up is by invitation. Give the email address of the GitHub or Google account you will sign in with.</p>
      <div className="space-y-1.5">
        <Label htmlFor="request-email">Email</Label>
        <Input id="request-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="request-name">Name (optional)</Label>
        <Input id="request-name" autoComplete="name" maxLength={80} value={form.name} onChange={set("name")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="request-message">Message (optional)</Label>
        <textarea id="request-message" rows={3} maxLength={500} value={form.message} onChange={set("message")} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm" />
      </div>
      {/* Hidden from people (and from screen readers); robots fill it in, and their request is ignored. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set("website")} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <Button type="submit" disabled={pending || !form.email.trim()}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Send the request
      </Button>
      {result && !result.ok && (
        <p role="alert" className="text-sm text-destructive">
          {result.error}
        </p>
      )}
    </form>
  );
}
