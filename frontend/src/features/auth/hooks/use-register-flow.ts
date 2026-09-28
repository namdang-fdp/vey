"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  authError,
  incompleteFlowError,
  type AuthFlowError,
} from "../auth-error";
import { navigateAfterAuth } from "../finalize";
import { authLink, authPaths, safeReturnTo } from "../paths";
import { socialStrategies, type SocialProvider } from "../social";

export function useRegisterFlow(returnTo?: string) {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const destination = safeReturnTo(returnTo);
  const [localStep, setStep] = useState<
    "details" | "verification-required" | "complete"
  >("details");
  const [error, setError] = useState<AuthFlowError | null>(null);
  const [pending, setPending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [activeProvider, setActiveProvider] = useState<SocialProvider | null>(
    null,
  );

  async function finalize() {
    const result = await signUp.finalize({
      navigate: navigateAfterAuth(router, destination),
    });
    if (result.error) throw result.error;
    setStep("complete");
  }

  async function advance() {
    if (signUp.status === "complete") {
      await finalize();
    } else if (
      signUp.status === "missing_requirements" &&
      signUp.missingFields.length === 0 &&
      signUp.unverifiedFields.includes("email_address")
    ) {
      const sent = await signUp.verifications.sendEmailCode();
      if (sent.error) throw sent.error;
      setStep("verification-required");
    } else {
      setError(incompleteFlowError());
    }
  }

  async function submitPassword(email: string, password: string) {
    setError(null);
    setPending(true);
    try {
      const result = await signUp.password({ emailAddress: email, password });
      if (result.error) throw result.error;
      await advance();
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setPending(false);
    }
  }

  async function verifyEmailCode(code: string) {
    setError(null);
    setPending(true);
    try {
      const result = await signUp.verifications.verifyEmailCode({ code });
      if (result.error) throw result.error;
      if (signUp.status === "complete") await finalize();
      else setError(incompleteFlowError());
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setPending(false);
    }
  }

  async function resendEmailCode() {
    setError(null);
    setResendSent(false);
    setPending(true);
    try {
      const result = await signUp.verifications.sendEmailCode();
      if (result.error) throw result.error;
      setResendSent(true);
    } catch (cause) {
      setError(authError(cause));
    } finally {
      setPending(false);
    }
  }

  async function startSocial(provider: SocialProvider) {
    setError(null);
    setActiveProvider(provider);
    setPending(true);
    try {
      const result = await signUp.sso({
        strategy: socialStrategies[provider],
        redirectCallbackUrl: authLink(authPaths.ssoCallback, destination),
        redirectUrl: destination,
      });
      if (result.error) throw result.error;
    } catch (cause) {
      setError(authError(cause));
      setPending(false);
      setActiveProvider(null);
    }
  }

  const awaitingEmailVerification =
    signUp.status === "missing_requirements" &&
    signUp.missingFields.length === 0 &&
    signUp.unverifiedFields.includes("email_address");

  return {
    step:
      localStep === "details" && awaitingEmailVerification
        ? "verification-required"
        : localStep,
    error,
    isPending: pending || fetchStatus === "fetching",
    activeProvider,
    resendSent,
    submitPassword,
    verifyEmailCode,
    resendEmailCode,
    startSocial,
  };
}
