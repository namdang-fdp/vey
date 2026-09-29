"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "../utils/get-auth-error-message";
import { toast } from "sonner";

export function SignOutControl({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const signOut = async () => {
    setIsPending(true);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(
          getAuthErrorMessage(error, "Unable to sign out. Please try again."),
        );
        return;
      }
      router.replace(routes.login);
      router.refresh();
    } catch (error) {
      toast.error(
        getAuthErrorMessage(error, "Unable to sign out. Please try again."),
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon" : "sm"}
      aria-label={compact ? "Sign out" : undefined}
      disabled={isPending}
      onClick={signOut}
    >
      {compact ? "↪" : isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
