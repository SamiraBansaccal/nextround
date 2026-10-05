// The Vercel credentials from .env (provided by Stripe Projects), shared by deploy.mjs and
// push-env-to-vercel.mjs. The token issued by Stripe Projects expires after a while: when Vercel refuses
// it, this asks Stripe Projects for fresh credentials (`stripe projects rotate <vercel project>` then
// `stripe projects env --pull`, the documented fix for stale credentials) and reads .env again.
// Values are never printed.

import { execFileSync } from "node:child_process";
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

/** The whole .env, with a Vercel token that works (renewed when needed). Exits with a message otherwise. */
export async function envWithFreshVercelToken() {
  let env = readEnv();
  for (const key of ["VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"]) {
    if (!env[key]) {
      console.error(`${key} missing from .env. Run \`stripe projects env --pull\` first.`);
      process.exit(1);
    }
  }
  if (await tokenWorks(env.VERCEL_TOKEN)) return env;
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
  return env;
}
