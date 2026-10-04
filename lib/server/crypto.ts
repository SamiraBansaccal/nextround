import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { serverEnv } from "@/lib/server/env";

// AES-256-GCM encryption for user secrets (AI and voice API keys).
// Format: "v1:" + base64(iv[12] | authTag[16] | ciphertext). GCM's auth tag makes any tampering fail.
// The 32-byte key comes from APP_ENCRYPTION_KEY (base64). Plaintext secrets are never logged.

const VERSION = "v1";
const IV_BYTES = 12;
const TAG_BYTES = 16;

function encryptionKey(base64Key = serverEnv().APP_ENCRYPTION_KEY): Buffer {
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32) throw new Error("APP_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  return key;
}

export function encryptSecret(plaintext: string, base64Key?: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(base64Key), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return `${VERSION}:${Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64")}`;
}

export function decryptSecret(payload: string, base64Key?: string): string {
  const [version, data] = payload.split(":");
  if (version !== VERSION || !data) throw new Error("Unknown secret format");
  const raw = Buffer.from(data, "base64");
  const iv = raw.subarray(0, IV_BYTES);
  const tag = raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = raw.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(base64Key), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/** Masked display of a secret: only the last 4 characters are kept, e.g. "••••a3F9". */
export function last4(secret: string): string {
  return secret.slice(-4);
}
