import "server-only";
import { and, eq, inArray, like, lt, sql } from "drizzle-orm";
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
  // The first call of the day clears this user's per-minute rows of the days before: one row per minute
  // used, useful only during that minute. The daily totals stay.
  if (perDay === 1) {
    await getDb()
      .delete(usageCounters)
      .where(and(eq(usageCounters.userId, userId), lt(usageCounters.day, day), like(usageCounters.kind, "%:minute:%")));
  }
  if (perDay > limits.perDay) throw new AiError("quota_exceeded");
}

/** How many instance-key calls of each kind this user made today (UTC day), for the Settings page. */
export async function getTodayUsage(userId: string, now: Date = new Date()): Promise<Record<UsageKind, number>> {
  const kinds: UsageKind[] = ["llm", "tts", "scrape"];
  const rows = await getDb()
    .select({ kind: usageCounters.kind, count: usageCounters.count })
    .from(usageCounters)
    .where(and(eq(usageCounters.userId, userId), eq(usageCounters.day, now.toISOString().slice(0, 10)), inArray(usageCounters.kind, kinds)));
  const used: Record<UsageKind, number> = { llm: 0, tts: 0, scrape: 0 };
  for (const row of rows) used[row.kind as UsageKind] = row.count;
  return used;
}
