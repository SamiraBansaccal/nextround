import { SignIn } from "@clerk/nextjs";

// Fallback: Clerk's ready-made sign-in, used only if the sign-in needs an extra step.
export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <SignIn />
    </div>
  );
}
