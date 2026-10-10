import { cn } from "@/lib/utils";

// The candidate's own picture: the live camera when it is on, else their avatar. Display only.

interface Props {
  attach: (video: HTMLVideoElement | null) => void;
  live: boolean; // camera on and a video track exists
  me: { name: string; imageUrl: string | null };
  size?: "large" | "small";
}

export function SelfPreview({ attach, live, me, size = "large" }: Props) {
  return (
    <>
      {/* The video element stays mounted so it keeps its stream; it is hidden while the camera is off. */}
      <video ref={attach} autoPlay muted playsInline className={cn("absolute inset-0 size-full -scale-x-100 object-cover", !live && "hidden")} aria-hidden="true" />
      {!live && (
        <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
          {me.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote avatar from the sign-in provider
            <img src={me.imageUrl} alt="" className={cn("rounded-full object-cover", size === "large" ? "size-24 sm:size-28" : "size-7 sm:size-10")} />
          ) : (
            <span
              className={cn(
                "grid place-items-center rounded-full bg-primary font-bold text-primary-foreground",
                size === "large" ? "size-24 text-2xl sm:size-28" : "size-7 text-[10px] sm:size-10 sm:text-xs",
              )}
            >
              {me.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      )}
    </>
  );
}
