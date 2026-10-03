import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { usageCounters } from "@/lib/db/schema";
import { AiError } from "./errors";

// Rate limit + daily cap, ONLY for calls made with the instance keys (owner path).
// Users who bring their own key are limited by their own provider, not by us.
// Counters live in Postgres (usage_counters), so limits hold across serverless instances.

export type UsageKind = "llm" | "tts" | "scrape";

export interface UsageLimits {
  perMinute: number;
  perDay: number;
}

/** Defaults stay under OpenRouter's free cap (50 requests/day without credits). */
export const DEFAULT_LIMITS: Record<UsageKind, UsageLimits> = {
  llm: { perMinute: 8, perDay: 40 },
  tts: { perMinute: 10, perDay: 60 },
  scrape: { perMinute: 5, perDay: 30 },
};

async function increment(userId: string, day: string, kind: string): Promise<number> {
  const [row] = await getDb()
    .insert(usageCounters)
    .values({ userId, day, kind, count: 1 })
    .onConflictDoUpdate({
      target: [usageCounters.userId, usageCounters.day, usageCounters.kind],
      set: { count: sql`${usageCounters.count} + 1` },
    })
    .returning({ count: usageCounters.count });
  return row.count;
}

/** Counts one instance-key call and throws if the minute or daily limit is exceeded. */
export async function consumeInstanceQuota(
  userId: string,
  kind: UsageKind,
  limits: UsageLimits = DEFAULT_LIMITS[kind],
  now: Date = new Date(),
): Promise<void> {
  const day = now.toISOString().slice(0, 10); // UTC day
  const minute = now.toISOString().slice(11, 16); // UTC HH:MM
  const perMinute = await increment(userId, day, `${kind}:minute:${minute}`);
  if (perMinute > limits.perMinute) throw new AiError("rate_limited");
  const perDay = await increment(userId, day, kind);
  if (perDay > limits.perDay) throw new AiError("quota_exceeded");
}
