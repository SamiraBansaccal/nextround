import { createAuthClient } from "@neondatabase/auth/next";

// The browser side of Neon Auth (ADR 0028), for client components: it talks to /api/auth on the same origin,
// which forwards to the Neon Auth service (app/api/auth/[...path]/route.ts).
export const authClient = createAuthClient();
