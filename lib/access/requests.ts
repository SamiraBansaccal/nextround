import "server-only";
import { clerkClient } from "@clerk/nextjs/server";

// Asking for access to an invite-only instance (ADR 0026). The request is kept in Clerk's waitlist (only
// the email address), the owner is told by email (lib/access/notify.ts), and answers in Settings: allowing
// adds the address to the allowlist and Clerk emails the person an invitation; declining closes it.

export type AccessRequestOutcome = "received" | "already_requested" | "already_allowed";

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Records a request in Clerk's waitlist, unless the address is already invited or already waiting. */
export async function recordAccessRequest(email: string): Promise<AccessRequestOutcome> {
  const clerk = await clerkClient();
  const allowed = await clerk.allowlistIdentifiers.getAllowlistIdentifierList();
  if (allowed.data.some((e) => same(e.identifier, email))) return "already_allowed";
  const { data: existing } = await clerk.waitlistEntries.list({ query: email });
  if (existing.some((e) => same(e.emailAddress, email))) return "already_requested";
  // notify: false: Clerk emails nothing to an address typed by a stranger; the person hears back when allowed.
  await clerk.waitlistEntries.create({ emailAddress: email, notify: false });
  return "received";
}

export interface PendingRequest {
  id: string;
  email: string;
  createdAt: number;
}

/** The requests still waiting for an answer, newest first. */
export async function listPendingRequests(): Promise<PendingRequest[]> {
  const clerk = await clerkClient();
  const { data } = await clerk.waitlistEntries.list({ status: "pending", limit: 100 });
  return data.map((e) => ({ id: e.id, email: e.emailAddress, createdAt: e.createdAt }));
}

/** Allows a request: the address joins the allowlist (sign-in with GitHub or Google works) and Clerk emails an invitation. */
export async function allowRequest(id: string): Promise<string | null> {
  const clerk = await clerkClient();
  const { data } = await clerk.waitlistEntries.list({ query: id, limit: 1 });
  const entry = data.find((e) => e.id === id);
  if (!entry) return null;
  await allowAddress(entry.emailAddress);
  await clerk.waitlistEntries.invite(id, { ignoreExisting: true });
  return entry.emailAddress;
}

/** Declines a request; the person is not told by NextRound. */
export async function declineRequest(id: string): Promise<boolean> {
  const clerk = await clerkClient();
  const { data } = await clerk.waitlistEntries.list({ query: id, limit: 1 });
  if (!data.some((e) => e.id === id)) return false;
  await clerk.waitlistEntries.reject(id);
  return true;
}

export interface AllowedAddress {
  id: string;
  email: string;
}

/** Who may create an account (the allowlist). */
export async function listAllowedAddresses(): Promise<AllowedAddress[]> {
  const clerk = await clerkClient();
  const { data } = await clerk.allowlistIdentifiers.getAllowlistIdentifierList();
  return data.map((e) => ({ id: e.id, email: e.identifier }));
}

/** Adds an address to the allowlist (no email from Clerk: the invitation sends one). */
export async function allowAddress(email: string): Promise<void> {
  const clerk = await clerkClient();
  const { data } = await clerk.allowlistIdentifiers.getAllowlistIdentifierList();
  if (!data.some((e) => same(e.identifier, email))) await clerk.allowlistIdentifiers.createAllowlistIdentifier({ identifier: email, notify: false });
}

/** Takes an address off the allowlist; an account already created stays. */
export async function removeAllowedAddress(id: string): Promise<boolean> {
  const clerk = await clerkClient();
  const { data } = await clerk.allowlistIdentifiers.getAllowlistIdentifierList();
  if (!data.some((e) => e.id === id)) return false;
  await clerk.allowlistIdentifiers.deleteAllowlistIdentifier(id);
  return true;
}
