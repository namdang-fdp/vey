"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthErrorAlert } from "../components/auth-error-alert";
import { AuthSubmitButton } from "../components/auth-submit-button";
import { usePasswordRecoveryFlow } from "../hooks/use-password-recovery-flow";
import { authLink, authPaths } from "../paths";
import {
  passwordRecoveryEmailSchema,
  passwordRecoveryPasswordSchema,
  type PasswordRecoveryEmailValues,
  type PasswordRecoveryPasswordValues,
  verificationSchema,
  type VerificationValues,
} from "../schemas";

export function ForgotPasswordForm({ returnTo }: { returnTo?: string }) {
  const flow = usePasswordRecoveryFlow(returnTo);
  const emailForm = useForm<PasswordRecoveryEmailValues>({
    resolver: zodResolver(passwordRecoveryEmailSchema),
    defaultValues: { email: "" },
  });
  const verificationForm = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" },
  });
  const passwordForm = useForm<PasswordRecoveryPasswordValues>({
    resolver: zodResolver(passwordRecoveryPasswordSchema),
    defaultValues: { password: "" },
  });

  return (
    <section aria-labelledby="recovery-title" className="w-full">
      {flow.step === "email" && (
        <div key="email" className="t-step-enter w-full space-y-6">
          <div className="space-y-1.5 text-center">
            <h1
              id="recovery-title"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your account email to receive a recovery code.
            </p>
          </div>

          <form
            onSubmit={emailForm.handleSubmit((values) =>
              flow.sendCode(values.email),
            )}
            className="space-y-4"
            noValidate
          >
            <Field data-invalid={!!emailForm.formState.errors.email}>
              <FieldLabel htmlFor="recovery-email">Email address</FieldLabel>
              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                disabled={flow.isPending}
                aria-invalid={!!emailForm.formState.errors.email}
                aria-describedby={
                  emailForm.formState.errors.email
                    ? "recovery-email-error"
                    : undefined
                }
                {...emailForm.register("email")}
                className="h-11 rounded-md bg-surface px-3 sm:h-9"
              />
              <FieldError
                id="recovery-email-error"
                errors={[emailForm.formState.errors.email]}
                className="text-xs"
              />
            </Field>

            <AuthErrorAlert id="recovery-error" message={flow.error?.message} />

            <AuthSubmitButton
              isPending={flow.isPending}
              pendingText="Sending code…"
            >
              Send recovery code
            </AuthSubmitButton>
          </form>
        </div>
      )}

      {flow.step === "code" && (
        <div key="code" className="t-step-enter w-full space-y-6">
          <div className="space-y-1.5 text-center">
            <h1
              id="recovery-title"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Enter recovery code
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to complete password recovery.
            </p>
          </div>

          <form
            onSubmit={verificationForm.handleSubmit((values) =>
              flow.verifyCode(values.code),
            )}
            className="space-y-5"
            noValidate
          >
            <Field data-invalid={!!verificationForm.formState.errors.code}>
              <FieldLabel htmlFor="recovery-code">Recovery code</FieldLabel>
              <Input
                id="recovery-code"
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
                    ? "recovery-code-error"
                    : "recovery-code-description"
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
                id="recovery-code-description"
                className="text-center text-xs text-muted-foreground"
              >
                Enter the 6-digit code sent to your email.
              </p>
              <FieldError
                id="recovery-code-error"
                errors={[verificationForm.formState.errors.code]}
                className="text-xs"
              />
            </Field>

            <AuthErrorAlert id="recovery-error" message={flow.error?.message} />

            <AuthSubmitButton
              isPending={flow.isPending}
              pendingText="Verifying…"
            >
              Verify code
            </AuthSubmitButton>
          </form>
        </div>
      )}

      {flow.step === "new-password" && (
        <div key="new-password" className="t-step-enter w-full space-y-6">
          <div className="space-y-1.5 text-center">
            <h1
              id="recovery-title"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Set new password
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose a new secure password for your Vey account.
            </p>
          </div>

          <form
            onSubmit={passwordForm.handleSubmit((values) =>
              flow.submitNewPassword(values.password),
            )}
            className="space-y-4"
            noValidate
          >
            <Field data-invalid={!!passwordForm.formState.errors.password}>
              <FieldLabel htmlFor="recovery-password">New password</FieldLabel>
              <Input
                id="recovery-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                disabled={flow.isPending}
                aria-invalid={!!passwordForm.formState.errors.password}
                aria-describedby={
                  passwordForm.formState.errors.password
                    ? "recovery-password-error"
                    : "recovery-password-hint"
                }
                {...passwordForm.register("password")}
                className="h-11 rounded-md bg-surface px-3 sm:h-9"
              />
              <p
                id="recovery-password-hint"
                className="text-xs text-muted-foreground"
              >
                Use at least 8 characters.
              </p>
              <FieldError
                id="recovery-password-error"
                errors={[passwordForm.formState.errors.password]}
                className="text-xs"
              />
            </Field>

            <AuthErrorAlert id="recovery-error" message={flow.error?.message} />

            <AuthSubmitButton
              isPending={flow.isPending}
              pendingText="Updating password…"
            >
              Set new password
            </AuthSubmitButton>
          </form>
        </div>
      )}

      {flow.step === "complete" && (
        <div
          key="complete"
          className="t-step-enter w-full space-y-4 text-center"
        >
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-success/15 text-success">
            <Check className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h1
              id="recovery-title"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Password reset complete
            </h1>
            <p className="text-sm text-muted-foreground">
              Your password has been updated. Redirecting to your workspace…
            </p>
          </div>
          <div className="pt-2">
            <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}

      <div className="pt-4 text-center">
        <Link
          href={authLink(authPaths.login, returnTo ?? authPaths.meetings)}
          className="text-xs font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground hover:underline focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Return to sign in
        </Link>
      </div>
    </section>
  );
}
