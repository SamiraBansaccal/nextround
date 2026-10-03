import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so it loads .env itself (written by `stripe projects env --pull`).
try {
  process.loadEnvFile(".env");
} catch {
  // No .env file: rely on variables already set in the environment (e.g. CI).
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DB_CONNECTION_STRING ?? "" },
});
