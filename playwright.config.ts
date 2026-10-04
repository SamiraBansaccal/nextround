import { defineConfig, devices } from "@playwright/test";

// Visual check of every screen (scripts/test/e2e.mjs seeds a test user, runs this, then cleans up).
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
    // Cloud sessions go through a network proxy with its own certificate authority (see PLAYWRIGHT_CHROMIUM_PATH).
    ignoreHTTPSErrors: Boolean(process.env.PLAYWRIGHT_CHROMIUM_PATH),
    proxy: process.env.PLAYWRIGHT_CHROMIUM_PATH && process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined,
    // A fake camera and microphone (Chromium's own test devices) for the "Ready to join?" screen.
    permissions: ["camera", "microphone"],
    launchOptions: {
      args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
      // Cloud sessions ship a Chromium that may not match this Playwright version: point at it with
      // PLAYWRIGHT_CHROMIUM_PATH (unset on a normal machine, where Playwright uses its own browser).
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    },
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
