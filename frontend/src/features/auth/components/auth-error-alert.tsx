import * as React from "react";
import { AlertCircle } from "lucide-react";

export function AuthErrorAlert({
  id,
  message,
}: {
  id?: string;
  message?: string | null;
}) {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      className="flex items-start gap-2.5 rounded-md border border-destructive/25 bg-destructive/8 p-3 text-xs leading-relaxed text-destructive t-alert-enter shadow-2xs"
    >
      <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span className="font-medium">{message}</span>
    </div>
  );
}
