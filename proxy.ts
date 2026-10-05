import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Next.js 16 "proxy" (formerly middleware): runs before every request.
// Everything requires sign-in except the landing page and the sign-in flow pages.
// This is a first gate only: server code ALSO checks the session (lib/server/auth.ts requireUserId).
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/sso-callback(.*)"]);

export default clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) await auth.protect();
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
    // Content-Security-Policy, built by Clerk with its own domains and a new nonce on every request: only
    // scripts that carry the nonce, or that such a script loads, may run ('strict-dynamic'). Next.js reads
    // the nonce from the request and puts it on its scripts; the root layout hands it to Clerk and the theme.
    // Added to Clerk's defaults: audio and downloads from blob: URLs (questions read aloud, CV as text),
    // small data: images, and nothing may frame the site.
    contentSecurityPolicy: {
      strict: true,
      directives: {
        "img-src": ["self", "data:", "blob:", "https://img.clerk.com"],
        "media-src": ["self", "blob:"],
        "object-src": ["none"],
        "base-uri": ["self"],
        "frame-ancestors": ["none"],
      },
    },
  },
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
