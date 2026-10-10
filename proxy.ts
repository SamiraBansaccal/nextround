import { DEFAULT_AUTH_SKIP_ROUTES, processAuthMiddleware } from "@neondatabase/auth/server";
import { type NextRequest, NextResponse } from "next/server";
import { contentSecurityPolicy, newNonce } from "@/lib/server/csp";
import { serverEnv } from "@/lib/server/env";

// Next.js 16 "proxy" (formerly middleware): runs before every request.
// 1. Sign-in (Neon Auth, ADR 0028): after Google or GitHub, Neon sends the browser back with a one-time verifier
//    that is exchanged here for the session cookies; then every page requires a session, except the landing
//    page (which is also the sign-in page), the not-invited page and Neon Auth's own routes.
//    This is a first gate only: server code ALSO checks the session (lib/server/auth.ts requireUserId).
// 2. The Content-Security-Policy, with a new nonce on every request (lib/server/csp.ts).
const SKIP_ROUTES = [...DEFAULT_AUTH_SKIP_ROUTES, "/not-invited"];

export async function proxy(request: NextRequest) {
  const env = serverEnv();
  const result = await processAuthMiddleware({
    request,
    pathname: request.nextUrl.pathname,
    skipRoutes: SKIP_ROUTES,
    loginUrl: "/",
    baseUrl: env.NEON_AUTH_BASE_URL,
    cookieSecret: env.NEON_AUTH_COOKIE_SECRET,
  });

  if (result.action !== "allow") {
    // Back from Google or GitHub (session cookies set), or signed out on a private page (sent to sign in).
    const headers = new Headers();
    for (const cookie of result.cookies ?? []) headers.append("Set-Cookie", cookie);
    return NextResponse.redirect(result.redirectUrl, { headers });
  }

  const nonce = newNonce();
  const csp = contentSecurityPolicy(nonce, process.env.NODE_ENV === "development");
  const requestHeaders = new Headers(request.headers);
  for (const [name, value] of Object.entries(result.headers ?? {})) requestHeaders.set(name, value);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  for (const cookie of result.cookies ?? []) response.headers.append("Set-Cookie", cookie);
  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
