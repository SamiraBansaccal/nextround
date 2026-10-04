import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { serverEnv } from "@/lib/server/env";

export class UnauthorizedError extends Error {
  constructor() {
    super("Not signed in");
  }
}

/**
 * The ONLY way server code gets a user id: from the server-side Clerk session.
 * Never accept a user id from the client (form field, URL, body).
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();
  return userId;
}

export interface Account {
  userId: string;
  displayName: string;
  githubLogin: string | null;
  isOwner: boolean;
  imageUrl: string | null;
  fullName: string;
}

/** The signed-in account: name, GitHub username (from the GitHub account linked through OAuth) and owner flag. */
export async function getAccount(): Promise<Account> {
  const user = await currentUser();
  if (!user) throw new UnauthorizedError();
  const github = user.externalAccounts.find((a) => a.provider === "oauth_github" || a.provider === "github");
  const githubLogin = github?.username ?? null;
  const ownerId = serverEnv().OWNER_GITHUB_ID;
  return {
    userId: user.id,
    displayName: user.firstName ?? githubLogin ?? user.primaryEmailAddress?.emailAddress ?? "there",
    githubLogin,
    imageUrl: user.imageUrl ?? null,
    fullName: user.fullName ?? user.firstName ?? githubLogin ?? "Candidate",
    // The owner (numeric GitHub id OWNER_GITHUB_ID, verified by GitHub through OAuth) may use the instance's
    // keys; every other account brings its own.
    isOwner: !!ownerId && github?.providerUserId === ownerId,
  };
}
