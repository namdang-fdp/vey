"use client";

import { toast } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { SignOutControl } from "@/features/auth/components/sign-out-control";

export default function ApplicationError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Unable to open your workspace</h1>
      <p role="alert" className="text-muted-foreground">
        Your workspace may be unavailable, or we couldn&apos;t reach Vey. Please
        retry or sign out.
      </p>
      <Button
        onClick={() => {
          toast.info("Trying to open your workspace again.", {
            title: "Trying again",
          });
          reset();
        }}
      >
        Try again
      </Button>
      <SignOutControl />
    </main>
  );
}
