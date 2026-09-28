"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthDivider } from "../components/auth-divider";
import { AuthErrorAlert } from "../components/auth-error-alert";
import { AuthSubmitButton } from "../components/auth-submit-button";
import { SocialAuthButtons } from "../components/social-auth-buttons";
import { useLoginFlow } from "../hooks/use-login-flow";
import { authLink, authPaths } from "../paths";
import {
  loginSchema,
  type LoginValues,
  verificationSchema,
  type VerificationValues,
} from "../schemas";

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const flow = useLoginFlow(returnTo);
  const credentialsForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const verificationForm = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" },
  });

  return (
    <section aria-labelledby="login-title" className="w-full">
      {flow.step === "credentials" && (
        <div key="credentials" className="t-step-enter w-full space-y-6">
          <div className="space-y-1.5 text-center">
            <h1
              id="login-title"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to your workspace.
            </p>
          </div>

          <SocialAuthButtons
            onSelect={(provider) => void flow.startSocial(provider)}
            disabled={flow.isPending}
            loadingProvider={flow.activeProvider}
          />

          <AuthDivider text="or sign in with email" />

          <form
            onSubmit={credentialsForm.handleSubmit((values) =>
              flow.submitPassword(values.email, values.password),
            )}
            className="space-y-4"
            noValidate
          >
            <Field data-invalid={!!credentialsForm.formState.errors.email}>
              <FieldLabel htmlFor="login-email">Email address</FieldLabel>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                disabled={flow.isPending}
                aria-invalid={!!credentialsForm.formState.errors.email}
                aria-describedby={
                  credentialsForm.formState.errors.email
                    ? "login-email-error"
                    : undefined
                }
                {...credentialsForm.register("email")}
                className="h-11 rounded-md bg-surface px-3 sm:h-9"
              />
              <FieldError
                id="login-email-error"
                errors={[credentialsForm.formState.errors.email]}
                className="text-xs"
              />
            </Field>

            <Field data-invalid={!!credentialsForm.formState.errors.password}>
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <Button
                  asChild
                  variant="link"
                  size="xs"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                >
                  <Link
                    href={authLink(
                      authPaths.forgotPassword,
                      returnTo ?? authPaths.meetings,
                    )}
                  >
                    Forgot password?
                  </Link>
                </Button>
              </div>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={flow.isPending}
                aria-invalid={!!credentialsForm.formState.errors.password}
                aria-describedby={
                  credentialsForm.formState.errors.password
                    ? "login-password-error"
                    : undefined
                }
                {...credentialsForm.register("password")}
                className="h-11 rounded-md bg-surface px-3 sm:h-9"
              />
              <FieldError
                id="login-password-error"
                errors={[credentialsForm.formState.errors.password]}
                className="text-xs"
              />
            </Field>

            <AuthErrorAlert id="login-error" message={flow.error?.message} />

            <AuthSubmitButton
              isPending={flow.isPending}
              pendingText="Signing in…"
            >
              Sign in
            </AuthSubmitButton>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            New to Vey?{" "}
            <Link
              href={authLink(
                authPaths.register,
                returnTo ?? authPaths.meetings,
              )}
              className="font-medium text-foreground underline-offset-4 transition-colors duration-150 ease-out hover:underline focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Create an account
            </Link>
          </p>
        </div>
      )}

      {flow.step === "email-code" && (
        <div key="email-code" className="t-step-enter w-full space-y-6">
          <div className="space-y-1.5 text-center">
            <h1
              id="login-title"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit verification code to complete your login.
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
              <FieldLabel htmlFor="login-code">Verification code</FieldLabel>
              <Input
                id="login-code"
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
                    ? "login-code-error"
                    : "login-code-description"
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
                id="login-code-description"
                className="text-center text-xs text-muted-foreground"
              >
                Enter the 6-digit code sent to your email.
              </p>
              <FieldError
                id="login-code-error"
                errors={[verificationForm.formState.errors.code]}
                className="text-xs"
              />
            </Field>

            <AuthErrorAlert id="login-error" message={flow.error?.message} />

            <AuthSubmitButton
              isPending={flow.isPending}
              pendingText="Verifying…"
            >
              Verify code
            </AuthSubmitButton>
          </form>
        </div>
      )}
    </section>
  );
}
