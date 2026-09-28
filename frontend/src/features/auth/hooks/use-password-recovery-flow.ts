"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  authError,
  incompleteFlowError,
  type AuthFlowError,
} from "../auth-error";
import { navigateAfterAuth } from "../finalize";
import { safeReturnTo } from "../paths";

export function usePasswordRecoveryFlow(returnTo?: string) {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const destination = safeReturnTo(returnTo);
  const [step, setStep] = useState<
    "email" | "code" | "new-password" | "complete"
  >("email");
  const [error, setError] = useState<AuthFlowError | null>(null);
  const [pending, setPending] = useState(false);

  async function sendCode(email: string) {
    setError(null);
    setPending(true);
    try {
      const created = await signIn.create({ identifier: email });
      if (created.error) throw created.error;
      const sent = await signIn.resetPasswordEmailCode.sendCode();
      if (sent.error) throw sent.error;
      setStep("code");
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(code: string) {
    setError(null);
    setPending(true);
    try {
      const result = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (result.error) throw result.error;
      if (signIn.status === "needs_new_password") setStep("new-password");
      else setError(incompleteFlowError());
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setPending(false);
    }
  }

  async function submitNewPassword(password: string) {
    setError(null);
    setPending(true);
    try {
      const result = await signIn.resetPasswordEmailCode.submitPassword({
        password,
      });
      if (result.error) throw result.error;
      if (signIn.status === "complete") {
        const finalized = await signIn.finalize({
          navigate: navigateAfterAuth(router, destination),
        });
        if (finalized.error) throw finalized.error;
        setStep("complete");
      } else {
        setError(incompleteFlowError());
      }
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setPending(false);
    }
  }

  return {
    step,
    error,
    isPending: pending || fetchStatus === "fetching",
    sendCode,
    verifyCode,
    submitNewPassword,
  };
}
