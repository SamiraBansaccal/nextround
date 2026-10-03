import Link from "next/link";
import { AiStatusCard } from "@/components/ai/ai-status-card";
import { Pipeline } from "@/components/dashboard/pipeline";
import { Welcome } from "@/components/dashboard/welcome";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAiStatus } from "@/lib/ai/config";
import { getAccount } from "@/lib/auth";
import { listFacts } from "@/lib/data/facts";
import { countInterviewsByOffer } from "@/lib/data/interviews";
import { listOffers, listRequirementsForUser } from "@/lib/data/offers";
import { buildPipelineCards } from "@/lib/pipeline";
import { setOfferStatusAction } from "../offers/actions";

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
  const validIds = new Set(validated.map((f) => f.id));
  const cards = buildPipelineCards(offers, reqs, validIds, interviewCounts);

  return (
    <div className="flex flex-col gap-8">
      <Welcome account={account} />
      <section className="flex flex-col gap-3" aria-labelledby="pipeline-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="pipeline-title" className="text-2xl">
            Your applications
          </h2>
          <Button asChild size="sm">
            <Link href="/offers">Add an offer</Link>
          </Button>
        </div>
        <Pipeline cards={cards} move={setOfferStatusAction} />
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>
              {facts.length === 0
                ? "Start here: import your GitHub projects in one click, then validate what is true."
                : `${validated.length} validated fact${validated.length === 1 ? "" : "s"}, ${facts.length - validated.length} to review.`}
            </CardDescription>
            <Button asChild className="mt-2 w-fit">
              <Link href="/profile">{facts.length === 0 ? "Import from GitHub" : "Open my profile"}</Link>
            </Button>
          </CardHeader>
        </Card>
        <AiStatusCard status={status} />
      </div>
    </div>
  );
}
