#!/usr/bin/env node
// Visual check of every screen, end to end:
//   1. seed   — creates the Clerk TEST user (+clerk_test address) and fictional sample data for it
//   2. test   — Playwright starts the app, signs in as that user, captures and measures each screen
//   3. cleanup — ALWAYS runs, even if the tests fail: deletes the user's rows and the Clerk user
//
// Usage: npm run e2e      Screenshots: e2e-screens/desktop/ and e2e-screens/mobile/

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

// The Clerk testing helpers need the Clerk keys; they are passed through the environment only.
const dotenv = parseEnv(readFileSync(".env", "utf8"));
const clerkEnv = { CLERK_SECRET_KEY: dotenv.CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: dotenv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY };

const tsx = (command) =>
  spawnSync("npx", ["tsx", "--conditions=react-server", "--tsconfig", "tsconfig.json", "tests/e2e/fixtures.mts", command], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });

console.log("1/3 seeding the test user…");
const seeded = tsx("seed");
const ids = seeded.stdout.trim().split("\n").pop();
if (seeded.status !== 0 || !ids?.startsWith("{")) {
  console.error("Seeding failed.");
  tsx("cleanup");
  process.exit(1);
}

console.log("2/3 capturing every screen…");
const test = spawnSync("npx", ["playwright", "test", ...process.argv.slice(2)], { stdio: "inherit", env: { ...process.env, ...clerkEnv, E2E_IDS: ids } });

console.log("3/3 cleaning up…");
const cleaned = tsx("cleanup");
console.log(cleaned.stdout.trim());
process.exit(test.status ?? 1);
