"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MEDIA_STORAGE_KEY, type MediaChoice } from "@/lib/interview/session";

// The candidate's own camera and microphone, for the "Ready to join?" screen and the call: a local
// preview, a sound level meter, and real mute / camera-off switches (tracks disabled, not just icons).
// Nothing is recorded or sent anywhere: the stream only feeds a <video> on this page and the meter.

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

async function requestStream(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") {
      // One of the two devices is missing: keep whichever exists.
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        return navigator.mediaDevices.getUserMedia({ video: true });
      }
    }
    throw error;
  }
}

/** `meter`: measure the sound level (the setup screen shows it; the call does not need it). */
export function useLocalMedia(initial: MediaChoice, { meter = true }: { meter?: boolean } = {}) {
  const [status, setStatus] = useState<MediaStatus>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [microphone, setMicrophone] = useState(initial.microphone);
  const [camera, setCamera] = useState(initial.camera);
  const [level, setLevel] = useState(0); // 0 … 1
  const current = useRef<{ stream: MediaStream; context: AudioContext | null; frame: number } | null>(null);
  const generation = useRef(0); // a request that resolves after stop() is closed at once

  const stop = useCallback(() => {
    generation.current++;
    if (current.current) {
      cancelAnimationFrame(current.current.frame);
      void current.current.context?.close();
      current.current.stream.getTracks().forEach((t) => t.stop());
      current.current = null;
    }
    setStream(null);
    setLevel(0);
  }, []);

  useEffect(() => stop, [stop]); // never leave a camera on after leaving the page

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      return;
    }
    stop();
    const id = generation.current;
    setStatus("requesting");
    let next: MediaStream;
    try {
      next = await requestStream();
    } catch (error) {
      if (id === generation.current) {
        setStatus(error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError") ? "denied" : "unavailable");
      }
      return;
    }
    if (id !== generation.current) {
      next.getTracks().forEach((t) => t.stop());
      return;
    }
    const entry: { stream: MediaStream; context: AudioContext | null; frame: number } = { stream: next, context: null, frame: 0 };
    if (meter && next.getAudioTracks().length > 0) {
      const context = new AudioContext();
      entry.context = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(next).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      let shown = 0;
      const tick = (now: number) => {
        if (now - shown > 80) {
          // about 12 updates a second: enough for a meter, light on re-renders
          shown = now;
          analyser.getByteTimeDomainData(samples);
          let sum = 0;
          for (const s of samples) sum += ((s - 128) / 128) ** 2;
          setLevel(Math.min(1, Math.sqrt(sum / samples.length) * 4));
        }
        entry.frame = requestAnimationFrame(tick);
      };
      entry.frame = requestAnimationFrame(tick);
    }
    current.current = entry;
    setStream(next);
    setStatus("ready");
  }, [stop, meter]);

  // The switches really disable the tracks.
  useEffect(() => {
    stream?.getAudioTracks().forEach((t) => (t.enabled = microphone));
  }, [stream, microphone]);
  useEffect(() => {
    stream?.getVideoTracks().forEach((t) => (t.enabled = camera));
  }, [stream, camera]);

  const toggleMicrophone = useCallback(() => setMicrophone((m) => !m), []);
  const toggleCamera = useCallback(() => setCamera((c) => !c), []);
  /** Restores choices made earlier (the setup screen), e.g. when the call opens. */
  const restore = useCallback((choice: MediaChoice) => {
    setMicrophone(choice.microphone);
    setCamera(choice.camera);
  }, []);

  /** Ref callback for a preview <video>. */
  const attach = useCallback(
    (video: HTMLVideoElement | null) => {
      if (video && stream && video.srcObject !== stream) video.srcObject = stream;
    },
    [stream],
  );

  return {
    status,
    microphone,
    camera,
    level: microphone ? level : 0,
    hasAudio: (stream?.getAudioTracks().length ?? 0) > 0,
    hasVideo: (stream?.getVideoTracks().length ?? 0) > 0,
    start,
    stop,
    attach,
    toggleMicrophone,
    toggleCamera,
    restore,
  };
}
