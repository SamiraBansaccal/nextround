import { fill, type InterviewCopy } from "@/lib/interview/copy";
import { KIND_LABEL, KIND_NOTICE, LEVEL_OF, TRAIT_LABELS } from "@/lib/interviewers/labels";
import type { Interviewer, Lang } from "@/lib/interviewers/types";
import { cn } from "@/lib/utils";
import { InterviewerPicture } from "./interviewer-avatar";

// The chosen interviewer, large: picture, style in one readable sentence, description and the ten
// traits as wide bars. Display only.

const BAR_COLOURS = ["bg-ink", "bg-action", "bg-terracotta", "bg-success", "bg-warning"];

export function InterviewerProfile({ interviewer, language, t }: { interviewer: Interviewer; language: Lang; t: InterviewCopy }) {
  const copy = interviewer.copy[language];
  const notice = KIND_NOTICE[interviewer.kind];
  return (
    <article className="overflow-hidden rounded-3xl bg-card shadow-soft">
      <div className="relative aspect-video bg-earth text-earth-foreground">
        <InterviewerPicture interviewer={{ id: interviewer.id, name: copy.name, image: interviewer.image }} sizes="(min-width: 1024px) 40vw, 100vw" />
        <span className="absolute top-3 left-3 rounded-full bg-earth/80 px-3 py-1 text-xs font-semibold text-earth-foreground backdrop-blur">{KIND_LABEL[interviewer.kind][language]}</span>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        <header>
          <h2 className="font-display text-3xl leading-tight">{copy.name}</h2>
          {copy.role && <p className="text-sm text-muted-foreground">{copy.role}</p>}
        </header>
        <p className="text-lg leading-snug font-semibold text-terracotta">{copy.style}</p>
        <p className="leading-relaxed text-muted-foreground">{copy.description}</p>
        <section aria-label={t.styleLabel}>
          <h3 className="mb-3 font-sans text-sm font-bold">{t.styleLabel}</h3>
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {TRAIT_LABELS.map(({ key, label }, index) => {
              const level = interviewer.traits[key];
              return (
                <li key={key}>
                  <span className="flex items-baseline justify-between text-sm">
                    <span>{label[language]}</span>
                    <span className="text-xs text-muted-foreground">{fill(LEVEL_OF[language], { level })}</span>
                  </span>
                  <span className="mt-1.5 flex gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={cn("h-2.5 flex-1 rounded-full", n <= level ? BAR_COLOURS[index % BAR_COLOURS.length] : "bg-muted")} />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        {notice && <p className="text-sm text-muted-foreground">{notice[language]}</p>}
      </div>
    </article>
  );
}
