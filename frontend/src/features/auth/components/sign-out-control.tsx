"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignOutControl({ compact = false }: { compact?: boolean }) {
  const { signOut } = useClerk();

  return (
    <Button
      type="button"
      variant={compact ? "outline" : "ghost"}
      onClick={() => void signOut()}
      className={cn(
        "w-full justify-start gap-2 rounded-md font-medium text-muted-foreground transition-colors duration-150 ease-out hover:bg-background hover:text-foreground active:translate-y-px",
        compact
          ? "h-11 border-border bg-surface px-2.5 text-xs hover:bg-muted sm:h-8"
          : "h-9 px-2.5 text-[0.8125rem]",
      )}
      aria-label="Sign out of Vey"
    >
      <LogOut
        className={cn("shrink-0", compact ? "size-3.5" : "size-4")}
        aria-hidden="true"
      />
      <span>Sign out</span>
    </Button>
  );
}
