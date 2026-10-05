import "server-only";
import { serverEnv } from "@/lib/server/env";

// The email that tells the instance's owner about a new access request, sent with Resend (free plan) when a
// key is set. Without one, requests still reach the owner's Settings: only the email is missing.
// The text is plain (no HTML), since the name and the message come from a stranger.

export interface AccessMail {
  subject: string;
  text: string;
}

/** The email to the owner, in English then French. Pure (tests/access/access-requests.test.ts). */
export function accessRequestMail(request: { email: string; name: string; message: string }, appUrl: string): AccessMail {
  const who = request.name ? `${request.name} (${request.email})` : request.email;
  const lines = [
    `${who} asks for access to NextRound.`,
    "",
    `Email: ${request.email}`,
    ...(request.name ? [`Name: ${request.name}`] : []),
    ...(request.message ? [`Message: ${request.message}`] : []),
    "",
    `To answer: Settings, "Access requests", on ${appUrl}/settings`,
    `(or in a terminal: npm run clerk:signup -- allow ${request.email})`,
    "",
    "—",
    `${who} demande l'accès à NextRound. Pour répondre : Réglages, « Demandes d'accès », sur ${appUrl}/settings.`,
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
