import { neonAuth } from "@/lib/server/neon-auth";

// The browser talks to Neon Auth through this route (same origin): sign-in with Google or GitHub, the session,
// sign-out. The SDK forwards each call to the Neon Auth service and keeps the session in signed cookies.
type Context = { params: Promise<{ path: string[] }> };

export const GET = (request: Request, context: Context) => neonAuth().handler().GET(request, context);
export const POST = (request: Request, context: Context) => neonAuth().handler().POST(request, context);
