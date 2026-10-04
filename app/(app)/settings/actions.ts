"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { testAiConnection } from "@/lib/ai";
import { listModels } from "@/lib/ai/client";
import { aiErrorMessage } from "@/lib/ai/errors";
import { DEFAULT_INSTANCE_MODEL, isPresetId, isValidCustomBaseUrl, PRESETS } from "@/lib/ai/providers";
import { getAccount, requireUserId } from "@/lib/server/auth";
import {
  getAiSecrets,
  type PublicAiSettings,
  removeAiKey,
  saveAiSettings,
  saveServiceKey,
  type ServiceKey,
} from "@/lib/data/ai-settings";
import { serverEnv } from "@/lib/server/env";
import { getUiLang } from "@/lib/i18n/server";
import { SETTINGS_COPY } from "@/lib/i18n/settings";

/** Messages in the site's language. */
async function uiCopy() {
  const ui = await getUiLang();
  return { ui, t: SETTINGS_COPY[ui] };
}

// Server actions for /settings. Each one re-checks the session (requireUserId) and validates its
// input with zod: the browser is untrusted. Keys travel browser -> server only, never back.

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

const providerSchema = z.enum(["anthropic", "openrouter", "openai", "mistral", "groq", "custom"]);

const saveSchema = z.object({
  provider: providerSchema,
  baseUrl: z.string().trim().max(500).optional(),
  model: z.string().trim().min(1).max(200),
  apiKey: z.string().trim().min(8).max(500).optional(),
});

function allowCustom() {
  return serverEnv().ALLOW_CUSTOM_LLM_BASE_URL === "true";
}

/** The base URL is decided by the server: presets are fixed, custom only if allowed. */
function resolveBaseUrl(provider: z.infer<typeof providerSchema>, customBaseUrl?: string): string | null {
  if (isPresetId(provider)) return PRESETS[provider].baseUrl;
  if (!allowCustom() || !customBaseUrl || !isValidCustomBaseUrl(customBaseUrl)) return null;
  return customBaseUrl.replace(/\/+$/, "");
}

export async function saveAiSettingsAction(input: unknown): Promise<ActionResult<PublicAiSettings>> {
  const userId = await requireUserId();
  const { t } = await uiCopy();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t.checkForm };
  const baseUrl = resolveBaseUrl(parsed.data.provider, parsed.data.baseUrl);
  if (!baseUrl) {
    return {
      ok: false,
      error: allowCustom() ? t.validUrl : t.customDisabled,
    };
  }
  const settings = await saveAiSettings(userId, {
    provider: parsed.data.provider,
    baseUrl,
    model: parsed.data.model,
    apiKey: parsed.data.apiKey,
  });
  revalidatePath("/", "layout");
  return { ok: true, data: settings };
}

export async function removeAiKeyAction(): Promise<ActionResult> {
  const userId = await requireUserId();
  await removeAiKey(userId);
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}

export async function testConnectionAction(): Promise<ActionResult<{ model: string; source: "user" | "instance" }>> {
  const account = await getAccount();
  const { ui } = await uiCopy();
  try {
    const result = await testAiConnection({ userId: account.userId, isOwner: account.isOwner });
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, ui) };
  }
}

const loadModelsSchema = z.object({ provider: providerSchema, baseUrl: z.string().trim().max(500).optional() });

export async function loadModelsAction(input: unknown): Promise<ActionResult<string[]>> {
  const userId = await requireUserId();
  const { ui, t } = await uiCopy();
  const parsed = loadModelsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: t.unknownProvider };
  const baseUrl = resolveBaseUrl(parsed.data.provider, parsed.data.baseUrl);
  if (!baseUrl) return { ok: false, error: t.urlNotAllowed };

  // Use the user's saved key for this provider; OpenRouter's list is public.
  const saved = await getAiSecrets(userId);
  const key = saved?.baseUrl === baseUrl ? saved.apiKey : null;
  const publicList = isPresetId(parsed.data.provider) && PRESETS[parsed.data.provider].publicModels;
  if (!key && !publicList) return { ok: false, error: t.saveKeyFirst };
  try {
    return { ok: true, data: await listModels(baseUrl, key, allowCustom()) };
  } catch (error) {
    return { ok: false, error: aiErrorMessage(error, ui) };
  }
}

// Optional keys for the other services: ElevenLabs (voice) and Firecrawl (offer pages).
const serviceKeySchema = z.string().trim().min(10).max(300).regex(/^\S+$/);
// Used when the row does not exist yet (no AI settings saved): the AI part stays without a key.
const rowDefaults = { provider: "openrouter" as const, baseUrl: PRESETS.openrouter.baseUrl, model: DEFAULT_INSTANCE_MODEL };

async function saveKey(service: ServiceKey, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = serviceKeySchema.safeParse(input);
  if (!parsed.success) {
    const { t } = await uiCopy();
    return { ok: false, error: service === "voice" ? t.notElevenLabs : t.notFirecrawl };
  }
  await saveServiceKey(userId, service, parsed.data, rowDefaults);
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}

async function removeKey(service: ServiceKey): Promise<ActionResult> {
  const userId = await requireUserId();
  await saveServiceKey(userId, service, null, rowDefaults);
  revalidatePath("/", "layout");
  return { ok: true, data: null };
}

export async function saveVoiceKeyAction(input: unknown): Promise<ActionResult> {
  return saveKey("voice", input);
}

export async function removeVoiceKeyAction(): Promise<ActionResult> {
  return removeKey("voice");
}

export async function saveFirecrawlKeyAction(input: unknown): Promise<ActionResult> {
  return saveKey("firecrawl", input);
}

export async function removeFirecrawlKeyAction(): Promise<ActionResult> {
  return removeKey("firecrawl");
}
