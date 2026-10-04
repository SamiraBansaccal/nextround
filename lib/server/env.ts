import "server-only";
import { z } from "zod";

// Server-side environment, validated once. Names come from Stripe Projects
// (`stripe projects env --pull`) and from scripts/setup-env.mjs.
const serverEnvSchema = z.object({
  DB_CONNECTION_STRING: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  APP_ENCRYPTION_KEY: z.string().min(1),
  // The owner's NUMERIC GitHub id (api.github.com/users/<login> -> id): stable, unlike a username that can
  // be changed and then taken by someone else. Missing = nobody is the owner (fail closed).
  OWNER_GITHUB_ID: z.string().regex(/^\d+$/).optional(),
  // Instance AI and services (optional: features degrade gracefully without them).
  OPENROUTER_API_API_KEY: z.string().optional(),
  FIRECRAWL_API_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  // The instance's ElevenLabs key spends paid credits: used for the owner only when this is "true".
  INSTANCE_VOICE_ENABLED: z.enum(["true", "false"]).default("false"),
  // The owner's Anthropic API key (Console, not a Claude.ai subscription): preferred over OpenRouter when set.
  ANTHROPIC_API_KEY: z.string().optional(),
  INSTANCE_ANTHROPIC_MODEL: z.string().optional(),
  // Instance model on OpenRouter (defaults in lib/ai/providers.ts); fallbacks are comma-separated.
  INSTANCE_LLM_MODEL: z.string().optional(),
  INSTANCE_LLM_FALLBACK_MODELS: z.string().optional(),
  // Self-hosting only: allow any OpenAI-compatible base URL (e.g. Ollama on localhost).
  ALLOW_CUSTOM_LLM_BASE_URL: z.enum(["true", "false"]).default("false"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Names only, never values.
    const names = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment variables: ${names}`);
  }
  cached = parsed.data;
  return cached;
}
