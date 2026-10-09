// Runs before `next build` on Vercel (vercel.json `buildCommand`). On a production deployment it applies the new
// migrations first, so the code never goes online ahead of its tables: if a migration fails, the build fails and
// the previous deployment stays online. Preview deployments and local builds never touch the database.
import { execFileSync } from "node:child_process";

if (process.env.VERCEL_ENV === "production") {
  console.log("Production build: applying database migrations.");
  execFileSync("npx", ["drizzle-kit", "migrate"], { stdio: "inherit" });
} else {
  console.log(`Migrations skipped (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"}).`);
}
