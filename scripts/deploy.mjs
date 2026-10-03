#!/usr/bin/env node
// Production deploy from this machine with the Vercel CLI.
//
// Usage: node scripts/deploy.mjs
//
// The Vercel token and project ids come from .env (provided by Stripe Projects) and are
// passed to the CLI through environment variables only: never as command-line arguments,
// which would expose them in the process list. Files listed in .vercelignore are not uploaded.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const env = parseEnv(readFileSync(".env", "utf8"));
for (const key of ["VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"]) {
  if (!env[key]) {
    console.error(`${key} missing from .env. Run \`stripe projects env --pull\` first.`);
    process.exit(1);
  }
}

const result = spawnSync("npx", ["-y", "vercel@latest", "deploy", "--prod", "--yes"], {
  stdio: "inherit",
  env: {
    ...process.env,
    VERCEL_TOKEN: env.VERCEL_TOKEN,
    VERCEL_ORG_ID: env.VERCEL_ORG_ID,
    VERCEL_PROJECT_ID: env.VERCEL_PROJECT_ID,
  },
});
process.exit(result.status ?? 1);
