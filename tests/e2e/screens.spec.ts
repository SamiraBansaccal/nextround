import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, type Page, test } from "@playwright/test";

// Captures every screen and MEASURES what the eye misses: horizontal overflow, missing title,
// console errors. Screenshots go to e2e-screens/<project>/ (git-ignored) to be reviewed.
// Run with `npm run e2e` (scripts/e2e.mjs), never directly: it seeds and cleans the test user.

const E2E_EMAIL = "nextround-e2e+clerk_test@example.com";
const ids = JSON.parse(process.env.E2E_IDS ?? "{}") as { offerId?: string; interviewId?: string };

test.beforeAll(async () => {
  await clerkSetup();
});

async function check(page: Page, name: string, projectName: string, theme: "light" | "dark" = "light") {
  if (theme === "dark") {
    await page.evaluate(() => document.documentElement.classList.add("dark"));
  }
  await page.waitForLoadState("networkidle");
  // Measured, not eyeballed: the page must never scroll sideways.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `${name}: horizontal overflow of ${overflow}px`).toBeLessThanOrEqual(0);
  await expect(page.locator("h1").first(), `${name}: page title`).toBeVisible();
  await page.screenshot({ path: `e2e-screens/${projectName}/${name}${theme === "dark" ? "-dark" : ""}.png`, fullPage: true });
}

test("landing page (signed out)", async ({ page }, info) => {
  await page.goto("/");
  await check(page, "00-landing", info.project.name);
});

test("every signed-in screen", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("Clerk")) errors.push(msg.text());
  });

  await page.goto("/");
  await clerk.signIn({ page, emailAddress: E2E_EMAIL });

  const screens: [string, string][] = [
    ["01-dashboard", "/dashboard"],
    ["02-profile", "/profile"],
    ["03-offers", "/offers"],
    ["04-offer", `/offers/${ids.offerId}`],
    ["05-cv", `/offers/${ids.offerId}/cv`],
    ["06-interviews", "/interview"],
    ["07-interview-call", `/interview/${ids.interviewId}`],
    ["08-interview-summary", `/interview/${ids.interviewId}/summary`],
    ["09-settings", "/settings"],
  ];
  for (const [name, path] of screens) {
    await page.goto(path);
    await check(page, name, info.project.name);
  }
  // Dark mode on the two richest screens.
  for (const [name, path] of [["04-offer", `/offers/${ids.offerId}`], ["07-interview-call", `/interview/${ids.interviewId}`]] as const) {
    await page.goto(path);
    await check(page, name, info.project.name, "dark");
  }
  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
