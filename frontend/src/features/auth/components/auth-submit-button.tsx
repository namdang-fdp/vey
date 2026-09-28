import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps extends React.ComponentProps<typeof Button> {
  isPending?: boolean;
  pendingText?: string;
  children: React.ReactNode;
}

export function AuthSubmitButton({
  isPending = false,
  pendingText = "Please wait…",
  disabled,
  children,
  className,
  ...props
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || isPending}
      className={cn(
        "relative h-11 w-full overflow-hidden rounded-md bg-primary px-4 text-[0.8125rem] shadow-xs transition-[background-color,box-shadow,opacity,transform] duration-150 ease-out hover:bg-primary-hover active:scale-[0.99] motion-reduce:transform-none sm:h-9",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden={!isPending}
        className={cn(
          "flex items-center justify-center gap-2 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
          isPending
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none absolute motion-reduce:opacity-0",
        )}
      >
        <Loader2
          className="size-4 animate-spin text-primary-foreground motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span>{pendingText}</span>
      </span>

      <span
        aria-hidden={isPending}
        className={cn(
          "flex items-center justify-center gap-2 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
          isPending
            ? "opacity-0 translate-y-2 pointer-events-none absolute motion-reduce:opacity-0"
            : "opacity-100 translate-y-0",
        )}
      >
        {children}
      </span>
    </Button>
  );
}
