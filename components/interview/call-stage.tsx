import { Mic, MicOff, Video } from "lucide-react";
import { type AvatarSubject, InterviewerPicture } from "./interviewer-avatar";

// The video tile of the call: the interviewer "on camera". Nothing here is a button: status pills and
// icons only show state (they have no hover and no click). The question is NOT drawn on the picture:
// it lives in the question panel, always readable.

interface Props {
  interviewer: AvatarSubject & { role: string | null };
  me: { name: string; imageUrl: string | null };
  timer: string;
  speaking: boolean;
  listening: boolean;
}

export function CallStage({ interviewer, me, timer, speaking, listening }: Props) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-earth text-earth-foreground shadow-[0_24px_70px_-28px_color-mix(in_oklab,var(--earth)_70%,transparent)]">
      <InterviewerPicture interviewer={interviewer} priority />

      {/* Status, top left */}
      <p className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-earth/75 px-3 py-1.5 text-xs font-semibold backdrop-blur-md sm:top-4 sm:left-4 sm:text-sm">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-terracotta opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-terracotta" />
        </span>
        Interview in progress
        <span className="font-normal text-earth-foreground/75 tabular-nums">{timer}</span>
      </p>

      {/* Interviewer's camera and microphone: state, not controls */}
      <p
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-earth/75 px-2.5 py-1.5 text-earth-foreground/85 backdrop-blur-md sm:top-4 sm:right-4"
        role="img"
        aria-label={`${interviewer.name}'s camera and microphone are on`}
      >
        <Video className="size-3.5" aria-hidden="true" />
        <Mic className="size-3.5" aria-hidden="true" />
      </p>

      {/* Name tag, bottom left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-earth/80 px-3 py-1.5 text-sm backdrop-blur-md sm:bottom-4 sm:left-4">
        {speaking ? (
          <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="w-1 animate-pulse rounded-full bg-terracotta" style={{ height: `${6 + ((i * 5) % 8)}px`, animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
        ) : null}
        <span className="font-semibold">{interviewer.name}</span>
        {interviewer.role && <span className="hidden text-earth-foreground/70 sm:inline">· {interviewer.role}</span>}
        {speaking && <span className="sr-only">is speaking</span>}
      </div>

      {/* Self view, bottom right */}
      <div
        className="absolute right-3 bottom-3 w-24 overflow-hidden rounded-md border-2 border-earth-foreground/25 bg-primary-soft shadow-xl sm:right-4 sm:bottom-4 sm:w-36"
        role="img"
        aria-label={listening ? "You: recording your answer" : "You: camera off"}
      >
        <div className="grid aspect-video place-items-center" aria-hidden="true">
          {me.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote avatar from Clerk
            <img src={me.imageUrl} alt="" className="size-7 rounded-full object-cover sm:size-10" />
          ) : (
            <span className="grid size-7 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground sm:size-10 sm:text-xs">{me.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <span className="absolute bottom-1 left-1.5 flex items-center gap-1 text-[10px] font-bold text-earth" aria-hidden="true">
          {listening ? <Mic className="size-3 text-terracotta" /> : <MicOff className="size-3 opacity-60" />} You
        </span>
      </div>
    </div>
  );
}
