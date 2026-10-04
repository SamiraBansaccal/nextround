import { MessagesSquare, PhoneCall } from "lucide-react";
import Link from "next/link";
import { DeleteInterviewButton } from "@/components/interview/delete-interview-button";
import { InterviewerAvatar } from "@/components/interview/interviewer-avatar";
import { TechLogo } from "@/components/interview/tech-logo";
import { Button } from "@/components/ui/button";
import { requireUserId } from "@/lib/server/auth";
import { getUiCopy } from "@/lib/i18n/server";
import { fill } from "@/lib/interview/copy";
import { listInterviewsWithProgress } from "@/lib/data/interviews";
import { formatDay } from "@/lib/shared/dates";
import { interviewTitle } from "@/lib/interview/practice";
import { techLogo } from "@/lib/interview/tech-logos";
import { parseTopic, topicTechs } from "@/lib/interview/tracks";
import { getInterviewer } from "@/lib/interviewers";
import { deleteInterviewAction } from "./actions";

// All practice sessions, newest first, with the way to start a new one in the middle of the page.
export default async function InterviewsPage() {
  const userId = await requireUserId();
  const [items, { lang, t }] = await Promise.all([listInterviewsWithProgress(userId), getUiCopy()]);

  return (
    <div className="space-y-10">
      <section className="flex flex-col items-center rounded-[2rem] bg-earth px-6 py-10 text-center text-earth-foreground sm:py-14">
        <h1 className="max-w-2xl text-4xl leading-tight sm:text-5xl">{t.practiceTitle}</h1>
        <p className="mt-3 max-w-xl text-earth-foreground/80">{t.practiceIntro}</p>
        <Button asChild variant="action" size="xl" className="mt-7 h-16 px-10 text-lg">
          <Link href="/interview/new">
            <PhoneCall aria-hidden="true" /> {t.newInterview}
          </Link>
        </Button>
      </section>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
          <MessagesSquare className="size-6 text-ink" aria-hidden="true" />
          <p>{t.noPractice}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((iv) => {
            const percent = iv.total ? Math.round((iv.answered / iv.total) * 100) : 0;
            const interviewer = getInterviewer(iv.interviewerId);
            const topic = parseTopic(iv.topic);
            const title = interviewTitle({ kind: iv.kind, topic, offerTitle: iv.offerTitle, company: iv.company }, lang);
            const status = iv.answered === 0 ? t.statusReady : iv.answered === iv.total ? t.statusDone : t.statusInProgress;
            return (
              <li key={iv.id} className="flex flex-wrap items-center gap-4 rounded-3xl bg-card p-4 shadow-soft sm:flex-nowrap sm:p-5">
                <Link href={`/interview/${iv.id}`} className="flex min-w-0 flex-1 items-center gap-5">
                  <span className="relative shrink-0">
                    <InterviewerAvatar interviewer={interviewer} className="size-16 text-xl" />
                    {topic && <TechLogo logo={techLogo(topicTechs(topic)[0].id)} className="absolute -right-2 -bottom-2 size-8 ring-2 ring-card" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-xl">{title}</span>
                    <span className="block text-sm text-muted-foreground">
                      {fill(t.withOn, { name: interviewer.copy[lang].name, date: formatDay(iv.createdAt) })}
                    </span>
                    <span className="mt-2 flex items-center gap-3">
                      <span className="h-2 w-40 rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={t.questionsAnswered}>
                        <span className={iv.answered === iv.total ? "block h-2 rounded-full bg-success" : "block h-2 rounded-full bg-action"} style={{ width: `${percent}%` }} />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {fill(t.answeredOf, { status, answered: iv.answered, total: iv.total })}
                      </span>
                    </span>
                  </span>
                </Link>
                {iv.answered < iv.total && <DeleteInterviewButton interviewId={iv.id} label={title} text={{ delete: t.delete, confirm: fill(t.deleteConfirm, { label: title }), ariaLabel: fill(t.deleteLabel, { label: title }) }} remove={deleteInterviewAction} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
