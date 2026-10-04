import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { ChatMessage, LlmConfig } from "@/lib/ai/client";
import { AiError } from "@/lib/ai/errors";
import { extractJson, generateJson } from "@/lib/ai/json";

const config: LlmConfig = { baseUrl: "https://openrouter.ai/api/v1", apiKey: "k", model: "m", source: "user" };
const options = { allowCustomBaseUrl: false };
const schema = z.object({ skills: z.array(z.string()).min(1) });

function fakeModel(...answers: string[]) {
  const calls: ChatMessage[][] = [];
  const complete = vi.fn(async (_c: LlmConfig, messages: ChatMessage[]) => {
    calls.push(messages);
    return answers[calls.length - 1] ?? "";
  });
  return { complete, calls };
}

describe("generateJson: JSON + zod validation + one retry", () => {
  it("returns valid output on the first try", async () => {
    const { complete } = fakeModel('{"skills":["TypeScript"]}');
    await expect(generateJson({ config, options, schema, system: "s", user: "u", complete })).resolves.toEqual({ skills: ["TypeScript"] });
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("accepts JSON wrapped in code fences or prose", async () => {
    const { complete } = fakeModel('Sure! ```json\n{"skills":["Go"]}\n``` Hope it helps');
    await expect(generateJson({ config, options, schema, system: "s", user: "u", complete })).resolves.toEqual({ skills: ["Go"] });
  });

  it("retries once, giving the model the validation error", async () => {
    const { complete, calls } = fakeModel('{"skills":[]}', '{"skills":["Rust"]}');
    await expect(generateJson({ config, options, schema, system: "s", user: "u", complete })).resolves.toEqual({ skills: ["Rust"] });
    expect(complete).toHaveBeenCalledTimes(2);
    const retryPrompt = calls[1].at(-1)?.content ?? "";
    expect(retryPrompt).toContain("not valid");
    expect(retryPrompt).toContain("skills");
  });

  it("gives up after the retry with a clear message", async () => {
    const { complete } = fakeModel("I cannot do that", "still not JSON");
    const promise = generateJson({ config, options, schema, system: "s", user: "u", complete });
    await expect(promise).rejects.toBeInstanceOf(AiError);
    await expect(promise).rejects.toThrow("This model could not return valid output — try another model.");
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it("extractJson finds no object in plain text", () => {
    expect(extractJson("no json here")).toBeNull();
  });
});

describe("empty answer", () => {
  it("asks again without an empty assistant turn (some providers reject it)", async () => {
    const { complete, calls } = fakeModel("", '{"skills":["Java"]}');
    await expect(generateJson({ config, options, schema, system: "s", user: "u", complete })).resolves.toEqual({ skills: ["Java"] });
    expect(calls[1].map((m) => m.role)).toEqual(["system", "user"]);
  });
});
