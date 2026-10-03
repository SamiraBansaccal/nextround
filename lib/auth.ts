import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { serverEnv } from "@/lib/env";

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
}

/** The signed-in account: name, GitHub username (from the GitHub account linked through OAuth) and owner flag. */
export async function getAccount(): Promise<Account> {
  const user = await currentUser();
  if (!user) throw new UnauthorizedError();
  const github = user.externalAccounts.find((a) => a.provider === "oauth_github" || a.provider === "github");
  const githubLogin = github?.username ?? null;
  return {
    userId: user.id,
    displayName: user.firstName ?? githubLogin ?? user.primaryEmailAddress?.emailAddress ?? "there",
    githubLogin,
    // The owner (OWNER_GITHUB_LOGIN) may use the instance's AI keys; other users bring their own.
    isOwner: githubLogin !== null && githubLogin.toLowerCase() === serverEnv().OWNER_GITHUB_LOGIN.toLowerCase(),
  };
}
