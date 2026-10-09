// Shared by the owner scripts: loads .env.local and .env when present (your machine), otherwise uses the
// environment as is (a Claude cloud session gets the same variables from its environment settings),
// and finds the owner's account (numeric GitHub id = OWNER_GITHUB_ID). Prints no secret.
import { existsSync } from "node:fs";
import { createClerkClient } from "@clerk/backend";

// `.env.local` (written by `vercel env pull`) first, then `.env`: as in Next.js, the first file wins.
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

const missing = [
  ...(process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING ? [] : ["DATABASE_URL"]),
  ...["CLERK_SECRET_KEY", "OWNER_GITHUB_ID", "APP_ENCRYPTION_KEY"].filter((name) => !process.env[name]),
];
for (const name of missing) {
  console.error(`${name} is not set: run \`vercel env pull\` (your machine) or add it to the cloud environment.`);
}
if (missing.length) process.exit(1);

/** True when this Clerk account is linked to the owner's GitHub account (same rule as lib/server/auth.ts). */
export const isOwnerAccount = (user: { externalAccounts: { provider: string; providerUserId: string }[] }) =>
  user.externalAccounts.some((a) => a.provider.includes("github") && a.providerUserId === process.env.OWNER_GITHUB_ID);

/** The owner's Clerk user id: OWNER_USER_ID if set, else the user signed in with the GitHub account OWNER_GITHUB_ID. */
export async function ownerUserId(): Promise<string> {
  if (process.env.OWNER_USER_ID) return process.env.OWNER_USER_ID;
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  for (let offset = 0; ; offset += 100) {
    const { data: users } = await clerk.users.getUserList({ limit: 100, offset });
    const owner = users.find(isOwnerAccount);
    if (owner) return owner.id;
    if (users.length < 100) break;
  }
  console.error(`No account signed in with the GitHub account ${process.env.OWNER_GITHUB_ID}: sign in to the app once first.`);
  process.exit(1);
}

export const ownerContext = async () => ({ userId: await ownerUserId(), isOwner: true });
