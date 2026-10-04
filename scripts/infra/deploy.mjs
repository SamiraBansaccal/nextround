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
// The token issued by Stripe Projects expires after a while. If Vercel refuses it, the script asks
// Stripe Projects for fresh credentials (`stripe projects rotate <vercel project>` then
// `stripe projects env --pull`, the documented fix for stale credentials) and continues.

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const readEnv = () => parseEnv(readFileSync(".env", "utf8"));

async function tokenWorks(token) {
  try {
    const response = await fetch("https://api.vercel.com/v2/user", { headers: { Authorization: `Bearer ${token}` } });
    return response.ok;
  } catch {
    return false;
  }
}

/** Name of the Vercel project resource in Stripe Projects (from `stripe projects status`). */
function vercelResourceName() {
  const out = execFileSync("stripe", ["projects", "status", "--json"], { encoding: "utf8" });
  const status = JSON.parse(out.slice(out.indexOf("{")));
  return status.data.services.find((s) => s.provider === "Vercel" && s.service_id === "project")?.name;
}

let env = readEnv();
for (const key of ["VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"]) {
  if (!env[key]) {
    console.error(`${key} missing from .env. Run \`stripe projects env --pull\` first.`);
    process.exit(1);
  }
}

if (!(await tokenWorks(env.VERCEL_TOKEN))) {
  const resource = vercelResourceName();
  if (!resource) {
    console.error("The Vercel token was refused and no Vercel project was found in Stripe Projects.");
    process.exit(1);
  }
  console.log(`The Vercel token expired: rotating the credentials of "${resource}" with Stripe Projects…`);
  execFileSync("stripe", ["projects", "rotate", resource, "--json", "--yes"], { stdio: ["ignore", "ignore", "inherit"] });
  execFileSync("stripe", ["projects", "env", "--pull"], { stdio: ["ignore", "ignore", "inherit"] });
  env = readEnv();
  if (!(await tokenWorks(env.VERCEL_TOKEN))) {
    console.error("The new Vercel token is still refused. Check `stripe projects status`.");
    process.exit(1);
  }
  console.log("Fresh Vercel token in .env.");
}

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
