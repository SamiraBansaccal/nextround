import "server-only";
import { eq } from "drizzle-orm";
import { decryptSecret, encryptSecret, last4 } from "@/lib/server/crypto";
import { getDb } from "@/lib/db";
import { aiSettings } from "@/lib/db/schema";
import type { ProviderId } from "@/lib/ai/providers";

// Per-user AI settings. The table's primary key IS the user id, and every function takes the
// userId from the server-side session. Keys are encrypted before storage and NEVER returned to
// the browser: the UI only receives PublicAiSettings (masked last 4 characters).

export interface PublicAiSettings {
  provider: ProviderId;
  baseUrl: string;
  model: string;
  hasKey: boolean;
  keyLast4: string | null;
  hasVoiceKey: boolean;
  voiceKeyLast4: string | null;
  hasFirecrawlKey: boolean;
  firecrawlKeyLast4: string | null;
}

type Row = typeof aiSettings.$inferSelect;

function toPublic(row: Row): PublicAiSettings {
  return {
    provider: row.provider as ProviderId,
    baseUrl: row.baseUrl,
    model: row.model,
    hasKey: row.apiKeyEncrypted !== null,
    keyLast4: row.apiKeyLast4,
    hasVoiceKey: row.elevenlabsKeyEncrypted !== null,
    voiceKeyLast4: row.elevenlabsKeyLast4,
    hasFirecrawlKey: row.firecrawlKeyEncrypted !== null,
    firecrawlKeyLast4: row.firecrawlKeyLast4,
  };
}

async function getRow(userId: string): Promise<Row | null> {
  const [row] = await getDb().select().from(aiSettings).where(eq(aiSettings.userId, userId)).limit(1);
  return row ?? null;
}

export async function getPublicAiSettings(userId: string): Promise<PublicAiSettings | null> {
  const row = await getRow(userId);
  return row ? toPublic(row) : null;
}

/** Server-only: the decrypted secrets, for making calls. Never pass this to a component. */
export async function getAiSecrets(userId: string): Promise<{
  provider: ProviderId;
  baseUrl: string;
  model: string;
  apiKey: string | null;
  voiceKey: string | null;
  firecrawlKey: string | null;
} | null> {
  const row = await getRow(userId);
  if (!row) return null;
  return {
    provider: row.provider as ProviderId,
    baseUrl: row.baseUrl,
    model: row.model,
    apiKey: row.apiKeyEncrypted ? decryptSecret(row.apiKeyEncrypted) : null,
    voiceKey: row.elevenlabsKeyEncrypted ? decryptSecret(row.elevenlabsKeyEncrypted) : null,
    firecrawlKey: row.firecrawlKeyEncrypted ? decryptSecret(row.firecrawlKeyEncrypted) : null,
  };
}

export interface SaveAiSettingsInput {
  provider: ProviderId;
  baseUrl: string;
  model: string;
  /** New key to store. undefined = keep the current key. */
  apiKey?: string;
}

export async function saveAiSettings(userId: string, input: SaveAiSettingsInput): Promise<PublicAiSettings> {
  const existing = await getRow(userId);
  // Changing provider without giving a new key drops the old key: it belongs to another provider.
  const keepKey = input.apiKey === undefined && existing?.provider === input.provider;
  const keyFields =
    input.apiKey !== undefined
      ? { apiKeyEncrypted: encryptSecret(input.apiKey), apiKeyLast4: last4(input.apiKey) }
      : keepKey
        ? {}
        : { apiKeyEncrypted: null, apiKeyLast4: null };

  const values = { provider: input.provider, baseUrl: input.baseUrl, model: input.model, ...keyFields, updatedAt: new Date() };
  const [row] = await getDb()
    .insert(aiSettings)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: aiSettings.userId, set: values })
    .returning();
  return toPublic(row);
}

export async function removeAiKey(userId: string): Promise<void> {
  await getDb()
    .update(aiSettings)
    .set({ apiKeyEncrypted: null, apiKeyLast4: null, updatedAt: new Date() })
    .where(eq(aiSettings.userId, userId));
}

/** The optional keys for services other than the AI: ElevenLabs (voice) and Firecrawl (offer pages). */
export type ServiceKey = "voice" | "firecrawl";

/** Stores (or removes, with null) the user's key for a service. Creates the row if needed. */
export async function saveServiceKey(userId: string, service: ServiceKey, key: string | null, defaults: Omit<SaveAiSettingsInput, "apiKey">): Promise<void> {
  const encrypted = key === null ? null : encryptSecret(key);
  const shown = key === null ? null : last4(key);
  const keyFields =
    service === "voice"
      ? { elevenlabsKeyEncrypted: encrypted, elevenlabsKeyLast4: shown }
      : { firecrawlKeyEncrypted: encrypted, firecrawlKeyLast4: shown };
  await getDb()
    .insert(aiSettings)
    .values({ userId, ...defaults, ...keyFields })
    .onConflictDoUpdate({ target: aiSettings.userId, set: { ...keyFields, updatedAt: new Date() } });
}
