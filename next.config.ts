import type { NextConfig } from "next";

// Security headers on every response. The Content-Security-Policy itself (a nonce per request,
// frame-ancestors 'none') is set by the proxy on every page (proxy.ts, lib/server/csp.ts).
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" }, // no clickjacking: never shown in a frame (CSP frame-ancestors too)
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Camera and microphone for the interview call, on this site only; nothing else.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [
      // The dashboard is gone (ADR 0024): old links and bookmarks land on the profile, the new home page.
      { source: "/dashboard", destination: "/profile", permanent: false },
      // Clerk's sign-in pages are gone (ADR 0028): signing in happens on the home page.
      { source: "/sign-in/:path*", destination: "/", permanent: false },
      { source: "/sign-up/:path*", destination: "/", permanent: false },
      { source: "/sso-callback", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
