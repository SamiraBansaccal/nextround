import { Briefcase } from "lucide-react";
import Image from "next/image";
import { AddOfferForm } from "@/components/offers/add-offer-form";
import { Opportunities } from "@/components/dashboard/opportunities";
import { PageHeading } from "@/components/layout/page-heading";
import { requireUserId } from "@/lib/server/auth";
import { listFacts } from "@/lib/data/facts";
import { DASHBOARD_COPY } from "@/lib/i18n/dashboard";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import { getUiLang } from "@/lib/i18n/server";
import { countInterviewsByOffer } from "@/lib/data/interviews";
import { listOffers, listRequirementsForUser } from "@/lib/data/offers";
import { factIndex } from "@/lib/offers/coverage";
import { buildPipelineCards } from "@/lib/offers/pipeline";
import { addOfferAction, setOfferStatusAction } from "./actions";

export const maxDuration = 120; // AI scans with free models can be slow

export default async function OffersPage() {
  const userId = await requireUserId();
  const lang = await getUiLang();
  const t = OFFERS_COPY[lang];
  const [offers, reqs, facts, interviewCounts] = await Promise.all([
    listOffers(userId),
    listRequirementsForUser(userId),
    listFacts(userId),
    countInterviewsByOffer(userId),
  ]);
  const cards = buildPipelineCards(offers, reqs, factIndex(facts), interviewCounts);

  return (
    <div className="space-y-10">
      <PageHeading eyebrow={t.savedOpportunities} title={t.yourOffers}>
        <Image
          src="/brand/progress-editorial.jpg"
          width={912}
          height={912}
          alt={t.offersIllustration}
          className="size-16 rounded-md object-cover sm:size-20"
        />
      </PageHeading>
      <AddOfferForm addOffer={addOfferAction} t={t} />
      {cards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border border-dashed border-earth/30 p-10 text-center">
          <Briefcase className="size-6 text-primary" aria-hidden="true" />
          <p className="font-display text-xl">{t.noOffers}</p>
          <p className="text-sm text-muted-foreground">{t.noOffersHint}</p>
        </div>
      ) : (
        <Opportunities cards={cards} move={setOfferStatusAction} lang={lang} t={DASHBOARD_COPY[lang]} heading={false} grid="sm:grid-cols-2 xl:grid-cols-3" />
      )}
    </div>
  );
}
