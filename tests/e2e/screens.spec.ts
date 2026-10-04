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
  // Before the call: "Ready to join?". The offer is in French, so the screen starts in French.
  await page.goto(`/interview/new?offer=${ids.offerId}`);
  await expect(page.getByRole("heading", { level: 1, name: "Tout est prêt pour l'appel ?" })).toBeVisible();
  await expect(page.locator("video").first()).toBeVisible(); // the (fake) camera preview
  await expect(page.getByRole("meter", { name: "Micro" })).toBeVisible();
  // Switching the language switches the whole screen.
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Ready to join?" })).toBeVisible();
  await expect(page.getByText("The whole interview will be in English")).toBeVisible();
  // Questions: technical only.
  await page.getByRole("button", { name: /^Technical/ }).click();
  await expect(page.getByRole("button", { name: /^Technical/ })).toHaveAttribute("aria-pressed", "true");
  // The interviewer, chosen in the side panel; the style is visible before joining.
  await page.getByRole("button", { name: "Change" }).click();
  await page.getByRole("button", { name: /The Simpsons/ }).click();
  await page.getByRole("button", { name: /^Mr\. Burns/ } /* not its "Hide Mr. Burns" button */).click();
  await expect(page.locator("#setup-interviewer")).toHaveText("Mr. Burns");
  await expect(page.getByText("Cold, formal and extremely demanding").first()).toBeVisible();
  // Real microphone switch.
  await page.getByRole("button", { name: "Mute" }).click();
  await expect(page.getByText("Your microphone is muted.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start interview" })).toBeEnabled();
  await check(page, "06b-ready-to-join", info.project.name);

  // The call (a French session with M. Burns): everything in French.
  await page.goto(`/interview/${ids.interviewId}`);
  await expect(page.getByRole("heading", { level: 1, name: "Entretien avec M. Burns" })).toBeVisible();
  const panel = page.locator("aside", { has: page.locator("#question-heading") });
  await expect(panel.locator("#question-heading")).toHaveText("Question 1 / 5");
  await expect(panel.getByRole("heading", { level: 2 })).toHaveText("Pouvez-vous vous présenter brièvement ?");
  await expect(panel.getByText("Présentation").first()).toBeVisible();
  await page.getByRole("textbox", { name: "Ta réponse" }).fill("Je suis développeuse junior.");
  await expect(page.getByText("/3000")).toContainText("28/3000");
  await expect(page.getByRole("button", { name: "Envoyer la réponse" })).toBeEnabled();
  // Camera control: turning it on shows the candidate's own (fake) camera.
  await page.getByRole("button", { name: "Activer la caméra" }).click();
  await expect(page.getByRole("button", { name: "Couper la caméra" })).toBeVisible();

  // Dark mode on the two richest screens.
  for (const [name, path] of [["04-offer", `/offers/${ids.offerId}`], ["07-interview-call", `/interview/${ids.interviewId}`]] as const) {
    await page.goto(path);
    await check(page, name, info.project.name, "dark");
  }
  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
