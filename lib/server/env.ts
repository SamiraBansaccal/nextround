import "server-only";
import { z } from "zod";

// Server-side environment, validated once. `.env.example` lists every variable; on Vercel, the Neon and Clerk
// integrations of the Marketplace set their own.

/** An optional value: an empty line in `.env` ("NAME=") counts as not set, not as an empty string. */
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const serverEnvSchema = z.object({
  // The Neon database. Installed from the Vercel Marketplace, it arrives as DATABASE_URL; DB_CONNECTION_STRING is
  // the name older setups used, read when DATABASE_URL is not set. One of the two is required (checked below).
  DATABASE_URL: optional(z.string()),
  DB_CONNECTION_STRING: optional(z.string()),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  APP_ENCRYPTION_KEY: z.string().min(1),
  // The owner's NUMERIC GitHub id (api.github.com/users/<login> -> id): stable, unlike a username that can
  // be changed and then taken by someone else. Missing = nobody is the owner (fail closed).
  OWNER_GITHUB_ID: optional(z.string().regex(/^\d+$/)),
  // Instance AI and services (optional: features degrade gracefully without them).
  OPENROUTER_API_API_KEY: optional(z.string()),
  FIRECRAWL_API_API_KEY: optional(z.string()),
  ELEVENLABS_API_KEY: optional(z.string()),
  // The instance's ElevenLabs key spends paid credits: used for the owner only when this is "true".
  INSTANCE_VOICE_ENABLED: z.enum(["true", "false"]).default("false"),
  // The owner's Anthropic API key (Console, not a Claude.ai subscription): preferred over OpenRouter when set.
  ANTHROPIC_API_KEY: optional(z.string()),
  INSTANCE_ANTHROPIC_MODEL: optional(z.string()),
  // Instance model on OpenRouter (defaults in lib/ai/providers.ts); fallbacks are comma-separated.
  INSTANCE_LLM_MODEL: optional(z.string()),
  INSTANCE_LLM_FALLBACK_MODELS: optional(z.string()),
  // Resend, to email the owner about access requests (free plan). Without it, requests still reach Settings.
  RESEND_API_KEY: optional(z.string()),
  // The sender of that email; without a domain verified at Resend, only its test sender works.
  ACCESS_MAIL_FROM: optional(z.string()),
  // The site's public address for links in emails ("https://…"); on Vercel, its production domain is used by
  // default (VERCEL_PROJECT_PRODUCTION_URL, set by Vercel). Never taken from a request's headers.
  APP_URL: optional(z.url()),
  VERCEL_PROJECT_PRODUCTION_URL: optional(z.string()),
  // Self-hosting only: allow any OpenAI-compatible base URL (e.g. Ollama on localhost).
  ALLOW_CUSTOM_LLM_BASE_URL: z.enum(["true", "false"]).default("false"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const checkedSchema = serverEnvSchema.refine((env) => env.DATABASE_URL || env.DB_CONNECTION_STRING, {
  path: ["DATABASE_URL"],
  message: "Required",
});

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = checkedSchema.safeParse(process.env);
  if (!parsed.success) {
    // Names only, never values.
    const names = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${names}`);
  }
  cached = parsed.data;
  return cached;
}

/** The database connection string, under whichever of its two names is set (DATABASE_URL first). */
export function databaseUrl(): string {
  const env = serverEnv();
  return (env.DATABASE_URL ?? env.DB_CONNECTION_STRING)!;
}
