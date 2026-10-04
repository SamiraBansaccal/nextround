import "server-only";
import type { z } from "zod";
import { type ChatMessage, chatCompletion, type ChatOptions, type LlmConfig } from "./client";
import { AiError } from "./errors";

// Structured output that works with weaker or free models:
// 1. ask for JSON only, 2. validate with zod, 3. if invalid, retry ONCE with the validation error,
// 4. if still invalid: "This model could not return valid output — try another model."
// The model's output is untrusted data: it is parsed and validated, never executed or rendered as HTML.

type Completion = (config: LlmConfig, messages: ChatMessage[], options: ChatOptions) => Promise<string>;

export interface GenerateJsonParams<T> {
  config: LlmConfig;
  options: ChatOptions;
  schema: z.ZodType<T>;
  system: string;
  user: string;
  /** Injectable for tests. */
  complete?: Completion;
}

const JSON_INSTRUCTION =
  "Respond with a single JSON object and nothing else: no prose, no markdown, no code fences.";

export async function generateJson<T>(params: GenerateJsonParams<T>): Promise<T> {
  const complete = params.complete ?? chatCompletion;
  const messages: ChatMessage[] = [
    { role: "system", content: `${params.system}\n\n${JSON_INSTRUCTION}` },
    { role: "user", content: params.user },
  ];

  const first = await complete(params.config, messages, params.options);
  const firstResult = parseAndValidate(first, params.schema);
  if (firstResult.ok) return firstResult.value;

  // One retry, telling the model exactly what was wrong.
  // An empty answer is simply asked again: an empty assistant turn is rejected by some providers (Anthropic).
  const retryMessages: ChatMessage[] = first.trim()
    ? [
        ...messages,
        { role: "assistant", content: first.slice(0, 8000) },
        { role: "user", content: `Your previous answer was not valid: ${firstResult.error}\nReturn only the corrected JSON object.` },
      ]
    : messages;
  const second = await complete(params.config, retryMessages, params.options);
  const secondResult = parseAndValidate(second, params.schema);
  if (secondResult.ok) return secondResult.value;

  throw new AiError("invalid_output");
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseAndValidate<T>(raw: string, schema: z.ZodType<T>): ParseResult<T> {
  const json = extractJson(raw);
  if (json === null) return { ok: false, error: "the answer did not contain a JSON object." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "the JSON could not be parsed (syntax error)." };
  }
  const result = schema.safeParse(parsed);
  if (result.success) return { ok: true, value: result.data };
  const issues = result.error.issues
    .slice(0, 8)
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
  return { ok: false, error: `the JSON does not match the expected format (${issues}).` };
}

/** Accepts bare JSON, JSON in ```json fences, or JSON surrounded by text (first "{" to last "}"). */
export function extractJson(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}
