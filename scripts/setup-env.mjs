#!/usr/bin/env node
// Creates the app's own environment variables as Stripe Projects "project variables"
// (stored in the Stripe secret store, then written to .env by the CLI).
//
// Usage: node scripts/setup-env.mjs --owner <github-login>
//
// - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY: copied from the
//   "development" entry of CLERK_ENVIRONMENTS (the JSON that Stripe Projects
//   writes for Clerk), because the Clerk SDK expects these exact names.
// - APP_ENCRYPTION_KEY: 32 random bytes (base64), created ONLY if missing.
//   Never rotate it by accident: stored user AI keys could no longer be decrypted.
// - OWNER_GITHUB_LOGIN: the GitHub username of the instance owner.
//
// Secret values are never printed.

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const ownerIndex = process.argv.indexOf("--owner");
const owner = ownerIndex > -1 ? process.argv[ownerIndex + 1] : undefined;
if (!owner) {
  console.error("Usage: node scripts/setup-env.mjs --owner <github-login>");
  process.exit(1);
}

const env = parseEnv(readFileSync(".env", "utf8"));

let clerkDev;
try {
  clerkDev = JSON.parse(env.CLERK_ENVIRONMENTS ?? "").development;
} catch {
  // handled below
}
if (!clerkDev?.publishable_key || !clerkDev?.secret_key) {
  console.error("CLERK_ENVIRONMENTS not found in .env. Run `stripe projects env --pull` first.");
  process.exit(1);
}

const variables = [
  ["clerk-publishable-key", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", clerkDev.publishable_key],
  ["clerk-secret-key", "CLERK_SECRET_KEY", clerkDev.secret_key],
  ["owner-github-login", "OWNER_GITHUB_LOGIN", owner],
];
if (!env.APP_ENCRYPTION_KEY) {
  variables.push(["app-encryption-key", "APP_ENCRYPTION_KEY", randomBytes(32).toString("base64")]);
} else {
  console.log("APP_ENCRYPTION_KEY already exists: kept as is.");
}

for (const [name, envKey, value] of variables) {
  // execFileSync passes arguments directly (no shell): nothing ends up in shell history.
  let ok = false;
  try {
    const out = execFileSync(
      "stripe",
      ["projects", "variables", "set", name, "--env-key", envKey, "--value", value, "--json", "--yes"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    ok = JSON.parse(out.slice(out.indexOf("{"))).ok === true;
  } catch {
    // Node's error message would contain the full command line, including the value: never print it.
  }
  console.log(`${envKey}: ${ok ? "set" : "FAILED"}`);
  if (!ok) process.exit(1);
}
