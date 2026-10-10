"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

type Provider = "github" | "google";

export function SignInButtons() {
  const [pending, setPending] = useState<Provider | null>(null);
  const [failed, setFailed] = useState(false);

  async function start(provider: Provider) {
    setPending(provider);
    setFailed(false);
    // Goes to GitHub or Google, then back to the profile: the proxy (proxy.ts) exchanges the one-time verifier
    // Neon sends back for the session cookies. The first sign-in creates the account.
    const { error } = await authClient.signIn.social({ provider, callbackURL: "/profile" }).catch(() => ({ error: true }));
    if (error) {
      setFailed(true);
      setPending(null);
    }
  }

  const busy = pending !== null;

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Button size="lg" disabled={busy} onClick={() => start("github")}>
        <GitHubIcon />
        {pending === "github" ? "Redirecting…" : "Continue with GitHub"}
      </Button>
      <Button size="lg" variant="outline" disabled={busy} onClick={() => start("google")}>
        <GoogleIcon />
        {pending === "google" ? "Redirecting…" : "Continue with Google"}
      </Button>
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          Sign-in could not start. Please try again.
        </p>
      )}
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}
