// Opens or closes sign-up on the Clerk instance, and shows the current state.
//
// Usage: npm run clerk:signup -- status | close | open | probe | allow <email> | disallow <email>
//   status    is sign-up open? which addresses are allowed?
//   close     turns the allowlist on, with the owner's verified email addresses only (her account is found
//             through OWNER_GITHUB_ID). Existing accounts keep signing in; any new account is refused.
//   open      turns the allowlist off: anyone can sign up again.
//   allow     invites one person: their email address joins the allowlist, so they can create an account
//             (with the GitHub or Google account that uses that address). Sign-up stays closed to others.
//   disallow  takes an address off the allowlist (an account already created stays: delete it in Clerk).
//   probe   tries to sign up a throwaway "+clerk_test" address through the Frontend API, as a stranger
//           would, and says whether Clerk refused it (nothing is created when it is refused). A testing
//           token gets past the bot protection (captcha) only, so what answers is the allowlist.
//
// Restrictions are free on a Clerk development instance (a paid feature on a production one). The e2e
// tests are not affected: their test user is created through the Backend API, not by signing up.
// Loads .env.local and .env when present; prints no secret, and masks email addresses.
import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createClerkClient } from "@clerk/backend";

// `.env.local` (written by `vercel env pull`) first, then `.env`: as in Next.js, the first file wins.
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);
for (const name of ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "OWNER_GITHUB_ID"]) {
  if (!process.env[name]) {
    console.error(`${name} is not set: run \`vercel env pull\` (your machine) or add it to the cloud environment.`);
    process.exit(1);
  }
}

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const mask = (address: string) => address.replace(/^(.)[^@]*(@.*)$/, "$1•••$2");

async function allowlisted(): Promise<{ id: string; identifier: string }[]> {
  return (await clerk.allowlistIdentifiers.getAllowlistIdentifierList()).data;
}

/** The owner's verified email addresses, from her Clerk account (the one linked to GitHub id OWNER_GITHUB_ID). */
async function ownerAddresses(): Promise<string[]> {
  for (let offset = 0; ; offset += 100) {
    const { data: users } = await clerk.users.getUserList({ limit: 100, offset });
    const owner = users.find((u) => u.externalAccounts.some((a) => a.provider.includes("github") && a.providerUserId === process.env.OWNER_GITHUB_ID));
    if (owner) return owner.emailAddresses.filter((e) => e.verification?.status === "verified").map((e) => e.emailAddress);
    if (users.length < 100) return [];
  }
}

async function status() {
  const instance = (await (await fetch("https://api.clerk.com/v1/instance", { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } })).json()) as {
    environment_type?: string;
  };
  const list = await allowlisted();
  // The Backend API has no "read restrictions" call: an allowlist with entries is how `close` leaves it.
  console.log(`Instance: ${instance.environment_type ?? "?"}. Allowlist: ${list.length ? list.map((e) => mask(e.identifier)).join(", ") : "empty"}.`);
  console.log("Run `probe` to check that a stranger is refused.");
}

async function close() {
  const addresses = await ownerAddresses();
  if (addresses.length === 0) {
    console.error("The owner's account (OWNER_GITHUB_ID) was not found or has no verified address: nothing changed.");
    process.exit(1);
  }
  const existing = new Set((await allowlisted()).map((e) => e.identifier.toLowerCase()));
  for (const identifier of addresses) {
    if (existing.has(identifier.toLowerCase())) continue;
    await clerk.allowlistIdentifiers.createAllowlistIdentifier({ identifier, notify: false });
    console.log(`Allowed: ${mask(identifier)}`);
  }
  await clerk.instance.updateRestrictions({ allowlist: true });
  console.log("Sign-up closed: only the allowlist above may create an account.");
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The email address given after the command, or exits with the usage. */
function emailArgument(): string {
  const email = (process.argv[3] ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) {
    console.error("Give an email address: npm run clerk:signup -- allow friend@example.com");
    process.exit(1);
  }
  return email;
}

async function allow() {
  const email = emailArgument();
  if ((await allowlisted()).some((e) => e.identifier.toLowerCase() === email)) return console.log(`${mask(email)} is already invited.`);
  await clerk.allowlistIdentifiers.createAllowlistIdentifier({ identifier: email, notify: false });
  console.log(`Invited: ${mask(email)}. They can now sign up with the GitHub or Google account that uses this address.`);
}

async function disallow() {
  const email = emailArgument();
  const entry = (await allowlisted()).find((e) => e.identifier.toLowerCase() === email);
  if (!entry) return console.log(`${mask(email)} was not on the allowlist.`);
  await clerk.allowlistIdentifiers.deleteAllowlistIdentifier(entry.id);
  console.log(`Removed from the allowlist: ${mask(email)}. An account they already created still exists.`);
}

async function open() {
  await clerk.instance.updateRestrictions({ allowlist: false });
  console.log("Sign-up open: anyone can create an account.");
}

/** Signs up a throwaway test address through the Frontend API, like a stranger's browser would. */
async function probe() {
  // pk_test_<base64 of "<frontend api host>$">
  const host = Buffer.from(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!.split("_")[2], "base64").toString().replace(/\$$/, "");
  const devBrowser = await fetch(`https://${host}/v1/dev_browser`, { method: "POST" });
  const { token } = (await devBrowser.json()) as { token?: string };
  if (!token) throw new Error(`No development browser token (HTTP ${devBrowser.status}).`);
  const testing = await clerk.testingTokens.createTestingToken();
  const address = `probe-${randomBytes(4).toString("hex")}+clerk_test@example.com`;
  const query = new URLSearchParams({ __clerk_db_jwt: token, __clerk_testing_token: testing.token });
  const response = await fetch(`https://${host}/v1/client/sign_ups?${query}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email_address: address }),
  });
  const body = (await response.json()) as { errors?: { code: string; message: string }[] };
  const error = body.errors?.[0];
  if (error) console.log(`Refused (HTTP ${response.status}, ${error.code}): ${error.message}`);
  else console.log(`ALLOWED (HTTP ${response.status}): a stranger could start a sign-up. Run \`close\`.`);
}

const commands: Record<string, () => Promise<void>> = { status, close, open, probe, allow, disallow };
const command = commands[process.argv[2] ?? ""];
if (!command) {
  console.error("Usage: npm run clerk:signup -- status | close | open | probe | allow <email> | disallow <email>");
  process.exit(1);
}
await command();
