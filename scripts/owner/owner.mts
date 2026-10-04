// Shared by the owner scripts: loads .env when there is one (your machine), otherwise uses the
// environment as is (a Claude cloud session gets the same variables from its environment settings),
// and finds the owner's account (GitHub login = OWNER_GITHUB_LOGIN). Prints no secret.
import { existsSync } from "node:fs";
import { createClerkClient } from "@clerk/backend";

if (existsSync(".env")) process.loadEnvFile(".env");

for (const name of ["DB_CONNECTION_STRING", "CLERK_SECRET_KEY", "OWNER_GITHUB_LOGIN", "APP_ENCRYPTION_KEY"]) {
  if (!process.env[name]) {
    console.error(`${name} is not set: run \`stripe projects env --pull\` (your machine) or add it to the cloud environment.`);
    process.exit(1);
  }
}

/** The owner's Clerk user id: OWNER_USER_ID if set, else the user signed in with GitHub as OWNER_GITHUB_LOGIN. */
export async function ownerUserId(): Promise<string> {
  if (process.env.OWNER_USER_ID) return process.env.OWNER_USER_ID;
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const login = process.env.OWNER_GITHUB_LOGIN!.toLowerCase();
  for (let offset = 0; ; offset += 100) {
    const { data: users } = await clerk.users.getUserList({ limit: 100, offset });
    const owner = users.find((u) => u.externalAccounts.some((a) => a.provider.includes("github") && a.username?.toLowerCase() === login));
    if (owner) return owner.id;
    if (users.length < 100) break;
  }
  console.error(`No account signed in with GitHub as ${process.env.OWNER_GITHUB_LOGIN}: sign in to the app once first.`);
  process.exit(1);
}

export const ownerContext = async () => ({ userId: await ownerUserId(), isOwner: true });
