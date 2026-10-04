import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Server-side page fetching for offers, safe against SSRF:
// http(s) only, no credentials, and the host must resolve to PUBLIC addresses only
// (re-checked on every redirect). Private, loopback, link-local and metadata addresses are refused.

export class PageFetchError extends Error {
  constructor(public readonly reason: "invalid_url" | "blocked_address" | "unreachable" | "blocked_or_login") {
    super(reason);
  }
}

const MAX_BYTES = 2_000_000;
export const MAX_PAGE_TEXT = 15_000;

// Fail closed: anything that cannot be parsed with certainty counts as private.
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p > 255)) return true;
  const [a, b] = parts;
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 || // this-network, private, loopback, multicast/reserved
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

/** "::ffff:7f00:1" (how URL normalises ::ffff:127.0.0.1) -> "127.0.0.1"; null if not that form. */
function mappedIPv4(v6: string): string | null {
  const rest = v6.slice("::ffff:".length);
  if (isIP(rest) === 4) return rest;
  const hex = rest.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (!hex) return null;
  const hi = parseInt(hex[1], 16);
  const lo = parseInt(hex[2], 16);
  return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
}

export function isPrivateIP(ip: string): boolean {
  if (isIP(ip) === 4) return isPrivateIPv4(ip);
  if (isIP(ip) !== 6) return true;
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) {
    const v4 = mappedIPv4(v6);
    return v4 === null || isPrivateIPv4(v4); // IPv4-mapped IPv6: judge the embedded IPv4
  }
  return (
    v6 === "::" || // unspecified
    v6 === "::1" || // loopback
    /^f[cd]/.test(v6) || // unique local fc00::/7
    /^fe[89ab]/.test(v6) || // link-local fe80::/10
    v6.startsWith("ff") || // multicast
    v6.startsWith("64:ff9b:") // NAT64: may embed an internal IPv4, refused conservatively
  );
}

/** Throws unless the URL is http(s) and its host resolves only to public addresses. */
export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new PageFetchError("invalid_url");
  }
  if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
    throw new PageFetchError("invalid_url");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) throw new PageFetchError("blocked_address");
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (addresses.length === 0) throw new PageFetchError("unreachable");
  if (addresses.some((a) => isPrivateIP(a.address))) throw new PageFetchError("blocked_address");
  return url;
}

/** Fetches an HTML page (max 3 redirects, each one re-validated) and returns its readable text. */
export async function fetchPageText(raw: string): Promise<string> {
  let url = await assertPublicHttpUrl(raw);
  for (let hop = 0; hop < 4; hop++) {
    let response: Response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NextRound/1.0)", Accept: "text/html,application/xhtml+xml" },
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      });
    } catch {
      throw new PageFetchError("unreachable");
    }
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      url = await assertPublicHttpUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new PageFetchError(response.status === 401 || response.status === 403 ? "blocked_or_login" : "unreachable");
    return htmlToText(await readAtMost(response, MAX_BYTES));
  }
  throw new PageFetchError("unreachable");
}

/** The body as text, refused as soon as it passes `max` bytes (a huge page is never held in memory). */
async function readAtMost(response: Response, max: number): Promise<string> {
  if (Number(response.headers.get("content-length") ?? 0) > max) throw new PageFetchError("unreachable");
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new PageFetchError("unreachable");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Readable text from HTML: drops scripts/styles/navigation, keeps line structure. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article)[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (_, entity: string) => {
      if (entity[0] === "#") {
        const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : " ";
      }
      return ENTITIES[entity.toLowerCase()] ?? " ";
    })
    .replace(/[ \t\f\v ]+/g, " ")
    .replace(/\n\s*\n\s*/g, "\n\n")
    .trim();
}

/** Firecrawl (if the instance has a key): handles pages that block simple fetches. */
export async function firecrawlPageText(url: string, apiKey: string): Promise<string> {
  await assertPublicHttpUrl(url);
  let response: Response;
  try {
    response = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });
  } catch {
    throw new PageFetchError("unreachable");
  }
  const data = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: { markdown?: string; metadata?: { statusCode?: number } };
  } | null;
  const status = data?.data?.metadata?.statusCode;
  if (!response.ok || !data?.success || !data.data?.markdown) throw new PageFetchError("unreachable");
  if (status === 401 || status === 403) throw new PageFetchError("blocked_or_login");
  return data.data.markdown;
}

/** Heuristic: too little text, or a login wall, means we should ask the user to paste the offer. */
export function looksBlocked(text: string): boolean {
  if (text.length < 400) return true;
  const head = text.slice(0, 1500).toLowerCase();
  return /(sign in|log in|se connecter|connexion requise|captcha|access denied|enable javascript)/.test(head) && text.length < 2500;
}

export function sourceSiteFor(rawUrl: string | null): "indeed" | "actiris" | "forem" | "linkedin" | "company" | "other" {
  if (!rawUrl) return "other";
  try {
    const host = new URL(rawUrl).hostname.toLowerCase();
    if (host.includes("indeed.")) return "indeed";
    if (host.includes("actiris.")) return "actiris";
    if (host.includes("leforem.") || host.includes("forem.")) return "forem";
    if (host.includes("linkedin.")) return "linkedin";
    return "company";
  } catch {
    return "other";
  }
}
