import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

// Return point of the GitHub / Google sign-in: Clerk finishes the sign-in (or creates the
// account on first sign-in), then redirects to the profile.
export default function SSOCallbackPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
      <p>Signing you in…</p>
      <AuthenticateWithRedirectCallback signInUrl="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
