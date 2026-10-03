import { randomBytes } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

const KEY = randomBytes(32).toString("base64");
vi.mock("@/lib/env", () => ({ serverEnv: () => ({ APP_ENCRYPTION_KEY: KEY }) }));

const { decryptSecret, encryptSecret, last4 } = await import("@/lib/crypto");

describe("AES-256-GCM secret encryption", () => {
  it("round-trips a secret", () => {
    const secret = "sk-or-v1-this-is-a-fake-key-1234";
    expect(decryptSecret(encryptSecret(secret))).toBe(secret);
  });

  it("never stores the plaintext and uses a fresh IV each time", () => {
    const secret = "sk-test-abcdef";
    const a = encryptSecret(secret);
    const b = encryptSecret(secret);
    expect(a).not.toContain(secret);
    expect(a).not.toBe(b);
  });

  it("rejects a tampered ciphertext", () => {
    const payload = encryptSecret("sk-test-abcdef");
    const raw = Buffer.from(payload.slice(3), "base64");
    raw[raw.length - 1] ^= 0xff; // flip bits of the last ciphertext byte
    expect(() => decryptSecret(`v1:${raw.toString("base64")}`)).toThrow();
  });

  it("rejects decryption with another key", () => {
    const payload = encryptSecret("sk-test-abcdef");
    expect(() => decryptSecret(payload, randomBytes(32).toString("base64"))).toThrow();
  });

  it("masks to the last 4 characters", () => {
    expect(last4("sk-test-abcdWXYZ")).toBe("WXYZ");
  });
});
