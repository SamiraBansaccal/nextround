import Image from "next/image";
import { initials, placeholderTone } from "@/lib/interviewers/avatar";
import { cn } from "@/lib/utils";

// An interviewer's picture, or a clean placeholder (monogram on an app colour, stable per id) until the
// final picture exists at public/interviewers/<id>.webp. Display only.

const TONES = [
  "bg-primary-soft text-primary",
  "bg-terracotta-soft text-terracotta",
  "bg-warning-soft text-warning",
  "bg-success-soft text-success",
  "bg-secondary text-secondary-foreground",
  "bg-earth text-earth-foreground",
];

export interface AvatarSubject {
  id: string;
  name: string;
  image: string | null;
}

/** Square avatar (lists, cards). */
export function InterviewerAvatar({ interviewer, className }: { interviewer: AvatarSubject; className?: string }) {
  return (
    <span className={cn("relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full font-display text-lg", !interviewer.image && TONES[placeholderTone(interviewer.id, TONES.length)], className)}>
      {interviewer.image ? <Image src={interviewer.image} alt="" fill sizes="96px" className="object-cover" /> : <span aria-hidden="true">{initials(interviewer.name)}</span>}
    </span>
  );
}

/** 16:9 "webcam" picture (call stage, picker preview). */
export function InterviewerPicture({ interviewer, priority = false, sizes = "(min-width: 1024px) 60vw, 100vw" }: { interviewer: AvatarSubject; priority?: boolean; sizes?: string }) {
  if (interviewer.image) {
    return <Image src={interviewer.image} alt={`${interviewer.name}, on camera`} fill priority={priority} sizes={sizes} className="object-cover" />;
  }
  return (
    <div className={cn("absolute inset-0 grid place-items-center", TONES[placeholderTone(interviewer.id, TONES.length)])} role="img" aria-label={`${interviewer.name} (picture coming soon)`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgb(0_0_0/0.18)_100%)]" aria-hidden="true" />
      <span className="relative grid size-28 place-items-center rounded-full border-4 border-current/25 bg-background/30 font-display text-5xl sm:size-36 sm:text-6xl" aria-hidden="true">
        {initials(interviewer.name)}
      </span>
    </div>
  );
}
