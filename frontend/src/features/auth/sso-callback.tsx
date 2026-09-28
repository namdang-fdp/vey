"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { authError } from "./auth-error";
import { navigateAfterAuth } from "./finalize";
import { authLink, authPaths, safeReturnTo } from "./paths";

export function SsoCallback({ returnTo }: { returnTo?: string }) {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState("Completing sign in…");
  const destination = safeReturnTo(returnTo);

  useEffect(() => {
    if (!clerk.loaded || started.current) return;
    started.current = true;

    async function finish() {
      const navigate = navigateAfterAuth(router, destination);
      if (signIn.status === "complete") {
        const result = await signIn.finalize({ navigate });
        if (result.error) throw result.error;
        return;
      }
      if (signUp.status === "complete") {
        const result = await signUp.finalize({ navigate });
        if (result.error) throw result.error;
        return;
      }
      if (signIn.isTransferable) {
        const result = await signUp.create({ transfer: true });
        if (result.error) throw result.error;
        if (String(signUp.status) === "complete") {
          const finalized = await signUp.finalize({ navigate });
          if (finalized.error) throw finalized.error;
          return;
        }
        if (
          signUp.status === "missing_requirements" &&
          signUp.missingFields.length === 0 &&
          signUp.unverifiedFields.includes("email_address")
        ) {
          const sent = await signUp.verifications.sendEmailCode();
          if (sent.error) throw sent.error;
          router.replace(authLink(authPaths.register, destination));
          return;
        }
      }
      if (signUp.isTransferable) {
        const result = await signIn.create({ transfer: true });
        if (result.error) throw result.error;
        if (String(signIn.status) === "complete") {
          const finalized = await signIn.finalize({ navigate });
          if (finalized.error) throw finalized.error;
          return;
        }
      }
      if (signIn.existingSession || signUp.existingSession) {
        const session =
          signIn.existingSession?.sessionId ??
          signUp.existingSession?.sessionId;
        await clerk.setActive({ session, navigate });
        return;
      }
      if (
        signUp.status === "missing_requirements" &&
        signUp.missingFields.length === 0 &&
        signUp.unverifiedFields.includes("email_address")
      ) {
        const sent = await signUp.verifications.sendEmailCode();
        if (sent.error) throw sent.error;
        router.replace(authLink(authPaths.register, destination));
        return;
      }
      setMessage(
        "Additional account verification is required. Continue from login or registration.",
      );
    }

    void finish().catch((cause: unknown) =>
      setMessage(authError(cause).message),
    );
  }, [clerk, destination, router, signIn, signUp]);

  return (
    <main
      id="main-content"
      className="flex min-h-dvh items-center justify-center bg-auth-background px-4 py-8 sm:px-6"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 text-center shadow-xs sm:p-8 t-auth-form-enter">
        <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
          <Loader2
            className="size-5 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
        </div>
        <h1 className="mt-4 text-base font-semibold text-foreground">
          Single Sign-On
        </h1>
        <p
          role="status"
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
        >
          {message}
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-4 text-[0.8125rem]"
          >
            <Link href={authLink(authPaths.login, destination)}>
              Return to sign in
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="px-4 text-[0.8125rem] text-muted-foreground"
          >
            <Link href={authLink(authPaths.register, destination)}>
              Create account
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
