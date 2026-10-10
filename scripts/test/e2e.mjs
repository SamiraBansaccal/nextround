#!/usr/bin/env node
// Visual check of every screen, end to end, on a DISPOSABLE Neon branch (never the live data):
//   1. branch  — a copy of the database; Neon Auth is enabled on it with email and password sign-in, for this
//                branch only (the live site has neither email nor password)
//   2. seed    — a test user, owner of this branch only, and fictional sample data (tests/e2e/fixtures.mts)
//   3. test    — Playwright starts the app on the branch, signs in, captures and measures each screen
//   4. cleanup — ALWAYS runs, even if the tests fail: deletes the branch, and with it the user and the data
//
// Usage: npm run e2e      Screenshots: e2e-screens/desktop/ and e2e-screens/mobile/
// Needs the Neon CLI signed in (`npx neon login`, or NEON_API_KEY) and NEON_PROJECT_ID (.env.local, set by Vercel).
// Prints no secret.

import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const files = {};
for (const file of [".env", ".env.local"]) if (existsSync(file)) Object.assign(files, parseEnv(readFileSync(file, "utf8")));
const project = process.env.NEON_PROJECT_ID ?? files.NEON_PROJECT_ID;
if (!project) {
  console.error("NEON_PROJECT_ID is not set: run `vercel env pull` first.");
  process.exit(1);
}

const ORIGIN = "http://localhost:3100"; // playwright.config.ts
const neonCli = (...args) =>
  spawnSync("npx", ["-y", "neon@latest", ...args, "--project-id", project], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const fail = (step, result) => {
  console.error(`${step} failed: ${(result.stderr || result.stdout || "").trim().split("\n").slice(-3).join(" ")}`);
};

const branchName = `e2e-${Date.now()}`;
let branchId = null;

function cleanup() {
  if (!branchId) return;
  const deleted = neonCli("branches", "delete", branchId);
  console.log(deleted.status === 0 ? `branch ${branchName} deleted` : `could not delete branch ${branchName}: delete it with \`npx neon branches delete ${branchId} --project-id ${project}\``);
}

function run() {
  console.log(`1/4 creating the disposable branch ${branchName}…`);
  const created = neonCli("branches", "create", "--name", branchName, "--output", "json");
  if (created.status !== 0) return fail("Creating the branch", created), 1;
  branchId = JSON.parse(created.stdout.slice(created.stdout.indexOf("{"))).branch.id;

  const enabled = neonCli("neon-auth", "enable", "--branch", branchId);
  const authUrl = enabled.stdout.match(/https:\/\/\S+neonauth\S+\/auth/)?.[0];
  if (enabled.status !== 0 || !authUrl) return fail("Enabling Neon Auth on the branch", enabled), 1;
  for (const [step, args] of [
    ["Enabling email and password on the branch", ["neon-auth", "config", "email-password", "update", "--enabled", "--branch", branchId]],
    ["Allowing localhost on the branch", ["neon-auth", "domain", "allow-localhost", "enable", "--branch", branchId]],
  ]) {
    const result = neonCli(...args);
    if (result.status !== 0) return fail(step, result), 1;
  }
  const connection = neonCli("connection-string", branchId);
  const databaseUrl = connection.stdout.match(/postgres(?:ql)?:\/\/\S+/)?.[0];
  if (connection.status !== 0 || !databaseUrl) return fail("Reading the branch's connection string", connection), 1;

  // Everything the app and the fixtures need for this branch only. The test user is the owner here because its
  // fake GitHub link carries this id; no code path of the app knows about tests.
  const branchEnv = {
    DATABASE_URL: databaseUrl,
    NEON_AUTH_BASE_URL: authUrl,
    NEON_AUTH_COOKIE_SECRET: randomBytes(32).toString("base64"),
    OWNER_GITHUB_ID: "100000000",
    E2E_GITHUB_ID: "100000000",
    E2E_ORIGIN: ORIGIN,
    E2E_PASSWORD: randomBytes(24).toString("base64url"),
  };

  console.log("2/4 seeding the test user and its sample data…");
  const seeded = spawnSync("npx", ["tsx", "--conditions=react-server", "--tsconfig", "tsconfig.json", "tests/e2e/fixtures.mts", "seed"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    env: { ...process.env, ...branchEnv },
  });
  const ids = seeded.stdout.trim().split("\n").pop();
  if (seeded.status !== 0 || !ids?.startsWith("{")) return console.error("Seeding failed."), 1;

  console.log("3/4 capturing every screen…");
  const test = spawnSync("npx", ["playwright", "test", ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, ...branchEnv, E2E_IDS: ids },
  });
  return test.status ?? 1;
}

let status = 1;
try {
  status = run();
} finally {
  console.log("4/4 cleaning up…");
  cleanup();
}
process.exit(status);
