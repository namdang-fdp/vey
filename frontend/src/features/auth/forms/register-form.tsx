"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthDivider } from "../components/auth-divider";
import { AuthErrorAlert } from "../components/auth-error-alert";
import { AuthSubmitButton } from "../components/auth-submit-button";
import { SocialAuthButtons } from "../components/social-auth-buttons";
import { useRegisterFlow } from "../hooks/use-register-flow";
import { authLink, authPaths } from "../paths";
import {
  registerSchema,
  type RegisterValues,
  verificationSchema,
  type VerificationValues,
} from "../schemas";

export function RegisterForm({ returnTo }: { returnTo?: string }) {
  const flow = useRegisterFlow(returnTo);
  const detailsForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });
  const verificationForm = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" },
  });

  return (
    <section aria-labelledby="register-title" className="w-full">
      {flow.step === "details" && (
        <div key="details" className="t-step-enter w-full space-y-6">
          <div className="space-y-1.5 text-center">
            <h1
              id="register-title"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start capturing decisions and meeting context with Vey.
            </p>
          </div>

          <SocialAuthButtons
            onSelect={(provider) => void flow.startSocial(provider)}
            disabled={flow.isPending}
            loadingProvider={flow.activeProvider}
          />

          <AuthDivider text="or register with email" />

          <form
            onSubmit={detailsForm.handleSubmit((values) =>
              flow.submitPassword(values.email, values.password),
            )}
            className="space-y-4"
            noValidate
          >
            <Field data-invalid={!!detailsForm.formState.errors.email}>
              <FieldLabel htmlFor="register-email">Email address</FieldLabel>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                disabled={flow.isPending}
                aria-invalid={!!detailsForm.formState.errors.email}
                aria-describedby={
                  detailsForm.formState.errors.email
                    ? "register-email-error"
                    : undefined
                }
                {...detailsForm.register("email")}
                className="h-11 rounded-md bg-surface px-3 sm:h-9"
              />
              <FieldError
                id="register-email-error"
                errors={[detailsForm.formState.errors.email]}
                className="text-xs"
              />
            </Field>

            <Field data-invalid={!!detailsForm.formState.errors.password}>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                disabled={flow.isPending}
                aria-invalid={!!detailsForm.formState.errors.password}
                aria-describedby={
                  detailsForm.formState.errors.password
                    ? "register-password-error"
                    : "register-password-hint"
                }
                {...detailsForm.register("password")}
                className="h-11 rounded-md bg-surface px-3 sm:h-9"
              />
              <p
                id="register-password-hint"
                className="text-xs text-muted-foreground"
              >
                Use 8 or more characters with letters and numbers.
              </p>
              <FieldError
                id="register-password-error"
                errors={[detailsForm.formState.errors.password]}
                className="text-xs"
              />
            </Field>

            <AuthErrorAlert id="register-error" message={flow.error?.message} />

            <AuthSubmitButton
              isPending={flow.isPending}
              pendingText="Creating account…"
            >
              Create account
            </AuthSubmitButton>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={authLink(authPaths.login, returnTo ?? authPaths.meetings)}
              className="font-medium text-foreground underline-offset-4 transition-colors duration-150 ease-out hover:underline focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}

      {flow.step === "verification-required" && (
        <div
          key="verification-required"
          className="t-step-enter w-full space-y-6"
        >
          <div className="space-y-1.5 text-center">
            <h1
              id="register-title"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit verification code to complete your registration.
            </p>
          </div>

          <form
            onSubmit={verificationForm.handleSubmit((values) =>
              flow.verifyEmailCode(values.code),
            )}
            className="space-y-5"
            noValidate
          >
            <Field data-invalid={!!verificationForm.formState.errors.code}>
              <FieldLabel htmlFor="register-code">Verification code</FieldLabel>
              <Input
                id="register-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                disabled={flow.isPending}
                placeholder="••••••"
                aria-invalid={!!verificationForm.formState.errors.code}
                aria-describedby={
                  verificationForm.formState.errors.code
                    ? "register-code-error"
                    : "register-code-description"
                }
                {...verificationForm.register("code", {
                  onChange: (event) => {
                    event.target.value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);
                  },
                })}
                className="h-11 rounded-md bg-surface px-3 text-center font-mono text-xl tracking-[0.5em] placeholder:text-muted-foreground/40 sm:h-10"
              />
              <p
                id="register-code-description"
                className="text-center text-xs text-muted-foreground"
              >
                Enter the 6-digit code sent to your email.
              </p>
              <FieldError
                id="register-code-error"
                errors={[verificationForm.formState.errors.code]}
                className="text-xs"
              />
            </Field>

            <AuthErrorAlert id="register-error" message={flow.error?.message} />

            {flow.resendSent && (
              <div
                role="status"
                aria-live="polite"
                className="t-alert-enter flex items-center justify-center gap-1.5 rounded-md border border-success/30 bg-success/10 p-2.5 text-xs font-medium text-success shadow-2xs"
              >
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
                <span>Verification code resent to your inbox.</span>
              </div>
            )}

            <AuthSubmitButton
              isPending={flow.isPending}
              pendingText="Verifying…"
            >
              Verify email
            </AuthSubmitButton>
          </form>

          <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
            <span className="text-muted-foreground">
              Didn&apos;t receive it?
            </span>
            <Button
              type="button"
              variant="link"
              size="xs"
              disabled={flow.isPending}
              onClick={() => void flow.resendEmailCode()}
              className="h-auto p-0 text-foreground"
            >
              Resend code
            </Button>
          </div>
        </div>
      )}

      <div id="clerk-captcha" />
    </section>
  );
}
