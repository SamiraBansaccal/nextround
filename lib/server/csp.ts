// The Content-Security-Policy of every page, built by proxy.ts with a new nonce on each request. Only scripts that
// carry the nonce, or that such a script loads, may run ('strict-dynamic'); Next.js reads the nonce from the
// request and puts it on its own scripts, and the root layout hands it to the theme's inline script.
// Pure (tests/server/csp.test.ts).

/** Profile pictures of the accounts linked through Google and GitHub. */
const AVATAR_HOSTS = ["https://avatars.githubusercontent.com", "https://lh3.googleusercontent.com"];

export function newNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export function contentSecurityPolicy(nonce: string, isDev: boolean): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // React's development tools need eval; production does not.
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    // Components set style attributes, which a nonce cannot cover.
    "style-src": ["'self'", "'unsafe-inline'"],
    // Small data: images, blob: previews, and the profile pictures of linked accounts.
    "img-src": ["'self'", "data:", "blob:", ...AVATAR_HOSTS],
    "font-src": ["'self'"],
    // The browser only talks to the site itself (sign-in goes through /api/auth).
    "connect-src": ["'self'"],
    // Questions read aloud and recordings: blob: URLs.
    "media-src": ["'self'", "blob:"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  // Locally the site is served over http: upgrading its own requests to https would break it.
  if (!isDev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}
