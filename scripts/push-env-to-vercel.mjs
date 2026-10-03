#!/usr/bin/env node
// Copies the app's runtime environment variables from the local .env (written by
// `stripe projects env --pull` and scripts/setup-env.mjs) to the Vercel project,
// for the production and preview environments. Stripe Projects does not do this step.
//
// Usage: node scripts/push-env-to-vercel.mjs
//
// Uses VERCEL_TOKEN / VERCEL_ORG_ID / VERCEL_PROJECT_ID from .env (provided by Stripe Projects).
// Only the variables listed below are sent (never the Vercel token itself). Values are never printed.

import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const KEYS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DB_CONNECTION_STRING",
  "APP_ENCRYPTION_KEY",
  "OWNER_GITHUB_LOGIN",
  "OPENROUTER_API_API_KEY",
  "FIRECRAWL_API_API_KEY",
  "ELEVENLABS_API_KEY",
];

const env = parseEnv(readFileSync(".env", "utf8"));
const { VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID } = env;
if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
  console.error("VERCEL_TOKEN / VERCEL_PROJECT_ID missing from .env. Run `stripe projects env --pull` first.");
  process.exit(1);
}

const team = VERCEL_ORG_ID ? `&teamId=${encodeURIComponent(VERCEL_ORG_ID)}` : "";
const url = `https://api.vercel.com/v10/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}/env?upsert=true${team}`;

let failed = false;
for (const key of KEYS) {
  const value = env[key];
  if (!value) {
    console.log(`${key}: skipped (not in .env)`);
    continue;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ key, value, type: "encrypted", target: ["production", "preview"] }),
  });
  console.log(`${key}: ${response.ok ? "pushed" : `FAILED (HTTP ${response.status})`}`);
  if (!response.ok) failed = true;
}
process.exit(failed ? 1 : 0);
