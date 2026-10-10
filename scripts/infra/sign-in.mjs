#!/usr/bin/env node
// Sign-in for your deployment (Neon Auth, ADR 0028): Google and GitHub, no passwords.
//
// Usage: npm run setup:sign-in -- --site https://<your app>.vercel.app [--name <GitHub app name>] [--no-open]
//
// Each step can be run again safely:
//   1. Neon Auth accepts the sign-ins coming from your site (trusted domain);
//   2. sign-in with an email and a password is off (no password to keep); Google is on, through Neon's shared app;
//   3. GitHub. Neon lends a shared app for Google only: for GitHub, the site needs its own GitHub OAuth App, which
//      GitHub lets only a person create, on its web page. The script opens that page already filled in (name, home
//      page, and the callback address of your Neon Auth), takes the Client ID and the client secret as you copy them
//      with the page's copy buttons (macOS clipboard, emptied once the secret is taken; on other systems, you paste
//      them here), saves them in .env (never committed) and registers them in Neon Auth. Keys already in .env are
//      only registered again. --no-open when the GitHub app already exists (https://github.com/settings/developers).
//      BROWSER="Google Chrome" opens the page in that browser rather than the default one.
// Values are never printed. Needs the Neon CLI signed in (`npx neon auth`, once) and NEON_PROJECT_ID and
// NEON_AUTH_BASE_URL, set by Vercel's Neon integration (`vercel env pull`).

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

// `.env.local` (written by `vercel env pull`) first, then `.env`: as in Next.js, the first file wins.
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 ? args[i + 1] : undefined;
};
const site = option("site") ?? process.env.APP_URL;
const appName = option("name") ?? "NextRound";
const { NEON_PROJECT_ID: projectId, NEON_AUTH_BASE_URL: authBaseUrl } = process.env;

function fail(message) {
  console.error(message);
  process.exit(1);
}
if (!site?.startsWith("https://")) fail("Give your site's address: --site https://<your app>.vercel.app");
if (!projectId || !authBaseUrl) fail("NEON_PROJECT_ID or NEON_AUTH_BASE_URL is not set: run `vercel env pull` first.");

let secretToHide; // should the Neon CLI repeat the client secret in its output
function neon(...rest) {
  const result = spawnSync("npx", ["--yes", "neon@latest", "neon-auth", ...rest, "--project-id", projectId], { encoding: "utf8" });
  const hide = (text) => (secretToHide ? text.split(secretToHide).join("***") : text);
  if (result.status !== 0) fail(`Neon refused (${rest.slice(0, 2).join(" ")}): ${hide(`${result.stdout}${result.stderr}`).trim()}`);
  return hide(result.stdout);
}
const providers = () => neon("oauth-provider", "list");

// 1. Your site.
const origin = new URL(site).origin;
if (!neon("domain", "list").split("\n").some((line) => line.trim() === origin)) neon("domain", "add", origin);
console.log(`Sign-ins from ${origin} are accepted.`);

// 2. No passwords; Google.
neon("config", "email-password", "update", "--no-enabled");
if (!/^google\b/m.test(providers())) neon("oauth-provider", "add", "--provider-id", "google");
console.log("Sign-in with a password is off; Google is on.");

// 3. GitHub.
let clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
let clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  showGitHubPage();
  ({ clientId, clientSecret } = process.platform === "darwin" ? await fromClipboard() : await fromPrompt());
  saveToEnvFile({ GITHUB_OAUTH_CLIENT_ID: clientId, GITHUB_OAUTH_CLIENT_SECRET: clientSecret });
  console.log("Saved in .env.");
}
secretToHide = clientSecret;
const action = /^github\b/m.test(providers()) ? "update" : "add";
neon("oauth-provider", action, "--provider-id", "github", "--oauth-client-id", clientId, "--oauth-client-secret", clientSecret);
console.log("GitHub is on: sign-in is ready.");
if (process.platform === "darwin") notify("GitHub sign-in is ready.");

function showGitHubPage() {
  if (args.includes("--no-open")) {
    console.log(`On your GitHub app's page (https://github.com/settings/developers, then the app): copy the Client ID,
then click "Generate a new client secret" and copy the new secret.`);
    return;
  }
  const url = new URL("https://github.com/settings/applications/new");
  url.searchParams.set("oauth_application[name]", appName);
  url.searchParams.set("oauth_application[url]", site);
  url.searchParams.set("oauth_application[callback_url]", `${authBaseUrl.replace(/\/$/, "")}/callback/github`);
  if (process.platform === "darwin") {
    const browser = process.env.BROWSER;
    spawnSync("open", [...(browser ? ["-a", browser] : []), url.href], { stdio: "ignore" });
  }
  console.log(`On GitHub's page (if it did not open: ${url.href}):
  1. click "Register application", then the copy button next to the Client ID;
  2. click "Generate a new client secret", then the copy button next to the new secret.`);
}

// A GitHub OAuth App's keys: the client secret is 40 hex digits; the Client ID is shorter ("Ov23li…"; older apps:
// 20 hex digits). Found in the copied text even when it holds a little more (a label, spaces).
function findSecret(text) {
  return text.match(/\b[0-9a-f]{40}\b/)?.[0];
}
function findClientId(text) {
  return text.match(/\b(?:Ov|Iv)[0-9A-Za-z._-]{10,40}\b|\b[0-9a-f]{20}\b/)?.[0] ?? (/^[0-9A-Za-z._-]{16,64}$/.test(text) ? text : undefined);
}

/** A macOS notification, so the person sees each step without looking at the terminal. */
function notify(message) {
  spawnSync("osascript", ["-e", `display notification ${JSON.stringify(message)} with title "NextRound"`], { stdio: "ignore" });
}

/** Waits for the two keys to be copied, in either order. What was copied before the script started is not taken. */
async function fromClipboard() {
  const read = () => {
    try {
      return execFileSync("pbpaste", { encoding: "utf8" }).trim();
    } catch {
      return "";
    }
  };
  // The clipboard's change counter moves on each copy, even of the same text again; without it, a copy is noticed
  // when the copied text changes.
  const copies = () => {
    try {
      return execFileSync("osascript", ["-l", "JavaScript", "-e", 'ObjC.import("AppKit"); $.NSPasteboard.generalPasteboard.changeCount'], {
        encoding: "utf8",
      }).trim();
    } catch {
      return read();
    }
  };
  let last = copies();
  let id;
  let secret;
  const until = Date.now() + 30 * 60_000;
  console.log("Waiting for the two copies…");
  while (!id || !secret) {
    if (Date.now() > until) fail("Nothing copied in 30 minutes: run the script again.");
    await new Promise((resolve) => setTimeout(resolve, 700));
    const now = copies();
    if (now === last) continue;
    last = now;
    const text = read();
    const foundSecret = findSecret(text);
    const foundId = foundSecret ? undefined : findClientId(text);
    if (foundSecret) {
      secret = foundSecret;
      execFileSync("pbcopy", { input: "" }); // the secret does not stay in the clipboard
      last = copies();
      console.log("Client secret taken.");
      notify(id ? "Client secret taken." : "Client secret taken. Now copy the Client ID.");
    } else if (foundId) {
      id = foundId;
      console.log(`Client ID taken (${id.length} characters).`);
      notify(secret ? "Client ID taken." : "Client ID taken. Now copy the client secret.");
    } else if (text) {
      console.log(`Copied text that is neither key (${text.length} characters): ignored.`);
      notify("This copy is neither the Client ID nor the client secret.");
    }
  }
  return { clientId: id, clientSecret: secret };
}

async function fromPrompt() {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const id = findClientId((await prompt.question("Paste the Client ID: ")).trim());
  const secret = findSecret((await prompt.question("Paste the client secret: ")).trim());
  prompt.close();
  if (!id || !secret) fail("These are not a GitHub Client ID and client secret.");
  return { clientId: id, clientSecret: secret };
}

/** Sets each value in .env: replaces its line when there is one, else adds it. */
function saveToEnvFile(values) {
  let text = existsSync(".env") ? readFileSync(".env", "utf8") : "";
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const current = new RegExp(`^${key}=.*$`, "m");
    text = current.test(text) ? text.replace(current, () => line) : `${text}${text && !text.endsWith("\n") ? "\n" : ""}${line}\n`;
  }
  writeFileSync(".env", text);
}
