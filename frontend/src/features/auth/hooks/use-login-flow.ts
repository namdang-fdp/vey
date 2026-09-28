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
import { authLink, authPaths, safeReturnTo } from "../paths";
import { socialStrategies, type SocialProvider } from "../social";

export function useLoginFlow(returnTo?: string) {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const destination = safeReturnTo(returnTo);
  const [error, setError] = useState<AuthFlowError | null>(null);
  const [step, setStep] = useState<"credentials" | "email-code" | "complete">(
    "credentials",
  );
  const [pending, setPending] = useState(false);
  const [activeProvider, setActiveProvider] = useState<SocialProvider | null>(
    null,
  );

  async function finalize() {
    const result = await signIn.finalize({
      navigate: navigateAfterAuth(router, destination),
    });
    if (result.error) throw result.error;
    setStep("complete");
  }

  async function submitPassword(email: string, password: string) {
    setError(null);
    setPending(true);
    try {
      const result = await signIn.password({ identifier: email, password });
      if (result.error) throw result.error;
      if (signIn.status === "complete") {
        await finalize();
      } else if (
        signIn.status === "needs_client_trust" ||
        (signIn.status === "needs_second_factor" &&
          signIn.supportedSecondFactors.some(
            (factor) => factor.strategy === "email_code",
          ))
      ) {
        const sent = await signIn.mfa.sendEmailCode();
        if (sent.error) throw sent.error;
        setStep("email-code");
      } else {
        setError(incompleteFlowError());
      }
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
      const result = await signIn.mfa.verifyEmailCode({ code });
      if (result.error) throw result.error;
      if (signIn.status === "complete") await finalize();
      else setError(incompleteFlowError());
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
      const result = await signIn.sso({
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

  return {
    step,
    error,
    isPending: pending || fetchStatus === "fetching",
    activeProvider,
    submitPassword,
    verifyEmailCode,
    startSocial,
  };
}
