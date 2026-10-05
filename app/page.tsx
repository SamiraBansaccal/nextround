import { auth } from "@clerk/nextjs/server";
import { Check, KeyRound, Link2, MessagesSquare, Quote, X } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { RequestAccess } from "@/components/auth/request-access";
import { SignInButtons } from "@/components/auth/sign-in-buttons";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { requestAccessAction } from "./actions";

// Landing page (design from the Lovable prototype): the only page visible without signing in.
const VALUE_PROPS = [
  { Icon: MessagesSquare, title: "Interview practice on the company's stack", body: "HR, technical and gap questions drawn from the offer itself." },
  { Icon: Link2, title: "Every claim traced to your profile", body: "Each sentence links to a fact you validated. Nothing invented." },
  { Icon: KeyRound, title: "Bring your own AI", body: "OpenRouter, OpenAI, Mistral, Groq… free models welcome." },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/profile");

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-16 sm:px-6 sm:pb-20 md:grid-cols-[1.1fr_1fr] md:gap-12 md:pt-20">
        <div className="flex flex-col gap-10">
          <h1 className="text-4xl leading-[1.08] sm:text-5xl md:text-6xl">
            Your coach to reach the next interview round — <em className="text-primary">without inventing anything.</em>
          </h1>
          <div className="flex flex-col gap-4">
            <SignInButtons />
            <RequestAccess request={requestAccessAction} />
          </div>
        </div>
        <div className="overflow-hidden rounded-md border bg-card shadow-soft">
          <Image
            src="/brand/interview-editorial.jpg"
            width={1104}
            height={864}
            alt="Illustration of interview practice at a desk"
            priority
            className="h-36 w-full object-cover object-[center_40%] sm:h-44"
          />
          <div className="p-6">
            <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Example of an improved answer</p>
            <p className="leading-relaxed">
              I built a React app that fetches live data from a REST API.{" "}
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-soft px-2 py-0.5 align-middle text-xs font-medium">
                <Check className="size-3 text-success" aria-hidden="true" /> GitHub project
              </span>
            </p>
            <p className="mt-3 leading-relaxed">
              <span className="unsupported-underline">I used Kubernetes in production.</span>{" "}
              <span className="inline-flex items-center gap-1 rounded-full bg-gap-soft px-2 py-0.5 align-middle text-xs font-medium text-gap">
                <X className="size-3" aria-hidden="true" /> Not in your profile
              </span>
            </p>
            <p className="mt-5 flex items-center gap-2 border-t pt-4 text-sm text-muted-foreground">
              Requirement: Docker
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-1.5 py-0.5 text-xs text-accent-foreground">
                <Quote className="size-3" aria-hidden="true" /> quoted from the offer
              </span>
            </p>
          </div>
        </div>
      </main>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 sm:pb-24 md:grid-cols-3">
        {VALUE_PROPS.map(({ Icon, title, body }) => (
          <div key={title} className="border-t pt-6">
            <Icon className="mb-3 size-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
