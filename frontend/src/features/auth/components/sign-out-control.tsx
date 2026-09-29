"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function SignOutControl({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon" : "sm"}
      aria-label={compact ? "Sign out" : undefined}
      onClick={() => {
        clearSession();
        router.replace("/login");
      }}
    >
      {compact ? "↪" : "Sign out"}
    </Button>
  );
}
