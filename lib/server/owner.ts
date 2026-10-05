import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { serverEnv } from "@/lib/server/env";

// Who owns this instance, for server code only: the Clerk account linked to the GitHub account
// OWNER_GITHUB_ID, the same rule as lib/server/auth.ts. Nothing about the owner is written in the code:
// another deployment, with another OWNER_GITHUB_ID, has another owner.

export interface OwnerContact {
  userId: string;
  email: string;
}

const TEN_MINUTES = 10 * 60_000;
let cached: { at: number; contact: OwnerContact | null } | undefined;

/** The owner's account and verified email address, looked up in Clerk (kept ten minutes); null when there is none. */
export async function ownerContact(): Promise<OwnerContact | null> {
  if (cached && Date.now() - cached.at < TEN_MINUTES) return cached.contact;
  const githubId = serverEnv().OWNER_GITHUB_ID;
  let contact: OwnerContact | null = null;
  if (githubId) {
    const clerk = await clerkClient();
    for (let offset = 0; ; offset += 100) {
      const { data: users } = await clerk.users.getUserList({ limit: 100, offset });
      const owner = users.find((u) => u.externalAccounts.some((a) => a.provider.includes("github") && a.providerUserId === githubId));
      if (owner) {
        const email = owner.primaryEmailAddress?.emailAddress ?? owner.emailAddresses.find((e) => e.verification?.status === "verified")?.emailAddress;
        if (email) contact = { userId: owner.id, email };
        break;
      }
      if (users.length < 100) break;
    }
  }
  cached = { at: Date.now(), contact };
  return contact;
}
