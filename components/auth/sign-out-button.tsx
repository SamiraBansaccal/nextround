"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

/** Ends the Neon Auth session, then goes back to the home page. */
export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await authClient.signOut();
    } finally {
      // Back to the home page, and drop what the router kept from the signed-in area.
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <Button variant="ghost" size="sm" disabled={pending} onClick={signOut}>
      <LogOut className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
