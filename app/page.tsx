import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButtons } from "@/components/sign-in-buttons";
import { ThemeToggle } from "@/components/theme-toggle";

// Landing page: the only page visible without signing in.
export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex justify-end p-4">
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 pb-24 text-center">
        <div className="flex max-w-2xl flex-col gap-4">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">NextRound</h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Your coach to reach the next interview round — without inventing anything.
          </p>
        </div>
        <SignInButtons />
      </main>
    </div>
  );
}
