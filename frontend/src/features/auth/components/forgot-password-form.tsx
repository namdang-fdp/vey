"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecoveryPanel } from "./recovery-panel";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/lib/notifications";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "../schemas/recovery-schema";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const submit = async ({ email }: ForgotPasswordValues) => {
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: routes.resetPassword,
      });
      if (error && error.code !== "USER_NOT_FOUND") {
        toast.error(
          "Unable to send instructions right now. Please try again later.",
        );
        return;
      }
      setSubmitted(true);
      toast.info(
        "If an account exists for this email, we've sent password reset instructions.",
        { title: "Check your email" },
      );
    } catch {
      toast.error(
        "Unable to send instructions right now. Please try again later.",
      );
    }
  };

  return (
    <RecoveryPanel
      title={submitted ? "Check your email" : "Forgot your password?"}
      description={
        submitted
          ? "If an account exists for this email, we've sent password reset instructions."
          : "Enter your email and we'll send a link to reset your password."
      }
    >
      {submitted && (
        <p
          role="status"
          className="mt-5 text-sm leading-relaxed text-muted-foreground"
        >
          Check your spam folder too. The reset link is valid for one hour.
        </p>
      )}
      {!submitted && (
        <form
          onSubmit={handleSubmit(submit, () =>
            toast.error("Enter a valid email address to continue.", {
              title: "Check your email",
            }),
          )}
          noValidate
          className="mt-7 space-y-5"
          aria-label="Request password reset form"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "forgot-email-error" : undefined}
              className="h-12 rounded-xl border-border bg-surface px-4 text-sm text-foreground shadow-none transition-colors duration-[var(--duration-quick)] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:bg-muted/60"
              {...register("email")}
            />
            {errors.email && (
              <p
                id="forgot-email-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {errors.email.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-primary px-5 text-primary-foreground transition-colors duration-[var(--duration-quick)] hover:bg-primary-hover"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </RecoveryPanel>
  );
}
