import { describe, expect, it } from "vitest";
import { DOCUMENTS_COPY } from "@/lib/i18n/documents";
import { OFFERS_COPY } from "@/lib/i18n/offers";
import { PROFILE_COPY } from "@/lib/i18n/profile";
import { SETTINGS_COPY } from "@/lib/i18n/settings";
import { UI_COPY } from "@/lib/i18n/ui";

// The site's interface in English and French: every text exists in both, with the same placeholders.

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

function flatten(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => flatten(v, `${path}[${i}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => flatten(v, path ? `${path}.${k}` : k));
  return [];
}

describe.each([
  ["ui", UI_COPY],
  ["offers", OFFERS_COPY],
  ["profile", PROFILE_COPY],
  ["documents", DOCUMENTS_COPY],
  ["settings", SETTINGS_COPY],
] as const)("%s copy", (_, copy) => {
  const en = new Map(flatten(copy.en));
  const fr = new Map(flatten(copy.fr));

  it("has the same texts in English and French", () => {
    expect([...fr.keys()].sort()).toEqual([...en.keys()].sort());
  });

  it("keeps the same placeholders, and no text is empty", () => {
    for (const [key, text] of en) {
      expect(text.trim(), key).not.toBe("");
      expect(fr.get(key)?.trim(), key).not.toBe("");
      expect(placeholders(fr.get(key) ?? ""), key).toEqual(placeholders(text));
    }
  });
});
