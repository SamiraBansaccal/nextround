// Shared by the owner scripts: loads .env.local and .env when present (your machine), otherwise uses the
// environment as is (a Claude cloud session gets the same variables from its environment settings),
// and finds the owner's account (numeric GitHub id = OWNER_GITHUB_ID). Prints no secret.
import { existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// `.env.local` (written by `vercel env pull`) first, then `.env`: as in Next.js, the first file wins.
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

const missing = [
  ...(process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING ? [] : ["DATABASE_URL"]),
  ...["OWNER_GITHUB_ID", "APP_ENCRYPTION_KEY"].filter((name) => !process.env[name]),
];
for (const name of missing) {
  console.error(`${name} is not set: run \`vercel env pull\` (your machine) or add it to the cloud environment.`);
}
if (missing.length) process.exit(1);

const sql = neon((process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING)!);

/**
 * The owner's user id: OWNER_USER_ID if set, else the Neon Auth user linked to the GitHub account OWNER_GITHUB_ID
 * (same rule as lib/server/auth.ts). Reads only the account's provider and id in Neon's `neon_auth` schema.
 */
export async function ownerUserId(): Promise<string> {
  if (process.env.OWNER_USER_ID) return process.env.OWNER_USER_ID;
  const rows = await sql`select "userId" from neon_auth.account where "providerId" = 'github' and "accountId" = ${process.env.OWNER_GITHUB_ID} limit 1`;
  if (rows[0]?.userId) return rows[0].userId as string;
  console.error(`No account signed in with the GitHub account ${process.env.OWNER_GITHUB_ID}: sign in to the app once first.`);
  process.exit(1);
}

export const ownerContext = async () => ({ userId: await ownerUserId(), isOwner: true });
