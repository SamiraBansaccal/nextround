import { randomBytes } from "node:crypto";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/tests/helpers/test-db";

// Who pays for AI calls, custom base URL protection, rate limit / daily cap, settings isolation.

let testDb: Awaited<ReturnType<typeof createTestDb>>;
const env = {
  APP_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
  OPENROUTER_API_API_KEY: "instance-key",
  ELEVENLABS_API_KEY: "instance-voice-key",
  INSTANCE_VOICE_ENABLED: "true",
  ALLOW_CUSTOM_LLM_BASE_URL: "false",
} as Record<string, string | undefined>;
vi.mock("@/lib/db", () => ({ getDb: () => testDb }));
vi.mock("@/lib/server/env", () => ({ serverEnv: () => env }));

const { getAiStatus, resolveLlmConfig, resolvePageReader, resolveVoiceConfig } = await import("@/lib/ai/config");
const { assertAllowedBaseUrl } = await import("@/lib/ai/client");
const { consumeInstanceQuota } = await import("@/lib/ai/usage");
const { getPublicAiSettings, saveAiSettings, saveServiceKey } = await import("@/lib/data/ai-settings");
const { PRESETS } = await import("@/lib/ai/providers");

beforeAll(async () => {
  testDb = await createTestDb();
});

describe("who pays", () => {
  it("a user without a key gets the 'add your key' error", async () => {
    await expect(resolveLlmConfig("user_nokey", false)).rejects.toThrow("Add your AI key in Settings to use AI features.");
  });

  it("the owner without a key falls back to the instance key", async () => {
    const config = await resolveLlmConfig("user_owner", true);
    expect(config).toMatchObject({ source: "instance", apiKey: "instance-key", baseUrl: PRESETS.openrouter.baseUrl });
  });

  it("a saved user key wins, even for the owner", async () => {
    await saveAiSettings("user_owner2", { provider: "groq", baseUrl: PRESETS.groq.baseUrl, model: "some-model", apiKey: "gsk_userkey123" });
    const config = await resolveLlmConfig("user_owner2", true);
    expect(config).toMatchObject({ source: "user", apiKey: "gsk_userkey123", model: "some-model" });
  });

  it("voice: user key, else owner instance key, else the free browser voice", async () => {
    await saveServiceKey("user_voice", "voice", "el_userkey_abc", { provider: "openrouter", baseUrl: PRESETS.openrouter.baseUrl, model: "m" });
    expect(await resolveVoiceConfig("user_voice", false)).toMatchObject({ provider: "elevenlabs", source: "user" });
    expect(await resolveVoiceConfig("user_owner", true)).toMatchObject({ provider: "elevenlabs", source: "instance" });
    expect(await resolveVoiceConfig("user_nokey", false)).toEqual({ provider: "browser" });
  });

  it("voice: the instance's ElevenLabs credits are off unless INSTANCE_VOICE_ENABLED=true", async () => {
    env.INSTANCE_VOICE_ENABLED = "false";
    try {
      expect(await resolveVoiceConfig("user_owner", true)).toEqual({ provider: "browser" });
    } finally {
      env.INSTANCE_VOICE_ENABLED = "true";
    }
  });

  it("offer pages: user Firecrawl key, else the instance key for the OWNER only, else the free built-in reader", async () => {
    env.FIRECRAWL_API_API_KEY = "fc-instance";
    try {
      await saveServiceKey("user_pages", "firecrawl", "fc-userkey-1234", { provider: "openrouter", baseUrl: PRESETS.openrouter.baseUrl, model: "m" });
      expect(await resolvePageReader("user_pages", false)).toEqual({ provider: "firecrawl", apiKey: "fc-userkey-1234", source: "user" });
      expect(await resolvePageReader("user_owner", true)).toEqual({ provider: "firecrawl", apiKey: "fc-instance", source: "instance" });
      // Another account never gets the instance key: the built-in reader costs nobody anything.
      expect(await resolvePageReader("user_nokey", false)).toEqual({ provider: "builtin" });
      expect(await getAiStatus("user_nokey", false)).toMatchObject({ mode: "none", voice: "browser", pages: "builtin" });
      expect(await getPublicAiSettings("user_pages")).toMatchObject({ hasFirecrawlKey: true, firecrawlKeyLast4: "1234", hasKey: false });
      await saveServiceKey("user_pages", "firecrawl", null, { provider: "openrouter", baseUrl: PRESETS.openrouter.baseUrl, model: "m" });
      expect(await resolvePageReader("user_pages", false)).toEqual({ provider: "builtin" });
    } finally {
      delete env.FIRECRAWL_API_API_KEY;
    }
  });

  it("owner: the instance Anthropic key is preferred over OpenRouter when set", async () => {
    env.ANTHROPIC_API_KEY = "sk-ant-instance";
    try {
      expect(await resolveLlmConfig("user_owner_claude", true)).toMatchObject({ baseUrl: PRESETS.anthropic.baseUrl, model: "claude-opus-5-5", source: "instance" });
    } finally {
      delete env.ANTHROPIC_API_KEY;
    }
  });
});

describe("keys are never exposed", () => {
  it("public settings contain only the last 4 characters", async () => {
    await saveAiSettings("user_mask", { provider: "openai", baseUrl: PRESETS.openai.baseUrl, model: "m", apiKey: "sk-secret-value-WXYZ" });
    const pub = await getPublicAiSettings("user_mask");
    expect(pub).toMatchObject({ hasKey: true, keyLast4: "WXYZ" });
    expect(JSON.stringify(pub)).not.toContain("sk-secret-value");
  });

  it("changing provider without a new key drops the old key", async () => {
    await saveAiSettings("user_mask", { provider: "mistral", baseUrl: PRESETS.mistral.baseUrl, model: "m" });
    expect(await getPublicAiSettings("user_mask")).toMatchObject({ hasKey: false, keyLast4: null });
  });

  it("user B cannot see user A's settings", async () => {
    expect(await getPublicAiSettings("user_someone_else")).toBeNull();
  });
});

describe("custom base URL (SSRF protection)", () => {
  it("presets are always allowed", () => {
    expect(() => assertAllowedBaseUrl(PRESETS.mistral.baseUrl, false)).not.toThrow();
  });

  it("any other host is refused on the public instance", () => {
    expect(() => assertAllowedBaseUrl("http://169.254.169.254/latest", false)).toThrow("not allowed");
    expect(() => assertAllowedBaseUrl("http://localhost:11434/v1", false)).toThrow("not allowed");
  });

  it("self-hosting can allow a custom http(s) URL", () => {
    expect(() => assertAllowedBaseUrl("http://localhost:11434/v1", true)).not.toThrow();
    expect(() => assertAllowedBaseUrl("file:///etc/passwd", true)).toThrow();
  });
});

describe("instance key limits", () => {
  beforeEach(() => vi.useRealTimers());

  it("enforces the per-minute limit", async () => {
    const now = new Date("2026-10-03T10:00:00Z");
    for (let i = 0; i < 3; i++) await consumeInstanceQuota("user_rate", "llm", { perMinute: 3, perDay: 100 }, now);
    await expect(consumeInstanceQuota("user_rate", "llm", { perMinute: 3, perDay: 100 }, now)).rejects.toThrow("rate limiting");
  });

  it("clears the per-minute rows of the days before on the first call of a day, keeping the daily totals", async () => {
    const { usageCounters } = await import("@/lib/db/schema");
    const limits = { perMinute: 100, perDay: 100 };
    await consumeInstanceQuota("user_purge", "llm", limits, new Date("2026-10-03T10:00:00Z"));
    await consumeInstanceQuota("user_purge", "llm", limits, new Date("2026-10-03T10:01:00Z"));
    await consumeInstanceQuota("user_other", "llm", limits, new Date("2026-10-03T10:00:00Z"));
    await consumeInstanceQuota("user_purge", "llm", limits, new Date("2026-10-04T09:00:00Z"));
    const rows = await testDb.select({ userId: usageCounters.userId, day: usageCounters.day, kind: usageCounters.kind }).from(usageCounters);
    const mine = rows.filter((r) => r.userId === "user_purge").map((r) => `${r.day} ${r.kind}`).sort();
    expect(mine).toEqual(["2026-10-03 llm", "2026-10-04 llm", "2026-10-04 llm:minute:09:00"]);
    expect(rows.some((r) => r.userId === "user_other" && r.kind.includes(":minute:"))).toBe(true); // another user's rows: untouched
  });

  it("enforces the daily cap, counted per user and per day", async () => {
    const limits = { perMinute: 100, perDay: 2 };
    await consumeInstanceQuota("user_cap", "llm", limits, new Date("2026-10-03T10:00:00Z"));
    await consumeInstanceQuota("user_cap", "llm", limits, new Date("2026-10-03T11:00:00Z"));
    await expect(consumeInstanceQuota("user_cap", "llm", limits, new Date("2026-10-03T12:00:00Z"))).rejects.toThrow("daily limit");
    // Next day: counter starts again.
    await expect(consumeInstanceQuota("user_cap", "llm", limits, new Date("2026-10-04T10:00:00Z"))).resolves.toBeUndefined();
  });
});
