"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MEDIA_STORAGE_KEY, type MediaChoice } from "@/lib/interview/session";

// The candidate's own camera and microphone, for the "Ready to join?" screen and the call: a local
// preview, a sound level meter, and real switches. Turning a device off STOPS its track, so the
// operating system releases it (the camera light goes off); turning it back on asks for it again.
// Only the devices that are switched on are ever opened. Nothing is recorded or sent anywhere.

export type MediaStatus = "idle" | "requesting" | "ready" | "denied" | "unavailable";

/** The choices made on the setup screen, read back on the call (this browser only). */
export function readMediaChoice(): MediaChoice | null {
  try {
    const raw = window.sessionStorage.getItem(MEDIA_STORAGE_KEY);
    const value = raw ? (JSON.parse(raw) as Partial<MediaChoice>) : null;
    return value ? { microphone: value.microphone === true, camera: value.camera === true } : null;
  } catch {
    return null;
  }
}

export function saveMediaChoice(choice: MediaChoice) {
  try {
    window.sessionStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // private mode or storage blocked: the call simply starts with both off
  }
}

type Kind = "audio" | "video";
type Tracks = Record<Kind, MediaStreamTrack | null>;

/** Which input devices exist (no permission needed, labels are not read). */
async function availableDevices(): Promise<Record<Kind, boolean>> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return { audio: devices.some((d) => d.kind === "audioinput"), video: devices.some((d) => d.kind === "videoinput") };
  } catch {
    return { audio: true, video: true }; // unknown: try anyway
  }
}

/** `meter`: measure the sound level (the setup screen shows it; the call does not need it). */
export function useLocalMedia(initial: MediaChoice, { meter = true }: { meter?: boolean } = {}) {
  const [status, setStatus] = useState<MediaStatus>("idle");
  const [tracks, setTracks] = useState<Tracks>({ audio: null, video: null });
  const [available, setAvailable] = useState<Record<Kind, boolean>>({ audio: false, video: false });
  const [microphone, setMicrophone] = useState(initial.microphone);
  const [camera, setCamera] = useState(initial.camera);
  const [level, setLevel] = useState(0); // 0 … 1
  const live = useRef<Tracks>({ audio: null, video: null }); // the tracks currently open
  const wanted = useRef<Record<Kind, boolean>>({ audio: initial.microphone, video: initial.camera });
  const active = useRef(false); // between start() and stop()
  const generation = useRef(0); // a request that resolves after stop() is closed at once

  const release = useCallback((kind: Kind) => {
    live.current[kind]?.stop();
    live.current = { ...live.current, [kind]: null };
    setTracks(live.current);
  }, []);

  /** Opens the given devices (one permission prompt for both), keeping only those still wanted. */
  const open = useCallback(async (kinds: Kind[]) => {
    const missing = kinds.filter((k) => !live.current[k]);
    if (missing.length === 0) return;
    const id = generation.current;
    const request = (wantedKinds: Kind[]) => navigator.mediaDevices.getUserMedia({ audio: wantedKinds.includes("audio"), video: wantedKinds.includes("video") });
    const opened: MediaStreamTrack[] = [];
    let failure: unknown = null;
    try {
      opened.push(...(await request(missing)).getTracks());
    } catch (error) {
      failure = error;
      if (error instanceof DOMException && error.name === "NotFoundError" && missing.length === 2) {
        // One of the two devices is missing: open the other one alone.
        for (const kind of missing) {
          try {
            opened.push(...(await request([kind])).getTracks());
            failure = null;
          } catch {
            // that one is missing
          }
        }
      }
    }
    for (const track of opened) {
      const kind = track.kind as Kind;
      if (id !== generation.current || !wanted.current[kind] || live.current[kind]) track.stop(); // switched off meanwhile
      else live.current = { ...live.current, [kind]: track };
    }
    setTracks(live.current);
    if (id !== generation.current) return;
    if (failure instanceof DOMException && (failure.name === "NotAllowedError" || failure.name === "SecurityError")) setStatus("denied");
    else setStatus(live.current.audio || live.current.video || !failure ? "ready" : "unavailable");
  }, []);

  const stop = useCallback(() => {
    generation.current++;
    active.current = false;
    for (const kind of ["audio", "video"] as const) live.current[kind]?.stop();
    live.current = { audio: null, video: null };
    setTracks(live.current);
    setLevel(0);
  }, []);

  useEffect(() => stop, [stop]); // never leave a camera on after leaving the page

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      return;
    }
    stop();
    active.current = true;
    const id = generation.current;
    setStatus("requesting");
    const devices = await availableDevices();
    if (id !== generation.current) return;
    setAvailable(devices);
    if (!devices.audio && !devices.video) {
      setStatus("unavailable");
      return;
    }
    const kinds = (["audio", "video"] as const).filter((k) => devices[k] && wanted.current[k]);
    if (kinds.length === 0) setStatus("ready"); // both switched off: nothing to open
    else await open(kinds);
  }, [stop, open]);

  /** Applies a switch: opens or releases the device right away when the media are active. */
  const apply = useCallback(
    (kind: Kind, on: boolean) => {
      wanted.current = { ...wanted.current, [kind]: on };
      if (!on) release(kind);
      else if (active.current) void open([kind]);
    },
    [open, release],
  );

  const toggleMicrophone = useCallback(() => {
    const on = !wanted.current.audio;
    setMicrophone(on);
    apply("audio", on);
  }, [apply]);
  const toggleCamera = useCallback(() => {
    const on = !wanted.current.video;
    setCamera(on);
    apply("video", on);
  }, [apply]);
  /** Restores choices made earlier (the setup screen), e.g. when the call opens. */
  const restore = useCallback(
    (choice: MediaChoice) => {
      setMicrophone(choice.microphone);
      setCamera(choice.camera);
      apply("audio", choice.microphone);
      apply("video", choice.camera);
    },
    [apply],
  );

  // Sound level meter on the open microphone.
  useEffect(() => {
    const audio = tracks.audio;
    if (!meter || !audio) return;
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(new MediaStream([audio])).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    let shown = 0;
    let frame = 0;
    const tick = (now: number) => {
      if (now - shown > 80) {
        // about 12 updates a second: enough for a meter, light on re-renders
        shown = now;
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const s of samples) sum += ((s - 128) / 128) ** 2;
        setLevel(Math.min(1, Math.sqrt(sum / samples.length) * 4));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      void context.close();
    };
  }, [tracks.audio, meter]);

  /** Ref callback for a preview <video>: shows the camera track only. */
  const attach = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video) return;
      const track = tracks.video;
      const current = video.srcObject instanceof MediaStream ? video.srcObject.getVideoTracks()[0] : undefined;
      if (track && current !== track) video.srcObject = new MediaStream([track]);
      if (!track && video.srcObject) video.srcObject = null;
    },
    [tracks.video],
  );

  return {
    status,
    microphone,
    camera,
    level: microphone && tracks.audio ? level : 0,
    /** The device exists (the switch can be used). */
    hasAudio: available.audio || !!tracks.audio,
    hasVideo: available.video || !!tracks.video,
    /** The camera is actually streaming (for the preview). */
    videoLive: camera && !!tracks.video,
    start,
    stop,
    attach,
    toggleMicrophone,
    toggleCamera,
    restore,
  };
}
