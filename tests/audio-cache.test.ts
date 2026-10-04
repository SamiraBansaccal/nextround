import { describe, expect, it } from "vitest";

import { memoryAudioStore } from "@/lib/voice/audio-cache";

const audio = (bytes: number) => ({ audio: new ArrayBuffer(bytes), contentType: "audio/mpeg" });

describe("audio cache", () => {
  it("returns what was stored, and drops the least recently used past the size limit", async () => {
    const store = memoryAudioStore(10);
    await store.put("a", audio(4));
    await store.put("b", audio(4));
    expect(await store.get("a")).not.toBeNull(); // "a" is now the most recent
    await store.put("c", audio(4));
    expect(await store.get("b")).toBeNull();
    expect(await store.get("a")).not.toBeNull();
    expect(await store.get("c")).not.toBeNull();
  });
});
