import { SignUp } from "@clerk/nextjs";
import { RequestAccess } from "@/components/auth/request-access";
import { requestAccessAction } from "../../actions";

// Clerk's ready-made sign-up, for a new account that needs an extra step (or an invitation link). Sign-up is
// by invitation (ADR 0023): someone refused here can ask the owner for access with the form below.
export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl">Create your account</h1>
      <SignUp />
      <RequestAccess request={requestAccessAction} />
    </div>
  );
}
