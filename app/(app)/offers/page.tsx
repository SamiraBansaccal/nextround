import Link from "next/link";
import { AddOfferForm } from "@/components/offers/add-offer-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { listOffers, listRequirementsForUser, matchScore } from "@/lib/data/offers";
import { addOfferAction } from "./actions";

export const maxDuration = 120; // AI scans with free models can be slow

export default async function OffersPage() {
  const userId = await requireUserId();
  const [offers, reqs, facts] = await Promise.all([listOffers(userId), listRequirementsForUser(userId), listFacts(userId)]);
  const valid = new Set(facts.filter((f) => f.validated).map((f) => f.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Offers</h1>
        <p className="text-muted-foreground">Save the offers you like; each one gets its match, its apply panel and its interview practice.</p>
      </div>
      <AddOfferForm addOffer={addOfferAction} />
      <div className="grid gap-3 sm:grid-cols-2">
        {offers.map((offer) => {
          const m = matchScore(reqs.filter((r) => r.offerId === offer.id), valid);
          return (
            <Link key={offer.id} href={`/offers/${offer.id}`} className="rounded-xl focus-visible:outline-2">
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle className="text-base">{offer.title ?? "Untitled offer"}</CardTitle>
                  <CardDescription>{offer.company ?? "Company not stated"}</CardDescription>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    <Badge variant="outline">{offer.sourceSite}</Badge>
                    <Badge variant="secondary">
                      {m.covered}/{m.total} requirements covered
                    </Badge>
                    <Badge variant="outline">{offer.status}</Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
