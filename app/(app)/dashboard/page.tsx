import { UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AiStatusCard } from "@/components/ai/ai-status-card";
import { Opportunities } from "@/components/dashboard/opportunities";
import { AddOfferForm } from "@/components/offers/add-offer-form";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { getAiStatus } from "@/lib/ai/config";
import { getAccount } from "@/lib/auth";
import { dashboardGreeting } from "@/lib/dashboard";
import { listFacts } from "@/lib/data/facts";
import { countInterviewsByOffer } from "@/lib/data/interviews";
import { listOffers, listRequirementsForUser } from "@/lib/data/offers";
import { buildPipelineCards } from "@/lib/pipeline";
import { addOfferAction, setOfferStatusAction } from "../offers/actions";

export const maxDuration = 120; // adding an offer from here runs the AI scan

export default async function DashboardPage() {
  const account = await getAccount();
  const [status, facts, offers, reqs, interviewCounts] = await Promise.all([
    getAiStatus(account.userId, account.isOwner),
    listFacts(account.userId),
    listOffers(account.userId),
    listRequirementsForUser(account.userId),
    countInterviewsByOffer(account.userId),
  ]);
  const validated = facts.filter((f) => f.validated);
  const cards = buildPipelineCards(offers, reqs, new Set(validated.map((f) => f.id)), interviewCounts);
  const inProgress = cards.filter((c) => c.status !== "offer" && c.status !== "rejected").length;
  const greeting = dashboardGreeting(account.displayName);

  return (
    <div>
      <PageHeading
        eyebrow={greeting.eyebrow}
        title={
          <>
            {greeting.title}
            <span className="text-primary">.</span>
          </>
        }
      />
      <div className="mb-8 grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 border-y border-border py-5 sm:mb-10 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:gap-7">
        <Image
          src="/brand/progress-editorial.jpg"
          width={912}
          height={912}
          alt="Illustration of job applications being reviewed"
          className="size-[72px] shrink-0 rounded-md object-cover sm:size-28"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl leading-snug md:text-3xl">Your next round is taking shape.</p>
          <p className="mt-2 text-sm text-muted-foreground">Keep the momentum going, one thoughtful step at a time.</p>
        </div>
        <div className="col-span-2 flex items-center gap-3 border-t border-border pt-4 sm:col-span-1 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <span className="font-display text-4xl text-primary sm:text-5xl">{inProgress}</span>
          <span className="max-w-24 text-xs leading-snug text-muted-foreground">opportunities in progress</span>
        </div>
      </div>

      <AddOfferForm addOffer={addOfferAction} variant="bar" />

      <div className="mt-12">
        <Opportunities cards={cards} move={setOfferStatusAction} />
      </div>

      <div className="mt-12 grid items-start gap-4 md:grid-cols-2">
        <section className="flex flex-col justify-between gap-4 border border-earth/20 bg-card p-6 shadow-soft">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">
              <UserRound className="size-4" aria-hidden="true" /> Your fact base
            </p>
            <p className="mt-2 font-display text-2xl">
              {validated.length} validated fact{validated.length === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {facts.length === validated.length
                ? "Every CV, letter and practice answer is written only from these."
                : `${facts.length - validated.length} proposed fact${facts.length - validated.length === 1 ? "" : "s"} waiting for your review.`}
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link href="/profile">{facts.length === 0 ? "Import your CVs and GitHub" : "Open my profile"}</Link>
          </Button>
        </section>
        <AiStatusCard status={status} />
      </div>
    </div>
  );
}
