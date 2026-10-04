import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Next.js 16 "proxy" (formerly middleware): runs before every request.
// Everything requires sign-in except the landing page and the sign-in flow pages.
// This is a first gate only: server code ALSO checks the session (lib/server/auth.ts requireUserId).
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/sso-callback(.*)"]);

export default clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) await auth.protect();
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
