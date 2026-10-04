import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fill } from "@/lib/interview/copy";
import { cn } from "@/lib/utils";
import { type AvatarSubject, InterviewerPicture } from "./interviewer-avatar";
import { SelfPreview } from "./media/self-preview";

// The video tile of the call: the interviewer "on camera", and the candidate's own picture (their real
// camera when it is on). The question is NOT drawn on the picture: it lives in the question panel.
// Status pills only show state; the controls below the video (CallControls) really act.

interface StageCopy {
  inProgress: string;
  interviewerDevices: string;
  youCameraOff: string;
  youRecording: string;
  you: string;
}

interface Props {
  interviewer: AvatarSubject & { role: string | null };
  me: { name: string; imageUrl: string | null };
  self: { attach: (video: HTMLVideoElement | null) => void; live: boolean; microphone: boolean };
  timer: string;
  speaking: boolean;
  listening: boolean;
  copy: StageCopy;
}

export function CallStage({ interviewer, me, self, timer, speaking, listening, copy }: Props) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-earth text-earth-foreground shadow-[0_24px_70px_-28px_color-mix(in_oklab,var(--earth)_70%,transparent)]">
      <InterviewerPicture interviewer={interviewer} priority />

      <p className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-earth/75 px-3 py-1.5 text-xs font-semibold backdrop-blur-md sm:top-4 sm:left-4 sm:text-sm">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-terracotta opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-terracotta" />
        </span>
        {copy.inProgress}
        <span className="font-normal text-earth-foreground/75 tabular-nums">{timer}</span>
      </p>

      <p
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-earth/75 px-2.5 py-1.5 text-earth-foreground/85 backdrop-blur-md sm:top-4 sm:right-4"
        role="img"
        aria-label={fill(copy.interviewerDevices, { name: interviewer.name })}
      >
        <Video className="size-3.5" aria-hidden="true" />
        <Mic className="size-3.5" aria-hidden="true" />
      </p>

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-earth/80 px-3 py-1.5 text-sm backdrop-blur-md sm:bottom-4 sm:left-4">
        {speaking && (
          <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="w-1 animate-pulse rounded-full bg-terracotta" style={{ height: `${6 + ((i * 5) % 8)}px`, animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
        )}
        <span className="font-semibold">{interviewer.name}</span>
        {interviewer.role && <span className="hidden text-earth-foreground/70 sm:inline">· {interviewer.role}</span>}
      </div>

      {/* Self view: the real camera when it is on */}
      <div
        className="absolute right-3 bottom-3 aspect-video w-28 overflow-hidden rounded-md border-2 border-earth-foreground/25 bg-primary-soft shadow-xl sm:right-4 sm:bottom-4 sm:w-44"
        role="img"
        aria-label={listening ? copy.youRecording : self.live ? copy.you : copy.youCameraOff}
      >
        <SelfPreview attach={self.attach} live={self.live} me={me} size="small" />
        <span className="absolute bottom-1 left-1.5 flex items-center gap-1 rounded bg-earth/70 px-1 text-[10px] font-bold text-earth-foreground" aria-hidden="true">
          {self.microphone ? <Mic className={cn("size-3", listening && "text-terracotta")} /> : <MicOff className="size-3 text-destructive" />} {copy.you}
        </span>
      </div>
    </div>
  );
}

interface ControlsCopy {
  mute: string;
  unmute: string;
  turnCameraOff: string;
  turnCameraOn: string;
  leave: string;
}

/** The call's controls, below the video (never over the interviewer's face). Every one of them acts. */
export function CallControls(props: {
  microphone: boolean;
  camera: boolean;
  canUseMicrophone: boolean;
  canUseCamera: boolean;
  onMicrophone: () => void;
  onCamera: () => void;
  leaveHref: string;
  copy: ControlsCopy;
}) {
  const { microphone, camera, canUseMicrophone, canUseCamera, onMicrophone, onCamera, leaveHref, copy } = props;
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        size="icon"
        variant={microphone ? "outline" : "destructive"}
        className="size-11 rounded-full"
        onClick={onMicrophone}
        disabled={!canUseMicrophone}
        aria-pressed={!microphone}
        aria-label={microphone ? copy.mute : copy.unmute}
        title={microphone ? copy.mute : copy.unmute}
      >
        {microphone ? <Mic className="size-5" /> : <MicOff className="size-5" />}
      </Button>
      <Button
        size="icon"
        variant={camera ? "outline" : "destructive"}
        className="size-11 rounded-full"
        onClick={onCamera}
        disabled={!canUseCamera}
        aria-pressed={!camera}
        aria-label={camera ? copy.turnCameraOff : copy.turnCameraOn}
        title={camera ? copy.turnCameraOff : copy.turnCameraOn}
      >
        {camera ? <Video className="size-5" /> : <VideoOff className="size-5" />}
      </Button>
      <Button asChild variant="destructive" className="h-11 rounded-full px-5">
        <Link href={leaveHref}>
          <PhoneOff className="size-5" aria-hidden="true" /> {copy.leave}
        </Link>
      </Button>
    </div>
  );
}
