import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, ChatOptions, LlmConfig } from "./client";
import { AiError } from "./errors";

// Claude through Anthropic's official SDK (the Messages API is not OpenAI-compatible).
// Needs an API key from the Anthropic Console (console.anthropic.com): a Claude.ai subscription
// (Pro, Max) cannot be used by an app, its usage is billed separately as API credits.

const TIMEOUT_MS = 90_000;

function client(apiKey: string) {
  return new Anthropic({ apiKey, timeout: TIMEOUT_MS, maxRetries: 1 });
}

export async function anthropicChat(config: LlmConfig, messages: ChatMessage[], options: ChatOptions): Promise<string> {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const turns = messages
    .filter((m): m is ChatMessage & { role: "user" | "assistant" } => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));
  try {
    const response = await client(config.apiKey).messages.create({
      model: config.model,
      max_tokens: Math.max(options.maxTokens ?? 4000, 4000), // room for the model's thinking too
      ...(system ? { system } : {}),
      messages: turns,
      // Feedback on one answer: low effort is enough, and cheaper. No temperature: recent models reject it.
      output_config: { effort: "low" },
    });
    return response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
  } catch (error) {
    throw toAiError(error);
  }
}

export async function anthropicModels(apiKey: string): Promise<string[]> {
  try {
    const ids: string[] = [];
    for await (const model of client(apiKey).models.list({ limit: 100 })) ids.push(model.id);
    return ids;
  } catch (error) {
    throw toAiError(error);
  }
}

function toAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) return new AiError("invalid_key");
  if (error instanceof Anthropic.NotFoundError) return new AiError("model_not_found");
  if (error instanceof Anthropic.RateLimitError) return new AiError("rate_limited");
  if (error instanceof Anthropic.APIConnectionError) return new AiError("network");
  return new AiError("provider_error");
}
