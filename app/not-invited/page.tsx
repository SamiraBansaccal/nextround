import { connection } from "next/server";
import { Logo } from "@/components/layout/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { serverEnv } from "@/lib/server/env";

// Where a signed-in account that may not use the app lands (lib/server/auth.ts requireUserId): for now only the
// owner may (ADR 0028). It shows no data. In English, like the other public pages.
export default async function NotInvitedPage() {
  await connection(); // rendered on each request: reads the environment at run time, never at build time
  const contact = serverEnv().ACCESS_CONTACT_EMAIL;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-start justify-center gap-6 px-6">
      <Logo />
      <h1 className="text-3xl">This site is by invitation</h1>
      <p className="text-muted-foreground">
        You are signed in, but this account has not been invited.
        {contact && (
          <>
            {" "}
            To ask for an invitation, write to{" "}
            <a className="underline underline-offset-2" href={`mailto:${contact}?subject=NextRound%20invitation`}>
              {contact}
            </a>
            .
          </>
        )}
      </p>
      <SignOutButton label="Sign out" />
    </main>
  );
}
