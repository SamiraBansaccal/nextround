import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so it loads the env files itself, in Next.js's order: `.env.local` (written
// by `vercel env pull`) first, then `.env`. The first value wins, and a variable already set (a Vercel build) wins.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // No such file: rely on the variables already set.
  }
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations take Neon's direct connection when there is one; the pooled one is meant for the app.
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING || "",
  },
});
