import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";
import { serverEnv } from "@/lib/server/env";

// Neon Auth (ADR 0028): Neon's managed Better Auth, on the same Neon project as the data. Accounts live in the
// database's `neon_auth` schema; sign-in methods (Google, GitHub; no email or password) are set with the Neon CLI.
// Created lazily, so that importing this module never needs the environment (e.g. at build time).
let instance: ReturnType<typeof createNeonAuth> | undefined;

export function neonAuth() {
  const env = serverEnv();
  instance ??= createNeonAuth({
    baseUrl: env.NEON_AUTH_BASE_URL,
    cookies: { secret: env.NEON_AUTH_COOKIE_SECRET },
  });
  return instance;
}
