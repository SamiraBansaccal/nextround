import "server-only";
import type { z } from "zod";
import { serverEnv } from "@/lib/env";
import { type ChatMessage, chatCompletion, type ChatOptions, type LlmConfig } from "./client";
import { resolveLlmConfig } from "./config";
import { generateJson } from "./json";
import { consumeInstanceQuota } from "./usage";

// Entry point for every AI feature: picks who pays (user key / instance key), applies the
// instance rate limit + daily cap, and returns validated JSON.

export interface AiContext {
  userId: string;
  isOwner: boolean;
}

function chatOptions(): ChatOptions {
  return { allowCustomBaseUrl: serverEnv().ALLOW_CUSTOM_LLM_BASE_URL === "true" };
}

/** Wraps the client so that every instance-key call (retries included) is counted. */
function completerFor(ctx: AiContext, config: LlmConfig) {
  if (config.source !== "instance") return chatCompletion;
  return async (c: LlmConfig, messages: ChatMessage[], options: ChatOptions) => {
    await consumeInstanceQuota(ctx.userId, "llm");
    return chatCompletion(c, messages, options);
  };
}

export async function aiJson<T>(ctx: AiContext, params: { schema: z.ZodType<T>; system: string; user: string }): Promise<T> {
  const config = await resolveLlmConfig(ctx.userId, ctx.isOwner);
  return generateJson({ ...params, config, options: chatOptions(), complete: completerFor(ctx, config) });
}

/** "Test connection": one tiny request with the AI the user would actually use. */
export async function testAiConnection(ctx: AiContext): Promise<{ model: string; source: LlmConfig["source"] }> {
  const config = await resolveLlmConfig(ctx.userId, ctx.isOwner);
  const complete = completerFor(ctx, config);
  await complete(config, [{ role: "user", content: "Reply with the single word: OK" }], { ...chatOptions(), maxTokens: 10 });
  return { model: config.model, source: config.source };
}
