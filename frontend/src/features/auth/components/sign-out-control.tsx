"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { apiClient } from "@/lib/api/client";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "../utils/get-auth-error-message";
import { toast } from "@/lib/notifications";

export function SignOutControl({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const signOut = async () => {
    setIsPending(true);
    try {
      // Do not report a completed logout while an application session remains active.
      await apiClient.post("/api/v1/auth/session/logout", undefined, {
        timeout: 5000,
      });
      const { error } = await authClient.signOut({
        fetchOptions: { signal: AbortSignal.timeout(10000) },
      });
      if (error) {
        toast.error(
          getAuthErrorMessage(error, "Unable to sign out. Please try again."),
        );
        return;
      }
      toast.success("You have been signed out of this device.", {
        title: "Signed out",
      });
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
