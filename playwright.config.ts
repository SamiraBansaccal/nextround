import { defineConfig, devices } from "@playwright/test";

// Visual check of every screen (scripts/e2e.mjs seeds a test user, runs this, then cleans up).
// Playwright starts the dev server itself and stops it at the end: no orphan browser or server.
const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts/,
  timeout: 90_000,
  workers: 1, // one browser at a time: kind to an 8 GB laptop
  reporter: [["list"]],
  outputDir: "test-results",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
