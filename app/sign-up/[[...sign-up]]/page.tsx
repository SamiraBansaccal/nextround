import { SignUp } from "@clerk/nextjs";

// Fallback: Clerk's ready-made sign-up, used only if a new account needs an extra step.
export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <SignUp />
    </div>
  );
}
