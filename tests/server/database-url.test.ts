import { afterEach, describe, expect, it, vi } from "vitest";

// The database connection string arrives under two names: DATABASE_URL (Vercel's Neon integration) or
// DB_CONNECTION_STRING (older setups). An empty value counts as not set.
async function loadEnv(database: { DATABASE_URL?: string; DB_CONNECTION_STRING?: string }) {
  vi.resetModules();
  vi.stubEnv("CLERK_SECRET_KEY", "sk_test");
  vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test");
  vi.stubEnv("APP_ENCRYPTION_KEY", "key");
  vi.stubEnv("DATABASE_URL", database.DATABASE_URL ?? "");
  vi.stubEnv("DB_CONNECTION_STRING", database.DB_CONNECTION_STRING ?? "");
  return import("@/lib/server/env");
}

afterEach(() => vi.unstubAllEnvs());

describe("databaseUrl", () => {
  it("prefers DATABASE_URL, the name Vercel's Neon integration sets", async () => {
    const { databaseUrl } = await loadEnv({ DATABASE_URL: "postgresql://new", DB_CONNECTION_STRING: "postgresql://old" });
    expect(databaseUrl()).toBe("postgresql://new");
  });

  it("falls back to DB_CONNECTION_STRING", async () => {
    const { databaseUrl } = await loadEnv({ DB_CONNECTION_STRING: "postgresql://old" });
    expect(databaseUrl()).toBe("postgresql://old");
  });

  it("names DATABASE_URL, without any value, when neither is set", async () => {
    const { serverEnv } = await loadEnv({});
    expect(() => serverEnv()).toThrow("Missing or invalid environment variables: DATABASE_URL");
  });
});
