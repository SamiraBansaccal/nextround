import { Briefcase } from "lucide-react";
import Image from "next/image";
import { AddOfferForm } from "@/components/offers/add-offer-form";
import { OfferCard } from "@/components/offers/offer-card";
import { PageHeading } from "@/components/page-heading";
import { requireUserId } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { countInterviewsByOffer } from "@/lib/data/interviews";
import { listOffers, listRequirementsForUser } from "@/lib/data/offers";
import { buildPipelineCards } from "@/lib/pipeline";
import { addOfferAction } from "./actions";

export const maxDuration = 120; // AI scans with free models can be slow

export default async function OffersPage() {
  const userId = await requireUserId();
  const [offers, reqs, facts, interviewCounts] = await Promise.all([
    listOffers(userId),
    listRequirementsForUser(userId),
    listFacts(userId),
    countInterviewsByOffer(userId),
  ]);
  const cards = buildPipelineCards(offers, reqs, new Set(facts.filter((f) => f.validated).map((f) => f.id)), interviewCounts);

  return (
    <div className="space-y-10">
      <PageHeading eyebrow="Saved opportunities" title="Your offers">
        <Image
          src="/brand/progress-editorial.jpg"
          width={912}
          height={912}
          alt="Illustration of applications being reviewed"
          className="size-16 rounded-md object-cover sm:size-20"
        />
      </PageHeading>
      <AddOfferForm addOffer={addOfferAction} />
      {cards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border border-dashed border-earth/30 p-10 text-center">
          <Briefcase className="size-6 text-primary" aria-hidden="true" />
          <p className="font-display text-xl">No offers yet</p>
          <p className="text-sm text-muted-foreground">Paste the link of an offer you like above: NextRound reads it and checks every quote.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <OfferCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
