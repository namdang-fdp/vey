"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MailCheck } from "lucide-react";
import { RecoveryPanel, RecoveryArrow } from "./recovery-panel";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
    } catch {
      toast.error(
        "Unable to send instructions right now. Please try again later.",
      );
    }
  };

  return (
    <RecoveryPanel
      title={submitted ? "Check your email" : "Forgot your password?"}
      icon={
        submitted ? (
          <MailCheck className="size-5" />
        ) : (
          <Mail className="size-5" />
        )
      }
      description={
        submitted
          ? "If an account exists for this email, we've sent password reset instructions."
          : "Enter your email and we'll send a link to reset your password."
      }
    >
      {submitted && (
        <p
          role="status"
          className="t-alert-enter mt-6 rounded-xl border border-border bg-primary-subtle/50 p-4 text-sm leading-relaxed text-on-primary-subtle"
        >
          Check your spam folder too. The reset link is valid for one hour.
        </p>
      )}
      {!submitted && (
        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="mt-7 space-y-5"
          aria-label="Request password reset form"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="forgot-email"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
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
              className="h-12 rounded-xl bg-background px-4 shadow-none transition-colors duration-[var(--duration-quick)] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
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
            className="t-learn h-12 w-full justify-between rounded-xl bg-primary px-5 text-primary-foreground transition-colors duration-[var(--duration-quick)] hover:bg-primary-hover"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
            <RecoveryArrow />
          </Button>
        </form>
      )}
    </RecoveryPanel>
  );
}
