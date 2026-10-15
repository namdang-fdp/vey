"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/notifications";
import { getAuthErrorMessage } from "../utils/get-auth-error-message";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/register-schema";

const fieldLabelClassName = "block text-sm font-medium text-foreground";
const inputClassName =
  "h-12 rounded-xl border-border bg-surface px-4 text-sm text-foreground shadow-none transition-colors duration-[var(--duration-quick)] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:bg-muted/60";
const errorClassName = "text-xs font-medium text-destructive";

export function RegisterForm() {
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );
  const [isResending, setIsResending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const submit = async ({ name, email, password }: RegisterFormValues) => {
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: routes.authComplete,
      });
      if (error) {
        toast.error(
          getAuthErrorMessage(
            error,
            "Unable to create your account. Please try again.",
          ),
        );
        return;
      }
      setVerificationEmail(email);
      toast.success(
        "Your account was created. Open the verification link in your inbox to continue.",
        { title: "Check your email" },
      );
    } catch (error) {
      toast.error(
        getAuthErrorMessage(
          error,
          "Unable to create your account. Please check your connection and try again.",
        ),
      );
    }
  };

  const resendVerification = async () => {
    if (!verificationEmail) return;
    setIsResending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: verificationEmail,
        callbackURL: routes.authComplete,
      });
      if (error) {
        toast.error(
          "Unable to resend the verification email right now. Please try again later.",
        );
      } else {
        toast.info(
          "If this address needs verification, a new link is on its way.",
        );
      }
    } catch {
      toast.error(
        "Unable to resend the verification email right now. Please try again later.",
      );
    } finally {
      setIsResending(false);
    }
  };

  if (verificationEmail) {
    return (
      <div className="w-full">
        <h1 className="text-[27px] font-semibold tracking-[-0.035em] text-foreground sm:text-[30px]">
          Check your email
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We sent a verification link to{" "}
          <strong className="text-foreground">{verificationEmail}</strong>. Open
          it to activate your account and continue to Vey.
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={isResending}
          onClick={() => void resendVerification()}
          className="mt-6 h-12 w-full rounded-xl"
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </Button>
        <p className="mt-5 text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            href={routes.login}
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="mb-7">
        <h1 className="text-[27px] font-semibold tracking-[-0.035em] text-foreground sm:text-[30px]">
          Create your Vey account
        </h1>
        <p className="mx-auto mt-2 max-w-[320px] text-sm leading-relaxed text-muted-foreground">
          Set up your account to continue to your workspace.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(submit, () =>
          toast.error("Review the highlighted fields and try again.", {
            title: "Check your details",
          }),
        )}
        noValidate
        aria-label="Create account form"
        className="space-y-3.5"
      >
        <div className="space-y-1.5">
          <label htmlFor="register-name" className={fieldLabelClassName}>
            Name
          </label>
          <Input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            disabled={isSubmitting}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "register-name-error" : undefined}
            className={inputClassName}
            {...register("name")}
          />
          {errors.name && (
            <p id="register-name-error" role="alert" className={errorClassName}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className={fieldLabelClassName}>
            Email address
          </label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            className={inputClassName}
            {...register("email")}
          />
          {errors.email && (
            <p
              id="register-email-error"
              role="alert"
              className={errorClassName}
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-password" className={fieldLabelClassName}>
            Password
          </label>
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder="8 characters minimum"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            className={inputClassName}
            {...register("password")}
          />
          {errors.password && (
            <p
              id="register-password-error"
              role="alert"
              className={errorClassName}
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="register-confirm-password"
            className={fieldLabelClassName}
          >
            Confirm password
          </label>
          <PasswordInput
            visibilityLabel="confirmation password"
            id="register-confirm-password"
            autoComplete="new-password"
            placeholder="Enter it again"
            disabled={isSubmitting}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword
                ? "register-confirm-password-error"
                : undefined
            }
            className={inputClassName}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p
              id="register-confirm-password-error"
              role="alert"
              className={errorClassName}
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-12 w-full rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-[var(--duration-quick)] hover:bg-primary-hover focus-visible:ring-primary/40"
        >
          <span>{isSubmitting ? "Creating account..." : "Create account"}</span>
        </Button>
      </form>

      <div className="mt-5 border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Already have an account?{" "}
          <Link
            href={routes.login}
            className="rounded-sm font-semibold text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
