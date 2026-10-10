import "server-only";
import { and, eq } from "drizzle-orm";
import { pgSchema, text, uuid } from "drizzle-orm/pg-core";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { githubLoginForId } from "@/lib/profile/github";
import { serverEnv } from "@/lib/server/env";
import { neonAuth } from "@/lib/server/neon-auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Not signed in");
  }
}

/** Where a signed-in account that is not invited is sent (app/not-invited). */
export const NOT_INVITED_PATH = "/not-invited";

// Neon Auth keeps the provider accounts linked to each user (Google, GitHub) in the database's `neon_auth` schema,
// which Neon manages. Only the three columns needed to recognise a GitHub account are mapped here, never the
// tokens. This mapping lives outside lib/db/schema.ts so that our migrations never touch Neon's schema.
const linkedAccounts = pgSchema("neon_auth").table("account", {
  userId: uuid("userId").notNull(), // Neon Auth user ids are UUIDs, kept as text in our own tables
  providerId: text("providerId").notNull(),
  accountId: text("accountId").notNull(),
});

interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
}

/** The signed-in user from the server-side Neon Auth session (signed cookies), or null. Read once per request. */
const sessionUser = cache(async (): Promise<SessionUser | null> => {
  const { data } = await neonAuth().getSession();
  const user = data?.user;
  if (!user) return null;
  return { id: user.id, name: user.name || null, email: user.email, emailVerified: Boolean(user.emailVerified), image: user.image ?? null };
});

/** The numeric GitHub id of the GitHub account linked to this user (verified by GitHub through OAuth), or null. */
const linkedGithubId = cache(async (userId: string): Promise<string | null> => {
  const rows = await getDb()
    .select({ accountId: linkedAccounts.accountId })
    .from(linkedAccounts)
    .where(and(eq(linkedAccounts.userId, userId), eq(linkedAccounts.providerId, "github")))
    .limit(1);
  return rows[0]?.accountId ?? null;
});

export interface Access {
  user: SessionUser;
  githubId: string | null;
  isOwner: boolean;
  /** May use the app: for now the owner only (ADR 0028); invitations come back with Resend. */
  allowed: boolean;
}

/** The signed-in account and whether it may use the app; null when nobody is signed in. Computed once per request. */
export const getAccess = cache(async (): Promise<Access | null> => {
  const user = await sessionUser();
  if (!user) return null;
  const githubId = await linkedGithubId(user.id);
  // The owner is the account linked to the GitHub account OWNER_GITHUB_ID (numeric, stable): nothing about the
  // owner is written in the code, and another deployment has another owner. Missing = nobody (fail closed).
  const ownerId = serverEnv().OWNER_GITHUB_ID;
  const isOwner = !!ownerId && githubId === ownerId;
  return { user, githubId, isOwner, allowed: isOwner };
});

/** The session's access, for code that serves data: signed out throws, not invited goes to the not-invited page. */
async function requireAccess(): Promise<Access> {
  const access = await getAccess();
  if (!access) throw new UnauthorizedError();
  if (!access.allowed) redirect(NOT_INVITED_PATH);
  return access;
}

/**
 * The ONLY way server code gets a user id: from the server-side Neon Auth session, for an account that may use
 * the app. Never accept a user id from the client (form field, URL, body).
 */
export async function requireUserId(): Promise<string> {
  return (await requireAccess()).user.id;
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
  const { user, githubId, isOwner } = await requireAccess();
  const githubLogin = githubId ? await githubLoginForId(githubId) : null;
  const firstName = user.name?.trim().split(/\s+/)[0] || null;
  return {
    userId: user.id,
    displayName: firstName ?? githubLogin ?? user.email ?? "there",
    githubLogin,
    imageUrl: user.image,
    fullName: user.name ?? githubLogin ?? "Candidate",
    // The owner may use the instance's keys; every other account brings its own.
    isOwner,
  };
}
