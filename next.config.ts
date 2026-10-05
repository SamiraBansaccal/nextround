import type { NextConfig } from "next";

// Security headers on every response. The Content-Security-Policy itself (nonces, Clerk's domains,
// frame-ancestors 'none') is set by the proxy on every page (proxy.ts).
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
    // The dashboard is gone (ADR 0024): old links and bookmarks land on the profile, the new home page.
    return [{ source: "/dashboard", destination: "/profile", permanent: false }];
  },
};

export default nextConfig;
