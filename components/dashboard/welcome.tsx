import type { Account } from "@/lib/auth";

// Presentational only: receives data as props, no data fetching here.
export function Welcome({ account }: { account: Pick<Account, "displayName" | "githubLogin" | "isOwner"> }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Welcome, {account.displayName}</h1>
      <p className="text-muted-foreground">
        {account.githubLogin
          ? `Signed in with GitHub as @${account.githubLogin}.`
          : "Signed in. Connect GitHub from your account menu to import your projects."}
      </p>
      {account.isOwner && (
        <p className="w-fit rounded-full border px-3 py-1 text-sm">Instance owner: the instance&apos;s AI keys are available to you.</p>
      )}
    </section>
  );
}
