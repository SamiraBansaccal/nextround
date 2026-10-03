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

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
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

function isPrivateIP(ip: string): boolean {
  if (isIP(ip) === 4) return isPrivateIPv4(ip);
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateIPv4(v6.slice(7));
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80") || v6.startsWith("ff");
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
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) throw new PageFetchError("unreachable");
    return htmlToText(new TextDecoder().decode(buffer));
  }
  throw new PageFetchError("unreachable");
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
