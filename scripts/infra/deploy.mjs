#!/usr/bin/env node
// Production deploy from this machine with the Vercel CLI.
//
// Usage: node scripts/infra/deploy.mjs
//
// First applies the pending database migrations (`npm run db:migrate`, idempotent), so the code that goes
// online never meets a database that is behind it. A failed migration stops the deploy.
//
// The Vercel token and project ids come from .env (provided by Stripe Projects) and are passed to
// the CLI through environment variables only: never as command-line arguments, which would expose
// them in the process list. Files listed in .vercelignore are not uploaded.
//
// The token issued by Stripe Projects expires after a while: it is renewed first when needed
// (scripts/infra/vercel-env.mjs).

import { spawnSync } from "node:child_process";
import { envWithFreshVercelToken } from "./vercel-env.mjs";

const env = await envWithFreshVercelToken();

console.log("Applying the database migrations…");
const migrate = spawnSync("npm", ["run", "db:migrate"], { stdio: "inherit" });
if (migrate.status !== 0) {
  console.error("The migrations failed: nothing was deployed.");
  process.exit(migrate.status ?? 1);
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
