import { ArrowLeft, Briefcase, Layers, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { InterviewSetup, type SetupContext } from "@/components/interview/interview-setup";
import { TechLogo } from "@/components/interview/tech-logo";
import { Button } from "@/components/ui/button";
import { getAccount } from "@/lib/server/auth";
import { getUiCopy } from "@/lib/i18n/server";
import { fill } from "@/lib/interview/copy";
import { getOffer, listOffers } from "@/lib/data/offers";
import { INTERVIEW_COPY } from "@/lib/interview/copy";
import { interviewTitle } from "@/lib/interview/practice";
import { techLogo } from "@/lib/interview/tech-logos";
import { findTrack, parseTopic, techsOfTrack, TRACKS } from "@/lib/interview/tracks";
import { DEFAULT_INTERVIEWER_ID, INTERVIEWERS, listCategories } from "@/lib/interviewers";
import { startInterviewAction } from "../actions";

// New interview, step by step:
//   1. what to practise: a job offer, a technology, or HR questions;
//   2. which offer, or which track then technology (or the whole track);
//   3. the interviewer, the interview's language (and, for an offer, which questions);
//   4. the camera and microphone check, then the call.
// Steps 1–2 are links (?kind=, ?offer=, ?track=, ?topic=); steps 3–4 are the setup screen. A link from an
// offer (?offer=<id>) opens step 3 directly. These links are not prefetched: in production, prefetching this
// same page with other search params left requests open that never ended (seen with E2E_PROD=1); a click
// renders the next step in well under a second anyway.

const lang = "en"; // the interview's default language; the setup screen lets the candidate change it
// Steps 1–2 are in the site's language (ui); steps 3–4 in the interview's language.

export default async function NewInterviewPage({ searchParams }: PageProps<"/interview/new">) {
  const account = await getAccount();
  const userId = account.userId;
  const params = await searchParams;
  const { lang: ui, t } = await getUiCopy();
  const get = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : null);
  const kind = get("kind");

  const setup = (context: SetupContext) => (
    <InterviewSetup
      context={context}
      me={{ name: account.fullName, imageUrl: account.imageUrl }}
      categories={listCategories()}
      interviewers={INTERVIEWERS}
      defaultInterviewerId={DEFAULT_INTERVIEWER_ID}
      defaultLanguage={lang}
      copies={INTERVIEW_COPY}
      start={startInterviewAction}
    />
  );

  // ---------- Step 3: an offer, a topic or HR is chosen ----------
  const offerId = get("offer");
  if (offerId) {
    const offer = await getOffer(userId, offerId);
    if (offer) return setup({ kind: "offer", offerId: offer.id, topic: null, title: interviewTitle({ kind: "offer", topic: null, offerTitle: offer.title, company: offer.company }, lang) });
  }
  if (kind === "hr") return setup({ kind: "hr", offerId: null, topic: null, title: interviewTitle({ kind: "hr", topic: null, offerTitle: null }, lang) });
  const topic = parseTopic(get("topic"));
  if (kind === "technology" && topic) return setup({ kind: "technology", offerId: null, topic: get("topic"), title: interviewTitle({ kind: "technology", topic, offerTitle: null }, lang) });

  // ---------- Step 2: which offer ----------
  if (kind === "offer") {
    const offers = await listOffers(userId);
    return (
      <Step title={t.whichOffer} back="/interview/new" backLabel={t.back}>
        {offers.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-8 text-center">
            <p className="font-display text-xl">{t.noOffer}</p>
            <p className="mt-1 text-muted-foreground">{t.noOfferHint}</p>
            <Button asChild variant="action" size="xl" className="mt-5">
              <Link prefetch={false} href="/offers">{t.addOffer}</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-3xl bg-card shadow-soft">
            {offers.map((o) => (
              <li key={o.id}>
                <Link prefetch={false} href={`/interview/new?offer=${o.id}`} className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-ink-soft">
                  <span className="min-w-0">
                    <span className="block font-display text-xl">{o.title ?? t.untitledOffer}</span>
                    {o.company && <span className="text-sm text-muted-foreground">{o.company}</span>}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-ink">{t.choose}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Step>
    );
  }

  // ---------- Step 2: which technology ----------
  if (kind === "technology") {
    const track = findTrack(get("track"));
    if (track) {
      return (
        <Step title={track.label[ui]} intro={track.description[ui]} back="/interview/new?kind=technology" backLabel={t.back}>
          <Link prefetch={false}
            href={`/interview/new?kind=technology&topic=track:${track.id}`}
            className="mb-6 flex items-center gap-4 rounded-3xl bg-earth p-6 text-earth-foreground transition hover:brightness-110"
          >
            <span className="grid size-12 place-items-center rounded-full bg-action text-action-foreground">
              <Layers className="size-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-2xl">{t.wholeTrack}</span>
              <span className="text-earth-foreground/80">{fill(t.wholeTrackHint, { track: track.label[ui] })}</span>
            </span>
          </Link>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {techsOfTrack(track).map((tech) => (
              <li key={tech.id}>
                <Link prefetch={false}
                  href={`/interview/new?kind=technology&topic=tech:${tech.id}`}
                  className="flex h-full flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-card p-5 text-center transition-colors hover:border-ink/40"
                >
                  <TechLogo logo={techLogo(tech.id)} className="size-14" />
                  <span className="font-semibold">{tech.label[ui]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Step>
      );
    }
    return (
      <Step title={t.whichTrack} intro={t.whichTrackIntro} back="/interview/new" backLabel={t.back}>
        <ul className="grid gap-4 sm:grid-cols-2">
          {TRACKS.map((track) => (
            <li key={track.id}>
              <Link prefetch={false} href={`/interview/new?kind=technology&track=${track.id}`} className="block h-full rounded-3xl bg-card p-6 shadow-soft transition hover:-translate-y-0.5">
                <span className="flex -space-x-2">
                  {track.techs.slice(0, 5).map((id) => (
                    <TechLogo key={id} logo={techLogo(id)} className="size-11 ring-2 ring-card" />
                  ))}
                </span>
                <span className="mt-4 block font-display text-2xl">{track.label[ui]}</span>
                <span className="mt-1 block text-muted-foreground">{track.description[ui]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Step>
    );
  }

  // ---------- Step 1: what to practise ----------
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-4xl leading-tight sm:text-5xl">{t.whatToPractise}</h1>
        <p className="mt-3 text-muted-foreground">{t.whatToPractiseIntro}</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-3">
        <Link prefetch={false} href="/interview/new?kind=offer" className="group flex min-h-64 flex-col justify-between rounded-[2rem] bg-earth p-7 text-earth-foreground transition hover:brightness-110">
          <Briefcase className="size-9 text-action" aria-hidden="true" />
          <span>
            <span className="block font-display text-3xl">{t.kindOffer}</span>
            <span className="mt-2 block text-earth-foreground/80">{t.kindOfferHint}</span>
          </span>
        </Link>
        <Link prefetch={false} href="/interview/new?kind=technology" className="flex min-h-64 flex-col justify-between rounded-[2rem] bg-action p-7 text-action-foreground transition hover:brightness-105">
          <span className="flex -space-x-2">
            {["docker", "react", "cpp", "python", "kubernetes"].map((id) => (
              <TechLogo key={id} logo={techLogo(id)} className="size-11 ring-2 ring-action" />
            ))}
          </span>
          <span>
            <span className="block font-display text-3xl">{t.kindTechnology}</span>
            <span className="mt-2 block opacity-80">{t.kindTechnologyHint}</span>
          </span>
        </Link>
        <Link prefetch={false} href="/interview/new?kind=hr" className="flex min-h-64 flex-col justify-between rounded-[2rem] border-2 border-ink bg-ink-soft p-7 text-ink transition hover:bg-ink hover:text-white">
          <MessagesSquare className="size-9" aria-hidden="true" />
          <span>
            <span className="block font-display text-3xl">{t.kindHr}</span>
            <span className="mt-2 block opacity-80">{t.kindHrHint}</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

function Step({ title, intro, back, backLabel, children }: { title: string; intro?: string; back: string; backLabel: string; children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <Link prefetch={false} href={back} className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" /> {backLabel}
        </Link>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{title}</h1>
        {intro && <p className="mt-3 text-muted-foreground">{intro}</p>}
      </header>
      {children}
    </div>
  );
}
