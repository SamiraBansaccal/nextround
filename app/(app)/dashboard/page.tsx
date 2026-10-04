import { UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AiStatusCard } from "@/components/settings/ai-status-card";
import { GetStarted } from "@/components/dashboard/get-started";
import { Opportunities } from "@/components/dashboard/opportunities";
import { AddOfferForm } from "@/components/offers/add-offer-form";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { getAiStatus } from "@/lib/ai/config";
import { getAccount } from "@/lib/server/auth";
import { dashboardGreeting } from "@/lib/dashboard/greeting";
import { listFacts } from "@/lib/data/facts";
import { DASHBOARD_COPY } from "@/lib/i18n/dashboard";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import { getUiLang } from "@/lib/i18n/server";
import { fill } from "@/lib/interview/copy";
import { countInterviewsByOffer } from "@/lib/data/interviews";
import { listOffers, listRequirementsForUser } from "@/lib/data/offers";
import { factIndex } from "@/lib/offers/coverage";
import { buildPipelineCards } from "@/lib/offers/pipeline";
import { addOfferAction, setOfferStatusAction } from "../offers/actions";
import { importGithubAction } from "../profile/actions";

export const maxDuration = 120; // adding an offer from here runs the AI scan

export default async function DashboardPage() {
  const account = await getAccount();
  const lang = await getUiLang();
  const t = DASHBOARD_COPY[lang];
  const [status, facts, offers, reqs, interviewCounts] = await Promise.all([
    getAiStatus(account.userId, account.isOwner),
    listFacts(account.userId),
    listOffers(account.userId),
    listRequirementsForUser(account.userId),
    countInterviewsByOffer(account.userId),
  ]);
  const validated = facts.filter((f) => f.validated);
  const cards = buildPipelineCards(offers, reqs, factIndex(facts), interviewCounts);
  const inProgress = cards.filter((c) => c.status !== "offer" && c.status !== "rejected").length;
  const greeting = dashboardGreeting(account.displayName, new Date(), lang);

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
      {facts.length === 0 && <GetStarted githubLogin={account.githubLogin} importGithub={importGithubAction} t={t} />}
      <div className="mb-8 grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 border-y border-border py-5 sm:mb-10 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:gap-7">
        <Image
          src="/brand/progress-editorial.jpg"
          width={912}
          height={912}
          alt={t.illustration}
          className="size-[72px] shrink-0 rounded-md object-cover sm:size-28"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl leading-snug md:text-3xl">{t.momentumTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t.momentumBody}</p>
        </div>
        <div className="col-span-2 flex items-center gap-3 border-t border-border pt-4 sm:col-span-1 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <span className="font-display text-4xl text-primary sm:text-5xl">{inProgress}</span>
          <span className="max-w-24 text-xs leading-snug text-muted-foreground">{t.inProgress}</span>
        </div>
      </div>

      <AddOfferForm addOffer={addOfferAction} t={OFFERS_COPY[lang]} variant="bar" />

      <div className="mt-12">
        <Opportunities cards={cards} move={setOfferStatusAction} lang={lang} t={t} />
      </div>

      <div className="mt-12 grid items-start gap-4 md:grid-cols-2">
        <section className="flex flex-col justify-between gap-4 border border-earth/20 bg-card p-6 shadow-soft">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold text-terracotta uppercase">
              <UserRound className="size-4" aria-hidden="true" /> {t.factBase}
            </p>
            <p className="mt-2 font-display text-2xl">
              {fill(validated.length === 1 ? t.validatedOne : t.validatedMany, { count: validated.length })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {facts.length === validated.length
                ? t.allFromThese
                : fill(facts.length - validated.length === 1 ? t.waitingOne : t.waitingMany, { count: facts.length - validated.length })}
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link href="/profile">{facts.length === 0 ? t.importProfile : t.openProfile}</Link>
          </Button>
        </section>
        <AiStatusCard status={status} lang={lang} />
      </div>
    </div>
  );
}
