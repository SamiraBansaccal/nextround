import Image from "next/image";
import type { Account } from "@/lib/auth";

// Presentational only: receives data as props, no data fetching here.
export function Welcome({ account }: { account: Pick<Account, "displayName" | "githubLogin" | "isOwner"> }) {
  return (
    <section className="grid items-center gap-6 overflow-hidden rounded-lg border bg-card shadow-soft md:grid-cols-[1fr_220px]">
      <div className="flex flex-col gap-3 p-6">
        <h1 className="text-3xl sm:text-4xl">Welcome, {account.displayName}</h1>
        <p className="text-muted-foreground">
          {account.githubLogin
            ? `Signed in with GitHub as @${account.githubLogin}.`
            : "Signed in. Connect GitHub from your account menu to import your projects."}
        </p>
        {account.isOwner && (
          <p className="w-fit rounded-full border bg-primary-soft px-3 py-1 text-sm">Instance owner: the instance&apos;s AI keys are available to you.</p>
        )}
      </div>
      <Image
        src="/brand/progress-editorial.jpg"
        width={912}
        height={912}
        alt="Illustration of progress towards the next round"
        className="hidden h-full max-h-56 w-full object-cover md:block"
      />
    </section>
  );
}
