"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { accessRequestMail, sendMail } from "@/lib/access/notify";
import { accessRequestSchema } from "@/lib/access/request-form";
import { type AccessRequestOutcome, recordAccessRequest } from "@/lib/access/requests";
import { consumeInstanceQuota } from "@/lib/ai/usage";
import { ownerContact } from "@/lib/server/owner";

// The public "Request access" form (home and sign-up pages). There is no session here: the input is
// validated, each visitor may send 3 requests a day, and the emails to the owner are capped at 20 a day.
// The text is in English, like the other public pages.

export type RequestAccessResult = { ok: true; message: string } | { ok: false; error: string };

const MESSAGES: Record<AccessRequestOutcome, string> = {
  received: "Request sent. The owner of this site will see it; if they allow it, you will get an invitation by email.",
  already_requested: "Your request is already waiting for an answer.",
  already_allowed: "This address is already invited: sign in with the GitHub or Google account that uses it.",
};

export async function requestAccessAction(input: unknown): Promise<RequestAccessResult> {
  const parsed = accessRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };
  if (parsed.data.website) return { ok: true, message: MESSAGES.received }; // a robot filled the hidden field
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const visitor = `visitor:${createHash("sha256").update(ip).digest("hex").slice(0, 16)}`;
  try {
    await consumeInstanceQuota(visitor, "access_request");
  } catch {
    return { ok: false, error: "Too many requests from this connection today. Try again tomorrow." };
  }
  let outcome: AccessRequestOutcome;
  try {
    outcome = await recordAccessRequest(parsed.data.email);
  } catch {
    return { ok: false, error: "The request could not be sent. Try again later." };
  }
  if (outcome === "received") {
    const owner = await ownerContact().catch(() => null);
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (owner && host) {
      const appUrl = `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
      // Over the daily cap, no email: the request still waits in the owner's Settings.
      await consumeInstanceQuota("instance", "access_mail").then(
        () => sendMail(owner.email, accessRequestMail(parsed.data, appUrl)),
        () => false,
      );
    }
  }
  return { ok: true, message: MESSAGES[outcome] };
}
