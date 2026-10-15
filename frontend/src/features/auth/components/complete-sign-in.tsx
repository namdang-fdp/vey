"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { apiClient } from "@/lib/api/client";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/notifications";
import { SignOutControl } from "./sign-out-control";

export function CompleteSignIn() {
  const router = useRouter();
  const started = useRef(false);
  const pending = useRef(false);
  const [failed, setFailed] = useState(false);
  const complete = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setFailed(false);
    try {
      const { data, error } = await authClient.token({
        fetchOptions: { signal: AbortSignal.timeout(10000) },
      });
      if (error || !data?.token)
        throw new Error("Identity session unavailable");
      // This bearer is scoped to the exchange request; never retained in client state/storage.
      await apiClient.post("/api/v1/auth/session", undefined, {
        headers: { Authorization: `Bearer ${data.token}` },
        timeout: 10000,
      });
      await apiClient.get("/api/v1/auth/me", { timeout: 10000 });
      toast.success("You are signed in and your workspace is ready.", {
        title: "Signed in",
      });
      router.replace(routes.meetings);
      router.refresh();
    } catch {
      setFailed(true);
      toast.error(
        "We couldn't open your workspace. Please retry or sign out.",
        { title: "Sign-in incomplete" },
      );
    } finally {
      pending.current = false;
    }
  }, [router]);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void complete();
  }, [complete]);
  return (
    <section className="w-full text-center">
      <h1 className="text-2xl font-semibold">
        {failed ? "Unable to complete sign in" : "Preparing your workspace"}
      </h1>
      <p
        role={failed ? "alert" : "status"}
        className="mt-3 text-sm text-muted-foreground"
      >
        {failed
          ? "We couldn't open your workspace. Please retry, or sign out to return to login."
          : "Please wait while we finish signing you in."}
      </p>
      {failed && (
        <div className="mt-6 space-y-3">
          <Button
            className="w-full"
            onClick={() => {
              toast.info("Trying to open your workspace again.", {
                title: "Trying again",
              });
              void complete();
            }}
          >
            Try again
          </Button>
          <SignOutControl />
        </div>
      )}
    </section>
  );
}
