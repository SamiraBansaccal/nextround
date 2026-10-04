"use client";

import { FolderGit2, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type Result = { ok: true; message: string } | { ok: false; error: string };

// First impression (spec, Phase 3): right after the first sign-in, one click fills the profile from
// GitHub. Shown on the dashboard while the profile is empty; the proposals are reviewed on Profile.
export function GetStarted({ githubLogin, importGithub }: { githubLogin: string | null; importGithub: () => Promise<Result> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="mb-10 border border-primary bg-primary-soft/45 p-6 sm:p-8" aria-labelledby="start-title">
      <p className="text-xs font-bold text-terracotta uppercase">Start here</p>
      <h2 id="start-title" className="mt-1 text-2xl text-earth sm:text-3xl dark:text-foreground">
        Fill your profile in seconds
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {githubLogin
          ? `Import the public projects of @${githubLogin}: one proposed fact per project, linked to its repository. You keep only what is true — everything NextRound writes later comes from these facts.`
          : "Add your CVs (PDF) or answer 5 quick questions: NextRound proposes facts, each with a quote from your own words, and you keep only what is true."}
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {githubLogin && (
          <Button
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await importGithub();
                if (result.ok) router.push("/profile");
                else setError(result.error);
              });
            }}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <FolderGit2 className="size-4" aria-hidden="true" />} Import from GitHub
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/profile">
            <Upload className="size-4" aria-hidden="true" /> {githubLogin ? "Or add your CVs" : "Add your CVs"}
          </Link>
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
