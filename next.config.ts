import type { NextConfig } from "next";

// Security headers on every response. No full Content-Security-Policy yet: Clerk loads scripts and
// frames from its own domains, and a strict policy needs testing in a real browser first.
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" }, // no clickjacking: never shown in a frame
  { key: "X-Frame-Options", value: "DENY" }, // the same, for older browsers
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
