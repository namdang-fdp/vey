"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "../hooks/use-sign-out";

export function SignOutControl({ compact = false }: { compact?: boolean }) {
  const { signOut, isPending } = useSignOut();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={signOut}
      className={
        compact
          ? "h-11 px-3"
          : "h-11 w-full justify-start gap-3 rounded-xl px-3 text-muted-foreground hover:text-foreground"
      }
    >
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
