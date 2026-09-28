import * as React from "react";

export function AuthDivider({ text = "or" }: { text?: string }) {
  return (
    <div className="relative my-5 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center bg-auth-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span>{text}</span>
      </div>
    </div>
  );
}
