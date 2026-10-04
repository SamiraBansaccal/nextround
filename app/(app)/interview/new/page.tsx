import Link from "next/link";
import { InterviewerPicker } from "@/components/interview/interviewer-picker";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/auth";
import { getOffer, listOffers } from "@/lib/data/offers";
import { DEFAULT_INTERVIEWER_ID, INTERVIEWERS, listCategories } from "@/lib/interviewers";
import { startInterviewAction } from "../actions";

export const maxDuration = 300; // the questions are written in the interviewer's style when the interview starts

// Step before an interview: choose who asks the questions. Without an offer, choose the offer first.
export default async function NewInterviewPage({ searchParams }: PageProps<"/interview/new">) {
  const userId = await requireUserId();
  const { offer: offerId } = await searchParams;
  const offer = typeof offerId === "string" ? await getOffer(userId, offerId) : null;

  if (!offer) {
    const offers = await listOffers(userId);
    return (
      <div>
        <PageHeading eyebrow="Interview practice" title="Choose an offer first" />
        <p className="-mt-4 mb-6 text-sm text-muted-foreground">Every interview is built from one offer: its stack, its requirements and your gaps.</p>
        {offers.length === 0 ? (
          <Button asChild>
            <Link href="/offers">Add an offer</Link>
          </Button>
        ) : (
          <ul className="space-y-2">
            {offers.map((o) => (
              <li key={o.id}>
                <Link href={`/interview/new?offer=${o.id}`} className="block rounded-md border bg-card p-4 transition hover:border-primary/40">
                  <span className="font-display text-lg">{o.title ?? "Untitled offer"}</span>
                  {o.company && <span className="text-sm text-muted-foreground"> · {o.company}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <InterviewerPicker
      offer={{ id: offer.id, title: [offer.title, offer.company].filter(Boolean).join(" · ") || "Untitled offer" }}
      categories={listCategories()}
      interviewers={INTERVIEWERS}
      defaultInterviewerId={DEFAULT_INTERVIEWER_ID}
      start={startInterviewAction}
    />
  );
}
