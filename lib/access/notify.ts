import "server-only";
import { serverEnv } from "@/lib/server/env";

// Kept ready for the invitations, which come back with Resend after the switch to Neon Auth (ADR 0028): not used
// by any page until then; its texts will be updated then.
// The email that tells the instance's owner about a new access request, sent with Resend (free plan) when a
// key is set. Without one, requests still reach the owner's Settings: only the email is missing.
// The text is plain (no HTML), since the name and the message come from a stranger.

export interface AccessMail {
  subject: string;
  text: string;
}

/**
 * The site's public address, from the configuration only (APP_URL, else Vercel's production domain): a link
 * built from the request's Host header could be forged by the visitor. Null when neither is set.
 */
export function appUrl(): string | null {
  const env = serverEnv();
  if (env.APP_URL) return env.APP_URL.replace(/\/+$/, "");
  return env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : null;
}

/** The email to the owner, in English then French. Pure (tests/access/access-requests.test.ts). */
export function accessRequestMail(request: { email: string; name: string; message: string }, appUrl: string | null): AccessMail {
  const settings = appUrl ? ` on ${appUrl}/settings` : "";
  const reglages = appUrl ? ` sur ${appUrl}/settings` : "";
  const who = request.name ? `${request.name} (${request.email})` : request.email;
  const lines = [
    `${who} asks for access to NextRound.`,
    "",
    `Email: ${request.email}`,
    ...(request.name ? [`Name: ${request.name}`] : []),
    ...(request.message ? [`Message: ${request.message}`] : []),
    "",
    `To answer: Settings, "Access requests"${settings}`,
    `(or in a terminal: npm run clerk:signup -- allow ${request.email})`,
    "",
    "—",
    `${who} demande l'accès à NextRound. Pour répondre : Réglages, « Demandes d'accès »${reglages}.`,
  ];
  return { subject: `NextRound: access request from ${request.email}`, text: lines.join("\n") };
}

export function mailConfigured(): boolean {
  return Boolean(serverEnv().RESEND_API_KEY);
}

/** Sends the email with Resend; false when no key is set or Resend refuses it (never throws). */
export async function sendMail(to: string, mail: AccessMail): Promise<boolean> {
  const env = serverEnv();
  if (!env.RESEND_API_KEY) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.ACCESS_MAIL_FROM ?? "NextRound <onboarding@resend.dev>", to: [to], subject: mail.subject, text: mail.text }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
