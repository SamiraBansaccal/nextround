import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, newNonce } from "@/lib/server/csp";

// The Content-Security-Policy built by proxy.ts for every page (lib/server/csp.ts).
const directive = (policy: string, name: string) =>
  policy
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith(`${name} `)) ?? "";

describe("contentSecurityPolicy", () => {
  it("only runs scripts that carry this request's nonce, or that they load", () => {
    const scriptSrc = directive(contentSecurityPolicy("abc123", false), "script-src");
    expect(scriptSrc).toContain("'nonce-abc123'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it("allows eval in development only, and upgrades requests to https in production only", () => {
    const dev = contentSecurityPolicy("n", true);
    const prod = contentSecurityPolicy("n", false);
    expect(directive(dev, "script-src")).toContain("'unsafe-eval'");
    expect(directive(prod, "script-src")).not.toContain("'unsafe-eval'");
    expect(prod).toContain("upgrade-insecure-requests");
    expect(dev).not.toContain("upgrade-insecure-requests");
  });

  it("is never framed, embeds no plugin, and lets the browser talk to the site only", () => {
    const policy = contentSecurityPolicy("n", false);
    expect(directive(policy, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(policy, "object-src")).toBe("object-src 'none'");
    expect(directive(policy, "connect-src")).toBe("connect-src 'self'");
    expect(directive(policy, "base-uri")).toBe("base-uri 'self'");
  });

  it("shows the profile pictures of accounts linked through GitHub and Google", () => {
    const imgSrc = directive(contentSecurityPolicy("n", false), "img-src");
    expect(imgSrc).toContain("https://avatars.githubusercontent.com");
    expect(imgSrc).toContain("https://lh3.googleusercontent.com");
  });
});

describe("newNonce", () => {
  it("is new on every request, in base64", () => {
    const a = newNonce();
    expect(a).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(newNonce()).not.toBe(a);
  });
});
