import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, type Page, test } from "@playwright/test";

// Captures every screen and MEASURES what the eye misses: horizontal overflow, missing title,
// console errors. Screenshots go to e2e-screens/<project>/ (git-ignored) to be reviewed.
// Run with `npm run e2e` (scripts/test/e2e.mjs), never directly: it seeds and cleans the test user.

const E2E_EMAIL = "nextround-e2e+clerk_test@example.com";
const ids = JSON.parse(process.env.E2E_IDS ?? "{}") as { offerId?: string; interviewId?: string; tailoredCvId?: string };

// Known and harmless, development only: Clerk's development-keys notices, and next-themes, whose anti-flash
// <script> sits inside a component, which React 19 reports when the layout renders again in the browser
// (the script already ran with the server render). Seen now and then on the mobile run.
const KNOWN_CONSOLE_ERRORS = ["Clerk", "Encountered a script tag while rendering React component"];

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
    if (msg.type() === "error" && !KNOWN_CONSOLE_ERRORS.some((known) => msg.text().includes(known))) errors.push(msg.text());
  });

  await page.goto("/");
  await clerk.signIn({ page, emailAddress: E2E_EMAIL });
  // No dashboard: the profile is the home page, and old /dashboard links land on it.
  await page.goto("/");
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/profile$/);

  const screens: [string, string][] = [
    ["02-profile", "/profile"],
    ["03-offers", "/offers"],
    ["04-offer", `/offers/${ids.offerId}`],
    ["05-cv", `/offers/${ids.offerId}/cv`],
    ["05b-cv-tailored", `/offers/${ids.offerId}/cv?lang=en`],
    ["02b-profile-document", `/profile?doc=${ids.tailoredCvId}`],
    ["06-interviews", "/interview"],
    ["07-interview-call", `/interview/${ids.interviewId}`],
    ["08-interview-summary", `/interview/${ids.interviewId}/summary`],
    ["09-settings", "/settings"],
  ];
  for (const [name, path] of screens) {
    await page.goto(path);
    await check(page, name, info.project.name);
  }
  // The same main screens with the site in French (the language cookie set by the EN/FR switch).
  await page.context().addCookies([{ name: "nextround-ui-lang", value: "fr", url: page.url() }]);
  const french: [string, string][] = [
    ["fr-02-profile", "/profile"],
    ["fr-03-offers", "/offers"],
    ["fr-04-offer", `/offers/${ids.offerId}`],
    ["fr-09-settings", "/settings"],
  ];
  for (const [name, path] of french) {
    await page.goto(path);
    await check(page, name, info.project.name);
  }
  await page.context().clearCookies({ name: "nextround-ui-lang" });
  // Merging a folded duplicate for good (once: both projects share the seeded data).
  if (info.project.name === "desktop") {
    await page.goto("/profile");
    const merge = page.getByRole("button", { name: /^Merge the other wordings of “42 Belgium/ });
    page.once("dialog", (dialog) => dialog.accept());
    await merge.click();
    await expect(page.getByText("1 wording merged.")).toBeVisible();
    await expect(merge).toHaveCount(0);
  }
  // New interview, step 1: what to practise; step 2: a track and its technologies.
  await page.goto("/interview/new");
  await expect(page.getByRole("heading", { level: 1, name: "What do you want to practise?" })).toBeVisible();
  await check(page, "06a-new-interview", info.project.name);
  await page.goto("/interview/new?kind=technology&track=devops");
  await expect(page.getByRole("link", { name: /Docker/ })).toBeVisible();
  await check(page, "06b-track", info.project.name);

  // Step 3, from an offer: the interviewer, on a full page, in English by default.
  await page.goto(`/interview/new?offer=${ids.offerId}`);
  await expect(page.getByRole("heading", { level: 1, name: "Who will interview you?" })).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0); // the camera is not opened before the call check
  // Switching the language switches the whole screen.
  await page.getByRole("button", { name: "Français", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Qui va te faire passer l'entretien ?" })).toBeVisible();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByText("The whole interview will be in English")).toBeVisible();
  // Questions: technical only.
  await page.getByRole("button", { name: /^Technical/ }).click();
  await expect(page.getByRole("button", { name: /^Technical/ })).toHaveAttribute("aria-pressed", "true");
  // The interviewer: a category, then a tile; the profile shows the style and the traits.
  await page.getByRole("button", { name: /The Simpsons/ }).click();
  await page.getByRole("button", { name: /^Mr\. Burns/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Mr. Burns" })).toBeVisible();
  await expect(page.getByText("Cold, formal and extremely demanding").first()).toBeVisible();
  await check(page, "06c-interviewer", info.project.name);

  // Step 4: the camera and microphone check.
  await page.getByRole("button", { name: /Continue to the call check/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Ready to join?" })).toBeVisible();
  await expect(page.locator("video").first()).toBeVisible(); // the (fake) camera preview
  await expect(page.getByRole("meter", { name: "Microphone" })).toBeVisible();
  // Real microphone switch.
  await page.getByRole("button", { name: "Mute" }).click();
  await expect(page.getByText("Your microphone is muted.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start interview" })).toBeEnabled();
  await check(page, "06d-ready-to-join", info.project.name);

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
  await expect(page.getByRole("button", { name: "Changer d'intervieweur" })).toBeVisible();

  // Dark mode on the two richest screens.
  for (const [name, path] of [["04-offer", `/offers/${ids.offerId}`], ["07-interview-call", `/interview/${ids.interviewId}`]] as const) {
    await page.goto(path);
    await check(page, name, info.project.name, "dark");
  }
  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
