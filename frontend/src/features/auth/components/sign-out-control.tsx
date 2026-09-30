"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "../utils/get-auth-error-message";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

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
      className={
        compact
          ? "size-11"
          : "h-11 w-full justify-start gap-3 rounded-xl px-3 text-muted-foreground hover:text-foreground"
      }
    >
      <LogOut aria-hidden="true" className="size-4" />
      {!compact && (isPending ? "Signing out..." : "Sign out")}
    </Button>
  );
}
