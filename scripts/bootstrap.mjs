#!/usr/bin/env node
// Self-hosting in one command: provisions YOUR OWN stack (your Stripe account, your provider
// accounts) and deploys it. Nothing in this repository is tied to the original author's accounts.
//
// Usage:
//   npm run bootstrap -- --owner <your-github-login> [--name <project-name>] [--dry-run] [--accept-tos] [--skip-deploy]
//
// Steps (each one is skipped when already done, so the script can be re-run safely):
//   1. stripe projects init           (your Stripe account; browser sign-in the first time)
//   2. stripe projects add …          (free tiers: Vercel, Neon, Clerk, OpenRouter, Firecrawl, ElevenLabs)
//   3. stripe projects env --pull     (credentials -> .env, never committed)
//   4. scripts/setup-env.mjs          (Clerk keys, encryption key, OWNER_GITHUB_LOGIN)
//   5. drizzle-kit migrate            (creates the tables in your Neon database)
//   6. Clerk: enable GitHub sign-in   (Clerk CLI: one browser approval)
//   7. push env vars to Vercel, deploy
//
// By default every command runs interactively: each provider shows you its terms of service and
// you accept them yourself. --accept-tos passes Stripe's flag to accept them non-interactively.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync } from "node:fs";
import { parseEnv } from "node:util";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : undefined;
};

const owner = option("owner");
const name = option("name") ?? "nextround";
const dryRun = flag("dry-run");
const tos = flag("accept-tos") ? ["--accept-tos", "--yes"] : [];

if (!owner) {
  console.error("Usage: npm run bootstrap -- --owner <your-github-login> [--name <project-name>] [--dry-run] [--accept-tos] [--skip-deploy]");
  process.exit(1);
}

// The same services, names and configs as the reference deployment: env var names depend on them
// (e.g. the Neon resource "db" produces DB_CONNECTION_STRING).
const STACK = [
  { provider: "Vercel", plan: "vercel/hobby", service: "vercel/project", serviceId: "project", extra: ["--config", JSON.stringify({ name })] },
  { provider: "Neon", plan: "neon/free", service: "neon/postgres", serviceId: "postgres", extra: ["--name", "db"] },
  { provider: "Clerk", plan: "clerk/hobby", service: "clerk/auth", serviceId: "auth", extra: ["--config", JSON.stringify({ app_name: "NextRound" })] },
  { provider: "OpenRouter", plan: "openrouter/free", service: "openrouter/api", serviceId: "api", extra: [] },
  { provider: "Firecrawl", plan: "firecrawl/free", service: "firecrawl/api", serviceId: "api", extra: [] },
  { provider: "ElevenLabs", plan: null, service: "elevenlabs/tts", serviceId: "tts", extra: [] },
];

function step(title) {
  console.log(`\n▶ ${title}`);
}

/** Runs a command with the terminal attached (prompts, browser sign-ins). Exits on failure. */
function run(command, commandArgs) {
  const shown = `${command} ${commandArgs.join(" ")}`;
  console.log(`  $ ${shown}`);
  if (dryRun) return;
  const result = spawnSync(command, commandArgs, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\n✗ Failed: ${shown}\n  Fix the problem above, then re-run the script: completed steps are skipped.`);
    process.exit(1);
  }
}

function readJson(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: "utf8" });
  const out = result.stdout ?? "";
  try {
    return JSON.parse(out.slice(out.indexOf("{")));
  } catch {
    return null;
  }
}

function readEnvFile() {
  return existsSync(".env") ? parseEnv(readFileSync(".env", "utf8")) : {};
}

// 1. Stripe project ---------------------------------------------------------------------------
step("1/7 Stripe project (your Stripe account)");
if (existsSync(".projects/state.local.json")) {
  console.log("  Already initialized on this machine: skipped.");
} else {
  // A fresh clone carries the upstream project's shared state (service names only, no secrets).
  // Set it aside so that your own project starts clean; the services are added again below.
  if (existsSync(".projects/state.json") && !dryRun) renameSync(".projects/state.json", ".projects/state.upstream.json");
  run("stripe", ["projects", "init", name, ...tos]);
}

// 2. Services -------------------------------------------------------------------------------
step("2/7 Services on free tiers (your provider accounts)");
const status = readJson("stripe", ["projects", "status", "--json"]); // read-only, also in --dry-run
const existing = new Set(
  [...(status?.data?.services ?? []), ...(status?.data?.plans ?? [])].map((s) => `${s.provider}:${s.service_id}`),
);
for (const s of STACK) {
  const [, planId] = s.plan ? s.plan.split("/") : [];
  if (s.plan && !existing.has(`${s.provider}:${planId}`)) run("stripe", ["projects", "add", s.plan, ...tos]);
  if (!existing.has(`${s.provider}:${s.serviceId}`)) run("stripe", ["projects", "add", s.service, ...s.extra, ...tos]);
  else console.log(`  ${s.provider} ${s.serviceId}: already provisioned, skipped.`);
}

// 3. Credentials ----------------------------------------------------------------------------
step("3/7 Credentials -> .env (never committed)");
run("stripe", ["projects", "env", "--pull"]);

// 4. App variables ----------------------------------------------------------------------------
step("4/7 App variables (Clerk keys, encryption key, owner)");
run("node", ["scripts/setup-env.mjs", "--owner", owner]);

// 5. Database ---------------------------------------------------------------------------------
step("5/7 Database tables");
run("npx", ["drizzle-kit", "migrate"]);

// 6. GitHub sign-in on Clerk ----------------------------------------------------------------
step("6/7 Enable GitHub sign-in on your Clerk application");
const clerkApp = readEnvFile().CLERK_APPLICATION_ID;
if (!clerkApp && !dryRun) {
  console.error("  CLERK_APPLICATION_ID missing from .env: check step 3.");
  process.exit(1);
}
run("npx", ["-y", "clerk@latest", "auth", "login"]);
run("npx", [
  "-y",
  "clerk@latest",
  "config",
  "patch",
  "--app",
  clerkApp ?? "<CLERK_APPLICATION_ID>",
  "--instance",
  "dev",
  "--json",
  JSON.stringify({ connection_oauth_github: { enabled: true, authenticatable: true } }),
  "--yes",
]);

// 7. Deploy -----------------------------------------------------------------------------------
step("7/7 Production deploy on your Vercel account");
if (flag("skip-deploy")) {
  console.log("  --skip-deploy: skipped. Run `npm run dev` to try it locally.");
} else {
  run("node", ["scripts/push-env-to-vercel.mjs"]);
  run("node", ["scripts/deploy.mjs"]);
}

console.log(`\n✓ Done${dryRun ? " (dry run: nothing was executed)" : ""}. Check costs any time with: stripe projects spend`);
